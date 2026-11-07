# NotebookLM Studio Hub (v7.7.0)

**🌐 Live Dashboard URL**: [https://vidyatopperin-rocky.github.io/notebooklm-studio/](https://vidyatopperin-rocky.github.io/notebooklm-studio/)

Ye extension NotebookLM ke Studio outputs ko web dashboard se ek-ek karke generate karwata hai.
Ab aapko local Python server chalane ki zaroorat nahi — seedha GitHub Pages par live chalega!

## 1. Install / Setup (Chrome / Edge / Brave)
1. Chrome mein `chrome://extensions` kholen.
2. Upar right mein **Developer mode** ON karein.
3. **Load unpacked** dabayein, aur `g:\notebookLM` folder select karein (ya pehle se loaded hai to extension par **🔄 Reload** icon dabayein).
4. Ab seedha Live link kholen: [https://vidyatopperin-rocky.github.io/notebooklm-studio/](https://vidyatopperin-rocky.github.io/notebooklm-studio/)
5. Sidebar mein green **"Live Extension • Ready"** dikhega!
6. Ek alag tab mein apni NotebookLM notebook kholen (`notebook.google.com`).

## 2. Kaise chalana hai
- Har prompt card par checkboxes hain: 🎬 Video, 🎧 Audio, 🧠 Mind map, 📘 Study guide, 📄 Briefing doc, ❓ FAQ, ✍️ Blog post, 🕒 Timeline, 🃏 Flashcards, 📝 Quiz, 🗒️ Note.
- Upar **Preset** dropdown: "Full study pack" sab prompts par audio+video+mind map+study guide+FAQ+timeline+notes laga deta hai. Phir kisi prompt par checkbox se change kar sakte ho.
- **Start Auto-Batch** dabayein. Badge par dikhega kaunsa prompt aur kaunsa output chal raha hai (jaise `P4 · Mind map (5/12)`).
- Limit aaye to batch ruk jata hai aur "Resume from Prompt N" save ho jata hai. Limit khulne par Resume dabayein: jo output pehle ja chuka, wo dobara nahi jayega.
- **⬇ Run log (.txt)** se poori log file download hoti hai.

## 3. Pehle ye 2-3 prompts try karein
1. Sirf **Mind map** tick karke ek chhota prompt chalayein. Sabse simple output hai.
2. Ek prompt par **Study guide + FAQ** (Reports ke andar ke options) tick karein.
3. **Note** tick karein: ye chat mein prompt poochta hai aur answer par "Save to note" dabata hai. Ye ek naya flow hai, isliye pehle dekhein.
Har try ke baad Run log dekhein. Jo line `✓ P.. bhej diya` hai wo bheja gaya; `⚠️` wali line batati hai kya gadbad hui.

## 4. Selector theek karna (sabse zaroori)
Google UI badalta hai to labels bhi badalte hain. Sab labels ek hi jagah hain:
- `content.js` kholen. **Sabse upar** `NLM_CONFIG` block hai.
- `outputs:` section mein har output ki list hai, jaise:
  `mindmap: { label: "Mind Map", tile: ["mind map", "mind-map", "माइंड मैप"] }`
- `tile` = Studio panel ke card par likha word. `option` = dialog ke andar ka option. `save` = "Save to note" button ke words.
- Naya label mile to uski lowercase string us list mein daal dein, jaise `tile: ["mind map", "mindmap map", ...]`. Extension reload karein (chrome://extensions par reload icon).
- Log mein `"... card not found"` ya `"Option ... not found"` dikhe to yahi karna hai.

## 5. Kya test hua aur kya nahi (honest)
- Test sirf ek MOCK NotebookLM page par hua (real Chromium + Playwright). Real NotebookLM ke labels, limit ka exact wording, aur Hindi UI test NAHI hue.
- Real NotebookLM login ke bina test nahi ho sakta. Iska matlab: pehli baar real page par kuch selector fail ho sakte hain. Log dekh kar config block mein fix karein.
- Outputs jo Google ke help/blog pages se confirm hue: Audio Overview, Video Overview, Mind maps, Reports (FAQ, Study guide, Briefing doc, aur "Create your own"), Flashcards aur Quizzes, aur chat answer ko "Save to note" karna.
- Timeline built-in report ke roop mein confirm nahi hua. Ye "Create your own" report hai jisme timeline ka instruction jata hai.
- Blog post: Google ne "reports mein blog-post style" likha hai, par option ka exact naam check nahi hua.
- Hindi labels (config mein) sirf guesses hain.
- Infographic, slide deck, data table isme nahi hain.


## 6. v5.0.0 mein naya kya hai
- Naye Studio outputs (har prompt card par checkbox): 🖼️ Slide deck, 📊 Infographic, 🔢 Data table. Preset "Sab kuch (v5)" sab outputs laga deta hai.
- 🛠 **Tools panel** (dashboard mein, log ke upar):
  - 🌐 **Output language**: 28 bhashayen (Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Spanish, French, German, Arabic, Japanese, Korean, Chinese ...). NotebookLM Settings mein output language set karta hai.
  - ➕ **Add source**: Website link, YouTube link ya copied text.
  - 💬 **Chat**: notebook se sawaal poochta hai aur jawab aane tak wait karta hai.
  - 🔍 **Diagnose page**: NotebookLM page ke saare buttons ki list `notebooklm_page_diagnose.json` mein download karta hai. Jo bhi button na mile, ye file bhejo, labels ek baar mein theek ho jayenge.
- NotebookLM ki UI Spanish, French, German, Portuguese, Indonesian, Arabic, Japanese, Korean, Chinese, Bengali, Tamil, Telugu, Marathi, Urdu, Hindi mein ho to bhi cards dhundhne ke liye words add hain (`NLM_LANG_PACKS`).

## 7. v5.0.0: kya test hua aur kya NAHI (sach)
- Mock page par 26/26 checks pass: naye 3 outputs + Mind map/Flashcards/Quiz (English aur Spanish UI), add source (3 tarah), language set (Hindi, Spanish), chat, Diagnose, aur limit ke baad batch ruk kar baaki pending rakhna.
- **Asli NotebookLM par kuch bhi test NAHI hua** (Google login nahi tha). Naye outputs ke asli labels (jaise "Slide deck", "Infographic"), "Add source" ke dialog ke words, aur Settings mein "Output language" ka rasta mock ke hisaab se likhe gaye hain.
- Doosri bhashaon ke saare words mere anuvaad hain, asli site se verify nahi.
- Ye extension website ke buttons dabata hai. Google page badle to tootega. Is liye Diagnose page + config block (`NLM_CONFIG`) rakha hai.


## 8. v5.1.0: asli NotebookLM par test (2026-11-06, Google test account, Pro)
Ye test asli notebooklm.google.com (ab notebook.google.com, UI mein "Gemini Notebook") par hua. Mock par nahi.
- ✅ Notebook banana (New notebook) aur us notebook ka khulna: asli page par check hua.
- ✅ Add source, "Copied text" (text source): source add hua, notebook mein "1 source" dikha.
- ✅ Studio: Mind Map generate hua ("Photosynthesis Mind Map" Studio list mein aaya).
- ✅ Studio: Infographic generate hua (Studio list mein aaya).
- ✅ Output language: Settings menu → "Output language" → dropdown → Save. Hindi set hua aur dialog mein read back hua; phir English par wapas, wo bhi read back hua.
- ✅ Diagnose page / scan: asli page par 33 controls mile.
- 🔧 v5.1.0 mein do fix hue jo asli page par zaroori the:
  1. Floating box nahi dikhta tha: Google page Trusted Types enforce karta hai, innerHTML "requires TrustedHTML" error deta tha. Ab policy ke through likha jata hai.
  2. Output language: dropdown kholna (mat-select) aur sahi option chunna theek kiya; "Web" wala "language" button galat nahi chhedta.
- ❌ Abhi test NAHI hua (asli page par): Audio Overview, Video Overview (ye alag flows hain), Slide deck, Data table, Reports (Study guide, Briefing, FAQ, Blog), Flashcards, Quiz, Chat question, Add note / Save to note, YouTube aur Website source (sirf text source test hua).
- Labels jo asli page par confirm hue: "Audio Overview", "Slide deck", "Video Overview", "Mind Map", "Reports", "Flashcards", "Quiz", "Infographic", "Data table", "Add note", "Add sources", "Settings" (menu), "Output language".
