# Plano da Sprint 1 — Projeto CyberSetor

**Documento de planejamento, capacitação e priorização da Sprint 1**

| Campo | Conteúdo |
|---|---|
| **Código do documento** | C21 |
| **Versão** | 7.0 |
| **Data de emissão** | 09 de setembro de 2026 |
| **Última revisão** | 17 de setembro de 2026 (v7.0 — reconciliação das linhagens de emissão; ver Controle de versões) |
| **Projeto** | CyberSetor — sistema de gestão do ciclo de projetos financiados |
| **Cliente** | Instituto Cultural e Social No Setor |
| **Disciplina** | FGA0313 — Requisitos de Software · Turma 02 · 2026.2 · FCTE/UnB |
| **Docente** | Prof. George Marsicano |
| **Sprint** | Sprint 1 |
| **Período da Sprint** | 08/09/2026 (terça-feira) a 22/09/2026 (terça-feira) — 2 semanas |
| **Elaboração** | Vinicius Angelo de Brito Vieira (Scrum Master) |
| **Product Owner** | Maria Eduarda Denis Duarte Marques |
| **Situação** | **Aprovado na Sprint Planning de 08/09/2026** |
| **Destino sugerido no repositório** | `docs/gestao/sprints/sprint-1.md` |

---

## 1. Objetivo e escopo do documento

Este documento estabelece o planejamento formal da Sprint 1 do projeto CyberSetor, compreendendo: a definição do período e da Meta da Sprint; o dimensionamento da capacidade da equipe; o plano de capacitação interna (dojos); o Product Backlog candidato com histórias de usuário e critérios de aceitação; o método de priorização adotado; a alocação de responsabilidades; o registro de riscos; e os critérios de aceitação da própria Sprint.

O documento cumpre três funções: (a) instrumento de condução da reunião de Sprint Planning de 08/09/2026; (b) registro formal das decisões de planejamento da equipe, para fins de rastreabilidade e de composição das seções 5.2, 6, 7.2 e 11 do Documento de Visão; (c) insumo direto das seções 8 e 9 do Documento de Visão, a serem entregues na Unidade 2 em 13/10/2026.

**Não integram o escopo deste documento:** a especificação de requisitos funcionais e não funcionais (Unidade 2); e qualquer decisão de arquitetura ou implementação. A priorização MoSCoW do Product Backlog desta Sprint **integra**, sim, o escopo (§8), por decisão tomada na Sprint Planning de 08/09.

---

## 2. Referências

### 2.1 Base de elaboração deste plano

Este plano apoia-se em registros e decisões anteriores do projeto: o contexto da disciplina e as decisões já consolidadas pela equipe; a ficha do cliente (Instituto Cultural e Social No Setor), com sua estrutura organizacional e seus regimes de financiamento; a definição do produto (Objetivos Específicos e Características Propostas); a composição das duplas e o calendário de sprints da equipe; as decisões técnicas e de infraestrutura, incluindo a Matriz de Competências; os ritos e cerimônias do ScrumXP adotados pela equipe; o roteiro e a ata da reunião presencial de 08/09/2026 no Instituto; a análise consolidada a partir dessa reunião, que fundamenta o Product Backlog candidato desta Sprint; e a ata da Sprint Planning de 08/09/2026, que registra a decisão de adoção do MoSCoW e a estrutura da Sprint.

### 2.2 Referencial teórico

MARSICANO, G. **Requisitos de Software: Comunicação é tudo!** v1.1 draft. Brasília: FCTE/UnB, 2026. §4.6 (XP), §4.10 (Scrum), §5.3 (atividades de Engenharia de Requisitos), §5.4 (valores e princípios).

SCHWABER, K.; SUTHERLAND, J. **The Scrum Guide**. 2020. — definição de Sprint Goal e de Sprint Backlog.

CLEGG, D.; BARKER, R. **Case Method Fast-Track: A RAD Approach**. Addison-Wesley, 1994. — origem da técnica MoSCoW.

STAPLETON, J. **DSDM: Business Focused Development**. 2ª ed. Pearson, 2003. — formalização do MoSCoW no método DSDM, adotado como referência de aplicação em §8.

AGILE BUSINESS CONSORTIUM. **DSDM Project Framework — MoSCoW Prioritisation**. Disponível em: https://www.agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html. — regra de proporção 60/20/20 sobre esforço e papel dos Could Haves como contingência.

### 2.3 Convenções deste documento

Salvo indicação em contrário, os itens registrados constituem decisão já tomada pela equipe, seja na Sprint Planning de 08/09/2026, seja em documento anterior do projeto. Hipóteses ainda não validadas junto ao cliente são identificadas como tais no próprio texto, e propostas sujeitas a deliberação posterior são apresentadas de forma explícita.

---

## 3. Contexto

### 3.1 Reposicionamento do produto após a elicitação de 08/09

Na reunião presencial realizada em 08 de setembro de 2026 na sede do Instituto Cultural e Social No Setor, registrada em ata e analisada pela equipe, confirmou-se que o problema central da organização tem origem anterior à execução das atividades: ele começa no **edital de financiamento**.

A cadeia real de trabalho do Instituto observa a seguinte sequência: edital ou instrumento equivalente (emenda parlamentar, parceria) estabelece requisitos mínimos → a equipe destrincha esses requisitos manualmente → elabora-se a proposta de trabalho → aprovada a proposta, elabora-se o plano de trabalho com metas e indicadores → executa-se o projeto → produz-se comprovação → consolida-se o relatório de execução do objeto → efetua-se a prestação de contas.

Em consequência, o centro do produto deixa de ser exclusivamente o ciclo da atividade e passa a ser **o ciclo do projeto financiado**, conforme o modelo:

```
instrumento (edital / emenda / parceria)
   └── projeto
        └── requisito / meta  (origem · indicador · parâmetro de aferição ·
        │                      forma de verificação · frequência de apuração)
             ├── demanda      (dono · setor · prazo · status)
             ├── atividade    (tipo de objeto)
             └── evidência    (vinculada à meta, datada)
                  └── relatório de execução do objeto
                       └── prestação de contas
```

Este reposicionamento não amplia o escopo do produto: mantém as mesmas Características Propostas já registradas pela equipe, com modelo de dados mais fiel à operação real da organização.

### 3.2 Implicação para a Sprint 1

A Sprint 1 é a primeira sprint do projeto integralmente dedicada às atividades de Engenharia de Requisitos de **Elicitação e Descoberta**, **Análise e Consenso**, **Declaração** e **Representação** (§5.3 do livro-texto). Não há desenvolvimento de software nesta sprint; a primeira sprint de codificação está prevista a partir da Sprint 3.

O produto de trabalho central da Sprint 1 é, portanto, o **Product Backlog declarado em histórias de usuário com critérios de aceitação**, que constitui a matéria-prima direta da seção 8 do Documento de Visão, entregue na Unidade 2 em 13/10/2026.

---

## 4. Definição da Sprint 1

### 4.1 Período e cadência

| Parâmetro | Definição |
|---|---|
| Início | 08/09/2026 (terça-feira), coincidente com a entrega da Unidade 1 |
| Encerramento | 22/09/2026 (terça-feira) |
| Duração | 2 semanas, conforme cadência-padrão estabelecida pela equipe |
| Ancoragem | Terças-feiras, conforme cadência-padrão |
| Reunião de Planning | 08/09/2026 (terça-feira), à noite — ver observação abaixo |

**Sprint Planning realizada.** A reunião de Sprint Planning ocorreu em 08/09/2026, à noite (21h33–23h07), no mesmo dia da entrega da Unidade 1, da Questão de Aula (QAU, 10h10–10h50) e da reunião presencial no Instituto. Este documento registra o que foi efetivamente deliberado nessa reunião.

**Observação sobre a Semana Universitária.** A Semana Universitária ocorre entre 22 e 24/09/2026. Com o encerramento da Sprint 1 em 22/09, apenas o dia da cerimônia de encerramento coincide com o evento; **os dias de produção da Sprint 1 não são afetados**. O impacto da Semana Universitária desloca-se integralmente para o início da Sprint 2, o que deve ser considerado no planejamento daquela sprint (ver §12).

