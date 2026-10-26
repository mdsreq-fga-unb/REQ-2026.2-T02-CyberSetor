# Plano da Sprint 4 — Projeto CyberSetor

**Documento de planejamento e priorização da Sprint 4**

| Campo | Conteúdo |
|---|---|
| **Código do documento** | C34 |
| **Versão** | 1.1 |
| **Data de emissão** | 21 de outubro de 2026 |
| **Projeto** | CyberSetor — sistema de gestão do ciclo de projetos financiados |
| **Cliente** | Instituto Cultural e Social No Setor |
| **Disciplina** | FGA0313 — Requisitos de Software · Turma 02 · 2026.2 · FCTE/UnB |
| **Docente** | Prof. George Marsicano |
| **Sprint** | Sprint 4 |
| **Período da Sprint** | 20/10/2026 (terça-feira) a 03/11/2026 (terça-feira) — 2 semanas |
| **Elaboração** | Vinicius Angelo de Brito Vieira (Scrum Master) |
| **Product Owner** | Maria Eduarda Denis Duarte Marques |
| **Situação** | Emitido com o deliberado no Sprint Planning de 20/10/2026 e na realocação de 21/10; revisto com a remarcação da reunião com o Instituto e o remanejamento de 22/10 |

---

## 1. Objetivo e escopo do documento

Este documento estabelece o planejamento da Sprint 4: período, meta, capacidade, Sprint Backlog, priorização, alocação por dupla, riscos e critérios de aceitação da sprint. É a sprint que conclui o MVP em homologação.

**Não integram o escopo deste documento:** os requisitos declarados ([seção 8](../../requisitos/8-requisitos.md)); a DoR e a DoD ([seção 9](../../requisitos/9-dor-dod.md)); o backlog do produto, a priorização e o MVP ([seção 10](../../requisitos/10-backlog.md)); o fluxo de branches e de publicação ([Boas práticas no GitHub](../boas-praticas-github.md)); a situação corrente de cada item, que fica no quadro do projeto.

---

## 2. Referências

### 2.1 Base de elaboração deste plano

Ata da Sprint Review 3, Retrospectiva 3 e Sprint Planning 4 (20/10/2026); ata da confirmação do MVP com o Instituto (08/10/2026); [plano da Sprint 3](sprint-3.md) (C25); seção 10.1 (histórias derivadas dos requisitos) e 10.2.6 (MVP e incrementos); seção 6 (calendário: MVP concluído na Sprint 4, checkpoint de 29/10); Plano de Ensino da disciplina (§9.1 e §9.2 sobre publicação e endereço do produto).

### 2.2 Referencial teórico

MARSICANO, G. **Requisitos de Software: Comunicação é tudo!** v1.1 draft. Brasília: FCTE/UnB, 2026. §5.3 (atividades de Engenharia de Requisitos); cap. 9 (declaração de requisitos por nível de abstração).

SCHWABER, K.; SUTHERLAND, J. **The Scrum Guide**. 2020. — Sprint Goal, Sprint Backlog, Definition of Done e itens não concluídos.

BECK, K. **Extreme Programming Explained: Embrace Change.** 2. ed. Addison-Wesley, 2004. — fatias pequenas, integração contínua e programação em pares.

---

## 3. Contexto

A Sprint 3 terminou com a meta **parcialmente atingida**: a Unidade 2 foi publicada na versão marcada antes de 13/10, o Instituto confirmou o MVP em 08/10, o ambiente local foi definido e a base técnica da API e do front foi integrada com integração contínua. A homologação não foi publicada e as primeiras histórias (contas, HU-16; instrumento, HU-01a) ficaram em pull request, porque a construção só começou depois da Unidade 2, das provas e da saída de um integrante em 13/10.

O backlog foi reestruturado em vinte e cinco histórias, uma por ator e resultado (seção 10.1), e a equipe o ratifica pela revisão do pull request correspondente. A reunião com o Instituto prevista para 22/10 não ocorreu e passou para 29/10 (quinta-feira), que reúne a demonstração da primeira entrega, as perguntas sobre os pontos em aberto da seção 8.6 e o checkpoint, com um projeto real e dados minimizados.

