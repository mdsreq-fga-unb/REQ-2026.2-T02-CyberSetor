# 8. Requisitos de software

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 19/09/2026 | 1.0 | Estruturação e publicação do catálogo oficial de requisitos funcionais, não funcionais e matriz de rastreabilidade bidirecional da Unidade 2 (Issue #45) | Dupla B (Rodrigo Henrique e Vinicius Vieira) |
| 20/09/2026 | 1.1 | Especificação e refinamento dos requisitos da CP1 (Issue #39), separação de alertas, alinhamento ao MROSC e matriz B1 | Dupla B (Rodrigo Henrique e Vinicius Vieira) |

---

## 8.1 Introdução Metodológica

A especificação de requisitos do sistema CyberSetor orienta-se pela abordagem ágil ScrumXP combinada aos preceitos da Engenharia de Requisitos contemporânea. A declaração e a taxonomia seguem as diretrizes metodológicas da disciplina (Marsicano, 2026), com requisitos funcionais orientados à ação e requisitos não funcionais fundamentados no modelo **FURPS+** e na taxonomia de **Ian Sommerville**.

A governança do catálogo adota:
* **Identificadores unívocos:** Códigos prefixados (`RFxx` e `RNFxx`) acompanhados de âncoras HTML explícitas para permitir rastreamento direto a partir de issues, histórias de usuário e matrizes.
* **Padronização verbal:** Todo requisito funcional inicia-se obrigatoriamente pela fórmula **Verbo no Infinitivo + Objeto Direto**, definindo o comportamento esperado sem ambiguidades de escopo.
* **Critérios verificáveis:** Todo requisito não funcional estabelece uma métrica quantitativa numérica, passível de verificação por testes automatizados ou inspeção determinística.

---

## 8.2 Lista de Requisitos Funcionais (RFs)

<a id="rf01"></a>
### RF01 — Cadastrar instrumento convocatório e parceria
* **Descrição:** Deve ser possível ao usuário com perfil de Diretoria de Projetos ou Presidência cadastrar instrumentos formais de parceria (termos de fomento, termos de colaboração, acordos de cooperação, convênios ou emendas parlamentares), registrando tipo de instrumento, órgão concedente/financiador, número do processo administrativo, valor global repassado, datas de celebração e de vigência contratual (início e término), com anexo obrigatório do documento homologado em formato PDF.
* **Rastreabilidade:** CP1 | OE01 | BPMN G01 | HU-01 | MROSC (Lei 13.019/2014, art. 16 e 42)

<a id="rf02"></a>
### RF02 — Cadastrar projeto operacional
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos cadastrar projetos operacionais vinculados a um instrumento convocatório ativo previamente cadastrado, registrando código de identificação, título, coordenador responsável e cronograma planejado de execução.
* **Rastreabilidade:** CP1 | OE01 | BPMN G01 | HU-01

<a id="rf03"></a>
### RF03 — Desdobrar requisitos contratuais e metas
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos desdobrar o plano de trabalho de um projeto em metas e requisitos contratuais auditáveis, registrando: origem normativa (edital, projeto ou Instituto), descrição da meta, indicador de desempenho associado, modalidade de aferição (quantitativa numérica ou qualitativa descritiva), parâmetro planejado (quando quantitativa), frequência de apuração e forma documental de comprovação/verificação (ex.: lista de presença assinada, relatório técnico, ata de reunião ou registro fotográfico).
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G01 | HU-01 | MROSC (Lei 13.019/2014, art. 22 e 42)

<a id="rf04"></a>
### RF04 — Atribuir responsável, setor e prazo a meta
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos vincular a cada meta cadastrada um titular responsável (dono da meta), um setor executor competente (Diretoria de Projetos, Administrativo-Financeiro, Núcleo Pedagógico ou Presidência) e uma data limite fatal para conclusão da entrega.
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G02 | HU-02

<a id="rf05"></a>
### RF05 — Exibir linha do tempo e painel de prazos de metas
* **Descrição:** Deve ser possível aos usuários autorizados consultar uma visualização consolidada em linha do tempo contendo a vigência dos instrumentos e a relação ordenada dos prazos fatais de entrega de todas as metas e requisitos de um projeto.
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G01, G02 | HU-02

<a id="rf06"></a>
### RF06 — Emitir alertas de proximidade de vencimento de metas
* **Descrição:** O sistema deve emitir notificações e alertas visuais destacados no painel do projeto quando o prazo fatal de uma meta estiver a 7 dias corridos ou menos do vencimento, ou quando a data limite já estiver expirada sem comprovação protocolada.
* **Rastreabilidade:** CP1 | OE04 | BPMN G02 | HU-02

<a id="rf07"></a>
### RF07 — Cadastrar atividade por modalidade de objeto
* **Descrição:** O sistema deve permitir o registro de atividades formativas e comunitárias classificadas por modalidade (oficina continuada, evento cultural aberto ou ação assistencial de acolhimento), parametrizando a exigência de lista de presença nominal ou contagem agregada de público.
* **Rastreabilidade:** CP2 | OE02 | BPMN G03 | HU-03

<a id="rf08"></a>
### RF08 — Registrar frequência e presenças em campo offline
* **Descrição:** O sistema deve disponibilizar interface móvel leve para registro de chamadas digitais de participantes no Setor Comercial Sul (SCS), operando sem conexão com a internet através de armazenamento local e sincronização idempotente posterior.
* **Rastreabilidade:** CP4 | OE02 | BPMN G03 | HU-03

<a id="rf09"></a>
### RF09 — Capturar e sincronizar evidências fotográficas
* **Descrição:** O sistema deve permitir a anexação de fotos e documentos comprobatórios diretamente vinculados à atividade e à meta contratual correspondente, capturando metadados de data, hora e geolocalização.
* **Rastreabilidade:** CP7 | OE02, OE04 | BPMN G03 | HU-04

<a id="rf10"></a>
### RF10 — Disponibilizar formulário público de inscrição
* **Descrição:** O sistema deve gerar formulários públicos acessíveis por navegador móvel e QR Code para captação de inscrições em oficinas e eventos abertos.
* **Rastreabilidade:** CP3 | OE02 | BPMN G04 | HU-06

<a id="rf11"></a>
### RF11 — Consultar histórico de atendimentos de pessoa
* **Descrição:** O sistema deve manter uma base única de participantes, permitindo ao núcleo pedagógico consultar o histórico de oficinas, frequências e certificações acumuladas por titular.
* **Rastreabilidade:** CP5 | OE01 | BPMN G04 | HU-06

<a id="rf12"></a>
### RF12 — Gerenciar consentimento e revogação de dados (LGPD)
* **Descrição:** O sistema deve registrar formalmente o consentimento digital para tratamento de dados cadastrais e uso de imagem institucional, provendo mecanismos de descadastramento (opt-out) e trilha de auditoria para retificações.
* **Rastreabilidade:** CP5 | OE01 | BPMN G04 | HU-06 | LGPD (Lei 13.709/2018, art. 7º e 18)

<a id="rf13"></a>
### RF13 — Apurar cumprimento de metas físicas em tempo real
* **Descrição:** O sistema deve computar automaticamente o progresso percentual e absoluto de cada meta contratual a partir da consolidação de frequências validadas e atividades executadas.
* **Rastreabilidade:** CP6 | OE01, OE04 | BPMN G05 | HU-05

<a id="rf14"></a>
### RF14 — Gerar relatório de execução do objeto para o MROSC
* **Descrição:** O sistema deve emitir o Relatório de Execução do Objeto em formato PDF e tabular, estruturado com dados de atingimento de metas, indicadores consolidados e índice ordenado de comprovações fotográficas.
* **Rastreabilidade:** CP8 | OE04 | BPMN G06 | HU-05 | MROSC (Lei 13.019/2014, art. 63 a 66)

<a id="rf15"></a>
### RF15 — Registrar justificativa operacional extemporânea
* **Descrição:** O sistema deve permitir o registro de justificativas técnicas para lançamentos de campo extemporâneos ou retificações de dados antes da homologação final do ciclo de prestação de contas.
* **Rastreabilidade:** CP8 | OE04 | BPMN G05, G06 | HU-05

---

## 8.3 Lista de Requisitos Não Funcionais (RNFs)

<a id="rnf01"></a>
### RNF01 — Integridade transacional e atomicidade de persistência
* **Classificação FURPS+:** Confiabilidade (Reliability)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade e Integridade)
* **Descrição:** A camada de persistência do sistema deve garantir as propriedades ACID (Atomicidade, Consistência, Isolamento e Durabilidade) em todas as operações de banco de dados compostas ou em lote, assegurando que falhas parciais de rede, travamento de processos ou violações de integridade referencial revertam o estado da base integralmente.
* **Métrica Verificável:** 100% de reversão (rollback) transacional automática em operações compostas que lancem exceções, com 0% de geração de registros órfãos ou inconsistentes no banco PostgreSQL/Prisma nos testes de integração automatizados.

<a id="rnf02"></a>
### RNF02 — Auditabilidade e imutabilidade de registros (Audit Trail)
* **Classificação FURPS+:** Confiabilidade (Reliability) / Segurança (Security)
* **Classificação Sommerville:** Requisito de Produto (Segurança e Integridade)
* **Descrição:** O sistema deve registrar eventos de mutação de dados (criação, alteração de estado e exclusão lógica) em uma trilha de auditoria técnica estruturada e protegida contra manipulação, persistindo identificador do usuário autenticado, endereço IP de origem, timestamp sincronizado via protocolo NTP e o diferencial dos dados alterados (payload diff).
* **Métrica Verificável:** 100% das operações de mutação registradas de forma síncrona em tabela append-only com retenção temporal, garantindo 0% de permissão de comandos UPDATE ou DELETE sobre a tabela de auditoria mesmo para credenciais de administrador da aplicação.

<a id="rnf03"></a>
### RNF03 — Segurança, criptografia e controle de acesso baseado em papéis
* **Classificação FURPS+:** Funcionalidade / Segurança (Security)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** A comunicação com o servidor deve ser integralmente cifrada em trânsito e o controle de autorização deve ser aplicado em nível de rotas e serviços através de tokens de sessão sem estado (stateless), segregando permissões de mutação e consulta por contexto criptográfico.
* **Métrica Verificável:** Tráfego restrito a conexões seguras sob protocolo HTTPS (TLS 1.3), com 100% de rejeição de requisições sem credenciais válidas com código HTTP 401 (Unauthorized) e 100% de bloqueio de acessos com escopo insuficiente com código HTTP 403 (Forbidden) nos testes de segurança de rotas; tokens JWT assinados via algoritmo HMAC-SHA256 ou RSA com tempo de expiração não superior a 8 horas.

<a id="rnf04"></a>
### RNF04 — Desempenho, latência e eficiência de consultas sob concorrência
* **Classificação FURPS+:** Desempenho (Performance)
* **Classificação Sommerville:** Requisito de Produto (Eficiência / Desempenho)
* **Descrição:** A arquitetura de APIs e as consultas ao banco de dados relacional devem ser otimizadas com indexação estratégica e paginação de dados para responder de maneira eficiente e sem degradação perceptível sob picos de acesso.
* **Métrica Verificável:** Tempo de resposta da API inferior a 800 ms sob o percentil 95 (p95) para rotas de agregação e listagens de dados sob carga de 50 requisições concorrentes por segundo, com consumo de CPU do servidor backend abaixo de 75% em testes de estresse com ferramentas de carga (ex.: k6).

<a id="rnf05"></a>
### RNF05 — Tolerância a falhas e sincronização idempotente offline-first
* **Classificação FURPS+:** Usabilidade (Usability) / Confiabilidade (Reliability)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade e Resiliência)
* **Descrição:** O módulo de coleta de presenças e evidências em campo deve manter capacidade operacional autônoma através de armazenamento local seguro (IndexedDB/Dexie.js), implementando mecanismo de fila assíncrona com reconciliação idempotente no restabelecimento de rede para evitar duplicações ou perdas de estado.
* **Métrica Verificável:** 0% de perda de registros ou colisão de identificadores na reconciliação de dados após restabelecimento de conexão em testes automatizados com simulação de interrupção de rede, utilizando chaves universais únicas (UUIDv4) e garantia de idempotência no backend.

