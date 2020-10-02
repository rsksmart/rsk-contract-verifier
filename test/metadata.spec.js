import { expect } from 'chai'
import {
  decodeMetadata,
  isValidMetadataLength,
  extractMetadataFromBytecode,
  removeEmptyBytesFromBytecodeEnd,
  encodeMetadata
} from '../src/lib/solidityMetadata'
import { truffleContracts } from './contracts'
import metadatas from './metadatas.json'
import crypto from 'crypto'

const contracts = truffleContracts()

describe(`# solidityMetadata`, function () {
  describe(`isValidMetadataLength()`, function () {
    const test = [
      ['a1650011223344556677000a', true],
      ['a16500112233445566778899001a', false],
      ['a16600112233445566778899000a', false]
    ].concat(metadatas.map(m => [m.metadata, !!m.decoded]))

    for (let t of test) {
      const [value, expected] = t
      it(`${value} should return ${expected}`, () => {
        expect(isValidMetadataLength(value)).to.be.equal(expected)
      })
    }
  })

  describe(`removeEmptyBytesFromBytecodeEnd()`, function () {
    const test = v => removeEmptyBytesFromBytecodeEnd(v).toString('hex')
    it(`should remove empty bytes from end`, () => {
      expect(test('00290000')).to.be.equal('0029')
      expect(test('002900')).to.be.equal('002900')
      expect(test('003910')).to.be.equal('003910')
      expect(test('0049000000000000000000000000')).to.be.equal('0049')
      expect(test('00290000000000000000000000000000000000000000000000000000000000000000')).to.be.equal('0029')
    })
  })

  describe(`encodeMetadata()`, function () {
    const meta = [
      { test: 'test' },
      { a: 0 },
      {
        a: crypto.randomBytes(64).toString('hex'),
        b: crypto.randomBytes(128).toString('hex')
      }
    ]
    for (let decoded of meta) {
      it(`should encode metadata`, () => {
        const encoded = encodeMetadata(decoded).toString('hex')
        expect(isValidMetadataLength(encoded)).to.be.deep.equal(true)
        expect(decodeMetadata(encoded)).to.be.deep.equal(decoded)
      })
    }
  })

  describe(`decodeMetadata()`, function () {
    for (let m of metadatas) {
      const { metadata, decoded } = m
      it(`should decode metadata`, () => {
        const result = decodeMetadata(metadata)
        expect(result).to.be.deep.equal(decoded)
      })
    }
  })

  describe(`extractMetadataFromBytecode()`, function () {
    /* This test fails with contract  'Test721' because a solidity compiler bug
    *  that introduces extra bytes at the end of bytecode metadata
    */
    ['helloWorld', 'TestErc20'].forEach(name => {
      describe(`   contract: ${name}`, () => {
        const contract = contracts[name]
        it('should decode metadata from bytecode', () => {
          const { bytecode, deployedBytecode } = contract
          const bytecodeResult = extractMetadataFromBytecode(bytecode)
          const deployedBytecodeResult = extractMetadataFromBytecode(deployedBytecode)
          expect(bytecodeResult.metadata).to.be.deep.equal(deployedBytecodeResult.metadata)
        })
      })
    })
  })
})
