# Plano da Sprint 2 — Projeto CyberSetor

**Documento de planejamento e priorização da Sprint 2**

| Campo | Conteúdo |
|---|---|
| **Código do documento** | C24 |
| **Versão** | 1.0 |
| **Data de emissão** | 24 de setembro de 2026 |
| **Projeto** | CyberSetor — sistema de gestão do ciclo de projetos financiados |
| **Cliente** | Instituto Cultural e Social No Setor |
| **Disciplina** | FGA0313 — Requisitos de Software · Turma 02 · 2026.2 · FCTE/UnB |
| **Docente** | Prof. George Marsicano |
| **Sprint** | Sprint 2 |
| **Período da Sprint** | 22/09/2026 (terça-feira) a 06/10/2026 (terça-feira) — 2 semanas |
| **Elaboração** | Vinicius Angelo de Brito Vieira (Scrum Master) |
| **Product Owner** | Maria Eduarda Denis Duarte Marques |
| **Situação** | Emitido com o deliberado na Sprint Planning de 23/09/2026 |

---

## 1. Objetivo e escopo do documento

Este documento estabelece o planejamento da Sprint 2: período, meta, capacidade, Sprint Backlog, priorização, alocação por dupla, riscos e critérios de aceitação da sprint. Registra também o procedimento que a equipe segue nas Atividades 3 e 4 da disciplina, cujo prazo cai dentro da sprint.

**Não integram o escopo deste documento:** os requisitos declarados ([seção 8](../../requisitos/8-requisitos.md)); a DoR e a DoD ([seção 9](../../requisitos/9-dor-dod.md)); o backlog do produto, a priorização dos requisitos e o MVP ([seção 10](../../requisitos/10-backlog.md)); a situação corrente de cada item, que fica no quadro do projeto.

---

## 2. Referências

### 2.1 Base de elaboração deste plano

Ata da Sprint Review 1 e Retrospectiva 1 (22/09/2026); ata da Sprint Planning 2 (23/09/2026); [plano da Sprint 1](sprint-1.md) (C21); Atividades 2, 3 e 4 da disciplina no Aprender; retorno da monitoria sobre a lista de requisitos (21/09/2026).

### 2.2 Referencial teórico

MARSICANO, G. **Requisitos de Software: Comunicação é tudo!** v1.1 draft. Brasília: FCTE/UnB, 2026. §5.3 (atividades de Engenharia de Requisitos), §6.2 (requisitos funcionais e não funcionais; classificação URPS+), §6.3 (regras de negócio).

SCHWABER, K.; SUTHERLAND, J. **The Scrum Guide**. 2020. — Sprint Goal, Sprint Backlog e itens não concluídos.

AGILE BUSINESS CONSORTIUM. **DSDM Project Framework — MoSCoW Prioritisation**. Disponível em: https://www.agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html. — regra de proporção 60/20/20 sobre esforço.

### 2.3 Convenções deste documento

| Marca | Significado |
|---|---|
| 🟩 | Fato confirmado junto ao cliente ou à equipe |
| 🟨 | Hipótese ainda não validada |
| 🔧 | Proposta sujeita a deliberação da equipe |

Itens sem marcação constituem decisão registrada em ata.

---

## 3. Contexto

A Sprint 1 terminou com a meta **parcialmente atingida**: a lista de requisitos foi publicada e o Product Backlog foi estruturado no quadro do projeto, mas o refinamento e a priorização item a item não couberam na sprint e foram transferidos para esta.

Três atividades da disciplina têm prazo dentro da Sprint 2: a verificação em pares da SevenSpecs (Atividade 2, até 24/09, 12h), o ajuste e a validação da lista de requisitos (Atividade 3) e a priorização com definição do MVP (Atividade 4), as duas até a aula de 29/09. A disciplina fixa a sequência: ajustar os requisitos, validar a lista, avaliar negócio e técnica, construir a matriz, definir o MVP e validar o MVP com o cliente.

A monitoria pediu, em 21/09, requisitos menores, sem tecnologia nem planejamento na descrição, métricas com origem e tabelas por tipo. O Product Backlog passou a ter sete épicos e quinze histórias de usuário, que cobrem os 37 requisitos funcionais publicados.

