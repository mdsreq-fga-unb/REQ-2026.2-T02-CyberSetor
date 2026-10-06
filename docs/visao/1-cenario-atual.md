# 1. Cenário atual do cliente e do negócio

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão das seções 1.4, 1.5 e 1.7 | Equipe CyberSetor |
| 14/09/2026 | 1.2 | Identificação institucional das representantes do Instituto nas seções 1.1, 1.5 e 1.6; mapa de stakeholders alinhado à validação por área da seção 7.3.1 | Vinicius Vieira e Maria Eduarda Marques |
| 17/09/2026 | 1.3 | Segmentação de clientes alinhada ao escopo da seção 2.3: registro de presença e carga horária no lugar da emissão de certificado | Equipe CyberSetor |
| 17/09/2026 | 1.4 | Dimensionamento do problema, matriz de interesse e poder com estratégias de engajamento, distinção entre usuário, titular e beneficiário, aprofundamento da área administrativo-financeira e heterogeneidade dos editais | Rodrigo Henrique e Daniel Batista |
| 28/09/2026 | 1.5 | Rich Picture refeito com os oito componentes do fluxo operacional (financiadores públicos, editais e termos de fomento, projetos e metas, formulários avulsos, campo com listas e fotos, área administrativo-financeira, consolidação manual e entrega dos relatórios com risco de glosa), detalhados na seção 1.3 | Daniel Batista |
| 30/09/2026 | 1.6 | Atualização do Rich Picture e mapa de stakeholders com papéis identificados na reunião de 08/09 (Diretoria de Projetos, Captação de Recursos, ausência de RH, demais setores operacionais e regimes de financiadores) | Equipe CyberSetor |
| 05/10/2026 | 1.7 | Fechamento do dimensionamento empírico com estimativas da coordenação, restauração do mapa circular de stakeholders e unificação da matriz de interesse e poder | Rodrigo Henrique |

---

## 1.1 Identificação do Cliente/Parceiro

* **Nome Institucional:** Instituto Cultural e Social No Setor (Instituto No Setor).
* **Natureza Jurídica:** Organização da Sociedade Civil (OSC) sem fins lucrativos, atuando como instituto social e cultural regido pelas normas do Marco Regulatório das Organizações da Sociedade Civil — MROSC (Lei Federal nº 13.019/2014).
* **Interlocutores e Estrutura de Contato:**
  * *Presidência:* Rafael, a quem cabe a visão consolidada das operações e das parcerias.
  * *Núcleo pedagógico:* Maria Clara e Maria Eduarda. **Não confundir com Maria Eduarda Marques, integrante da equipe CyberSetor — ver seção 7.1.**
  * *Coordenação e rotina administrativo-financeira:* Fillipe Ramos.
  * *Área de projetos:* Fran.
* **Canais Formais de Interação:** Reuniões periódicas presenciais e remotas, canal institucional no WhatsApp e correio eletrônico.
* **Papel no Projeto:** Clientes e especialistas de domínio, responsáveis por descrever a rotina de trabalho, prover amostras de instrumentos de gestão, priorizar funcionalidades do produto e validar incrementalmente as entregas.

---

## 1.2 Introdução ao Negócio e Contexto

O Instituto Cultural e Social No Setor atua há cerca de oito anos na ocupação democrática do espaço público e na defesa do direito à cidade. Com fundação e sede histórica no Setor Comercial Sul (SCS), região central de Brasília, a organização converte áreas públicas em palcos de convivência cidadã, articulação comunitária e profissionalização.

Ao longo de sua trajetória, o Instituto ampliou seu escopo: o trabalho iniciado com eventos culturais e ocupações artísticas (como o Setor Carnavalesco Sul e o SCS Tour) expandiu-se, sobretudo a partir da pandemia de Covid-19, para ações de assistência humanitária, zeladoria urbana, capacitação técnica e promoção dos direitos humanos para populações em extrema vulnerabilidade.

Para sustentar essas intervenções, o Instituto articula parcerias com a administração pública nas esferas distrital e federal (como SEDET-DF, FAC-DF, Fiocruz e Ministério da Cultura), além de emendas parlamentares. A formalização desses convênios impõe deveres legais estritos de prestação de contas. Entretanto, a gestão dos dados operacionais e financeiros ainda repousa em controles manuais desconexos e planilhas eletrônicas frágeis, expondo o Instituto ao risco de inexecução e sanções financeiras.

