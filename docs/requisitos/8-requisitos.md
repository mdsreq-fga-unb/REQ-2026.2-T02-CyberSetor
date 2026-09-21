# 8. Requisitos de software

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 19/09/2026 | 1.0 | Estruturação e publicação do catálogo oficial de requisitos funcionais, não funcionais e matriz de rastreabilidade bidirecional da Unidade 2 (Issue #45) | Dupla B (Rodrigo Henrique e Vinicius Vieira) |
| 20/09/2026 | 1.1 | Especificação e refinamento dos requisitos da CP1 (Issue #39), separação de alertas, alinhamento ao MROSC e matriz B1 | Dupla B (Rodrigo Henrique e Vinicius Vieira) |
| 21/09/2026 | 1.2 | Consolidação da numeração única (RF01 a RF37 e RNF01 a RNF18) com os requisitos das Issues #39 a #43, correção de objetivos específicos e das notas de domínio | Maria Eduarda Marques, a partir dos PRs #48, #50, #52 e #53 |

---

## 8.1 Introdução Metodológica

A especificação de requisitos do sistema CyberSetor orienta-se pela abordagem ágil ScrumXP combinada aos preceitos da Engenharia de Requisitos contemporânea. A declaração e a taxonomia seguem as diretrizes metodológicas da disciplina (Marsicano, 2026), com requisitos funcionais orientados à ação e requisitos não funcionais fundamentados no modelo **FURPS+** e na taxonomia de **Ian Sommerville**.

A governança do catálogo adota:
* **Identificadores unívocos:** Códigos prefixados (`RFxx` e `RNFxx`) em sequência única e contínua, acompanhados de âncoras HTML explícitas para permitir rastreamento direto a partir de issues, histórias de usuário e matrizes. Os RFs seguem a ordem das Características de Produto (CP1 a CP8).
* **Padronização verbal:** Todo requisito funcional tem nome no formato **Verbo no Infinitivo + Objeto Direto**, definindo uma única ação verificável, sem ambiguidades de escopo.
* **Critérios verificáveis:** Todo requisito não funcional estabelece uma métrica quantitativa numérica, passível de verificação por testes automatizados ou inspeção determinística.

---

## 8.2 Lista de Requisitos Funcionais (RFs)


### CP1 — Gestão de projetos e metas

<a id="rf01"></a>
#### RF01 — Cadastrar instrumento convocatório e parceria
* **Descrição:** Deve ser possível ao usuário com perfil de Diretoria de Projetos ou Presidência cadastrar instrumentos formais de parceria (termos de fomento, termos de colaboração, acordos de cooperação, convênios ou emendas parlamentares), registrando tipo de instrumento, órgão concedente/financiador, número do processo administrativo, valor global repassado, datas de celebração e de vigência contratual (início e término), com anexo obrigatório do documento homologado em formato PDF.
* **Rastreabilidade:** CP1 | OE01 | BPMN G01 | HU-01 | MROSC (Lei 13.019/2014, art. 16 e 42)

<a id="rf02"></a>
#### RF02 — Cadastrar projeto operacional
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos cadastrar projetos operacionais vinculados a um instrumento convocatório ativo previamente cadastrado, registrando código de identificação, título, coordenador responsável e cronograma planejado de execução.
* **Rastreabilidade:** CP1 | OE01 | BPMN G01 | HU-01

<a id="rf03"></a>
#### RF03 — Desdobrar requisitos contratuais e metas
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos desdobrar o plano de trabalho de um projeto em metas e requisitos contratuais auditáveis, registrando: origem normativa (edital, projeto ou Instituto), descrição da meta, indicador de desempenho associado, modalidade de aferição (quantitativa numérica ou qualitativa descritiva), parâmetro planejado (quando quantitativa), frequência de apuração e forma documental de comprovação/verificação (ex.: lista de presença assinada, relatório técnico, ata de reunião ou registro fotográfico).
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G01 | HU-01 | MROSC (Lei 13.019/2014, art. 22 e 42)

<a id="rf04"></a>
#### RF04 — Atribuir responsável, setor e prazo a meta
* **Descrição:** Deve ser possível ao usuário da Diretoria de Projetos vincular a cada meta cadastrada um titular responsável (dono da meta), um setor executor competente (Diretoria de Projetos, Administrativo-Financeiro, Núcleo Pedagógico ou Presidência) e uma data limite fatal para conclusão da entrega. O sistema deve registrar a situação da meta (pendente, em andamento ou concluída) e sinalizar no painel do projeto as metas ainda sem responsável atribuído.
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G02 | HU-02 (CA-02.1, CA-02.3) | Ata de 08/09, decisão 3

<a id="rf05"></a>
#### RF05 — Exibir linha do tempo e painel de prazos de metas
* **Descrição:** Deve ser possível aos usuários autorizados consultar uma visualização consolidada em linha do tempo contendo a vigência dos instrumentos e a relação ordenada dos prazos fatais de entrega de todas as metas e requisitos de um projeto.
* **Rastreabilidade:** CP1 | OE01, OE04 | BPMN G01, G02 | HU-02

<a id="rf06"></a>
#### RF06 — Emitir alertas de proximidade de vencimento de metas
* **Descrição:** O sistema deve emitir notificações e alertas visuais destacados no painel do projeto quando o prazo fatal de uma meta estiver a 7 dias corridos ou menos do vencimento, ou quando a data limite já estiver expirada sem comprovação protocolada.
* **Rastreabilidade:** CP1 | OE04 | BPMN G02 | HU-02


### CP2 — Gestão de atividades

<a id="rf07"></a>
#### RF07 — Cadastrar atividade por modalidade de objeto
* **Descrição:** Deve ser possível ao usuário da equipe de projetos ou coordenação pedagógica cadastrar atividades vinculadas a um projeto, classificando a modalidade em: *Oficina Contínua*, *Evento Aberto* ou *Ação de Acolhimento Comunitário*, configurando número de vagas planejadas, carga horária prevista, facilitador responsável, local de realização, datas e parâmetros de recorrência de turmas.
* **Rastreabilidade:** CP2 | OE01, OE04 | BPMN G03 | HU-03

<a id="rf08"></a>
#### RF08 — Parametrizar exigência de comprovação de presença
* **Descrição:** O sistema deve parametrizar as regras de comprovação de acordo com a modalidade da atividade: exigindo *chamada nominal* com controle de assiduidade para oficinas formativas contínuas, ou *contagem quantitativa agregada e anônima* de público para ações de acolhimento e eventos de rua no Setor Comercial Sul (SCS), dispensando a obrigatoriedade de CPF nestas últimas.
* **Rastreabilidade:** CP2 | OE01, OE04 | Seção 3.3.6 | BPMN G03 | HU-03


### CP3 — Inscrição de participantes

<a id="rf09"></a>
#### RF09 — Disponibilizar formulário público de inscrição
* **Descrição:** O sistema deve permitir que o interessado se inscreva em oficina ou evento por formulário público acessível em navegador móvel, sem criar conta nem senha.
* **Rastreabilidade:** CP3 | OE02 | G03, G04 | sem HU (candidato a nova história)

<a id="rf10"></a>
#### RF10 — Gerar QR Code de inscrição
* **Descrição:** O sistema deve permitir que o usuário gere, para cada atividade, um link e um QR Code que abrem o formulário público de inscrição, para divulgação em cartazes e redes.
* **Rastreabilidade:** CP3 | OE02 | sem HU (candidato a nova história)

<a id="rf11"></a>
#### RF11 — Registrar inscrição presencial assistida
* **Descrição:** O sistema deve permitir que o educador ou o recepcionista inscreva uma pessoa em seu nome, sem que ela precise de celular ou de internet.
* **Rastreabilidade:** CP3 | OE02 | Seção 3.3.10 | sem HU (candidato a nova história)

<a id="rf12"></a>
#### RF12 — Limitar vagas da atividade
* **Descrição:** O sistema deve bloquear novas inscrições confirmadas quando o número de vagas definido para a atividade for atingido.
* **Rastreabilidade:** CP3 | OE01, OE02 | sem HU (candidato a nova história)

<a id="rf13"></a>
#### RF13 — Ordenar lista de espera
* **Descrição:** O sistema deve registrar as inscrições feitas após o esgotamento das vagas em uma fila de espera ordenada pelo momento da inscrição.
* **Rastreabilidade:** CP3 | OE01, OE02 | sem HU (candidato a nova história)


### CP4 — Registro de participação em campo

<a id="rf14"></a>
#### RF14 — Registrar frequência em dispositivo móvel
* **Descrição:** Deve ser possível ao educador ou facilitador de campo realizar a chamada digital diretamente no smartphone (*BYOD*), fornecendo interface otimizada para marcação rápida de presença/ausência individual dos participantes matriculados ou confirmação em lote.
* **Rastreabilidade:** CP4 | OE03, OE04 | BPMN G03 | sem HU (candidato a nova história)

<a id="rf15"></a>
#### RF15 — Operar registro de presença em modo offline
* **Descrição:** O sistema deve permitir o registro e a consulta de chamadas de oficinas mesmo na ausência completa de conexão com a internet no SCS, persistindo todos os dados de marcação no armazenamento local seguro do dispositivo cliente e gerenciando uma fila local de eventos pendentes de sincronização.
* **Rastreabilidade:** CP4 | OE03, OE04 | Seção 3.3.3 | BPMN G03 | sem HU (candidato a nova história)

<a id="rf16"></a>
#### RF16 — Sincronizar presenças com reconciliação idempotente
* **Descrição:** O sistema deve sincronizar automaticamente a fila local de presenças com o servidor assim que a conectividade for restabelecida, utilizando identificadores exclusivos gerados no dispositivo cliente e garantindo que submissões repetidas do mesmo lote não gerem registros duplicados de presença na base de dados central.
* **Rastreabilidade:** CP4 | OE03, OE04 | Seção 3.3.3 | BPMN G03 | sem HU (candidato a nova história)

<a id="rf17"></a>
#### RF17 — Registrar lançamento extemporâneo com justificativa
* **Descrição:** Deve ser possível ao educador ou à coordenação pedagógica lançar ou retificar chamadas após a data de realização da atividade, exigindo obrigatoriamente o preenchimento de justificativa textual fundamentada e registrando autor, data, hora e motivo na trilha de auditoria.
* **Rastreabilidade:** CP4 | OE03, OE04 | Seção 3.3.8 | BPMN G03 | sem HU (candidato a nova história)

<a id="rf18"></a>
#### RF18 — Apurar carga horária de participantes e facilitadores
* **Descrição:** O sistema deve calcular e acumular automaticamente o total de horas de participação efetiva de cada beneficiário e o total de horas de atividades ministradas por facilitador ou educador em cada oficina ou ciclo do projeto.
* **Rastreabilidade:** CP4 | OE03, OE04 | BPMN G03 | sem HU (candidato a nova história)


### CP5 — Cadastro e histórico de pessoas

<a id="rf19"></a>
#### RF19 — Consultar histórico de participação
* **Descrição:** O sistema deve permitir que o núcleo pedagógico consulte a ficha única de uma pessoa, com as oficinas e os eventos de que participou em diferentes projetos ao longo do tempo.
* **Rastreabilidade:** CP5 | OE01 | G04 | HU-06

<a id="rf20"></a>
#### RF20 — Alertar cadastro duplicado
* **Descrição:** O sistema deve alertar o usuário, no ato do cadastro, quando nome e telefone coincidirem com os de uma pessoa já cadastrada, permitindo reaproveitar o registro existente.
* **Rastreabilidade:** CP5 | OE01 | G04 | HU-06 (CA-06.2)

<a id="rf21"></a>
#### RF21 — Registrar consentimento de guarda de dados
* **Descrição:** O sistema deve registrar, com data e hora, o consentimento da pessoa (ou de seu responsável legal, se menor) para a guarda de seus dados cadastrais, como condição para concluir a inscrição.
* **Rastreabilidade:** CP5 | OE01 | G04 | LGPD art. 7º e 8º | HU-06 (CA-06.3)

<a id="rf22"></a>
#### RF22 — Registrar autorização de contato
* **Descrição:** O sistema deve registrar, de forma opcional e separada do consentimento cadastral, a autorização da pessoa para receber informes sobre futuras atividades, permitindo revogá-la (*opt-out*) a qualquer momento.
* **Rastreabilidade:** CP5 | OE01 | G04 | Seção 3.3.5 | LGPD art. 8º, §5º | HU-06

<a id="rf23"></a>
#### RF23 — Registrar autorização de uso de imagem
* **Descrição:** O sistema deve registrar, de forma separada do consentimento cadastral, a autorização ou a recusa da pessoa para fotografias institucionais, sem que a recusa impeça a inscrição ou a participação.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.4 | LGPD art. 7º e 8º | HU-06

<a id="rf24"></a>
#### RF24 — Retificar dados cadastrais
* **Descrição:** O sistema deve permitir que a Coordenação Pedagógica corrija dados de uma pessoa a pedido do titular, registrando autor, data, hora e justificativa de cada alteração.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.9 | LGPD art. 18, III | HU-06

<a id="rf25"></a>
#### RF25 — Excluir ou anonimizar cadastro
* **Descrição:** O sistema deve permitir que a Coordenação Pedagógica exclua ou anonimize o cadastro de uma pessoa a pedido do titular, preservando os totais agregados já reportados a financiadores.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.9 | LGPD art. 18, IV e VI | HU-06


### CP6 — Acompanhamento automático de metas

<a id="rf26"></a>
#### RF26 — Calcular progresso físico de metas em tempo real
* **Descrição:** O sistema deve calcular automaticamente o progresso quantitativo e o percentual de atingimento de cada meta contratual a partir da consolidação contínua das presenças validadas em oficinas, eventos comunitários realizados e evidências documentais homologadas.
* **Rastreabilidade:** CP6 | OE01, OE04 | BPMN G05 | HU-01 (CA-01.2), HU-05 (CA-05.1)

<a id="rf27"></a>
#### RF27 — Parametrizar apuração para metas não lineares e marcos
* **Descrição:** Deve ser possível ao analista de projetos parametrizar regras de apuração distintas conforme o indicador da meta: cálculo contínuo acumulativo (soma de horas de oficina ou público atendido) ou apuração binária por marco de entrega (*milestone*, ex.: publicação de diagnóstico ou realização de festival único).
* **Rastreabilidade:** CP6 | OE04 | Seção 2.3 | BPMN G05 | sem HU (candidato a nova história)

<a id="rf28"></a>
#### RF28 — Emitir alertas de risco de inexecução
* **Descrição:** O sistema deve emitir avisos visuais destacados no painel de gestão quando o ritmo de execução de uma meta estiver abaixo do cronograma planejado, permitindo à equipe de projetos antecipar medidas corretivas ou a solicitação de Termo Aditivo. Os alertas de proximidade do prazo fatal são tratados no RF06.
* **Rastreabilidade:** CP6 | OE04 | BPMN G05 | sem HU (candidato a nova história)

<a id="rf29"></a>
#### RF29 — Versionar metas por Termo Aditivo
* **Descrição:** O sistema deve registrar repactuações de prazos, remanejamentos de recursos ou alterações quantitativas de metas decorrentes de Termos Aditivos, mantendo o histórico da pactuação original e exibindo comparativo (*Previsto Original* vs. *Reprogramado* vs. *Realizado*).
* **Rastreabilidade:** CP6 | OE04 | BPMN G05 | Lei 13.019/2014, art. 55 e 57 | sem HU (candidato a nova história)


### CP7 — Repositório de evidências e documentação

<a id="rf30"></a>
#### RF30 — Anexar evidências documentais e fotográficas
* **Descrição:** Deve ser possível ao usuário realizar o upload de arquivos comprobatórios de realização de atividades (registros fotográficos, listas físicas digitalizadas e atas de realização), extraindo e registrando automaticamente metadados técnicos de data, hora e georreferenciamento (quando disponível).
* **Rastreabilidade:** CP7 | OE05, OE06 | BPMN G03 | HU-04

<a id="rf31"></a>
#### RF31 — Vincular evidência a meta contratual
* **Descrição:** O sistema deve exigir que cada documento ou imagem anexada seja expressamente vinculado a uma atividade executada e a uma ou mais metas do plano de trabalho correspondente, integrando o índice de comprovação do projeto. O sistema deve exibir, em cada meta, as evidências já anexadas e as que ainda faltam conforme o tipo de objeto da atividade.
* **Rastreabilidade:** CP7 | OE05, OE06 | BPMN G03 | HU-04 (CA-04.1, CA-04.2, CA-04.3)

<a id="rf32"></a>
#### RF32 — Segregar acesso a fotos de beneficiários vulneráveis
* **Descrição:** O sistema deve aplicar controle de acesso estrito aos arquivos fotográficos que contenham registros de participantes em vulnerabilidade social, restringindo a visualização aos perfis de coordenação e prestação de contas e orientando o enquadramento panorâmico sem closes faciais no momento da captura.
* **Rastreabilidade:** CP7 | OE05, OE06 | Seção 3.3.4 | LGPD (Lei 13.709/2018) | ECA (Lei 8.069/1990) | HU-04


### CP8 — Relatórios e exportação de dados

<a id="rf33"></a>
#### RF33 — Exigir justificativa prévia para metas não atingidas
* **Descrição:** O sistema deve validar a completude do plano de trabalho e bloquear a finalização e fechamento do ciclo de prestação de contas de qualquer meta que apresente cumprimento parcial ou inexecução física sem que haja justificativa técnica fundamentada previamente registrada pelo analista responsável.
* **Rastreabilidade:** CP8 | OE04, OE06 | BPMN G06 | Lei 13.019/2014, art. 64, §1º | HU-05

<a id="rf34"></a>
#### RF34 — Emitir Relatório de Execução do Objeto
* **Descrição:** Deve ser possível ao analista de projetos ou coordenador gerar o Relatório de Execução do Objeto oficial por projeto e período selecionado, consolidando indicadores pactuados vs. atingidos, justificativas técnicas registradas e índice ordenado de comprovações fotográficas e documentais.
* **Rastreabilidade:** CP8 | OE04, OE06 | BPMN G06 | Lei 13.019/2014, art. 63 a 66 | HU-05

<a id="rf35"></a>
#### RF35 — Gerar relatório diagramado em PDF via servidor
* **Descrição:** O sistema deve compilar e renderizar no servidor o Relatório de Execução do Objeto diagramado em formato PDF padronizado, contendo cabeçalho institucional, sumário executivo, tabelas de metas, justificativas e miniaturas das evidências anexadas com seus metadados.
* **Rastreabilidade:** CP8 | OE06 | Seção 2.4 | HU-05

<a id="rf36"></a>
#### RF36 — Exportar dados consolidados em formato tabular aberto
* **Descrição:** Deve ser possível ao usuário exportar os dados analíticos de execução do projeto, frequências de atividades e status de metas em formato aberto e interoperável (CSV), viabilizando conferências internas e auditorias externas independentes.
* **Rastreabilidade:** CP8 | OE06 | Lei 13.019/2014, art. 64 | HU-05

<a id="rf37"></a>
#### RF37 — Registrar trilha de auditoria para retificações na prestação
* **Descrição:** O sistema deve registrar em trilha de auditoria permanente qualquer retificação de dados, inserção de justificativas extemporâneas ou emissão de relatórios oficiais que impactem a prestação de contas, persistindo usuário autenticado, carimbo de data/hora e valores anteriores e posteriores.
* **Rastreabilidade:** CP8 | OE04 | BPMN G06 | HU-05


---

## 8.3 Lista de Requisitos Não Funcionais (RNFs)

<a id="rnf01"></a>
### RNF01 — Integridade transacional dos dados
* **Classificação FURPS+:** Confiabilidade (*Reliability*)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade)
* **Descrição:** O sistema deve garantir que operações compostas sejam concluídas por inteiro ou revertidas por inteiro, sem deixar registros parciais em caso de falha.
* **Métrica Verificável:** 100% de reversão automática em operações compostas que falham e 0 registros órfãos ou inconsistentes após os testes de integração.

<a id="rnf02"></a>
### RNF02 — Auditabilidade das alterações
* **Classificação FURPS+:** Confiabilidade (*Reliability*) / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança e integridade)
* **Descrição:** O sistema deve registrar em trilha de auditoria permanente toda criação, alteração ou exclusão lógica de dados, com autor, data e hora, valores anteriores e posteriores e, quando houver, justificativa. Atende às retificações cadastrais, aos lançamentos extemporâneos e às alterações na prestação de contas.
* **Métrica Verificável:** 100% das operações de escrita com registro de auditoria e 0 comandos de alteração ou exclusão permitidos sobre a trilha, mesmo para o perfil administrador, em teste de rotas.