**O MVP desta sprint é uma definição**, não um sistema no ar: o recorte de requisitos avaliado, priorizado e aprovado pelo Instituto. A construção começa na Sprint 3.

---

## 4. Definição da Sprint

### 4.1 Período e cadência

| Parâmetro | Definição |
|---|---|
| Início | 22/09/2026 (terça-feira) |
| Encerramento | 06/10/2026 (terça-feira) |
| Duração | 2 semanas |
| Ancoragem | Terças-feiras |
| Reunião de Planning | 23/09/2026 (quarta-feira), 21h–23h |

**Exceções à cadência:** o Planning ocorreu um dia depois do início, adiado de 22/09 para contar com a Product Owner; o período da sprint não muda.

**Eventos externos no período:** Semana Universitária (22 a 24/09); entrega da Atividade 2 (24/09, 12h); aula e entregas das Atividades 3 e 4 (29/09). A entrega da Unidade 2 (13/10) cai na Sprint 3.

### 4.2 Meta da Sprint

> **Sprint Goal (aprovado em 23/09):** *"Ao final da Sprint 2, a lista de requisitos está ajustada pelos feedbacks recebidos, a matriz 4 × 4 está preenchida, o MVP está definido e validado com o Instituto e a DoR e a DoD estão publicadas; os itens ligados às Atividades 3 e 4, até 29/09."*

**Fundamentação do recorte.** A meta segue a sequência das Atividades 3 e 4 e é verificável no site: lista revisada na seção 8, matriz e MVP na seção 10, DoR e DoD na seção 9. A validação com o Instituto depende da agenda do cliente; o risco R01 (§9) trata dessa dependência.

**Exclusões explícitas do escopo da Sprint:**

| Item excluído | Justificativa |
|---|---|
| Código do produto | A construção começa na Sprint 3 |
| Requisito funcional novo sem lacuna demonstrada na validação | Orientação da monitoria (21/09); as lacunas conhecidas são tratadas como ajuste de requisito existente |
| Detalhamento do painel gerencial | Classificado como *Should* (ata de 23/09, D12); entra só na avaliação de valor com o Instituto |

---

## 5. Capacidade da equipe

### 5.1 Calendário detalhado da Sprint

| Data | Dia | Natureza | Capacidade produtiva |
|---|---|---|---|
| 22/09 | terça | Sprint Review 1 e Retrospectiva 1 | Nula — cerimônia |
| 23/09 | quarta | Verificação em pares; Sprint Planning 2 à noite | Reduzida |
| 24/09 | quinta | Entrega da Atividade 2 (12h); contato com o Instituto; abertura das issues da sprint | Reduzida |
| 25/09 | sexta | Ajustes dos requisitos por dupla; DoR e DoD | Plena |
| 26–27/09 | fim de semana | Conclusão dos ajustes e avaliação técnica, se a sessão com o Instituto for em 28/09 | Não contada |
| 28/09 | segunda | Calibração com a monitoria; sessão de validação com o Instituto | Reduzida |
| 29/09 | terça | Aula; publicação das Atividades 3 e 4 antes dela | Reduzida |
| 30/09 | quarta | Ajustes pedidos na validação; organização da seção 8; atas | Plena |
| 01/10 | quinta | Produção | Plena |
| 02/10 | sexta | Produção | Plena |
| 05/10 | segunda | Base técnica da Sprint 3; preparação da Review | Plena |
| 06/10 | terça | Sprint Review 2, Retrospectiva 2 e Sprint Planning 3 | Nula — cerimônia |

**Síntese:** 11 dias úteis no período; 5 de capacidade plena (25/09, 30/09, 01/10, 02/10 e 05/10) e 4 reduzidos. **Antes de 29/09 há um único dia pleno.**

**Consequência para o dimensionamento.** Os itens *Must* com prazo em 29/09 concentram-se em três dias reduzidos, um pleno e, se necessário, no fim de semana. A folga da sprint está depois de 29/09, onde ficam os itens *Should* e *Could* (§7.2).

### 5.2 Perfil da equipe para os produtos de trabalho desta Sprint

