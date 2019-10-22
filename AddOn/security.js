/**
 * Encrypts the given data with the key and a randomly created IV
 * @param {string} rawData 
 * @param {CryptoKey} key 
 * @returns {Promise<{data: ArrayBuffer, iv: Uint8Array}>}
 */
function Encrypt(rawData, key) {
    var encData = new TextEncoder().encode(rawData);

    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    return window.crypto.subtle.encrypt({name: "AES-CBC", iv}, key, encData)
        .then(encrypted => { return {
            data: encrypted,
            iv
        };})
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
    return window.crypto.subtle.decrypt({name:"AES-CBC", iv}, key, encData)
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
        const dataKey = crypto.importKey("raw", key, "AES-CBC", false, ["encrypt", "decrypt"]);
        return dataKey;
    } else {
        return null;
    }
}

/**
 * 
 * @param {*} key 
 * @param {*} hash 
 */
async function CompareCalcWithHashed(key, hash) {
    const hash1 = await crypto.subtle.digest("SHA-256", key);
    const hash2 = await crypto.subtle.digest("SHA-256", hash1);
    if (hash.byteLength !== hash2.byteLength) return false;
    var len = hash.byteLength;
    
    for (var i = 0; i < len; i++) {
        if (hash[i] !== hash2[i]) {
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
        "name":"AES-CBC",
        "iv": iv
    }, passKey, encKey);
}

/**
 * 
 * @param {string} pwd 
 * @param {string} salt 
 * @param {number} iter 
 */
async function GetPassKey(pwd, salt, iter) {
    const pwdBuf = new TextEncoder().encode(pwd);
    const derKey = await crypto.subtle.importKey("raw", pwdBuf, "PBKDF2", false, ["deriveBits", "deriveKey"]);
    return crypto.subtle.deriveKey({ "name": "PBKDF2", salt: salt, "iterations": iter, "hash": "SHA-256" }, derKey, { "name": "AES-CBC", "length": 256 }, false, ["encrypt", "decrypt"]);
}

// to generate at install / first-start of addon:
// - salt
// - keyIV
// - keyHash