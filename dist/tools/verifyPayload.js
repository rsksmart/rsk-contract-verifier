"use strict";var _verifyFromPayload = require("../lib/verifyFromPayload");
var _lib = require("./lib");
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _util = _interopRequireDefault(require("util"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const readFile = _util.default.promisify(_fs.default.readFile);
const file = process.argv[2];
if (!file) help();

verify(file).then(() => process.exit(0));

async function verify(file) {
  try {
    let payload = await readFile(_path.default.resolve(file));
    payload = JSON.parse(payload.toString());
    let verification = await (0, _verifyFromPayload.verifyParams)(payload);
    (0, _lib.showResult)(verification);
  } catch (err) {
    console.error(err);
    process.exit(9);
  }
}

function help() {
  console.log('Usage:');
  console.log(`${process.argv[0]} ${process.argv[1]} <path to payload.file.json>`);
  process.exit(0);
}