| Integrante | Papel | Foco nesta Sprint |
|---|---|---|
| Maria Eduarda Marques | Product Owner · dupla com Vinicius | Interlocução com o Instituto (sessão de validação e acesso a documentos); épico Pessoas; DoR e DoD |
| Vinicius Vieira | Scrum Master · dupla com Maria Eduarda | Consolidação das Atividades 3 e 4; épico Pessoas; registro dos ritos |
| Rodrigo Henrique Donato | Dupla com Daniel | Épicos Requisito e meta e Relatório; seção 10; organização das seções 8.2 e 8.3 |
| Daniel Batista | Dupla com Rodrigo | Épicos Requisito e meta e Relatório; seção 10; mapa de stakeholders |
| Lucas de Paula Leal | Dupla com Caio | Épicos Atividade, Presença em campo e Evidência; dojo pendente da Sprint 1 |
| Caio Martins | Dupla com Lucas | Épicos Atividade, Presença em campo e Evidência; atas |

Referência de capacidade: cerca de 2 horas por dia por integrante 🟨, a partir do declarado por Rodrigo Henrique Donato na Retrospectiva de 22/09. Rodrigo está indisponível em 24/09.

---

## 6. Product Backlog e Sprint Backlog

### 6.1 Product Backlog: épicos e histórias

As quinze histórias de usuário compõem o Product Backlog e **não são construídas nesta sprint**. No quadro do projeto, histórias ficam sem sprint até serem selecionadas para construção; o refinamento delas nesta sprint é acompanhado pelas tarefas T02 a T04, uma por dupla dona de épico. A redação corrente de cada história fica no quadro; o backlog publicado, na seção 10.

| Épico | Características | Histórias | Dupla dona |
|---|---|---|---|
| Requisito e meta | CP1, CP6 | HU-01, HU-02, HU-11, HU-14 | Daniel e Rodrigo |
| Relatório | CP8 | HU-05, HU-13 | Daniel e Rodrigo |
| Atividade | CP2 | HU-03 | Lucas e Caio |
| Presença em campo | CP4 | HU-09, HU-10, HU-12 | Lucas e Caio |
| Evidência | CP7 | HU-04 | Lucas e Caio |
| Pessoas | CP3, CP5 | HU-06, HU-07, HU-08, HU-15 | Maria Eduarda e Vinicius |
| Processo e infraestrutura | — | tarefas | equipe |

A proposta de MVP levada ao Instituto deixa de fora a sincronização de presenças sem conexão (HU-12) e o acompanhamento de progresso e risco de meta (HU-11). A decisão é tomada por RF na avaliação com o Instituto: o registro de presença on-line (RF14) e o cálculo do progresso que alimenta o relatório (RF26) são avaliados separadamente das histórias em que estão.

### 6.2 Sprint Backlog

