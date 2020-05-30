import Compiler from './compiler'
import linker from './linker'
import { getHash, add0x } from './utils'
import { extractMetadataFromBytecode } from './solidityMetadata'

const SEVERITY_WARNING = 'warning'

function Verifier (options = {}) {
  const compiler = Compiler(options)

  const verify = async (payload = {}, { resolveImports } = {}) => {
    try {
      /** deployedBytecode is optional, used to surf metadata bug
       * if it is provided  the verifier will try to extract the original metadata from it */
      const { version, imports, bytecode, source, deployedBytecode, libraries, name } = payload
      if (!name) throw new Error('Invalid contract name')
      if (!bytecode) throw new Error(`Invalid bytecode`)
      const KEY = name
      resolveImports = resolveImports || compiler.getImports(imports)
      const settings = payload.settings || {}
      let sources = {}
      const usedSources = []

      // wraps resolveImports method to catch used sources
      const updateUsedSources = (path) => {
        let file = path.split('/').pop()
        const { contents } = resolveImports(path)
        const hash = (contents) ? getHash(contents) : null
        usedSources.push({ path, file, hash })
        return resolveImports(path)
      }

      sources[KEY] = { content: source }
      const input = compiler.createInput({ sources, settings })

      const result = await compiler.compile(input, { version, resolveImports: updateUsedSources })
      const { contracts } = result
      const { errors, warnings } = filterResultErrors(result)
      if (errors) return { errors, warnings }

      if (!contracts || !contracts[KEY]) throw new Error('Empty compilation result')
      const compiled = contracts[KEY][name]
      const { evm, abi } = compiled

      const { resultBytecode, orgBytecode, metadata, usedLibraries, decodedMetadata } = verifyResults(KEY, bytecode, evm, deployedBytecode, libraries)
      if (!resultBytecode) throw new Error('Invalid result ')
      const resultBytecodeHash = getHash(resultBytecode)
      const bytecodeHash = getHash(orgBytecode)

      const opcodes = evm.bytecode.opcodes
      const methodIdentifiers = Object.entries(evm.methodIdentifiers || {})
      const usedSettings = resultSettings(compiled)
      return {
        name,
        usedSettings,
        usedLibraries,
        bytecode,
        metadata,
        resultBytecode,
        bytecodeHash,
        resultBytecodeHash,
        abi,
        opcodes,
        usedSources,
        methodIdentifiers,
        warnings,
        decodedMetadata
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  return Object.freeze({ verify, hash: getHash })
}

function filterResultErrors ({ errors }) {
  let warnings
  if (errors) {
    warnings = errors.filter(e => e.severity === SEVERITY_WARNING)
    errors = errors.filter(e => e.severity !== SEVERITY_WARNING)
    errors = (errors.length) ? errors : undefined
  }
  return { errors, warnings }
}

export function verifyResults (contractName, bytecode, evm, deployedBytecode, libs) {
  let { bytecode: orgBytecode, metadata, decodedMetadata } = extractMetadataFromBytecode(bytecode)
  let evmBytecode = evm.bytecode.object
  let evmDeployedBytecode = evm.deployedBytecode.object
  const { usedLibraries, linkLibraries } = parseLibraries(libs, evmBytecode, contractName)

  if (Object.keys(linkLibraries).length > 0) {
    evmBytecode = linker.link(evmBytecode, linkLibraries)
    evmDeployedBytecode = linker.link(evmDeployedBytecode, linkLibraries)
  }
  let { bytecode: resultBytecode } = extractMetadataFromBytecode(evmBytecode)

  /**
    * To contain solidity compiler metadata bug, if deployedBytecode
    * is provided, try to extract metadata from it
    */

  if (deployedBytecode) {
    if (!metadata || (resultBytecode !== orgBytecode)) {
      // extract metadata from original deployed bytecode
      const deployedBytecodeResult = extractMetadataFromBytecode(deployedBytecode)
      metadata = deployedBytecodeResult.metadata
      decodedMetadata = deployedBytecodeResult.decodedMetadata
      // remove metadata from original bytecode searching extracted metadata
      orgBytecode = removeMetadata(bytecode, metadata)
      // extract metadata from compiled deployed bytecode
      const { metadata: compiledMetadata } = extractMetadataFromBytecode(evmDeployedBytecode)
      // remove metadata from compiled bytecode using extracted metadata
      resultBytecode = add0x(evmBytecode)
      resultBytecode = removeMetadata(resultBytecode, compiledMetadata)
    }
  }

  return { resultBytecode, orgBytecode, metadata, usedLibraries, decodedMetadata }
}

function removeMetadata (bytecode, metadata) {
  const metadataStart = metadata.length
  return (metadataStart > 0) ? bytecode.substr(0, metadataStart) : bytecode
}

function removeLibraryPrefix (lib) {
  const [prefix, name] = lib.split(':')
  return (prefix && name) ? name : lib
}

function getLibrariesPlaceHolders (libraries, prefix) {
  const placeholders = {}

  const addLibraryPlaceHolder = (name, address, key) => {
    let library = linker.libraryHashPlaceholder(key)
    placeholders[library] = { name, address, library }
  }

  for (let name in libraries) {
    let address = libraries[name]
    addLibraryPlaceHolder(name, address, name)
    addLibraryPlaceHolder(name, address, `${prefix}:${name}`)
  }
  return placeholders
}

function findLibrary (key, prefix, libraries) {
  if (typeof libraries !== 'object') throw new Error('Libraries must be an object')
  let name = removeLibraryPrefix(key)
  let address = libraries[name]
  let library = key
  if (!address) {
    let placeholders = getLibrariesPlaceHolders(libraries, prefix)
    if (placeholders[key]) return placeholders[key]
  }
  return { address, library, name }
}

function parseLibraries (libraries, bytecode, prefix) {
  const bytecodeLibs = linker.find(bytecode)
  const libs = []
  for (let key in bytecodeLibs) {
    libs.push(findLibrary(key, prefix, libraries))
  }
  let linkLibraries = libs.reduce((v, a) => {
    let { address, library } = a
    if (address) v[library] = address
    return v
  }, {})
  let usedLibraries = libs.reduce((v, a, i) => {
    let { name, library, address } = a
    v[name || library || i] = address
    return v
  }, {})
  return { usedLibraries, linkLibraries }
}

function resultSettings (compiled) {
  const { compiler, language, settings } = JSON.parse(compiled.metadata)
  const { evmVersion, libraries, optimizer, remappings } = settings
  return { compiler, language, evmVersion, libraries, optimizer, remappings }
}

export default Verifier
