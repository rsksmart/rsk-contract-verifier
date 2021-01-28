#!/usr/bin/env node
import { verify } from './lib'
import { parseArg, getArgs, argKey, log } from '@rsksmart/rsk-js-cli'

const file = process.argv[2]

const opts = {
  OUT_FILE: 'save',
  AUTOFIX: 'fix',
  SHOW: 'show',
  SILENT: 'silent'
}

const args = getArgs(opts, process.argv.slice(3))
args.HELP = parseArg(process.argv, 'help')
if (args.HELP || !file) showHelp()

verify(file, args)
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    if (!args.SILENT) log.error(err)
    process.exit(9)
  })

function showHelp () {
  const parameters = Object.values(opts).map(key => argKey(key))
  console.log()
  console.log('Usage:')
  console.log()
  console.log(`${process.argv[0]} ${process.argv[1]} <path to payload.file.json> [ ${parameters.join(' ')} ]`)
  console.log()
  console.log(`--${opts.AUTOFIX} -> Automatically adds verifier suggestions to payload and check again,`)
  console.log('       if the verification succeeds, it saves the modified payload to the file.')
  console.log()
  console.log(`--${opts.OUT_FILE} | --${opts.OUT_FILE}=fileName -> Saves result to file.`)
  console.log()
  console.log(`--${opts.SHOW} -> Show full result.`)
  console.log()
  console.log(`--${opts.SILENT} -> Suppress output.`)
  process.exit(0)
}
