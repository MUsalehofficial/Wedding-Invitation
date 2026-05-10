/**
 * RSVP Web App — paste into the script project bound to your Google Sheet,
 * then Deploy → Web app:
 *   Execute as: Me
 *   Who has access: Anyone  (must allow anonymous — or guests get a Google sign-in wall)
 *
 * Optional spam guard: Project Settings → Script properties → add RSVP_WEBHOOK_SECRET
 * (same value as VITE_RSVP_WEBHOOK_SECRET in your site build). If set, POST must include it.
 *
 * Frontend posts JSON in the body. Preferred: Content-Type text/plain + raw JSON (simple request).
 * Still accepts application/x-www-form-urlencoded as payload=%7B... for older clients.
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
  /** 1) Raw POST body — frontend may send Content-Type text/plain JSON (simple CORS-safe request). */
  var rawBody = e.postData && e.postData.contents;
  if (rawBody && typeof rawBody === "string") {
    var t = rawBody.replace(/^\uFEFF/, "").trim();
    if (t.charAt(0) === "{") return t;
    if (t.indexOf("payload=") === 0) {
      try {
        return decodeURIComponent(t.substring("payload=".length).replace(/\+/g, "%20"));
      } catch (_) {}
    }
  }

  /** 2) Parsed form fields (sometimes wrongly contains full "payload=..." — unwrap it). */
  var v = e.parameter && e.parameter.payload;
  if (v != null && String(v).trim() !== "") {
    var pv = String(v).trim();
    if (pv.indexOf("payload=") === 0) {
      try {
        return decodeURIComponent(pv.substring("payload=".length).replace(/\+/g, "%20"));
      } catch (_) {}
    }
    return pv;
  }

  if (e.parameters && e.parameters.payload) {
    var arr = e.parameters.payload;
    if (arr && arr.length && String(arr[0]).trim() !== "") {
      var s = String(arr[0]).trim();
      if (s.indexOf("payload=") === 0) {
        try {
          return decodeURIComponent(s.substring("payload=".length).replace(/\+/g, "%20"));
        } catch (_) {}
      }
      return s;
    }
  }

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