---

## 1.3 Rich Picture e Mapeamento do Fluxo do Problema

<figure markdown>
  ![Rich Picture do Cenário Operacional do Instituto No Setor](../assets/img/rich-picture.png)
  <figcaption>Figura 1 – Rich Picture do Cenário Operacional do Instituto No Setor. Fonte: elaborada pelos autores.</figcaption>
</figure>

O Rich Picture sintetiza visualmente a articulação institucional e o fluxo operacional do Instituto No Setor, explicitando os oito componentes centrais do ecossistema e os gargalos críticos que justificam a concepção da solução de software:

1. **Financiadores Públicos:** Órgãos concedentes e fontes de emendas parlamentares (SEDET-DF, FAC-DF, Fiocruz e Ministério da Cultura), operando sob diferentes regimes e regulamentos, responsáveis pelos repasses financeiros e pela fiscalização das metas contratuais pactuadas.
2. **Editais e Termos de Fomento:** Instrumentos jurídicos disciplinados pelo Marco Regulatório das Organizações da Sociedade Civil — MROSC (Lei Federal nº 13.019/2014), que fixam metas quantitativas, prazos de execução, limites orçamentários e regras de prestação de contas.
3. **Diretoria de Projetos e Captação de Recursos:** Stakeholder crítica que concentra a captação de emendas, a gestão da prestação de contas e a resposta a emergências, desdobrando as obrigações dos termos de fomento em planos de trabalho de campo para os projetos do Instituto.
4. **Formulários Avulsos:** Instrumentos descentralizados (como Google Forms) operados pelo núcleo pedagógico (Maria Clara e Maria Eduarda) para inscrições de turmas e cadastro de participantes, desconectados de um banco centralizado.
5. **Setores Operacionais, Listas de Presença e Evidências:** Educadores, oficineiros e demais setores operacionais (marcenaria, lavanderia, oficina de estilografia e atendimento a pessoas em situação de rua) realizam as atividades formativas com populações vulneráveis no SCS sob oscilações de rede, coletando assinaturas em listas de presença físicas de papel (sujeitas a perda, rasgos e umidade) e fotografias/vídeos comprobatórios em aparelhos celulares pessoais dispersos.
6. **Equipe Administrativo-Financeira:** Conduzida por Fillipe Ramos e analistas, gerencia cotações de preços, notas fiscais e alimentação manual da Matriz de Aquisição em arquivos isolados do Excel, sem sincronia em tempo real com as evidências pedagógicas. Devido à ausência de uma área de Recursos Humanos, o setor acumula também controles dessas rotinas.
7. **Consolidação Manual (Gargalo Operacional):** Ponto crítico de estrangulamento onde convergem listas de papel, fotos de celulares e planilhas financeiras. Exige digitação manual, triagem de mídias e conferência linha a linha entre presenças e rubricas orçamentárias.
8. **Relatórios de Execução, Entrega Explícita e Risco de Glosa:** Etapa final de consolidação dos relatórios de cumprimento do objeto para submissão formal aos órgãos financiadores. A lentidão e a fragilidade do processo manual expõem a organização ao severo **Risco de Glosa** (art. 64 da Lei 13.019/2014), com possibilidade de rejeição de contas e exigência de devolução compulsória de recursos públicos.

O fluxo em que os gargalos se originam está modelado em notação BPMN na página [B1 · Modelo do processo atual](../requisitos/b1-bpmn-processo-atual.md).

---

## 1.4 Identificação e Dimensionamento Empírico do Problema

<figure markdown>
  ![Diagrama de Ishikawa: causas dos gargalos na consolidação das informações para a prestação de contas](../assets/img/ishikawa.jpg)
  <figcaption>Figura 2 – Diagrama de Ishikawa. Fonte: elaborada pelos autores.</figcaption>
</figure>

O processo atual gera descompasso severo entre a execução prática no SCS e a comprovação documental exigida pelos órgãos concedentes. A ausência de um sistema integrado centralizado impõe os seguintes gargalos mensuráveis (estimativas informadas pela coordenação do Instituto em reuniões de elicitação):

