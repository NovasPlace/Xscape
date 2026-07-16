import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseRegistryPayload } from "../extension/registry-core.js";

export function validateFile(file) {
  const payload = JSON.parse(fs.readFileSync(file, "utf8"));
  const result = parseRegistryPayload(payload);
  if (result.rejected) throw new Error(`${result.rejected} invalid theme entr${result.rejected === 1 ? "y" : "ies"}.`);
  if (!result.count) throw new Error("Registry must contain at least one valid theme.");
  return result;
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === entry) {
  const file = path.resolve(process.argv[2] || "themes/community.json");
  const result = validateFile(file);
  console.log(`Valid registry: ${result.count} theme(s), ${result.rejected} rejected.`);
}
