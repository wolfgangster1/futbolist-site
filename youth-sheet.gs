/**
 * The Futbolist — Youth Academy Registration → Google Sheets
 * Google Apps Script (Apps Script web app)
 *
 * SETUP:
 *  1. Create a new Google Sheet named "Futbolist — Youth Academy Registrations"
 *  2. Extensions → Apps Script → paste this file → Save
 *  3. Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Copy the Web app URL and add it as a Secret in your Cloudflare Worker:
 *     Name: YOUTH_SHEET_URL
 *  5. Redeploy the Worker (wrangler deploy)
 *
 * Every time you edit this script, create a NEW deployment — don't re-deploy.
 */

var COLUMNS = [
  'Timestamp',
  'Parent Name',
  'Phone',
  'Email',
  'Player Name',
  'Age',
  'Training Type',
  'Preferred Coach',
  'Availability',
  'Source',
];

/**
 * Prefix any cell that starts with a formula trigger character so Google Sheets
 * never executes user-supplied content as a formula.
 */
function sanitizeCell(value) {
  var s = String(value === null || value === undefined ? '' : value);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  try {
    var data  = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Write header row once (if the sheet is empty)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
      sheet.getRange(1, 1, 1, COLUMNS.length)
           .setFontWeight('bold')
           .setBackground('#0E0E0F')
           .setFontColor('#F4EFE4');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date().toISOString(),
      sanitizeCell(data.parent_name),
      sanitizeCell(data.phone),
      sanitizeCell(data.email),
      sanitizeCell(data.player_name),
      sanitizeCell(data.age),
      sanitizeCell(data.training_type),
      sanitizeCell(data.preferred_coach),
      sanitizeCell(data.availability),
      sanitizeCell(data.source || 'youth-form'),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test this manually in the Apps Script editor before going live:
// Select doTest from the dropdown → Run
function doTest() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        parent_name:     'Jane Smith',
        phone:           '(555) 123-4567',
        email:           'jane@example.com',
        player_name:     'Alex Smith',
        age:             '10',
        training_type:   'Small Group — $50/player',
        preferred_coach: '',
        availability:    'Weekday evenings, Saturday mornings',
        source:          'youth-form',
      }),
    },
  };
  Logger.log(doPost(fake).getContent());
}
