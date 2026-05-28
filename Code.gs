// Liking Likelihood — Apps Script backend
// Paste this into a Google Apps Script project bound to a Google Sheet.
// Deploy as a Web app (Execute as: Me, Who has access: Anyone).
// Put the resulting /exec URL into the LOG_URL constants in
// liking_likelihood.html and dashboard.html.

const SHEET_NAME = 'log';
const COLS = ['ts','room','player','event','game','round','correct','score','is_last'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    sheet.appendRow([
      new Date(data.ts || Date.now()),
      data.room    || '',
      data.player  || '',
      data.event   || '',
      data.game     !== undefined ? data.game    : '',
      data.round    !== undefined ? data.round   : '',
      data.correct  !== undefined ? data.correct : '',
      data.score    !== undefined ? data.score   : '',
      data.is_last  !== undefined ? data.is_last : ''
    ]);
    return json_({ok: true});
  } catch (err) {
    return json_({error: String(err)});
  }
}

function doGet(e) {
  const room = (e.parameter.room || '').trim();
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  const out = [];
  if (last >= 2 && room) {
    const values = sheet.getRange(2, 1, last - 1, COLS.length).getValues();
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][1]) === room) {
        const row = {};
        for (let c = 0; c < COLS.length; c++) row[COLS[c]] = values[i][c];
        out.push(row);
      }
    }
  }
  return json_({rows: out});
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLS);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
