// NotebookLM Helper: Clean & Reliable Shorts (9:16) & Audio Automation
// v5.1.0 (real-page fixes: Trusted Types box, output language dropdown)
// ============================================================================================
//  CONFIG - ALL wording / selectors that depend on NotebookLM's UI live in this ONE block.
//  v4.6: the 'outputs' section below lists every Studio output the dashboard can ask for (tile / option / chat words).
//  If NotebookLM changes a label, edit the lists below (lowercase; English + Hindi fallbacks).
//  Hindi / other-language wording is a best guess and has NOT been verified on the live site.
// ============================================================================================
const NLM_CONFIG = {
  words: {
    studio:        ["studio", "स्टूडियो"],
    audioOverview: ["audio overview", "customize audio", "customise audio", "deep dive conversation", "ऑडियो ओवरव्यू", "ऑडियो अवलोकन"],
    videoOverview: ["video overview", "customize video", "customise video", "वीडियो ओवरव्यू", "वीडियो अवलोकन"],
    video:         ["video", "वीडियो"],
    audio:         ["audio", "ऑडियो"],
    customize:     ["customize", "customise", "कस्टमाइज़", "कस्टमाइज", "अनुकूलित"],
    edit:          ["edit", "संपादित"],
    generate:      ["generate", "create", "जनरेट", "बनाएं", "बनाएँ", "बनाओ"],
    generateLater: ["generate later", "बाद में जनरेट", "बाद में बनाएं"],
    skipButtons:   ["later", "upgrade", "cancel", "close", "create your own", "create own", "अपना बनाएं", "बाद में", "अपग्रेड", "रद्द", "बंद"],
    shortFormat:   ["bite-sized", "9:16", "9_16", "short", "shorts", "vertical", "reel", "शॉर्ट", "वर्टिकल"],
    shortStrong:   ["bite-sized", "9:16", "9_16", "vertical", "reel", "शॉर्ट", "वर्टिकल"],   // checked first
    cinematic:     ["immersive", "cinematic", "16:9", "सिनेमैटिक"],
    explainer:     ["structured", "explainer", "एक्सप्लेनर"],
    customTopic:   ["custom topic", "customised topic", "customized topic", "custom", "describe your own", "अपना विषय", "कस्टम"],
    generating:    ["generating", "creating", "जनरेट हो रहा", "बन रहा है"],
    viewPrompt:     ["view prompt", "prompt and sources"],
    download:       ["download", "डाउनलोड"],
    // v7.10.0: AI Auto — Studio list rows + artifact detail navigation (labels verified live 27 Nov 2026
    // only for Video detail + Audio row menu; the row-open/back/pause selectors below are NOT verified
    // on the live page — every use logs which fallback worked so the first real run teaches us).
    moreOptions:    ["more options", "more actions"],
    backClose:      ["back", "go back", "close"],
    pauseWord:      ["pause"],
  },
  // phrases (lowercase) that mean "daily limit reached" - scanned in dialogs + toasts/alerts only
  limitPhrases: [
    "ai usage limit reached", "usage limit reached", "features will be available after", "will be available after",
    "limit reached. all features", "all features will be available", "reached your daily", "reached the daily",
    "daily limit reached", "daily limit has been reached", "reached your limit", "limit has been reached",
    "try again tomorrow", "come back tomorrow", "quota exceeded", "exceeded your quota", "too many requests",
    "दैनिक सीमा", "उपयोग सीमा", "सीमा पूरी हो", "सीमा तक पहुँच", "कल फिर से कोशिश"
  ],
  selectors: {
    dialogs: "dialog[open], [role='dialog'], .mat-mdc-dialog-surface, .mat-mdc-dialog-container, div[aria-modal='true']",
    notices: ".mat-mdc-snack-bar-container, simple-snack-bar, .mdc-snackbar, mat-snack-bar-container, [role='alert'], [role='status'], [aria-live='assertive'], [aria-live='polite'], .toast, .snackbar, .banner",
    clickables: "button, [role='button'], a[role='button'], mat-chip, md-filled-button, md-outlined-button, div[tabindex='0']",
    radios: "mat-radio-button.tile-radio-button, mat-radio-button, md-radio, [role='radio'], .format-card, .tile-card",
    spinners: "md-circular-progress, mat-progress-spinner, mat-spinner, circular-progress, [role='progressbar'], .generating-spinner, .progress-circle"
  },
  // v4.6.0 - Studio outputs. Each list is lowercase, English first, then Hindi (Hindi = guesses, not verified).
  // tile   = words on the Studio-panel card that opens it;  option = words on the option inside its dialog;
  // chat   = true means "type the prompt in the chat, then press 'Save to note' on the answer".
  // Verified only from Google's public help/blog pages (see VERIFIED_OUTPUTS.txt): Mind maps, Reports (FAQ, study guide,
  // briefing document, AI-suggested, "Create your own"), Flashcards, Quizzes, Save-to-note on a chat response, blog-style reports.
  // NOT verified: a built-in "Timeline" report; the Timeline entry is a custom report with the instruction below.
  outputs: {
    mindmap:     { label: "Mind Map",      tile: ["mind map", "mind-map", "माइंड मैप"] },
    study_guide: { label: "Study guide",   tile: ["reports", "report", "रिपोर्ट"], docFormat: true, option: ["study guide", "स्टडी गाइड"] },
    briefing:    { label: "Briefing doc",  tile: ["reports", "report", "रिपोर्ट"], docFormat: true, option: ["briefing doc", "briefing document", "ब्रीफिंग"] },
    faq:         { label: "FAQ",           tile: ["reports", "report", "रिपोर्ट"], docFormat: true, option: ["create your own", "create own", "अपना बनाएं"], instruction: "Write a FAQ: the 10 most likely questions about these sources with short clear answers." },
    blog:        { label: "Blog post",     tile: ["reports", "report", "रिपोर्ट"], docFormat: true, option: ["blog post", "blog", "ब्लॉग"] },
    timeline:    { label: "Timeline (custom report)", tile: ["reports", "report", "रिपोर्ट"], docFormat: true, option: ["create your own", "create own", "अपना बनाएं"],
                   instruction: "Make a timeline of the key events and dates in these sources, in order." },
    flashcards:  { label: "Flashcards",    tile: ["flashcards", "flash cards", "फ्लैशकार्ड"] },
    quiz:        { label: "Quiz",          tile: ["quiz", "क्विज़", "क्विज"] },
    notes:       { label: "Notes (chat answer saved)", chat: true,
                   send: ["send", "submit", "भेजें"], save: ["save to note", "save as note", "नोट में सहेजें", "नोट के रूप में सहेजें"],
                   answerTimeoutMs: 90000 },
    // v5.3.0 - more Studio outputs (tile words only; Google's current wording must be confirmed on the live page)
    slides:      { label: "Slide deck",    tile: ["slide deck", "slides", "presentation", "स्लाइड", "प्रेजेंटेशन"] },
    infographic: { label: "Infographic",   tile: ["infographic", "इन्फोग्राफिक"] },
    datatable:   { label: "Data table",    tile: ["data table", "डेटा टेबल"] },
    // v5.2.0 - audio / video / interactive report started with explicit options picked in the dialog (labels read on the live page)
    audio_choice: { label: "Audio Overview", tile: ["audio overview"], noExclude: true },
    video_choice: { label: "Video Overview", tile: ["video overview"], noExclude: true },
    report_interactive: { label: "Interactive report", tile: ["reports", "report", "रिपोर्ट"] },
    // words that must NOT be taken as an output tile (the audio / video cards have their own flows)
    excludeTile: ["audio overview", "video overview", "customize", "customise", "ऑडियो", "वीडियो"],
    // v5.0.0 words for the new tools (add source / language / chat)
    tools: {
      addSource: ["add source", "add sources", "add a source", "स्रोत जोड़ें", "añadir fuente", "agregar fuente", "ajouter une source", "quelle hinzufügen", "adicionar fonte", "tambahkan sumber", "إضافة مصدر", "ソースを追加", "소스 추가", "添加来源", "添加來源"],
      kinds: {
        website: ["website", "web site", "link", "url", "वेबसाइट", "sitio web", "site web", "webseite", "situs web", "موقع", "ウェブサイト", "웹사이트", "网站", "網站"],
        youtube: ["youtube", "यूट्यूब"],
        text:    ["copied text", "paste text", "pasted text", "copied", "कॉपी किया गया", "texto copiado", "texte copié", "kopierter text", "teks yang disalin", "النص المنسوخ", "コピーしたテキスト", "복사한 텍스트", "复制的文字", "複製的文字"]
      },
      submit: ["insert", "add", "submit", "जोड़ें", "डालें", "insertar", "añadir", "insérer", "ajouter", "einfügen", "inserir", "adicionar", "sisipkan", "tambahkan", "إدراج", "挿入", "삽입", "插入"],
      settings: ["settings", "सेटिंग", "configuración", "paramètres", "einstellungen", "configurações", "pengaturan", "الإعدادات", "設定", "설정", "设置"],
      language: ["output language", "language", "भाषा", "idioma", "langue", "sprache", "língua", "bahasa", "اللغة", "言語", "언어", "语言", "語言"],
      // v5.1.0: the Settings menu item that opens the output-language dialog (real page: "Output language")
      languageItem: ["output language", "idioma de salida", "langue de sortie", "ausgabesprache", "bahasa keluaran", "भाषा आउटपुट", "出力言語", "출력 언어", "输出语言", "輸出語言"],
      save: ["save", "सहेजें", "guardar", "enregistrer", "speichern", "salvar", "simpan", "حفظ", "保存", "저장"]
    }
  },
  timing: { dialogWaitMs: 12 * 300, generateWaitMs: 20000, confirmMs: 10000 }
};
const _has = (text, list) => list.some((w) => text.includes(w));

// v5.0.0 - UI wording in other languages so the tiles are found when NotebookLM runs in a non-English UI.
// ALL of these are translations written by Tab and NOT verified on the live site: if a card is not found, add the exact
// word you see to the matching list (or press "Diagnose page" in the dashboard and send the file to Tab).
const NLM_LANG_PACKS = {
  mindmap:     ["mapa mental", "carte mentale", "mindmap", "peta pikiran", "خريطة ذهنية", "マインドマップ", "마인드맵", "思维导图", "思維導圖", "心智图", "মাইন্ড ম্যাপ", "மைண்ட் மேப்", "మైండ్ మ్యాప్", "माइंड मॅप", "مائنڈ میپ"],
  reports:     ["informes", "informe", "rapports", "rapport", "berichte", "bericht", "relatórios", "relatório", "laporan", "التقارير", "تقرير", "レポート", "보고서", "报告", "報告", "রিপোর্ট", "அறிக்கை", "నివేదిక", "अहवाल", "رپورٹ"],
  flashcards:  ["tarjetas", "fichas", "cartes mémoire", "fiches", "karteikarten", "cartões", "kartu flash", "kartu belajar", "بطاقات", "フラッシュカード", "플래시카드", "闪卡", "抽認卡", "ফ্ল্যাশকার্ড", "ஃபிளாஷ் கார்டு", "ఫ్లాష్‌కార్డ్", "फ्लॅशकार्ड", "فلیش کارڈ"],
  quiz:        ["cuestionario", "questionnaire", "questionário", "kuis", "اختبار", "クイズ", "퀴즈", "测验", "測驗", "কুইজ", "வினாடி வினா", "క్విజ్", "क्विझ", "کوئز"],
  slides:      ["presentación", "diapositivas", "présentation", "diapositives", "folien", "präsentation", "apresentação", "presentasi", "عرض تقديمي", "شرائح", "スライド", "슬라이드", "프레젠테이션", "幻灯片", "演示文稿", "স্লাইড", "ஸ்லைடு", "స్లైడ్"],
  infographic: ["infografía", "infographie", "infografik", "infográfico", "infografis", "إنفوجرافيك", "インフォグラフィック", "인포그래픽", "信息图", "資訊圖表", "ইনফোগ্রাফিক"],
  datatable:   ["tabla de datos", "tableau de données", "datentabelle", "tabela de dados", "tabel data", "جدول بيانات", "データテーブル", "데이터 표", "数据表", "資料表"],
  audio:       ["resumen de audio", "résumé audio", "audio-zusammenfassung", "visão geral em áudio", "ringkasan audio", "ملخص صوتي", "音声概要", "오디오 오버뷰", "音频概览", "音訊摘要"],
  video:       ["resumen en video", "résumé vidéo", "video-zusammenfassung", "visão geral em vídeo", "ringkasan video", "ملخص فيديو", "動画概要", "동영상 개요", "视频概览", "影片摘要"]
};
(function mergeLangPacks() {
  try {
    const O = NLM_CONFIG.outputs, W = NLM_CONFIG.words, P = NLM_LANG_PACKS;
    const add = (list, extra) => { for (const w of extra) if (!list.includes(w)) list.push(w); };
    add(O.mindmap.tile, P.mindmap);
    for (const k of ["study_guide", "briefing", "faq", "blog", "timeline"]) add(O[k].tile, P.reports);
    add(O.flashcards.tile, P.flashcards); add(O.quiz.tile, P.quiz);
    add(O.slides.tile, P.slides); add(O.infographic.tile, P.infographic); add(O.datatable.tile, P.datatable);
    add(W.audioOverview, P.audio); add(W.videoOverview, P.video);
  } catch (e) {}
})();

