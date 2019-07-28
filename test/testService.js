
process.on('message', msg => {
  const { FAIL } = msg
  if (FAIL) {
    throw new Error(FAIL)
  }
  process.send(msg)
})