---

## 4. Definição da Sprint

### 4.1 Período e cadência

| Evento | Data | Horário | Observação |
|---|---|---|---|
| Sprint Planning 4 | 20/10 (terça) | 20h56 | Na mesma reunião da Review 3 e da Retrospectiva 3 |
| Reunião com o Instituto — prevista | 22/10 (quinta) | — | Não ocorreu; passou para 29/10 |
| Reuniões da equipe | terças e quintas | entre 20h e 23h | Meet, com transcrição |
| Reunião com o Instituto — demonstração da primeira entrega, pontos em aberto da seção 8.6 e checkpoint | 29/10 (quinta) | a combinar com o Instituto | Um projeto real, dados minimizados |
| Sprint Review 4 e Retrospectiva 4 | 03/11 (terça) | à noite | — |
| Sprint Planning 5 | 03/11 (terça) | na mesma reunião | — |

### 4.2 Meta da Sprint

> **Ao final da Sprint 4, o MVP está completo em homologação: os dois ciclos da seção 10.2.6 — do instrumento ao relatório e da atividade à lista de inscritos — com os direitos do titular, conferidos com o Instituto no checkpoint de 29/10 e na Review de 03/11.**

**Como a meta se verifica:** as dezesseis histórias do MVP (seção 10.2.6) em Done no quadro, cada uma com os critérios de aceitação exercitados em homologação; endereço da homologação registrado no site; checkpoint de 29/10 realizado com ata.

**Recorte da primeira entrega (29/10):** as histórias publicadas na homologação até a véspera, cada uma com o seu percurso; as que não estiverem publicadas vão ao Instituto com data, até 03/11.

---

## 5. Capacidade da equipe

### 5.1 Calendário detalhado da Sprint

| Data | Dia | Natureza | Capacidade produtiva |
|---|---|---|---|
| 20/10 | terça | Review 3, Retrospectiva 3 e Planning 4 | Nula — cerimônia |
| 21/10 | quarta | Revisão e integração dos pull requests; homologação | Reduzida |
| 22/10 | quinta | Aula; a reunião com o Instituto não ocorreu | Reduzida |
| 23/10 | sexta | Construção; issues das histórias migradas | Plena |
| 24/10 e 25/10 | fim de semana | — | Não contada |
| 26/10 | segunda | Construção | Plena |
| 27/10 | terça | Construção; reunião da equipe | Plena |
| 28/10 | quarta | Construção | Plena |
| 29/10 | quinta | Reunião com o Instituto: demonstração e checkpoint | Reduzida |
| 30/10 | sexta | Construção | Plena |
| 31/10 a 02/11 | fim de semana e Finados | Não contada |
| 03/11 | terça | Sprint Review 4 e Retrospectiva 4 | Nula — cerimônia |

**Síntese:** 10 dias úteis; 5 de capacidade plena, 3 reduzidos e 2 de cerimônia. A primeira semana começa com a homologação; a construção das histórias novas se concentra de 23/10 a 30/10.

### 5.2 Perfil da equipe para os produtos de trabalho desta Sprint

| Integrante | Papel | Foco nesta Sprint |
|---|---|---|
| Vinicius Vieira | Scrum Master · independente | Homologação e integração; HU-01a (documento formal e projeto), HU-01b, HU-02a, HU-02b (com Daniel e Rodrigo), HU-16, HU-15a, HU-15b e HU-05b; revisão dos pull requests das duplas; apoio às duas frentes |
| Maria Eduarda Marques | Product Owner · dupla com Caio | Reunião de 29/10, com demonstração e checkpoint; HU-03a, HU-07a, HU-07b, HU-07c e HU-08; revisão dos pull requests da outra dupla |
| Caio Martins | Dupla com Maria Eduarda | HU-03a e inscrições (HU-07a, HU-07b, HU-07c, HU-08) |
| Daniel Batista | Dupla com Rodrigo | HU-02b (com Vinicius), HU-14, HU-13 e HU-05a; revisão dos pull requests da outra dupla |
| Rodrigo Henrique Donato | Dupla com Daniel | HU-02b (com Vinicius), HU-14, HU-13 e HU-05a; revisão dos pull requests da outra dupla e da documentação |

