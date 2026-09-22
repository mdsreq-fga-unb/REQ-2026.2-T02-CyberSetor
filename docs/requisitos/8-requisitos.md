# 8. Requisitos de Software

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 19/09/2026 | 1.0 | Estruturação e publicação da primeira versão do catálogo de requisitos | Dupla B (Rodrigo Henrique e Vinicius Vieira) |
| 19/09/2026 | 1.1 | Rascunho dos requisitos de CP3 e CP5 (LGPD) e perguntas-chave (Issue #41) | Dupla A (Maria Eduarda Marques e Daniel Batista) |
| 20/09/2026 | 1.2 | Especificação dos requisitos de CP2, CP4, CP7 e modelo offline (Issue #40) | Dupla C (Caio Flávio e Lucas Leal) |
| 20/09/2026 | 1.3 | Especificação de CP6, CP8, regras MROSC e prevenção de glosa (Issue #42) | Dupla C & B (Caio Flávio, Lucas Leal e Vinicius Vieira) |
| 20/09/2026 | 1.4 | Refinamento da CP1, notas de domínio e matriz B1 (Issue #39) | Dupla B (Rodrigo Henrique e Vinicius Vieira) |
| 21/09/2026 | 1.5 | Consolidação dos 18 RNFs sob FURPS+ e Sommerville (Issue #43) | Maria Eduarda Marques (PO) e Vinicius Vieira (SM) |
| 21/09/2026 | 1.6 | Construção da matriz de rastreabilidade bidirecional e auditoria de lacunas (Issue #44) | Dupla A (Maria Eduarda Marques e Daniel Batista) |
| 21/09/2026 | 2.0 | Unificação final do catálogo consolidado (RF01–RF37, RNF01–RNF18), notas de domínio e matriz de rastreabilidade oficial (Issue #45) | Equipe CyberSetor |

---

## 8.1 Introdução Metodológica

A especificação de requisitos do sistema CyberSetor orienta-se pela abordagem ágil ScrumXP combinada aos preceitos da Engenharia de Requisitos contemporânea. A declaração e a taxonomia seguem as diretrizes metodológicas da disciplina (Marsicano, 2026), com requisitos funcionais orientados à ação e requisitos não funcionais fundamentados no modelo **FURPS+** e na taxonomia de **Ian Sommerville**.

A governança do catálogo adota:
* **Identificadores unívocos:** Códigos prefixados (`RFxx` e `RNFxx`) em sequência única e contínua, acompanhados de âncoras explícitas para permitir rastreamento direto a partir de issues, histórias de usuário e matrizes. Os RFs seguem rigorosamente a ordem das Características de Produto (CP1 a CP8).
* **Padronização verbal:** Todo requisito funcional é expresso no formato **Verbo no Infinitivo + Objeto Direto**, definindo uma única ação verificável, sem ambiguidades de escopo.
* **Critérios verificáveis:** Todo requisito não funcional estabelece uma métrica quantitativa numérica, passível de verificação objetiva por testes automatizados, auditoria de código ou inspeção determinística.

---

## 8.2 Lista de Requisitos Funcionais (RFs)

### CP1 — Gestão de Projetos e Metas

#### RF01 — Cadastrar instrumento convocatório e parceria
* **Descrição:** Deve ser possível ao usuário com perfil de Diretoria de Projetos ou Presidência cadastrar instrumentos formais de parceria (termos de fomento, termos de colaboração, acordos de cooperação, convênios ou emendas parlamentares), registrando tipo de instrumento, órgão concedente/financiador, número do processo administrativo, valor global repassado, datas de celebração e de vigência contratual (início e término), com anexo obrigatório do documento homologado em formato PDF.
* **Rastreabilidade:** CP1 | OE01 | BPMN G01 | HU-01 | MROSC (Lei 13.019/2014, art. 16 e 42)

#### RF02 — Cadastrar projeto operacional
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos cadastrar projetos operacionais vinculados a um instrumento convocatório ativo previamente cadastrado, registrando código de identificação, título, coordenador responsável e cronograma planejado de execução.
* **Rastreabilidade:** CP1 | OE01 | BPMN G01 | HU-01

#### RF03 — Desdobrar requisitos contratuais e metas
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos desdobrar o plano de trabalho de um projeto em metas e requisitos contratuais auditáveis, registrando: origem normativa (edital, projeto ou Instituto), descrição da meta, indicador de desempenho associado, modalidade de aferição (quantitativa numérica ou qualitativa descritiva), parâmetro planejado (quando quantitativa), frequência de apuração e forma documental de comprovação/verificação (ex.: lista de presença assinada, relatório técnico, ata de reunião ou registro fotográfico).
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G01 | HU-01 | MROSC (Lei 13.019/2014, art. 22 e 42)

#### RF04 — Atribuir responsável, setor e prazo a meta
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos vincular a cada meta cadastrada um titular responsável (dono da meta), um setor executor competente (Diretoria de Projetos, Administrativo-Financeiro, Núcleo Pedagógico ou Presidência) e uma data limite fatal para conclusão da entrega. O sistema deve registrar a situação da meta (pendente, em andamento ou concluída) e sinalizar no painel do projeto as metas ainda sem responsável atribuído.
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G02 | HU-02 (CA-02.1, CA-02.3) | Ata de 08/09, decisão 3

#### RF05 — Exibir linha do tempo e painel de prazos de metas
* **Descrição:** Deve ser possível aos usuários autorizados consultar uma visualização consolidada em linha do tempo contendo a vigência dos instrumentos e a relação ordenada dos prazos fatais de entrega de todas as metas e requisitos de um projeto.
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G01, G02 | HU-02

#### RF06 — Emitir alertas de proximidade de vencimento de metas
* **Descrição:** O sistema deve emitir notificações e alertas visuais destacados no painel do projeto quando o prazo fatal de uma meta estiver a 7 dias corridos ou menos do vencimento, ou quando a data limite já estiver expirada sem comprovação protocolada.
* **Rastreabilidade:** CP1 | OE04 | BPMN G02 | HU-02

---

### CP2 — Gestão de Atividades

#### RF07 — Cadastrar atividade por modalidade de objeto
* **Descrição:** Deve ser possível ao usuário da equipe de projetos ou coordenação pedagógica cadastrar atividades vinculadas a um projeto, classificando a modalidade em: Oficina Contínua, Evento Aberto ou Ação de Acolhimento Comunitário, configurando número de vagas planejadas, carga horária prevista, facilitador responsável, local de realização, datas e parâmetros de recorrência de turmas.
* **Rastreabilidade:** CP2 | OE01, OE04 | BPMN G03 | HU-03

#### RF08 — Parametrizar exigência de comprovação de presença
* **Descrição:** O sistema deve parametrizar as regras de comprovação de acordo com a modalidade da atividade: exigindo chamada nominal com controle de assiduidade para oficinas formativas contínuas, ou contagem quantitativa agregada e anônima de público para ações de acolhimento e eventos de rua no Setor Comercial Sul (SCS), dispensando a obrigatoriedade de CPF nestas últimas.
* **Rastreabilidade:** CP2 | OE01, OE04 | Seção 3.3.6 | BPMN G03 | HU-03

---

### CP3 — Inscrição de Participantes

#### RF09 — Disponibilizar formulário público de inscrição
* **Descrição:** O sistema deve permitir que o interessado se inscreva em oficina ou evento por formulário público acessível em navegador móvel, sem necessidade de criação de conta nem senha.
* **Rastreabilidade:** CP3 | OE02 | BPMN G03, G04 | *Candidato a nova história na Sprint 2*

#### RF10 — Gerar QR Code de inscrição
* **Descrição:** O sistema deve permitir que o usuário gere, para cada atividade, um link e um QR Code dinâmico que abrem o formulário público de inscrição, para divulgação em cartazes impressos e redes sociais.
* **Rastreabilidade:** CP3 | OE02 | *Candidato a nova história na Sprint 2*

#### RF11 — Registrar inscrição presencial assistida
* **Descrição:** O sistema deve permitir que o educador ou o recepcionista inscreva um participante presencialmente em seu nome, garantindo o acolhimento de pessoas em situação de rua ou sem conectividade própria.
* **Rastreabilidade:** CP3 | OE02 | Seção 3.3.10 | *Candidato a nova história na Sprint 2*

#### RF12 — Limitar vagas da atividade
* **Descrição:** O sistema deve bloquear automaticamente novas inscrições confirmadas quando o número máximo de vagas estabelecido para a turma for atingido.
* **Rastreabilidade:** CP3 | OE01, OE02 | *Candidato a nova história na Sprint 2*

#### RF13 — Ordenar lista de espera
* **Descrição:** O sistema deve registrar as inscrições submetidas após o esgotamento das vagas regulares em uma fila de espera ordenada cronologicamente pelo timestamp da submissão.
* **Rastreabilidade:** CP3 | OE01, OE02 | *Candidato a nova história na Sprint 2*

---

### CP4 — Registro de Participação em Campo

#### RF14 — Registrar frequência em dispositivo móvel
* **Descrição:** Deve ser possível ao educador ou facilitador de campo realizar a chamada digital diretamente em smartphone pessoal (BYOD), fornecendo interface otimizada para marcação individual ou confirmação em lote.
* **Rastreabilidade:** CP4 | OE03, OE04 | BPMN G03 | *Candidato a nova história na Sprint 2*

#### RF15 — Operar registro de presença em modo offline
* **Descrição:** O sistema deve permitir a chamada de oficinas mesmo na ausência completa de conexão com a internet no SCS, retendo os registros no armazenamento local seguro do navegador (IndexedDB) e gerenciando uma fila local de eventos pendentes de sincronização.
* **Rastreabilidade:** CP4 | OE03, OE04 | Seção 3.3.3 | BPMN G03 | *Candidato a nova história na Sprint 2*

#### RF16 — Sincronizar presenças com reconciliação idempotente
* **Descrição:** O sistema deve sincronizar automaticamente a fila local de presenças com o servidor assim que a conectividade for restabelecida, utilizando identificadores únicos (UUIDv4) e garantindo que submissões repetidas do mesmo lote não dupliquem registros no banco de dados.
* **Rastreabilidade:** CP4 | OE03, OE04 | Seção 3.3.3 | BPMN G03 | *Candidato a nova história na Sprint 2*

#### RF17 — Registrar lançamento extemporâneo com justificativa
* **Descrição:** Deve ser possível lançar ou retificar chamadas após a data de realização da atividade, exigindo obrigatoriamente justificativa textual fundamentada e registrando autor, data, hora e motivo na trilha de auditoria.
* **Rastreabilidade:** CP4 | OE03, OE04 | Seção 3.3.8 | BPMN G03 | *Candidato a nova história na Sprint 2*

#### RF18 — Apurar carga horária de participantes e facilitadores
* **Descrição:** O sistema deve acumular automaticamente o total de horas de participação efetiva de cada beneficiário e o total de horas ministradas por facilitador em cada ciclo de oficinas.
* **Rastreabilidade:** CP4 | OE03, OE04 | BPMN G03 | *Candidato a nova história na Sprint 2*

---

### CP5 — Cadastro e Histórico de Pessoas

#### RF19 — Consultar histórico de participação
* **Descrição:** O sistema deve permitir ao núcleo pedagógico consultar a ficha única consolidada de uma pessoa, exibindo oficinas e eventos de que participou em diferentes projetos ao longo do tempo.
* **Rastreabilidade:** CP5 | OE01 | BPMN G04 | HU-06 (CA-06.1)

#### RF20 — Alertar cadastro duplicado
* **Descrição:** O sistema deve alertar o operador, no ato do cadastro, quando nome e telefone coincidirem com os de uma pessoa já registrada, permitindo reaproveitar o registro histórico.
* **Rastreabilidade:** CP5 | OE01 | BPMN G04 | HU-06 (CA-06.2)

#### RF21 — Registrar consentimento de guarda de dados
* **Descrição:** O sistema deve registrar, com carimbo de data/hora, o consentimento do titular (ou responsável legal, se menor) para guarda de dados cadastrais, como condição para concluir a inscrição.
* **Rastreabilidade:** CP5 | OE01 | BPMN G04 | LGPD art. 7º e 8º | HU-06 (CA-06.3)

#### RF22 — Registrar autorização de contato
* **Descrição:** O sistema deve registrar, de forma opcional e separada, a autorização para receber comunicados de novas atividades, permitindo revogação (*opt-out*) a qualquer momento.
* **Rastreabilidade:** CP5 | OE01 | BPMN G04 | Seção 3.3.5 | LGPD art. 8º, §5º | HU-06

#### RF23 — Registrar autorização de uso de imagem
* **Descrição:** O sistema deve registrar, de forma destacada e independente, a concessão ou recusa para captação de imagem institucional, sem que a negativa impeça a participação na atividade.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.4 | LGPD art. 7º e 8º | HU-06

#### RF24 — Retificar dados cadastrais
* **Descrição:** O sistema deve permitir a correção de dados pessoais a pedido do titular, registrando autor, data, hora e justificativa da retificação.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.9 | LGPD art. 18, III | HU-06

#### RF25 — Excluir ou anonimizar cadastro
* **Descrição:** O sistema deve permitir a exclusão ou anonimização definitiva dos dados a pedido do titular, preservando os totais quantitativos já consolidados para prestações de contas.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.9 | LGPD art. 18, IV e VI | HU-06

---

### CP6 — Acompanhamento Automático de Metas

#### RF26 — Calcular progresso físico de metas em tempo real
* **Descrição:** O sistema deve calcular automaticamente o progresso quantitativo e o percentual de atingimento de cada meta a partir da consolidação contínua das presenças e evidências homologadas.
* **Rastreabilidade:** CP6 | OE01, OE04 | BPMN G05 | HU-01 (CA-01.2), HU-05 (CA-05.1)

#### RF27 — Parametrizar apuração para metas não lineares e marcos
* **Descrição:** Deve ser possível parametrizar regras distintas conforme o indicador: apuração cumulativa linear ou aferição binária por marco (*milestone*, ex.: publicação de catálogo).
* **Rastreabilidade:** CP6 | OE04 | Seção 2.3 | BPMN G05 | *Candidato a nova história na Sprint 2*

#### RF28 — Emitir alertas de risco de inexecução
* **Descrição:** O sistema deve emitir avisos destacados quando o ritmo de execução estiver abaixo da curva planejada, possibilitando ações corretivas preventivas antes do vencimento do prazo.
* **Rastreabilidade:** CP6 | OE04 | BPMN G05 | *Candidato a nova história na Sprint 2*

#### RF29 — Versionar metas por Termo Aditivo
* **Descrição:** O sistema deve registrar repactuações contratuais de metas ou prazos decorrentes de Termos Aditivos, mantendo o histórico da pactuação inicial e gerando comparativo auditável.
* **Rastreabilidade:** CP6 | OE04 | BPMN G05 | Lei 13.019/2014, art. 55 e 57 | *Candidato a nova história na Sprint 2*

---

### CP7 — Repositório de Evidências e Documentação

#### RF30 — Anexar evidências documentais e fotográficas
* **Descrição:** Deve ser possível anexar arquivos comprobatórios de atividades (fotos, listas assinadas digitalizadas e atas), extraindo e registrando automaticamente metadados de data, hora e geolocalização.
* **Rastreabilidade:** CP7 | OE05, OE06 | BPMN G03 | HU-04

#### RF31 — Vincular evidência a meta contratual
* **Descrição:** O sistema deve exigir a associação expressa de cada documento a uma atividade e a uma ou mais metas contratuais, exibindo o índice de comprovações e as pendências documentais.
* **Rastreabilidade:** CP7 | OE05, OE06 | BPMN G03 | HU-04 (CA-04.1, CA-04.2, CA-04.3)

#### RF32 — Segregar acesso a fotos de beneficiários vulneráveis
* **Descrição:** O sistema deve aplicar controle de acesso estrito às imagens de pessoas em vulnerabilidade social, restringindo a visualização a coordenadores e auditores e orientando tomadas panorâmicas.
* **Rastreabilidade:** CP7 | OE05, OE06 | Seção 3.3.4 | LGPD | ECA | HU-04

---

### CP8 — Relatórios e Exportação de Dados

#### RF33 — Exigir justificativa prévia para metas não atingidas
* **Descrição:** O sistema deve bloquear o fechamento do ciclo de prestação de contas de projetos que apresentem inexecução parcial sem prévia justificativa técnica registrada pelo analista.
* **Rastreabilidade:** CP8 | OE04, OE06 | BPMN G06 | Lei 13.019/2014, art. 64, §1º | HU-05

#### RF34 — Emitir Relatório de Execução do Objeto
* **Descrição:** Deve ser possível compilar o Relatório de Execução do Objeto consolidando metas previstas vs. realizadas, justificativas técnicas e índice ordenado de comprovações.
* **Rastreabilidade:** CP8 | OE04, OE06 | BPMN G06 | Lei 13.019/2014, art. 63 a 66 | HU-05

#### RF35 — Gerar relatório diagramado em PDF via servidor
* **Descrição:** O sistema deve compilar e renderizar no servidor o documento diagramado em formato PDF, com sumário executivo, tabelas analíticas e miniaturas de evidências com metadados.
* **Rastreabilidade:** CP8 | OE06 | Seção 2.4 | HU-05

#### RF36 — Exportar dados consolidados em formato tabular aberto
* **Descrição:** Deve ser possível exportar dados brutos de execução, presenças e status de metas em formato aberto (CSV) para auditorias externas independentes.
* **Rastreabilidade:** CP8 | OE06 | Lei 13.019/2014, art. 64 | HU-05

#### RF37 — Registrar trilha de auditoria para retificações na prestação
* **Descrição:** O sistema deve registrar em trilha imutável qualquer alteração de dados, inclusão extemporânea de justificativas ou geração de relatórios oficiais.
* **Rastreabilidade:** CP8 | OE04 | BPMN G06 | HU-05

---

## 8.3 Lista de Requisitos Não Funcionais (RNFs)

### Confiabilidade e Integridade

#### RNF01 — Integridade transacional dos dados
* **Classificação FURPS+:** Confiabilidade (Reliability)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade)
* **Descrição:** O sistema deve garantir que operações compostas sejam concluídas por inteiro ou revertidas por inteiro, sem deixar registros parciais em caso de falha.
* **Métrica Verificável:** 100% de reversão automática em operações compostas que falham e 0 registros órfãos ou inconsistentes após os testes de integração.

#### RNF02 — Auditabilidade das alterações
* **Classificação FURPS+:** Confiabilidade (Reliability) / Segurança (Security)
* **Classificação Sommerville:** Requisito de Produto (Segurança e integridade)
* **Descrição:** O sistema deve registrar em trilha de auditoria permanente toda criação, alteração ou exclusão lógica de dados, com autor, data/hora, valores anteriores e posteriores e justificativa.
* **Métrica Verificável:** 100% das operações de escrita com registro de auditoria e 0 comandos de alteração ou exclusão permitidos sobre a trilha, mesmo para o perfil administrador, em teste de rotas.

#### RNF08 — Integridade de relatórios fechados
* **Classificação FURPS+:** Confiabilidade (Reliability) / Segurança (Security)
* **Classificação Sommerville:** Requisito de Produto (Integridade)
* **Descrição:** O sistema deve garantir que o relatório finalizado reflita exatamente o estado dos dados no fechamento do ciclo e impedir alteração posterior sem rastro.
* **Métrica Verificável:** 100% de correspondência entre o hash SHA-256 do arquivo gerado e o registro gravado na base de dados, e 0 alterações diretas sobre o período fechado.

#### RNF09 — Resiliência offline e sincronização sem duplicidade
* **Classificação FURPS+:** Confiabilidade (Reliability) / Usabilidade (Usability)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade e resiliência)
* **Descrição:** O registro de presenças e evidências em campo deve continuar funcionando sem conexão, reter os dados no aparelho mesmo após fechar o navegador ou reiniciar o dispositivo e, ao restabelecer a rede, sincronizar sem perder nem duplicar registros.
* **Métrica Verificável:** 0% de perda de registros após corte simulado de conexão e recarga da página; 0 presenças duplicadas após 5 submissões idênticas do mesmo lote em testes ponta a ponta (Playwright).

#### RNF18 — Cópia de segurança e recuperação de dados
* **Classificação FURPS+:** Confiabilidade (Reliability)
* **Classificação Sommerville:** Requisito Organizacional (Operacional)
* **Descrição:** O sistema deve manter rotinas automatizadas de cópia de segurança do banco de dados, com retenção externa ao servidor de produção, e suportar processo documentado de restauração.
* **Métrica Verificável:** Perda máxima aceitável de 6 horas de dados (RPO) e restabelecimento operacional em até 8 horas (RTO), com ao menos um ensaio prático de restauração aprovado antes da homologação.

---

### Segurança e Privacidade

#### RNF03 — Segurança das comunicações e das sessões
* **Classificação FURPS+:** Funcionalidade / Segurança (Security)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve proteger as comunicações em trânsito, rejeitar requisições sem credenciais válidas e limitar a duração das sessões, inclusive a inatividade em aparelhos pessoais.
* **Métrica Verificável:** 100% do tráfego sob conexão cifrada (HTTPS/TLS); 100% de rejeição (HTTP 401) para requisições sem credenciais válidas; sessão expirada em até 8 h contínuas e em até 30 min de inatividade.

#### RNF04 — Controle de acesso por perfil
* **Classificação FURPS+:** Funcionalidade / Segurança (Security)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve restringir cada operação e cada dado ao perfil autorizado, conforme a matriz de perfis da seção 8.5.1.
* **Métrica Verificável:** 100% de bloqueio (HTTP 403) de requisições de escopo insuficiente e 0 acessos a dados nominais pelo perfil administrativo-financeiro em testes automatizados de rotas.

#### RNF05 — Minimização de dados pessoais
* **Classificação FURPS+:** Restrição de Design (+) / Segurança (Security)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O cadastro deve conter apenas identificação, contato e consentimentos, sem campos estruturados de dado pessoal sensível (LGPD, art. 5º, II).
* **Métrica Verificável:** 0 campos estruturados de dado sensível no esquema do banco de dados (revisão formal de esquema).

#### RNF06 — Prazo de atendimento à exclusão de dados
* **Classificação FURPS+:** Funcionalidade / Requisito Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O sistema deve executar a exclusão ou anonimização solicitada pelo titular em prazo regulamentar, com registro auditável (LGPD, art. 18).
* **Métrica Verificável:** 100% das solicitações atendidas em até 72 horas, medido pelo intervalo entre o protocolo e a efetivação na trilha de auditoria.

#### RNF10 — Descarte de dados pessoais no aparelho
* **Classificação FURPS+:** Segurança (Security)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve descartar os dados pessoais mantidos temporariamente no armazenamento local de dispositivos móveis pessoais (BYOD) imediatamente após a confirmação da sincronização com o servidor.
* **Métrica Verificável:** 0 registros nominais de participantes remanescentes no IndexedDB após a confirmação de envio em testes automatizados.

---

### Conformidade Legal (MROSC)

#### RNF07 — Retenção documental decenal
* **Classificação FURPS+:** Suportabilidade (Supportability) / Requisito Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O sistema deve assegurar a guarda ininterrupta e a integridade de relatórios homologados, listas de chamada e evidências pelo prazo legal (Lei 13.019/2014, art. 68).
* **Métrica Verificável:** Retenção configurada para no mínimo 10 anos a partir do dia útil seguinte à prestação de contas, com redundância de armazenamento e política de ciclo de vida ativa.

---

### Desempenho e Eficiência

#### RNF11 — Desempenho das consultas agregadas
* **Classificação FURPS+:** Desempenho (Performance)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** As consultas aos painéis de acompanhamento e listagens de projetos devem responder com agilidade sob picos de acesso concorrente.
* **Métrica Verificável:** Tempo de resposta inferior a 800 ms no percentil 95 (p95) sob carga de 50 requisições concorrentes por segundo, mantendo consumo de CPU do servidor abaixo de 75%.

#### RNF12 — Desempenho da inscrição pública
* **Classificação FURPS+:** Desempenho (Performance)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O formulário público de inscrição deve carregar rapidamente em navegadores móveis sob redes móveis com largura de banda restrita.
* **Métrica Verificável:** First Contentful Paint (FCP) inferior a 2,5 s em perfil simulado de rede 4G lenta, atestado por auditoria Lighthouse no pipeline de CI.

#### RNF13 — Desempenho da geração de relatórios
* **Classificação FURPS+:** Desempenho (Performance)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** A compilação e renderização do relatório oficial em PDF deve ocorrer de maneira assíncrona e performática, mesmo contendo elevado volume de imagens.
* **Métrica Verificável:** Arquivo PDF de até 50 páginas e 100 miniaturas disponível para download em menos de 5 segundos no percentil 95 (p95) em testes de carga.

#### RNF14 — Eficiência no envio de evidências
* **Classificação FURPS+:** Desempenho (Performance)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O cliente web deve comprimir fotos localmente antes do envio, otimizando o consumo da franquia de dados móveis do educador de campo.
* **Métrica Verificável:** Redução média mínima de 60% no peso das imagens de alta resolução e tempo de transmissão por imagem inferior a 4 s em conexão 4G padrão.

---

### Usabilidade, Portabilidade e Restrições

#### RNF15 — Usabilidade móvel e inclusiva
* **Classificação FURPS+:** Usabilidade (Usability)
* **Classificação Sommerville:** Requisito de Produto (Usabilidade)
* **Descrição:** As telas de campo e de inscrição pública devem ser ergonomicamente confortáveis em telas compactas, legíveis sob luz solar direta e acessíveis a pessoas com baixo letramento digital.
* **Métrica Verificável:** Áreas de toque de no mínimo 48x48 px; inexistência de rolagem horizontal a partir de 360 px de largura; conformidade com 100% dos critérios WCAG 2.1 nível AA aplicáveis; inscrição concluída em até 5 telas e 3 min por ao menos 4 de 5 pessoas do público-alvo em testes de usabilidade.

#### RNF16 — Compatibilidade entre navegadores e dispositivos
* **Classificação FURPS+:** Suportabilidade (Supportability)
* **Classificação Sommerville:** Requisito de Produto (Portabilidade)
* **Descrição:** O frontend deve garantir equivalência visual e operacional em dispositivos móveis e desktops nos navegadores modernos.
* **Métrica Verificável:** 0 quebras de layout ou falhas de script entre 360 px e 1920 px nos navegadores Chromium >= 120, Firefox >= 120 e WebKit/Safari >= 17, em testes de regressão visual.

#### RNF17 — Restrição tecnológica e qualidade de código
* **Classificação FURPS+:** Restrição de Implementação (+)
* **Classificação Sommerville:** Requisito Organizacional (Implementação)
* **Descrição:** A solução deve seguir rigorosamente a pilha tecnológica homologada no Documento de Visão, com compilação estrita e análise estática automatizada.
* **Métrica Verificável:** 0 erros de tipagem TypeScript no modo estrito (`strict: true`), 0 avisos no linter e 100% de sucesso no build de produção no GitHub Actions.

---

## 8.4 Matriz de Rastreabilidade Bidirecional

A rastreabilidade estabelece o vínculo bidirecional entre os problemas diagnosticados no fluxo atual (BPMN G01 a G06), os Objetivos Específicos (OEs), as Características de Produto (CP1 a CP8), os requisitos especificados e o plano de desenvolvimento da Sprint 1 (Histórias de Usuário e Critérios de Aceitação).

### 8.4.1 Matriz de Rastreabilidade dos Requisitos Funcionais (RFs)

#### CP1 — Gestão de Projetos e Metas (OE01; OE04)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História e Critério (Sprint 1) | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF01** | Cadastrar instrumento convocatório e parceria | G01 | MROSC art. 16 e 42 | HU-01 (pré-condição do CA-01.1) | Parcial |
| **RF02** | Cadastrar projeto operacional | G01 | — | HU-01 (pré-condição do CA-01.1) | Parcial |
| **RF03** | Desdobrar requisitos contratuais e metas | G01 | MROSC art. 22 e 42 | HU-01 (CA-01.1, CA-01.3) | Total |
| **RF04** | Atribuir responsável, setor e prazo a meta | G02 | Decisão 3 da ata de 08/09 | HU-02 (CA-02.1, CA-02.3) | Parcial |
| **RF05** | Exibir linha do tempo e painel de prazos de metas | G01, G02 | — | HU-02 (CA-02.1) | Total |
| **RF06** | Emitir alertas de proximidade de vencimento de metas | G02 | — | HU-02 (CA-02.2) | Total |

#### CP2 — Gestão de Atividades (OE01; OE04, OE06)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História e Critério (Sprint 1) | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF07** | Cadastrar atividade por modalidade de objeto | G03 | Seção 3.3.6 | HU-03 (CA-03.1) | Total |
| **RF08** | Parametrizar exigência de comprovação de presença | G03 | Seção 3.3.6 | HU-03 (CA-03.2, CA-03.3) | Total |

#### CP3 — Inscrição de Participantes (OE02; OE01)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História e Critério (Sprint 1) | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF09** | Disponibilizar formulário público de inscrição | G03, G04 | — | *Sem HU na Sprint 1* | Lacuna de história |
| **RF10** | Gerar QR Code de inscrição | — | — | *Sem HU na Sprint 1* | Lacuna de história |
| **RF11** | Registrar inscrição presencial assistida | — | Seção 3.3.10 | *Sem HU na Sprint 1* | Lacuna de história |
| **RF12** | Limitar vagas da atividade | — | — | *Sem HU na Sprint 1* | Lacuna de história |
| **RF13** | Ordenar lista de espera | — | — | *Sem HU na Sprint 1* | Lacuna de história |

#### CP4 — Registro de Participação em Campo (OE03; OE04)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História e Critério (Sprint 1) | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF14** | Registrar frequência em dispositivo móvel | G03 | — | *Sem HU na Sprint 1* | Lacuna de história |
| **RF15** | Operar registro de presença em modo offline | G03 | Seção 3.3.3 | *Sem HU na Sprint 1* | Lacuna de história |
| **RF16** | Sincronizar presenças com reconciliação idempotente | G03 | Seção 3.3.3 | *Sem HU na Sprint 1* | Lacuna de história |
| **RF17** | Registrar lançamento extemporâneo com justificativa | G03 | Seção 3.3.8 | *Sem HU na Sprint 1* | Lacuna de história |
| **RF18** | Apurar carga horária de participantes e facilitadores | G03 | — | *Sem HU na Sprint 1* | Lacuna de história |

#### CP5 — Cadastro e Histórico de Pessoas (OE01; OE03, OE06)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História e Critério (Sprint 1) | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF19** | Consultar histórico de participação | G04 | — | HU-06 (CA-06.1) | Total |
| **RF20** | Alertar cadastro duplicado | G04 | — | HU-06 (CA-06.2) | Total |
| **RF21** | Registrar consentimento de guarda de dados | G04 | LGPD art. 7º e 8º | HU-06 (CA-06.3) | Total |
| **RF22** | Registrar autorização de contato | G04 | Seção 3.3.5; LGPD art. 8º, §5º | HU-06 (restrição de conformidade) | Parcial |
| **RF23** | Registrar autorização de uso de imagem | — | Seção 3.3.4; LGPD art. 7º e 8º | HU-06 (restrição de conformidade) | Parcial |
| **RF24** | Retificar dados cadastrais | — | Seção 3.3.9; LGPD art. 18 | HU-06 (restrição de conformidade) | Parcial |
| **RF25** | Excluir ou anonimizar cadastro | — | Seção 3.3.9; LGPD art. 18 | HU-06 (restrição de conformidade) | Parcial |

#### CP6 — Acompanhamento Automático de Metas (OE04; OE01)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História e Critério (Sprint 1) | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF26** | Calcular progresso físico de metas em tempo real | G05 | — | HU-01 (CA-01.2); HU-05 (CA-05.1) | Total |
| **RF27** | Parametrizar apuração para metas não lineares e marcos | G05 | Seção 2.3 | *Sem HU na Sprint 1* | Lacuna de história |
| **RF28** | Emitir alertas de risco de inexecução | G05 | — | *Sem HU na Sprint 1* | Lacuna de história |
| **RF29** | Versionar metas por Termo Aditivo | G05 | MROSC art. 55 e 57 | *Sem HU na Sprint 1* | Lacuna de história |

#### CP7 — Repositório de Evidências e Documentação (OE05; OE06)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História e Critério (Sprint 1) | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF30** | Anexar evidências documentais e fotográficas | G03 | — | HU-04 (CA-04.1) | Total |
| **RF31** | Vincular evidência a meta contratual | G03 | — | HU-04 (CA-04.1, CA-04.3) | Parcial |
| **RF32** | Segregar acesso a fotos de beneficiários vulneráveis | G03 | Seção 3.3.4; LGPD; ECA | HU-04 (sem CA) | Parcial |

#### CP8 — Relatórios e Exportação de Dados (OE06; OE04, OE05)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História e Critério (Sprint 1) | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF33** | Exigir justificativa prévia para metas não atingidas | G06 | MROSC art. 64, §1º | HU-05 (CA-05.2) | Total |
| **RF34** | Emitir Relatório de Execução do Objeto | G06 | MROSC art. 63 a 66 | HU-05 (CA-05.1) | Total |
| **RF35** | Gerar relatório diagramado em PDF via servidor | G06 | Seção 2.4 | HU-05 (CA-05.3) | Total |
| **RF36** | Exportar dados consolidados em formato tabular aberto | G06 | MROSC art. 64 | HU-05 (CA-05.3) | Total |
| **RF37** | Registrar trilha de auditoria para retificações na prestação | G06 | — | HU-05 (sem CA) | Parcial |

---

### 8.4.2 Matriz de Rastreabilidade dos Requisitos Não Funcionais (RNFs)

| RNF | Propriedade de Qualidade | Origem (Decisão, Risco Ético ou Norma) | Requisitos Funcionais Relacionados |
| :--- | :--- | :--- | :--- |
| **RNF01** | Integridade transacional dos dados | HU-01 (CA-01.3) | RF03, RF16 |
| **RNF02** | Auditabilidade das alterações | Seção 3.3.9 | RF17, RF24, RF37 |
| **RNF03** | Segurança das comunicações e das sessões | Seções 3.3.1 e 3.3.2 | *Transversal (Todos os RFs)* |
| **RNF04** | Controle de acesso por perfil | Seção 3.5 (Matriz de Perfis) | RF32, RF19 a RF25 |
| **RNF05** | Minimização de dados pessoais | LGPD art. 5º, II; Restrição HU-06 | RF09, RF11, RF19 |
| **RNF06** | Prazo de atendimento à exclusão de dados | LGPD art. 18 | RF25 |
| **RNF07** | Retenção documental decenal | MROSC art. 68 | RF30, RF34 |
| **RNF08** | Integridade de relatórios fechados | MROSC art. 63 a 66 | RF33, RF34, RF35 |
| **RNF09** | Resiliência offline e sincronização sem duplicidade | Seção 3.3.3 | RF14 a RF17, RF30 |
| **RNF10** | Descarte de dados pessoais no aparelho | Seção 3.4 (BYOD) | RF15, RF30 |
| **RNF11** | Desempenho das consultas agregadas | OE04 | RF05, RF06, RF26 |
| **RNF12** | Desempenho da inscrição pública | OE02 | RF09, RF10 |
| **RNF13** | Desempenho da geração de relatórios | OE06 | RF34, RF35 |
| **RNF14** | Eficiência no envio de evidências | Seção 3.3.1 | RF30 |
| **RNF15** | Usabilidade móvel e inclusiva | Seção 3.3.10 | RF09, RF11, RF14 |
| **RNF16** | Compatibilidade entre navegadores e dispositivos | Seção 2.4 | *Transversal (Todos os RFs)* |
| **RNF17** | Restrição tecnológica e qualidade de código | Seção 2.4 | *Transversal (Todos os RFs)* |
| **RNF18** | Cópia de segurança e recuperação de dados | Seção 2.6 | *Transversal (Todos os RFs)* |

---

### 8.4.3 Síntese de Cobertura

#### Cobertura dos Gargalos do Modelo BPMN (B1)
| Gargalo | Descrição do Gargalo do Processo Atual | Requisitos Cobertos | Situação |
| :---: | :--- | :--- | :---: |
| **G01** | Destrinchamento manual de editais e instrumentos | RF01, RF02, RF03, RF05 | **Total** |
| **G02** | Demandas e prazos descentralizados sem responsável | RF04, RF05, RF06 | **Parcial** *(Gestão de chamados remetida à priorização)* |
| **G03** | Listas em papel, chamadas manuais e fotos dispersas | RF07 a RF18, RF30 a RF32 | **Total** |
| **G04** | Dados pessoais desprotegidos em celulares (LGPD) | RF09, RF19 a RF25 | **Total** |
| **G05** | Ausência de visão unificada para a Presidência | RF26 a RF29 | **Parcial** *(Painel executivo não validado)* |
| **G06** | Risco de glosa e insegurança na prestação de contas | RF33 a RF37 | **Total** |

#### Cobertura das Características de Produto (CPs) e Objetivos Específicos (OEs)
| CP | Nome da Característica | Requisitos | Objetivos Específicos |
| :---: | :--- | :---: | :--- |
| **CP1** | Gestão de projetos e metas | RF01 a RF06 | OE01; OE04 |
| **CP2** | Gestão de atividades | RF07, RF08 | OE01; OE04, OE06 |
| **CP3** | Inscrição de participantes | RF09 a RF13 | OE02; OE01 |
| **CP4** | Registro de participação em campo | RF14 a RF18 | OE03; OE04 |
| **CP5** | Cadastro e histórico de pessoas | RF19 a RF25 | OE01; OE03, OE06 |
| **CP6** | Acompanhamento automático de metas | RF26 a RF29 | OE04; OE01 |
| **CP7** | Repositório de evidências e documentação | RF30 a RF32 | OE05; OE06 |
| **CP8** | Relatórios e exportação de dados | RF33 a RF37 | OE06; OE04, OE05 |

---

## 8.5 Notas de Domínio e Perguntas-Chave Operacionais

### 8.5.1 Perfis de Acesso e Permissões (CP1 e Transversal)
Responde à divisão operacional de responsabilidades entre quem cria, edita ou apenas audita (base de atendimento ao RNF04):

| Perfil de Usuário | Instrumentos, Projetos e Metas | Dados Nominais de Participantes | Presença e Evidências | Relatórios Oficiais |
| :--- | :--- | :--- | :--- | :--- |
| **Presidência e Gestão de Projetos** | Cria, edita e reprograma | Sem acesso à base cadastral completa | Consulta consolidados | Gera e emite |
| **Núcleo Pedagógico e Educadores** | Consulta itens de suas atividades | Acessa fichas para mediação pedagógica | Registra e retifica | Consulta |
| **Administrativo-Financeiro** | Consulta | Bloqueado (apenas totais numéricos) | Consulta consolidados | Consulta |
| **Órgão Concedente e Auditoria** | Sem acesso direto | Sem acesso à base de pessoas | Evidências vinculadas à prestação | Acesso restrito ao período de análise |

* **Campos obrigatórios do instrumento:** Tipo de instrumento, órgão concedente, número do processo administrativo, valor global (R$), datas de celebração e de vigência, com anexo obrigatório do documento formal homologado em PDF (RF01).
* **Tratamento de metas descritivas:** Caso a meta seja qualitativa ou atrelada a marcos (*milestones*), o parâmetro quantitativo é facultativo e a forma documental de comprovação passa a ser o critério de verificação mandatório (RF03).

### 8.5.2 Campo, Presença e Evidências (CP2, CP4 e CP7)
* **Reconciliação e Unicidade Offline:** Cada marcação de presença gerada no cliente recebe um UUIDv4 imutável e vincula-se à chave composta lógica `(participante_id, oficina_sessao_id, data_evento)`. O backend processa o lote com semântica de *Append-Only* e cláusula `ON CONFLICT DO NOTHING`, evitando duplicidades no PostgreSQL mesmo sob retransmissões repetidas de sincronização.
* **Exigência Comprobatória por Modalidade:**
  * *Oficina continuada formativa:* Exige diário de classe digital com chamadas nominais auditáveis e carga horária apurada.
  * *Evento aberto ou Ação de acolhimento no SCS:* Exige fotografias panorâmicas georreferenciadas, contagem estimativa agregada de público e relatório simplificado do facilitador, dispensando exigência de CPF para preservar a inclusão.
* **Lançamentos Extemporâneos:** O sistema não bloqueia o envio tardio caso o educador fique impossibilitado de lançar no dia, mas submete o registro como extemporâneo (RF17), exigindo justificativa textual e retendo carimbo de data/hora para auditoria da coordenação pedagógica.

### 8.5.3 Apuração de Metas e Relatórios MROSC (CP6 e CP8)
* **Cálculo de Metas Não Lineares:**
  * *Metas quantitativas cumulativas:* Percentual aferido pela razão contínua entre volume realizado (soma de presenças ou horas) e o volume pactuado.
  * *Metas de marco único (milestones):* Percentual binário (0% enquanto pendente e 100% após a anexação e homologação da evidência formal pelo analista).
* **Tratamento de Termos Aditivos:** O sistema não sobrescreve os dados pactuados originalmente. Ao aprovar um Termo Aditivo, cria-se uma versão incremental do plano de trabalho, permitindo que o Relatório de Execução do Objeto apresente uma tabela comparativa com colunas dedicadas: *Meta Pactuada Original*, *Alteração (TA nº)*, *Meta Vigente Reprogramada* e *Percentual Cumprido*.
* **Bloqueio de Fechamento por Risco de Glosa:** A emissão de relatórios de acompanhamento é livre, mas o encerramento formal do ciclo de prestação de contas é bloqueado se houver metas incompletas sem justificativa técnica fundamentada previamente anexada, garantindo conformidade com o art. 64 da Lei 13.019/2014.

### 8.5.4 Inscrição, Pessoas e LGPD (CP3 e CP5)
* **Dados Mínimos Coletados:** Nome, telefone, data de nascimento (ou faixa etária) e consentimentos. CPF apenas quando o instrumento da parceria expressamente exigir. Nenhum dado sensível estruturado (RNF05).
* **Consentimento de Menores de Idade:** Para participantes com menos de 18 anos, o formulário registra os dados do responsável legal, que concede o consentimento formal nos termos do art. 14 da LGPD.
* **Independência da Autorização de Imagem:** A autorização para registro e divulgação de fotografias institucionais é colhida de forma separada e opcional (RF23). A eventual recusa pelo titular jamais condiciona ou impede sua inscrição ou participação na atividade.

---

## 8.6 Pontos em Aberto e Auditoria de Lacunas

1. **Lacunas de Histórias de Usuário na Sprint 1:** As características de inscrição pública (**CP3**, RF09 a RF13) e registro de presença em campo (**CP4**, RF14 a RF18), além das regras de apuração por marcos (RF27), alerta de ritmo (RF28) e termos aditivos (RF29), não foram cobertas pelas histórias da Sprint 1. Elas constituem o insumo prioritário para o planejamento da Sprint 2.
2. **Formato dos Critérios de Aceitação:** Em atendimento estrito à diretriz metodológica da disciplina (Issue #23), os critérios de aceitação pendentes (RF22 a RF25, RF32 e RF37) serão redigidos como listas determinísticas e verificáveis, abandonando definitivamente a sintaxe *Dado, Quando, Então*.
3. **Escopo dos Gargalos G02 e G05:** O controle interno de ordens de serviço/chamados (G02) e o painel estratégico consolidado da Presidência (G05) permanecem mapeados como oportunidades no BPMN, dependendo de validação de valor na dinâmica de priorização MoSCoW da Sprint 2.
4. **Parâmetros de Sessão e Campo (RNF03):** Manter sob observação durante os testes de campo se o encerramento automático por inatividade em 30 minutos não trará fricção operacional aos educadores durante oficinas de longa duração.
5. **Hipóteses a validar com o Instituto:** Validação presencial do fluxo de consentimento de responsáveis por menores (LGPD art. 14) e do nível de visualização da Presidência sobre dados cadastrais individualizados.

---

## 8.7 Correspondência entre Códigos Provisórios e Definitivos

A tabela a seguir registra a rastreabilidade entre os códigos provisórios utilizados nos PRs de insumo (#48, #50, #52) e os identificadores oficiais do catálogo consolidado:

### Requisitos Funcionais (RFs)
| Código Provisório | Código Definitivo | Nome do Requisito | Frente / Insumo de Origem |
| :---: | :---: | :--- | :---: |
| **RF01 a RF06** | **RF01 a RF06** | Gestão de Instrumentos e Metas da CP1 | Dupla B (PR #50 / Issue #39) |
| **RF-C01** | **RF07** | Cadastrar atividade por modalidade de objeto | Dupla C (PR #52 / Issue #40) |
| **RF-C02** | **RF08** | Parametrizar exigência de comprovação de presença | Dupla C (PR #52 / Issue #40) |
| **RF-P01** | **RF09** | Disponibilizar formulário público de inscrição | Dupla A (PR #48 / Issue #41) |
| **RF-P02** | **RF10** | Gerar QR Code de inscrição | Dupla A (PR #48 / Issue #41) |
| **RF-P03** | **RF11** | Registrar inscrição presencial assistida | Dupla A (PR #48 / Issue #41) |
| **RF-P04** | **RF12** | Limitar vagas da atividade | Dupla A (PR #48 / Issue #41) |
| **RF-P05** | **RF13** | Ordenar lista de espera | Dupla A (PR #48 / Issue #41) |
| **RF-C03** | **RF14** | Registrar frequência em dispositivo móvel | Dupla C (PR #52 / Issue #40) |
| **RF-C04** | **RF15** | Operar registro de presença em modo offline | Dupla C (PR #52 / Issue #40) |
| **RF-C05** | **RF16** | Sincronizar presenças com reconciliação idempotente | Dupla C (PR #52 / Issue #40) |
| **RF-C06** | **RF17** | Registrar lançamento extemporâneo com justificativa | Dupla C (PR #52 / Issue #40) |
| **RF-C07** | **RF18** | Apurar carga horária de participantes e facilitadores | Dupla C (PR #52 / Issue #40) |
| **RF-P06** | **RF19** | Consultar histórico de participação | Dupla A (PR #48 / Issue #41) |
| **RF-P07** | **RF20** | Alertar cadastro duplicado | Dupla A (PR #48 / Issue #41) |
| **RF-P08** | **RF21** | Registrar consentimento de guarda de dados | Dupla A (PR #48 / Issue #41) |
| **RF-P09** | **RF22** | Registrar autorização de contato | Dupla A (PR #48 / Issue #41) |
| **RF-P10** | **RF23** | Registrar autorização de uso de imagem | Dupla A (PR #48 / Issue #41) |
| **RF-P11** | **RF24** | Retificar dados cadastrais | Dupla A (PR #48 / Issue #41) |
| **RF-P12** | **RF25** | Excluir ou anonimizar cadastro | Dupla A (PR #48 / Issue #41) |
| **RF-R01** | **RF26** | Calcular progresso físico de metas em tempo real | Dupla C & B (PR #52 / Issue #42) |
| **RF-R02** | **RF27** | Parametrizar apuração para metas não lineares e marcos | Dupla C & B (PR #52 / Issue #42) |
| **RF-R03** | **RF28** | Emitir alertas de risco de inexecução | Dupla C & B (PR #52 / Issue #42) |
| **RF-R04** | **RF29** | Versionar metas por Termo Aditivo | Dupla C & B (PR #52 / Issue #42) |
| **RF-C08** | **RF30** | Anexar evidências documentais e fotográficas | Dupla C (PR #52 / Issue #40) |
| **RF-C09** | **RF31** | Vincular evidência a meta contratual | Dupla C (PR #52 / Issue #40) |
| **RF-C10** | **RF32** | Segregar acesso a fotos de beneficiários vulneráveis | Dupla C (PR #52 / Issue #40) |
| **RF-R05** | **RF33** | Exigir justificativa prévia para metas não atingidas | Dupla C & B (PR #52 / Issue #42) |
| **RF-R06** | **RF34** | Emitir Relatório de Execução do Objeto | Dupla C & B (PR #52 / Issue #42) |
| **RF-R07** | **RF35** | Gerar relatório diagramado em PDF via servidor | Dupla C & B (PR #52 / Issue #42) |
| **RF-R08** | **RF36** | Exportar dados consolidados em formato tabular aberto | Dupla C & B (PR #52 / Issue #42) |
| **RF-R09** | **RF37** | Registrar trilha de auditoria para retificações na prestação | Dupla C & B (PR #52 / Issue #42) |

### Requisitos Não Funcionais (RNFs)
| Código Provisório | Código Definitivo | Nome / Propriedade | Tratamento de Consolidação (PR #43 / Issue #43) |
| :---: | :---: | :--- | :--- |
| **RNF01 (#50)** | **RNF01** | Integridade transacional dos dados | Mantido; descrição generalizada sem amarra tecnológica |
| **RNF02 (#50)** | **RNF02** | Auditabilidade das alterações | Ampliado para cobrir retificações, extemporaneidade e relatórios |
| **RNF03 (#50) + RNF-P03** | **RNF03** | Segurança das comunicações e das sessões | Unifica HTTPS/TLS, sessão de 8 h e inatividade de 30 min |
| **RNF03 (#50) + RNF-P05** | **RNF04** | Controle de acesso por perfil | Unifica bloqueios HTTP 403 e a matriz de perfis da seção 8.5.1 |
| **RNF-P05 (#48)** | **RNF05** | Minimização de dados pessoais | Separado como regra de conformidade legal com a LGPD |
| **RNF-P02 (#48)** | **RNF06** | Prazo de atendimento à exclusão de dados | Mantido com prazo regulamentar de 72 h |
| **RNF-R01 (#52)** | **RNF07** | Retenção documental decenal | Mantido com prazo obrigatório de 10 anos (MROSC art. 68) |
| **RNF-R03 (#52)** | **RNF08** | Integridade de relatórios fechados | Mantido com validação determinística por hash SHA-256 |
| **RNF05 + RNF-C01 + C02** | **RNF09** | Resiliência offline e sincronização sem duplicidade | Três requisitos fundidos cobrindo IndexedDB e idempotência |
| **RNF-P03 (#48)** | **RNF10** | Descarte de dados pessoais no aparelho | Regra estrita de descarte de dados nominais em BYOD |
| **RNF04 (#50)** | **RNF11** | Desempenho das consultas agregadas | Mantido com métrica p95 < 800 ms sob 50 req/s |
| **RNF-P01 (#48)** | **RNF12** | Desempenho da inscrição pública | Mantido com métrica de FCP < 2,5 s no Lighthouse |
| **RNF-R02 (#52)** | **RNF13** | Desempenho da geração de relatórios | Mantido com métrica de compilação PDF < 5 s |
| **RNF-C04 (#52)** | **RNF14** | Eficiência no envio de evidências | Mantido com redução mínima de 60% e envio < 4 s |
| **RNF-C03 + RNF-P04** | **RNF15** | Usabilidade móvel e inclusiva | Unifica ergonomia de campo e formulário para baixo letramento |
| **RNF06 (#50)** | **RNF16** | Compatibilidade entre navegadores e dispositivos | Mantido com cobertura Chromium, Firefox e WebKit |
| **RNF07 (#50)** | **RNF17** | Restrição tecnológica e qualidade de código | Mantido com 0 erros de tipagem estrita no CI |
| **Documento de Visão 2.6** | **RNF18** | Cópia de segurança e recuperação de dados | Incorporado formalmente a partir das decisões de gestão |