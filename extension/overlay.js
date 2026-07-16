(() => {
  "use strict";

  const KEY = "xscapeSettings";
  const ROOT_CLASSES = [
    "xscape-overlay",
    "xscape-overlay-glass",
    "xscape-overlay-compact",
    "xscape-overlay-hide-right",
    "xscape-overlay-hide-trends",
    "xscape-overlay-hide-ads",
    "xscape-overlay-dim-media",
    "xscape-overlay-round-media"
  ];
  const VARS = ["bg","surface","surface2","field","line","text","muted","a","b"];
  const THEMES = {
    "neon-rune": {
      bg:"#06070b", surface:"#0f1219", surface2:"#171b25", field:"#0a0d13",
      line:"#2d3240", text:"#f8fafc", muted:"#929cab", a:"#8b5cf6", b:"#22d3ee"
    },
    "grand-exchange": {
      bg:"#160f08", surface:"#24180e", surface2:"#312113", field:"#100b07",
      line:"#5b4328", text:"#fff4d2", muted:"#b9a87e", a:"#f4c95d", b:"#79ff97"
    },
    "void": {
      bg:"#020307", surface:"#080a11", surface2:"#101522", field:"#05060a",
      line:"#252b3b", text:"#eef1f8", muted:"#7d8799", a:"#6d28d9", b:"#64748b"
    },
    "frozen": {
      bg:"#04121b", surface:"#0a202d", surface2:"#102d3c", field:"#06151e",
      line:"#245267", text:"#effcff", muted:"#8fb8c8", a:"#74ddff", b:"#5b78ff"
    },
    "inferno": {
      bg:"#150703", surface:"#260f07", surface2:"#35150a", field:"#100603",
      line:"#65301d", text:"#fff4e6", muted:"#c49a82", a:"#ff4a00", b:"#ffd000"
    },
    "toxic": {
      bg:"#061005", surface:"#0f1d0c", surface2:"#172a12", field:"#071006",
      line:"#315d2b", text:"#f0ffe9", muted:"#91b98a", a:"#76ff00", b:"#00ffd5"
    },
    "party": {
      bg:"#150716", surface:"#27102a", surface2:"#35133a", field:"#100611",
      line:"#623363", text:"#fff2ff", muted:"#c9a0c9", a:"#ff69d4", b:"#57d9ff"
    },
    "custom": {
      bg:"#06070b", surface:"#0f1219", surface2:"#171b25", field:"#0a0d13",
      line:"#2d3240", text:"#f8fafc", muted:"#929cab", a:"#8b5cf6", b:"#22d3ee"
    }
  };
  const DEFAULTS = {
    overlayEnabled: false,
    overlayTheme: "neon-rune",
    overlayAccent1: "#8b5cf6",
    overlayAccent2: "#22d3ee",
    overlayGlass: true,
    overlayCompact: false,
    overlayHideRight: false,
    overlayHideTrends: false,
    overlayHideAds: true,
    overlayDimMedia: false,
    overlayRoundMedia: true
  };

  let settings = { ...DEFAULTS };

  const validColor = (value, fallback) =>
    /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : fallback;

  function merge(value) {
    const incoming = value && typeof value === "object" ? value : {};
    const overlayTheme = THEMES[incoming.overlayTheme] ? incoming.overlayTheme : DEFAULTS.overlayTheme;
    return {
      ...DEFAULTS,
      ...incoming,
      overlayTheme,
      overlayAccent1: validColor(incoming.overlayAccent1, DEFAULTS.overlayAccent1),
      overlayAccent2: validColor(incoming.overlayAccent2, DEFAULTS.overlayAccent2)
    };
  }

  function clearOverlay() {
    const root = document.documentElement;
    ROOT_CLASSES.forEach(name => root.classList.remove(name));
    delete root.dataset.xscapeOverlay;
    VARS.forEach(name => root.style.removeProperty(`--xo-${name}`));
  }

  function applyOverlay() {
    clearOverlay();
    if (!settings.overlayEnabled) return;

    const root = document.documentElement;
    const theme = THEMES[settings.overlayTheme] || THEMES["neon-rune"];
    const palette = {
      ...theme,
      a: settings.overlayTheme === "custom" ? settings.overlayAccent1 : theme.a,
      b: settings.overlayTheme === "custom" ? settings.overlayAccent2 : theme.b
    };

    root.classList.add("xscape-overlay");
    root.dataset.xscapeOverlay = settings.overlayTheme;
    root.classList.toggle("xscape-overlay-glass", Boolean(settings.overlayGlass));
    root.classList.toggle("xscape-overlay-compact", Boolean(settings.overlayCompact));
    root.classList.toggle("xscape-overlay-hide-right", Boolean(settings.overlayHideRight));
    root.classList.toggle("xscape-overlay-hide-trends", Boolean(settings.overlayHideTrends));
    root.classList.toggle("xscape-overlay-hide-ads", Boolean(settings.overlayHideAds));
    root.classList.toggle("xscape-overlay-dim-media", Boolean(settings.overlayDimMedia));
    root.classList.toggle("xscape-overlay-round-media", Boolean(settings.overlayRoundMedia));

    for (const [name, value] of Object.entries(palette)) {
      root.style.setProperty(`--xo-${name}`, value);
    }
  }

  async function load() {
    const stored = await chrome.storage.local.get(KEY);
    settings = merge(stored[KEY]);
    applyOverlay();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[KEY]) return;
    settings = merge(changes[KEY].newValue);
    applyOverlay();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "XSCAPE_OVERLAY_REFRESH") return;
    load().then(() => sendResponse({ ok: true })).catch(error => {
      sendResponse({ ok: false, error: error?.message || "Overlay refresh failed." });
    });
    return true;
  });

  load().catch(error => console.error("[Xscape Overlay]", error));
})();
