import solc from 'solc'

function Compiler ({ binPath } = {}) {
  const createInput = ({ sources, settings } = {}) => {
    settings = settings || {}
    settings.outputSelection = settings.outputSelection || {
      '*': {
        '*': ['abi', 'evm.bytecode']
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
  return Object.freeze({
    compile,
    createInput,
    getImports
  })
}

export default Compiler
