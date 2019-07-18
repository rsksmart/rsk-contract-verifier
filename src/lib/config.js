import defaultConfig from './defaultConfig'
import path from 'path'
import fs from 'fs'

const config = Object.assign(defaultConfig, loadConfig())
createDirs(config)

function loadConfig () {
  let config = {}
  try {
    let file = path.resolve(__dirname, '../../config.json')
    if (fs.existsSync(file)) config = JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch (err) {
    console.log(err)
    process.exit(8)
  }
  return config
}

function createDirs (config) {
  const { log } = config
  if (log.file) {
    const dir = path.dirname(log.file)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }
}

export default config
