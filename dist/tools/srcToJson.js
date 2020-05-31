"use strict";var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _util = _interopRequireDefault(require("util"));
var _payloadExample = _interopRequireDefault(require("./payload.example.json"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const readFile = _util.default.promisify(_fs.default.readFile);

const file = process.argv[2];
if (!file) help();
convert(file).then(() => process.exit(0));

async function convert(file) {
  try {
    let source = await readFile(_path.default.resolve(file));
    _payloadExample.default.source = source.toString();
    _payloadExample.default.name = '';
    _payloadExample.default.bytecode = '';
    console.log(JSON.stringify(_payloadExample.default, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(9);
  }
}

function help() {
  console.log('Usage:');
  console.log(`${process.argv[0]} ${process.argv[1]} <path to file>`);
  process.exit(0);
}