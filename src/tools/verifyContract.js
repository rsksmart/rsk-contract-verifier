import IO from 'socket.io-client'
import path from 'path'
import fs from 'fs'
import util from 'util'
import { showResult } from './lib'

const readFile = util.promisify(fs.readFile)
const url = process.env.url || 'http://localhost:3008'
const file = process.argv[2]
if (!url || !file) help()
const socket = IO.connect(url, { reconnect: true })
console.log(`Waiting for WS on ${url}`)
let payload

socket.on('connect', async data => {
  console.log('Connected! ✌')
  console.log(`sending payload`)
  payload = await createPayload()
  socket.emit('data', payload)
})

socket.on('disconnect', socket => {
  console.log('Disconnected ☹')
})

socket.on('data', async res => {
  let { error, data } = res
  if (error) throw new Error(error)
  console.log()
  console.log()
  showResult(data.result)
})

async function createPayload () {
  try {
    const buffer = await readFile(path.resolve(__dirname, file))
    const action = 'verify'
    const params = JSON.parse(buffer.toString())
    return { action, params }
  } catch (err) {
    console.log(`Error ${err}`)
    process.exit()
  }
}

function help () {
  console.log('Usage:')
  console.log(`1 - Set url of contract-verifier-api as an enviroment variable`)
  console.log(`    e.g. export url='http://localhost:3008'`)
  console.log(`2 - ${process.argv[0]} ${process.argv[1]} <path to payload.file.json>`)
  process.exit(0)
}
