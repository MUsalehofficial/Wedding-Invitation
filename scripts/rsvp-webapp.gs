/**
 * RSVP Web App — paste into the script project bound to your Google Sheet,
 * then Deploy → Web app:
 *   Execute as: Me
 *   Who has access: Anyone  (must allow anonymous — or guests get a Google sign-in wall)
 *
 * Optional spam guard: Project Settings → Script properties → add RSVP_WEBHOOK_SECRET
 * (same value as VITE_RSVP_WEBHOOK_SECRET in your site build). If set, POST must include it.
 *
 * Frontend posts: application/x-www-form-urlencoded — field "payload" = JSON string.
 */
function doPost(e) {
  try {
    const body = parseBody_(e);

    const expected = PropertiesService.getScriptProperties().getProperty(
      "RSVP_WEBHOOK_SECRET",
    );
    if (expected) {
      const got = String(body.secret || "");
      if (got !== expected) {
        return json_({ success: false, error: "Unauthorized" });
      }
    }

    // Honeypot (field name matches RsvpForm): bots often fill hidden inputs — do not persist.
    if (String(body.website || "").trim() !== "") {
      return json_({ success: true });
    }

    var name = String(body.name || "").trim();
    var attending =
      body.attending === "yes" ? "yes" : body.attending === "no" ? "no" : "";
    var guests = Number(body.guests != null ? body.guests : 0);
    var message = String(body.message || "").trim();

    if (!name || !attending || !isFinite_(guests) || guests < 0 || guests > 20) {
      return json_({ success: false, error: "Invalid RSVP payload" }, 400);
    }

    var sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs") ||
      SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVPs");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Submitted At", "Name", "Attending", "Guests", "Message"]);
    }

    sheet.appendRow([new Date().toISOString(), name, attending, guests, message]);
    return json_({ success: true }, 200);
  } catch (err) {
    return json_({ success: false, error: String(err) }, 500);
  }
}

function parseBody_(e) {
  /** Raw JSON string extracted from payload (not yet JSON.parse'd). */
  var jsonSource = payloadStringBeforeParse_(e);
  if (!jsonSource || jsonSource.trim() === "") throw new Error("Missing JSON body");
  var parsed = tryParse_(jsonSource);
  if (!parsed) throw new Error("Invalid JSON in payload");
  return parsed;
}

/**
 * Frontend sends application/x-www-form-urlencoded: payload=<url-encoded-json>.
 * Sometimes GAS exposes this only on e.postData.contents as "payload=%7B%22name..."
 * — JSON.parse on that whole string throws (SyntaxError: Unexpected token 'p').
 */
function payloadStringBeforeParse_(e) {
  var v = e.parameter && e.parameter.payload;
  if (v != null && String(v).trim() !== "") return String(v);

  if (e.parameters && e.parameters.payload) {
    var arr = e.parameters.payload;
    if (arr && arr.length && String(arr[0]).trim() !== "") return String(arr[0]);
  }

  var raw = e.postData && e.postData.contents;
  if (!raw || typeof raw !== "string") return null;
  raw = raw.trim();

  var prefix = "payload=";
  if (raw.indexOf(prefix) === 0) {
    try {
      return decodeURIComponent(raw.substring(prefix.length).replace(/\+/g, "%20"));
    } catch (_) {
      return null;
    }
  }

  /** Body was posted as plain JSON string */
  if (raw.charAt(0) === "{") return raw;
  return null;
}

function tryParse_(s) {
  if (!s || typeof s !== "string") return null;
  try {
    return JSON.parse(s);
  } catch (_) {
    return null;
  }
}

function isFinite_(n) {
  return typeof n === "number" && isFinite(n);
}

function json_(obj /*, status */) {
  // Apps Script ignores HTTP status codes for web apps — keep success flag in JSON.
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
