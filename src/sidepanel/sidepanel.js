const RULEID = 2;

if (typeof browser === "undefined")
    var browser = chrome;

function connect() {
    const port = browser.runtime.connect({ name: 'mySidepanel' });
    port.onDisconnect.addListener(() => {
        connect();
    });
}

window.onload = async () => {
    connect();
    const store = await browser.storage.local.get("regex");
    const regex = document.getElementById("regex");
    regex.value = store.regex ? store.regex : "";
    regex.onchange = () => {
        // Persist the regex filter in local storage so the service worker can access it.
        browser.storage.local.set({ regex: regex.value });
    }

    const copy = document.getElementById("copy");
    const done = document.getElementById("done");
    const text = document.getElementById("text");
    const cont = document.getElementById("cont");
    const prms = document.getElementById("params");
    document.getElementById("btn").onclick = () => {
        navigator.clipboard.writeText(new URL(text.innerHTML).search.replaceAll("&amp;", "&"));
        copy.className = "swap";
        done.className = "";
    }

    browser.storage.local.onChanged.addListener(async (change, areaName) => {
        if (change.url) {
            const url = change.url.newValue;
            text.innerHTML = url;
            cont.style.visibility = "visible";
            copy.className = "";
            done.className = "swap";

            let params = new URLSearchParams(new URL(url).search);
            let programPath = url.split("/application/");
            if (programPath.length > 1) {
                programPath = programPath[1].split("/");
                params = [["Aname", programPath[0]], ["Host", programPath[1]], ...params];
            }
            prms.innerHTML = "";
            for (const param of params) {
                const item = document.createElement("div");
                item.className = "param-item";

                const keySpan = document.createElement("span");
                keySpan.className = "param-key";
                keySpan.textContent = param[0];

                const valueSpan = document.createElement("span");
                valueSpan.className = "param-value";
                valueSpan.textContent = decodeURIComponent(param[1]);

                item.appendChild(keySpan);
                item.appendChild(valueSpan);
                prms.appendChild(item);
            }
            if (params.length > 0)
                prms.style.visibility = "visible";
        }
    })
}