# Ata — Sprint Planning 3 — 07/10/2026

Reunião de Sprint Planning da Sprint 3, realizada na noite de 07/10/2026 e conduzida por Vinicius Vieira como Scrum Master. A reunião começou com a preparação da apresentação de 08/10 sobre a declaração de requisitos por nível de abstração e seguiu com a meta e o backlog da Sprint 3, o fluxo de homologação da documentação, a nova formação das duplas e os riscos da entrega da Unidade 2.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-10-07-SP |
| **Tipo** | Sprint Planning |
| **Data** | 07/10/2026 (quarta-feira) |
| **Horário** | Início às 21h30 (previsto para 19h30) · término não registrado |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Rodrigo Henrique Donato, Daniel Batista, Caio Martins, Lucas de Paula Leal |
| **Participantes — externos** | Nenhum · monitoria convidada, não compareceu |
| **Ausentes justificados** | Maria Eduarda Marques |
| **Condução** | Vinicius Vieira (Scrum Master) |
| **Registro (relator)** | Maria Eduarda Marques, a partir das anotações automáticas da reunião |
| **Gravação** | Não · anotações automáticas da reunião (arquivo no Drive restrito da equipe) |
| **Transcrição automática** | Não |
| **Documentos vistos** | Perguntas da apresentação de 08/10; capítulo 9 do livro do docente; seção 8 do site; quadro "CyberSetor - Board"; seção 6 do Documento de Visão |
| **Técnicas de ER aplicadas** | Não se aplica (planejamento) |
| **Sprint** | Sprint 3 (a partir de 07/10/2026) |
| **Documentos relacionados** | [ATA-2026-10-06 (Sprint Review 2 e Retrospectiva 2)](2026-10-06-sprint-review-retrospectiva.md) · [ATA-2026-09-23-SP (Sprint Planning 2)](2026-09-23-sprint-planning.md) · [Ata de validação do MVP de 08/10/2026](2026-10-08-validacao-mvp-instituto.md) |

---

## 1. Pauta

1. Preparação da apresentação de 08/10: tipos de declaração de requisitos por nível de abstração.
2. Meta e backlog da Sprint 3.
3. Ordem de integração dos pull requests e fluxo de homologação.
4. Pendências da entrega da Unidade 2.
5. Alcance do MVP, esforço e capacidade.
6. Duplas e épicos da Sprint 3.
7. Riscos e validação com o Instituto.

---

## 2. Resumo

A reunião preparou a apresentação de 08/10, que pede os tipos de declaração de requisitos usados em cada nível de abstração (negócio, usuário e produto) e em que momento do processo. Em seguida, fixou a meta da Sprint 3: a Unidade 2 publicada no site na versão marcada antes da aula de 13/10, com o MVP confirmado pelo Instituto, o ambiente local definido, as linhas da API e do front criadas e as histórias do MVP iniciadas. A equipe aprovou a ordem de integração dos pull requests, a branch de homologação da documentação e o fluxo de revisão com aviso no grupo e prazo de 24 horas. As duplas foram refeitas e cada uma fica com dois épicos. O risco crítico apontado foi a falta de confirmação da reunião com o Instituto antes de 13/10.

- **Apresentação:** negócio por narrativas, regras e metas organizacionais; usuário por histórias de usuário; produto por requisitos verificáveis por critérios de aceitação.
- **Sprint 3:** Unidade 2 publicada antes de 13/10; MVP confirmado; base técnica pronta; histórias do MVP iniciadas.
- **Processo:** branch de homologação; congelamento do deploy por variável de ambiente; tags de entrega automatizadas.
- **Duplas:** Vinicius e Lucas; Caio e Maria Eduarda; Daniel e Rodrigo.
- **Riscos:** confirmação da reunião com o Instituto; atas de 28/09, 06/10 e 07/10 pendentes; dojo pendente.

---

