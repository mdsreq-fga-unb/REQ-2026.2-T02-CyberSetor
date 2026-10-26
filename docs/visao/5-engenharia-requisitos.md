# 5. Engenharia de requisitos

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Seção redigida para o site | Equipe CyberSetor |
| 14/09/2026 | 1.2 | Ajustes na taxonomia de ER: artefatos de representação, critérios de aceitação objetivos, portões de qualidade e redução sistemática de ambiguidades | Caio Martins |
| 17/09/2026 | 1.3 | Taxonomia revista conforme o livro-texto: artefatos, eventos do Scrum e ferramentas separados das técnicas | Vinicius Vieira |
| 17/09/2026 | 1.4 | Registro das sessões de entrevista remetido à seção 7.2 | Equipe CyberSetor |
| 05/10/2026 | 1.5 | Revisão editorial: formatação direta, sem supressão de técnicas, artefatos ou mapeamento do ScrumXP | Rodrigo Henrique |
| 26/10/2026 | 1.6 | Observação direta das instalações, dos processos administrativos e das planilhas, com a observação da chamada prevista para o incremento de presença; caso de triangulação; prototipação evolutiva, com a homologação como protótipo avaliado pelo Instituto e os testes visuais como verificação da tela | Vinicius Vieira |

As seis atividades da Engenharia de Requisitos adotadas pela disciplina (elicitação e descoberta, análise e consenso, declaração, representação, verificação e validação, organização e atualização) não são etapas sequenciais. Elas se repetem e se entrelaçam ao longo do ciclo de desenvolvimento. Esta seção associa cada atividade às técnicas que a equipe usará no projeto e mapeia essas técnicas nas fases do ScrumXP.

## 5.1 Atividades e Técnicas de ER

**Elicitação e Descoberta**

