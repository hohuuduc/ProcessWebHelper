const RULEID = 2

if (typeof browser === "undefined")
    var browser = chrome;

window.onload = async () => {
    chrome.runtime.connect({ name: 'sidepanel' })

    const copy = document.getElementById("copy")
    const done = document.getElementById("done")
    const text = document.getElementById("text")
    const cont = document.getElementById("cont")
    const switch_ = document.getElementById("switch")
    document.getElementById("btn").onclick = () => {
        navigator.clipboard.writeText(text.innerHTML.substring(text.innerHTML.indexOf("?RootEndPoint")).replaceAll("&amp;", "&"))
        copy.className = "swap"
        done.className = ""
    }

    browser.storage.local.set({ state: true })

    //const store = await browser.storage.local.get("state") //store ? store.state : false

    browser.storage.onChanged.addListener(async (change, areaName) => {
        if (change.url) {
            text.innerHTML = change.url.newValue
            cont.style.visibility = "visible"
            copy.className = ""
            done.className = "swap"
        }
    })
}