| ID | Item | Atividade de ER | Responsáveis | MoSCoW | Prazo |
|---|---|---|---|---|---|
| T01 | Entregar a verificação em pares da SevenSpecs (Atividade 2) | Verificação e validação | três duplas, uma frente cada; envio por Maria Eduarda | Must | 24/09, 12h |
| T02 | Refinar histórias e requisitos de Requisito e meta e Relatório: dividir RF01 e RF04; RF01–RF06, RF26–RF29 e RF33–RF37 no padrão de redação (§6.4); decisões propostas para os apontamentos; esforço técnico de cada RF | Declaração | Daniel e Rodrigo | Must | 26/09 (ajustes) · 27/09 (avaliação) |
| T03 | Refinar histórias e requisitos de Atividade, Presença em campo e Evidência: RF07 com a meta a que a atividade contribui; RF07, RF08, RF14–RF17 e RF30–RF32 no padrão de redação; decisões propostas; esforço técnico de cada RF | Declaração | Lucas e Caio | Must | 26/09 · 27/09 |
| T04 | Refinar histórias e requisitos de Pessoas: RF09–RF13 e RF18–RF25 no padrão de redação; decisões propostas; esforço técnico de cada RF | Declaração | Maria Eduarda e Vinicius | Must | 26/09 · 27/09 |
| T05 | Consolidar o ajuste da lista de requisitos (Atividade 3): uma decisão por apontamento, padrão de redação na 8.1, RNFs pelo URPS+, consistência do conjunto, lista revisada publicada com evidência | Verificação e validação | Vinicius | Must | 29/09, antes da aula |
| T06 | Priorizar os requisitos e validar o MVP com o Instituto (Atividade 4): critérios e escalas, itens de RF no quadro, calibração com a monitoria, sessão com o Instituto em 28/09, tabela consolidada, matriz 4 × 4, RFs e RNFs do MVP, registro da validação | Análise e consenso | Maria Eduarda e Vinicius | Must | 29/09 |
| T07 | Publicar na seção 10 os dez resultados da Atividade 4 e o backlog do produto | Organização e atualização | Daniel e Rodrigo | Must | 29/09, antes da aula |
| T08 | Publicar a DoR e a DoD na seção 9, com revisão da equipe | Organização e atualização | Maria Eduarda e Vinicius | Must | 29/09 |
| T09 | Registrar as atas da sprint e as evidências dos ritos da Sprint 1 | Organização e atualização | Maria Eduarda, Vinicius e Caio | Must | 29/09 (evidências) |
| T10 | Reorganizar as seções 8.2 e 8.3 em tabela por tipo, depois de publicada a lista da Atividade 3 | Organização e atualização | Rodrigo e Vinicius | Should | 06/10 |
| T11 | Comentar as issues do docente e atualizar a página de boas práticas do GitHub | Organização e atualização | Vinicius | Should | 29/09 |
| T12 | Preparar a base técnica da Sprint 3 | Não se aplica | Vinicius | Could | 06/10 |
| B2 | Atualizar o Rich Picture (seção 1.3) e o mapa de stakeholders (seção 1.6) com os papéis levantados em 08/09 e 21/09 — pendência da Sprint 1 | Representação | Daniel e Maria Eduarda | Should | 06/10 |
| D1, D2 | Concluir o dojo pendente e fechar os registros dos dojos — pendência da Sprint 1 | Organização e atualização | Lucas | Should | 24/09 |

### 6.3 Procedimento das Atividades 3 e 4

1. **Ajuste por dupla (até 26/09).** Cada dupla ajusta os RFs das histórias dos seus épicos e propõe uma decisão para cada apontamento recebido da SevenSpecs e da monitoria (T02 a T04).
2. **Consolidação (27/09).** A lista ajustada é integrada, conferida no conjunto e revalidada internamente; a tabela de decisões registra Aceito, Parcialmente aceito, Não aceito com justificativa ou Não aplicável (T05).
3. **Avaliação técnica (até 27/09).** Os itens de RF são criados no quadro com a lista ajustada (§7.4); cada dupla registra neles esforço, complexidade, lacuna de capacidade e o esforço técnico consolidado dos RFs das suas histórias; a equipe aprova o conjunto em reunião (T06).
4. **Calibração com a monitoria** dos critérios, das escalas e da avaliação técnica, antes da sessão com o Instituto.
5. **Sessão com o Instituto (28/09).** Conduzida história a história (§7.4): validação da lista ajustada; valor de negócio e justificativa de cada RF registrados ao vivo; matriz acompanhada na sessão; validação do MVP com registro de participantes, data, RFs aprovados, RNFs aplicáveis, adiados, ajustes e divergências. Na mesma sessão: acesso aos documentos do Instituto e a hipótese de modelos de documento reaproveitáveis.
6. **Publicação (29/09, antes da aula).** Lista revisada na seção 8 e os dez resultados da Atividade 4 na seção 10 (T05, T07).


### 6.4 Padrão de redação dos RFs

O padrão atende ao critério 3 da Atividade 2 ("está claro quem interage ou quem se beneficia?") e ao retorno da monitoria. Nome com verbo e objeto; descrição em uma frase que deixa claro quem interage ou quem se beneficia, de forma genérica (por exemplo, "Permitir ao usuário autorizado…" ou "Alertar o responsável pela meta…"); os perfis que podem executar cada RF ficam na tabela de perfis e permissões (8.5.1), que o controle de acesso aplica; o papel concreto fica na história de usuário. Público externo sem perfil de acesso, como quem se inscreve por link, é nomeado no próprio RF.

