/**
 * RSVP → Google Sheets (your Drive spreadsheet).
 *
 * Credentials live ONLY in Supabase Edge Function secrets (Dashboard), never in GitHub:
 * - GOOGLE_SERVICE_ACCOUNT_JSON — full JSON of a GCP service account (Sheets API enabled)
 * - RSVP_SPREADSHEET_ID — ID from /d/<id>/edit or full URL
 * - RSVP_SHEET_TAB_NAME — optional; if omitted, first tab is used
 *
 * Share the spreadsheet with the service account client_email (Editor).
 *
 * Redeploy after edits: Supabase Dashboard → Edge Functions → deploy, or `npm run deploy:submit-rsvp`
 */
import { GoogleAuth } from "google-auth-library";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

/** Bump whenever you redeploy — if errors don’t include this ID, deploy didn’t ship */
const EDGE_BUILD_ID = "submit-rsvp-2026-02-10c";

/** Google requires single-quoted titles when names have spaces/special chars */
function a1Range(sheetTitle: string, inner: string): string {
  const esc = sheetTitle.replace(/'/g, "''");
  return `'${esc}'!${inner}`;
}

function spreadsheetValuesPath(spreadsheetId: string, sheetTitle: string, innerRange: string): string {
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(a1Range(sheetTitle, innerRange))}`;
}

/** Accept pasted URL or bare ID; strip newline/whitespace pasted from Docs */
function normalizeSpreadsheetId(raw: string): string {
  const trimmed = raw.trim().replace(/\r|\n/g, "").replace(/^["'`]+|["'`]+$/g, "");
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];
  return trimmed.replace(/\s+/g, "");
}

function extractServiceAccountEmail(credentialsJson: string): string {
  try {
    const email = (JSON.parse(credentialsJson) as { client_email?: string }).client_email;
    return typeof email === "string" ? email : "";
  } catch {
    return "";
  }
}

function errMsg(message: string): string {
  return `${message} [${EDGE_BUILD_ID}]`;
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
  if (!token) throw new Error(errMsg("Unable to obtain Google access token — check GOOGLE_SERVICE_ACCOUNT_JSON"));
  return token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const credentialsJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")?.trim();
    const spreadsheetId = normalizeSpreadsheetId(Deno.env.get("RSVP_SPREADSHEET_ID") ?? "");
    const sheetTabConfigured = (Deno.env.get("RSVP_SHEET_TAB_NAME") ?? "")
      .trim()
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/\r|\n/g, "");

    if (!credentialsJson?.length) {
      throw new Error(errMsg("GOOGLE_SERVICE_ACCOUNT_JSON is not configured"));
    }
    if (!spreadsheetId.length) {
      throw new Error(errMsg("RSVP_SPREADSHEET_ID is not configured"));
    }

    const raw = await req.json().catch(() => null);
    if (raw && typeof raw === "object" && String((raw as { website?: unknown }).website ?? "").trim() !== "") {
      return new Response(JSON.stringify({ success: true, build: EDGE_BUILD_ID }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json", "x-submit-rsvp-build": EDGE_BUILD_ID },
      });
    }
    if (!isRsvpBody(raw)) {
      return new Response(JSON.stringify({ success: false, error: errMsg("Invalid RSVP payload") }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getSheetsAccessToken(credentialsJson);
    const authHeader = { Authorization: `Bearer ${token}` };
    const saEmail = extractServiceAccountEmail(credentialsJson);
    const shareHint = saEmail ? ` Share spreadsheet with Editor: ${saEmail}.` : "";

    const metaUrl =
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties(title)`;
    const metaRes = await fetch(metaUrl, { headers: authHeader });
    const metaText = await metaRes.text();

    if (!metaRes.ok) {
      if (metaRes.status === 404) {
        throw new Error(
          errMsg(
            `Spreadsheet metadata 404 — wrong RSVP_SPREADSHEET_ID, spreadsheet deleted/trashed, OR not shared with the service account.${shareHint}`,
          ),
        );
      }
      if (metaRes.status === 403) {
        throw new Error(errMsg(`Spreadsheet metadata 403.${shareHint}`));
      }
      throw new Error(errMsg(`Spreadsheet metadata [${metaRes.status}]: ${metaText.slice(0, 500)}`));
    }

    let metaParsed: { sheets?: Array<{ properties?: { title?: string } }> };
    try {
      metaParsed = JSON.parse(metaText);
    } catch {
      throw new Error(errMsg("Could not parse Google spreadsheet metadata."));
    }

    const tabTitles =
      metaParsed.sheets?.map((s) => s.properties?.title).filter((t): t is string => !!t?.length) ?? [];
    let sheetTab = sheetTabConfigured;
    if (!sheetTab.length) {
      sheetTab = tabTitles[0] ?? "";
    }
    if (!sheetTab.length) {
      throw new Error(errMsg("Spreadsheet has no worksheets."));
    }
    if (!tabTitles.includes(sheetTab)) {
      throw new Error(
        errMsg(
          `Tab "${sheetTab}" not found. Existing: ${tabTitles.join(", ") || "(none)"}. Set RSVP_SHEET_TAB_NAME or remove it.`,
        ),
      );
    }

    /** Read cell A1 only — minimal values call; uses quoted A1 notation */
    const probeUrl = spreadsheetValuesPath(spreadsheetId, sheetTab, "A1");
    const probeRes = await fetch(probeUrl, { headers: authHeader });
    const probeText = await probeRes.text();

    if (!probeRes.ok) {
      throw new Error(
        errMsg(
          `Values API [${probeRes.status}] for ${a1Range(sheetTab, "A1")}: ${probeText.slice(0, 400)} (metadata OK → check tab name spelling & redeploy Edge function if this message misses [${EDGE_BUILD_ID}]).`,
        ),
      );
    }

    let a1WasEmptyOrHeadersMissing = false;
    try {
      const probeJson = JSON.parse(probeText) as { values?: string[][] };
      const v = probeJson.values?.[0]?.[0];
      a1WasEmptyOrHeadersMissing = v === undefined || v === null || v === "" || v !== "Submitted At";
    } catch {
      a1WasEmptyOrHeadersMissing = true;
    }

    if (a1WasEmptyOrHeadersMissing) {
      const putBase =
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(a1Range(sheetTab, "A1:F1"))}`;
      const putUrlFinal = `${putBase}?valueInputOption=RAW`;
      const putRes = await fetch(putUrlFinal, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          values: [["Submitted At", "Name", "Attending", "Guests", "Message", "User Agent"]],
        }),
      });
      if (!putRes.ok) {
        const t = await putRes.text();
        throw new Error(errMsg(`Header row write failed [${putRes.status}]: ${t.slice(0, 400)}`));
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

    const appendBase =
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(a1Range(sheetTab, "A:F"))}:append`;
    const appendUrl = `${appendBase}?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const appendRes = await fetch(appendUrl, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    });

    if (!appendRes.ok) {
      const t = await appendRes.text();
      throw new Error(errMsg(`Append failed [${appendRes.status}]: ${t.slice(0, 400)}`));
    }

    return new Response(JSON.stringify({ success: true, build: EDGE_BUILD_ID }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-submit-rsvp-build": EDGE_BUILD_ID,
      },
    });
  } catch (err) {
    console.error("submit-rsvp error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    const out = msg.includes(`[${EDGE_BUILD_ID}]`) ? msg : errMsg(msg);
    return new Response(JSON.stringify({ success: false, error: out }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-submit-rsvp-build": EDGE_BUILD_ID,
      },
    });
  }
});
