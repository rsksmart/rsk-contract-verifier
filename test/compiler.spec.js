import { expect } from 'chai'
import Compiler from '../src/lib/compiler'
import { truffleContracts } from './contracts'
import { truffleParser } from './shared'

const comp = Compiler({ solcCache: '/tmp' })
const test = truffleContracts()['helloWorld']
const { bytecode, contractName, deployedBytecode, version, solFile, metadata, sources, settings } = truffleParser(test)

describe(`# Compiler`, function () {
  describe(`compile()`, function () {
    this.timeout(90000)
    const input = comp.createInput({ sources, settings })
    it(`should returns the same bytecode`, async () => {
      const compiled = await comp.compile(input, { version, metadata })
      expect(compiled.errors).to.be.equal(undefined)
      expect(compiled).has.ownProperty('contracts')
      const contract = compiled.contracts[solFile][contractName]
      expect(contract).has.ownProperty('evm')
      expect(contract.evm).has.ownProperty('bytecode')
      expect(contract.evm).has.ownProperty('deployedBytecode')
      let compiledBytecode = contract.evm.bytecode.object
      let compiledDeployedBytecode = contract.evm.deployedBytecode.object
      expect(bytecode).to.be.equal(`0x${compiledBytecode}`)
      expect(deployedBytecode).to.be.equal(`0x${compiledDeployedBytecode}`)
    })
  })
})
