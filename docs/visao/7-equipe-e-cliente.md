# 7. Interação entre equipe e cliente

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Seções 4, 5, 6 e 7 redigidas para o site | Equipe CyberSetor |
| 14/09/2026 | 1.3 | Correções decorrentes da issue #25: distinção entre as duas Maria Eduardas; caráter provisório da avaliação pelo Product Owner interno; área competente por funcionalidade; reconciliação da cadência de validação; validação de 02/09 apresentada como preliminar; responsabilidades por atividade de Engenharia de Requisitos | Vinicius Vieira |
| 15/09/2026 | 1.4 | Correções decorrentes da issue #23: processo de validação reestruturado em torno das conversas com o Instituto; Definition of Ready e Definition of Done retiradas da validação (são critérios de gestão de sprint, seção 9); política de gravações e transcrições | Caio Martins |
| 17/09/2026 | 1.5 | Revisão da 7.3: papel do Product Owner interno unificado com a delimitação já publicada; compromisso de treinamento transferido para a seção 6.4 (issue #23) | Vinicius Vieira |

## 7.1 Composição da Equipe

A equipe é formada por seis estudantes. Todos compõem o Time de Desenvolvimento, que estima, seleciona o que cabe na sprint, constrói e testa. Dois papéis do Scrum estão designados: o Product Owner interno e o Scrum Master.

!!! note "Duas pessoas chamadas Maria Eduarda"
    Há uma **Maria Eduarda Marques**, integrante da equipe CyberSetor e Product Owner interno, e uma **Maria Eduarda do núcleo pedagógico do Instituto**, uma das representantes do cliente. A partir desta revisão, a integrante da equipe é referida com o sobrenome **Marques** e a representante do Instituto vem sempre acompanhada da identificação institucional. O sobrenome da representante do Instituto não é registrado porque a equipe não o tem confirmado.

    Atas de reunião e planos de sprint **não são reeditados depois de publicados**, por serem registros formais do que foi deliberado em uma data. Nesses documentos o nome pode aparecer sem qualificação: vale o contexto da reunião — nas atas e nos planos da equipe trata-se de Maria Eduarda Marques; na ata da reunião presencial de 08/09, da representante do Instituto, como o próprio documento declara.

| Integrante | Matrícula | GitHub | Papel | Responsabilidades |
|---|---|---|---|---|
| Maria Eduarda Denis Duarte Marques | 232014502 | [@mariadenis](https://github.com/mariadenis) | Líder da equipe · Product Owner interno | Contato com o Instituto; mantém o entendimento do cliente entre as validações; propõe a ordenação do Product Backlog a partir do valor indicado pelo Instituto; Dupla A (seção 1) |
| Vinicius Angelo de Brito Vieira | 190118059 | [@viniciusvieira00](https://github.com/viniciusvieira00) | Scrum Master | Facilita as cerimônias; remove impedimentos; zela pelo processo, pelos prazos e pela infraestrutura do repositório e do site; Dupla B (seção 2) |
| Rodrigo Henrique Donato de Souza | 241012374 | [@Fofodoido](https://github.com/Fofodoido) | Time de Desenvolvimento | Análise competitiva e intervenção social; diagramas e representações visuais; Dupla B (seções 2 e 3) |
| Lucas de Paula Leal | 232004480 | [@lucaspaulaleal](https://github.com/lucaspaulaleal) | Time de Desenvolvimento | Relator das reuniões e guarda das transcrições; estratégia de engenharia de software; Dupla C (seções 4 a 6) |
| Daniel da Silva Batista | 231011201 | [@daniboycam](https://github.com/daniboycam) | Time de Desenvolvimento | Cenário atual, Rich Picture e mapa de stakeholders; Dupla A (seção 1) |
| Caio Flávio de Lima Martins Junior | 231011168 | [@caioflmjr](https://github.com/caioflmjr) | Time de Desenvolvimento | Engenharia de requisitos e cronograma; frente de operação sem conexão e infraestrutura no desenvolvimento; Dupla C (seções 4 a 6) |

### 7.1.1 Responsabilidades por atividade de Engenharia de Requisitos

**Todos os seis integrantes atuam como engenheiros de requisitos.** As seis atividades de Engenharia de Requisitos não são etapas lineares com donos exclusivos: são práticas iterativas e entrelaçadas, que ocorrem em paralelo, se retroalimentam e são revisitadas ao longo do projeto. A equipe participa de todas.

O que a tabela abaixo registra é **quem conduz cada atividade e responde por sua evidência** — o papel de orquestração descrito no livro-texto, em que o engenheiro de software coordena a atividade sem atuar sozinho, apoiado pela contribuição dos demais. A coluna não é lista de exclusividade: ninguém está impedido de participar de uma atividade por não constar dela, e quem consta não a executa sozinho.

| Atividade de ER | Quem conduz e responde pela evidência | Como a equipe participa | Evidência |
|---|---|---|---|
| **Elicitação e descoberta** | Maria Eduarda Marques (interlocução e agendamento) | A ata de cada sessão é publicada neste site, e as questões que dela surgem entram no refinamento semanal | Atas de reunião com o cliente; roteiros de entrevista; notas de observação direta |
| **Análise e consenso** | Vinicius Vieira e Rodrigo Henrique (documentos do cliente) | Achados discutidos no refinamento semanal, onde a equipe fecha o entendimento | Análise da planilha-template; glossário de termos do Instituto; registro de lacunas |
| **Declaração** | Cada dupla, no bloco atribuído | Todas as duplas redigem histórias e critérios de aceitação | Histórias de usuário e critérios de aceitação no GitHub Projects |
| **Representação** | Rodrigo Henrique (BPMN) · Daniel Batista (Rich Picture e mapa de stakeholders) | Diagramas revisados pela equipe antes de publicados | Diagramas publicados neste site |
| **Verificação e validação** | Vinicius Vieira organiza a revisão cruzada; a validação cabe ao Instituto, por área competente — ver §7.3 | Cada dupla revisa o material de outra dupla | Registro da revisão por par; ata da sessão de validação |
| **Organização e atualização** | Vinicius Vieira (Scrum Master) | Cada integrante mantém atualizados os itens sob sua responsabilidade no quadro | Quadro do projeto; matriz de rastreabilidade; planos de sprint |

A nomenclatura das seis atividades segue o livro-texto da disciplina (MARSICANO, 2026, §5.3): elicitação e descoberta, análise e consenso, declaração, representação, verificação e validação, organização e atualização.

O Product Owner interno é a mitigação para duas limitações conhecidas: a dependência da disponibilidade do Product Owner, no Scrum, e a dependência do cliente presente, no XP. O Instituto No Setor não dispõe de equipe de tecnologia e atua com agenda reduzida, e por isso não funcionaria como cliente presente no sentido literal. As responsabilidades técnicas no desenvolvimento serão distribuídas a partir da matriz de competências, com programação em pares desde a Sprint 1.

## 7.2 Comunicação

**Ferramentas**

- **WhatsApp:** comunidade *CyberSetor - Requisitos*, com três grupos: *Avisos*, para comunicados; *CyberSetor - Geral*, para discussão e decisões; e *Dailys*, exclusivo para a daily assíncrona. É também o canal de mensagens com as representantes do Instituto.
- **Google Meet:** todas as reuniões da equipe e as videochamadas com o Instituto, com gravação e ata gerada automaticamente. Gravações e transcrições brutas funcionam exclusivamente como apoio interno restrito no Google Drive; o registro oficial é a ata sintética elaborada pelo relator, revisada para controle de dados sensíveis (LGPD) e publicada neste site — ver a [política de registro, acesso e publicação](../gestao/atas/index.md#politica-de-registro-acesso-e-publicacao).
- **GitHub:** repositório do projeto, Product Backlog e Sprint Backlog no GitHub Projects e Issues, feedback do professor por issues e publicação deste site.
- **Google Docs:** rascunho colaborativo do documento. A entrega é o site; o rascunho não substitui a publicação.

**Reuniões e frequência**

- **Daily assíncrona:** todo dia útil, até as 12h, no grupo *Dailys*, com o que foi feito, o que será feito e os impedimentos. Impedimento declarado é resolvido ou escalado pelo Scrum Master em até 24 horas.
- **Sprint Planning:** na primeira terça-feira de cada sprint, cerca de uma hora, no Google Meet.
- **Refinamento do backlog:** semanal, cerca de trinta minutos, no Google Meet. É onde a Engenharia de Requisitos acontece no dia a dia.
- **Sprint Review:** na última terça-feira de cada sprint, cerca de uma hora. A participação do Instituto depende de agenda confirmada; ver a reconciliação em §7.3.
- **Retrospectiva:** ao final de cada unidade da disciplina, cerca de quarenta minutos. O resultado vai para a seção 11.

**Interação com o cliente**

As interlocutoras atuais são **Maria Clara e Maria Eduarda, do núcleo pedagógico do Instituto**. O contato corrente é por WhatsApp e e-mail. O formato acordado para a validação corrente é o de **conversas curtas e quinzenais**, de cerca de trinta minutos, em vez de reuniões longas e esporádicas, por respeito à agenda de uma organização com equipe reduzida. Encontros presenciais na sede do Instituto são realizados quando a elicitação exige observação direta.

**Interações efetivamente realizadas até 14/09/2026:**

| Data | Formato | O que ocorreu |
|---|---|---|
| 20/08/2026 | Videoconferência | Primeira reunião: contexto e dores |
| 02/09/2026 | Mensagem | Concordância **preliminar** com a proposta de solução — ver §7.3.2 |
| 08/09/2026 | Presencial, na sede | Elicitação aprofundada, com observação direta e análise de documentos |

Este site distingue **intenção, convite, confirmação e realização**: a tabela acima registra apenas o que ocorreu. Encontro agendado só é incorporado a ela depois de realizado. A cadência quinzenal é compromisso acordado e ainda em consolidação — o agendamento recorrente foi decidido na Sprint Planning de 08/09 e segue pendente de registro no calendário compartilhado.

## 7.3 Processo de Validação

A validação dos requisitos e da solução é um processo contínuo e centrado no cliente, estruturado em torno das interações e conversas de validação com as representantes do Instituto No Setor:

1. **Validação com prototipação leve:** nas fases iniciais e a cada novo fluxo concebido, telas e navegações preliminares são apresentadas às representantes para validar a adequação da interface e do fluxo operacional antes do desenvolvimento completo.
2. **Demonstração do MVP funcional mínimo:** com o avanço do desenvolvimento, as iterações e incrementos são demonstrados e exercitados com cenários reais das oficinas e eventos do Instituto, confirmando se o comportamento construído resolve de fato os gargalos de registro e prestação de contas.
3. **Identificação conjunta de ambiguidades, inconsistências e omissões:** a equipe e as interlocutoras analisam ativamente cada funcionalidade demonstrada para identificar lacunas de regras de negócio, comportamentos inesperados ou fluxos ausentes.
4. **Registro em ata e refinamento contínuo:** os apontamentos e acordos estabelecidos nas conversas de validação são formalmente sintetizados em ata de reunião, alimentando o refinamento imediato do Product Backlog e o planejamento das sprints seguintes.
5. **Papel do Product Owner interno:** não valida o trabalho da equipe em nome do cliente; destrava dúvidas operacionais no intervalo entre as conversas de validação. Decisão de domínio, regra de prestação de contas ou alteração de escopo é confirmada com as representantes do Instituto — o alcance dessa avaliação provisória está delimitado no parágrafo seguinte.

**Quando o Instituto não participar.** O papel de Product Owner interno foi adotado por decisão registrada em 01/09/2026, justamente para que o trabalho não parasse enquanto uma resposta do Instituto não chega: é a mitigação declarada em §7.1 para a ausência de cliente presente. O que esta revisão acrescenta não reverte essa decisão, apenas delimita seu alcance — a avaliação feita pelo Product Owner interno é **provisória**: mantém o trabalho em andamento, mas **não confirma regra de domínio nem substitui a validação do cliente**. Um item avaliado apenas por essa via permanece marcado como *pendente de validação externa* até ser confirmado pela área competente do Instituto. Quando a contingência assíncrona for usada — envio do material com prazo de resposta —, é o **registro escrito da resposta** que converte a avaliação provisória em validação.

### 7.3.1 Área competente por funcionalidade

O núcleo pedagógico **não é a única fonte de validação**. Cada conjunto de funcionalidades é validado por quem o utiliza ou responde por ele:

| Conjunto de funcionalidades | Área competente do Instituto | Situação em 14/09/2026 |
|---|---|---|
| Requisito, meta, indicador e parâmetro de aferição | Diretoria de Projetos e Captação de Recursos | Conversa **em agendamento** |
| Relatório de execução do objeto e prestação de contas | Área Administrativo-Financeira | Conversa **em agendamento** |
| Inscrição, registro de presença e uso em campo | Educadores que conduzem as atividades | Perspectiva **parcialmente coberta**: a representante do núcleo pedagógico com quem a equipe interage acumula a função de educadora. Falta observação direta de uma atividade em execução |
| Plano de trabalho, atividades e acompanhamento pedagógico | Núcleo pedagógico | **Coberta** — 20/08, 02/09 e 08/09 |
| Base de pessoas, consentimento e tratamento de dados | Direção, com apoio das áreas acima | **A tratar**, junto com os pontos a confirmar da ata de 08/09 |
| Continuidade após o encerramento da disciplina | Direção | **A tratar** — pergunta registrada na ata de 08/09 |

A ampliação dos interlocutores não é resposta improvisada: a consulta à área administrativo-financeira foi decidida na Sprint Planning de 08/09/2026, e o agendamento das conversas com a Diretoria de Projetos e com essa área consta dos encaminhamentos da ata da reunião presencial do mesmo dia.

### 7.3.2 O que a validação de 02/09/2026 cobre — e o que não cobre

**Cobre:** em 02/09/2026, após ler a **proposta de solução**, as representantes do núcleo pedagógico do Instituto manifestaram concordância com o problema identificado. Isso confirma o problema descrito na seção 1.4 e os objetivos da seção 2 **como ponto de partida**.

**Não cobre:** a manifestação foi por mensagem, **antes** da elicitação presencial aprofundada de 08/09/2026, e é portanto **preliminar**. Ela não valida o que só foi descoberto depois — em particular o reposicionamento do centro do produto para o ciclo do projeto financiado, a estrutura organizacional real do Instituto e o modelo de requisito/meta com indicador e parâmetro de aferição. Esses achados constam da ata de 08/09, que está em conferência pelo Instituto e cuja validação formal permanece pendente.

Uma aprovação anterior não se estende automaticamente a fatos posteriores. A sessão de validação prevista para o fim de setembro, com o modelo de meta e o esboço de relatório sobre um projeto real da organização, é o próximo marco de validação.
