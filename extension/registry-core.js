"use strict";

export const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/NovasPlace/Xscape/main/themes/community.json";

export const ALLOWED_EFFECTS = new Set([
  "solid", "gradient", "glow", "rainbow", "flash",
  "wave", "pulse", "fire", "ice", "toxic"
]);

export function normalizeHandle(value) {
  return String(value || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 15);
}

export function normalizeRegistryUrl(value) {
  const input = String(value || DEFAULT_REGISTRY_URL).trim();
  const parsed = new URL(input);
  if (parsed.protocol !== "https:") {
    throw new Error("GitHub registry URLs must use HTTPS.");
  }

  if (parsed.hostname === "github.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 5 && (parts[2] === "blob" || parts[2] === "raw")) {
      const [owner, repo, , branch, ...path] = parts;
      if (!path.length) throw new Error("Registry URL must point to a JSON file.");
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path.join("/")}`;
    }
    throw new Error("Use a GitHub file URL ending in themes/community.json.");
  }

  if (parsed.hostname === "raw.githubusercontent.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 4) throw new Error("Raw GitHub registry URL is incomplete.");
    return parsed.toString();
  }

  if (parsed.hostname === "gist.githubusercontent.com") {
    return parsed.toString();
  }

  throw new Error("Registry must be hosted on GitHub or a GitHub Gist.");
}

export function registryBrowseUrl(value) {
  const raw = normalizeRegistryUrl(value);
  const parsed = new URL(raw);
  if (parsed.hostname !== "raw.githubusercontent.com") return raw;
  const [owner, repo, branch, ...path] = parsed.pathname.split("/").filter(Boolean);
  return `https://github.com/${owner}/${repo}/blob/${branch}/${path.join("/")}`;
}

function validHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(max, Math.max(min, number));
}

export function validateTheme(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const effect = String(value.effect || "").toLowerCase();
  if (!ALLOWED_EFFECTS.has(effect)) return null;
  if (!validHex(value.color1) || !validHex(value.color2)) return null;
  const speed = clamp(value.speed, 0.25, 4);
  const intensity = clamp(value.intensity, 0.1, 1);
  if (speed === null || intensity === null) return null;
  return {
    effect,
    color1: String(value.color1).toLowerCase(),
    color2: String(value.color2).toLowerCase(),
    speed: Number(speed.toFixed(3)),
    intensity: Number(intensity.toFixed(3))
  };
}

export function parseRegistryPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Registry must be a JSON object.");
  }
  const source = payload.themes && typeof payload.themes === "object"
    ? payload.themes
    : payload;
  const themes = {};
  let rejected = 0;
  for (const [rawHandle, rawTheme] of Object.entries(source)) {
    if (["schemaVersion", "updatedAt", "description"].includes(rawHandle)) continue;
    const handle = normalizeHandle(rawHandle);
    const theme = validateTheme(rawTheme);
    if (!handle || !theme) {
      rejected += 1;
      continue;
    }
    themes[handle] = theme;
  }
  return { themes, rejected, count: Object.keys(themes).length };
}
