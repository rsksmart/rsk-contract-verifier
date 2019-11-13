import cacheSolc from '../lib/cacheSolc'
import config from '../lib/config'
import Logger from '../lib/Logger'
const log = Logger(process.argv[1])
const releasesOnly = process.argv[2]

cacheSolc(config, { log, releasesOnly }).then(() => {
  console.log(`Done!`)
  process.exit(0)
})
