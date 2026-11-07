// Bridge script injected into http://localhost:8000 and http://127.0.0.1:8000
// Runs at document_start to guarantee early hookup
// Deduplicated single-dispatch architecture across Firefox, Chrome, Edge, Brave, and Opera

document.documentElement.setAttribute("data-nlm-bridge", "active");

const hasBrowser = typeof browser !== "undefined" && browser.runtime;
const hasChrome = typeof chrome !== "undefined" && chrome.runtime;

const handledRequests = new Map();
const publishedRequests = new Set();
const REQUEST_DEDUPE_MS = 60000;

async function sendRuntimeMessage(msg) {
  if (hasBrowser && typeof browser.runtime.sendMessage === "function") {
    try {
      const res = await browser.runtime.sendMessage(msg);
      return res || { success: true };
    } catch (e) {
      if (e && e.message) {
        return { success: false, error: e.message };
      }
    }
  }

  if (hasChrome && typeof chrome.runtime.sendMessage === "function") {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, (response) => {
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
  }

  return { success: false, error: "Extension runtime not found in this browser" };
}

// v4.6.0: state/alarm requests are answered by the background worker (chrome.storage.local + alarms)
const STATE_TYPES = {
  NLM_STATE_GET: "nlmState.get",
  NLM_STATE_PATCH: "nlmState.patch",
  NLM_ALARM_SET: "nlmAlarm.set",
  NLM_ALARM_CLEAR: "nlmAlarm.clear"
};

function friendlyRuntimeError(res) {
  if (res && res.error && /context invalidated|Extension context/i.test(res.error)) {
    return { success: false, error: "Extension was reloaded/updated - please refresh this dashboard page (F5) and try again." };
  }
  return res;
}

async function handleIncomingCommand(payload) {
  if (!payload) return;
  const isStateReq = Object.prototype.hasOwnProperty.call(STATE_TYPES, payload.type);
  if (payload.type !== "NLM_COMMAND" && payload.type !== "NLM_CHECK_STATUS" && !isStateReq) return;

  const requestKey = payload.reqId;
  if (requestKey && handledRequests.has(requestKey)) {
    return; // Ignore duplicate transport triggers for the same request
  }

  const outgoing = isStateReq
    ? { action: STATE_TYPES[payload.type], patch: payload.patch, log: payload.log, backup: payload.backup, when: payload.when }
    : { action: "forwardToNotebookLM", payload: payload };

  const request = sendRuntimeMessage(outgoing).then(friendlyRuntimeError).catch((err) => ({ success: false, error: err.message || "Failed to communicate with extension" }));

  if (requestKey) {
    handledRequests.set(requestKey, request);
    setTimeout(() => {
      handledRequests.delete(requestKey);
      publishedRequests.delete(requestKey);
    }, REQUEST_DEDUPE_MS);
  }

  const response = await request;
  publishResponse(payload, response);
}

function publishResponse(payload, response) {
  const reqId = payload.reqId || null;
  if (reqId && publishedRequests.has(reqId)) return;
  if (reqId) publishedRequests.add(reqId);

  const isStatusCheck = payload.type === "NLM_CHECK_STATUS";
  const resType = isStatusCheck ? "NLM_CHECK_STATUS_RESPONSE" : "NLM_COMMAND_RESPONSE";

  const resultObj = {
    type: resType,
    response: response,
    reqId: reqId
  };

  const jsonStr = JSON.stringify(resultObj);

  // Channel A: DOM CustomEvent
  try {
    document.dispatchEvent(new CustomEvent("NLM_BRIDGE_RESPONSE", { detail: jsonStr }));
  } catch (e) {}

  // Channel B: window.postMessage
  try {
    window.postMessage(resultObj, "*");
  } catch (e) {}
}

// Listener 1: DOM CustomEvent
document.addEventListener("NLM_BRIDGE_REQUEST", (event) => {
  try {
    const data = typeof event.detail === "string" ? JSON.parse(event.detail) : event.detail;
    if (data) handleIncomingCommand(data);
  } catch (e) {}
});

// Listener 2: window.postMessage
window.addEventListener("message", (event) => {
  try {
    let data = event.data;
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch (e) {}
    }
    if (data && (data.type === "NLM_COMMAND" || data.type === "NLM_CHECK_STATUS" ||
        Object.prototype.hasOwnProperty.call(STATE_TYPES, data.type))) {
      handleIncomingCommand(data);
    }
  } catch (e) {}
});

// v4.5.0: background alarm -> wake the dashboard so it can resume the batch
try {
  const rt = hasBrowser ? browser.runtime : (hasChrome ? chrome.runtime : null);
  if (rt && rt.onMessage) {
    rt.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.type === "NLM_WAKE") {
        try { sendResponse({ success: true }); } catch (e) {}
        try { document.dispatchEvent(new CustomEvent("NLM_BRIDGE_WAKE", { detail: JSON.stringify({ reason: msg.reason || "alarm" }) })); } catch (e) {}
        try { window.postMessage({ type: "NLM_WAKE", reason: msg.reason || "alarm" }, "*"); } catch (e) {}
        return false;
      }
    });
  }
} catch (e) {}

document.documentElement.setAttribute("data-nlm-bridge", "active");
try {
  window.postMessage({ type: "NLM_BRIDGE_READY" }, "*");
} catch (e) {}
