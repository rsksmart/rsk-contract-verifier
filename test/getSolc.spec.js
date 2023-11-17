import { expect } from 'chai'
import GetSolc from '../src/lib/getSolc'
import { getHash } from '../src/lib/utils'
import { createServer } from './HttpServer'

const solcCache = '/tmp'

const url = 'http://127.0.0.1:7077'
let response = 'firstList'
const server = createServer(url, (req, res) => {
  res.end(response)
}).listen()

let getSolc = GetSolc({ solcCache })
const test = JSON.parse(`{
  "path": "soljson-v0.5.8+commit.23d335f2.js",
  "version": "0.5.8",
  "build": "commit.23d335f2",
  "longVersion": "0.5.8+commit.23d335f2",
  "keccak256": "0x7bdfc3e09790d5b1f488b10a8c0da4f85a8a64482c2be5566969feafdd7deb9d",
  "sha256": "0xdda3f35c4bd4380ae66a3268df92c260d707cea256dfcafa265637b6d8bd63f5",
  "urls": [
    "bzzr://8923240b6d3f6e2f38ced6d5f8bfeb1b8a64ee49cdd358ea5c582dde194a699a",
    "dweb:/ipfs/QmdLsm73rn9KSHukKrZPbuzWGUmrwKugdpDExKSqowvHgz"
  ]
}`)

describe(`# getSolc`, function () {
  const { longVersion: version, keccak256: codeHash, path: fileName } = test

  describe(`getList`, function () {
    this.afterAll(() => server.close())
    const getSolc2 = GetSolc({ listUrl: url })
    it(`should download the versions list`, async () => {
      let list = await getSolc2.getList()
      expect(list).to.be.equal('firstList')
      response = 'secondList'
    })
    it(`the versions list should be cached`, async () => {
      let list = await getSolc2.getList()
      expect(response).to.be.equal('secondList')
      expect(list).to.be.equal('firstList')
    })

    it(`the versions list should be updated after each request`, async () => {
      let list = await getSolc2.getList()
      expect(list).to.be.equal('secondList')
    })
  })

  describe(`getList url`, function () {
    it(`should download the versions list from remote server`, async () => {
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
    this.timeout(60000)
    it(`should load solc snapshot`, async () => {
      const snapshot = await getSolc.load(version)
      expect(snapshot).to.be.an('object')
      expect(snapshot).has.ownProperty('compile')
      expect(snapshot.compile).to.be.a('function')
    })
  })
})
