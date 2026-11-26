# 2. Solução proposta

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão das seções 2.1 e 2.2 | Equipe CyberSetor |
| 15/09/2026 | 1.2 | Tratamento de dados pessoais, custo em três fases, topologia de produção, cópia de segurança e alcance da validação do cliente | Vinicius Vieira |
| 17/09/2026 | 1.3 | Cópia de segurança descrita como configuração prevista; guarda documental de dez anos com a norma citada; verbos dos objetivos específicos 05 e 06 alinhados entre título e texto; cabeçalho da tabela de características sem colunas homônimas; blocos de equipe, prazo e conhecimento técnico da 2.6 sem repetir as seções 6, 7.1 e a matriz de competências | Vinicius Vieira |
| 05/10/2026 | 1.4 | Revisão editorial: aplicação de formatação estrutural (listas e espaçamentos) nas seções 2.6 e 2.7 para fluidez de leitura, mantendo a íntegra do conteúdo analítico | Rodrigo Henrique |
| 19/10/2026 | 1.5 | Equipe atual de cinco integrantes | Maria Eduarda Marques |
| 26/10/2026 | 1.6 | O que a primeira entrega demonstra (2.1); exportação do projeto em planilha aberta (RF38) e cópia integral de dados e arquivos sob pedido e na transferência (RNF19) na CP8, na 2.5 e na 2.6; interface publicada no Coolify e testes com Vitest, com testes visuais (2.4); registro em campo com quedas pontuais e lançamento posterior até a operação sem conexão (2.6); ensaio de restauração descrito pelo RNF18 (2.6); registro sem conexão e requisitos de campo remetidos à seção 8; administração após a disciplina como questão aberta (2.6); benefícios sem promessa de registro contínuo nem de tempo real (2.7); políticas de operação sem conexão, dados pessoais, cópia de segurança e transferência explicadas uma vez na 2.6, com os requisitos que as verificam, e remetidas na 2.3, na 2.4 e na 2.5; acompanhamento das metas na 2.7 pelo que cada entrega traz | Vinicius Vieira |
| 11/11/2026 | 1.7 | Resumos no início da 2.4 e da 2.6; políticas de cópia de segurança, operação sem conexão e administração remetidas da 2.4 à 2.6; recorte remetido à 10.2.6; itens fora do MVP marcados por incremento na 2.5, na 2.6 e na 2.7 | Maria Eduarda Marques |
| 16/11/2026 | 1.8 | Motivação e plano do uso de dados de teste na homologação, na política de dados pessoais da 2.6 (ATA-2026-11-12, D4) | Maria Eduarda Marques |
| 16/11/2026 | 1.9 | CP8 sem índice de evidências na primeira versão, que chega no incremento 2; menores de idade como possibilidade, coerente com a confirmação pendente; entrada dos dados reais sem remissão à ATA-2026-11-12, que não registra essa decisão | Vinicius Vieira |
| 16/11/2026 | 2.0 | Seção enxugada e visual: resumo no topo, objetivos e características em cartões, tecnologias em blocos, comparação em quadro, políticas de operação recolhíveis com os requisitos que as verificam e benefícios em cartões, sem mudar decisões; fora do quadro da 2.3, características citadas pelo nome | Vinicius Vieira |
| 25/11/2026 | 2.1 | Alcance explícito da validação por área competente (2.1 e 2.6) e distinção entre registros conferidos pelo Instituto e atas preliminares em conferência | Rodrigo Henrique |

!!! abstract "Em resumo"
    Base única para o ciclo do projeto financiado, do instrumento e das metas ao relatório de execução. Seis objetivos (2.2), oito características (2.3), pilha sem custo para o Instituto durante a disciplina (2.4), fluxo único de dados ligado às metas como diferencial (2.5) e quatro políticas de operação como condição de viabilidade (2.6).

## 2.1 Objetivo Geral do Produto

Centralizar numa base única as informações operacionais e as evidências de execução do Instituto No Setor, com o dado coletado na origem, da inscrição ao arquivamento das comprovações, e automatizar a apuração de resultados para a prestação de contas de editais e parcerias. Efeito esperado: menos consolidação manual de planilhas e mais previsibilidade sobre os compromissos firmados.

