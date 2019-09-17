
import { ContractVerifier, EVENTS } from './ContractVerifier'
import GetSolc from './getSolc'

export function Api (config, { log }) {
  log = log || console
  const { timeout } = config
  const verifier = ContractVerifier({ log, timeout })
  const getSolc = GetSolc(config)
  const requests = new Map()

  const resolveId = ({ id, error, data, request }) => {
    const socket = requests.get(id)
    requests.delete(id)
    apiResponse(socket, 'verify', { error, data, request })
  }

  verifier.events.on(EVENTS.VERIFICATION, result => {
    resolveId(result)
  })

  verifier.events.on(EVENTS.ERROR, result => {
    resolveId(result)
  })

  const run = async (payload, socket) => {
    const { action, params } = payload
    switch (action) {
      case 'verify':
        const id = await verifier.verify(params)
        if (!id) return apiResponse(socket, action, { error: 'Unknown error' })
        requests.set(id, socket)
        break

      case 'versions':
        const data = await getSolc.getList()
        apiResponse(socket, action, { data })
        break
    }
  }
  return Object.freeze({ run })
}

function apiResponse (socket, action, { error, data, request }) {
  socket.emit('data', { action, error, data, request })
}

export default Api
