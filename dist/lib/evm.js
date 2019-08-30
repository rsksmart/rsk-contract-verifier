"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.Evm = Evm;exports.default = void 0;var _ethereumjsVm = _interopRequireDefault(require("ethereumjs-vm"));
var _crypto = _interopRequireDefault(require("crypto"));
var ethUtil = _interopRequireWildcard(require("ethereumjs-util"));
var _ethereumjsTx = require("ethereumjs-tx");

var _ethereumjsAccount = _interopRequireDefault(require("ethereumjs-account"));
var _utils = require("./utils");
var _promisified = _interopRequireDefault(require("ethereumjs-vm/dist/state/promisified"));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) {var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};if (desc.get || desc.set) {Object.defineProperty(newObj, key, desc);} else {newObj[key] = obj[key];}}}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // const abi = require('ethereumjs-abi')

function Evm() {
  const vm = new _ethereumjsVm.default();
  const psm = new _promisified.default(vm.stateManager);

  const privateToAddress = privateKey => ethUtil.privateToAddress((0, _utils.toBuffer)(privateKey));

  const createAddress = (privateKey, asBuffer) => {
    const format = asBuffer ? value => value : _utils.bufferToHexString;
    privateKey = privateKey || _crypto.default.randomBytes(32);
    const pubKey = format(ethUtil.privateToPublic(privateKey));
    const address = format(privateToAddress(privateKey));
    let privKey = format(privateKey);
    return { pubKey, privKey, address };
  };

  const createAccount = async (address, { balance }) => {
    try {
      const account = new _ethereumjsAccount.default({ balance });
      await psm.putAccount((0, _utils.toBuffer)(address), account);
      return account;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const getAccount = async address => {
    const account = await psm.getAccount((0, _utils.toBuffer)(address));
    return account;
  };

  const getNonce = async address => {
    const account = await getAccount(address);
    return (0, _utils.add0x)(account.nonce.toString('hex'));
  };

  const makeTransaction = async (privateKey, { to, value, data, gas, gasPrice } = {}) => {
    privateKey = (0, _utils.toBuffer)(privateKey);
    gasPrice = gasPrice || 1;
    gas = gas || 2000000;
    value = value || 0;
    data = data || null;
    to = to || null;
    const address = privateToAddress(privateKey);
    const nonce = await getNonce(address);
    const tx = new _ethereumjsTx.Transaction({ to, value, gas, gasPrice, data, nonce });
    tx.sign(privateKey);
    return tx;
  };
  const runTx = async tx => {
    try {
      const res = await vm.runTx({ tx });
      return res;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const deploy = async (deployBytecode, privateKey, txOptions) => {
    try {
      const txObj = Object.assign({}, txOptions);
      txObj.data = (0, _utils.toBuffer)(deployBytecode);
      const tx = await makeTransaction(privateKey, txObj);
      const res = await runTx(tx);
      if (res.vm.exception === 0) throw new Error(res.vm.exceptionError);
      return res;
    } catch (err) {
      return Promise.reject(err);
    }
  };
  return Object.freeze({
    createAddress,
    createAccount,
    deploy,
    getNonce,
    makeTransaction,
    getAccount,
    runTx });

}var _default =

Evm;exports.default = _default;