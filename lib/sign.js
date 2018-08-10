const sodium = require('sodium-native')
const { SecBuf } = require('./secbuf')

const PUBLICKEYBYTES = sodium.crypto_sign_PUBLICKEYBYTES
const SECRETKEYBYTES = sodium.crypto_sign_SECRETKEYBYTES
const SIGNBYTES = sodium.crypto_sign_BYTES

/**
 */
exports.seedKeypair = function signSeedKeypair (seed) {
  if (!(seed instanceof SecBuf)) {
    throw new Error('seed must be a SecBuf')
  }

  const publicKey = Buffer.alloc(PUBLICKEYBYTES)
  const secretKey = new SecBuf(SECRETKEYBYTES)

  seed.readable(_seed => {
    secretKey.writable(_secretKey => {
      sodium.crypto_sign_seed_keypair(publicKey, _secretKey, _seed)
    })
  })

  return {
    publicKey,
    secretKey
  }
}

/**
 */
exports.sign = function signSign (message, secretKey) {
  if (!(message instanceof Buffer)) {
    throw new Error('message must be a Buffer')
  }
  if (!(secretKey instanceof SecBuf)) {
    throw new Error('secretKey must be a SecBuf')
  }

  const out = Buffer.alloc(SIGNBYTES)

  secretKey.readable(_secretKey => {
    sodium.crypto_sign_detached(out, message, _secretKey)
  })

  return out
}

/**
 */
exports.verify = function signVerify (signature, message, publicKey) {
  if (!(signature instanceof Buffer)) {
    throw new Error('signature must be a Buffer')
  }
  if (!(message instanceof Buffer)) {
    throw new Error('message must be a Buffer')
  }
  if (!(publicKey instanceof Buffer)) {
    throw new Error('publicKey must be a Buffer')
  }

  return sodium.crypto_sign_verify_detached(signature, message, publicKey)
}
