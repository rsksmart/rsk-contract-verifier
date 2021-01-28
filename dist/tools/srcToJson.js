#!/usr/bin/env node
"use strict";var _path = _interopRequireDefault(require("path"));
var _lib = require("./lib");
var _rskJsCli = require("@rsksmart/rsk-js-cli");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const opts = {
  FILE: 'file',
  DIR: 'dir',
  PAYLOAD: 'payload' };


const descs = {
  FILE: 'Main .sol file',
  DIR: '[optional] path to imported .sol files.',
  PAYLOAD: '[optional] base payload' };


let { FILE, DIR, PAYLOAD } = (0, _rskJsCli.getArgs)(opts, process.argv);
PAYLOAD = PAYLOAD || _path.default.join(__dirname, 'payload.example.json');

if (typeof file !== 'string') help();
convert(FILE, DIR, PAYLOAD).then(() => process.exit(0));

async function loadFile(file) {
  let content = await (0, _lib.readFile)(_path.default.resolve(file));
  if (content) return content.toString();
}

async function convert(file, dir, payloadFile) {
  try {
    let payload = await loadFile(payloadFile);
    payload = JSON.parse(payload);
    let { name, bytecode } = payload;
    payload.name = name || '';
    payload.bytecode = bytecode || '';
    payload.source = await loadFile(file);
    payload.imports = await loadImports(dir);
    console.log(JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(9);
  }
}

async function loadImports(dir) {
  try {
    let imports = [];
    if (!dir) return imports;
    let files = await (0, _lib.readDir)(_path.default.resolve(dir));
    for (let name of files) {
      let contents = await loadFile(_path.default.resolve(dir, name));
      if (contents) imports.push({ name, contents });
    }
    return imports;
  } catch (err) {
    return Promise.reject(err);
  }
}

function help() {
  const parameters = Object.keys(opts).map(k => {
    return [(0, _rskJsCli.argKey)(opts[k]), descs[k]];
  });
  console.log('Usage:');
  console.log(`${process.argv[0]} ${process.argv[1]} [ ${parameters.map(([k, d]) => `${k}=<...>`).join(' ')} ]`);
  console.log();
  for (const [o, t] of parameters) {
    console.log(`${o}: ${t}`);
  }
  console.log();
  process.exit(0);
}