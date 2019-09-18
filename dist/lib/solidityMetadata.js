"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.decodeMetadata = exports.extractMetadataFromBytecode = exports.isValidMetadata = exports.getMetadata = exports.getMetadataLength = exports.startAsMetadata = void 0;var _utils = require("./utils");
var _cbor = _interopRequireDefault(require("cbor"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const METADATA_START = 'a165';

const startAsMetadata = metadata => `${metadata}`.substr(0, 4) === METADATA_START;exports.startAsMetadata = startAsMetadata;

const getMetadataLength = (bytecode, metadataLen = 0) => {
  bytecode = (0, _utils.toBuffer)(bytecode);
  return bytecode.readUInt16BE(bytecode.length - 2);
};exports.getMetadataLength = getMetadataLength;

const getMetadata = (bytecode, metadata) => {
  bytecode = (0, _utils.toBuffer)(bytecode);
  let metaDataStart = bytecode.length - getMetadataLength(bytecode) - 2;
  if (metaDataStart >= 0 && metaDataStart <= bytecode.length) {
    let newMetadata = bytecode.slice(metaDataStart, bytecode.length);
    if (startAsMetadata(newMetadata.toString('hex'))) {
      metadata = metadata ? Buffer.concat([newMetadata, metadata]) : newMetadata;
      bytecode = bytecode.slice(0, metaDataStart);
      return getMetadata(bytecode, metadata);
    }
  }
  return metadata ? metadata.toString('hex') : metadata;
};exports.getMetadata = getMetadata;

const isValidMetadata = metadata => {
  if (!startAsMetadata(metadata)) return false;
  metadata = (0, _utils.toBuffer)(metadata);
  const len = getMetadataLength(metadata);
  return len === metadata.length - 2;
};exports.isValidMetadata = isValidMetadata;

const extractMetadataFromBytecode = bytecodeStringOrBuffer => {
  const buffer = (0, _utils.toBuffer)(bytecodeStringOrBuffer);
  let bytecode = (0, _utils.toHexString)(bytecodeStringOrBuffer);
  let metadata = getMetadata(buffer);
  if (metadata) {
    bytecode = buffer.slice(0, buffer.length - metadata.length);
  }
  return { bytecode, metadata };
};exports.extractMetadataFromBytecode = extractMetadataFromBytecode;

const decodeMetadata = metadata => {
  if (!isValidMetadata(metadata)) return;
  const decoded = _cbor.default.decode(metadata);
  if (typeof decoded !== 'object') return;
  for (let p in decoded) {
    const value = (0, _utils.remove0x)((0, _utils.toHexString)(decoded[p]));
    decoded[p] = value;
  }
  return decoded;
};exports.decodeMetadata = decodeMetadata;