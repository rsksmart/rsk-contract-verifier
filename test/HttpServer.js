import http from 'http'
import URL from 'url'

export const parseUrl = url => {
  if (!url) throw new Error('Invalid url')
  url = (typeof url === 'string') ? URL.parse(url) : url
  return url
}

export const createServer = (url, requestHandler) => {
  try {
    url = parseUrl(url)
    if (typeof requestHandler !== 'function') throw new Error('Invalid requestHandler')
    const protocol = url.protocol.replace(':', '')
    if (!protocol) throw new Error('Missing url protocol')
    const server = http.createServer(requestHandler)
    const listen = () => server.listen(url.port)
    const close = () => server.close()
    return Object.freeze({ server, listen, close })
  } catch (err) {
    throw err
  }
}