<a id="rnf03"></a>
### RNF03 — Segurança das comunicações e das sessões
* **Classificação FURPS+:** Funcionalidade / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve proteger as comunicações em trânsito, rejeitar requisições sem credenciais válidas e limitar a duração das sessões, inclusive a inatividade em aparelhos pessoais.
* **Métrica Verificável:** 100% do tráfego por conexão cifrada; 100% de rejeição (HTTP 401) de requisições sem credenciais válidas; sessão expirada em até 8 h e em até 30 min de inatividade.

<a id="rnf04"></a>
### RNF04 — Controle de acesso por perfil
* **Classificação FURPS+:** Funcionalidade / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve restringir cada operação e cada dado ao perfil autorizado, conforme a matriz de perfis da seção 8.5.1.
* **Métrica Verificável:** 100% de bloqueio (HTTP 403) de requisições de escopo insuficiente e 0 acessos a dados nominais pelo perfil administrativo-financeiro, em teste de rotas por perfil.

<a id="rnf05"></a>
### RNF05 — Minimização de dados pessoais
* **Classificação FURPS+:** Restrição de Design (+) / Segurança (*Security*)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O cadastro deve conter apenas identificação, contato e consentimentos, sem campos estruturados de dado pessoal sensível (LGPD, art. 5º, II). Fotografias e texto livre ficam sob controle de acesso por perfil.
* **Métrica Verificável:** 0 campos estruturados de dado sensível no esquema do banco (revisão de esquema).

