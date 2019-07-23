import Compiler from './compiler'
import { hash } from './utils'
import { extractMetadataFromBytecode } from './solidityMetadata'

function Verifier (options = {}) {
  const compiler = Compiler(options)

  const verify = async (source, options = {}) => {
    try {
      const { version, imports, bytecode } = options
      const settings = options.settings || {}
      const key = 'testContract'
      let sources = {}
      sources[key] = { content: source }
      const input = compiler.createInput({ sources, settings })
      const resolveImports = compiler.getImports(imports)
      const result = await compiler.compile(input, { version, resolveImports })
      const { errors, contracts } = result
      if (errors) throw new Error(JSON.stringify(errors))

      if (!contracts || !contracts[key]) throw new Error('Empty compilation result')
      const compiled = Object.values(contracts[key])[0]

      const { bytecode: resultBytecode } = extractMetadataFromBytecode(compiled.evm.bytecode.object)
      const resultBytecodeHash = hash(resultBytecode)
      const { bytecode: orgBytecode, metadata } = extractMetadataFromBytecode(resultBytecode, bytecode)
      const bytecodeHash = hash(orgBytecode)
      return { bytecode, metadata, resultBytecode, bytecodeHash, resultBytecodeHash }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  return Object.freeze({ verify, hash })
}

export default Verifier
