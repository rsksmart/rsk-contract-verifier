import Compiler from './compiler'
import { link } from './linker'
import { getHash, add0x } from './utils'
import { extractMetadataFromBytecode } from './solidityMetadata'

const KEY = 'CONTRACT_VERIFIER'

function Verifier (options = {}) {
  const compiler = Compiler(options)

  const verify = async (payload = {}, { resolveImports } = {}) => {
    try {
      /** deployedBytecode is optional, used to surf metadata bug
       * if it is provided  the verifier will try to extract the original metadata from it */
      const { version, imports, bytecode, source, deployedBytecode, libraries, name } = payload
      const libs = addPrefixToLibraries(libraries)
      if (!name) throw new Error('Invalid contract name')
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
      const { errors, contracts } = result

      if (errors) return { errors }

      if (!contracts || !contracts[KEY]) throw new Error('Empty compilation result')
      const compiled = contracts[KEY][name]
      const { evm, abi } = compiled
      const { resultBytecode, orgBytecode, metadata } = verifyResults(bytecode, evm, deployedBytecode, libs)
      if (!resultBytecode) throw new Error('Invalid result ')
      const resultBytecodeHash = getHash(resultBytecode)
      const bytecodeHash = getHash(orgBytecode)
      const opcodes = evm.bytecode.opcodes
      return { bytecode, metadata, resultBytecode, bytecodeHash, resultBytecodeHash, abi, opcodes, usedSources }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  return Object.freeze({ verify, hash: getHash })
}

export function verifyResults (bytecode, evm, deployedBytecode, libs) {
  let { bytecode: orgBytecode, metadata } = extractMetadataFromBytecode(bytecode)
  let evmBytecode = evm.bytecode.object

  if (libs) evmBytecode = link(evmBytecode, libs)
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
    // remove metradata from compiled bytecode using extracted metadata
    resultBytecode = add0x(evm.bytecode.object)
    resultBytecode = resultBytecode.substr(0, resultBytecode.indexOf(compiledMetadata))
  }

  return { resultBytecode, orgBytecode, metadata }
}

function addPrefixToLibraries (libraries) {
  if (!libraries || Array.isArray(libraries)) return
  const libs = {}
  for (let lib in libraries) {
    const name = `${KEY}:${lib}`
    libs[name] = libraries[lib]
  }
  return libs
}
export default Verifier
