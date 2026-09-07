# 4. Estratégias de engenharia de software

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Seções 4, 5, 6 e 7 redigidas para o site | Equipe CyberSetor |
| 06/09/2026 | 1.3 | Refatoração e melhoria na apresentação e estrutura da seção 4 | Equipe CyberSetor |
| 07/09/2026 | 1.4 | Adequação da classificação do Ciclo de Vida | Equipe CyberSetor |

A partir do cenário diagnosticado na Seção 1 e da solução proposta na Seção 2, a equipe CyberSetor estabeleceu as decisões de estratégia de engenharia de software para o atendimento ao Instituto No Setor nas três camadas metodológicas distinguidas pelo referencial da disciplina: **abordagem**, **ciclo de vida** e **processo**.

---

## 4.1 Estratégia Priorizada

A estratégia para o projeto adota o **ScrumXP** como processo de desenvolvimento, fundamentando-se em uma abordagem **Ágil** e em um ciclo de vida **Ágil**. Essa combinação foi desenhada para conectar o contexto real da organização atendida à dinâmica acadêmica da disciplina, garantindo entregas frequentes com alto valor agregado, mitigação contínua de riscos e excelência técnica.

| Abordagem | Ciclo de Vida | Processo |
|---|---|---|
| **Ágil** | **Ágil** | **ScrumXP** |

### Abordagem: Ágil
A abordagem Ágil prioriza indivíduos e interações, software em funcionamento e colaboração contínua com os *stakeholders* em detrimento de processos engessados e documentação exaustiva prévia, mostrando-se ideal para a adaptação rápida às demandas em campo no Setor Comercial Sul (SCS).

**Por que escolher a Abordagem Ágil?**

- **Adaptação a Requisitos Emergentes:** Permite ajustar o escopo e o nível de detalhamento dos requisitos conforme novas necessidades emergem da convivência em campo com o parceiro, superando a rigidez da abordagem Preditiva (Dirigida por Planos).
- **Entregas Incrementais de Valor:** Disponibiliza funcionalidades essenciais para validação precoce e contínua com a coordenação pedagógica, sem postergar a visibilidade da solução funcional para o término do semestre.
- **Foco no Usuário de Campo:** Prioriza atender às necessidades operacionais reais (como chamada e presença em oficinas culturais e mutirões), calibrando a interface de acordo com o nível de letramento digital de quem atua na ponta.
- **Leveza Metodológica frente à Abordagem Híbrida:** Elimina a sobrecarga de manter especificações formais pesadas em paralelo aos ritos ágeis, concentrando a capacidade técnica de uma equipe de seis membros na entrega de valor para a organização.
  
### Ciclo de Vida: Ágil
O Ciclo de Vida Ágil estrutura o desenvolvimento em ciclos temporais curtos, regulares e de duração fixa (timeboxes/sprints quinzenais). Cada ciclo repete iterativamente todas as atividades essenciais da engenharia de software — elicitação, análise, projeto, codificação e testes —, gerando ao final de cada período um incremento funcional utilizável, testado e de valor demonstrável (MARSICANO, 2026).

Conforme o referencial da disciplina, o ciclo de vida ágil é um *superset* que engloba nativamente as dimensões iterativa e incremental, operando-as sob ritos temporais estritos, feedback contínuo em ciclos curtos e adaptação constante ao contexto real do parceiro.

**Por que escolher o Ciclo de Vida Ágil?**

- **Sincronia com Marcos Acadêmicos (Releases Fixas):** Adapta-se perfeitamente aos quatro pontos de controle da disciplina mantendo datas e recursos fixos, usando o escopo como variável de ajuste para garantir software funcional homologado a cada release.
- **Feedback Contínuo Baseado em Evidências:** Promove validações frequentes a cada 2 semanas diretamente com os educadores e gestores do Instituto No Setor por meio de incrementos executáveis, reduzindo divergências entre o problema real e a solução.
- **Mitigação Precoce de Riscos Sociotécnicos:** Expõe precocemente desafios de integração técnica, usabilidade e modelagem de regras de negócio, permitindo refatorações contínuas e evolução adaptativa da arquitetura sem retrabalho tardio.

