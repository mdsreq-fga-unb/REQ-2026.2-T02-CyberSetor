# Ata — Reunião da equipe — 19/10/2026

Reunião da equipe de 19/10/2026, véspera do fim da Sprint 3, sobre a revisão dos pull requests da base técnica, a relação entre requisitos funcionais e histórias, a organização da equipe com cinco integrantes e a repartição das primeiras tarefas de construção.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-10-19 |
| **Tipo** | Reunião da equipe — base técnica e repartição da construção |
| **Data** | 19/10/2026 (segunda-feira) |
| **Horário** | 21h30, com cerca de 55 minutos |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Maria Eduarda Marques e Daniel Batista |
| **Participantes — externos** | Nenhum |
| **Ausentes** | Caio Martins e Rodrigo Henrique Donato (ausências justificadas) |
| **Condução** | Vinicius Vieira (Scrum Master) |
| **Registro (relator)** | Vinicius Vieira |
| **Gravação** | Anotações automáticas da reunião (arquivo no Drive restrito da equipe) |
| **Sprint** | Sprint 3 (06/10 – 20/10/2026) |
| **Documentos relacionados** | [Plano da Sprint 3](../sprints/sprint-3.md) · [ATA-2026-10-20 (Review 3, Retrospectiva 3 e Planning 4)](2026-10-20-sprint-review-retrospectiva-planning.md) |

---

## 1. Pauta

Reunião sem pauta formal prévia. Assuntos tratados, na ordem:

1. Divisão das histórias HU-03, HU-05 e HU-13 e relação entre requisitos funcionais e histórias.
2. Equipe com cinco integrantes e organização em duplas.
3. Pull requests da base técnica e ordem de revisão.
4. Prazo até a reunião de 22/10 com o Instituto e sessões de trabalho conjunto.
5. Repartição das primeiras tarefas de construção.
6. Revisão do pull request #138.
7. Ambiente local: banco por Docker Compose, migrações pelo Prisma e integração contínua.

---

## 2. Resumo

Primeira reunião com a base técnica disponível para revisão: três pull requests da API (esqueleto, persistência com a migração inicial e autenticação) e um do front. A equipe definiu quem revisa e em que ordem, repartiu as primeiras tarefas de construção e deixou para a reunião de 20/10 duas definições: a organização da equipe de cinco integrantes e a relação entre requisitos funcionais e histórias apontada pelo docente.

- **Requisitos e histórias:** Maria Eduarda Marques dividiu HU-03, HU-05 e HU-13 e levantou a dúvida sobre a orientação do docente. Cada história reunia mais de um requisito funcional, e a ligação entre requisitos e histórias pedia revisão detalhada.
- **Base técnica:** o modelo inicial do banco cobre pessoa, usuário, instrumento, projeto, requisito do instrumento e meta. O CPF é opcional e único quando informado, e pessoa e usuário ficam ligados. Os perfis de acesso e os dados de pessoas recebem segunda conferência com o Instituto.
- **Construção:** as rotas da HU-01 e a tela de login podem começar sobre a base atual. A meta é chegar à reunião de 22/10 com o Instituto com o máximo entregue.
- **Ambiente:** banco local por Docker Compose. O esquema evolui só por migrações geradas pelo Prisma, e a integração contínua verifica a migração e os testes de ponta a ponta.

---

## 3. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | Daniel Batista e Maria Eduarda Marques revisam os pull requests da base técnica na ordem #140 → #142 → #143, com o #144 em seguida | Ausência de Rodrigo Henrique Donato, antes indicado; a ordem segue o empilhamento dos pull requests da API | Revisores atualizados nos pull requests; integração na ordem indicada |
| D2 | Banco de dados local por Docker Compose em cada máquina | Mesmo ambiente para todos os integrantes | READMEs das linhas `api` e `web` |
| D3 | O modelo antigo de telas serve só como referência visual; os componentes necessários são trazidos para o esqueleto novo | O modelo usa Node 20, com pacotes desatualizados | Linha `web` |

O pull request #138 (HU-03 alinhada ao RF09 e matriz de requisitos não funcionais) foi revisado por Daniel Batista durante a reunião e aprovado.

---

## 4. Próximas etapas

Situação registrada na data da reunião.