## 3. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | **Meta da Sprint 3:** Unidade 2 publicada no site na versão marcada antes da aula de 13/10, com o MVP confirmado pelo Instituto, ambiente local definido, linhas da API e do front criadas e histórias do MVP iniciadas | Entrega da Unidade 2 em 13/10 e início da construção do MVP | Plano da Sprint 3 |
| D2 | **Ordem de integração** dos pull requests aprovados: tabelas das seções 8.2 e 8.3, ajuste de ambiguidade, registro dos ritos, ata de 15/09 e dailies, ajustes do fluxo de publicação e, por último, o fluxo de branches | Evitar conflitos (D2 da ata de 06/10) | Página "Boas práticas no GitHub" |
| D3 | **Branch de homologação da documentação**, que recebe a documentação revisada antes da publicação; proteção de branch por workflow para impedir que código da API ou do front chegue à branch principal; **congelamento do deploy** por variável de ambiente depois da data de entrega | Controlar o que é publicado na versão da entrega | Fluxo de publicação |
| D4 | **Tags de entrega e histórico de versões** geradas automaticamente a partir do fluxo de branches | Rastrear as versões entregues | Fluxo de publicação |
| D5 | **DoD de código** exige integração na branch de desenvolvimento da API ou do front, revisão por pares e demonstração em funcionamento no ambiente de homologação | Início da construção do produto | Seção 9 |
| D6 | **Fluxo de revisão:** ao abrir um pull request, o autor avisa no grupo e marca o revisor, que tem 24 horas para revisar | D5 da ata de 06/10 | Página "Boas práticas no GitHub" |
| D7 | **Duplas da Sprint 3:** Vinicius Vieira e Lucas de Paula Leal; Caio Martins e Maria Eduarda Marques; Daniel Batista e Rodrigo Henrique Donato | Redistribuir o esforço para a construção do produto | Quadro do projeto; seção 7 |
| D8 | **Dois épicos por dupla**, entre Requisito e meta, Relatório, Atividade, Presença em campo, Evidência e Pessoas. No quadro, as histórias do MVP na Sprint 3 ficaram com: Daniel e Rodrigo, Requisito e meta (HU-01, HU-02, HU-14); Caio e Maria Eduarda, Relatório (HU-05, HU-13); Vinicius e Lucas, Pessoas (HU-07, HU-08, HU-15) | Equilibrar a carga das histórias prioritárias | Quadro do projeto |
| D9 | Histórias do MVP divididas em **subtarefas**, como tabelas do banco de dados e autenticação com papéis definidos pelas diretorias; uma história interna cobre o ambiente, o fluxo de branches e a estrutura inicial do repositório | Acompanhar o progresso no quadro | Quadro do projeto |
| D10 | Se a capacidade não bastar, itens do MVP podem ir para sprints seguintes, com comunicação prévia e registro com o Instituto | Princípios do XP e compromisso de entrega do MVP | Seção 10; validação com o Instituto |

---

## 4. Próximas etapas

| # | Ação | Responsável | Prazo | Situação |
|---|---|---|---|---|
| A1 | Integrar os pull requests aprovados na ordem combinada (D2), na branch de homologação, e abrir o pull request consolidado para a revisão da equipe | Vinicius Vieira | antes de 13/10 | Pendente |
| A2 | Configurar a proteção de branches, os workflows de verificação e as branches da API e do front | Vinicius Vieira | Sprint 3 | Pendente |
| A3 | Registrar as atas de 28/09, 06/10 e 07/10 e obter a conferência do Instituto para a ata de 28/09 | Maria Eduarda Marques | antes de 13/10 | Pendente |
| A4 | Solicitar ao Instituto a confirmação da reunião pendente | Maria Eduarda Marques | 08/10 | Pendente |
| A5 | Validar com o Instituto os requisitos e as metas do MVP | equipe | antes de 13/10 | Pendente |
| A6 | Revisar a síntese de entregas da Unidade 2 e apontar lacunas | Rodrigo Henrique Donato | antes da gravação do vídeo | Pendente |
| A7 | Marcar o checklist da Unidade 2 no README e incluir o vídeo | equipe | dia da gravação | Pendente |
| A8 | Submeter o pull request do dojo de nivelamento | Lucas de Paula Leal | Sprint 3 | Pendente |
| A9 | Concluir a parte de Lucas de Paula Leal na resposta aos apontamentos do docente na seção 4 | Lucas de Paula Leal | antes de 13/10 | Pendente |
| A10 | Preparar a explicação sobre requisitos e níveis de abstração e chegar cedo para os últimos ajustes | equipe | 08/10 | Pendente |
| A11 | Avisar no grupo a cada novo pull request (D6) | todos | contínuo | Pendente |

---

## 5. Detalhes por tópico

### Apresentação de 08/10

Daniel Batista leu as perguntas da apresentação, que pedem os tipos de declaração de requisitos usados em cada nível de abstração e em que momento do processo. A equipe registrou que épicos e histórias de usuário não bastam sozinhos como declaração de requisitos e que as histórias de usuário ficam no limite entre requisitos de usuário e de software.

