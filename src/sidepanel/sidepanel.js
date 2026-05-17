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

    setupToggle(
        document.getElementById("shortcutToggle"),
        document.getElementById("shortcutContent"),
        document.getElementById("shortcutChevron"),
        true
    );

    setupToggle(
        document.getElementById("codeToggle"),
        document.getElementById("codeContent"),
        document.getElementById("codeChevron"),
        false
    );

    const submitDirectlyBtn = document.getElementById("submitDirectlyBtn");
    const submitDebugBtn = document.getElementById("submitDebugBtn");
    const codeInput = document.getElementById("codeInput");

    const urlFilter = "/menu/program";

    async function handleSubmit(isDebug) {
        const code = codeInput.value.trim();

        if (!code) return;

        const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });

        if (tabs && tabs.length > 0 && tabs[0].url) {
            try {
                const currentUrl = new URL(tabs[0].url);
                let fullBaseUrl = currentUrl.origin + currentUrl.pathname;

                if (fullBaseUrl.endsWith('/') && urlFilter.startsWith('/')) {
                    urlFilter = urlFilter.slice(1);
                } else if (!fullBaseUrl.endsWith('/') && !urlFilter.startsWith('/') && urlFilter !== "") {
                    fullBaseUrl += '/';
                }

                let targetUrl = `${fullBaseUrl}${urlFilter}?code=${encodeURIComponent(code)}`;

                if (isDebug) {
                    fetch(targetUrl);
                } else {
                    targetUrl += `&processwebhelper=1`;
                    const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
                    if (!activeTab?.id || !activeTab?.url) return;
                    browser.tabs.create({
                        url: targetUrl,
                        windowId: activeTab.windowId,
                        index: activeTab.index + 1,
                        openerTabId: activeTab.id,
                        active: true
                    });
                }
            } catch (err) {
                console.error("Error: ", err);
            }
        }
    }

    submitDirectlyBtn.addEventListener("click", () => handleSubmit(false));
    submitDebugBtn.addEventListener("click", () => handleSubmit(true));

    const shortcutKeyEl = document.getElementById("shortcutKey");
    const shortcutLink = document.getElementById("shortcutLink");

    const commands = await browser.commands.getAll();
    const actionCommand = commands.find(cmd => cmd.name === "_execute_action");
    if (actionCommand && actionCommand.shortcut) {
        shortcutKeyEl.textContent = actionCommand.shortcut;
    } else {
        shortcutKeyEl.textContent = "Not set";
    }

    shortcutLink.addEventListener("click", (e) => {
        e.preventDefault();
        browser.tabs.create({ url: "chrome://extensions/shortcuts" });
    });
}