/** Fallback when CI forgets `VITE_RSVP_SCRIPT_URL`; file is deployed from `public/`. */

const CONFIG_NAME = "rsvp-config.json";

export async function resolveRsvpScriptUrl(): Promise<string | undefined> {
  const fromEnv = (import.meta.env.VITE_RSVP_SCRIPT_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv;

  try {
    const baseRaw = import.meta.env.BASE_URL || "/";
    const base = `${baseRaw.replace(/\/?$/, "")}/`;
    const res = await fetch(`${base}${CONFIG_NAME}`);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { scriptUrl?: unknown };
    const u = typeof data.scriptUrl === "string" ? data.scriptUrl.trim() : "";
    if (!/^https:\/\/script\.google\.com\/macros\//.test(u)) return undefined;
    return u;
  } catch {
    return undefined;
  }
}
