# Xscape — Community Name FX for X

Xscape adds OSRS-style animated display-name cosmetics to X. Community themes are distributed through one public GitHub JSON file—no X Developer account, OAuth, backend, database, or account tokens.

## What other users see

Anyone using Xscape with Community Sync enabled sees the themes in `themes/community.json`. People without the extension see normal X.

The default registry is:

```text
https://raw.githubusercontent.com/NovasPlace/Xscape/main/themes/community.json
```

Users can point the extension at a fork or another GitHub registry from the Community tab.

## Install locally

1. Download the latest extension ZIP from GitHub Releases, or download this repository.
2. Extract it.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the `extension` folder.
7. Refresh X.

## Share your name theme

1. Tune your handle under **Style**.
2. Open **Community** and click **Copy theme JSON**.
3. Fork this repository.
4. Add the copied entry to `themes/community.json`.
5. Open a pull request.

After merge, other Xscape users receive the theme within five minutes or immediately after pressing **Refresh now**.

## Precedence

1. A user's local per-handle override
2. The shared GitHub community theme
3. Grand Exchange mode

This lets users mute or restyle anything locally.

## Validation

```bash
node scripts/validate-themes.mjs themes/community.json
node scripts/test-registry.mjs
node --check extension/background.js
node --check extension/content.js
node --check extension/popup.js
```

GitHub Actions runs these checks on every registry pull request. Tags matching `v*` automatically create a GitHub Release containing the extension ZIP.

## Repository layout

- `extension/` — unpacked Chrome extension
- `themes/community.json` — shared public theme registry
- `scripts/` — registry validation and tests
- `.github/workflows/` — pull-request validation and release packaging
- `CONTRIBUTING.md` — contribution rules

## Privacy

Xscape reads display names and handles already rendered on X so it can apply styles. It fetches only the configured GitHub JSON registry and stores settings/cache locally. It does not send browsing data, X content, or account credentials anywhere.
