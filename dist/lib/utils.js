"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.randomHexString = exports.isReleaseVersion = exports.getHash = exports.forwardBytesDifference = exports.toHexString = void 0;var _rskUtils = require("@rsksmart/rsk-utils");
var _crypto = _interopRequireDefault(require("crypto"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const toHexString = stringOrBuffer => {
  const str = Buffer.isBuffer(stringOrBuffer) ? stringOrBuffer.toString('hex') : stringOrBuffer;
  return (0, _rskUtils.add0x)(str);
};exports.toHexString = toHexString;
const forwardBytesDifference = (a, b) => {
  if (a === null || b === null) return null;
  a = (0, _rskUtils.toBuffer)(a, 'utf8');
  b = (0, _rskUtils.toBuffer)(b, 'utf8');
  if (b.equals(a)) return Buffer.alloc(0);
  let difference = Buffer.from(a);
  for (let i = 0; i <= a.length; i++) {
    if (a[i] !== b[i]) return difference;
    difference = difference.slice(1);
  }
  return difference;
};exports.forwardBytesDifference = forwardBytesDifference;

const getHash = (value, encoding = 'hex') => toHexString((0, _rskUtils.keccak256)((0, _rskUtils.toBuffer)(value, encoding)));exports.getHash = getHash;

const isReleaseVersion = version => /^[0-9]+\.[0-9]+\.[0-9]+$/.test(version);exports.isReleaseVersion = isReleaseVersion;

const randomHexString = (size = 32) => toHexString(_crypto.default.randomBytes(size));exports.randomHexString = randomHexString;