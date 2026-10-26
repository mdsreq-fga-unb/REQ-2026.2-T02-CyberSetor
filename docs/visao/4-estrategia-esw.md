# 4. Estratégias de engenharia de software

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Seção redigida para o site | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Refatoração e melhoria na apresentação e estrutura da seção 4 | Equipe CyberSetor |
| 07/09/2026 | 1.3 | Adequação da classificação do Ciclo de Vida | Equipe CyberSetor |
| 17/09/2026 | 1.4 | Cadência de validação com o Instituto alinhada à seção 7.2 | Equipe CyberSetor |
| 05/10/2026 | 1.5 | Revisão editorial: formatação direta, preservando toda a fundamentação teórica, citações e quadros comparativos | Rodrigo Henrique |
| 13/10/2026 | 1.6 | Revisão conceitual: neutralidade no quadro comparativo, OpenUP iterativo, Scrum como framework, ScrumXP como processo adaptado e alinhamento de cadências | Caio Martins |
| 19/10/2026 | 1.7 | Equipe atual de cinco integrantes | Maria Eduarda Marques |
| 26/10/2026 | 1.8 | Programação em pares descrita como é aplicada: duplas por épico, sessões síncronas registradas pela coautoria do commit e na daily, revisão por outra dupla para quem trabalha sozinho e evidência apresentada na Sprint Review | Vinicius Vieira |

A partir do cenário diagnosticado na Seção 1 e da solução proposta na Seção 2, a equipe CyberSetor estabeleceu as decisões de estratégia de engenharia de software para o atendimento ao Instituto No Setor nas três camadas metodológicas distinguidas pelo referencial da disciplina: **abordagem**, **ciclo de vida** e **processo**.

---

## 4.1 Estratégia Priorizada

A estratégia para o projeto adota o **ScrumXP** como processo de desenvolvimento, fundamentando-se em uma abordagem **Ágil** e em um ciclo de vida **Ágil**. Essa combinação foi desenhada para conectar o contexto real da organização atendida à dinâmica acadêmica da disciplina, garantindo entregas frequentes com alto valor agregado, mitigação contínua de riscos e excelência técnica.

| Abordagem | Ciclo de Vida | Processo |
|---|---|---|
| **Ágil** | **Ágil** | **ScrumXP** |

### Abordagem: Ágil
A abordagem Ágil valoriza indivíduos e interações mais que processos e ferramentas, software em funcionamento mais que documentação abrangente, e colaboração com o cliente mais que negociação de contratos (BECK et al., 2001). Ao equilibrar esses valores sem desconsiderar a importância de processos sustentáveis e de documentação viva e suficiente, essa abordagem mostra-se ideal para a adaptação rápida às demandas em campo no Setor Comercial Sul (SCS).

**Por que escolher a Abordagem Ágil?**

- **Adaptação a Requisitos Emergentes:** Permite ajustar o escopo e o nível de detalhamento dos requisitos conforme novas necessidades emergem da convivência em campo com o parceiro, superando a rigidez da abordagem Preditiva (Dirigida por Planos).
- **Entregas Incrementais de Valor:** Disponibiliza funcionalidades essenciais para validação precoce e contínua com a coordenação pedagógica, sem postergar a visibilidade da solução funcional para o término do semestre.
- **Foco no Usuário de Campo:** Prioriza atender às necessidades operacionais reais (como chamada e presença em oficinas culturais e mutirões), calibrando a interface de acordo com o nível de letramento digital de quem atua na ponta.
- **Equilíbrio Metodológico frente à Abordagem Preditiva ou Híbrida:** Adequa o esforço de especificação à capacidade produtiva de uma equipe de cinco membros, mantendo a documentação viva, rastreável e focada na entrega de valor funcional direto para a organização.
  
### Ciclo de Vida: Ágil
O Ciclo de Vida Ágil estrutura o desenvolvimento em ciclos temporais curtos, regulares e de duração fixa (timeboxes/sprints quinzenais). Cada ciclo repete iterativamente todas as atividades essenciais da engenharia de software — elicitação, análise, projeto, codificação e testes —, gerando ao final de cada período um incremento funcional utilizável, testado e de valor demonstrável (MARSICANO, 2026).

Conforme o referencial da disciplina, o ciclo de vida ágil é um *superset* que engloba nativamente as dimensões iterativa e incremental, operando-as sob ritos temporais estritos, feedback contínuo em ciclos curtos e adaptação constante ao contexto real do parceiro.

**Por que escolher o Ciclo de Vida Ágil?**

