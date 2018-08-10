const sodium = require('sodium-native')
const { SecBuf } = require('./secbuf')

/**
 */
exports.keypair = function kxKeypair () {
  const pk = Buffer.alloc(sodium.crypto_kx_PUBLICKEYBYTES)
  const sk = new SecBuf(sodium.crypto_kx_SECRETKEYBYTES)

  sk.writable((_sk) => {
    sodium.crypto_kx_keypair(pk, _sk)
  })

  return {
    publicKey: pk,
    secretKey: sk
  }
}

/**
 */
exports.clientSession = function kxClientSession (cliPublic, cliSecret, srvPublic) {
  if (!(cliPublic instanceof Buffer)) {
    throw new Error('cliPublic must be a Buffer')
  }
  if (!(srvPublic instanceof Buffer)) {
    throw new Error('srvPublic must be a Buffer')
  }
  if (!(cliSecret instanceof SecBuf)) {
    throw new Error('cliSecret must be a SecBuf')
  }

  const rx = new SecBuf(sodium.crypto_kx_SESSIONKEYBYTES)
  const tx = new SecBuf(sodium.crypto_kx_SESSIONKEYBYTES)

  rx.writable((_rx) => {
    tx.writable((_tx) => {
      cliSecret.readable((_cliSecret) => {
        sodium.crypto_kx_client_session_keys(
          _rx, _tx, cliPublic, _cliSecret, srvPublic)
      })
    })
  })

  return { rx, tx }
}

/**
 */
exports.serverSession = function kxServerSession (srvPublic, srvSecret, cliPublic) {
  if (!(srvPublic instanceof Buffer)) {
    throw new Error('srvPublic must be a Buffer')
  }
  if (!(cliPublic instanceof Buffer)) {
    throw new Error('cliPublic must be a Buffer')
  }
  if (!(srvSecret instanceof SecBuf)) {
    throw new Error('srvSecret must be a SecBuf')
  }

  const rx = new SecBuf(sodium.crypto_kx_SESSIONKEYBYTES)
  const tx = new SecBuf(sodium.crypto_kx_SESSIONKEYBYTES)

  rx.writable((_rx) => {
    tx.writable((_tx) => {
      srvSecret.readable((_srvSecret) => {
        sodium.crypto_kx_server_session_keys(
          _rx, _tx, srvPublic, _srvSecret, cliPublic)
      })
    })
  })

  return { rx, tx }
}
