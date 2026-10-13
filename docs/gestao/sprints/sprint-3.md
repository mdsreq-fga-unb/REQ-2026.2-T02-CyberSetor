# Plano da Sprint 3 — Projeto CyberSetor

**Documento de planejamento e priorização da Sprint 3**

| Campo | Conteúdo |
|---|---|
| **Código do documento** | C25 |
| **Versão** | 1.0 |
| **Data de emissão** | 9 de outubro de 2026 |
| **Projeto** | CyberSetor — sistema de gestão do ciclo de projetos financiados |
| **Cliente** | Instituto Cultural e Social No Setor |
| **Disciplina** | FGA0313 — Requisitos de Software · Turma 02 · 2026.2 · FCTE/UnB |
| **Docente** | Prof. George Marsicano |
| **Sprint** | Sprint 3 |
| **Período da Sprint** | 06/10/2026 (terça-feira) a 20/10/2026 (terça-feira) — 2 semanas |
| **Elaboração** | Vinicius Angelo de Brito Vieira (Scrum Master) |
| **Product Owner** | Maria Eduarda Denis Duarte Marques |
| **Situação** | Emitido com o deliberado na Sprint Planning de 07/10/2026 e nos encaminhamentos de 08/10 e 09/10 |

---

## 1. Objetivo e escopo do documento

Este documento estabelece o planejamento da Sprint 3: período, meta, capacidade, Sprint Backlog, priorização, alocação por dupla, riscos e critérios de aceitação da sprint. É a primeira sprint de construção do produto e contém a entrega da Unidade 2, em 13/10.

**Não integram o escopo deste documento:** os requisitos declarados ([seção 8](../../requisitos/8-requisitos.md)); a DoR e a DoD ([seção 9](../../requisitos/9-dor-dod.md)); o backlog do produto, a priorização e o MVP ([seção 10](../../requisitos/10-backlog.md)); o fluxo de branches e de publicação ([Boas práticas no GitHub](../boas-praticas-github.md)); a situação corrente de cada item, que fica no quadro do projeto.

---

## 2. Referências

### 2.1 Base de elaboração deste plano

Ata da Sprint Review 2 e Retrospectiva 2 (06/10/2026); ata da Sprint Planning 3 (07/10/2026); ata da reunião de validação do MVP com o Instituto (08/10/2026); [plano da Sprint 2](sprint-2.md) (C24); Plano de Ensino da disciplina (entrega da Unidade 2 em 13/10; §9.1 e §9.2 sobre publicação e endereço do produto).

### 2.2 Referencial teórico

MARSICANO, G. **Requisitos de Software: Comunicação é tudo!** v1.1 draft. Brasília: FCTE/UnB, 2026. §5.3 (atividades de Engenharia de Requisitos); cap. 9 (declaração de requisitos por nível de abstração).

SCHWABER, K.; SUTHERLAND, J. **The Scrum Guide**. 2020. — Sprint Goal, Sprint Backlog, Definition of Done e itens não concluídos.

BECK, K. **Extreme Programming Explained: Embrace Change.** 2. ed. Addison-Wesley, 2004. — fatias pequenas, integração contínua e programação em pares.

### 2.3 Convenções deste documento

| Marca | Significado |
|---|---|
| 🟩 | Fato confirmado junto ao cliente ou à equipe |
| 🟨 | Hipótese ainda não validada |
| 🔧 | Proposta sujeita a deliberação da equipe |

Itens sem marcação constituem decisão registrada em ata.

---

## 3. Contexto

A Sprint 2 terminou com a meta **parcialmente atingida**: a lista de requisitos foi ajustada, a matriz 4 × 4 preenchida e a DoR e a DoD publicadas, mas a validação do MVP com o Instituto dependia da conferência da ata de 28/09. Em 08/10 o Instituto confirmou, capacidade por capacidade, o recorte da primeira entrega: parcerias e metas, inscrições e prestação de contas, com o relatório sem fotos nem comprovações até o incremento seguinte.

A Unidade 2 da disciplina é entregue em 13/10, dentro desta sprint, e pelo Plano de Ensino a codificação começa depois de definidos os requisitos do MVP. Por isso a sprint tem duas partes, em ordem de prioridade: fechar e publicar a Unidade 2; preparar a base técnica e iniciar as histórias do MVP.