<a id="rnf06"></a>
### RNF06 — Suportabilidade, portabilidade e responsividade cross-platform
* **Classificação FURPS+:** Suportabilidade (Supportability)
* **Classificação Sommerville:** Requisito de Produto (Portabilidade / Suportabilidade)
* **Descrição:** O frontend da aplicação deve aderir aos padrões W3C e manter paridade funcional e visual responsiva em telas compactas e desktops, assegurando interoperabilidade nos motores de renderização web modernos.
* **Métrica Verificável:** 0 falhas funcionais ou quebras estruturais de layout em resoluções de tela entre 360px e 1920px nos navegadores Chromium >= 120, Firefox >= 120 e WebKit/Safari >= 17, validadas via testes de regressão visual automatizados (ex.: Playwright).

<a id="rnf07"></a>
### RNF07 — Restrição tecnológica de arquitetura e conformidade estática de código
* **Classificação FURPS+:** Restrição de Implementação (+)
* **Classificação Sommerville:** Requisito de Processo / Restrição Tecnológica
* **Descrição:** A base de código do sistema deve obedecer estritamente à pilha homologada (NestJS e Prisma ORM no backend com PostgreSQL; Next.js e Tailwind CSS no frontend), respeitando regras de análise estática e compilação rigorosa sem conversões de tipo inseguras.
* **Métrica Verificável:** 0 erros de tipagem na execução do compilador TypeScript em modo estrito (strict: true), 0 avisos de violação nas diretrizes de formatação e análise estática (ESLint/Prettier), e 100% de sucesso nas etapas de compilação de produção dos contêineres Docker nos pipelines de Integração Contínua (CI).

