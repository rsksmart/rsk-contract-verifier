import { toBuffer, toHexString, remove0x } from './utils'
import cbor from 'cbor'

const METADATA_START = 'a165'

export const startAsMetadata = metadata => `${metadata}`.substr(0, 4) === METADATA_START

export const getMetadataLength = (bytecode, metadataLen = 0) => {
  bytecode = toBuffer(bytecode)
  return bytecode.readUInt16BE(bytecode.length - 2)
}

export const getMetadata = (bytecode, metadata) => {
  bytecode = toBuffer(bytecode)
  let metaDataStart = bytecode.length - getMetadataLength(bytecode) - 2
  if (metaDataStart >= 0 && metaDataStart <= bytecode.length) {
    let newMetadata = bytecode.slice(metaDataStart, bytecode.length)
    if (startAsMetadata(newMetadata.toString('hex'))) {
      metadata = (metadata) ? Buffer.concat([newMetadata, metadata]) : newMetadata
      bytecode = bytecode.slice(0, metaDataStart)
      return getMetadata(bytecode, metadata)
    }
  }
  return (metadata) ? metadata.toString('hex') : metadata
}

export const isValidMetadata = metadata => {
  if (!startAsMetadata(metadata)) return false
  metadata = toBuffer(metadata)
  const len = getMetadataLength(metadata)
  return len === metadata.length - 2
}

export const extractMetadataFromBytecode = (bytecodeStringOrBuffer) => {
  const buffer = toBuffer(bytecodeStringOrBuffer)
  let bytecode = toHexString(bytecodeStringOrBuffer)
  let metadata = getMetadata(buffer)
  if (metadata) {
    bytecode = buffer.slice(0, buffer.length - metadata.length)
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
