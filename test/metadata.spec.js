import { expect } from 'chai'
import {
  decodeMetadata,
  isValidMetadataLength,
  isValidMetadata,
  encodeMetadata,
  getMetadataStart,
  getMetadataLength,
  searchMetadata
} from '../src/lib/solidityMetadata'
import metadatas from './metadatas.json'
import crypto from 'crypto'

const testMetadatas = [
  ['a4616101616202616303616404000d', true],
  ['a16500112233445566778899001a', false],
  ['a16600112233445566778899000a', false]
].concat(metadatas.map(m => [m.metadata, !!m.decoded]))

const validMetadata = testMetadatas.filter(([m, v]) => v)

describe(`# solidityMetadata`, function () {

  describe('getMetadataLength', function () {
    for (let [metadata] of validMetadata) {
      const length = (metadata.length / 2) - 2
      it(`should return ${length}`, () => {
        expect(getMetadataLength(metadata)).to.be.equal(length)
      })
    }
  })
  describe('getMetadataStart', function () {
    it('should return 0', () => {
      expect(getMetadataStart('0123456789ab')).to.be.equal(0)
      expect(getMetadataStart('01')).to.be.equal(0)
    })
    for (let [metadata] of validMetadata) {
      it('should return the metadata start', () => {
        expect(getMetadataStart('0123456789ab' + metadata)).to.be.equal(6)
      })
    }
  })

  describe(`isValidMetadataLength()`, function () {
    for (let [value, expected] of testMetadatas) {
      it(`${value} should return ${expected}`, () => {
        expect(isValidMetadataLength(value)).to.be.equal(expected)
      })
    }
  })

  describe(`isValidMetadata()`, function () {
    for (let [value, expected] of testMetadatas) {
      it(`${value} should return ${expected}`, () => {
        expect(!!isValidMetadata(value)).to.be.equal(expected)
      })
    }
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
        expect(isValidMetadataLength(encoded)).to.be.deep.equal(true, 'metadata length')
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


  describe('searchMetadata()', function () {
    const test = [
      ['abc123', 'a4616101616202616303616404000d', 'aa00bb00cc00dd00', 'a4616101616202616303616404000d'],
      ['608060405234801561001057600080fd5b5060fb8061001f6000396000f3fe6080604052348015600f57600080fd5b5060043610602b5760e060020a6000350463942ae0a781146030575b600080fd5b603660a8565b6040805160208082528351818301528351919283929083019185019080838360005b83811015606e5781810151838201526020016058565b50505050905090810190601f168015609a5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b60408051808201909152600a815260b260020a691a195b1b1bd5dbdc9b190260208201529056fe', 'a165627a7a723058207c6e19806ba6e63df46a21f273d8369bace2933543f3771335b7d6c1eb259d6f0029'],
      ['abcd1234567890ab']
    ]
    for (let t of test) {
      it('should split bytecode', () => {
        expect(searchMetadata(t.join(''))).to.be.deep.equal(t)
      })
    }
  })
})
