import { expect } from 'chai'
import { decodeMetadata, isValidMetadataLength, extractMetadataFromBytecode } from '../src/lib/solidityMetadata'
import { truffleContracts } from './contracts'
import metadatas from './metadatas.json'

const contracts = truffleContracts()

describe(`# solidityMetadata`, function () {
  const metadata = 'a165627a7a723058205fb59448c6644241ee553549e0418378516927062afdca0d71d7c23f3b584f740029'
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
