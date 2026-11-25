# 5. Engenharia de requisitos

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Seção redigida para o site | Equipe CyberSetor |
| 14/09/2026 | 1.2 | Ajustes na taxonomia de ER: artefatos de representação, critérios de aceitação objetivos, portões de qualidade e redução sistemática de ambiguidades | Caio Martins |
| 17/09/2026 | 1.3 | Taxonomia revista conforme o livro-texto: artefatos, eventos do Scrum e ferramentas separados das técnicas | Vinicius Vieira |
| 17/09/2026 | 1.4 | Registro das sessões de entrevista remetido à seção 7.2 | Equipe CyberSetor |
| 05/10/2026 | 1.5 | Revisão editorial: formatação direta, sem supressão de técnicas, artefatos ou mapeamento do ScrumXP | Rodrigo Henrique |
| 26/10/2026 | 1.6 | Observação direta das instalações, dos processos administrativos e das planilhas, com a observação da chamada prevista para o incremento de presença; caso de triangulação; prototipação evolutiva, com a homologação como protótipo avaliado pelo Instituto e os testes visuais como verificação da tela; termos de domínio definidos na seção 8, sem glossário à parte; requisitos que resultaram da observação | Vinicius Vieira |
| 13/11/2026 | 1.7 | Técnicas de representação, verificação e organização ligadas aos artefatos publicados: Rich Picture, mapa de stakeholders, modelo BPMN, Definition of Ready, matriz de rastreabilidade e atas; "ambiente de homologação com dados de teste" no lugar de "protótipo" e "prototipação" (ATA-2026-11-12, D1) | Maria Eduarda Marques |
| 16/11/2026 | 1.8 | Citações do livro-texto no sistema numérico das referências | Maria Eduarda Marques |
| 16/11/2026 | 1.9 | Atividades em cartões e fases do ScrumXP em fluxo, no lugar da tabela | Vinicius Vieira |
| 25/11/2026 | 1.10 | Finalidade, dúvida apoiada, versão e requisitos e histórias de cada representação, com o modelo BPMN como processo atual e a proposta de reorganização de 12/11 distinta do incremento implementado | Maria Eduarda Marques |

