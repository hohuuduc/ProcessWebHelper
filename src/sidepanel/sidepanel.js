const RULEID = 2;

if (typeof browser === "undefined")
    var browser = chrome;

function connect() {
    const port = browser.runtime.connect({ name: 'mySidepanel' });
    port.onDisconnect.addListener(() => {
        connect();
    });
}

// Generic toggle helper for collapsible sections
function setupToggle(toggleEl, contentEl, chevronEl, startCollapsed) {
    if (startCollapsed) {
        contentEl.classList.add("collapsed");
        chevronEl.classList.add("collapsed");
    }
    toggleEl.addEventListener("click", () => {
        contentEl.classList.toggle("collapsed");
        chevronEl.classList.toggle("collapsed");
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

    // Setup collapsible sections
    setupToggle(
        document.getElementById("filterToggle"),
        document.getElementById("filterContent"),
        document.getElementById("filterChevron"),
        false // Url Filter starts expanded
    );

    setupToggle(
        document.getElementById("shortcutToggle"),
        document.getElementById("shortcutContent"),
        document.getElementById("shortcutChevron"),
        true // Shortcut starts collapsed
    );

    // Display current shortcut key for the extension action
    const shortcutKeyEl = document.getElementById("shortcutKey");
    const shortcutLink = document.getElementById("shortcutLink");

    const commands = await browser.commands.getAll();
    const actionCommand = commands.find(cmd => cmd.name === "_execute_action");
    if (actionCommand && actionCommand.shortcut) {
        shortcutKeyEl.textContent = actionCommand.shortcut;
    } else {
        shortcutKeyEl.textContent = "Not set";
    }

    // Open chrome://extensions/shortcuts in a new tab (chrome:// URLs require tabs.create)
    shortcutLink.addEventListener("click", (e) => {
        e.preventDefault();
        browser.tabs.create({ url: "chrome://extensions/shortcuts" });
    });
}