- **Sincronia com Marcos Acadêmicos (Releases Fixas):** Adapta-se perfeitamente aos quatro pontos de controle da disciplina mantendo datas e recursos fixos, usando o escopo como variável de ajuste para garantir software funcional homologado a cada release.
- **Feedback Contínuo Baseado em Evidências:** Promove validações frequentes a cada 2 semanas diretamente com os educadores e gestores do Instituto No Setor por meio de incrementos executáveis, reduzindo divergências entre o problema real e a solução.
- **Mitigação Precoce de Riscos Sociotécnicos:** Expõe precocemente desafios de integração técnica, usabilidade e modelagem de regras de negócio, permitindo refatorações contínuas e evolução adaptativa da arquitetura sem retrabalho tardio.

### Processo: ScrumXP
O **ScrumXP** adotado pelo projeto é um **processo adaptado pela equipe**, que integra o *framework* de governança ágil **Scrum** (SCHWABER; SUTHERLAND, 2020) às práticas rigorosas de engenharia de software do **eXtreme Programming (XP)** (BECK; ANDRES, 2004; MARSICANO, 2026). Como o Scrum é intencionalmente incompleto — fornecendo a estrutura de papéis, eventos (cerimônias) e artefatos de gestão sem prescrever métodos de codificação —, a equipe complementa esse framework com as práticas técnicas do XP (programação em pares, integração contínua, testes de aceitação e refatoração), assegurando a sustentabilidade da base de código.

#### Etapas do ScrumXP para o Projeto

1. **Concepção e Planejamento da Release (Visão do Produto)**
   - **Objetivo:** Compreender o domínio do parceiro, delimitar o escopo inicial do problema e estruturar a arquitetura e o backlog inicial.
   - **Atividades:**
     - Conduzir entrevistas e análise de documentos reais da organização (planilhas de oficinas e relatórios).
     - Modelar o cenário atual por meio de Rich Picture e Mapa de Stakeholders.
     - Elaborar o Product Backlog inicial priorizado por valor de negócio.

2. **Desenvolvimento Iterativo (Sprints de 2 semanas)**
   - **Objetivo:** Projetar, implementar e testar incrementos funcionais priorizados com alto padrão de qualidade de código.
   - **Atividades:**
     - Realizar Sprint Planning com seleção e estimativa dos itens do Sprint Backlog.
     - Implementar as histórias em duplas por épico, com sessões síncronas de programação em pares (*Pair Programming*) quando a dupla trabalha junta e revisão por outra dupla quando o trabalho é individual.
     - Assegurar a integração contínua (*Continuous Integration*) e a refatoração constante do código.

3. **Revisão e Validação com o Cliente (Sprint Review)**
   - **Objetivo:** Demonstrar o incremento funcional construído e validar com o Instituto o cumprimento dos critérios de aceitação ao final de cada sprint.
   - **Atividades:**
     - Apresentar o software em funcionamento às lideranças e educadores da organização na Sprint Review, ao final de cada sprint; quando o Instituto não puder estar presente, a avaliação fica provisória até a validação semanal seguinte, conforme a seção 7.
     - Coletar feedbacks e percepções de usabilidade dos usuários de forma contínua.
     - Repriorizar e refinar o Product Backlog com base no retorno obtido.

4. **Melhoria Contínua e Transição (Retrospectiva e Fechamento)**
   - **Objetivo:** Aperfeiçoar os processos de trabalho ao término de cada sprint e consolidar as entregas dos marcos acadêmicos.
   - **Atividades:**
     - Executar a Sprint Retrospective ao final de cada sprint quinzenal para analisar sucessos, gargalos e planos de ação de melhoria contínua da equipe.
     - Atualizar a documentação viva no repositório e registrar as lições aprendidas.
     - Gerar as tags de versão e disponibilizar o incremento no ambiente de testes.

#### Práticas Selecionadas no ScrumXP
- **Práticas de Gestão (Scrum):**
  - *Product Backlog Priorizado:* Repositório único de requisitos gerenciado no GitHub Projects, ordenado pelo impacto real na rotina da organização.
  - *Sprints de Duas Semanas:* Timeboxes fixos que conferem cadência e ritmo sustentável à equipe.
  - *Cerimônias Essenciais:* Reuniões de Planejamento de Sprint, Revisões com validação direta do cliente e Retrospectivas de processo.
