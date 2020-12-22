"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.Verifier = Verifier;exports.filterResultErrors = filterResultErrors;exports.verifyResults = verifyResults;exports.removeLibraryPrefix = removeLibraryPrefix;exports.getLibrariesPlaceHolders = getLibrariesPlaceHolders;exports.findLibrary = findLibrary;exports.parseLibraries = parseLibraries;exports.resultSettings = resultSettings;exports.default = void 0;var _compiler = _interopRequireDefault(require("./compiler"));
var _linker = _interopRequireDefault(require("./linker"));
var _utils = require("./utils");
var _rskUtils = require("@rsksmart/rsk-utils");
var _solidityMetadata = require("./solidityMetadata");
var _constructor = require("./constructor");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const SEVERITY_WARNING = 'warning';

function Verifier(options = {}) {
  const compiler = (0, _compiler.default)(options);

  const verify = async (payload = {}, { resolveImports } = {}) => {
    try {
      if (payload.bytecode) payload.bytecode = (0, _rskUtils.add0x)(payload.bytecode);
      const { version, imports, bytecode, source, libraries, name, constructorArguments } = payload;
      if (!name) throw new Error('Invalid contract name');
      if (!bytecode) throw new Error(`Invalid bytecode`);
      const KEY = name;
      resolveImports = resolveImports || compiler.getImports(imports);
      const settings = payload.settings || {};
      let sources = {};
      const usedSources = [];

      // wraps resolveImports method to catch used sources
      const updateUsedSources = path => {
        let file = path.split('/').pop();
        const { contents } = resolveImports(path);
        const hash = contents ? (0, _utils.getHash)(contents) : null;
        usedSources.push({ path, file, hash });
        return resolveImports(path);
      };

      sources[KEY] = { content: source };
      const input = compiler.createInput({ sources, settings });

      const result = await compiler.compile(input, { version, resolveImports: updateUsedSources });
      const { contracts } = result;
      const { errors, warnings } = filterResultErrors(result);
      if (errors) return { errors, warnings };

      if (!contracts || !contracts[KEY]) throw new Error('Empty compilation result');
      const compiled = contracts[KEY][name];
      const { evm, abi } = compiled;
      const vargs = { contractName: KEY, bytecode, evm, libraries, constructorArguments, abi };
      const { resultBytecode, orgBytecode, usedLibraries, decodedMetadata } = verifyResults(vargs);
      if (!resultBytecode) throw new Error('Invalid result ');
      const resultBytecodeHash = (0, _utils.getHash)(resultBytecode);
      const bytecodeHash = (0, _utils.getHash)(orgBytecode);

      const opcodes = evm.bytecode.opcodes;
      const methodIdentifiers = Object.entries(evm.methodIdentifiers || {});
      const usedSettings = resultSettings(compiled);
      return {
        name,
        usedSettings,
        usedLibraries,
        bytecode,
        resultBytecode,
        bytecodeHash,
        resultBytecodeHash,
        abi,
        opcodes,
        usedSources,
        methodIdentifiers,
        warnings,
        decodedMetadata };

    } catch (err) {
      return Promise.reject(err);
    }
  };

  return Object.freeze({ verify, hash: _utils.getHash });
}

function filterResultErrors({ errors }) {
  let warnings;
  if (errors) {
    warnings = errors.filter(e => e.severity === SEVERITY_WARNING);
    errors = errors.filter(e => e.severity !== SEVERITY_WARNING);
    errors = errors.length ? errors : undefined;
  }
  return { errors, warnings };
}

function verifyResults({ contractName, bytecode, evm, libraries, constructorArguments, abi }) {
  const metadataList = (0, _solidityMetadata.searchMetadata)(bytecode);
  const constructorArgsEncoded = constructorArguments && abi ? (0, _constructor.encodeConstructorArgs)(constructorArguments, abi) : undefined;

  let evmBytecode = evm.bytecode.object;
  const { usedLibraries, linkLibraries } = parseLibraries(libraries, evmBytecode, contractName);

  if (Object.keys(linkLibraries).length > 0) {
    evmBytecode = _linker.default.link(evmBytecode, linkLibraries);
  }

  const resultMetadataList = (0, _solidityMetadata.searchMetadata)(evmBytecode);

  /*   if (metadataList.length !== resultMetadataList.length) {
      throw new Error('invalid metadata list length')
    } */

  let decodedMetadata = metadataList.map(m => (0, _solidityMetadata.isValidMetadata)(m));
  for (let i in metadataList) {
    if (decodedMetadata[i] && resultMetadataList[i].length === metadataList[i].length && (0, _solidityMetadata.isValidMetadata)(metadataList[i])) {
      resultMetadataList[i] = metadataList[i];
    }
  }

  // Add constructor args to bytecode
  if (constructorArgsEncoded) resultMetadataList.push(constructorArgsEncoded);

  const resultBytecode = (0, _rskUtils.add0x)(resultMetadataList.join(''));
  decodedMetadata = decodedMetadata.filter(m => m);
  const orgBytecode = (0, _rskUtils.add0x)(bytecode);
  return { resultBytecode, orgBytecode, usedLibraries, decodedMetadata };
}

function removeLibraryPrefix(lib) {
  const [prefix, name] = lib.split(':');
  return prefix && name ? name : lib;
}

function getLibrariesPlaceHolders(libraries, prefix) {
  const placeholders = {};

  const addLibraryPlaceHolder = (name, address, key) => {
    let library = _linker.default.libraryHashPlaceholder(key);
    placeholders[library] = { name, address, library };
  };

  for (let name in libraries) {
    let address = libraries[name];
    addLibraryPlaceHolder(name, address, name);
    addLibraryPlaceHolder(name, address, `${prefix}:${name}`);
  }
  return placeholders;
}

function findLibrary(key, prefix, libraries) {
  if (typeof libraries !== 'object') throw new Error('Libraries must be an object');
  let name = removeLibraryPrefix(key);
  let address = libraries[name];
  let library = key;
  if (!address) {
    let placeholders = getLibrariesPlaceHolders(libraries, prefix);
    if (placeholders[key]) return placeholders[key];
  }
  return { address, library, name };
}

function parseLibraries(libraries, bytecode, prefix) {
  const bytecodeLibs = _linker.default.find(bytecode);
  const libs = [];
  for (let key in bytecodeLibs) {
    libs.push(findLibrary(key, prefix, libraries));
  }
  let linkLibraries = libs.reduce((v, a) => {
    let { address, library } = a;
    if (address) v[library] = address;
    return v;
  }, {});
  let usedLibraries = libs.reduce((v, a, i) => {
    let { name, library, address } = a;
    v[name || library || i] = address;
    return v;
  }, {});
  return { usedLibraries, linkLibraries };
}

function resultSettings(compiled) {
  const { compiler, language, settings } = JSON.parse(compiled.metadata);
  const { evmVersion, libraries, optimizer, remappings } = settings;
  return { compiler, language, evmVersion, libraries, optimizer, remappings };
}var _default =

Verifier;exports.default = _default;