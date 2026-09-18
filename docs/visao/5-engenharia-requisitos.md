# 5. Engenharia de requisitos

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Seções 4, 5, 6 e 7 redigidas para o site | Equipe CyberSetor |
| 14/09/2026 | 1.3 | Ajustes na taxonomia de ER: artefatos de representação, critérios de aceitação objetivos, portões de qualidade e redução sistemática de ambiguidades (Issue #23) | Caio Martins |
| 17/09/2026 | 1.4 | Revisão da taxonomia conforme o livro-texto: artefatos de representação com o nome do livro; eventos do Scrum e ferramentas retirados da coluna de técnica; workshop de requisitos restaurado; cadência de validação alinhada à seção 7.2 (issue #23) | Vinicius Vieira |

As seis atividades da Engenharia de Requisitos adotadas pela disciplina (elicitação e descoberta, análise e consenso, declaração, representação, verificação e validação, organização e atualização) não são etapas sequenciais. Elas se repetem e se entrelaçam ao longo do ciclo de desenvolvimento. Esta seção associa cada atividade às técnicas que a equipe usará no projeto e, em seguida, mapeia essas técnicas nas fases do ScrumXP.

## 5.1 Atividades e Técnicas de ER

**Elicitação e Descoberta**

- **Entrevista semiestruturada:** conversas com as representantes do núcleo pedagógico, com roteiro aberto, para compreender o domínio, delimitar o problema e distinguir necessidades de desejos. A primeira ocorreu em 20/08 e a próxima será presencial, na sede do Instituto.
- **Análise de documentos existentes:** leitura do relatório de prestação de contas e de uma planilha de controle reais do Instituto, que são os artefatos que descrevem o processo atual como ele de fato acontece.
- **Observação direta:** acompanhamento de uma oficina em campo para ver a chamada e o registro acontecendo, acesso ao que a entrevista não revela.
- **Triangulação:** cruzamento do que foi dito na entrevista com o que os documentos mostram e com o que foi observado, para separar a visão formal da organização da prática cotidiana.

**Análise e Consenso**

- **Diagrama de Ishikawa:** organização das causas do problema central da seção 1.4 por categoria, para delimitar o que a solução ataca.
- **Workshop de requisitos:** sessão com as áreas competentes do Instituto em que se aplicam priorização e negociação para ordenar características e resolver divergências entre quem gerencia e quem opera as atividades (livro, §8.4.1).
- **MoSCoW:** classificação das características de produto em obrigatórias, desejáveis, opcionais e fora de escopo, base da definição do MVP na Unidade 2.
- **Avaliação técnica × valor de negócio:** matriz que cruza o valor percebido pelo Instituto com o esforço estimado pela equipe, para defender o corte de escopo com dados (livro, §8.4.2).
- **Negociação:** condução das conversas em que um desejo do cliente é reposicionado em relação à necessidade identificada, sem recusa.

**Declaração**

- **Histórias de usuário:** requisitos escritos na perspectiva de quem usa, em linguagem não técnica, seguindo os critérios INVEST.
- **Critérios de aceitação:** lista de condições objetivas, observáveis e mensuráveis associadas a cada história, definindo o comportamento esperado, restrições e regras sem impor sintaxe rígida de cenários, tornando o requisito verificável.
- **Catálogo de regras de negócio:** registro de regras como limite de vagas, prazo de inscrição, consentimento e cálculo de carga horária, separadas das histórias que as usam.
- **Glossário:** definição dos termos que o Instituto e a equipe usam de formas diferentes, como atividade, oficina, participante, facilitador, presença e meta.

**Representação**

- **Rich Picture:** artefato de representação sistêmica e informal do cenário atual (livro, §10.5), apresentado na seção 1.3.
- **Mapa de stakeholders:** artefato que situa os envolvidos e suas relações com a solução (livro, §§10.4–10.5), apresentado na seção 1.6.
- **Modelo do processo atual na notação BPMN:** BPMN é a notação (livro, §10.6.2); o artefato é o modelo do fluxo de inscrição, presença e prestação de contas como ocorre hoje, para localizar onde a solução intervém.
- **Protótipos de baixa fidelidade:** esboços de telas, propositalmente rústicos, usados como artefato de validação com o Instituto antes de codificar (livro, §10.5).

**Verificação e Validação**

- **Revisão cruzada entre duplas:** cada dupla revisa as seções e histórias escritas pela outra, verificando consistência, completude e testabilidade.
- **Checklist de qualidade:** lista de verificação aplicada a cada história para inspecionar critérios de completude, clareza e testabilidade antes do desenvolvimento.
- **Sessão de validação com protótipo:** apresentação de protótipos leves e do incremento ao Instituto para confirmar que o requisito é o certo.
- **Testes de aceitação:** testes derivados da lista de critérios de aceitação, automatizados quando possível, que verificam se o comportamento implementado no software atende ao que foi especificado.
- **Demonstração e validação com stakeholders:** apresentação do incremento às representantes do Instituto, realizada na Sprint Review (evento do Scrum), com o feedback registrado no backlog.

**Organização e Atualização**

- **Organização e atualização do Product Backlog:** repositório único dos requisitos, versionado e priorizado, com refinamento semanal; a ferramenta é o GitHub Projects.
- **Manutenção da rastreabilidade:** identificadores que ligam problema, objetivo específico, característica de produto, requisito, história e critério de aceitação, registrados em matriz de rastreabilidade.
- **Controle de versões e mudanças:** tabela de versões no início de cada seção deste documento, registrando o que mudou e quando.
- **Registro e atualização das decisões:** ata sintética de cada reunião, elaborada e revisada pela equipe com controle de dados sensíveis (LGPD) e publicada na página de atas, como evidência.

## 5.2 Engenharia de Requisitos e o ScrumXP

| Fase do ScrumXP | Atividade de ER | Prática | Técnica | Resultado esperado |
|---|---|---|---|---|
| **Planejamento da Release** | Elicitação e Descoberta | Imersão no contexto do cliente | Entrevista semiestruturada · Análise de documentos existentes · Observação direta · Triangulação | Entendimento do processo atual e das dores; Documento de Visão |
| | Análise e Consenso | Delimitação do problema e do escopo | Diagrama de Ishikawa · Workshop de requisitos · Negociação | Problema central e escopo acordados com o Instituto |
| | Representação | Representação sistêmica | Rich Picture · Mapa de stakeholders · Modelo do processo atual (notação BPMN) | Cenário atual e processos modelados e validados |
| | Declaração | Escrita orientada a valor | Épicos · Histórias de usuário · Glossário | Product Backlog inicial em linguagem do cliente |
| **Planejamento da Sprint** | Análise e Consenso | Priorização | MoSCoW · Avaliação técnica × valor de negócio | Sprint Backlog priorizado; MVP definido na Unidade 2 |
| | Declaração | Detalhamento do item | Critérios de aceitação · Catálogo de regras de negócio | Itens de backlog detalhados com critérios verificáveis e regras catalogadas |
| | Representação | Prototipação | Protótipos de baixa fidelidade | Entendimento compartilhado da interface e do fluxo antes de codificar |
| **Execução da Sprint** | Elicitação e Descoberta | Elicitação contínua | Dúvidas operacionais com o Product Owner interno e alinhamento de domínio com o Instituto | Lacunas operacionais destravadas; dúvidas de domínio encaminhadas à próxima validação com o Instituto |
| | Verificação e Validação | Inspeção e verificação interna | Revisão cruzada entre duplas · Checklist de qualidade · Análise de consistência entre história e protótipo · Testes de aceitação | Redução sistemática de ambiguidades e requisitos verificáveis |
| | Organização e Atualização | Gestão do backlog | Organização do Product Backlog (GitHub Projects) · Manutenção da rastreabilidade | Requisitos rastreáveis do problema ao critério de aceitação |
| **Revisão da Sprint** | Verificação e Validação | Validação com o cliente | Demonstração e validação com stakeholders (na Sprint Review) · Sessão de validação com protótipo | Confirmação de que a solução atende às necessidades reais do cliente; feedback registrado |
| | Declaração | Incorporação do feedback | Ajuste de histórias e critérios de aceitação · Negociação | Histórias ajustadas ao entendimento mais atual |
| **Retrospectiva da Sprint** | Organização e Atualização | Melhoria do processo de ER | Registro de lições aprendidas e das ações de melhoria, na Retrospectiva | Ajustes nas práticas de ER para o próximo ciclo; seção 11 do documento |
| **Planejamento da Próxima Release** | Elicitação e Descoberta | Refinamento estratégico | Alinhamento com o Instituto · Análise de documentos existentes | Novas necessidades identificadas |
| | Análise e Consenso | Repriorização por valor | MoSCoW · Avaliação técnica × valor de negócio | Backlog reordenado para o próximo ciclo |
| | Organização e Atualização | Atualização do documento | Controle de versões do documento · Refinamento semanal do backlog | Documento de Visão e backlog atualizados |

Elicitação, verificação e validação, e organização e atualização aparecem em mais de uma fase. Isso não é repetição: é a aplicação direta do entendimento de que as atividades da Engenharia de Requisitos são iterativas e entrelaçadas, e não etapas lineares.
