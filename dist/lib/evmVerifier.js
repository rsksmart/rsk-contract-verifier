"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _compiler = _interopRequireDefault(require("./compiler"));
var _evm = _interopRequireDefault(require("./evm"));
var _utils = require("./utils");
var _solidityMetadata = require("./solidityMetadata");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function Verifier(options = {}) {
  const compiler = (0, _compiler.default)(options);
  const evm = (0, _evm.default)(options);

  const createSender = async ({ balance } = {}) => {
    balance = balance || '0xffffffffff';
    const { address, privKey } = evm.createAddress();
    const account = await evm.createAccount(address, { balance });
    return { address, account, privKey };
  };

  const verify = async (bytecodeString, source, options = {}) => {
    try {
      const { version, imports } = options;
      const settings = options.settings || {};
      const key = 'testContract';
      let sources = {};
      sources[key] = { content: source };
      const input = compiler.createInput({ sources, settings });
      const resolveImports = compiler.getImports(imports);
      const result = await compiler.compile(input, { version, resolveImports });
      const { errors, contracts } = result;
      if (errors) throw new Error(JSON.stringify(errors));

      if (!contracts || !contracts[key]) throw new Error('Empty compilation result');
      const compiled = Object.values(contracts[key])[0];
      const deployBytecode = compiled.evm.bytecode.object;
      const sender = await createSender();
      const deployResult = await evm.deploy(deployBytecode, sender.privKey, { gas: 10000000000 });
      const resultBytecode = (0, _solidityMetadata.extractMetadataFromBytecode)(deployResult.vm.return).bytecode;
      const { bytecode, metadata } = (0, _solidityMetadata.extractMetadataFromBytecode)(bytecodeString);
      const bytecodeHash = (0, _utils.getHash)(bytecode);
      const resultBytecodeHash = (0, _utils.getHash)(resultBytecode);
      const { gas, gasUsed } = deployResult.vm;
      const deploy = Object.assign({}, { gas, gasUsed });
      // console.log(deployResult.vm.runState)
      return { metadata, bytecode, resultBytecode, deploy, bytecodeHash, resultBytecodeHash };
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return Object.freeze({ verify, getHash: _utils.getHash });
}var _default =

Verifier;exports.default = _default;