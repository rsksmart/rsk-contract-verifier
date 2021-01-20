
import path from 'path'
import fs from 'fs'
import util from 'util'
import { isHexString } from '@rsksmart/rsk-utils'
export const writeFile = util.promisify(fs.writeFile)

export function readFile (file) {
  return util.promisify(fs.readFile)(path.resolve(file))
}

export function isVerified ({ bytecodeHash, resultBytecodeHash }) {
  try {
    if (!isHexString(bytecodeHash) || !isHexString(resultBytecodeHash)) return false
    if ((bytecodeHash.lenght < 64 || resultBytecodeHash.lenght < 66)) return false
    return (bytecodeHash === resultBytecodeHash)
  } catch (error) {
    return false
  }
}

export function showResult (result, full) {
  try {
    if (!result || typeof result !== 'object') throw new Error('Empty result')
    let { errors, warnings } = result
    let { bytecodeHash, resultBytecodeHash } = result
    if (full) console.log(JSON.stringify(result, null, 2))
    if (isVerified(result)) {
      console.log()
      console.log()
      let ww = (warnings) ? '(with warnings)' : ''
      console.log(label(` The source code was verified! ${ww}`))
      console.log()
      console.log(JSON.stringify({ bytecodeHash, resultBytecodeHash }, null, 2))
    } else {
      console.log(label('Verification failed', '='))
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

export function label (txt, char = '-') {
  const l = char.repeat(13)
  return `${l} ${txt} ${l}`
}

export function parseArg (args, key) {
  if (!Array.isArray(args)) return
  if (!key) return
  key = `--${key}`
  let a = args.find(v => v.startsWith(key))
  if (a) {
    a = a.split('=').pop()
    return (a === key) || a
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

export function getArgs (options, userArgs) {
  const args = {}
  for (let o in options) {
    args[o] = parseArg(userArgs, o)
  }
  return args
}
