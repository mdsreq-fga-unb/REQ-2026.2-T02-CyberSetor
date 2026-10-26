# 6. Cronograma e entregas

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Seção redigida para o site | Equipe CyberSetor |
| 15/09/2026 | 1.2 | Ajuste de validação na Sprint 1: alinhamento contínuo com a coordenação | Equipe CyberSetor |
| 17/09/2026 | 1.3 | Calendário alinhado ao plano da Sprint 1; dependências entre as características, alcance do MVP, sprint de estabilização e momentos de validação | Vinicius Vieira |
| 17/09/2026 | 1.4 | Prazos da Unidade 2 e workshop de 21/09 incorporados; calendário reorganizado em período, objetivo e entrega de fechamento | Equipe CyberSetor |
| 13/10/2026 | 1.5 | Alcance do MVP e incrementos posteriores alinhados à seção 10.2.6 | Caio Martins |
| 19/10/2026 | 1.6 | Equipe atual de cinco integrantes | Maria Eduarda Marques |
| 20/10/2026 | 1.7 | Sprints 4 e 5 alinhadas ao MVP e aos incrementos da seção 10.2.6: MVP concluído na Sprint 4, evidências e presença em campo na Sprint 5; checkpoint de 29/10 até a inscrição; alcance do MVP com as histórias da seção 10.1 | Equipe CyberSetor |
| 26/10/2026 | 1.8 | Prestação de contas com o resultado alcançado; orientação de enquadramento (RF45) no incremento de evidências; teste de restauração do banco e dos arquivos juntos | Vinicius Vieira |
| 26/10/2026 | 1.9 | Sprint 3 com a meta do seu plano; histórias previstas por sprint e ligação aos planos das sprints; características da Sprint 4 e da Sprint 5 pelos requisitos que entram; alcance do MVP remetido à seção 10.2.6; exportação do projeto (RF38) e cópia integral dos dados (RNF19) na transferência, com o que avança e o que depende de responsável nomeado pelo Instituto | Vinicius Vieira |

## 6.1 Calendário vigente

O projeto é organizado em sprints de **duas semanas, ancoradas nas terças-feiras**, conforme a estratégia da seção 4. A Sprint 0 é a única exceção, com três semanas, por coincidir com a formação da equipe e com o prazo da Unidade 1.

| Sprint | Período | Objetivo | Entrega que fecha a sprint |
|---|---|---|---|
| **0 · Descoberta** | 18/08 – 08/09 | Compreender o Instituto e o problema; formar a equipe e o processo | Unidade 1: proposta, Documento de Visão, site e vídeo |
| [**1**](../gestao/sprints/sprint-1.md) | 08/09 – 22/09 | Elicitar, analisar e declarar os requisitos | Lista de requisitos funcionais e não funcionais |
| [**2**](../gestao/sprints/sprint-2.md) | 22/09 – 06/10 | Validar os requisitos, priorizar e recortar o MVP | Backlog priorizado, MVP e acordos de pronto e de concluído |
| [**3**](../gestao/sprints/sprint-3.md) | 06/10 – 20/10 | Publicar a Unidade 2, confirmar o MVP com o Instituto e preparar a base técnica | Unidade 2 publicada; MVP confirmado; linhas da API e do front com integração contínua; histórias do MVP iniciadas |
| [**4**](../gestao/sprints/sprint-4.md) | 20/10 – 03/11 | Concluir o MVP: inscrições, titulares dos dados e relatório | MVP completo em homologação |
| **5** | 03/11 – 17/11 | Evidências e presença em campo (incrementos 2 e 3) | Unidade 3: relatório com evidências e presença registrada em campo |
| **6 · Estabilização** | 17/11 – 01/12 | Corrigir, implantar, treinar e transferir, sem funcionalidade nova | Produto implantado e equipe do Instituto treinada |
| **Margem** | 01/12 – 08/12 | Absorver contingência e encerrar, sem escopo novo | Unidade 4: aceite e transferência |

O número de cada sprint, a partir da Sprint 1, leva ao plano da sprint, com o Sprint Backlog e a alocação por dupla.

Uma sprint encerra e a seguinte inicia na mesma terça-feira porque esse dia é ocupado pelos ritos — Review, Retrospectiva e Planning —, e não pela produção: o plano da Sprint 1 atribui a ele capacidade produtiva zero. As datas coincidem por isso, sem que nenhum dia de trabalho seja contado duas vezes.