Referência de capacidade: cerca de 2 horas por dia por integrante, como nas sprints anteriores. Padrões para copiar: módulo `instruments` na API; telas de lista e componentes comuns no front, descritos no README do front.

---

## 6. Product Backlog e Sprint Backlog

### 6.1 Histórias selecionadas para a sprint

As dezesseis histórias do MVP (seção 10.2.6): Requisito e meta HU-01a, HU-01b, HU-02a, HU-02b e HU-14; Atividade HU-03a; Pessoas HU-07a, HU-07b, HU-07c, HU-08, HU-15a, HU-15b e HU-16; Relatório HU-05a, HU-05b e HU-13. As demais continuam no Product Backlog, sem sprint. HU-16 e HU-01a (parte) já estão em pull request.

### 6.2 Sprint Backlog

**Parte A — Homologação e integração** (21/10 a 29/10)

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| A01 | Pull requests da autenticação, das imagens de implantação, das contas e do instrumento revisados e integrados na ordem de dependência | Não se aplica | revisores; Vinicius integra | Must | 21/10 (concluído em 20/10) |
| A02 | Pull request das histórias derivadas revisado e integrado; issues das histórias migradas para as histórias com letra e HU-16; tarefas remanejadas; quadro na Sprint 4 | Organização e atualização | equipe revisa; Vinicius aplica | Must | 21/10 (concluído) |
| A03 | Homologação da API e do front publicada, com banco privado, backup com teste de restauração e endereço registrado no site | Não se aplica | Vinicius | Must | 21/10; endereço no site até 03/11 |
| A04 | Reunião com o Instituto, remarcada de 22/10 para 29/10: demonstração da primeira entrega, perguntas fechadas sobre os pontos em aberto da seção 8.6; respostas aplicadas na documentação em pull request seguinte | Validação | Vinicius e Maria Eduarda; equipe | Must | 29/10; documentação até 03/11 |

**Parte B — Histórias do MVP** (23/10 a 30/10)

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| B01 | HU-01a: documento formal (anexo) e projeto | Declaração | Vinicius | Must | 27/10 |
| B02 | HU-01b: requisitos do instrumento e metas com parâmetros | Declaração | Vinicius | Must | 27/10 |
| B03 | HU-02a: responsável, setor, prazo e situação da meta | Declaração | Vinicius | Must | 29/10 |
| B04 | HU-03a: modalidades e atividades ligadas a metas | Declaração | Maria Eduarda e Caio | Must | 27/10 |
| B05 | HU-07b e HU-07a: abertura da inscrição e formulário público | Declaração | Maria Eduarda e Caio | Must | 30/10 |
| B06 | HU-07c e HU-08: vaga ou lista de espera; inscrição presencial | Declaração | Maria Eduarda e Caio | Should | 03/11 |
| B07 | HU-02b e HU-14: painel de prazos com avisos; termo aditivo como nova versão | Declaração | Daniel e Rodrigo; Vinicius na HU-02b | Should | 03/11 |
| B08 | HU-15a e HU-15b: correção, exclusão e anonimização a pedido do titular | Declaração | Vinicius | Should | 03/11 |
| B09 | HU-05a: relatório com resultado alcançado e justificativa, depois da HU-02a | Declaração | Daniel e Rodrigo | Should | 03/11 |
| B10 | HU-13: planilha do projeto, depois da HU-02a | Declaração | Daniel e Rodrigo | Should | 03/11 |
| B11 | HU-05b: relatório em PDF, depois da HU-05a | Declaração | Vinicius | Should | 03/11 |

