const sodium = require('sodium-native')
const random = require('./random')
const { SecBuf } = require('./secbuf')

exports.OPSLIMIT_INTERACTIVE =
  sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE
exports.MEMLIMIT_INTERACTIVE =
  sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
exports.OPSLIMIT_MODERATE =
  sodium.crypto_pwhash_OPSLIMIT_MODERATE
exports.MEMLIMIT_MODERATE =
  sodium.crypto_pwhash_MEMLIMIT_MODERATE
const OPSLIMIT_SENSITIVE = exports.OPSLIMIT_SENSITIVE =
  sodium.crypto_pwhash_OPSLIMIT_SENSITIVE
const MEMLIMIT_SENSITIVE = exports.MEMLIMIT_SENSITIVE =
  sodium.crypto_pwhash_MEMLIMIT_SENSITIVE

exports.ALG_ARGON2I13 =
  sodium.crypto_pwhash_ALG_ARGON2I13
const ALG_ARGON2ID13 = exports.ALG_ARGON2ID13 =
  sodium.crypto_pwhash_ALG_ARGON2ID13

const HASHBYTES = 32
const SALTBYTES = sodium.crypto_pwhash_SALTBYTES

function _fixOpts (opts) {
  opts || (opts = {})
  opts.opslimit || (opts.opslimit = OPSLIMIT_SENSITIVE)
  opts.memlimit || (opts.memlimit = MEMLIMIT_SENSITIVE)
  opts.algorithm || (opts.algorithm = ALG_ARGON2ID13)
  return opts
}

/**
 */
exports.hash = function pwhashStr (password, opts) {
  if (!(password instanceof SecBuf)) {
    throw new Error('password must be a SecBuf')
  }
  opts = _fixOpts(opts)

  if (!opts.salt) {
    opts.salt = random.bytes(SALTBYTES)
  }

  const hash = new SecBuf(HASHBYTES)

  return new Promise((resolve, reject) => {
    const finalize = () => {
      sodium.sodium_mprotect_noaccess(password._)
      sodium.sodium_mprotect_noaccess(hash._)
    }
    try {
      sodium.sodium_mprotect_readonly(password._)
      sodium.sodium_mprotect_readwrite(hash._)
      sodium.crypto_pwhash_async(
        hash._, password._, opts.salt,
        opts.opslimit, opts.memlimit, opts.algorithm,
        (err) => {
          try {
            finalize()
            if (err) return reject(err)
            resolve({
              salt: opts.salt,
              hash
            })
          } catch (e) {
            reject(e)
          }
        })
    } catch (e) {
      reject(e)
    }
  })
}
