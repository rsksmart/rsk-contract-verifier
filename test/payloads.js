import path from 'path'
import fs from 'fs'
import util from 'util'
const readfile = util.promisify(fs.readFile)

export function Payloads () {
  const payloads = {}
  const dir = path.resolve(__dirname, './payloads')
  const list = fs.readdirSync(dir)
  const load = async name => {
    if (payloads[name]) return payloads[name]
    try {
      let content = await readfile(path.resolve(dir, name))
      try {
        content = JSON.parse(content.toString())
        payloads[name] = content
        return content
      } catch (err) {
        throw new Error(name, err)
      }
    } catch (err) {
      console.log(err)
      process.exit()
    }
  }
  return Object.freeze({ list, load })
}
