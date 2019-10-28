# EasyKeepassBrowserPlugin

A secure and easy to use firefox-addon for Keepass.

## AddOn
The addon consists of three parts. 
- A background-script which runs as long as a browser-window is open.
- A popup which shows basic information to a user and provides the input fields required for setting up the connection and entering the ping
- A content-script which runs once for each loaded page, searches for login-fields and retrieves data from Keepass and enters them.

The popup gets the state from the background-script and displays the associated content. There is not much more interesting going on as the usual input validation and (un-)hiding the different parts.

The background-script itself is not really interesting too. It is only used because it is persistent through the whole browser-session and therefore prefectly suited to save the state of the addon. After unlocking, it saves the key and provides it to the content-scripts. Every two seconds, it calls the `/connectivity/` path on the plugin's HTTP listener (see below) to update the current state. If it changes, it notifies the popup-scripts (if running) and the registered content-scripts. If appropriate, the addon's icon is updated.

### The content-script

The content-script waits until the DOM is loaded and then searches for login-fields. This is done as follows:
1. The script checks with the background-script if the connection to Keepass is working (meaning Keepass is running with the plugin, the database is unlocked and the pin has been entered correctly).
   1. If not, the content-script registers with the background-script to receive a notification if the state changes. Upon a state-change, this algorithm is continued.
2. The DOM is searched for password-fields (`<input type="password" />`) that are visible.
   1. If none are found, the search is repeated but includes non visible input fields.
      1. If still no fields are found, a `MutationObserver` is registered which notifies the script if the DOM changes. The changed parts are then again searched for login fields.
3. For the password field, the according input field for the user-name or e-mail is searched.
   1. If more than one element is found in the same form which allows text-input, the script assumes it is a registration form or something else and aborts.
4. If the user/mail input and the password input fields are identified, the current url is sent to the plugin to receive a user/pass combination.
5. If a login is found, the data is entered into the according fields.


## Plugin

## Communication
The communication between the Keepass plugin and the browser addon is realised using plain HTTP. The plugin starts a listener on http://localhost:34567/.

There are two listening paths.

### Endpoint /Connectivity/ : GET ###

This simply checks if the database is unlocked and open. If so, a empty response with status `200` is returned. If no database is not open or the current database is locked, this returns a empty response with status `401`. If Keepass or the plugin is not running, this obviously returns nothing...

### Endpoint / : POST ###

The messages are encrypted using AES-CBC-256. 

The messages have the following format (JSON).
```JSON
{
    "iv": "base64-string of the used initial vector to encrypt the message",
    "message": "the AES-encrypted message using the iv above and the key. also base64."
}

```

The decrypted messages have one of the following formats (JSON)
```JSON
// RequestData request (addon -> plugin)
{
    "url": "the AES-encrypted message using the iv above and the key. also base64"
}

// ResponseData response (plugin -> addon)
{
    "Found": "Bool stating if a matching entry has been found. If the database is locked, this is also false",
    "Username": "The username of the found entry",
    "Password": "The password of the found entry"
}
```

### Crypto Details ###

For all operations on string, it is assumed that UTF8 is used.

The `message` string in the communicaion contains the encrypted JSON-string of the actual data. E.g. For a request, create a `RequestData` object, then create a new IV and encrypt the string. The resulting byte-array is encoded using base64 and this base64-string is the actual content of the `message` member. For decryption, the base64-string is converted back into a byte-array which is then decrypted. The decrypted data can be interpreted as string (UTF8) which contains the JSON-string representing the `RequestData` request. Using ```JSON.Parse(jsonString)``` or ```Newtonsoft.Json.JsonConvert.DeserializeObject<RequestData>(jsonString)``` the original request is retrieved.

The AES-key itself is generated when the plugin is loaded for the first time and saved inside the root-container in the currently open Keepass database. Its name is `EasyBrowserAddonKey`. The addon does not save this key in plain text, but encrypted. It is therefore necessary that the user specifies a key or pin which is used to decrypt the stored AES-Key. The user-specified key is used to derive a AES-Key which then decrypts the AES-Key used for the communication. This is done as follows:

1. First of all, some data needs to be known.
   - EncryptedKey: This is the AES-Key needed for the communication, but encrypted. Stored  as base64.
   - IV: This is the initialization vector which was used to encrypt the EncryptedKey.  Stored as base64.
   - KeyHash: A SHA-265 hash of the decrypted AES-Key. This is used to check whether the  decryption was correct. Stored as hex-string.
   - Salt: Added to the pin/password of the user. This is required for the KBPDF2 function.  Stored as base64.
   - NumIterations: Used for the KBPDF2 function. Stored as number.
2. The user inputs his key/pin. 
3. Using the  `KBPDF2` function and the stored values for salt and number of iterations, a AES-Key is derived.
4. Using the key derived in step 3, the encrypted AES-Key is decrypted.
5. The decrypted key is hashed and compared to the stored hash. If they are equal, the unlock attempt was succesful. 

