import { removeMetadata } from '../src/lib/verifier'
import { assert } from 'chai'

describe('removeMetadata()', function () {
  const test = [
    ['0xab12', '12', '0xab'],
    ['0xabab', 'ab', '0xab'],
    ['0xabab', '0xab', '0xab'],
    ['0xabab', '', '0xabab']
  ]
  for (let [bytecode, metadata, expected] of test) {
    it('should remove the metadata', () => {
      assert.deepEqual(removeMetadata(bytecode, metadata), expected)
    })
  }
})
