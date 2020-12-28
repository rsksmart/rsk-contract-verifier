"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.searchMetadata = exports.encodeMetadata = exports.decodeMetadata = exports.isValidMetadata = exports.isValidMetadataLength = exports.getMetadataStart = exports.removeEmptyBytesFromBytecodeEnd = exports.getMetadataLength = void 0;var _rskUtils = require("@rsksmart/rsk-utils");
var _utils = require("../lib/utils");
var _cbor = _interopRequireDefault(require("cbor"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const getMetadataLength = bytecode => {
  bytecode = (0, _rskUtils.toBuffer)(bytecode);
  const pos = bytecode.length - 2;
  if (pos > 0) {
    const len = bytecode.readUInt16BE(pos);
    return len > 0 ? len : 0;
  }
};exports.getMetadataLength = getMetadataLength;

const removeEmptyBytesFromBytecodeEnd = bytecode => {
  bytecode = Buffer.from([...(0, _rskUtils.toBuffer)(bytecode)]);
  while (getMetadataLength(bytecode) === 0) {
    bytecode = bytecode.slice(0, bytecode.length - 2);
  }
  return bytecode;
};exports.removeEmptyBytesFromBytecodeEnd = removeEmptyBytesFromBytecodeEnd;

const getMetadataStart = bytecode => {
  bytecode = (0, _rskUtils.toBuffer)(bytecode);
  const len = getMetadataLength(bytecode);
  return len < bytecode.length ? bytecode.length - getMetadataLength(bytecode) - 2 : 0;
};exports.getMetadataStart = getMetadataStart;

const isValidMetadataLength = metadata => {
  if (!metadata) return false;
  metadata = Buffer.from([...(0, _rskUtils.toBuffer)(metadata)]);
  const len = getMetadataLength(metadata);
  return len === metadata.length - 2;
};exports.isValidMetadataLength = isValidMetadataLength;

const isValidMetadata = metadata => {
  if (isValidMetadataLength(metadata)) {
    const decoded = decodeMetadata(metadata);
    return decoded && typeof decoded === 'object' && !Array.isArray(decoded) ? decoded : false;
  }
};exports.isValidMetadata = isValidMetadata;

const decodeMetadata = metadata => {
  try {
    metadata = Buffer.from([...(0, _rskUtils.toBuffer)(metadata)]);
    if (!isValidMetadataLength(metadata)) throw new Error('Invalid length');
    const decoded = _cbor.default.decodeFirstSync(metadata.toString('hex').slice(0, -4));
    if (typeof decoded !== 'object') throw new Error('Decode fail');
    for (let p in decoded) {
      let value = decoded[p];
      if (Buffer.isBuffer(value)) value = value.toString('hex');
      if (typeof value === 'string') value = (0, _rskUtils.remove0x)((0, _utils.toHexString)(value));
      decoded[p] = value;
    }
    return decoded;
  } catch (err) {
    return undefined;
  }
};exports.decodeMetadata = decodeMetadata;

const encodeMetadata = metadata => {
  metadata = _cbor.default.encode(metadata);
  const len = metadata.length;
  metadata = Buffer.concat([metadata, Buffer.from('00')]);
  metadata.writeUInt16BE(parseInt(len), len);
  return metadata;
};exports.encodeMetadata = encodeMetadata;

const searchMetadata = bytecodeStrOrBuffer => {
  let bytecode = (0, _rskUtils.toBuffer)(bytecodeStrOrBuffer);
  if (!bytecode || !bytecode.length) throw new Error('invalid bytecode');
  let newBytecode = Buffer.from([...bytecode]);
  const parts = [];
  while (newBytecode.length > 0) {
    const start = getMetadataStart(newBytecode) || newBytecode.length - 1;
    const metadata = newBytecode.slice(start, newBytecode.length);
    let trim = 0;
    if (isValidMetadata(metadata)) {
      parts.unshift(metadata.toString('hex'));
      parts.unshift('');
      trim = metadata.length;
    } else {
      trim = 1;
      const last = parts[0] === undefined ? '' : parts[0];
      parts[0] = newBytecode.slice(newBytecode.length - trim, newBytecode.length).toString('hex') + last;
    }
    trim = newBytecode.length - trim;
    newBytecode = newBytecode.slice(0, trim);
  }
  return parts;
};exports.searchMetadata = searchMetadata;