### 4.2 Estrutura da Sprint em duas fases

A Sprint 1 organiza-se em duas semanas com finalidades distintas, o que constitui decisão deliberada de planejamento:

| Fase | Período | Finalidade | Produto |
|---|---|---|---|
| **Semana 1 — Habilitação** | 08/09 a 13/09 | Planejamento, nivelamento de técnica de redação de requisitos e das duas tecnologias do núcleo do back-end | Equipe habilitada a declarar requisitos com o vocabulário correto e com ambiente em execução |
| **Semana 2 — Produção** | 14/09 a 22/09 | Elaboração do Product Backlog | Product Backlog declarado, priorizado por MoSCoW e estruturado no GitHub Projects |

A justificativa desta divisão é a seguinte: a elicitação de 08/09 revelou vocabulário técnico-normativo específico (indicador, parâmetro de aferição, forma de verificação, frequência de apuração, glosa, relatório de execução do objeto) cujo domínio é atualmente concentrado em um único integrante da equipe. Iniciar a redação do backlog sem nivelar esse domínio produziria histórias genéricas, incapazes de sustentar uma prestação de contas real. A Semana 1 elimina essa dependência antes que ela comprometa o produto de trabalho da Semana 2.

### 4.3 Meta da Sprint

> **Sprint Goal (aprovado em 08/09):** *"Ao final da Sprint 1, a equipe dispõe de um Product Backlog estruturado no GitHub Projects que declara o ciclo do projeto financiado — requisito/meta, atividade, evidência, relatório de execução do objeto e base única de pessoas — em histórias de usuário com critérios de aceitação verificáveis, classificadas por MoSCoW e rastreadas aos Objetivos Específicos, acompanhado da representação do processo atual do Instituto em notação BPMN."*

**Fundamentação do recorte.** A meta é integralmente verificável em 22/09: cada uma de suas cláusulas admite resposta objetiva de conformidade. Observa-se a orientação docente de formular objetivos pelo efeito produzido na organização, e não pela tecnologia empregada. A meta concentra-se no produto de trabalho que a equipe controla integralmente, excluindo compromissos cuja realização depende de agenda de terceiros.

**Exclusões explícitas do escopo da Sprint 1:**

| Item excluído | Justificativa |
|---|---|
| Qualquer linha de código de produto | A Sprint 1 é de Engenharia de Requisitos; codificação inicia na Sprint 3 |
| Definição do MVP do produto | Requer o backlog declarado e validação com o Instituto e com o docente; não é objeto desta Sprint — ver §8.2-A |
| ~~Dojos de TanStack Query, shadcn/ui e Dexie~~ | Decisão revista em 10/09 (v5.0): os três entram na noite de 10/09, com profundidade proporcional à lacuna real da matriz — ver §6.2-B. NestJS e Prisma seguem na Sprint 1, conforme a decisão D2 da ata da Planning |
| Realização confirmada das entrevistas com Diretoria de Projetos e Administrativo-Financeiro | Depende de agenda do Instituto; o compromisso da Sprint é o agendamento formal — ver item A1/A2 em §7.1 |

**Correção editorial registrada em 14/09/2026 (v6.0).** Até a emissão v5.0 esta tabela excluía do escopo da Sprint 1 a linha *"Priorização MoSCoW e definição de MVP"*. A exclusão do MoSCoW contradizia, dentro do próprio documento, a Meta da Sprint acima — que exige histórias "classificadas por MoSCoW" —, o §1, o §4.2, o §8, a *Definition of Ready* de §7, os critérios CAS-01 e CAS-02 do §11 e o Anexo D; e contradizia a decisão **D1** da ata da Sprint Planning de 08/09, que adota o MoSCoW como instrumento único de priorização do Product Backlog. Trata-se de resíduo editorial da emissão anterior, e não de deliberação: **nenhuma decisão nova é atribuída à reunião de 08/09**, cuja ata permanece inalterada. A definição do MVP continua fora do escopo desta Sprint, por razão distinta, registrada na linha acima.

---

## 5. Capacidade da equipe

### 5.1 Calendário detalhado da Sprint

| Data | Dia | Natureza | Capacidade produtiva |
|---|---|---|---|
| 08/09 | terça | Entrega da Unidade 1 · QAU (10h10–10h50) · reunião presencial no Instituto · **Sprint Planning** à noite (21h33–23h07, ver Anexo A) · início formal da Sprint | Nula — dia integralmente consumido pelas quatro atividades |
| 09/09 | quarta | Produção — consolidação dos achados da presencial e da Planning; início da redação do glossário (ART-01) | **Plena** |
| 10/09 | quinta | **Apresentação da Unidade 1** · **Dojos D1 e D2** (ver §6) | Nula — habilitação |
| 11/09 | sexta | Produção | **Plena** |
| 14/09 | segunda | Produção — Semana 2, Product Backlog | **Plena** |
| 15/09 | terça | Produção · Refinamento semanal (~30 min) | **Plena** |
| 16/09 | quarta | Produção · revisão cruzada entre duplas | **Plena** |
| 17/09 | quinta | Produção — consolidação no GitHub Projects | **Plena** |
| 18/09 | sexta | Produção — fechamento do backlog | **Plena** |
| 21/09 | segunda | Consolidação e preparação da Sprint Review | **Plena** |
| 22/09 | terça | **Sprint Review · Retrospectiva · Sprint 2 Planning** | Nula — cerimônia |

**Síntese:** 11 dias úteis no período, dos quais **8 dias de capacidade produtiva plena** (09, 11, 14, 15, 16, 17, 18 e 21 de setembro), sendo 6 deles concentrados na Semana 2.

**Consequência para o dimensionamento do backlog.** A Sprint dispõe de janela produtiva estreita e concentrada. Recomenda-se que a seleção do Sprint Backlog na reunião de Planning observe rigorosamente esse limite, priorizando a completude e a qualidade do Épico C (Declaração) sobre a quantidade de itens selecionados. Épicos A, D e E admitem transbordo para a Sprint 2 sem prejuízo da Meta.

### 5.2 Perfil da equipe para os produtos de trabalho desta Sprint

Extraído da Matriz de Competências. Considera-se aqui a aptidão para produtos de trabalho não relacionados a código, adequados à natureza da Sprint 1.

| Integrante | Papel | Aptidão relevante nesta Sprint | Observação de alocação |
|---|---|---|---|
| Maria Eduarda Marques | Product Owner · Dupla A | Interlocução direta com o Instituto; perfil técnico acima do exigido pelo papel | Evitar sobrecarga na acumulação de interlocução com cliente e produção de backlog |
| Vinicius | Scrum Master · Dupla B | Domínio do referencial normativo consolidado na análise pós-presencial | Risco de concentração de conhecimento, normativo e técnico; mitigado pela leitura verificada e pelo Dojo D2 (R10) |
| Caio | Dupla C | Segundo maior perfil técnico; aptidão para modelagem de dados | Alocar aos blocos de declaração de natureza estrutural (evidência e relatório) |
| Rodrigo | Dupla B | Mentor em diagramação (Figma), Git e SQL | Alocação natural para representação em BPMN e Rich Picture |
| Lucas | Dupla C | Conhecimento de domínio obtido em campo — relatou originalmente a dor da prestação de contas (ata de 27/08) | Alocar sempre em par |
| Daniel | Dupla A | Matriz de Competências incompleta | Completar a Matriz durante a Sprint; alocar em par na declaração |

---

## 6. Plano de capacitação — dojos

### 6.1 Diretriz

A Sprint 1 realiza **dois dojos: um de fundação e processo, outro técnico**, conforme a decisão D2 da Sprint Planning de 08/09/2026. A emissão anterior deste plano descreveu dois dojos de processo e deslocou os técnicos para a Sprint 2, o que não corresponde ao que a ata registra. Esta versão corrige o texto para que o plano seja fiel à deliberação que ele documenta; a ata não é alterada.

