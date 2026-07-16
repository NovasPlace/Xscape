import assert from "node:assert/strict";
import fs from "node:fs";
import {
  normalizeRegistryUrl,
  parseRegistryPayload,
  registryBrowseUrl
} from "../extension/registry-core.js";

const payload = JSON.parse(fs.readFileSync(new URL("../themes/community.json", import.meta.url), "utf8"));
const parsed = parseRegistryPayload(payload);
assert.equal(parsed.count, 1);
assert.equal(parsed.themes.novasplace.effect, "wave");
assert.equal(
  normalizeRegistryUrl("https://github.com/NovasPlace/Xscape/blob/main/themes/community.json"),
  "https://raw.githubusercontent.com/NovasPlace/Xscape/main/themes/community.json"
);
assert.equal(
  registryBrowseUrl("https://raw.githubusercontent.com/NovasPlace/Xscape/main/themes/community.json"),
  "https://github.com/NovasPlace/Xscape/blob/main/themes/community.json"
);
assert.throws(() => normalizeRegistryUrl("https://example.com/community.json"));
console.log("GitHub registry tests passed.");
