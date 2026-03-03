# Nuxo-Bot 💸

Assistente financeiro pessoal via Telegram. Registre gastos, acompanhe parcelamentos e cobranças recorrentes, filtre por categoria e visualize seu histórico mês a mês — tudo sem sair do chat.

---

## Funcionalidades

### Registro de gastos
Fluxo guiado passo a passo: valor → forma de pagamento → tipo → data → categoria → descrição. Parcelamento disponível apenas para cartão de crédito.

### Tipos de cobrança
| Tipo | Comportamento |
|---|---|
| **À vista** | Aparece no mês da data de início |
| **Parcelado** | Cada parcela aparece no mês correto automaticamente |
| **Recorrente** | Cobra todo mês até ser cancelado — histórico sempre preservado |

### Consulta mensal (`/month`)
- Navegação entre meses com botões ◀ ▶
- Filtro por tipo de cobrança ou categoria
- Botão **✏️ Gerenciar** para excluir ou cancelar qualquer item

### Recorrentes ativos (`/recurring`)
Lista todas as cobranças recorrentes ainda ativas, com opção de cancelar individualmente a partir de qualquer mês.

### Resumo anual (`/year`)
Total gasto por mês no ano atual, em uma única tela.

### Outras
- Multi-usuário — cada usuário vê apenas os próprios dados (identificado pelo Telegram ID)
- Categorias pré-definidas + criação de categorias customizadas
- Exclusão de parcelados com opção de preservar histórico anterior

---

## Stack

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript / Node.js 20+ |
| Bot framework | [Grammy](https://grammy.dev) + @grammyjs/conversations |
| Banco de dados | [Supabase](https://supabase.com) (PostgreSQL) |
| Sessão | @grammyjs/storage-supabase |
| Deploy | [Railway](https://railway.app) |
| Testes | [Vitest](https://vitest.dev) |

---

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
npm run dev
```

Em desenvolvimento o bot usa **polling** — não precisa de URL pública nem ngrok.

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `BOT_TOKEN` | Token do bot ([@BotFather](https://t.me/BotFather)) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role do Supabase |
| `WEBHOOK_DOMAIN` | URL pública — só obrigatória em produção |
| `NODE_ENV` | `development` (polling) ou `production` (webhook) |
| `TZ` | Fuso horário — usar `America/Sao_Paulo` |

---

## Testes

```bash
npm test           # roda todos os testes
npm run typecheck  # verifica tipagem TypeScript
```

72 testes cobrindo utils (datas, formatação, validação) e regras de negócio do service.

---

## Fluxo de branches

```
main        ← produção (Railway redeploya automaticamente)
  └── develop ← integração
        ├── feat/* ← novas funcionalidades
        └── fix/*  ← correções
```

---

## Documentação

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — Requisitos e regras de negócio
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Arquitetura técnica e schema do banco
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — Guia completo de deploy no Railway
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Plano de ação e progresso

---

## Licença

MIT