Ambos os dojos ocorrem em **10/09/2026 (quinta-feira)**, aproveitando a presença integral da equipe na data da apresentação da Unidade 1, e são realizados **após** a apresentação.

**A ordem entre os dois dojos é obrigatória, e é a inversa da emissão anterior.** O dojo de fundação vem primeiro por dependência material, não pedagógica: o dojo técnico exige, na máquina de cada integrante, ambiente instalado, repositório clonado e banco de dados de pé. Sem isso, o segundo dojo vira exposição assistida por quem não consegue executar nada.

O conteúdo normativo previsto na emissão anterior para o primeiro dojo — a cadeia do financiamento público, o relatório de execução do objeto, o modelo mínimo de meta e o conceito de glosa — **não é descartado**: converte-se de exposição oral em leitura individual da análise consolidada pós-presencial, com entrega verificável no glossário (ART-01) até o refinamento de 15/09. A mitigação do risco R10 muda de mecanismo, não deixa de existir.

### 6.2 Especificação dos dojos da Sprint 1

#### Dojo D1 — Fundação: histórias, backlog, Git e ambiente

| Parâmetro | Definição |
|---|---|
| **Data e horário** | 10/09/2026, após a apresentação da Unidade 1 |
| **Duração** | 60 minutos |
| **Facilitação** | Vinicius (Scrum Master), com Rodrigo nos blocos de Git e de protocolo do backlog e Caio no apoio de ambiente |
| **Participantes** | Equipe completa (6 integrantes) |
| **Formato** | Prático |
| **Registro** | Gravação em Google Meet, conforme prática da equipe |

**Conteúdo programático:**

1. Os seis critérios INVEST: Independente, Negociável, Valiosa, Estimável, Small (pequena) e Testável.
2. O formato de história adotado pela equipe e a exigência de que o critério de aceitação seja **observável**: formulações como "Dado que o sistema funciona corretamente" não constituem critério de aceitação.
3. Erro recorrente a evitar: a descrição da solução técnica em lugar do comportamento esperado.
4. Protocolo do Product Backlog no quadro do projeto, conforme os campos e as etiquetas efetivamente criados (item D1): Épico, Atividade de ER, Objetivo específico, Característica proposta e MoSCoW. **O campo MoSCoW permanece vazio até o refinamento de 15/09**, para não ancorar a classificação antes da discussão.
5. Fluxo de trabalho em Git da equipe: nomenclatura de branch com o identificador da história, Conventional Commits, revisão cruzada por par e vínculo do pull request à issue.
6. Ambiente de desenvolvimento em execução na máquina de cada integrante.

**Exercício prático.** O exercício utiliza as histórias candidatas reais do Épico C (§7.2), e não exemplos fictícios. Cada dupla assume os blocos que lhe foram alocados em §9, refina as histórias e redige as que faltarem. Em consequência, o dojo produz simultaneamente capacitação e produto de trabalho da Sprint: **as histórias resultantes constituem a primeira sessão de refinamento do backlog**, e não material descartável de treinamento.

**Resultado esperado:** equipe apta a redigir histórias em conformidade com INVEST e Given/When/Then; protocolo do backlog acordado; ambiente em execução e um commit no padrão da equipe por integrante.

**Nota de 17/09/2026 (v7.0).** O dojo ocorreu em 10/09 no formato então vigente (decisão D3: Dado/Quando/Então), como registram o material da branch `dojo/11` e os exercícios entregues pelos integrantes. A orientação posterior da issue #23 não altera o que foi ensinado; seu efeito sobre os critérios já redigidos está registrado em §7.2.

#### Dojo D2 — NestJS e Prisma: uma fatia vertical do domínio

| Parâmetro | Definição |
|---|---|
| **Data e horário** | 10/09/2026, após o Dojo D1, com intervalo mínimo de 10 minutos |
| **Duração** | 75 minutos |
| **Facilitador** | Vinicius (Scrum Master) |
| **Participantes** | Equipe completa (6 integrantes) |
| **Formato** | Prático: demonstração conduzida, seguida de rodízio de teclado |
| **Pré-requisito** | Dojo D1 concluído, com ambiente em execução |
| **Registro** | Gravação em Google Meet |
| **Contingência** | Em caso de extensão da apresentação da Unidade 1, reduz-se o rodízio antes de reduzir a demonstração; a validação que recusa o registro incompleto não é suprimida |

**Conteúdo programático:**

1. NestJS: módulo, controlador, provedor, injeção de dependência e objeto de transferência de dados com validação.
2. Prisma: esquema como fonte única do banco, migrations versionadas e cliente tipado.
3. Fatia vertical construída sobre o domínio real do projeto, e não sobre exemplo genérico.
4. Convenções que passam a valer no repositório a partir da sessão.

**Delimitação necessária.** O modelo construído no exercício é material de aprendizagem sobre campos cuja existência já está documentada. **Ele não decide a fronteira entre requisito e meta**, que depende da análise da planilha-template do Instituto (item A4) e permanece em aberto.

**Resultado esperado:** nivelamento nas duas tecnologias de maior concentração de conhecimento na equipe (risco R10) e redução da dependência de um único integrante no núcleo do back-end.

### 6.3 Capacitação técnica prevista para a Sprint 2

Dos cinco dojos técnicos identificados pela matriz de competências, **NestJS e Prisma são antecipados para a Sprint 1** (§6.2), por serem o núcleo do back-end e por concentrarem o conhecimento em um único integrante. Os três restantes permanecem na Sprint 2, pelas seguintes razões: (a) não desbloqueiam nenhum item da Sprint 1, que não contempla codificação; (b) antecedem em margem adequada a primeira sprint de desenvolvimento; (c) evita-se, na própria equipe, o acúmulo de frentes simultâneas sobre efetivo reduzido — precisamente o gargalo identificado no cliente

| Dojo | Facilitador | Duração | Justificativa |
|---|---|---|---|
| TanStack Query | Vinicius | 45 min | Sustenta a sincronização offline (mutations com retry e cache) |
| shadcn/ui e Tailwind — padrões | Vinicius | 45 min | Consistência visual estabelecida antes da construção de telas |
| Dexie / IndexedDB | Caio e Vinicius | 45–60 min | Caio é segundo mentor na competência; oportunidade de co-facilitação |

**Datas:** a definir na Sprint 2 Planning de 22/09, observando o início após a Semana Universitária (a partir de 29/09) e espaçamento de 2 a 3 dias entre sessões.

### 6.4 Padrão aplicável a todos os dojos

Registra-se como prática da equipe:

1. Todo dojo é gravado, permitindo recuperação por integrantes ausentes.
2. Todo dojo encerra-se com exercício prático de aplicação real, e não apenas com exposição.
3. A facilitação não é atribuição exclusiva do Scrum Master. Integrantes com afinidade superior na competência devem facilitar as sessões correspondentes — como no caso de Rodrigo em diagramação e de Caio em persistência offline. Esta prática constitui aplicação da propriedade coletiva do XP estendida ao conhecimento, e não apenas ao código.

---

## 7. Product Backlog candidato

Os itens são organizados pelas atividades de Engenharia de Requisitos que exercitam (§5.3 do livro-texto). A coluna DoR indica a aderência à Definition of Ready da equipe (valor claro para um perfil do Instituto · critérios de aceitação escritos · classificada no MoSCoW · não depende de decisão externa pendente · cabe em uma sprint).

**Nenhum item deste documento apresenta classificação MoSCoW pré-atribuída.** A classificação é atribuição da equipe na sessão de priorização (§8); a supressão de classificações sugeridas evita ancorar a discussão antes que ela aconteça.

### 7.1 Épicos A, B, D e E — itens sem redação de história