<a id="rnf06"></a>
### RNF06 — Prazo de atendimento à exclusão de dados
* **Classificação FURPS+:** Funcionalidade / Requisito Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O sistema deve executar a exclusão ou anonimização solicitada pelo titular em prazo curto, com registro na trilha de auditoria (LGPD, art. 18).
* **Métrica Verificável:** 100% das solicitações atendidas em até 72 h, medido na trilha de auditoria.

<a id="rnf07"></a>
### RNF07 — Retenção documental decenal
* **Classificação FURPS+:** Suportabilidade (*Supportability*) / Requisito Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O sistema deve garantir a integridade e a guarda de relatórios homologados, listas de chamada e evidências pelo prazo legal (Lei 13.019/2014, art. 68).
* **Métrica Verificável:** retenção configurada para no mínimo 10 anos a partir do dia útil seguinte à prestação de contas, com cópia em local distinto do servidor principal e política de ciclo de vida ativa.

<a id="rnf08"></a>
### RNF08 — Integridade de relatórios fechados
* **Classificação FURPS+:** Confiabilidade (*Reliability*) / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Integridade)
* **Descrição:** O sistema deve garantir que o relatório finalizado reflita exatamente o estado dos dados no fechamento do ciclo e impedir alteração posterior sem rastro.
* **Métrica Verificável:** 100% de correspondência entre o *hash* SHA-256 do arquivo gerado e o registro gravado, e 0 alterações diretas sobre o período fechado.

