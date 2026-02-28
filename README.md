# Nuxo-Bot

Bot de assessoria financeira pessoal via Telegram. Registre e consulte seus gastos de forma rápida, com suporte a parcelamentos, cobranças recorrentes e cobranças futuras.

## Funcionalidades

- **Registro de gastos** — valor, categoria, forma de pagamento, parcelamento e data de início
- **Gastos parcelados** — cada parcela aparece no mês correto automaticamente
- **Recorrências** — assinaturas e cobranças mensais sem data de fim
- **Cobranças futuras** — registre hoje uma compra que começa a cobrar no próximo mês
- **Consulta por mês** — navegue entre meses e filtre por categoria
- **Cancelamento inteligente** — cancela recorrentes a partir de uma data, preservando o histórico
- **Multi-usuário** — cada usuário vê apenas os próprios dados, identificado pelo Telegram ID

## Stack

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript / Node.js 20+ |
| Bot framework | [Grammy](https://grammy.dev) + @grammyjs/conversations |
| Banco de dados | [Supabase](https://supabase.com) (PostgreSQL) |
| Sessão | @grammyjs/storage-supabase |
| Deploy | [Railway](https://railway.app) |

## Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com)
- Bot criado no Telegram via [@BotFather](https://t.me/BotFather)
- [ngrok](https://ngrok.com) para desenvolvimento local (webhook)

## Setup local

**1. Clone e instale dependências:**
```bash
git clone https://github.com/omathcampos/nuxo-bot.git
cd nuxo-bot
npm install
```

**2. Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o .env com seus valores
```

**3. Rode em modo desenvolvimento:**
```bash
# Em um terminal: exponha a porta com ngrok
ngrok http 3000

# Em outro terminal: suba o bot
npm run dev
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `BOT_TOKEN` | Token do bot ([@BotFather](https://t.me/BotFather)) |
| `WEBHOOK_DOMAIN` | URL pública (ex: `https://xxx.ngrok.io` em dev, URL do Railway em prod) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role do Supabase |
| `PORT` | Porta do servidor (padrão: 3000; Railway injeta automaticamente) |
| `TZ` | Fuso horário — usar `America/Sao_Paulo` |

## Fluxo de branches

```
main        ← produção (Railway faz deploy automaticamente)
  └── develop ← integração
        ├── feat/* ← novas funcionalidades
        └── fix/*  ← correções
```

- Nunca commite direto na `main`
- Features e fixes são desenvolvidos em branches próprias e mergeados em `develop` via PR
- Quando `develop` estiver estável, abre-se PR de `develop` → `main` para deploy

## Documentação

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — Requisitos e regras de negócio
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Arquitetura técnica e schema do banco
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Plano de ação e progresso das tarefas

## Licença

MIT
