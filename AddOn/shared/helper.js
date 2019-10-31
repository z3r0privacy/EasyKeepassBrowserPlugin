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


function checkReact() {
    const r1 = new RegExp("<[^>]+data-react");
    if (r1.test(document.getRootNode().documentElement.innerHTML)) {
        return true;
    }

    const r2 = new RegExp("react.*\.js");
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        const s = scripts[i];
        if (s.hasAttribute("src")) {
            const src = s.getAttribute("src");
            if (r2.test(src)) {
                return true;
            }
        }
    }

    return false;
}

// thanks to https://github.com/vitalyq
// src: https://github.com/vitalyq/react-trigger-change/blob/9d2fe4af0dd943bae2848ecff79e3df05add5d0c/lib/change.js#L97-L146
function triggerReact(node) {
     // React 16
    // Cache artificial value property descriptor.
    // Property doesn't exist in React <16, descriptor is undefined.
    descriptor = Object.getOwnPropertyDescriptor(node, 'value');

    // React 0.14: IE9
    // React 15: IE9-IE11
    // React 16: IE9
    // Dispatch focus.
    event = document.createEvent('UIEvents');
    event.initEvent('focus', false, false);
    node.dispatchEvent(event);

    // React 0.14: IE9
    // React 15: IE9-IE11
    // React 16
    // In IE9-10 imperative change of node value triggers propertychange event.
    // Update inputValueTracking cached value.
    // Remove artificial value property.
    // Restore initial value to trigger event with it.
    
    initialValue = node.value;
    node.value = initialValue + '#';
    var desc = Object.getOwnPropertyDescriptor(node, 'value');
    if (desc && desc.configurable) {
        delete node['value'];
    }
    node.value = initialValue;
    

    // React 15: IE11
    // For unknown reason React 15 added listener for propertychange with addEventListener.
    // This doesn't work, propertychange events are deprecated in IE11,
    // but allows us to dispatch fake propertychange which is handled by IE11.
    event = document.createEvent('HTMLEvents');
    event.initEvent('propertychange', false, false);
    event.propertyName = 'value';
    node.dispatchEvent(event);

    // React 0.14: IE10-IE11, non-IE
    // React 15: non-IE
    // React 16: IE10-IE11, non-IE
    event = document.createEvent('HTMLEvents');
    event.initEvent('input', true, false);
    node.dispatchEvent(event);

    // React 16
    // Restore artificial value property descriptor.
    if (descriptor) {
      Object.defineProperty(node, 'value', descriptor);
    }
}