**Parte C — Processo e documentação**

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| C01 | Ata de 20/10 e ata da reunião de 29/10 publicadas; ata de 29/10 conferida pelo Instituto | Organização e atualização | relator; Maria Eduarda | Must | 24/10 (ata de 20/10); 03/11 (ata de 29/10) |
| C02 | Conferência das atas de 28/09 e 08/10 pelo Instituto; registro de 08/10 e 29/10 na 10.2.8 | Organização e atualização | Maria Eduarda | Should | 29/10 |
| C03 | Plano da Sprint 4 publicado (este documento) | Organização e atualização | Vinicius | Must | 21/10 |
| C04 | Reunião de 29/10, que reúne a demonstração da primeira entrega e o checkpoint, com um projeto real e dados minimizados: preparação e ata | Validação | Maria Eduarda e Vinicius | Must | 29/10 |
| C05 | Apontamento do docente sobre a seção 4 concluído e respondido | Verificação e validação | Caio | Should | 27/10 |

---

## 7. Priorização

### 7.1 Dois horizontes

| Horizonte | Pergunta | Objeto | Escala |
|---|---|---|---|
| **A — trabalho da Sprint 4** | O item é indispensável para a meta da sprint? | Itens do Sprint Backlog (§6.2) | MoSCoW |
| **B — produto e MVP** | O requisito é indispensável no primeiro recorte utilizável pelo Instituto? | Cada requisito funcional | Seção 10.2.6, confirmada em 08/10 |

### 7.2 Aplicação nesta sprint (horizonte A)

- **Must:** A01 a A04, B01 a B05, C01, C03 e C04 — a homologação, a primeira entrega e o ciclo do instrumento à meta com a atividade e a inscrição aberta.
- **Should:** B06 a B11, C02 e C05 — fecham os dois ciclos do MVP; se a velocidade ficar abaixo do necessário, descem para a Sprint 5 na ordem HU-05b, depois HU-14, depois só o aviso por e-mail da HU-02b (CA-02b.4), com aviso ao Instituto. HU-15a e HU-15b não descem enquanto a inscrição pública puder receber dado real.

**Verificação de capacidade.** Cinco dias plenos para nove histórias novas em duas duplas e um integrante independente, com a distribuição da seção 8. A contenção é por história inteira; a única exceção é o aviso por e-mail da HU-02b, que pode descer sozinho, e nesse caso a HU-02b só é concluída quando ele for entregue.

### 7.3 Ordem de construção (horizonte B)

Depois de 22/10: HU-01a (documento e projeto), HU-01b, HU-02a e HU-03a; em seguida inscrições (HU-07b, HU-07a, HU-07c, HU-08), HU-02b e HU-14, HU-15a e HU-15b, HU-05a, HU-05b e HU-13. Dentro de cada história, a primeira fatia é vertical: API e tela para um critério de aceitação, em pull request de até 1.000 linhas (alvo 500), antes de ampliar. Branches com o código da história com letra (`feat/api/HU-01b-...`).

---

## 8. Alocação de responsabilidades

| Dupla ou integrante | Histórias | Padrão de referência |
|---|---|---|
| Daniel e Rodrigo | HU-02b (com Vinicius), HU-14, HU-13, HU-05a | módulo `instruments` da API e tela de instrumentos |
| Maria Eduarda e Caio | HU-03a, HU-07a, HU-07b, HU-07c, HU-08 | tela de contas e componentes de lista |
| Vinicius | HU-01a (documento formal e projeto), HU-01b, HU-02a, HU-02b (com Daniel e Rodrigo), HU-16, HU-15a, HU-15b, HU-05b; homologação e integração; revisão dos pull requests das duplas | — |

Revisão cruzada: pull request de uma dupla é revisado pela outra ou por Vinicius, e o de Vinicius, por integrante de uma das duplas, em até 24 horas, com aviso no grupo quando vencer.

---

## 9. Registro de riscos

