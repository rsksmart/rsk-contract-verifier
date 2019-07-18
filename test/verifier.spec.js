import { expect } from 'chai'
import Verifier from '../src/lib/verifier'
import { truffleParser } from './shared'
import { truffleContracts } from './contracts'

const contracts = truffleContracts()
const verifier = Verifier()

describe(`# Verifier`, function () {
  testContract('helloWorld')
  // testContract('Test721')
  testContract('TestErc20')
})

function testContract (contractName) {
  const testData = contracts[contractName]
  const { version, deployedBytecode, source } = truffleParser(testData)
  describe(`## ${contractName}`, function () {
    describe(`# verify`, function () {
      this.timeout(90000)
      it(`should verify a contract`, async () => {
        const verification = await verifier.verify(deployedBytecode, source, { imports: contracts, version })
        expect(verification, 'verifification should be an object').to.be.an('object')
        expect(verification).has.ownProperty('bytecodeHash')
        expect(verification).has.ownProperty('resultBytecodeHash')
        expect(verification.bytecodeHash).to.be.deep.equal(verification.resultBytecodeHash)
        // expect(verification.resultBytecode).to.be.equal(verification.bytecode)
      })
    })
  })
}