O fluxo de branches por componente e os pontos de publicação do site, em vigor desde 09/10, estão na página [Boas práticas no GitHub](../boas-praticas-github.md); este plano só os pressupõe.

---

## 4. Definição da Sprint

### 4.1 Período e cadência

| Parâmetro | Definição |
|---|---|
| Início | 06/10/2026 (terça-feira) |
| Encerramento | 20/10/2026 (terça-feira) |
| Duração | 2 semanas |
| Ancoragem | Terças-feiras |
| Reunião de Planning | 07/10/2026 (quarta-feira), 21h30 |

**Exceções à cadência:** o Planning ocorreu um dia depois do início, como na Sprint 2; o período da sprint não muda. A Review e a Retrospectiva da Sprint 2 foram em 06/10 e o Planning em 07/10, em reuniões separadas, por limite de horário da equipe.

**Eventos externos no período:** atividade em sala sobre declaração de requisitos (08/10); provas de integrantes (08/10); feriado nacional (12/10); entrega da Unidade 2 (13/10, 8h) e aula de apresentação; alinhamento técnico com o Instituto (15/10); Sprint Review 3 e Retrospectiva 3 (20/10); revisão da primeira entrega com o Instituto, prevista para cerca de 21/10.

### 4.2 Meta da Sprint

> **Sprint Goal (aprovado em 07/10):** *"Ao final da Sprint 3, a Unidade 2 está publicada no site na versão marcada, antes da aula de 13/10, com o MVP confirmado pelo Instituto; e a base técnica está pronta para a construção: ambiente local definido, linhas da API e do front criadas e as histórias do MVP iniciadas."*

**Fundamentação do recorte.** A primeira parte da meta é verificável pela tag `u2-2026-10-13` na `main` e pelo site publicado a partir dela; a confirmação do MVP, pela ata de 08/10. A segunda parte é verificável pelas linhas de código com integração contínua verde, pelo ambiente local documentado e pelas sub-issues de construção abertas e iniciadas nas histórias do MVP.

**Exclusões explícitas do escopo da Sprint:**

| Item excluído | Justificativa |
|---|---|
| Histórias fora do MVP (HU-03 além do cadastro da atividade, HU-04, HU-06, HU-09 a HU-12) | Incrementos 2, 3 e posteriores, na ordem confirmada pelo Instituto em 28/09 e 08/10 |
| Evidências e comprovações no relatório | Incremento 2; o relatório da primeira entrega sai sem fotos (decisão de 08/10) |
| Geração automática de tags e histórico de versões | Apresentada no Planning sem origem declarada nem pull request; fica como proposta a avaliar (§11) |
| Lacunas novas trazidas pelos documentos-modelo do Instituto (elegibilidade, certificação, dados nominais, prorrogação de ofício) | Vão ao Instituto por escrito antes de virar requisito; a seção 8 recebe nesta sprint só o que já está decidido |

---

## 5. Capacidade da equipe

### 5.1 Calendário detalhado da Sprint

| Data | Dia | Natureza | Capacidade produtiva |
|---|---|---|---|
| 06/10 | terça | Sprint Review 2 e Retrospectiva 2 | Nula — cerimônia |
| 07/10 | quarta | Preparação da atividade de sala; Sprint Planning 3 à noite | Reduzida |
| 08/10 | quinta | Provas de integrantes; atividade em sala; reunião de confirmação do MVP com o Instituto | Reduzida |
| 09/10 | sexta | Integração dos pull requests da Sprint 2; fluxo de branches e linhas de código | Reduzida |
| 10/10 e 11/10 | fim de semana | Pull requests da Unidade 2, se necessário | Não contada |
| 12/10 | segunda | Feriado; prazo interno dos pull requests da Unidade 2 (20h) | Não contada |
| 13/10 | terça | Publicação da Unidade 2 antes das 8h; aula de apresentação | Reduzida |
| 14/10 | quarta | Base técnica: esqueletos e ambiente local | Plena |
| 15/10 | quinta | Alinhamento técnico com o Instituto; base técnica | Reduzida |
| 16/10 | sexta | Primeiro ambiente de teste; sub-issues das histórias | Plena |
| 19/10 | segunda | Produção | Plena |
| 20/10 | terça | Sprint Review 3 e Retrospectiva 3 | Nula — cerimônia |

