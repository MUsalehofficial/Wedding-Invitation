/** Fallback when CI omits env; `public/rsvp-config.json` ships with Pages. */

const CONFIG_NAME = "rsvp-config.json";

export type RsvpRuntimeConfig = {
  scriptUrl: string;
  /** Optional; Apps Script RSVP_WEBHOOK_SECRET — env wins over file when both set. */
  webhookSecret?: string;
};

export async function resolveRsvpSubmissionConfig(): Promise<RsvpRuntimeConfig | null> {
  const envUrl = (import.meta.env.VITE_RSVP_SCRIPT_URL as string | undefined)?.trim();
  const envSecret = (import.meta.env.VITE_RSVP_WEBHOOK_SECRET as string | undefined)?.trim();

  let fileUrl: string | undefined;
  let fileSecret: string | undefined;

  try {
    const baseRaw = import.meta.env.BASE_URL || "/";
    const base = `${baseRaw.replace(/\/?$/, "")}/`;
    const res = await fetch(`${base}${CONFIG_NAME}`);
    if (res.ok) {
      const data = (await res.json()) as { scriptUrl?: unknown; webhookSecret?: unknown };
      const u = typeof data.scriptUrl === "string" ? data.scriptUrl.trim() : "";
      if (/^https:\/\/script\.google\.com\/macros\//.test(u)) fileUrl = u;
      const w = typeof data.webhookSecret === "string" ? data.webhookSecret.trim() : "";
      if (w.length > 0) fileSecret = w;
    }
  } catch {
    /* offline / adblock — rely on env */
  }

  const scriptUrl = envUrl || fileUrl;
  if (!scriptUrl) return null;

  const webhookSecret = envSecret || fileSecret;
  return webhookSecret ? { scriptUrl, webhookSecret } : { scriptUrl };
}
