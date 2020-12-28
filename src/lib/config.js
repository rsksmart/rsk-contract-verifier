import defaultConfig from './defaultConfig'
import path from 'path'
import fs from 'fs'

export const config = create()

export function load () {
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

export function createDirs (config) {
  const { log } = config
  if (log.file) {
    const dir = path.dirname(log.file)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }
}

export function create (userConfig) {
  userConfig = userConfig || load()
  const config = Object.assign(defaultConfig, userConfig)
  createDirs(config)
  return config
}

export default config
