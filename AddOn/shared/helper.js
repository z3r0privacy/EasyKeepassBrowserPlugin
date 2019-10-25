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
            console.log("onload: " + xhr.status);
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => {
            console.log("onerror: " + xhr.statusText);
            reject(xhr.statusText);
        }
        xhr.onreadystatechange = () => {
            console.log("xhr state change: " + xhr.readyState);
        };
        xhr.ontimeout = () => {
            console.log("timeout... " + xhr.statusText);
            reject(xhr.statusText);
        };

        if (body === null) {
            xhr.send();
        } else {
            xhr.send(body);
        }
    });
}