import Evm from '../src/lib/evm'
import Compiler from '../src/lib/compiler'
import { expect } from 'chai'
import { isValidAddress } from 'ethereumjs-util'
import { Transaction } from 'ethereumjs-tx'
import { remove0x, add0x } from '../src/lib/utils'
import { solidityContracts } from './contracts'

const contracts = solidityContracts()
const evm = Evm()
const compiler = Compiler()

describe(`# EVM`, function () {
  const address = evm.createAddress()
  const balance = '0xffffffffffffffff'
  const value = '0x16'
  const expectedNonce = '0x01'

  describe(`# createAddress`, function () {

    it(`should return an address`, () => {
      expect(address).has.ownProperty('privKey')
      expect(address).has.ownProperty('pubKey')
      expect(address).has.ownProperty('address')
      expect(isValidAddress(address.address)).to.be.equal(true)
      expect(address.privKey.lenght).to.be.equal()
      expect(address.pubKey.lenght).to.be.equal()
    })
  })
  describe(`# createAccount`, function () {
    it('should create an account', async () => {
      const account = await evm.createAccount(address.address, { balance })
      expect(account).has.ownProperty('nonce')
      expect(account).has.ownProperty('balance')
      expect(account.balance.toString('hex')).to.be.equal(remove0x(balance))
    })
  })

  describe(`# getAccount`, function () {
    it(`should return an account`, async () => {
      const account = await evm.getAccount(address.address)
      expect(account).has.ownProperty('nonce')
      expect(account).has.ownProperty('balance')
      expect(account.balance.toString('hex')).to.be.equal(remove0x(balance))
    })
  })

  describe(`# makeTransaction`, function () {
    it(`should return an eth-js-transaction`, async () => {
      const tx = await evm.makeTransaction(address.privKey, {})
      expect(tx instanceof Transaction).to.be.equal(true)
    })
  })

  describe(`# runTx`, function () {
    const address2 = evm.createAddress()
    const to = address2.address

    it(`should return tx result`, async () => {
      const tx = await evm.makeTransaction(address.privKey, { to, value })
      const res = await evm.runTx(tx)
      expect(res).has.ownProperty('gasUsed')
      expect(res).has.ownProperty('vm')
      expect(res).has.ownProperty('bloom')
    })

    it(`the balance of ${address2.address} should be ${value}`, async () => {
      const account = await evm.getAccount(address2.address)
      expect(account.balance.toString('hex')).to.be.equal(remove0x(value))
    })

    it(`the nonce of ${address.address} should be ${expectedNonce}`, async () => {
      const account = await evm.getAccount(address.address)
      const nonce = add0x(account.nonce.toString('hex'))
      expect(nonce).to.be.equal(expectedNonce)
    })
  })

  describe(`# getNonce`, function () {
    it(`should return nonce as hex string`, async () => {
      const nonce = await evm.getNonce(address.address)
      expect(nonce).to.be.equal(expectedNonce)
    })
  })

  describe(`# deploy`, function () {
    this.timeout(90000)
    let contractAddress
    const { content, name } = contracts.HelloWorld
    const sources = {}
    sources[name] = { content }
    const settings = {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
    const input = compiler.createInput({ sources, settings })

    it(`should deploy a contract`, async () => {
      const compiled = await compiler.compile(input)
      expect(compiled).has.ownProperty('contracts')
      expect(compiled).has.ownProperty('sources')
      const data = compiled.contracts.HelloWorld.helloWorld
      const deployBytecode = data.evm.bytecode.object
      const res = await evm.deploy(deployBytecode, address.privKey, { gas: 10000000000 })
      expect(res).has.ownProperty('createdAddress')
      expect(res.vm.exception).to.not.equal(0)
      contractAddress = add0x(res.createdAddress.toString('hex'))
      expect(isValidAddress(contractAddress)).to.be.equal(true)
    })
  })
})
