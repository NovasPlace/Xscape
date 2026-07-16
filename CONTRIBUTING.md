# Add your Xscape theme

1. Install Xscape and tune your name on the **Style** tab.
2. Open **Community → Copy theme JSON**.
3. Fork this repository.
4. Edit `themes/community.json` and paste your entry inside the `themes` object.
5. Keep the key equal to your lowercase X handle without `@`.
6. Open a pull request using the theme template.

Example:

```json
"yourhandle": {
  "effect": "wave",
  "color1": "#00f5ff",
  "color2": "#8b5cf6",
  "speed": 0.92,
  "intensity": 0.9
}
```

Allowed effects: `solid`, `gradient`, `glow`, `rainbow`, `flash`, `wave`, `pulse`, `fire`, `ice`, `toxic`.

Speed must be `0.25–4`. Intensity must be `0.1–1`. Colors must be six-digit hex values.

## Moderation

The registry is trust- and pull-request-based. Maintainers may request simple ownership proof when an account is disputed. Impersonation entries will be removed.
