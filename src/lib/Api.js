
import { ContractVerifier, EVENTS } from './ContractVerifier'
import GetSolc from './getSolc'

export function Api (config, { log }) {
  log = log || console
  const verifier = ContractVerifier({ log } = {})
  const getSolc = GetSolc(config)
  const requests = new Map()

  const resolveId = ({ id, error, data }) => {
    const socket = requests.get(id)
    requests.delete(id)
    apiResponse(socket, 'verify', { error, data })
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
        const id = verifier.verify(params)
        if (!id) return apiResponse(socket, action, { error: 'Uknonwn error' })
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

function apiResponse (socket, action, { error, data }) {
  const event = 'data'
  socket.emit(event, { action, error, data })
}

export default Api
