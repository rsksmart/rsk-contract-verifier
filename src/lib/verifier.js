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

      const { resultBytecode, orgBytecode, metadata, usedLibraries } = verifyResults(bytecode, evm, deployedBytecode, libraries)
      if (!resultBytecode) throw new Error('Invalid result ')
      const resultBytecodeHash = getHash(resultBytecode)
      const bytecodeHash = getHash(orgBytecode)
      const opcodes = evm.bytecode.opcodes
      const { methodIdentifiers } = evm
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
        warnings
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

export function verifyResults (bytecode, evm, deployedBytecode, libs) {
  let { bytecode: orgBytecode, metadata } = extractMetadataFromBytecode(bytecode)
  let evmBytecode = evm.bytecode.object
  const usedLibraries = getUsedLibraries(evmBytecode, libs)
  if (libs) evmBytecode = linker.link(evmBytecode, addPrefixToLibraries(libs, evmBytecode))
  let { bytecode: resultBytecode } = extractMetadataFromBytecode(evmBytecode)

  /**
    * To contain solidity compiler metadata bug, if deployedBytecode
    * is provided, try to extract metadata from it
    */

  if (!metadata && deployedBytecode) {
    // extract metadata from original deployed bytecode
    const deployedBytecodeResult = extractMetadataFromBytecode(deployedBytecode)
    metadata = deployedBytecodeResult.metadata
    // remove metadata from original bytecode searching extracted metadata
    orgBytecode = bytecode.substr(0, bytecode.indexOf(metadata))
    // extract metadata from compiled deployed bytecode
    const { metadata: compiledMetadata } = extractMetadataFromBytecode(evm.deployedBytecode.object)
    // remove metadata from compiled bytecode using extracted metadata
    resultBytecode = add0x(evm.bytecode.object)
    resultBytecode = resultBytecode.substr(0, resultBytecode.indexOf(compiledMetadata))
  }

  return { resultBytecode, orgBytecode, metadata, usedLibraries }
}

function removeLibraryPrefix (lib) {
  const [prefix, name] = lib.split(':')
  return (prefix && name) ? name : lib
}

function addPrefixToLibraries (libraries, bytecode) {
  if (!libraries || Array.isArray(libraries)) return
  const libs = {}
  const bytecodeLibs = linker.find(bytecode)
  for (let lib in bytecodeLibs) {
    const name = removeLibraryPrefix(lib)
    libs[lib] = libraries[name]
  }
  return libs
}

function getUsedLibraries (bytecode, libraries) {
  const used = Object.keys(linker.find(bytecode))
    .map(name => removeLibraryPrefix(name))
  if (used.length) {
    const usedLibraries = {}
    for (let name of used) {
      let address = libraries[name]
      if (address) {
        usedLibraries[name] = address
      }
    }
    return usedLibraries
  }
}

function resultSettings (compiled) {
  const { compiler, language, settings } = JSON.parse(compiled.metadata)
  const { evmVersion, libraries, optimizer, remappings } = settings
  return { compiler, language, evmVersion, libraries, optimizer, remappings }
}

export default Verifier
