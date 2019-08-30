"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.decodeMetadata = exports.extractMetadataFromBytecode = exports.isValidMetadata = exports.getMetadataLength = exports.startAsMetadata = void 0;var _utils = require("./utils");
var _cbor = _interopRequireDefault(require("cbor"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const startAsMetadata = metadata => `${metadata}`.substr(0, 4) === 'a165';exports.startAsMetadata = startAsMetadata;

const getMetadataLength = bytecode => {
  bytecode = (0, _utils.toBuffer)(bytecode);
  return bytecode.readUInt16BE(bytecode.length - 2);
};exports.getMetadataLength = getMetadataLength;

const isValidMetadata = metadata => {
  if (!startAsMetadata(metadata)) return false;
  metadata = (0, _utils.toBuffer)(metadata);
  const len = getMetadataLength(metadata);
  return len === metadata.length - 2;
};exports.isValidMetadata = isValidMetadata;

const extractMetadataFromBytecode = bytecodeStringOrBuffer => {
  const buffer = (0, _utils.toBuffer)(bytecodeStringOrBuffer);
  const metaDataStart = buffer.length - getMetadataLength(buffer) - 2;
  let metadata;
  let bytecode = (0, _utils.toHexString)(bytecodeStringOrBuffer);
  if (metaDataStart) {
    metadata = buffer.slice(metaDataStart, buffer.length).toString('hex');
    if (startAsMetadata(metadata)) {
      bytecode = buffer.slice(0, metaDataStart).toString('hex');
    } else {
      metadata = undefined;
    }
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