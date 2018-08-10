<a name="SecBuf"></a>

## SecBuf
Wrap libsodium memory lock and protect functions.
Some nodejs buffer accessors may invalidate security.

**Kind**: global class  

* [SecBuf](#SecBuf)
    * [new SecBuf(len)](#new_SecBuf_new)
    * _instance_
        * [.free()](#SecBuf+free)
        * [.randomize()](#SecBuf+randomize)
        * [.readable(fn)](#SecBuf+readable)
        * [.writable(fn)](#SecBuf+writable)
    * _static_
        * [.readPrompt(promptText)](#SecBuf.readPrompt) ⇒ [<code>SecBuf</code>](#SecBuf)

<a name="new_SecBuf_new"></a>

### new SecBuf(len)
create a new SecBuf with specified length


| Param | Type | Description |
| --- | --- | --- |
| len | <code>number</code> | the byteLength of the new SecBuf |

**Example**  
```js
const sb = new mosodium.SecBuf(32)
```
<a name="SecBuf+free"></a>

### secBuf.free()
zero out the memory and release the memory protection / lock

**Kind**: instance method of [<code>SecBuf</code>](#SecBuf)  
<a name="SecBuf+randomize"></a>

### secBuf.randomize()
randomize the underlying buffer

**Kind**: instance method of [<code>SecBuf</code>](#SecBuf)  
<a name="SecBuf+readable"></a>

### secBuf.readable(fn)
this SecBuf instance will be readable for the duration of the callback

**Kind**: instance method of [<code>SecBuf</code>](#SecBuf)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | the function to invoke |

**Example**  
```js
sb.readable(_sb => {
  console.log(_sb)
})
```
<a name="SecBuf+writable"></a>

### secBuf.writable(fn)
this SecBuf instance will be writable for the duration of the callback

**Kind**: instance method of [<code>SecBuf</code>](#SecBuf)  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | the function to invoke |

**Example**  
```js
sb.writable(_sb => {
  _sb.writeUInt8(0, 0)
})
```
<a name="SecBuf.readPrompt"></a>

### SecBuf.readPrompt(promptText) ⇒ [<code>SecBuf</code>](#SecBuf)
Fetch a buffer from stdin into a SecBuf.

**Kind**: static method of [<code>SecBuf</code>](#SecBuf)  

| Param | Type | Description |
| --- | --- | --- |
| promptText | <code>string</code> | displayed to stderr before awaiting input |

**Example**  
```js
const passphrase = await mosodium.SecBuf.readPrompt('passphrase (no echo): ')
```
