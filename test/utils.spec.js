import chai from 'chai'
import * as utils from '../src/lib/utils'
import chaiBytes from 'chai-bytes'
chai.use(chaiBytes)
const { expect } = chai

describe(`# utils`, function () {

  describe(`remove0x()`, function () {
    const test = [
      ['0x', ''],
      ['0x0', '0'],
      ['a', 'a'],
      [123, 123],
      ['0x123', '123'],
      [[], []],
      ['abc', 'abc']
    ]
    for (let t of test) {
      let [value, expected] = t
      it(`${value} should be ${expected}`, () => {
        expect(utils.remove0x(value)).to.be.deep.equal(expected)
      })
    }
  })
  describe('toBuffer()', function () {
    const tests = [
      [Buffer.from('a'), Buffer.from('a')],
      ['ABC', Buffer.from('ABC', 'utf-8'), 'utf-8'],
      [1234, Buffer.from('1234', 'hex')],
      ['0xab12e', Buffer.from('ab12e', 'hex')]
    ]
    for (let t of tests) {
      const [v, expected, encoding] = t
      it(`${v} should be ${expected}`, () => {
        expect(utils.toBuffer(v, encoding)).to.equalBytes(expected)
      })
    }
  })

  describe(`forwardBytesDifference()`, function () {
    const test = [
      ['', '', Buffer.from('')],
      ['abcde', 'ab', Buffer.from('cde')],
      [123, 1, Buffer.from('23')],
      [Buffer.from('abc', 'hex'), Buffer.from('ab', 'hex'), Buffer.from('c', 'hex')],
      [Buffer.from('0a0b', 'hex'), Buffer.from([10]), Buffer.from('0b', 'hex')],
      [null, null, null]
    ]
    for (let t of test) {
      const [a, b, expected] = t
      it(`${a} - ${b} should be ${(expected) ? expected.toString() : expected}`, () => {

        const difference = utils.forwardBytesDifference(a, b)
        expect(Buffer.isBuffer(difference) || difference === null).equals(true)
        if (difference !== null) expect(difference).to.equalBytes(expected)
      })
    }
  })

  describe(`isReleaseVersion()`, function () {
    const test = [
      ['9.2.3', true],
      ['222222.9999.2222', true],
      ['1.2.3.4', false],
      ['test', false],
      ['123.23.323.c', false]
    ]
    for (let t of test) {
      const [value, expected] = t
      it(`${value} should be ${expected}`, () => {
        expect(utils.isReleaseVersion(value)).to.be.deep.equal(expected)
      })
    }
  })

  describe(`getHash`, function () {
    const test = [
      ['', '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470']
    ]

    it('null & undefined should throw', () => {
      expect(() => utils.getHash(null), 'null').to.throw()
      expect(() => utils.getHash(undefined), 'undefined').to.throw()
    })

    for (let t of test) {
      const [value, expected] = t
      it(`${value} should be ${expected}`, () => {
        expect(utils.getHash(value)).to.be.deep.equal(expected)
      })
    }
  })
})
