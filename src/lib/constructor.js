import { toBuffer, add0x, remove0x, isAddress } from '@rsksmart/rsk-utils'
import { rawEncode as encode, rawDecode as decode } from 'ethereumjs-abi'
import { isBN } from 'bn.js'

export const getConstructorAbi = abi => abi.filter(x => x.type === 'constructor')[0]

export const getTypesFromAbi = abiDef => abiDef.inputs.map(x => x.type)

export const getConstructorTypes = abi => getTypesFromAbi(getConstructorAbi([...abi]))

export const encodeConstructorArgs = (args, abi) => {
  const types = getConstructorTypes(abi)
  const encoded = encode(types, remove0x(args))
  return encoded.toString('hex')
}

export const normalizeOutput = out => {
  if (Array.isArray(out)) return out.map(normalizeOutput)
  if (isBN(out)) out = add0x(out.toString(16))
  if (isAddress(out)) out = add0x(out)
  return out
}

export const decodeConstructorArgs = (encoded, abi) => {
  const types = getConstructorTypes(abi)
  let decoded = decode(types, toBuffer(encoded))
  decoded = normalizeOutput(decoded)
  return decoded
}
