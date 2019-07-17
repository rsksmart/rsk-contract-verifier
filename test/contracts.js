import fs from 'fs'
import path from 'path'
import glob from 'glob'

export function readContracts ({ folder, ext }, contentCb) {
  const contracts = {}
  if (typeof contentCb !== 'function') {
    contentCb = (content, options) => {
      content = content.toString()
      return Object.assign({ content }, options)
    }
  }

  const processFile = fileName => {
    let file = fileName.split('/').pop().split('.')
    if (file[1] === ext) {
      const sourcePath = path.resolve(__dirname, `${folder}/${fileName}`)
      const content = fs.readFileSync(sourcePath)
      if (content) {
        const name = file[0]
        contracts[name] = contentCb(content, { path: sourcePath, name })
      }
    }
  }

  const loadPaths = paths => {
    for (let p of paths) {
      processFile(p)
    }
    return contracts
  }

  const load = () => {
    fs.readdirSync(path.resolve(__dirname, folder)).forEach(fileName => {
      processFile(fileName)
    })
    return contracts
  }
  return Object.freeze({ load, loadPaths })
}

const jsonParse = content => JSON.parse(content.toString())

export function truffleContracts () {
  const folder = './truffle/build/contracts'
  const ext = 'json'
  return readContracts({ folder, ext }, jsonParse).load()
}

export function solidityContracts () {
  const folder = './truffle/contracts'
  const ext = 'sol'
  return readContracts({ folder, ext }).load()
}

export function openZeppelinContracts () {
  const folder = './node_modules/openzeppelin-solidity/contracts'
  const files = glob.sync('**/*.sol', { cwd: folder })
  return readContracts({ folder: `.${folder}`, ext: 'sol' }).loadPaths(files)
}

export function deployResults () {
  const folder = './bytecodes'
  return readContracts({ folder, ext: 'json' }, jsonParse).load()
}

export default readContracts
