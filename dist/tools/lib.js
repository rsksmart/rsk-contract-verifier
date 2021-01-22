"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.readFile = readFile;exports.isVerified = isVerified;exports.showResult = showResult;exports.label = label;exports.parseArg = parseArg;exports.saveOutput = saveOutput;exports.getArgs = getArgs;exports.writeFile = void 0;
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _util = _interopRequireDefault(require("util"));
var _rskUtils = require("@rsksmart/rsk-utils");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
const writeFile = _util.default.promisify(_fs.default.writeFile);exports.writeFile = writeFile;

function readFile(file) {
  return _util.default.promisify(_fs.default.readFile)(_path.default.resolve(file));
}

function isVerified({ bytecodeHash, resultBytecodeHash }) {
  try {
    if (!(0, _rskUtils.isHexString)(bytecodeHash) || !(0, _rskUtils.isHexString)(resultBytecodeHash)) return false;
    if (bytecodeHash.lenght < 64 || resultBytecodeHash.lenght < 66) return false;
    return bytecodeHash === resultBytecodeHash;
  } catch (error) {
    return false;
  }
}

function showResult(result, full) {
  try {
    if (!result || typeof result !== 'object') throw new Error('Empty result');
    let { errors, warnings } = result;
    let { bytecodeHash, resultBytecodeHash } = result;
    if (full) console.log(JSON.stringify(result, null, 2));
    if (isVerified(result)) {
      console.log();
      console.log();
      let ww = warnings ? '(with warnings)' : '';
      console.log(label(` The source code was verified! ${ww}`));
      console.log();
      console.log(JSON.stringify({ bytecodeHash, resultBytecodeHash }, null, 2));
    } else {
      console.log(label('Verification failed', '='));
      if (result.tryThis) {
        console.log();
        console.log('Please try again using some of these parameters:');
        console.log(JSON.stringify(result.tryThis, null, 2));
      }
    }
    if (errors) {
      console.error(label('Errors'));
      console.error(JSON.stringify(errors, null, 2));
    }
    if (warnings) {
      console.warn(label('Warnings'));
      console.error(JSON.stringify(warnings, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(9);
  }
}

function label(txt, char = '-') {
  const l = char.repeat(13);
  return `${l} ${txt} ${l}`;
}

function parseArg(args, key) {
  if (!Array.isArray(args)) return;
  if (!key) return;
  key = `--${key}`;
  let a = args.find(v => v.startsWith(key));
  if (a) {
    a = a.split('=').pop();
    return a === key || a;
  }
}

function addExtension(file, extension) {
  file = file.split('.');
  if (file[file.length - 1] === extension) file.pop();
  file = file.join('');
  file = `${file}.${extension}`;
  return file;
}

async function saveOutput(file, content) {
  try {
    file = typeof file === 'string' ? file : `${Date.now()}--verifier-out`;
    file = addExtension(file, 'json');
    await writeFile(file, JSON.stringify(content, null, 4));
    return file;
  } catch (err) {
    return Promise.reject(err);
  }
}

function getArgs(options, userArgs) {
  const args = {};
  for (let o in options) {
    args[o] = parseArg(userArgs, o);
  }
  return args;
}