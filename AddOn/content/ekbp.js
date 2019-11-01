var contentWorker = {

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

    SelectPwdField: function (fields, shouldBeVisible) {
        for (var i = 0; i < fields.length; i++) {
            if (IsVisible(fields[i]) === shouldBeVisible) {
                if (IsNotPartOfRegisterForm(fields[i], shouldBeVisible)) {
                    return fields[i];
                }
            }
        }

        return null;
    },

    GetUserField: function (pwdField) {
        if (pwdField === null) return undefined;

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

        }
        return userFields[0];
    },

    GetLoginData: async function (site) {
        var cryptoKey64 = await browser.runtime.sendMessage({ action: actionGetKey });
        if (cryptoKey64 == null) {
            return { "FoundData": false, "Username": "", "Password": "" };
        }

        var cryptoKey = await Base64ToKey(cryptoKey64);

        var url = 'http://localhost:34567/';
        var params = JSON.stringify({
            Url: site
        });
        const body = JSON.stringify(await Encrypt(params, cryptoKey));

        return PerformWebrequest('POST', url, body, xhr => { xhr.timeout = 1000; })
            .then(data => JSON.parse(data))
            .then(resp => {
                return Decrypt(resp.Message, cryptoKey, resp.IV);
            })
            .then(ans => JSON.parse(ans))
            .catch(() => { return { "Entries": [] }; });
    },

    IsSameSource: function (url) {
        if (!url.includes("://")) {
            return true;
        }

        var baseUrl = window.location.href;
        var baseUrlL = baseUrl.indexOf('/', baseUrl.indexOf('/') + 2);
        baseUrl = baseUrl.substring(0, baseUrlL + 1);
        return url.startsWith(baseUrl);
    },

    SearchIframes: function (doc) {
        var iFramesX = doc.getRootNode().getElementsByTagName("iframe");
        var framesX = doc.getRootNode().getElementsByTagName("frame");
        var iframes = [];
        iframes.push(...iFramesX);
        iframes.push(...framesX);

        var pwdFields = [];

        for (var i = 0; i < iframes.length; i++) {
            if (!this.IsSameSource(iframes[i].getAttribute("src"))) {
                continue;
            }

            const searchFrameFields = frameDoc => {
                var fields = this.GetPwdFields(frameDoc);
                for (var j = 0; j < fields.length; j++) {
                    pwdFields.push(fields[j]);
                }
            };

            if (
                iframes[i].contentDocument.readyState === "complete" ||
                (iframes[i].contentDocument.readyState !== "loading" && !iframes[i].contentDocument.documentElement.doScroll)
            ) {
                searchFrameFields(iframes[i].contentDocument);
            } else {
                iframes[i].addEventListener("load", () => contentWorker.FindAndFillLoginFields(null));
            }
        }
        return pwdFields;
    },

    ObsCallback: function (list, obs, plgin) {
        for (var j = 0; j < list.length; j++) {
            var newIframesX = list[j].addedNodes[0].getElementsByTagName("iframe");
            var newFramesX = list[j].addedNodes[0].getElementsByTagName("frame");
            var newIframes = [];
            newIframes.push(...newIframesX);
            newIframes.push(...newFramesX);

            for (var y = 0; y < newIframes.length; y++) {
                if (plgin.IsSameSource(newIframes[y].getAttribute("src"))) {
                    newIframes[y].addEventListener("load", ev => {
                        plgin.FindAndFillLoginFields(ev.target.contentDocument);
                    });
                }
            }
            console.log(list[j].target);
            plgin.FindAndFillLoginFields(list[j].target);
        }
    },

    FindAndFillLoginFields: function (doc) {
        if (doc === null) {
            doc = document.getRootNode();
        }
        var pwds = this.GetPwdFields(doc);
        var pwd = this.SelectPwdField(pwds, true);
        if (pwd === null) {
            pwd = this.SelectPwdField(pwds, false);
        }

        var userField = this.GetUserField(pwd);

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
        
        if (pwd === null || userField === undefined) return;

        this.GetLoginData(window.location.href)
            .then(data => {
                if (data.Entries.length === 0) {
                    return;
                }
                if (this.observerStarted === true) {
                    //this.obs.disconnect();
                }

                if (data.Entries.length === 1) {
                    if (userField.hasAttribute("autocomplete")) {
                        userField.removeAttribute("autocomplete");
                    }
                    userField.value = data.Entries[0].Username;
                    triggerReact(userField);
                    pwd.value = data.Entries[0].Password;
                    triggerReact(pwd);
                } else {
                    DisplaySelectPwd(data, userField, pwd);
                }
            });
    }
};

function stateChange(msg) {
    if (msg.action === undefined) return true;
    if (msg.action !== actionGetState) return true;
    if (msg.state === stateUnlockedOk) {
        browser.runtime.onMessage.removeListener(stateChange);
        contentWorker.FindAndFillLoginFields(null);
    }
    return true;
}

function starter() {
    browser.runtime.sendMessage({ action: actionGetState })
    .then(state => {
        if (state === stateUnlockedOk) {
            contentWorker.FindAndFillLoginFields(null);
        } else {
            browser.runtime.onMessage.addListener(stateChange);
        }
    });
}

console.log("debug");

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    starter();
} else {
    document.addEventListener("DOMContentLoaded", starter);
}