---

## 7. Priorização

### 7.1 Dois horizontes

Como no plano da Sprint 1 (§8.2-A), a classificação responde a duas perguntas distintas:

| Horizonte | Pergunta | Objeto | Escala |
|---|---|---|---|
| **A — trabalho da Sprint 2** | O item é indispensável para a meta da sprint? | Itens do Sprint Backlog (§6.2) | MoSCoW, com a regra 60/20/20 sobre o esforço |
| **B — produto e MVP** | O requisito é indispensável no primeiro recorte utilizável pelo Instituto? | Cada RF (Atividade 4) | Valor de negócio de 4 a 1, com o cliente e com justificativa, cruzado com o esforço técnico avaliado pela equipe |

A classificação em um horizonte não determina a do outro. No quadro do projeto, o MoSCoW das tarefas é o do horizonte A; o valor de negócio do horizonte B fica nos itens de RF (§7.4).

### 7.2 Aplicação nesta sprint (horizonte A)

- **Must:** T01 a T09 — os itens com prazo nas Atividades 2, 3 e 4 e a DoR e a DoD, que a meta nomeia (ata de 23/09, D2).
- **Should:** T10, T11, B2 e o dojo pendente — secundários ou de acabamento.
- **Could:** T12 — primeiro a descer se a sprint apertar.

**Verificação de capacidade (plano da Sprint 1, §8.4).** A proporção de 60% não se cumpre na primeira semana: os prazos da disciplina concentram os *Must* até 29/09, e a folga fica em 30/09 a 05/10. Se o prazo apertar antes de 29/09, fatia-se o *Must* em vez de estender a data 🔧: T07 publica em 29/09 os dez resultados em forma mínima e completa a apresentação depois; T09 publica primeiro as evidências dos ritos, que têm prazo, e depois as atas.

### 7.3 Critérios e escalas da Atividade 4 (horizonte B) 🔧

Documentados em T06 e calibrados com a monitoria antes da sessão com o Instituto. **A matriz cruza valor de negócio (vertical, dado pelo Instituto) com esforço técnico (horizontal, dado pela equipe).** A complexidade é um dos componentes do esforço técnico, não um eixo.

- **Valor de negócio, com o Instituto:** 4 *Must have* (indispensável para resolver o problema central ou viabilizar o produto) · 3 *Should have* (muito importante, mas o produto opera temporariamente sem ele) · 2 *Could have* (agrega valor, pode ser adiado) · 1 *Won't have now* (não prioritário para esta versão). Critérios, os da própria atividade: problema central; objetivo do projeto; impacto para os usuários; abrangência de uso; urgência; obrigação legal ou institucional; dependência de outra função. Cada RF recebe o critério que mais pesou e uma justificativa curta, nas palavras do Instituto.
- **Esforço técnico, pela equipe:** esforço (horas para implementar o RF: até 2 · de 2 a 6 · de 6 a 12 · mais de 12), complexidade (de solução conhecida a incerteza alta ou tecnologia não dominada) e lacuna de capacidade (o quanto falta à equipe para construir o RF, medido no mesmo sentido das outras duas), de 1 a 4 cada, nas escalas da atividade. Consolidação: média das três, arredondada para o inteiro mais próximo (x,5 sobe); a tabela mostra também a média com uma casa.
- **Candidatos ao MVP:** valor 4 com esforço 1 ou 2 e valor 3 com esforço 1, ponderados por dependências, fluxo mínimo completo e riscos. RF de alto valor e alto esforço é decomposto, reduzido ou adiado, não descartado. A história entra no MVP quando todos os seus RFs entram; se só parte entra, ela é dividida.
- **RNFs:** classificados em obrigatórios para o MVP, associados a RFs do MVP, evolutivos e não aplicáveis, a partir da matriz de rastreabilidade dos RNFs (seção 8.4.2).

### 7.4 Registro da avaliação e sessão com o Instituto

A Atividade 4 avalia e posiciona **cada RF**, e o MVP pode cortar dentro de uma história (na HU-09, o registro on-line pode entrar e o registro sem conexão ficar para depois). Por isso a avaliação é registrada por RF, sem abandonar a apresentação por história que o Planning decidiu (ata de 23/09, D9):

