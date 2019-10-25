var state = null;
var aesKey = null;

function startup() {
    state = stateSetup;
    browser.storage.local.get("confDone")
        .then(data => {
            if (data.confDone !== undefined && data.confDone === true) {
                state = stateLocked;
            }
        })
}

function sendMessageToTabs(tabs) {
    for (let tab of tabs) {
      browser.tabs.sendMessage(
        tab.id,
        {action: actionGetState, state: state}
      );
    }
  }


function refreshState() {
    const lastState = state;

    var http = new XMLHttpRequest();
    var url = 'http://localhost:34567/connectivity/';
    //http.timeout = 500;
    http.open('GET', url, false);
    http.send();

    if (http.status !== 200) {
        state = stateUnlockedErr;  
    } else {
        state = stateUnlockedOk;
    }

    if (state !== lastState) {
        browser.runtime.sendMessage({action: actionGetState, state: state});
        
        if (state === stateUnlockedOk) {
            browser.browserAction.setIcon({path: "../res/icon_open.svg"});
        } else {
            browser.browserAction.setIcon({path: "../res/icon_closed.svg"});
        }

        browser.tabs.query({}).then(sendMessageToTabs);
    }

    return Promise.resolve();
}

function CheckConnectivity() {
    if (aesKey === null) return; 

    return refreshState().then(() => {
        setTimeout(() => {
            CheckConnectivity();
        }, 2000);
    });
}

function handleUnlockAttempt(m) {
    if (m.pass === undefined) {
        return false;
    }

    return browser.storage.local.get(["iv", "encKey", "hash", "salt", "iterations"])
        .then(data => {
            return InitSecurity(m.pass, data.encKey, data.iv, data.hash, data.salt, data.iterations);
        })
        .then(key => {
            if (key === null) return Promise.resolve(false);
            aesKey = key;
            return CheckConnectivity().then(() => Promise.resolve(true));
        })
        .catch(() => Promise.resolve(false));
}

function handleSetup(m) {
    if (m.aesKey === undefined ||
        m.pin === undefined) {
            return Promise.resolve(false);
        }

    state = stateSetup;

    return CreateKeys(m.aesKey, m.pin).
        then(data => {
            return browser.storage.local.set(data);
        })
        .then(() => {
            return handleUnlockAttempt({pass: m.pin});
        })
        .then(suc => {
            if (suc === true) {
                browser.storage.local.set({confDone: true});
                return Promise.resolve(true);
            } else {
                browser.storage.local.clear();
                return Promise.resolve(false);
            }
        })
        .catch(err => {
            return Promise.resolve(false);
        });
}

browser.runtime.onMessage.addListener((m,s,rf) => {
    if (m.action === undefined) return;
    if (m.action === actionGetState) {
        return Promise.resolve(state);
    } else if (m.action === actionTryUnlock) {
        return handleUnlockAttempt(m);
    } else if (m.action === actionGetKey) {
        if (aesKey === null) return Promise.resolve(null);
        return CryptoKeyToBase64(aesKey);
    } else if (m.action === actionSetup) {
        return handleSetup(m);
    }
    return;
});

startup();