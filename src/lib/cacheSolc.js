import GetSolc from './getSolc'

export async function cacheSolc (config, { releasesOnly, log } = {}) {
  try {
    const getSolc = GetSolc(config)
    let { builds } = await getSolc.getList()
    if (releasesOnly) builds = builds.filter(b => !b.prerelease)
    for (let build of builds.reverse()) {
      const { path, keccak256 } = build
      const cached = await getSolc.isCached(path)
      if (log && cached) log.debug(`${path} is cached`)
      if (!cached) {
        if (log) log.info(`Downloading ${path}`)
        await getSolc.downloadAndSave(path, keccak256)
      }
    }
  } catch (err) {
    return Promise.reject(err)
  }
}

export default cacheSolc
