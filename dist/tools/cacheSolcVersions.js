"use strict";var _cacheSolc = _interopRequireDefault(require("../lib/cacheSolc"));
var _config = _interopRequireDefault(require("../lib/config"));
var _Logger = _interopRequireDefault(require("../lib/Logger"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
const log = (0, _Logger.default)(process.argv[1]);
const releasesOnly = process.argv[2];

(0, _cacheSolc.default)(_config.default, { log, releasesOnly }).then(() => {
  console.log(`Done!`);
  process.exit(0);
});