<a id="rnf09"></a>
### RNF09 — Resiliência offline e sincronização sem duplicidade
* **Classificação FURPS+:** Confiabilidade (*Reliability*) / Usabilidade (*Usability*)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade e resiliência)
* **Descrição:** O registro de presença e de evidências em campo deve continuar funcionando sem conexão, reter os dados no aparelho mesmo após fechar o navegador ou reiniciar o dispositivo e, ao restabelecer a rede, sincronizar sem perder nem duplicar registros.
* **Métrica Verificável:** 0% de perda de registros após corte simulado de conexão e recarga da página; 0 presenças duplicadas após 5 submissões idênticas do mesmo lote; testes automatizados de ponta a ponta.

<a id="rnf10"></a>
### RNF10 — Descarte de dados pessoais no aparelho
* **Classificação FURPS+:** Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve descartar os dados pessoais mantidos localmente em aparelhos pessoais (BYOD) após a confirmação de envio. A retenção prevista no RNF09 vale somente até essa confirmação.
* **Métrica Verificável:** 0 registros de participantes no armazenamento local após a confirmação de envio, em teste automatizado de aceitação.

<a id="rnf11"></a>
### RNF11 — Desempenho das consultas agregadas
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** As consultas de painel e listagens devem responder sem degradação sob picos de acesso.
* **Métrica Verificável:** tempo de resposta inferior a 800 ms no percentil 95 sob 50 requisições concorrentes por segundo, com uso de CPU do servidor abaixo de 75%, em teste de carga.

