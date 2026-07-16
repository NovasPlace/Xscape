<div align="center">

# ✦ XSCAPE ✦

### Give X some XP.

**OSRS-style animated display-name cosmetics for X.**  
Color, motion, glow, gradients, and community themes—without X's developer API.

![Manifest](https://img.shields.io/badge/Manifest-V3-57D9FF?style=for-the-badge)
![Version](https://img.shields.io/badge/version-0.4.0-F4C95D?style=for-the-badge)
![Local First](https://img.shields.io/badge/local--first-79FF97?style=for-the-badge)
![No X API](https://img.shields.io/badge/X_API-not_required-FF69D4?style=for-the-badge)

`Grand Exchange energy × old-web personality × modern extension hygiene`

</div>

---

## What is Xscape?

Xscape makes X feel less like a grayscale corporate terminal and more like the internet again.

It styles display names directly in your browser with animated effects and a public, GitHub-backed community registry. No X Developer account, OAuth flow, backend, database, or account token is required.

```text
Buying colorful names 10k ea
Selling glow effects 25k ea
Rainbow wave: priceless
```

## ✨ Effect loadout

| Effect | Vibe |
|---|---|
| **Wave** | Classic scrolling color motion |
| **Rainbow** | Full-spectrum timeline chaos |
| **Flash** | Loud, fast, impossible to ignore |
| **Glow** | Soft neon aura |
| **Gradient** | Two-color polished flex |
| **Pulse** | Breathing light animation |
| **Fire** | Legendary-drop energy |
| **Ice** | Frozen cyan shimmer |
| **Toxic** | Radioactive green menace |
| **Solid** | Clean custom color |

Each style supports configurable colors, speed, and intensity with a live preview.

## 🪙 Grand Exchange mode

Turn on **Grand Exchange mode** to apply one effect to every visible profile.

It is deliberately excessive. That is the point.

## 🌐 Community Sync

Anyone using Xscape with Community Sync enabled sees the public themes in [`themes/community.json`](themes/community.json). People without the extension continue to see normal X.

The default registry is:

```text
https://raw.githubusercontent.com/NovasPlace/Xscape/main/themes/community.json
```

Users may also point Xscape at a fork, Gist, or another compatible registry.

### Theme precedence

1. Local per-handle override
2. Shared GitHub community theme
3. Grand Exchange mode

Local control always wins, so any handle or effect can be muted or restyled.

## 📦 Install locally

1. Download the latest extension ZIP from GitHub Releases, or download this repository.
2. Extract it.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the `extension` folder.
7. Refresh X.

Xscape supports Chromium-based browsers and runs on both `x.com` and `twitter.com`.

## 🎨 Share your name theme

1. Tune your handle under **Style**.
2. Open **Community** and click **Copy theme JSON**.
3. Fork this repository.
4. Add the copied entry to `themes/community.json`.
5. Open a pull request.

After merge, other Xscape users receive the theme within five minutes or immediately after pressing **Refresh now**.

## 🧪 Validation

```bash
node scripts/validate-themes.mjs themes/community.json
node scripts/test-registry.mjs
node --check extension/background.js
node --check extension/content.js
node --check extension/popup.js
```

GitHub Actions runs these checks on every registry pull request. Tags matching `v*` automatically create a GitHub Release containing the extension ZIP.

## 🗺️ Repository layout

```text
extension/              Unpacked Chromium extension
├── manifest.json       Manifest V3 configuration
├── content.*           X page detection and effects
├── background.js       Registry sync service worker
└── popup.*             Style editor and community controls

themes/community.json   Shared public theme registry
scripts/                Validation and registry tests
.github/workflows/      Pull-request checks and release packaging
CONTRIBUTING.md          Contribution rules
BRANDING.md              Neon Rune visual identity
```

## 🔒 Privacy

Xscape reads display names and handles already rendered on X so it can apply styles. It fetches only the configured GitHub JSON registry and stores settings and cache locally.

It does **not** send browsing data, X content, private messages, or account credentials anywhere.

## 🎭 Theme: Neon Rune

Xscape's identity mixes dark UI surfaces, game-like rarity colors, and bright animated accents.

| Token | Hex | Role |
|---|---:|---|
| Void | `#0B0D10` | Main background |
| Rune Gold | `#F4C95D` | Titles and rare effects |
| XP Green | `#79FF97` | Success and active states |
| Magic Cyan | `#57D9FF` | Links and electric effects |
| Party Pink | `#FF69D4` | Playful highlights |
| Legendary Orange | `#FF9F43` | High-rarity accents |

See [`BRANDING.md`](BRANDING.md) for the full visual direction.

---

<div align="center">

### The timeline has been gray long enough.

**Install Xscape. Pick an effect. Start glowing.**

</div>
