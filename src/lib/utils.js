import { keccak256 } from 'ethereumjs-util'

export const remove0x = str => (str && str.substring(0, 2) === '0x') ? str.substring(2) : str

const isHexString = str => {
  if (str === undefined || str === null) return str
  str = `${str}`
  str = (str.substring(0, 2) === '0x') ? str.substring(2) : str
  return /^[0-9a-f]+$/i.test(str)
}

export const add0x = str => {
  let s = str
  let prefix = (s[0] === '-') ? '-' : ''
  if (prefix) s = s.substring(prefix.length)
  if (isHexString(s) && s.substring(0, 2) !== '0x') {
    return `${prefix}0x${s}`
  }
  return str
}

export const toBuffer = (value, encoding = 'hex') => {
  if (Buffer.isBuffer(value)) return value
  if (typeof value === 'number') value = value.toString()
  value = remove0x(value)
  return Buffer.from(value, encoding)
}

export const bufferToHexString = buffer => `0x${buffer.toString('hex')}`

export const toHexString = stringOrBuffer => {
  const str = (Buffer.isBuffer(stringOrBuffer)) ? stringOrBuffer.toString('hex') : stringOrBuffer
  return add0x(str)
}

export const fordwardBytesDifference = (a, b) => {
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
