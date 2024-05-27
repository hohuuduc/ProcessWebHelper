const RULEID = 2

window.onload = async () => {
    const copy = document.getElementById("copy")
    const done = document.getElementById("done")
    const text = document.getElementById("text")
    const cont = document.getElementById("cont")
    document.getElementById("btn").onclick = () => {
        navigator.clipboard.writeText(text.innerHTML.substring(text.innerHTML.indexOf("?RootEndPoint")).replaceAll("&amp;", "&"))
        copy.className = "swap"
        done.className = ""
    }

    if (typeof browser === "undefined")
        var browser = chrome;

    const store = await browser.storage.local.get("state")
    const input = document.getElementById("input")

    input.checked = store ? store.state : false

    input.onclick = async (value) => {
        browser.storage.local.set({ state: value.target.checked ? value.target.checked : false })
        const info = await browser.tabs.query({ active: true, lastFocusedWindow: true });
        if (value.target.checked && value.target.checked && info[0] && info[0].url)
            browser.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    "id": RULEID,
                    "priority": 1,
                    "action": {
                        "type": "redirect",
                        "redirect": {
                            "url": info[0].url
                        }
                    },
                    "condition": {
                        "urlFilter": "pages/menu/program",
                        "resourceTypes": [
                            "main_frame"
                        ]
                    }
                }],
                removeRuleIds: [RULEID]
            }, () => {
                console.log("Rule added.")
            })
        else
            browser.declarativeNetRequest.updateDynamicRules({
                addRules: null,
                removeRuleIds: [RULEID]
            }, () => {
                console.log("Rule removed.")
            });
    }

    browser.storage.onChanged.addListener(async (change, areaName) => {
        if (change.url) {
            text.innerHTML = change.url.newValue
            cont.style.visibility = "visible"
            copy.className = ""
            done.className = "swap"
        }
    })
}
