console.log("debug entry");

var inSettingsOverride = false;
const divs = [stateLocked, stateUnlockedErr, stateUnlockedOk];


// register handlers
browser.runtime.onMessage.addListener(msg => {
    console.log("got message");
    if (msg.action === undefined) return true;
    if (msg.action === actionGetState) {
        HandleStateChange(msg.state);
    }
    return true;
});
document.getElementById("unlockButton").onclick = () => unlockClicked();
document.getElementById("enterSetupButton").onclick = () => enterSetup();
document.getElementById("exitSetupButton").onclick = () => leaveSetup();


DisplayCorrectSection();

function DisplayCorrectSection() {
    var send = browser.runtime.sendMessage({action: actionGetState});
    send.then(resp => {
        console.log("got response: " + resp);
        HandleStateChange(resp);
    });
}

function HandleStateChange(state) {
    if (inSettingsOverride === true) {
        state = null;
        document.getElementById("goToSettings").classList.add("hidden");
        document.getElementById("stateSetup").classList.remove("hidden");
    } else {
        document.getElementById("goToSettings").classList.remove("hidden");
        document.getElementById("stateSetup").classList.add("hidden");
    }

    for (var i = 0; i < divs.length; i++) {
        if (state === divs[i]) {
            document.getElementById(divs[i]).classList.remove("hidden");
        } else {
            document.getElementById(divs[i]).classList.add("hidden");
        }
    }
    var b = document.getElementById("body");
    b.classList.remove(b.classList.item(0));
    if (state === stateUnlockedErr) {
        b.classList.add("error");
    } else if (state === stateUnlockedOk) {
        b.classList.add("ok");
    } else {
        b.classList.add("normal");
    }
}

function enterSetup() {
    inSettingsOverride = true;
    HandleStateChange(null);
}

function leaveSetup() {
    inSettingsOverride = false;
    DisplayCorrectSection();
}

function unlockClicked() {
    const pw = document.getElementById("passUnlock").value;
    var send = browser.runtime.sendMessage({action : actionTryUnlock, pass: pw});
    send.then(succ => {
        console.log(succ);
        if (succ === true) {
            console.log("unlock successful");
            //DisplayCorrectSection();
            document.getElementById("pwErr").classList.add("hidden");
        } else {
            console.log("wrong pw");
            document.getElementById("pwErr").classList.remove("hidden");
            document.getElementById("passUnlock").value = "";
        }
    });
}
