# Nuxo-Bot — Guia de Deploy (Railway)

## Visão geral

O Nuxo-Bot roda no Railway em modo **webhook**: o Railway sobe um servidor Express que
fica escutando mensagens do Telegram 24h/dia. Todo push na branch `main` dispara um
redeploy automático.

```
Telegram ──► Railway (Express + webhook) ──► Supabase (dados + sessão)
```

---

## Pré-requisitos

| Item | Status |
|---|---|
| Conta no [Railway](https://railway.app) | Criar se não tiver (plano Hobby = ~$5/mês) |
| Repositório no GitHub | ✅ Já existe |
| Projeto no Supabase | ✅ Já existe |
| Railway CLI instalado | Ver passo 1 |

---

## Passo 1 — Instalar e autenticar o Railway CLI

```bash
# Instalar globalmente
npm install -g @railway/cli

# Autenticar (abre o browser)
railway login
```

Verifique:
```bash
railway --version   # deve retornar ex: railway 3.x.x
railway whoami      # deve mostrar seu e-mail
```

---

## Passo 2 — Preparar o repositório

Garanta que `main` está atualizado com tudo que foi desenvolvido:

```bash
# 1. Mesclar feat/ux-improvements → develop (via PR #11 no GitHub)
# 2. Criar PR develop → main e mesclar

# Localmente, atualizar main:
git checkout main
git pull origin main
```

> A partir daqui, **qualquer push na `main` dispara um redeploy automático**.

---

## Passo 3 — Criar o projeto no Railway

```bash
# Dentro da pasta do projeto
cd ~/Projetos/nuxo-bot

# Iniciar um novo projeto Railway (ou linkar um existente)
railway init
```

Quando perguntar o nome, use: `nuxo-bot`

Conecte ao repositório GitHub quando solicitado — isso ativa o **deploy automático por push**.

---

## Passo 4 — Configurar variáveis de ambiente

As variáveis são configuradas **uma única vez** no Railway. O bot não sobe sem elas.

### Variáveis obrigatórias

| Variável | Onde encontrar | Exemplo |
|---|---|---|
| `BOT_TOKEN` | BotFather no Telegram → `/mybots` → seu bot → API Token | `7123456789:AAF...` |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key | `eyJhbGciOi...` |
| `WEBHOOK_DOMAIN` | URL gerada pelo Railway (ver passo 5) | `https://nuxo-bot.up.railway.app` |
| `NODE_ENV` | Fixo | `production` |
| `TZ` | Fixo | `America/Sao_Paulo` |

> **Atenção:** use a **service_role key**, não a anon key. Ela tem permissão para
> contornar o RLS — a segurança é garantida pelos `WHERE user_id` nas queries.

### Como configurar via CLI

```bash
railway variables set BOT_TOKEN=<seu_token>
railway variables set SUPABASE_URL=<sua_url>
railway variables set SUPABASE_SERVICE_ROLE_KEY=<sua_chave>
railway variables set NODE_ENV=production
railway variables set TZ=America/Sao_Paulo
# WEBHOOK_DOMAIN: configurar APÓS o passo 5
```

Ou pelo dashboard: **Railway → seu projeto → Variables → Raw Editor**.

---

## Passo 5 — Primeiro deploy e obter a URL

```bash
# Deploy manual (só na primeira vez; depois é automático por push)
railway up
```

Após o build finalizar, pegue a URL pública do serviço:

```bash
railway domain
# Saída: https://nuxo-bot-production.up.railway.app
```

Agora configure `WEBHOOK_DOMAIN` com essa URL:

```bash
railway variables set WEBHOOK_DOMAIN=https://nuxo-bot-production.up.railway.app
```

O Railway vai restartar o serviço automaticamente. Na inicialização, `main.ts` chama
`bot.api.setWebhook(url)` e registra o webhook no Telegram.

---

## Passo 6 — Validar o deploy

### Health check
```bash
curl https://nuxo-bot-production.up.railway.app/health
# Esperado: {"status":"ok"}
```

### Logs em tempo real
```bash
railway logs
```

### Teste no Telegram
1. Abra o bot no Telegram
2. Envie `/start` — deve aparecer o menu principal
3. Registre um gasto e consulte com `/month`

---

## Fluxo de trabalho contínuo (pós-launch)

```
feat/* → PR → develop → PR → main → Railway redeploya automaticamente
```

Você **nunca** precisa rodar `railway up` de novo — qualquer merge na `main` é suficiente.

### Ver logs de produção
```bash
railway logs --tail    # streaming em tempo real
```

### Abrir o dashboard
```bash
railway open
```

---

## Variáveis de ambiente resumidas (.env.example atualizado)

```bash
# Telegram
BOT_TOKEN=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Railway / App
WEBHOOK_DOMAIN=https://seu-app.up.railway.app
NODE_ENV=production
PORT=3000                    # Railway injeta automaticamente; não precisa setar
TZ=America/Sao_Paulo
```

---

## Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| Bot não responde | Webhook não registrado | Verificar logs: `railway logs` |
| `Missing required env var` | Variável não configurada | `railway variables` para listar |
| `Error: invalid token` | BOT_TOKEN errado | Verificar no BotFather |
| Sessão perdida após redeploy | Normal na 1ª vez | Supabase persiste a sessão, normaliza sozinho |
| Build falha | TypeScript error | Rodar `npm run typecheck` localmente primeiro |

---

*Criado em: 2026-03-02*
