
import { isVerified } from '../lib/verifier'
import { verifyParams } from '../lib/verifyFromPayload'
import { tag, log } from '@rsksmart/rsk-js-cli'
import path from 'path'
import fs from 'fs'
import util from 'util'
export const writeFile = util.promisify(fs.writeFile)

export const readFile = file => util.promisify(fs.readFile)(path.resolve(file))

export const readDir = util.promisify(fs.readdir)

export function showResult (result, full) {
  try {
    if (!result || typeof result !== 'object') throw new Error('Empty result')
    let { errors, warnings } = result
    let { bytecodeHash, resultBytecodeHash } = result
    if (full) console.log(JSON.stringify(result, null, 2))
    if (isVerified(result)) {
      console.log()
      console.log()
      const ww = (warnings) ? '(with warnings)' : ''
      const msg = tag(` The source code was verified! ${ww}`)
      if (ww) log.warn(msg)
      else log.ok(msg)
      console.log()
      log.label(JSON.stringify({ bytecodeHash, resultBytecodeHash }, null, 2))
    } else {
      // log.error(tag('Verification failed', '='))
      if (result.tryThis) {
        console.log()
        log.info('Please try again using some of these parameters:')
        log.info(JSON.stringify(result.tryThis, null, 2))
      }
    }
    if (errors) {
      console.error(tag('Errors'))
      console.error(JSON.stringify(errors, null, 2))
    }
    if (warnings) {
      log.warn(tag('Warnings'))
      log.warn(JSON.stringify(warnings, null, 2))
    }
  } catch (err) {
    throw (err)
  }
}

function addExtension (file, extension) {
  file = file.split('.')
  if (file[file.length - 1] === extension) file.pop()
  file = file.join('')
  file = `${file}.${extension}`
  return file
}

export async function saveOutput (file, content) {
  try {
    file = (typeof file === 'string') ? file : `${Date.now()}--verifier-out`
    file = addExtension(file, 'json')
    await writeFile(file, JSON.stringify(content, null, 4))
    return file
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function verify (file, options) {
  try {
    let payload = await readFile(file)
    payload = JSON.parse(payload.toString())
    let verification = await verifyParams(payload)

    // Auto add constructor arguments
    if (!isVerified(verification) && verification.tryThis && options.AUTOFIX) {
      const { encodedConstructorArguments, constructorArguments } = verification.tryThis
      if (constructorArguments) {
        payload.constructorArguments = constructorArguments
      } else if (encodedConstructorArguments) {
        payload.encodedConstructorArguments = encodedConstructorArguments
      }
      verification = await verifyParams(payload)
      if (isVerified(verification)) {
        await writeFile(file, JSON.stringify(payload, null, 4))
        log.info(tag(`The arguments were saved in ${file}`))
      }
    }
    if (options.OUT_FILE) {
      const outFile = await saveOutput(options.OUT_FILE, verification, file)
      log.info(tag(`The result was saved in ${outFile}`))
    }
    if (!options.SILENT) showResult(verification, options.SHOW)
    if (!isVerified(verification)) throw new Error('Verification failed')
  } catch (err) {
    return Promise.reject(err)
  }
}
