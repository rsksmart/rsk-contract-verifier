"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.showResult = showResult;exports.saveOutput = saveOutput;exports.verify = verify;exports.readDir = exports.readFile = exports.writeFile = void 0;
var _verifier = require("../lib/verifier");
var _verifyFromPayload = require("../lib/verifyFromPayload");
var _rskJsCli = require("@rsksmart/rsk-js-cli");
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _util = _interopRequireDefault(require("util"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
const writeFile = _util.default.promisify(_fs.default.writeFile);exports.writeFile = writeFile;

const readFile = file => _util.default.promisify(_fs.default.readFile)(_path.default.resolve(file));exports.readFile = readFile;

const readDir = _util.default.promisify(_fs.default.readdir);exports.readDir = readDir;

function showResult(result, full) {
  try {
    if (!result || typeof result !== 'object') throw new Error('Empty result');
    let { errors, warnings } = result;
    let { bytecodeHash, resultBytecodeHash } = result;
    if (full) console.log(JSON.stringify(result, null, 2));
    if ((0, _verifier.isVerified)(result)) {
      console.log();
      console.log();
      const ww = warnings ? '(with warnings)' : '';
      const msg = (0, _rskJsCli.tag)(` The source code was verified! ${ww}`);
      if (ww) _rskJsCli.log.warn(msg);else
      _rskJsCli.log.ok(msg);
      console.log();
      _rskJsCli.log.label(JSON.stringify({ bytecodeHash, resultBytecodeHash }, null, 2));
    } else {
      _rskJsCli.log.error((0, _rskJsCli.tag)('Verification failed', '='));
      if (result.tryThis) {
        console.log();
        _rskJsCli.log.info('Please try again using some of these parameters:');
        _rskJsCli.log.info(JSON.stringify(result.tryThis, null, 2));
      }
    }
    if (errors) {
      console.error((0, _rskJsCli.tag)('Errors'));
      console.error(JSON.stringify(errors, null, 2));
    }
    if (warnings) {
      _rskJsCli.log.warn((0, _rskJsCli.tag)('Warnings'));
      _rskJsCli.log.error(JSON.stringify(warnings, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(9);
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

async function verify(file, options) {
  try {
    let payload = await readFile(file);
    payload = JSON.parse(payload.toString());
    let verification = await (0, _verifyFromPayload.verifyParams)(payload);

    // Auto add constructor arguments
    if (!(0, _verifier.isVerified)(verification) && verification.tryThis && options.AUTOFIX) {
      const { encodedConstructorArguments, constructorArguments } = verification.tryThis;
      if (constructorArguments) {
        payload.constructorArguments = constructorArguments;
      } else if (encodedConstructorArguments) {
        payload.encodedConstructorArguments = encodedConstructorArguments;
      }
      verification = await (0, _verifyFromPayload.verifyParams)(payload);
      if ((0, _verifier.isVerified)(verification)) {
        await writeFile(file, JSON.stringify(payload, null, 4));
        _rskJsCli.log.info((0, _rskJsCli.tag)(`The arguments were saved in ${file}`));
      }
    }
    if (options.OUT_FILE) {
      const outFile = await saveOutput(options.OUT_FILE, verification, file);
      _rskJsCli.log.info((0, _rskJsCli.tag)(`The result was saved in ${outFile}`));
    }
    showResult(verification, options.SHOW);
  } catch (err) {
    console.error(err);
    process.exit(9);
  }
}