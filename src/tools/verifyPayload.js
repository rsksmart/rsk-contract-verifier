import { verifyParams } from '../lib/verifyFromPayload'
import { showResult, isVerified } from './lib'
import path from 'path'
import fs from 'fs'
import util from 'util'
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const file = process.argv[2]
const autofix = process.argv[3] === '--fix'

if (!file) help()

verify(file).then(() => process.exit(0))

async function verify (file) {
  try {
    let payload = await readFile(path.resolve(file))
    payload = JSON.parse(payload.toString())
    let verification = await verifyParams(payload)

    // Auto add constructor arguments
    if (!isVerified(verification) && verification.tryThis && autofix) {
      const { encodedConstructorArguments, constructorArguments } = verification.tryThis
      if (constructorArguments) {
        payload.constructorArguments = constructorArguments
      } else if (encodedConstructorArguments) {
        payload.encodedConstructorArguments = encodedConstructorArguments
      }
      verification = await verifyParams(payload)
      if (isVerified(verification)) {
        await writeFile(file, JSON.stringify(payload, null, 4))
        console.log(`------------- The arguments were saved in ${file} -------------`)
      }
    }
    showResult(verification)
  } catch (err) {
    console.error(err)
    process.exit(9)
  }
}

function help () {
  console.log()
  console.log('Usage:')
  console.log()
  console.log(`${process.argv[0]} ${process.argv[1]} <path to payload.file.json> [--fix]`)
  console.log()
  console.log('--fix: Automatically adds verifier suggestions to payload and check again,')
  console.log('       if the verification succeeds, it saves the modified payload to the file.')
  console.log()
  process.exit(0)
}