- **Práticas Técnicas de Engenharia (XP):**
  - *Programação em Pares (Pair Programming):* As histórias são distribuídas por duplas, uma por épico. Quando a dupla trabalha junta, a sessão é síncrona e fica registrada pela coautoria do commit (`Co-authored-by`) e na daily. Quem trabalha sozinho tem o pull request revisado obrigatoriamente por integrante de outra dupla, controle que substitui o par. As sessões de cada sprint, tiradas do histórico de commits, são apresentadas na Sprint Review.
  - *Integração Contínua (CI):* Automação de compilação, checagem de estilo e execução de suítes de testes a cada pull request.
  - *Testes de Aceitação:* Cenários verificáveis estruturados a partir dos critérios de aceitação das histórias de usuário.
  - *Propriedade Coletiva e Refatoração:* Todo membro da equipe é responsável pela qualidade geral da base de código, simplificando o design sempre que oportuno.

---

## 4.2 Quadro Comparativo: OpenUP x ScrumXP

A tabela a seguir compara o **OpenUP** (processo ágil baseado em arquitetura do Unified Process) e o **ScrumXP** (combinação ágil de gestão e engenharia técnica), fundamentando a adequação de cada um às particularidades do projeto.

| Critério | OpenUP (Open Unified Process) | ScrumXP (Scrum + Extreme Programming) |
|---|---|---|
| **Foco Principal** | Estabilidade arquitetural progressiva, controle sistemático de riscos e governança orientada a casos de uso. | Ritmo sustentável, valor funcional entregue em ciclos curtos e feedback contínuo baseado em histórias de usuário. |
| **Estrutura de Fases** | Quatro fases estruturadas (Iniciação, Elaboração, Construção e Transição), executadas de forma iterativa e incremental com iterações curtas cobrindo todas as disciplinas. | Ciclos iterativos e incrementais curtos (sprints de 2 semanas) guiados pelo Product Backlog e cerimônias ágeis. |
| **Foco em Arquitetura** | Arquitetura executável progressivamente estabelecida e validada ao longo das iterações da fase de Elaboração, visando mitigar os principais riscos técnicos. | Arquitetura mínima evolutiva que se estabelece incrementalmente a cada sprint, apoiada por refatoração contínua e testes automatizados. |
| **Flexibilidade de Requisitos** | Requisitos são refinados iterativamente ao longo das fases; casos de uso e especificações suplementares são detalhados conforme o ciclo avança. | Backlog dinâmico repriorizado a cada sprint com base em histórias de usuário e feedback direto do cliente. |
| **Práticas Técnicas de Engenharia** | Prescreve orientações conceituais de análise e projeto orientados a objetos e casos de uso, sem detalhar rotinas diárias de codificação em pares. | Práticas prescritivas e contínuas de engenharia integradas ao dia a dia (Pair Programming, CI, TDD e Testes de Aceitação). |
| **Documentação de Requisitos** | Estruturada e formal por fase, centrada em Casos de Uso, Modelo de Dados e Arquitetura Executável. | Viva, enxuta e rastreável: Histórias de Usuário, critérios de aceitação objetivos e protótipos de baixa fidelidade. |
| **Colaboração com o Cliente** | Contínua ao longo de todas as iterações, complementada por marcos formais de avaliação de objetivos no encerramento de cada fase. | Contínua e direta ao final de cada sprint quinzenal, mediada pela demonstração de software em funcionamento. |
| **Curva de Aprendizado da Equipe** | Moderada a alta: requer disciplina prévia em modelagem de casos de uso e gestão formal das disciplinas do processo unificado. | Baixa a moderada: alinhada à dinâmica acadêmica quinzenal e acelerada pelo trabalho em duplas. |
| **Aplicação no Contexto do Projeto** | Demanda governança disciplinada e dedicação inicial substancial à modelagem de casos de uso e validação arquitetural na Elaboração, exigindo maior esforço formal para um time de cinco estudantes. | Adequa-se à dinâmica de iterações curtas com prazos acadêmicos fixos, nivelando o conhecimento técnico da equipe pelas práticas prescritivas do XP. |

> **Síntese da Comparação:** Embora o OpenUP seja um processo ágil disciplinado e robusto para governança baseada em arquitetura e casos de uso, sua adoção demandaria um esforço prévio de modelagem e ritos formais que não se ajustam com tanta fluidez à capacidade produtiva de uma equipe de cinco estudantes em ambiente acadêmico. O processo adaptado ScrumXP provê a agilidade gerencial necessária com menor sobrecarga documental inicial, assegurando rigor técnico por meio das práticas prescritivas do XP.

---

## 4.3 Justificativa