**Síntese:** 10 dias úteis no período; 3 de capacidade plena (14/10, 16/10 e 19/10), 5 reduzidos e 2 de cerimônia. **Até 13/10 não há dia pleno:** a entrega da Unidade 2 se faz em dias reduzidos, no fim de semana e no feriado.

**Consequência para o dimensionamento.** Os itens *Must* da Unidade 2 concentram-se antes de 13/10, com prazo interno em 12/10, 20h, para a revisão e o pull request consolidado. A base técnica e o início das histórias ficam para os três dias plenos da segunda semana; o que não couber vai para a Sprint 4, com registro (ata de 07/10, D10).

### 5.2 Perfil da equipe para os produtos de trabalho desta Sprint

| Integrante | Papel | Foco nesta Sprint |
|---|---|---|
| Vinicius Vieira | Scrum Master · dupla com Lucas | Integração e publicação da Unidade 2; fluxo de branches e base técnica; épicos Pessoas e Presença em campo |
| Lucas de Paula Leal | Dupla com Vinicius | Dojo pendente; épicos Pessoas e Presença em campo; aba Entregas da revisão editorial; seção 4 com Caio |
| Maria Eduarda Marques | Product Owner · dupla com Caio | Atas e conferência com o Instituto; alinhamento técnico de 15/10; épicos Relatório e Atividade |
| Caio Martins | Dupla com Maria Eduarda | Seção 4 (apontamentos do docente); alcance do MVP no cronograma; épicos Relatório e Atividade |
| Daniel Batista | Dupla com Rodrigo | Épicos Requisito e meta e Evidência; primeira fatia vertical (HU-01); lições aprendidas e papéis de ER já publicados |
| Rodrigo Henrique Donato | Dupla com Daniel | Síntese de entregas e checklist da Unidade 2; épicos Requisito e meta e Evidência |

Referência de capacidade: cerca de 2 horas por dia por integrante 🟨, como na Sprint 2. Caio e Maria Eduarda tiveram provas em 08/10.

---

## 6. Product Backlog e Sprint Backlog

### 6.1 Histórias selecionadas para a sprint

O Product Backlog (épicos, histórias, priorização e MVP) está na [seção 10](../../requisitos/10-backlog.md); a situação de cada item, no quadro do projeto. Esta sprint seleciona as oito histórias da primeira entrega (seção 10.2.6): HU-01, HU-02 e HU-14; HU-05 e HU-13, em recorte parcial; HU-07, HU-08 e HU-15; mais o cadastro da atividade, parte da HU-03. As demais continuam no Product Backlog, sem sprint.

"Iniciada", para a meta, significa: história conferida contra a DoR pela dupla dona do épico, dividida se preciso, com as sub-issues de construção abertas e a primeira fatia vertical em andamento. As duplas e os épicos de cada uma estão na seção 8.

### 6.2 Sprint Backlog

**Parte A — Entrega da Unidade 2** (pull request aprovado até 12/10, 20h)

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| U01 | Integrar os pull requests aprovados da Sprint 2 e publicar a Unidade 2 na versão marcada: pull request consolidado da homologação, tag `u2-2026-10-13` e execução manual da publicação antes da aula | Organização e atualização | Vinicius | Must | 13/10, 8h |
| U02 | Seção 4: responder aos apontamentos do docente sobre a abordagem ágil, o OpenUP, o quadro comparativo e o ScrumXP, com comentário na issue do docente | Verificação e validação | Caio e Lucas | Must | 12/10 |
| U03 | Síntese de entregas da Unidade 2: catálogo, situação, checklist, rastreamento das Atividades 2 a 4 e vídeo | Organização e atualização | Rodrigo | Must | 12/10 |
| U04 | Atas de 28/09 e 08/10 conferidas pelo Instituto; correções da ata de 08/10 publicadas | Organização e atualização | Maria Eduarda | Must | 12/10 |
| U05 | Vídeo da Unidade 2: exigência conferida no Plano de Ensino; roteiro, gravação com os seis integrantes e publicação | Não se aplica | Equipe | Must | 12/10 |
| U06 | Checklist da Unidade 2 no README, com o link do vídeo | Organização e atualização | Rodrigo | Must | 12/10 |
| U07 | Alcance do MVP no cronograma (seção 6.3) alinhado à seção 10 e à confirmação de 08/10 | Verificação e validação | Caio | Must | 12/10 |
| U08 | Revisão editorial: pull request das seções 1, 2, 3, 5 e 7 e das páginas de apoio integrado à homologação; abas Requisitos e Entregas | Organização e atualização | Equipe revisa; Daniel (Requisitos) e Lucas (Entregas) | Should | 12/10 |
| U09 | Seção 10: registro da confirmação de 08/10 na 10.2.8; seção 8: só os ajustes já decididos da Atividade 3 | Organização e atualização | Vinicius | Should | 12/10 |
| U10 | Comentários nas issues do docente com a localização de cada ajuste, depois da publicação | Organização e atualização | Vinicius; Caio e Lucas (seção 4) | Should | 13/10 |

