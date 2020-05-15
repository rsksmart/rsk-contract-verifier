export function showResult (result) {
  try {
    if (!result || typeof result !== 'object') throw new Error('Empty result')
    let { errors } = result
    let { bytecodeHash, resultBytecodeHash } = result
    console.log(JSON.stringify(result, null, 2))
    if (bytecodeHash && resultBytecodeHash && bytecodeHash === resultBytecodeHash) {
      console.log()
      console.log()
      console.log('-= [ The source code was verified! ] =-')
      console.log()
      console.log(JSON.stringify({ bytecodeHash, resultBytecodeHash }, null, 2))
    } else {
      console.log('Verification failed')
    }
    if (errors) {
      console.error('------ Errors -------')
      console.error(JSON.stringify(errors, null, 2))
    }
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(9)
  }
}
