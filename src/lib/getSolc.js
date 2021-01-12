import axios from 'axios'
import requireFromString from 'require-from-string'
import solc from 'solc'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { getHash, isReleaseVersion } from './utils'
import defaultConfig from './defaultConfig'
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const getStat = promisify(fs.stat)

export function GetSolc ({ solcCache, solcUrl, listUrl }) {
  solcUrl = solcUrl || 'https://binaries.soliditylang.org/bin'
  listUrl = listUrl || `${solcUrl}/list.json`

  const DIR = solcCache || defaultConfig.solcCache
  let versionsList

  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR)
  }

  const getVersionUrl = fileName => `${solcUrl}/${fileName}`

  const isValidHash = (code, hash) => getHash(code, 'utf8') === hash

  const getList = async () => {
    if (!versionsList) await setVersionsLists()
    else setVersionsLists()
    return versionsList
  }

  const setVersionsLists = async () => {
    let data = await download(listUrl)
    if (data) versionsList = data
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

  const getFilePath = fileName => path.join(DIR, fileName)

  const load = async (version) => {
    try {
      const versionData = await getVersionData(version)
      if (!versionData) throw new Error(`Unkown version ${version}`)
      const { keccak256, path: fileName } = versionData
      let code = await loadFromDisk(fileName)
      if (!code || !isValidHash(code, keccak256)) code = await downloadAndSave(fileName, keccak256)
      const snapshot = requireFromString(code, fileName)
      return solc.setupMethods(snapshot)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  const downloadAndSave = async (fileName, hash) => {
    try {
      const code = await downloadVersion(fileName, hash)
      await writeFile(getFilePath(fileName), code)
      return code
    } catch (err) {
      return Promise.reject(err)
    }
  }

  const isCached = async fileName => {
    try {
      const stat = await getStat(getFilePath(fileName))
      return stat.isFile()
    } catch (err) {
      return Promise.resolve(false)
    }
  }

  const loadFromDisk = async (fileName) => {
    try {
      const filePath = getFilePath(fileName)
      const cached = await isCached(fileName)
      if (!cached) return
      const code = await readFile(filePath)
      return code.toString()
    } catch (err) {
      if (err.code === 'ENOENT') return false
      return Promise.reject(err)
    }
  }
  const downloadVersion = async (fileName, versionHash) => {
    try {
      const url = getVersionUrl(fileName)
      const code = await download(url)
      if (!isValidHash(code, versionHash)) throw new Error(`Invalid hash ${fileName}`)
      return code
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

  return Object.freeze({ load, loadFromDisk, downloadVersion, getList, getVersionData, isCached, downloadAndSave })
}

export default GetSolc