**Parte B — Base técnica e construção** (de 13/10 a 20/10)

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| B01 | Linhas `api-develop`/`api` e `web-develop`/`web` criadas, com integração contínua e guarda de branches próprias | Não se aplica | Vinicius | Must | 09/10 (concluído) |
| B02 | Esqueleto da API: NestJS, Prisma e PostgreSQL; lint, testes e build na integração contínua; migração inicial de instrumento, projeto, requisito e meta | Não se aplica | Vinicius; dupla a definir no refinamento | Should | 16/10 |
| B03 | Esqueleto do front: Next.js, TanStack Query e shadcn/ui; lint, testes e build; leiaute base usável em celular | Não se aplica | Vinicius; dupla a definir no refinamento | Should | 16/10 |
| B04 | Autenticação e perfis de acesso por departamento e função, com testes | Não se aplica | Vinicius; dupla a definir no refinamento | Should | 20/10 |
| B05 | Ambiente local por Compose; homologação da API e do front publicada; endereço no site; backup com teste de restauração | Não se aplica | Vinicius | Should | 20/10 |
| H01 | Histórias da primeira entrega conferidas contra a DoR pela dupla dona, divididas onde preciso (HU-05, HU-13 e o cadastro da atividade da HU-03), com as sub-issues de construção abertas | Declaração | duplas donas | Must | 13/10 |
| H02 | Primeira fatia vertical da HU-01 (cadastrar instrumento, projeto e meta) em andamento na API e no front | Declaração | Daniel e Rodrigo | Should | 20/10 |
| H03 | Primeira fatia vertical da HU-07 (inscrição por link) em andamento | Declaração | Vinicius e Lucas | Could | 20/10 |

**Parte C — Pendências que continuam**

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| P01 | Dojo pendente da Sprint 1: pull request e fechamento dos registros dos dojos | Organização e atualização | Lucas, com apoio de Vinicius | Should | 16/10 |
| P02 | Plano da Sprint 3 publicado | Organização e atualização | Vinicius | Must | 12/10 |
| P03 | Alinhamento técnico com o Instituto (15/10): tabelas, campos de inscrição, perfis de acesso; perguntas dos documentos-modelo por escrito | Elicitação e descoberta | Vinicius, Daniel e Maria Eduarda | Should | 15/10 |
| P04 | Preparação da Review 3 e da revisão da primeira entrega com o Instituto | Organização e atualização | Vinicius e Maria Eduarda | Should | 20/10 |

---

## 7. Priorização

### 7.1 Dois horizontes

| Horizonte | Pergunta | Objeto | Escala |
|---|---|---|---|
| **A — trabalho da Sprint 3** | O item é indispensável para a meta da sprint? | Itens do Sprint Backlog (§6.2) | MoSCoW |
| **B — produto e MVP** | O requisito é indispensável no primeiro recorte utilizável pelo Instituto? | Cada requisito funcional | Definido na Sprint 2 (seção 10.2.6) e confirmado pelo Instituto em 08/10 |

### 7.2 Aplicação nesta sprint (horizonte A)

- **Must:** U01 a U07, B01, H01 e P02 — o que a entrega da Unidade 2 exige e o que a meta nomeia como "histórias iniciadas".
- **Should:** U08 a U10, B02 a B05, H02, P01, P03 e P04 — a base técnica e a primeira fatia, nos três dias plenos da segunda semana.
- **Could:** H03 — primeira a descer se a sprint apertar.

