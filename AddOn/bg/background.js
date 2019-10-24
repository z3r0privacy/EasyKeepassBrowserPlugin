console.log("debug background");

var state = stateLocked;
var aesKey = null;

function CheckConnectivity() {
    if (aesKey === null) return; 

    var http = new XMLHttpRequest();
    var url = 'http://localhost:34567/connectivity/';
    //http.timeout = 500;
    http.open('GET', url, false);
    http.send();

    if (http.status !== 200) {
        state = stateUnlockedErr;  
        browser.browserAction.setIcon({path: "../res/icon_closed.svg"});
    } else {
        browser.browserAction.setIcon({path: "../res/icon_open.svg"});
        state = stateUnlockedOk;
    }

    browser.runtime.sendMessage({action: actionGetState, state: state});

    setTimeout(() => {
        CheckConnectivity();
    }, 2000);
}

function handleUnlockAttempt(m, rf) {
    if (m.pass === undefined) {
        return false;
    }

    return InitSecurity(m.pass).then(key => {
        if (key === null) return Promise.resolve(false);
        aesKey = key;
        return CheckConnectivity().then(() => Promise.resolve(true));
    });
}

browser.runtime.onMessage.addListener((m,s,rf) => {
    if (m.action === undefined) return;
    if (rf === undefined) return;
    if (m.action === actionGetState) {
        //rf(state);
        return Promise.resolve(state);
    } else if (m.action === actionTryUnlock) {
        return handleUnlockAttempt(m, rf);
    } else if (m.action === actionGetKey) {
        if (aesKey === null) return Promise.resolve(null);
        return CryptoKeyToBase64(aesKey);
    }
});