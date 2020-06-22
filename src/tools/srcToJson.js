import path from 'path'
import fs from 'fs'
import util from 'util'
import examplePayload from './payload.example.json'

const readFile = util.promisify(fs.readFile)
const readDir = util.promisify(fs.readdir)

const file = process.argv[2]
const dir = process.argv[3]
const basePayload = process.argv[4]
if (!file) help()
convert(file, dir, basePayload).then(() => process.exit(0))

async function loadFile (file) {
  let content = await readFile(path.resolve(file))
  if (content) return content.toString()
}

async function convert (file, dir, basePayload) {
  try {
    let payload = basePayload
      ? JSON.parse(await loadFile(basePayload))
      : examplePayload
    if (!payload.name) payload.name = ''
    if (!payload.bytecode) payload.bytecode = ''
    payload.source = await loadFile(file)
    payload.imports = await loadImports(dir)
    console.log(JSON.stringify(payload, null, 2))
  } catch (err) {
    console.error(err)
    process.exit(9)
  }
}

async function loadImports (dir) {
  try {
    let imports = []
    if (!dir) return imports
    let files = await readDir(path.resolve(dir))
    for (let name of files) {
      let contents = await loadFile(path.resolve(dir, name))
      if (contents) imports.push({ name, contents })
    }
    return imports
  } catch (err) {
    return Promise.reject(err)
  }
}

function help () {
  console.log('Usage:')
  console.log(`${process.argv[0]} ${process.argv[1]} <source-file> [<source-dir>]`)
  console.log(`source-file: main .sol file.`)
  console.log(`source-dir: path to folder that contains .sol imported files.`)
  process.exit(0)
}
