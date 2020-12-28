import Verifier from './verifier'
import config from './config'

export const resolver = (imports) => (path) => {
  if (!imports) return
  const parts = path.split('/')
  let file = parts.pop()
  const result = imports.find(i => i.name === file)
  const contents = (result) ? result.contents : null
  return { contents }
}

export const verifyParams = (params, verifier) => {
  verifier = verifier || Verifier(config)
  return verifier.verify(params, { resolveImports: resolver(params.imports) })
}

export default verifyParams
