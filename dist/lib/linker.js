"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _linker = _interopRequireDefault(require("solc/linker"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const link = _linker.default.linkBytecode;
const find = _linker.default.findLinkReferences;var _default =

{ link, find };exports.default = _default;