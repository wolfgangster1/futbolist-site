/**
 * The Futbolist — Apply Form → Google Sheets
 * Google Apps Script (Apps Script web app)
 *
 * SETUP: see APPLY-SETUP.md for step-by-step deployment.
 *
 * Once deployed as a web app this script receives a POST from the
 * Cloudflare Worker and appends one row per application to your Sheet.
 */

// The columns written to the Sheet, in order.
var COLUMNS = [
  'Timestamp',
  'Name',
  'Email',
  'Location',
  'Position',
  'Level',
  'Last Club',
  'Last Season',
  'Free Agent?',
  'Can Relocate?',
  'Available From',
  'Film Link',
  'Extra Link',
  'Why Futbolist?',
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
    var data   = JSON.parse(e.postData.contents);
    var sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

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
      sanitizeCell(data.name),
      sanitizeCell(data.email),
      sanitizeCell(data.location),
      sanitizeCell(data.position),
      sanitizeCell(data.level),
      sanitizeCell(data.last_club),
      sanitizeCell(data.last_season),
      sanitizeCell(data.free_agent),
      sanitizeCell(data.relocate),
      sanitizeCell(data.available_from),
      sanitizeCell(data.film_link),
      sanitizeCell(data.extra_link),
      sanitizeCell(data.why),
      sanitizeCell(data.source || 'apply-form'),
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

// Optional: test this function manually in the Apps Script editor
// before going live (Run → doTest).
function doTest() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        name: 'Test Player',
        email: 'test@example.com',
        location: 'New York, USA',
        position: 'Centre Forward',
        level: 'Professional (Div 2 / Second Tier)',
        last_club: 'FC Test',
        last_season: '2024–25',
        free_agent: 'Yes',
        relocate: 'Yes',
        available_from: 'Immediately',
        film_link: 'https://youtube.com/watch?v=example',
        extra_link: '',
        why: 'Because this is where unsigned becomes signed.',
        source: 'apply-form',
      }),
    },
  };
  Logger.log(doPost(fake).getContent());
}
