import { keccak256, toBuffer, add0x } from '@rsksmart/rsk-utils'
import crypto from 'crypto'

export const toHexString = stringOrBuffer => {
  const str = (Buffer.isBuffer(stringOrBuffer)) ? stringOrBuffer.toString('hex') : stringOrBuffer
  return add0x(str)
}
export const forwardBytesDifference = (a, b) => {
  if (a === null || b === null) return null
  a = toBuffer(a, 'utf8')
  b = toBuffer(b, 'utf8')
  if (b.equals(a)) return Buffer.alloc(0)
  let difference = Buffer.from(a)
  for (let i = 0; i <= a.length; i++) {
    if (a[i] !== b[i]) return difference
    difference = difference.slice(1)
  }
  return difference
}

export const getHash = (value, encoding = 'hex') => toHexString(keccak256(toBuffer(value, encoding)))

export const isReleaseVersion = version => /^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)

export const randomHexString = (size = 32) => toHexString(crypto.randomBytes(size))
