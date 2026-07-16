"use strict";

import {
  DEFAULT_REGISTRY_URL,
  normalizeHandle,
  normalizeRegistryUrl,
  parseRegistryPayload,
  registryBrowseUrl
} from "./registry-core.js";

const SETTINGS_KEY = "xscapeSettings";
const CACHE_KEY = "xscapeGitHubRegistryCache";
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_SETTINGS = {
  communityEnabled: false,
  communityRegistryUrl: DEFAULT_REGISTRY_URL,
  mutedHandles: [],
  mutedEffects: []
};

async function getSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  const incoming = stored[SETTINGS_KEY] && typeof stored[SETTINGS_KEY] === "object"
    ? stored[SETTINGS_KEY]
    : {};
  return {
    ...DEFAULT_SETTINGS,
    ...incoming,
    mutedHandles: Array.isArray(incoming.mutedHandles)
      ? incoming.mutedHandles.map(normalizeHandle).filter(Boolean)
      : [],
    mutedEffects: Array.isArray(incoming.mutedEffects)
      ? incoming.mutedEffects.map((value) => String(value).toLowerCase())
      : []
  };
}

async function readCache(url) {
  const stored = await chrome.storage.local.get(CACHE_KEY);
  const cache = stored[CACHE_KEY];
  return cache && cache.url === url && cache.themes ? cache : null;
}

async function fetchRegistry({ url, force = false } = {}) {
  const settings = await getSettings();
  const registryUrl = normalizeRegistryUrl(url || settings.communityRegistryUrl);
  const cached = await readCache(registryUrl);
  const now = Date.now();
  if (!force && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached, cached: true, browseUrl: registryBrowseUrl(registryUrl) };
  }

  const headers = { Accept: "application/json" };
  if (cached?.etag) headers["If-None-Match"] = cached.etag;
  try {
    const response = await fetch(registryUrl, { headers, cache: "no-store" });

    if (response.status === 304 && cached) {
      const refreshed = { ...cached, fetchedAt: now };
      await chrome.storage.local.set({ [CACHE_KEY]: refreshed });
      return { ...refreshed, cached: true, browseUrl: registryBrowseUrl(registryUrl) };
    }
    if (!response.ok) {
      throw new Error(`GitHub registry request failed (${response.status}).`);
    }

    const payload = await response.json();
    const parsed = parseRegistryPayload(payload);
    const next = {
      url: registryUrl,
      etag: response.headers.get("etag") || "",
      fetchedAt: now,
      themes: parsed.themes,
      count: parsed.count,
      rejected: parsed.rejected,
      fallback: false
    };
    await chrome.storage.local.set({ [CACHE_KEY]: next });
    return { ...next, cached: false, browseUrl: registryBrowseUrl(registryUrl) };
  } catch (error) {
    if (cached) {
      return {
        ...cached,
        cached: true,
        stale: true,
        error: error.message,
        browseUrl: registryBrowseUrl(registryUrl)
      };
    }
    const bundledResponse = await fetch(chrome.runtime.getURL("community.default.json"));
    const bundled = parseRegistryPayload(await bundledResponse.json());
    return {
      url: registryUrl,
      fetchedAt: now,
      themes: bundled.themes,
      count: bundled.count,
      rejected: bundled.rejected,
      cached: false,
      fallback: true,
      error: error.message,
      browseUrl: registryBrowseUrl(registryUrl)
    };
  }
}

async function lookupThemes(rawHandles) {
  const settings = await getSettings();
  if (!settings.communityEnabled) return { themes: {}, resolved: [] };
  const mutedHandles = new Set(settings.mutedHandles);
  const mutedEffects = new Set(settings.mutedEffects);
  const handles = [...new Set((Array.isArray(rawHandles) ? rawHandles : [])
    .map(normalizeHandle)
    .filter((handle) => handle && !mutedHandles.has(handle)))]
    .slice(0, 150);
  if (!handles.length) return { themes: {}, resolved: [] };

  const registry = await fetchRegistry();
  const themes = {};
  for (const handle of handles) {
    const theme = registry.themes[handle];
    if (theme && !mutedEffects.has(theme.effect)) themes[handle] = theme;
  }
  return { themes, resolved: handles };
}

async function status(force = false, url) {
  const registry = await fetchRegistry({ force, url });
  return {
    online: true,
    url: registry.url,
    browseUrl: registry.browseUrl,
    count: registry.count,
    rejected: registry.rejected,
    fetchedAt: registry.fetchedAt,
    cached: registry.cached,
    stale: Boolean(registry.stale),
    fallback: Boolean(registry.fallback),
    error: registry.error || null
  };
}

async function handleMessage(message) {
  switch (message?.type) {
    case "XSCAPE_LOOKUP_THEMES":
      return { ok: true, ...(await lookupThemes(message.handles)) };
    case "XSCAPE_REGISTRY_STATUS":
      return { ok: true, status: await status(Boolean(message.force), message.url) };
    case "XSCAPE_CLEAR_COMMUNITY_CACHE":
      await chrome.storage.local.remove(CACHE_KEY);
      return { ok: true };
    case "XSCAPE_NORMALIZE_REGISTRY_URL":
      return {
        ok: true,
        url: normalizeRegistryUrl(message.url),
        browseUrl: registryBrowseUrl(message.url)
      };
    default:
      return { ok: false, error: "Unknown Xscape message." };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      console.error("[Xscape GitHub Registry]", error);
      sendResponse({ ok: false, error: error?.message || "Unexpected registry error." });
    });
  return true;
});
