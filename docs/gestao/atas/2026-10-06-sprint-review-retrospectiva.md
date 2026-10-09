# Ata — Sprint Review 2 e Retrospectiva 2 — 06/10/2026

Reunião de encerramento da Sprint 2, realizada na noite de 06/10/2026 e conduzida por Vinicius Vieira como Scrum Master, com a Sprint Review, a Retrospectiva, a ordem de integração dos pull requests da documentação e a reorganização do site do projeto.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-10-06 |
| **Tipo** | Sprint Review 2 e Retrospectiva 2 |
| **Data** | 06/10/2026 (terça-feira) |
| **Horário** | Início às 21h30 · duração aproximada de 70 min |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Maria Eduarda Marques, Rodrigo Henrique Donato, Caio Martins, Lucas de Paula Leal |
| **Participantes — externos** | Nenhum · monitoria convidada, não compareceu |
| **Ausentes justificados** | Daniel Batista |
| **Condução** | Vinicius Vieira (Scrum Master) |
| **Registro (relator)** | Maria Eduarda Marques |
| **Gravação** | Não · anotações automáticas da reunião (arquivo no Drive restrito da equipe) |
| **Transcrição automática** | Sim · arquivo no Drive restrito da equipe |
| **Documentos vistos** | Quadro "CyberSetor - Board"; pull requests abertos da documentação; gráficos das dailies; site do projeto; modelo de documentação de requisitos de outro projeto |
| **Técnicas de ER aplicadas** | Não se aplica (revisão de processo e planejamento) |
| **Sprint** | Sprint 2 (22/09 – 06/10/2026) |
| **Documentos relacionados** | [Plano da Sprint 2](../sprints/sprint-2.md) · [ATA-2026-09-23-SP (Sprint Planning 2)](2026-09-23-sprint-planning.md) · [ATA-2026-10-07-SP (Sprint Planning 3)](2026-10-07-sprint-planning.md) |

---

## 1. Pauta

1. Sprint Review 2: meta da Sprint, itens do backlog e situação dos pull requests.
2. Indicadores das dailies.
3. Apontamentos do docente sobre a Unidade 1.
4. Base técnica da Sprint 3.
5. Ordem de integração dos pull requests e estratégia de conflitos.
6. Retrospectiva 2: pontos positivos, negativos e ações.
7. Reorganização do site e das atas.
8. Data do Sprint Planning 3.

---

## 2. Resumo

A reunião encerrou a Sprint 2 com a avaliação de que a meta foi **parcialmente atingida**: a lista de requisitos foi ajustada pelos feedbacks, a matriz 4 × 4 foi preenchida e a DoR e a DoD foram publicadas, mas a validação final do MVP com o Instituto depende da conferência formal da ata de 28/09. A equipe fixou a ordem de integração dos pull requests da documentação, adotou *merge commit* com *rebase* para conflitos e definiu um prazo interno de 24 horas para revisão. A Retrospectiva registrou como positivos a validação do MVP com o Instituto, a publicação das seções 8, 9 e 10 e a revisão cruzada; como negativos, a sobrecarga na entrega de 29/09 e a queda na adesão às dailies. A equipe decidiu também reorganizar a navegação do site e simplificar a página das atas.

- **Review:** meta parcial; verificação em pares 100% concluída; refinamento dos épicos Requisito e meta e Relatório em 70%; ajustes do épico Pessoas concluídos.
- **Dailies:** relatos no próprio dia caíram de 58% na Sprint 1 para 46% na Sprint 2.
- **Processo:** *merge commit* e *rebase*; revisão em até 24 horas; daily até o fim do dia; alinhamento rápido após as aulas.
- **Site:** documentação reorganizada com tópicos na lateral e subíndices; atas reunidas numa página de índice.
- **Pendências:** ata de 28/09 a enviar ao Instituto; dojo de Lucas; papéis de ER de cada integrante no Documento de Visão.

---

