# Ata — Sprint 2 Planning — 23/09/2026

Reunião de Sprint Planning da Sprint 2 da equipe CyberSetor, conduzida por Vinicius Vieira como Scrum Master, voltada à definição do Sprint Backlog da Unidade 2, priorização MoSCoW dos requisitos, formalização de DoR/DoD, comprovação de práticas ágeis (XP) e regularização de atas e ritos.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-09-23-SP |
| **Tipo** | Sprint Planning |
| **Data** | 23/09/2026 (quarta-feira) |
| **Horário** | 21:00 – ~22:50 · duração ~110 min |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Maria Eduarda Marques, Rodrigo Henrique, Daniel Batista, Lucas De Paula Leal e Caio Martins |
| **Participantes — externos** | Não se aplica |
| **Condução** | Vinicius Vieira (Scrum Master) |
| **Registro** | Transcrição automática via IA · consolidação: Caio Martins e Vinicius Vieira |
| **Sprint** | Sprint 2 |
| **Documentos relacionados** | [Ata da Sprint 1 Review e Retrospective](2026-09-22-sprint-review-retrospective.md) · [DoR e DoD](../../requisitos/9-dor-dod.md) · [Backlog de Produto](../../requisitos/10-backlog.md) |

---

## 1. Pauta

1. Definição das metas da Sprint 2 e alinhamento com os prazos de encerramento da Unidade 2 (29/09/2026).
2. Priorização MoSCoW do Product Backlog e delimitação estrita do MVP.
3. Estabelecimento formal dos critérios de *Definition of Ready* (DoR) e *Definition of Done* (DoD).
4. Regularização da documentação: publicação de atas pendentes, anonimização de dados e evidências dos ritos da Sprint 1 (Origem da Issue #77).
5. Atualização do Rich Picture e do Mapa de Stakeholders a partir das visitas presenciais ao Instituto (08/09 e 21/09).
6. Adoção e comprovação das práticas de *Extreme Programming* (XP), em especial programação em par (*pair programming*).
7. Análise de demandas do cliente: posicionamento sobre o painel gerencial da Presidência e templates de interface.

---

## 2. Resumo

A equipe realizou o planejamento detalhado da Sprint 2, ancorando o trabalho nas exigências da Unidade 2 da disciplina de Requisitos de Software. Foi confirmada como meta principal a entrega do catálogo refinado de requisitos, a matriz de rastreabilidade completa, os artefatos de DoR e DoD consolidados e a atualização dos diagramas conceituais com base nas visitas presenciais.

A equipe deliberou sobre a publicação formal de todas as atas pendentes acumuladas e a reunião das evidências dos ritos da Sprint 1 (dailies com ocultação de dados sensíveis para conformidade com a LGPD). No escopo do produto, a demanda do presidente Rafael por um dashboard unificado foi classificada como *Should-have*, assegurando que o MVP inicial concentre-se estritamente na Matriz de Aquisição e na coleta de dados de campo. Definiram-se também os padrões de comprovação de programação em par via co-autoria no Git e chamadas no Google Meet.

---

## 3. Registro por tema

### 3.1 Publicação de atas e evidências dos ritos (Origem da Issue #77)
Vinicius Vieira ressaltou a exigência metodológica de comprovar a execução dos ritos ágeis (Sprint Planning, Dailies, Review e Retrospectiva) e publicar as atas formais no site da documentação. Caio Martins reportou que as atas estavam atualizadas no Google Drive, necessitando de conversão e revisão de dados sensíveis antes de submissão ao repositório público. 

Deliberou-se que a equipe trataria as transcrições do Gemini para remover nomes desnecessários e dados pessoais, registrando as evidências das dailies e as atas oficiais até o dia 29 de setembro (decisão formalizada na criação da Issue #77).

### 3.2 Atualização do Rich Picture e Mapa de Stakeholders
Constatou-se que o Rich Picture e o Mapa de Stakeholders publicados na Unidade 1 não refletiam a rica estrutura identificada nas visitas presenciais com Franci e Rafael (especialmente a dinâmica entre coordenação de execução, captação e diretoria). A dupla responsável (Daniel Batista e Maria Eduarda Marques) assumiu a atualização desses artefatos no Documento de Visão.

### 3.3 Priorização MoSCoW e refinamento do MVP
A equipe reavaliou o catálogo preliminar de requisitos funcionais e não funcionais. Para viabilizar a entrega do MVP, itens secundários de alta incerteza foram despriorizados: a sincronização offline bidirecional complexa sem duplicidade e os modelos preditivos de risco foram retirados do MVP. 

Quanto ao painel gerencial solicitado pelo presidente Rafael, Rodrigo Henrique e Vinicius Vieira ponderaram que um dashboard só tem utilidade após as rotinas de cadastro, matriz de aquisição e prestação de contas estarem operacionais. A funcionalidade foi formalmente enquadrada como *Should-have*.

### 3.4 Definição de DoR e DoD
Vinicius Vieira apresentou as diretrizes formais para os artefatos de qualidade:
* **Definition of Ready (DoR):** História de usuário com formato INVEST, valor claro para o cliente, vinculação explícita com RF/RNF, critérios de aceitação verificáveis (formato Given/When/Then) e classificação MoSCoW atribuída.
* **Definition of Done (DoD):** Critérios de aceitação validados, revisão de código (code review) aprovada por outra dupla, testes automatizados cobrindo os cenários centrais, documentação de endpoints/interfaces e demonstração funcional em Sprint Review. Rodrigo Henrique e os demais membros aprovaram os critérios por unanimidade.

### 3.5 Práticas de XP: Programação em Par (*Pair Programming*)
Rodrigo Henrique pontuou que apenas indicar coautores nas mensagens de commit do Git pode ser insuficiente para auditar a prática de programação em par perante a avaliação docente. A equipe combinou utilizar a coautoria obrigatória nos commits (`Co-authored-by:`) combinada com registros de chamadas síncronas no Google Meet durante as sessões de programação conjunta.

### 3.6 Arquitetura de interface e automação de documentos
Para agilizar o desenvolvimento do front-end e oferecer interface limpa para usuários com menor afinidade técnica, Vinicius propôs o aproveitamento de biblioteca de componentes responsivos prontos, selecionando apenas elementos essenciais. Maria Eduarda reiterou a necessidade de cobrar de Rafael os acessos e modelos oficiais de planilhas para viabilizar a prototipação fiel da Matriz de Aquisição.

---

## 4. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | **Priorização estrita do MVP da Unidade 2 pelo método MoSCoW** | Proteger a capacidade de entrega da equipe e assegurar o cumprimento rigoroso dos prazos da disciplina | Foco do Sprint Backlog 2 |
| D2 | **Classificação do Painel Gerencial da Presidência como *Should-have*** | Dependência lógica e estrutural dos dados operacionais da Matriz de Aquisição antes de consolidar relatórios | Escopo da U2 protegido |
| D3 | **Adoção formal dos critérios de DoR e DoD** | Padronizar a qualidade antes de iniciar tarefas de desenvolvimento e fixar critérios de pronto objetivos | Governança técnica do projeto |
| D4 | **Comprovação de Pair Programming por coautoria em commits e chamadas no Meet** | Evidenciar a aplicação consistente das práticas de XP conforme cobrado pela metodologia de ensino | Evidências de engenharia |
| D5 | **Publicação das atas pendentes e comprovação dos ritos até 29/09 (Issue #77)** | Cumprir os critérios de transparência e manter a documentação do projeto auditável | Regularização de atas e ritos |

---

## 5. Próximas etapas

| # | Ação | Responsável | Prazo | Situação |
|---|---|---|---|---|
| A1 | Publicar atas revisadas no índice e adequar a ata de 15/09 | Caio Martins e Vinicius Vieira | 29/09/2026 | Em andamento (Issue #77) |
| A2 | Atualizar o Rich Picture e o Mapa de Stakeholders no Documento de Visão | Daniel Batista e Maria Eduarda Marques | 26/09/2026 | Em andamento |
| A3 | Redigir a página formal de DoR e DoD no site da documentação | Vinicius Vieira | 26/09/2026 | Em andamento |
| A4 | Consolidar a Matriz 4x4 de Rastreabilidade e Backlog de Produto | Daniel Batista e Rodrigo Henrique | 27/09/2026 | Em andamento |
| A5 | Finalizar pendências do dojo técnico de NestJS/Prisma | Lucas De Paula Leal | 24/09/2026 | Planejado |
| A6 | Enviar a planilha de requisitos com link de comentários para a monitoria | Vinicius Vieira | 24/09/2026 | Concluído |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 23/09/2026 | Vinicius Vieira | Registro das anotações e deliberações da Sprint Planning |
| 0.2 | 29/09/2026 | Caio Martins | Estruturação formal conforme o template institucional de atas do projeto e registro da origem da Issue #77 |
| 1.0 | 29/09/2026 | Vinicius Vieira | Homologação final pela equipe CyberSetor |
