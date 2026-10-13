# 6. Cronograma e entregas

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Seção redigida para o site | Equipe CyberSetor |
| 15/09/2026 | 1.2 | Ajuste de validação na Sprint 1: alinhamento contínuo com a coordenação | Equipe CyberSetor |
| 17/09/2026 | 1.3 | Calendário alinhado ao plano da Sprint 1; dependências entre as características, alcance do MVP, sprint de estabilização e momentos de validação | Vinicius Vieira |
| 17/09/2026 | 1.4 | Prazos da Unidade 2 e workshop de 21/09 incorporados; calendário reorganizado em período, objetivo e entrega de fechamento | Equipe CyberSetor |
| 13/10/2026 | 1.5 | Alcance do MVP e incrementos posteriores alinhados à seção 10.2.6 e à validação com o Instituto em 28/09 | Caio Martins |

## 6.1 Calendário vigente

O projeto é organizado em sprints de **duas semanas, ancoradas nas terças-feiras**, conforme a estratégia da seção 4. A Sprint 0 é a única exceção, com três semanas, por coincidir com a formação da equipe e com o prazo da Unidade 1.

| Sprint | Período | Objetivo | Entrega que fecha a sprint |
|---|---|---|---|
| **0 · Descoberta** | 18/08 – 08/09 | Compreender o Instituto e o problema; formar a equipe e o processo | Unidade 1: proposta, Documento de Visão, site e vídeo |
| **1** | 08/09 – 22/09 | Elicitar, analisar e declarar os requisitos | Lista de requisitos funcionais e não funcionais |
| **2** | 22/09 – 06/10 | Validar os requisitos, priorizar e recortar o MVP | Backlog priorizado, MVP e acordos de pronto e de concluído |
| **3** | 06/10 – 20/10 | Construir a primeira fatia vertical do produto | Instrumento, projeto, meta e atividade em uso, com acesso por perfil |
| **4** | 20/10 – 03/11 | Tratar pessoas, participação e evidências | Registro em campo e evidência vinculada à meta |
| **5** | 03/11 – 17/11 | Apurar progresso de metas e prestação de contas | Unidade 3: progresso calculado e relatório exportável |
| **6 · Estabilização** | 17/11 – 01/12 | Corrigir, implantar, treinar e transferir, sem funcionalidade nova | Produto implantado e equipe do Instituto treinada |
| **Margem** | 01/12 – 08/12 | Absorver contingência e encerrar, sem escopo novo | Unidade 4: aceite e transferência |

Uma sprint encerra e a seguinte inicia na mesma terça-feira porque esse dia é ocupado pelos ritos — Review, Retrospectiva e Planning —, e não pela produção: o plano da Sprint 1 atribui a ele capacidade produtiva zero. As datas coincidem por isso, sem que nenhum dia de trabalho seja contado duas vezes.

O planejamento é atualizado ao fim de cada sprint, na Retrospectiva. As Sprints 1 e 2 seguem o que a Sprint Planning de 08/09 deliberou; as seguintes são planejamento, a confirmar na Retrospectiva de 22/09, e não compromisso já validado pelo Instituto.

## 6.2 Dependências entre as características de produto

A ordem das sprints de construção segue a dependência de dados entre as características da seção 2.3, e não a ordem em que aparecem naquela tabela:

```text
CP1 projetos e metas → CP2 atividades → CP5 pessoas → CP3 inscrição · CP4 participação em campo → CP7 evidências → CP6 progresso de metas → CP8 relatório e exportação
```

- **CP5 antes de CP3 e CP4.** Inscrição, presença e contagem de participantes únicos dependem de uma base de pessoas com alerta de duplicidade e registro de consentimento. Por isso a Sprint 4 começa por CP5, e não termina nela.
- **Dados reais antes do relatório.** CP6 e CP8 só fazem sentido sobre metas, atividades e evidências verdadeiras. O checkpoint de 29/10 existe para que a Sprint 5 parta de dados validados, e não de massa de teste.
- **Condições transversais, não acabamento.** Autenticação e perfis, controle de acesso por área, auditoria, cópia de segurança e restauração acompanham cada incremento desde a Sprint 3; não ficam para a Sprint 6.

| Sprint | Características cobertas | Condição de saída |
|---|---|---|
| 3 | CP1, CP2 · autenticação e perfis | percurso instrumento → projeto → meta → atividade demonstrado com rastreabilidade |
| 4 | CP5, CP3, CP4, CP7 | ensaio de campo sem perda nem duplicidade; checkpoint com dados reais realizado |
| 5 | CP6, CP8 | progresso e relatório reproduzíveis sobre os dados do checkpoint |
| 6 | nenhuma nova | produto implantado, restauração testada, pessoas treinadas, transferência ensaiada |

## 6.3 Alcance do MVP e o que fica fora

Construir as oito características completas, acrescidas de operação sem conexão, sincronização assíncrona, cálculo preditivo e múltiplos relatórios customizados, excede a capacidade produtiva de seis estudantes com dedicação parcial ao longo de três sprints de desenvolvimento. Por isso, o recorte foi estabelecido por critério de fluxo mínimo completo: **o MVP percorre uma vez, com dados reais do Instituto, o ciclo nuclear que resolve o problema central de prestação de contas e controle institucional**.

