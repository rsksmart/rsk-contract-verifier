"use strict";var _verifyFromPayload = require("../lib/verifyFromPayload");
var _lib = require("./lib");

const file = process.argv[2];

const opts = {
  OUT: 'save',
  HELP: 'help',
  AUTOFIX: 'fix' };


const args = (0, _lib.getArgs)(opts, process.argv.slice(3));
args.HELP = (0, _lib.parseArg)(opts, process.argv);

if (args.HELP || !file) showHelp();

verify(file).then(() => process.exit(0));

async function verify(file) {
  try {
    let payload = await (0, _lib.readFile)(file);
    payload = JSON.parse(payload.toString());
    let verification = await (0, _verifyFromPayload.verifyParams)(payload);

    // Auto add constructor arguments
    if (!(0, _lib.isVerified)(verification) && verification.tryThis && args.AUTOFIX) {
      const { encodedConstructorArguments, constructorArguments } = verification.tryThis;
      if (constructorArguments) {
        payload.constructorArguments = constructorArguments;
      } else if (encodedConstructorArguments) {
        payload.encodedConstructorArguments = encodedConstructorArguments;
      }
      verification = await (0, _verifyFromPayload.verifyParams)(payload);
      if ((0, _lib.isVerified)(verification)) {
        await (0, _lib.writeFile)(file, JSON.stringify(payload, null, 4));
        console.log((0, _lib.label)(`The arguments were saved in ${file}`));
      }
    }
    if (args.OUT) {
      const outFile = await (0, _lib.saveOutput)(args.OUT, verification, file);
      console.log((0, _lib.label)(`The result was saved in ${outFile}`));
      (0, _lib.showResult)(verification);
    } else {
      (0, _lib.showResult)(verification, true);
    }
  } catch (err) {
    console.error(err);
    process.exit(9);
  }
}

function showHelp() {
  console.log();
  console.log('Usage:');
  console.log();
  console.log(`${process.argv[0]} ${process.argv[1]} <path to payload.file.json> [--${opts.AUTOFIX} ---${opts.OUT} ]`);
  console.log();
  console.log(`--${opts.AUTOFIX} -> Automatically adds verifier suggestions to payload and check again,`);
  console.log('       if the verification succeeds, it saves the modified payload to the file.');
  console.log();
  console.log(`--${opts.OUT} | --${opts.OUT}=fileName -> Saves output to file.`);
  console.log();
  process.exit(0);
}