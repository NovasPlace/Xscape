# Xscape Brand Guide

## Theme: Neon Rune

Xscape should feel like a rare drop landed in the middle of a sterile social feed.

The visual language combines:

- Old School RuneScape trade-world chaos
- Early-web customization and forum-signature personality
- Neon arcade motion
- Clean, modern browser-extension controls

The result should be playful and slightly excessive without becoming unreadable.

## Core line

> Give X some XP.

Supporting lines:

- The timeline has been gray long enough.
- Colorful names. Animated effects. Actual personality.
- Escape the monochrome timeline.
- Pick an effect. Start glowing.

## Color system

| Name | Hex | Usage |
|---|---:|---|
| Void | `#0B0D10` | Main background and deep surfaces |
| Coal | `#171A21` | Cards, controls, and secondary surfaces |
| Rune Gold | `#F4C95D` | Brand mark, titles, rare effects |
| XP Green | `#79FF97` | Success, enabled states, sync health |
| Magic Cyan | `#57D9FF` | Links, focus rings, electric effects |
| Party Pink | `#FF69D4` | Playful highlights and community actions |
| Legendary Orange | `#FF9F43` | High-rarity presets and warnings |
| Ice White | `#F4F7FB` | Primary text on dark surfaces |
| Muted Silver | `#9AA4B2` | Supporting copy and inactive labels |

## Rarity language

Xscape presets may borrow game-like rarity naming:

- **Common** — clean solid colors
- **Uncommon** — two-color gradients
- **Rare** — glow and pulse effects
- **Epic** — wave, ice, and toxic effects
- **Legendary** — fire, rainbow, and community showcase presets

Rarity is flavor, not monetization. It should never imply paid access unless the project intentionally adds paid features later.

## Typography

Use the platform's native sans-serif stack for controls and documentation. Decorative type should be reserved for logos, promotional art, or section headings.

Recommended UI stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

Use monospace sparingly for handles, registry entries, theme JSON, and technical labels.

## Motion principles

1. Motion should decorate names, not prevent reading them.
2. Speed and intensity must remain user-controlled.
3. Reduced-motion preferences should disable or simplify animation.
4. Flashing effects should ship with conservative defaults.
5. Community themes must be locally muteable.

## Voice

Xscape copy should be:

- Playful
- Direct
- Internet-native
- Slightly mischievous
- Technically honest

Avoid corporate filler, crypto language, artificial scarcity, or pretending local effects are native X features.

## Repository presentation

Recommended GitHub About description:

> Give X some XP — OSRS-style animated display names with local effects and a shared GitHub theme registry. No X API required.

Recommended topics:

```text
browser-extension
chrome-extension
manifest-v3
twitter
x-com
customization
animated-text
name-effects
osrs
local-first
javascript
community-themes
```

## Social preview direction

A future social card should use:

- Void background
- Large `XSCAPE` title in Rune Gold
- A glowing sample handle beneath it
- Cyan-to-pink animated-effect streaks
- The line `Give X some XP.`
- Minimal supporting text so it remains readable at small sizes

Preferred aspect ratio: `1280 × 640`.
