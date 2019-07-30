import IO from 'socket.io'
import Logger from './lib/Logger'
import config from './lib/config'
import * as pkg from '../package.json'
import http from 'http'
import Api from './lib/Api'

const log = Logger(pkg.name, config.log)
const env = process.env['NODE_ENV']
if (!env) process.env['NODE_ENV'] = 'production'
const port = process.env['PORT'] || config.port
const address = process.env['ADDRESS'] || config.address
const app = http.createServer((req, res) => res.end())
const io = new IO(app)
const api = Api(config, { log })

io.on('connection', socket => {
  socket.on('message', () => { })
  socket.on('disconnect', () => { })
  socket.on('error', err => {
    log.debug('Socket Error: ' + err)
  })

  socket.on('data', payload => {
    try {
      api.run(payload, socket)
    } catch (err) {
      log.debug(`Action: ${payload.action}, ERROR: ${err}`)
    }
  })
})

app.listen(port, address, () => {
  log.info(`listening on ${address}:${port}`)
})
