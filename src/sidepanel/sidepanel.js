const RULEID = 2

if (typeof browser === "undefined")
    var browser = chrome;

function connect() {
    const port = browser.runtime.connect({ name: 'mySidepanel' });
    port.onDisconnect.addListener(() => {
        connect()
    });
}

window.onload = async () => {
    connect();
    const store = await browser.storage.local.get("regex")
    const regex = document.getElementById("regex")
    regex.value = store.regex ? store.regex : ""
    regex.onchange = () => {
        // Persist the regex filter in local storage so the service worker can access it.
        browser.storage.local.set({ regex: regex.value })
    }

    const copy = document.getElementById("copy")
    const done = document.getElementById("done")
    const text = document.getElementById("text")
    const cont = document.getElementById("cont")
    document.getElementById("btn").onclick = () => {
        navigator.clipboard.writeText(new URL(text.innerHTML).search.replaceAll("&amp;", "&"))
        copy.className = "swap"
        done.className = ""
    }

    browser.storage.local.onChanged.addListener(async (change, areaName) => {
        if (change.url) {
            text.innerHTML = change.url.newValue
            cont.style.visibility = "visible"
            copy.className = ""
            done.className = "swap"
        }
    })
}