"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.forkedService = forkedService;exports.suicidalService = suicidalService;exports.suicidalForkedService = suicidalForkedService;var _child_process = require("child_process");
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function forkedService(script, options = {}) {
  const file = _path.default.resolve(__dirname, script);
  if (!_fs.default.existsSync(file)) throw new Error(`Unknown file:${file}`);
  return (0, _child_process.fork)(file, options);
}

function suicidalService(service, { payload, callBack, timeout } = {}) {
  if (timeout === undefined) timeout = 5000;
  if (payload) service.send(payload);
  if (callBack) callBack(service);
  let killer = null;

  return new Promise((resolve, reject) => {
    const sayGoodBye = (error, result) => {
      error = error || result.error;
      service.kill('SIGKILL');
      clearTimeout(killer);
      if (error) return reject(new Error(error));
      return resolve(result);
    };
    service.once('message', msg => {
      sayGoodBye(null, msg);
    });
    service.once('exit', (code, signal) => {
      if (code) {
        sayGoodBye(`Code: ${code}, signal:${signal}`);
      }
    });
    service.once('error', err => {
      sayGoodBye(err);
    });
    if (timeout) {
      killer = setTimeout(() => {
        sayGoodBye(`Timeout exceed`);
      }, timeout);
    }
  });
}

function suicidalForkedService(script, options) {
  const service = forkedService(script);
  return suicidalService(service, options);
}