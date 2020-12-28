import { toBuffer, add0x, remove0x, isAddress } from '@rsksmart/rsk-utils'
import { AbiCoder } from '@ethersproject/abi'
import { isBN } from 'bn.js'

const abiCoder = new AbiCoder(function (type, value) {
  if (type.match(/^u?int/) && !Array.isArray(value) && (value !== Object(value) || value.constructor.name !== 'BN' || isBN(value))) {
    return value.toString()
  }
  return value
})

const encode = (types, value) => remove0x(abiCoder.encode(types, value))
const decode = (types, value) => abiCoder.decode(types, value, true)

export const getConstructorAbi = abi => abi.filter(x => x.type === 'constructor')[0]

export const getTypesFromAbi = abiDef => abiDef.inputs.map(x => x.type)

export const getConstructorTypes = abi => getTypesFromAbi(getConstructorAbi([...abi]))

export const encodeConstructorArgs = (args, abi) => {
  const types = getConstructorTypes(abi)
  for (let p in types) {
    let type = types[p]
    let value = args[p]
    if (type.indexOf('bytes') > -1 && !value) value = '0x'
    args[p] = value
  }
  const encoded = encode(types, args)
  return encoded.toString('hex')
}

export const normalizeOutput = out => {
  if (Array.isArray(out)) return out.map(normalizeOutput)
  if (isBN(out)) out = add0x(out.toString(16))
  if (isAddress(out)) out = add0x(out.toLowerCase())
  return out
}

export const decodeConstructorArgs = (encoded, abi) => {
  const types = getConstructorTypes(abi)
  let decoded = decode(types, toBuffer(encoded))
  decoded = normalizeOutput(decoded)
  return decoded
}