O planejamento é atualizado ao fim de cada sprint, na Retrospectiva. As Sprints 1 e 2 seguem o que a Sprint Planning de 08/09 deliberou; as seguintes são planejamento, revisto a cada Retrospectiva, e não compromisso já validado pelo Instituto.

## 6.2 Dependências entre as características de produto

As sprints de construção respeitam a dependência de dados entre as características da seção 2.3, e não a ordem em que aparecem naquela tabela; quando uma característica entra antes de outra de que depende, entra com os dados já existentes, como explicam os itens abaixo:

```text
CP1 projetos e metas → CP2 atividades → CP5 pessoas → CP3 inscrição · CP4 participação em campo → CP7 evidências → CP6 progresso de metas → CP8 relatório e exportação
```

- **Pessoas junto da inscrição.** Inscrição, presença e contagem de participantes únicos dependem da base de pessoas, do aviso de cadastro repetido e do registro de consentimento; por isso a CP5 entra na Sprint 4 com a CP3, e a presença em campo (CP4) vem depois.
- **Relatório em duas etapas.** No MVP, o relatório sai com metas, resultado alcançado e justificativas, sobre os dados do checkpoint de 29/10; as evidências entram na Sprint 5, e o progresso calculado (CP6) depende de presença e evidência registradas.
- **Condições transversais, não acabamento.** Autenticação e perfis, controle de acesso por área, auditoria, cópia de segurança e restauração acompanham cada incremento desde a Sprint 3; não ficam para a Sprint 6.
- **Característica parcial.** Na Sprint 4, a CP6 entra só com o versionamento do plano e o comparativo das metas repactuadas (RF31, RF44) e com o resultado alcançado registrado pelo usuário (RF43), sem progresso calculado (RF28 a RF30); na Sprint 5, a CP2 recebe só as comprovações por modalidade (RF10).

| Sprint | Características cobertas | Histórias previstas | Condição de saída |
|---|---|---|---|
| 3 | nenhuma concluída · base técnica, autenticação e perfis | histórias do MVP iniciadas | Unidade 2 publicada, MVP confirmado pelo Instituto, linhas da API e do front com integração contínua |
| 4 | CP1, CP2 (RF09, RF41), CP3, CP5, CP6 (só RF31, RF43, RF44), CP8 | as dezesseis do MVP ([seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos)) | MVP completo em homologação; checkpoint com dados reais realizado |
| 5 | CP2 (só RF10), CP4 (RF16, RF19), CP7 | HU-03b, HU-04a, HU-04b, HU-09a, HU-10 | evidências vinculadas às metas e presença on-line, com o relatório trazendo as evidências |
| 6 | nenhuma nova | nenhuma | produto implantado, restauração testada, pessoas treinadas, transferência ensaiada |

## 6.3 Alcance do MVP e o que fica fora

Construir as oito características completas, acrescidas de operação sem conexão, sincronização assíncrona, cálculo preditivo e múltiplos relatórios customizados, excede a capacidade produtiva de cinco estudantes com dedicação parcial ao longo de três sprints de desenvolvimento. Por isso, o recorte segue o critério de fluxo mínimo completo: **o MVP percorre os dois ciclos da [seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos) — do instrumento às metas com resultado alcançado e ao relatório com justificativas, e da atividade à lista de inscritos**.

