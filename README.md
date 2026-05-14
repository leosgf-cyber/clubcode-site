# club·code — site

Landing page institucional do **Club Code**, clube de encontros presenciais sobre AI pra vibe coders brasileiros.

HTML/CSS/JS puros + Tailwind via CDN. Backend de form é Google Apps Script gravando em Google Sheet. Deploy em Render Static.

---

## Arquivos

```
clubcode-site/
├── index.html              # página única
├── styles.css              # estilos complementares (bullet do wordmark, focus, etc)
├── script.js               # form submit + estados
├── apps-script/
│   └── Code.gs             # webhook do Apps Script (colar no editor)
├── .gitignore
└── README.md
```

---

## Setup

### 1. Apps Script + Google Sheet

1. Crie uma planilha nova no Google Sheets: **"Club Code — Lista de Interesse"**.
2. Menu **Extensions → Apps Script**.
3. Apague o conteúdo padrão e cole o conteúdo de `apps-script/Code.gs`.
4. No editor, rode a função `setupSheet` uma vez (botão ▶). Autorize quando pedir. Isso cria a aba `Lista` com cabeçalho.
5. Clique em **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me** (sua conta)
   - Who has access: **Anyone**
6. Copie a URL gerada (formato `https://script.google.com/macros/s/.../exec`).

Smoke test no terminal antes de plugar no front:

```bash
curl -X POST "https://script.google.com/macros/s/SEU_ID/exec" \
  -d "nome=Teste&email=teste@exemplo.com&consent=1&source=cli&user_agent=curl"
```

Deve retornar `{"status":"ok"}` e aparecer uma linha na planilha.

### 2. Plugar URL no front

Em `script.js`, troque:

```js
const WEBHOOK_URL = 'COLE_AQUI_A_URL_DO_APPS_SCRIPT';
```

pela URL do passo 1.

### 3. Rodar local

Não precisa build. Duas opções:

```bash
# Opção A — só abrir no browser
open index.html

# Opção B — servidor estático (recomendado pra testar form com CORS)
python3 -m http.server 8000
# acesse http://localhost:8000
```

### 4. Deploy no Render

1. Crie repo no GitHub:
   ```bash
   git init
   git add .
   git commit -m "club code: landing fase 1"
   gh repo create leosgf-cyber/clubcode-site --public --source=. --push
   ```
2. Render Dashboard → **New → Static Site**.
3. Conecte ao repo `clubcode-site`.
4. Build command: *(vazio)*
5. Publish directory: `.` (raiz)
6. Auto-deploy on push: **on**.

### 5. DNS clubcode.com.br

No painel do registro.br, configurar:

- `www.clubcode.com.br` → CNAME → `<seu-site>.onrender.com`
- `clubcode.com.br` (raiz) → registro.br **não suporta ALIAS na raiz**. Opções:
  - **(a)** Usar o serviço de **redirecionamento web** do registro.br: redireciona `clubcode.com.br` → `https://www.clubcode.com.br`.
  - **(b)** Pôr Cloudflare na frente (DNS gratuito) e usar ALIAS/CNAME flattening na raiz.

No Render: **Settings → Custom Domains → Add Custom Domain** → `www.clubcode.com.br` (e `clubcode.com.br` se for usar Cloudflare). SSL é automático.

---

## Verificação pós-deploy

- [ ] `https://www.clubcode.com.br` carrega com cadeado verde.
- [ ] `clubcode.com.br` redireciona pra `www`.
- [ ] Fontes (Space Grotesk, Inter, JetBrains Mono) carregam.
- [ ] Layout responsivo em 375px / 768px / 1280px.
- [ ] Form submetido aparece como linha nova na planilha.
- [ ] Estados loading / sucesso / erro funcionam visualmente.

---

## Próximos passos (fora do escopo da Fase 1)

- Logo definitivo (placeholder atual: wordmark tipográfico com bullet laranja).
- Canais sociais (Instagram, YouTube, GitHub etc) no footer.
- Página de evento quando o piloto for marcado.
- Sender de newsletter (beehiiv/ConvertKit) integrado ao Sheet quando virar canal recorrente.
