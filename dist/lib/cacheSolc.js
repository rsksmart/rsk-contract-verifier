"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.cacheSolc = cacheSolc;exports.default = void 0;var _getSolc = _interopRequireDefault(require("./getSolc"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

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
}var _default =

cacheSolc;exports.default = _default;