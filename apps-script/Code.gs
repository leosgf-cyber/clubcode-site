// club·code — webhook da lista de interesse
// Atrele este script a uma planilha Google. Deploy como "Web App".
// Execute as: Me. Who has access: Anyone.

const SHEET_NAME = 'Lista';
const HEADERS = ['timestamp', 'nome', 'email', 'consentimento', 'source', 'user_agent'];

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    const nome = String(p.nome || '').trim();
    const email = String(p.email || '').trim().toLowerCase();
    const consent = p.consent === '1' || p.consent === 'true' || p.consent === true;
    const source = String(p.source || '').trim();
    const userAgent = String(p.user_agent || '').trim().substring(0, 500);

    if (!nome) return jsonOut_({ status: 'error', message: 'nome obrigatório' });
    if (!isValidEmail_(email)) return jsonOut_({ status: 'error', message: 'email inválido' });
    if (!consent) return jsonOut_({ status: 'error', message: 'consentimento obrigatório' });

    const sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      nome,
      email,
      consent ? 'sim' : 'não',
      source,
      userAgent,
    ]);

    return jsonOut_({ status: 'ok' });
  } catch (err) {
    return jsonOut_({ status: 'error', message: String(err) });
  }
}

function doGet() {
  return jsonOut_({
    status: 'ok',
    service: 'club·code waitlist',
    usage: 'POST nome=...&email=...&consent=1&source=...&user_agent=...',
  });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function isValidEmail_(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Util manual: rode uma vez no editor pra criar a aba "Lista" com cabeçalho.
function setupSheet() {
  getSheet_();
  Logger.log('Sheet "%s" pronta.', SHEET_NAME);
}