| # | Ação | Responsável | Prazo | Situação |
|---|---|---|---|---|
| A1 | Revisar os pull requests da base técnica na ordem de D1 | Maria Eduarda Marques e Daniel Batista | 20/10 | Pendente |
| A2 | Analisar a coerência entre requisitos funcionais e histórias e trazer proposta de divisão | Maria Eduarda Marques | 20/10 | Pendente |
| A3 | Iniciar a HU-01: rotas de instrumento, projeto, requisito e meta | Daniel Batista e Rodrigo Henrique Donato | 20/10 | Pendente |
| A4 | Combinar com Rodrigo Henrique Donato, na aula, a sessão de trabalho da HU-01 | Daniel Batista | 20/10 | Pendente |
| A5 | Definir a organização da equipe em duplas ou trio para a próxima sprint | Equipe | 20/10 | Pendente |
| A6 | Sessão de trabalho conjunto online depois da reunião de revisão | Equipe | 20/10 | Pendente |
| A7 | Tela de login no front, sobre as rotas de autenticação da API | Vinicius Vieira e Maria Eduarda Marques | A definir na Sprint Planning 4 | Pendente |
| A8 | Ambiente acessível por link para a apresentação ao Instituto | Vinicius Vieira | 22/10 | Pendente |

---

## 5. Detalhes por tópico

**Requisitos e histórias.** Maria Eduarda Marques relatou a divisão de HU-03, HU-05 e HU-13 e perguntou se a orientação do docente pede um requisito por história ou admite mais de um. Vinicius Vieira e Daniel Batista confirmaram que havia mais de um requisito funcional por história, que parte da ligação estava coerente e que algumas histórias deviam ser quebradas. Ficou para 20/10 a escolha entre manter o modelo com justificativa por história ou adotar um requisito funcional por história, o que aumenta o número de histórias e mantém o de requisitos. Ainda não havia issues do docente sobre a Unidade 2.

**Equipe com cinco integrantes.** Com a saída de um integrante em 13/10, não havia duplas para todos. Foram levantadas três formas: um trio e uma dupla; duas duplas e uma pessoa sozinha em histórias de menor esforço técnico, com rodízio a cada sprint; e rodízio semanal das duplas. A definição ficou para 20/10.

**Base técnica e ordem de revisão.** Vinicius Vieira apresentou os pull requests: três da API (esqueleto; persistência com a migração inicial; autenticação, sessão e contas) e um do front. O modelo inicial do banco pode mudar no decorrer da construção. Uma exigência de CPF para a equipe interna, se o Instituto pedir, entra como validação na aplicação, sem mudar a regra do banco.

**Prazo e sessões de trabalho.** A equipe quer chegar à reunião de 22/10 com o Instituto com o máximo entregue, depois dos atrasos causados pelas provas, pela apresentação da Unidade 2 e pela mudança na equipe. Foram propostas sessões de trabalho conjunto online, a começar depois da reunião de 20/10.

**Repartição.** A HU-01 fica com Daniel Batista e Rodrigo Henrique Donato. A tela de login fica com Vinicius Vieira e Maria Eduarda Marques, aproveitando as rotas de autenticação já prontas na API. A documentação segue em paralelo, com pull requests para a `docs-homologacao`.

**Ambiente local.** Cada integrante sobe o banco pelos scripts do projeto, com Docker Compose; as variáveis ficam no arquivo de ambiente local. O esquema só muda por migração gerada pelo Prisma; quem traz mudança de outra pessoa aplica as migrações pendentes antes de rodar a API. A integração contínua aplica as migrações num banco de teste e roda os testes de ponta a ponta. Em Windows, a recomendação é usar WSL.

---

## 6. Pendências e pontos em aberto

| # | Pendência | Com quem | Onde se resolve |
|---|---|---|---|
| P1 | Organização da equipe em duplas ou trio | Equipe | Reunião de 20/10 (A5) |
| P2 | Um requisito funcional por história ou histórias agrupando requisitos, conforme a orientação do docente | Equipe | Reunião de 20/10 (A2) |
| P3 | Segunda conferência com o Instituto dos perfis de acesso e dos dados de pessoas | Maria Eduarda Marques | Reunião de 22/10 |

---

## 7. Insumos para o Documento de Visão

| Achado desta reunião | Entra em |
|---|---|
| Equipe com cinco integrantes e nova organização das duplas | Seção 7 e página de processo |
| Relação entre requisitos funcionais e histórias | Seções 8.4 e 10.1 |
| Ambiente local por Docker Compose e migrações pelo Prisma | READMEs das linhas de código |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 19/10/2026 | Vinicius Vieira | Rascunho a partir das anotações automáticas da reunião |
| 1.0 | 16/11/2026 | Vinicius Vieira | Publicação no site, no formato das atas publicadas; integrante que deixou a equipe citado sem o nome (ATA-2026-11-10) |
