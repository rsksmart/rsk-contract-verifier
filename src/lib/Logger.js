import bunyan from 'bunyan'

export const Logger = (name, { file, level } = {}) => {
  name = name || 'log'
  const log = bunyan.createLogger({
    name,
    level: 'trace'
  })

  if (file) {
    log.addStream({
      path: file,
      level: level || 'info'
    })
  }

  log.on('error', (err, stream) => {
    console.error('Log error ', err)
  })
  return log
}

export default Logger
