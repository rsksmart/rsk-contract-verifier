import { EventEmitter } from 'events'
import { suicidalForkedService } from './Services'
import Queue from './Queue'

export const EVENTS = {
  VERIFICATION: 'verification',
  ERROR: 'error'
}

const newVerifierService = (options) => suicidalForkedService('verifierService.js', options)

export function ContractVerifier ({ timeout, log }) {
  timeout = timeout || 60000
  log = log || console
  const queue = Queue()
  const verifying = new Map()
  const events = new EventEmitter()

  const verify = payload => {
    const id = queue.add(payload)
    processNext()
    return id
  }
  const resolve = (id, error, data) => {
    const request = verifying.get(id)
    verifying.delete(id)
    log.debug(`Verification done ${id}`)
    log.trace(JSON.stringify(data))
    events.emit(EVENTS.VERIFICATION, { id, data, error, request })
    processNext()
  }

  const processNext = () => {
    if (verifying.size > 0) return
    const task = queue.next()
    if (!task) return
    const [id, payload] = task
    performVerification(id, payload)
  }

  const performVerification = async (id, params) => {
    try {
      verifying.set(id, params)
      const payload = { id, params }
      const verification = await newVerifierService({ payload, timeout })
      if (!verification) throw new Error('Verifier returns an empty result')
      resolve(id, null, verification)
    } catch (err) {
      log.debug(err)
      const error = `${err}`
      resolve(id, error)
    }
  }
  return Object.freeze({ verify, events })
}

export default ContractVerifier
