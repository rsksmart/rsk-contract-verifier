import Compiler from './compiler'
import { getHash, add0x } from './utils'
import { extractMetadataFromBytecode } from './solidityMetadata'

function Verifier (options = {}) {
  const compiler = Compiler(options)

  const verify = async (payload = {}, { resolveImports } = {}) => {
    try {
      /** deployedBytecode is optional, used to surf metadata bug
       * if it is provided  the verifier will try to extract the original metadata from it */

      const { version, imports, bytecode, source, deployedBytecode } = payload
      resolveImports = resolveImports || compiler.getImports(imports)
      const settings = payload.settings || {}
      const key = 'testContract.sol'
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

      sources[key] = { content: source }
      const input = compiler.createInput({ sources, settings })

      const result = await compiler.compile(input, { version, resolveImports: updateUsedSources })
      const { errors, contracts } = result

      if (errors) return { errors }

      if (!contracts || !contracts[key]) throw new Error('Empty compilation result')
      const compiled = Object.values(contracts[key])[0]
      const { evm, abi } = compiled
      const { resultBytecode, orgBytecode, metadata } = verifyResults(bytecode, evm, deployedBytecode)
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

export function verifyResults (bytecode, evm, deployedBytecode) {
  let { bytecode: orgBytecode, metadata } = extractMetadataFromBytecode(bytecode)
  let { bytecode: resultBytecode } = extractMetadataFromBytecode(evm.bytecode.object)

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

export default Verifier