O recorte definitivo do MVP foi pactuado no refinamento da Sprint 2, validado com a liderança do Instituto No Setor em reunião em 28/09/2026 e publicado na [seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos). Ele compreende:

1. **Parcerias e Metas (CP1 / HU-01, HU-02, HU-14):** Cadastro de instrumentos, projetos, vinculação de metas contratuais, responsáveis e acompanhamento de vencimentos, além do versionamento de aditivos.
2. **Atividades (CP2 / parte da HU-03):** Cadastro de atividades associadas às metas dos projetos.
3. **Inscrições e Titulares (CP3, CP5 / HU-07, HU-08, HU-15):** Inscrições públicas e assistidas, base única de participantes com minimização de dados e atendimento a direitos de exclusão e anonimização (LGPD).
4. **Prestação de Contas (CP8 / HU-05, HU-13):** Relatório de execução do objeto com cálculo de metas e justificativas prévias (em PDF com esqueleto próprio) e exportação dos dados do projeto em formato tabular aberto (CSV).

### O que fica para os incrementos posteriores

Em conformidade com a matriz de valor de negócio × esforço técnico da seção 10.2.5, as capacidades que não integraram o primeiro incremento foram distribuídas em entregas planejadas:

- **Incremento 2 (Sprint 4):** Repositório de comprovações e vinculação de evidências a atividades e metas (CP7 / HU-04: RF32 a RF34), configuração das comprovações por modalidade (RF10 da HU-03) e exibição do índice/miniaturas de evidências no relatório PDF (RF37).
- **Incremento 3 (Sprint 4/5):** Registro de participação em campo on-line (CP4 / RF16 da HU-09) e lançamento ou retificação de presença fora do prazo com justificativa auditável (HU-10 / RF19).
- **Evoluções posteriores:** Operação sem conexão e sincronização offline (CP4 / RF17 da HU-09 e HU-12 / RF18), acompanhamento preditivo de risco de meta (CP6 / HU-11: RF28 e RF30) e histórico de participação de pessoas (CP5 / HU-06: RF20 e RF21).
- **Fora do escopo desta versão:** Integração com serviços de mensagens proprietários (WhatsApp, SMS), módulos financeiro-contábeis próprios e adaptadores específicos para leiautes arbitrários de múltiplos financiadores externos.

## 6.4 Estabilização, implantação e transferência

A Sprint 6 e a margem final são tempo sem funcionalidade nova. O que se entrega nesse período:

| Frente | O que precisa estar pronto | Evidência |
|---|---|---|
| Estabilização | correções do checkpoint e da Review da Unidade 3; revisão de segurança dos perfis de acesso | registro de defeitos fechados; teste de permissão por perfil |
| Implantação | produto publicado no ambiente de produção descrito na seção 2.4, com domínio, certificado e cópia de segurança agendada | endereço acessível às pessoas do Instituto; registro da configuração |
| Teste de restauração | restauração da cópia externa em banco descartável, com a aplicação lendo os dados restaurados, cronometrada | registro datado com identificador da cópia, tempo total e resultado — até ele existir, nenhuma afirmação de recuperabilidade é publicada |
| Treinamento | sessões com as facilitadoras e com a coordenação, sobre o fluxo real de uma atividade e de um relatório | ata do treinamento; roteiro de tarefas críticas executado pela pessoa treinada |
| Transferência | **credenciais** entregues por canal seguro e acessos da equipe revogados; **documentação** de operação, manual de usuário e *runbook* técnico; **domínio** e certificado no nome do Instituto ou com renovação atribuída; **infraestrutura** inventariada sem segredos; **cópia de segurança** com política, cópia externa e último ensaio; **responsáveis** nomeados pelo Instituto — dono operacional, administrador técnico e substituto; **dados** exportados em formato aberto e conferidos | checklist de transferência assinado pelo representante do Instituto |

Quem recebe o sistema e quem custeia a manutenção após dezembro é definido com a direção do Instituto. A transferência é planejada de forma a não depender dessa definição para ser executada, mas o aceite formal depende dela.

## 6.5 Validação com dados reais

A validação não se concentra na última sprint. Há cinco momentos, cada um com objeto próprio:

1. **Sprint 1 (21/09):** workshop de requisitos com a coordenação do Instituto, para apresentar a lista de requisitos, explicar o método de priorização e resolver divergências antes da entrega de 22/09.
2. **Sprint 2 (cerca de 29/09):** modelo de meta e esboço de relatório sobre um projeto real, com a Diretoria de Projetos e o núcleo pedagógico — prevista na ata de 08/09.
3. **Sprint 4 (até 29/10):** checkpoint com um projeto real e dados minimizados, percorrendo meta → atividade → participação → evidência, antes da sprint de relatório.
4. **Sprint 5 (17/11):** Sprint Review do progresso de metas e do relatório sobre os dados do checkpoint.
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
