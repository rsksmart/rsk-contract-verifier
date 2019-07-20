import { expect } from 'chai'
import { decodeMetadata, isValidMetadata } from '../src/lib/solidityMetadata'

describe(`# solidityMetadata`, function () {
  const metadata = 'a165627a7a723058205fb59448c6644241ee553549e0418378516927062afdca0d71d7c23f3b584f740029'
  describe(`isValidMetadata()`, function () {
    const test = [
      ['a1650011223344556677000a', true],
      ['a16500112233445566778899001a', false],
      ['a16600112233445566778899000a', false],
      [metadata, true]
    ]

    for (let t of test) {
      const [value, expected] = t
      it(`${value} should return ${expected}`, () => {
        expect(isValidMetadata(value)).to.be.equal(expected)
      })
    }
  })

  describe(`decodeMetadata()`, function () {
    it(`should decode metadata`, () => {
      const decoded = decodeMetadata(metadata)
      expect(decoded).to.be.an('object')
      expect(decoded).has.ownProperty('bzzr0')
      expect(decoded.bzzr0).to.be.equal('5fb59448c6644241ee553549e0418378516927062afdca0d71d7c23f3b584f74')
    })
  })
})