### Processo: ScrumXP
O **ScrumXP** resulta da união de dois processos ágeis consagrados: o **Scrum**, que atua como arcabouço de gestão fornecendo papéis, timeboxes, cerimônias e foco no valor do negócio; e o **eXtreme Programming (XP)**, que fornece as práticas técnicas de engenharia de software para garantir que o código seja limpo, testável e sustentável (MARSICANO, 2026). O Scrum responde por *quando* e por *quem* o trabalho é executado; o XP responde por *como* a solução é tecnicamente construída.

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
     - Implementar funcionalidades com sessões de programação em pares (*Pair Programming*).
     - Assegurar a integração contínua (*Continuous Integration*) e a refatoração constante do código.

3. **Revisão e Validação com o Cliente (Sprint Review)**
   - **Objetivo:** Demonstrar o incremento funcional construído e validar o cumprimento dos critérios de aceitação.
   - **Atividades:**
     - Apresentar o software em funcionamento às lideranças e educadores da organização.
     - Coletar feedbacks e percepções de usabilidade dos usuários.
     - Repriorizar e refinar o Product Backlog com base no retorno obtido.

4. **Melhoria Contínua e Transição (Retrospectiva e Fechamento)**
   - **Objetivo:** Aperfeiçoar os processos internos de trabalho da equipe e consolidar a entrega do marco da disciplina.
   - **Atividades:**
     - Executar a Sprint Retrospective para analisar sucessos, gargalos e planos de ação.
     - Atualizar a documentação viva no repositório e registrar as lições aprendidas.
     - Gerar as tags de versão e disponibilizar o incremento no ambiente de testes.

#### Práticas Selecionadas no ScrumXP
- **Práticas de Gestão (Scrum):**
  - *Product Backlog Priorizado:* Repositório único de requisitos gerenciado no GitHub Projects, ordenado pelo impacto real na rotina da organização.
  - *Sprints de Duas Semanas:* Timeboxes fixos que conferem cadência e ritmo sustentável à equipe.
  - *Cerimônias Essenciais:* Reuniões de Planejamento de Sprint, Revisões com validação direta do cliente e Retrospectivas de processo.
- **Práticas Técnicas de Engenharia (XP):**
  - *Programação em Pares (Pair Programming):* Pareamento estruturado entre membros da equipe para nivelar conhecimentos técnicos e reduzir a densidade de defeitos.
  - *Integração Contínua (CI):* Automação de compilação, checagem de estilo e execução de suítes de testes a cada pull request.
  - *Testes de Aceitação:* Cenários verificáveis estruturados a partir dos critérios de aceitação das histórias de usuário.
  - *Propriedade Coletiva e Refatoração:* Todo membro da equipe é responsável pela qualidade geral da base de código, simplificando o design sempre que oportuno.

---

## 4.2 Quadro Comparativo: OpenUP x ScrumXP

A tabela a seguir compara o **OpenUP** (processo ágil baseado em arquitetura do Unified Process) e o **ScrumXP** (combinação ágil de gestão e engenharia técnica), fundamentando a adequação de cada um às particularidades do projeto.

