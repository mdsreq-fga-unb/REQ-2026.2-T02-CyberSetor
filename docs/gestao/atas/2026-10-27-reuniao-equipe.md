# Ata — Reunião da equipe — 27/10/2026

Reunião da equipe de 27/10/2026, na Sprint 4, sobre o uso de assistentes de inteligência artificial no desenvolvimento, a evidência da programação em par, o andamento do quadro e a preparação do checkpoint com o Instituto.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-10-27 |
| **Tipo** | Reunião da equipe — alinhamento técnico e preparação do checkpoint |
| **Data** | 27/10/2026 (terça-feira) |
| **Horário** | Não registrado |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Rodrigo Henrique Donato, Maria Eduarda Marques e Daniel Batista (a partir do meio da reunião) |
| **Participantes — externos** | Nenhum registrado |
| **Ausentes** | Caio Martins |
| **Condução** | Vinicius Vieira (Scrum Master) |
| **Registro (relator)** | Maria Eduarda Marques |
| **Gravação** | Não · anotações automáticas da reunião (arquivo no Drive restrito da equipe) |
| **Sprint** | Sprint 4 (20/10 – 03/11/2026) |
| **Documentos relacionados** | [ATA-2026-10-20 (Review 3, Retrospectiva 3 e Planning 4)](2026-10-20-sprint-review-retrospectiva-planning.md) · [Ata de validação do MVP de 08/10/2026](2026-10-08-validacao-mvp-instituto.md) |

---

## 1. Pauta

1. Ambiente de desenvolvimento e uso de assistentes de inteligência artificial.
2. Andamento do quadro da Sprint 4.
3. Evidência da programação em par.
4. Preparação do checkpoint com o Instituto.
5. Ajustes da documentação pedidos pelo docente.

---

## 2. Resumo

A equipe tratou da configuração do ambiente local e do uso de assistentes de inteligência artificial para escrever código, com o consenso de adotá-los de forma estruturada, com revisão humana e cuidado com dados sensíveis. Em resposta ao apontamento do docente sobre a evidência da programação em par, decidiu registrar a dupla de cada história de usuário e ligar a ela os pull requests. Para o checkpoint com o Instituto, decidiu preparar dados fictícios e contas de teste na homologação, realizar o encontro online e priorizar as histórias que o Instituto vai experimentar.

- **Assistentes de IA:** uso estruturado, com revisão humana do código gerado e arquivos de configuração locais fora do repositório.
- **Programação em par:** dupla registrada em cada história, com os pull requests ligados.
- **Checkpoint:** online, com dados fictícios e contas de teste na homologação.
- **Prioridades:** formulário público de inscrição (HU-07a); relatório em tela e exportação (HU-05a e HU-13); atendimento ao titular dos dados (HU-15a e HU-15b).

---

## 3. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | **Dupla registrada em cada história de usuário**, com os pull requests da história ligados a ela | Apontamento do docente: o fechamento de vários pull requests não comprova a programação em par | Seção 10; quadro do projeto |
| D2 | **Dados fictícios e contas de teste na homologação** para o checkpoint | Permitir que o Instituto experimente o sistema sem dados reais de participantes | Ambiente de homologação; seção 6.5 |
| D3 | **Checkpoint online em 29/10**; a apresentação presencial fica para a entrega do MVP em novembro | Agenda do Instituto e prazo curto | Validação com o Instituto |
| D4 | **Prioridades para o checkpoint:** HU-07a com Maria Eduarda Marques; HU-05a e HU-13 com Daniel Batista e Rodrigo Henrique Donato; HU-15a e HU-15b com Vinicius Vieira | Histórias que o Instituto vai experimentar no checkpoint | Quadro do projeto |
| D5 | **Uso estruturado de assistentes de IA:** o código gerado é revisado por quem o publica, os arquivos de configuração das ferramentas ficam fora do repositório e dados sensíveis não vão para as ferramentas | Os assistentes perdem contexto e erram em tarefas complexas; risco de dados sensíveis e de consumo excessivo | Página "Boas práticas no GitHub" |
| D6 | **Pauta do checkpoint** restrita às regras essenciais: manutenção, custos e administração depois da disciplina; níveis de acesso por cargo e setor; auditoria; obrigatoriedade do documento formal do instrumento | Evitar atraso no desenvolvimento por regras secundárias | Validação com o Instituto |

---

## 4. Próximas etapas