**Verificação de capacidade.** A primeira semana tem só dias reduzidos e a entrega da Unidade 2 ocupa toda ela; a proporção de *Must* sobre o esforço fica acima de 60% até 13/10 e abaixo depois. Se a Unidade 2 apertar, fatia-se o *Must*: a revisão editorial entra pelo que já está aprovado (U08) e o restante fica para a homologação seguinte; o vídeo segue o modelo da Unidade 1 sem roteiro novo. Se a base técnica apertar, B04 e B05 vão para a Sprint 4 com registro no quadro e comunicação ao Instituto (ata de 07/10, D10).

### 7.3 Ordem de construção (horizonte B)

A ordem é a da seção 10.2.6, confirmada pelo Instituto em 08/10. Dentro de cada história, a primeira fatia é vertical: API e tela juntas para um critério de aceitação, antes de ampliar. A autenticação e os perfis (B04) precedem qualquer tela com dados de pessoas.

---

## 8. Alocação de responsabilidades

| Dupla | Integrantes | Itens | Fundamento da alocação |
|---|---|---|---|
| **Pessoas, Presença em campo e coordenação** | Vinicius Vieira · Lucas de Paula Leal | U01, U09, U10, B01 a B05, H03, P01 a P04; U02 e U08 (Lucas) | Scrum Master responde pela integração, pela publicação e pela infraestrutura; Lucas conclui o dojo e a aba Entregas |
| **Relatório, Atividade e interlocução** | Maria Eduarda Marques · Caio Martins | U04, P03 (Maria Eduarda); U02, U07 (Caio); H01 nos seus épicos | Product Owner conduz a conferência com o Instituto; Caio responde pela seção 4 e pelo cronograma |
| **Requisito e meta, Evidência** | Daniel Batista · Rodrigo Henrique Donato | U03, U06 (Rodrigo); U08 aba Requisitos (Daniel); H01 nos seus épicos; H02 | Donos do primeiro épico da construção; primeira fatia vertical na HU-01 |
| **Equipe** | — | U05; revisão de pull request em até 24 horas por integrante de outra dupla, com aviso no grupo | Decisões de 06/10 e 07/10 |

---

## 9. Registro de riscos

| ID | Risco | Prob. | Impacto | Mitigação | Responsável |
|---|---|---|---|---|---|
| R01 | Publicação depois das 8h de 13/10 conta como entrega atrasada (Plano de Ensino, §9.1) | Média | Alto | Prazo interno em 12/10, 20h; congelamento do deploy ativo; publicação manual com a tag na noite de 12/10 e conferência do site | Vinicius |
| R02 | Atas de 28/09 e 08/10 sem conferência do Instituto até a entrega | Alta | Médio | Mensagens de conferência enviadas em 09/10; as atas seguem no site como preliminares, com a situação no histórico; a evidência da validação está também na seção 10.2.8 | Maria Eduarda |
| R03 | Capacidade reduzida na primeira semana (provas, feriado, aula) | Alta | Alto | *Must* da Unidade 2 fatiado (§7.2); base técnica só na segunda semana | Vinicius |
| R04 | Decisões da base técnica (gerenciador de pacotes, lint, Compose) sem fechamento, atrasando os esqueletos | Média | Médio | Propostas registradas na tarefa de base técnica; fechamento por mensagem até 13/10, sem reunião | Vinicius |
| R05 | Exigência do vídeo da Unidade 2 não confirmada no Plano de Ensino | Média | Baixo | Conferir antes de gravar; se não exigido, o item cai | Equipe |
| R06 | Sem permissão de administrador no repositório: proteção de branch e método de merge único indisponíveis | Alta | Médio | Guarda de branches, verificação de push e acordo de trabalho publicados; *squash* desabilitado pela interface | Vinicius |
| R07 | Dojo pendente atrasa a entrada de Lucas na construção | Média | Médio | Sessão de apoio marcada; dojo concluído até 16/10 | Lucas e Vinicius |
| R08 | Dados pessoais em capturas, atas ou documentos do Instituto | Média | Alto | Revisão de dados sensíveis antes de publicar; documentos-modelo do Instituto não se publicam | Maria Eduarda e Vinicius |

---

## 10. Critérios de aceitação da Sprint