| Critério | OpenUP (Open Unified Process) | ScrumXP (Scrum + Extreme Programming) |
|---|---|---|
| **Foco Principal** | Estabilidade arquitetural precoce, controle formal de riscos e documentação disciplinada por fases. | Ritmo sustentável, valor funcional entregue em ciclos curtos e feedback contínuo. |
| **Estrutura de Fases** | 4 fases lineares estruturadas (Iniciação, Elaboração, Construção e Transição) com iterações internas. | Sprints curtas e iterativas de 2 semanas, guiadas pelo Product Backlog e cerimônias ágeis. |
| **Foco em Arquitetura** | Forte: a arquitetura executável mínima deve ser estabilizada e validada na fase de Elaboração. | Evolutiva: arquitetura mínima necessária que se expande a cada sprint via refatoração contínua. |
| **Flexibilidade de Requisitos** | Moderada: requisitos são refinados por fase; mudanças arquiteturais tardias exigem alto esforço. | Alta: o backlog é repriorizado a cada sprint com base no feedback real do cliente. |
| **Práticas Técnicas de Engenharia** | Genéricas: prescreve orientações conceituais e casos de uso, sem detalhar rotinas de codificação. | Robustas e prescritivas: embutidas no processo (Pair Programming, CI, TDD e Testes de Aceitação). |
| **Documentação de Requisitos** | Formal por fase, com ênfase em Casos de Uso, Especificações Suplementares e Arquitetura. | Viva e enxuta: Histórias de Usuário, critérios de aceitação estruturados e protótipos de baixa fidelidade. |
| **Colaboração com o Cliente** | Concentrada nos marcos de transição de fase e na aprovação formal de especificações. | Constante e direta ao final de cada sprint, mediada por software em funcionamento. |
| **Curva de Aprendizado da Equipe** | Moderada a alta: requer disciplina na divisão formal de fases e modelagem prévia de arquitetura. | Baixa a moderada: curva acelerada pelo pareamento técnico diário e cerimônias enxutas. |
| **Aplicação no Contexto do Projeto** | **Desfavorável:** Exigiria congelamento de arquitetura antes da equipe dominar as particularidades operacionais da organização. | **Ideal:** Conecta a restrição de quatro entregas acadêmicas a sprints curtas, nivelando a inexperiência da equipe pelas práticas do XP. |

> **Síntese da Comparação:** Embora o OpenUP seja um processo ágil sólido, sua exigência de validação arquitetural prévia (fase de Elaboração) representa um risco para um projeto semestral com requisitos emergentes. O ScrumXP oferece a leveza gerencial necessária e provê as práticas técnicas essenciais para o contexto da organização.

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

> **Estratégia de Mitigação:** A equipe definiu um membro no papel de **Product Owner Interno**, encarregado de canalizar dúvidas, organizar pautas enxutas e assegurar comunicação assíncrona entre as reuniões quinzenais de validação, resguardando o tempo do parceiro.

### Análise de Alternativas Descartadas

A tabela a seguir consolida os critérios que justificaram o descarte formal das demais abordagens e processos de desenvolvimento analisados:

| Abordagem / Processo | Motivo Principal do Descarte |
|---|---|
| **Cascata (Waterfall) e Modelo V** | Pressupõem estabilidade total de requisitos desde o início e verificação formal tardia. Incompatíveis com a descoberta contínua de requisitos e as entregas parciais do semestre. |
| **Processo Unificado Completo (RUP)** | Sobrecarga de artefatos formais, fases extensas e curva de aprendizado burocrática inviável para uma equipe de seis estudantes em ambiente universitário. |
| **OpenUP (Open Unified Process)** | Exige estabilização arquitetural prematura nas fases iniciais (Elaboração), momento em que o entendimento do domínio social ainda está em maturação pela equipe. |
| **Espiral (Boehm)** | Modelo orientado a projetos de grande porte com riscos críticos (aeroespaciais, defesa), demandando especialização em análise formal de riscos e alto custo gerencial. |
| **Feature Driven Development (FDD)** | Pressupõe equipe previamente sênior em modelagem orientada a objetos e domínio de negócio mapeado logo na largada do projeto. |
| **Kanban Isolado** | Embora ágil, prioriza fluxo contínuo para suporte e manutenção, carecendo de ritos temporais para sincronizar os prazos pedagógicos das quatro entregas do semestre. |
| **Frameworks de Escala (SAFe, LeSS)** | Projetados para coordenar dezenas de equipes simultâneas; criam complexidade administrativa desnecessária para uma única equipe de desenvolvimento. |
