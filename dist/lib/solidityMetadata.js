"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.decodeMetadata = exports.extractMetadataFromBytecode = exports.isValidMetadata = exports.isValidMetadataLength = exports.getMetadata = exports.removeEmptyBytesFromBytecodeEnd = exports.getMetadataLength = void 0;var _utils = require("./utils");
var _cbor = _interopRequireDefault(require("cbor"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const getMetadataLength = bytecode => {
  bytecode = (0, _utils.toBuffer)(bytecode);
  const pos = bytecode.length - 2;
  if (pos > 0) return bytecode.readUInt16BE(pos);
};exports.getMetadataLength = getMetadataLength;

const removeEmptyBytesFromBytecodeEnd = bytecode => {
  bytecode = Buffer.from([...(0, _utils.toBuffer)(bytecode)]);
  while (getMetadataLength(bytecode) === 0) {
    bytecode = bytecode.slice(0, bytecode.length - 2);
  }
  return bytecode;
};exports.removeEmptyBytesFromBytecodeEnd = removeEmptyBytesFromBytecodeEnd;

const getMetadata = (bytecode, metadataList) => {
  bytecode = (0, _utils.toBuffer)(bytecode);
  metadataList = metadataList || [];
  let metaDataStart = bytecode.length - getMetadataLength(bytecode) - 2;
  if (metaDataStart >= 0 && metaDataStart <= bytecode.length) {
    let newMetadata = bytecode.slice(metaDataStart, bytecode.length);
    if (isValidMetadataLength(newMetadata)) {
      metadataList.push(newMetadata);
      bytecode = bytecode.slice(0, metaDataStart);
      return getMetadata(bytecode, metadataList);
    }
  }
  let metadata, decodedMetadata;
  if (metadataList.length) {
    metadataList = metadataList.reverse();
    decodedMetadata = metadataList.map(function (m) {return isValidMetadata(m);});
    if (!decodedMetadata.includes(false)) {
      metadata = Buffer.concat(metadataList).toString('hex');
    }
  }
  return { metadata, decodedMetadata };
};exports.getMetadata = getMetadata;

const isValidMetadataLength = metadata => {
  if (!metadata) return false;
  metadata = (0, _utils.toBuffer)(metadata);
  const len = getMetadataLength(metadata);
  return len === metadata.length - 2;
};exports.isValidMetadataLength = isValidMetadataLength;

const isValidMetadata = metadata => {
  if (isValidMetadataLength(metadata)) {
    const decoded = decodeMetadata(metadata);
    return typeof decoded === 'object' ? decoded : false;
  }
};exports.isValidMetadata = isValidMetadata;

const extractMetadataFromBytecode = bytecodeStringOrBuffer => {
  const buffer = removeEmptyBytesFromBytecodeEnd(bytecodeStringOrBuffer);
  let bytecode = (0, _utils.toHexString)(bytecodeStringOrBuffer);
  const { metadata, decodedMetadata } = getMetadata(buffer);
  if (metadata) {
    bytecode = (0, _utils.toHexString)(buffer.slice(0, buffer.length - metadata.length));
  }
  return { bytecode, metadata, decodedMetadata };
};exports.extractMetadataFromBytecode = extractMetadataFromBytecode;

const decodeMetadata = metadata => {
  try {
    if (!isValidMetadataLength(metadata)) throw new Error('Invalid length');
    const decoded = _cbor.default.decode(metadata);
    if (typeof decoded !== 'object') throw new Error('Decode fail');
    for (let p in decoded) {
      decoded[p] = (0, _utils.remove0x)((0, _utils.toHexString)(decoded[p]));
    }
    return decoded;
  } catch (err) {
    return undefined;
  }
};exports.decodeMetadata = decodeMetadata;