| ID | Critério | Verificação |
|---|---|---|
| CAS-01 | Unidade 2 publicada a partir da tag `u2-2026-10-13` antes das 8h de 13/10 | Tag na `main`, tag `-pages` na publicação e site no ar |
| CAS-02 | MVP confirmado pelo Instituto, com ata enviada para conferência e registro na seção 10.2.8 | Ata de 08/10 e seção 10 |
| CAS-03 | Seção 4 respondida ao docente, com comentário na issue dele | Seção 4 e issue |
| CAS-04 | Linhas da API e do front com integração contínua verde e esqueletos com lint, testes e build passando | Execuções no Actions |
| CAS-05 | As oito histórias da primeira entrega conferidas contra a DoR, com sub-issues de construção abertas | Quadro do projeto |
| CAS-06 | Primeiro ambiente de teste no ar, com o endereço registrado no site | Página de processo e mensagem no grupo |
| CAS-07 | Adesão às dailies no próprio dia igual ou acima de 80% na sprint | Registro das dailies |
| CAS-08 | Nenhum pull request sem revisão por mais de 24 horas sem aviso no grupo | Histórico dos pull requests |

---

## 11. Encaminhamentos posteriores ao Planning

| Tema | Encaminhamento | Situação |
|---|---|---|
| Segundo épico de cada dupla (ata de 07/10, P2) | Daniel e Rodrigo: Evidência, pela ligação da evidência à meta; Caio e Maria Eduarda: Atividade; Vinicius e Lucas: Presença em campo, pela ligação da inscrição à presença | Definido em 09/10 |
| Confirmação do MVP pelo Instituto (ata de 07/10, A4) | Reunião de 08/10 com o núcleo pedagógico: oito capacidades confirmadas; alinhamento técnico em 15/10; revisão da primeira entrega por volta de 21/10 | Feito em 08/10 |
| Fluxo de branches e publicação (ata de 07/10, D3) | Em vigor desde 09/10: `docs-homologacao`, congelamento do deploy, tag da Unidade 1, linhas da API e do front | Feito em 09/10 |
| Tags de entrega automáticas (ata de 07/10, D4) | Sem origem declarada nem pull request; tratada como proposta a avaliar depois da Unidade 2, fora desta sprint | Proposta |
| Sub-tarefas da base técnica (ata de 07/10, D9) | Cinco sub-tarefas abertas, uma concluída (linhas de código); donos por dupla definidos no refinamento | Abertas em 09/10 |
| Ajustes restantes da lista de requisitos (Atividade 3) | Só o já decidido entra antes de 13/10; lacunas dos documentos-modelo vão ao Instituto por escrito | 🔧 A confirmar |

---

## Anexo A — Plano de execução

| Data | Atividade | Responsáveis |
|---|---|---|
| 09/10 | Integração dos pull requests da Sprint 2; fluxo de branches em vigor; linhas de código; sub-tarefas e quadro na Sprint 3; pull request da revisão editorial | Vinicius |
| 10/10 a 12/10 | Pull requests da Unidade 2 para a homologação: seção 4, síntese, README, cronograma, atas corrigidas, seção 10; vídeo; revisão em até 24 horas | duplas |
| 12/10, 20h | Pull request consolidado da homologação para a `main`; tag `u2-2026-10-13`; publicação manual e conferência | Vinicius |
| 13/10 | Aula de apresentação; comentários nas issues do docente; fechamento das decisões da base técnica | equipe; Vinicius |
| 14/10 | Esqueletos da API e do front; ambiente local | Vinicius; duplas |
| 15/10 | Alinhamento técnico com o Instituto | Vinicius, Daniel e Maria Eduarda |
| 16/10 e 19/10 | Autenticação e perfis; primeiro ambiente de teste; primeira fatia da HU-01; dojo | duplas |
| 20/10 | Sprint Review 3 e Retrospectiva 3; Planning 4 | equipe |

---

## Controle de versões

| Versão | Data | Alteração | Responsável |
|---|---|---|---|
| 1.0 | 09/10/2026 | Emissão com o deliberado na Sprint Planning de 07/10 e nos encaminhamentos de 08/10 (confirmação do MVP) e 09/10 (fluxo de branches, linhas de código, segundo épico de cada dupla): meta, calendário, Sprint Backlog em três partes, priorização, alocação, riscos e critérios de aceitação | Vinicius |