- **Um item de rascunho por RF no quadro**, criado depois dos ajustes (27/09), com os campos História, Épico, Esforço, Complexidade, Lacuna de capacidade, Esforço técnico (1 a 4, calculado das três notas), MoSCoW (valor de negócio), Critério de valor, Justificativa (valor) e MVP.
- **View "Priorização e MVP"** (tabela, agrupada por história): na sessão, cada história é apresentada com seus RFs, RNFs e regras de negócio; o Instituto avalia a história, o valor é copiado para os RFs do grupo e só as exceções são ajustadas uma a uma, de modo que o valor, o critério e a justificativa de cada RF ficam registrados ao vivo.
- **View "Matriz 4 × 4"** (quadro com colunas pelo esforço técnico e faixas pelo valor de negócio): cada RF muda de célula quando recebe o valor, e a matriz se forma durante a sessão.
- **Depois da sessão**, a seção 10 recebe as tabelas e a matriz geradas a partir dos itens de RF, como retrato datado, revisado no PR.

---

## 8. Alocação de responsabilidades

| Dupla | Integrantes | Itens | Fundamento da alocação |
|---|---|---|---|
| **Pessoas e coordenação** | Maria Eduarda Marques · Vinicius Vieira | T04, T05, T06, T08, T09, T11, T12; B2 (Maria Eduarda, com Daniel) | Interlocução da Product Owner com o Instituto; consolidação das atividades e registro dos ritos pelo Scrum Master; dona do épico Pessoas |
| **Requisito e meta, Relatório** | Daniel Batista · Rodrigo Henrique Donato | T02, T07, T10 (Rodrigo, com Vinicius); B2 (Daniel) | Donos dos épicos Requisito e meta e Relatório; seção 10 como continuidade da matriz de rastreabilidade |
| **Atividade, Presença em campo, Evidência** | Lucas de Paula Leal · Caio Martins | T03, T09 (Caio); dojo pendente (Lucas) | Donos dos épicos de campo; atas atualizadas por Caio |
| **Equipe** | — | T01 (uma frente por dupla); revisão de PR por integrante de outra dupla | Participação de todos na Atividade 2; revisão registrada antes do merge (ata de 22/09, D10) |

---

## 9. Registro de riscos

| ID | Risco | Prob. | Impacto | Mitigação | Responsável |
|---|---|---|---|---|---|
| R01 | O Instituto não tem data para a sessão de validação antes de 29/09 | Média | Alto | Proposta para 28/09 com alternativa de horário; sem sessão, valor de negócio colhido por escrito com registro de quem respondeu e quando, e MVP validado por escrito | Maria Eduarda |
| R02 | A lista ainda não está estável na sessão com o Instituto | Alta | Alto | Ajustes até 26/09; consolidação e avaliação técnica até 27/09; o que não estiver estável vai à sessão marcado como pendente | Vinicius |
| R03 | Duas reestruturações da seção 8 ao mesmo tempo, como na Sprint 1 | Média | Médio | T10 só depois de 29/09; um PR por dupla; aviso no grupo antes do merge | Vinicius |
| R04 | Monitoria indisponível nas Atividades 3 e 4, em que é mandatória | Média | Médio | Contato em 24/09; reunião semanal (ata de 23/09, D14); tentativas de contato registradas | Vinicius |
| R05 | A avaliação feita por história não sustenta a tabela e a matriz por RF | Média | Alto | Itens de RF no quadro criados em 27/09 (§7.4) | Maria Eduarda e Vinicius |
| R06 | Capacidade reduzida na primeira semana (Semana Universitária, indisponibilidade pontual, cerca de 2 horas por dia) | Alta | Médio | *Must* primeiro; *Should* e *Could* depois de 29/09; fatiamento (§7.2) | Vinicius |
| R07 | Dados pessoais em capturas das dailies ou em documentos do Instituto | Média | Alto | Dados ocultados antes de publicar; leitura por um segundo integrante; documentos do cliente não se publicam | Maria Eduarda e Vinicius |

---

## 10. Critérios de aceitação da Sprint

