# 8. Requisitos de software

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 19/09/2026 | 1.0 | Estruturação e publicação do catálogo oficial de requisitos funcionais, não funcionais e matriz de rastreabilidade bidirecional da Unidade 2 (Issue #45) | Dupla B (Rodrigo Henrique e Vinicius Vieira) |

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
* **Descrição:** O sistema deve permitir que a Diretoria de Projetos cadastre parcerias e instrumentos de repasse (termos de fomento, colaboração, acordos de cooperação, convênios ou emendas parlamentares), registrando órgão concedente, número do processo administrativo, valor global, datas de celebração e vigência contratual, com anexo obrigatório do instrumento formal em PDF.
* **Rastreabilidade:** CP1 | OE01 | BPMN G01 | HU-01 | MROSC (Lei 13.019/2014, art. 16 e 42)

<a id="rf02"></a>
### RF02 — Cadastrar projeto operacional
* **Descrição:** O sistema deve permitir cadastrar projetos operacionais do Instituto vinculados a um instrumento convocatório ativo, armazenando código, título, equipe responsável e cronograma planejado.
* **Rastreabilidade:** CP1 | OE01 | BPMN G01 | HU-01

<a id="rf03"></a>
### RF03 — Desdobrar requisitos contratuais e metas
* **Descrição:** O sistema deve permitir o desdobramento do plano de trabalho em metas auditáveis, exigindo origem normativa, descrição, indicador de desempenho, forma de aferição (quantitativa numérica ou qualitativa descritiva), parâmetro planejado e frequência de apuração.
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G01 | HU-01 | MROSC (Lei 13.019/2014, art. 22 e 35)

<a id="rf04"></a>
### RF04 — Atribuir responsável, setor e prazo a meta
* **Descrição:** O sistema deve permitir a vinculação formal de um titular responsável, um setor executor competente e uma data limite fatal de entrega para cada meta contratual.
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G02 | HU-02

<a id="rf05"></a>
### RF05 — Emitir alertas preventivos e painel de prazos
* **Descrição:** O sistema deve consolidar uma linha do tempo das metas contratuais e sinalizar alertas graduados de proximidade de vencimento: regular (> 15 dias), preventivo (8 a 15 dias) e crítico (<= 7 dias ou em atraso).
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G01, G02 | HU-02

<a id="rf06"></a>
### RF06 — Cadastrar atividade por modalidade de objeto
* **Descrição:** O sistema deve permitir o registro de atividades formativas e comunitárias classificadas por modalidade (oficina continuada, evento cultural aberto ou ação assistencial de acolhimento), parametrizando a exigência de lista de presença nominal ou contagem agregada de público.
* **Rastreabilidade:** CP2 | OE02 | BPMN G03 | HU-03

<a id="rf07"></a>
### RF07 — Registrar frequência e presenças em campo offline
* **Descrição:** O sistema deve disponibilizar interface móvel leve para registro de chamadas digitais de participantes no Setor Comercial Sul (SCS), operando sem conexão com a internet através de armazenamento local e sincronização idempotente posterior.
* **Rastreabilidade:** CP4 | OE02 | BPMN G04 | HU-03

<a id="rf08"></a>
### RF08 — Capturar e sincronizar evidências fotográficas
* **Descrição:** O sistema deve permitir a anexação de fotos e documentos comprobatórios diretamente vinculados à atividade e à meta contratual correspondente, capturando metadados de data, hora e geolocalização.
* **Rastreabilidade:** CP7 | OE02, OE04 | BPMN G04 | HU-04

<a id="rf09"></a>
### RF09 — Disponibilizar formulário público de inscrição
* **Descrição:** O sistema deve gerar formulários públicos acessíveis por navegador móvel e QR Code para captação de inscrições em oficinas e eventos abertos.
* **Rastreabilidade:** CP3 | OE02 | BPMN G03 | HU-06

<a id="rf10"></a>
### RF10 — Consultar histórico de atendimentos de pessoa
* **Descrição:** O sistema deve manter uma base única de participantes, permitindo ao núcleo pedagógico consultar o histórico de oficinas, frequências e certificações acumuladas por titular.
* **Rastreabilidade:** CP5 | OE03 | BPMN G03 | HU-06

<a id="rf11"></a>
### RF11 — Gerenciar consentimento e revogação de dados (LGPD)
* **Descrição:** O sistema deve registrar formalmente o consentimento digital para tratamento de dados cadastrais e uso de imagem institucional, provendo mecanismos de descadastramento (opt-out) e trilha de auditoria para retificações.
* **Rastreabilidade:** CP5 | OE03 | BPMN G03 | HU-06 | LGPD (Lei 13.709/2018, art. 7º e 18)

<a id="rf12"></a>
### RF12 — Apurar cumprimento de metas físicas em tempo real
* **Descrição:** O sistema deve computar automaticamente o progresso percentual e absoluto de cada meta contratual a partir da consolidação de frequências validadas e atividades executadas.
* **Rastreabilidade:** CP6 | OE01, OE04 | BPMN G05 | HU-05

<a id="rf13"></a>
### RF13 — Gerar relatório de execução do objeto para o MROSC
* **Descrição:** O sistema deve emitir o Relatório de Execução do Objeto em formato PDF e tabular, estruturado com dados de atingimento de metas, indicadores consolidados e índice ordenado de comprovações fotográficas.
* **Rastreabilidade:** CP8 | OE04 | BPMN G06 | HU-05 | MROSC (Lei 13.019/2014, art. 63 a 66)

<a id="rf14"></a>
### RF14 — Registrar justificativa operacional extemporânea
* **Descrição:** O sistema deve permitir o registro de justificativas técnicas para lançamentos de campo extemporâneos ou retificações de dados antes da homologação final do ciclo de prestação de contas.
* **Rastreabilidade:** CP8 | OE04 | BPMN G05, G06 | HU-05

---

## 8.3 Lista de Requisitos Não Funcionais (RNFs)

<a id="rnf01"></a>
### RNF01 — Integridade cadastral do plano de trabalho
* **Classificação FURPS+:** Confiabilidade (*Reliability*) / Restrição de Design (+)
* **Classificação Sommerville:** Requisito de Produto (Integridade e Confiabilidade)
* **Descrição:** O sistema deve impedir o salvamento no banco de dados de qualquer meta ou requisito sem indicador, forma de comprovação e prazo fatal.
* **Métrica Verificável:** 100% de rejeição com código HTTP 422 em submissões com dados obrigatórios ausentes nos testes automatizados de integração.

<a id="rnf02"></a>
### RNF02 — Conformidade legal com o MROSC
* **Classificação FURPS+:** Suportabilidade (*Supportability*) / Requisito Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo / Regulatório)
* **Descrição:** O modelo de dados deve refletir as modalidades contratuais e campos formais do Marco Regulatório das Organizações da Sociedade Civil.
* **Métrica Verificável:** 100% de compatibilidade entre as tabelas do banco de dados e os campos obrigatórios do art. 35 da Lei 13.019/2014.