As seis atividades de Engenharia de Requisitos adotadas pela disciplina não são etapas sequenciais: elas se repetem e se entrelaçam ao longo do desenvolvimento ([1](../referencias.md#ref-1), §5.3). A 5.1 liga cada atividade às técnicas e aos artefatos publicados; a 5.2 mostra em que fase do ScrumXP cada uma acontece.

## 5.1 Atividades e Técnicas de ER

<div class="grid cards f3-compacto" markdown>

-   **Elicitação e descoberta**

    ---

    - Entrevista semiestruturada com o núcleo pedagógico, para delimitar o problema e separar necessidade de desejo (sessões na [seção 7.2](7-equipe-e-cliente.md#72-comunicacao))
    - Análise do relatório de prestação de contas e da planilha de controle, para ver o processo real
    - Observação direta e triangulação (abaixo)

-   **Análise e consenso**

    ---

    - Diagrama de Ishikawa das causas do problema ([seção 1.4](1-cenario-atual.md#14-identificacao-e-dimensionamento-empirico-do-problema))
    - Workshop de requisitos com as áreas competentes do Instituto ([1](../referencias.md#ref-1), §8.4.1)
    - MoSCoW: características em obrigatórias, desejáveis, opcionais e fora de escopo, para fundamentar o MVP
    - Valor de negócio × esforço técnico, para defender o corte de escopo com dados ([1](../referencias.md#ref-1), §8.4.2)
    - Negociação que reposiciona desejos frente às necessidades, sem recusa direta

-   **Declaração**

    ---

    - Histórias de usuário em linguagem de negócio, pelos critérios INVEST
    - Critérios de aceitação em lista de condições verificáveis, sem sintaxe rígida
    - Catálogo de regras de negócio (vagas, prazos, consentimentos), separado das histórias que as usam
    - Termos de domínio (instrumento, requisito do instrumento, meta, atividade, modalidade) nas [notas da seção 8](../requisitos/8-requisitos.md#85-notas-de-dominio-e-perguntas-chave-operacionais), sem glossário à parte

-   **Representação**

    ---

    - [Rich Picture](1-cenario-atual.md#13-rich-picture-e-mapeamento-do-fluxo-do-problema) do cenário atual ([1](../referencias.md#ref-1), §10.5)
    - [Mapa de stakeholders](1-cenario-atual.md#16-mapa-e-matriz-de-stakeholders) ([1](../referencias.md#ref-1), §§10.4–10.5)
    - [Modelo BPMN](../requisitos/b1-bpmn-processo-atual.md) do fluxo atual de inscrições e prestação de contas ([1](../referencias.md#ref-1), §10.6.2)
    - Ambiente de homologação com dados de teste (abaixo)

-   **Verificação e validação**

    ---

    - Revisão cruzada entre duplas: consistência, completude e testabilidade
    - [Definition of Ready](../requisitos/9-dor-dod.md#91-definition-of-ready-dor) como checklist antes do desenvolvimento
    - Testes de aceitação derivados dos critérios, automatizados quando possível
    - Percurso da história com o Instituto na homologação
    - Demonstração na Sprint Review, que realimenta o backlog

-   **Organização e atualização**

    ---

    - Product Backlog no GitHub Projects, refinado semanalmente
    - [Rastreabilidade bidirecional](../requisitos/8-requisitos.md#84-matriz-de-rastreabilidade-bidirecional) do problema ao critério de aceitação
    - Tabela de versões no início de cada documento
    - Atas sintéticas com controle de dados sensíveis (LGPD), no [índice de atas](../gestao/atas/index.md)

</div>

**Observação direta.** Instalações, processos administrativos (compras, cotações e registros de comprovação) e planilhas em uso, nas visitas à sede de 08/09 e 21/09/2026. Nos registros de comprovação, a execução se prova por relatório de atividade, foto e lista de presença, o que está na evidência ligada à meta ([RF32](../requisitos/8-requisitos.md#rf32), [RF33](../requisitos/8-requisitos.md#rf33)) e nas comprovações por modalidade ([RF10](../requisitos/8-requisitos.md#rf10)); a Matriz de Aquisição, também observada, ficou fora do produto, como no exemplo de triangulação abaixo. A observação de uma chamada em oficina é atividade de elicitação prevista para o incremento de presença em campo.

**Triangulação.** Cruza entrevistas, documentos e observações para separar a visão formal da organização da prática cotidiana. Exemplo: na visita de 21/09, a Matriz de Aquisição foi apontada como o instrumento mais crítico da rotina administrativa; cruzada com o escopo acordado em 08/09, que deixa o controle financeiro fora do produto, ela não virou requisito funcional e ficou como ponto em aberto, com a fronteira a definir com a área administrativo-financeira ([seção 8.6](../requisitos/8-requisitos.md#86-pontos-em-aberto-e-auditoria-de-lacunas), item 2).

**Homologação no lugar de protótipo.** A equipe não faz protótipo de baixa fidelidade em ferramenta de desenho. O esboço de tela orienta a dupla e não é publicado; o Instituto avalia o sistema publicado no ambiente de homologação, com dados de teste; as referências dos testes visuais, em 360 e 1280 px, verificam a tela.

**Para que serve cada representação.** As representações têm finalidades diferentes: umas retratam o trabalho como ele é feito hoje, outras o comportamento que o produto passa a ter. A tabela diz a dúvida que cada uma ajuda a resolver, a que versão ela corresponde e onde ela se concretiza em requisitos e histórias.

| Representação | O que retrata | Dúvida que ajuda a resolver | Versão | Onde se concretiza |
|---|---|---|---|---|
| [Rich Picture](1-cenario-atual.md#13-rich-picture-e-mapeamento-do-fluxo-do-problema) | Cenário atual, observado | Quem participa do ciclo do projeto financiado e em que ponto a informação se perde | Seção 1, refeito em 28/09/2026 com o que se observou em 08/09 e 21/09 | Problema da [seção 1.4](1-cenario-atual.md#14-identificacao-e-dimensionamento-empirico-do-problema) e objetivos da [seção 2](2-solucao-proposta.md) |
| [Mapa de stakeholders](1-cenario-atual.md#16-mapa-e-matriz-de-stakeholders) | Áreas e pessoas do Instituto, hoje | Quem usa, quem decide e quem valida cada conjunto de funcionalidades | Seção 1, atualizado em 30/09/2026 | Área competente por funcionalidade ([seção 7.3.1](7-equipe-e-cliente.md#731-area-competente-por-funcionalidade)) |
| [Modelo BPMN](../requisitos/b1-bpmn-processo-atual.md) | Processo atual (AS-IS), sem o sistema | Onde o fluxo de projetos, inscrições e prestação de contas trava | Anexo B1, modelado em 17/09/2026 com o observado em 08/09 e 15/09 | Gargalos G01 a G06, cobertos pelos requisitos da [seção 8.4.3](../requisitos/8-requisitos.md#843-sintese-de-cobertura) |
| [Histórias e critérios de aceitação](../requisitos/10-backlog.md#101-backlog-geral) | Comportamento futuro do produto, história a história | O que o sistema faz, para quem, e como se verifica que fez | Backlog vigente da seção 10.1 | Requisitos funcionais da [seção 8.2](../requisitos/8-requisitos.md#82-lista-de-requisitos-funcionais-rfs) |
| Ambiente de homologação com dados de teste | Incremento implementado | Se o comportamento construído atende ao uso real de cada área | O incremento demonstrado em cada sessão da [seção 10.2.8](../requisitos/10-backlog.md#1028-validacao-com-o-instituto) | Histórias concluídas pela [DoD](../requisitos/9-dor-dod.md#92-definition-of-done-dod) |
| Proposta de reorganização do projeto | Organização futura pedida em 12/11/2026: o projeto como porta de entrada, metas por etapa, comprovação ligada à meta e o vocabulário do Instituto | Se a nova organização desfaz o bloqueio de fluxo relatado em 12/11 | Proposta da Sprint 6, posterior ao incremento validado em 12/11 | Pedidos S1 e S3 a S7 da [ata de 12/11](../gestao/atas/2026-11-12-validacao-instituto.md); afeta as histórias de projeto e metas (HU-01a, HU-01b, HU-02a), a comprovação ligada à meta (HU-04a) e, pelo pedido S10, a confirmação da vaga (HU-07c), conforme o destino de cada pedido na [seção 8.6](../requisitos/8-requisitos.md#86-pontos-em-aberto-e-auditoria-de-lacunas) |

O modelo BPMN continua sendo o retrato do processo observado: a reorganização pedida em 12/11 muda o produto, e não o processo que o Instituto executava antes dele. Validar uma representação também não valida outra: a aprovação da proposta de reorganização não cobre o comportamento implementado a partir dela, que volta ao Instituto na homologação ([seção 7.3.3](7-equipe-e-cliente.md#733-avaliacoes-realizadas-e-o-que-cada-uma-cobre)).

## 5.2 Engenharia de Requisitos e o ScrumXP

Várias atividades voltam em mais de uma fase. Os ritos estão em [Como trabalhamos](../gestao/como-trabalhamos.md#ciclo).

<div class="f3-fluxo" markdown>

1. **Planejamento da Release**
    - Elicitação: entrevista, documentos, observação, triangulação
    - Análise: Ishikawa, workshop, negociação
    - Representação: Rich Picture, stakeholders, BPMN
    - Declaração: épicos, histórias, termos de domínio
    - *Resulta em:* problema acordado, cenário modelado e backlog inicial
2. **Planejamento da Sprint**
    - Análise: MoSCoW, valor × esforço
    - Declaração: critérios de aceitação, regras de negócio
    - Representação: esboço da dupla, fluxo da tela nos critérios
    - *Resulta em:* Sprint Backlog priorizado, MVP recortado, itens verificáveis
3. **Execução da Sprint**
    - Elicitação: dúvidas com o Product Owner interno; as de domínio vão à validação seguinte
    - Verificação: revisão cruzada, checklist, testes de aceitação e visuais
    - Organização: backlog e matriz de rastreabilidade
    - *Resulta em:* requisitos verificáveis e rastreáveis
4. **Revisão da Sprint**
    - Validação: demonstração e percurso na homologação com dados de teste
    - Declaração: ajuste de histórias e critérios, negociação
    - *Resulta em:* atendimento à necessidade real confirmado
5. **Retrospectiva da Sprint**
    - Organização: lições aprendidas (seção 11)
    - *Resulta em:* rotinas de ER ajustadas
6. **Próxima Release**
    - Elicitação e análise: alinhamento com o Instituto, MoSCoW, valor × esforço
    - Organização: controle de versões, refinamento
    - *Resulta em:* backlog reordenado e Documento de Visão atualizado

</div>

??? note "Tabela da 5.2"
    | Fase do ScrumXP | Atividade de ER | Prática | Técnica | Resultado esperado |
    |---|---|---|---|---|
    | **Planejamento da Release** | Elicitação e Descoberta | Imersão no contexto | Entrevista · Análise de documentos · Observação direta · Triangulação | Entendimento das dores e Documento de Visão consolidado. |
    | | Análise e Consenso | Delimitação de escopo | Ishikawa · Workshop de requisitos · Negociação | Problema central acordado com o Instituto. |
    | | Representação | Representação sistêmica | Rich Picture · Mapa de stakeholders · BPMN | Cenário atual modelado e validado. |
    | | Declaração | Escrita a valor | Épicos · Histórias de usuário · Termos de domínio na seção 8 | Product Backlog inicial estruturado. |
    | **Planejamento da Sprint** | Análise e Consenso | Priorização | MoSCoW · Avaliação técnica × valor de negócio | Sprint Backlog priorizado e MVP recortado. |
    | | Declaração | Detalhamento | Critérios de aceitação · Regras de negócio | Itens verificáveis e catalogados para código. |
    | | Representação | Desenho da interface | Esboço de tela da dupla · Fluxo da tela nos critérios de aceitação | Entendimento da interface antes da construção. |
    | **Execução da Sprint** | Elicitação e Descoberta | Elicitação contínua | Dúvidas operacionais com o Product Owner interno · Alinhamento de domínio com o Instituto | Lacunas operacionais destravadas; dúvidas de domínio encaminhadas à próxima validação com o Instituto. |
    | | Verificação e Validação | Inspeção interna | Revisão cruzada · Checklist de qualidade · Testes de aceitação · Testes visuais em 360 e 1280 px | Ambiguidades reduzidas e requisitos verificáveis. |
    | | Organização e Atualização | Gestão de backlog | Backlog no GitHub Projects · Matriz de rastreabilidade | Requisitos rastreáveis do problema ao teste. |
    | **Revisão da Sprint** | Verificação e Validação | Validação externa | Sprint Review com demonstração · Validação no ambiente de homologação com dados de teste | Confirmação de atendimento à necessidade real. |
    | | Declaração | Absorção de feedback | Ajuste de histórias e critérios · Negociação | Histórias ajustadas ao entendimento mais atual. |
    | **Retrospectiva da Sprint** | Organização e Atualização | Melhoria de processo | Registro de lições aprendidas (seção 11) | Ajustes nas rotinas de ER da equipe. |
    | **Planejamento da Próxima Release** | Elicitação / Análise | Refinamento / Repriorização | Alinhamento com o Instituto · MoSCoW · Avaliação técnica × valor de negócio | Backlog reordenado para o próximo ciclo. |
    | | Organização e Atualização | Atualização documental | Controle de versões · Refinamento | Documento de Visão atualizado. |
