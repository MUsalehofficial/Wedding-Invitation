import { corsHeaders } from "@supabase/supabase-js/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";
const SHEET_NAME = "RSVPs";

interface RsvpBody {
  name: string;
  attending: "yes" | "no";
  guests: number;
  message?: string;
}

function isRsvpBody(v: unknown): v is RsvpBody {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.name === "string" &&
    o.name.trim().length > 0 &&
    o.name.length <= 200 &&
    (o.attending === "yes" || o.attending === "no") &&
    typeof o.guests === "number" &&
    Number.isFinite(o.guests) &&
    o.guests >= 0 &&
    o.guests <= 20 &&
    (o.message === undefined || (typeof o.message === "string" && o.message.length <= 1000))
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    const SHEET_ID = Deno.env.get("RSVP_SHEET_ID");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!GOOGLE_SHEETS_API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY is not configured");
    if (!SHEET_ID) throw new Error("RSVP_SHEET_ID is not configured");

    const raw = await req.json().catch(() => null);
    if (!isRsvpBody(raw)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid RSVP payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const timestamp = new Date().toISOString();
    const ip = req.headers.get("x-forwarded-for") ?? "";
    const userAgent = req.headers.get("user-agent") ?? "";

    // Ensure header row exists (first append; safe to call repeatedly only once)
    // We attempt to append the row; if the sheet/tab is empty Google adds rows after the last filled cell.
    // We pre-write headers using a values:get + values:update only when sheet is empty.
    const checkRange = `${SHEET_NAME}!A1:F1`;
    const checkUrl = `${GATEWAY_URL}/spreadsheets/${SHEET_ID}/values/${checkRange}`;
    const checkRes = await fetch(checkUrl, {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
      },
    });

    if (!checkRes.ok) {
      const txt = await checkRes.text();
      throw new Error(`Sheets read failed [${checkRes.status}]: ${txt}`);
    }
    const checkData = await checkRes.json();
    const hasHeader =
      Array.isArray(checkData?.values) &&
      checkData.values.length > 0 &&
      Array.isArray(checkData.values[0]) &&
      checkData.values[0][0] === "Submitted At";

    if (!hasHeader) {
      const headerUrl = `${GATEWAY_URL}/spreadsheets/${SHEET_ID}/values/${checkRange}?valueInputOption=RAW`;
      const headerRes = await fetch(headerUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [["Submitted At", "Name", "Attending", "Guests", "Message", "User Agent"]],
        }),
      });
      if (!headerRes.ok) {
        const txt = await headerRes.text();
        throw new Error(`Sheets header write failed [${headerRes.status}]: ${txt}`);
      }
    }

    // Append the RSVP row
    const appendRange = `${SHEET_NAME}!A:F`;
    const appendUrl = `${GATEWAY_URL}/spreadsheets/${SHEET_ID}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const row = [
      timestamp,
      raw.name.trim(),
      raw.attending === "yes" ? "Joyfully accepts" : "Regretfully declines",
      raw.attending === "yes" ? raw.guests : 0,
      (raw.message ?? "").trim(),
      `${userAgent} | ${ip}`,
    ];

    const appendRes = await fetch(appendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!appendRes.ok) {
      const txt = await appendRes.text();
      throw new Error(`Sheets append failed [${appendRes.status}]: ${txt}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("submit-rsvp error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
