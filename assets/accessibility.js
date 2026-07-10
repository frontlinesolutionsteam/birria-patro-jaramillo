/* ===================== ACCESSIBILITY WIDGET ===================== */
(function () {
  "use strict";

  const PREFS_KEY = "bpj_accessibility";

  const DEFAULTS = {
    fontSize: 100, // 90 | 100 | 115 | 130
    contrast: "normal", // normal | high | dark
    font: "default", // default | dyslexia
    highlightLinks: false,
    reduceMotion: false,
    readingGuide: false,
  };

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  let prefs = loadPrefs();

  /* ===================== INDIVIDUAL CONTROL FUNCTIONS ===================== */
  function applyTextSize(size) {
    document.documentElement.style.fontSize = (size || 100) + "%";
  }

  function applyContrast(mode) {
    document.body.classList.remove("contrast-high", "contrast-dark");
    if (mode === "high") document.body.classList.add("contrast-high");
    if (mode === "dark") document.body.classList.add("contrast-dark");
  }

  function applyDyslexiaFont(enabled) {
    // The @font-face for 'OpenDyslexic' is declared in style.css (self-hosted via a
    // reliable CDN), so applying it is just a matter of setting the family — no
    // runtime <link> injection needed (that approach depended on fonts.cdnfonts.com,
    // which many ad blockers/privacy filters silently block).
    if (enabled) {
      document.body.style.fontFamily = "OpenDyslexic, sans-serif";
    } else {
      document.body.style.fontFamily = "";
    }
  }

  function applyHighlightLinks(enabled) {
    document.body.classList.toggle("highlight-links", !!enabled);
  }

  function applyPauseAnimations(enabled) {
    document.body.classList.toggle("reduce-motion", !!enabled);
  }

  let readingGuideHandler = null;
  function moveReadingGuide(e) {
    const guide = document.getElementById("reading-guide");
    if (guide) guide.style.top = e.clientY + "px";
  }
  function applyReadingGuide(enabled) {
    let guide = document.getElementById("reading-guide");
    if (enabled) {
      if (!guide) {
        guide = document.createElement("div");
        guide.id = "reading-guide";
        document.body.appendChild(guide);
      }
      if (!readingGuideHandler) {
        readingGuideHandler = moveReadingGuide;
        document.addEventListener("mousemove", readingGuideHandler);
      }
    } else {
      if (guide) guide.remove();
      if (readingGuideHandler) {
        document.removeEventListener("mousemove", readingGuideHandler);
        readingGuideHandler = null;
      }
    }
  }

  function applyAll(p) {
    applyTextSize(p.fontSize);
    applyContrast(p.contrast);
    applyDyslexiaFont(p.font === "dyslexia");
    applyHighlightLinks(p.highlightLinks);
    applyPauseAnimations(p.reduceMotion);
    applyReadingGuide(p.readingGuide);
  }

  // Apply immediately (before DOMContentLoaded) to avoid flash of unstyled content.
  // (Reading guide element creation is deferred until the widget builds, since it
  // needs document.body — which already exists by the time this script runs.)
  applyTextSize(prefs.fontSize);
  applyContrast(prefs.contrast);
  applyHighlightLinks(prefs.highlightLinks);
  applyPauseAnimations(prefs.reduceMotion);

  function buildWidget() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <button id="a11y-toggle-btn" aria-label="Accessibility options" aria-expanded="false">♿</button>
      <div id="a11y-panel" role="dialog" aria-label="Accessibility options">
        <h3>Accessibility Options</h3>
        <p class="a11y-sub">Preferences are saved on this device.</p>

        <div class="a11y-group">
          <label class="a11y-label">Text Size</label>
          <div class="a11y-btn-row">
            <button data-fontsize="90">A-</button>
            <button data-fontsize="100">A</button>
            <button data-fontsize="115">A+</button>
            <button data-fontsize="130">A++</button>
          </div>
        </div>

        <div class="a11y-group">
          <label class="a11y-label">Contrast</label>
          <div class="a11y-btn-row">
            <button data-contrast="normal">Normal</button>
            <button data-contrast="high">High Contrast</button>
            <button data-contrast="dark">Dark Mode</button>
          </div>
        </div>

        <div class="a11y-group">
          <label class="a11y-label">Font</label>
          <div class="a11y-btn-row">
            <button data-font="default">Default</button>
            <button data-font="dyslexia">Dyslexia-Friendly</button>
          </div>
        </div>

        <div class="a11y-group">
          <div class="a11y-switch-row">
            <label class="a11y-label">Highlight Links</label>
            <button class="a11y-switch" data-toggle="highlightLinks" aria-label="Toggle highlight links"></button>
          </div>
          <div class="a11y-switch-row">
            <label class="a11y-label">Pause Animations</label>
            <button class="a11y-switch" data-toggle="reduceMotion" aria-label="Toggle pause animations"></button>
          </div>
          <div class="a11y-switch-row">
            <label class="a11y-label">Reading Guide</label>
            <button class="a11y-switch" data-toggle="readingGuide" aria-label="Toggle reading guide"></button>
          </div>
        </div>

        <button id="a11y-reset" class="btn btn-outline-dark btn-sm">Reset All</button>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  function syncWidgetUI(p) {
    document.querySelectorAll("[data-fontsize]").forEach((btn) => {
      btn.classList.toggle("active", +btn.dataset.fontsize === p.fontSize);
    });
    document.querySelectorAll("[data-contrast]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.contrast === p.contrast);
    });
    document.querySelectorAll("[data-font]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.font === p.font);
    });
    document.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.classList.toggle("active", !!p[btn.dataset.toggle]);
    });
  }

  function update(partial) {
    prefs = { ...prefs, ...partial };
    applyAll(prefs);
    syncWidgetUI(prefs);
    savePrefs(prefs);
  }

  function resetAll() {
    prefs = { ...DEFAULTS };
    document.documentElement.style.fontSize = "";
    document.body.classList.remove("contrast-high", "contrast-dark", "highlight-links", "reduce-motion");
    document.body.style.fontFamily = "";
    const guide = document.getElementById("reading-guide");
    if (guide) guide.remove();
    if (readingGuideHandler) {
      document.removeEventListener("mousemove", readingGuideHandler);
      readingGuideHandler = null;
    }
    localStorage.removeItem(PREFS_KEY);
    syncWidgetUI(prefs);
  }

  function wireEvents() {
    const toggleBtn = document.getElementById("a11y-toggle-btn");
    const panel = document.getElementById("a11y-panel");

    toggleBtn.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (e) => {
      if (panel.classList.contains("open") && !panel.contains(e.target) && e.target !== toggleBtn) {
        panel.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll("[data-fontsize]").forEach((btn) => {
      btn.addEventListener("click", () => update({ fontSize: +btn.dataset.fontsize }));
    });

    document.querySelectorAll("[data-contrast]").forEach((btn) => {
      btn.addEventListener("click", () => update({ contrast: btn.dataset.contrast }));
    });

    document.querySelectorAll("[data-font]").forEach((btn) => {
      btn.addEventListener("click", () => update({ font: btn.dataset.font }));
    });

    document.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.toggle;
        update({ [key]: !prefs[key] });
      });
    });

    document.getElementById("a11y-reset").addEventListener("click", resetAll);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildWidget();
    // Re-apply everything now that the widget (and #reading-guide host) exists.
    applyAll(prefs);
    syncWidgetUI(prefs);
    wireEvents();
  });
})();
