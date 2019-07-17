import solc from 'solc'
import { toBuffer, toHexString } from './utils'

function Compiler ({ binPath } = {}) {
  const createInput = ({ sources, settings } = {}) => {
    settings = settings || {}
    settings.outputSelection = settings.outputSelection || {
      '*': {
        '*': ['*']
      }
    }
    return {
      language: 'Solidity',
      sources,
      settings
    }
  }

  const getVersionString = version => {
    if (typeof version !== 'string') throw new Error(`Invalid version ${version}`)
    if (version[0] !== 'v') version = `v${version}`
    return version
  }

  const getSnapshot = async version => {
    try {
      if (version !== 'latest') version = getVersionString(version)
      let snapshot = await loadVersion(version)
      return snapshot
    } catch (err) {
      return Promise.reject(err)
    }
  }
  const loadVersion = version => {
    return new Promise((resolve, reject) => {
      solc.loadRemoteVersion(version, (err, snapshot) => {
        if (err) return reject(err)
        if (snapshot) return resolve(snapshot)
        return reject(new Error(`Can't load solidity snapshot, version: ${version}`))
      })
    })
  }

  const compile = async (input, { version, resolveImports } = {}) => {
    try {
      if (typeof input !== 'string') {
        input = JSON.stringify(input)
      }
      const snapshot = await getSnapshot(version || 'latest')
      if (!snapshot.compile) throw new Error(`Can't load snapshot ${version}`)
      const res = snapshot.compile(input, resolveImports)
      if (!res) throw new Error('Empty result')
      return JSON.parse(res)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  const extractMetadataFromBytecode = (bytecodeStringOrBuffer) => {
    const buffer = toBuffer(bytecodeStringOrBuffer)
    const metaDataStart = buffer.length - buffer.readUInt16BE(buffer.length - 2) - 2
    let metadata
    let bytecode = toHexString(bytecodeStringOrBuffer)
    if (metaDataStart) {
      metadata = buffer.slice(metaDataStart, buffer.length).toString('hex')
      if (metadata.substr(0, 4) === 'a165') {
        bytecode = buffer.slice(0, metaDataStart).toString('hex')
      } else {
        metadata = undefined
      }
    }
    return { bytecode, metadata }
  }

  const getImport = (path, contracts) => {
    const parts = path.split('/')
    let file = parts.pop()
    file = file.split('.')
    if (file[1] === 'sol') {
      const contract = contracts[file[0]]
      const contents = contract.source || contract.content
      if (contents) return { contents }
    }
    return { error: 'unknown error' }
  }

  const getImports = imports => {
    if (!imports) return
    return (path) => {
      return getImport(path, imports)
    }
  }
  return Object.freeze({ compile, createInput, extractMetadataFromBytecode, getImports })
}

export default Compiler
