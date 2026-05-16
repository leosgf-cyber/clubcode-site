# Club Code — CONTEXT

## Current Task
Site institucional **https://clubcode.com.br** + email de confirmação automático via Resend. Iteração futura: copy/visual, easter eggs, e decisões pendentes (logo, primeiro evento, canais sociais).

## Key Decisions
- **www é primary**, apex redireciona pra www (cert SSL do apex falhava — provavelmente DNSSEC do registro.br atrapalhando Let's Encrypt).
- **CI/CD via Deploy Hook URL** salvo em `.git/config` (`render.deploy-hook`). GitHub App não conectado → após `git push origin main`, rodar `curl -fsS "$(git config --get render.deploy-hook)"`.
- **Email confirmação via Resend** (não MailApp — scope `script.send_mail` é bloqueado pela Google nessa conta). Requer GCP project linkado (`105027035835`, projeto `club-code-waitlist`) e API key em Script Properties.

## Next Steps
- Logo definitivo (placeholder atual: wordmark `club·code` com bullet laranja).
- Definir tema, data, local e capacidade do primeiro encontro piloto.
- Criar canais sociais (Instagram, YouTube, GitHub) e linkar no footer.

## Atalhos úteis
```bash
cd "/Users/leosgf/Documents/AGENTES AI/clubcode-site"
python3 -m http.server 8765 --bind 0.0.0.0   # local
git push origin main && curl -fsS "$(git config --get render.deploy-hook)"   # deploy
```

Detalhes completos: ver memória em `~/.claude/projects/-Users-leosgf-Documents-AGENTES-AI/memory/project_clubcode.md`.
