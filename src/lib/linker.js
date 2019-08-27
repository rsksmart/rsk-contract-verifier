import linker from 'solc/linker'

const link = linker.linkBytecode
const find = linker.findLinkReferences

export default { link, find }
