# 5. Engenharia de requisitos

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Seções 4, 5, 6 e 7 redigidas para o site | Equipe CyberSetor |
| 14/09/2026 | 1.3 | Ajustes na taxonomia de ER: artefatos de representação, critérios de aceitação objetivos, portões de qualidade e redução sistemática de ambiguidades (Issue #23) | Equipe CyberSetor |

As seis atividades da Engenharia de Requisitos adotadas pela disciplina (elicitação e descoberta, análise e consenso, declaração, representação, verificação e validação, organização e atualização) não são etapas sequenciais. Elas se repetem e se entrelaçam ao longo do ciclo de desenvolvimento. Esta seção associa cada atividade às técnicas que a equipe usará no projeto e, em seguida, mapeia essas técnicas nas fases do ScrumXP.

## 5.1 Atividades e Técnicas de ER

**Elicitação e Descoberta**

- **Entrevista semiestruturada:** conversas com as representantes do núcleo pedagógico, com roteiro aberto, para compreender o domínio, delimitar o problema e distinguir necessidades de desejos. A primeira ocorreu em 20/08 e a próxima será presencial, na sede do Instituto.
- **Análise de documentos existentes:** leitura do relatório de prestação de contas e de uma planilha de controle reais do Instituto, que são os artefatos que descrevem o processo atual como ele de fato acontece.
- **Observação direta:** acompanhamento de uma oficina em campo para ver a chamada e o registro acontecendo, acesso ao que a entrevista não revela.
- **Triangulação:** cruzamento do que foi dito na entrevista com o que os documentos mostram e com o que foi observado, para separar a visão formal da organização da prática cotidiana.

**Análise e Consenso**

- **Diagrama de Ishikawa:** organização das causas do problema central da seção 1.4 por categoria, para delimitar o que a solução ataca.
- **Workshop de priorização:** sessão com a coordenação do Instituto para ordenar características e resolver divergências entre quem gerencia e quem opera as atividades.
- **MoSCoW:** classificação das características de produto em obrigatórias, desejáveis, opcionais e fora de escopo, base da definição do MVP na Unidade 2.
- **Matriz valor de negócio × esforço técnico:** cruzamento do valor percebido pelo Instituto com o esforço estimado pela equipe, para defender o corte de escopo com dados.
- **Negociação:** condução das conversas em que um desejo do cliente é reposicionado em relação à necessidade identificada, sem recusa.

**Declaração**

- **Histórias de usuário:** requisitos escritos na perspectiva de quem usa, em linguagem não técnica, seguindo os critérios INVEST.
- **Critérios de aceitação:** lista de condições objetivas, observáveis e mensuráveis associadas a cada história, definindo o comportamento esperado, restrições e regras sem impor sintaxe rígida de cenários, tornando o requisito verificável.
- **Catálogo de regras de negócio:** registro de regras como limite de vagas, prazo de inscrição, consentimento e cálculo de carga horária, separadas das histórias que as usam.
- **Glossário:** definição dos termos que o Instituto e a equipe usam de formas diferentes, como atividade, oficina, participante, facilitador, presença e meta.

**Representação**

- **Modelagem conceitual livre:** técnica de diagramação de sistemas suaves para representar os fluxos informais e limites do cenário atual, gerando o artefato Rich Picture (seção 1.3).
- **Mapeamento de papéis e relações:** técnica de identificação e categorização de partes interessadas para situar os envolvidos e suas relações com a solução, originando o mapa de stakeholders (seção 1.6).
- **Modelagem de processos de negócio:** técnica de mapeamento de fluxos para elaborar o modelo do processo atual de inscrição, presença e prestação de contas em notação BPMN, delimitando onde a solução intervém.
- **Modelagem de casos de uso:** técnica de representação semiformal para mapear as interações de cada perfil com o sistema, gerando especificações e diagramas de casos de uso.
- **Prototipação de baixa fidelidade:** técnica de desenho preliminar de interfaces para alinhamento visual antes da implementação, gerando sketches e mockups das telas de inscrição e registro.

**Verificação e Validação**

- **Revisão cruzada entre duplas:** cada dupla revisa as seções e histórias escritas pela outra, verificando consistência, completude e testabilidade.
- **Checklist de qualidade:** lista de verificação aplicada a cada história para inspecionar critérios de completude, clareza e testabilidade antes do desenvolvimento.
- **Sessão de validação com protótipo:** apresentação de mockups e do incremento ao Instituto para confirmar que o requisito é o certo.
- **Testes de aceitação:** testes derivados da lista de critérios de aceitação, automatizados quando possível, que verificam se o comportamento implementado no software atende ao que foi especificado.
- **Sprint Review:** demonstração do incremento ao Instituto ao final de cada sprint, com o feedback registrado no backlog.

**Organização e Atualização**

- **Product Backlog no GitHub Projects:** repositório único dos requisitos, versionado e priorizado, com refinamento semanal.
- **Matriz de rastreabilidade:** identificadores que ligam problema, objetivo específico, característica de produto, requisito, história e critério de aceitação.
- **Histórico de versões do documento:** tabela de versões no início de cada seção deste documento, registrando o que mudou e quando.
- **Atas de reunião:** registro das decisões de cada reunião, com transcrição automática, publicado na página de atas.

## 5.2 Engenharia de Requisitos e o ScrumXP

| Fase do ScrumXP | Atividade de ER | Prática | Técnica | Resultado esperado |
|---|---|---|---|---|
| **Planejamento da Release** | Elicitação e Descoberta | Imersão no contexto do cliente | Entrevista semiestruturada · Análise de documentos existentes · Observação direta · Triangulação | Entendimento do processo atual e das dores; Documento de Visão |
| | Análise e Consenso | Delimitação do problema e do escopo | Diagrama de Ishikawa · Workshop de priorização · Negociação | Problema central e escopo acordados com o Instituto |
| | Representação | Representação sistêmica | Modelagem conceitual livre · Mapeamento de papéis e relações · Modelagem de processos de negócio | Cenário atual e processos modelados e validados |
| | Declaração | Escrita orientada a valor | Épicos · Histórias de usuário · Glossário | Product Backlog inicial em linguagem do cliente |
| **Planejamento da Sprint** | Análise e Consenso | Priorização | MoSCoW · Matriz valor de negócio × esforço técnico | Sprint Backlog priorizado; MVP definido na Unidade 2 |
| | Declaração | Detalhamento do item | Critérios de aceitação · Catálogo de regras de negócio | Itens de backlog detalhados com critérios verificáveis e regras catalogadas |
| | Representação | Prototipação leve | Prototipação de baixa fidelidade · Modelagem de casos de uso | Entendimento compartilhado da interface e das interações antes de codificar |
| **Execução da Sprint** | Elicitação e Descoberta | Elicitação contínua | Dúvidas pontuais com o Product Owner interno e com o Instituto | Lacunas resolvidas sem interromper a sprint |
| | Verificação e Validação | Inspeção e verificação interna | Revisão cruzada entre duplas · Checklist de qualidade · Análise de consistência entre história e mockup · Testes de aceitação | Redução sistemática de ambiguidades e requisitos verificáveis |
| | Organização e Atualização | Gestão do backlog | Product Backlog no GitHub Projects · Matriz de rastreabilidade | Requisitos rastreáveis do problema ao critério de aceitação |
| **Revisão da Sprint** | Verificação e Validação | Validação com o cliente | Sprint Review · Sessão de validação com protótipo | Confirmação de que a solução atende às necessidades reais do cliente; feedback registrado |
| | Declaração | Incorporação do feedback | Ajuste de histórias e critérios de aceitação · Negociação | Histórias ajustadas ao entendimento mais atual |
| **Retrospectiva da Sprint** | Organização e Atualização | Melhoria do processo de ER | Retrospectiva · Registro de lições aprendidas · Atas de reunião | Ajustes nas práticas de ER para o próximo ciclo; seção 11 do documento |
| **Planejamento da Próxima Release** | Elicitação e Descoberta | Refinamento estratégico | Workshop com o Instituto · Análise de documentos existentes | Novas necessidades identificadas |
| | Análise e Consenso | Repriorização por valor | MoSCoW · Matriz valor de negócio × esforço técnico | Backlog reordenado para o próximo ciclo |
| | Organização e Atualização | Atualização do documento | Histórico de versões do documento · Refinamento semanal do backlog | Documento de Visão e backlog atualizados |

Elicitação, verificação e validação, e organização e atualização aparecem em mais de uma fase. Isso não é repetição: é a aplicação direta do entendimento de que as atividades da Engenharia de Requisitos são iterativas e entrelaçadas, e não etapas lineares.
