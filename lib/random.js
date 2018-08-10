const sodium = require('sodium-native')

/**
 */
exports.bytes = function randomBytes (count) {
  const output = Buffer.alloc(count)
  sodium.randombytes_buf(output)
  return output
}
