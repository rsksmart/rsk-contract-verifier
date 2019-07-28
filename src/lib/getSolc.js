import axios from 'axios'
import requireFromString from 'require-from-string'
import solc from 'solc'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { getHash, isReleaseVersion } from './utils'
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const getStat = promisify(fs.stat)

function GetSolc ({ solcCache, solcUrl, listUrl }) {
  solcUrl = solcUrl || 'https://ethereum.github.io/solc-bin/bin'
  listUrl = listUrl || `${solcUrl}/list.json`

  const DIR = solcCache || '/tmp/solc'
  let versionsList

  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR)
  }

  const getVersionUrl = fileName => `${solcUrl}/${fileName}`

  const getList = async () => {
    if (!versionsList) {
      let data = await download(listUrl)
      versionsList = data
    }
    return versionsList
  }

  const getVersionData = async version => {
    try {
      const list = await getList()
      const { builds, releases, latestRelease } = list
      if (version === 'latest') version = latestRelease
      if (isReleaseVersion(version)) {
        const fileName = releases[version]
        return builds.find(item => item.path === fileName)
      }
      return builds.find(item => item.longVersion === version)
    } catch (err) {
      return Promise.reject(err)
    }
  }
  const load = async (version) => {
    try {
      const versionData = await getVersionData(version)
      if (!versionData) throw new Error(`Unkown version ${version}`)
      const { keccak256, path: fileName } = versionData
      const filePath = path.join(DIR, fileName)
      let code = await loadFromDisk(filePath)
      if (!code) {
        code = await downloadVersion(fileName, keccak256)
        await writeFile(filePath, code)
      }
      const snapshot = requireFromString(code, fileName)
      return solc.setupMethods(snapshot)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  const loadFromDisk = async (filePath) => {
    try {
      const stat = await getStat(filePath)
      if (stat.isFile()) {
        const code = await readFile(filePath)
        return code.toString()
      }
    } catch (err) {
      if (err.code === 'ENOENT') return false
      return Promise.reject(err)
    }
  }
  const downloadVersion = async (fileName, versionHash) => {
    try {
      const url = getVersionUrl(fileName)
      const code = await download(url)
      const hash = getHash(code, 'utf8')
      if (hash === versionHash) return code
    } catch (err) {
      return Promise.reject(err)
    }
  }
  const download = async url => {
    try {
      const res = await axios.get(url)
      if (res.status === 200) {
        const { data } = res
        return data
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  return Object.freeze({ load, loadFromDisk, downloadVersion, getList, getVersionData })
}

export default GetSolc
