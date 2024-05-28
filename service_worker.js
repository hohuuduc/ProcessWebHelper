const RULEID = 2

let isRun = false
let currentTab

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
  if (isRun && info[0]) {
    currentTab = info[0].url
  }
  else {
    currentTab = null
  }
  if (currentTab) {
    browser.declarativeNetRequest.updateDynamicRules({
      addRules: [{
        "id": RULEID,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": {
            "url": currentTab
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
  async (e) => {
    const store = await browser.storage.local.get("regex")
    if (e.url.includes(store.regex)) {
      if (e.redirectUrl === currentTab) {
        fetch(e.url)
        return
      }
      if (e.redirectUrl) {
        browser.storage.local.set({ url: e.redirectUrl })
      }
    }

  },
  { urls: ["<all_urls>"] },
  ["responseHeaders", "extraHeaders"]
)