- **Entrevista semiestruturada:** Conversas com as representantes do núcleo pedagógico, com roteiro aberto, para compreender o domínio, delimitar o problema e distinguir necessidades de desejos (sessões registradas na seção 7.2).
- **Análise de documentos existentes:** Leitura do relatório de prestação de contas e da planilha de controle do Instituto para mapear o processo atual como ele de fato acontece.
- **Observação direta:** Observação das instalações, dos processos administrativos (compras, cotações e registros de comprovação) e das planilhas em uso, nas visitas à sede de 08/09 e 21/09/2026. A observação de uma chamada em oficina é atividade de elicitação prevista para o incremento de presença em campo.
- **Triangulação:** Cruzamento das entrevistas, documentos e observações para separar a visão formal da organização da prática cotidiana real. Exemplo: na visita de 21/09, a Matriz de Aquisição foi apontada como o instrumento mais crítico da rotina administrativa; cruzada com o escopo acordado em 08/09, que deixa o controle financeiro fora do produto, ela não virou requisito funcional e ficou como ponto em aberto, com a fronteira a definir com a área administrativo-financeira ([seção 8.6](../requisitos/8-requisitos.md#86-pontos-em-aberto-e-auditoria-de-lacunas), item 2).

**Análise e Consenso**

- **Diagrama de Ishikawa:** Organização das causas do problema central (seção 1.4) por categoria, delimitando o que a solução ataca.
- **Workshop de requisitos:** Sessão com as áreas competentes do Instituto aplicando priorização e negociação para ordenar características e resolver divergências (livro, §8.4.1).
- **MoSCoW:** Classificação das características em obrigatórias, desejáveis, opcionais e fora de escopo para fundamentar o MVP.
- **Avaliação técnica × valor de negócio:** Matriz cruzando o valor percebido pelo cliente com o esforço estimado pela equipe, defendendo o corte de escopo com dados (livro, §8.4.2).
- **Negociação:** Condução de conversas reposicionando desejos do cliente em relação às necessidades identificadas, sem recusa direta.

**Declaração**

- **Histórias de usuário:** Requisitos escritos na perspectiva do usuário, em linguagem de negócio, seguindo os critérios INVEST.
- **Critérios de aceitação:** Lista de condições objetivas e mensuráveis associadas a cada história, tornando o comportamento e as restrições verificáveis sem impor sintaxe rígida.
- **Catálogo de regras de negócio:** Registro das regras do domínio (limite de vagas, prazos, consentimentos), separadas das histórias que as usam.
- **Glossário:** Definição unificada de termos de domínio (atividade, oficina, participante, meta), evitando ambiguidades.

**Representação**

- **Rich Picture:** Representação sistêmica e informal do cenário atual (livro, §10.5), apresentada na seção 1.3.
- **Mapa de stakeholders:** Situação dos envolvidos e suas relações com a solução (livro, §§10.4–10.5), apresentada na seção 1.6.
- **Modelo BPMN:** Diagramação formal do fluxo atual de inscrições e prestação de contas, localizando onde a solução intervém (livro, §10.6.2).
- **Prototipação evolutiva:** O esboço de tela orienta a dupla e é material de trabalho, não publicado; a versão na homologação é o protótipo avaliado pelo Instituto na demonstração; as referências dos testes visuais, em 360 e 1280 px, são a verificação da tela.

**Verificação e Validação**

- **Revisão cruzada entre duplas:** Verificação de consistência, completude e testabilidade dos artefatos produzidos por outros pares.
- **Checklist de qualidade:** Lista de inspeção aplicada às histórias antes do desenvolvimento.
- **Validação do protótipo na homologação:** Percurso da história executado com o Instituto na versão publicada na homologação, para confirmar a adequação do requisito.
- **Testes de aceitação:** Verificações (automatizadas quando possível) derivadas dos critérios de aceitação.
- **Demonstração com stakeholders:** Apresentação do incremento funcional na Sprint Review (evento do Scrum), retroalimentando o backlog.

**Organização e Atualização**

- **Gestão do Product Backlog:** Repositório único versionado e priorizado no GitHub Projects, refinado semanalmente.
- **Rastreabilidade bidirecional:** Matriz ligando problemas a objetivos, características, requisitos, histórias e critérios de aceitação.
- **Controle de versões:** Tabelas históricas no início de cada documento rastreando evolução temporal.
- **Registro de decisões:** Atas sintéticas com controle de dados sensíveis (LGPD) publicadas como evidência.

## 5.2 Engenharia de Requisitos e o ScrumXP

Elicitação, verificação e validação, e organização e atualização aparecem em mais de uma fase, porque as atividades da Engenharia de Requisitos são iterativas e entrelaçadas, e não etapas sequenciais (MARSICANO, 2026, §5.3).

| Fase do ScrumXP | Atividade de ER | Prática | Técnica | Resultado esperado |
|---|---|---|---|---|
| **Planejamento da Release** | Elicitação e Descoberta | Imersão no contexto | Entrevista · Análise de documentos · Observação direta · Triangulação | Entendimento das dores e Documento de Visão consolidado. |
| | Análise e Consenso | Delimitação de escopo | Ishikawa · Workshop de requisitos · Negociação | Problema central acordado com o Instituto. |
| | Representação | Representação sistêmica | Rich Picture · Mapa de stakeholders · BPMN | Cenário atual modelado e validado. |
| | Declaração | Escrita a valor | Épicos · Histórias de usuário · Glossário | Product Backlog inicial estruturado. |
| **Planejamento da Sprint** | Análise e Consenso | Priorização | MoSCoW · Avaliação técnica × valor de negócio | Sprint Backlog priorizado e MVP recortado. |
| | Declaração | Detalhamento | Critérios de aceitação · Regras de negócio | Itens verificáveis e catalogados para código. |
| | Representação | Prototipação evolutiva | Esboço de tela da dupla · Fluxo da tela nos critérios de aceitação | Entendimento da interface antes da construção. |
| **Execução da Sprint** | Elicitação e Descoberta | Elicitação contínua | Dúvidas operacionais com o Product Owner interno · Alinhamento de domínio com o Instituto | Lacunas operacionais destravadas; dúvidas de domínio encaminhadas à próxima validação com o Instituto. |
| | Verificação e Validação | Inspeção interna | Revisão cruzada · Checklist de qualidade · Testes de aceitação · Testes visuais em 360 e 1280 px | Ambiguidades reduzidas e requisitos verificáveis. |
| | Organização e Atualização | Gestão de backlog | Backlog no GitHub Projects · Matriz de rastreabilidade | Requisitos rastreáveis do problema ao teste. |
| **Revisão da Sprint** | Verificação e Validação | Validação externa | Sprint Review com demonstração · Validação do protótipo na homologação | Confirmação de atendimento à necessidade real. |
| | Declaração | Absorção de feedback | Ajuste de histórias e critérios · Negociação | Histórias ajustadas ao entendimento mais atual. |
| **Retrospectiva da Sprint** | Organização e Atualização | Melhoria de processo | Registro de lições aprendidas (seção 11) | Ajustes nas rotinas de ER da equipe. |
| **Planejamento da Próxima Release** | Elicitação / Análise | Refinamento / Repriorização | Alinhamento com o Instituto · MoSCoW · Avaliação técnica × valor de negócio | Backlog reordenado para o próximo ciclo. |
| | Organização e Atualização | Atualização documental | Controle de versões · Refinamento | Documento de Visão atualizado. |