- **Negócio:** problemas, metas organizacionais e restrições externas, declarados por narrativas descritivas, declarações estruturadas, catálogos e declarações orientadas a valor; por exemplo, a regra de negócio sobre prova de execução e material de divulgação.
- **Usuário:** capacidades esperadas por perfil, por histórias de usuário.
- **Produto:** funcionalidades, regras e restrições verificáveis por critérios de aceitação em formato comportamental, sem decisões prematuras de design, além da matriz de rastreabilidade e dos requisitos não funcionais com métricas verificáveis, como o teste de restauração do backup.

A equipe destacou o catálogo com 39 requisitos funcionais no padrão verbo e objeto, requisitos não funcionais com métricas, 13 regras de negócio e a matriz de rastreabilidade, além da proximidade com o cliente. Vinicius Vieira consultou o capítulo 9 do livro do docente, que trata a declaração como atividade transversal, integrada à elicitação e à análise e consenso. O material preparado por Rodrigo Henrique Donato foi avaliado positivamente.

### Meta e fluxo de homologação

Vinicius Vieira lembrou que a entrega da Unidade 2 é em 13/10 e fixou a meta da Sprint 3 (D1). Apresentou a ordem de integração (D2), a branch de homologação com proteção por workflow e o congelamento do deploy (D3), e a geração automática de tags de entrega (D4). A DoD de código foi revista (D5).

### Pendências da Unidade 2

A resposta aos apontamentos do docente na seção 4 está em andamento, com a parte de Lucas de Paula Leal a concluir (A9). Faltam as atas de 28/09, 06/10 e 07/10 (A3); a de 28/09 depende da conferência do Instituto. Rodrigo Henrique Donato revisa a síntese de entregas antes da gravação do vídeo (A6). Os papéis de ER de cada integrante, hoje todos como "Time de Desenvolvimento", entram na Sprint 3 com Maria Eduarda Marques e Daniel Batista. O checklist do README fica para o dia da gravação (A7).

### Alcance do MVP, esforço e capacidade

Vinicius Vieira apresentou o alcance do MVP no cronograma: as histórias priorizadas são *Must* e seguem as regras levantadas na elicitação. O esforço segue faixas de horas (nível 1: 1 a 2 horas; nível 2: 2 a 4 horas; nível 3: 4 a 8 horas; nível 4: mais de 8 horas), e a complexidade, de 1 a 4, depende do conhecimento prévio e da necessidade de estudo da equipe. A equipe avaliou que a capacidade das duplas comporta o MVP com folga. A equipe combinou como agir se a capacidade não bastar (D10).

### Duplas e épicos

A equipe aprovou a nova formação das duplas (D7) e a divisão de dois épicos por dupla (D8). Cada dupla ficou com um épico do MVP; o segundo épico de cada uma não foi registrado (P2). Vinicius Vieira cria a estrutura inicial do repositório; a API e o front são divididos entre duplas, e outra dupla cuida dos testes unitários (D9).

### Fechamento da Sprint 2

Os pull requests pendentes da Sprint 2 serão integrados; ficam para a Sprint 3 apenas o dojo e a conferência das atas pelo Instituto.

### Riscos

Vinicius Vieira apontou como risco crítico a falta de confirmação da reunião com o Instituto marcada para quinta-feira, 08/10. Maria Eduarda Marques, ausente desta reunião, ficou encarregada de contatar o Instituto para garantir a validação antes de 13/10 (A4).

---

## 6. Pendências e pontos em aberto

| # | Pendência | Depende de | Encaminhamento |
|---|---|---|---|
| P1 | Confirmação da reunião com o Instituto de 08/10 | Maria Eduarda Marques ↔ Instituto | A4 |
| P2 | Segundo épico de cada dupla (D8): Atividade, Presença em campo e Evidência ainda sem dupla da Sprint 3 | equipe | registrar no quadro do projeto |
| P4 | Itens atribuídos a Maria Eduarda Marques, ausente desta reunião (A3, A4, dupla e épico de D7 e D8) | Maria Eduarda Marques | confirmar no grupo |
| P3 | Dojo de nivelamento pendente desde a Sprint 1 | Lucas de Paula Leal | A8 |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 09/10/2026 | Maria Eduarda Marques | Rascunho a partir das anotações automáticas da reunião, com revisão de dados sensíveis |