<a id="rnf12"></a>
### RNF12 — Desempenho da inscrição pública
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O formulário público de inscrição deve carregar de forma leve em navegador móvel, em conexão 3G/4G.
* **Métrica Verificável:** *First Contentful Paint* inferior a 2,5 s em perfil de rede 4G lento, por auditoria automatizada.

<a id="rnf13"></a>
### RNF13 — Desempenho da geração de relatórios
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O sistema deve gerar o relatório em PDF de forma assíncrona e ágil, mesmo com muitos dados e evidências anexadas.
* **Métrica Verificável:** relatório de até 50 páginas e 100 miniaturas disponível para download em menos de 5 s no percentil 95, em teste de carga.

<a id="rnf14"></a>
### RNF14 — Eficiência no envio de evidências
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O sistema deve reduzir o tamanho das imagens antes do envio, para economizar o plano de dados do educador.
* **Métrica Verificável:** redução média mínima de 60% no peso das imagens de alta resolução e envio de cada foto em menos de 4 s em rede 4G padrão.

<a id="rnf15"></a>
### RNF15 — Usabilidade móvel e inclusiva
* **Classificação FURPS+:** Usabilidade (*Usability*)
* **Classificação Sommerville:** Requisito de Produto (Usabilidade)
* **Descrição:** As telas de campo e de inscrição devem ser confortáveis em celulares comuns, legíveis sob luz solar e utilizáveis por pessoa com baixa familiaridade digital.
* **Métrica Verificável:** áreas de toque de no mínimo 48x48 px; nenhuma rolagem horizontal a partir de 360 px de largura; 100% dos critérios WCAG 2.1 nível AA aplicáveis; inscrição concluída em até 5 telas e 3 min por ao menos 4 de 5 pessoas do público do Instituto, no teste de usabilidade.