### Sinergia Metodológica: Scrum + XP
O Scrum isolado fornece excelente governança e comunicação com stakeholders, mas é agnóstico em relação à engenharia de software, o que pode comprometer a sustentabilidade técnica do produto. Por outro lado, o XP provê excelência técnica e disciplina de desenvolvimento, mas carece de uma estrutura de papéis organizacionais amplamente compreendida por clientes externos. A união no **ScrumXP** elimina as fraquezas de ambos os modelos, unindo cadência de gestão e excelência de código.

### Coerência com os Valores da Engenharia de Requisitos
Conforme registrado por Marsicano (2026, §5.4.1), os sete valores fundamentais da Engenharia de Requisitos adotados na disciplina — **Comunicação, Feedback, Simplicidade, Coragem, Respeito, Compromisso e Confiança** — são adaptações diretas do eXtreme Programming e do Scrum (acrescidos do valor Confiança). Adotar o ScrumXP não é apenas uma escolha operacional, mas uma decisão de **coerência metodológica integral** com a base conceitual da disciplina.

### Pilares de Decisão para o Projeto

1. **Flexibilidade de Escopo frente a Prazos Fixos:**
   - O projeto possui quatro entregas obrigatórias no semestre letivo com prazos fixos. O uso de sprints quinzenais permite que o escopo funcione como variável de ajuste, garantindo que incrementos funcionais e validados estejam prontos a cada marco.
2. **Nivelamento Técnico via Práticas de Engenharia:**
   - O diagnóstico da equipe revelou assimetria de conhecimento técnico em relação à pilha de desenvolvimento. Práticas como programação em pares (*Pair Programming*), integração contínua (*CI*) e propriedade coletiva do código transformam a construção do software em um processo contínuo de nivelamento e garantia de qualidade.
3. **Requisitos Emergentes e Validação Precoce:**
   - O domínio de prestação de contas, gestão de oficinas e controle de presenças possui regras específicas que são refinadas ao longo do contato com os educadores. O ciclo de vida ágil permite adaptar os requisitos sem sobrecusto de renegociação documental.
4. **Foco no Núcleo de Maior Impacto Social:**
   - O parceiro necessita prioritariamente resolver a fragilidade no registro de frequência e consolidação de indicadores para editais. O Product Backlog priorizado por valor garante que o MVP (núcleo da solução) seja implementado e homologado antes de funcionalidades acessórias.

### Gestão de Riscos do Processo Selecionado

> **Risco Mapeado:** O XP preconiza a presença integral do cliente (*On-site Customer*). Contudo, os representantes da organização possuem agendas concorridas e equipe reduzida.

> **Estratégia de Mitigação:** A equipe definiu um membro no papel de **Product Owner Interno**, encarregado de canalizar dúvidas, organizar pautas enxutas e assegurar comunicação assíncrona entre as validações semanais e as Sprint Reviews ao final de cada sprint, resguardando o tempo do parceiro.

### Análise de Alternativas Descartadas

A tabela a seguir consolida os critérios que justificaram o descarte formal das demais abordagens e processos de desenvolvimento analisados:

| Abordagem / Processo | Motivo Principal do Descarte |
|---|---|
| **Cascata (Waterfall) e Modelo V** | Pressupõem estabilidade total de requisitos desde o início e verificação formal tardia. Incompatíveis com a descoberta contínua de requisitos e as entregas parciais do semestre. |
| **Processo Unificado Completo (RUP)** | Sobrecarga de artefatos formais, fases extensas e curva de aprendizado burocrática inviável para uma equipe de cinco estudantes em ambiente universitário. |
| **OpenUP (Open Unified Process)** | Demanda governança estruturada por fases e esforço inicial na disciplina de modelagem de casos de uso e arquitetura na Elaboração, exigindo curva de aprendizado e formalismo documental superiores à capacidade de uma equipe acadêmica reduzida. |
| **Espiral (Boehm)** | Modelo orientado a projetos de grande porte com riscos críticos (aeroespaciais, defesa), demandando especialização em análise formal de riscos e alto custo gerencial. |
| **Feature Driven Development (FDD)** | Pressupõe equipe previamente sênior em modelagem orientada a objetos e domínio de negócio mapeado logo na largada do projeto. |
| **Kanban Isolado** | Embora ágil, prioriza fluxo contínuo para suporte e manutenção, carecendo de ritos temporais para sincronizar os prazos pedagógicos das quatro entregas do semestre. |
| **Frameworks de Escala (SAFe, LeSS)** | Projetados para coordenar dezenas de equipes simultâneas; criam complexidade administrativa desnecessária para uma única equipe de desenvolvimento. |