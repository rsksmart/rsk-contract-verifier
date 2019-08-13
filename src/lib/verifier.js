import Compiler from './compiler'
import { getHash } from './utils'
import { extractMetadataFromBytecode } from './solidityMetadata'

function Verifier (options = {}) {
  const compiler = Compiler(options)

  const verify = async (payload = {}, { resolveImports } = {}) => {
    try {
      const { version, imports, bytecode, source } = payload
      const settings = payload.settings || {}
      const key = 'testContract.sol'
      let sources = {}
      sources[key] = { content: source }
      const input = compiler.createInput({ sources, settings })
      resolveImports = resolveImports || compiler.getImports(imports)
      const result = await compiler.compile(input, { version, resolveImports })
      const { errors, contracts } = result

      if (errors) return { errors }

      if (!contracts || !contracts[key]) throw new Error('Empty compilation result')
      const compiled = Object.values(contracts[key])[0]
      const { evm, abi } = compiled
      const { bytecode: resultBytecode } = extractMetadataFromBytecode(evm.bytecode.object)
      const { bytecode: orgBytecode, metadata } = extractMetadataFromBytecode(bytecode)

      const opcodes = evm.bytecode.opcodes
      const resultBytecodeHash = getHash(resultBytecode)
      const bytecodeHash = getHash(orgBytecode)
      return { bytecode, metadata, resultBytecode, bytecodeHash, resultBytecodeHash, abi, opcodes }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  return Object.freeze({ verify, hash: getHash })
}

export default Verifier
