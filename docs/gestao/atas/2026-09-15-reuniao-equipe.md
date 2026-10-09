# Ata — Reunião da equipe — 15/09/2026

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-09-15-EQ |
| **Tipo** | Reunião da equipe |
| **Data** | 15/09/2026 (terça-feira) |
| **Horário** | Início às 21:39; término não registrado |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Daniel Batista, Maria Eduarda Marques, Caio Martins e Lucas de Paula Leal (entrou no decorrer) |
| **Participantes — externos** | Não se aplica |
| **Ausentes** | Rodrigo Henrique |
| **Condução** | Vinicius Vieira |
| **Registro** | Transcrição automática · consolidação: Vinicius Vieira |
| **Documentos vistos** | Issues do docente sobre a Unidade 1; site do projeto |
| **Sprint** | Sprint 1 (08/09–22/09) |
| **Documentos relacionados** | [Ata da reunião com o Instituto de 15/09/2026](2026-09-15-reuniao-alinhamento-instituto.md) |

---

## 1. Pauta

Reunião sem pauta formal prévia. Assuntos tratados, na ordem:

1. Relato da reunião online com o Instituto, realizada às 16h do mesmo dia
2. Retorno do docente sobre DoR e DoD, trazido por Caio
3. Cronograma da Sprint 1 e ajustes na documentação
4. Priorização dos requisitos
5. Ambiente de desenvolvimento e padrão de branches dos dojos
6. Cadência de reuniões
7. Pessoa externa adicionada ao grupo de comunicação da equipe

---

## 2. Resumo

Reunião de alinhamento depois da conversa online com o Instituto. A equipe relatou as demandas ouvidas (painel consolidado para a presidência, comprovação em campo, chamados ou ordens de serviço, separação de acesso por área), registrou o retorno do docente sobre DoR e DoD, ajustou o cronograma ao ciclo da Sprint 1 e combinou a preparação do ambiente de desenvolvimento e o fechamento das pendências das Unidades 1 e 2.

- **Demandas do Instituto:** o painel gerencial foi pedido de forma recorrente, pela área de projetos e pela coordenação, em nome do presidente; a abertura de chamados ou ordens de serviço foi vista pela equipe como entrega simples e candidata ao MVP; o controle de acesso por departamento e função decorre da sensibilidade dos dados de estudantes, fornecedores e financeiros.
- **Processo:** DoR e DoD deixam de ser apresentadas como verificação e validação e passam a critérios de gestão da sprint; a matriz de esforço técnico × valor de negócio entra como apoio à priorização, ao lado do MoSCoW.
- **Cronograma:** a documentação passa a refletir a Sprint 1 vigente, de 08/09 a 22/09.
- **Ambiente:** antecipar a autenticação e a ligação entre front-end e back-end; manter a nomenclatura `dojo/` nos pull requests dos dojos.

---

## 3. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | Controle de acesso por **departamento e função**, não por capacidades individuais | Dados de estudantes e do administrativo-financeiro têm sensibilidade distinta; o Instituto pediu separação por área | Requisito de controle de acesso (seção 8) e regras de negócio de acesso |
| D2 | **DoR e DoD** deixam de ser verificação e validação e passam a **critérios de gestão da sprint** | Retorno do docente, relatado por Caio | Seções 5.2, 7.3 e 9 do Documento de Visão; página de processo |
| D3 | Priorização apoiada por **matriz de esforço técnico × valor de negócio**, além do MoSCoW | Defender o recorte com dados | Seção 5.1; conciliação com a decisão de 08/09, que fixou o MoSCoW como instrumento de priorização, levada à Review de 22/09 |
| D4 | Reuniões de acompanhamento às **segundas, terças e quintas** | Fechar a Unidade 2 e as pendências da Unidade 1 sem entregas de última hora | Calendário de ritos |
| D5 | MVP **realista e focado**, sem integrações complexas, como notificações por WhatsApp, no prazo da disciplina | Prazo de cerca de três meses; risco de expectativa criada na reunião com o Instituto | Seção 2 e seção 10 (backlog e MVP) |

---

## 4. Próximas etapas

| # | Ação | Responsável | Prazo | Situação |
|---|---|---|---|---|
| A1 | Organizar visita presencial ao Instituto na segunda-feira da semana universitária, com interação com as áreas administrativa e operacional | Equipe | 21/09 | Concluída (visita em 21/09) |
| A2 | Pedir ao Instituto os modelos de documentos de projeto, como a matriz de trabalho | Vinicius Vieira | 16/09 | Concluída (modelos recebidos) |
| A3 | Editar a ata da reunião com o Instituto em versão pública e enviá-la aos participantes para aprovação | Vinicius Vieira | 22/09 | Concluída |
| A4 | Ajustar as datas do plano de entregas e do cronograma ao período real das sprints | Vinicius Vieira e Caio Martins | 18/09 | Concluída |
| A5 | Concluir a lista de requisitos, expandir os objetivos específicos com as informações novas e priorizar por valor de negócio | Equipe | Sprint 2 | Concluída (lista e priorização publicadas em 29/09) |
| A6 | Preparar o ambiente de desenvolvimento: autenticação e conexão entre front-end e back-end | Equipe | Sprint 2 | Transferida para a Sprint 3 |
| A7 | Documentar as instruções de ambiente fora do repositório público | Vinicius Vieira | Sprint 3 | Pendente |
| A8 | Concluir os exercícios dos dois dojos e abrir o pull request na branch dos dojos | Maria Eduarda Marques e Lucas de Paula Leal | Sprint 1 | Maria Eduarda: concluído em 16/09; Lucas: pendente |
| A9 | Contatar o Instituto, por meio da interlocutora do núcleo pedagógico, sobre a revisão do material e guardar a resposta como registro | Maria Eduarda Marques (interlocução com o Instituto) | Sprint 1 | Sem conclusão registrada |
| A10 | Tornar privado o grupo de comunicação da equipe | Maria Eduarda Marques | 16/09 | Concluída: comunidade da equipe com canais separados para a equipe, para o contato com o Instituto e para as dailies |
| A11 | Registrar as notas desta reunião como ata do projeto | Vinicius Vieira | 17/09 | Concluída |

