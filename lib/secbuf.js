const sodium = require('sodium-native')

const MAX_PROMPT = 256

/**
 * Wrap libsodium memory lock and protect functions.
 * Some nodejs buffer accessors may invalidate security.
 * @example
 * const sb = new mosodium.SecBuf(32)
 */
class SecBuf {
  /**
   * Fetch a buffer from stdin into a SecBuf.
   * @example
   * const passphrase = await mosodium.SecBuf.readPrompt('passphrase (no echo): ')
   *
   * @param {string} promptText - displayed to stderr before awaiting input
   * @return {SecBuf}
   */
  static readPrompt (promptText) {
    return new Promise((resolve, reject) => {
      try {
        const stdin = SecBuf._stdin
        const stderr = SecBuf._stderr
        if (!stdin.setRawMode || process.env.TERM === 'dumb') {
          throw new Error('no tty, cannot request password')
        }
        stderr.write(promptText)
        stdin.setEncoding('utf8')
        stdin.resume()
        stdin.setRawMode(true)
        const outbuf = new SecBuf(MAX_PROMPT)
        const finalize = () => {
          try {
            stdin.removeListener('data', fn)
            stdin.setRawMode(false)
            stdin.pause()
            stderr.write('\n')
            outbuf.free()
          } catch (e) {
            stderr.write(e.stack || e.toString())
            stderr.write('\n')
          }
        }
        let curIndex = 0
        const fn = (c) => {
          try {
            switch (c) {
              case '\u0004':
              case '\r':
              case '\n':
                const result = new SecBuf(curIndex)
                outbuf.readable(_outbuf => {
                  result.writable(_result => {
                    _outbuf.copy(_result, 0, 0, curIndex)
                  })
                })
                finalize()
                return resolve(result)
              case '\u0003':
                throw new Error('ctrl-c')
              default:
                if (c.charCodeAt(0) === 127) {
                  --curIndex
                } else {
                  if (curIndex >= MAX_PROMPT) {
                    throw new Error('exceeded max password len ' + MAX_PROMPT)
                  }
                  outbuf.writable((_outbuf) => {
                    _outbuf.writeUInt8(c.charCodeAt(0), curIndex++)
                  })
                }
                break
            }
          } catch (e) {
            finalize()
            reject(e)
          }
        }
        stdin.on('data', fn)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * create a new SecBuf with specified length
   * @param {number} len - the byteLength of the new SecBuf
   */
  constructor (len) {
    this._ = sodium.sodium_malloc(len)
    sodium.sodium_mlock(this._, len)
    sodium.sodium_mprotect_noaccess(this._)
  }

  /**
   * zero out the memory and release the memory protection / lock
   */
  free () {
    sodium.sodium_mprotect_readwrite(this._)
    sodium.sodium_memzero(this._)
    sodium.sodium_munlock(this._)
    this._ = null
  }

  /**
   * randomize the underlying buffer
   */
  randomize () {
    sodium.sodium_mprotect_readwrite(this._)
    sodium.randombytes_buf(this._)
    sodium.sodium_mprotect_noaccess(this._)
  }

  /**
   * this SecBuf instance will be readable for the duration of the callback
   * @example
   * sb.readable(_sb => {
   *   console.log(_sb)
   * })
   *
   * @param {function} fn - the function to invoke
   */
  readable (fn) {
    sodium.sodium_mprotect_readonly(this._)
    try {
      fn(this._)
      sodium.sodium_mprotect_noaccess(this._)
    } catch (e) {
      sodium.sodium_mprotect_noaccess(this._)
      throw e
    }
  }

  /**
   * this SecBuf instance will be writable for the duration of the callback
   * @example
   * sb.writable(_sb => {
   *   _sb.writeUInt8(0, 0)
   * })
   *
   * @param {function} fn - the function to invoke
   */
  writable (fn) {
    sodium.sodium_mprotect_readwrite(this._)
    try {
      fn(this._)
      sodium.sodium_mprotect_noaccess(this._)
    } catch (e) {
      sodium.sodium_mprotect_noaccess(this._)
      throw e
    }
  }
}

SecBuf._stdin = process.stdin
SecBuf._stderr = process.stderr

exports.SecBuf = SecBuf
