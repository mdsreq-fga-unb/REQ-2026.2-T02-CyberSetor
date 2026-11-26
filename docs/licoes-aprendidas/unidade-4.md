# 11. Lições aprendidas — Unidade 4

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 26/11/2026 | 1.0 | Registro das lições aprendidas das Sprints 5 e 6 para a entrega da Unidade 4, cobrindo contribuições, dificuldades, pontos fortes, melhorias, tensões e endereçamento dos débitos da Unidade 3 | Rodrigo Henrique |

Durante a Unidade 4 (Sprints 5 e 6), a equipe concentrou esforços na validação em uso com o Instituto Cultural e Social No Setor em ambiente de homologação, na remodelação estrutural decorrente desse retorno e no fechamento dos apontamentos metodológicos e de rastreabilidade herdados da Unidade 3.

## 1. Contribuições e pontos fortes

- **Validação em uso na homologação com contas de teste ([12/11/2026](../gestao/atas/2026-11-12-validacao-instituto.md)):** em vez de restringir o encontro a uma demonstração guiada pela equipe, as representantes do Instituto testaram o sistema antes da reunião e trouxeram apontamentos tela a tela, revelando diferenças reais de nomenclatura, organização por metas/equipes e acesso pelo celular que não haviam aparecido nas entrevistas iniciais.
- **Triagem disciplinada por valor, esforço e DoR:** as vinte observações levantadas na validação de 12/11 (`S1` a `S20`) passaram por triagem formal antes de entrar em desenvolvimento, separando ajustes prioritários do escopo vigente, itens dependentes de confirmação com o cliente e pedidos fora de escopo (como rotinas administrativo-financeiras de guarda de notas fiscais e cadastro de fornecedores).
- **Automação de conferência documental e suítes multi-camada no código:** o amadurecimento dos scripts de verificação do site (`pytest` sobre hooks e conferência cruzada com `mkdocs build --strict`) e das suítes de testes unitários, de contrato (`Supertest`), de interface (`Testing Library` e `Playwright`) e de acessibilidade na API e no front-end deu segurança para alterar requisitos e código na reta final sem regressões silenciosas.
- **Papel ativo do Product Owner e do Scrum Master na mediação com o cliente:** a atuação contínua de Maria Eduarda Marques (PO interno) e Vinicius Vieira (Scrum Master), com apoio de toda a equipe (Caio Martins, Daniel Batista e Rodrigo Henrique), manteve a rastreabilidade entre os acordos com o Instituto, as issues de backlog e os critérios de aceitação.

## 2. Dificuldades enfrentadas e ações de melhoria

| Dificuldade / ponto de melhoria | Impacto observado na Unidade 4 | Ação de melhoria adotada ou encaminhada |
| :--- | :--- | :--- |
| **Descompasso entre o modelo inicial e a linguagem operacional do cliente** | O sistema estruturava o fluxo em torno de "instrumento" e "requisitos", enquanto o Instituto trabalha tendo "projeto", número do processo SEI e "meios de aferição" como referência principal. | Priorização na Sprint 6 da remodelação estrutural das telas e entidades centrais (`S1`, `S3`–`S7`), mantendo as decisões provisórias restantes explícitas na seção [8.6](../requisitos/8-requisitos.md#86-pontos-em-aberto-e-auditoria-de-lacunas). |
| **Falha de acesso pelo celular identificada apenas no uso em campo** | Na sessão de 12/11/2026 (`S20`), representantes do Instituto não conseguiram autenticar pelo celular em homologação, restringindo a validação móvel imediata. | Inclusão de correção prioritária na Sprint 6 com ampliação de testes em larguras móveis (`360 px`) antes da validação presencial final e do piloto da Escola Carnavalesca. |
| **Gargalo de revisão cruzada na reta final com duas aprovações obrigatórias** | Com frentes paralelas entre `api-develop`, `web-develop` e `docs-homologacao`, a exigência de duas aprovações retardava a integração de ajustes curtos e documentais. | Ajuste formal da regra na Sprint 6 para uma aprovação por pull request, preservando a obrigatoriedade de revisão independente e a proibição de auto-merge. |
| **Lacunas de rastreabilidade e status apontadas na avaliação da Unidade 3** | A avaliação da Unidade 3 evidenciou que partes da documentação ligavam histórias apenas ao planejamento, mantinham itens sem atualização explícita de status e precisavam reforçar evidências de cronograma, DoR/DoD e V&V. | Revisão coordenada da documentação na Sprint 6 direcionando rastros de HUs para a gestão de andamento, detalhando a conferência objetiva de DoD nas issues do MVP e registrando o percurso contínuo das decisões de ER na seção 8.6. |

## 3. Tensões e contradições gerenciadas

- **Adaptação ao fluxo do cliente vs. estabilidade do MVP no fim do semestre:** atender integralmente às vinte solicitações de 12/11 comprometeria a entrega e a estabilidade até o fechamento da disciplina. A equipe resolveu a tensão separando o que corrigia o fluxo essencial do MVP (remodelação centrada em projeto e meios de aferição e correção do acesso móvel) do que dependia de nova rodada de definição ou pertencia a módulos externos ao escopo (rotina administrativo-financeira e expansão de perguntas livres sem restrição LGPD).
- **Pedidos operacionais por conveniência vs. privacidade e proteção de dados (LGPD / `RNF05`):** demandas como perguntas livres no formulário público e abertura de dados por pessoa exigiram contrapeso explícito contra a vedação a dados sensíveis sem finalidade legal definida e contra o compartilhamento indevido de informações de menores de idade.
- **Ritmo de entrega vs. rigor de revisão e qualidade:** para evitar commits apressados ou fusões sem revisão durante o fechamento das Sprints 5 e 6, a equipe manteve checagens determinísticas obrigatórias em todas as linhas de branch (`pnpm verify`, `pytest` e `mkdocs build --strict`), equilibrando o fluxo com PRs menores e critério de uma aprovação independente.

## 4. Endereçamento dos débitos e apontamentos da Unidade 3

Os principais débitos e oportunidades de melhoria identificados no fechamento da Unidade 3 foram endereçados ao longo da Sprint 6 com as seguintes frentes de atualização:

1. **Rastreabilidade e processo de ER:** explicitação da árvore de rastreabilidade na seção [8.4](../requisitos/8-requisitos.md), distinção entre cobertura especificada e atendimento por recorte na `8.4.3`, quadro contínuo de transformação das decisões de ER (de 08/09 a 12/11/2026) na `8.6` e redirecionamento do rastreamento das HUs para a página de gestão que demonstra o andamento real das histórias.
2. **Status de RFs, RNFs, Backlog, DoR e DoD:** atualização das listas de requisitos e do [Backlog do Produto](../requisitos/10-backlog.md), alinhamento das seções de [DoR e DoD](../requisitos/9-dor-dod.md) e registro objetivo da conferência de critérios de aceitação, pull requests e suítes de testes nas issues abertas do MVP.
3. **Verificação, validação, representação e organização do site:** reforço da estratégia e aplicação de V&V em conjunto com os checklists e conferências automatizadas, revisão da modelagem e criação da aba específica com a declaração das ferramentas e do uso responsável de IA no projeto.
4. **Cronograma, visibilidade do quadro e apresentação guiada pelas HUs:** consolidação do registro de execução das sprints no cronograma, exposição do acompanhamento do projeto para consulta externa e estruturação da apresentação final da Unidade 4 orientada história a história (definição da HU, critérios e evidência correspondente).