---

## 5. Detalhes por tópico

### Relato da reunião com o Instituto (16h)

Vinicius relatou que a reunião contou com mais participantes do que o esperado — área de projetos (Fran), coordenação administrativo-financeira (Fillipe), Clara e Maria Eduarda, do núcleo pedagógico — e cobriu fluxos organizacionais e problemas operacionais dos setores administrativo e operacional. A demanda por painéis foi recorrente, mencionada pela coordenação e reforçada em nome do presidente, que demonstrou interesse no projeto. Uma ferramenta comercial de painéis foi discutida e descartada pelo custo. O registro completo está na ata da reunião com o Instituto.

### Dados pessoais e acessos

A diretoria pedagógica trata dados de estudantes, inclusive menores, e de fornecedores; a visibilidade de documentos e dados financeiros precisa ser restrita por função. Origem da decisão D1.

### Ordens de serviço

A coordenação pediu um mecanismo de abertura de chamados ou ordens de serviço para acompanhar as demandas dos projetos, hoje dispersas por e-mail e mensagens. A equipe considerou uma entrega simples e candidata ao MVP, ainda sem requisito, priorização ou validação.

### Visita presencial

Planejada para a segunda-feira da semana universitária, por conflito de aulas nos demais dias; objetivo: alinhar detalhes com a área de projetos e a coordenação e observar a operação.

### Escopo do MVP

Vinicius reforçou que o MVP deve ser realista, sem integrações complexas inviáveis no prazo; prioriza-se o que pode ser entregue. Origem da decisão D5.

### Padronização de relatórios

O Instituto não tem padrão único de relatório e concordou em fornecer modelos de documentos de projeto.

### Retorno sobre DoR e DoD

Caio comunicou o retorno do docente: DoR e DoD não são processos de verificação ou validação, e sim critérios de gestão da sprint; a documentação correspondente deve ser reescrita. Origem da decisão D2.

### Cronograma

A documentação precisa refletir o ciclo de duas semanas da Sprint 1, de 08/09 a 22/09; o Documento de Visão ainda mostrava outro período. Origem da ação A4.

### Priorização

Vinicius sugeriu a matriz de esforço técnico × valor de negócio, além do MoSCoW, para priorizar os requisitos e definir o que entra na Sprint 2. Origem da decisão D3.

### Ambiente de desenvolvimento

Debate sobre a preparação do ambiente e reforço da nomenclatura `dojo/` nos pull requests dos dojos.

### Grupo de comunicação

Ao fim, a equipe percebeu que uma colaboradora do Instituto havia sido adicionada por engano ao grupo geral da equipe. Combinou-se abordá-la de forma profissional no dia seguinte, apresentando a natureza técnica do grupo, e tornar o grupo privado (A10). A revisão do acesso dela ao Drive da equipe ficou como pendência (P4).

### Cadência e foco

Lucas perguntou se o cronograma de reuniões seguia fixo; mantido segunda, terça e quinta (D4). Foco no fechamento da Unidade 2 e das pendências da Unidade 1, garantindo tempo para codificação e melhoria da documentação. Para a reunião de quinta (17/09), cada um traz o máximo do trabalho concluído, para integrar e publicar.

---

## 6. Pendências e pontos em aberto

| # | Pendência | Depende de | Encaminhamento |
|---|---|---|---|
| P1 | Conciliação entre a D3 desta ata (matriz esforço × valor) e a decisão de 08/09 (MoSCoW como instrumento de priorização) | Equipe | Review ou Retrospectiva de 22/09 |
| P2 | Data da visita presencial e disponibilidade do Instituto | Instituto | A1 |
| P3 | Painel para a presidência e chamados ou ordens de serviço: são candidatos, não escopo | Validação com o Instituto e com o docente | Lista de requisitos; hipótese de MVP |
| P4 | Revisão do acesso ao Drive da pessoa externa adicionada por engano | Maria Eduarda Marques | A10 |
| P5 | Dojo de Lucas | Lucas de Paula Leal | A8 |

---

## 7. Insumos para o Documento de Visão

| Achado desta reunião | Entra em |
|---|---|
| Controle de acesso por departamento e função | Seção 8 (requisito de acesso) e regras de negócio; 2.6 |
| DoR e DoD como critérios de gestão da sprint | 5.2, 7.3 e 9 |
| Matriz esforço × valor ao lado do MoSCoW | 5.1 e 10.2 |
| Painel gerencial, chamados e comprovação em campo como candidatos | 8 e 10 |
| Sprint 1 de 08/09 a 22/09 | 6 (cronograma) |
| Cadência segunda, terça e quinta | Página de processo e ritos |

---

## Histórico de versões

| Versão | Data | Alteração | Responsável |
|---|---|---|---|
| 0.1 | 17/09/2026 | Rascunho a partir da transcrição automática, com campos a confirmar | Vinicius Vieira |
| 1.0 | 06/10/2026 | Campos confirmados com os participantes, situação das ações e versão para publicação | Vinicius Vieira |
