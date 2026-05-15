// club·code — webhook da lista de interesse
// Atrele este script a uma planilha Google. Deploy como "Web App".
// Execute as: Me. Who has access: Anyone.

const SHEET_NAME = 'Lista';
const HEADERS = ['timestamp', 'nome', 'email', 'consentimento', 'source', 'user_agent'];
const MAIL_FROM_NAME = 'club·code';
const MAIL_SUBJECT = 'club·code — tá na lista';
const SITE_URL = 'https://clubcode.com.br';

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

    // Envio de confirmação. Não-bloqueante: se MailApp falhar (quota, etc),
    // a inscrição já foi gravada — usuário ainda recebe success no front.
    try {
      sendConfirmationEmail_(nome, email);
    } catch (mailErr) {
      Logger.log('mail send failed for %s: %s', email, mailErr);
    }

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

function sendConfirmationEmail_(nome, email) {
  const firstName = nome.split(' ')[0] || nome;
  const plain = [
    'oi ' + firstName + ',',
    '',
    'você tá na lista.',
    '',
    'quando o primeiro encontro rolar, você é a primeira leva a saber. nada de spam — só quando tiver coisa concreta acontecendo.',
    '',
    '[ club·code / brasil / 2026 ]',
    SITE_URL,
  ].join('\n');

  const html =
    '<div style="margin:0;padding:32px 24px;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;color:#1A1A1A;">' +
      '<div style="max-width:520px;margin:0 auto;">' +
        '<h1 style="font-size:36px;font-weight:700;line-height:1;letter-spacing:-0.04em;margin:0 0 32px;color:#1A1A1A;">' +
          'club' +
          '<span style="display:inline-block;width:14px;height:14px;background-color:#FF6B35;border-radius:50%;margin:0 4px;vertical-align:middle;"></span>' +
          'code' +
        '</h1>' +
        '<p style="font-size:18px;line-height:1.5;margin:0 0 16px;color:#1A1A1A;">oi ' + escapeHtml_(firstName) + ',</p>' +
        '<p style="font-size:18px;line-height:1.5;margin:0 0 16px;color:#1A1A1A;">você tá na lista.</p>' +
        '<p style="font-size:16px;line-height:1.6;margin:0 0 16px;color:#4A4A4A;">quando o primeiro encontro rolar, você é a primeira leva a saber. nada de spam — só quando tiver coisa concreta acontecendo.</p>' +
        '<p style="font-size:12px;line-height:1.5;margin:48px 0 4px;color:#8A857C;font-family:\'SFMono-Regular\',Menlo,Consolas,monospace;">[ club·code / brasil / 2026 ]</p>' +
        '<p style="font-size:12px;line-height:1.5;margin:0;color:#8A857C;font-family:\'SFMono-Regular\',Menlo,Consolas,monospace;">' +
          '<a href="' + SITE_URL + '" style="color:#8A857C;text-decoration:none;">clubcode.com.br</a>' +
        '</p>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: email,
    subject: MAIL_SUBJECT,
    body: plain,
    htmlBody: html,
    name: MAIL_FROM_NAME,
  });
}

function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Util manual: rode uma vez no editor pra criar a aba "Lista" com cabeçalho.
function setupSheet() {
  getSheet_();
  Logger.log('Sheet "%s" pronta.', SHEET_NAME);
}

// Util manual: testa o envio de email pra você (leosgf@gmail.com).
function testEmail() {
  sendConfirmationEmail_('Leo (teste)', 'leosgf@gmail.com');
  Logger.log('email de teste enviado pra leosgf@gmail.com');
}
