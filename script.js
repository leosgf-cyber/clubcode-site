(() => {
  // ⚠ TROCAR pelo URL do deploy do Apps Script (Web App).
  // Ver apps-script/Code.gs e o passo "Deploy as Web App" no README.
  const WEBHOOK_URL = 'COLE_AQUI_A_URL_DO_APPS_SCRIPT';

  const form = document.getElementById('interest-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const idleSpan = submitBtn.querySelector('[data-state="idle"]');
  const loadingSpan = submitBtn.querySelector('[data-state="loading"]');
  const message = document.getElementById('form-message');

  const setMessage = (text, tone) => {
    message.textContent = text;
    message.dataset.tone = tone;
    message.classList.remove('hidden');
  };

  const clearMessage = () => {
    message.classList.add('hidden');
    message.textContent = '';
    delete message.dataset.tone;
  };

  const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading;
    idleSpan.classList.toggle('hidden', isLoading);
    loadingSpan.classList.toggle('hidden', !isLoading);
  };

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    const data = new FormData(form);
    const nome = String(data.get('nome') || '').trim();
    const email = String(data.get('email') || '').trim();
    const consent = form.consent.checked;
    const honeypot = String(data.get('company') || '').trim();

    if (honeypot) {
      // bot detectado — finge sucesso e ignora
      setMessage('tá feito. te vejo no próximo.', 'success');
      form.reset();
      return;
    }

    if (!nome) {
      setMessage('falta o nome.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      setMessage('email não tá batendo. confere?', 'error');
      return;
    }
    if (!consent) {
      setMessage('precisa marcar o consentimento.', 'error');
      return;
    }

    if (WEBHOOK_URL.startsWith('COLE_AQUI')) {
      setMessage('webhook não configurado. cola a url do apps script em script.js.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = new URLSearchParams({
        nome,
        email,
        consent: consent ? '1' : '0',
        source: 'clubcode.com.br',
        user_agent: navigator.userAgent || '',
      });

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: payload,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let ok = true;
      const text = await res.text();
      try {
        const j = JSON.parse(text);
        ok = j.status === 'ok' || j.ok === true;
      } catch { /* resposta não-JSON: assume ok se status http foi 200 */ }

      if (!ok) throw new Error('resposta não-ok do servidor');

      setMessage('tá feito. te vejo no próximo.', 'success');
      form.reset();
    } catch (err) {
      console.error('[clubcode] form submit:', err);
      setMessage('algo deu errado. tenta de novo em 1 min?', 'error');
    } finally {
      setLoading(false);
    }
  });
})();
