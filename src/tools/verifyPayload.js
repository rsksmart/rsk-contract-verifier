import { verifyParams } from '../lib/verifyFromPayload'
import { showResult, isVerified, label, parseArg, readFile, writeFile, saveOutput, getArgs } from './lib'

const file = process.argv[2]

const opts = {
  OUT: 'save',
  HELP: 'help',
  AUTOFIX: 'fix'
}

const args = getArgs(opts, process.argv.slice(3))
args.HELP = parseArg(opts, process.argv)

if (args.HELP || !file) showHelp()

verify(file).then(() => process.exit(0))

async function verify (file) {
  try {
    let payload = await readFile(file)
    payload = JSON.parse(payload.toString())
    let verification = await verifyParams(payload)

    // Auto add constructor arguments
    if (!isVerified(verification) && verification.tryThis && args.AUTOFIX) {
      const { encodedConstructorArguments, constructorArguments } = verification.tryThis
      if (constructorArguments) {
        payload.constructorArguments = constructorArguments
      } else if (encodedConstructorArguments) {
        payload.encodedConstructorArguments = encodedConstructorArguments
      }
      verification = await verifyParams(payload)
      if (isVerified(verification)) {
        await writeFile(file, JSON.stringify(payload, null, 4))
        console.log(label(`The arguments were saved in ${file}`))
      }
    }
    if (args.OUT) {
      const outFile = await saveOutput(args.OUT, verification, file)
      console.log(label(`The result was saved in ${outFile}`))
      showResult(verification)
    } else {
      showResult(verification, true)
    }
  } catch (err) {
    console.error(err)
    process.exit(9)
  }
}

function showHelp () {
  console.log()
  console.log('Usage:')
  console.log()
  console.log(`${process.argv[0]} ${process.argv[1]} <path to payload.file.json> [--${opts.AUTOFIX} ---${opts.OUT} ]`)
  console.log()
  console.log(`--${opts.AUTOFIX} -> Automatically adds verifier suggestions to payload and check again,`)
  console.log('       if the verification succeeds, it saves the modified payload to the file.')
  console.log()
  console.log(`--${opts.OUT} | --${opts.OUT}=fileName -> Saves output to file.`)
  console.log()
  process.exit(0)
}
