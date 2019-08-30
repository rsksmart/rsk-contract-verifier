"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.cacheSolc = cacheSolc;var _getSolc = _interopRequireDefault(require("../lib/getSolc"));
var _config = _interopRequireDefault(require("../lib/config"));
var _Logger = _interopRequireDefault(require("../lib/Logger"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
const log = (0, _Logger.default)(process.argv[1]);

cacheSolc(_config.default, { log });

async function cacheSolc(config, { releasesOnly, log } = {}) {
  try {
    const getSolc = (0, _getSolc.default)(config);
    let { builds } = await getSolc.getList();
    if (releasesOnly) builds = builds.filter(b => !b.prerelease);
    for (let build of builds.reverse()) {
      const { path, keccak256 } = build;
      const cached = await getSolc.isCached(path);
      if (log && cached) log.debug(`${path} is cached`);
      if (!cached) {
        if (log) log.info(`Downloading ${path}`);
        await getSolc.downloadAndSave(path, keccak256);
      }
    }
  } catch (err) {
    return Promise.reject(err);
  }
}