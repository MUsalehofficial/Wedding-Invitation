#!/usr/bin/env node
/**
 * Writes SUPABASE_PROJECT_REF from .env into supabase/config.toml as project_id (for local `supabase` CLI).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const configPath = path.join(root, "supabase", "config.toml");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env — copy .env.example and fill SUPABASE_PROJECT_REF.");
  process.exit(1);
}

const raw = fs.readFileSync(envPath, "utf8");
const line = raw.split(/\r?\n/).find((l) => l.match(/^\s*SUPABASE_PROJECT_REF\s*=/));
if (!line) {
  console.error(".env must contain SUPABASE_PROJECT_REF=<Reference ID>");
  process.exit(1);
}
let ref = line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
if (!ref || ref === "YOUR_PROJECT_REF" || ref === "REPLACE_WITH_YOUR_PROJECT_REF") {
  console.error('Set SUPABASE_PROJECT_REF in .env to your project Reference ID (not "YOUR_PROJECT_REF").');
  process.exit(1);
}

let config = fs.readFileSync(configPath, "utf8");
if (!/^project_id\s*=/m.test(config)) {
  console.error(`No project_id line in ${configPath}`);
  process.exit(1);
}
config = config.replace(/^project_id\s*=\s*".*"$/m, `project_id = "${ref}"`);
fs.writeFileSync(configPath, config);
console.log(`Updated supabase/config.toml project_id → ${ref}`);
