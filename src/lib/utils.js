export const remove0x = str => (str.substring(0, 2) === '0x') ? str.substring(2) : str

const isHexString = str => {
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

export const toBuffer = value => (!Buffer.isBuffer(value)) ? Buffer.from(remove0x(value), 'hex') : value

export const bufferToHexString = buffer => `0x${buffer.toString('hex')}`

export const toHexString = stringOrBuffer => {
  const str = (Buffer.isBuffer(stringOrBuffer)) ? stringOrBuffer.toString('hex') : stringOrBuffer
  return add0x(str)
}
