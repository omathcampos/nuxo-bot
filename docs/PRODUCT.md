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

Ao registrar um gasto, o usuário informa:

| Campo | Detalhes |
|---|---|
| **Valor** | Valor total da compra (ex: R$ 300,00) |
| **Forma de pagamento** | Cartão de crédito, PIX/Transferência, Débito, Dinheiro |
| **Tipo de cobrança** | Parcelado (N vezes), Recorrente (sem fim), À vista |
| **Data de início** | Quando a 1ª cobrança cai (pode ser mês futuro) |
| **Categoria** | Pré-definida ou customizada pelo usuário |
| **Descrição** *(opcional)* | Texto livre para identificar o gasto |

**Regras de negócio:**
- **Parcelado:** o valor total é dividido igualmente entre as parcelas, cada uma aparecendo no mês correspondente
  - Exemplo: R$300 em 3x com início em abril → R$100 em abril, R$100 em maio, R$100 em junho
- **Recorrente:** cobra o valor todo mês indefinidamente (ex: Netflix, academia). Para cancelar, o usuário define uma **data de encerramento** — as cobranças passadas são preservadas no histórico, apenas as futuras (a partir da data de corte) deixam de existir
- **À vista:** aparece no mês da data de início
- **Cobrança futura:** se a data de início for um mês futuro, o gasto não aparece no mês atual

---

### 2. Consulta de Gastos

**Visões disponíveis:**
- Gastos do mês atual (padrão)
- Gastos de qualquer mês (passado ou futuro)
- Filtro por categoria + mês
- Resumo mensal (total gasto + breakdown por categoria)

**O que a listagem deve mostrar:**
- Data do gasto ou parcela
- Descrição / categoria
- Valor da parcela/cobrança (ex: "R$100,00 — Parcela 2/3")
- Forma de pagamento
- Total do mês ao final da listagem

---

### 3. Gerenciamento de Gastos

**Excluir — gasto à vista:**
- Remove o registro completamente (não há histórico relevante a preservar)

**Excluir — gasto parcelado:**
- Por padrão, remove apenas as parcelas futuras (a partir do mês atual)
- O bot pergunta: *"Quer remover também as parcelas já registradas nos meses anteriores?"*
- Caso sim, remove o gasto inteiro; caso não, preserva o histórico passado

**Cancelar — gasto recorrente:**
- O usuário não "exclui" — ele **cancela a partir de uma data**
- O bot pergunta: *"A partir de qual mês deseja cancelar?"*
- As cobranças passadas ficam preservadas no histórico
- As cobranças futuras (a partir da data de corte) deixam de aparecer
- O gasto recorrente aparece com status "cancelado" se o usuário consultar meses anteriores

**Sem edição** no MVP — se errou, cancela/exclui e registra de novo

---

### 4. Categorias

**Pré-definidas:**
- Alimentação
- Transporte
- Moradia
- Saúde
- Lazer / Entretenimento
- Educação
- Vestuário
- Assinaturas / Serviços
- Outros

**Customizáveis:** usuário pode criar novas categorias; ficam disponíveis para usos futuros

---

### 5. Formas de Pagamento

- Cartão de crédito *(suporta parcelamento)*
- PIX / Transferência *(sempre à vista)*
- Débito *(sempre à vista)*
- Dinheiro *(sempre à vista)*

> Nota: parcelamento só faz sentido para cartão de crédito. Para as demais formas, o tipo de cobrança é "à vista" ou "recorrente".

---

## UX — Fluxo no Telegram

### Comandos de texto (atalhos)
```
/gasto 50 almoco pix
/gasto 300 eletronico credito 3x
/gastos             → consulta mês atual
/gastos jan         → consulta janeiro
/gastos alimentacao → filtra por categoria
```

### Menus com botões inline
- Botões para guiar o fluxo de registro passo a passo
- Botões de navegação para mudar de mês na consulta
- Confirmação antes de excluir um gasto

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
*Status: Produto definido — aguardando decisões técnicas*
