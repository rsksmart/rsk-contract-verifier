import { expect } from 'chai'
import { verifyParams } from '../src/lib/verifyFromPayload'

import { Payloads } from './payloads.js'

const payloads = Payloads()

describe(`# Verify from payload`, async () => {
  for (let key of payloads.list) {
    describe(`# contract ${key}`, function () {
      this.timeout(60000)
      it('should verify a contract from payload', async () => {
        const payload = await payloads.load(key)
        let _expected = payload._expected || {}
        const verification = await verifyParams(payload)
        // console.log(verification)
        expect(verification).to.be.an('object')
        expect(verification).has.ownProperty('bytecodeHash')
        expect(verification).has.ownProperty('resultBytecodeHash')
        expect(verification).has.ownProperty('usedSettings')
        expect(verification).has.ownProperty('usedLibraries')
        expect(verification).has.ownProperty('decodedMetadata')
        expect(verification.errors).to.be.equal(undefined)
        for (let e in _expected) {
          expect(verification[e], e).to.be.deep.equal(_expected[e])
        }
        expect(verification.bytecodeHash, 'hashes').to.be.deep.equal(verification.resultBytecodeHash)
      })
    })
  }
})
