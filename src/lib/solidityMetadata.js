import { toBuffer, remove0x } from '@rsksmart/rsk-utils'
import { toHexString } from '../lib/utils'
import cbor from 'cbor'

export const getMetadataLength = bytecode => {
  bytecode = toBuffer(bytecode)
  const pos = bytecode.length - 2
  if (pos > 0) {
    const len = bytecode.readUInt16BE(pos)
    return len > 0 ? len : 0
  }
}

export const removeEmptyBytesFromBytecodeEnd = (bytecode) => {
  bytecode = Buffer.from([...toBuffer(bytecode)])
  while (getMetadataLength(bytecode) === 0) {
    bytecode = bytecode.slice(0, bytecode.length - 2)
  }
  return bytecode
}

export const getMetadataStart = bytecode => {
  bytecode = toBuffer(bytecode)
  const len = getMetadataLength(bytecode)
  return (len < bytecode.length) ? bytecode.length - getMetadataLength(bytecode) - 2 : 0
}

export const isValidMetadataLength = metadata => {
  if (!metadata) return false
  metadata = Buffer.from([...toBuffer(metadata)])
  const len = getMetadataLength(metadata)
  return len === metadata.length - 2
}

export const isValidMetadata = metadata => {
  if (isValidMetadataLength(metadata)) {
    const decoded = decodeMetadata(metadata)
    return (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) ? decoded : false
  }
}

export const decodeMetadata = metadata => {
  try {
    metadata = Buffer.from([...toBuffer(metadata)])
    if (!isValidMetadataLength(metadata)) throw (new Error('Invalid length'))
    const decoded = cbor.decodeFirstSync(metadata.toString('hex').slice(0, -4))
    if (typeof decoded !== 'object') throw (new Error('Decode fail'))
    for (let p in decoded) {
      const value = decoded[p]
      if (typeof value !== 'number') decoded[p] = remove0x(toHexString(value))
    }
    return decoded
  } catch (err) {
    return undefined
  }
}

export const encodeMetadata = metadata => {
  metadata = cbor.encode(metadata)
  const len = metadata.length
  metadata = Buffer.concat([metadata, Buffer.from('00')])
  metadata.writeUInt16BE(parseInt(len), len)
  return metadata
}

export const searchMetadata = (bytecodeStrOrBuffer) => {
  let bytecode = toBuffer(bytecodeStrOrBuffer)
  if (!bytecode || !bytecode.length) throw new Error('invalid bytecode')
  let newBytecode = Buffer.from([...bytecode])
  const parts = []
  while (newBytecode.length > 0) {
    const start = getMetadataStart(newBytecode) || newBytecode.length - 1
    const metadata = newBytecode.slice(start, newBytecode.length)
    let trim = 0
    if (isValidMetadata(metadata)) {
      parts.unshift(metadata.toString('hex'))
      parts.unshift('')
      trim = metadata.length
    } else {
      trim = 1
      const last = (parts[0] === undefined) ? '' : parts[0]
      parts[0] = newBytecode.slice(newBytecode.length - trim, newBytecode.length).toString('hex') + last
    }
    trim = newBytecode.length - trim
    newBytecode = newBytecode.slice(0, trim)
  }
  return parts
}
