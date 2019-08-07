import { verifyParams } from './verifyFromPayload'

process.on('message', async (payload) => {
  const { id, params } = payload
  try {
    const result = await verifyParams(params)
    process.send({ result, id })
  } catch (err) {
    const error = `${err}`
    process.send({ id, error })
  }
})