- **Projetos em Paralelo:** Média de 4 a 6 projetos e termos de fomento geridos simultaneamente (identificados no ciclo atual pelos códigos operacionais 061 a 065 e 068).
- **Volume de Planilhas Dispersas:** 20 a 30 planilhas eletrônicas independentes por ciclo de projeto (controles de turmas, frequências de oficineiros e a Matriz de Aquisição em Excel), armazenadas em drives pessoais e vulneráveis a inconsistências e exclusão acidental.
- **Atividades e Participantes:** Realização de 10 a 20 oficinas e eventos formativos mensais (serigrafia, fotografia, música, arte urbana e zeladoria), com atendimento direto variando entre 300 e 800 participantes por mês, somando milhares de atendimentos ao longo do ano.
- **Evidências Acumuladas:** Acúmulo semestral superior a 1.500 fotografias e vídeos em celulares particulares de oficineiros e dezenas de listas físicas de frequência em papel, sujeitas a rasuras, umidade ou extravio no território do SCS.
- **Sobrecarga de Consolidação Manual:** O núcleo gestor consome entre 30 e 50 horas de trabalho por ciclo de prestação de contas na digitação de listas físicas e checagem cruzada linha a linha com rubricas orçamentárias.
- **Frequência de Inconsistências e Risco Crítico de Glosa:** A ausência de monitoramento em tempo real faz com que metas em atraso só sejam detectadas no fechamento do relatório, impedindo a pactuação tempestiva de Termos Aditivos e gerando risco iminente de glosa orçamentária (art. 64 da Lei 13.019/2014).
- **Heterogeneidade de Editais e Plataformas:** Convivência concorrente com exigências de múltiplos concedentes (SEDET-DF, FAC-DF, Fiocruz, MinC), cada qual com plataformas (TransferGov, sistema Parcerias) e modelos documentais próprios.
---

## 1.5 Desafios do Projeto

* **Operação de Campo e Resiliência sem Conexão:** Disponibilizar uma interface leve e intuitiva para que oficineiros registrem presenças e capturem evidências no SCS sob oscilações severas de rede móvel, com capacidade de armazenamento em cache no navegador e envio posterior com tratamento de duplicidade no servidor.
* **Governança de Dados Pessoais e LGPD:** Segregar o acesso aos dados nominais e cadastrais de crianças, adolescentes e populações em situação de vulnerabilidade, restringindo-os ao núcleo pedagógico e protegendo-os de consultas por setores administrativos ou públicos externos.
* **Autonomia operacional e manutenção:** reduzir o custo e a complexidade de manutenção, de modo que a operação cotidiana não dependa de equipe interna de tecnologia. A administração técnica e o custeio após a disciplina são dependências reais, tratadas no plano de transferência da seção 2.6.
* **Viabilidade Técnica dos Relatórios frente à Variedade de Editais:** Devido à disparidade entre os formulários de cada órgão governamental, o sistema foca em gerar um **relatório consolidado próprio**, com exportação tabular e índice ordenado de comprovações fotográficas com metadados. A reprodução idêntica de formulários governamentais customizados fica condicionada à padronização normativa ulterior dos concedentes.

---

## 1.6 Mapa e Matriz de Stakeholders

Para mitigar ambiguidades de governança e garantir aderência à LGPD, a caracterização dos agentes distingue quatro categorias essenciais:

- **Usuários do Sistema:** Operam o software diretamente para inserção de dados, monitoramento ou emissão de relatórios.
- **Titulares dos Dados:** Pessoas físicas cujas informações biográficas, fotográficas ou cadastrais são tratadas pelo sistema.
- **Beneficiários Diretos/Indiretos:** Populações e comunidade impactadas pelas ações socioculturais.
- **Stakeholders Externos:** Agentes institucionais concedentes que ditam normas e auditam as contas.

<figure markdown>
  ![Mapa de stakeholders do projeto CyberSetor](../assets/img/mapa-stakeholders.png)
  <figcaption>Figura 3 – Mapa de stakeholders do projeto CyberSetor. Fonte: elaborada pelos autores.</figcaption>
</figure>

### 1.6.1 Matriz de Interesse e Poder

