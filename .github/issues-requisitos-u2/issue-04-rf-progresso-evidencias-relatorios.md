---
title: "[Tarefa Dupla C & B] Elaborar Requisitos de Apuração de Metas e Relatórios MROSC (CP6, CP8)"
assignees: caioflmjr,lucaspaulaleal,viniciusvieira00
labels: "tipo: tarefa,epico: relatorio,er: declaracao,sprint: 1,moscow: must"
---
## Objetivo da Atividade
A **Dupla C** (`caioflmjr` e `lucaspaulaleal`) em conjunto com **Vinicius Vieira** (`viniciusvieira00`) é responsável por analisar a esteira finalística de prestação de contas do Instituto No Setor, **especificando formalmente os Requisitos Funcionais (RFs) e Não Funcionais (RNFs)** associados a:
- **CP6:** Acompanhamento automático de metas;
- **CP8:** Relatórios e exportação de dados;
- Mitigação de riscos de glosa e responsabilização perante a Lei 13.019/2014 (MROSC).

---

## Insumos e Leituras Obrigatórias
Antes de redigir os requisitos, os integrantes devem ler e extrair os fluxos e regras dos seguintes documentos:
1. **`docs/visao/2-solucao-proposta.md`**:
   - Seção 2.2: OE04 (Antecipar acompanhamento das metas) e OE06 (Reduzir esforço de prestação de contas).
   - Seção 2.3: CP6 (cálculo contínuo do progresso de metas e sinalização de risco) e CP8 (geração de relatórios e exportação integral).
   - Seção 2.4: Geração de relatórios com Puppeteer no servidor (PDF) e exportação tabular.
2. **Branch `integracao/u1-correcoes` — `docs/requisitos/b1-bpmn-processo-atual.md`**:
   - **Gargalo G05:** Ausência de visão unificada para a Diretoria e Presidência (dependência de Excel frágil).
   - **Gargalo G06:** Risco iminente de glosa na prestação de contas por falta de justificativa prévia formal.
   - Macrofases 3.4 (Consolidação gerencial e mitigação de inexecução) e 3.5 (Relatório do objeto e prestação de contas).
3. **`docs/gestao/sprints/sprint-1.md`**:
   - História **HU-05** (geração do relatório de execução do objeto) e o fundamento legal do critério CA-05.2 (Lei 13.019/2014, art. 64, §1º).
4. **Marco Regulatório MROSC:**
   - Art. 64, §1º: Exigência de justificativa formal prévia para metas não atingidas sob pena de devolução de recursos (glosa).
   - Art. 68: Obrigatoriedade de guarda dos documentos e comprovações pelo prazo de 10 anos contados do dia útil seguinte à prestação de contas.

---

## Passo a Passo: O que os Integrantes Devem Fazer

### 1. Elicitar e Estruturar os Requisitos Funcionais (RFs)
Os integrantes devem redigir os requisitos funcionais para cobrir os seguintes comportamentos esperados:
- **Cálculo Automático de Metas (CP6):** Como o sistema apura em tempo real o percentual de atingimento das metas contratuais a partir das chamadas de presença, eventos realizados e evidências cadastradas.
- **Painel de Alertas de Inexecução (CP6):** Como alertar a Diretoria de Projetos sobre metas com execução abaixo do esperado ou com prazos próximos do término, antecipando pedidos de termos aditivos.
- **Justificativa Legal Prévia (CP6/CP8):** Como o sistema exige e registra formalmente a justificativa técnica antes de permitir o congelamento e submissão do relatório de prestação de contas de metas com cumprimento parcial.
- **Emissão do Relatório de Execução do Objeto (CP8):** Como gerar o relatório oficial consolidado por projeto e período, agrupando indicadores, metas propostas vs atingidas, justificativas e índice de evidências anexadas.
- **Exportação Aberta de Dados (CP8):** Como viabilizar o download de planilhas abertas (CSV) para auditoria independente e relatórios diagramados em PDF padronizado via Puppeteer.
- **Trilha de Auditoria (CP8):** Como garantir registro imutável com usuário e data/hora para qualquer retificação que impacte a prestação de contas.

> **Atenção ao Padrão Exigido pelo Professor Marsicano para cada RF:**
> - Código único (ex.: `RF20`, `RF21`...);
> - Nome estritamente no formato **Verbo no Infinitivo + Objeto** (ex.: *RF26 — Gerar Relatório de Execução do Objeto*);
> - Descrição clara do comportamento esperado (*"Deve ser possível ao usuário..."*);
> - Rastreabilidade explícita com as CPs de origem (`CP6`, `CP8`).

### 2. Elicitar os Requisitos Não Funcionais (RNFs) Relacionados
Identificar e detalhar os requisitos não funcionais de conformidade, desempenho e segurança:
- **Conformidade MROSC:** Prazos de retenção documental de 10 anos (art. 68) e obrigatoriedade da justificativa de metas parciais (art. 64).
- **Desempenho da Geração de Relatórios:** Tempo máximo para renderização e download do PDF consolidado no servidor.
- **Imutabilidade e Auditoria:** Trilha de auditoria permanente no PostgreSQL.
- Classificar em **FURPS+** e **Sommerville** e fixar **métricas verificáveis**.

### 3. Perguntas-Chave que os Integrantes Devem Responder
* Como o sistema calcula metas que não são lineares (ex.: metas baseadas em entregas únicas versus metas de horas acumuladas)?
* Como o relatório formal lida com metas que foram remanejadas por Termo Aditivo?
* Quem pode emitir o relatório final oficial versus quem pode apenas gerar prévias de acompanhamento?

---

## Definição de Pronto (DoD)
- [ ] Requisitos Funcionais cobrindo CP6 e CP8 especificados rigorosamente no padrão do professor (Código + Verbo no Infinitivo + Objeto + Comportamento + Rastreabilidade).
- [ ] RNFs de conformidade legal com o MROSC (Lei 13.019/2014) e tempo de resposta catalogados com métricas verificáveis.
- [ ] Rastreabilidade mapeada com OE04, OE06, BPMN G05, G06 e HU-05.
- [ ] Submissão do texto para consolidação na matriz e publicação na seção 8.
