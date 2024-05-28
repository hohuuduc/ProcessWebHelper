const RULEID = 2

let isRun = false

if (typeof browser === "undefined") {
  var browser = chrome;
}

browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

browser.tabs.onActivated.addListener((info) => {
  handle()
})

browser.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status && info.status === "complete") {
    handle()
  }
})

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'sidepanel') {
    isRun = true
    handle()
    port.onDisconnect.addListener(async () => {
      isRun = false
      handle()
    })
  }
})

const handle = async () => {
  const store = await browser.storage.local.get("regex")
  const info = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  if (isRun && info[0] && info[0].url) {
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
          "urlFilter": store.regex,
          "resourceTypes": [
            "main_frame"
          ]
        }
      }],
      removeRuleIds: [RULEID]
    }, () => {
      console.log("Rule added.")
    })
  }
  else
    browser.declarativeNetRequest.updateDynamicRules({
      addRules: null,
      removeRuleIds: [RULEID]
    }, () => {
      console.log("Rule removed.")
    })
}

browser.webRequest.onBeforeRedirect.addListener(
  (e) => {
    if (e.url.includes("/pages/menu/program")) {
      if (e.redirectUrl.includes("pages")) {
        fetch(e.url)
        return
      }
      if (e.redirectUrl.includes("application")) {
        browser.storage.local.set({ url: e.redirectUrl })
      }
    }

  },
  { urls: ["<all_urls>"] },
  ["responseHeaders", "extraHeaders"]
)