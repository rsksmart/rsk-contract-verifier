#!/usr/bin/env node
"use strict";var _lib = require("./lib");
var _rskJsCli = require("@rsksmart/rsk-js-cli");

const file = process.argv[2];

const opts = {
  OUT_FILE: 'save',
  AUTOFIX: 'fix',
  SHOW: 'show',
  SILENT: 'silent' };


const args = (0, _rskJsCli.getArgs)(opts, process.argv.slice(3));
args.HELP = (0, _rskJsCli.parseArg)(process.argv, 'help');
if (args.HELP || !file) showHelp();

(0, _lib.verify)(file, args).
then(() => {
  process.exit(0);
}).
catch(err => {
  if (!args.SILENT) _rskJsCli.log.error(err);
  process.exit(9);
});

function showHelp() {
  const parameters = Object.values(opts).map(key => (0, _rskJsCli.argKey)(key));
  console.log();
  console.log('Usage:');
  console.log();
  console.log(`${process.argv[0]} ${process.argv[1]} <path to payload.file.json> [ ${parameters.join(' ')} ]`);
  console.log();
  console.log(`--${opts.AUTOFIX} -> Automatically adds verifier suggestions to payload and check again,`);
  console.log('       if the verification succeeds, it saves the modified payload to the file.');
  console.log();
  console.log(`--${opts.OUT_FILE} | --${opts.OUT_FILE}=fileName -> Saves result to file.`);
  console.log();
  console.log(`--${opts.SHOW} -> Show full result.`);
  console.log();
  console.log(`--${opts.SILENT} -> Suppress output.`);
  process.exit(0);
}