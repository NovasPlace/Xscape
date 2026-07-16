<div align="center">

# ✦ XSCAPE ✦

### Give X some XP.

**Animated display names and complete local interface skins for X.**  
Reskin profiles, timeline cards, navigation, sidebars, menus, media, and the extension itself—without X's developer API.

![Manifest](https://img.shields.io/badge/Manifest-V3-57D9FF?style=for-the-badge)
![Version](https://img.shields.io/badge/version-0.6.0-F4C95D?style=for-the-badge)
![Local First](https://img.shields.io/badge/local--first-79FF97?style=for-the-badge)
![No X API](https://img.shields.io/badge/X_API-not_required-FF69D4?style=for-the-badge)

`Grand Exchange energy × old-web personality × modern extension hygiene`

</div>

---

## What is Xscape?

Xscape makes X feel less like a grayscale corporate terminal and more like the internet again.

It runs entirely in your browser. No X Developer account, OAuth flow, backend, database, or account token is required.

```text
Buying colorful names 10k ea
Selling full timeline skins 50k ea
Corporate grayscale: alched
```

## 🖥️ Full X overlay

Open **X Overlay** to reskin the entire site, not merely the extension popup.

The overlay changes:

- Page and column backgrounds
- Timeline posts into bordered game-like cards
- Navigation hover and selected states
- Composer, search fields, menus, and dialogs
- Primary buttons and tab indicators
- Avatars, images, and video presentation
- Sidebars, trends, recommendations, and promoted-post visibility

Built-in site skins:

| Skin | Direction |
|---|---|
| **Neon Rune** | Violet and cyan magical interface |
| **Grand Exchange** | Rune Gold with XP Green accents |
| **Void** | Near-black, purple, and slate |
| **Frozen** | Ice Barrage blues |
| **Inferno** | Lava, flame, and gold |
| **Toxic** | Venom green and radioactive cyan |
| **Party** | Pink and cyan old-web chaos |
| **Custom** | User-selected accent colors |

Overlay controls also include glass timeline cards, compact mode, hidden right sidebar, reduced discovery clutter, promoted-post filtering, dimmed media until hover, and rounded media.

Everything is local and reversible. Xscape does not modify the user's X account or send interface preferences anywhere.

## ✨ Name-effect loadout

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

## 🧙 Named presets

| Preset | Effect |
|---|---|
| **Rune Surge** | Magic Cyan and Rune Gold signature wave |
| **Party Hat** | Full-spectrum rainbow flex |
| **Ice Barrage** | Frozen Ancient Magicks shimmer |
| **Toxic PK** | Fast radioactive jitter |
| **Infernal Cape** | Maximum-intensity fire |
| **Void Pulse** | Controlled purple breathing glow |
| **Ancient Glow** | Cyan-violet magical aura |

All preset values remain editable after selection.

## 🎛️ Popup skins

The extension popup has its own independently configurable skins:

**Neon Rune · Grand Exchange · Void · Frozen · Inferno · Toxic · Party · Custom**

Popup options include custom accents, glass panels, compact mode, and an animated ambient backdrop.

## 🪙 Grand Exchange mode

Turn on **Grand Exchange mode** to apply one name effect to every visible profile.

It is deliberately excessive. That is the point.

## 🌐 Community Sync

Anyone using Xscape with Community Sync enabled sees public name themes from [`themes/community.json`](themes/community.json). People without the extension see normal X.

```text
https://raw.githubusercontent.com/NovasPlace/Xscape/main/themes/community.json
```

Users may also point Xscape at a fork, Gist, or another compatible registry.

### Name-theme precedence

1. Local per-handle override
2. Shared GitHub community theme
3. Grand Exchange mode

Local control always wins.

## 📦 Install locally

1. Download the latest extension ZIP from GitHub Releases, or download this repository.
2. Extract it.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the `extension` folder.
7. Refresh X.

Xscape supports Chromium-based browsers and runs on both `x.com` and `twitter.com`.

### Updating an unpacked installation

Pull or replace the repository files, then press the extension's **reload ↻** button in `chrome://extensions` and refresh X.

## 🎨 Share a name theme

1. Tune a handle under **Style**.
2. Open **Community** and click **Copy theme JSON**.
3. Fork this repository.
4. Add the copied entry to `themes/community.json`.
5. Open a pull request.

After merge, Community Sync users receive the theme within five minutes or immediately after pressing **Refresh now**.

## 🧪 Validation

```bash
node scripts/validate-themes.mjs themes/community.json
node scripts/test-registry.mjs
node --check extension/background.js
node --check extension/content.js
node --check extension/overlay.js
node --check extension/popup.js
node --check extension/overlay-popup.js
```

Tags matching `v*` automatically create a GitHub Release containing the complete extension ZIP.

## 🗺️ Repository layout

```text
extension/
├── manifest.json         Manifest V3 configuration
├── content.*             Display-name detection and effects
├── overlay.js            Full-page X overlay settings engine
├── overlay.css           Site-wide X visual skin
├── background.js         Community registry service worker
├── popup.*               Name, community, and popup-skin controls
└── overlay-popup.js      Full X overlay controls

themes/community.json     Shared public name-theme registry
scripts/                  Validation and registry tests
.github/workflows/        Pull-request checks and release packaging
CONTRIBUTING.md            Contribution rules
BRANDING.md                Neon Rune visual identity
```

## 🔒 Privacy

Xscape reads names and handles already rendered on X so it can apply effects. It stores settings locally and fetches only the configured GitHub JSON registry.

It does **not** send browsing data, X content, private messages, overlay preferences, or account credentials anywhere.

---

<div align="center">

### The timeline has been gray long enough.

**Install Xscape. Pick an effect. Reskin the whole site. Start glowing.**

</div>
