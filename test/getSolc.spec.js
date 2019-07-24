import { expect } from 'chai'
import GetSolc from '../src/lib/getSolc'
import { getHash } from '../src/lib/utils'

const binPath = '/tmp'
let getSolc = GetSolc({ binPath })

const test = JSON.parse(`{
  "path": "soljson-v0.5.8+commit.23d335f2.js",
  "version": "0.5.8",
  "build": "commit.23d335f2",
  "longVersion": "0.5.8+commit.23d335f2",
  "keccak256": "0x7bdfc3e09790d5b1f488b10a8c0da4f85a8a64482c2be5566969feafdd7deb9d",
  "urls": [
    "bzzr://8923240b6d3f6e2f38ced6d5f8bfeb1b8a64ee49cdd358ea5c582dde194a699a"
  ]
}`)

describe(`# getSolc`, function () {
  const { longVersion: version, keccak256: codeHash, path: fileName } = test

  describe(`getList`, function () {
    it(`should download the versions list`, async () => {
      const list = await getSolc.getList()
      expect(list).to.be.an('object')
      expect(list).has.ownProperty('builds')
    })
  })

  describe(`getVersion`, function () {
    it(`should return the version data`, async () => {
      const data = await getSolc.getVersionData(version)
      expect(data).to.be.deep.equal(test)
    })
  })

  describe(`downloadVersion`, function () {
    this.timeout(90000)
    it(`should download solcjs: ${version}`, async () => {
      const code = await getSolc.downloadVersion(fileName, codeHash)
      expect(code).to.be.a('string')
      expect(getHash(code, 'utf8')).to.be.equal(codeHash)
    })
  })

  describe('load', function () {
    it(`should load solc snapshot`, async () => {
      const snapshot = await getSolc.load(version)
      expect(snapshot).to.be.an('object')
      expect(snapshot).has.ownProperty('compile')
      expect(snapshot.compile).to.be.a('function')
    })
  })
})
