const encKey = "S5RhP0asXEZ16YSmjSs1zSwD+pd10N6ph8/oZcZnw/A5EhYYR3Y5OhXV2wFMnm07";
const hashKey = "87a9591e8104de11be1fb19e5fdb5ffb9fa0004df2f85525fbaf6ce0d1762756";
const ivKey = "vWOwLG83NDAjylwQD2iZTw==";
const encIter = 1000;
const encSalt = "salz";

// test-data:
/*
 * AES-Key communication: Tm1++5/kHxSGVbD8I/sBE9E7pM+nDYgwcyoEEYqttDY=
 * Password: 1234
 * -> PassKey: gOpdYqQe+7/rV9a9sKua6msfklEKkA2H2x/YKu4asXo=
 * Encrypted AES-Key: S5RhP0asXEZ16YSmjSs1zSwD+pd10N6ph8/oZcZnw/A5EhYYR3Y5OhXV2wFMnm07
 *  -> IV: vWOwLG83NDAjylwQD2iZTw==
 * Salt: salz
 * iterations: 1000
 * Hashed AES-Key: 0x87a9591e8104de11be1fb19e5fdb5ffb9fa0004df2f85525fbaf6ce0d1762756
 */


function InitSecurity(password) {
    return GetDataKey(base64js.toByteArray(encKey),
        fromHexString(hashKey),
        base64js.toByteArray(ivKey),
        encIter,
        new TextEncoder().encode(encSalt),
        new TextEncoder().encode(password));
}

async function CryptoKeyToBase64(key) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return base64js.fromByteArray(new Uint8Array(raw));
}

async function Base64ToKey(key) {
  const raw = base64js.toByteArray(key);
  return await crypto.subtle.importKey("raw", raw, "AES-CBC", false, ["encrypt", "decrypt"]);
}

 /**
 * Encrypts the given data with the key and a randomly created IV
 * @param {string} rawData 
 * @param {CryptoKey} key 
 * @returns {Promise<{data: ArrayBuffer, iv: Uint8Array}>}
 */
function Encrypt(rawData, key) {
    var encData = new TextEncoder().encode(rawData);
  
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encrypt = window.crypto.subtle.encrypt({
        name: "AES-CBC",
        iv: iv
      }, key, encData);
    
    return encrypt.then(encrypted => {
        return {
          Message: base64js.fromByteArray(new Uint8Array(encrypted)),
          IV: base64js.fromByteArray(new Uint8Array(iv))
        };
      })
      .catch(() => null);
  }
  
  /**
   * 
   * @param {ArrayBuffer} encData 
   * @param {CryptoKey} key 
   * @param {Uint8Array} iv 
   * @returns {Promise<string>} 
   */
  function Decrypt(encData, key, iv) {
      const rawEncData = base64js.toByteArray(encData);
    return window.crypto.subtle.decrypt({
        name: "AES-CBC",
        iv: base64js.toByteArray(iv)
      }, key, rawEncData)
      .then(arr => {
        return new TextDecoder().decode(arr);
      })
      .catch(() => null);
  }
  
  /**
   * 
   * @param {ArrayBuffer} keyEncrypted 
   * @param {ArrayBuffer} keyHash 
   * @param {Uint8Array} keyIV 
   * @param {number} keyIter 
   * @param {string} keySalt 
   * @param {string} keyPass 
   */
  async function GetDataKey(keyEncrypted, keyHash, keyIV, keyIter, keySalt, keyPass) {
    var passKey = await GetPassKey(keyPass, keySalt, keyIter);
    
    var key = await DecryptKey(keyEncrypted, passKey, keyIV);
    var equal = await CompareCalcWithHashed(key, keyHash);
    if (equal === true) {
      const dataKey = await crypto.subtle.importKey("raw", key, "AES-CBC", true, ["encrypt", "decrypt"]);
      return dataKey;
    } else {
      return null;
    }
  }

  async function CreateKeys(key64, pin) {
    const numIter = 10000;
    const salt = base64js.fromByteArray(crypto.getRandomValues(new Uint8Array(4)));
    const passKey = await GetPassKey(pin, salt, numIter);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const key = base64js.toByteArray(key64);
    const encKey = await crypto.subtle.encrypt({name: "AES-CBC", iv: iv}, passKey, base64js.toByteArray(key));
    const hash = await crypto.subtle.digest("SHA-256", key);
    return {
      iv: base64js.fromByteArray(iv),
      encKey: base64js.fromByteArray(encKey),
      hash: toHexString(hash),
      salt: salt,
      iterations: numIter
    };
  }
  
  /**
   * 
   * @param {*} key 
   * @param {*} hash 
   */
  async function CompareCalcWithHashed(key, hashCorrect) {
    const hashQuestioned = new Uint8Array(await crypto.subtle.digest("SHA-256", key));
    
    if (hashQuestioned.byteLength !== hashCorrect.byteLength) return false;
    var len = hashQuestioned.byteLength;
  
    for (var i = 0; i < len; i++) {
      if (hashQuestioned[i] !== hashCorrect[i]) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * 
   * @param {ArrayBuffer} encKey 
   * @param {CryptoKey} passKey 
   * @param {Uint8Array} iv 
   */
  async function DecryptKey(encKey, passKey, iv) {
      return await crypto.subtle.decrypt({
      name: "AES-CBC",
      iv: iv
    }, passKey, encKey);
  }
  
  /**
   * 
   * @param {string} pwd 
   * @param {string} salt 
   * @param {number} iter 
   */
  async function GetPassKey(pwd, salt, iter) {
    const derKey = await crypto.subtle.importKey("raw", pwd, "PBKDF2", false, ["deriveBits", "deriveKey"]);
    const key = await crypto.subtle.deriveKey({
      name: "PBKDF2",
      salt: salt,
      iterations: iter,
      hash: "SHA-256"
    }, derKey, {
      name: "AES-CBC",
      length: 256
    }, false, ["encrypt", "decrypt"]);
    
    return key;
  }
  
  function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }
  
  function fromHexString(hexString) {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  }
  
  // ---------------------
/*  
GetDataKey(base64js.toByteArray(encKey),
    fromHexString(hashKey),
    base64js.toByteArray(ivKey),
    encIter,
    new TextEncoder().encode(encSalt),
    new TextEncoder().encode("1234"))
.then(k => {
    console.log(k);
})
.catch(err => console.log(err));
  
  /*
  GetPassKey("1234", "salz", 1000).then(k => {
      console.log("Accepted:");
    /*const eK = crypto.subtle.exportKey("raw", k);
    eK.then(_ek => {
      console.log(new Uint8Array(_ek));
      const kB64 = base64js.fromByteArray(new Uint8Array(_ek));
      console.log("passKey: '" + kB64 + "'");
      });*/
  /*
    return k;
  })
  .then(passKey => {
      const aesKey64 = "Tm1++5/kHxSGVbD8I/sBE9E7pM+nDYgwcyoEEYqttDY=";
    const aesKey = base64js.toByteArray(aesKey64);
    crypto.subtle.digest("SHA-256", aesKey).then(h => {
        
        console.log("0x" + toHexString(new Uint8Array(h)));
    }).catch(err => console.log(err));
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const ivStr = base64js.fromByteArray(iv);
    console.log("IV: " + ivStr);
    return crypto.subtle.encrypt({name:"AES-CBC", iv:iv}, passKey, aesKey);
  })
  .then(encKey => {
      console.log("encrypted key: " + base64js.fromByteArray(new Uint8Array(encKey)));
    return encKey;
  })
  .catch(r => console.log("Rejected: " + r));*/
  