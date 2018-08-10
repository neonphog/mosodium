const sodium = require('sodium-native')

const MAX_PROMPT = 256

/**
 */
class SecBuf {
  /**
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
   */
  constructor (len) {
    this._ = sodium.sodium_malloc(len)
    sodium.sodium_mlock(this._, len)
    sodium.sodium_mprotect_noaccess(this._)
  }

  /**
   */
  free () {
    sodium.sodium_mprotect_readwrite(this._)
    sodium.sodium_memzero(this._)
    sodium.sodium_munlock(this._)
    this._ = null
  }

  /**
   */
  randomize () {
    sodium.sodium_mprotect_readwrite(this._)
    sodium.randombytes_buf(this._)
    sodium.sodium_mprotect_noaccess(this._)
  }

  /**
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