## 3. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | A meta da Sprint 2 foi **parcialmente atingida**: lista ajustada, matriz 4 × 4 preenchida e DoR e DoD publicadas; falta a validação formal do MVP com o Instituto, pela conferência da ata de 28/09 | A validação ocorreu em 28/09, mas a ata ainda não foi enviada ao Instituto | Plano da Sprint 2; seção 10.2.8 |
| D2 | **Ordem de integração** dos pull requests da documentação: primeiro as tabelas das seções 8.2 e 8.3, depois o ajuste de ambiguidade da seção 8, o registro dos ritos e os demais | Evitar conflitos nas tabelas da seção 8 | Página "Boas práticas no GitHub" |
| D3 | Integração por **merge commit**, com **rebase** para resolver conflitos; *squash* não é usado na documentação | *Squash* gera divergências grandes entre branches de documentação | Página "Boas práticas no GitHub" |
| D4 | **Branch de homologação** da documentação a partir da Sprint 3, para reunir os pull requests aprovados antes da publicação | Controlar a ordem de integração e a publicação do site | Fluxo de publicação; Sprint 3 |
| D5 | **Prazo interno de 24 horas** para revisão de pull request; vencido o prazo, o autor avisa no grupo e a revisão pode ser redistribuída | Acúmulo de pull requests abertos na Sprint 2 | Página "Boas práticas no GitHub" |
| D6 | **Daily assíncrona até o fim do dia**, e não mais até as 12h | Conciliar trabalho e estudo e atender às métricas do rito | Página de processo |
| D7 | **Alinhamento rápido presencial após as aulas** | Fortalecer o contato presencial e o alinhamento das atividades | Página de processo |
| D8 | **Mensagens de commit** no padrão adotado, sem acentos e com até 72 caracteres no título | Falhas de build na integração contínua | Página "Boas práticas no GitHub" |
| D9 | **Documentação reorganizada** com tópicos primários na lateral esquerda e subíndices à direita, combinando o modelo apresentado por Maria Eduarda Marques com a estruturação já feita por Rodrigo Henrique Donato | Navegação difícil e documentos como a matriz de difícil localização | Site do projeto |
| D10 | **Atas reunidas** numa página de índice com rolagem vertical, em tabela com as datas das reuniões, no lugar de uma aba por ata | Simplificar a navegação | Página de atas |
| D11 | Papéis de Engenharia de Requisitos de cada integrante registrados no Documento de Visão, no lugar do termo genérico "Time de Desenvolvimento" | Apontamento do docente sobre as responsabilidades individuais | Seção 7 do Documento de Visão; README |
| D12 | Sprint Planning 3 em **07/10/2026, das 19h30 às 20h00**; a reunião acabou começando às 21h30 | Conflito de agenda de integrantes no horário do meio-dia | Calendário da Sprint 3 |

---

## 4. Próximas etapas

| # | Ação | Responsável | Prazo | Situação |
|---|---|---|---|---|
| A1 | Revisar o pull request das atas e das evidências dos ritos | Caio Martins | 24 horas | Pendente |
| A2 | Revisar o pull request das tabelas das seções 8.2 e 8.3 | Caio Martins | 24 horas | Pendente |
| A3 | Ajustar a ata de 28/09 ao modelo das atas e enviá-la ao Instituto para conferência | Maria Eduarda Marques | 08/10 | Pendente |
| A4 | Agendar reunião com o Instituto para validar a Sprint Review e os pontos do MVP | Maria Eduarda Marques | antes de 13/10 | Pendente |
| A5 | Concluir o pull request do dojo pendente da Sprint 1 | Lucas de Paula Leal | Sprint 3 | Pendente |
| A6 | Chamada de apoio para a finalização do dojo | Lucas de Paula Leal e Vinicius Vieira | a combinar | Pendente |
| A7 | Atualizar os papéis de ER de cada integrante no Documento de Visão | equipe | Sprint 3 | Pendente |
| A8 | Avisar no grupo sempre que um pull request estiver pendente de revisão | todos | contínuo | Pendente |
| A9 | Registrar a daily assíncrona até o fim do dia | todos | contínuo | Pendente |
| A10 | Reorganizar a navegação do site (D9, D10) | equipe | Sprint 3 | Pendente |

---

## 5. Detalhes por tópico

### Sprint Review: meta e backlog

