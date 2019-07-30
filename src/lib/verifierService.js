import Verifier from './verifier'
import config from './config'

const verifier = Verifier(config)

process.on('message', async (payload) => {
  const { id, params } = payload
  try {
    const result = await verifier.verify(params)
    process.send({ result, id })
  } catch (err) {
    const error = `${err}`
    process.send({ id, error })
  }
})
