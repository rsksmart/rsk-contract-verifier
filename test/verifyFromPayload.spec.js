import { expect } from 'chai'
import { verifyParams } from '../src/lib/verifyFromPayload'

import payloads from './payloads/'

describe(`# Verify from payload`, () => {
  for (let key in payloads) {
    let payload = payloads[key]
    describe(`# contract ${key}`, function () {
      this.timeout(20000)
      it('should verify a contract from payload', async () => {
        const verification = await verifyParams(payload)
        expect(verification).to.be.an('object')
        expect(verification).has.ownProperty('bytecodeHash')
        expect(verification).has.ownProperty('resultBytecodeHash')
        expect(verification.bytecodeHash, 'hashes').to.be.deep.equal(verification.resultBytecodeHash)
      })
    })
  }
})
