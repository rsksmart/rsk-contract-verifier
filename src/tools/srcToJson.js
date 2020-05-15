import path from 'path'
import fs from 'fs'
import util from 'util'
import payload from './payload.example.json'

const readFile = util.promisify(fs.readFile)

const file = process.argv[2]
if (!file) help()
convert(file).then(() => process.exit(0))

async function convert (file) {
  try {
    let source = await readFile(path.resolve(file))
    payload.source = source.toString()
    payload.name = ''
    payload.bytecode = ''
    console.log(JSON.stringify(payload, null, 2))
  } catch (err) {
    console.error(err)
    process.exit(9)
  }
}

function help () {
  console.log('Usage:')
  console.log(`${process.argv[0]} ${process.argv[1]} <path to file>`)
  process.exit(0)
}