A composição do MVP e dos incrementos, por história e por requisito, está na seção 10.2.6, com o valor de negócio atribuído pelo Instituto na [seção 10.2.2](../requisitos/10-backlog.md#1022-avaliacao-de-negocio-com-o-instituto) e o registro da validação na [seção 10.2.8](../requisitos/10-backlog.md#1028-validacao-com-o-instituto). A tabela da 6.2 distribui o MVP na Sprint 4 e os incrementos 2 e 3 na Sprint 5; operação sem conexão, progresso calculado e histórico de participação ficam fora das sprints da disciplina, salvo folga.

**Fora do escopo desta versão:** integração com serviços de mensagens proprietários (WhatsApp, SMS), módulos financeiro-contábeis próprios e adaptadores específicos para leiautes arbitrários de múltiplos financiadores externos.

## 6.4 Estabilização, implantação e transferência

A Sprint 6 e a margem final são tempo sem funcionalidade nova. O que se entrega nesse período:

| Frente | O que precisa estar pronto | Evidência |
|---|---|---|
| Estabilização | correções do checkpoint e da Review da Unidade 3; revisão de segurança dos perfis de acesso | registro de defeitos fechados; teste de permissão por perfil |
| Implantação | produto publicado no ambiente de produção descrito na seção 2.4, com domínio, certificado e cópia de segurança agendada | endereço acessível às pessoas do Instituto; registro da configuração |
| Teste de restauração | restauração conjunta da cópia externa do banco e dos arquivos em ambiente descartável, nos termos do RNF18, com a aplicação lendo os dados restaurados, cronometrada | registro datado com identificador da cópia, tempo total e resultado — até ele existir, nenhuma afirmação de recuperabilidade é publicada |
| Treinamento | sessões com as facilitadoras e com a coordenação, sobre o fluxo real de uma atividade e de um relatório | ata do treinamento; roteiro de tarefas críticas executado pela pessoa treinada |
| Transferência | **credenciais** entregues por canal seguro e acessos da equipe revogados; **documentação** de operação, manual de usuário e *runbook* técnico; **domínio** e certificado no nome do Instituto ou com renovação atribuída; **infraestrutura** inventariada sem segredos; **cópia de segurança** com política, cópia externa e último ensaio; **responsáveis** nomeados pelo Instituto — dono operacional, administrador técnico e substituto; **dados**: cópia integral dos dados e dos arquivos em formatos abertos (RNF19), além da exportação de cada projeto em planilha aberta (RF38), conferidas | checklist de transferência assinado pelo representante do Instituto |

Quem recebe o sistema e quem custeia a manutenção após dezembro é definido com a direção do Instituto. Sem essa definição, avançam a documentação de operação, o manual de usuário e o *runbook* técnico, o inventário da infraestrutura, o ensaio de restauração e a cópia integral dos dados. Ficam bloqueados até haver responsável nomeado pelo Instituto a entrega das credenciais, o domínio e o certificado no nome do Instituto, a revogação dos acessos da equipe e o aceite formal.

## 6.5 Validação com dados reais

A validação não se concentra na última sprint. Há cinco momentos, cada um com objeto próprio:

1. **Sprint 1 (21/09):** workshop de requisitos com a coordenação do Instituto, para apresentar a lista de requisitos, explicar o método de priorização e resolver divergências antes da entrega de 22/09.
2. **Sprint 2 (cerca de 29/09):** modelo de meta e esboço de relatório sobre um projeto real, com a Diretoria de Projetos e o núcleo pedagógico — prevista na ata de 08/09.
3. **Sprint 4 (até 29/10):** checkpoint com um projeto real e dados minimizados, percorrendo meta → atividade → inscrição, antes de o relatório do MVP ser concluído.
4. **Sprint 5 (17/11):** Sprint Review do relatório com evidências e da presença registrada em campo.
5. **Sprint 6:** validação final em uso real pelas áreas competentes, durante o treinamento.

Cada momento é registrado em ata e na seção 7.2 apenas depois de realizado; intenção e convite não contam como validação.

## 6.6 Marcos da disciplina

| Data | Marco | Onde cai |
|---|---|---|
| 10/09 | Apresentação da Unidade 1 | Sprint 1 |
| 22/09 | Entrega da lista de requisitos funcionais e não funcionais | fechamento da Sprint 1 |
| 22 a 24/09 | Semana Universitária, sem aula | início da Sprint 2 |
| 29/09 | Entrega do MVP, com ajustes e validações | interior da Sprint 2 |
| 13/10 | Entrega da Unidade 2 | interior da Sprint 3 |
| 17/11 | Entrega da Unidade 3 | fechamento da Sprint 5 |
| 24/11 | Questionário de avaliação geral | Sprint 6 |
| 01 a 08/12 | Entrega da Unidade 4 | margem final |

As entregas que caem no interior de uma sprint são verificadas pelo conteúdo publicado na data, e não pelo fechamento da sprint. A equipe realiza a Retrospectiva ao fim de cada sprint; as ações de melhoria acumuladas em cada unidade compõem a seção 11.
