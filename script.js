/* shared spinner constants — usados pelo form (loading state) e pelo cc-spinner */
const VERBS = [
  "Accomplishing","Actioning","Actualizing","Architecting","Baking","Beaming","Beboppin'",
  "Befuddling","Billowing","Blanching","Bloviating","Boogieing","Boondoggling","Booping",
  "Bootstrapping","Brewing","Bunning","Burrowing","Calculating","Canoodling","Caramelizing",
  "Cascading","Catapulting","Cerebrating","Channeling","Channelling","Choreographing",
  "Churning","Clauding","Coalescing","Cogitating","Combobulating","Composing","Computing",
  "Concocting","Considering","Contemplating","Cooking","Crafting","Creating","Crunching",
  "Crystallizing","Cultivating","Deciphering","Deliberating","Determining","Dilly-dallying",
  "Discombobulating","Doing","Doodling","Drizzling","Ebbing","Effecting","Elucidating",
  "Embellishing","Enchanting","Envisioning","Evaporating","Fermenting","Fiddle-faddling",
  "Finagling","Flambéing","Flibbertigibbeting","Flowing","Flummoxing","Fluttering","Forging",
  "Forming","Frolicking","Frosting","Gallivanting","Galloping","Garnishing","Generating",
  "Gesticulating","Germinating","Gitifying","Grooving","Gusting","Harmonizing","Hashing",
  "Hatching","Herding","Honking","Hullaballooing","Hyperspacing","Ideating","Imagining",
  "Improvising","Incubating","Inferring","Infusing","Ionizing","Jitterbugging","Julienning",
  "Kneading","Leavening","Levitating","Lollygagging","Manifesting","Marinating","Meandering",
  "Metamorphosing","Misting","Moonwalking","Moseying","Mulling","Mustering","Musing",
  "Nebulizing","Nesting","Newspapering","Noodling","Nucleating","Orbiting","Orchestrating",
  "Osmosing","Perambulating","Percolating","Perusing","Philosophising","Photosynthesizing",
  "Pollinating","Pondering","Pontificating","Pouncing","Precipitating","Prestidigitating",
  "Processing","Proofing","Propagating","Puttering","Puzzling","Quantumizing","Razzle-dazzling",
  "Razzmatazzing","Recombobulating","Reticulating","Roosting","Ruminating","Sautéing",
  "Scampering","Schlepping","Scurrying","Seasoning","Shenaniganing","Shimmying","Simmering",
  "Skedaddling","Sketching","Slithering","Smooshing","Sock-hopping","Spelunking","Spinning",
  "Sprouting","Stewing","Sublimating","Swirling","Swooping","Symbioting","Synthesizing",
  "Tempering","Thinking","Thundering","Tinkering","Tomfoolering","Topsy-turvying",
  "Transfiguring","Transmuting","Twisting","Undulating","Unfurling","Unravelling","Vibing",
  "Waddling","Wandering","Warping","Whatchamacalliting","Whirlpooling","Whirring","Whisking",
  "Wibbling","Working","Wrangling","Zesting","Zigzagging"
];
const FRAMES = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
const FRAME_MS = 90;
const VERB_MS = 2500;
const pickVerb = (last) => {
  let v;
  do { v = VERBS[Math.floor(Math.random() * VERBS.length)]; } while (v === last);
  return v;
};

/* form de inscrição na lista de interesse */
(() => {
  const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby-G35SEAmiZTRv2uAqraPungZFvKWsKTHr_JM8B0_UESs10oDz_d2IZO8S3bLXh0nl/exec';

  const form = document.getElementById('interest-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const idleSpan = submitBtn.querySelector('[data-state="idle"]');
  const loadingSpan = submitBtn.querySelector('[data-state="loading"]');
  const submitSpinIcon = document.getElementById('submit-spin-icon');
  const submitSpinVerb = document.getElementById('submit-spin-verb');
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

  let spinIntervalId = null;
  const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading;
    idleSpan.classList.toggle('hidden', isLoading);
    loadingSpan.classList.toggle('hidden', !isLoading);

    if (isLoading) {
      submitSpinVerb.textContent = pickVerb('');
      let i = 0;
      submitSpinIcon.textContent = FRAMES[0];
      spinIntervalId = setInterval(() => {
        submitSpinIcon.textContent = FRAMES[i = (i + 1) % FRAMES.length];
      }, FRAME_MS);
    } else if (spinIntervalId) {
      clearInterval(spinIntervalId);
      spinIntervalId = null;
    }
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

/* modo terminal: piscada de 5s a cada 15s + glitch RGB nas transições */
(() => {
  const FLIP_INTERVAL_MS = 15000;
  const FLIP_DURATION_MS = 5000;
  const GLITCH_MS = 480;
  const SWAP_AT_MS = 160; // troca a paleta no meio do glitch (esconde o cut)

  const body = document.body;

  const glitch = (onSwap) => {
    body.classList.add('cc-glitch');
    setTimeout(onSwap, SWAP_AT_MS);
    setTimeout(() => body.classList.remove('cc-glitch'), GLITCH_MS);
  };

  const flip = () => {
    glitch(() => body.classList.add('cc-terminal'));
    setTimeout(() => glitch(() => body.classList.remove('cc-terminal')), FLIP_DURATION_MS);
  };

  setInterval(flip, FLIP_INTERVAL_MS);
})();

/* spinner + verbos rotativos (Claude Code easter egg)
   uso: <span data-cc-spinner></span>  em qualquer lugar do html. */
(() => {
  document.querySelectorAll('[data-cc-spinner]').forEach((el) => {
    if (el.dataset.ccSpinnerInited) return;
    el.dataset.ccSpinnerInited = '1';
    el.classList.add('cc-spinner');

    const icon = document.createElement('span');
    icon.className = 'cc-spinner__icon';
    icon.textContent = FRAMES[0];

    const verb = document.createElement('span');
    verb.className = 'cc-spinner__verb';
    let current = pickVerb('');
    verb.textContent = current;

    const suffix = document.createElement('span');
    suffix.textContent = '…';

    el.replaceChildren(icon, verb, suffix);

    let i = 0;
    setInterval(() => { icon.textContent = FRAMES[i = (i + 1) % FRAMES.length]; }, FRAME_MS);
    setInterval(() => {
      verb.classList.add('is-fading');
      setTimeout(() => {
        current = pickVerb(current);
        verb.textContent = current;
        verb.classList.remove('is-fading');
      }, 180);
    }, VERB_MS);
  });
})();
