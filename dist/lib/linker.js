"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _linker = _interopRequireDefault(require("solc/linker"));
var _ethereumjsUtil = require("ethereumjs-util");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}





const libraryHashPlaceholder = input => {
  return '$' + (0, _ethereumjsUtil.keccak256)(input).toString('hex').slice(0, 34) + '$';
};

const link = _linker.default.linkBytecode;
const find = _linker.default.findLinkReferences;var _default =

{ link, find, libraryHashPlaceholder };exports.default = _default;