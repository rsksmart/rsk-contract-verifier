"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.randomHexString = exports.isReleaseVersion = exports.getHash = exports.forwardBytesDifference = exports.toHexString = exports.bufferToHexString = exports.toBuffer = exports.add0x = exports.isHexString = exports.remove0x = void 0;var _ethereumjsUtil = require("ethereumjs-util");
var _crypto = _interopRequireDefault(require("crypto"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const remove0x = str => str && str.substring(0, 2) === '0x' ? str.substring(2) : str;exports.remove0x = remove0x;

const isHexString = str => {
  if (str === undefined || str === null) return str;
  str = `${str}`;
  str = str.substring(0, 2) === '0x' ? str.substring(2) : str;
  return /^[0-9a-f]+$/i.test(str);
};exports.isHexString = isHexString;

const add0x = str => {
  let s = str;
  let prefix = s[0] === '-' ? '-' : '';
  if (prefix) s = s.substring(prefix.length);
  if (isHexString(s) && s.substring(0, 2) !== '0x') {
    return `${prefix}0x${s}`;
  }
  return str;
};exports.add0x = add0x;

const toBuffer = (value, encoding = 'hex') => {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === 'number') value = value.toString();
  value = remove0x(value);
  return Buffer.from(value, encoding);
};exports.toBuffer = toBuffer;

const bufferToHexString = buffer => `0x${buffer.toString('hex')}`;exports.bufferToHexString = bufferToHexString;

const toHexString = stringOrBuffer => {
  const str = Buffer.isBuffer(stringOrBuffer) ? stringOrBuffer.toString('hex') : stringOrBuffer;
  return add0x(str);
};exports.toHexString = toHexString;

const forwardBytesDifference = (a, b) => {
  if (a === null || b === null) return null;
  a = toBuffer(a, 'utf8');
  b = toBuffer(b, 'utf8');
  if (b.equals(a)) return Buffer.alloc(0);
  let difference = Buffer.from(a);
  for (let i = 0; i <= a.length; i++) {
    if (a[i] !== b[i]) return difference;
    difference = difference.slice(1);
  }
  return difference;
};exports.forwardBytesDifference = forwardBytesDifference;

const getHash = (value, encoding = 'hex') => toHexString((0, _ethereumjsUtil.keccak256)(toBuffer(value, encoding)));exports.getHash = getHash;

const isReleaseVersion = version => /^[0-9]+\.[0-9]+\.[0-9]+$/.test(version);exports.isReleaseVersion = isReleaseVersion;

const randomHexString = (size = 32) => toHexString(_crypto.default.randomBytes(size));exports.randomHexString = randomHexString;