| ID | Item | Épico / Atividade de ER | Origem | DoR | Observação |
|---|---|---|---|---|---|
| A1 | Solicitar e agendar entrevista de 30 min com a Diretora de Projetos | A — Elicitação e Descoberta | Risco R3 (agenda do Instituto) | Sim | O compromisso da Sprint é o agendamento formal; a realização depende da agenda do Instituto |
| A2 | Solicitar e agendar entrevista de 30 min com a área Administrativo-Financeira | A — Elicitação e Descoberta | Achado da reunião presencial | Sim | Idem A1 |
| A3 | Observação direta de uma atividade em execução | A — Elicitação e Descoberta | Roteiro da reunião presencial | Condicionado | Executar apenas se houver data confirmada até 16/09; caso contrário, transborda para a Sprint 2 |
| A4 | Análise crítica da planilha-template do Instituto | A — Elicitação e Descoberta | Achado da reunião presencial | Condicionado | Condicionado ao envio pelo Instituto. Aplicar o checklist definido pela equipe. **Executar preferencialmente em 11/09**, antes da Semana 2 |
| B1 | Representação do processo atual em BPMN (edital → prestação de contas) | B — Representação | Achado da reunião presencial | Sim | Utilizar o diagrama já esboçado pela equipe como rascunho inicial |
| B2 | Atualização do Rich Picture e do mapa de stakeholders com os papéis reais | B — Representação | Ficha do cliente; achado da reunião presencial | Sim | Incorporar: Diretoria de Projetos, Captação, ausência de RH. Insumo das seções 1.3 e 1.6 |
| D1 | Estruturação do Product Backlog no GitHub Projects | D — Organização e Atualização | Ritos da equipe | Sim | Colunas, rótulos por épico e por OE/CP, campo de classificação MoSCoW |
| D2 | Esqueleto da matriz de rastreabilidade problema → OE → CP → RF | D — Organização e Atualização | Ritos da equipe | Sim | Utilizar os identificadores HU-xx e CA-xx.y deste documento |
| E1 | Preparação da sessão de validação com o Instituto | E — Verificação e Validação | Achado da reunião presencial | Condicionado | Condicionado à conclusão do Épico C. Sessão prevista para a Sprint 2 |
| ART-01 | Glossário de termos do Instituto | D — Organização e Atualização | Achado da reunião presencial | Sim | Artefato, não história. Termos: requisito, meta, indicador, comprovação, demanda, plano de trabalho, proposta de trabalho, termo aditivo, prestação de contas, instrumento, financiador, vertente, objeto |

**Nota sobre a classificação dos itens A1, A2 e A3.** Estes itens dependem da agenda do Instituto. Ao classificá-los no MoSCoW, a equipe deve avaliar a necessidade de realizá-los (Must, dado o risco R3), e não confundir "necessário" com "sob controle da equipe": a realização efetiva das entrevistas depende de terceiros, mas o agendamento formal não.

### 7.2 Épico C — Declaração: histórias de usuário

Constitui o produto de trabalho central da Sprint. As histórias abaixo são candidatas redigidas previamente, destinadas ao refinamento pela equipe — não a substituí-lo. Identificadores HU-xx e CA-xx.y são definitivos e devem ser preservados na transposição para o GitHub Projects, por serem a base da matriz de rastreabilidade (item D2).

**Orientação docente posterior — registrada em 14/09/2026 (v6.0) e incorporada em 17/09/2026 (v7.0).** A decisão **D3** da ata de 08/09 padronizou os critérios de aceitação no formato Dado/Quando/Então (*Given/When/Then*). A issue **#23**, aberta pelo docente após a apresentação da Unidade 1, determina que, **para a disciplina**, os critérios de aceitação sejam redigidos como **lista de critérios**. A ata de 08/09 permanece como registro histórico e não é alterada. Em 15/09, Caio Martins converteu os 18 critérios para lista diretamente sobre a versão publicada no site (emissão 3.1, feita sem as emissões 4.0 a 6.0). Esta emissão incorpora a conversão **preservando o conteúdo aprovado na Planning**: o que mudou foi a forma. Onde a conversão de 15/09 ou a revisão de 17/09 propôs mudança de conteúdo, o critério abaixo mantém o sentido original em lista e a proposta está no bloco 🔧 ao fim desta seção, para deliberação na Sprint Review ou Retrospectiva de 22/09 — foro que também formaliza a mudança de formato em relação à D3.

---

#### HU-01 — Cadastro de requisito com parâmetros de aferição

**Bloco:** C1 — Requisito/Meta · **Origem:** CP01, ampliada pela análise pós-presencial · **Complexidade prevista:** alta

> Como Diretora de Projetos, quero cadastrar cada requisito de um projeto com sua origem (edital, projeto ou Instituto), indicador, parâmetro de aferição, forma de verificação e frequência de apuração, para saber exatamente o que precisa ser comprovado e quando.

| ID | Critério de aceitação |
|---|---|
| CA-01.1 | O formulário de cadastro de requisito deve exigir obrigatoriamente a indicação de: origem (edital, projeto ou Instituto), indicador, parâmetro de aferição, forma de verificação e frequência de apuração |
| CA-01.2 | O sistema deve recalcular automaticamente o progresso percentual da meta associada ao requisito sempre que uma atividade vinculada for registrada |
| CA-01.3 | O sistema deve impedir a gravação de requisitos sem indicador ou forma de verificação preenchidos, destacando os campos pendentes |

---

#### HU-02 — Atribuição de responsabilidade e prazo a requisito

**Bloco:** C1 — Requisito/Meta · **Origem:** dor confirmada na reunião presencial (ausência de controle de demandas)

> Como responsável de área, quero atribuir dono, setor e prazo a cada requisito ou meta, para saber sempre com quem está a demanda e se o prazo está expirando.

| ID | Critério de aceitação |
|---|---|
| CA-02.1 | O painel do projeto deve exibir o responsável atribuído, setor e prazo de cada requisito ou meta cadastrada |
| CA-02.2 | O painel deve apresentar alerta para os requisitos cujo prazo vença em até 7 dias |
| CA-02.3 | O sistema deve sinalizar pendência explícita no painel para qualquer requisito sem responsável atribuído no momento em que o projeto entra em execução |

---

#### HU-03 — Cadastro de atividade por tipo de objeto

**Bloco:** C2 — Atividade · **Origem:** CP02

> Como educador ou coordenador, quero cadastrar uma atividade vinculada a um projeto e a um tipo de objeto (oficina, evento, ação de rua), para que o sistema determine qual conjunto de evidências será exigido.

| ID | Critério de aceitação |
|---|---|
| CA-03.1 | O cadastro de atividade deve disponibilizar lista predefinida para seleção do tipo de objeto (oficina, evento, ação de rua) |
| CA-03.2 | Para atividades do tipo "evento", o sistema deve indicar e listar como evidências esperadas: público estimado, registro fotográfico com logomarca e clipping |
| CA-03.3 | Para atividades do tipo "oficina", o sistema deve indicar a lista de presença como evidência principal |

---

#### HU-04 — Vinculação de evidência a meta

**Bloco:** C3 — Evidência · **Origem:** CP07

> Como educador, quero anexar uma evidência a uma atividade e vinculá-la a uma ou mais metas, para que a comprovação seja produzida já organizada por meta.

| ID | Critério de aceitação |
|---|---|
| CA-04.1 | O anexo de evidência em atividade concluída deve exigir data, local e a vinculação a uma ou mais metas do projeto |
| CA-04.2 | A visualização da meta deve relacionar as evidências já anexadas e indicar as evidências pendentes conforme o tipo de objeto da atividade |
| CA-04.3 | Ao gravar evidência sem meta vinculada, o sistema deve alertar que ela não será considerada em nenhuma prestação de contas |

---

#### HU-05 — Geração do relatório de execução do objeto

**Bloco:** C4 — Relatório · **Origem:** CP08, reposicionada pela análise pós-presencial · estrutura fundamentada na convergência normativa entre financiadores

> Como Diretora de Projetos, quero gerar o relatório de execução do objeto de um projeto para um período determinado, com metas propostas confrontadas aos resultados alcançados e evidências anexadas, para prestar contas sem montagem manual.

