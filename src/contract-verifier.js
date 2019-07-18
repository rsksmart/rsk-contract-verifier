import express from 'express'
import bodyParser from 'body-parser'
import Logger from './lib/Logger'
import config from './lib/config'
import Verifier from './lib/verifier'
import * as pkg from '../package.json'

const log = Logger(pkg.name, config.log)
const app = express()
const env = process.env['NODE_ENV']
if (!env) process.env['NODE_ENV'] = 'production'
const port = process.env['PORT'] || config.port
const address = process.env['ADDRESS'] || config.address
const verifier = Verifier({ binPath: '/tmp' })

app.set('etag', false)
app.set('x-powered-by', false)

app.use(bodyParser.json())

app.post('/verify', async (req, res, next) => {
  const { bytecode, source, params } = req.body
  if (!bytecode || !source || !params) next(`invalid params`)
  const verification = await verifier.verify(bytecode, source, params)
  res.json(verification)
})

app.use((err, req, res, next) => {
  const status = err.status || 400
  res.status(status).send()
})

app.listen(port, address, () => {
  log.info(`listening on ${address}:${port}`)
})
