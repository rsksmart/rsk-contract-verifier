"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _defaultConfig = _interopRequireDefault(require("./defaultConfig"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const config = Object.assign(_defaultConfig.default, loadConfig());
createDirs(config);

function loadConfig() {
  let config = {};
  try {
    let file = _path.default.resolve(__dirname, '../../config.json');
    if (_fs.default.existsSync(file)) config = JSON.parse(_fs.default.readFileSync(file, 'utf-8'));
  } catch (err) {
    console.log(err);
    process.exit(8);
  }
  return config;
}

function createDirs(config) {
  const { log } = config;
  if (log.file) {
    const dir = _path.default.dirname(log.file);
    if (!_fs.default.existsSync(dir)) {
      _fs.default.mkdirSync(dir);
    }
  }
}var _default =

config;exports.default = _default;