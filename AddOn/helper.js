function IsVisible(el) {
    while (el !== null) {
        var cstyle = window.getComputedStyle(el);
        if (cstyle.visibility !== "visible" || cstyle.display === "none") {
            return false;
        }
        el = el.parentElement;
    }
    return true;
}

function IsNotPartOfRegisterForm(el) {
    var form = el.parentElement;
    while (form.tagName !== "FORM" && form !== null) {
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
        if (IsVisible(inputFields[i]) === false) {
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