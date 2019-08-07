import { expect } from 'chai'
import { verifyParams } from '../src/lib/verifyFromPayload'

import payload from './payloads/ERC20.json'

describe(`# verifyParams`, function () {
  this.timeout(20000)
  it('should verify a contract from payload', async () => {
    const verification = await verifyParams(payload)
    expect(verification).to.be.an('object')
    expect(verification).has.ownProperty('bytecodeHash')
    expect(verification).has.ownProperty('resultBytecodeHash')
    expect(verification.bytecodeHash).to.be.deep.equal(verification.resultBytecodeHash)
  })
})