---

## 8.4 Matriz de Rastreabilidade Bidirecional

A matriz integra os problemas operacionais mapeados no BPMN (G01 a G06), os Objetivos Específicos (OEs), as Características de Produto (CPs), os Requisitos Funcionais (RFs), os Requisitos Não Funcionais (RNFs) e as Histórias de Usuário da Sprint 1:

| Problema BPMN (Processo Atual) | Objetivo Específico | Característica (CP) | Requisitos Funcionais | Requisitos Não Funcionais | Backlog (HUs) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G01** (Destrinchamento manual de editais) | OE01, OE04 | CP1 — Gestão de projetos e metas | RF01, RF02, RF03, RF05 | RNF01, RNF02, RNF03, RNF04, RNF07 | HU-01, HU-02 |
| **G02** (Demandas descentralizadas e prazos) | OE01, OE04 | CP1 — Gestão de projetos e metas | RF04, RF05, RF06 | RNF01, RNF03, RNF04, RNF07 | HU-02 *(cobertura parcial / sem história de chamados)* |
| **G03** (Listas em papel e fotos) | OE02, OE04 | CP2 / CP4 / CP7 — Campo e Evidências | RF07, RF08, RF09 | RNF03, RNF05, RNF06, RNF07 | HU-03, HU-04 |
| **G04** (Contatos em celulares (LGPD)) | OE01, OE02 | CP3 / CP5 — Inscrição e Base Única | RF10, RF11, RF12 | RNF02, RNF03, RNF06, RNF07 | HU-06 |
| **G05** (Visão unificada para a Presidência) | OE01, OE04 | CP1 / CP6 — Gestão e Apuração | RF05, RF13 | RNF01, RNF04, RNF07 | *(cobertura parcial / candidato a sprint futura)* |
| **G06** (Risco de glosa na prestação de contas) | OE04 | CP8 — Relatórios e Prestação MROSC | RF14, RF15 | RNF01, RNF02, RNF04, RNF07 | HU-05 |