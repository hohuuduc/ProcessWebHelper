const RULEID = 2
const KEY = "state"

if (typeof browser === "undefined") {
  var browser = chrome;
}

browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

browser.tabs.onActivated.addListener((info) => {
  handle()
})

browser.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status && info.status === "complete") {
    if (/^.*tracking.fujinet.net:5000.*issues.*$/.test(tab.url)) {
      browser.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['style.css']
      })
      browser.scripting.executeScript({
        target: { tabId: tabId },
        files: ['script.js']
      })
    }
    handle()
  }
})

browser.storage.onChanged.addListener((change, areaName) => {
  if (change.state) {
    console.log(change.state)
    handle()
  }
})

const handle = async () => {
  const store = await browser.storage.local.get(KEY)
  const info = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  if (store && store.state && info[0] && info[0].url) {
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
