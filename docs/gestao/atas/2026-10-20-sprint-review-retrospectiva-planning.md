# Ata — Sprint Review 3, Retrospectiva 3 e Sprint Planning 4 — 20/10/2026

Reunião de encerramento da Sprint 3 e de planejamento da Sprint 4, realizada em 20/10/2026 e conduzida por Vinicius Vieira como Scrum Master. A reunião tratou da Review e da Retrospectiva da Sprint 3, da reestruturação das histórias de usuário, do planejamento da Sprint 4 e de uma demonstração técnica da API e do front.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-10-20 |
| **Tipo** | Sprint Review 3, Retrospectiva 3 e Sprint Planning 4 |
| **Data** | 20/10/2026 (terça-feira) |
| **Horário** | Não registrado |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Maria Eduarda Marques, Rodrigo Henrique Donato, Daniel Batista, Caio Martins |
| **Participantes — externos** | Nenhum registrado |
| **Condução** | Vinicius Vieira (Scrum Master) |
| **Registro (relator)** | Maria Eduarda Marques |
| **Gravação** | Não · anotações automáticas da reunião (arquivo no Drive restrito da equipe) |
| **Transcrição automática** | Não |
| **Documentos vistos** | Quadro "CyberSetor - Board"; pull requests abertos da API, do front e da documentação; API e front em execução local; documentação interativa da API |
| **Técnicas de ER aplicadas** | Organização e atualização do backlog (reestruturação das histórias de usuário) |
| **Sprint** | Sprint 3 (06/10 – 20/10/2026) · Sprint 4 (20/10 – 03/11/2026) |
| **Documentos relacionados** | [Plano da Sprint 3](../sprints/sprint-3.md) · [ATA-2026-10-07-SP (Sprint Planning 3)](2026-10-07-sprint-planning.md) · [Ata de validação do MVP de 08/10/2026](2026-10-08-validacao-mvp-instituto.md) |

---

## 1. Pauta

1. Sprint Review 3: meta da Sprint e situação dos pull requests.
2. Reestruturação das histórias de usuário.
3. Retrospectiva 3: pontos positivos, negativos e ações.
4. Sprint Planning 4: meta, duplas e histórias.
5. Demonstração técnica da API e do front.

---

## 2. Resumo

A reunião encerrou a Sprint 3 com a meta atingida: a Unidade 2 foi publicada antes de 13/10, o MVP foi confirmado pelo Instituto e a base técnica foi definida e integrada, restando publicar a homologação depois da aprovação dos pull requests abertos. A equipe ratificou a reestruturação das histórias de usuário, com um ator e um resultado por história. Na Retrospectiva, registrou como positivos a entrega no prazo, a melhora nas dailies e a maturidade na divisão do trabalho; como negativos, a sobrecarga no fim da sprint, a redução da equipe e a demora na revisão dos pull requests. A meta da Sprint 4 é o MVP completo em homologação, com validação do Instituto.

- **Review:** meta da Sprint 3 atingida; homologação a publicar depois das revisões.
- **Backlog:** histórias com um ator e um resultado; histórias próprias para as contas de administração.
- **Processo:** pull requests de 500 a 1.000 linhas; revisão em até 24 horas, com aviso geral se o prazo vencer.
- **Sprint 4:** MVP completo em homologação até 03/11; checkpoint com o Instituto em 29/10.
- **Duplas:** Daniel e Rodrigo; Maria Eduarda e Caio; Vinicius atua em todas as frentes.

---

## 3. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | A meta da Sprint 3 foi **atingida**: Unidade 2 publicada antes de 13/10, MVP confirmado pelo Instituto, ambiente local e base técnica definidos e integrados; a homologação é publicada depois da aprovação dos pull requests abertos | Critérios de aceitação da Sprint 3 | Plano da Sprint 3 |
| D2 | **Histórias com um ator e um resultado**: o backlog passa a derivar as histórias dos requisitos funcionais, com divisão das histórias complexas (por exemplo, HU-01a e HU-01b), requisitos não funcionais e regras de negócio separados, e histórias próprias para as contas de administração | Orientações metodológicas e retorno do docente; histórias mais independentes e testáveis | Seção 10; quadro do projeto |
| D3 | As mudanças nas histórias são apresentadas ao Instituto na reunião de 22/10, como ajuste estrutural que não altera o entendimento do produto | Manter o Instituto ciente da nova organização das histórias validadas | Validação com o Instituto |
| D4 | **Tamanho dos pull requests**: de 500 a 1.000 linhas de mudança, no máximo | Facilitar a revisão e adiantar as entregas | Página "Boas práticas no GitHub" |
| D5 | **Revisão em até 24 horas**; vencido o prazo, o autor aciona a equipe toda no grupo | Demora na revisão dos pull requests na Sprint 3 | Página "Boas práticas no GitHub" |
| D6 | **Duplas da Sprint 4**: Daniel Batista e Rodrigo Henrique Donato; Maria Eduarda Marques e Caio Martins; Vinicius Vieira atua de forma independente, apoiando todas as frentes | Equipe de cinco integrantes | Quadro do projeto; seção 7 |
| D7 | **Meta da Sprint 4**: MVP completo em homologação, em ambiente online, com validação do Instituto até 03/11; checkpoint com o Instituto em 29/10 | Cronograma do MVP (seção 6) | Plano da Sprint 4 |
| D8 | **Histórias da Sprint 4**: HU-01b, HU-02a, HU-02b e HU-14 com Daniel e Rodrigo; HU-03a, HU-07a, HU-07b, HU-07c e HU-08 com Maria Eduarda e Caio; homologação e HU-15a e HU-15b com Vinicius | Épicos das duplas e dependências entre as histórias | Quadro do projeto |
| D9 | **Testes com Vitest** no lugar do Jest, com estrutura e nomenclatura equivalentes | Depreciação do Jest na versão atual do Next.js | Seção 9 (DoD de código) |

