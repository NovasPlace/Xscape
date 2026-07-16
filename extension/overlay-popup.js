"use strict";

const KEY = "xscapeSettings";
const THEMES = {
  "neon-rune": { a:"#8b5cf6", b:"#22d3ee" },
  "grand-exchange": { a:"#f4c95d", b:"#79ff97" },
  "void": { a:"#6d28d9", b:"#64748b" },
  "frozen": { a:"#74ddff", b:"#5b78ff" },
  "inferno": { a:"#ff4a00", b:"#ffd000" },
  "toxic": { a:"#76ff00", b:"#00ffd5" },
  "party": { a:"#ff69d4", b:"#57d9ff" },
  "custom": { a:"#8b5cf6", b:"#22d3ee" }
};
const DEFAULTS = {
  overlayEnabled:false,
  overlayTheme:"neon-rune",
  overlayAccent1:"#8b5cf6",
  overlayAccent2:"#22d3ee",
  overlayGlass:true,
  overlayCompact:false,
  overlayHideRight:false,
  overlayHideTrends:false,
  overlayHideAds:true,
  overlayDimMedia:false,
  overlayRoundMedia:true
};
const $ = selector => document.querySelector(selector);
const el = {
  enabled:$("#overlayEnabled"),
  theme:$("#overlayTheme"),
  accent1:$("#overlayAccent1"),
  accent2:$("#overlayAccent2"),
  glass:$("#overlayGlass"),
  compact:$("#overlayCompact"),
  hideRight:$("#overlayHideRight"),
  hideTrends:$("#overlayHideTrends"),
  hideAds:$("#overlayHideAds"),
  dimMedia:$("#overlayDimMedia"),
  roundMedia:$("#overlayRoundMedia"),
  apply:$("#applyOverlay"),
  reset:$("#resetOverlay"),
  status:$("#status")
};
let settings = { ...DEFAULTS };
let colorTimer = 0;

function merge(value) {
  const incoming = value && typeof value === "object" ? value : {};
  return { ...DEFAULTS, ...incoming };
}
function note(text, bad=false) {
  el.status.textContent = text;
  el.status.style.color = bad ? "#fca5a5" : "var(--muted)";
  setTimeout(() => {
    if (el.status.textContent === text) el.status.textContent = "";
  }, 2600);
}
function syncSwatches() {
  document.querySelectorAll("[data-overlay-theme]").forEach(button => {
    button.classList.toggle("active", button.dataset.overlayTheme === el.theme.value);
  });
}
function loadForm() {
  const theme = THEMES[settings.overlayTheme] ? settings.overlayTheme : DEFAULTS.overlayTheme;
  const palette = theme === "custom" ? {
    a: settings.overlayAccent1,
    b: settings.overlayAccent2
  } : THEMES[theme];

  el.enabled.checked = Boolean(settings.overlayEnabled);
  el.theme.value = theme;
  el.accent1.value = palette.a;
  el.accent2.value = palette.b;
  el.glass.checked = Boolean(settings.overlayGlass);
  el.compact.checked = Boolean(settings.overlayCompact);
  el.hideRight.checked = Boolean(settings.overlayHideRight);
  el.hideTrends.checked = Boolean(settings.overlayHideTrends);
  el.hideAds.checked = Boolean(settings.overlayHideAds);
  el.dimMedia.checked = Boolean(settings.overlayDimMedia);
  el.roundMedia.checked = Boolean(settings.overlayRoundMedia);
  syncSwatches();
}
function readForm() {
  const theme = THEMES[el.theme.value] ? el.theme.value : DEFAULTS.overlayTheme;
  return {
    overlayEnabled: el.enabled.checked,
    overlayTheme: theme,
    overlayAccent1: el.accent1.value,
    overlayAccent2: el.accent2.value,
    overlayGlass: el.glass.checked,
    overlayCompact: el.compact.checked,
    overlayHideRight: el.hideRight.checked,
    overlayHideTrends: el.hideTrends.checked,
    overlayHideAds: el.hideAds.checked,
    overlayDimMedia: el.dimMedia.checked,
    overlayRoundMedia: el.roundMedia.checked
  };
}
async function persist(message="X overlay updated.") {
  Object.assign(settings, readForm());
  const stored = await chrome.storage.local.get(KEY);
  const current = stored[KEY] && typeof stored[KEY] === "object" ? stored[KEY] : {};
  await chrome.storage.local.set({ [KEY]: { ...current, ...settings } });

  try {
    const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
    if (tab?.id) await chrome.tabs.sendMessage(tab.id, { type:"XSCAPE_OVERLAY_REFRESH" });
  } catch {}

  note(message);
}
function chooseTheme(name) {
  if (!THEMES[name]) return;
  el.theme.value = name;
  if (name !== "custom") {
    el.accent1.value = THEMES[name].a;
    el.accent2.value = THEMES[name].b;
  }
  syncSwatches();
}
async function init() {
  const stored = await chrome.storage.local.get(KEY);
  settings = merge(stored[KEY]);
  loadForm();
}

[el.accent1, el.accent2].forEach(input => {
  input.oninput = () => {
    el.theme.value = "custom";
    syncSwatches();
    clearTimeout(colorTimer);
    colorTimer = setTimeout(() => persist("Custom overlay colors applied.").catch(error => note(error.message, true)), 120);
  };
});
[el.enabled, el.glass, el.compact, el.hideRight, el.hideTrends, el.hideAds, el.dimMedia, el.roundMedia].forEach(input => {
  input.onchange = () => persist().catch(error => note(error.message, true));
});
el.theme.onchange = () => {
  chooseTheme(el.theme.value);
  persist().catch(error => note(error.message, true));
};
document.querySelectorAll("[data-overlay-theme]").forEach(button => {
  button.onclick = () => {
    chooseTheme(button.dataset.overlayTheme);
    persist().catch(error => note(error.message, true));
  };
});
el.apply.onclick = () => persist("Full X overlay applied.").catch(error => note(error.message, true));
el.reset.onclick = async () => {
  Object.assign(settings, DEFAULTS);
  loadForm();
  await persist("X overlay reset.");
};

init().catch(error => note(error.message, true));
