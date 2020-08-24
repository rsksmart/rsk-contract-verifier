import { expect } from 'chai'
import Verifier from '../src/lib/verifier'
import { truffleParser } from './shared'
import { truffleContracts } from './contracts'

const contracts = truffleContracts()

describe(`# Verifier`, function () {

  testContract('helloWorld')
  testContract('Test721', true) // use deployedBytecode to surf solidity metadata bug
  testContract('TestErc20')
})

function testContract (contractName, useDeployedByteCode) {
  const verifier = Verifier()
  const testData = contracts[contractName]
  let { version, bytecode, source, deployedBytecode } = truffleParser(testData)
  describe(`| Contract: ${contractName} |`, function () {
    describe(`# verify`, function () {
      this.timeout(90000)
      it(`should verify a contract`, async () => {
        deployedBytecode = (useDeployedByteCode) ? deployedBytecode : undefined
        const verification = await verifier.verify({ source, imports: contracts, version, bytecode, deployedBytecode, name: contractName })
        let { errors } = verification
        if (errors) console.log(errors)
        expect(verification, 'verification should be an object').to.be.an('object')
        expect(verification).has.ownProperty('bytecodeHash')
        expect(verification).has.ownProperty('resultBytecodeHash')
        expect(verification).has.ownProperty('bytecode')
        expect(verification).has.ownProperty('usedSources')
        expect(verification.usedSources.length).to.not.be.equal(Object.keys(contracts).length)
        expect(typeof verification.bytecode).to.be.equal('string')
        expect(verification).has.ownProperty('resultBytecode')
        expect(typeof verification.resultBytecode).to.be.equal('string')
        expect(verification).has.ownProperty('abi')
        expect(verification).has.ownProperty('opcodes').not.equal(undefined)
        expect(verification.bytecodeHash).to.be.deep.equal(verification.resultBytecodeHash)
        // expect(verification.bytecode).to.be.deep.equal('0x' + verification.resultBytecode)
      })
    })
  })
}
