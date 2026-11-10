# Plano da Sprint 5 — Projeto CyberSetor

**Documento de planejamento e priorização da Sprint 5**

| Campo | Conteúdo |
|---|---|
| **Código do documento** | C35 |
| **Versão** | 1.0 |
| **Data de emissão** | 10 de novembro de 2026 |
| **Projeto** | CyberSetor — sistema de gestão do ciclo de projetos financiados |
| **Cliente** | Instituto Cultural e Social No Setor |
| **Disciplina** | FGA0313 — Requisitos de Software · Turma 02 · 2026.2 · FCTE/UnB |
| **Docente** | Prof. George Marsicano |
| **Sprint** | Sprint 5 |
| **Período da Sprint** | 05/11/2026 (quinta-feira) a 19/11/2026 (quinta-feira) — 2 semanas |
| **Elaboração** | Vinicius Angelo de Brito Vieira (Scrum Master) |
| **Product Owner** | Maria Eduarda Denis Duarte Marques |
| **Situação** | Emitido com o deliberado na Sprint Planning de 05/11/2026 (ATA-2026-11-05) |

---

## 1. Objetivo e escopo do documento

Este documento estabelece o planejamento da Sprint 5: período, meta, capacidade, Sprint Backlog, priorização, alocação por dupla, riscos e critérios de aceitação da sprint. É a sprint que conclui o MVP em código e publica a Unidade 3.

**Não integram o escopo deste documento:** os requisitos declarados ([seção 8](../../requisitos/8-requisitos.md)); a DoR e a DoD ([seção 9](../../requisitos/9-dor-dod.md)); o backlog do produto, a priorização e o MVP ([seção 10](../../requisitos/10-backlog.md)); o fluxo de branches, de revisão e de publicação ([Boas práticas no GitHub](../boas-praticas-github.md)); a situação corrente de cada item, que fica no quadro do projeto.

---

## 2. Referências

### 2.1 Base de elaboração deste plano

[Ata da Sprint Review 4, Retrospectiva 4 e Sprint Planning 5](../atas/2026-11-05-sprint-review-retrospectiva-planning.md) (05/11/2026); [plano da Sprint 4](sprint-4.md) (C34); balanço dos critérios de aceitação do MVP apresentado na Review 4; seção 6 (cronograma), seção 10.2.6 (MVP e incrementos); Plano de Ensino da disciplina (entrega da Unidade 3 em 17/11).

### 2.2 Referencial teórico

MARSICANO, G. **Requisitos de Software: Comunicação é tudo!** v1.1 draft. Brasília: FCTE/UnB, 2026. §5.3 (atividades de Engenharia de Requisitos).

SCHWABER, K.; SUTHERLAND, J. **The Scrum Guide**. 2020. — Sprint Goal, Sprint Backlog, Definition of Done e itens não concluídos.

BECK, K. **Extreme Programming Explained: Embrace Change.** 2. ed. Addison-Wesley, 2004. — fatias pequenas, integração contínua e programação em pares.

### 2.3 Legenda de convenções

| Marca | Significado |
|---|---|
| 🟩 | Fato confirmado junto ao cliente ou à equipe |
| 🟨 | Hipótese ainda não validada |
| 🔧 | Proposta do Scrum Master ou valor inicial, sujeito a deliberação |

---

## 3. Contexto

A Sprint 4 terminou em 05/11, dois dias depois do previsto, com a meta **parcialmente atingida** (ATA-2026-11-05, D1): dos 84 critérios de aceitação das histórias do MVP, 73 estavam implementados, 3 parcialmente e 7 ausentes, e 1 não tem efeito até a evidência do incremento 2. Os dois ciclos do MVP estão integrados e publicados em homologação. Ficaram para esta sprint a exportação em planilha (HU-13), a linha do tempo e os avisos por e-mail da HU-02b, a notificação da direção na trava do relatório (HU-05a), o acesso do perfil Órgão Concedente e Auditoria e as medições dos requisitos não funcionais do MVP.

