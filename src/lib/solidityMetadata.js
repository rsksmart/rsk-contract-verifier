import { toBuffer, remove0x } from 'rsk-utils'
import { toHexString } from '../lib/utils'
import cbor from 'cbor'

export const getMetadataLength = bytecode => {
  bytecode = toBuffer(bytecode)
  const pos = bytecode.length - 2
  if (pos > 0) return bytecode.readUInt16BE(pos)
}

export const removeEmptyBytesFromBytecodeEnd = (bytecode) => {
  bytecode = Buffer.from([...toBuffer(bytecode)])
  while (getMetadataLength(bytecode) === 0) {
    bytecode = bytecode.slice(0, bytecode.length - 2)
  }
  return bytecode
}

export const getMetadata = (bytecode, metadataList) => {
  bytecode = toBuffer(bytecode)
  metadataList = metadataList || []
  let metaDataStart = bytecode.length - getMetadataLength(bytecode) - 2
  if (metaDataStart >= 0 && metaDataStart <= bytecode.length) {
    let newMetadata = bytecode.slice(metaDataStart, bytecode.length)
    if (isValidMetadataLength(newMetadata)) {
      metadataList.push(newMetadata)
      bytecode = bytecode.slice(0, metaDataStart)
      return getMetadata(bytecode, metadataList)
    }
  }
  let metadata, decodedMetadata
  if (metadataList.length) {
    metadataList = metadataList.reverse()
    decodedMetadata = metadataList.map(function (m) { return isValidMetadata(m) })
    if (!decodedMetadata.includes(false)) {
      metadata = Buffer.concat(metadataList).toString('hex')
    }
  }
  return { metadata, decodedMetadata }
}

export const isValidMetadataLength = metadata => {
  if (!metadata) return false
  metadata = toBuffer(metadata)
  const len = getMetadataLength(metadata)
  return len === metadata.length - 2
}

export const isValidMetadata = metadata => {
  if (isValidMetadataLength(metadata)) {
    const decoded = decodeMetadata(metadata)
    return (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) ? decoded : false
  }
}

export const extractMetadataFromBytecode = (bytecodeStringOrBuffer) => {
  const buffer = removeEmptyBytesFromBytecodeEnd(bytecodeStringOrBuffer)
  let bytecode = toHexString(bytecodeStringOrBuffer)
  const { metadata, decodedMetadata } = getMetadata(buffer)
  if (metadata) {
    bytecode = toHexString(buffer.slice(0, buffer.length - metadata.length))
  }
  return { bytecode, metadata, decodedMetadata }
}

export const decodeMetadata = metadata => {
  try {
    if (!isValidMetadataLength(metadata)) throw (new Error('Invalid length'))
    const decoded = cbor.decode(metadata)
    if (typeof decoded !== 'object') throw (new Error('Decode fail'))
    for (let p in decoded) {
      if (typeof decoded[p] !== 'number') decoded[p] = remove0x(toHexString(decoded[p]))
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