A meta da Sprint 2 previa a lista de requisitos ajustada pelos feedbacks, a matriz 4 × 4 preenchida, o MVP definido e validado com o Instituto e a DoR e a DoD publicadas. Vinicius Vieira avaliou que a maior parte foi alcançada, com exceção da validação formal do MVP; Rodrigo Henrique Donato concordou. No backlog, a verificação em pares foi concluída, o refinamento dos épicos Requisito e meta e Relatório, de Daniel Batista e Rodrigo Henrique Donato, chegou a 70%, e os ajustes do épico Pessoas foram feitos por Vinicius Vieira e Maria Eduarda Marques. O Rich Picture e o mapa de stakeholders foram atualizados por Daniel Batista e Maria Eduarda Marques. Vinicius Vieira pediu que os revisores designados aprovassem os pull requests pendentes, mantendo a revisão cruzada entre duplas.

### Indicadores das dailies

A taxa de relatos no próprio dia caiu de 58% na Sprint 1 para 46% na Sprint 2, queda atribuída à semana universitária. A equipe estendeu o prazo de envio para o fim do dia (D6).

### Apontamentos do docente

A equipe tratou da issue do docente que considerou as histórias de usuário prematuras na Unidade 1. A resposta remete aos requisitos funcionais, à priorização, ao backlog, ao MVP e à validação com o cliente, com referência à ata de 28/09 com a diretora pedagógica. Maria Eduarda Marques apontou que essa ata ainda não está no Drive no modelo da equipe (A3).

### Base técnica da Sprint 3

Vinicius Vieira apresentou a proposta de base técnica: branches separadas para a API e o front, sem histórico compartilhado com a branch principal, com pull requests diretos bloqueados por workflow. A hospedagem da API e do front segue a infraestrutura definida pela equipe.

### Ordem de integração e conflitos

Para evitar conflitos nas tabelas da seção 8, as tabelas das seções 8.2 e 8.3 entram primeiro, seguidas do ajuste de ambiguidade e do registro dos ritos (D2). Maria Eduarda Marques perguntou sobre bloqueio automático de dependências entre issues; Vinicius Vieira propôs a branch de homologação (D4) e o uso de *merge commit* com *rebase* para conflitos (D3).

### Retrospectiva

- **Funcionou:** validação do MVP com o Instituto; publicação das seções 8, 9 e 10; revisão cruzada; trabalho em duplas; processo Scrum mais maduro.
- **Não funcionou:** sobrecarga na entrega de 29/09; baixa adesão às dailies; pressão de cronograma pela demanda de requisitos; pedidos de revisão perdidos.
- **Ações:** D5 (revisão em 24 horas), D6 (daily até o fim do dia), D7 (alinhamento após as aulas), lembretes no grupo para as dailies e para as revisões. Vinicius Vieira mostrou o filtro de revisões pedidas no GitHub para localizar as revisões atribuídas.

### Backlog e subtarefas

Vinicius Vieira confirmou que o backlog é mantido no quadro do projeto e recomendou dividir as histórias de usuário em subtarefas, uma por critério de aceitação, para acompanhar o progresso no quadro.

### Reorganização do site

Maria Eduarda Marques apresentou um modelo de documentação de requisitos de outro projeto, com tópicos clicáveis: descrição do produto, objetivos, público-alvo, indicadores, escopo inicial, glossário, personas e requisitos. A equipe decidiu combinar esse modelo com a estruturação de Rodrigo Henrique Donato (D9) e simplificar a página das atas (D10). As abas de entregas, débitos e acompanhamento, lições aprendidas e referências foram consideradas adequadas.

---

## 6. Pendências e pontos em aberto

| # | Pendência | Depende de | Encaminhamento |
|---|---|---|---|
| P1 | Conferência da ata de 28/09 pelo Instituto | Maria Eduarda Marques ↔ Instituto | A3 |
| P2 | Formato final da navegação: aba única de documentação com subíndices ou abas separadas para Documento de Visão e Requisitos | equipe | revisão editorial do site |
| P3 | Itens em "aguardando" e "revisão" no quadro | Sprint Planning 3 | 07/10 |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 09/10/2026 | Maria Eduarda Marques | Rascunho a partir das anotações automáticas da reunião, com revisão de dados sensíveis |