A validação com o Instituto prevista para 05/11 foi adiada a pedido do Instituto 🟩 (ATA-2026-11-05, D10). Para orientar os testes, a equipe prepara um roteiro com slides da homologação (D7, issue #286).

A adesão às dailies apresentada na Review foi de 73%. A apuração revista depois da reunião, sem o ponto facultativo de 30/10, dá 88% nos dias de daily escrita (22 de 25 relatos), contra 76% da Sprint 3 pelo mesmo critério. Os dois números não se comparam aos 84% publicados da Sprint 3, que somam presenças; a equipe decide na Retrospectiva 5 qual critério vale daqui em diante 🔧.

Na Retrospectiva 4, a equipe passou a exigir duas aprovações por pull request e a integrá-lo logo depois da segunda, sem conflito e sem concentrar a integração numa só pessoa; tirou as linhas de teste do limite de tamanho e flexibilizou o prazo de revisão de 24 horas (D2 a D4). As duplas ficam as mesmas até o fim do semestre (D8).

---

## 4. Definição da Sprint

### 4.1 Período e cadência

| Evento | Data | Horário | Observação |
|---|---|---|---|
| Sprint Planning 5 | 05/11 (quinta) | 20h47 | Na mesma reunião da Review 4 e da Retrospectiva 4 |
| Reuniões da equipe | terças e quintas | entre 20h e 23h | Meet, com anotações automáticas |
| Reunião de validação com o Instituto | 🟨 terça ou quinta, data a definir (A3) | 🟨 a definir | Roteiro e slides da #286; registro com autorização |
| Entrega da Unidade 3 | 17/11 (terça) | 🟨 conferir no Aprender | Encerramento das mudanças na branch principal no mesmo dia (D5); −20% por dia de atraso |
| Sprint Review 5, Retrospectiva 5 e Planning 6 | 19/11 (quinta) 🔧 | à noite | Último dia da sprint |

**Exceção à cadência:** a Sprint 5 começa e termina numa quinta-feira, e não numa terça, porque a Sprint 4 terminou em 05/11 (D5). A âncora das terças volta a valer a partir da Sprint 6, se a equipe decidir 🔧.

### 4.2 Meta da Sprint

> **Ao final da Sprint 5, o MVP está 100% em código, com os critérios de aceitação exercitados, a Unidade 3 está 100% publicada, e os retornos do Instituto e as issues do docente estão fechados.**

Texto da D6 da ATA-2026-11-05.

**Como a meta se verifica 🔧:** as dezessete histórias do MVP com registro de conclusão pela DoD, ou em Aguardando com a pendência nomeada; requisitos não funcionais do MVP medidos ou com desvio registrado; site da Unidade 3 publicado com a tag `u3-2026-11-17`; retornos da reunião de validação aplicados nas seções 8 e 10; issues do docente da Unidade 2 (#177 a #188) respondidas, com o fechamento a cargo do docente.

**Exclusões explícitas 🔧:**

| Item excluído | Justificativa |
|---|---|
| HU-03b, HU-04a, HU-04b, HU-09a, HU-10 (incrementos 2 e 3) | A meta é o MVP completo; entram só com sobra, depois da Unidade 3 |
| Avisos por e-mail da inscrição e do início das atividades, recuperação de senha, campos personalizados no formulário | Pedidos de 29/10 ainda sem requisito (seção 8.6, item 15) |
| Ambiente de produção e dados reais do piloto (#174) | Depende de decisão da equipe e da formalização do tratamento de dados com o Instituto (ATA-2026-11-05, P3) |

---

## 5. Capacidade da equipe

### 5.1 Calendário detalhado da Sprint

| Data | Dia | Natureza | Capacidade produtiva |
|---|---|---|---|
| 05/11 | quinta | Review 4, Retrospectiva 4 e Planning 5 | Nula — cerimônia |
| 06/11 | sexta | Construção | Plena |
| 09/11 | segunda | Construção | Plena |
| 10/11 | terça | Aula; reunião da equipe | Reduzida |
| 11/11 | quarta | Construção | Plena |
| 12/11 | quinta | Aula; reunião da equipe | Reduzida |
| 13/11 | sexta | Construção; texto da Unidade 3 | Plena |
| 16/11 | segunda | Fechamento da Unidade 3 | Plena |
| 17/11 | terça | Entrega da Unidade 3; aula | Reduzida |
| 18/11 | quarta | Construção | Plena |
| 19/11 | quinta | Review 5, Retrospectiva 5 e Planning 6 | Nula — cerimônia |

**Síntese 🔧:** 11 dias úteis; 6 plenos, 3 reduzidos e 2 de cerimônia. Com a referência da Sprint 4, de 2 horas por dia por integrante nos dias plenos e 1 hora nos reduzidos, são cerca de 75 horas de construção. O dia da reunião de validação passa a reduzido quando for marcado. O feriado de 15/11 cai num sábado.

### 5.2 Perfil da equipe para os produtos de trabalho desta Sprint

| Integrante | Papel | Foco nesta Sprint 🔧 |
|---|---|---|
| Vinicius Vieira | Scrum Master | HU-02b (linha do tempo, painel e avisos por e-mail); notificação da trava (HU-05a); Órgão Concedente e Auditoria; medições de carga e restauração; homologação; quadro e plano |
| Maria Eduarda Marques | Product Owner, dupla com Caio | Roteiro e slides dos testes (#286); reunião de validação; regras de revisão na página de boas práticas; seções 8 e 10 com os retornos; revisão |
| Caio Martins | Dupla com Maria Eduarda | Ajustes de inscrição que nascerem da validação; acessibilidade e navegadores; revisão |
| Daniel Batista | Dupla com Rodrigo | HU-13 na tela (#281); medições de FCP e PDF; revisão |
| Rodrigo Henrique Donato | Dupla com Daniel | HU-13 na API (#269); trilha da retificação da HU-05a (#282); revisão |

---

## 6. Product Backlog e Sprint Backlog

### 6.1 Histórias selecionadas para a sprint

As dezessete histórias do MVP ([seção 10.2.6](../../requisitos/10-backlog.md#1026-mvp-e-incrementos)) que não têm registro de conclusão. Com código a concluir: HU-02b, HU-05a, HU-13 e o perfil Órgão Concedente e Auditoria (transversal, seção 8.5.1). Com código completo, faltando percurso na homologação, validação com o Instituto ou registro de conclusão: HU-01a, HU-05b, HU-07d, HU-14, HU-15a, HU-15b e HU-16. Os itens do quadro abertos na Sprint 4 foram levados para a Sprint 5 na Planning.

### 6.2 Sprint Backlog 🔧

Responsáveis e prazos das linhas A01, A02, B01 e B02 vêm da ATA-2026-11-05 (A2, A6, A8, A9); os demais são proposta.

**Parte A — Unidade 3 e docente**

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| A01 | Pedir à monitoria a avaliação das pendências e do site, e enviar os documentos que faltam (A7) | Verificação e validação | Vinicius | Must | 06/11 |
| A02 | Quadro atualizado e plano da Sprint 5 publicado (A6) | Organização e atualização | Vinicius | Must | 🔧 11/11 |
| A03 | Página da Unidade 3, lições aprendidas da Unidade 3 e seções atualizadas, com dono por parte | Organização e atualização | 🔧 equipe, a dividir em 10/11 | Must | 🔧 15/11 |
| A04 | Respostas às issues do docente da Unidade 2 (#177 a #188, #200) conferidas contra o site | Verificação e validação | 🔧 Caio | Must | 🔧 13/11 |
| A05 | Promoção da documentação para a `main` (#277), tag `u3-2026-11-17` e conferência do site publicado | Não se aplica | 🔧 Vinicius, com dois revisores | Must | 17/11 |

**Parte B — MVP em código**

| ID | Item | Issue ou PR | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| B01 | HU-13: tela de download da planilha (A8) | #268, #281 | Daniel | Must | 06/11 (A8); 🔧 merge até 13/11 |
| B02 | HU-13: exportação na API (A9), em XLSX, que abre no Google Planilhas, e CSV, conforme o RF38 e o CA-13.1 🔧 | #267, #269 | Rodrigo | Must | 🔧 13/11 |
| B03 | HU-02b: linha do tempo, requisitos atendidos e painel do projeto | #157, #271, #272 | Vinicius | Must | 🔧 antes da reunião de validação |
| B04 | HU-02b e HU-05a: avisos por e-mail, aviso adicional na meta e notificação da direção na trava; envio real na homologação | #157, #16, #273 | Vinicius | Must | 🔧 antes da reunião de validação |
| B05 | HU-05a: trilha da retificação do relatório | #134, #282 | Rodrigo | Must | 🔧 13/11 |
| B06 | Perfil Órgão Concedente e Auditoria com acesso conforme a seção 8.5.1 | tarefa nova | Vinicius | Must | 🔧 16/11 |
| B07 | Ajustes que nascerem da reunião de validação | a definir | dupla dona da história | Must | 🔧 dois dias úteis depois da reunião |
| B08 | Percurso na homologação e registro de conclusão das histórias do MVP | histórias do MVP | donos das histórias | Must | 🔧 18/11 |
| B09 | Medições: carga, massa de referência e restauração conjunta de banco e arquivos (RNF08, RNF11, RNF18) | tarefa nova | Vinicius | Should | 🔧 18/11 |
| B10 | Medições: FCP do formulário público e geração do PDF (RNF12, RNF13) | tarefa nova | Daniel e Rodrigo | Should | 🔧 18/11 |
| B11 | Medições: acessibilidade e navegadores (RNF15, RNF16) | tarefa nova | Maria Eduarda e Caio | Should | 🔧 18/11 |
| B12 | Promoção do código para `api` e `web` (#252, #253), com leitura dos merges sem aprovação registrada | #252, #253 | Vinicius, com dois revisores | Should | 🔧 18/11 |

**Parte C — Processo, validação e documentação**

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| C01 | Ata de 05/11 publicada | Organização e atualização | Maria Eduarda | Must | 🔧 10/11 |
| C02 | Roteiro e slides dos testes do Instituto na homologação, construídos na issue (D7, A2) | Verificação e validação | Maria Eduarda | Must | 09/11 |
| C03 | Data da reunião de validação definida (A3) e uso da homologação incentivado antes e depois dela (A4) | Validação | equipe | Must | 08/11 (data) |
| C04 | Reunião de validação com o Instituto: condução, registro com autorização e ata | Validação | 🔧 Maria Eduarda e Vinicius; o máximo de integrantes | Must | data da A3 |
| C05 | Retornos da validação nas seções 8 e 10, trocando 🔧 por 🟩 quando confirmados | Organização e atualização | 🔧 Maria Eduarda e Vinicius | Must | 🔧 até 16/11 |
| C06 | Regras de revisão e de integração na página de boas práticas (D2 a D4, A5) | Organização e atualização | Maria Eduarda | Must | Sprint 5 (#285) |
| C07 | Cronograma (seção 6) com o período real das Sprints 4 e 5 e o novo papel da Sprint 5 | Organização e atualização | 🔧 Vinicius | Must | 🔧 13/11 |
| C08 | Melhorias do site do projeto (#278, #279, #280) | Organização e atualização | Maria Eduarda | Could | 🔧 depois de 17/11 |

---

## 7. Priorização

Critério do projeto: primeiro o que a disciplina avalia e tem prazo; depois o que o Instituto precisa para o piloto; por último melhoria interna.

- **Must:** Parte A; B01 a B08; C01 a C07.
- **Should:** B09 a B12.
- **Could:** C08.

**Verificação de capacidade 🔧.** Pelas estimativas da auditoria de 03/11, sem medição anterior, o código que falta soma cerca de 26 horas (B03 a B06, mais a revisão dos PRs abertos) e as medições, cerca de 6 horas, contra cerca de 75 horas de construção. A restrição é a distribuição: B03, B04, B06 e B09 ficam com o Vinicius.

**Contenção 🔧:** se faltar tempo, descem nesta ordem: C08; B12; B11 e B10, registrados como desvio do requisito não funcional; B06. Não descem a HU-13, a Unidade 3 e os direitos do titular.

---

## 8. Alocação de responsabilidades

Duplas mantidas até o fim do semestre (D8): Maria Eduarda Marques e Caio Martins; Daniel Batista e Rodrigo Henrique Donato. O Vinicius Vieira atua como Scrum Master e no código transversal. Todo pull request precisa da aprovação de dois revisores e é integrado logo depois da segunda, se não tiver conflito com a branch de destino (D3); as linhas de teste não contam no tamanho (D2). O histórico de issues e pull requests do repositório é a evidência da programação em par e dos testes (D9).

---

## 9. Registro de riscos

| # | Risco | Probabilidade | Impacto | Resposta 🔧 |
|---|---|---|---|---|
| R1 | Implementação competir com o texto da Unidade 3 | Alta | Alto | Parte A com prazo próprio, 15/11; atraso custa 20% por dia |
| R2 | Pull requests parados à espera da segunda aprovação | Alta | Alto | Pedido de revisão com aviso no grupo; revisão dividida entre as duplas |
| R3 | Reunião de validação tarde demais para aplicar os retornos antes de 17/11 | Média | Alto | Data até 08/11 (A3); depois disso, a Unidade 3 sai com os 🔧 vigentes e os retornos entram na Unidade 4 |
| R4 | Concentração do código transversal numa pessoa | Alta | Médio | Contenção da seção 7; revisão por outra dupla |
| R5 | Envio real de e-mail falhar no provedor | Média | Médio | Conferir domínio e remetente no provedor antes; teste só com endereços da equipe |
| R6 | Uso de dados reais antes de formalizar o tratamento com o Instituto | Média | Alto | Homologação só com dados fictícios (P3) |
| R7 | Sem quórum em reunião | Média | Médio | Convite recorrente confirmado por todos; confirmação até as 18h do dia |

---

## 10. Critérios de aceitação da Sprint 🔧

| ID | Critério | Verificação |
|---|---|---|
| CAS-01 | HU-13, HU-02b e HU-05a concluídas pela DoD, com um envio real de e-mail na homologação | Quadro; homologação |
| CAS-02 | Perfil Órgão Concedente e Auditoria com acesso conforme a seção 8.5.1 | Testes por perfil |
| CAS-03 | Requisitos não funcionais do MVP medidos, com registro, ou com desvio registrado | Registro de medições |
| CAS-04 | Histórias do MVP com registro de conclusão ou em Aguardando com a pendência nomeada | Quadro |
| CAS-05 | Reunião de validação realizada, com ata, e retornos aplicados nas seções 8 e 10 | Ata; seções 8 e 10 |
| CAS-06 | Unidade 3 publicada com a tag `u3-2026-11-17` até 17/11 | Site; tags |
| CAS-07 | Nenhum pull request integrado sem duas aprovações | Histórico dos pull requests |
| CAS-08 | Adesão às dailies igual ou acima de 80%, pelo critério que a Retrospectiva 5 fixar | Registro das dailies |

---

## Controle de versões

| Versão | Data | Alteração | Responsável |
|---|---|---|---|
| 1.0 | 10/11/2026 | Emissão com o deliberado na Sprint Planning de 05/11 (ATA-2026-11-05): período de 05/11 a 19/11, meta, duplas mantidas, regras de revisão, Sprint Backlog em três partes, priorização, riscos e critérios de aceitação | Vinicius Vieira |
