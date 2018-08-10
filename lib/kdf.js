const sodium = require('sodium-native')
const { SecBuf } = require('./secbuf')

const CONTEXTBYTES = sodium.crypto_kdf_CONTEXTBYTES

/**
 */
exports.derive = function kdfDerive (index, context, parent) {
  if (typeof index !== 'number' || parseInt(index) !== index) {
    throw new Error('index must be an integer')
  }
  if (!(context instanceof Buffer) || context.byteLength !== CONTEXTBYTES) {
    throw new Error('context must be a Buffer of length ' + CONTEXTBYTES)
  }
  if (!(parent instanceof SecBuf)) {
    throw new Error('parent must be a SecBuf')
  }
  const out = new SecBuf(32)
  out.writable(_out => {
    parent.readable(_parent => {
      sodium.crypto_kdf_derive_from_key(_out, index, context, _parent)
    })
  })

  return out
}