(function () {
  const oldBox = document.getElementById("nlm-mini-box");
  if (oldBox) oldBox.remove();

  let isBusy = false;
  let autoAiRunning = false;        // v7.10.0: AI Auto pass chal raha hai (wait + rename/download, ghanton chal sakta hai)
  let autoAiStopRequested = false;  // v7.10.0: dashboard se Stop aaya — agle checkpoint par ruk jao
  let selectedAudioFormat = "deep_dive";

  function isVisible(el) {
    if (!el) return false;
    if (el.closest("#nlm-mini-box")) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && parseFloat(style.opacity || "1") > 0.05;
  }

  function selectElementCleanly(target) {
    if (!target) return false;
    try {
      try { window.getSelection?.()?.removeAllRanges?.(); } catch (e) {}
      target.focus?.();
      try {
        const rect = target.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;
        const opts = { bubbles: true, cancelable: true, view: window, composed: true, clientX, clientY };
        target.dispatchEvent(new PointerEvent("pointerdown", opts));
        target.dispatchEvent(new MouseEvent("mousedown", opts));
        target.dispatchEvent(new PointerEvent("pointerup", opts));
        target.dispatchEvent(new MouseEvent("mouseup", opts));
      } catch (e) {}
      target.click();
      try { window.getSelection?.()?.removeAllRanges?.(); } catch (e) {}
      return true;
    } catch (e) {
      try { target.click(); return true; } catch (err) { return false; }
    }
  }

  function isElementDisabled(el) {
    if (!el) return true;
    const btn = el.closest("button, md-filled-button, md-outlined-button, md-text-button, [role='button'], div[role='button']") || el;

    if (btn.disabled || btn.hasAttribute?.("disabled")) return true;
    if (btn.getAttribute?.("aria-disabled") === "true") return true;

    const className = (btn.className && typeof btn.className === "string") ? btn.className.toLowerCase() : "";
    if (
      className.includes("disabled") ||
      className.includes("-disabled") ||
      className.includes("--disabled")
    ) {
      return true;
    }

    try {
      const style = window.getComputedStyle(btn);
      if (style.pointerEvents === "none") return true;
      if (parseFloat(style.opacity) < 0.45) return true;
      if (style.cursor === "not-allowed") return true;
    } catch (e) {}

    return false;
  }

  // Close open dialog cleanly on error so it never blocks subsequent runs
  async function closeActiveDialogIfOpen() {
    const dialog = getActiveVideoDialog() || getActiveDialog();
    if (!dialog) return;

    const buttons = dialog.querySelectorAll("button, [role='button']");
    for (const btn of buttons) {
      const label = `${btn.getAttribute("aria-label") || ""} ${btn.innerText || btn.textContent || ""}`.trim().toLowerCase();
      if (label === "close" || label === "cancel" || label === "✕" || label === "×" || label.includes("close")) {
        selectElementCleanly(btn);
        await new Promise((r) => setTimeout(r, 250));
        return;
      }
    }

    // Fallback: Dispatch Escape key
    try {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {}
  }

  // Check for NotebookLM AI Quota / Daily Limit Exhaustion
  // v4.5.0: also looks at toasts/snackbars/alerts (limit messages often appear there, not in the dialog)
  const LIMIT_PHRASES = NLM_CONFIG.limitPhrases;
  const NOTICE_SELECTOR = NLM_CONFIG.selectors.notices;

  function collectNoticeText(dialog) {
    const parts = [];
    const seen = new Set();
    const add = (el) => {
      if (!el || seen.has(el)) return;
      seen.add(el);
      if (el.closest && el.closest("#nlm-mini-box")) return;
      parts.push(el.innerText || el.textContent || "");
    };
    if (dialog && isVisible(dialog)) add(dialog);   // a closed/hidden dialog's old text must not count
    document.querySelectorAll("dialog[open], [role='dialog'], .mat-mdc-dialog-container, div[aria-modal='true']").forEach((d) => {
      if (isVisible(d)) add(d);
    });
    document.querySelectorAll(NOTICE_SELECTOR).forEach((n) => {
      if (isVisible(n)) add(n);
    });
    return parts.join("\n").toLowerCase();
  }

  function checkQuotaExhaustion(dialog) {
    const target = dialog || getActiveVideoDialog();
    const fullText = collectNoticeText(target);
    if (!fullText.trim()) return { exhausted: false };

    for (const phrase of LIMIT_PHRASES) {
      if (fullText.includes(phrase)) {
        const timeMatch = fullText.match(/(?:available|try again|resets?)\s+(?:after|at|in|on)?\s*([0-9]{1,2}(?::[0-9]{2})?\s*(?:[ap]\.?m\.?)?)/i);
        const resetInfo = timeMatch ? ` All features will be available after ${timeMatch[1].trim().replace(/\.$/, "").toUpperCase()}.` : "";
        return {
          exhausted: true,
          error: `🛑 NotebookLM AI usage limit reached.${resetInfo}`
        };
      }
    }

    return { exhausted: false };
  }

  // Get all format radio buttons / cards inside the Video dialog
  function getFormatRadioButtons(dialog) {
    const root = dialog || getActiveVideoDialog() || document;
    const candidates = root.querySelectorAll(NLM_CONFIG.selectors.radios);

    let shortBtn = null;
    let cinematicBtn = null;
    let explainerBtn = null;

    for (const r of candidates) {
      if (r.closest("#nlm-mini-box")) continue;
      // Combine element text and parent wrapper text for reliable detection
      const text = `${r.innerText || r.textContent || ""} ${r.getAttribute("aria-label") || ""}`.toLowerCase();

      // Skip topic radio buttons ("Custom topic" / "Suggested topic")
      if (text.includes("custom") && text.includes("topic")) continue;

      if (_has(text, NLM_CONFIG.words.shortStrong) && !(_has(text, NLM_CONFIG.words.cinematic) && _has(text, NLM_CONFIG.words.explainer))) {
        shortBtn = r;
      } else if (_has(text, NLM_CONFIG.words.cinematic)) {
        cinematicBtn = r;
      } else if (_has(text, NLM_CONFIG.words.explainer)) {
        explainerBtn = r;
      } else if (_has(text, NLM_CONFIG.words.shortFormat)) {
        shortBtn = r;
      }
    }
    return { shortBtn, cinematicBtn, explainerBtn };
  }

  function isRadioSelected(radio) {
    if (!radio) return false;
    if (
      radio.classList.contains("mat-mdc-radio-checked") ||
      radio.classList.contains("selected") ||
      radio.classList.contains("checked") ||
      radio.getAttribute("aria-checked") === "true" ||
      radio.getAttribute("aria-selected") === "true" ||
      !!radio.querySelector("input[type='radio']:checked") ||
      !!radio.querySelector("input:checked") ||
      !!radio.querySelector("[aria-checked='true']")
    ) {
      return true;
    }

    const parentRadio = radio.closest("mat-radio-button, [role='radio']");
    if (parentRadio && parentRadio !== radio) {
      return (
        parentRadio.classList.contains("mat-mdc-radio-checked") ||
        parentRadio.getAttribute("aria-checked") === "true" ||
        !!parentRadio.querySelector("input:checked")
      );
    }
    return false;
  }

  async function ensureShortFormatSelected(dialog) {
    const root = dialog || getActiveVideoDialog();
    const { shortBtn } = getFormatRadioButtons(root);
    if (!shortBtn) {
      console.warn("⚠️ Short radio button not found in dialog!");
      return false;
    }

    if (isRadioSelected(shortBtn)) {
      return true;
    }

    const clickable = shortBtn.querySelector(".mat-mdc-radio-touch-target, label, input[type='radio'], .mdc-radio") || shortBtn;
    selectElementCleanly(clickable);
    await new Promise((r) => setTimeout(r, 350));

    if (isRadioSelected(shortBtn)) {
      return true;
    }

    selectElementCleanly(shortBtn);
    const radioInput = shortBtn.querySelector("input[type='radio']");
    if (radioInput && !radioInput.checked) {
      try {
        radioInput.checked = true;
        radioInput.dispatchEvent(new Event("change", { bubbles: true }));
        radioInput.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (e) {}
    }
    await new Promise((r) => setTimeout(r, 350));
    return isRadioSelected(shortBtn);
  }

  function ensureStudioTabSelected() {
    const tabs = document.querySelectorAll("button, [role='tab'], [role='button'], div[role='tab']");
    for (const t of tabs) {
      if (t.closest("#nlm-mini-box")) continue;
      const text = (t.innerText || t.textContent || "").trim().toLowerCase();
      const aria = (t.getAttribute("aria-label") || "").trim().toLowerCase();
      if (_has(text, NLM_CONFIG.words.studio) || _has(aria, NLM_CONFIG.words.studio)) {
        if (text.includes("settings") || aria.includes("settings")) continue;
        // v5.2.0: on the live page the Studio is a side panel with a "Collapse studio panel" / "Expand studio panel" button; clicking
        // "collapse" hid the whole panel (found on the real page), so: open panel -> leave it; closed panel -> expand it.
        if (aria.includes("collapse")) return true;
        if (aria.includes("expand")) { selectElementCleanly(t); return true; }
        const clickable = t.closest("button, [role='tab'], [role='button'], div[role='tab']") || t;
        if (!clickable.classList.contains("active") && clickable.getAttribute("aria-selected") !== "true") {
          selectElementCleanly(clickable);
        }
        return true;
      }
    }
    return false;
  }

  function getActiveVideoDialog() {
    const dialogs = document.querySelectorAll(NLM_CONFIG.selectors.dialogs);
    for (const d of dialogs) {
      if (d.closest("#nlm-mini-box")) continue;
      const rect = d.getBoundingClientRect();
      if (rect.height > 100 && rect.width > 200) {
        const text = (d.innerText || d.textContent || "").toLowerCase();
        if (_has(text, NLM_CONFIG.words.audioOverview) && !_has(text, NLM_CONFIG.words.video)) continue;
        if (
          _has(text, NLM_CONFIG.words.videoOverview) ||
          (_has(text, NLM_CONFIG.words.cinematic) && _has(text, NLM_CONFIG.words.shortFormat)) ||
          (_has(text, NLM_CONFIG.words.shortFormat) && _has(text, NLM_CONFIG.words.explainer))
        ) {
          return d;
        }
      }
    }
    return null;
  }

  function getActiveDialog() {
    const dialogs = document.querySelectorAll(NLM_CONFIG.selectors.dialogs);
    for (const d of dialogs) {
      if (isVisible(d)) return d;
    }
    return null;
  }

  function findStudioContainer() {
    ensureStudioTabSelected();
    const direct = document.querySelector("section.studio-panel, .studio-panel");
    if (direct && isVisible(direct)) return direct;

    const allContainers = document.querySelectorAll(
      "aside, mat-sidenav, .studio-container, .studio-panel, [role='region'], section, div"
    );
    let best = null;
    let bestArea = Infinity;
    for (const c of allContainers) {
      if (c.closest("#nlm-mini-box")) continue;
      const rect = c.getBoundingClientRect();
      if (rect.left >= window.innerWidth * 0.42 && rect.width > 180 && rect.width < window.innerWidth * 0.65 && rect.height > 200) {
        const text = (c.innerText || c.textContent || "").toLowerCase();
        if (
          (_has(text, NLM_CONFIG.words.audioOverview) && _has(text, NLM_CONFIG.words.videoOverview)) ||
          (text.includes("studio") && text.includes("video"))
        ) {
          const area = rect.width * rect.height;
          if (area < bestArea) { bestArea = area; best = c; }
        }
      }
    }
    return best || document.body;
  }

  // Open Video Overview Customize Dialog strictly using real interactive controls
  async function openVideoOverviewDialog() {
    if (getActiveVideoDialog()) return true;

    ensureStudioTabSelected();
    await new Promise((r) => setTimeout(r, 250));

    for (let attempt = 0; attempt < 12; attempt++) {
      if (getActiveVideoDialog()) return true;

      const studio = findStudioContainer();
      const buttons = studio.querySelectorAll(NLM_CONFIG.selectors.clickables);

      let foundTrigger = null;

      // Priority 1: Look for explicit "Customize" / "Edit" button associated with Video Overview
      for (const btn of buttons) {
        if (!isVisible(btn)) continue;
        const label = `${btn.getAttribute("aria-label") || ""} ${btn.innerText || btn.textContent || ""}`.toLowerCase();
        if (_has(label, NLM_CONFIG.words.audio)) continue;

        if (
          _has(label, NLM_CONFIG.words.customize) &&
          _has(label, NLM_CONFIG.words.video)
        ) {
          foundTrigger = btn;
          break;
        }

        if (_has(label, NLM_CONFIG.words.customize)) {
          const card = btn.closest(".studio-item, .artifact-card, mat-card, [ class*='video' i], div");
          const cardText = (card?.innerText || card?.textContent || "").toLowerCase();
          if (_has(cardText, NLM_CONFIG.words.video) && !_has(cardText, NLM_CONFIG.words.audio)) {
            foundTrigger = btn;
            break;
          }
        }
      }

      // Priority 2: Direct "Video Overview" / "Video" creation button in Studio
      if (!foundTrigger) {
        for (const btn of buttons) {
          if (!isVisible(btn)) continue;
          const text = (btn.innerText || btn.textContent || "").trim().toLowerCase();
          const aria = (btn.getAttribute("aria-label") || "").trim().toLowerCase();

          if (_has(text, NLM_CONFIG.words.audio) || _has(aria, NLM_CONFIG.words.audio)) continue;
          if (text.includes("may take a while") || _has(text, NLM_CONFIG.words.generating)) continue;

          if (
            NLM_CONFIG.words.videoOverview.concat(NLM_CONFIG.words.video, ["create video"]).some((w) => text === w || aria === w) ||
            (_has(text, NLM_CONFIG.words.videoOverview) && text.length < 35)
          ) {
            foundTrigger = btn;
            break;
          }
        }
      }

      if (foundTrigger) {
        selectElementCleanly(foundTrigger);
      }

      await new Promise((r) => setTimeout(r, 300));
      if (getActiveVideoDialog()) return true;
    }

    return !!getActiveVideoDialog();
  }

  // Click "Custom topic" radio/button strictly inside dialog (NEVER click the dialog header!)
  function clickCustomTopicOptionInDialog(dialog) {
    if (!dialog) dialog = getActiveVideoDialog();
    if (!dialog) return false;

    const existingTa = findVideoTopicTextarea(dialog);
    if (existingTa) {
      existingTa.focus?.();
      return true;
    }

    // Only look at interactive radio/button/label elements, never generic divs/headers
    const candidates = dialog.querySelectorAll(
      "mat-radio-button, [role='radio'], md-radio, label, button, [role='button']"
    );

    for (const el of candidates) {
      if (el.closest("#nlm-mini-box")) continue;
      const text = (el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim().toLowerCase();

      // Explicitly ignore the dialog title ("Customize Video Overview")
      if (_has(text, NLM_CONFIG.words.videoOverview) || _has(text, NLM_CONFIG.words.audioOverview)) continue;

      if (
        NLM_CONFIG.words.customTopic.some((w) => text === w) ||
        /custom(is|iz)?ed?\s+topic/i.test(text) ||
        text.includes("describe your own")
      ) {
        const clickable = el.closest("mat-radio-button, [role='radio'], md-radio, label, button, [role='button']") || el;
        const radioTarget = clickable.querySelector("label, input[type='radio']") || clickable;
        selectElementCleanly(radioTarget);
        return true;
      }
    }

    return false;
  }

  // Find visible topic textarea strictly inside the Video Overview dialog
  function findVideoTopicTextarea(dialog) {
    if (!dialog) dialog = getActiveVideoDialog();
    if (!dialog) return null;

    const textareas = dialog.querySelectorAll("textarea");

    // 1. Visible textarea matching topic placeholders
    for (const ta of textareas) {
      if (!isVisible(ta)) continue;
      const ph = (ta.getAttribute("placeholder") || "").toLowerCase();
      if (
        ph.includes("describe") ||
        ph.includes("own") ||
        ph.includes("instruction") ||
        ph.includes("topic") ||
        ph.includes("custom") ||
        ph.includes("focus")
      ) {
        return ta;
      }
    }

    // 2. Any visible textarea inside the dialog
    for (const ta of textareas) {
      if (isVisible(ta)) return ta;
    }

    return null;
  }

  function fillTextareaRockSolid(ta, val) {
    if (!ta) return false;
    try {
      // Ensure no whole-page text selection / blue highlight
      try { window.getSelection?.()?.removeAllRanges?.(); } catch (e) {}

      ta.focus?.();
      ta.click?.();
      ta.value = "";

      // Native property setter ensures Angular/React/MatInput detects change cleanly
      try {
        const proto = window.HTMLTextAreaElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (setter) {
          setter.call(ta, val);
        } else {
          ta.value = val;
        }
      } catch (e) {
        ta.value = val;
      }

      // Keep selection safely inside the textarea only (cursor at end), never on document
      try {
        ta.setSelectionRange?.(val.length, val.length);
      } catch (e) {}

      const opts = { bubbles: true, composed: true, cancelable: true };
      try {
        ta.dispatchEvent(new InputEvent("beforeinput", { ...opts, data: val, inputType: "insertText" }));
      } catch (e) {}
      ta.dispatchEvent(new Event("input", opts));
      ta.dispatchEvent(new Event("change", opts));
      ta.dispatchEvent(new KeyboardEvent("keydown", { ...opts, key: " " }));
      ta.dispatchEvent(new KeyboardEvent("keyup", { ...opts, key: " " }));

      // Clean up any stray selection ranges so screen never turns blue
      try { window.getSelection?.()?.removeAllRanges?.(); } catch (e) {}

      return (ta.value || "").trim().length > 0;
    } catch (err) {
      ta.value = val;
      try { window.getSelection?.()?.removeAllRanges?.(); } catch (e) {}
      return (ta.value || "").trim().length > 0;
    }
  }

  function normalizeText(str) {
    return (str || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  }

  function verifyVideoTopicFilled(dialog, expectedText) {
    const ta = findVideoTopicTextarea(dialog);
    if (!ta) return false;
    const currentVal = normalizeText(ta.value || ta.textContent || "");
    if (!currentVal) return false;
    if (!expectedText || !expectedText.trim()) return true;

    const exp = normalizeText(expectedText);
    const prefix = exp.substring(0, Math.min(25, exp.length));
    return currentVal === exp || currentVal.includes(prefix);
  }

  async function fillVideoTopicAsync(promptText) {
    if (!promptText || promptText.trim().length === 0) return true;
    const cleanPrompt = promptText.trim();

    for (let attempt = 0; attempt < 8; attempt++) {
      const dialog = getActiveVideoDialog();
      if (!dialog) {
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }

      clickCustomTopicOptionInDialog(dialog);
      await new Promise((r) => setTimeout(r, 200));

      const targetTa = findVideoTopicTextarea(dialog);
      if (targetTa) {
        fillTextareaRockSolid(targetTa, cleanPrompt);
        await new Promise((r) => setTimeout(r, 200));

        if (verifyVideoTopicFilled(dialog, cleanPrompt)) {
          return true;
        }
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return false;
  }

  function clickGenerateButtonInDialog(dialog, opts) {
    opts = opts || {};
    const allowLater = opts.allowLater !== false;      // default true = old behaviour
    const laterGraceMs = opts.laterGraceMs || 0;       // give the real Generate button time to enable first
    let sawLaterOnly = false;
    if (!dialog) return null;

    const quotaCheck = checkQuotaExhaustion(dialog);
    if (quotaCheck.exhausted) {
      return { quotaExhausted: true, error: quotaCheck.error };
    }

    const candidates = dialog.querySelectorAll(
      "button, md-filled-button, md-outlined-button, md-text-button, [role='button']"
    );

    // TIER 1: Immediate Generate Button
    for (const el of candidates) {
      if (!isVisible(el)) continue;
      const text = (el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim();

      const tl = text.toLowerCase();
      if (_has(tl, NLM_CONFIG.words.skipButtons)) continue;

      if (
        /\bgenerate\b/i.test(text) ||
        /\bcreate\b/i.test(text) ||
        tl.startsWith("generate") ||
        _has(tl, NLM_CONFIG.words.generate.filter((w) => !/^[a-z]+$/.test(w)))   // non-English labels
      ) {
        if (text.length > 35) continue;
        if (isElementDisabled(el)) continue;
        selectElementCleanly(el);
        return { clicked: true, action: "now" };
      }
    }

    // TIER 2: "Generate later" Button
    for (const el of candidates) {
      if (!isVisible(el)) continue;
      const text = (el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim();

      if (/generate\s+later/i.test(text) || _has(text.toLowerCase(), NLM_CONFIG.words.generateLater)) {
        if (isElementDisabled(el)) {
          const qCheck = checkQuotaExhaustion(dialog);
          if (qCheck.exhausted) {
            return { quotaExhausted: true, error: qCheck.error };
          }
          continue;
        }
        if (!allowLater || (opts.elapsedMs || 0) < laterGraceMs) {
          sawLaterOnly = true;
          continue;
        }
        selectElementCleanly(el);
        return { clicked: true, action: "later" };
      }
    }

    const finalQuota = checkQuotaExhaustion(dialog);
    if (finalQuota.exhausted) {
      return { quotaExhausted: true, error: finalQuota.error };
    }

    if (sawLaterOnly) return { limitSuspected: true };
    return null;
  }


  // v4.5.0: robust "click Generate" - polls (default up to 20 s) until the button is enabled,
  // instead of giving up after ~1.5 s. Returns {clicked}/{quotaExhausted}/null.
  async function clickGenerateWithWait(getDialog, fallbackDialog, opts) {
    opts = opts || {};
    const waitMs = Math.max(2000, Number(opts.waitMs) || 20000);
    const t0 = Date.now();
    let last = null;
    while (Date.now() - t0 < waitMs) {
      const d = getDialog() || fallbackDialog;
      last = clickGenerateButtonInDialog(d, {
        allowLater: opts.allowLater,
        laterGraceMs: Math.min(4000, waitMs / 2),
        elapsedMs: Date.now() - t0
      });
      if (last && (last.clicked || last.quotaExhausted)) return last;
      await new Promise((r) => setTimeout(r, 400));
    }
    if (last && last.limitSuspected) {
      return {
        quotaExhausted: true,
        error: "🛑 Generate button stayed disabled (only 'Generate later' is offered) - NotebookLM is most likely at its daily limit."
      };
    }
    return last;
  }

  // v4.5.0: after clicking Generate, wait (max ~10 s) until the dialog closes or generation starts,
  // and re-check for a limit message that may pop up right after the click.
  async function confirmGenerationStarted(getDialog) {
    const t0 = Date.now();
    let closed = false;
    while (Date.now() - t0 < 10000) {
      await new Promise((r) => setTimeout(r, 400));
      const q = checkQuotaExhaustion(getDialog());
      if (q.exhausted) return { quotaExhausted: true, error: q.error };
      if (!getDialog()) { closed = true; break; }
      if (isGeneratingActive()) return { confirmed: true };
    }
    if (closed) {
      await new Promise((r) => setTimeout(r, 1500));
      const q2 = checkQuotaExhaustion(null);
      if (q2.exhausted) return { quotaExhausted: true, error: q2.error };
      return { confirmed: true };
    }
    return { confirmed: false };
  }

  // Full sequence for Video (Shorts 9:16)
  async function generateVideoFlow(customTopic = null, opts = {}) {
    if (isBusy) {
      return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab. Please wait and retry." };
    }
    isBusy = true;

    try {
      const userTopic = customTopic !== null
        ? customTopic
        : (document.getElementById("nlm-input-topic")?.value.trim() || "");

      const preQuota = checkQuotaExhaustion(getActiveVideoDialog());
      if (preQuota.exhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: preQuota.error };
      }

      const opened = await openVideoOverviewDialog();
      if (!opened) {
        return {
          success: false,
          error: "Video Overview dialog could not be opened. Make sure a Notebook with sources is open in NotebookLM."
        };
      }
      await new Promise((r) => setTimeout(r, 350));

      const dialog = getActiveVideoDialog();
      const initialQuota = checkQuotaExhaustion(dialog);
      if (initialQuota.exhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: initialQuota.error };
      }

      // Select Short (9:16) format cleanly
      await ensureShortFormatSelected(dialog);

      const { shortBtn: curShortBtn, cinematicBtn: curCineBtn } = getFormatRadioButtons(dialog);
      if (curShortBtn || curCineBtn) {
        const isShortChecked = curShortBtn && isRadioSelected(curShortBtn);
        const isCineChecked = curCineBtn && isRadioSelected(curCineBtn);

        if (!isShortChecked || isCineChecked) {
          await ensureShortFormatSelected(dialog);
          await new Promise((r) => setTimeout(r, 350));

          const { shortBtn: freshShort, cinematicBtn: freshCine } = getFormatRadioButtons(dialog);
          const retryShort = freshShort && isRadioSelected(freshShort);
          const retryCine = freshCine && isRadioSelected(freshCine);

          if ((freshShort && !retryShort) || retryCine) {
            await closeActiveDialogIfOpen();
            return {
              success: false,
              error: "🔒 SAFETY LOCK: Short (9:16) format select nahi ho saka. Cinematic generation ROK di gayi hai!"
            };
          }
        }
      }

      // Fill Custom Topic
      let topicFilled = true;
      if (userTopic && userTopic.length > 0) {
        topicFilled = await fillVideoTopicAsync(userTopic);
      }

      if (userTopic && userTopic.length > 0 && !topicFilled) {
        await closeActiveDialogIfOpen();
        return {
          success: false,
          error: "🔒 PROMPT SAFETY BLOCK: Prompt text box ('Describe your own') mein fill nahi ho saka. Empty video generation ROK diya gaya hai!"
        };
      }

      await new Promise((r) => setTimeout(r, 400));

      // Final verification before clicking Generate
      const finalDialog = getActiveVideoDialog() || dialog;
      const { shortBtn: finalShortBtn, cinematicBtn: finalCineBtn } = getFormatRadioButtons(finalDialog);
      if (finalCineBtn && isRadioSelected(finalCineBtn)) {
        await closeActiveDialogIfOpen();
        return { success: false, error: "🔒 FINAL SAFETY LOCK: Cinematic format selected hai! Generation BLOCK." };
      }
      if (finalShortBtn && !isRadioSelected(finalShortBtn)) {
        await closeActiveDialogIfOpen();
        return { success: false, error: "🔒 FINAL SAFETY LOCK: Short (9:16) format checked nahi hai! Generation BLOCK." };
      }

      if (userTopic && userTopic.length > 0 && !verifyVideoTopicFilled(finalDialog, userTopic)) {
        await fillVideoTopicAsync(userTopic);
        if (!verifyVideoTopicFilled(finalDialog, userTopic)) {
          await closeActiveDialogIfOpen();
          return {
            success: false,
            error: "🔒 PROMPT SAFETY BLOCK: Generate dabane se pehle prompt gayab ho gaya. Empty video generation ROK diya gaya!"
          };
        }
      }

      // Click Generate
      const clickedResult = await clickGenerateWithWait(getActiveVideoDialog, dialog, opts);

      if (clickedResult?.quotaExhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: clickedResult.error };
      }

      if (!clickedResult || !clickedResult.clicked) {
        const lastQuota = checkQuotaExhaustion(getActiveVideoDialog());
        await closeActiveDialogIfOpen();
        if (lastQuota.exhausted) {
          return { success: false, quotaExhausted: true, error: lastQuota.error };
        }
        return { success: false, error: "Generate button could not be clicked in dialog." };
      }

      const conf = await confirmGenerationStarted(getActiveVideoDialog);
      if (conf.quotaExhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: conf.error };
      }
      return {
        success: true,
        action: clickedResult.action,
        confirmed: !!conf.confirmed
      };
    } finally {
      isBusy = false;
    }
  }


  // ================= AUDIO OVERVIEW FLOW =================
  function getActiveAudioDialog() {
    const dialogs = document.querySelectorAll(NLM_CONFIG.selectors.dialogs);
    for (const d of dialogs) {
      if (d.closest("#nlm-mini-box")) continue;
      const rect = d.getBoundingClientRect();
      if (rect.height > 100 && rect.width > 200) {
        const t = (d.innerText || d.textContent || "").toLowerCase();
        if (_has(t, NLM_CONFIG.words.audioOverview)) {
          return d;
        }
      }
    }
    return null;
  }

  async function openAudioOverviewDialog() {
    if (getActiveAudioDialog()) return true;

    ensureStudioTabSelected();
    await new Promise((r) => setTimeout(r, 250));

    for (let attempt = 0; attempt < 12; attempt++) {
      if (getActiveAudioDialog()) return true;

      const studio = findStudioContainer();
      const buttons = studio.querySelectorAll(NLM_CONFIG.selectors.clickables);

      let foundTrigger = null;

      // Priority 1: "Customize" button on Audio Overview card
      for (const btn of buttons) {
        if (!isVisible(btn)) continue;
        const label = `${btn.getAttribute("aria-label") || ""} ${btn.innerText || btn.textContent || ""}`.toLowerCase();
        if (_has(label, NLM_CONFIG.words.video)) continue;

        if (
          (_has(label, NLM_CONFIG.words.customize) || _has(label, NLM_CONFIG.words.edit)) &&
          _has(label, NLM_CONFIG.words.audio)
        ) {
          foundTrigger = btn;
          break;
        }

        if (_has(label, NLM_CONFIG.words.customize) || _has(label, NLM_CONFIG.words.edit)) {
          const card = btn.closest(".studio-item, .artifact-card, mat-card, div");
          const cardText = (card?.innerText || card?.textContent || "").toLowerCase();
          if (_has(cardText, NLM_CONFIG.words.audio) && !_has(cardText, NLM_CONFIG.words.video)) {
            foundTrigger = btn;
            break;
          }
        }
      }

      // Priority 2: Direct "Audio Overview" button in Studio
      if (!foundTrigger) {
        for (const btn of buttons) {
          if (!isVisible(btn)) continue;
          const t = (btn.innerText || btn.textContent || "").trim().toLowerCase();
          const aria = (btn.getAttribute("aria-label") || "").trim().toLowerCase();

          if (_has(t, NLM_CONFIG.words.video) || _has(aria, NLM_CONFIG.words.video)) continue;
          if (t.includes("may take a while") || _has(t, NLM_CONFIG.words.generating)) continue;

          if (
            NLM_CONFIG.words.audioOverview.concat(NLM_CONFIG.words.audio).some((w) => t === w || aria === w) ||
            (_has(t, NLM_CONFIG.words.audioOverview) && t.length < 35)
          ) {
            foundTrigger = btn;
            break;
          }
        }
      }

      if (foundTrigger) {
        selectElementCleanly(foundTrigger);
      }

      await new Promise((r) => setTimeout(r, 300));
      if (getActiveAudioDialog()) return true;
    }

    return !!getActiveAudioDialog();
  }

  async function generateAudioFlow(customTopic = null, opts = {}) {
    if (isBusy) {
      return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab. Please wait and retry." };
    }
    isBusy = true;

    try {
      const userTopic = (customTopic || "").trim();

      const preQuota = checkQuotaExhaustion(getActiveAudioDialog());
      if (preQuota.exhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: preQuota.error };
      }

      const opened = await openAudioOverviewDialog();
      if (!opened) {
        return {
          success: false,
          error: "Audio Overview dialog could not be opened. Make sure a Notebook with sources is open in NotebookLM."
        };
      }
      await new Promise((r) => setTimeout(r, 350));

      const dialog = getActiveAudioDialog();
      const initialQuota = checkQuotaExhaustion(dialog);
      if (initialQuota.exhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: initialQuota.error };
      }

      // Fill topic in textarea
      if (userTopic && userTopic.length > 0) {
        const textareas = dialog.querySelectorAll("textarea, [contenteditable='true'], input[type='text']");
        let targetTa = null;
        for (const ta of textareas) {
          if (isVisible(ta)) { targetTa = ta; break; }
        }
        if (targetTa) {
          fillTextareaRockSolid(targetTa, userTopic);
          await new Promise((r) => setTimeout(r, 250));
        }
      }

      // Click Generate
      const clickedResult = await clickGenerateWithWait(getActiveAudioDialog, dialog, opts);

      if (clickedResult?.quotaExhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: clickedResult.error };
      }

      if (!clickedResult || !clickedResult.clicked) {
        await closeActiveDialogIfOpen();
        return { success: false, error: "Generate button could not be clicked in Audio dialog." };
      }

      const conf = await confirmGenerationStarted(getActiveAudioDialog);
      if (conf.quotaExhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: conf.error };
      }
      return {
        success: true,
        action: clickedResult.action,
        confirmed: !!conf.confirmed,
        message: "Started generating Audio Overview!"
      };
    } finally {
      isBusy = false;
    }
  }


  // ================= v4.6.0: generic Studio outputs (Mind Map, Reports, Flashcards, Quiz, Notes) =================
  const OUT = NLM_CONFIG.outputs;
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  // first visible clickable under root whose text or aria-label contains one of the words
  function findClickableByWords(root, words, excludeWords, maxTextLen) {
    const scope = root || document;
    const maxLen = maxTextLen || 300;
    for (const el of scope.querySelectorAll(NLM_CONFIG.selectors.clickables)) {
      if (!isVisible(el)) continue;
      const text = (el.innerText || el.textContent || "").trim().toLowerCase();
      const aria = (el.getAttribute("aria-label") || "").trim().toLowerCase();
      if (text.length > maxLen && aria.length === 0) continue;
      if (excludeWords && (_has(text, excludeWords) || _has(aria, excludeWords))) continue;
      if (_has(text, words) || _has(aria, words)) return el;
    }
    return null;
  }

  function countClickableByWords(root, words) {
    let n = 0;
    for (const el of (root || document).querySelectorAll(NLM_CONFIG.selectors.clickables)) {
      if (!isVisible(el)) continue;
      const text = (el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim().toLowerCase();
      if (text.length < 60 && _has(text, words)) n++;
    }
    return n;
  }

  function findVisibleTextarea(dialog) {
    for (const ta of (dialog || document).querySelectorAll("textarea, [contenteditable='true'], input[type='text']")) {
      if (isVisible(ta)) return ta;
    }
    return null;
  }


  // ======================= v5.2.0 : exact option picking inside Studio dialogs =======================
  // Real labels read on the live NotebookLM page (Pro test account, 6 Nov 2026). Matching is EXACT on the first text line of a
  // radio / toggle / chip, so "Short" never hits a long description text.
  function _firstLine(el) {
    const lines = (el.innerText || el.textContent || "").split(/\n/).map((s) => s.trim()).filter(Boolean);
    // skip Material icon ligature lines (check, crop_16_9, ...) and the "New!" badge that sit before the real label
    const real = lines.find((s) => !/^(check|checkmark|edit|new!?|[a-z0-9]+(_[a-z0-9]+)+)$/i.test(s));
    return (real || lines[0] || "").toLowerCase();
  }
  function findChoice(dialog, label) {
    const want = String(label || "").trim().toLowerCase();
    if (!want) return null;
    let best = null;
    const sel = "mat-radio-button, [role='radio'], [role='option'], mat-button-toggle, button, [role='button'], mat-chip, label, div[tabindex]";
    for (const el of dialog.querySelectorAll(sel)) {
      if (!isVisible(el)) continue;
      const aria = (el.getAttribute("aria-label") || "").trim().toLowerCase();
      if (_firstLine(el) === want || aria === want) {
        const rank = (el.tagName === "MAT-RADIO-BUTTON" || el.getAttribute("role") === "radio") ? 0 : (el.tagName === "BUTTON" ? 1 : 2);
        if (!best || rank < best.rank) best = { el, rank };
      }
    }
    return best ? best.el : null;
  }
  function selectedChoices(dialog) {
    const out = [];
    for (const el of dialog.querySelectorAll("mat-radio-button, [role='radio'], [role='option'], mat-button-toggle, button, mat-chip, div[tabindex]")) {
      if (!isVisible(el)) continue;
      const inp = el.tagName === "MAT-RADIO-BUTTON" ? el.querySelector("input[type='radio']") : null;
      const on = (inp && inp.checked) || el.getAttribute("aria-checked") === "true" || el.getAttribute("aria-selected") === "true" ||
        /(^|\s)(mat-mdc-radio-checked|mat-button-toggle-checked|mdc-evolution-chip--selected|selected)(\s|$)/.test(String(el.className || ""));
      if (on) { const l = _firstLine(el); if (l && l.length < 40) out.push(l); }
    }
    return Array.from(new Set(out));
  }
  async function applyChoices(dialog, choices) {
    const report = { wanted: [], missing: [] };
    if (!dialog || !Array.isArray(choices)) return report;
    for (const c of choices) {
      report.wanted.push(c);
      const el = findChoice(dialog, c);
      if (!el) { report.missing.push(c); continue; }
      const target = el.tagName === "MAT-RADIO-BUTTON" ? (el.querySelector("label") || el) : el;
      selectElementCleanly(target);
      await pause(500);
      if (el.tagName === "MAT-RADIO-BUTTON") {
        const inp = el.querySelector("input[type='radio']");
        if (inp && !inp.checked) { try { inp.click(); } catch (e) {} await pause(400); }
      }
    }
    report.selected = selectedChoices(dialog);
    return report;
  }


  // ======================= v5.3.0 : chat settings + web/Drive research =======================
  async function pointerClickReal(el) { selectElementCleanly(el); await pause(900); }
  async function openNotebookMenuItem(word) {
    const btn = document.querySelector("button[aria-label='Notebook configuration']");
    if (!btn) return null;
    await pointerClickReal(btn);
    for (let i = 0; i < 6; i++) {
      for (const it of document.querySelectorAll("[role='menuitem']")) {
        if (isVisible(it) && (it.innerText || "").toLowerCase().includes(word)) return it;
      }
      await pause(400);
    }
    return null;
  }
  // Notebook configuration > Configure chat : conversational style (Default / Learning guide / Custom) + response length (Default / Longer / Shorter)
  async function configureChatFlow(opts) {
    opts = opts || {};
    if (isBusy) return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab." };
    isBusy = true;
    try {
      const item = await openNotebookMenuItem("configure chat");
      if (!item) return { success: false, error: "Menu 'Notebook configuration > Configure chat' not found." };
      selectElementCleanly(item); await pause(1500);
      const dlg = getActiveDialog();
      if (!dlg) return { success: false, error: "Configure chat dialog did not open." };
      const radios = Array.from(dlg.querySelectorAll("[role='radio']")).filter(isVisible);
      const pick = (group, label) => { const el = group.find((r) => _firstLine(r) === String(label).toLowerCase()); if (el) { selectElementCleanly(el); return true; } return false; };
      const done = [];
      if (opts.style) { if (!pick(radios.slice(0, 3), opts.style)) return { success: false, error: `Chat style "${opts.style}" not found (Default / Learning guide / Custom).` }; done.push(opts.style); await pause(600); }
      if (opts.style && /custom/i.test(opts.style) && opts.custom) {
        const ta = findVisibleTextarea(dlg) || findVisibleTextarea(getActiveDialog());
        if (!ta) return { success: false, error: "Custom style text box not found." };
        fillTextareaRockSolid(ta, opts.custom); await pause(400); done.push("custom text");
      }
      const radios2 = Array.from((getActiveDialog() || dlg).querySelectorAll("[role='radio']")).filter(isVisible);
      if (opts.length) { if (!pick(radios2.slice(3), opts.length)) return { success: false, error: `Response length "${opts.length}" not found (Default / Longer / Shorter).` }; done.push(opts.length); await pause(500); }
      const save = Array.from((getActiveDialog() || dlg).querySelectorAll("button")).find((b) => isVisible(b) && /^save/i.test((b.innerText || "").trim()));
      if (!save) return { success: false, error: "Save button not found in Configure chat." };
      selectElementCleanly(save); await pause(1500);
      return { success: true, action: "chat_config", confirmed: true, message: `Chat settings saved: ${done.join(", ")}`, data: { done } };
    } finally { isBusy = false; }
  }
  // Sources panel: "Search the web for new sources" with Web/Drive and Fast research / Deep Research
  async function researchFlow(opts) {
    opts = opts || {};
    const q = String(opts.query || "").trim();
    if (!q) return { success: false, error: "Research needs a search query." };
    if (isBusy) return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab." };
    isBusy = true;
    try {
      const ta = Array.from(document.querySelectorAll("textarea")).find((t) => isVisible(t) && /discover sources|search the web|search.*sources/i.test((t.getAttribute("aria-label") || "") + " " + (t.placeholder || "")));
      if (!ta) return { success: false, error: "Source search box not found (open a notebook; the Sources panel must be expanded)." };
      const chooseMenu = async (btnWords, itemWord) => {
        if (!itemWord) return true;
        const b = Array.from(document.querySelectorAll("button")).find((x) => isVisible(x) && btnWords.some((w) => ((x.getAttribute("aria-label") || "") + " " + (x.innerText || "")).toLowerCase().includes(w)) && (x.innerText || "").includes("keyboard_arrow_down"));
        if (!b) return false;
        await pointerClickReal(b);
        let it = null;
        for (let k = 0; k < 6 && !it; k++) {
          it = Array.from(document.querySelectorAll("[role='menuitem']")).find((m) => isVisible(m) && (m.innerText || "").toLowerCase().includes(String(itemWord).toLowerCase()));
          if (!it) await pause(400);
        }
        if (!it) { await closeActiveDialogIfOpen(); return false; }
        selectElementCleanly(it); await pause(800); return true;
      };
      if (opts.where && !(await chooseMenu(["web", "drive"], opts.where))) return { success: false, error: `Source type "${opts.where}" not found (Web / Drive).` };
      if (opts.depth && !(await chooseMenu(["fast research", "deep research"], opts.depth))) return { success: false, error: `Research mode "${opts.depth}" not found (Fast research / Deep Research).` };
      fillTextareaRockSolid(ta, q); await pause(500);
      const go = Array.from(document.querySelectorAll("button")).find((b) => isVisible(b) && b.getAttribute("aria-label") === "Submit" && (b.innerText || "").includes("arrow_forward"));
      if (!go) return { success: false, error: "Research submit button not found." };
      selectElementCleanly(go); await pause(2500);
      if (opts.importResults) {
        const limit = Date.now() + (/deep/i.test(opts.depth || "") ? 300000 : 90000);
        let imp = null;
        while (Date.now() < limit && !imp) {
          imp = Array.from(document.querySelectorAll("button")).find((b) => isVisible(b) && (b.innerText || "").trim() === "Import");
          if (!imp) await pause(3000);
        }
        if (!imp) return { success: true, action: "research", confirmed: true, message: "Research started but the Import button did not show up in time - press Import in NotebookLM." };
        selectElementCleanly(imp); await pause(2500);
        return { success: true, action: "research", confirmed: true, message: `Research done and results imported as sources: ${q}` };
      }
      return { success: true, action: "research", confirmed: true, message: `Research started (${opts.where || "Web"}, ${opts.depth || "Fast research"}): ${q}. Open the notebook and press Import when results are ready.` };
    } finally { isBusy = false; }
  }

  async function generateStudioFlow(outputId, customTopic = null, opts = {}) {
    if (isBusy) {
      return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab. Please wait and retry." };
    }
    const cfg = OUT[outputId];
    if (!cfg) return { success: false, error: `Output "${outputId}" is not in the NLM_CONFIG.outputs block.` };
    if (cfg.chat) return generateNoteFlow(cfg, customTopic || "", opts);
    isBusy = true;
    try {
      const topic = (customTopic || "").trim();
      const pre = checkQuotaExhaustion(getActiveDialog());
      if (pre.exhausted) {
        await closeActiveDialogIfOpen();
        return { success: false, quotaExhausted: true, error: pre.error };
      }

      const studio = findStudioContainer() || document;
      const tile = findClickableByWords(studio, cfg.tile, cfg.noExclude ? null : OUT.excludeTile, 300);
      if (!tile) {
        return { success: false, error: `"${cfg.label}" card not found in the Studio panel (labels/selectors: NLM_CONFIG.outputs).` };
      }
      selectElementCleanly(tile);
      await pause(1200);

      let dialog = getActiveDialog();
      if (dialog && cfg.docFormat) {
        const docEl = findChoice(dialog, "Document");
        if (docEl) { selectElementCleanly(docEl); await pause(900); dialog = getActiveDialog() || dialog; }
      }
      if (dialog && cfg.option && cfg.option.length) {
        const opt = findClickableByWords(dialog, cfg.option, null, 120);
        if (!opt) {
          await closeActiveDialogIfOpen();
          return { success: false, error: `Option "${cfg.label}" not found inside the Studio dialog (labels: NLM_CONFIG.outputs).` };
        }
        selectElementCleanly(opt);
        await pause(600);
        dialog = getActiveDialog() || dialog;
      }
      let choiceReport = null;
      if (dialog && Array.isArray(opts.choices) && opts.choices.length) {
        choiceReport = await applyChoices(dialog, opts.choices);
        dialog = getActiveDialog() || dialog;
        if (choiceReport.missing.length && choiceReport.missing.includes(opts.choices[0])) {
          await closeActiveDialogIfOpen();
          return { success: false, error: `Option(s) not found in the ${cfg.label} dialog: ${choiceReport.missing.join(", ")}.`, data: choiceReport };
        }
      }
      if (dialog && opts.dryRun) {
        const sel = selectedChoices(dialog);
        await closeActiveDialogIfOpen();
        return { success: true, action: "dryrun", confirmed: true, message: `Dry run ${cfg.label}: selected = ${sel.join(" | ")}`, data: { selected: sel, choiceReport } };
      }

      if (dialog) {
        const q = checkQuotaExhaustion(dialog);
        if (q.exhausted) {
          await closeActiveDialogIfOpen();
          return { success: false, quotaExhausted: true, error: q.error };
        }
        const text = cfg.instruction || topic;
        if (text) {
          const ta = findVisibleTextarea(dialog);
          if (ta) { fillTextareaRockSolid(ta, text); await pause(250); }
        }
        const clicked = await clickGenerateWithWait(getActiveDialog, dialog, opts);
        if (clicked && clicked.quotaExhausted) {
          await closeActiveDialogIfOpen();
          return { success: false, quotaExhausted: true, error: clicked.error };
        }
        if (!clicked || !clicked.clicked) {
          await closeActiveDialogIfOpen();
          return { success: false, error: `Generate button could not be clicked for ${cfg.label}.` };
        }
        const conf = await confirmGenerationStarted(getActiveDialog);
        if (conf.quotaExhausted) {
          await closeActiveDialogIfOpen();
          return { success: false, quotaExhausted: true, error: conf.error };
        }
        return { success: true, action: clicked.action, confirmed: !!conf.confirmed, message: `Started generating ${cfg.label}!` };
      }

      // no dialog: an immediate card (e.g. Mind Map). Check for a limit notice, then whether generation started.
      await pause(1500);
      const notice = checkQuotaExhaustion(null);
      if (notice.exhausted) return { success: false, quotaExhausted: true, error: notice.error };
      return { success: true, action: "now", confirmed: isGeneratingActive(), message: `Clicked ${cfg.label} card.` };
    } finally {
      isBusy = false;
    }
  }

  // chat-based output: type the question, wait for a NEW answer, press "Save to note" on it
  async function generateNoteFlow(cfg, question, opts) {
    const q = (question || "").trim();
    if (!q) return { success: false, error: "Notes need prompt text to ask in the chat." };
    if (isBusy) return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab." };
    isBusy = true;
    try {
      const dlg = getActiveDialog();
      let ta = null;
      for (const el of document.querySelectorAll("textarea, [contenteditable='true'], input[type='text']")) {
        if (isVisible(el) && !(dlg && dlg.contains(el))) ta = el;   // last visible = the chat box
      }
      if (!ta) return { success: false, error: `Chat box not found for ${cfg.label} (NLM_CONFIG.outputs.notes).` };
      const before = countClickableByWords(document, cfg.save);
      fillTextareaRockSolid(ta, q);
      await pause(300);
      const send = findClickableByWords(document, cfg.send, null, 40);
      if (send && !isElementDisabled(send)) selectElementCleanly(send);
      else ta.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));

      const t0 = Date.now();
      while (Date.now() - t0 < (cfg.answerTimeoutMs || 90000)) {
        await pause(1500);
        if (isGeneratingActive()) continue;
        if (countClickableByWords(document, cfg.save) > before) break;
      }
      const saveBtn = findClickableByWords(document, cfg.save, null, 60);
      if (!saveBtn || countClickableByWords(document, cfg.save) <= before) {
        return { success: false, error: "No new chat answer with 'Save to note' appeared in time." };
      }
      selectElementCleanly(saveBtn);
      await pause(1500);
      return { success: true, action: "note", confirmed: true, message: "Saved the chat answer as a note." };
    } finally {
      isBusy = false;
    }
  }


  // ======================= v5.0.0 : extra tools =======================
  // Diagnose: lists every visible button / link / input with its text + aria-label, so selectors can be fixed from facts.
  function scanUiFlow() {
    const rows = [];
    const seen = new Set();
    const sel = NLM_CONFIG.selectors.clickables + ", input, textarea, [contenteditable='true'], [role='tab'], [role='menuitem'], [role='option'], [role='combobox'], mat-select";
    for (const el of document.querySelectorAll(sel)) {
      if (!isVisible(el)) continue;
      const text = (el.innerText || el.textContent || el.value || "").trim().replace(/\s+/g, " ").slice(0, 90);
      const aria = (el.getAttribute("aria-label") || "").slice(0, 90);
      const ph = (el.getAttribute("placeholder") || "").slice(0, 60);
      const role = el.getAttribute("role") || "";
      const key = el.tagName + "|" + text + "|" + aria + "|" + ph;
      if (seen.has(key) || (!text && !aria && !ph)) continue;
      seen.add(key);
      const inDialog = !!el.closest(NLM_CONFIG.selectors.dialogs);
      rows.push({ tag: el.tagName.toLowerCase(), role, text, aria, placeholder: ph, inDialog });
      if (rows.length >= 400) break;
    }
    const dlg = getActiveDialog();
    return {
      success: true, action: "scan", confirmed: true,
      message: `Diagnose: ${rows.length} visible controls found.`,
      data: { url: location.href, title: document.title, lang: document.documentElement.lang || "", dialogText: dlg ? (dlg.innerText || "").trim().slice(0, 600) : "", controls: rows }
    };
  }

  function findChatBox() {
    const dlg = getActiveDialog();
    let ta = null;
    for (const el of document.querySelectorAll("textarea, [contenteditable='true'], input[type='text']")) {
      if (isVisible(el) && !(dlg && dlg.contains(el))) ta = el;   // last visible = the chat box
    }
    return ta;
  }

  // Chat: ask a question in the notebook chat and wait until the answer has stopped generating (no 'Save to note').
  async function chatFlow(question, opts) {
    const q = (question || "").trim();
    if (!q) return { success: false, error: "Chat needs a question text." };
    if (isBusy) return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab." };
    isBusy = true;
    try {
      const ta = findChatBox();
      if (!ta) return { success: false, error: "Chat box not found (NLM_CONFIG.outputs.notes / findChatBox)." };
      const before = document.body.innerText.length;
      fillTextareaRockSolid(ta, q);
      await pause(300);
      const send = findClickableByWords(document, NLM_CONFIG.outputs.notes.send, null, 40);
      if (send && !isElementDisabled(send)) selectElementCleanly(send);
      else ta.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
      const limit = (opts && opts.answerTimeoutMs) || 120000;
      const t0 = Date.now();
      let grew = false, stable = 0, last = before;
      while (Date.now() - t0 < limit) {
        await pause(1500);
        const n = document.body.innerText.length;
        const gen = isGeneratingActive();
        if (n > before + 20) grew = true;
        if (grew && !gen && n === last) stable++; else stable = 0;
        last = n;
        if (stable >= 2) break;
        const notice = checkQuotaExhaustion(null);
        if (notice.exhausted) return { success: false, quotaExhausted: true, error: notice.error };
      }
      if (!grew) return { success: false, error: "No chat answer appeared in time." };
      return { success: true, action: "chat", confirmed: true, message: "Chat answer received." };
    } finally {
      isBusy = false;
    }
  }

  // Add source: website URL / YouTube URL / pasted text.
  async function addSourceFlow(kind, value, opts) {
    const T = NLM_CONFIG.outputs.tools;
    const v = (value || "").trim();
    if (!v) return { success: false, error: "Add source needs a link or text." };
    const words = T.kinds[kind];
    if (!words) return { success: false, error: `Unknown source kind "${kind}" (website | youtube | text).` };
    if (isBusy) return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab." };
    isBusy = true;
    try {
      let dlg = getActiveDialog();
      if (!dlg) {
        const add = findClickableByWords(document, T.addSource, null, 80);
        if (!add) return { success: false, error: "'Add source' button not found (NLM_CONFIG.outputs.tools.addSource)." };
        selectElementCleanly(add);
        await pause(1200);
        dlg = getActiveDialog();
      }
      const kindBtn = findClickableByWords(dlg || document, words, null, 120);
      if (!kindBtn) { await closeActiveDialogIfOpen(); return { success: false, error: `Source type "${kind}" not found in the add-source dialog (NLM_CONFIG.outputs.tools.kinds).` }; }
      selectElementCleanly(kindBtn);
      await pause(900);
      dlg = getActiveDialog() || dlg;
      const ta = findVisibleTextarea(dlg);
      if (!ta) { await closeActiveDialogIfOpen(); return { success: false, error: "Input box for the source not found." }; }
      fillTextareaRockSolid(ta, v);
      await pause(400);
      const sub = findClickableByWords(getActiveDialog() || dlg, T.submit, T.addSource, 40);
      if (!sub || isElementDisabled(sub)) { await closeActiveDialogIfOpen(); return { success: false, error: "Insert/Add button not found or disabled for the source." }; }
      selectElementCleanly(sub);
      const t0 = Date.now();
      while (Date.now() - t0 < ((opts && opts.sourceTimeoutMs) || 30000)) {
        await pause(1000);
        if (!getActiveDialog()) break;
        const q = checkQuotaExhaustion(getActiveDialog());
        if (q.exhausted) return { success: false, quotaExhausted: true, error: q.error };
      }
      if (getActiveDialog()) return { success: false, error: "Add-source dialog did not close: source may not be added. Check NotebookLM." };
      return { success: true, action: "source", confirmed: true, message: `Source added (${kind}).` };
    } finally {
      isBusy = false;
    }
  }

  // Output language: Settings -> Output language -> pick. 'names' = list of lowercase names (English + native) of the language.
  // Output language, verified on the real page 2026-11-06: Settings menu -> "Output language" menu item -> dialog
  // "Configure settings" with a mat-select (formcontrolname languageOverrideSelected) listing native names -> Save.
  async function setLanguageFlow(names) {
    const T = NLM_CONFIG.outputs.tools;
    const list = (names || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);
    if (!list.length) return { success: false, error: "Language name missing." };
    if (isBusy) return { success: false, busy: true, error: "Busy: previous command is still running in NotebookLM tab." };
    isBusy = true;
    const realClick = (el) => {
      if (!el) return false;
      try {
        el.focus?.();
        const r = el.getBoundingClientRect();
        const o = { bubbles: true, cancelable: true, view: window, composed: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 };
        el.dispatchEvent(new PointerEvent("pointerdown", o)); el.dispatchEvent(new MouseEvent("mousedown", o));
        el.dispatchEvent(new PointerEvent("pointerup", o)); el.dispatchEvent(new MouseEvent("mouseup", o));
        el.dispatchEvent(new MouseEvent("click", o));
        return true;
      } catch (e) { try { el.click(); return true; } catch (err) { return false; } }
    };
    try {
      const st = findClickableByWords(document, T.settings, null, 40);
      if (!st) return { success: false, error: "Settings button not found (NLM_CONFIG.outputs.tools.settings)." };
      selectElementCleanly(st);
      await pause(1200);
      const item = Array.from(document.querySelectorAll("[role='menuitem'], button")).find((el) => isVisible(el) && _has((el.innerText || el.textContent || "").trim().toLowerCase(), T.languageItem));
      if (!item) { await closeActiveDialogIfOpen(); return { success: false, error: "'Output language' item not found in the Settings menu (NLM_CONFIG.outputs.tools.languageItem)." }; }
      selectElementCleanly(item);
      await pause(1500);
      const sel = document.querySelector("mat-select[formcontrolname='languageOverrideSelected']") || Array.from(document.querySelectorAll("mat-select, [role='combobox']")).find((s) => isVisible(s));
      if (!sel) { await closeActiveDialogIfOpen(); return { success: false, error: "Language dropdown not found in the Output language dialog." }; }
      realClick(sel.querySelector?.('.mat-mdc-select-trigger') || sel);
      await pause(1000);
      if (!document.querySelector("mat-option, [role='option']")) { selectElementCleanly(sel); await pause(900); }
      let opt = null;
      for (let i = 0; i < 8 && !opt; i++) {
        const opts = Array.from(document.querySelectorAll("mat-option, [role='option']")).filter(isVisible);
        const txt = (el) => (el.innerText || el.textContent || "").trim().toLowerCase();
        opt = opts.find((el) => list.includes(txt(el))) || opts.find((el) => list.some((n) => n.length > 3 && txt(el).includes(n))) || null;
        if (!opt) await pause(500);
      }
      if (!opt) { const seen = Array.from(document.querySelectorAll("mat-option, [role='option']")).map((el) => (el.innerText || el.textContent || "").trim()).slice(0, 8).join(" | "); await closeActiveDialogIfOpen(); return { success: false, error: `Language "${list[0]}" is not in the NotebookLM output language list. Options seen: ${seen || "none (dropdown did not open)"}` }; }
      realClick(opt);
      await pause(700);
      const overlay = document.querySelector(".cdk-overlay-container") || document;
      const save = findClickableByWords(overlay, T.save, null, 20);
      if (!save || isElementDisabled(save)) { await closeActiveDialogIfOpen(); return { success: false, error: "Save button not found in the Output language dialog." }; }
      selectElementCleanly(save);
      await pause(1500);
      await closeActiveDialogIfOpen();
      return { success: true, action: "language", confirmed: true, message: `Output language set: ${list[0]}.` };
    } finally {
      isBusy = false;
    }
  }


  // ================= v7.9.0: Rename + Download (Rocky, 20 Nov 2026) =================
  // Flow verified live on the real NotebookLM page (20 Nov 2026, "Mastering Averages" notebook):
  //  Short detail open -> "View prompt and N sources" button under the title -> dialog shows the
  //  full Prompt -> match it against the dashboard's saved prompts (vt_user_shorts, sent inside
  //  the command payload — content.js runs on notebook.google.com and CANNOT read the dashboard's
  //  localStorage on github.io/localhost) -> the matched prompt's title goes into the editable
  //  "Artifact title" field at the top of the detail panel (no pencil icon, no Rename menu item)
  //  -> Download: header button first; Rocky: "kabhi kabhi 3 dot mai ata hai" — so if the header
  //  Download is not there, open the 3-dot (...) menu and click Download inside it.
  //  FRESH build: the v7.3-v7.5 Rename+Download code was fully removed in v7.6.0/7.6.1 and is not
  //  in this repo's git history, so nothing here is restored code.
  const _normPrompt = (s) => String(s || "").toLowerCase().replace(/[*#`]+/g, " ").replace(/[\u2013\u2014-]+/g, "-").replace(/[\u201c\u201d"']/g, '"').replace(/\s+/g, " ").trim();
  function matchPromptToTitle(promptText, prompts) {
    const list = Array.isArray(prompts) ? prompts : [];
    const norm = _normPrompt(promptText);
    if (!norm || !list.length) return null;
    // 1) exact normalised match on the full prompt
    for (const p of list) { if (p && p.prompt && _normPrompt(p.prompt) === norm) return p; }
    // 2) one contains the other (dialog text also carries headings + Sources, dashboard may store extra preamble)
    const scored = [];
    for (const p of list) {
      if (!p || !p.prompt) continue;
      const pn = _normPrompt(p.prompt);
      if (!pn) continue;
      if (norm.includes(pn) || pn.includes(norm)) scored.push({ p, score: Math.min(pn.length, norm.length) });
    }
    if (scored.length) { scored.sort((a, b) => b.score - a.score); return scored[0].p; }
    // 3) strong word overlap on the first 400 chars (covers re-wrapped / lightly edited prompts)
    const head = norm.slice(0, 400);
    const headWords = head.split(" ").filter((w) => w.length > 3);
    let best = null, bestScore = 0, bestCommon = 0;
    for (const p of list) {
      if (!p || !p.prompt) continue;
      const bset = new Set(_normPrompt(p.prompt).slice(0, 400).split(" "));
      let common = 0;
      for (const w of headWords) if (bset.has(w)) common++;
      const score = common / Math.max(1, headWords.length);
      if (score > bestScore) { bestScore = score; best = p; bestCommon = common; }
    }
    return (bestScore >= 0.65 && bestCommon >= 4) ? best : null;
  }
  function findArtifactTitleField() {
    const studio = document.querySelector("section.studio-panel, .studio-panel") || document;
    const sels = ["input[aria-label*='Artifact title' i]", "input.artifact-title", "input[aria-label*='artifact' i]", "textarea[aria-label*='Artifact title' i]"];
    for (const sel of sels) {
      const el = studio.querySelector(sel) || document.querySelector(sel);
      if (el && isVisible(el) && !el.closest("[aria-label*='source' i], [class*='source' i], [class*='chat' i]")) return el;
    }
    return null;
  }
  function readArtifactTitle() {
    const f = findArtifactTitleField();
    if (!f) return "";
    if (f.isContentEditable) return (f.innerText || f.textContent || "").trim();
    return String(f.value || f.textContent || "").trim();
  }
  function setArtifactTitle(newTitle) {
    const f = findArtifactTitleField();
    if (!f) return { ok: false, error: "Artifact title field nahi mila — Short ka detail panel khula hai na, check karo." };
    try { f.focus(); } catch (e) {}
    try {
      if (f.isContentEditable) {
        try { window.getSelection()?.selectAllChildren(f); } catch (e) {}
        if (!document.execCommand("insertText", false, newTitle)) { f.textContent = newTitle; }
        f.dispatchEvent(new InputEvent("input", { bubbles: true }));
      } else {
        const proto = f.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "value");
        try { f.setSelectionRange(0, (f.value || "").length); } catch (e) {}
        if (setter && setter.set) setter.set.call(f, newTitle); else f.value = newTitle;
        f.dispatchEvent(new Event("input", { bubbles: true }));
        f.dispatchEvent(new Event("change", { bubbles: true }));
        f.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
        f.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
      }
    } catch (e) { return { ok: false, error: "Title likhte waqt error: " + (e.message || e) }; }
    try { f.blur(); } catch (e) {}
    return { ok: true };
  }
  // v7.10.0: dialog button se prompt padhna — readPromptFromDetail aur audio menu fallback dono use karte hain.
  async function readPromptFromDialogButton(btn) {
    selectElementCleanly(btn);
    let dialog = null;
    for (let i = 0; i < 10 && !dialog; i++) { await pause(500); dialog = getActiveDialog(); }
    if (!dialog) return { ok: false, error: "View prompt dabane par prompt dialog nahi khula." };
    const raw = (dialog.innerText || dialog.textContent || "").trim();
    const text = raw
      .replace(/^(?:view\s*)?(?:custom\s*)?prompt(?:\s+and\s+\d*\s*sources?)?\s*\n+/i, "")
      .replace(/\n+(?:sources?\s*(?:\(\d+\)|\n)[\s\S]*)$/i, "")
      .replace(/\n+(?:close|done|ok|cancel)\s*$/i, "")
      .trim() || raw;
    await closeActiveDialogIfOpen();
    await pause(400);
    return { ok: true, prompt: text };
  }
  async function readPromptFromDetail() {
    const studio = findStudioContainer();
    const btn = (studio && studio !== document.body ? findClickableByWords(studio, NLM_CONFIG.words.viewPrompt, null, 300) : null)
      || findClickableByWords(document, NLM_CONFIG.words.viewPrompt, null, 300);
    if (!btn) return { ok: false, error: "'View prompt' button nahi mila — Short ka detail panel khula hai na?" };
    return readPromptFromDialogButton(btn);
  }
  function findHeaderDownloadButton() {
    for (const el of document.querySelectorAll(NLM_CONFIG.selectors.clickables)) {
      if (!isVisible(el)) continue;
      if (el.closest(".cdk-overlay-container, [role='menu'], mat-menu")) continue; // menu items are the fallback, not the header
      const t = (el.innerText || el.textContent || "").trim().toLowerCase();
      const aria = (el.getAttribute("aria-label") || "").trim().toLowerCase();
      if (t === "download" || aria === "download") return el;
    }
    return null;
  }
  // v7.10.0: moreBtnOverride = is artifact ki row ka 3-dot button (audio ke liye: Download sirf row ke
  // menu mein hota hai, header mein nahi — 27 Nov 2026 live check). Override mile to wahi menu kholo.
  async function clickDownloadButton(moreBtnOverride) {
    const btn = findHeaderDownloadButton();
    if (btn && !isElementDisabled(btn)) { selectElementCleanly(btn); return { ok: true, location: "header" }; }
    // Fallback (Rocky: kabhi 3-dot mein aata hai): open the ... menu, then Download inside it.
    let more = (moreBtnOverride && isVisible(moreBtnOverride)) ? moreBtnOverride : null;
    if (!more) {
      const studioScope = findStudioContainer();
      for (const el of (studioScope || document).querySelectorAll(NLM_CONFIG.selectors.clickables)) {
        if (!isVisible(el)) continue;
        if (el.closest("[aria-label*='source' i], [class*='source-panel' i], [class*='sources' i]")) continue;
        const aria = (el.getAttribute("aria-label") || "").trim().toLowerCase();
        const t = (el.innerText || el.textContent || "").trim().toLowerCase();
        if (aria === "more" || aria.includes("more option") || aria.includes("more action") || t === "more_vert" || t === "\u22ef" || t === "\u2026") { more = el; break; }
      }
    }
    if (!more) return { ok: false, error: "Download button header mein nahi mila, aur 3-dot menu bhi nahi mila." };
    selectElementCleanly(more);
    await pause(900);
    const menu = document.querySelector(".cdk-overlay-container") || document;
    const inMenu = findClickableByWords(menu, NLM_CONFIG.words.download, null, 120);
    if (!inMenu || isElementDisabled(inMenu)) { await closeActiveDialogIfOpen(); return { ok: false, error: "3-dot menu khula, par usme Download nahi mila." }; }
    selectElementCleanly(inMenu);
    return { ok: true, location: "3-dot menu" };
  }
  async function renameViaMoreMenu(moreBtn, newTitle) {
    if (!moreBtn || !isVisible(moreBtn)) return { ok: false, error: "3-dot button nahi mila." };
    selectElementCleanly(moreBtn);
    await pause(900);
    const menu = document.querySelector(".cdk-overlay-container") || document;
    const renBtn = findClickableByWords(menu, ["rename", "नाम बदलें"], null, 80);
    if (!renBtn || isElementDisabled(renBtn)) {
      try { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true })); } catch (e) {}
      await pause(300);
      return { ok: false, error: "3-dot menu mein Rename nahi mila." };
    }
    selectElementCleanly(renBtn);
    await pause(600);
    const dlg = getActiveDialog();
    const studioScope = document.querySelector("section.studio-panel, .studio-panel");
    // NEVER search `document` here (otherwise it would type into Sources search box or Chat box!)
    let inp = dlg ? findVisibleTextarea(dlg) : null;
    if (!inp) inp = findArtifactTitleField();
    if (!inp && studioScope) {
      inp = Array.from(studioScope.querySelectorAll("input[type='text'], input:not([type]), textarea")).find((el) => isVisible(el));
    }
    if (!inp) return { ok: false, error: "Rename input box Studio/dialog mein nahi mila (Sources/Chat ko touch nahi kiya)." };
    fillTextareaRockSolid(inp, newTitle);
    await pause(300);
    const saveBtn = dlg ? Array.from(dlg.querySelectorAll("button, [role='button']")).find((b) => isVisible(b) && /^(save|rename|ok|done|सहेजें)$/i.test((b.innerText || b.textContent || "").trim())) : null;
    if (saveBtn && !isElementDisabled(saveBtn)) selectElementCleanly(saveBtn);
    else inp.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true }));
    try { inp.blur(); } catch (e) {}
    await pause(900);
    await closeActiveDialogIfOpen();
    return { ok: true };
  }
  // v7.10.0: core bina isBusy guard ke — manual renameDownloadFlow (guard ke saath) aur AI Auto pass
  // (jo khud item-by-item chalata hai) dono isi ko use karte hain. opts.preReadPrompt mile to prompt
  // dobara padhne ke liye dialog nahi kholte; opts.moreBtn mile to Download usi row ke menu se lete hain.
  async function renameDownloadCore(prompts, opts) {
    opts = opts || {};
    {
      const oldTitle = readArtifactTitle();
      const pr = opts.preReadPrompt ? { ok: true, prompt: opts.preReadPrompt } : await readPromptFromDetail();
      if (!pr.ok) return { success: false, error: pr.error, data: { oldTitle } };
      const match = matchPromptToTitle(pr.prompt, prompts);
      if (!match || !match.title) {
        return { success: false, error: "Is Short ka prompt dashboard ke kisi prompt se match nahi hua — pehle dashboard mein prompts load karo (wahi Chrome jisme prompts save hain), phir dobara try karo.", data: { oldTitle, promptSnippet: _normPrompt(pr.prompt).slice(0, 200) } };
      }
      const newTitle = String(match.title).trim();
      let renamed = (oldTitle === newTitle);
      if (!renamed) {
        const set = setArtifactTitle(newTitle);
        if (set.ok) {
          await pause(900);
          renamed = readArtifactTitle() === newTitle;
        }
        if (!renamed && opts.moreBtn) {
          const viaMenu = await renameViaMoreMenu(opts.moreBtn, newTitle);
          if (viaMenu.ok) renamed = true;
        }
        if (!renamed) {
          return { success: false, error: set.ok ? "Title field mein naya naam likha, par save nahi hua." : set.error, data: { oldTitle, matchedTitle: newTitle, matchedNumber: match.number } };
        }
      }
      let dl = null;
      if (opts.download !== false) {
        try {
          const rt = (typeof browser !== "undefined" && browser.runtime) ? browser.runtime : (typeof chrome !== "undefined" ? chrome.runtime : null);
          if (rt && rt.sendMessage) {
            const p = rt.sendMessage({ action: "nlmDownload.prepare", folder: opts.downloadFolder || "", filename: newTitle });
            if (p && p.then) await p.catch(() => {});
            else await pause(120);
          }
        } catch (e) {}
        dl = await clickDownloadButton(opts.moreBtn || null);
        if (!dl.ok) return { success: false, error: dl.error, data: { oldTitle, newTitle, matchedNumber: match.number, renamed } };
        await pause(1200);
      }
      return { success: true, action: "rename_download", message: `Rename + Download ho gaya: "${oldTitle}" -> "${newTitle}"${dl ? ` (Download: ${dl.location}).` : " (sirf rename)."}`, data: { oldTitle, newTitle, matchedNumber: match.number, renamed, downloadLocation: dl ? dl.location : null } };
    }
  }
  async function renameDownloadFlow(prompts, opts) {
    opts = opts || {};
    if (isBusy) return { success: false, error: "Extension abhi busy hai — pehla kaam khatam hone do." };
    isBusy = true;
    try { return await renameDownloadCore(prompts, opts); } finally { isBusy = false; }
  }

  // ================= v7.10.0: AI Auto — khud rename + download (Rocky, 27 Nov 2026) =================
  // Flow: RUN -> prompts ek-ek karke bheje gaye (dashboard Auto-Batch) -> ~30 min wait (generation) ->
  // Studio list upar se ek-ek karke: har artifact ka prompt padho, bheje gaye batch ke prompts se
  // milao -> mila to us prompt ka TITLE likho + download karo; nahi mila to SKIP (chhodo).
  // Limit wapas aane par dashboard agla batch bhejta hai aur ye pass us batch ke liye dobara chalta hai.
  // LIVE FACTS (27 Nov 2026, Samvidhan notebook): Studio list ka order SCRAMBLED hai (na numeric,
  // na chronological) — isliye position par kabhi bharosa nahi, sirf prompt-match par. Video detail:
  // title textbox upar, uske neeche "View prompt and N sources", upar-right Share/Download/Open/More.
  // Audio: docked player neeche (title textbox ke saath), AUTO-PLAY hota hai; View prompt + Download
  // SIRF row ke 3-dot menu mein hain. List ki rows kholne/band karne ke selectors verify NAHI hue —
  // har jagah fallback + log hai taaki pehla real run bataye kaun sa selector kaam kiya.
  function isDefaultTitle(title) {
    const t = String(title || "").trim();
    if (!t) return true;
    const low = t.toLowerCase();
    if (low === "untitled" || low === "video overview" || low === "audio overview" ||
        low === "new video" || low === "new audio" || low === "new video overview" || low === "new audio overview") return true;
    // "Short-1", "Short 1", "Episode 12", "Point 3" — sirf number tak, uske baad kuch nahi.
    // (Prompt titles "Short 1 - Average..." default NAHI hain — unke baad " - ..." aata hai.)
    if (/^(short|episode|point|video|audio)[\s\-_#]*\d+\s*$/.test(low)) return true;
    return false;
  }
  // Ek artifact ka faisla: match hua to process karo, title pehle se sahi hai to done-skip,
  // match nahi hua to skip. (Default-title ya custom-title — dono process hote hain jab prompt match
  // kare, kyunki live check (20 Nov) mein naye Shorts ka title random bhi hota hai; reason mein
  // likha rehta hai ki title default tha ya custom, taaki report mein sab dikhe.)
  function classifyAutoAiItem(artifact, sentPrompts) {
    const match = matchPromptToTitle(artifact && artifact.promptText, sentPrompts);
    if (!match) return { action: "skip", reason: "no-match", detail: "Iska prompt bheje gaye batch ke kisi prompt se match nahi hua — skip." };
    const title = String((artifact && artifact.title) || "").trim();
    const matchedTitle = String(match.title || "").trim();
    if (matchedTitle && title === matchedTitle) {
      return { action: "skip", reason: "done", matchedNumber: match.number, matchedTitle: matchedTitle, detail: "Title pehle se sahi hai — done." };
    }
    const def = isDefaultTitle(title);
    return { action: "process", reason: def ? "default-title" : "custom-title",
      matchedNumber: match.number, matchedTitle: matchedTitle, wasDefault: def,
      detail: def ? "Default title hai — rename + download karo." : "Title pehle se kuch aur hai, par prompt match hua — rename + download karo (naye Shorts ka title aksar random hota hai)." };
  }

  // ---- Studio list: rows dhoondhna (har row ka anchor uska 3-dot "More options" button hai) ----
  function extractRowTitle(rowText) {
    const lines = String(rowText || "").split(/\n/).map((s) => s.trim()).filter(Boolean);
    const ICON_WORDS = /^(check|checkmark|edit|more_vert|more_horiz|download|play_arrow|pause|schedule|new!?)$/i;
    for (const line of lines) {
      if (line.length < 2) continue;
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(line)) continue;                 // duration "0:54" / "1:32:10"
      if (/^\d+\s*(min|mins|minute|minutes|sec|secs|second|seconds)$/i.test(line)) continue;
      if (ICON_WORDS.test(line)) continue;
      if (/^(audio overview|video overview|short|episode)\s*$/i.test(line)) continue; // sirf type wali line
      return line;
    }
    return lines[0] || "";
  }
  function listStudioArtifactsSync() {
    const studio = findStudioContainer();
    const scope = studio || document;
    const items = [];
    const seenRows = new Set();
    let excludedCustomize = 0;
    for (const btn of scope.querySelectorAll(NLM_CONFIG.selectors.clickables)) {
      if (!isVisible(btn)) continue;
      const aria = (btn.getAttribute("aria-label") || "").trim().toLowerCase();
      const t = (btn.innerText || btn.textContent || "").trim().toLowerCase();
      if (aria.includes("settings") || aria.includes("collapse") || aria.includes("expand") || aria.includes("notebook configuration")) continue;
      if (!(aria === "more" || _has(aria, NLM_CONFIG.words.moreOptions) || t === "more_vert" || t === "⋯" || t === "…")) continue;
      let row = btn.closest(".artifact-item-button, [role='listitem'], mat-list-item, .studio-item, .artifact-card, [class*='studio-item' i], li, [role='option']");
      if (!row) {
        let p = btn.parentElement;
        for (let d = 0; d < 5 && p; d++, p = p.parentElement) {
          const txt = (p.innerText || "").trim();
          if (txt.length > 0 && txt.length < 400) { row = p; break; }
        }
      }
      if (!row || seenRows.has(row)) continue;
      seenRows.add(row);
      const text = (row.innerText || row.textContent || "").trim();
      if (!text) continue;
      const low = text.toLowerCase();
      if (low.includes("customize") || low.includes("customise")) { excludedCustomize++; continue; } // create-tile, artifact nahi
      const titleEl = row.querySelector("[data-testid='artifact-title']");
      const title = (titleEl ? (titleEl.innerText || titleEl.textContent || "").trim() : "") || extractRowTitle(text);
      if (!title) continue;
      const type = /audio|deep dive|critique|debate|brief/i.test(low) ? "audio" : (/video|short|explainer|cinematic/i.test(low) ? "video" : "unknown");
      items.push({ rowEl: row, title: title, type: type, moreBtn: btn });
    }
    return { items: items, excludedCustomize: excludedCustomize };
  }
  // List render hone ke liye pehle neeche-upar scroll karo (virtualized list ke rows tabhi DOM mein aate hain).
  async function listStudioArtifacts() {
    const studio = findStudioContainer();
    let scroller = studio;
    try {
      if (studio && studio !== document.body) {
        const inner = Array.from(studio.querySelectorAll("*")).find((el) => el.scrollHeight > el.clientHeight + 24 && isVisible(el));
        if (inner) scroller = inner;
      }
      if (scroller && scroller !== document.body && typeof scroller.scrollTop === "number") scroller.scrollTop = scroller.scrollHeight;
      else window.scrollTo(0, document.body ? document.body.scrollHeight : 0);
    } catch (e) {}
    await pause(700);
    try {
      if (scroller && scroller !== document.body && typeof scroller.scrollTop === "number") scroller.scrollTop = 0;
      else window.scrollTo(0, 0);
    } catch (e) {}
    await pause(400);
    return listStudioArtifactsSync();
  }

  async function openStudioArtifact(item) {
    ensureStudioTabSelected();
    await pause(300);
    let row = item.rowEl;
    if (!row || !row.isConnected) {
      let fresh = null;
      for (let w = 0; w < 10 && !fresh; w++) {
        const cur = listStudioArtifactsSync().items;
        fresh = cur.find((it) => it.title === item.title && it.type === item.type)
          || cur.find((it) => it.title === item.title);
        if (!fresh) await pause(400);
      }
      if (!fresh) return { ok: false, error: "Studio list dobara render hui aur ye item wapas nahi mila (title: " + item.title + ")." };
      row = fresh.rowEl; item.rowEl = row; item.moreBtn = fresh.moreBtn;
    }
    try { row.scrollIntoView({ block: "center" }); } catch (e) {}
    await pause(350);
    // Priority 1: [data-testid="artifact-open-button"] (live NotebookLM stretched open button), else title element, else row
    let target = row.querySelector("[data-testid='artifact-open-button']") || row, how = "open-btn";
    if (target === row) {
      how = "row";
      try {
        const kids = row.querySelectorAll("*");
        for (const k of kids) {
          const t = (k.innerText || k.textContent || "").trim();
          if (t && item.title && (t === item.title || t.indexOf(item.title) === 0) && k.children.length <= 2) { target = k; how = "title-el"; break; }
        }
      } catch (e) {}
    }
    selectElementCleanly(target);
    for (let i = 0; i < 8; i++) { await pause(500); if (findArtifactTitleField()) return { ok: true, how: how }; }
    selectElementCleanly(row);
    for (let i = 0; i < 6; i++) { await pause(500); if (findArtifactTitleField()) return { ok: true, how: "row-retry" }; }
    if (item.type === "audio" && item.moreBtn && isVisible(item.moreBtn)) {
      return { ok: true, how: "audio-menu-fallback" };
    }
    return { ok: false, error: "Studio list se item khola, par detail panel (title field) nahi khula — row ka click ya selector galat ho sakta hai." };
  }
  async function closeArtifactDetail() {
    if (!findArtifactTitleField()) return { ok: true, how: "already-closed" };
    const waitListBack = async () => {
      for (let i = 0; i < 8; i++) {
        if (!findArtifactTitleField() && listStudioArtifactsSync().items.length > 0) return true;
        await pause(350);
      }
      return !findArtifactTitleField();
    };
    // Priority 1: Live NotebookLM "Studio" breadcrumb (section.studio-panel .panel-header-clickable) returns cleanly to Studio list
    const studioCrumb = Array.from(document.querySelectorAll("section.studio-panel .panel-header-clickable, .studio-panel .panel-header-clickable, .panel-header nav span")).find((el) => isVisible(el) && /^studio$/i.test((el.innerText || el.textContent || "").trim()));
    if (studioCrumb) {
      selectElementCleanly(studioCrumb);
      if (await waitListBack()) return { ok: true, how: "studio-breadcrumb" };
    }
    // Priority 2: Back / Close buttons
    for (const el of document.querySelectorAll(NLM_CONFIG.selectors.clickables)) {
      if (!isVisible(el)) continue;
      const aria = (el.getAttribute("aria-label") || "").trim().toLowerCase();
      const t = (el.innerText || el.textContent || "").trim();
      if (aria === "back" || aria.indexOf("go back") === 0 || aria === "close" || t === "✕" || t === "×" || t === "←") {
        selectElementCleanly(el);
        if (await waitListBack()) return { ok: true, how: aria || t };
      }
    }
    try { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true })); } catch (e) {}
    if (await waitListBack()) return { ok: true, how: "escape" };
    return { ok: false, how: "none", error: "Detail band nahi hua — agla item kholne par problem ho sakti hai." };
  }
  // Audio khulte hi AUTO-PLAY hota hai (live check 27 Nov 2026) — turant pause karo, nahi to poora
  // pass chalte waqt audio bajta rahega. Pause button na mile to fail nahi karte, bas log karte hain.
  async function pauseAudioPlayback() {
    for (const el of document.querySelectorAll(NLM_CONFIG.selectors.clickables)) {
      if (!isVisible(el)) continue;
      const aria = (el.getAttribute("aria-label") || "").trim().toLowerCase();
      const t = (el.innerText || el.textContent || "").trim().toLowerCase();
      if (aria === "pause" || t === "pause") {
        selectElementCleanly(el);
        await pause(400);
        return { ok: true };
      }
    }
    return { ok: false, error: "Pause button nahi mila — audio bajta rahega, koi baat nahi." };
  }
  // Audio ka prompt: seedha "View prompt" dikhe to wahi; nahi to row ke 3-dot menu mein hota hai
  // (live check 27 Nov 2026: Share, Rename, Download, View prompt and sources, Open in new tab, Delete).
  async function readPromptFromDetailForAudio(item) {
    const direct = await readPromptFromDetail();
    if (direct.ok) return direct;
    if (!item || !item.moreBtn || !isVisible(item.moreBtn)) return direct;
    try { item.moreBtn.scrollIntoView({ block: "nearest" }); } catch (e) {}
    await pause(300);
    selectElementCleanly(item.moreBtn);
    await pause(900);
    const menu = document.querySelector(".cdk-overlay-container") || document;
    const inMenu = findClickableByWords(menu, NLM_CONFIG.words.viewPrompt, null, 120);
    if (!inMenu || isElementDisabled(inMenu)) {
      try { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true })); } catch (e) {}
      await pause(400);
      return direct; // menu mein View prompt nahi mila — original error wapas
    }
    return readPromptFromDialogButton(inMenu);
  }

  // ---- Generation khatam hone ka wait: har 2 min mein check, ~30 min expected, max 2 ghante ----
  // Jaldi khatam ho jaye to jaldi rename pass shuru (2 baar lagatar idle = done). Agar 30 min tak
  // kabhi "generating" dikha hi nahi aur phir idle hai, to bhi done mano (kuch generate hi nahi hua).
  async function waitForGenerationDone(opts) {
    opts = opts || {};
    const pollMs = opts.pollMs || 120000;
    const maxMs = opts.maxMs || 2 * 60 * 60 * 1000;
    const t0 = Date.now();
    let idleStreak = 0, sawGenerating = false, polls = 0;
    while (Date.now() - t0 < maxMs) {
      if (autoAiStopRequested) return { ready: false, stopped: true, polls: polls, waitedMs: Date.now() - t0 };
      const q = checkQuotaExhaustion(null);
      if (q.exhausted) return { ready: false, quota: true, quotaError: q.error, polls: polls, waitedMs: Date.now() - t0 };
      const gen = isGeneratingActive();
      polls++;
      if (gen) { sawGenerating = true; idleStreak = 0; }
      else {
        idleStreak++;
        if ((sawGenerating || Date.now() - t0 >= 30 * 60 * 1000) && idleStreak >= 2) {
          return { ready: true, polls: polls, waitedMs: Date.now() - t0, sawGenerating: sawGenerating };
        }
      }
      await pause(pollMs);
    }
    return { ready: false, timedOut: true, polls: polls, waitedMs: Date.now() - t0, sawGenerating: sawGenerating };
  }

  // ---- AI Auto progress: chrome.storage.local mein (reload se bhi bachta hai) + memory fallback ----
  const AUTO_AI_KEY = "nlm_auto_ai";
  function autoAiStorageApi() {
    try {
      if (typeof browser !== "undefined" && browser.storage && browser.storage.local) return browser.storage.local;
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) return chrome.storage.local;
    } catch (e) {}
    return null;
  }
  async function saveAutoAiState(state) {
    try { window.__nlmAutoAiState = state; } catch (e) {}
    try {
      const api = autoAiStorageApi();
      if (!api) return false;
      const obj = {}; obj[AUTO_AI_KEY] = state;
      const r = api.set(obj, () => {});
      if (r && r.then) await r;
      return true;
    } catch (e) { return false; }
  }
  async function loadAutoAiState() {
    try {
      const api = autoAiStorageApi();
      if (api) {
        const res = await new Promise((resolve) => {
          try {
            const r = api.get(AUTO_AI_KEY, (out) => resolve(out || {}));
            if (r && r.then) r.then((out) => resolve(out || {})).catch(() => resolve({}));
          } catch (e) { resolve({}); }
        });
        if (res && res[AUTO_AI_KEY]) return res[AUTO_AI_KEY];
      }
    } catch (e) {}
    try { return window.__nlmAutoAiState || null; } catch (e) { return null; }
  }

  // Resume sets (pure function, unit-testable): pichle run ke items se banao — doneTitleKeys
  // (type|current-title, title pehle se sahi ya rename ho chuka) aur skipTitleKeys (type|title,
  // prompt match nahi hua). In sets ki wajah se dobara chalane par ho chuke items khole bina
  // skip hote hain — na double counting, na dobara prompt padhna. Failed items kisi set mein
  // nahi aate, isliye dobara try honge.
  function buildAutoAiResumeSets(items) {
    const doneTitleKeys = new Set();
    const skipTitleKeys = new Set();
    for (const e of (items || [])) {
      if (!e) continue;
      if ((e.result === "done" || e.result === "renamed") && e.type) doneTitleKeys.add(e.type + "|" + (e.newTitle || e.title));
      if (e.result === "skipped" && e.type && e.title) skipTitleKeys.add(e.type + "|" + e.title);
    }
    return { doneTitleKeys: doneTitleKeys, skipTitleKeys: skipTitleKeys };
  }
  // ---- AI Auto rename pass (SHARED, v7.10.1): Studio list ek-ek karke, har item ka prompt
  // padh ke `sent` prompts se milao -> mila to rename + download, nahi mila to skip. Batch mode
  // (autoAiFlow) aur existing mode (autoAiExistingFlow) dono isi ko use karte hain, taaki logic
  // ek jagah rahe. opts.batchTypes: Set ho to sirf un types ke items process hote hain (batch
  // mode — is batch mein jo type bheja hi nahi gaya, wo skip); null ho to sab types (existing
  // mode — ek hi prompt ka Audio aur Video dono ko wahi title milta hai, ye normal hai, duplicate
  // nahi). Resume: state.items se do sets bante hain — doneTitleKeys (type|current-title, jin
  // items ka title pehle se sahi hai ya rename ho chuka) aur skipTitleKeys (type|title, jin ka
  // prompt match nahi hua). Dobara chalane par ye items khole bina skip hote hain — na double
  // counting, na dobara prompt padhna. Failed items kisi set mein nahi aate — dobara try honge.
  async function autoAiRenamePass(sent, opts, state, save, record) {
    opts = opts || {};
    const batchTypes = opts.batchTypes || null;
    const resumeSets = buildAutoAiResumeSets(state.items);
    const doneTitleKeys = resumeSets.doneTitleKeys;
    const skipTitleKeys = resumeSets.skipTitleKeys;
    const listed = await listStudioArtifacts();
    const seenTitles = new Set();   // khole gaye items (original title se — rename ke baad title badal jata hai)
    const doneNumbers = new Set();  // jin prompt numbers ka faisla ho gaya
    for (const item of listed.items) {
      if (autoAiStopRequested) {
        await save({ status: "stopped" });
        return { outcome: "stopped" };
      }
      const q = checkQuotaExhaustion(null);
      if (q.exhausted) {
        await save({ status: "quota", quotaError: q.error || "" });
        return { outcome: "quota", quotaError: q.error || "" };
      }
      const key = item.type + "|" + item.title;
      if (skipTitleKeys.has(key)) continue; // pichle run mein prompt match nahi hua tha — dobara mat kholo
      // Title pehle se kisi bheje gaye prompt ke title jaisa hai — kholo mat, done mano.
      const titleMatch = sent.find((p) => p.title && String(p.title).trim() && String(p.title).trim() === item.title);
      if (titleMatch) {
        const doneKey = item.type + "|" + item.title;
        if (doneTitleKeys.has(doneKey)) continue; // pichle run mein gin chuke — dobara mat gino
        if (!doneNumbers.has(titleMatch.number)) {
          doneNumbers.add(titleMatch.number);
          state.counts.done++;
          record({ title: item.title, type: item.type, number: titleMatch.number, result: "done", reason: "title pehle se sahi hai" });
          doneTitleKeys.add(doneKey);
          await save({});
        }
        continue; // is prompt ka faisla ho chuka
      }
      if (batchTypes && item.type !== "unknown" && !batchTypes.has(item.type)) {
        state.counts.skipped++;
        record({ title: item.title, type: item.type, result: "skipped", reason: "is batch mein is type ka prompt bheja hi nahi gaya" });
        await save({});
        continue;
      }
      seenTitles.add(key);
      const opened = await openStudioArtifact(item);
      if (!opened.ok) {
        state.counts.failed++;
        record({ title: item.title, type: item.type, result: "failed", reason: opened.error });
        await save({});
        continue;
      }
      try {
        if (item.type === "audio") {
          const paused = await pauseAudioPlayback();
          if (!paused.ok) { /* log only — audio bajta rahega, kaam nahi rukega */ }
        }
        const pr = await readPromptFromDetailForAudio(item);
        if (!pr.ok) {
          state.counts.failed++;
          record({ title: item.title, type: item.type, result: "failed", reason: pr.error });
          continue;
        }
        state.counts.checked++;
        const cls = classifyAutoAiItem({ title: item.title, promptText: pr.prompt, type: item.type }, sent);
        if (cls.action === "skip") {
          if (cls.matchedNumber !== undefined && cls.matchedNumber !== null) doneNumbers.add(cls.matchedNumber);
          if (cls.reason === "done") state.counts.done++; else state.counts.skipped++;
          record({ title: item.title, type: item.type, number: cls.matchedNumber !== undefined ? cls.matchedNumber : null, result: cls.reason === "done" ? "done" : "skipped", reason: cls.detail });
          if (cls.reason === "done") doneTitleKeys.add(item.type + "|" + item.title);
          else skipTitleKeys.add(key);
          continue;
        }
        if (cls.matchedNumber !== undefined && cls.matchedNumber !== null) doneNumbers.add(cls.matchedNumber);
        const core = await renameDownloadCore(sent, { download: opts.download !== false, downloadFolder: opts.downloadFolder || "", preReadPrompt: pr.prompt, moreBtn: item.moreBtn || null });
        if (core.success) {
          state.counts.renamed++;
          if (core.data && core.data.downloadLocation) state.counts.downloaded++;
          record({ title: item.title, type: item.type, number: core.data ? core.data.matchedNumber : cls.matchedNumber, result: "renamed", newTitle: core.data ? core.data.newTitle : cls.matchedTitle, download: core.data ? core.data.downloadLocation : null, wasDefault: !!cls.wasDefault });
          if (core.data && core.data.newTitle) doneTitleKeys.add(item.type + "|" + core.data.newTitle);
        } else {
          state.counts.failed++;
          record({ title: item.title, type: item.type, number: cls.matchedNumber !== undefined ? cls.matchedNumber : null, result: "failed", reason: core.error });
        }
      } finally {
        await closeArtifactDetail();
        await pause(800);
      }
      await save({});
    }
    return { outcome: "done" };
  }

  // ---- AI Auto orchestrator: EK batch ke liye (wait + rename/download pass) ----
  async function autoAiFlow(prompts, opts) {
    opts = opts || {};
    if (autoAiRunning) return { success: false, error: "AI Auto pehle se chal raha hai — pehle usko rok do ya khatam hone do." };
    autoAiRunning = true;
    autoAiStopRequested = false;
    const sent = Array.isArray(prompts) ? prompts.filter((p) => p && p.prompt) : [];
    const batchTypes = new Set();
    for (const p of sent) {
      const ts = Array.isArray(p.types) && p.types.length ? p.types : ["video", "audio"];
      for (const t of ts) batchTypes.add(String(t).toLowerCase());
    }
    const state = {
      mode: "batch",
      batchStart: (opts.batchStart !== undefined && opts.batchStart !== null) ? opts.batchStart : null,
      batchEnd: (opts.batchEnd !== undefined && opts.batchEnd !== null) ? opts.batchEnd : null,
      sentNumbers: Array.isArray(opts.sentNumbers) && opts.sentNumbers.length ? opts.sentNumbers : sent.map((p) => p.number),
      sentAt: Date.now(), status: "waiting",
      counts: { sent: sent.length, checked: 0, renamed: 0, downloaded: 0, done: 0, skipped: 0, failed: 0 },
      items: [], quotaError: "", nextResumeAt: null, updatedAt: Date.now()
    };
    const save = async (patch) => { Object.assign(state, patch, { updatedAt: Date.now() }); await saveAutoAiState(state); return state; };
    const record = (entry) => { state.items.push(entry); };
    try {
      if (!sent.length) {
        await save({ status: "no-send" });
        return { success: false, error: "Is batch mein koi prompt bheja nahi gaya — pehle Auto-Batch se prompts bhejo.", data: state };
      }
      await save({ status: "waiting" });
      const before = await listStudioArtifacts();
      state.beforeCount = before.items.length;
      state.beforeTitles = before.items.slice(0, 50).map((it) => it.title);
      await save({});
      const wait = await waitForGenerationDone({ pollMs: 120000, maxMs: 2 * 60 * 60 * 1000 });
      if (wait.stopped) {
        await save({ status: "stopped" });
        return { success: false, error: "AI Auto user ne roka.", data: state };
      }
      if (wait.quota) {
        await save({ status: "quota", quotaError: wait.quotaError || "" });
        return { success: false, quotaExhausted: true, error: wait.quotaError || "AI usage limit reached.", data: state };
      }
      if (!wait.ready) {
        await save({ status: "timeout" });
        return { success: false, error: "2 ghante wait karne par bhi generation khatam nahi hui (" + wait.polls + " baar check kiya) — baad mein dobara chalao, rename pass usi batch par dobara chalega.", data: state };
      }
      await save({ status: "renaming" });
      const pass = await autoAiRenamePass(sent, { download: opts.download !== false, downloadFolder: opts.downloadFolder || "", batchTypes: batchTypes, resumeKeys: null }, state, save, record);
      if (pass.outcome === "stopped") {
        await save({ status: "stopped" });
        return { success: false, error: "AI Auto user ne roka.", data: state };
      }
      if (pass.outcome === "quota") {
        await save({ status: "quota", quotaError: pass.quotaError || "" });
        return { success: false, quotaExhausted: true, error: pass.quotaError || "AI usage limit reached.", data: state };
      }
      await save({ status: "done" });
      const c = state.counts;
      return { success: true, action: "auto_ai",
        message: "AI Auto poora hua: " + c.checked + " check kiye, " + c.renamed + " rename + " + c.downloaded + " download, " + c.done + " pehle se done, " + c.skipped + " skip, " + c.failed + " fail.",
        data: state };
    } finally { autoAiRunning = false; }
  }

  // ---- v7.10.1: AI Auto — BANE HUE items (Rocky, 27 Nov 2026) ----
  // Samvidhan notebook mein 80 Audio + 87 Shorts PEHLE SE bane hue hain, unke prompts dashboard
  // ke database mein hain. Inke liye na kuch bhejna hai, na ~30 min wait — seedha wahi shared
  // rename pass (autoAiRenamePass) chalao, poori prompt list se match karke. Type filter NAHI
  // hai: ek hi prompt ka Audio aur Video dono ko wahi title milta hai, ye normal hai.
  // Resume: pichla existing run aadha ruka tha (stopped/quota) to usi state se dobara shuru —
  // counts/items wahi rehte hain, aur rename pass pehle se ho chuke items ko khole bina skip
  // karta hai (doneTitleKeys/skipTitleKeys). Poora ho chuka run dobara chalao to fresh scan hota
  // hai (tab tak bane naye items bhi aa jayein).
  async function autoAiExistingFlow(prompts, opts) {
    opts = opts || {};
    if (autoAiRunning) return { success: false, error: "AI Auto pehle se chal raha hai — pehle usko rok do ya khatam hone do." };
    autoAiRunning = true;
    autoAiStopRequested = false;
    const all = Array.isArray(prompts) ? prompts.filter((p) => p && p.prompt && String(p.prompt).trim()) : [];
    try {
      if (!all.length) {
        const empty = { mode: "existing", batchStart: null, batchEnd: null, sentNumbers: [], sentAt: Date.now(), status: "no-prompts",
          counts: { sent: 0, checked: 0, renamed: 0, downloaded: 0, done: 0, skipped: 0, failed: 0 },
          items: [], quotaError: "", nextResumeAt: null, updatedAt: Date.now() };
        await saveAutoAiState(empty);
        return { success: false, error: "Dashboard mein koi prompt nahi hai — pehle prompts paste karo, phir dobara chalao.", data: empty };
      }
      const prev = await loadAutoAiState();
      const resume = prev && prev.mode === "existing" && (prev.status === "stopped" || prev.status === "quota" || prev.status === "renaming") && Array.isArray(prev.items);
      let state;
      if (resume) {
        state = prev;
        if (!Array.isArray(state.items)) state.items = [];
        if (!state.counts || typeof state.counts !== "object") state.counts = { sent: 0, checked: 0, renamed: 0, downloaded: 0, done: 0, skipped: 0, failed: 0 };
      } else {
        state = {
          mode: "existing", batchStart: null, batchEnd: null,
          sentNumbers: all.map((p) => p.number), sentAt: Date.now(), status: "renaming",
          counts: { sent: all.length, checked: 0, renamed: 0, downloaded: 0, done: 0, skipped: 0, failed: 0 },
          items: [], quotaError: "", nextResumeAt: null, updatedAt: Date.now()
        };
      }
      state.mode = "existing";
      state.sentNumbers = all.map((p) => p.number);
      state.counts.sent = all.length;
      const save = async (patch) => { Object.assign(state, patch, { updatedAt: Date.now() }); await saveAutoAiState(state); return state; };
      const record = (entry) => { state.items.push(entry); };
      await save({ status: "renaming" });
      const pass = await autoAiRenamePass(all, { download: opts.download !== false, downloadFolder: opts.downloadFolder || "", batchTypes: null, resumeKeys: null }, state, save, record);
      if (pass.outcome === "stopped") {
        await save({ status: "stopped" });
        return { success: false, error: "Bane hue items wala pass user ne roka.", data: state };
      }
      if (pass.outcome === "quota") {
        await save({ status: "quota", quotaError: pass.quotaError || "" });
        return { success: false, quotaExhausted: true, error: pass.quotaError || "AI usage limit reached.", data: state };
      }
      await save({ status: "done" });
      const c = state.counts;
      return { success: true, action: "auto_ai_existing",
        message: "Bane hue items poora hua: " + c.checked + " check kiye, " + c.renamed + " rename + " + c.downloaded + " download, " + c.done + " pehle se done, " + c.skipped + " skip, " + c.failed + " fail.",
        data: state };
    } finally { autoAiRunning = false; }
  }

  // v5.1.0: Google pages enforce Trusted Types; a plain innerHTML string throws "requires 'TrustedHTML' assignment" and the box never appears.
  function nlmTrusted(html) {
    try {
      if (window.trustedTypes && window.trustedTypes.createPolicy) {
        if (!window.__nlmPolicy) window.__nlmPolicy = window.trustedTypes.createPolicy("nlm-studio-hub", { createHTML: (s) => s });
        return window.__nlmPolicy.createHTML(html);
      }
    } catch (e) {}
    return html;
  }

  function createBox() {
    if (document.getElementById("nlm-mini-box")) return;

    const box = document.createElement("div");
    box.id = "nlm-mini-box";

    box.innerHTML = nlmTrusted(`
      <div class="nlm-box-header" id="nlm-box-header">
        <span class="nlm-box-title">⚡ Quick Studio</span>
        <button class="nlm-box-close" id="nlm-btn-close" title="Close">✕</button>
      </div>
      <div class="nlm-format-pills" id="nlm-video-pills">
        <button class="nlm-pill-btn active" data-fmt="short" disabled>🔒 Shorts (9:16) Only</button>
      </div>
      <input type="text" id="nlm-input-topic" class="nlm-topic-input" placeholder="Type topic/prompt here..." />
      <button id="nlm-btn-action" class="nlm-action-btn video-mode">
        <span>▶ Generate Short</span>
      </button>
    `);

    document.body.appendChild(box);

    document.getElementById("nlm-btn-close").addEventListener("click", () => {
      box.remove();
    });

    const actionBtn = document.getElementById("nlm-btn-action");
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    const header = document.getElementById("nlm-box-header");

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = box.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      header.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      box.style.left = `${initialLeft + dx}px`;
      box.style.top = `${initialTop + dy}px`;
      box.style.right = "auto";
      box.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = "grab";
      }
    });

    actionBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      generateVideoFlow();
    });
  }

  function isGeneratingActive() {
    const spinners = document.querySelectorAll(NLM_CONFIG.selectors.spinners);
    for (const s of spinners) {
      if (isVisible(s)) return true;
    }

    const textEls = document.querySelectorAll("button, [role='button'], div, span, p");
    for (const el of textEls) {
      if (el.closest("#nlm-mini-box")) continue;
      if (el.children.length > 4) continue;
      const text = (el.innerText || el.textContent || "").trim();
      if (/^generating\b/i.test(text) || /generating (video|audio|overview)/i.test(text) || /creating (video|audio|overview)/i.test(text) ||
          (text.length < 60 && _has(text.toLowerCase(), NLM_CONFIG.words.generating.filter((w) => !/^[a-z]+$/.test(w))))) {
        if (isVisible(el)) return true;
      }
    }

    return false;
  }


  try {
    const runtimeApi = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;
    if (runtimeApi && runtimeApi.runtime && runtimeApi.runtime.onMessage) {
      runtimeApi.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg && msg.type === "NLM_CHECK_STATUS") {
          const activeDialog = getActiveVideoDialog();
          const quota = checkQuotaExhaustion(activeDialog);
          const status = {
            success: true,
            isGenerating: isGeneratingActive(),
            isBusy: isBusy,
            autoAiRunning: autoAiRunning,
            quotaExhausted: quota.exhausted,
            error: quota.error || ""
          };
          try { sendResponse(status); } catch (e) {}
          if (typeof browser !== "undefined" && browser.runtime) return Promise.resolve(status);
          return true;
        }

        if (msg && msg.type === "NLM_COMMAND") {
          const runner = async () => {
            const isAudioMode = msg.mode === "audio" || msg.mode === "audio_choice";
            const flowOpts = { allowLater: msg.allowLater !== false, waitMs: msg.waitMs, choices: Array.isArray(msg.choices) ? msg.choices : undefined, dryRun: !!msg.dryRun };
            if (flowOpts.choices && (msg.mode === "audio" || msg.mode === "video")) msg.mode = msg.mode + "_choice";
            let res;
            if (msg.mode === "scan_ui") {
              res = scanUiFlow();
            } else if (msg.mode === "chat") {
              res = await chatFlow(msg.topic || "", flowOpts);
            } else if (msg.mode === "add_source") {
              res = await addSourceFlow(msg.kind || "website", msg.value || msg.topic || "", flowOpts);
            } else if (msg.mode === "configure_chat") {
              res = await configureChatFlow({ style: msg.style, custom: msg.custom, length: msg.length });
            } else if (msg.mode === "research") {
              res = await researchFlow({ query: msg.topic || msg.value, where: msg.where, depth: msg.depth, importResults: msg.importResults !== false });
            } else if (msg.mode === "set_language") {
              res = await setLanguageFlow(msg.names || [msg.value || msg.topic || ""]);
            } else if (msg.mode === "rename_download") {
              res = await renameDownloadFlow(Array.isArray(msg.prompts) ? msg.prompts : [], { download: true, downloadFolder: msg.downloadFolder || "" });
            } else if (msg.mode === "rename_only") {
              res = await renameDownloadFlow(Array.isArray(msg.prompts) ? msg.prompts : [], { download: false });
            } else if (msg.mode === "auto_ai") {
              // v7.10.0: poora AI Auto pass (wait + rename/download). Ghanton chal sakta hai — dashboard
              // status poll karta hai, aur reload hone par bhi progress chrome.storage.local mein safe hai.
              res = await autoAiFlow(Array.isArray(msg.prompts) ? msg.prompts : [], { batchStart: msg.batchStart, batchEnd: msg.batchEnd, sentNumbers: msg.sentNumbers, download: msg.download !== false, downloadFolder: msg.downloadFolder || "" });
            } else if (msg.mode === "auto_ai_existing") {
              // v7.10.1: sirf pehle se bane hue items — na bhejna, na wait; seedha rename/download pass.
              res = await autoAiExistingFlow(Array.isArray(msg.prompts) ? msg.prompts : [], { download: msg.download !== false, downloadFolder: msg.downloadFolder || "" });
            } else if (msg.mode === "auto_ai_status") {
              const st = await loadAutoAiState();
              res = { success: true, action: "auto_ai_status", data: Object.assign({}, st || {}, { isGenerating: isGeneratingActive(), isBusy: isBusy, autoAiRunning: autoAiRunning }) };
            } else if (msg.mode === "auto_ai_stop") {
              autoAiStopRequested = true;
              res = { success: true, action: "auto_ai_stop", message: "AI Auto rokne ka signal bhej diya — chal raha pass agle checkpoint par ruk jayega." };
            } else if (msg.mode === "audio") {
              res = await generateAudioFlow(msg.topic || "", flowOpts);
            } else if (!msg.mode || msg.mode === "video") {
              res = await generateVideoFlow(msg.topic || "", flowOpts);
            } else {
              res = await generateStudioFlow(msg.mode, msg.topic || "", flowOpts);
            }
            const isLater = res?.action === "later";
            return {
              success: !!res?.success,
              quotaExhausted: !!res?.quotaExhausted,
              action: res?.action || "now",
              confirmed: res?.confirmed !== false,
              busy: !!res?.busy,
              pointNumber: msg.pointNumber,
              data: res?.data,
              error: res?.error || "",
              message: isLater
                ? "Limit reached! Queued with 'Generate later' (NotebookLM will generate it automatically)."
                : (res?.message || (isAudioMode ? "Started generating Audio Overview!" : "Started generating Short (9:16) video!"))
            };
          };

          const p = runner().catch((err) => ({ success: false, quotaExhausted: false, error: err.message }));
          p.then((res) => {
            try { sendResponse(res); } catch (e) {}
          });

          if (typeof browser !== "undefined" && browser.runtime) return p;
          return true;
        }
      });
    }
  } catch (e) {}

  // test hook (only active when a test harness sets this flag before loading the script)
  if (typeof globalThis !== "undefined" && globalThis.__NLM_TEST_HOOK__) {
    globalThis.__NLM_TEST__ = {
      generateVideoFlow, generateAudioFlow, generateStudioFlow, applyChoices, selectedChoices, getActiveDialog, findChoice, configureChatFlow, researchFlow, scanUiFlow, chatFlow, addSourceFlow, setLanguageFlow, checkQuotaExhaustion, getFormatRadioButtons,
      isRadioSelected, getActiveVideoDialog, clickGenerateButtonInDialog, isGeneratingActive, renameDownloadFlow, matchPromptToTitle,
      isDefaultTitle, classifyAutoAiItem, listStudioArtifactsSync, waitForGenerationDone, autoAiFlow, autoAiExistingFlow, autoAiRenamePass, buildAutoAiResumeSets, loadAutoAiState, renameDownloadCore
    };
  }

  // v5.7.0: the floating "Quick Studio" box on the NotebookLM page is removed (Rocky's request). Only the dashboard bridge remains.
  try { const old = document.getElementById("nlm-mini-box"); if (old) old.remove(); } catch (e) {}
})();
