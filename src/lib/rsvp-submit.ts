import { z } from "zod";

const edgeBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  attending: z.enum(["yes", "no"]),
  guests: z.number().int().min(0).max(20),
  message: z.string().max(1000).optional(),
});

export type SubmitRsvpInput = z.infer<typeof edgeBodySchema>;

/**
 * Saves RSVP via Supabase Edge (`submit-rsvp`). Sheets + Google credentials stay on Supabase only.
 * Requires `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (public “anon” keys per Supabase; not webhook/Apps Script URLs).
 */
export async function submitRsvpViaSupabase(body: SubmitRsvpInput): Promise<void> {
  const base = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
  const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

  if (!base || !key) {
    throw new Error("__RSVP_NO_BACKEND__");
  }

  const url = `${base}/functions/v1/submit-rsvp`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
    },
    body: JSON.stringify(body),
    mode: "cors",
  });

  const raw = await response.text();
  let result: { success?: boolean; error?: string } | null = null;
  try {
    result = JSON.parse(raw) as { success?: boolean; error?: string };
  } catch {
    /* HTML / gateway */
  }

  if (!response.ok || !result?.success) {
    const err = result?.error?.trim();
    if (err) throw new Error(`__API__:${err}`);
    const trimmed = raw.trim();
    if (!result && (trimmed.startsWith("<") || trimmed.includes("<!DOCTYPE"))) {
      throw new Error("__RSVP_HTML__");
    }
    throw new Error(`Request failed (${response.status})`);
  }
}
