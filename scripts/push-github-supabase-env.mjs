#!/usr/bin/env node
/**
 * Copies Supabase-related keys from .env → GitHub repo secrets/vars (needs `gh auth login`).
 * Usage: npm run github:env:publish
 *
 * Sends: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY (secrets),
 *        SUPABASE_PROJECT_REF (repository variable — not secret).
 * Optional: SUPABASE_ACCESS_TOKEN (sbp_...) in .env triggers secret set for CI deploy workflow.
 *
 * Prefer `gh repo set-default` matching this repo beforehand.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");

function gh(args) {
  const r = spawnSync("gh", args, { cwd: root, encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error((r.stderr || r.stdout || "gh failed").trim() || `exit ${r.status}`);
  }
  return (r.stdout || "").trim();
}

function parseDotEnv(contents) {
  const out = {};
  for (const line of contents.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

try {
  gh(["auth", "status"]);
} catch (e) {
  console.error("GitHub CLI not logged in — run: gh auth login");
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  console.error("Missing .env");
  process.exit(1);
}

const envMap = parseDotEnv(fs.readFileSync(envPath, "utf8"));

const viteUrl = envMap.VITE_SUPABASE_URL?.trim();
const viteKey = envMap.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const projRef = envMap.SUPABASE_PROJECT_REF?.trim();
const sbp = envMap.SUPABASE_ACCESS_TOKEN?.trim();

if (!viteUrl || !viteKey) {
  console.error("Fill VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env first.");
  process.exit(1);
}

console.log(`Target repo: ${gh(["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"])}`);

for (const [name, val] of [
  ["VITE_SUPABASE_URL", viteUrl],
  ["VITE_SUPABASE_PUBLISHABLE_KEY", viteKey],
]) {
  gh(["secret", "set", name, "--body", val]);
  console.log(`Set secret ${name}`);
}

if (sbp?.startsWith("sbp_")) {
  gh(["secret", "set", "SUPABASE_ACCESS_TOKEN", "--body", sbp]);
  console.log("Set secret SUPABASE_ACCESS_TOKEN (CI Edge deploy)");
} else {
  console.log("Skip SUPABASE_ACCESS_TOKEN — add sbp_* to .env to publish, or: gh secret set SUPABASE_ACCESS_TOKEN --body <sbp_...>");
}

if (projRef && !/^(YOUR_PROJECT_REF|REPLACE_WITH_YOUR_PROJECT_REF)$/i.test(projRef)) {
  try {
    gh(["variable", "set", "SUPABASE_PROJECT_REF", "--body", projRef]);
    console.log("Set variable SUPABASE_PROJECT_REF");
  } catch {
    gh(["secret", "set", "SUPABASE_PROJECT_REF", "--body", projRef]);
    console.log("Set secret SUPABASE_PROJECT_REF (fallback)");
  }
} else {
  console.log(
    "::warning::Set SUPABASE_PROJECT_REF in .env (Reference ID), or set repo variable/supabase-submit-rsvp workflow will skip CI deploy.",
  );
}

console.log("Done — push to main to rebuild Pages / deploy Edge (if CI secrets set).");
