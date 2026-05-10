/**
 * RSVP → Google Sheets (your Drive spreadsheet).
 *
 * Credentials live ONLY in Supabase Edge Function secrets (Dashboard), never in GitHub:
 * - GOOGLE_SERVICE_ACCOUNT_JSON — full JSON of a GCP service account (Sheets API enabled)
 * - RSVP_SPREADSHEET_ID — only the ID string from:
 *     https://docs.google.com/spreadsheets/d/<THIS_PART>/edit (no slashes, no URL)
 * - RSVP_SHEET_TAB_NAME — optional, default "RSVPs" (must match a tab name exactly)
 *
 * Share the spreadsheet with the service account email (Editor).
 */
import { GoogleAuth } from "google-auth-library";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

/** Accept pasted full URL or bare ID — avoids NOT_FOUND when someone pastes /d/../edit instead of raw id */
function normalizeSpreadsheetId(raw: string): string {
  const trimmed = raw.trim().replace(/^["'`]+|["'`]+$/g, "");
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];
  return trimmed;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

async function getSheetsAccessToken(credentialsJson: string): Promise<string> {
  const credentials = JSON.parse(credentialsJson) as Record<string, unknown>;
  const auth = new GoogleAuth({
    credentials,
    scopes: [SHEETS_SCOPE],
  });
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  const token = typeof res === "string" ? res : res?.token;
  if (!token) throw new Error("Unable to obtain Google access token — check GOOGLE_SERVICE_ACCOUNT_JSON");
  return token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const credentialsJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")?.trim();
    const spreadsheetId = normalizeSpreadsheetId(Deno.env.get("RSVP_SPREADSHEET_ID") ?? "");
    const sheetTab = (Deno.env.get("RSVP_SHEET_TAB_NAME") ?? "RSVPs").trim().replace(/^["']|["']$/g, "");

    if (!credentialsJson?.length) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
    }
    if (!spreadsheetId.length) {
      throw new Error("RSVP_SPREADSHEET_ID is not configured");
    }

    const raw = await req.json().catch(() => null);
    if (raw && typeof raw === "object" && String((raw as { website?: unknown }).website ?? "").trim() !== "") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!isRsvpBody(raw)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid RSVP payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getSheetsAccessToken(credentialsJson);
    const authHeader = { Authorization: `Bearer ${token}` };

    const headerRange = `${sheetTab}!A1:F1`;
    const getUrl =
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(headerRange)}`;
    const getRes = await fetch(getUrl, { headers: authHeader });

    if (!getRes.ok) {
      const t = await getRes.text();
      if (getRes.status === 404) {
        throw new Error(
          "Sheet not found (404): fix Supabase secrets — RSVP_SPREADSHEET_ID must be ONLY the ID between /d/ and /edit (no quotes, no URL). RSVP_SHEET_TAB_NAME must match an existing tab (default RSVPs). Share the workbook with your service-account client_email as Editor.",
        );
      }
      if (getRes.status === 403) {
        throw new Error(
          "Sheet permission denied (403): open Google Sheet → Share → add client_email from GOOGLE_SERVICE_ACCOUNT_JSON as Editor.",
        );
      }
      if (getRes.status === 400 && /unable to parse range|unable to parse/i.test(t)) {
        throw new Error(
          `Tab not found — no sheet named "${sheetTab}". Set RSVP_SHEET_TAB_NAME in Supabase secrets to match a tab name exactly, or create that tab.`,
        );
      }
      throw new Error(`Sheets read failed [${getRes.status}]: ${t}`);
    }
    const getData = await getRes.json();
    const hasHeader =
      Array.isArray(getData?.values) &&
      getData.values.length > 0 &&
      Array.isArray(getData.values[0]) &&
      getData.values[0][0] === "Submitted At";

    if (!hasHeader) {
      const putUrl =
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(headerRange)}?valueInputOption=RAW`;
      const putRes = await fetch(putUrl, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          values: [["Submitted At", "Name", "Attending", "Guests", "Message", "User Agent"]],
        }),
      });
      if (!putRes.ok) {
        const t = await putRes.text();
        throw new Error(`Sheets header write failed [${putRes.status}]: ${t}`);
      }
    }

    const timestamp = new Date().toISOString();
    const ip = req.headers.get("x-forwarded-for") ?? "";
    const userAgent = req.headers.get("user-agent") ?? "";
    const row = [
      timestamp,
      raw.name.trim(),
      raw.attending === "yes" ? "Joyfully accepts" : "Regretfully declines",
      raw.attending === "yes" ? raw.guests : 0,
      (raw.message ?? "").trim(),
      `${userAgent} | ${ip}`,
    ];

    const appendRange = `${sheetTab}!A:F`;
    const appendUrl =
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(appendRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const appendRes = await fetch(appendUrl, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    });

    if (!appendRes.ok) {
      const t = await appendRes.text();
      throw new Error(`Sheets append failed [${appendRes.status}]: ${t}`);
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
