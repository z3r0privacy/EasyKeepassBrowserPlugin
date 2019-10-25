function InitSecurity(password, encKey, ivKey, hashKey, salt, encIter) {
    return GetDataKey(base64js.toByteArray(encKey),
        fromHexString(hashKey),
        base64js.toByteArray(ivKey),
        encIter,
        base64js.toByteArray(salt),
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
    const salt = crypto.getRandomValues(new Uint8Array(4));
    const passKey = await GetPassKey(new TextEncoder().encode(pin), salt, numIter);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const key = base64js.toByteArray(key64);
    const encKey = await crypto.subtle.encrypt({name: "AES-CBC", iv: iv}, passKey, key);
    const hash = await crypto.subtle.digest("SHA-256", key);
    return {
      iv: base64js.fromByteArray(iv),
      encKey: base64js.fromByteArray(new Uint8Array(encKey)),
      hash: toHexString(new Uint8Array(hash)),
      salt: base64js.fromByteArray(salt),
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
  