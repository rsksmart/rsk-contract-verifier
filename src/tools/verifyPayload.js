import { verifyParams } from '../lib/verifyFromPayload'
import { showResult } from './lib'
import path from 'path'
import fs from 'fs'
import util from 'util'

const readFile = util.promisify(fs.readFile)
const file = process.argv[2]
if (!file) help()

verify(file).then(() => process.exit(0))

async function verify (file) {
  try {
    let payload = await readFile(path.resolve(file))
    payload = JSON.parse(payload.toString())
    let verification = await verifyParams(payload)
    showResult(verification)
  } catch (err) {
    console.error(err)
    process.exit(9)
  }
}

function help () {
  console.log('Usage:')
  console.log(`${process.argv[0]} ${process.argv[1]} <path to payload.file.json>`)
  process.exit(0)
}
