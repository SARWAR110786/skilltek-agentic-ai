// Paste this into Extensions → Apps Script of your "Skilltek Applications" Google Sheet.
// Then: Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone.
const HEADERS = ["submittedAt", "name", "phone", "email", "background", "experience", "message", "program", "source"];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow(HEADERS.map((h) => data[h] || ""));
  return ContentService.createTextOutput("ok");
}
