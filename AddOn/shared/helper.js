function IsVisible(el) {
    return IsVisibleEx(el, 0);
}
function IsVisibleEx(el, maxDepth) {
    var depth = 0;

    while (el !== null) {
        var cstyle = window.getComputedStyle(el);
        if (cstyle.visibility !== "visible" || cstyle.display === "none") {
            return false;
        }
        el = el.parentElement;
        depth++;
        if (depth === maxDepth) {
            break;
        }
    }
    return true;
}

function IsNotPartOfRegisterForm(el, onlyVisibleInputs) {
    var form = el.parentElement;
    while (form !== null && form.tagName !== "FORM") {
        form = form.parentElement;
    }
    if (form === null) {
        return true;
    }

    var inputFields = form.getElementsByTagName("input");
    var pwFields = 0;
    var inFields = 0;

    for (var i = 0; i < inputFields.length; i++) {
        if (IsFilterInputType(inputFields[i], false)) {
            continue;
        }
        if (IsVisibleEx(inputFields[i], 1) === false) {
            continue;
        }
        if (inputFields[i].type.toLowerCase() === "password") {
            pwFields++;
        } else {
            inFields++;
        }
    }

    return pwFields === 1 && inFields < 2;
}

function IsFilterInputType(el, includePw) {
    var t = el.type.toLowerCase();

    if (includePw === true && t === "password") return true;
    
    return (   t === "button"
            || t === "checkbox"
            || t === "color"
            || t === "date"
            || t === "datetime-local"
            || t === "file"
            || t === "hidden"
            || t === "image"
            || t === "month"
            || t === "number"
            || t === "radio"
            || t === "range"
            || t === "reset"
            || t === "search"
            || t === "submit"
            || t === "tel"
            || t === "time"
            || t === "url"
            || t === "week");
}

function PerformWebrequest(method, url, body, modifyXhr) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.url = url;
        if (modifyXhr !== undefined && modifyXhr !== null) {
            modifyXhr(xhr);
        }
        xhr.open(method, url, true);

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => {
            reject(xhr.statusText);
        }
        xhr.ontimeout = () => {
            reject(xhr.statusText);
        };

        if (body === null) {
            xhr.send();
        } else {
            xhr.send(body);
        }
    });
}

function DisplaySelectPwd(data, userField, pwd) {
    const myFunc = (divImg, mouseEvent) => {
        mouseEvent.stopPropagation();

        const oldMenu = pwd.getRootNode().getElementById("__pwdSelectionMenu");
        if (oldMenu !== null) {
            oldMenu.parentNode.removeChild(oldMenu);
        }

        const mainDiv = document.createElement("div");

        const fillData = num => {
            setNativeValue(pwd, data.Entries[num].Password);
            setNativeValue(userField, data.Entries[num].Username);
            mainDiv.parentNode.removeChild(mainDiv);
        };

        mainDiv.setAttribute("id", "__pwdSelectionMenu");
        mainDiv.setAttribute("style", "width: auto; top:0; left:0; border: 1px solid yellow; position: absolute; z-index:1000; background-color: white;");

        for (var i = 0; i < data.Entries.length; i++) {
            const eDiv = document.createElement("div");
            eDiv.setAttribute("style", "border: 1px solid black; padding-left: 10px; padding-right: 10px; padding-top:2px;padding-bottom:2px; cursor: pointer;");
            const pE = document.createElement("p");
            pE.setAttribute("style", "font-weight:bold; margin-top:0;margin-bottom:0;");
            pE.innerText = data.Entries[i].EntryName;
            eDiv.appendChild(pE);
            const pU = document.createElement("p");
            pU.setAttribute("style", "font-style: italic; margin-top:0;margin-bottom:0;");
            pU.innerText = data.Entries[i].Username;
            eDiv.appendChild(pU);
            const thisNum = i;
            eDiv.onclick = () => fillData(thisNum);
            mainDiv.appendChild(eDiv);
        }

        pwd.getRootNode().documentElement.onclick = e => {
            const dRect = mainDiv.getClientRects()[0];
            if (e.clientX >= dRect.left
                && e.clientX <= dRect.right
                && e.clientY >= dRect.top
                && e.clientY <= dRect.bottom) {
                return;
            }

            mainDiv.parentNode.removeChild(mainDiv);
        };

        pwd.getRootNode().documentElement.appendChild(mainDiv);

        const rect = divImg.getClientRects()[0];
        const actWidth = parseInt(window.getComputedStyle(mainDiv).width);
        const expX = window.scrollX + rect.right - actWidth;
        const expY = window.scrollY + rect.bottom + 20;
        mainDiv.setAttribute("style", "width: auto; top:" + expY + "px; left:" + expX + "px; border: 1px solid yellow; position: absolute; z-index:1000; background-color: white;");
    };

    const style = window.getComputedStyle(pwd);
    const pn = pwd.parentNode;
    const div = document.createElement("div");
    div.setAttribute("style", "position:relative;");
    pn.insertBefore(div, pwd);
    div.appendChild(pwd);

    const topVal = (parseInt(style.height, 10) - 20) / 2;
    const divImg = document.createElement("div");
    divImg.setAttribute("style", "width:20px; height:20px; z-index:500; background: url(" + browser.runtime.getURL("res/icon_open.svg") + ") no-repeat; background-size: 20px 20px; content: ' '; position:absolute;right:5px;top: " + topVal + "px; cursor: pointer;");
    divImg.setAttribute("id", "__pwdSelectIcon");
    divImg.onclick = e => myFunc(divImg, e);
    div.appendChild(divImg);
}