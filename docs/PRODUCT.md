# Nuxo-Bot — Documento de Produto (MVP)

## Visão do Produto

Um bot de Telegram que permite registrar e consultar gastos pessoais de forma rápida e organizada, com suporte a parcelamentos, recorrências e cobranças futuras.

**Premissas do MVP:**
- Multi-usuário pessoal (usuário + familiares/parceiro), mas cada um vê apenas os próprios dados
- Identificação pelo Telegram User ID (sem cadastro manual)
- Somente gastos — sem receitas no MVP
- Sem orçamentos/alertas no MVP
- Sem edição de gastos (só exclusão)
- Interface híbrida: menus com botões inline + atalhos de texto

---

## Funcionalidades do MVP

### 1. Registro de Gastos

Ao registrar um gasto, o usuário informa os campos na seguinte ordem:

| Passo | Campo | Detalhes |
|---|---|---|
| 1 | **Valor** | Valor total da compra (ex: R$ 300,00) |
| 2 | **Forma de pagamento** | Cartão de crédito, PIX, Débito, Dinheiro |
| 3 | **Tipo de cobrança** | À vista, Recorrente (sem fim), Parcelado *(só crédito)* |
| 4 | **Parcelas** *(apenas parcelado)* | Quantidade de parcelas (mínimo 2) |
| 5 | **Data de início** | Quando a 1ª cobrança cai (pode ser mês futuro) |
| 6 | **Categoria** | Pré-definida ou customizada pelo usuário |
| 7 | **Descrição** *(opcional)* | Texto livre para identificar o gasto |

**Regras de negócio:**
- **Parcelado:** disponível apenas para cartão de crédito. O valor total é dividido igualmente entre as parcelas, cada uma aparecendo no mês correspondente
  - Exemplo: R$300 em 3x com início em abril → R$100 em abril, R$100 em maio, R$100 em junho
- **Recorrente:** cobra o valor todo mês indefinidamente (ex: Netflix, academia). Para cancelar, o usuário define uma **data de encerramento** — as cobranças passadas são preservadas no histórico, apenas as futuras deixam de existir
- **À vista:** aparece no mês da data de início
- **Cobrança futura:** se a data de início for um mês futuro, o gasto não aparece no mês atual

---

### 2. Consulta de Gastos

**Visões disponíveis:**
- **Mês atual** — padrão ao usar `/month` ou o menu
- **Qualquer mês** — navegação com botões ◀ / ▶ na visão mensal
- **Filtros** — dentro da visão mensal, botão `🔍 Filtrar` permite filtrar por:
  - Tipo de cobrança: à vista / parcelado / recorrente
  - Categoria específica
  - Botão `❌ Limpar filtro` remove o filtro ativo
- **Resumo anual** — totais mensais do ano corrente via `/year` ou menu

**O que a listagem mensal mostra:**
- Agrupamento por categoria com ícone e total da categoria
- Por item: descrição, número de parcela *(ex: 2/3)*, ícone 🔄 para recorrentes, valor
- Total geral do mês ao final

---

### 3. Gerenciamento de Gastos

**Botão "✏️ Gerenciar"** na tela mensal lista todos os itens do mês como botões individuais para seleção. Ao selecionar um item, o bot apresenta as opções de gerenciamento adequadas ao tipo.

**Excluir — gasto à vista:**
- Remove o registro completamente

**Excluir — gasto parcelado:**
- Por padrão, remove apenas as parcelas futuras (a partir do mês atual)
- O bot pergunta: *"Quer remover também as parcelas já registradas nos meses anteriores?"*
- Caso sim, remove o gasto inteiro; caso não, preserva o histórico passado

**Cancelar — gasto recorrente:**
- O usuário não "exclui" — ele **cancela a partir de uma data**
- O bot pergunta: *"A partir de qual mês deseja cancelar?"*
- As cobranças passadas ficam preservadas no histórico
- As cobranças futuras (a partir da data de corte) deixam de aparecer

**Sem edição** no MVP — se errou, cancela/exclui e registra de novo

---

### 4. Recorrentes Ativos

Via `/recurring` ou menu `🔄 Recorrentes` — lista todas as cobranças recorrentes que ainda estão ativas (sem cancelamento ou com cancelamento no futuro), com botão de cancelamento individual por item.

---

### 5. Categorias

**Pré-definidas:**
- Alimentação, Transporte, Moradia, Saúde, Lazer / Entretenimento, Educação, Vestuário, Assinaturas / Serviços, Outros

**Customizáveis:** usuário pode criar novas categorias; ficam disponíveis para usos futuros

---

### 6. Formas de Pagamento

- Cartão de crédito *(suporta parcelamento)*
- PIX / Transferência *(à vista ou recorrente)*
- Débito *(à vista ou recorrente)*
- Dinheiro *(à vista ou recorrente)*

> Parcelamento só está disponível para cartão de crédito. Para as demais formas, o tipo de cobrança fica limitado a "à vista" ou "recorrente".

---

## UX — Menu Principal (`/start`)

```
➕ Registrar gasto
📊 Ver gastos do mês
🔄 Recorrentes
📈 Resumo anual
🏷️ Categorias
```

### Comandos de texto disponíveis
```
/add        → inicia fluxo de registro de gasto
/month      → consulta gastos do mês atual
/recurring  → lista cobranças recorrentes ativas
/year       → resumo anual (totais por mês)
/start      → abre o menu principal
```

---

## O que fica para versões futuras

| Funcionalidade | Prioridade sugerida |
|---|---|
| Orçamento por categoria + alertas | Alta |
| Registro de receitas (salário, freelance) | Alta |
| Relatório mensal automático (fim do mês) | Média |
| Análises e sugestões com IA (LLM) | Média |
| Gastos compartilhados (casa/grupo) | Baixa |
| Exportação (CSV, Excel) | Baixa |
| Edição de gastos | Baixa |
| Metas de economia | Média |

---

*Criado em: 2026-02-27*
*Atualizado em: 2026-03-02 — fluxo de registro reordenado, filtros mensais, botão Gerenciar, tela de recorrentes, resumo anual*