| # | Ação | Responsável | Prazo | Situação |
|---|---|---|---|---|
| A1 | Confirmar com o Instituto o checkpoint online de quinta-feira | Maria Eduarda Marques | 28/10 | Feito em 28/10 |
| A2 | Concluir o fluxo e as validações centrais do formulário público de inscrição (HU-07a) | Maria Eduarda Marques | 29/10 | Pendente |
| A3 | Abrir os pull requests das tarefas em andamento e avisar no grupo para a revisão | Daniel Batista, Rodrigo Henrique Donato e Maria Eduarda Marques | 29/10 | Pendente |
| A4 | Revisar a documentação da homologação, para o pull request da versão pública | equipe | antes do checkpoint | Pendente |
| A5 | Comentar as issues do docente, apontando o que já foi resolvido e o que está pendente | equipe | Sprint 4 | Pendente |
| A6 | Concluir a configuração do ambiente local e das ferramentas, com os arquivos locais no `.gitignore` | Rodrigo Henrique Donato | 28/10 | Pendente |
| A7 | Preparar dados fictícios e contas de teste na homologação (D2) | a definir | antes do checkpoint | Pendente |
| A8 | Registrar a dupla de cada história de usuário, com os pull requests ligados (D1) | a definir | Sprint 4 | Pendente |

---

## 5. Detalhes por tópico

### Ambiente de desenvolvimento

A equipe esclareceu dúvidas sobre o ambiente da API: rodar o Prisma de novo para aplicar as alterações locais do banco sem apagar as tabelas, não editar os arquivos gerados na compilação e distinguir os comandos de desenvolvimento e de produção. Também tratou da configuração do editor e das ferramentas de assistência, com a decisão de manter os arquivos de configuração locais fora do repositório público (A6).

### Assistentes de inteligência artificial

Vinicius Vieira explicou o uso de assistentes que leem o projeto local, o que economiza tempo e consumo em relação ao uso pelo navegador, e lembrou que eles perdem contexto e erram em tarefas complexas, o que exige revisão humana. Maria Eduarda Marques alertou para o consumo excessivo e o risco de dependência da ferramenta. A equipe tratou também do cuidado com dados sensíveis: o que é enviado a um repositório público fica no histórico, por isso cada commit é revisado localmente antes de ser publicado. O consenso foi adotar os assistentes de forma estruturada, pedindo o código em partes menores para acompanhar o aprendizado da linguagem (D5).

### Andamento do quadro

As histórias HU-01b e HU-02a foram concluídas. A HU-07b aguarda validações do Instituto. Daniel Batista iniciou a exibição das metas com o resultado no relatório, depois de destravados os pull requests anteriores. Daniel Batista e Rodrigo Henrique Donato seguem com o relatório em tela (HU-05a) e com a trava por justificativa, e planejam sessões em par para a retificação do relatório.

### Programação em par

Vinicius Vieira relatou o apontamento do docente de que faltam evidências claras de programação em par: o fechamento de vários pull requests não comprova a prática. A equipe decidiu registrar a dupla de cada história e ligar a ela os pull requests (D1).

### Checkpoint com o Instituto

Vinicius Vieira destacou a importância de levar entregas funcionais ao checkpoint. A equipe definiu as prioridades (D4), decidiu preparar dados fictícios e contas de teste na homologação (D2) e realizar o encontro online, deixando a apresentação presencial para a entrega do MVP em novembro (D3). Os temas a levar ao Instituto ficaram restritos às regras essenciais (D6).

### Documentação

Vinicius Vieira apresentou os ajustes feitos na documentação a pedido do docente: ordenação cronológica, fonte única do MVP, cronograma e registro da programação em par, novos critérios de aceitação nas histórias para atender à DoD e ajustes em requisitos ligados à proteção de dados e ao consentimento de uso de imagem. A equipe revisa a documentação antes do pull request para a versão pública (A4).

---

## 6. Pendências e pontos em aberto

| # | Pendência | Depende de | Encaminhamento |
|---|---|---|---|
| P1 | Responsável pelos dados fictícios e pelas contas de teste | equipe | A7 |
| P2 | Decisões da devolutiva do docente sobre a Unidade 2 não tratadas nesta reunião | reunião de decisões | a agendar |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 28/10/2026 | Maria Eduarda Marques | Rascunho a partir das anotações automáticas da reunião, com revisão de dados sensíveis; ausência registrada e checkpoint confirmado com o Instituto |
