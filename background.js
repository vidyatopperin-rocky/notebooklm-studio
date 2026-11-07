// Background script for NotebookLM Studio Hub
// Works seamlessly across Google Chrome, Microsoft Edge, Opera, Brave, and Mozilla Firefox
// Bridges commands from Web Dashboard to open NotebookLM tabs
// v4.6.0: persistent resume state (chrome.storage.local), alarms for auto-resume,
//         NotebookLM tab is focused while a command runs, service worker keep-alive.

async function queryTabs(queryInfo) {
  if (typeof browser !== "undefined" && browser.tabs && browser.tabs.query) {
    try {
      return await browser.tabs.query(queryInfo);
    } catch (e) {
      return [];
    }
  }
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
    return new Promise((resolve) => {
      try {
        chrome.tabs.query(queryInfo, (res) => {
          if (chrome.runtime.lastError) {
            resolve([]);
          } else {
            resolve(res || []);
          }
        });
      } catch (e) {
        resolve([]);
      }
    });
  }
  return [];
}

function pickBestTab(tabs) {
  if (!tabs || tabs.length === 0) return null;
  // Priority 1: Active tab in current/focused window
  const activeTab = tabs.find((t) => t.active);
  if (activeTab) return activeTab;
  // Priority 2: Most recently accessed tab
  const sorted = [...tabs].sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
  return sorted[0];
}

async function findNotebookLMTab() {
  const patterns = [
    "*://notebooklm.google.com/*",
    "*://notebook.google.com/*",
    "*://notebooklm.google/*",
    "*://*.google.com/notebook/*",
    "*://*.google.com/*/notebook/*",
    "*://*.google/notebook/*"
  ];

  // Strategy 1: Query by specific URL match pattern
  const matchedTabs = await queryTabs({ url: patterns });
  if (matchedTabs.length > 0) {
    return pickBestTab(matchedTabs);
  }

  // Strategy 2: Query all tabs across all windows
  const allTabs = await queryTabs({});
  const filtered = allTabs.filter((t) => {
    const u = (t.url || "").toLowerCase();
    const title = (t.title || "").toLowerCase();
    // never treat dashboard tabs (local or github.io) as a NotebookLM tab
    if (u.startsWith("http://localhost") || u.startsWith("http://127.0.0.1") || u.includes(".github.io") || u.startsWith("chrome-extension://") || u.startsWith("moz-extension://")) return false;
    return (
      u.includes("notebooklm.google") ||
      u.includes("notebook.google") ||
      (u.includes("google.") && u.includes("/notebook")) ||
      (title.includes("notebooklm") && u.includes("google."))
    );
  });

  return pickBestTab(filtered);
}

// Auto-reinject content script if receiving end does not exist
async function ensureContentScriptInjected(tabId) {
  try {
    const scriptingApi = (typeof browser !== "undefined" && browser.scripting)
      ? browser.scripting
      : (typeof chrome !== "undefined" ? chrome.scripting : null);

    if (scriptingApi && scriptingApi.executeScript) {
      await scriptingApi.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      });
      if (scriptingApi.insertCSS) {
        try {
          await scriptingApi.insertCSS({
            target: { tabId: tabId },
            files: ["content.css"]
          });
        } catch (e) {}
      }
      await new Promise((r) => setTimeout(r, 350));
      return true;
    }
  } catch (e) {
    console.warn("Could not inject content script:", e);
  }
  return false;
}

async function sendTabMessage(tabId, payload) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (typeof browser !== "undefined" && browser.tabs && browser.tabs.sendMessage) {
      try {
        const res = await browser.tabs.sendMessage(tabId, payload);
        return res || { success: true };
      } catch (e) {
        const msg = (e && e.message) ? e.message : String(e);
        if (msg.includes("Receiving end does not exist") && attempt === 1) {
          await ensureContentScriptInjected(tabId);
          continue;
        }
        return { success: false, error: msg };
      }
    }

    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.sendMessage) {
      const res = await new Promise((resolve) => {
        try {
          chrome.tabs.sendMessage(tabId, payload, (response) => {
            if (chrome.runtime.lastError) {
              resolve({ success: false, error: chrome.runtime.lastError.message });
            } else {
              resolve(response || { success: true });
            }
          });
        } catch (err) {
          resolve({ success: false, error: err.message });
        }
      });

      if (res && res.error && res.error.includes("Receiving end does not exist") && attempt === 1) {
        await ensureContentScriptInjected(tabId);
        continue;
      }
      return res;
    }
  }

  return { success: false, error: "Tabs API not available" };
}

