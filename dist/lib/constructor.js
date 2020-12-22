"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.decodeConstructorArgs = exports.normalizeOutput = exports.encodeConstructorArgs = exports.getConstructorTypes = exports.getTypesFromAbi = exports.getConstructorAbi = void 0;var _rskUtils = require("@rsksmart/rsk-utils");
var _ethereumjsAbi = require("ethereumjs-abi");
var _bn = require("bn.js");

const getConstructorAbi = abi => abi.filter(x => x.type === 'constructor')[0];exports.getConstructorAbi = getConstructorAbi;

const getTypesFromAbi = abiDef => abiDef.inputs.map(x => x.type);exports.getTypesFromAbi = getTypesFromAbi;

const getConstructorTypes = abi => getTypesFromAbi(getConstructorAbi([...abi]));exports.getConstructorTypes = getConstructorTypes;

const encodeConstructorArgs = (args, abi) => {
  const types = getConstructorTypes(abi);
  const encoded = (0, _ethereumjsAbi.rawEncode)(types, (0, _rskUtils.remove0x)(args));
  return encoded.toString('hex');
};exports.encodeConstructorArgs = encodeConstructorArgs;

const normalizeOutput = out => {
  if (Array.isArray(out)) return out.map(normalizeOutput);
  if ((0, _bn.isBN)(out)) out = (0, _rskUtils.add0x)(out.toString(16));
  if ((0, _rskUtils.isAddress)(out)) out = (0, _rskUtils.add0x)(out);
  return out;
};exports.normalizeOutput = normalizeOutput;

const decodeConstructorArgs = (encoded, abi) => {
  const types = getConstructorTypes(abi);
  let decoded = (0, _ethereumjsAbi.rawDecode)(types, (0, _rskUtils.toBuffer)(encoded));
  // decoded = JSON.parse(JSON.stringify(decoded))
  decoded = normalizeOutput(decoded);
  return decoded;
};exports.decodeConstructorArgs = decodeConstructorArgs;