<a id="rnf16"></a>
### RNF16 — Compatibilidade entre navegadores e dispositivos
* **Classificação FURPS+:** Suportabilidade (*Supportability*)
* **Classificação Sommerville:** Requisito de Produto (Portabilidade)
* **Descrição:** O frontend deve manter paridade funcional e visual em telas compactas e em desktops, nos navegadores modernos.
* **Métrica Verificável:** 0 falhas funcionais ou quebras de layout entre 360 px e 1920 px em Chromium >= 120, Firefox >= 120 e WebKit/Safari >= 17, em testes de regressão visual.

<a id="rnf17"></a>
### RNF17 — Restrição tecnológica e qualidade de código
* **Classificação FURPS+:** Restrição de Implementação (+)
* **Classificação Sommerville:** Requisito Organizacional (Implementação)
* **Descrição:** A solução deve seguir a pilha homologada na seção 2.4 do Documento de Visão e respeitar análise estática e compilação rigorosa.
* **Métrica Verificável:** 0 erros de tipagem em modo estrito, 0 avisos nas regras de análise estática e 100% de sucesso no *build* de produção na integração contínua.

<a id="rnf18"></a>
### RNF18 — Cópia de segurança e recuperação de dados *(proposto; lacuna identificada)*
* **Classificação FURPS+:** Confiabilidade (*Reliability*)
* **Classificação Sommerville:** Requisito Organizacional (Operacional)
* **Descrição:** O sistema deve manter cópias de segurança periódicas do banco de dados, com cópia externa ao servidor de produção, e permitir sua restauração.
* **Métrica Verificável:** perda máxima aceitável de 6 h de dados e restabelecimento em até 8 h (*metas de projeto, ainda não medidas*), com ao menos um ensaio de restauração aprovado antes de declarar a recuperabilidade.


---

## 8.4 Matriz de Rastreabilidade Bidirecional

A matriz bidirecional completa dos RFs e RNFs, com os gargalos do BPMN (G01 a G06), os Objetivos Específicos, as Características de Produto, as histórias e os critérios de aceitação da Sprint 1, está em elaboração na Issue #44 e será integrada a esta seção. A tabela anterior deixou de ser publicada porque referia a numeração provisória dos requisitos, substituída nesta versão; a correspondência entre os códigos está na seção 8.7.

---

## 8.5 Notas de domínio e perguntas-chave

### 8.5.1 Perfis de acesso e permissões (CP1 e transversal)

Respostas às perguntas-chave da Issue #39 sobre campos obrigatórios, metas qualitativas e perfis de acesso:

* **Campos obrigatórios do instrumento:** tipo de instrumento, órgão concedente, número do processo administrativo, valor global (R$), datas de celebração e de vigência e o anexo do documento homologado em PDF (RF01).
* **Meta sem indicador quantitativo:** a meta é tipada como qualitativa ou descritiva, o parâmetro numérico torna-se opcional e a forma documental de comprovação passa a ser obrigatória (RF03).
* **Quem cria e edita versus quem consulta:** a proposta abaixo, a validar com o Instituto, é a base do RNF04.

