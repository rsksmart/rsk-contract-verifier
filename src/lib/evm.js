import VM from 'ethereumjs-vm'
import crypto from 'crypto'
import * as ethUtil from 'ethereumjs-util'
import { Transaction } from 'ethereumjs-tx'
// const abi = require('ethereumjs-abi')
import Account from 'ethereumjs-account'
import { add0x, bufferToHexString, toBuffer } from './utils'
import PStateManager from 'ethereumjs-vm/dist/state/promisified'

export function Evm () {
  const vm = new VM()
  const psm = new PStateManager(vm.stateManager)

  const privateToAddress = privateKey => ethUtil.privateToAddress(toBuffer(privateKey))

  const createAddress = (privateKey, asBuffer) => {
    const format = (asBuffer) ? (value) => value : bufferToHexString
    privateKey = privateKey || crypto.randomBytes(32)
    const pubKey = format(ethUtil.privateToPublic(privateKey))
    const address = format(privateToAddress(privateKey))
    let privKey = format(privateKey)
    return { pubKey, privKey, address }
  }

  const createAccount = async (address, { balance }) => {
    try {
      const account = new Account({ balance })
      await psm.putAccount(toBuffer(address), account)
      return account
    } catch (err) {
      return Promise.reject(err)
    }
  }

  const getAccount = async address => {
    const account = await psm.getAccount(toBuffer(address))
    return account
  }

  const getNonce = async address => {
    const account = await getAccount(address)
    return add0x(account.nonce.toString('hex'))
  }

  const makeTransaction = async (privateKey, { to, value, data, gas, gasPrice } = {}) => {
    privateKey = toBuffer(privateKey)
    gasPrice = gasPrice || 1
    gas = gas || 2000000
    value = value || 0
    data = data || null
    to = to || null
    const address = privateToAddress(privateKey)
    const nonce = await getNonce(address)
    const tx = new Transaction({ to, value, gas, gasPrice, data, nonce })
    tx.sign(privateKey)
    return tx
  }
  const runTx = async tx => {
    try {
      const res = await vm.runTx({ tx })
      return res
    } catch (err) {
      return Promise.reject(err)
    }
  }

  const deploy = async (deployBytecode, privateKey, txOptions) => {
    try {
      const txObj = Object.assign({}, txOptions)
      txObj.data = toBuffer(deployBytecode)
      const tx = await makeTransaction(privateKey, txObj)
      const res = await runTx(tx)
      if (res.vm.exception === 0) throw new Error(res.vm.exceptionError)
      return res
    } catch (err) {
      return Promise.reject(err)
    }
  }
  return Object.freeze({
    createAddress,
    createAccount,
    deploy,
    getNonce,
    makeTransaction,
    getAccount,
    runTx
  })
}

export default Evm
