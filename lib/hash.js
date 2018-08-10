const sodium = require('sodium-native')

/**
 */
exports.toInt = function hashToInt (input) {
  if (!(input instanceof Buffer)) {
    throw new Error('input must be a Buffer')
  }
  if (parseInt(input.byteLength / 4) * 4 !== input.byteLength) {
    throw new Error('input buffer length must be divisible by 4')
  }
  let out = input.readInt32LE(0)
  for (let i = 4; i < input.byteLength; i += 4) {
    out = out ^ input.readInt32LE(i)
  }
  return out
}

/**
 */
exports.sha256 = function hashSha256 (input) {
  if (!(input instanceof Buffer)) {
    throw new Error('input must be a Buffer')
  }
  const output = Buffer.alloc(sodium.crypto_hash_sha256_BYTES)
  sodium.crypto_hash_sha256(output, input)
  return output
}

/**
 */
exports.sha512 = function hashSha512 (input) {
  if (!(input instanceof Buffer)) {
    throw new Error('input must be a Buffer')
  }
  const output = Buffer.alloc(sodium.crypto_hash_sha512_BYTES)
  sodium.crypto_hash_sha512(output, input)
  return output
}