A primeira entrega demonstra os dois ciclos da [seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos): do instrumento às metas com resultado alcançado e ao relatório com justificativas, e da atividade à lista de inscritos. Presença, evidências e apuração automática vêm nos incrementos seguintes. O recorte foi aprovado pelo núcleo pedagógico, sem substituir a validação específica das demais áreas competentes — em especial da área administrativo-financeira sobre o relatório e a planilha exportada ([seção 7.3.1](7-equipe-e-cliente.md#731-area-competente-por-funcionalidade) e [seção 10.2.8](../requisitos/10-backlog.md#1028-validacao-com-o-instituto)).

## 2.2 Objetivos Específicos (OE) do Produto

<div class="grid" markdown>

<a id="oe01"></a>**OE01 - Eliminar a dispersão do registro de projetos, atividades e participantes** - Reduzir o retrabalho e o risco de inconsistência gerados pelo controle disperso em múltiplas planilhas, unificando o cadastro em uma única base de dados.
{ .card }

<a id="oe02"></a>**OE02 - Agilizar a inscrição de participantes** - Reduzir o tempo e o esforço de digitação manual de dados cadastrais, tanto para os participantes quanto para a equipe de coordenação.
{ .card }

<a id="oe03"></a>**OE03 - Eliminar a transcrição manual de presenças** - Reduzir o risco de perda e erro no registro de presença ao assegurar que o dado nasça digital no momento e no local em que a atividade ocorre.
{ .card }

<a id="oe04"></a>**OE04 - Antecipar o acompanhamento das metas** - Aumentar a visibilidade da coordenação sobre o progresso das metas institucionais, permitindo identificar riscos de descumprimento antes do fechamento do ciclo.
{ .card }

<a id="oe05"></a>**OE05 - Mitigar o risco de perda de evidências de execução** - Manter os comprovantes de realização das atividades organizados e acessíveis para consulta e prestação de contas perante editais e parceiros.
{ .card }

<a id="oe06"></a>**OE06 - Reduzir o esforço de prestação de contas** - Agilizar a elaboração de relatórios de metas e atividades por período, a partir dos dados já registrados, em lugar da montagem manual de planilhas a cada edital.
{ .card }

</div>

Cada objetivo específico responde a um elemento do problema descrito na seção 1.4. A dispersão do registro em múltiplas planilhas é endereçada pelo [OE01](#oe01). O retrabalho de digitação dos dados de participantes é endereçado pelo [OE02](#oe02). A transcrição posterior de listas de presença preenchidas em papel é endereçada pelo [OE03](#oe03). A impossibilidade de acompanhar, ao longo da execução, o atingimento das metas pactuadas em editais é endereçada pelo [OE04](#oe04). A dispersão das evidências que comprovam a realização das atividades é endereçada pelo [OE05](#oe05). E a elaboração manual dos relatórios de prestação de contas é endereçada pelo [OE06](#oe06). O conjunto dos seis objetivos cobre a cadeia completa identificada como origem dos gargalos, da inscrição do participante à entrega do relatório final ao financiador.

## 2.3 Características de Produto (mapeadas com os Objetivos Específicos do Produto)

Características preliminares; o recorte vigente está na [seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos). Cada cartão traz o valor de negócio e os objetivos que atende.

<div class="f3-cartoes f3-cartoes--cp" markdown>

| CP | Característica de Produto | Descrição resumida | VN | Valor de negócio principal | Objetivo específico atendido | Objetivo específico secundário |
|---|---|---|---|---|---|---|
| <span id="cp1">CP1</span> | Gestão de projetos e metas | Cadastro dos projetos com suas metas, indicadores, valores a alcançar, prazos e origem do compromisso, seja edital, convênio, parceria ou planejamento interno. | <span id="vn1">VN1</span> | Vinculação explícita entre o que é executado e o que foi pactuado com financiadores. | [OE01](#oe01) | [OE04](#oe04) |
| <span id="cp2">CP2</span> | Gestão de atividades | Cadastro das atividades que compõem os projetos, com data, local, responsável, número de vagas e tratamento de atividades que se repetem. | <span id="vn2">VN2</span> | Substituição do controle disperso em planilhas por um registro único e consultável. | [OE01](#oe01) | [OE04](#oe04), [OE06](#oe06) |
| <span id="cp3">CP3</span> | Inscrição de participantes | Página pública de inscrição divulgável por link e código QR, com controle de vagas, lista de espera e inscrição feita pela coordenação. | <span id="vn3">VN3</span> | Redução do retrabalho de digitação e ampliação do alcance da divulgação. | [OE02](#oe02) | [OE01](#oe01) |
| <span id="cp4">CP4</span> | Registro de participação em campo | Registro por dispositivo móvel, no local da atividade, da participação do público e dos educadores, com marcação em lote, inclusão de não inscritos, apuração de carga horária e lançamento posterior. | <span id="vn4">VN4</span> | Dado que nasce digital, dispensando transcrição posterior. | [OE03](#oe03) | [OE04](#oe04) |
| <span id="cp5">CP5</span> | Cadastro e histórico de pessoas | Cadastro das pessoas atendidas e da equipe que conduz as atividades, com histórico de participação, carga horária acumulada, alerta de duplicidade e registro de consentimento. | <span id="vn5">VN5</span> | Contagem confiável de participantes únicos e de horas realizadas. | [OE01](#oe01) | [OE03](#oe03), [OE06](#oe06) |
| <span id="cp6">CP6</span> | Acompanhamento automático de metas | Cálculo contínuo do progresso das metas a partir das atividades e participações registradas, com sinalização das que estão sob risco de não cumprimento. | <span id="vn6">VN6</span> | Visibilidade antecipada, que permite corrigir o rumo dentro do ciclo. | [OE04](#oe04) | [OE01](#oe01) |
| <span id="cp7">CP7</span> | Repositório de evidências e documentação | Vinculação de fotografias, atas, listas assinadas, termos de voluntariado e declarações de prestadores às atividades correspondentes, reunidas por meta. | <span id="vn7">VN7</span> | Comprovação organizada e recuperável para a prestação de contas. | [OE05](#oe05) | [OE06](#oe06) |
| <span id="cp8">CP8</span> | Relatórios e exportação de dados | Geração de relatórios por período ou por projeto, com indicadores e atividades realizadas, e exportação dos dados do projeto em planilha aberta (RF38). | <span id="vn8">VN8</span> | Relatório de prestação de contas montado a partir dos registros, sem consolidação manual de planilhas. | [OE06](#oe06) | [OE04](#oe04), [OE05](#oe05) |

</div>

??? info "Relatórios na primeira versão: formato próprio"
    Os financiadores seguem o mesmo esqueleto (meta prevista, resultado alcançado, evidência e justificativa quando a meta não fecha), mas cada um tem formulário e protocolo próprios. Por isso a primeira versão entrega um **relatório de execução em formato próprio**, com exportação tabular, para anexar ou para alimentar o preenchimento na plataforma do financiador. O índice de evidências por meta chega com as comprovações, no incremento 2 ([seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos)). Reproduzir o formulário de um financiador específico é capacidade posterior, condicionada aos modelos reais do Instituto. A cópia integral dos dados e dos arquivos é tratada na [transferência](#politica-transferencia) (RNF19), não no relatório.

**Fora da primeira versão:** certificados de participação e declarações de horas para voluntários e educadores. A carga horária registrada na participação em campo e no cadastro de pessoas guarda o dado para incluí-los depois sem retrabalho.

## 2.4 Tecnologias a Serem Utilizadas

**Em resumo.** Pilha em TypeScript (NestJS, Next.js, PostgreSQL com Prisma), publicada com Coolify em servidor de um integrante, sem custo durante a disciplina. Escolhida pela [matriz de competências](../gestao/como-trabalhamos.md#competencias) da Sprint 0: tecnologias maduras, de código aberto, com comunidade ampla e sem contratação pelo Instituto durante o projeto. A cópia de segurança, a fila sem conexão e a administração seguem as políticas da [seção 2.6](#26-viabilidade-da-proposta).

<div class="grid cards f3-compacto" markdown>

-   **Interface**

    - **Next.js com React:** página pública de inscrição rápida no celular.
    - **Tailwind CSS e shadcn/ui:** telas consistentes, um só sistema de estilos.
    - **TanStack Query:** cache e repetição de requisições; não substitui a fila local.
    - **Service Worker com Workbox e Dexie:** **fila no navegador** para a participação registrada sem conexão; funcionamento e limites na [política de operação sem conexão](#politica-sem-conexao).

-   **API**

    - **TypeScript** no cliente e no servidor, com tipos compartilhados.
    - **NestJS:** modular, com autenticação, validação e documentação prontas.
    - **Passport com JSON Web Token:** perfis de acesso pelas diretorias e coordenações.
    - **class-validator e class-transformer:** validação declarativa na entrada da API, reduzindo o tratamento manual de erros.
    - **Swagger e OpenAPI:** contrato explícito entre cliente e servidor.
    - **Puppeteer:** relatório em PDF gerado no servidor.

-   **Dados e arquivos**

    - **PostgreSQL**, fonte de verdade ([cópia de segurança](#politica-copia-seguranca)), com **Prisma** e migrações versionadas.
    - **Redis:** cache opcional e descartável; se cair, só o desempenho piora. Não é fila nem guarda decisão de acesso. Não exige contratação adicional no arranjo atual, mas consome memória e operação do servidor.
    - **Backblaze B2 (compatível com S3):** evidências e cópia externa das cópias de segurança; consta entre os provedores compatíveis suportados pela plataforma de implantação. Custo por volume, não nulo, a estimar com o uso real.

-   **Qualidade e publicação**

    - **Vitest e Supertest:** API por perfil e testes visuais das telas em 360 e 1280 px.
    - **ESLint, Prettier e Husky** antes de cada commit; **GitHub Actions** verifica e testa cada solicitação de alteração e automatiza a publicação.
    - **Docker e Docker Compose só no desenvolvimento local**, com ambiente idêntico para todos os integrantes.
    - **Coolify** em servidor de um integrante, já em operação: interface e API isoladas, PostgreSQL e Redis separados e privados, o que permite substituir o contêiner da aplicação sem parar os dados ([transferência](#politica-transferencia)).

</div>

## 2.5 Pesquisa de Mercado e Análise Competitiva

Alternativas avaliadas: Google Forms com Google Planilhas (o que o Instituto usa hoje, principal comparação), plataformas de inscrição como Sympla e Even3, e sistemas de gestão para OSCs como o Bússola Social.

| | Forms e Planilhas | Sympla e Even3 | Bússola Social e similares | CyberSetor |
|---|---|---|---|---|
| O que oferece | alternativa em uso hoje | inscrição e credenciamento de eventos pontuais | módulos de inscrições, certificados e acompanhamento de editais | inscrição, metas com resultado registrado e relatório de execução no MVP; histórico de participação e progresso calculado (posterior) |
| Limitação | o registro de presença não alimenta as metas; consolidação manual a cada ciclo, que depende de quem conhece as planilhas | não acompanham o mesmo participante em várias atividades, não vinculam a execução às metas nem produzem os relatórios | pressupõem estrutura administrativa própria, que o Instituto não tem | administração a transferir ([2.6](#politica-transferencia)) |
| Custo para o Instituto | alternativa em uso hoje | gratuitas para eventos sem venda de ingressos | assinatura, compromisso financeiro contínuo | nenhum durante a disciplina; depois, [a definir](#26-viabilidade-da-proposta) |

A consolidação manual das planilhas é demorada e sujeita a erros de contagem. A assinatura do Bússola Social é compromisso contínuo para quem depende de editais aprovados.

**Diferenciais do CyberSetor:**

- **Fluxo único de dados:** a participação em campo alimenta a meta e o relatório (campo no incremento 3; progresso calculado, posterior).
- **Prestação de contas por editais:** progresso apurado pelo indicador do próprio instrumento, com sinal antecipado de risco (posterior).
- **Realidade de campo:** registro no celular, inclusive [sem conexão](#politica-sem-conexao) (registro em campo no incremento 3; sem conexão, posterior), sem custo de hospedagem durante desenvolvimento e implantação.
- **Autonomia sobre os dados:** com o Instituto, em formatos abertos, sem contrato com fornecedor ([transferência](#politica-transferencia)).

## 2.6 Viabilidade da Proposta

**Em resumo.** É viável com equipe de cinco, escopo delimitado e acesso ao cliente. Depois de pronto, depende do custo da terceira fase, estimado por faixas, e das quatro [políticas de operação](#politica-sem-conexao) abaixo, que são a fonte central do documento. Ficam em aberto o segundo responsável técnico e quem administra e custeia o sistema depois da disciplina.

**Capacidade de execução**

- **Equipe:** cinco integrantes com disponibilidade parcial; a capacidade de cada sprint limita o escopo, por isso o recorte da [seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos) é estreito (papéis na seção 7.1).
- **Prazo:** prioridade ao encadeamento atividade, participação, meta e relatório; evidências no incremento 2, presença no 3, financeiro fora. Tempo para construir, estabilizar e transferir: seção 6.
- **Acesso ao cliente:** concordância **preliminar** em 02/09/2026 e elicitação na sede em 08/09/2026. Confirma o problema, **não valida o escopo**, que depende das áreas competentes (seção 7.3). A aprovação do recorte do MVP pelo núcleo pedagógico não estende aceite à área administrativo-financeira quanto a relatório e planilha, e os registros de 29/10 e 12/11 permanecem diferenciados como preliminares até a conferência formal pelo Instituto ([seção 10.2.8](../requisitos/10-backlog.md#1028-validacao-com-o-instituto)). Canal direto e representantes designadas; agenda restrita, por isso validações curtas e periódicas.
- **Conhecimento técnico:** a [matriz de competências](../gestao/como-trabalhamos.md#competencias) mostra domínio nas camadas fundamentais e lacunas em ferramentas específicas, tratadas em nivelamento antes da construção; nenhuma tecnologia depende de uma só pessoa sem plano de nivelamento.
- **Sem legado:** o Instituto não tem sistema de gestão em uso nem a arquitetura exige hardware dedicado, o que afasta a classe de risco mais comum em projetos dessa duração.

**Custo, em três fases.** "Sem custo" só é exato com recorte temporal:

<div class="f3-fluxo" markdown>

1. **Desenvolvimento**, durante a disciplina: servidor próprio de um integrante, já em operação, custeado por ele. **Nenhum custo para o Instituto.**
2. **Implantação e uso**, durante a disciplina: a mesma infraestrutura, custeada pelo integrante. **Nenhum custo para o Instituto.**
3. **Manutenção**, após a disciplina: infraestrutura e quem custeia **a definir** na transferência. **O custo existe.**

</div>

O custo da terceira fase é **estimativa por faixas**, não preço fixo, e é recalculado com o uso observado; antes do piloto, é projeção, não fatura. Custeá-lo como despesa indireta de projeto **não é garantia de pagamento**: depende do instrumento, do plano de trabalho e da área administrativo-financeira do Instituto.

??? note "Do que depende a estimativa"
    Do número de usuários e acessos, dos projetos e oficinas em execução, da quantidade e do tamanho das evidências, da retenção das cópias de segurança e do esforço de operação. Os componentes são o servidor, o domínio, o armazenamento de objetos (cobrado por volume, operações e retenção, em moeda estrangeira e, portanto, sujeito a câmbio) e o trabalho de quem administra.

**Políticas de operação.** Quatro políticas sustentam o uso depois de pronto. Esta é a fonte única delas; cada título traz os requisitos da seção 8 que a verificam.

<a id="politica-sem-conexao"></a>

??? abstract "Operação sem conexão · verificada por RF17, RF18, RF19, RNF09 e RNF10"
    O registro de participação acontece em espaço público, onde a conexão não é garantida e as quedas são pontuais ([seção 10.2.2](../requisitos/10-backlog.md#1022-avaliacao-de-negocio-com-o-instituto)).

    - **Até a operação sem conexão entrar,** a presença que não puder ser registrada no local é lançada depois, com justificativa ([RF19](../requisitos/8-requisitos.md#rf19)).
    - **Com ela,** o registro fica numa fila no próprio aparelho, em armazenamento local protegido, e é enviado quando a conexão volta ([RF17](../requisitos/8-requisitos.md#rf17)). A fila é local ao navegador daquele aparelho e não sincroniza entre dispositivos.
    - **Guardar no aparelho não é sincronizar.** A fila resolve a captura; a correção depende do servidor, que reconhece um reenvio sem duplicá-lo, decide lançamentos simultâneos da mesma pessoa na mesma atividade, trata a falha parcial de um lote e confirma o que persistiu ([RF18](../requisitos/8-requisitos.md#rf18), [RNF09](../requisitos/8-requisitos.md#rnf09)).
    - O dado nominal sai do aparelho logo depois dessa confirmação ([RNF10](../requisitos/8-requisitos.md#rnf10)).
    - Esses comportamentos são verificados em campo, com educadores, antes de se afirmar que o registro em campo é confiável.

<a id="politica-dados-pessoais"></a>

??? abstract "Dados pessoais e privacidade · verificada por RNF05, RNF06, RN-05, RN-06, RN-07 e RN-12"
    Não ter campo chamado "dado sensível" não significa não ter dado sensível: fotografias, relatos e registros de atendimento de pessoas em situação de vulnerabilidade podem revelar informação delicada. O projeto assume:

    - **Nenhum campo estruturado** de saúde, origem racial ou étnica, convicção religiosa ou opinião política; texto livre e anexos ficam restritos à finalidade do registro ([RNF05](../requisitos/8-requisitos.md#rnf05)).
    - **Fotografia e relato são potencialmente reveladores** de condição pessoal, com acesso restrito por perfil ([seção 8.5.1](../requisitos/8-requisitos.md#851-perfis-de-acesso-e-permissoes)).
    - **Comprovar e divulgar são tratamentos distintos.** A imagem que prova a execução fica com quem presta contas; divulgá-la é outra finalidade, com autorização própria e revogável, e a recusa não afeta o atendimento ([RN-12](../requisitos/8-requisitos.md#rn-12)).
    - **Base legal declarada** por finalidade e **retenção configurável por instrumento.** O prazo não é escolha do sistema: os financiadores exigem guarda de dez anos, contados do dia útil seguinte à apresentação da prestação de contas (Lei 13.019/2014, art. 68), e o instrumento o determina ([RN-07](../requisitos/8-requisitos.md#rn-07)).
    - **Consentimento** onde é a base adequada (contato e uso de imagem), sem condicionar a inscrição; o de menor de idade é dado pelo responsável legal ([RN-05](../requisitos/8-requisitos.md#rn-05), [RN-06](../requisitos/8-requisitos.md#rn-06)). Ele não esgota a governança: finalidade, necessidade, acesso, retenção, direitos do titular e responsabilização são requisitos próprios, e os pedidos do titular têm prazo de atendimento ([RNF06](../requisitos/8-requisitos.md#rnf06)).
    - **O Instituto permanece controlador dos dados.** Registrar quem enviou cada material dá rastreabilidade, sem transferir a responsabilidade institucional ao educador.
    - Os dados mínimos de inscrição estão na [seção 8.5.4](../requisitos/8-requisitos.md#854-inscricao-pessoas-e-lgpd); a existência de menores entre os atendidos e o responsável institucional por privacidade dependem de confirmação com o Instituto.

<a id="dados-de-teste"></a>

!!! warning "Dados de teste durante a disciplina (parte da política de dados pessoais)"
    A homologação usa só dados fictícios e contas de teste, e é com eles que o Instituto valida os fluxos ([ata de 27/10](../gestao/atas/2026-10-27-reuniao-equipe.md), decisão D2). O motivo: o Instituto atende pessoas em situação de vulnerabilidade, que podem incluir menores de idade, e inscrição e presença guardam dados pessoais delas. Usar dados reais antes de formalizar com o Instituto o tratamento e a confidencialidade desses dados ([ata de 05/11](../gestao/atas/2026-11-05-sprint-review-retrospectiva-planning.md), pendência P3) exporia os titulares sem os controles e as responsabilidades definidos. Os dados reais só entram depois dessa formalização, no ambiente de produção da [seção 6.4](6-cronograma.md#64-estabilizacao-implantacao-e-transferencia).

<a id="politica-copia-seguranca"></a>

??? abstract "Cópia de segurança e recuperação · verificada pelo RNF18"
    - **É tarefa agendada da plataforma de implantação, não rotina escrita pela equipe:** reconhece o PostgreSQL, gera a cópia e a envia ao armazenamento externo. Cada execução fica conferível: situação, banco copiado, tamanho do arquivo e confirmação do envio.
    - **Periodicidade de seis horas**, com retenção por número de cópias, por prazo e por espaço ocupado.
    - **A cópia externa é obrigatória, não reforço.** A plataforma grava primeiro no próprio servidor e só então envia para fora; sozinha, a cópia local não sobrevive à perda do servidor que hospeda o banco.
    - **Cópia nunca restaurada não é confiável.** As metas de perda máxima e de restabelecimento e o ensaio que restaura juntos o banco e os arquivos estão no [RNF18](../requisitos/8-requisitos.md#rnf18); sem ensaio aprovado nesses termos, o sistema não declara recuperabilidade demonstrada.
    - Quem executa o ensaio e mantém a rotina depois da disciplina é nomeado na transferência.

<a id="politica-transferencia"></a>

??? abstract "Transferência e continuidade · verificada por RF38 e RNF19"
    - **Dependência real:** o Instituto não tem equipe de tecnologia, e a arquitetura exige administrar servidor, banco, armazenamento, certificados, atualizações e recuperação.
    - **Migração sem reescrita:** a solução em contêineres pode ir para outro provedor a partir das imagens e das cópias de segurança.
    - **Dados sem dependência da equipe nem de fornecedor:** cada projeto pode ser exportado em planilha aberta ([RF38](../requisitos/8-requisitos.md#rf38)), e a cópia integral dos dados e dos arquivos, em formatos abertos, é entregue ao Instituto sob pedido e na transferência ([RNF19](../requisitos/8-requisitos.md#rnf19)).
    - As atividades da transferência e o que depende de responsável nomeado pelo Instituto estão na [seção 6.4](6-cronograma.md#64-estabilizacao-implantacao-e-transferencia).
    - **Em aberto:** quem assumirá a administração após a disciplina e, durante o projeto, o **segundo responsável técnico**, para que a operação não dependa de uma única pessoa.

**Conclusão.** Viável desde que, ao longo do semestre: (1) o escopo do MVP continue delimitado; (2) o ensaio de restauração seja aprovado antes da entrada em uso; (3) um projeto e um instrumento reais do Instituto sejam o piloto, para exercitar metas, comprovação (incremento 2) e relatório sobre dados verdadeiros; (4) o Instituto mantenha a disponibilidade para as validações periódicas.

## 2.7 Benefícios Esperados

<div class="grid cards f3-compacto" markdown>

-   **Instituto No Setor**

    - Tempo de transposição entre planilhas volta para o campo.
    - Metas com responsável, prazo, situação e resultado no MVP; com o acompanhamento automático das metas, nos incrementos seguintes, o risco aparece enquanto há prazo para agir.
    - A confiabilidade dos números reportados tende a aumentar, porque recontagem e transcrição, origem mais frequente dos erros, deixam de ser necessárias no fluxo previsto.
    - Comprovações organizadas e recuperáveis.
    - Em prazo mais longo, memória institucional para novas captações e autonomia total sobre os dados.

-   **Participantes**

    - Inscrição por link ou código QR, sem papel nem deslocamento.
    - Inscrição presencial pela coordenação preservada, para inclusão.
    - Registro em campo rápido (incremento 3).

-   **Educadores e oficineiros**

    - Presença no telefone, no lugar da lista em papel (incremento 3).
    - Fotos e relatos ligados à atividade, sem repasse por WhatsApp (incremento 2).
    - Carga horária por pessoa registrada automaticamente (posterior).

-   **Coordenação e diretorias**

    - Execução consolidada a partir dos registros.
    - Relatórios para os financiadores sem compilação manual.

</div>
