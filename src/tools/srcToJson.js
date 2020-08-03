import path from 'path'
import fs from 'fs'
import util from 'util'
const readFile = util.promisify(fs.readFile)
const readDir = util.promisify(fs.readdir)

const args = {
  file: 'Main .sol file',
  dir: '[optional] path to imported .sol files.',
  payload: '[optional] base payload'
}

let { file, dir, payload } = parseArguments()
payload = payload || path.join(__dirname, 'payload.example.json')

if (!file) help()
convert(file, dir, payload).then(() => process.exit(0))

function argKey (name) {
  return `--${name}=`
}

function parseArguments () {
  const { argv } = process
  const parsed = {}
  for (let a in args) {
    let key = argKey(a)
    let arg = argv.find(ar => ar.startsWith(key))
    if (arg) parsed[a] = arg.replace(key, '')
  }
  return parsed
}

async function loadFile (file) {
  let content = await readFile(path.resolve(file))
  if (content) return content.toString()
}

async function convert (file, dir, payloadFile) {
  try {
    let payload = await loadFile(payloadFile)
    payload = JSON.parse(payload)
    let { name, bytecode } = payload
    payload.name = name || ''
    payload.bytecode = bytecode || ''
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
  const ars = Object.entries(args).map(([name, desc]) => `${argKey(name)}${desc}`)
  console.log('Usage:')
  console.log(`${process.argv[0]} ${process.argv[1]} ${ars.join(' ')}`)
  process.exit(0)
}
