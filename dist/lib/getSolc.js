"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.GetSolc = GetSolc;exports.default = void 0;var _axios = _interopRequireDefault(require("axios"));
var _requireFromString = _interopRequireDefault(require("require-from-string"));
var _solc = _interopRequireDefault(require("solc"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _util = require("util");
var _utils = require("./utils");
var _defaultConfig = _interopRequireDefault(require("./defaultConfig"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
const writeFile = (0, _util.promisify)(_fs.default.writeFile);
const readFile = (0, _util.promisify)(_fs.default.readFile);
const getStat = (0, _util.promisify)(_fs.default.stat);

function GetSolc({ solcCache, solcUrl, listUrl }) {
  solcUrl = solcUrl || 'https://ethereum.github.io/solc-bin/bin';
  listUrl = listUrl || `${solcUrl}/list.json`;

  const DIR = solcCache || _defaultConfig.default.solcCache;
  let versionsList;

  if (!_fs.default.existsSync(DIR)) {
    _fs.default.mkdirSync(DIR);
  }

  const getVersionUrl = fileName => `${solcUrl}/${fileName}`;

  const getList = async () => {
    if (!versionsList) await setVersionsLists();else
    setVersionsLists();
    return versionsList;
  };

  const setVersionsLists = async () => {
    let data = await download(listUrl);
    if (data) versionsList = data;
  };

  const getVersionData = async version => {
    try {
      const list = await getList();
      const { builds, releases, latestRelease } = list;
      if (version === 'latest') version = latestRelease;
      if ((0, _utils.isReleaseVersion)(version)) {
        const fileName = releases[version];
        return builds.find(item => item.path === fileName);
      }
      return builds.find(item => item.longVersion === version);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const getFilePath = fileName => _path.default.join(DIR, fileName);

  const load = async version => {
    try {
      const versionData = await getVersionData(version);
      if (!versionData) throw new Error(`Unkown version ${version}`);
      const { keccak256, path: fileName } = versionData;
      let code = await loadFromDisk(fileName);
      if (!code) code = await downloadAndSave(fileName, keccak256);
      const snapshot = (0, _requireFromString.default)(code, fileName);
      return _solc.default.setupMethods(snapshot);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const downloadAndSave = async (fileName, hash) => {
    try {
      const code = await downloadVersion(fileName, hash);
      await writeFile(getFilePath(fileName), code);
      return code;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const isCached = async fileName => {
    try {
      const stat = await getStat(getFilePath(fileName));
      return stat.isFile();
    } catch (err) {
      return Promise.resolve(false);
    }
  };

  const loadFromDisk = async fileName => {
    try {
      const filePath = getFilePath(fileName);
      const cached = await isCached(fileName);
      if (!cached) return;
      const code = await readFile(filePath);
      return code.toString();
    } catch (err) {
      if (err.code === 'ENOENT') return false;
      return Promise.reject(err);
    }
  };
  const downloadVersion = async (fileName, versionHash) => {
    try {
      const url = getVersionUrl(fileName);
      const code = await download(url);
      const hash = (0, _utils.getHash)(code, 'utf8');
      if (hash === versionHash) return code;
    } catch (err) {
      return Promise.reject(err);
    }
  };
  const download = async url => {
    try {
      const res = await _axios.default.get(url);
      if (res.status === 200) {
        const { data } = res;
        return data;
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return Object.freeze({ load, loadFromDisk, downloadVersion, getList, getVersionData, isCached, downloadAndSave });
}var _default =

GetSolc;exports.default = _default;