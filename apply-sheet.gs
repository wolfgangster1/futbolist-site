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
      data.name          || '',
      data.email         || '',
      data.location      || '',
      data.position      || '',
      data.level         || '',
      data.last_club     || '',
      data.last_season   || '',
      data.free_agent    || '',
      data.relocate      || '',
      data.available_from|| '',
      data.film_link     || '',
      data.extra_link    || '',
      data.why           || '',
      data.source        || 'apply-form',
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
