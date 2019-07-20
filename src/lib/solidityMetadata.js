import { toBuffer, toHexString, remove0x } from './utils'
import cbor from 'cbor'

export const startAsMetadata = metadata => `${metadata}`.substr(0, 4) === 'a165'

export const getMetadataLength = bytecode => {
  bytecode = toBuffer(bytecode)
  return bytecode.readUInt16BE(bytecode.length - 2)
}

export const isValidMetadata = metadata => {
  if (!startAsMetadata(metadata)) return false
  metadata = toBuffer(metadata)
  const len = getMetadataLength(metadata)
  return len === metadata.length - 2
}

export const extractMetadataFromBytecode = (bytecodeStringOrBuffer) => {
  const buffer = toBuffer(bytecodeStringOrBuffer)
  const metaDataStart = buffer.length - getMetadataLength(buffer) - 2
  let metadata
  let bytecode = toHexString(bytecodeStringOrBuffer)
  if (metaDataStart) {
    metadata = buffer.slice(metaDataStart, buffer.length).toString('hex')
    if (startAsMetadata(metadata)) {
      bytecode = buffer.slice(0, metaDataStart).toString('hex')
    } else {
      metadata = undefined
    }
  }
  return { bytecode, metadata }
}

export const decodeMetadata = metadata => {
  if (!isValidMetadata(metadata)) return
  const decoded = cbor.decode(metadata)
  if (typeof decoded !== 'object') return
  for (let p in decoded) {
    const value = remove0x(toHexString(decoded[p]))
    decoded[p] = value
  }
  return decoded
}
