
export function truffleParser (data) {
  const { source, bytecode, contractName, sourcePath, deployedBytecode } = data
  // const metadata = parseMetadata(test.metadata)
  const metadata = JSON.parse(data.metadata)
  const { compiler, settings } = metadata
  delete settings.compilationTarget
  const { version } = compiler
  const solFile = sourcePath
  let sources = {}
  sources[solFile] = { content: source }
  return { source, bytecode, contractName, sourcePath, deployedBytecode, version, solFile, metadata, settings, sources }
}
