import { expect } from 'chai'
import { verifyParams } from '../src/lib/verifyFromPayload'

import payloads from './payloads/'

describe(`# Verify from payload`, () => {
  for (let key in payloads) {
    let payload = payloads[key]
    let _expected = payload._expected || {}
    let { warnings } = _expected
    describe(`# contract ${key}`, function () {
      this.timeout(20000)
      it('should verify a contract from payload', async () => {
        const verification = await verifyParams(payload)
        expect(verification).to.be.an('object')
        expect(verification).has.ownProperty('bytecodeHash')
        expect(verification).has.ownProperty('resultBytecodeHash')
        expect(verification).has.ownProperty('usedSettings')
        expect(verification).has.ownProperty('usedLibraries')
        expect(verification.errors).to.be.equal(undefined)
        if (warnings) expect(verification.warnings).to.be.deep.equal(warnings)
        expect(verification.bytecodeHash, 'hashes').to.be.deep.equal(verification.resultBytecodeHash)
        expect(verification.usedLibraries).to.be.deep.equal(payload.libraries)
      })
    })
  }
})
