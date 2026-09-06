# 2. Solução proposta

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |

## 2.1 Objetivo Geral do Produto

O objetivo do produto é centralizar as informações operacionais e as evidências de execução das atividades do Instituto No Setor em uma base única e contínua, automatizando a apuração de resultados para a prestação de contas de editais e parcerias. A solução integra a cadeia de dados, desde a inscrição presencial até o arquivamento de comprovações, garantindo que o dado seja coletado na origem e alimente diretamente os relatórios institucionais. Com isso, elimina-se o retrabalho de consolidação manual de planilhas e assegura-se transparência e previsibilidade no cumprimento dos compromissos firmados pela organização.

## 2.2 Objetivos Específicos (OE) do Produto

<a id="oe01"></a>**OE01 - Eliminar a dispersão do registro de projetos, atividades e participantes** - Reduzir o retrabalho e o risco de inconsistência gerados pelo controle disperso em múltiplas planilhas, unificando o cadastro em uma única base de dados.

<a id="oe02"></a>**OE02 - Agilizar a inscrição de participantes** - Reduzir o tempo e o esforço de digitação manual de dados cadastrais, tanto para os participantes quanto para a equipe de coordenação.

<a id="oe03"></a>**OE03 - Eliminar a transcrição manual de presenças** - Reduzir o risco de perda e erro no registro de presença ao assegurar que o dado nasça digital no momento e no local em que a atividade ocorre.

<a id="oe04"></a>**OE04 - Antecipar o acompanhamento das metas** - Aumentar a visibilidade da coordenação sobre o progresso das metas institucionais, permitindo identificar riscos de descumprimento antes do fechamento do ciclo.

<a id="oe05"></a>**OE05 - Mitigar o risco de perda de evidências de execução** - Garantir que os comprovantes de realização das atividades permaneçam organizados e acessíveis para consulta e prestação de contas perante editais e parceiros.

<a id="oe06"></a>**OE06 - Reduzir o esforço de prestação de contas** - Agilizar a elaboração de relatórios de metas e atividades por período, eliminando a consolidação manual exigida a cada edital.