| # | Risco | Probabilidade | Impacto | Resposta |
|---|---|---|---|---|
| R1 | Homologação sem link na reunião de 29/10 | Baixa | Alto | Pull requests já integrados; sem o link, demonstração local por compartilhamento de tela |
| R2 | Duplas sem ambiente local funcionando | Baixa | Alto | Execução local em 21/10 com retorno no grupo; READMEs da API e do front; apoio de Vinicius |
| R3 | Respostas do Instituto em 29/10 mudam critérios de aceitação (cadastro repetido, prorrogação, número de processo, código do projeto, conta por pessoa) | Média | Médio | Critérios marcados como pendentes nas histórias; pull request de documentação até 03/11 |
| R4 | Velocidade abaixo do necessário para nove histórias novas | Alta | Alto | Remanejamento de 22/10; contenção de 7.2 (HU-05b, HU-14, aviso por e-mail da HU-02b); aviso ao Instituto na reunião de 29/10 |
| R5 | Armazenamento e módulo de anexos (HU-01a, RF02) atrasam o documento formal | Média | Médio | Armazenamento criado com a homologação; projeto antes do documento formal, se preciso |
| R6 | Atas de 28/09 e 08/10 sem conferência do Instituto | Alta | Baixo | Conferência pedida até a reunião de 29/10; registro de 08/10 na 10.2.8 só depois dela |

---

## 10. Critérios de aceitação da Sprint

| ID | Critério | Verificação |
|---|---|---|
| CAS-01 | Homologação da API e do front no ar, com banco privado, backup testado e endereço no site | Página de processo; registro do teste de restauração |
| CAS-02 | Pull requests da base e da primeira fatia integrados; issues das histórias migradas | Repositório e quadro |
| CAS-03 | Primeira entrega apresentada ao Instituto na reunião de 29/10, com ata conferida; respostas aos pontos em aberto da seção 8.6 aplicadas | Ata de 29/10; seções 8 e 10 |
| CAS-04 | Histórias *Must* da Parte B em Done, exercitadas em homologação | Quadro do projeto |
| CAS-05 | Checkpoint realizado na reunião de 29/10, com um projeto real e dados minimizados | Ata de 29/10 |
| CAS-06 | Nenhum pull request de código acima de 1.000 linhas; nenhum sem revisão por mais de 24 h sem aviso | Histórico dos pull requests |
| CAS-07 | Adesão às dailies no próprio dia igual ou acima de 80% | Registro das dailies |

---

## 11. Encaminhamentos posteriores ao Planning

Os pull requests da base técnica e da primeira fatia foram revisados e integrados na noite de 20/10.

**21/10 — realocação do Relatório.** A distribuição do Planning deixou catorze issues com Maria Eduarda e Caio e quatro com Daniel e Rodrigo. Ajuste: HU-05a e HU-05b com Vinicius; HU-13 com Daniel e Rodrigo, que constroem a HU-02a de que ela depende; Maria Eduarda e Caio com o ciclo da atividade à inscrição. A ordem de contenção da seção 7.2 não muda.

**22/10 — reunião com o Instituto remarcada.** A reunião prevista para 22/10 não ocorreu e passou para 29/10 (quinta-feira), que reúne a demonstração da primeira entrega e o checkpoint. Os itens, riscos e critérios de aceitação que dependiam de 22/10 passam a essa data.

**22/10 — remanejamento.** Combinado no grupo da equipe: HU-01b e HU-02a passam a Vinicius; HU-05a passa a Daniel e Rodrigo, com a HU-14 e a HU-13; HU-02b fica com Vinicius, Daniel e Rodrigo; HU-05b continua com Vinicius. A ordem de contenção da seção 7.2 passa a HU-05b, depois HU-14, depois só o aviso por e-mail da HU-02b; HU-15a e HU-15b não descem enquanto a inscrição pública puder receber dado real.

As respostas do Instituto em 29/10 entram em nova versão deste plano.

---

## Controle de versões

| Versão | Data | Alteração | Responsável |
|---|---|---|---|
| 1.0 | 21/10/2026 | Emissão com o deliberado no Sprint Planning de 20/10 e na realocação de 21/10: meta, calendário, Sprint Backlog em três partes, priorização, alocação, riscos e critérios de aceitação | Vinicius |
| 1.1 | 26/10/2026 | Reunião com o Instituto remarcada de 22/10 para 29/10 (quinta-feira), com demonstração e checkpoint; remanejamento de 22/10 no perfil da equipe, no Sprint Backlog e na alocação; nova ordem de contenção; itens, riscos e critérios de aceitação ajustados à nova data | Vinicius Vieira |
