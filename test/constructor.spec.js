import { expect } from 'chai'
import {
  getConstructorAbi,
  getTypesFromAbi,
  getConstructorTypes,
  normalizeOutput,
  encodeConstructorArgs,
  decodeConstructorArgs
} from '../src/lib/constructor'

import testCase from './constructor.test.json'
import BN from 'bn.js'

describe('# constructor', function () {

  describe('getConstructorAbi', function () {
    it('should return the constructor definition', () => {
      const constructor = { type: 'constructor' }
      const abi = [1, 2, constructor]
      expect(getConstructorAbi(abi)).to.be.deep.equal(constructor)
    })
  })

  describe('getTypesFromAbi, ', function () {
    const types = ['address', 'address', 'uint256', 'string']
    const abi = { inputs: types.map(type => { return { type } }) }
    it('should return the ABI types', () => {
      expect(getTypesFromAbi(abi)).to.be.deep.equal(types)
    })
  })

  describe('getConstructorTypes', function () {
    const types = ['address', 'address', 'uint256', 'string']
    const abi = [{ b: 1 }, { type: 'constructor', inputs: types.map(type => { return { type } }) }, { a: 1 }]
    it('should return the constructor types', () => {
      expect(getConstructorTypes(abi)).to.be.deep.equal(types)
    })
  })

  describe('normalizeOutput', function () {
    const o = ['test', 'aca', new BN('fffffffffabcfffa', 16), [new BN(2048), new BN(2048), new BN(2049)], ['fc0000000000000000000a00000000000afffffb', '0xff000000000000000f000000000000000afffffb', 'af0000000000000000000000000000000afffffb']]
    const n = ['test', 'aca', '0xfffffffffabcfffa', ['0x800', '0x800', '0x801'], ['0xfc0000000000000000000a00000000000afffffb', '0xff000000000000000f000000000000000afffffb', '0xaf0000000000000000000000000000000afffffb']]
    it('should normalize output', () => {
      expect(normalizeOutput(o)).to.be.deep.equal(n)
    })
  })

  describe('encodeConstructorArgs', function () {
    for (let { abi, encoded, decoded } of [...testCase]) {
      it('should encode args', () => {
        expect(encodeConstructorArgs(decoded, abi)).to.be.deep.equal(encoded)
      })
    }
  })

  describe('decodeConstructorArgs, ', function () {
    for (let { abi, encoded, decoded } of testCase) {
      it('should decode args', () => {
        expect(decodeConstructorArgs(encoded, abi)).to.be.deep.equal(decoded)
      })
    }
  })
})