// ---------- v4.5.0: helpers (focus tab, keep service worker alive, persistent state) ----------
const extApi = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

async function activateTab(tab) {
  // Background tabs are throttled by the browser (timers slow down, dialogs may not animate),
  // so NotebookLM must be the visible tab while a command runs.
  try {
    if (tab.windowId != null && extApi.windows && extApi.windows.update) {
      await extApi.windows.update(tab.windowId, { focused: true });
    }
  } catch (e) {}
  try { await extApi.tabs.update(tab.id, { active: true }); } catch (e) {}
  await sleepMs(500);
}

async function waitTabComplete(tabId, maxMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    try {
      const t = await extApi.tabs.get(tabId);
      if (t && t.status === "complete") return true;
    } catch (e) { return false; }
    await sleepMs(400);
  }
  return false;
}

function startKeepAlive() {
  // MV3 service workers are stopped after ~30 s without extension API calls.
  return setInterval(() => {
    try {
      const p = extApi.runtime.getPlatformInfo && extApi.runtime.getPlatformInfo();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }, 20000);
}

const STATE_KEY = "nlm_state";
const BACKUP_KEY = "nlm_backup";
const ALARM_NAME = "nlm-resume";
let stateQueue = Promise.resolve();

function storageGet(keys) {
  return new Promise((resolve) => {
    try {
      const area = extApi.storage.local;
      const r = area.get(keys, (res) => resolve(res || {}));
      if (r && r.then) r.then((res) => resolve(res || {})).catch(() => resolve({}));
    } catch (e) { resolve({}); }
  });
}
function storageSet(obj) {
  return new Promise((resolve) => {
    try {
      const area = extApi.storage.local;
      const r = area.set(obj, () => resolve(true));
      if (r && r.then) r.then(() => resolve(true)).catch(() => resolve(false));
    } catch (e) { resolve(false); }
  });
}

function patchState(patch, logLines, backup) {
  // serialised so two quick patches never overwrite each other
  stateQueue = stateQueue.then(async () => {
    const stored = await storageGet([STATE_KEY]);
    const state = stored[STATE_KEY] || { status: "idle", log: [] };
    if (patch && typeof patch === "object") {
      for (const k of Object.keys(patch)) {
        if (patch[k] === null) delete state[k];
        else state[k] = patch[k];
      }
    }
    if (Array.isArray(logLines) && logLines.length) {
      state.log = (state.log || []).concat(logLines).slice(-200);
    }
    state.updatedAt = Date.now();
    const out = { [STATE_KEY]: state };
    if (backup && typeof backup === "object") out[BACKUP_KEY] = backup;
    await storageSet(out);
    return state;
  }).catch(() => ({}));
  return stateQueue;
}

async function getStateAndBackup() {
  const stored = await storageGet([STATE_KEY, BACKUP_KEY]);
  return { state: stored[STATE_KEY] || null, backup: stored[BACKUP_KEY] || null };
}

async function handleStateAction(message) {
  try {
    if (message.action === "nlmState.get") {
      const r = await getStateAndBackup();
      return { success: true, state: r.state, backup: r.backup };
    }
    if (message.action === "nlmState.patch") {
      const state = await patchState(message.patch, message.log, message.backup);
      return { success: true, state: state };
    }
    if (message.action === "nlmAlarm.set") {
      const when = Number(message.when);
      if (!when || when < Date.now() + 1000) {
        return { success: false, error: "Alarm time must be in the future" };
      }
      extApi.alarms.create(ALARM_NAME, { when: when });
      await patchState({ resumeAlarmAt: when });
      return { success: true, when: when };
    }
    if (message.action === "nlmAlarm.clear") {
      try { extApi.alarms.clear(ALARM_NAME); } catch (e) {}
      await patchState({ resumeAlarmAt: null });
      return { success: true };
    }
  } catch (e) {
    return { success: false, error: (e && e.message) || String(e) };
  }
  return { success: false, error: "Unknown state action" };
}

async function wakeDashboards(reason) {
  const tabs = await queryTabs({ url: ["http://localhost/*", "http://127.0.0.1/*", "https://*.github.io/*"] });
  let sent = 0;
  for (const t of tabs) {
    // direct send (never sendTabMessage: that would re-inject content.js into the dashboard tab)
    const ok = await new Promise((resolve) => {
      try {
        const p = extApi.tabs.sendMessage(t.id, { type: "NLM_WAKE", reason: reason }, () => {
          resolve(!(extApi.runtime && extApi.runtime.lastError));
        });
        if (p && p.then) p.then(() => resolve(true)).catch(() => resolve(false));
      } catch (e) { resolve(false); }
    });
    if (ok) sent++;
  }
  await patchState({ lastWakeAt: Date.now(), lastWakeDashboards: sent }, [
    { t: new Date().toISOString(), level: sent ? "info" : "warn",
      text: sent ? "⏰ Alarm fired - dashboard ko resume ke liye jagaya." : "⏰ Alarm fired lekin dashboard tab (localhost) khula nahi mila. Dashboard kholo, resume point saved hai." }
  ]);
}

try {
  if (extApi.alarms && extApi.alarms.onAlarm) {
    extApi.alarms.onAlarm.addListener((alarm) => {
      if (alarm && alarm.name === ALARM_NAME) {
        patchState({ resumeAlarmAt: null }).then(() => wakeDashboards("alarm"));
      }
    });
  }
  if (extApi.runtime && extApi.runtime.onStartup) {
    extApi.runtime.onStartup.addListener(async () => {
      // alarms may be lost on browser restart: re-arm from saved state
      const r = await getStateAndBackup();
      const at = r.state && r.state.resumeAlarmAt;
      if (at && at > Date.now() + 1000) extApi.alarms.create(ALARM_NAME, { when: at });
    });
  }
} catch (e) {}

function handleForwardMessage(payload, sendResponse, sender) {
  return new Promise((resolve) => {
    findNotebookLMTab().then(async (nlmTab) => {
      if (nlmTab && nlmTab.id) {
        const isCommand = payload && payload.type === "NLM_COMMAND";
        const dash = sender && sender.tab ? sender.tab : null;
        let keepAlive = null;
        if (isCommand) {
          keepAlive = startKeepAlive();
          if (nlmTab.status === "loading") await waitTabComplete(nlmTab.id, 10000);
          if (payload.focusTab !== false) await activateTab(nlmTab);
        }
        let resp;
        try {
          resp = await sendTabMessage(nlmTab.id, payload);
        } finally {
          if (keepAlive) clearInterval(keepAlive);
          if (isCommand && payload.focusTab !== false && dash && dash.id != null) {
            // give the user their dashboard back
            await sleepMs(300);
            await activateTab(dash);
          }
        }
        {
          const result = resp || { success: true };
          try { sendResponse(result); } catch (e) {}
          resolve(result);
        }
      } else {
        const notFound = {
          success: false,
          error: "NotebookLM tab is not open! Please open your notebook in another tab."
        };
        try { sendResponse(notFound); } catch (e) {}
        resolve(notFound);
      }
    }).catch((err) => {
      const errRes = { success: false, error: err.message };
      try { sendResponse(errRes); } catch (e) {}
      resolve(errRes);
    });
  });
}

const runtimeApi = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;

if (runtimeApi && runtimeApi.runtime && runtimeApi.runtime.onMessage) {
  runtimeApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.action === "forwardToNotebookLM") {
      const promise = handleForwardMessage(message.payload, sendResponse, sender);
      if (typeof browser !== "undefined" && browser.runtime) {
        return promise;
      }
      return true;
    }
    if (message && typeof message.action === "string" && (message.action.indexOf("nlmState.") === 0 || message.action.indexOf("nlmAlarm.") === 0)) {
      const p = handleStateAction(message).then((r) => { try { sendResponse(r); } catch (e) {} return r; });
      if (typeof browser !== "undefined" && browser.runtime) return p;
      return true;
    }
  });
}
