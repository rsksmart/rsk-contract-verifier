"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.Compiler = Compiler;exports.default = void 0;var _getSolc = _interopRequireDefault(require("./getSolc"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function Compiler({ solcCache } = {}) {
  const getSolc = (0, _getSolc.default)({ solcCache });

  const createInput = ({ sources, settings } = {}) => {
    settings = settings || {};
    settings.outputSelection = settings.outputSelection || {
      '*': {
        '*': [
        'abi',
        'metadata',
        'evm.bytecode',
        'evm.deployedBytecode',
        'evm.methodIdentifiers'] } };



    const { optimizer } = settings;
    if (optimizer) {
      let { runs } = optimizer;
      runs = runs ? parseInt(runs) : 200;
      settings.optimizer.runs = runs;
    }
    return {
      language: 'Solidity',
      sources,
      settings };

  };

  const getSnapshot = async version => {
    try {
      let snapshot = await getSolc.load(version);
      return snapshot;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const compile = async (input, { version, resolveImports } = {}) => {
    try {
      if (typeof input !== 'string') {
        input = JSON.stringify(input);
      }
      const snapshot = await getSnapshot(version || 'latest');
      if (!snapshot.compile) throw new Error(`Can't load snapshot ${version}`);
      const res = snapshot.compile(input, resolveImports);
      if (!res) throw new Error('Empty result');
      return JSON.parse(res);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const getImport = (path, contracts) => {
    const parts = path.split('/');
    let name = parts.pop();
    let file = name.split('.');
    if (file[1] === 'sol') {
      const contract = contracts[file[0]];
      if (!contract) return { error: `Missing contract: ${name}` };
      const contents = contract.source || contract.content;
      if (contents) return { contents };
    }
    return { error: 'unknown error' };
  };

  const getImports = imports => {
    if (!imports) return;
    return path => {
      return getImport(path, imports);
    };
  };
  return Object.freeze({
    compile,
    createInput,
    getImports });

}var _default =

Compiler;exports.default = _default;