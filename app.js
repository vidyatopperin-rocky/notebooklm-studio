// VidyaTopper Studio Dashboard - Dynamic CRUD & Auto-Batch Controller

let allShorts = [];
let completedPoints = new Set();
let currentFilter = "all";
let searchTerm = "";

// ================= v4.6.0: RESUME STATE (saved in chrome.storage.local via the extension) =================
// status: idle | running | limit | stopped | error | unknown | done
// ---------- v4.6.0: per-prompt Studio outputs, presets, run log ----------
const OUTPUT_DEFS = [
  { id: "video", label: "🎬 Video" },
  { id: "audio", label: "🎧 Audio" },
  { id: "mindmap", label: "🧠 Mind map" },
  { id: "study_guide", label: "📘 Study guide" },
  { id: "briefing", label: "📄 Briefing doc" },
  { id: "faq", label: "❓ FAQ" },
  { id: "blog", label: "✍️ Blog post" },
  { id: "timeline", label: "🕒 Timeline (custom)" },
  { id: "flashcards", label: "🃏 Flashcards" },
  { id: "quiz", label: "📝 Quiz" },
  { id: "slides", label: "🖼️ Slide deck" },
  { id: "infographic", label: "📊 Infographic" },
  { id: "datatable", label: "🔢 Data table" },
  // v5.2.0 - real options inside each output (labels read on the live NotebookLM page, 6 Nov 2026)
  { id: "audio_deep", label: "🎧 Audio · Deep dive" },
  { id: "audio_brief", label: "🎧 Audio · Brief" },
  { id: "audio_critique", label: "🎧 Audio · Critique" },
  { id: "audio_debate", label: "🎧 Audio · Debate" },
  { id: "video_cinematic", label: "🎬 Video · Cinematic" },
  { id: "video_explainer", label: "🎬 Video · Explainer" },
  { id: "report_interactive", label: "📘 Report · Interactive" },
  { id: "slides_detailed", label: "🖼️ Slides · Detailed deck" },
  { id: "slides_presenter", label: "🖼️ Slides · Presenter slides" },
  { id: "flashcards_easy", label: "🃏 Flashcards · Fewer + Easy" },
  { id: "flashcards_hard", label: "🃏 Flashcards · More + Hard" },
  { id: "quiz_easy", label: "📝 Quiz · Easy" },
  { id: "quiz_hard", label: "📝 Quiz · Hard" },
  { id: "infographic_portrait", label: "📊 Infographic · Portrait" },
  { id: "infographic_sketch", label: "📊 Infographic · Sketch note" },
  { id: "infographic_scientific", label: "📊 Infographic · Scientific" },
  { id: "infographic_instructional", label: "📊 Infographic · Instructional" },
  { id: "infographic_bento", label: "📊 Infographic · Bento grid" },
  { id: "notes", label: "🗒️ Note (chat answer)" }
];

// v5.3.1 - outputs grouped by category (flat list of 33 chips looked mixed up). Sub-options (format/length/difficulty/style) live in the Output options panel.
const OUT_CATS = [
  { title: "🎬 Video & Audio", ids: ["video", "audio"] },
  { title: "📚 Notes & Reports", ids: ["study_guide", "briefing", "faq", "blog", "timeline", "report_interactive", "notes"] },
  { title: "🖼️ Visual", ids: ["mindmap", "infographic", "slides", "datatable"] },
  { title: "🃏 Practice", ids: ["flashcards", "quiz"] }
];

// v5.4.0 - Studio-style picker on every card: type tabs on top -> click one -> its own categories/options below -> include it.
const PICK_TYPES = [
  { id: "video", label: "🎬 Video" }, { id: "audio", label: "🎧 Audio" }, { id: "mindmap", label: "🧠 Mind map" },
  { id: "reports", label: "📘 Reports" }, { id: "slides", label: "🖼️ Slides" }, { id: "infographic", label: "📊 Infographic" },
  { id: "datatable", label: "🔢 Data table" }, { id: "flashcards", label: "🃏 Flashcards" }, { id: "quiz", label: "📝 Quiz" }, { id: "notes", label: "🗒️ Note" }
];
const REPORT_IDS = [["study_guide", "Study guide"], ["briefing", "Briefing doc"], ["faq", "FAQ"], ["blog", "Blog post"], ["timeline", "Timeline"], ["report_interactive", "Interactive"]];

// v6.0.0 - SECTIONS: every prompt belongs to ONE type (Video / Audio / Reports / ...). Paste a mixed pile -> auto-sorted -> open a section to see only its prompts.
let currentSection = (function () { try { return localStorage.getItem("nlm_section") || "all"; } catch (e) { return "all"; } })();
const TYPE_RULES = [
  ["audio", /audio overview|podcast|deep dive|debate|critique|\baudio\b|ऑडियो|पॉडकास्ट/i],
  ["mindmap", /mind ?map|माइंड ?मैप/i],
  ["infographic", /infographic|इन्फोग्राफिक/i],
  ["slides", /slide|presentation|\bppt\b|स्लाइड/i],
  ["flashcards", /flash ?card|फ्लैश/i],
  ["quiz", /\bquiz\b|\bmcq\b|क्विज़|क्विज/i],
  ["datatable", /data ?table|\btable\b|टेबल/i],
  ["reports", /study guide|briefing|\bfaq\b|blog|\breport\b|timeline|रिपोर्ट/i],
  ["notes", /\bnote\b|\bnotes\b|summary|सारांश/i],
  ["video", /video|short|reel|वीडियो|शॉर्ट/i]
];
function classifyPrompt(text) {
  const t = String(text || "");
  for (const r of TYPE_RULES) if (r[1].test(t)) return r[0];
  return "video";
}
function typeOf(item) {
  if (!item) return "video";
  if (!item.type || !PICK_TYPES.some((p) => p.id === item.type)) item.type = classifyPrompt((item.title || "") + " " + (item.prompt || "")) ;
  return item.type;
}
function reportIdOf(item) {
  const o = loadOutOpts(); const r = (item && item.report) || (o.reports && o.reports.Type) || "study_guide";
  return REPORT_IDS.some((x) => x[0] === r) ? r : "study_guide";
}
function loadOutOpts() { try { return JSON.parse(localStorage.getItem("nlm_out_opts") || "{}"); } catch (e) { return {}; } }
function saveOutOpts(o) { try { localStorage.setItem("nlm_out_opts", JSON.stringify(o)); } catch (e) {} }
function sectionCounts() {
  const c = { all: allShorts.length }; PICK_TYPES.forEach((t) => (c[t.id] = 0));
  allShorts.forEach((s) => { c[typeOf(s)] = (c[typeOf(s)] || 0) + 1; });
  return c;
}
function renderGlobalPicker() {
  const box = document.getElementById("global-picker"); if (!box) return;
  document.body.dataset.sec = currentSection;
  const c = sectionCounts();
  let tabs = `<button type="button" class="pk-tab ${currentSection === "all" ? "active" : ""}" onclick="gSection('all')">📚 Sab <b>${c.all}</b></button>`;
  tabs += PICK_TYPES.map((t) => `<button type="button" class="pk-tab ${currentSection === t.id ? "active" : ""} ${c[t.id] ? "on" : "empty"}" onclick="gSection('${t.id}')">${t.label} <b>${c[t.id] || 0}</b></button>`).join("");
  let body = "";
  if (currentSection === "all") {
    body = `<div class="pk-hint">Saare prompts yahan hain, type ke hisaab se alag sections upar hain. Kisi section par click karo to sirf usi ke prompts dikhenge aur uske options milenge.</div>`;
  } else {
    const t = PICK_TYPES.find((x) => x.id === currentSection); const opts = loadOutOpts(); const sv = opts[currentSection] || {};
    body = `<div class="pk-sec-title">${t.label} ke options <small>(sirf is section ke ${c[currentSection] || 0} prompts par lagenge)</small></div>`;
    if (currentSection === "reports") {
      const cur = reportIdOf({});
      body += `<div class="pk-group"><span class="pk-gname">Type</span>${REPORT_IDS.map((r) => `<button type="button" class="pk-opt ${cur === r[0] ? "sel" : ""}" onclick="gReport('${r[0]}')">${r[1]}</button>`).join("")}</div>`;
    } else if (OUT_OPT_GROUPS[currentSection]) {
      body += OUT_OPT_GROUPS[currentSection].groups.map((g, gi) => `<div class="pk-group"><span class="pk-gname">${g[0]}</span>${g[1].map((o, oi) => `<button type="button" class="pk-opt ${sv[g[0]] === o ? "sel" : ""}" onclick="gOpt('${currentSection}', ${gi}, ${oi})">${o}</button>`).join("")}</div>`).join("");
      body += `<div class="pk-hint">Kuch na chuno to NotebookLM ka default. Dobara dabane par hat jaata hai.</div>`;
    } else body += `<div class="pk-hint">Iske alag options nahi hote.</div>`;
  }
  box.innerHTML = `<div class="pk-tabs">${tabs}</div><div class="pk-body">${body}</div>`;
}
window.gSection = function (t) { currentSection = t; try { localStorage.setItem("nlm_section", t); } catch (e) {} renderGlobalPicker(); renderAllShortsCards(); };
window.gReport = function (id) { const o = loadOutOpts(); o.reports = Object.assign({}, o.reports || {}, { Type: id }); saveOutOpts(o); renderGlobalPicker(); renderAllShortsCards(); };
window.gOpt = function (mode, gi, oi) {
  const g = OUT_OPT_GROUPS[mode].groups[gi]; const val = g[1][oi]; const o = loadOutOpts(); o[mode] = o[mode] || {};
  if (mode === "audio" && g[0].indexOf("Length") === 0 && !longOk(o.audio || {}, val)) return;
  const clear = o[mode][g[0]] === val; if (clear) delete o[mode][g[0]]; else o[mode][g[0]] = val; saveOutOpts(o);
  allShorts.forEach((s) => { if (typeOf(s) === mode) { s.opts = s.opts || {}; if (clear) delete s.opts[g[0]]; else s.opts[g[0]] = val; } });
  saveShortsData(); renderGlobalPicker(); renderAllShortsCards();
};
window.setItemType = function (num, t) { const it = allShorts.find((s) => s.number === num); if (!it) return; it.type = t; if (todoOutputs(it).length > 0) completedPoints.delete(num); saveShortsData(); saveCompletedState(); renderGlobalPicker(); renderAllShortsCards(); };