A área do Instituto que valida cada conjunto de funcionalidades está na [seção 7.3.1](7-equipe-e-cliente.md#731-area-competente-por-funcionalidade).

| Stakeholder | Quadrante (Poder / Interesse) | Estratégia de Engajamento e Participação |
| :--- | :--- | :--- |
| **Financiadores Públicos** (SEDET-DF, FAC-DF, Fiocruz, MinC) | Alto / Alto *(Gerenciar de perto)* | Alinhamentos prioritários, validação contínua de requisitos e relatórios com total auditabilidade para afastar risco de glosa. |
| **Presidência e Diretoria Executiva** (Rafael) | Alto / Alto *(Gerenciar de perto)* | Validação das prioridades do produto e do painel gerencial. |
| **Diretoria de Projetos e Captação de Recursos** (Fran) | Alto / Alto *(Gerenciar de perto)* | Validação primária do modelo de metas, indicadores e parâmetros de aferição. |
| **Equipe CyberSetor** | Alto / Alto *(Gerenciar de perto)* | Condução da engenharia de requisitos e entregas funcionais quinzenais. |
| **Coordenação Administrativo-Financeira** (Fillipe Ramos) | Médio / Alto *(Manter satisfeito)* | Integração dos fluxos da Matriz de Aquisição com as metas e aprovação de relatórios do objeto; a coordenação acumula a gestão de pessoal, na ausência de setor de RH. |
| **Núcleo Pedagógico** (Maria Clara e Maria Eduarda) | Médio / Alto *(Manter satisfeito)* | Validação contínua das interfaces de campo, controle de atividades e repositório de evidências. |
| **Educadores, oficineiros e demais setores operacionais** (marcenaria, lavanderia, oficina de estilografia, atendimento de rua) | Baixo / Alto *(Manter informado)* | Capacitação para registro móvel simplificado de frequência e envio ágil de evidências fotográficas. |
| **Participantes das Oficinas** (Titulares de dados) | Baixo / Médio *(Monitorar)* | Coleta transparente de consentimento (LGPD) e garantia de direitos de retificação/exclusão. |
| **Populações Vulneráveis e Comunidade** (Beneficiários) | Baixo / Baixo *(Monitorar)* | Proteção estrita de dados sensíveis e garantia de acolhimento sem barreiras digitais (dados agregados). |

---

## 1.7 Segmentação de Clientes e Usuários

* **1. Presidência e Diretoria Executiva:**
  * *Perfil:* Lideranças que necessitam de tomada de decisão ágil sobre múltiplos projetos.
  * *Interação com o sistema:* consulta ao painel consolidado de projetos, com situação das metas, cronograma e saldo. Trata-se de capacidade candidata, levantada em 15/09 e ainda pendente de validação com a presidência.
* **2. Diretoria de Projetos:**
  * *Perfil:* Analistas e coordenadores de parcerias com o setor público.
  * *Interação com o sistema:* cadastro de requisitos e metas do instrumento, atribuição de responsável e prazo por meta, e geração do Relatório de Execução do Objeto.
* **3. Coordenação Administrativo-Financeira:**
  * *Perfil:* Profissionais que operam cotações de mercado, tomada de preços, cartas-convite, contratos e pagamentos bancários (*TransferGov* e *Internet Banking*).
  * *Interação com o Sistema:* Atualização dos lançamentos da Matriz de Aquisição, verificação da conformidade documental de fornecedores e cruzamento com rubricas orçamentárias (sem acesso a dados individuais de alunos).
* **4. Educadores, Artistas e Voluntários de Campo:**
  * *Perfil:* Agentes culturais que realizam o atendimento presencial no território do SCS.
  * *Interação com o Sistema:* Operação móvel via navegador para conferência de presença em oficinas, upload de registros fotográficos vinculados à atividade e registro de ocorrências de campo.
* **5. Participantes e Alunos das Oficinas:**
  * *Perfil:* Crianças, jovens e adultos inscritos nas atividades formativas.
  * *Interação com o Sistema:* Não operam o painel de gestão; interagem exclusivamente por páginas públicas de inscrição e assinatura de termos de adesão/consentimento de uso de dados e imagem.
* **6. Populações em Extrema Vulnerabilidade e Comunidade Geral:**
  * *Perfil:* pessoas em situação de rua e frequentadores atendidos em ações de zeladoria, saúde e alimentação no SCS.
  * *Interação com o Sistema:* Não interagem diretamente com a interface; seus atendimentos são computados de forma agregada e anônima pelos facilitadores de campo, resguardando dignidade e integridade física.