| ID | Critério de aceitação |
|---|---|
| CA-05.1 | O relatório do período deve apresentar cada meta do projeto com resultado pactuado, resultado alcançado, percentual de cumprimento e links para as evidências vinculadas |
| CA-05.2 | O sistema deve exigir obrigatoriamente justificativa formal antes de permitir a finalização de relatório que contenha metas cumpridas apenas parcialmente ou não atingidas |
| CA-05.3 | A exportação do relatório finalizado deve disponibilizar download nos formatos PDF e CSV com integridade e equivalência de conteúdo |

**Fundamento de CA-05.2:** a Lei 13.019/2014, art. 64, §1º, estabelece que meta descumprida sem justificativa enseja glosa. A obrigatoriedade da justificativa não é preferência de interface: é requisito de conformidade legal.

---

#### HU-06 — Consulta ao histórico de participação de pessoa

**Bloco:** C5 — Base única de pessoas · **Origem:** CP05, ampliada pela análise pós-presencial

> Como integrante da equipe de comunicação, quero consultar o histórico de participação de uma pessoa nos diferentes projetos, para convidá-la a ações compatíveis com seu perfil e interesse.

| ID | Critério de aceitação |
|---|---|
| CA-06.1 | O perfil de cada pessoa cadastrada deve exibir a listagem completa de todas as atividades e projetos de que participou |
| CA-06.2 | O sistema deve alertar sobre possível duplicidade cadastral caso sejam informados nome e telefone coincidentes com registro existente |
| CA-06.3 | O cadastro de pessoa deve registrar a data e confirmação explícita de consentimento para tratamento de dados pessoais conforme a LGPD |

**Restrição de conformidade.** Decisão da equipe: o produto **não mantém cadastro estruturado** de dados pessoais sensíveis (LGPD, art. 5º, II); o cadastro de pessoas restringe-se a identificação e contato, com registro de consentimento (CA-06.3). Fotografias e campos de texto livre podem revelar dado sensível mesmo sem campo próprio, e por isso ficam sob controle de acesso por finalidade, conforme a seção 2 do Documento de Visão revisada pela issue #20.

#### 🔧 Propostas de refinamento de critérios, para deliberação em 22/09

Nenhuma das propostas abaixo altera o critério vigente até registro em ata da Sprint Review ou da Retrospectiva de 22/09.

| Critério | Texto vigente (forma em lista, conteúdo da Planning) | Proposta | Origem da proposta |
|---|---|---|---|
| CA-02.2 | alerta para prazo em até 7 dias | destacar requisitos cujo prazo entre na **janela de antecedência configurada** para o projeto; antecedência-padrão a definir com a Diretoria de Projetos | os 7 dias não têm fonte no Instituto nem em edital; o exercício EX-01 do Dojo D1 entregue por Maria Eduarda Marques em 15/09 e a auditoria interna de requisitos de 15/09 apontam o número como hipótese |
| CA-03.3 | indica a lista de presença como evidência principal | **exigir** a lista de presença para oficinas | conversão de 15/09 (emissão 3.1, Caio Martins) |
| CA-04.3 | alerta que evidência sem meta não será considerada | aceitar evidência sem meta apenas como **rascunho** ligado a projeto/atividade: não conta, não entra em relatório e **impede o fechamento** do relatório até ser vinculada ou descartada | decisão de especificação de 15/09 (pendência PEN-07 da auditoria interna), ainda não deliberada pela equipe; a emissão 3.1 propunha **bloquear** a gravação, alternativa que descarta material de campo |

---

## 8. Método de priorização e dimensionamento — MoSCoW

### 8.1 Método único: MoSCoW

