export function showResult (result) {
  try {
    if (!result || typeof result !== 'object') throw new Error('Empty result')
    let { errors, warnings } = result
    let { bytecodeHash, resultBytecodeHash } = result
    console.log(JSON.stringify(result, null, 2))
    if ((bytecodeHash && resultBytecodeHash) && (bytecodeHash === resultBytecodeHash)) {
      console.log()
      console.log()
      let ww = (warnings) ? '(with warnings)' : ''
      console.log(label(` The source code was verified! ${ww}`))
      console.log()
      console.log(JSON.stringify({ bytecodeHash, resultBytecodeHash }, null, 2))
    } else {
      console.log('Verification failed')
      if (result.tryThis) {
        console.log()
        console.log('Please try again using some of these parameters:')
        console.log(JSON.stringify(result.tryThis, null, 2))
      }
    }
    if (errors) {
      console.error(label('Errors'))
      console.error(JSON.stringify(errors, null, 2))
    }
    if (warnings) {
      console.warn(label('Warnings'))
      console.error(JSON.stringify(warnings, null, 2))
    }
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(9)
  }
}

function label (txt) {
  return `------------- ${txt} --------------`
}
