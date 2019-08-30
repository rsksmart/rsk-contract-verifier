"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.Logger = void 0;var _bunyan = _interopRequireDefault(require("bunyan"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const Logger = (name, { file, level } = {}) => {
  name = name || 'log';
  const log = _bunyan.default.createLogger({
    name,
    level: 'trace' });


  if (file) {
    log.addStream({
      path: file,
      level: level || 'info' });

  }

  log.on('error', (err, stream) => {
    console.error('Log error ', err);
  });
  return log;
};exports.Logger = Logger;var _default =

Logger;exports.default = _default;