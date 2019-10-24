var pluginAbc123 = {

    observerStarted: false,
    obs: null,
    //cryptoKey: null,

    GetPwdFields: function (doc) {
        var ary = [];
        var inputs = doc.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type.toLowerCase() === "password") {
                ary.push(inputs[i]);
            }
        }
        if (ary.length === 0) {
            inputs = this.SearchIframes(doc);
            for (var i = 0; i < inputs.length; i++) {
                ary.push(inputs[i]);
            }
        }
        return ary;
    },

    SelectPwdField: function (fields) {
        for (var i = 0; i < fields.length; i++) {
            if (IsVisible(fields[i])) {
                if (IsNotPartOfRegisterForm(fields[i])) {
                    return fields[i];
                }
            }
        }

        return null;
    },

    GetUserField: function (pwdField) {
        var el = pwdField.parentElement;
        while (el !== null && el.tagName !== "FORM") {
            el = el.parentElement;
        }
        if (el === null) {
            return undefined;
        }
        var userFields = [];
        var inputFields = el.getElementsByTagName("input");
        for (var i = 0; i < inputFields.length; i++) {
            var t = inputFields[i];
            if (IsFilterInputType(t, true)) {
                continue;
            }
            userFields.push(inputFields[i]);
        }
        if (userFields.length === 0) {
            return undefined;
        }
        if (userFields.length > 1) {
            console.log(userFields);
        }
        return userFields[0];
    },

    GetLoginData: async function (site) {
        console.log(site);

        var cryptoKey64 = await browser.runtime.sendMessage({action: actionGetKey});
        if (cryptoKey64 == null) {
            return { "FoundData": false, "Username": "", "Password": "" };
        }

        var cryptoKey = await Base64ToKey(cryptoKey64);

        var http = new XMLHttpRequest();
        var url = 'http://localhost:34567/';
        var params = JSON.stringify({
            Url: site
        });
        const sendData = await Encrypt(params, cryptoKey);
        http.timeout = 500;
        http.open('POST', url, false);
        http.setRequestHeader('Content-type', 'text/json');
        http.send(JSON.stringify(sendData));

        if (http.status === 0) {
            //alert('error http');
            return { "FoundData": false, "Username": "", "Password": "" };
        }

        const encResponse = JSON.parse(http.responseText);
        const response = await Decrypt(encResponse.Message, cryptoKey, encResponse.IV);

        return JSON.parse(response);
    },

    IsSameSource: function (url) {
        var baseUrl = window.location.href;
        var baseUrlL = baseUrl.indexOf('/', baseUrl.indexOf('/') + 2);
        baseUrl = baseUrl.substring(0, baseUrlL + 1);
        return url.startsWith(baseUrl);
    },

    SearchIframes: function (doc) {
        var iframes = document.getRootNode().getElementsByTagName("iframe");
        var pwdFields = [];

        for (var i = 0; i < iframes.length; i++) {
            if (!this.IsSameSource(iframes[i].getAttribute("src"))) {
                continue;
            }

            var fields = this.GetPwdFields(iframes[i].contentDocument);
            for (var j = 0; j < fields.length; j++) {
                pwdFields.push(fields[j]);
            }
        }
        return pwdFields;
    },

    ObsCallback: function (list, obs, plgin) {
        for (var j = 0; j < list.length; j++) {
            var newIframes = list[j].addedNodes[0].getElementsByTagName("iframe");
            for (var y = 0; y < newIframes.length; y++) {
                if (plgin.IsSameSource(newIframes[y].getAttribute("src"))) {
                    newIframes[y].addEventListener("load", ev => {
                        console.log("going to call findandfill on ");
                        console.log(plgin);
                        plgin.FindAndFillLoginFields(ev.target.contentDocument);
                    });
                }
            }
            plgin.FindAndFillLoginFields(list[j].target);
        }
    },

    FindAndFillLoginFields: function (doc) {
        if (doc === null) {
            doc = document.getRootNode();
        }
        var pwds = this.GetPwdFields(doc);
        var pwd = this.SelectPwdField(pwds);

        if (pwd === null) {
            if (this.observerStarted === false) {
                this.observerStarted = true;
                var conf = {
                    attributeOldValue: false,
                    attributes: false,
                    characterData: false,
                    characterDataOldValue: false,
                    childList: true,
                    subtree: true
                };
                var _this = this;
                this.obs = new MutationObserver(function (list, obs) {
                    _this.ObsCallback(list, obs, _this);
                });
                this.obs.observe(document.getRootNode(), conf);
            }
            return;
        }

        var userField = this.GetUserField(pwd);
        this.GetLoginData(window.location.href)
            .then(data => {
                if (data.FoundData === false) {
                    return;
                }
                if (this.observerStarted === true) {
                    this.obs.disconnect();
                }

                //pwd.select();
                //pwd.value = data.Password;
                setTimeout(function () { setNativeValue(pwd, data.Password); }, 0);
                if (userField !== undefined) {
                    if (userField.hasAttribute("autocomplete")) {
                        userField.removeAttribute("autocomplete");
                    }
                    //userField.setAttribute('value', data.Username);
                    //userField.select();
                    //userField.value = data.Username;
                    setTimeout(function () { setNativeValue(userField, data.Username); }, 0);
                }
            });
    }
};
setTimeout(() => {
    pluginAbc123.FindAndFillLoginFields(null);
}, (1000));

console.log("debug");


function setNativeValue(element, value) {
    const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, 'value') || {}
    const prototype = Object.getPrototypeOf(element)
    const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {}

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value)
    } else if (valueSetter) {
        valueSetter.call(element, value)
    } else {
        throw new Error('The given element does not have a value setter')
    }
    element.dispatchEvent(new Event('change', { bubbles: true }));
}