---

## 4. Próximas etapas

| # | Ação | Responsável | Prazo | Situação |
|---|---|---|---|---|
| A1 | Revisar o pull request da documentação do backlog | Rodrigo Henrique Donato | 24 horas | Pendente |
| A2 | Revisar o pull request do backlog, testar localmente e conferir no site | Daniel Batista, Maria Eduarda Marques, Caio Martins e Rodrigo Henrique Donato | 24 horas | Pendente |
| A3 | Revisar o pull request da autenticação do front | Rodrigo Henrique Donato | 24 horas | Pendente |
| A4 | Revisar o pull request da homologação da API | Daniel Batista | 24 horas | Pendente |
| A5 | Atualizar o quadro do projeto com as tarefas e a meta da Sprint 4 | Vinicius Vieira | 21/10 | Pendente |
| A6 | Finalizar a homologação e integrar a HU-15a e a HU-15b | Vinicius Vieira | Sprint 4 | Pendente |
| A7 | Rodar o projeto localmente e avisar no grupo | Maria Eduarda Marques | 21/10, 12h | Feito em 21/10 |
| A8 | Rodar o projeto localmente e avisar no grupo | Daniel Batista | 20/10 | Pendente |
| A9 | Aplicar a revisão em até 24 horas, com aviso no grupo quando o prazo vencer | todos | contínuo | Pendente |

---

## 5. Detalhes por tópico

### Sprint Review 3

Vinicius Vieira confirmou que a meta da Sprint 3 foi cumprida: a Unidade 2 foi publicada antes de 13/10, o MVP foi confirmado pelo Instituto e o ambiente local e a base técnica foram definidos e integrados. A stack foi publicada no servidor de homologação, com ajustes na imagem de implantação; a publicação final depende da aprovação dos pull requests abertos. Vinicius Vieira informou que os novos pull requests foram montados com 500 a 1.000 linhas, para facilitar a revisão das histórias e adiantar as entregas ao Instituto.

Rodrigo Henrique Donato perguntou se a falta de uma Review direto com o cliente traria problema. Vinicius Vieira esclareceu que a revisão com o Instituto acontece nas reuniões com o cliente, e a Retrospectiva é interna da equipe; o ideal seria a Retrospectiva antes da reunião com o cliente, mas o fluxo atual funciona para a equipe.

### Reestruturação das histórias de usuário

Vinicius Vieira explicou que o backlog foi ajustado conforme as orientações metodológicas e o retorno do docente: histórias complexas foram divididas para ter um ator e um resultado cada, requisitos não funcionais e regras de negócio foram separados, e foram criadas histórias próprias para as contas de administração, o que facilita os testes (D2). Rodrigo Henrique Donato ponderou sobre revalidar as mudanças com o Instituto; a equipe decidiu apresentá-las na reunião de 22/10 (D3).

### Revisão dos pull requests

Vinicius Vieira pediu que a equipe revisasse os pull requests abertos, de autenticação, homologação da API, componentes de lista e testes de interface, dividindo as revisões entre as duplas para evitar gargalo (A1 a A4).

### Retrospectiva 3

- **Funcionou:** entrega da Unidade 2 no prazo; MVP confirmado; melhora na dinâmica das dailies; maturidade da equipe na divisão e na execução do trabalho.
- **Não funcionou:** sobrecarga de trabalho no fim da sprint; redução da equipe para cinco integrantes; demora na revisão dos pull requests.
- **Ações:** D4 (pull requests menores) e D5 (revisão em até 24 horas, com aviso geral).

### Sprint Planning 4

A equipe manteve as duplas e definiu Vinicius Vieira como apoio a todas as frentes (D6). A meta é o MVP completo em homologação até 03/11, com checkpoint com o Instituto em 29/10 (D7). As histórias foram distribuídas por dupla (D8), e Vinicius Vieira registra a distribuição no quadro do projeto (A5).

### Demonstração técnica

Vinicius Vieira apresentou a aplicação em execução local e a organização do código:

- **Front:** sessão por cookie, tela de entrada, painel de instrumentos com paginação e componentes de interface prontos.
- **API:** rotas e objetos de transferência de dados validados na entrada; camada de serviço com injeção de dependências; registro obrigatório de cada módulo novo na aplicação principal; controle de acesso por decoradores de perfil e de rota pública; documentação interativa gerada do código.
- **Banco de dados:** migrações criadas e aplicadas pelos comandos do projeto, com conferência automática na integração contínua antes da aprovação do pull request.
- **Ambiente local:** arquivos de exemplo de variáveis de ambiente com valores prontos para a API e o front, com atenção para não conflitar com outros serviços em execução.
- **Testes:** Vitest no lugar do Jest (D9).

Daniel Batista observou a semelhança com o Spring Boot, em injeção de dependências e anotações, o que facilita o aprendizado.

---

## 6. Pendências e pontos em aberto

| # | Pendência | Depende de | Encaminhamento |
|---|---|---|---|
| P1 | Apresentação das histórias reestruturadas ao Instituto | Reunião de 22/10 | D3 |
| P2 | Publicação da homologação | Aprovação dos pull requests abertos | A1 a A4, A6 |
| P3 | Plano da Sprint 4 | Atualização do quadro | A5 |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 21/10/2026 | Maria Eduarda Marques | Rascunho a partir das anotações automáticas da reunião, com revisão de dados sensíveis |
