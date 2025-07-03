const RULEID = 2

if (typeof browser === "undefined") {
  var browser = chrome;
}

browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

browser.runtime.onConnect.addListener(function (port) {
  if (port.name === 'mySidepanel') {
    browser.storage.session.set({ isRun: true });
    port.onDisconnect.addListener(async () => {
      browser.storage.session.set({ isRun: false });
    });
  }
});

// These listeners will trigger rule updates based on tab navigation.
browser.tabs.onActivated.addListener((info) => {
  handle()
})

browser.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status && info.status === "complete") {
    handle()
  }
})

// Listens for changes in storage to trigger rule updates.
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'session' && changes.isRun) {
    handle();
  }
})

// This is the core logic for updating the redirect rule.
const handle = async () => {
  // Fetch all required data in parallel for efficiency.
  const [{ isRun }, { regex }, tabs] = await Promise.all([
    browser.storage.session.get('isRun'),
    browser.storage.local.get("regex"),
    browser.tabs.query({ active: true, lastFocusedWindow: true })
  ]);

  const activeTab = tabs[0];
  const newCurrentTab = (isRun && activeTab) ? activeTab.url : null;

  // Persist the current tab's URL for the redirect logic.
  await browser.storage.session.set({ currentTab: newCurrentTab });

  // If the extension is active and we have a tab and a regex, add the redirect rule.
  if (newCurrentTab && regex) {
    browser.declarativeNetRequest.updateDynamicRules({
      addRules: [{
        "id": RULEID,
        "priority": 1,
        "action": {
          "type": "redirect",
          "redirect": { "url": newCurrentTab }
        },
        "condition": {
          "urlFilter": regex,
          "resourceTypes": ["main_frame"]
        }
      }],
      removeRuleIds: [RULEID]
    }, () => {
      if (browser.runtime.lastError) {
        console.error("Error updating rule:", browser.runtime.lastError);
      } else {
        console.debug("Rule updated for:", newCurrentTab);
      }
    })
  } else {
    // Otherwise, ensure the rule is removed.
    browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULEID]
    }, () => {
      if (browser.runtime.lastError) {
        console.error("Error removing rule:", browser.runtime.lastError);
      } else {
        console.debug("Rule removed.");
      }
    })
  }
}

browser.webRequest.onBeforeRedirect.addListener(
  async (e) => {
    const [{ currentTab }, { regex }] = await Promise.all([
      browser.storage.session.get('currentTab'),
      browser.storage.local.get("regex")
    ]);

    if (regex && currentTab && e.url.includes(regex)) {
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