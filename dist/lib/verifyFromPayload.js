"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.verifyParams = exports.resolver = void 0;var _verifier = _interopRequireDefault(require("./verifier"));
var _config = _interopRequireDefault(require("./config"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const resolver = imports => path => {
  if (!imports) return;
  const parts = path.split('/');
  let file = parts.pop();
  const result = imports.find(i => i.name === file);
  const contents = result ? result.contents : null;
  return { contents };
};exports.resolver = resolver;

const verifyParams = (params, verifier) => {
  verifier = verifier || (0, _verifier.default)(_config.default);
  return verifier.verify(params, { resolveImports: resolver(params.imports) });
};exports.verifyParams = verifyParams;var _default =

verifyParams;exports.default = _default;