// output id -> which Studio flow to run + the exact option labels to click inside its dialog
const OUTPUT_VARIANTS = {
  audio_deep:      { mode: "audio", choices: ["Deep dive"] },
  audio_brief:     { mode: "audio", choices: ["Brief"] },
  audio_critique:  { mode: "audio", choices: ["Critique"] },
  audio_debate:    { mode: "audio", choices: ["Debate"] },
  video_cinematic: { mode: "video", choices: ["Cinematic"] },
  video_explainer: { mode: "video", choices: ["Explainer"] },
  report_interactive: { mode: "report_interactive" },
  slides_detailed:  { mode: "slides", choices: ["Detailed deck"] },
  slides_presenter: { mode: "slides", choices: ["Presenter slides"] },
  flashcards_easy:  { mode: "flashcards", choices: ["Fewer", "Easy"] },
  flashcards_hard:  { mode: "flashcards", choices: ["More", "Hard"] },
  quiz_easy:        { mode: "quiz", choices: ["Easy"] },
  quiz_hard:        { mode: "quiz", choices: ["Hard"] },
  infographic_portrait:     { mode: "infographic", choices: ["Portrait"] },
  infographic_sketch:       { mode: "infographic", choices: ["Sketch note"] },
  infographic_scientific:   { mode: "infographic", choices: ["Scientific"] },
  infographic_instructional:{ mode: "infographic", choices: ["Instructional"] },
  infographic_bento:        { mode: "infographic", choices: ["Bento grid"] }
};
const OUTPUT_LABEL = Object.fromEntries(OUTPUT_DEFS.map((o) => [o.id, o.label]));
const OUTPUT_PRESETS = {
  video_only: { label: "Video only (v4.5 jaisa)", outputs: ["video"] },
  audio_only: { label: "Audio only", outputs: ["audio"] },
  everything_v5: { label: "Sab kuch (v5: sab outputs)", outputs: ["audio", "video", "mindmap", "study_guide", "briefing", "faq", "timeline", "flashcards", "quiz", "slides", "infographic", "datatable", "notes"] },
  full_study_pack: { label: "Full study pack", outputs: ["audio", "video", "mindmap", "study_guide", "faq", "timeline", "notes"] }
};
// a card without an outputs list is a v4.5 card: it sends the video only
function outputsOf(item) {
  const t = typeOf(item);
  return [t === "reports" ? reportIdOf(item) : t].filter((o) => OUTPUT_LABEL[o]);
}
function doneOutputsOf(item) { return item && Array.isArray(item.doneOutputs) ? item.doneOutputs : []; }
function todoOutputs(item) {
  const done = doneOutputsOf(item);
  return outputsOf(item).filter((o) => !done.includes(o));
}
function isAudioOutput(outId) {
  if (!outId) return false;
  const s = String(outId).toLowerCase();
  return s === "audio" || s.startsWith("audio_") || s.includes("audio");
}
function isAudioItem(item) {
  if (!item) return false;
  if (typeOf(item) === "audio") return true;
  const todos = todoOutputs(item);
  if (todos.some(isAudioOutput)) return true;
  const outs = outputsOf(item);
  if (outs.some(isAudioOutput)) return true;
  return false;
}
function markOutputDone(num, outId) {
  const item = allShorts.find((s) => s.number === num);
  if (!item) return;
  item.doneOutputs = Array.from(new Set([...doneOutputsOf(item), outId]));
  saveShortsData();
  const el = document.getElementById(`out-status-${num}`);
  if (el) el.textContent = `✓ sent: ${doneOutputsOf(item).map((o) => OUTPUT_LABEL[o] || o).join(", ")}`;
  if (todoOutputs(item).length === 0) markCardCompleted(num, true);
}
window.toggleOutput = function (num, outId, checked) {
  const item = allShorts.find((s) => s.number === num);
  if (!item) return;
  const set = new Set(outputsOf(item));
  if (checked) set.add(outId); else set.delete(outId);
  item.outputs = Array.from(set);
  if (todoOutputs(item).length > 0 && completedPoints.has(num)) completedPoints.delete(num);
  saveShortsData();
  saveCompletedState();
  renderAllShortsCards();
};
window.applyOutputPreset = function (name) {
  const p = OUTPUT_PRESETS[name];
  if (!p) return;
  allShorts.forEach((s) => {
    s.outputs = [...p.outputs];
    if (todoOutputs(s).length > 0) completedPoints.delete(s.number);
  });
  saveShortsData();
  saveCompletedState();
  renderAllShortsCards();
  addLog(`🧩 Preset "${p.label}" sab prompts par laga: ${p.outputs.map((o) => OUTPUT_LABEL[o]).join(", ")}`, "ready");
};
function downloadRunLog() {
  const header = [
    "NotebookLM Studio Hub v4.6.0 - run log",
    `exported: ${new Date().toISOString()}`,
    `settings: ${JSON.stringify(nlmState.settings || {})}`,
    `resume from: ${nlmState.resumeFromPoint ?? "none"}   status: ${nlmState.status || "idle"}`,
    ""
  ];
  const lines = (nlmState.log || []).map((e) => `${e.t}\t${(e.level || "").padEnd(7)}\t${e.text}`);
  const blob = new Blob([header.concat(lines).join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nlm-studio-run-log-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
}

let nlmState = {
  status: "idle",
  resumeFromPoint: null,   // the prompt number to continue from ("Resume from prompt N")
  lastDonePoint: null,
  inFlightPoint: null,     // prompt currently being sent (so a reload mid-send is never silently re-sent)
  limitHitAt: null,
  resetText: "",
  resumeAtMs: null,
  lastMessage: "",
  settings: { allowLater: false, focusTab: true, autoResume: false, waitFinish: false },
  log: [],
  updatedAt: 0
};
let freshInstall = false;
let logQueue = [];
let logFlushTimer = null;
let backupTimer = null;
let autoResumeTimer = null;
let commandInFlight = false;

document.addEventListener("DOMContentLoaded", () => {
  initBrowserDetection();
  freshInstall = localStorage.getItem("vt_user_shorts") === null;
  loadShortsData();
  loadCompletedState();
  renderAllShortsCards();
  setupFilterAndSearch();
  setupCardManagement();
  setupAutoSplit();
  setupAutoBatchControls();
  setupCustomGenerator();
  initBridgeHeartbeat();
  initResumeState();
});

function loadShortsData() {
  try {
    const saved = localStorage.getItem("vt_user_shorts");
    if (saved !== null) {
      allShorts = JSON.parse(saved);
      return;
    }
  } catch (e) {}

  allShorts = Array.isArray(window.DEFAULT_SHORTS) ? [...window.DEFAULT_SHORTS] : [];
  saveShortsData();
}

function saveShortsData() {
  try { allShorts.forEach((s) => typeOf(s)); } catch (e) {}
  try {
    localStorage.setItem("vt_user_shorts", JSON.stringify(allShorts));
  } catch (e) {}
  try { renderGlobalPicker(); renderBatchStrip(); } catch (e) {}
  scheduleBackup();
}

function loadCompletedState() {
  try {
    const saved = localStorage.getItem("vt_completed_points");
    if (saved) {
      completedPoints = new Set(JSON.parse(saved));
    }
  } catch (e) {
    completedPoints = new Set();
  }
}

function saveCompletedState() {
  try {
    localStorage.setItem("vt_completed_points", JSON.stringify(Array.from(completedPoints)));
  } catch (e) {}
  scheduleBackup();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderAllShortsCards() {
  const container = document.getElementById("shorts-cards-container");
  if (!container) return;
  container.innerHTML = "";

  if (!allShorts || allShorts.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <span class="empty-icon">📭</span>
        <h3>Koi Prompt Nahi Hai</h3>
        <p>Aapki prompts grid bilkul khali hai. Naya prompt add karne ke liye upar <b>"+ Add Prompt"</b> dabayein ya <b>Smart Prompt Splitter</b> box mein apne prompts paste karein.</p>
        <div style="display:flex; gap:10px; margin-top:12px;">
          <button class="btn-action-green" onclick="openAddModal()">➕ Add Prompt</button>
        </div>
      </div>
    `;
    updateProgressDisplay();
    return;
  }

  allShorts.forEach((item) => {
    if (currentSection !== "all" && typeOf(item) !== currentSection) return;
    const isDone = completedPoints.has(item.number);

    const card = document.createElement("div");
    card.className = `short-card ${isDone ? "completed" : ""}`;
    card.id = `short-card-${item.number}`;
    card.dataset.num = item.number;
    card.dataset.title = (item.title || "").toLowerCase();

    card.innerHTML = `
      <div class="short-card-header">
        <div class="short-card-header-left">
          <span class="short-badge-num">${item.label || item.number}</span>
          <span class="short-card-title">${escapeHtml(item.title || "Prompt " + (item.label || item.number))}</span>
          <span class="type-badge t-${typeOf(item)}">${(PICK_TYPES.find((p) => p.id === typeOf(item)) || {}).label || ""}</span>
        </div>
        <div class="short-card-header-actions">
          <button class="btn-card-action" onclick="moveItem(${item.number}, -1)" title="Upar le jao">▲</button>
          <button class="btn-card-action" onclick="moveItem(${item.number}, 1)" title="Neeche le jao">▼</button>
          <button class="btn-card-action btn-edit-card" onclick="openEditModal(${item.number})" title="Edit Number, Title or Prompt">✏️</button>
          <button class="btn-card-action btn-del-card" onclick="deleteSingleCard(${item.number})" title="Delete this card">🗑️</button>
          <label class="short-status-indicator" title="Toggle completion">
            <input type="checkbox" class="tick-checkbox" ${isDone ? "checked" : ""} onchange="toggleCardCheck(${item.number})" />
            <span class="tick-label">${isDone ? "✓ Done" : "Done"}</span>
          </label>
        </div>
      </div>

      <textarea id="prompt-text-${item.number}" class="short-prompt-box" oninput="autoSavePrompt(${item.number}, this.value)" placeholder="Enter prompt text here...">${escapeHtml(item.prompt || "")}</textarea>

      
      <div class="will-make"><div class="wm-line">Banega: <b>${escapeHtml(optsSummary(item))}</b></div>
        <div class="wm-ctl">Type: <select onchange="setItemType(${item.number}, this.value)">${PICK_TYPES.map((p) => `<option value="${p.id}" ${p.id === typeOf(item) ? "selected" : ""}>${p.label}</option>`).join("")}</select>
        ${(OUT_OPT_GROUPS[typeOf(item)] ? OUT_OPT_GROUPS[typeOf(item)].groups : []).map((g) => `<span class="wm-g">${escapeHtml(g[0].split(" (")[0])}: <select onchange="setItemOpt(${item.number}, '${g[0].replace(/'/g, "")}', this.value)"><option value="">default</option>${g[1].map((o) => `<option value="${o}" ${((item.opts || {})[g[0]] === o) ? "selected" : ""}>${o}</option>`).join("")}</select></span>`).join("")}</div></div>
      <div class="out-status" id="out-status-${item.number}">${doneOutputsOf(item).length ? "✓ sent: " + doneOutputsOf(item).map((o) => OUTPUT_LABEL[o] || o).join(", ") : ""}</div>

      <div class="short-card-footer">
        <button class="btn-send-single" onclick="sendSingleShort(${item.number})">
          <span>${isDone ? "✓ Sent (Send Again)" : "🚀 Send to NotebookLM"}</span>
        </button>
        <button class="btn-resume-here" onclick="setResumePoint(${item.number})" title="Auto-Batch isi prompt se shuru hoga">⏭ Resume yahan se</button>
      </div>
    `;

    container.appendChild(card);
  });

  if (container && currentSection !== "all" && !container.children.length) container.innerHTML = `<div class="empty-section">Is section mein abhi koi prompt nahi hai. Upar "Sab" mein dekho ya prompt paste karo.</div>`;
  updateProgressDisplay();
  applyFilterAndSearch();
}

window.autoSavePrompt = function (num, val) {
  const item = allShorts.find((s) => s.number === num);
  if (item) {
    item.prompt = val;
    saveShortsData();
  }
};

window.deleteSingleCard = function (num) {
  const item = allShorts.find((s) => s.number === num);
  const title = item ? `"${item.title}"` : `Point ${num}`;

  if (confirm(`Kya aap Point ${num} (${title}) ko delete karna chahte hain?`)) {
    allShorts = allShorts.filter((s) => s.number !== num);
    completedPoints.delete(num);
    saveShortsData();
    saveCompletedState();
    renderAllShortsCards();
    updateGlobalStatus(`Point ${num} delete kar diya gaya hai.`, "ready");
  }
};

window.clearAllCards = function () {
  if (allShorts.length === 0) {
    alert("List pehle se hi khali hai!");
    return;
  }
  if (confirm("⚠️ KYA AAP SACH MEIN SAARI CARDS DELETE KARNA CHAHTE HAIN?\n\nSabhi prompts hat jayenge aur grid bilkul khali ho jayegi.")) {
    allShorts = [];
    completedPoints.clear();
    saveShortsData();
    saveCompletedState();
    renderAllShortsCards();
    updateGlobalStatus("🗑️ Saari cards delete kar di gayi hain. Grid khali hai.", "ready");
  }
};

window.openAddModal = function () {
  const maxNum = allShorts.reduce((max, s) => Math.max(max, parseInt(s.number, 10) || 0), 0);
  document.getElementById("modal-editor-title").textContent = "➕ Add New Prompt";
  document.getElementById("modal-edit-id").value = "";
  document.getElementById("modal-card-num").value = maxNum > 0 ? maxNum + 1 : 1;
  document.getElementById("modal-card-title").value = "";
  document.getElementById("modal-card-prompt").value = "";
  document.getElementById("modal-card-editor").style.display = "flex";
};

window.openEditModal = function (num) {
  const item = allShorts.find((s) => s.number === num);
  if (!item) return;

  document.getElementById("modal-editor-title").textContent = `✏️ Edit Point ${num}`;
  document.getElementById("modal-edit-id").value = num;
  document.getElementById("modal-card-num").value = item.number;
  document.getElementById("modal-card-title").value = item.title || "";
  document.getElementById("modal-card-prompt").value = item.prompt || "";
  document.getElementById("modal-card-editor").style.display = "flex";
};

window.closeEditorModal = function () {
  document.getElementById("modal-card-editor").style.display = "none";
};

window.saveEditorModalCard = function () {
  const editId = document.getElementById("modal-edit-id").value;
  const numVal = parseInt(document.getElementById("modal-card-num").value, 10);
  const titleVal = document.getElementById("modal-card-title").value.trim();
  const promptVal = document.getElementById("modal-card-prompt").value.trim();

  if (isNaN(numVal) || numVal <= 0) {
    alert("Kripya ek valid Point Number daalein (e.g. 1, 2, 65).");
    return;
  }
  if (!titleVal) {
    alert("Kripya Topic / Title daalein.");
    return;
  }
  if (!promptVal) {
    alert("Kripya Prompt Text daalein.");
    return;
  }

  if (editId) {
    const oldNum = parseInt(editId, 10);
    const existing = allShorts.find((s) => s.number === oldNum);
    if (existing) {
      if (numVal !== oldNum && allShorts.some((s) => s.number === numVal)) {
        alert(`Point ${numVal} pehle se exist karta hai! Kripya doosra number chunein.`);
        return;
      }

      existing.number = numVal;
      existing.title = titleVal;
      existing.prompt = promptVal;

      if (numVal !== oldNum && completedPoints.has(oldNum)) {
        completedPoints.delete(oldNum);
        completedPoints.add(numVal);
        saveCompletedState();
      }
    }
  } else {
    if (allShorts.some((s) => s.number === numVal)) {
      alert(`Point ${numVal} pehle se exist karta hai! Kripya doosra number chunein.`);
      return;
    }

    allShorts.push({
      number: numVal,
      title: titleVal,
      prompt: promptVal
    });
  }

  allShorts.sort((a, b) => a.number - b.number);
  saveShortsData();
  renderAllShortsCards();
  closeEditorModal();

  const newCard = document.getElementById(`short-card-${numVal}`);
  if (newCard) {
    newCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  updateGlobalStatus(`✓ Point ${numVal} save ho gaya!`, "success");
};

function setupCardManagement() {
  document.getElementById("btn-open-add-card")?.addEventListener("click", openAddModal);
  document.getElementById("btn-clear-all-cards")?.addEventListener("click", clearAllCards);

  document.getElementById("btn-export-json")?.addEventListener("click", exportPromptsToJson);
  document.getElementById("btn-export-section")?.addEventListener("click", exportSection);
  document.getElementById("btn-import-section-trigger")?.addEventListener("click", () => document.getElementById("input-import-section")?.click());
  document.getElementById("input-import-section")?.addEventListener("change", (e) => { const f = e.target.files?.[0]; if (f) { importSectionFile(f); e.target.value = ""; } });
  document.getElementById("btn-import-json-trigger")?.addEventListener("click", () => {
    document.getElementById("input-import-json")?.click();
  });
  document.getElementById("input-import-json")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importPromptsFromJson(file);
      e.target.value = "";
    }
  });
}

function initBrowserDetection() {
  const ua = navigator.userAgent;
  let browserName = "Browser";
  let icon = "🌐";

  if (ua.includes("Firefox/")) {
    browserName = "Mozilla Firefox";
    icon = "🦊";
  } else if (ua.includes("Edg/")) {
    browserName = "Microsoft Edge";
    icon = "🌊";
  } else if (ua.includes("OPR/") || ua.includes("Opera/")) {
    browserName = "Opera Browser";
    icon = "⭕";
  } else if (navigator.brave && typeof navigator.brave.isBrave === "function") {
    browserName = "Brave Browser";
    icon = "🦁";
  } else if (ua.includes("Chrome/")) {
    browserName = "Google Chrome";
    icon = "🧭";
  }

  const nameEl = document.getElementById("browser-name");
  const iconEl = document.getElementById("browser-icon");
  if (nameEl) nameEl.textContent = `Profile: ${browserName}`;
  if (iconEl) iconEl.textContent = icon;
}

function exportPromptsToJson() {
  const browserLabel = document.getElementById("browser-name")?.textContent || "Browser";
  const data = {
    exportDate: new Date().toISOString(),
    browser: browserLabel,
    totalPrompts: allShorts.length,
    completedPoints: Array.from(completedPoints),
    shorts: allShorts
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notebooklm_prompts_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  updateGlobalStatus("✓ Prompts backup JSON successfully download ho gaya!", "success");
}

function importPromptsFromJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        allShorts = data;
      } else if (data && Array.isArray(data.shorts)) {
        allShorts = data.shorts;
        if (Array.isArray(data.completedPoints)) {
          completedPoints = new Set(data.completedPoints);
          saveCompletedState();
        }
      } else {
        alert("⚠️ Invalid backup JSON file! Isme prompts nahi mile.");
        return;
      }
      saveShortsData();
      renderAllShortsCards();
      updateGlobalStatus(`✓ ${allShorts.length} prompts JSON file se successfully load ho gaye!`, "success");
    } catch (err) {
      alert("⚠️ JSON file parse karne mein error aaya: " + err.message);
    }
  };
  reader.readAsText(file);
}

function checkBridgeHeartbeat() {
  if (batchRunning || commandInFlight) return;

  const statusEl = document.getElementById("sidebar-bridge-status");
  const dotEl = document.getElementById("sidebar-bridge-dot");
  if (!statusEl || !dotEl) return;

  const isBridgeInjected = document.documentElement.getAttribute("data-nlm-bridge") === "active";

  sendToBridge({ type: "NLM_CHECK_STATUS" }, 3500)
    .then((res) => {
      if (res && res.success) {
        dotEl.className = "pulse-dot active-green";
        statusEl.textContent = "Live Extension • Ready";
      } else if (res && res.error && (res.error.toLowerCase().includes("not open") || res.error.toLowerCase().includes("notebooklm tab"))) {
        dotEl.className = "pulse-dot active-yellow";
        statusEl.textContent = "Open NotebookLM Tab";
      } else if (isBridgeInjected) {
        dotEl.className = "pulse-dot active-yellow";
        statusEl.textContent = "Open NotebookLM Tab";
      } else {
        dotEl.className = "pulse-dot active-red";
        statusEl.textContent = "Extension Inactive";
      }
    })
    .catch(() => {
      if (isBridgeInjected) {
        dotEl.className = "pulse-dot active-yellow";
        statusEl.textContent = "Open NotebookLM Tab";
      } else {
        dotEl.className = "pulse-dot active-red";
        statusEl.textContent = "Extension Inactive";
      }
    });
}

function initBridgeHeartbeat() {
  setTimeout(checkBridgeHeartbeat, 600);
  setInterval(checkBridgeHeartbeat, 5000);
}

let lastSingleClickTime = 0;

window.sendSingleShort = async function (num) {
  const item = allShorts.find((s) => s.number === num);
  if (!item) return;

  const isAudio = isAudioItem(item);
  const requiredGapMs = isAudio ? 25000 : 15000;
  const requiredGapSec = isAudio ? 25 : 15;
  const now = Date.now();
  if (now - lastSingleClickTime < requiredGapMs) {
    const waitSec = Math.ceil((requiredGapMs - (now - lastSingleClickTime)) / 1000);
    updateGlobalStatus(`⏳ Kripya ${waitSec}s intezar karein... NotebookLM ko ${isAudio ? "Audio" : "Video"} process hone mein ${requiredGapSec}s ka gap chahiye.`, "ready");
    return;
  }
  if (!confirm(`Prompt ${item.label || num} bhejna hai?\n\nBanega: ${optsSummary(item)}\n\nSahi hai to OK dabao.`)) return;
  lastSingleClickTime = now;

  const promptText = document.getElementById(`prompt-text-${num}`)?.value.trim() || item.prompt;
  const card = document.getElementById(`short-card-${num}`);
  if (card) card.classList.add("running");

  updateGlobalStatus(`Point ${num}: NotebookLM mein bhej rahe hain...`, "ready");

  const outId = todoOutputs(item)[0] || outputsOf(item)[0] || "video";
  commandInFlight = true;
  persistState({ inFlightPoint: num, inFlightOutput: outId });
  const res = await sendToBridge(buildCommand(promptText, num, outId), COMMAND_TIMEOUT_MS);
  commandInFlight = false;
  persistState({ inFlightPoint: null, inFlightOutput: null });

  if (card) card.classList.remove("running");

  if (res && res.success) {
    markOutputDone(num, outId);
    persistState({ lastDonePoint: num, lastMessage: `P${num} sent` });
    if (res.confirmed === false) {
      updateGlobalStatus(`⚠️ Point ${num}: Generate click ho gaya par dialog band hone ka confirmation nahi mila - NotebookLM Studio mein check kar lein.`, "ready");
    } else if (res.action === "later") {
      updateGlobalStatus(`⏳ Limit reached: Point ${num} ke liye 'Generate later' daba kar queue kiya!`, "success");
    } else {
      updateGlobalStatus(`✓ Point ${num}: Successfully Generate ho gaya!`, "success");
    }
  } else {
    const errStr = res?.error || "Could not generate on NotebookLM";
    updateGlobalStatus(`⚠️ Point ${num} Error: ${errStr}`, "error");
    if (res?.quotaExhausted || errStr.toLowerCase().includes("limit reached")) {
      handleLimitHit(num, errStr, false);
      alert(`🛑 NotebookLM AI Usage Limit Reached!\n\n${errStr}\n\nResume point saved: Prompt P${num}.`);
    }
  }
};

window.toggleCardCheck = function (num) {
  const isDone = completedPoints.has(num);
  markCardCompleted(num, !isDone);
};

function markCardCompleted(num, isCompleted) {
  const card = document.getElementById(`short-card-${num}`);
  if (!card) return;

  const checkbox = card.querySelector(".tick-checkbox");
  const tickLabel = card.querySelector(".tick-label");
  const btn = card.querySelector(".btn-send-single span");

  if (isCompleted) {
    completedPoints.add(num);
    card.classList.add("completed");
    if (checkbox) checkbox.checked = true;
    if (tickLabel) tickLabel.textContent = "✓ Done";
    if (btn) btn.textContent = "✓ Sent (Send Again)";
  } else {
    completedPoints.delete(num);
    card.classList.remove("completed");
    if (checkbox) checkbox.checked = false;
    if (tickLabel) tickLabel.textContent = "Done";
    if (btn) btn.textContent = "🚀 Send to NotebookLM";
  }

  saveCompletedState();
  updateProgressDisplay();
  applyFilterAndSearch();
}

function updateProgressDisplay() {
  const total = allShorts.length;
  const completed = completedPoints.size;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  const countText = document.getElementById("progress-text");
  const fill = document.getElementById("progress-fill");

  if (countText) countText.textContent = `${completed} / ${total} Completed (${Math.round(pct)}%)`;
  if (fill) fill.style.width = `${pct}%`;

  const countAll = document.getElementById("count-all");
  const countPending = document.getElementById("count-pending");
  const countComp = document.getElementById("count-completed");

  if (countAll) countAll.textContent = total;
  if (countPending) countPending.textContent = Math.max(0, total - completed);
  if (countComp) countComp.textContent = completed;
}

function setupFilterAndSearch() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      applyFilterAndSearch();
    });
  });

  const searchInp = document.getElementById("shorts-search-input");
  if (searchInp) {
    searchInp.addEventListener("input", (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      applyFilterAndSearch();
    });
  }

  document.getElementById("btn-reset-progress")?.addEventListener("click", () => {
    if (confirm("Kya aap saare completed ticks reset karna chahte hain?")) {
      completedPoints.clear();
      allShorts.forEach((s) => { s.doneOutputs = []; });
      saveShortsData();
      saveCompletedState();
      renderAllShortsCards();
    }
  });
}

let pasteType = null; let pasteOpts = {};
function renderPasteChooser() {
  const box = document.getElementById("paste-type-box"); if (!box) return;
  let h = `<div class="pc-title">1️⃣ Ye prompts kis cheez ke liye hain? <small>(ek chuno)</small></div><div class="pc-types">` +
    PICK_TYPES.map((p) => `<button type="button" class="pc-btn ${pasteType === p.id ? "sel" : ""}" onclick="pasteSetType('${p.id}')">${p.label}</button>`).join("") +
    `<button type="button" class="pc-btn ${pasteType === "auto" ? "sel" : ""}" onclick="pasteSetType('auto')">🔎 Mixed (khud pehchano)</button></div>`;
  let need = [];
  if (pasteType && pasteType !== "auto") {
    if (pasteType === "reports") {
      h += `<div class="pc-title">2️⃣ Konsa Report? <small>(zaroori)</small></div><div class="pc-opts">` + REPORT_IDS.map((r) => `<button type="button" class="pc-opt ${pasteOpts.Type === r[0] ? "sel" : ""}" onclick="pasteSetOpt('Type','${r[0]}')">${r[1]}</button>`).join("") + `</div>`;
      if (!pasteOpts.Type) need.push("Report ka type");
    } else if (OUT_OPT_GROUPS[pasteType]) {
      h += `<div class="pc-title">2️⃣ ${OUT_OPT_GROUPS[pasteType].label} ke options</div>`;
      OUT_OPT_GROUPS[pasteType].groups.forEach((g, gi) => {
        const req = gi === 0;
        h += `<div class="pc-group"><span class="pc-gname">${escapeHtml(g[0])}${req ? " <em>(zaroori)</em>" : ""}</span>` + g[1].map((o, oi) => `<button type="button" class="pc-opt ${pasteOpts[g[0]] === o ? "sel" : ""}" onclick="pasteSetOptI('${pasteType}',${gi},${oi})">${o}</button>`).join("") + `</div>`;
        if (req && !pasteOpts[g[0]]) need.push(g[0].split(" (")[0]);
      });
    } else h += `<div class="pc-hint">Iske alag options nahi hote.</div>`;
  } else if (!pasteType) need.push("type");
  const lab = pasteType === "auto" ? "Mixed: har prompt apne shabdon se type mein jayega" : pasteType ? ((PICK_TYPES.find((p) => p.id === pasteType) || {}).label + " → " + (Object.values(pasteOpts).map((v) => (REPORT_IDS.find((r) => r[0] === v) || [0, v])[1]).join(" · ") || "default")) : "abhi kuch nahi chuna";
  h += `<div class="pc-summary ${need.length ? "bad" : "ok"}">${need.length ? "⚠️ Pehle chuno: " + need.join(", ") : "✅ Sab prompts banenge: <b>" + lab + "</b>"}</div>`;
  box.innerHTML = h;
  const btn = document.getElementById("btn-auto-split"); if (btn) { btn.disabled = need.length > 0; btn.style.opacity = need.length ? ".45" : "1"; }
}
window.pasteSetType = function (t) { pasteType = t; pasteOpts = {}; renderPasteChooser(); };

function longOk(opts, val) {
  if (val !== "Long") return true;
  const f = opts && (opts.Format);
  if (f && f !== "Deep dive") { alert("Long length sirf 'Deep dive' format mein milta hai (asli NotebookLM par check kiya). Pehle Format mein Deep dive chuno, ya Short/Default lo."); return false; }
  return true;
}
window.pasteSetOpt = function (g, v) {
  if (g.indexOf("Length") === 0 && !longOk(pasteOpts, v)) return; pasteOpts[g] = pasteOpts[g] === v ? undefined : v; if (pasteOpts[g] === undefined) delete pasteOpts[g]; renderPasteChooser(); };
window.pasteSetOptI = function (mode, gi, oi) { const g = OUT_OPT_GROUPS[mode].groups[gi]; window.pasteSetOpt(g[0], g[1][oi]); };

function setupAutoSplit() {
  const btn = document.getElementById("btn-auto-split");
  if (!btn) return;
  renderPasteChooser();
  const op = document.getElementById("btn-open-paste"); if (op) op.addEventListener("click", () => { const pd = document.getElementById("paste-details"); if (pd) { pd.open = true; pd.scrollIntoView({ behavior: "smooth", block: "start" }); } });
  try { const pd = document.getElementById("paste-details"); if (pd && allShorts.length === 0) pd.open = true; } catch (e) {}
  btn.addEventListener("click", () => {
    const raw = document.getElementById("raw-shorts-paste-area")?.value || "";
    if (!pasteType) { alert("Pehle upar chuno ki ye prompts kis cheez ke hain (Video / Audio ...)."); return; }
    if (!raw.trim()) { alert("Kripya pehle text box mein apne prompts paste kijiye!"); return; }
    const parsed = parseRawShortsText(raw);
    if (parsed.length === 0) { alert("⚠️ Koi valid prompt detect nahi ho paya! Har prompt 'Episode 1:' / 'Short 1:' / '---' se alag hona chahiye."); return; }
    const chosen = pasteType;
    const lab = chosen === "auto" ? "Mixed (auto)" : (PICK_TYPES.find((p) => p.id === chosen) || {}).label + " → " + (Object.values(pasteOpts).map((v) => (REPORT_IDS.find((r) => r[0] === v) || [0, v])[1]).join(" · ") || "default");
    if (!confirm(`${parsed.length} prompts mile.\n\nSab ban jayenge: ${lab}\n\nSahi hai? OK dabao.`)) return;
    const modeInput = document.querySelector('input[name="import-mode"]:checked');
    const importMode = modeInput ? modeInput.value : "append";
    parsed.forEach((p) => {
      p.label = p.number;
      p.type = chosen === "auto" ? classifyPrompt((p.title || "") + " " + (p.prompt || "")) : chosen;
      if (chosen !== "auto") { p.opts = Object.assign({}, pasteOpts); if (chosen === "reports") { delete p.opts.Type; p.report = pasteOpts.Type; } }
    });
    if (importMode === "replace-type" && chosen !== "auto") allShorts = allShorts.filter((s) => typeOf(s) !== chosen);
    else if (importMode === "replace") { allShorts = []; completedPoints.clear(); saveCompletedState(); }
    let maxN = allShorts.reduce((a, s) => Math.max(a, s.number), 0);
    parsed.forEach((p) => { maxN += 1; p.number = maxN; });
    allShorts = allShorts.concat(parsed);
    const types = Array.from(new Set(parsed.map((p) => p.type)));
    currentSection = types.length === 1 ? types[0] : "all";
    try { localStorage.setItem("nlm_section", currentSection); } catch (e) {}
    saveShortsData(); renderAllShortsCards();
    const summary = types.map((t) => `${(PICK_TYPES.find((x) => x.id === t) || {}).label}: ${parsed.filter((p) => p.type === t).length}`).join("  ·  ");
    updateGlobalStatus(`🎉 ${parsed.length} prompts alag-alag boxes mein: ${summary}`, "success");
    alert(`🎉 ${parsed.length} prompts alag-alag boxes mein bant gaye!\n${summary}`);
  });
}

function applyFilterAndSearch() {
  const cards = document.querySelectorAll(".short-card");
  cards.forEach((card) => {
    const num = parseInt(card.dataset.num, 10);
    const title = card.dataset.title || "";
    const isDone = completedPoints.has(num);

    let matchesFilter = true;
    if (currentFilter === "pending" && isDone) matchesFilter = false;
    if (currentFilter === "completed" && !isDone) matchesFilter = false;

    let matchesSearch = true;
    if (searchTerm) {
      const it = allShorts.find((s) => s.number === num) || {};
      const matchNum = num.toString().includes(searchTerm) || String(it.label || "").includes(searchTerm);
      const matchTitle = title.includes(searchTerm);
      const matchText = String(it.prompt || "").toLowerCase().includes(searchTerm);
      matchesSearch = matchNum || matchTitle || matchText;
    }

    card.style.display = matchesFilter && matchesSearch ? "flex" : "none";
  });
}

// Clean Smart Dynamic Parser without hardcoding - handles Episodes, Shorts, Points, Prompts, Markdown and code blocks
function parseRawShortsText(text) {
  if (!text || !text.trim()) return [];

  const results = [];

  // Helper to extract clean prompt text from a section block
  function extractPromptFromBlock(block) {
    // 1. If block contains a code block (``` ... ```), the prompt is inside it!
    const codeMatch = block.match(/```(?:[a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)\r?\n```/);
    if (codeMatch && codeMatch[1].trim().length > 0) {
      return codeMatch[1].trim();
    }
    // 2. Otherwise, strip the heading line and optional metadata headers (Type:, Category:, etc.)
    const lines = block.trim().split(/\r?\n/);
    let bodyLines = lines.slice(1);
    while (bodyLines.length > 0 && /^(?:Type|Category|Tag|Format|Duration)\s*:/i.test(bodyLines[0].trim())) {
      bodyLines.shift();
    }
    const cleanBody = bodyLines.join('\n').trim();
    return cleanBody.length > 0 ? cleanBody : block.trim();
  }

  // Strategy 1: Section Headings (Episode / Short / Point / Prompt / Topic)
  // v6.1.0: handles "## 🎧 Episode N: title", "**[Type: ..]**", "**Customise Prompt:**", '---' separators, "# PART n" headings and a final quality-check prompt.
  let mainText = text, tailText = "";
  const finalMark = /\n[ \t]*#+[ \t]*FINAL[ \t]+QUALITY[^\n]*\n/i.exec(text);
  if (finalMark) { mainText = text.substring(0, finalMark.index); tailText = text.substring(finalMark.index + finalMark[0].length); }
  const sectionRegex = /(?:^|\n)[ \t]*(?:#+[ \t]*)?(?:[^\w\s]{1,3}[ \t]*)?(?:Episode|Short|Point|Prompt|Topic)[ \t]*#?[ \t]*(\d+)[ \t]*[:\-—][ \t]*([^\r\n]*)/giu;
  const matches = [];
  let m;
  while ((m = sectionRegex.exec(mainText)) !== null) {
    matches.push({ index: m.index, num: parseInt(m[1], 10), rawTitle: m[2] ? m[2].trim() : '', kind: (/(Episode|Short|Point|Prompt|Topic)/i.exec(m[0]) || ['', 'Ep'])[1] });
  }
  function cleanBlockForCustomise(block) {
    // cut at separators / next big heading
    const cut = block.search(/\n[ \t]*(?:-{3,}|\*{3,}|_{3,})[ \t]*(?:\n|$)|\n[ \t]*#{1,2}[ \t]+PART\b/i);
    let b = cut > 0 ? block.substring(0, cut) : block;
    const cm = /Customi[sz]ed?[ \t]+(?:Prompt|Topic)[ \t]*:?[ \t]*\**[ \t]*\r?\n?/i.exec(b);
    if (cm) return b.substring(cm.index + cm[0].length).replace(/^\s*\*+\s*/, '').trim();
    return null;
  }

  if (matches.length > 0) {
    matches.forEach((item, idx) => {
      const start = item.index;
      const end = idx + 1 < matches.length ? matches[idx + 1].index : mainText.length;
      let block = mainText.substring(start, end).trim();
      if (idx === matches.length - 1) {
        const footerMatch = block.match(/\n\s*#+\s*(?:Final\s+)?Quality[\s-]+Check/i);
        if (footerMatch) block = block.substring(0, footerMatch.index).trim();
      }
      let rawT = item.rawTitle;
      if (!rawT || !rawT.replace(/[\s*:—\-]/g, '')) {
        // v7.5.1: title on the NEXT line ("Short 38:\n Universal Indicator — Definition")
        const nl = block.split(/\r?\n/).slice(1).map((x) => x.trim()).find((x) => x && !/^(?:Customi[sz]ed?\s+(?:Prompt|Topic)|Type|Category)\s*:/i.test(x));
        rawT = nl || '';
      }
      let title = rawT.replace(/^[:—\-\s*]+|[:—\-\s*]+$/g, '').replace(/\s*\[.*?\]\(.*?\)/g, '').trim();
      const promptText = cleanBlockForCustomise(block) || extractPromptFromBlock(block);
      if (promptText.length > 0) results.push({ number: item.num, title: (item.kind.replace(/^episode$/i,'Ep') + ' ' + item.num + (title ? ' - ' + title : '')), prompt: promptText });
    });
    if (tailText.trim()) {
      const t = cleanBlockForCustomise(tailText) || tailText.trim();
      const last = results.reduce((a, r) => Math.max(a, r.number), 0);
      if (t) results.push({ number: last + 1, title: "Final Quality Check", prompt: t });
    }
    if (results.length > 0) {
      results.sort((a, b) => a.number - b.number);
      return results;
    }
  }

  // Strategy 2: Numbered items (1. Title / 1: Title / 1) Title)
  const numberedRegex = /(?:^|\n)\s*(?:#+\s*)?(\d+)[\.\)]\s+([^\r\n]+)/g;
  const numMatches = [];
  while ((m = numberedRegex.exec(text)) !== null) {
    numMatches.push({
      index: m.index,
      num: parseInt(m[1], 10),
      rawTitle: m[2].trim()
    });
  }

  if (numMatches.length > 1) {
    numMatches.forEach((item, idx) => {
      const start = item.index;
      const end = idx + 1 < numMatches.length ? numMatches[idx + 1].index : text.length;
      const block = text.substring(start, end).trim();
      const promptText = extractPromptFromBlock(block);
      if (promptText.length > 0) {
        results.push({
          number: item.num,
          title: item.rawTitle.length < 70 ? item.rawTitle : `Prompt ${item.num}`,
          prompt: promptText
        });
      }
    });

    if (results.length > 0) {
      results.sort((a, b) => a.number - b.number);
      return results;
    }
  }

  // Strategy 3: Separated by horizontal rules '---'
  if (text.includes('---')) {
    const parts = text.split(/\r?\n\s*---\s*\r?\n/);
    parts.forEach((part, idx) => {
      const trimmed = part.trim();
      if (trimmed.length > 10) {
        const lines = trimmed.split(/\r?\n/);
        const title = lines[0].replace(/^#+\s*/, '').trim();
        results.push({
          number: idx + 1,
          title: title.length < 60 ? title : `Prompt ${idx + 1}`,
          prompt: trimmed
        });
      }
    });
    if (results.length > 0) return results;
  }

  // Strategy 4: Fallback double blank lines
  const chunks = text.split(/\r?\n\s*\r?\n\s*\r?\n/);
  chunks.forEach((chunk, idx) => {
    const trimmed = chunk.trim();
    if (trimmed.length > 15) {
      const lines = trimmed.split(/\r?\n/);
      const title = lines[0].replace(/^#+\s*/, '').trim();
      results.push({
        number: idx + 1,
        title: title.length < 60 ? title : `Prompt ${idx + 1}`,
        prompt: trimmed
      });
    }
  });

  return results;
}

function setupCustomGenerator() {
  const triggerBtn = document.getElementById("btn-trigger-notebooklm");

  triggerBtn?.addEventListener("click", async () => {
    const topic = document.getElementById("direct-topic-input")?.value.trim() || "";
    const mode = "video";
    const format = "short";

    if (!topic) {
      updateGlobalStatus("Pehle Topic / Prompt likhiye, phir Generate dabaiye.", "error");
      return;
    }

    if (triggerBtn.disabled) return;
    triggerBtn.disabled = true;
    updateGlobalStatus("Custom prompt NotebookLM ko bhej rahe hain...", "ready");

    commandInFlight = true;
    const res = await sendToBridge(buildCommand(topic, undefined), COMMAND_TIMEOUT_MS);
    commandInFlight = false;
    triggerBtn.disabled = false;

    if (res?.success) {
      updateGlobalStatus(res.action === "later"
        ? "⏳ Abhi limit hai; prompt 'Generate later' queue mein chala gaya."
        : "✓ NotebookLM short video generate kar raha hai.", "success");
    } else {
      updateGlobalStatus(`⚠️ ${res?.error || "NotebookLM se response nahi mila."}`, "error");
    }
  });

  document.getElementById("btn-open-notebooklm")?.addEventListener("click", () => {
    window.open("https://notebooklm.google.com", "_blank");
  });
}

function updateGlobalStatus(text, statusClass = "ready", noLog = false) {
  if (!noLog) addLog(text, statusClass);
  const box = document.getElementById("control-status-box");
  const txt = document.getElementById("status-text");
  const icon = document.getElementById("status-icon");

  if (box && txt) {
    box.className = `status-box ${statusClass}`;
    txt.textContent = text;
    if (statusClass === "success") icon.textContent = "🎉";
    else if (statusClass === "error") icon.textContent = "⚠️";
    else icon.textContent = "💡";
  }
}

// ================= AUTO-BATCH GENERATION ENGINE =================

let batchRunning = false;
let batchStopRequested = false;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sendToBridge(payload, timeoutMs = 35000) {
  return new Promise((resolve) => {
    const reqId = "req_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
    payload.reqId = reqId;
    const jsonStr = JSON.stringify(payload);

    let resolved = false;
    const cleanup = () => {
      window.removeEventListener("message", postMessageHandler);
      document.removeEventListener("NLM_BRIDGE_RESPONSE", customEventHandler);
      clearTimeout(timer);
    };

    const handleResult = (respData) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(respData);
    };

    const postMessageHandler = (evt) => {
      try {
        let d = evt.data;
        if (typeof d === "string") {
          try { d = JSON.parse(d); } catch (e) {}
        }
        if (d && (d.type === "NLM_COMMAND_RESPONSE" || d.type === "NLM_CHECK_STATUS_RESPONSE")) {
          if (d.reqId === reqId) {
            handleResult(d.response);
          }
        }
      } catch (e) {}
    };

    const customEventHandler = (evt) => {
      try {
        const d = typeof evt.detail === "string" ? JSON.parse(evt.detail) : evt.detail;
        if (d && (d.type === "NLM_COMMAND_RESPONSE" || d.type === "NLM_CHECK_STATUS_RESPONSE")) {
          if (d.reqId === reqId) {
            handleResult(d.response);
          }
        }
      } catch (e) {}
    };

    window.addEventListener("message", postMessageHandler);
    document.addEventListener("NLM_BRIDGE_RESPONSE", customEventHandler);

    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      cleanup();

      const isBridgeInjected = document.documentElement.getAttribute("data-nlm-bridge") === "active";
      if (payload.type === "NLM_COMMAND") {
        // The command may or may not have reached NotebookLM - never claim "tab not open" here.
        resolve({
          success: false,
          timedOut: true,
          error: `No answer from NotebookLM within ${Math.round(timeoutMs / 1000)}s - the prompt MAY have started. Check NotebookLM Studio before retrying.`
        });
      } else if (isBridgeInjected) {
        resolve({
          success: false,
          error: "NotebookLM tab is not open! Please open your notebook in another tab."
        });
      } else {
        resolve({
          success: false,
          error: "Bridge response timed out (Extension not responding)"
        });
      }
    }, timeoutMs);

    try {
      document.dispatchEvent(new CustomEvent("NLM_BRIDGE_REQUEST", { detail: jsonStr }));
    } catch (e) {}

    try {
      window.postMessage(payload, "*");
    } catch (e) {}
  });
}

function setupAutoBatchControls() {
  document.getElementById("btn-start-batch")?.addEventListener("click", () => startAutoBatch());
  document.getElementById("btn-stop-batch")?.addEventListener("click", stopAutoBatch);
  document.getElementById("preset-select")?.addEventListener("change", (e) => { if (e.target.value) applyOutputPreset(e.target.value); e.target.value = ""; });
  document.getElementById("btn-download-log")?.addEventListener("click", downloadRunLog);
}

function updateBatchUI(isRunning, label = "") {
  const startBtn = document.getElementById("btn-start-batch");
  const stopBtn = document.getElementById("btn-stop-batch");
  const badge = document.getElementById("batch-status-badge");
  const badgeLabel = document.getElementById("batch-status-label");
  const startText = document.getElementById("btn-batch-start-text");

  if (isRunning) {
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    if (badge) badge.className = "batch-status-badge running";
    if (badgeLabel) badgeLabel.textContent = label || "Running...";
    if (startText) startText.textContent = "Auto-Batch in Progress...";
  } else {
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    if (badge) badge.className = "batch-status-badge idle";
    if (badgeLabel) badgeLabel.textContent = "Ready";
    updateBatchStartLabel();
  }
}

const COMMAND_TIMEOUT_MS = 120000;
const MAX_ATTEMPTS_PER_PROMPT = 3;
const FINISH_WAIT_MAX_MS = 10 * 60 * 1000;


// v5.3.0 - every option group inside each Studio dialog (labels read on the live NotebookLM page, 6 Nov 2026)
const OUT_OPT_GROUPS = {
  audio:       { label: "🎧 Audio",       groups: [["Format", ["Deep dive", "Brief", "Critique", "Debate"]], ["Length (Long sirf Deep dive mein)", ["Short", "Default", "Long"]]] },
  video:       { label: "🎬 Video",       groups: [["Format", ["Cinematic", "Short", "Explainer"]]] },
  slides:      { label: "🖼️ Slides",      groups: [["Format", ["Detailed deck", "Presenter slides"]], ["Length", ["Short", "Default"]]] },
  flashcards:  { label: "🃏 Flashcards",  groups: [["Cards", ["Fewer", "Standard (default)", "More"]], ["Difficulty", ["Easy", "Medium (default)", "Hard"]], ["Images", ["Include (default)", "Text only"]]] },
  quiz:        { label: "📝 Quiz",        groups: [["Questions", ["Fewer", "Standard (default)", "More"]], ["Difficulty", ["Easy", "Medium (default)", "Hard"]]] },
  infographic: { label: "📊 Infographic", groups: [["Orientation", ["Landscape", "Portrait", "Square"]], ["Style", ["Auto-select", "Kawaii", "Clay", "Sketch note", "Anime", "Editorial", "Instructional", "Bento grid", "Bricks", "Scientific", "Professional"]], ["Detail", ["Concise", "Standard", "Detailed"]]] }
};
function loadOutOpts() { try { return JSON.parse(localStorage.getItem("nlm_out_opts") || "{}"); } catch (e) { return {}; } }
function saveOutOpts(o) { try { localStorage.setItem("nlm_out_opts", JSON.stringify(o)); } catch (e) {} }
function savedChoicesFor(mode, num) {
  const g = OUT_OPT_GROUPS[mode]; if (!g) return [];
  const it = (typeof allShorts !== "undefined" && num != null) ? allShorts.find((s) => s.number === num) : null;
  const saved = (it && it.opts && Object.keys(it.opts).length) ? it.opts : ((loadOutOpts()[mode]) || {});
  return g.groups.map((grp) => saved[grp[0]]).filter(Boolean);
}
function optsSummary(item) {
  const t = typeOf(item); const lab = (PICK_TYPES.find((p) => p.id === t) || {}).label || t;
  const mode = t === "reports" ? "reports" : t;
  const ch = savedChoicesFor(mode, item.number);
  let extra = ch.length ? ch.join(" · ") : "default";
  if (t === "reports") extra = (REPORT_IDS.find((r) => r[0] === reportIdOf(item)) || [0, "Study guide"])[1];
  return lab + " → " + extra;
}
window.setItemOpt = function (num, gname, val) {
  const it = allShorts.find((s) => s.number === num); if (!it) return;
  if (gname.indexOf("Length") === 0 && !longOk(it.opts || {}, val)) { renderAllShortsCards(); return; }
  if (gname === "Format" && typeOf(it) === "audio" && val !== "Deep dive" && it.opts && it.opts[Object.keys(OUT_OPT_GROUPS.audio.groups.map((g) => g[0]))[1]] === "Long") delete it.opts[OUT_OPT_GROUPS.audio.groups[1][0]];
  it.opts = it.opts || {}; if (val) it.opts[gname] = val; else delete it.opts[gname];
  saveShortsData(); renderAllShortsCards();
};
function renderOutOpts() {
  const root = document.getElementById("out-opts-panel"); if (!root) return;
  const saved = loadOutOpts();
  root.innerHTML = Object.entries(OUT_OPT_GROUPS).map(([mode, g]) =>
    `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0"><b style="min-width:110px">${g.label}</b>` +
    g.groups.map((grp) => `<label style="font-size:12px">${grp[0]}: <select data-mode="${mode}" data-group="${grp[0]}"><option value="">— default —</option>` +
      grp[1].map((o) => `<option value="${o}" ${((saved[mode] || {})[grp[0]] === o) ? "selected" : ""}>${o}</option>`).join("") + `</select></label>`).join("") + `</div>`).join("");
  root.querySelectorAll("select").forEach((s) => s.addEventListener("change", () => {
    const o = loadOutOpts(); o[s.dataset.mode] = o[s.dataset.mode] || {};
    if (s.value) o[s.dataset.mode][s.dataset.group] = s.value; else delete o[s.dataset.mode][s.dataset.group];
    saveOutOpts(o);
  }));
}

function buildCommand(topic, pointNumber, output) {
  const st = nlmState.settings || {};
  return {
    type: "NLM_COMMAND",
    mode: (OUTPUT_VARIANTS[output] ? OUTPUT_VARIANTS[output].mode : (output || "video")),   // video | audio | a Studio output id (mindmap, study_guide, ...)
    choices: (() => { const m = OUTPUT_VARIANTS[output] ? OUTPUT_VARIANTS[output].mode : (output || "video"); const c = savedChoicesFor(m, pointNumber).concat((OUTPUT_VARIANTS[output] && OUTPUT_VARIANTS[output].choices) || []); return c.length ? c : undefined; })(),
    format: "short",
    topic: topic,
    pointNumber: pointNumber,
    allowLater: !!st.allowLater,   // false = stop at the limit (default); true = old "Generate later" queueing
    focusTab: st.focusTab !== false,
    waitMs: 20000
  };
}

function isQuotaError(res, errStr) {
  const e = (errStr || "").toLowerCase();
  return !!(res && res.quotaExhausted) ||
    e.includes("ai usage limit reached") || e.includes("usage limit reached") ||
    e.includes("available after") || e.includes("quota khatam") ||
    e.includes("daily limit") || e.includes("limit reached");
}

// "...available after 5:30 PM" -> epoch ms of the next such local time (+2 min buffer); null if no time in text
function parseResetTimeMs(text) {
  const m = /available after\s+([0-9]{1,2})(?::([0-9]{2}))?\s*([ap])?\.?m?\.?/i.exec(text || "");
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = (m[3] || "").toLowerCase();
  if (ap === "p" && h < 12) h += 12;
  if (ap === "a" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  const d = new Date();
  d.setHours(h, min, 0, 0);
  let t = d.getTime() + 2 * 60 * 1000;
  if (t < Date.now() + 5000) t += 24 * 3600 * 1000;
  return t;
}

function fmtTime(ms) {
  try { return new Date(ms).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }); }
  catch (e) { return String(ms); }
}

function handleLimitHit(pointNumber, errStr, auto) {
  const resetMs = parseResetTimeMs(errStr);
  const resumeAt = resetMs || (Date.now() + 60 * 60 * 1000); // unknown reset time: probe again in 1 h
  const timeMatch = /available after\s+([0-9:]+\s*(?:[ap]\.?m\.?)?)/i.exec(errStr || "");
  persistState({
    status: "limit",
    resumeFromPoint: pointNumber,
    limitHitAt: new Date().toISOString(),
    resetText: timeMatch ? timeMatch[1].trim() : "",
    resumeAtMs: resumeAt,
    lastMessage: errStr
  });
  addLog(`🛑 Limit hit at Prompt P${pointNumber}. Resume point saved${timeMatch ? ` (NotebookLM says: available after ${timeMatch[1].trim()})` : ""}.`, "error");
  if (nlmState.settings.autoResume) scheduleAutoResume(resumeAt);
  renderResumeBanner();
}

function getPendingList() {
  let pending = allShorts.filter((s) => (currentSection === "all" || typeOf(s) === currentSection) && !completedPoints.has(s.number) && outputsOf(s).length > 0);
  const rp = nlmState.resumeFromPoint;
  if (rp !== null && rp !== undefined) {
    const idx = allShorts.findIndex((s) => s.number === rp);
    if (idx >= 0) {
      const filtered = pending.filter((s) => allShorts.indexOf(s) >= idx);
      if (filtered.length > 0) pending = filtered;
    }
  }
  return pending;
}

function stopBatchWith(status, message, resumePoint) {
  batchRunning = false;
  batchStopRequested = true;
  updateBatchUI(false);
  document.querySelectorAll(".short-card").forEach((c) => c.classList.remove("running"));
  persistState({ status: status, resumeFromPoint: resumePoint, lastMessage: message });
  renderResumeBanner();
}

async function waitForGenerationFinish(point) {
  // optional: poll the NotebookLM tab until nothing is generating (bounded, never blocks forever)
  const t0 = Date.now();
  let idleCount = 0;
  let announced = false;
  while (Date.now() - t0 < FINISH_WAIT_MAX_MS && !batchStopRequested) {
    const st = await sendToBridge({ type: "NLM_CHECK_STATUS" }, 12000);
    if (st && st.success && st.quotaExhausted) return;
    if (st && st.success && !st.isGenerating) {
      idleCount++;
      if (idleCount >= 2) return;
    } else {
      idleCount = 0;
    }
    if (!announced) {
      updateGlobalStatus(`⏳ Point ${point}: NotebookLM abhi generate kar raha hai - khatam hone ka wait (max 10 min)...`, "ready");
      announced = true;
    }
    await sleep(5000);
  }
  if (!batchStopRequested) addLog("⌛ Finish-wait timeout (10 min) - agla prompt bhej rahe hain.", "ready");
}

async function startAutoBatch(opts) {
  const auto = !!(opts && opts.auto === true);
  if (batchRunning) return;
  clearAutoResumeTimer();

  // The dashboard was reloaded/closed while a prompt was being sent: that prompt may already be generating.
  if (nlmState.inFlightPoint !== null && nlmState.inFlightPoint !== undefined) {
    const fp = nlmState.inFlightPoint;
    if (auto) {
      addLog(`❓ P${fp} reload ke waqt bheja ja raha tha - auto-resume rok diya, manually confirm karein.`, "error");
      return;
    }
    const started = confirm(`Prompt P${fp} bhejte waqt dashboard reload/band ho gaya tha.\n\nNotebookLM Studio mein dekhiye: kya P${fp} ka video/audio shuru ho gaya?\n\nOK = Haan, shuru ho gaya (P${fp} ko Done mark karke agle se chalao)\nCancel = Nahi, P${fp} dobara bhejo`);
    if (started) {
      markOutputDone(fp, nlmState.inFlightOutput || "video");
      const idx = allShorts.findIndex((s) => s.number === fp);
      const nxt = allShorts.slice(idx + 1).find((s) => !completedPoints.has(s.number));
      const fpItem = allShorts.find((s) => s.number === fp);
      const stillTodo = fpItem ? todoOutputs(fpItem).length > 0 : false;
      persistState({ inFlightPoint: null, inFlightOutput: null, resumeFromPoint: stillTodo ? fp : (nxt ? nxt.number : null), lastDonePoint: fp });
      addLog(`✓ P${fp} user ne confirm kiya - Done mark kiya.`, "success");
    } else {
      persistState({ inFlightPoint: null, resumeFromPoint: fp });
      addLog(`↻ P${fp} dobara bheja jayega.`, "ready");
    }
  }

  const pendingShorts = getPendingList();

  if (pendingShorts.length === 0) {
    if (!auto) alert(`🎉 Saare ${allShorts.length} prompts pehle se completed hain!\n\nNaye prompts daalein ya fir 'Reset Ticks' dabakar dubara shuru karein.`);
    persistState({ status: "done", resumeFromPoint: null });
    renderResumeBanner();
    return;
  }

  const rp = nlmState.resumeFromPoint;
  if (rp !== null && rp !== undefined && pendingShorts[0].number === rp) {
    addLog(`▶ Resume: Prompt P${rp} se dobara shuru (pehle ke prompts skip).`, "ready");
  }

  updateGlobalStatus("NotebookLM connection check kar rahe hain...", "ready");
  let statusCheck = await sendToBridge({ type: "NLM_CHECK_STATUS" }, 12000);
  if (!statusCheck || !statusCheck.success) {
    await sleep(500);
    statusCheck = await sendToBridge({ type: "NLM_CHECK_STATUS" }, 12000);
  }

  if (!statusCheck || !statusCheck.success) {
    const reason = statusCheck?.error || "Extension / NotebookLM tab not responding";
    updateGlobalStatus(`🛑 Connection Error: ${reason}`, "error");
    persistState({ status: nlmState.status === "limit" ? "limit" : "error", lastMessage: reason });
    if (auto) {
      addLog("Auto-resume: connection nahi mila, 10 min baad dobara koshish.", "error");
      scheduleAutoResume(Date.now() + 10 * 60 * 1000);
    } else {
      alert(`Connection Error:\n\n${reason}\n\nKripya sure karein ki:\n1. NotebookLM notebook ka tab open hai.\n2. Extension active hai.`);
    }
    return;
  }
  if (statusCheck.quotaExhausted) {
    updateGlobalStatus(`🛑 Quota Khatam: ${statusCheck.error || "AI usage limit reached."}`, "error");
    handleLimitHit(pendingShorts[0].number, statusCheck.error || "AI usage limit reached.", auto);
    if (!auto) alert(`🛑 NotebookLM AI Usage Limit Poori Tarah Khatam!\n\n${statusCheck.error || "All features will be available after reset time."}\n\nAbhi naye prompts generate nahi ho sakte.\nResume point saved: Prompt P${pendingShorts[0].number}.`);
    return;
  }

  batchRunning = true;
  batchStopRequested = false;
  let consecutiveErrors = 0;
  let stepNo = 0;
  const totalSteps = pendingShorts.reduce((n, s) => n + todoOutputs(s).length, 0);
  updateBatchUI(true, "Starting...");
  persistState({ status: "running", resumeFromPoint: pendingShorts[0].number, resumeAtMs: null });
  renderResumeBanner();

  updateGlobalStatus(`▶ Auto-Batch shuru ho gaya hai! Kul ${pendingShorts.length} pending prompts bache hain.`, "ready");

  for (let i = 0; i < pendingShorts.length; i++) {
    if (batchStopRequested) {
      updateGlobalStatus("⏹ Auto-Batch user dwara rok diya gaya.", "ready");
      break;
    }

    const item = pendingShorts[i];
    const card = document.getElementById(`short-card-${item.number}`);

    document.querySelectorAll(".short-card").forEach((c) => c.classList.remove("running"));
    if (card) {
      card.classList.add("running");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    persistState({ resumeFromPoint: item.number });
    updateBatchUI(true, `Point ${item.number} (${i + 1}/${pendingShorts.length})`);
    updateGlobalStatus(`[${i + 1}/${pendingShorts.length}] Point ${item.number}: "${item.title}" NotebookLM mein bhej rahe hain...`, "ready");

    const promptText = document.getElementById(`prompt-text-${item.number}`)?.value.trim() || item.prompt;
    const todo = todoOutputs(item);
    if (todo.length === 0) { markCardCompleted(item.number, true); continue; }
    let res = null;
    let failedOutput = null;

    let lastSentOutput = null;

    // one prompt can carry several Studio outputs (audio, video, mind map...): one command each, in order
    for (const outId of todo) {
      if (batchStopRequested) break;
      if (outId !== todo[0]) {
        const prevWasAudio = isAudioOutput(lastSentOutput);
        const delaySec = prevWasAudio ? 25 : 15;
        for (let s = delaySec; s > 0; s--) {
          if (batchStopRequested) break;
          updateGlobalStatus(`P${item.number}: agla output (${OUTPUT_LABEL[outId] || outId}) ${s}s mein... (${prevWasAudio ? "Audio 25s" : "Video 15s"} interval)`, "ready", true);
          await sleep(1000);
        }
      }
      stepNo++;
      updateBatchUI(true, `P${item.number} · ${OUTPUT_LABEL[outId] || outId} (${stepNo}/${totalSteps})`);
      updateGlobalStatus(`[${stepNo}/${totalSteps}] P${item.number} · ${OUTPUT_LABEL[outId] || outId}: NotebookLM mein bhej rahe hain...`, "ready");

      // up to 3 attempts, but only for failures that cannot have started a generation
      res = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_PROMPT; attempt++) {
        commandInFlight = true;
        persistState({ inFlightPoint: item.number, inFlightOutput: outId });   // survives a page reload: tells us the command may have reached NotebookLM
        res = await sendToBridge(buildCommand(promptText, item.number, outId), COMMAND_TIMEOUT_MS);
        commandInFlight = false;
        persistState({ inFlightPoint: null, inFlightOutput: null });
        if (res && res.success) break;
        const e = (res?.error || "").toLowerCase();
        const noSideEffect = e.includes("could not be opened") || e.includes("could not be clicked") || e.includes("busy:") || e.includes("not found");
        if (!noSideEffect || res?.quotaExhausted || batchStopRequested || attempt >= MAX_ATTEMPTS_PER_PROMPT) break;
        updateGlobalStatus(`⚠️ Point ${item.number}: ${res.error} - dobara koshish ${attempt + 1}/${MAX_ATTEMPTS_PER_PROMPT} (4s baad)...`, "error");
        await sleep(4000);
      }
      if (res && res.success) {
        lastSentOutput = outId;
        markOutputDone(item.number, outId);
        addLog(`✓ P${item.number} · ${OUTPUT_LABEL[outId] || outId} bhej diya${res.confirmed === false ? " (confirmation nahi mila - Studio mein check karein)" : ""}`, res.confirmed === false ? "error" : "success");
        continue;
      }
      failedOutput = outId;
      break;
    }

    // Stop pressed between two outputs of one prompt: the prompt stays pending with its remaining outputs
    if (res && res.success && todoOutputs(item).length > 0) {
      if (card) card.classList.remove("running");
      persistState({ resumeFromPoint: item.number, lastMessage: `P${item.number}: baaki outputs pending` });
      renderResumeBanner();
      break;
    }

    // The command already ran - if it succeeded, tick it even if Stop was pressed meanwhile.
    if (res && res.success) {
      consecutiveErrors = 0;
      markCardCompleted(item.number, true);
      if (card) card.classList.remove("running");
      const next = pendingShorts[i + 1];
      persistState({ lastDonePoint: item.number, resumeFromPoint: next ? next.number : null, lastMessage: `P${item.number} sent` });
      renderResumeBanner();

      const isQueuedLater = res.action === "later";
      const unconfirmed = res.confirmed === false ? " (⚠ confirmation nahi mila - Studio mein check karein)" : "";
      const statusAction = isQueuedLater
        ? `⏳ Point ${item.number}: 'Generate later' daba kar queue kiya!${unconfirmed}`
        : `✓ Point ${item.number}: Successfully Generate ho gaya!${unconfirmed}`;

      if (batchStopRequested) {
        updateGlobalStatus("⏹ Auto-Batch user dwara rok diya gaya.", "ready");
        break;
      }

      if (nlmState.settings.waitFinish && i < pendingShorts.length - 1) {
        updateGlobalStatus(statusAction, "ready");
        await waitForGenerationFinish(item.number);
      }

      if (i < pendingShorts.length - 1 && !batchStopRequested) {
        const wasAudio = isAudioOutput(lastSentOutput) || isAudioItem(item);
        const delaySec = wasAudio ? 25 : 15;
        for (let s = delaySec; s > 0; s--) {
          if (batchStopRequested) break;
          updateGlobalStatus(`${statusAction} Agla prompt ${s}s mein aayega... (${wasAudio ? "Audio 25s" : "Video 15s"} process interval)`, "ready", true);
          await sleep(1000);
        }
      } else {
        updateGlobalStatus(statusAction, "success");
      }
      continue;
    }

    if (batchStopRequested) {
      if (card) card.classList.remove("running");
      break;
    }

    // ----- failure paths: the current prompt is NOT ticked, resume pointer stays on it -----
    if (card) card.classList.remove("running");
    const errStr = res?.error || "NotebookLM response failed";

    if (isQuotaError(res, errStr)) {
      if (failedOutput) addLog(`↪ Resume: P${item.number} · ${OUTPUT_LABEL[failedOutput] || failedOutput} se; baaki outputs baad mein`, "ready");
      batchRunning = false;
      batchStopRequested = true;
      updateBatchUI(false);
      document.querySelectorAll(".short-card").forEach((c) => c.classList.remove("running"));
      updateGlobalStatus(`🛑 Quota Khatam: ${errStr}. Batch rok diya gaya. Resume point: Prompt P${item.number}.`, "error");
      handleLimitHit(item.number, errStr, auto);
      if (!auto) alert(`🛑 NotebookLM AI Usage Limit Poori Tarah Khatam!\n\n${errStr}\n\nBatch yahin RUK GAYA HAI.\nResume point saved: Prompt P${item.number} (agli baar yahin se shuru hoga).`);
      break;
    }

    if (res?.timedOut) {
      stopBatchWith("unknown", errStr, item.number);
      updateGlobalStatus(`🛑 Point ${item.number}: ${errStr}`, "error");
      if (!auto) alert(`🛑 NotebookLM se jawab nahi aaya (Prompt P${item.number}).\n\nPehle NotebookLM Studio mein dekh lein ki ye prompt start hua ya nahi.\n- Start ho gaya: us card ko ✓ Done karein, phir Resume dabayein.\n- Nahi hua: seedha Resume dabayein.`);
      break;
    }

    if (errStr.toLowerCase().includes("not open") || errStr.toLowerCase().includes("receiving end does not exist")) {
      stopBatchWith("error", errStr, item.number);
      updateGlobalStatus(`🛑 NotebookLM tab nahi mil raha hai! Kripya notebook open karein.`, "error");
      if (!auto) alert(`🛑 NotebookLM Tab nahi mil raha hai!\n\nKripya apne browser mein NotebookLM notebook ka tab open karein aur dobara try karein.\nResume point saved: Prompt P${item.number}.`);
      break;
    }

    const isSafetyAbort =
      errStr.toLowerCase().includes("safety lock") ||
      errStr.toLowerCase().includes("prompt safety") ||
      errStr.toLowerCase().includes("format select nahi ho saka");

    if (isSafetyAbort) {
      stopBatchWith("error", errStr, item.number);
      updateGlobalStatus(`🛑 Safety Abort: ${errStr}. Batch ROK diya gaya hai.`, "error");
      if (!auto) alert(`🛑 Safety Lock Activated!\n\n${errStr}\n\nBatch ko yahan ROK diya gaya hai taaki galat format ya khali video na bane.`);
      break;
    }

    consecutiveErrors++;
    if (consecutiveErrors >= 2) {
      stopBatchWith("error", errStr, item.number);
      updateGlobalStatus(`🛑 Consecutive Errors (${consecutiveErrors}): ${errStr}. Batch rok diya gaya hai. Resume point: P${item.number}.`, "error");
      if (!auto) alert(`🛑 Batch Stopped!\n\nLagataar ${consecutiveErrors} prompts par error aaya:\n${errStr}`);
      break;
    }

    updateGlobalStatus(`⚠️ Point ${item.number} par issue aaya: ${errStr}. Agla prompt 4s mein try kar rahe hain...`, "error");
    await sleep(4000);
    continue;
  }

  const wasStopped = batchStopRequested;
  batchRunning = false;
  batchStopRequested = false;
  updateBatchUI(false);
  document.querySelectorAll(".short-card").forEach((c) => c.classList.remove("running"));

  const remaining = allShorts.filter((s) => !completedPoints.has(s.number) && outputsOf(s).length > 0);
  if (remaining.length === 0 && allShorts.length > 0) {
    persistState({ status: "done", resumeFromPoint: null, resumeAtMs: null, lastMessage: "All prompts done" });
    renderResumeBanner();
    updateGlobalStatus(`🎉 Mubarak ho! Saare ${allShorts.length} Prompts successfully generate ho chuke hain!`, "success");
    if (!auto) alert(`🎉 Mubarak ho! Saare ${allShorts.length} Prompts successfully generate ho chuke hain!`);
  } else if (wasStopped && nlmState.status === "running") {
    // plain user Stop: remember where to continue
    persistState({ status: "stopped", resumeFromPoint: remaining[0] ? remaining[0].number : null });
    renderResumeBanner();
  }
}

// ---------- resume point / settings / log / banner ----------
window.setResumePoint = function (num) {
  persistState({ resumeFromPoint: num, status: nlmState.status === "running" ? "running" : "stopped" });
  addLog(`⏭ Resume point set: Auto-Batch ab Prompt P${num} se shuru hoga.`, "ready");
  renderResumeBanner();
};

function clearResumePoint() {
  persistState({ resumeFromPoint: null, status: "idle", resumeAtMs: null, limitHitAt: null, resetText: "" });
  clearAutoResumeTimer();
  try { sendToBridge({ type: "NLM_ALARM_CLEAR" }, 4000); } catch (e) {}
  addLog("Resume point clear kiya - ab pehle pending prompt se shuru hoga.", "ready");
  renderResumeBanner();
}

function clearAutoResumeTimer() {
  if (autoResumeTimer) { clearTimeout(autoResumeTimer); autoResumeTimer = null; }
}

function scheduleAutoResume(atMs) {
  clearAutoResumeTimer();
  const delay = Math.max(1000, atMs - Date.now());
  // page timer (works while this tab stays open) ...
  autoResumeTimer = setTimeout(onAutoResumeWake, Math.min(delay, 2147000000));
  // ... plus an extension alarm that survives sleeping/throttled tabs
  sendToBridge({ type: "NLM_ALARM_SET", when: atMs }, 5000);
  persistState({ resumeAtMs: atMs });
  addLog(`⏰ Auto-resume scheduled: ${fmtTime(atMs)}`, "ready");
  renderResumeBanner();
}

let lastWakeAt = 0;
function onAutoResumeWake() {
  if (Date.now() - lastWakeAt < 15000) return; // timer + alarm both fire: run once
  lastWakeAt = Date.now();
  clearAutoResumeTimer();
  if (!nlmState.settings.autoResume || batchRunning) return;
  if (nlmState.status !== "limit" && nlmState.status !== "error") return;
  addLog("⏰ Auto-resume: limit reset time aa gaya - batch dobara shuru.", "ready");
  startAutoBatch({ auto: true });
}

function addLog(text, level) {
  const entry = { t: new Date().toISOString(), level: level || "ready", text: String(text) };
  const last = nlmState.log[nlmState.log.length - 1];
  if (last && last.text === entry.text) return;
  nlmState.log.push(entry);
  if (nlmState.log.length > 200) nlmState.log = nlmState.log.slice(-200);
  renderLog();
  logQueue.push(entry);
  if (!logFlushTimer) {
    logFlushTimer = setTimeout(() => {
      logFlushTimer = null;
      const lines = logQueue;
      logQueue = [];
      if (lines.length) sendToBridge({ type: "NLM_STATE_PATCH", patch: {}, log: lines }, 5000);
    }, 1500);
  }
}

function renderLog() {
  const box = document.getElementById("status-log");
  if (!box) return;
  const lines = nlmState.log.slice(-80);
  box.innerHTML = lines.map((e) => {
    let tm = "";
    try { tm = new Date(e.t).toLocaleTimeString(); } catch (err) {}
    return `<div class="log-line log-${escapeHtml(e.level)}"><span class="log-time">${escapeHtml(tm)}</span> ${escapeHtml(e.text)}</div>`;
  }).join("");
  box.scrollTop = box.scrollHeight;
}

function persistState(patch) {
  Object.assign(nlmState, patch);
  nlmState.updatedAt = Date.now();
  try {
    const { log, ...rest } = nlmState;
    localStorage.setItem("vt_resume_state", JSON.stringify(rest));
  } catch (e) {}
  const toSend = {};
  Object.keys(patch).forEach((k) => { toSend[k] = patch[k] === undefined ? null : patch[k]; });
  if (patch.settings) toSend.settings = nlmState.settings;
  sendToBridge({ type: "NLM_STATE_PATCH", patch: toSend }, 5000);
  updateBatchStartLabel();
}

function scheduleBackup() {
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    backupTimer = null;
    sendToBridge({
      type: "NLM_STATE_PATCH",
      patch: {},
      backup: { shorts: allShorts, completed: Array.from(completedPoints), savedAt: Date.now() }
    }, 8000);
  }, 3000);
}

function updateBatchStartLabel() {
  if (batchRunning) return;
  const startText = document.getElementById("btn-batch-start-text");
  if (!startText) return;
  const rp = nlmState.resumeFromPoint;
  startText.textContent = (rp !== null && rp !== undefined)
    ? `▶ Resume from Prompt P${rp}`
    : "Start Auto-Batch (Ek-ek karke generate karo)";
}

function renderResumeBanner() {
  const banner = document.getElementById("resume-banner");
  const text = document.getElementById("resume-text");
  if (!banner || !text) { updateBatchStartLabel(); return; }
  const rp = nlmState.resumeFromPoint;
  const st = nlmState.status;
  if ((rp === null || rp === undefined) && st !== "done") {
    banner.style.display = "none";
    updateBatchStartLabel();
    return;
  }
  banner.style.display = "flex";
  banner.className = `resume-banner resume-${st}`;
  let msg = "";
  if (st === "done") {
    msg = "🎉 Saare prompts complete. Koi resume point nahi.";
  } else {
    const item = allShorts.find((s) => s.number === rp);
    const title = item ? ` - ${item.title}` : "";
    const labels = {
      limit: "🛑 Daily limit hit",
      stopped: "⏹ Batch rukwaya gaya",
      error: "⚠️ Error ki wajah se ruka",
      unknown: "❓ Aakhri prompt ka result pakka nahi",
      running: "▶ Chal raha hai",
      idle: "📍 Resume point set"
    };
    msg = `${labels[st] || "📍"}  →  Next / Resume from Prompt P${rp}${title}`;
    if (nlmState.lastDonePoint != null) msg += `  (last sent: P${nlmState.lastDonePoint})`;
    if (st === "limit") {
      if (nlmState.resetText) msg += `  • NotebookLM: available after ${nlmState.resetText}`;
      if (nlmState.settings.autoResume && nlmState.resumeAtMs) msg += `  • auto-resume ${fmtTime(nlmState.resumeAtMs)}`;
    }
  }
  text.textContent = msg;
  updateBatchStartLabel();
}

async function initResumeState() {
  // settings checkboxes
  const bindings = [
    ["opt-allow-later", "allowLater"],
    ["opt-focus-tab", "focusTab"],
    ["opt-auto-resume", "autoResume"],
    ["opt-wait-finish", "waitFinish"]
  ];
  bindings.forEach(([id, key]) => {
    document.getElementById(id)?.addEventListener("change", (e) => {
      const settings = Object.assign({}, nlmState.settings, { [key]: e.target.checked });
      persistState({ settings });
      if (key === "autoResume") {
        if (e.target.checked && nlmState.status === "limit") {
          scheduleAutoResume(nlmState.resumeAtMs && nlmState.resumeAtMs > Date.now() ? nlmState.resumeAtMs : Date.now() + 60 * 1000);
        } else if (!e.target.checked) {
          clearAutoResumeTimer();
          sendToBridge({ type: "NLM_ALARM_CLEAR" }, 4000);
        }
      }
    });
  });
  document.getElementById("btn-resume-now")?.addEventListener("click", () => startAutoBatch());
  document.getElementById("btn-clear-resume")?.addEventListener("click", clearResumePoint);
  document.getElementById("btn-clear-log")?.addEventListener("click", () => {
    nlmState.log = [];
    renderLog();
    sendToBridge({ type: "NLM_STATE_PATCH", patch: { log: [] } }, 4000);
  });

  // wake-ups sent by the extension's alarm
  document.addEventListener("NLM_BRIDGE_WAKE", onAutoResumeWake);
  window.addEventListener("message", (evt) => {
    if (evt && evt.data && evt.data.type === "NLM_WAKE") onAutoResumeWake();
  });

  // load saved state: extension storage is the source of truth, localStorage is the fallback
  let local = null;
  try { local = JSON.parse(localStorage.getItem("vt_resume_state") || "null"); } catch (e) {}
  let remote = null;
  let backup = null;
  for (let attempt = 0; attempt < 3 && !remote && !backup; attempt++) {
    const r = await sendToBridge({ type: "NLM_STATE_GET" }, 4000);
    if (r && r.success) { remote = r.state; backup = r.backup; break; }
    await sleep(700);
  }
  const best = [local, remote].filter(Boolean).sort((x, y) => (y.updatedAt || 0) - (x.updatedAt || 0))[0];
  if (best) {
    const savedStatus = best.status === "running" ? "stopped" : best.status; // a page reload interrupts any batch
    Object.assign(nlmState, best, {
      status: savedStatus,
      settings: Object.assign({}, nlmState.settings, best.settings || {})
    });
    nlmState.log = (remote && Array.isArray(remote.log)) ? remote.log.slice(-200) : [];
  }
  if (nlmState.inFlightPoint !== null && nlmState.inFlightPoint !== undefined) {
    persistState({ status: "unknown", resumeFromPoint: nlmState.inFlightPoint });
    addLog(`❓ Dashboard reload hua jab P${nlmState.inFlightPoint} NotebookLM ko bheja ja raha tha - pakka nahi ki shuru hua ya nahi. Studio mein check karein; Resume dabane par poocha jayega.`, "error");
  } else if (nlmState.status === "stopped" && (best && best.status === "running")) {
    persistState({ status: "stopped" });
    addLog("♻️ Dashboard reload hua - batch ruka tha. Resume point se dobara shuru kar sakte hain.", "ready");
  }

  // first run on a new origin/port or cleared browser data: restore prompts from the extension's copy
  if (freshInstall && backup && Array.isArray(backup.shorts) && backup.shorts.length > 0 && allShorts.length === 0) {
    allShorts = backup.shorts;
    completedPoints = new Set(backup.completed || []);
    saveShortsData();
    saveCompletedState();
    renderAllShortsCards();
    addLog(`♻️ ${allShorts.length} prompts extension ke backup se wapas laaye gaye.`, "success");
  }

  // reflect settings in the UI
  const set = nlmState.settings;
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
  setChk("opt-allow-later", set.allowLater);
  setChk("opt-focus-tab", set.focusTab !== false);
  setChk("opt-auto-resume", set.autoResume);
  setChk("opt-wait-finish", set.waitFinish);

  renderLog();
  renderResumeBanner();
  addLog("Dashboard ready.", "ready");

  // pending auto-resume after a reload / browser restart
  if (set.autoResume && nlmState.status === "limit" && nlmState.resumeAtMs) {
    if (nlmState.resumeAtMs <= Date.now()) setTimeout(onAutoResumeWake, 4000);
    else scheduleAutoResume(nlmState.resumeAtMs);
  }
}

function stopAutoBatch() {
  if (!batchRunning) return;
  batchStopRequested = true;
  updateGlobalStatus("⏹ Auto-Batch rokne ka request bhej diya gaya hai...", "ready");
}


// ================= v5.0.0 : Tools panel (language, add source, chat, diagnose) =================
const NLM_LANGS = [
  ["Hindi", "हिन्दी"], ["English", "English"], ["Bengali", "বাংলা"], ["Tamil", "தமிழ்"], ["Telugu", "తెలుగు"], ["Marathi", "मराठी"],
  ["Gujarati", "ગુજરાતી"], ["Kannada", "ಕನ್ನಡ"], ["Malayalam", "മലയാളം"], ["Punjabi", "ਪੰਜਾਬੀ"], ["Urdu", "اردو"], ["Odia", "ଓଡ଼ିଆ"],
  ["Spanish", "Español"], ["French", "Français"], ["German", "Deutsch"], ["Portuguese", "Português"], ["Italian", "Italiano"],
  ["Indonesian", "Bahasa Indonesia"], ["Arabic", "العربية"], ["Japanese", "日本語"], ["Korean", "한국어"], ["Chinese", "中文"],
  ["Russian", "Русский"], ["Turkish", "Türkçe"], ["Vietnamese", "Tiếng Việt"], ["Thai", "ไทย"], ["Dutch", "Nederlands"], ["Polish", "Polski"]
];

function toolLog(msg, cls) { try { addLog(msg, cls || "ready"); } catch (e) { console.log(msg); } }

async function runTool(payload, label) {
  toolLog(`🛠 ${label} ...`);
  const res = await sendToBridge(Object.assign({ type: "NLM_COMMAND", format: "short", focusTab: true }, payload), 150000);
  if (res && res.success) toolLog(`✅ ${label}: ${res.message || "ok"}`, "success");
  else toolLog(`⚠️ ${label}: ${(res && res.error) || "fail"}`, "error");
  return res;
}

function setupToolsPanel() {
  const sel = document.getElementById("tool-lang");
  if (sel) {
    sel.innerHTML = NLM_LANGS.map((l, i) => `<option value="${i}">${l[0]} / ${l[1]}</option>`).join("");
    document.getElementById("btn-tool-lang")?.addEventListener("click", () => {
      const l = NLM_LANGS[parseInt(sel.value, 10)];
      runTool({ mode: "set_language", names: [l[0].toLowerCase(), l[1].toLowerCase()] }, `Output language = ${l[0]}`);
    });
  }
  document.getElementById("btn-tool-source")?.addEventListener("click", () => {
    const kind = document.getElementById("tool-source-kind").value;
    const val = document.getElementById("tool-source-value").value.trim();
    if (!val) { toolLog("⚠️ Source ka link ya text likho", "error"); return; }
    runTool({ mode: "add_source", kind, value: val }, `Add source (${kind})`);
  });
  try { renderGlobalPicker(); } catch (e) { console.error(e); }
  document.getElementById("btn-tool-research")?.addEventListener("click", () => {
    const q = document.getElementById("tool-res-q").value.trim();
    if (!q) { toolLog("⚠️ Research ka topic likho", "error"); return; }
    runTool({ mode: "research", topic: q, where: document.getElementById("tool-res-where").value, depth: document.getElementById("tool-res-depth").value, importResults: true }, "Research + Import");
  });
  document.getElementById("btn-tool-chatcfg")?.addEventListener("click", () => {
    const style = document.getElementById("tool-chat-style").value;
    runTool({ mode: "configure_chat", style, custom: document.getElementById("tool-chat-custom").value.trim(), length: document.getElementById("tool-chat-len").value }, `Chat settings (${style})`);
  });
  document.getElementById("btn-tool-chat")?.addEventListener("click", () => {
    const q = document.getElementById("tool-chat-q").value.trim();
    if (!q) { toolLog("⚠️ Chat ka sawaal likho", "error"); return; }
    runTool({ mode: "chat", topic: q }, "Chat sawaal");
  });
  document.getElementById("btn-tool-scan")?.addEventListener("click", async () => {
    const res = await runTool({ mode: "scan_ui" }, "Diagnose page");
    if (res && res.success && res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "notebooklm_page_diagnose.json";
      a.click();
      toolLog("📄 notebooklm_page_diagnose.json download ho gayi: ye file Tab ko bhej do, selector theek ho jayenge.", "success");
    }
  });
}
document.addEventListener("DOMContentLoaded", setupToolsPanel);

window.moveItem = function (num, dir) {
  const t = allShorts.find((s) => s.number === num); if (!t) return;
  const sec = typeOf(t); const idxs = allShorts.map((s, i) => [s, i]).filter(([s]) => currentSection === "all" || typeOf(s) === sec);
  const pos = idxs.findIndex(([s]) => s.number === num); const to = pos + dir;
  if (to < 0 || to >= idxs.length) return;
  const a = idxs[pos][1], b = idxs[to][1];
  const tmp = allShorts[a]; allShorts[a] = allShorts[b]; allShorts[b] = tmp;
  saveShortsData(); renderAllShortsCards();
};
// section-only backup / restore
window.exportSection = function () {
  const list = allShorts.filter((s) => currentSection === "all" || typeOf(s) === currentSection);
  if (!list.length) { alert("Is section mein koi prompt nahi hai."); return; }
  const data = { exportDate: new Date().toISOString(), section: currentSection, totalPrompts: list.length, completedPoints: list.filter((s) => completedPoints.has(s.number)).map((s) => s.number), shorts: list };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = `notebooklm_${currentSection}_backup_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
  updateGlobalStatus(`✓ ${currentSection} section ka backup download ho gaya (${list.length} prompts)`, "success");
};
window.importSectionFile = function (file) {
  if (!file) return; const r = new FileReader();
  r.onload = (e) => { try {
    const d = JSON.parse(e.target.result); const arr = Array.isArray(d) ? d : d.shorts; if (!Array.isArray(arr)) throw new Error("prompts nahi mile");
    let maxN = allShorts.reduce((a, s) => Math.max(a, s.number), 0);
    arr.forEach((p) => { const old = p.number; maxN += 1; p.label = p.label || old; p.number = maxN; });
    allShorts = allShorts.concat(arr); saveShortsData(); renderAllShortsCards();
    updateGlobalStatus(`✓ ${arr.length} prompts wapas jod diye (purane safe)`, "success");
  } catch (err) { alert("Backup file padhne mein error: " + err.message); } };
  r.readAsText(file);
};
// live progress strip for the current section
function renderBatchStrip() {
  const el = document.getElementById("batch-strip"); if (!el) return;
  const list = allShorts.filter((s) => currentSection === "all" || typeOf(s) === currentSection);
  const done = list.filter((s) => completedPoints.has(s.number)).length;
  const total = list.length; const pct = total ? Math.round(done * 100 / total) : 0;
  const run = document.querySelector(".short-card.running");
  const cur = run ? `Abhi chal raha hai: ${run.querySelector(".short-card-title")?.textContent || ""}` : (batchRunning ? "Chal raha hai..." : "");
  el.style.display = total ? "flex" : "none";
  el.innerHTML = `<div class="bs-top"><b>${currentSection === "all" ? "Sab" : (PICK_TYPES.find((p) => p.id === currentSection) || {}).label}</b> <span>${done} / ${total} ho gaye · ${total - done} bache</span> <em>${cur}</em></div><div class="bs-bar"><i style="width:${pct}%"></i></div>`;
}
setInterval(() => { try { renderBatchStrip(); } catch (e) {} }, 1500);