| Perfil | Instrumentos, projetos e metas | Dados nominais de participantes | Presença e evidências | Relatórios |
| :--- | :--- | :--- | :--- | :--- |
| Presidência e gestão de projetos | Cria e edita | Sem acesso à base cadastral completa | Consulta | Gera e emite |
| Núcleo pedagógico e educadores | Consulta os itens de suas atividades | Acessa fichas para mediar as oficinas | Registra e consulta | Consulta |
| Administrativo-financeiro | Consulta | **Bloqueado** (só números consolidados) | Consulta consolidados | Consulta |
| Órgão concedente e auditoria | Sem acesso direto | Sem acesso à base cadastral | Evidências exigidas pela prestação de contas | Acesso pelo tempo da análise |

### 8.5.2 Campo, presença e evidências (CP2, CP4 e CP7)

#### Como o sistema identifica se duas marcações de presença offline referem-se à mesma pessoa e oficina?
* Cada evento de presença é assinado no cliente com um **UUIDv4 imutável** e amarrado à chave composta lógica `(participante_id, oficina_sessao_id, data_evento)`. No momento do envio, o backend executa reconciliação determinística com cláusula `ON CONFLICT DO NOTHING`, garantindo unicidade mesmo que o educador pressione o botão de sincronização múltiplas vezes.

#### Quais evidências documentais são obrigatórias para um "evento" versus uma "oficina"?
* **Oficina continuada:** Exige diário de classe digital com lista nominal de presenças validadas e registro de conteúdo programático / horas ministradas.
* **Evento público ou Ação de rua:** Exige fotos panorâmicas georreferenciadas do espaço com timestamp, estimativa quantitativa agregada de público e relatório sucinto de realização emitido pelo facilitador.

#### O que acontece se o educador esquecer de fazer a chamada no dia da oficina?
* O sistema não bloqueia o registro posterior, mas o trata formalmente como **lançamento extemporâneo** (RF17). É exigida justificativa obrigatória por escrito, e a marcação recebe sinalização visual de pendência auditável, ficando sujeita à conferência e homologação da Coordenação Pedagógica.

---

### 8.5.3 Apuração de metas e prestação de contas (CP6 e CP8)

#### Como o sistema calcula metas que não são lineares?
* O cálculo respeita o **tipo de aferição do indicador** (definido no desdobramento de metas):
  - *Metas quantitativas cumulativas:* Percentual obtido pela razão direta entre o volume apurado (soma de presenças ou horas ministradas) e o volume pactuado no plano de trabalho.
  - *Metas qualitativas ou de marco único (milestones):* Percentual binário (0% enquanto pendente de evidência formal e 100% após a anexação e validação documental da entrega pelo analista).

#### Como o relatório formal lida com metas que foram remanejadas por Termo Aditivo?
* O sistema não sobrescreve os dados pactuados na celebração da parceria. Ao cadastrar um Termo Aditivo, cria-se uma versão incremental do plano de trabalho. Na emissão do Relatório de Execução do Objeto, o documento apresenta uma tabela comparativa com colunas dedicadas: *Meta Pactuada Original*, *Alteração Formal (TA nº)*, *Meta Vigente Reprogramada* e *Percentual Efetivamente Cumprido*, demonstrando transparência perante a fiscalização do órgão público.

#### Quem pode emitir o relatório final oficial versus quem pode gerar acompanhamentos?
* Na dinâmica operacional do Instituto, **os analistas de projetos e a coordenação técnica possuem autonomia para gerar, revisar e emitir relatórios de acompanhamento e o Relatório de Execução do Objeto** a qualquer momento. O sistema atua como garantidor de conformidade: não bloqueia a emissão por hierarquia funcional, mas **bloqueia o fechamento da prestação se houver metas incompletas sem justificativa formal prévia**, prevenindo riscos de glosa para a instituição.

---

### 8.5.4 Inscrição, pessoas e LGPD (CP3 e CP5)

#### Quais são os dados mínimos para inscrever uma pessoa em uma oficina?
* Nome, telefone, data de nascimento (ou faixa etária) e os consentimentos. CPF apenas se o instrumento do projeto exigir. Nenhum dado sensível estruturado (RNF05).
* **A confirmar com o Instituto:** quais dados são coletados hoje na inscrição (ponto 6 da ata de 08/09).

#### Como tratar o consentimento de menores de idade?
* **Hipótese da equipe, ainda não validada:** para menor de 18 anos, o formulário registra o responsável legal e o consentimento é dado por ele (LGPD art. 14). Base legal e prazo de retenção a definir com o Instituto.
* **A confirmar com o Instituto:** se as atividades atendem crianças e adolescentes (ponto 6 da ata de 08/09).

#### A recusa do uso de imagem impede a participação?
* Não. A autorização de imagem é um consentimento separado (RF23) e a recusa não condiciona a inscrição nem a participação.

---

---

## 8.6 Pontos em aberto

