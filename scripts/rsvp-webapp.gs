/**
 * RSVP Web App — paste into the script project bound to your Google Sheet,
 * Deploy → Web app → Execute as: Me → Who has access: Anyone (with secret later if you want).
 *
 * Frontend posts body: application/x-www-form-urlencoded — field "payload" = JSON string.
 */
function doPost(e) {
  try {
    const body = parseBody_(e);

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
  var fromParam = tryParse_(e.parameter && e.parameter.payload);
  if (fromParam) return fromParam;
  var fromPost = tryParse_(e.postData && e.postData.contents);
  if (fromPost) return fromPost;
  throw new Error("Missing JSON body");
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