A equipe adota o método **MoSCoW** (Must have · Should have · Could have · Won't have) como **instrumento único** de priorização e de dimensionamento do Product Backlog. Não se adota Planning Poker, pontos de história ou qualquer outra escala de estimativa em paralelo. A decisão é da Sprint Planning de 08/09/2026.

A opção é deliberadamente minimalista, e é a forma em que o MoSCoW nasceu: no método DSDM, ele não é apenas um rótulo de prioridade, mas o próprio mecanismo de controle de escopo em prazo fixo. O prazo da Sprint é imutável; o escopo é a variável de ajuste. A regra de proporção do DSDM (§8.2) faz o papel que, em outras abordagens, caberia a uma estimativa numérica: ela responde à única pergunta que importa no planejamento — *o conjunto de Must Haves cabe no período, com folga suficiente para absorver imprevisto?*

O método também é coerente com o que a equipe já pratica: é a mesma lógica de necessidade × desejo aplicada às decisões de escopo desde o início do projeto, e corresponde à priorização por valor de negócio característica do Scrum, em que o Product Backlog é ordenado, não pontuado.

**Por que nenhuma estimativa numérica nesta fase.** A estimativa relativa em pontos só produz informação útil quando há itens de desenvolvimento comparáveis entre si e uma série histórica de velocidade. Nenhuma das duas condições existe antes da Sprint 3, primeira sprint de código. Estimar em pontos uma sprint de Engenharia de Requisitos produziria números sem lastro, e o custo da cerimônia não se converteria em decisão melhor.

### 8.2 Categorias e regra de proporção

| Categoria | Critério de inclusão | Esforço-alvo |
|---|---|---|
| **Must have** | O item é indispensável para que o Sprint Goal (§4.3) seja alcançado. Sua ausência invalida a entrega da Sprint | até **60%** |
| **Should have** | O item tem valor relevante, mas sua ausência não invalida o Sprint Goal — pode ser adiado para a Sprint 2 sem prejuízo | cerca de **20%** |
| **Could have** | O item é desejável e de menor impacto. Funciona como **contingência deliberada**: é o primeiro a ser descartado quando algo aperta, protegendo os Must Haves | cerca de **20%** |
| **Won't have (desta Sprint)** | O item é reconhecido como válido, mas explicitamente fora do período. Não é o mesmo que "fora de escopo do produto" | — |

**Nesta Sprint, o esforço a que a proporção se refere é o de Engenharia de Requisitos — elicitação, análise, redação de histórias, critérios de aceitação e representação do processo —, e não esforço de implementação. Não há codificação na Sprint 1, e nenhuma das histórias declaradas aqui é construída neste período: elas são declaradas para construção a partir da Sprint 3.

A proporção 60/20/20 incide sobre o esforço, não sobre a quantidade de itens** (AGILE BUSINESS CONSORTIUM, *DSDM Project Framework*). O limite de 60% para os Must Haves é o que garante margem para imprevisto: se todo o período estiver comprometido com itens obrigatórios, qualquer atraso compromete a entrega inteira. Os Could Haves não são "sobras" — são a reserva que se sacrifica primeiro, de propósito, para que o Must chegue ao fim da Sprint.

### 8.2-A Objeto e horizonte da classificação

**Seção acrescentada em 14/09/2026 (v6.0).** A classificação MoSCoW responde a duas perguntas distintas, que este documento passa a separar de forma explícita:

| Horizonte | Pergunta que a classificação responde | Objeto classificado | Situação nesta Sprint |
|---|---|---|---|
| **A — trabalho de ER na Sprint 1** | O item é indispensável para alcançar o Sprint Goal (§4.3) até 22/09? | Itens do Product Backlog candidato de §7: elicitações, análises, histórias a redigir, representações e artefatos | **É o que se classifica nesta Sprint** (§8.5) |
| **B — funcionalidade no produto e no MVP** | A funcionalidade é indispensável no primeiro recorte utilizável pelo Instituto? | Funcionalidades do produto, ao longo das sprints de construção, a partir da Sprint 3 | **Não classificado nesta Sprint**; depende do backlog declarado e de validação com o Instituto e com o docente |

**A classificação em um horizonte não determina a do outro.** Um item pode ser *Must* no horizonte A sem integrar o MVP: analisar e descrever a variedade de relatórios do Instituto é indispensável agora — inclusive porque pode revelar que a geração automática do relatório não cabe no semestre —, sem que a funcionalidade correspondente seja obrigatória no primeiro recorte entregue. A leitura inversa também vale.

Por essa razão, **"Must nesta Sprint" não é sinônimo de "Must do MVP"**, e nenhuma classificação registrada no quadro do projeto nesta Sprint deve ser lida como definição de MVP. O DSDM, de onde o MoSCoW vem, admite prioridades distintas para o projeto, o incremento e o período de trabalho (AGILE BUSINESS CONSORTIUM, *DSDM Project Framework*).

**Consequência para a proporção de §8.2.** A regra 60/20/20 aqui aplicada incide sobre o esforço do horizonte A. Sua verificação apoia-se nos dias de produção de §5.1 e na verificação qualitativa de §8.4: contagem de itens não mede proporção de esforço e não substitui essa base de capacidade.

### 8.3 Procedimento de classificação

| Etapa | Ação |
|---|---|
| 1 | O facilitador lê o item e, no caso de história, seus critérios de aceitação |
| 2 | Abre-se prazo de até 2 minutos para perguntas de esclarecimento sobre o item, não sobre a prioridade |
| 3 | Cada integrante propõe uma categoria, com justificativa de uma frase ligada ao Sprint Goal ou a um risco registrado no §10 |
| 4 | **Consenso imediato:** a categoria é registrada sem mais debate |
| 5 | **Divergência:** prevalece a categoria mais restritiva (a "mais alta" entre as propostas) até que o PO decida, de forma explícita, rebaixá-la — decisão de priorização de backlog é atribuição do Product Owner, não da maioria simples |
| 6 | Registra-se a categoria acordada na ata e no item correspondente do GitHub Projects |

### 8.4 Verificação de capacidade e fatiamento

Concluída a classificação, a equipe faz uma única verificação, de forma qualitativa e sem escala numérica: **o conjunto de Must Haves cabe nos dias de produção disponíveis (§5.1), consumindo no máximo cerca de 60% deles?**

- **Cabe:** a classificação é confirmada e a Sprint segue.
- **Não cabe:** não se remove o requisito nem se estende o prazo. **Fatia-se o item**: a parte que sustenta o Sprint Goal permanece Must; o refinamento, a variação de caso ou o acabamento tornam-se Should ou Could. Um Must Have grande demais quase sempre é dois itens, um obrigatório e um desejável, ainda não separados.
- **Durante a Sprint:** se o prazo apertar, descartam-se os Could Haves primeiro e os Should Haves em seguida. Os Must Haves não são negociados contra a data de encerramento — é para isso que a folga existe.

### 8.5 Aplicação a esta Sprint

A classificação MoSCoW desta Sprint aplica-se ao Product Backlog candidato de §7, **no horizonte A definido em §8.2-A**, na reunião de Planning e no refinamento de 15/09. Não é definição de MVP.

🔧 **O que segue é proposta do Scrum Master, não classificação atribuída.** Registra-se aqui apenas como ponto de partida da discussão, em coerência com §7: nenhum item entra no quadro do projeto já classificado, e o campo MoSCoW permanece vazio até o refinamento de 15/09.

- **Must:** todas as histórias do Épico C (§7.2) — são o produto de trabalho central da Sprint, conforme a Meta (§4.3) — e os itens B1, B2, D1 e D2 do Épico A/B/D, que estruturam a representação do processo e o próprio backlog.
- **Should:** A1, A2, A4 e ART-01 — de alto valor, mas cuja realização integral não é pré-condição do Sprint Goal.
- **Could:** A3 (observação direta de uma atividade), condicionada a agenda disponível até 16/09, conforme já registrado em §7.1.
- **Won't (desta Sprint):** E1 (preparação da sessão de validação), explicitamente deslocado para a Sprint 2 conforme §7.1.

A confirmação ou o ajuste desta classificação é objeto da reunião de Planning e do refinamento, e deve ser registrada na coluna correspondente do GitHub Projects (item D1).

### 8.6 Primeira aplicação e referência de capacidade

Esta é a primeira aplicação formal do MoSCoW no projeto. Em consequência:

1. A seleção do Sprint Backlog apoia-se no julgamento da equipe quanto à capacidade descrita em §5.1 e na verificação de §8.4, não em uma métrica de velocidade.
2. A proporção de Must Haves efetivamente concluídos ao final da Sprint 1, apurada na Sprint Review de 22/09, constitui a **primeira referência de capacidade real** do projeto e calibra o dimensionamento do MoSCoW da Sprint 2. É essa apuração, e não uma escala de pontos, que torna a estimativa mais precisa a cada sprint.
3. O MoSCoW permanece como método único nas sprints seguintes. Qualquer alteração de método é decisão deliberada da equipe em Sprint Retrospective, registrada em ata — não é mudança silenciosa de prática.

---

## 9. Alocação de responsabilidades

Preserva-se a composição das duplas já definida pela equipe, com realocação de foco à natureza dos produtos de trabalho da Sprint 1.

| Dupla | Integrantes | Itens atribuídos | Fundamento da alocação |
|---|---|---|---|
| **A** | Maria Eduarda Marques · Daniel Batista | A1, A2 · HU-06 · D2 | Maria Eduarda Marques exerce a interlocução com o Instituto na condição de Product Owner; Daniel Batista completa a Matriz de Competências em paralelo e atua em par na declaração |
| **B** | Vinicius · Rodrigo | B1, B2 · HU-01, HU-02 · ART-01 · A4 | Rodrigo é mentor em diagramação; Vinicius detém o domínio normativo consolidado na análise pós-presencial. A atribuição de A4 mantém coerência com o compromisso comunicado ao Instituto |
| **C** | Caio · Lucas | HU-03, HU-04, HU-05 | Caio apresenta aptidão para modelagem estrutural de dados; Lucas detém conhecimento de campo sobre a prestação de contas, obtido em elicitação anterior |
| **Equipe** | — | D1 (estruturação por Vinicius, alimentação por todos) · E1 (condução por Maria Eduarda Marques) · A3 (conforme disponibilidade) | — |

Esta alocação constitui proposta inicial. A reunião de Planning deve confirmar ou ajustar a distribuição antes do encerramento (Anexo A, bloco 5).

---

## 10. Registro de riscos

| ID | Risco | Prob. | Impacto | Mitigação | Responsável |
|---|---|---|---|---|---|
| R01 | A apresentação da Unidade 1 em 10/09 estende-se e compromete a realização dos dojos | Média | Alto | Dojos agendados após a apresentação; em caso de extensão, comprime-se o rodízio do Dojo D2 antes de suprimir qualquer bloco | SM |
| R02 | A janela produtiva de 8 dias úteis (§5.1) é insuficiente para o backlog selecionado | Média | Alto | A Meta da Sprint delimita o Épico C como prioridade; épicos A, D e E admitem transbordo para a Sprint 2 | PO e SM |
| R03 | A agenda do Instituto não permite realizar as entrevistas A1/A2 no período | Alta | Baixo | O compromisso da Sprint é o agendamento formal, não a realização; a Meta não depende destes itens | PO |
| R04 | A planilha-template do Instituto não é enviada até 11/09 | Média | Médio | As histórias do Épico C são redigidas a partir do modelo normativo consolidado pela equipe (Anexo VI da SEDET-DF); o template do Instituto passa a insumo de validação posterior | Dupla B |
| R05 | A primeira aplicação formal do MoSCoW gera divergência de critério entre os integrantes e estende a reunião de Planning | Média | Baixo | Regra de desempate por categoria mais restritiva (§8.3, etapa 5); em caso de extrapolação, classifica-se apenas o Épico C nesta reunião e o restante no refinamento de 15/09 | SM |
| R06 | A cerimônia de encerramento em 22/09 coincide com o início da Semana Universitária | Média | Médio | Confirmar a disponibilidade dos 6 integrantes ainda na reunião de Planning; alternativa é antecipar para 21/09 | SM |
| R07 | Dois dojos no mesmo dia, após apresentação, produzem fadiga e baixa retenção | Média | Médio | Intervalo mínimo de 10 minutos entre os dojos e pausa entre a demonstração e o rodízio do Dojo D2; ambos os dojos são práticos e produzem artefato real; ambos gravados | SM |
| R08 | Histórias redigidas sem o vocabulário técnico-normativo resultam genéricas | Média | Alto | Leitura individual da análise consolidada pós-presencial, com entrega verificável no glossário (ART-01) até o refinamento de 15/09; o exercício do Dojo D1 usa as histórias reais do Épico C, não exemplos fictícios | SM |
| R09 | A entrega da Unidade 2 (13/10) cai no interior da Sprint 3, não em fechamento de sprint, o que exige verificação de entrega fora da Sprint Review | Baixa | Médio | Cadência de 2 semanas mantida (§12); formalizar o novo início da Sprint 3 (06/10) nos documentos de equipe e de ritos na Sprint 2 Review/Retrospective | SM |
| R10 | Concentração do conhecimento normativo e técnico em um único integrante | Alta | Alto | No plano normativo: leitura da análise pós-presencial, que permanece como material de consulta permanente, com verificação pelo glossário. No plano técnico: Dojo D2 de NestJS e Prisma, com rodízio de teclado, e co-facilitação de Rodrigo e Caio no Dojo D1 | SM |

---

## 11. Critérios de aceitação da Sprint

A Sprint 1 é considerada concluída com êxito, na Sprint Review de 22/09/2026, mediante verificação objetiva dos seguintes critérios:

| ID | Critério | Verificação |
|---|---|---|
| CAS-01 | Todos os itens selecionados para o Sprint Backlog estão registrados no GitHub Projects, com rótulo de épico, vínculo a OE/CP e classificação MoSCoW | Inspeção do quadro |
| CAS-02 | Todas as histórias do Épico C atendem integralmente à Definition of Ready | Conferência item a item |
| CAS-03 | A representação do processo atual em BPMN está publicada e acessível | Verificação do artefato no repositório ou no site |
| CAS-04 | O glossário de termos do Instituto (ART-01) está registrado | Verificação do artefato |
| CAS-05 | As entrevistas A1 e A2 foram formalmente solicitadas, com proposta de data encaminhada ao Instituto | Registro da comunicação |
| CAS-06 | Os dois dojos foram realizados e gravados, e cada integrante registrou o ambiente em execução e um commit no padrão da equipe | Verificação das gravações e dos registros enviados pela equipe |
| CAS-07 | A ata do Sprint Planning e a ata da Sprint Review estão publicadas | Verificação no Drive e no projeto |
| CAS-08 | A proporção de itens Must concluídos está apurada, disponível como referência de capacidade para o dimensionamento do MoSCoW da Sprint 2 | Apuração na Review |

---

## 12. Calendário da Sprint 2

**Decisão: cadência-padrão de 2 semanas.** A Sprint 2 segue a cadência padrão de duas semanas (22/09 a 06/10/2026). A exceção de 3 semanas aplicada à Sprint 0 é motivada pela sobreposição entre o início do projeto, a fase de descoberta e o calendário da disciplina para a entrega da Unidade 1, e não constitui precedente para as demais sprints.

**Consequência:** a entrega da Unidade 2 (13/10) ocorre no interior da **Sprint 3**, que passa a iniciar em 06/10/2026. A verificação da entrega da U2 é feita pelo conteúdo publicado no prazo, não pela coincidência com o fechamento de uma sprint.

**Calendário de referência.** A seção 6 do Documento de Visão registra o cronograma tal como planejado na data da entrega da Unidade 1, e ela própria declara esse planejamento como preliminar, sujeito a atualização ao fim de cada sprint. A partir desta Sprint, **o calendário vigente do projeto passa a ser mantido nos planos de sprint**, que são o registro corrente da cadência efetivamente praticada. Em 17/09/2026 a seção 6 do Documento de Visão foi reconciliada com este calendário (versão 1.4 daquela seção, em resposta à issue #24) e passou a declarar a vigência de forma visível; a versão anterior permanece no histórico daquela página como retrato da entrega feita em 08/09.

**Declaração de vigência registrada em 14/09/2026 (v6.0), em resposta à issue #24.** O calendário vigente do projeto é o desta seção e do §4.1: **Sprint 1 de 08/09 a 22/09; Sprint 2 de 22/09 a 06/10; Sprint 3 a partir de 06/10**. O calendário da seção 6 do Documento de Visão — Sprint 1 de 15/09 a 29/09, Sprint 2 de 29/09 a 13/10, Sprint 3 de 20/10 a 03/11 — é o retrato da entrega da Unidade 1 e **está superado**. **Atualização de 17/09/2026 (v7.0):** a marcação visível da vigência no Documento de Visão foi executada na seção 6. As Sprints 3 a 6 ali descritas — primeira fatia vertical, pessoas e evidências, progresso e relatório, estabilização e implantação — são planejamento do Scrum Master a confirmar na Sprint Review ou Retrospectiva de 22/09, não deliberação já registrada em ata.

**Sobre a sobreposição de datas entre sprints.** Uma sprint encerra e a seguinte inicia na mesma terça-feira porque esse dia é ocupado pelos ritos, não pela produção: Review e Retrospectiva da sprint que encerra e Planning da que inicia. O §5.1 registra capacidade nula nesses dias; nenhum dia de produção é contado duas vezes.

---

## Anexo A — Condução da reunião de Sprint Planning

**Data:** 08/09/2026, à noite · **Duração:** ~94 minutos (21h33–23h07) · **Formato:** Google Meet, com gravação e ata automática · **Facilitador:** Vinicius (Scrum Master)

A reunião reuniu quatro blocos de trabalho: debrief da reunião presencial com o Instituto ocorrida mais cedo no mesmo dia; deliberação sobre o método de priorização do Product Backlog; apresentação e confirmação da estrutura da Sprint em duas semanas; e organização da comunicação e da dinâmica da equipe.

| Bloco | Conteúdo tratado | Deliberação |
|---|---|---|
| Debrief | Impressões da reunião presencial com o Instituto; achados sobre a estrutura organizacional (setores de marcenaria, lavanderia, estilografia, atendimento social) | Registrado na ata da reunião |
| Método de priorização | Comparação entre Planning Poker e MoSCoW para o contexto desta Sprint | **MoSCoW adotado como método único** (D1) |
| Estrutura da Sprint | Confirmação da divisão em duas semanas (dojos · Product Backlog) | Confirmada (D2) — ver §4.2 |
| Padrão de histórias | Critérios INVEST e Given/When/Then | Confirmado (D3) — ver §6.2, §7.2 |
| Capacitação | Conteúdo e data dos dois dojos (10/09) | Confirmado — ver §6.2 |
| Comunicação | Grupo com o Instituto, reuniões recorrentes, gravação das sessões | Decidido (D4, D5) |
| Dinâmica da equipe | Distribuição de carga e composição das duplas | **Não decidido** — encaminhado à Sprint Retrospective |

O registro completo desta reunião — resumo, decisões, próximas etapas e insumos para o Documento de Visão — está na ata da Sprint Planning, publicada junto às demais atas de reunião do projeto.

---

## Anexo B — Ata da reunião de Sprint Planning

A ata completa da Sprint Planning de 08/09/2026 é um documento próprio, publicado junto às atas de reunião do projeto.

---

## Anexo C — Plano de execução da Semana 2

Detalhamento operacional da fase de produção do Product Backlog (14/09 a 21/09).

| Data | Dia | Atividade | Responsáveis |
|---|---|---|---|
| 14/09 | segunda | Redação das histórias por bloco atribuído; início da modelagem BPMN (B1) | Todas as duplas |
| 15/09 | terça | Continuidade da redação · **Refinamento semanal do backlog** (~30 min) | Equipe |
| 16/09 | quarta | Revisão cruzada entre duplas: cada dupla revisa as histórias de outra dupla, conforme a prática de feedback da equipe | Duplas A↔C, B↔A, C↔B |
| 17/09 | quinta | Consolidação dos itens no GitHub Projects (D1); início da matriz de rastreabilidade (D2) | Vinicius (estruturação); todos (alimentação) |
| 18/09 | sexta | Fechamento do backlog; consolidação do glossário (ART-01); conclusão do BPMN (B1) e do Rich Picture (B2) | Duplas B e C |
| 21/09 | segunda | Verificação dos critérios de aceitação da Sprint (§11); preparação da Sprint Review | Scrum Master |
| 22/09 | terça | Sprint Review · Retrospectiva · Sprint 2 Planning | Equipe |

---

## Anexo D — Verificação posterior à reunião de Planning

Prazo de execução: 48 horas contadas do encerramento da reunião.

- [ ] Ata da reunião publicada no Drive da equipe e registrada no projeto
- [ ] Issues criadas no GitHub Projects, uma por item selecionado, com rótulo de épico e vínculo a OE/CP
- [ ] Campo MoSCoW preenchido no quadro — **prazo próprio: refinamento de 15/09**, conforme §6.2 e §8.5, e não as 48 horas desta lista
- [ ] Meta da Sprint fixada no quadro do projeto
- [ ] Horário dos dois dojos comunicado no grupo *Avisos*
- [ ] Daily assíncrona retomada a partir de 10/09, conforme molde já adotado pela equipe
- [ ] Disponibilidade da equipe em 22/09 confirmada (risco R06)
- [ ] Material dos Dojos D1 e D2 revisado pelo facilitador
- [ ] Pré-requisitos de instalação comunicados à equipe antes de 10/09
- [ ] Co-facilitação dos blocos de Git e de ambiente confirmada com os responsáveis
- [ ] Histórias candidatas de §7.2 disponibilizadas às duplas antes do Dojo D1

**Reconciliação de prazo registrada em 14/09/2026 (v6.0).** A emissão anterior exigia, dentro da janela de 48 horas contadas do encerramento da Planning, issues já com classificação MoSCoW, enquanto o §6.2 e o §8.5 determinam que o campo permaneça vazio até o refinamento de 15/09. Os dois prazos são incompatíveis; prevalece o mais recente e mais específico, 15/09.

**Registro de execução, sem retroação.** Em 14/09/2026, a consulta ao quadro do projeto mostra os 18 itens **sem classificação MoSCoW**. O item correspondente permanece, portanto, em aberto, com prazo em 15/09. Esta reconciliação ajusta a incompatibilidade entre prazos do próprio plano; **não altera datas de atividades já ocorridas nem declara concluído o que não foi feito**.

---

## Controle de versões

| Versão | Data | Alteração | Responsável |
|---|---|---|---|
| 1.0 | 09/09/2026 | Emissão inicial, elaborada antes da reunião de Sprint Planning | Vinicius |
| 2.0 | 09/09/2026 | Estruturação da Sprint em duas fases, plano de dojos e Product Backlog candidato com identificadores rastreáveis | Vinicius |
| 3.0 | 09/09/2026 | Registro do que foi deliberado na Sprint Planning de 08/09: MoSCoW como método único de priorização e dimensionamento, com a regra de proporção do DSDM e o fatiamento como mecanismo de ajuste de escopo; capacidade de 8 dias de produção; cadência de 2 semanas confirmada para a Sprint 2 | Vinicius |
| 3.1 | 15/09/2026 | **Emissão feita diretamente sobre a versão publicada no site (3.0), sem as emissões 4.0 a 6.0, que não haviam sido publicadas.** Conversão dos 18 critérios de aceitação de Dado/Quando/Então para lista (issue #23); reescrita do §6.2 sobre o Dojo D1. Incorporada e revisada na 7.0 | Caio Martins |
| 4.0 | 09/09/2026 | **Correção de fidelidade à ata da Planning.** A emissão anterior descrevia dois dojos de processo e deslocava os técnicos para a Sprint 2, contrariando a decisão D2 da ata de 08/09. Os dojos de 10/09 passam a ser um de fundação e processo e um de NestJS e Prisma, nesta ordem, por dependência de ambiente; o conteúdo normativo converte-se em leitura com entrega verificável no glossário. Ajustes decorrentes em §4.2, §4.3, §5.1, §5.2, §6.3, R01, R07, R08, R10, CAS-06 e Anexo D. Corrigidas ainda duas inconsistências internas: a capacidade citada em R02 (7 dias) passa a 8, conforme §5.1; e a proposta de classificação de §8.5 é explicitada como proposta sujeita a deliberação, em coerência com §7. A ata da Planning não foi alterada | Vinicius |
| 5.0 | 10/09/2026 | **Ampliação de escopo dos dojos de 10/09, decisão do Scrum Master antes da sessão.** TanStack Query, shadcn/ui e Dexie deixam de ficar exclusivamente para a Sprint 2 e entram na noite de 10/09, com profundidade proporcional à lacuna registrada na matriz de competências: Dexie recebe tratamento amplo (Caio e Vinicius ensinam "os demais", conforme `contexto/07` §2-A); TanStack Query e shadcn/ui recebem segmento dirigido às duas pessoas abaixo do patamar em cada um, com o restante da equipe em tarefa autônoma. A duração total da noite passa a ~155 minutos, com janela de perguntas dedicada e tarefas para conclusão fora da sessão quando necessário. Detalhamento em `dojos/2026-09-10/ROTEIRO-DA-NOITE.md`. Não reabre nenhuma outra decisão do documento; os cinco dojos técnicos remanescentes de `contexto/07` ficam reduzidos, ao final desta noite, apenas ao que não for concluído | Vinicius |
| 6.0 | 14/09/2026 | **Reconciliação interna posterior ao feedback da apresentação da Unidade 1.** Corrigido o resíduo editorial de §4.3, que excluía a priorização MoSCoW do escopo da Sprint 1 contra a Meta da própria seção, o §1, o §4.2, o §8, a DoR de §7, CAS-01, CAS-02, o Anexo D e a decisão D1 da ata de 08/09; a definição de MVP segue excluída, por razão distinta. Acrescentado o §8.2-A, que separa o horizonte do trabalho de ER desta Sprint do horizonte da funcionalidade no produto e no MVP. Reconciliado o conflito de prazo entre o Anexo D (48 horas) e §6.2/§8.5 (refinamento de 15/09), com registro do estado do quadro em 14/09 e sem retroação. Declarada a vigência do calendário em §12 e explicada a sobreposição de datas entre sprints, em resposta à issue #24. Registrada em §7.2 a orientação posterior da issue #23 sobre o formato dos critérios de aceitação, como pendência de decisão da equipe. Corrigida a ordem das linhas 4.0 e 5.0 nesta tabela. **Nenhuma decisão nova é atribuída à reunião de 08/09; a ata permanece inalterada.** | Vinicius |
| 7.0 | 17/09/2026 | **Reconciliação das duas linhagens de emissão.** Sobre a 6.0, incorpora a conversão dos critérios para lista feita na 3.1, preservando o conteúdo aprovado na Planning: onde a 3.1 mudava conteúdo (CA-03.3 e CA-04.3), o critério mantém o sentido original em lista e a mudança vai ao bloco 🔧 de propostas para 22/09, junto com a proposta de janela configurável para CA-02.2; CA-01.1, CA-05.1, CA-05.2 e CA-06.3 ganham esclarecimentos sem mudança de regra (três origens do requisito; resultado pactuado; meta não atingida; consentimento explícito). O §6.2 mantém o registro do Dojo D1 como ocorreu em 10/09, com nota sobre a #23. Nomes desambiguados conforme a issue #25. Nota de conformidade da HU-06 alinhada à decisão da equipe e à seção 2 revisada pela issue #20. §12 atualizado: a seção 6 do Documento de Visão foi reconciliada em 17/09 | Vinicius |

**Documentos impactados por esta versão:** calendário de sprints da equipe · cadência e calendário de ritos do processo · memória de decisões do projeto.
