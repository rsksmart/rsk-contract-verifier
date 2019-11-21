import linker from 'solc/linker'
import { keccak256 } from 'ethereumjs-util'

/**
 * solc-js libraryHashPlaceholder
 * see: solc-js/linker.js
 */
const libraryHashPlaceholder = input => {
  return '$' + keccak256(input).toString('hex').slice(0, 34) + '$'
}

const link = linker.linkBytecode
const find = linker.findLinkReferences

export default { link, find, libraryHashPlaceholder }
