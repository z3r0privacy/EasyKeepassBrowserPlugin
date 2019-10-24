console.log("debug entry");




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


DisplayCorrectSection();

function DisplayCorrectSection() {
    var send = browser.runtime.sendMessage({action: actionGetState});
    send.then(resp => {
        console.log("got response: " + resp);
        HandleStateChange(resp);
    });
}

const divs = [stateLocked, stateUnlockedErr, stateUnlockedOk, stateSetup];
function HandleStateChange(state) {
    for (var i = 0; i < divs.length; i++) {
        if (state === divs[i]) {
            document.getElementById(divs[i]).classList.remove("hidden");
        } else {
            document.getElementById(divs[i]).classList.add("hidden");
        }
    }
}

function unlockClicked() {
    const pw = document.getElementById("passUnlock").value;
    var send = browser.runtime.sendMessage({action : actionTryUnlock, pass: pw});
    send.then(succ => {
        console.log(succ);
        if (succ === true) {
            console.log("unlock successful");
            //DisplayCorrectSection();
        } else {
            console.log("wrong pw");
        }
    });
}