<a id="rnf03"></a>
### RNF03 — Segurança e controle de acesso baseado em papéis (RBAC)
* **Classificação FURPS+:** Funcionalidade / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve isolar dados pessoais e restringir operações administrativas: perfis operacionais de campo e financeiro não acessam dados nominais ou privilégios de escrita de projetos.
* **Métrica Verificável:** 100% de bloqueio de requisições não autorizadas com retorno HTTP 403 nos testes de segurança de rotas.

<a id="rnf04"></a>
### RNF04 — Disponibilidade e resiliência offline em campo
* **Classificação FURPS+:** Usabilidade (*Usability*) / Confiabilidade (*Reliability*)
* **Classificação Sommerville:** Requisito de Produto (Usabilidade e Confiabilidade)
* **Descrição:** A interface de chamada e coleta de presença deve permitir operação contínua sem conexão ativa de dados no Setor Comercial Sul.
* **Métrica Verificável:** 0% de perda de registros de frequência após desconexão da rede e sincronização posterior com reconciliação idempotente.

<a id="rnf05"></a>
### RNF05 — Desempenho e latência de consultas agregadas
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência / Desempenho)
* **Descrição:** A consulta do painel consolidado de metas e projetos simultâneos deve responder de maneira ágil para a gestão executiva.
* **Métrica Verificável:** Tempo de resposta inferior a 1,2 s para uma base de 50 projetos e 2.000 metas sob percentil 95 nos testes de carga.

<a id="rnf06"></a>
### RNF06 — Restrição de implementação e arquitetura
* **Classificação FURPS+:** Restrição de Implementação (+)
* **Classificação Sommerville:** Requisito de Produto (Restrição Tecnológica)
* **Descrição:** A solução deve ser implementada com backend em NestJS e Prisma ORM, banco de dados relacional PostgreSQL, e frontend em Next.js com Tailwind CSS, consumindo APIs RESTful.
* **Métrica Verificável:** Validação estrita no pipeline de Integração Contínua com build de produção e 0 erros de tipagem estática TypeScript.

---

## 8.4 Matriz de Rastreabilidade Bidirecional

A matriz integra os problemas operacionais mapeados no BPMN (G01 a G06), os Objetivos Específicos (OEs), as Características de Produto (CPs), os Requisitos Funcionais (RFs), os Requisitos Não Funcionais (RNFs) e as Histórias de Usuário da Sprint 1:

| Problema BPMN | Objetivo Específico | Característica (CP) | Requisitos Funcionais | Requisitos Não Funcionais | Backlog (HUs) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G01** (Destrinchamento manual de editais) | OE01, OE04 | CP1 — Gestão de projetos e metas | RF01, RF02, RF03, RF05 | RNF01, RNF02, RNF05, RNF06 | HU-01, HU-02 |
| **G02** (Demandas descentralizadas e prazos) | OE01, OE04 | CP1 — Gestão de projetos e metas | RF04, RF05 | RNF01, RNF03, RNF05, RNF06 | HU-02 |
| **G03** (Inscrições avulsas e falta de base) | OE02, OE03 | CP3 / CP5 — Inscrição e Base Única | RF09, RF10, RF11 | RNF03, RNF06 | HU-06 |
| **G04** (Listas em papel e fotos dispersas) | OE02, OE04 | CP2 / CP4 / CP7 — Campo e Evidências | RF06, RF07, RF08 | RNF03, RNF04, RNF06 | HU-03, HU-04 |
| **G05** (Descompasso físico vs. financeiro) | OE01, OE04 | CP6 — Apuração de Metas | RF12, RF14 | RNF01, RNF05, RNF06 | HU-05 |
| **G06** (Consolidação manual exaustiva MROSC) | OE04 | CP8 — Relatórios e Prestação MROSC | RF13, RF14 | RNF02, RNF05, RNF06 | HU-05 |