import { fork } from 'child_process'
import path from 'path'
import fs from 'fs'

export function forkedService (script, options = {}) {
  const file = path.resolve(__dirname, script)
  if (!fs.existsSync(file)) throw new Error(`Unknown file:${file}`)
  return fork(file, options)
}

export function suicidalService (service, { payload, callBack, timeout } = {}) {
  if (timeout === undefined) timeout = 5000
  if (payload) service.send(payload)
  if (callBack) callBack(service)
  let killer = null

  return new Promise((resolve, reject) => {
    const sayGoodBye = (error, result) => {
      error = error || result.error
      service.kill('SIGKILL')
      clearTimeout(killer)
      if (error) return reject(new Error(error))
      return resolve(result)
    }
    service.once('message', msg => {
      sayGoodBye(null, msg)
    })
    service.once('exit', (code, signal) => {
      if (code) {
        sayGoodBye(`Code: ${code}, signal:${signal}`)
      }
    })
    service.once('error', err => {
      sayGoodBye(err)
    })
    if (timeout) {
      killer = setTimeout(() => {
        sayGoodBye(`Timeout exceed`)
      }, timeout)
    }
  })
}

export function suicidalForkedService (script, options) {
  const service = forkedService(script)
  return suicidalService(service, options)
}