Cada objetivo específico responde a um elemento do problema descrito na seção 1.4. A dispersão do registro em múltiplas planilhas é endereçada pelo [OE01](#oe01). O retrabalho de digitação dos dados de participantes é endereçado pelo [OE02](#oe02). A transcrição posterior de listas de presença preenchidas em papel é endereçada pelo [OE03](#oe03). A impossibilidade de acompanhar, ao longo da execução, o atingimento das metas pactuadas em editais é endereçada pelo [OE04](#oe04). A dispersão das evidências que comprovam a realização das atividades é endereçada pelo [OE05](#oe05). E a elaboração manual dos relatórios de prestação de contas é endereçada pelo [OE06](#oe06). O conjunto dos seis objetivos cobre a cadeia completa identificada como origem dos gargalos, da inscrição do participante à entrega do relatório final ao financiador.

## 2.3 Características de Produto (mapeadas com os Objetivos Específicos do Produto)

A solução proposta para o Instituto No Setor deverá contemplar, de forma preliminar, as seguintes características:

| ID | Característica de Produto (CP) | Descrição resumida | ID | Valor de negócio (VN) principal | Contribuição principal | Contribuição secundária |
|---|---|---|---|---|---|---|
| <span id="cp1">CP1</span> | Gestão de projetos e metas | Cadastro dos projetos com suas metas, indicadores, valores a alcançar, prazos e origem do compromisso, seja edital, convênio, parceria ou planejamento interno. | <span id="vn1">VN1</span> | Vinculação explícita entre o que é executado e o que foi pactuado com financiadores. | [OE01](#oe01) | [OE04](#oe04) |
| <span id="cp2">CP2</span> | Gestão de atividades | Cadastro das atividades que compõem os projetos, com data, local, responsável, número de vagas e tratamento de atividades que se repetem. | <span id="vn2">VN2</span> | Substituição do controle disperso em planilhas por um registro único e consultável. | [OE01](#oe01) | [OE04](#oe04), [OE06](#oe06) |
| <span id="cp3">CP3</span> | Inscrição de participantes | Página pública de inscrição divulgável por link e código QR, com controle de vagas, lista de espera e inscrição feita pela coordenação. | <span id="vn3">VN3</span> | Redução do retrabalho de digitação e ampliação do alcance da divulgação. | [OE02](#oe02) | [OE01](#oe01) |
| <span id="cp4">CP4</span> | Registro de participação em campo | Registro por dispositivo móvel, no local da atividade, da participação do público e dos educadores, com marcação em lote, inclusão de não inscritos, apuração de carga horária e lançamento posterior. | <span id="vn4">VN4</span> | Dado que nasce digital, dispensando transcrição posterior. | [OE03](#oe03) | [OE04](#oe04) |
| <span id="cp5">CP5</span> | Cadastro e histórico de pessoas | Cadastro das pessoas atendidas e da equipe que conduz as atividades, com histórico de participação, carga horária acumulada, alerta de duplicidade e registro de consentimento. | <span id="vn5">VN5</span> | Contagem confiável de participantes únicos e de horas realizadas. | [OE01](#oe01) | [OE03](#oe03), [OE06](#oe06) |
| <span id="cp6">CP6</span> | Acompanhamento automático de metas | Cálculo contínuo do progresso das metas a partir das atividades e participações registradas, com sinalização das que estão sob risco de não cumprimento. | <span id="vn6">VN6</span> | Visibilidade antecipada, que permite corrigir o rumo dentro do ciclo. | [OE04](#oe04) | [OE01](#oe01) |
| <span id="cp7">CP7</span> | Repositório de evidências e documentação | Vinculação de fotografias, atas, listas assinadas, termos de voluntariado e declarações de prestadores às atividades correspondentes, reunidas por meta. | <span id="vn7">VN7</span> | Comprovação organizada e recuperável para a prestação de contas. | [OE05](#oe05) | [OE06](#oe06) |
| <span id="cp8">CP8</span> | Relatórios e exportação de dados | Geração de relatórios por período ou por projeto, com indicadores e atividades realizadas, e exportação integral dos dados em planilha. | <span id="vn8">VN8</span> | Relatório de prestação de contas produzido em minutos. | [OE06](#oe06) | [OE04](#oe04), [OE05](#oe05) |

Não integram esta primeira versão a emissão de certificados de participação e de declarações de horas para voluntários e educadores. O registro da carga horária previsto na [CP4](#cp4) e na [CP5](#cp5) mantém disponível o dado necessário para essa emissão, o que permite incorporá-la em versões futuras sem retrabalho.

## 2.4 Tecnologias a Serem Utilizadas

A pilha tecnológica do CyberSetor foi selecionada a partir da Matriz de Competências da equipe (Sprint 0), priorizando tecnologias maduras, de código aberto, com suporte amplo na comunidade e compatíveis com a infraestrutura de custo zero para o Instituto No Setor:

| Camada | Tecnologia | Justificativa |
|----|----|----|
| Linguagem | TypeScript | Linguagem única no cliente e no servidor, o que reduz a curva de aprendizado da equipe e permite compartilhar tipos entre as duas pontas. |
| Back-end | NestJS | Estrutura modular com injeção de dependências, documentação consolidada e integrações prontas para autenticação, validação e documentação de API. |
| Banco de dados | PostgreSQL | Modelo relacional adequado ao encadeamento entre projeto, meta, atividade, inscrição, participação e evidência. Gratuito e com rotina nativa de cópia de segurança. |
| Mapeamento objeto-relacional | Prisma | Esquema declarativo único e cliente com tipagem gerada automaticamente, com migrações versionadas desde o início. |
| Front-end | Next.js com React | A renderização no servidor beneficia a página pública de inscrição, que precisa carregar rápido em conexões móveis. Integração nativa com a plataforma de publicação escolhida. |
| Estilização e componentes | Tailwind CSS com shadcn/ui | Permite construir interfaces consistentes com rapidez, sem introduzir um segundo sistema de estilos. |
| Sincronização no cliente | TanStack Query | Controle de cache, repetição automática de requisições e sincronização, base para o funcionamento em conectividade instável. |
| Operação sem conexão | Service Worker com Workbox e Dexie | Permite registrar participação em atividades de rua sem conexão, com envio automático quando a conectividade retorna. |
| Autenticação | Passport com JSON Web Token | Viabiliza perfis de acesso derivados da estrutura de diretorias e coordenações do Instituto. |
| Documentação da API | Swagger e OpenAPI | Contrato explícito entre cliente e servidor e documentação útil para a continuidade do sistema. |
| Validação de dados | class-validator e class-transformer | Validação declarativa na entrada da API, reduzindo o tratamento manual de erros. |
| Geração de relatórios | Puppeteer, no servidor | Produz PDF a partir de modelos em HTML, com resultado idêntico em qualquer dispositivo. |
| Armazenamento de arquivos | Backblaze B2, por interface compatível com S3 | Guarda fotografias, listas assinadas e documentos fora do banco, com custo desprezível no volume do Instituto. |
| Testes | Jest e Supertest na API, Playwright na aceitação | Verificação automatizada da API e validação do comportamento descrito nas histórias de usuário. |
| Padronização de código | ESLint, Prettier e Husky | Aplicam os padrões de codificação automaticamente antes de cada commit. |
| Integração e entrega contínuas | GitHub Actions | Executa verificações e testes a cada solicitação de alteração e automatiza a publicação. |
| Ambiente de desenvolvimento | Docker e Docker Compose | Garante ambiente idêntico para todos os integrantes, independentemente do sistema operacional. |
| Publicação | Vercel para a interface, servidor próprio com Coolify para API e banco | Publicação sem custo para o Instituto, com cópia de segurança automatizada do banco. |

## 2.5 Pesquisa de Mercado e Análise Competitiva

No segmento de gestão para organizações do terceiro setor e projetos socioculturais, as principais alternativas ao CyberSetor incluem o uso combinado de Google Forms e Google Planilhas, plataformas de inscrição e credenciamento como Sympla e Even3, e sistemas de gestão especializados como o Bússola Social. Todas oferecem soluções funcionais em seus respectivos recortes, mas apresentam limitações relevantes para a operação do Instituto No Setor.

**Google Forms e Google Planilhas.** É a alternativa efetivamente em uso hoje e, por isso, o principal ponto de comparação. Não integra a cadeia de dados: o registro de presença feito em campo não alimenta o progresso das metas, o que exige consolidação manual a cada ciclo. Esse processo é demorado, sujeito a erros de contagem e depende de uma pessoa que conheça a estrutura das planilhas, o que concentra conhecimento e cria dependência.

**Sympla e Even3.** São gratuitas para eventos sem venda de ingressos, o que as torna viáveis do ponto de vista financeiro para o Instituto. A limitação é funcional. Resolvem bem a inscrição e o credenciamento de eventos pontuais, mas não acompanham o mesmo participante ao longo de múltiplas atividades, não vinculam a execução às metas pactuadas em editais e não produzem os relatórios exigidos na prestação de contas.

**Bússola Social e sistemas de gestão para organizações da sociedade civil.** Oferecem módulos de inscrições, certificados e acompanhamento de editais, cobrindo parte das necessidades identificadas. Operam, porém, em modelo de assinatura, o que representa compromisso financeiro contínuo para uma organização cuja receita depende de editais aprovados. Além disso, são concebidos para organizações que dispõem de estrutura administrativa própria, pressupondo capacidade interna de configuração e manutenção, condição que o Instituto não possui por não contar com equipe de tecnologia.

A solução CyberSetor irá se diferenciar nos seguintes aspectos:

**Fluxo único de dados.** Cada participação registrada em campo converte-se automaticamente em progresso de meta e em conteúdo consolidado para o relatório final, eliminando a transposição manual entre planilhas.

**Aderência ao ciclo de prestação de contas por editais.** As atividades são vinculadas diretamente aos planos de trabalho pactuados, com apuração automática dos indicadores por período e sinalização antecipada de metas sob risco de não cumprimento.

**Aderência à realidade de campo.** A interface móvel permitirá o registro de participação no local da ação, com funcionamento em conectividade instável, e a solução operará sem custo de manutenção ou hospedagem para o Instituto, dispensando equipe técnica dedicada.

**Autonomia sobre os dados.** A exportação integral das informações estará disponível a qualquer momento, sem dependência de contrato vigente com fornecedor.

## 2.6 Viabilidade da Proposta

A proposta é viável no contexto da disciplina. A avaliação considerou a composição da equipe, o prazo do semestre letivo, o acesso ao cliente, o conhecimento técnico disponível e a possibilidade concreta de entrega de um produto mínimo viável ao final do período.

**Equipe.** O projeto conta com seis integrantes, todos com disponibilidade parcial em razão das demais disciplinas do semestre. Para lidar com essa limitação, o trabalho foi organizado em ciclos de duas semanas, com priorização contínua e programação em pares, de modo que a própria construção do produto funcione também como nivelamento técnico. Os papéis de Product Owner interno e Scrum Master estão definidos, o que reduz a dependência de decisões concentradas em uma única pessoa.

**Prazo.** O escopo foi delimitado para caber no ciclo letivo, com prioridade para o núcleo de valor da solução, que é o encadeamento entre atividade, participação, meta e relatório. Módulos de maior complexidade e menor urgência, como controle financeiro e orçamentário, foram deliberadamente deixados fora desta versão. O cronograma prevê sete ciclos de desenvolvimento até a entrega final, com validações intermediárias a cada um deles.

**Acesso ao cliente.** O Instituto No Setor validou formalmente a proposta de solução, reconhecendo que ela endereça as dificuldades relatadas, e propôs um encontro presencial para aprofundar as questões ainda em aberto. Há canal direto de comunicação estabelecido e representantes designadas para acompanhar o projeto. A principal restrição é a disponibilidade de agenda da organização, que atua com equipe reduzida, e por isso as validações foram planejadas em encontros curtos e periódicos, em vez de reuniões longas e esporádicas.

**Conhecimento técnico disponível.** O conhecimento da equipe foi levantado de forma objetiva por meio de uma matriz de competências, na qual cada integrante declarou seu nível de familiaridade com cada tecnologia considerada. O levantamento mostrou domínio consolidado nas camadas fundamentais, como TypeScript, React, PostgreSQL, controle de versão, contêineres e integração contínua, e apontou lacunas em ferramentas específicas, entre elas o mapeamento objeto-relacional e o armazenamento local para funcionamento sem conexão. Para essas lacunas foram programadas sessões de nivelamento conduzidas pelos integrantes com maior experiência, antes do início do desenvolvimento. Esse mapeamento também orientou a escolha da pilha tecnológica: onde havia domínio, a decisão seguiu a experiência acumulada; onde não havia, prevaleceu o critério de menor custo de aprendizado.

**Entrega de um MVP funcional.** A arquitetura não depende de infraestrutura de hardware dedicada nem de integração com sistemas legados, uma vez que o Instituto não possui sistema de gestão em uso. A infraestrutura de execução será fornecida pela equipe, sem custo para a organização, e a solução foi concebida em contêineres, o que permite migrá-la para outro provedor sem reescrita caso seja necessário dar continuidade ao sistema após o encerramento do semestre.

O principal risco técnico está no registro de participação durante atividades realizadas em espaços públicos, onde a conectividade não é garantida. Esse risco é tratado com armazenamento local no dispositivo e envio automático dos dados quando a conexão é restabelecida, tendo o lançamento posterior como alternativa. Há ainda o risco regulatório associado ao tratamento de dados de públicos em situação de vulnerabilidade, mitigado pela decisão de não coletar dados pessoais sensíveis nesta primeira versão, pelo registro do consentimento de cada participante e pela garantia de exportação integral dos dados a qualquer momento.

A proposta é considerada viável, portanto, desde que três condições sejam preservadas ao longo do semestre: o escopo do produto mínimo viável permanecer delimitado, as sessões de nivelamento técnico ocorrerem antes do início do desenvolvimento e a disponibilidade do Instituto para as validações periódicas ser mantida.

## 2.7 Benefícios Esperados

**Benefícios para o cliente**

Para o Instituto No Setor, o benefício mais imediato é a recuperação do tempo hoje consumido na transposição manual de dados entre planilhas, que passa a ser aplicado nas atividades de campo. O acompanhamento das metas deixa de acontecer apenas ao final do ciclo e passa a ser contínuo, o que permite identificar riscos de descumprimento enquanto ainda há prazo para agir.

A confiabilidade dos números reportados aos financiadores aumenta, uma vez que as etapas de recontagem e transcrição, que são onde os erros se originam, deixam de existir. As comprovações de execução ficam organizadas e recuperáveis, reduzindo o esforço de reunir documentos dispersos a cada prestação de contas.

Em prazo mais longo, a organização passa a dispor de memória institucional das ações realizadas, hoje espalhada entre planilhas, mensagens e arquivos pessoais, o que fortalece a elaboração de novas propostas de captação. E mantém autonomia sobre os próprios dados, que podem ser exportados integralmente a qualquer momento, sem dependência de fornecedor.

**Benefícios para os usuários**

Para os participantes das atividades, a inscrição passa a ser feita por link ou código QR, sem deslocamento prévio nem preenchimento de formulários em papel. Quem não dispõe de conexão à internet continua podendo se inscrever presencialmente, com o registro feito pela coordenação, o que preserva o acesso de todos os públicos atendidos. O registro de participação é rápido e não interrompe a dinâmica da atividade, e o histórico de participação fica preservado, servindo de base para comprovações futuras.

Para os educadores e oficineiros que conduzem as ações, a lista de presença em papel é substituída pelo registro feito no próprio telefone, no momento e no local da atividade. Fotografias e relatos passam a ser enviados já vinculados à atividade correspondente, sem necessidade de repasse posterior por canais paralelos. A carga horária conduzida por cada pessoa fica registrada automaticamente, o que elimina o retrabalho de reconstituir essa informação ao final de cada ciclo.

Para a coordenação e as diretorias, o benefício está em enxergar a execução dos projetos de forma consolidada, sem depender de que alguém compile as informações manualmente, e em contar com relatórios prontos para envio aos financiadores.