| ID | Critério | Verificação |
|---|---|---|
| CAS-01 | Verificação em pares entregue à SevenSpecs até 24/09, 12h | Planilha compartilhada e confirmação de recebimento |
| CAS-02 | Tabela de decisões por apontamento e lista revisada publicadas antes da aula de 29/09 | Seção 8 do site |
| CAS-03 | Os dez resultados da Atividade 4 publicados antes da aula de 29/09, com a validação do MVP pelo Instituto registrada | Seção 10 do site |
| CAS-04 | DoR e DoD publicadas, com PR revisado por integrante de outra dupla | Seção 9 do site e histórico do PR |
| CAS-05 | As quinze histórias revisadas contra a DoR pelos donos dos épicos | Quadro do projeto e seção 10 |
| CAS-06 | Atas de 22/09 e 23/09 publicadas após leitura por um segundo integrante; ata da sessão com o Instituto enviada a ele para conferência | Índice de atas |
| CAS-07 | Evidências dos ritos da Sprint 1 na página de processo até 29/09 | Página de processo |
| CAS-08 | Proporção de itens *Must* concluídos apurada, como referência de capacidade para a Sprint 3 | Apuração na Review de 06/10 |

---

## 11. Encaminhamentos posteriores ao Planning

| Tema | Encaminhamento | Situação |
|---|---|---|
| Registro da avaliação por RF (ata de 23/09, P11) | Itens de RF no quadro, apresentação por história e matriz acompanhada na sessão (§7.4) | Adotado em 24/09 |
| Data da sessão com o Instituto (ata de 23/09, D10) | 28/09: em 24/09 ocorre a entrega da Atividade 2 e a lista ainda não estaria ajustada | Adotado em 24/09 |
| Classificação dos RNFs | URPS+, como pede o Template v8 (seção 8.2) e o livro (§6.2.2.1), com Sommerville como visão complementar; a seção 8 hoje usa "FURPS+" com a categoria "Segurança" | Aplicado em T05, com revisão da equipe no PR |
| Padrão de redação dos RFs | §6.4 | Fixado na seção 8.1 em T05 |
| Gravação das reuniões | 🔧 Anotações automáticas e transcrição em todas as reuniões; gravação só nas reuniões online com o Instituto, com a ciência dele. Substitui a decisão D4 de 08/09 (gravar todas as sessões) e muda o texto da página de atas | A decidir na próxima reunião da equipe, com registro em ata |

---

## Anexo A — Plano de execução 🔧

| Data | Atividade | Responsáveis |
|---|---|---|
| 24/09 | Entrega da Atividade 2 até 12h; contato com o Instituto; contato com a monitoria; issues da sprint abertas | três duplas; Maria Eduarda; Vinicius |
| 25/09 | Ajustes por dupla; PR da DoR e da DoD | duplas; Maria Eduarda e Vinicius |
| 26/09 | Ajustes das duplas concluídos | duplas |
| 27/09 | Lista consolidada e revalidada; itens de RF criados no quadro; avaliação técnica de cada RF; reunião de aprovação | Vinicius; duplas |
| 28/09 | Calibração com a monitoria; sessão com o Instituto | Maria Eduarda e Vinicius; equipe |
| 29/09 | Publicação das Atividades 3 e 4 antes da aula; issues do docente comentadas, se necessário | Vinicius; Daniel e Rodrigo |
| 30/09 – 02/10 | Ajustes pedidos na validação; seções 8.2 e 8.3; atas; Rich Picture e stakeholders | duplas |
| 05/10 | Base técnica da Sprint 3; preparação da Review | Vinicius |
| 06/10 | Sprint Review 2, Retrospectiva 2 e Sprint Planning 3 | equipe |

---

## Controle de versões

| Versão | Data | Alteração | Responsável |
|---|---|---|---|
| 1.0 | 24/09/2026 | Emissão com o deliberado na Sprint Planning de 23/09: meta, Sprint Backlog por dupla com MoSCoW, procedimento das Atividades 3 e 4, registro da avaliação por RF, padrão de redação dos RFs, histórias no Product Backlog, riscos e encaminhamentos | Vinicius |
