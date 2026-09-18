# 6. Cronograma e entregas

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Seções 4, 5, 6 e 7 redigidas para o site | Equipe CyberSetor |
| 15/09/2026 | 1.3 | Ajuste de validação na Sprint 1: alinhamento contínuo com a coordenação (issue #23) | Equipe CyberSetor |
| 17/09/2026 | 1.4 | Correção decorrente da issue #24: calendário vigente declarado e alinhado ao plano da Sprint 1; dependência da CP5 explicitada; cobertura das características por sprint; sprint de estabilização, implantação e transferência; validação com dados reais antes da sprint de relatório; explicação das datas de fronteira | Vinicius Vieira |

## 6.1 Calendário vigente

O projeto é organizado em sprints de **duas semanas, ancoradas nas terças-feiras**, conforme a estratégia da seção 4. A Sprint 0 é a única exceção, com três semanas, por coincidir com a formação da equipe e com o prazo da Unidade 1.

!!! note "Qual calendário vale"
    A versão desta seção publicada em 06/09 previa a Sprint 1 de 15/09 a 29/09. A Sprint Planning de 08/09 fixou a **Sprint 1 de 08/09 a 22/09** e a cadência de duas semanas a partir dela, como registra o [plano da Sprint 1](../gestao/sprints/sprint-1.md) (§4.1 e §12). **O calendário vigente é o da tabela abaixo.** O anterior permanece apenas no histórico de versões desta página; nenhum outro documento do site deve ser lido como calendário.

**Por que uma sprint começa no dia em que a anterior termina.** A terça-feira de fronteira concentra os ritos de fechamento e de abertura — Sprint Review, Retrospectiva e Planning da sprint seguinte. O plano da Sprint 1 atribui a esse dia **capacidade produtiva zero** (§5.1): ele é fronteira administrativa, não sobreposição de execução. As datas de fim e de início coincidem por isso.

| Sprint | Início | Fim | Objetivo principal | Entregas esperadas | Validação com o cliente | Marcos da disciplina |
|---|---|---|---|---|---|---|
| **0 · Descoberta** | 18/08 | 08/09 | Compreender o Instituto e o problema; formar a equipe e o processo | Proposta aprovada; Documento de Visão (seções 1 a 7, 11.1 e 12); site; vídeo | Concordância preliminar com a proposta em 02/09; reunião presencial em 08/09 | Entrega da Unidade 1 em 08/09; apresentação em 10/09 |
| **1** | 08/09 | 22/09 | Elicitação detalhada, análise e consenso, declaração inicial; correções da Unidade 1 | Histórias candidatas com critérios em lista; modelo do processo atual em BPMN; glossário e catálogo de regras iniciados; Product Backlog no GitHub Projects; correções das issues #19 a #27 | Reunião online com o Instituto em 15/09 (projetos, coordenação e núcleo pedagógico); visita de observação | Semana Universitária de 22 a 24/09 |
| **2** | 22/09 | 06/10 | Requisitos declarados e validados; priorização; hipótese de MVP; DoR e DoD; preparação técnica | Lista de requisitos funcionais e não funcionais e regras de negócio (seção 8); DoR e DoD (seção 9); backlog priorizado por MoSCoW e hipótese de MVP (seção 10); protótipos de baixa fidelidade do fluxo de maior risco; dojos técnicos restantes; autenticação e ligação front-end ↔ back-end no repositório | Sessão de validação do modelo de meta e do esboço de relatório sobre um projeto real, prevista para cerca de 29/09 na ata de 08/09; encontro com a presidência, a agendar pelo Instituto | Sem aula de 22 a 24/09 |
| **3** | 06/10 | 20/10 | Primeira fatia vertical do produto | Incremento com instrumento, projeto, requisito/meta e atividade (CP1 e CP2), autenticação e perfis de acesso; dado criado, consultado e rastreado de ponta a ponta nesse trecho | Sprint Review com demonstração do incremento | **Entrega da Unidade 2 em 13/10**, no interior da sprint — verificada pelo conteúdo publicado no prazo, não pelo fechamento da sprint |
| **4** | 20/10 | 03/11 | Pessoas, participação e evidências | Incremento com cadastro e histórico de pessoas (CP5) **antes** da inscrição (CP3) e do registro em campo (CP4); vinculação de evidências a metas (CP7); comportamento com conectividade instável ensaiado sem perda nem duplicidade | **Checkpoint com dados reais até 29/10:** um projeto real do Instituto, com dados minimizados, percorrendo meta → atividade → participação → evidência; correções registradas antes da sprint de relatório | — |
| **5** | 03/11 | 17/11 | Progresso de metas e prestação de contas | Incremento com cálculo explicável do progresso das metas (CP6) e relatório de execução com exportação aberta (CP8), no grau já validado no checkpoint | Sprint Review sobre os dados do checkpoint | **Entrega da Unidade 3 em 17/11** |
| **6 · Estabilização e implantação** | 17/11 | 01/12 | Sem funcionalidade nova: correção, segurança, implantação, treinamento e transferência | Produto implantado no ambiente de produção; teste de restauração cronometrado; treinamento das pessoas do Instituto; ensaio de transferência com a lista da seção 6.4; lições aprendidas (seção 11) | Validação final em uso real pelas áreas competentes | Questionário de avaliação geral em 24/11 |
| **Margem** | 01/12 | 08/12 | Contingência e encerramento | Documentação final, aceite e transferência; **nenhum escopo novo** | Aceite formal do Instituto | **Entrega da Unidade 4 entre 01/12 e 08/12** |

O planejamento é atualizado ao fim de cada sprint, na Retrospectiva, e cada mudança de data entra no histórico desta página. As Sprints 1 e 2 seguem o que a Sprint Planning de 08/09 deliberou; as Sprints 3 a 6 e a margem são planejamento do Scrum Master, a confirmar pela equipe na Sprint Review ou Retrospectiva de 22/09, e não compromisso já validado pelo Instituto.

## 6.2 Dependências entre as características de produto

A ordem das sprints de construção segue a dependência de dados entre as características da seção 2.2, e não a ordem em que aparecem naquela tabela:

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

O escopo original reservava três sprints para todas as oito características, mais operação sem conexão, sincronização, autenticação, cálculo de metas e exportação. É mais do que seis estudantes com dedicação parcial constroem no período, sobretudo com dojos técnicos antes da construção. O ajuste é de critério, não de corte arbitrário: **entra na hipótese de MVP o necessário para percorrer uma vez, com dados do Instituto, o ciclo que origina o problema** — instrumento → projeto → meta → atividade → pessoa/participação → evidência → progresso → exportação para prestação de contas. Uma capacidade é obrigatória só se sua ausência impede esse percurso, viola condição legal ou torna o registro não confiável.

Ficam fora da hipótese ou condicionados, até a priorização da seção 10 na Unidade 2:

- sinalização preditiva de metas em risco (parte da CP6): entra o cálculo explicável do progresso; alerta preditivo é desejável;
- reprodução fiel do formulário de cada financiador (parte da CP8): entra o relatório em formato próprio com exportação tabular e índice de evidências; o adaptador específico depende dos modelos reais ainda não recebidos;
- lista de espera e inscrição feita pela coordenação (parte da CP3): entram após a inscrição básica funcionar;
- demandas registradas em 15/09 como candidatas — painel consolidado para a presidência, abertura de chamados e comprovação com coordenadas — que aguardam validação com a presidência e priorização, e não integram a hipótese atual;
- integrações de mensagens (WhatsApp, SMS) e qualquer módulo financeiro, fora desta versão por decisão registrada na seção 2.

O recorte definitivo é resultado da priorização por MoSCoW e da matriz de valor de negócio × esforço técnico na Sprint 2, com validação do Instituto e alinhamento com o docente; até lá, o que esta seção descreve é **hipótese de MVP**.

## 6.4 Estabilização, implantação e transferência

A Sprint 6 e a margem final existem para o que o cronograma anterior não reservava: tempo sem funcionalidade nova. O que se entrega nesse período:

| Frente | O que precisa estar pronto | Evidência |
|---|---|---|
| Estabilização | correções do checkpoint e da Review da Unidade 3; revisão de segurança dos perfis de acesso | registro de defeitos fechados; teste de permissão por perfil |
| Implantação | produto publicado no ambiente de produção descrito na seção 2.4, com domínio, certificado e cópia de segurança agendada | endereço acessível às pessoas do Instituto; registro da configuração |
| Teste de restauração | restauração da cópia externa em banco descartável, com a aplicação lendo os dados restaurados, cronometrada | registro datado com identificador da cópia, tempo total e resultado — até ele existir, nenhuma afirmação de recuperabilidade é publicada |
| Treinamento | sessões com as facilitadoras e com a coordenação, sobre o fluxo real de uma atividade e de um relatório | ata do treinamento; roteiro de tarefas críticas executado pela pessoa treinada |
| Transferência | **credenciais** entregues por canal seguro e acessos da equipe revogados; **documentação** de operação, manual de usuário e *runbook* técnico; **domínio** e certificado no nome do Instituto ou com renovação atribuída; **infraestrutura** inventariada sem segredos; **cópia de segurança** com política, cópia externa e último ensaio; **responsáveis** nomeados pelo Instituto — dono operacional, administrador técnico e substituto; **dados** exportados em formato aberto e conferidos | checklist de transferência assinado pelo representante do Instituto |

Quem recebe o sistema e quem custeia a manutenção após dezembro é pergunta em aberto com o Instituto desde 08/09; a transferência é planejada de forma a não depender da resposta para ser executada, mas o aceite formal depende dela.

## 6.5 Validação com dados reais

A validação não se concentra na última sprint. Há quatro momentos, cada um com objeto próprio:

1. **Sprint 2 (cerca de 29/09):** modelo de meta e esboço de relatório sobre um projeto real, com a Diretoria de Projetos e o núcleo pedagógico — prevista na ata de 08/09.
2. **Sprint 4 (até 29/10):** checkpoint com um projeto real e dados minimizados, percorrendo meta → atividade → participação → evidência, antes da sprint de relatório.
3. **Sprint 5 (17/11):** Sprint Review do progresso de metas e do relatório sobre os dados do checkpoint.
4. **Sprint 6:** validação final em uso real pelas áreas competentes, durante o treinamento.

Cada momento é registrado em ata e na seção 7.2 apenas depois de realizado; intenção e convite não contam como validação.

## 6.6 Marcos da disciplina

Apresentação da Unidade 1 em 10/09; Semana Universitária de 22 a 24/09, no início da Sprint 2; entrega da Unidade 2 em 13/10, no interior da Sprint 3; entrega da Unidade 3 em 17/11, no fechamento da Sprint 5; questionário de avaliação geral em 24/11; entrega final entre 01/12 e 08/12. Ao final de cada unidade a equipe realiza a Retrospectiva, cujo resultado alimenta a seção 11.
