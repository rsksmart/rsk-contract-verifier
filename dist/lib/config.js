"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.load = load;exports.createDirs = createDirs;exports.create = create;exports.default = exports.config = void 0;var _defaultConfig = _interopRequireDefault(require("./defaultConfig"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const config = create();exports.config = config;

function load() {
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
}

function create(userConfig) {
  userConfig = userConfig || load();
  const config = Object.assign(_defaultConfig.default, userConfig);
  createDirs(config);
  return config;
}var _default =

config;exports.default = _default;