* **Matriz de rastreabilidade** completa (Issue #44), a integrar na seção 8.4.
* **Critérios de aceitação:** serão redigidos como lista de critérios verificáveis, e não no formato Dado, Quando, Então (diretriz da disciplina, issue #23).
* **Lacunas de história na Sprint 1:** a inscrição (CP3) e o registro de presença em campo (CP4) não têm história própria, e RF27 a RF29 (apuração por marcos, risco de inexecução e Termo Aditivo) também não. São candidatos ao refinamento da Sprint 2.
* **Lacunas do B1:** o controle de chamados (G02) e o painel consolidado para a Presidência (G05) seguem como candidatos, sem requisito nem história, a decidir na priorização.
* **Sessão (RNF03):** confirmar se 30 min de inatividade é adequado ao trabalho de campo.
* **Versão do TLS:** a descrição não fixa a versão; confirmar com a Dupla B se a verificação exige TLS 1.3.
* **Conformidade do modelo de dados com o MROSC:** o RNF do catálogo anterior, baseado no art. 35 da Lei 13.019/2014, não foi reincorporado; conferir se o artigo lista campos de cadastro ou requisitos de celebração.
* **RNF18** (cópia de segurança e recuperação) vem da seção 2.6 do Documento de Visão e da ata de 15/09; confirmar sua inclusão.
* **Hipóteses a validar com o Instituto:** consentimento de menores de idade, dados coletados hoje na inscrição e a matriz de perfis (seção 8.5.1).

---

## 8.7 Correspondência entre códigos provisórios e definitivos

Os códigos provisórios foram usados nos PRs das duplas (`RF01` a `RF06` da Dupla B, `RF-C`, `RF-R` e `RF-P`, e `RNF` de cada dupla) e ainda aparecem nos arquivos de insumo 8a a 8d.

| Código provisório | Código definitivo | Nome |
| :--- | :--- | :--- |

| RF01 | RF01 | Cadastrar instrumento convocatório e parceria |
| RF02 | RF02 | Cadastrar projeto operacional |
| RF03 | RF03 | Desdobrar requisitos contratuais e metas |
| RF04 | RF04 | Atribuir responsável, setor e prazo a meta |
| RF05 | RF05 | Exibir linha do tempo e painel de prazos de metas |
| RF06 | RF06 | Emitir alertas de proximidade de vencimento de metas |
| RF-C01 | RF07 | Cadastrar atividade por modalidade de objeto |
| RF-C02 | RF08 | Parametrizar exigência de comprovação de presença |
| RF-P01 | RF09 | Disponibilizar formulário público de inscrição |
| RF-P02 | RF10 | Gerar QR Code de inscrição |
| RF-P03 | RF11 | Registrar inscrição presencial assistida |
| RF-P04 | RF12 | Limitar vagas da atividade |
| RF-P05 | RF13 | Ordenar lista de espera |
| RF-C03 | RF14 | Registrar frequência em dispositivo móvel |
| RF-C04 | RF15 | Operar registro de presença em modo offline |
| RF-C05 | RF16 | Sincronizar presenças com reconciliação idempotente |
| RF-C06 | RF17 | Registrar lançamento extemporâneo com justificativa |
| RF-C07 | RF18 | Apurar carga horária de participantes e facilitadores |
| RF-P06 | RF19 | Consultar histórico de participação |
| RF-P07 | RF20 | Alertar cadastro duplicado |
| RF-P08 | RF21 | Registrar consentimento de guarda de dados |
| RF-P09 | RF22 | Registrar autorização de contato |
| RF-P10 | RF23 | Registrar autorização de uso de imagem |
| RF-P11 | RF24 | Retificar dados cadastrais |
| RF-P12 | RF25 | Excluir ou anonimizar cadastro |
| RF-R01 | RF26 | Calcular progresso físico de metas em tempo real |
| RF-R02 | RF27 | Parametrizar apuração para metas não lineares e marcos |
| RF-R03 | RF28 | Emitir alertas de risco de inexecução |
| RF-R04 | RF29 | Versionar metas por Termo Aditivo |
| RF-C08 | RF30 | Anexar evidências documentais e fotográficas |
| RF-C09 | RF31 | Vincular evidência a meta contratual |
| RF-C10 | RF32 | Segregar acesso a fotos de beneficiários vulneráveis |
| RF-R05 | RF33 | Exigir justificativa prévia para metas não atingidas |
| RF-R06 | RF34 | Emitir Relatório de Execução do Objeto |
| RF-R07 | RF35 | Gerar relatório diagramado em PDF via servidor |
| RF-R08 | RF36 | Exportar dados consolidados em formato tabular aberto |
| RF-R09 | RF37 | Registrar trilha de auditoria para retificações na prestação |

| RNF provisório | RNF definitivo |
| :--- | :--- |
| RNF-P01 | RNF12 |
| RNF-P02 | RNF06 |
| RNF-P03 | RNF10 e RNF03 |
| RNF-P04 | RNF15 |
| RNF-P05 | RNF05 e RNF04 |
| RNF-C01 | RNF09 |
| RNF-C02 | RNF09 |
| RNF-C03 | RNF15 |
| RNF-C04 | RNF14 |
| RNF-R01 | RNF07 |
| RNF-R02 | RNF13 |
| RNF-R03 | RNF08 |
| RNF01 a RNF07 do PR #50 | Reordenados: ver 8d, seção 3 |
