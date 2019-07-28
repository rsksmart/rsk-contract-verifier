import { expect } from 'chai'
import Compiler from '../src/lib/compiler'
import { truffleContracts } from './contracts'
import { truffleParser } from './shared'
import { extractMetadataFromBytecode } from '../src/lib/solidityMetadata'

const contracts = truffleContracts()
const comp = Compiler({ solcCache: '/tmp' })

describe(`# Contracts`, function () {
  testContract('helloWorld')
  testContract('Test721')
  testContract('TestErc20')
})

function testContract (contractName) {
  const testData = contracts[contractName]
  describe(`[ ${contractName} ] `, function () {

    describe(`compile ${contractName}`, function () {
      const { bytecode, contractName, deployedBytecode, version, solFile, metadata, sources, settings } = truffleParser(testData)
      const input = comp.createInput({ sources, settings })
      this.timeout(90000)
      it(`should returns the same bytecode`, async () => {
        const resolveImports = comp.getImports(contracts)
        const compiled = await comp.compile(input, { version, metadata, resolveImports })
        expect(compiled).has.ownProperty('contracts')
        expect(compiled.errors).to.be.equal(undefined)
        const contract = compiled.contracts[solFile][contractName]
        let compiledBytecode = contract.evm.bytecode.object
        let compiledDeployedBytecode = contract.evm.deployedBytecode.object
        expect(deployedBytecode, 'deployed bytecode').to.be.equal(`0x${compiledDeployedBytecode}`)
        expect(bytecode, 'bytecode').to.be.equal(`0x${compiledBytecode}`)
      })
    })

    describe(`extractMetadataFromBytecode ${contractName}`, function () {
      const { bytecode } = truffleParser(testData)
      const { metadata } = extractMetadataFromBytecode(bytecode)
      if (metadata) {
        it('metadata should be valid', () => {
          if (metadata) {
            const buffer = Buffer.from(metadata, 'hex')
            const metadataLen = buffer.readUInt16BE(buffer.length - 2, buffer.length)
            expect(metadata.substr(0, 4)).to.be.equal('a165')
            expect(metadataLen).to.be.equal(buffer.length - 2)
          } else {
            expect(metadata).to.be.equal(undefined)
          }
        })
      }
    })
  })
}
