# 10. Backlog de produto

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 27/09/2026 | 1.0 | Estruturação inicial da seção e registro da avaliação de esforço técnico dos requisitos de CP1, CP6 e CP8 | Daniel Batista e Rodrigo Henrique |
| 28/09/2026 | 1.1 | Adição da avaliação de esforço técnico dos requisitos de CP2, CP4 e CP7 | Caio Martins e Lucas Leal |
| 29/09/2026 | 2.0 | Backlog geral com as quinze histórias e seus critérios de aceitação; valor de negócio validado com o Instituto; avaliação técnica dos requisitos de CP3, de CP5 e do RF20; tabela consolidada, matriz 4 × 4, MVP, incrementos, requisitos não funcionais do MVP e registro da validação; seção organizada em 10.1 e 10.2, como no template | Vinicius Vieira e Maria Eduarda Marques |
| 05/10/2026 | 2.1 | Inclusão de âncoras HTML unívocas para as histórias de usuário (HU-01 a HU-15) para rastreabilidade direta a partir do catálogo | Rodrigo Henrique |
| 19/10/2026 | 2.2 | HU-03: modalidade escolhida entre as cadastradas pelo Instituto, como no RF09 e na validação de 28/09; requisitos não funcionais do cadastro da atividade (RNF02, RNF04, RNF15, RNF16) | Maria Eduarda Marques |
| 20/10/2026 | 2.3 | Histórias derivadas dos requisitos funcionais por regras explícitas: quinze histórias passam a vinte e cinco, cada requisito com uma única história; critérios de aceitação ampliados para cobrir o texto dos requisitos; administração de contas (RF40), cadastro de modalidades (RF41) e configuração do formulário de inscrição (RF42); personas ligadas aos perfis; correspondência entre as histórias validadas e as derivadas; avaliação técnica de RF40 a RF42; requisitos não funcionais de todo o produto na Definition of Done | Equipe CyberSetor |
| 26/10/2026 | 2.4 | Resultado alcançado da meta no relatório (CA-05a.1, CA-05a.6; RF43 no MVP); parâmetro planejado na condição de rascunho da meta quantitativa (CA-01b.3); período da meta dentro da execução do projeto (CA-01b.4); justificativa para reabrir meta concluída (CA-02a.3); dados da atividade (CA-03a.3); comparativo das metas repactuadas (RF44) e orientação de enquadramento (RF45) como requisitos próprios; controle de acesso por perfil entre os requisitos de todo o produto, fora das linhas das histórias (RNF04); gargalos atendidos pelo MVP e pelos incrementos (10.2.6); requisitos não funcionais das histórias conforme a matriz 8.4.2; portabilidade dos dados e eficiência do registro de presença entre os evolutivos (RNF19, RNF20); alcance da validação na 10.2.8: MVP aprovado pelo núcleo pedagógico; relatório e planilha aguardam a área administrativo-financeira; hipótese do primeiro recorte e ordem de contenção (10.2.6); valor herdado das derivadas com resultado diferente marcado como inicial (10.2.2); requisitos associados exigíveis na conclusão da história (10.2.7); edição de meta fora da nova vigência (CA-14.5); minimização de dados no relatório e na correção a pedido do titular (RNF05); registro de 28/09 sem a marca de minuto da gravação (10.2.8) | Vinicius Vieira |

---

O backlog de produto reúne as histórias de usuário que derivam dos requisitos funcionais da [seção 8](8-requisitos.md) e mostra como foram priorizadas e o que forma o Produto Mínimo Viável (MVP).

## 10.1 Backlog geral

As histórias derivam dos requisitos funcionais da [seção 8](8-requisitos.md) por quatro regras:

1. Cada história tem um ator e um resultado que ele observa, e cabe em uma sprint.
2. Cada requisito funcional pertence a uma única história, onde é construído e aceito; outras histórias podem depender dele.
3. Um requisito vira história própria quando tem ator diferente ou critério de aceitação próprio; requisito de esforço técnico 3 ou 4 é candidato a história própria.
4. Os requisitos não funcionais e as regras de negócio de cada história são os que a [matriz 8.4.2](8-requisitos.md#842-matriz-de-rastreabilidade-dos-requisitos-nao-funcionais-rnfs) e a [seção 8.7](8-requisitos.md#87-regras-de-negocio) ligam aos seus requisitos funcionais; os que valem para todo o produto ficam fora das linhas: RNF03, RNF04, RNF16 e RNF17 fazem parte da [Definition of Done](9-dor-dod.md), e RNF18 e RNF19 são verificados no ambiente, como descreve a [seção 6.4](../visao/6-cronograma.md#64-estabilizacao-implantacao-e-transferencia).

Uma história dividida mantém o número e recebe uma letra (HU-01a, HU-01b). Cada história atende à [Definition of Ready](9-dor-dod.md) antes de entrar em uma sprint; os critérios de aceitação estão no quadro recolhível abaixo da tabela.

| Épico | História | Requisitos funcionais | Depende de |
| :--- | :--- | :--- | :--- |
| Requisito e meta | **HU-01a** Cadastrar instrumento, documento formal e projeto | [RF01](8-requisitos.md#rf01), [RF02](8-requisitos.md#rf02), [RF03](8-requisitos.md#rf03) | — |
| Requisito e meta | **HU-01b** Desdobrar requisitos do instrumento e metas com parâmetros de aferição | [RF04](8-requisitos.md#rf04) | HU-01a |
| Requisito e meta | **HU-02a** Atribuir responsável, setor, prazo e situação a meta | [RF05](8-requisitos.md#rf05), [RF06](8-requisitos.md#rf06) | HU-01b |
| Requisito e meta | **HU-02b** Acompanhar prazos no painel e receber avisos de vencimento | [RF07](8-requisitos.md#rf07), [RF08](8-requisitos.md#rf08) | HU-02a |
| Requisito e meta | **HU-14** Registrar termo aditivo ou mudança de período como nova versão do plano | [RF31](8-requisitos.md#rf31), [RF44](8-requisitos.md#rf44) | HU-01b; HU-05a para o realizado |
| Requisito e meta | **HU-11** Acompanhar progresso e risco de meta | [RF28](8-requisitos.md#rf28), [RF29](8-requisitos.md#rf29), [RF30](8-requisitos.md#rf30) | HU-04a, HU-09a |
| Atividade | **HU-03a** Cadastrar modalidades e atividades ligadas a metas | [RF09](8-requisitos.md#rf09), [RF41](8-requisitos.md#rf41) | HU-01b |
| Atividade | **HU-03b** Ver as comprovações exigidas pela modalidade | [RF10](8-requisitos.md#rf10) | HU-03a |
| Evidência | **HU-04a** Anexar evidência e vincular a atividade e meta | [RF32](8-requisitos.md#rf32), [RF33](8-requisitos.md#rf33) | HU-03a, HU-03b |
| Evidência | **HU-04b** Restringir e orientar fotos de beneficiários | [RF34](8-requisitos.md#rf34), [RF45](8-requisitos.md#rf45) | HU-04a |
| Presença em campo | **HU-09a** Registrar presença em campo | [RF16](8-requisitos.md#rf16) | HU-07c |
| Presença em campo | **HU-09b** Registrar presença sem conexão | [RF17](8-requisitos.md#rf17) | HU-09a |
| Presença em campo | **HU-10** Lançar ou corrigir presença fora do prazo com justificativa | [RF19](8-requisitos.md#rf19) | HU-09a |
| Presença em campo | **HU-12** Sincronizar presenças sem duplicidade | [RF18](8-requisitos.md#rf18) | HU-09b |
| Pessoas | **HU-07a** Inscrever-se em atividade pelo formulário público | [RF11](8-requisitos.md#rf11), [RF23](8-requisitos.md#rf23), [RF24](8-requisitos.md#rf24), [RF25](8-requisitos.md#rf25) | HU-03a |
| Pessoas | **HU-07b** Abrir a inscrição: configurar o formulário e gerar link e QR Code | [RF12](8-requisitos.md#rf12), [RF42](8-requisitos.md#rf42) | HU-03a |
| Pessoas | **HU-07c** Saber se conseguiu a vaga ou a posição na lista de espera | [RF14](8-requisitos.md#rf14), [RF15](8-requisitos.md#rf15) | HU-07a |
| Pessoas | **HU-08** Inscrever presencialmente pessoa sem celular | [RF13](8-requisitos.md#rf13), [RF22](8-requisitos.md#rf22) | HU-07a, HU-07b, HU-07c |
| Pessoas | **HU-06** Consultar histórico e carga horária de pessoa | [RF20](8-requisitos.md#rf20), [RF21](8-requisitos.md#rf21) | HU-07a, HU-09a |
| Pessoas | **HU-15a** Corrigir dados a pedido do titular | [RF26](8-requisitos.md#rf26) | HU-07a |
| Pessoas | **HU-15b** Excluir ou anonimizar dados a pedido do titular | [RF27](8-requisitos.md#rf27) | HU-07a |
| Pessoas | **HU-16** Administrar contas e perfis da equipe do Instituto | [RF40](8-requisitos.md#rf40) | — |
| Relatório | **HU-05a** Gerar relatório de execução com justificativa obrigatória | [RF35](8-requisitos.md#rf35), [RF36](8-requisitos.md#rf36), [RF39](8-requisitos.md#rf39), [RF43](8-requisitos.md#rf43) | HU-02a; HU-14 quando houver meta repactuada; HU-04a para o índice de evidências |
| Relatório | **HU-05b** Baixar o relatório em PDF diagramado | [RF37](8-requisitos.md#rf37) | HU-05a; HU-04a para as miniaturas |
| Relatório | **HU-13** Exportar dados do projeto em planilha aberta | [RF38](8-requisitos.md#rf38) | HU-02a; HU-09a para as presenças |

Personas das histórias e perfis da [seção 8.5.1](8-requisitos.md#851-perfis-de-acesso-e-permissoes-cp1-e-transversal): Diretora de Projetos, responsável de área e coordenadora de projeto atuam no perfil Presidência e Gestão de Projetos; coordenador pedagógico, coordenador autorizado, educador e integrante do núcleo pedagógico, no perfil Núcleo Pedagógico e Educadores; a pessoa interessada usa o formulário público, sem conta; a administração do sistema tem perfil próprio 🔧. As histórias de uso por perfil dependem da HU-16, que não é repetida na coluna de dependências.

<a id="hu-01"></a>
<a id="hu-01a"></a>
??? note "HU-01a · Cadastrar instrumento, documento formal e projeto"
    Como Diretora de Projetos, quero cadastrar o instrumento de parceria, anexar o documento que o formaliza e cadastrar os projetos dele, para reunir num só lugar a base de cada prestação de contas.

    **Critérios de aceitação**

    - CA-01a.1 O instrumento é cadastrado com tipo (edital, emenda ou parceria), órgão concedente, número do processo, valor global e datas de celebração e de vigência; um número de processo já usado em outro instrumento é aceito 🔧.
    - CA-01a.2 O documento formal que celebra o instrumento, em PDF ou DOCX, fica anexado a ele e pode ser aberto por quem tem acesso ao instrumento.
    - CA-01a.3 O projeto é cadastrado em um instrumento ativo, com código único dentro do instrumento 🔧, título, coordenador e cronograma de execução.

    **Requisitos não funcionais e regras de negócio:** RNF02

<a id="hu-01b"></a>
??? note "HU-01b · Desdobrar requisitos do instrumento e metas com parâmetros de aferição"
    Como Diretora de Projetos, quero cadastrar os requisitos do instrumento e as metas do plano de trabalho de um projeto, com os parâmetros de aferição de cada meta, para saber exatamente o que precisa ser comprovado, como e quando.

    **Critérios de aceitação**

    - CA-01b.1 Em um projeto vinculado a um instrumento, a Diretora de Projetos cadastra requisitos do instrumento e metas como registros distintos e relaciona cada meta a um ou mais requisitos.
    - CA-01b.2 Cada meta registra origem, indicador, modalidade de aferição, parâmetro planejado, período e frequência de apuração e forma de comprovação.
    - CA-01b.3 Meta sem indicador, forma de verificação, prazo ou, na meta quantitativa, parâmetro planejado numérico com unidade fica como rascunho, é identificada como tal na lista de metas e não entra na apuração.
    - CA-01b.4 O período da meta fica dentro da execução do projeto; data de início ou de fim fora dela é recusada no cadastro e na edição.

    **Requisitos não funcionais e regras de negócio:** RNF01, RNF02; RN-01, RN-02

<a id="hu-02"></a>
<a id="hu-02a"></a>
??? note "HU-02a · Atribuir responsável, setor, prazo e situação a meta"
    Como responsável de área do Instituto, quero atribuir responsável, setor e prazo a cada meta e registrar a situação dela, para saber com quem está cada demanda.

    **Critérios de aceitação**

    - CA-02a.1 A meta registra responsável, setor executor e prazo, exibidos junto dela na lista de metas do projeto.
    - CA-02a.2 A situação de cada meta (pendente, em andamento ou concluída) é exibida junto ao responsável e ao prazo.
    - CA-02a.3 Reabrir uma meta concluída exige justificativa registrada, visível às demais áreas e sem aprovação.

    **Requisitos não funcionais e regras de negócio:** RNF02; RN-13

<a id="hu-02b"></a>
??? note "HU-02b · Acompanhar prazos no painel e receber avisos de vencimento"
    Como responsável de área do Instituto, quero acompanhar os prazos no painel e na linha do tempo do projeto e ser avisado dos vencimentos, para agir antes de o prazo expirar.

    **Critérios de aceitação**

    - CA-02b.1 O painel e a linha do tempo do projeto mostram a vigência do instrumento, os prazos das metas com seus responsáveis e os requisitos do instrumento já atendidos.
    - CA-02b.2 Meta cujo prazo esteja dentro da antecedência de aviso, ou já vencida sem comprovação, aparece destacada no painel.
    - CA-02b.3 Meta sem responsável atribuído é sinalizada no painel do projeto.
    - CA-02b.4 Os usuários autorizados recebem por e-mail o aviso de vencimento 30 dias antes do prazo e o aviso de meta vencida sem comprovação ou sem responsável; avisos adicionais podem ser registrados na própria meta.

    **Requisitos não funcionais e regras de negócio:** RNF11; RN-01, RN-03

<a id="hu-14"></a>
??? note "HU-14 · Registrar termo aditivo ou mudança de período como nova versão do plano"
    Como Diretora de Projetos, quero registrar um termo aditivo, uma apostila ou a mudança do período de execução como nova versão do plano de trabalho, para acompanhar as metas repactuadas sem perder o que foi pactuado originalmente.

    **Critérios de aceitação**

    - CA-14.1 O registro de termo aditivo ou apostila cria nova versão do plano de trabalho, com data e documento de origem.
    - CA-14.2 A versão original das metas e os resultados já apurados são preservados.
    - CA-14.3 Cada meta repactuada exibe o comparativo entre previsto original, reprogramado e realizado.
    - CA-14.4 A mudança do período de execução por ofício, registrada com a publicação de origem e a justificativa, gera nova versão do plano e atualiza a vigência do instrumento, preservando a versão anterior.
    - CA-14.5 Na nova versão, as metas com prazo fora da nova vigência ficam sinalizadas para revisão pelo usuário autorizado, sem mudança automática de prazo 🔧; ao editar o período de uma dessas metas, vale o CA-01b.4.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF08; RN-09, RN-13

<a id="hu-11"></a>
??? note "HU-11 · Acompanhar progresso e risco de meta"
    Como coordenadora de projeto, quero acompanhar o progresso de cada meta e ser avisada quando o ritmo estiver abaixo do planejado, para agir antes do fim do prazo em vez de descobrir na prestação de contas.

    **Critérios de aceitação**

    - CA-11.1 A meta exibe valor apurado, alvo, unidade, período e data do último cálculo.
    - CA-11.2 A partir do valor exibido, a coordenadora abre os registros de presença e evidência que o compõem.
    - CA-11.3 Meta por marco (entrega única) aparece como cumprida ou não cumprida, sem percentual contínuo.
    - CA-11.4 Quando o ritmo de execução fica abaixo do critério de risco definido para a meta, a meta aparece sinalizada no painel, sem alteração do alvo.
    - CA-11.5 O usuário autorizado define, em cada meta, se a apuração é por acúmulo contínuo ou por marco de entrega.
    - CA-11.6 O valor apurado é recalculado logo após cada presença confirmada ou comprovação registrada.

    **Requisitos não funcionais e regras de negócio:** RNF11; RN-02, RN-08, RN-14

<a id="hu-03"></a>
<a id="hu-03a"></a>
??? note "HU-03a · Cadastrar modalidades e atividades ligadas a metas"
    Como coordenador pedagógico, quero cadastrar as modalidades de objeto do Instituto e cadastrar as atividades de um projeto em uma delas, ligadas às metas a que contribuem, para organizar a execução por meta.

    **Critérios de aceitação**

    - CA-03a.1 O Instituto cadastra as próprias modalidades de objeto, sem lista fixa no sistema.
    - CA-03a.2 Ao cadastrar uma atividade em um projeto, o coordenador seleciona a meta ou as metas contratuais a que a atividade contribui e a modalidade de objeto entre as cadastradas pelo Instituto (por exemplo, oficina contínua, evento aberto, ação de acolhimento).
    - CA-03a.3 A atividade registra título, local, responsável e data de realização dentro da execução do projeto.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF15; RN-04

<a id="hu-03b"></a>
??? note "HU-03b · Ver as comprovações exigidas pela modalidade"
    Como coordenador pedagógico, quero que o sistema indique as comprovações exigidas de uma atividade pela sua modalidade, para não esquecer nenhuma prova de execução.

    **Critérios de aceitação**

    - CA-03b.1 O usuário autorizado configura, por instrumento e modalidade, quais comprovações são obrigatórias, opcionais ou condicionais.
    - CA-03b.2 Ao criar a atividade, o sistema exibe as comprovações obrigatórias, opcionais e condicionais configuradas para o instrumento e a modalidade.
    - CA-03b.3 Para oficina contínua, a comprovação principal exibida é a lista de presença nominal; para ação de acolhimento, a contagem agregada de público, sem exigência de CPF 🔧.
    - CA-03b.4 A atividade guarda a versão da configuração de comprovações vigente no cadastro; mudança posterior na configuração não altera atividades já criadas.

    **Requisitos não funcionais e regras de negócio:** RNF02; RN-04

<a id="hu-04"></a>
<a id="hu-04a"></a>
??? note "HU-04a · Anexar evidência e vincular a atividade e meta"
    Como educador, quero anexar uma evidência a uma atividade e vinculá-la a uma ou mais metas, para que a comprovação já nasça organizada por meta.

    **Critérios de aceitação**

    - CA-04a.1 Ao anexar uma evidência a uma atividade realizada, o educador informa data, local e a meta ou as metas relacionadas; autor, data e hora de envio são registrados automaticamente.
    - CA-04a.2 Quando o aparelho autoriza, a evidência registra as coordenadas geográficas do envio.
    - CA-04a.3 Ao abrir uma meta, o usuário vê as comprovações já recebidas e as pendentes, conforme a modalidade da atividade.
    - CA-04a.4 Arquivo salvo sem meta vinculada fica como rascunho, com aviso de que não compõe o índice de comprovações nem o relatório.
    - CA-04a.5 A atividade não pode ser encerrada enquanto houver rascunho pendente de vinculação ou descarte.
    - CA-04a.6 A evidência vinculada passa a compor o índice cronológico do relatório (CA-05a.1) e as miniaturas do PDF (CA-05b.1), e o rascunho pendente bloqueia a geração do relatório final (CA-05a.4).

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05, RNF07, RNF09, RNF10, RNF14; RN-04, RN-10, RN-11, RN-13

<a id="hu-04b"></a>
??? note "HU-04b · Restringir e orientar fotos de beneficiários"
    Como coordenadora de projeto, quero que as fotos de prova de execução sejam vistas só por quem coordena e presta contas, e que o educador seja orientado a não identificar participantes, para proteger pessoas em situação de vulnerabilidade.

    **Critérios de aceitação**

    - CA-04b.1 Imagem registrada como prova de execução fica visível apenas aos perfis de coordenação e prestação de contas.
    - CA-04b.2 Ao registrar uma foto, o educador vê a orientação de enquadramento que evita identificar participantes.

    **Requisitos não funcionais e regras de negócio:** RNF05; RN-12

<a id="hu-09"></a>
<a id="hu-09a"></a>
??? note "HU-09a · Registrar presença em campo"
    Como educador em campo, quero registrar no celular a presença dos inscritos e de quem chega sem inscrição, para que o registro nasça digital no local da atividade e não volte para o papel.

    **Critérios de aceitação**

    - CA-09a.1 O educador marca presença individual ou em lote dos inscritos da atividade.
    - CA-09a.2 O educador pode incluir participante não inscrito na hora da atividade com dados mínimos de identificação, registrando sua presença na chamada; o cadastro fica marcado para regularização posterior.
    - CA-09a.3 As presenças registradas passam a compor a exportação do projeto (CA-13.1).

    **Requisitos não funcionais e regras de negócio:** RNF09, RNF15, RNF20

<a id="hu-09b"></a>
??? note "HU-09b · Registrar presença sem conexão"
    Como educador em campo, quero registrar a presença dos participantes no meu celular mesmo sem internet, para não depender de sinal no local da atividade.

    **Critérios de aceitação**

    - CA-09b.1 Antes de ir a campo, o educador prepara a lista da atividade no celular, que guarda apenas os dados mínimos para a chamada.
    - CA-09b.2 Sem conexão, cada marcação fica salva no aparelho antes da confirmação na tela, que indica "salvo neste dispositivo", não "sincronizado".
    - CA-09b.3 As marcações salvas continuam disponíveis após fechar o navegador ou reiniciar o aparelho.

    **Requisitos não funcionais e regras de negócio:** RNF09, RNF10

<a id="hu-10"></a>
??? note "HU-10 · Lançar ou corrigir presença fora do prazo com justificativa"
    Como coordenador autorizado, quero lançar ou corrigir uma presença depois da data da atividade, informando a justificativa, para manter o registro correto sem apagar o que foi registrado antes.

    **Critérios de aceitação**

    - CA-10.1 Lançamento ou correção de presença após a data da atividade exige justificativa escrita.
    - CA-10.2 Cada lançamento ou correção preserva o valor anterior, o valor novo, o autor, a data e a hora na trilha de auditoria.
    - CA-10.3 Usuário sem permissão para a atividade não consegue lançar nem corrigir presenças dela.
    - CA-10.4 Correção em dado que compõe relatório já finalizado não altera esse relatório; a retificação segue a HU-05a (CA-05a.3).
    - CA-10.5 O lançamento ou a correção com justificativa vale sem aprovação prévia.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05, RNF09; RN-13

<a id="hu-12"></a>
??? note "HU-12 · Sincronizar presenças sem duplicidade"
    Como educador, quero que as presenças registradas sem conexão sejam enviadas assim que o celular voltar a ter internet, sem duplicar nem perder registros, para confiar no resultado da chamada.

    **Critérios de aceitação**

    - CA-12.1 Ao voltar a conexão, as presenças pendentes são enviadas automaticamente e a tela passa a indicar "sincronizado".
    - CA-12.2 Reenvio do mesmo lote, por falha ou repetição, não gera presença duplicada.
    - CA-12.3 Se a sessão tiver expirado, as presenças pendentes são preservadas no aparelho e o sistema pede novo acesso antes de enviar.
    - CA-12.4 Registro que diverge do que já está no servidor fica visível como conflito, para tratamento pelo coordenador, sem ser descartado.
    - CA-12.5 Após a confirmação do envio, os dados nominais dos participantes deixam de ficar no aparelho, e outro usuário no mesmo aparelho não acessa a lista anterior.

    **Requisitos não funcionais e regras de negócio:** RNF01, RNF09, RNF10

<a id="hu-07"></a>
<a id="hu-07a"></a>
??? note "HU-07a · Inscrever-se em atividade pelo formulário público"
    Como pessoa interessada em uma atividade do Instituto, quero me inscrever pelo celular, sem criar conta, para garantir minha vaga sem depender de a equipe transcrever meus dados.

    **Critérios de aceitação**

    - CA-07a.1 O formulário público da atividade abre em navegador de celular, sem cadastro de conta ou senha.
    - CA-07a.2 Ao enviar os campos mínimos válidos, a pessoa recebe confirmação da inscrição na tela.
    - CA-07a.3 O formulário apresenta o aviso de tratamento de dados e registra, com data e hora, a versão apresentada; para menor de idade, pede a identificação do responsável legal.
    - CA-07a.4 Envio repetido pela mesma pessoa para a mesma atividade não gera inscrição duplicada.
    - CA-07a.5 Autorização para receber comunicados e autorização de uso de imagem são opções separadas e opcionais; recusar qualquer uma não impede a inscrição.
    - CA-07a.6 A revogação da autorização de comunicados ou de uso de imagem, pedida pela pessoa por qualquer canal, fica registrada com data e canal e não afeta a inscrição.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05, RNF12, RNF15; RN-05, RN-06, RN-12

<a id="hu-07b"></a>
??? note "HU-07b · Abrir a inscrição: configurar o formulário e gerar link e QR Code"
    Como coordenador pedagógico, quero configurar o formulário de inscrição de uma atividade e gerar o link e o QR Code dele, para divulgar a inscrição nos canais do Instituto pedindo só os dados de que a atividade precisa.

    **Critérios de aceitação**

    - CA-07b.1 Ao abrir a inscrição, o coordenador define o número de vagas, os campos do formulário além dos mínimos e se o e-mail ou o CPF identifica cadastro repetido 🔧.
    - CA-07b.2 O formulário não aceita campo estruturado de dado pessoal sensível.
    - CA-07b.3 Para cada atividade com inscrição aberta, o coordenador gera um link e um QR Code que abrem o formulário público dela.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05, RNF12

<a id="hu-07c"></a>
??? note "HU-07c · Saber se conseguiu a vaga ou a posição na lista de espera"
    Como pessoa interessada em uma atividade do Instituto, quero saber se consegui a vaga ou qual é minha posição na lista de espera, para me organizar.

    **Critérios de aceitação**

    - CA-07c.1 Com as vagas esgotadas, a inscrição entra na lista de espera e a pessoa é informada da posição.
    - CA-07c.2 A lista de espera segue a ordem de chegada das inscrições.

    **Requisitos não funcionais e regras de negócio:** —

<a id="hu-08"></a>
??? note "HU-08 · Inscrever presencialmente pessoa sem celular"
    Como coordenador ou educador, quero inscrever presencialmente uma pessoa que não tem celular ou conexão, para que ela participe nas mesmas condições de quem se inscreve pelo link.

    **Critérios de aceitação**

    - CA-08.1 O coordenador inscreve a pessoa na atividade em seu nome, a partir do próprio aparelho, sem que ela precise de celular.
    - CA-08.2 A inscrição assistida respeita o limite de vagas e a lista de espera da atividade.
    - CA-08.3 Antes de concluir, o coordenador vê o aviso de possível cadastro repetido, pelo e-mail ou pelo CPF, conforme o campo escolhido no formulário 🔧, e pode reaproveitar o cadastro existente.
    - CA-08.4 O aviso de tratamento de dados apresentado à pessoa fica registrado com data, hora e autor da inscrição assistida; para menor de idade, a identificação do responsável legal também é registrada.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05, RNF15; RN-05, RN-06

<a id="hu-06"></a>
??? note "HU-06 · Consultar histórico e carga horária de pessoa"
    Como integrante do núcleo pedagógico, quero consultar o histórico de participação e a carga horária acumulada de uma pessoa em diferentes projetos, para convidá-la a atividades compatíveis com seu perfil, respeitando a autorização de contato que ela deu.

    **Critérios de aceitação**

    - CA-06.1 Ao abrir a ficha de uma pessoa, o núcleo pedagógico vê as atividades e os projetos de que ela participou, com datas.
    - CA-06.4 Convite para nova atividade só é oferecido a quem tem autorização de contato registrada e não revogada.
    - CA-06.5 O perfil administrativo-financeiro não acessa a ficha nominal das pessoas.
    - CA-06.6 A ficha mostra a carga horária acumulada da pessoa, como participante ou facilitadora, a partir das presenças confirmadas.

    **Requisitos não funcionais e regras de negócio:** RNF05; RN-15

<a id="hu-15"></a>
<a id="hu-15a"></a>
??? note "HU-15a · Corrigir dados a pedido do titular"
    Como integrante do núcleo pedagógico, quero corrigir os dados de uma pessoa a pedido dela, para cumprir o direito do titular à correção.

    **Critérios de aceitação**

    - CA-15a.1 A correção de dado a pedido do titular registra autor, data, hora e justificativa.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05

<a id="hu-15b"></a>
??? note "HU-15b · Excluir ou anonimizar dados a pedido do titular"
    Como integrante do núcleo pedagógico, quero excluir ou anonimizar os dados de uma pessoa a pedido dela ou ao fim da finalidade, para cumprir os direitos do titular sem comprometer a prestação de contas.

    **Critérios de aceitação**

    - CA-15b.1 A exclusão ou anonimização é feita a pedido do titular ou ao término da finalidade.
    - CA-15b.2 Totais já reportados a financiadores e registros sob guarda legal são preservados, com o fundamento registrado por classe de dado.
    - CA-15b.3 O pedido é atendido dentro do prazo da [RNF06](8-requisitos.md#rnf06), medido na trilha de auditoria.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF06; RN-07

<a id="hu-16"></a>
??? note "HU-16 · Administrar contas e perfis da equipe do Instituto"
    Como administrador do sistema, quero criar as contas da equipe do Instituto com o perfil de cada pessoa, desativá-las e redefinir senhas, para que cada pessoa acesse só o que o seu perfil permite.

    **Critérios de aceitação**

    - CA-16.1 A conta é criada com um perfil e uma senha temporária, e a pessoa troca a senha no primeiro acesso antes de usar o sistema 🔧.
    - CA-16.2 A mudança de perfil ou a desativação vale a partir da ação seguinte da pessoa, sem esperar novo acesso 🔧.
    - CA-16.3 Redefinir a senha gera nova senha temporária e encerra os acessos abertos da pessoa 🔧.
    - CA-16.4 Nenhuma operação deixa o sistema sem ao menos uma conta de administração ativa.
    - CA-16.5 Criação, mudança de perfil, desativação e redefinição de senha ficam na trilha de auditoria, sem a senha.

    **Requisitos não funcionais e regras de negócio:** RNF02

<a id="hu-05"></a>
<a id="hu-05a"></a>
??? note "HU-05a · Gerar relatório de execução com justificativa obrigatória"
    Como Diretora de Projetos, quero gerar o relatório de execução do objeto de um projeto para um período, com metas previstas confrontadas aos resultados e às evidências vinculadas, para prestar contas sem montagem manual.

    **Critérios de aceitação**

    - CA-05a.1 Ao solicitar o relatório de um período, cada meta aparece com o resultado alcançado registrado até o fim do período, a classificação do alcance, o percentual de cumprimento quando a meta é quantitativa, a justificativa e, quando houver evidência vinculada, o índice cronológico das evidências.
    - CA-05a.2 Meta cumprida parcialmente ou não cumprida exige justificativa registrada antes que o relatório possa ser finalizado (Lei 13.019/2014, art. 64, §1º); a trava atinge só a finalização, sem impedir novos registros, e a direção ou a coordenação responsável é notificada.
    - CA-05a.3 Retificação feita após a finalização gera nova versão do relatório e registro na trilha de auditoria, preservando a versão anterior.
    - CA-05a.4 Havendo rascunho de evidência pendente no período, a geração do relatório final é bloqueada, com a indicação do que falta.
    - CA-05a.5 A emissão de cada relatório e cada justificativa registrada ficam na trilha de auditoria, com autor, data e hora.
    - CA-05a.6 O usuário autorizado registra o resultado alcançado de cada meta com a data de referência: descrição, classificação do alcance (cumprida, parcialmente cumprida ou não cumprida) e, na meta quantitativa, o valor alcançado na unidade do parâmetro planejado; na meta quantitativa, o percentual de cumprimento e a classificação são calculados, nunca digitados.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05, RNF07, RNF08, RNF13; RN-11, RN-13, RN-14

<a id="hu-05b"></a>
??? note "HU-05b · Baixar o relatório em PDF diagramado"
    Como Diretora de Projetos, quero baixar o relatório finalizado em PDF diagramado, para entregá-lo ao financiador no formato institucional.

    **Critérios de aceitação**

    - CA-05b.1 O relatório finalizado é gerado em PDF diagramado, com cabeçalho institucional, sumário, as metas em tabelas, as justificativas e, quando houver evidência vinculada, as miniaturas das evidências com seus dados de registro.

    **Requisitos não funcionais e regras de negócio:** RNF08, RNF13

<a id="hu-13"></a>
??? note "HU-13 · Exportar dados do projeto em planilha aberta"
    Como Diretora de Projetos, quero exportar os dados de execução do projeto em planilha aberta, para permitir conferências internas e auditorias externas independentes e não depender do sistema para preservar a informação.

    **Critérios de aceitação**

    - CA-13.1 A exportação traz, em planilha aberta, nos formatos XLSX e CSV, as atividades, a situação das metas e, quando houver, as presenças do projeto no período escolhido.
    - CA-13.2 O arquivo inclui a legenda dos campos e a data de corte dos dados.
    - CA-13.3 Só entram os dados necessários à finalidade da exportação; dados nominais não saem para perfil sem permissão.
    - CA-13.4 Cada exportação fica registrada na trilha de auditoria, com autor e data.
    - CA-13.5 Ao exportar, a pessoa escolhe entre a visão analítica e a consolidada das metas.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05

## 10.2 Priorização do backlog geral e MVP

### 10.2.1 Critérios e escalas

A priorização cruza o **valor de negócio**, dado pelo Instituto, com o **esforço técnico**, avaliado pela equipe. O valor é dado por história, em conversa com o Instituto, e vale para todos os requisitos funcionais dela; quando um requisito pertence a mais de uma história, prevalece o maior valor.

| Valor | MoSCoW | Significado para o Instituto |
| :---: | :--- | :--- |
| 4 | *Must have* | Sem isso a solução não serve |
| 3 | *Should have* | Importante; o produto opera temporariamente sem ele |
| 2 | *Could have* | Agrega valor, pode esperar |
| 1 | *Won't have now* | Não é prioridade nesta versão |

Cada valor registra o critério que mais pesou: problema central, objetivo do projeto, impacto para os usuários, abrangência de uso, urgência, obrigação legal ou institucional, ou dependência de outra função.

| Nota | Esforço | Complexidade | Lacuna de capacidade da equipe |
| :---: | :--- | :--- | :--- |
| 1 | até 2 h | solução conhecida | tecnologia dominada |
| 2 | de 2 a 6 h | exige investigação ou integração | conhecimento básico nivelado |
| 3 | de 6 a 12 h | várias dependências ou incertezas | exige estudo adicional |
| 4 | mais de 12 h | incerteza alta ou integração crítica | tecnologia não dominada |

O **esforço técnico** de cada requisito é a média das três notas, arredondada para o inteiro mais próximo (0,5 arredonda para cima). A lacuna de capacidade se apoia na [matriz de competências](../gestao/matriz-competencias.md).

### 10.2.2 Avaliação de negócio com o Instituto

O Instituto deu o valor a quatorze das quinze histórias apresentadas na validação de 28/09/2026, e a HU-15 entrou pela obrigação legal; cada história derivada na 10.1 herda o valor da original. Nas derivadas cujo resultado difere do que foi avaliado (HU-03b, HU-05b, HU-07c e HU-09a), o valor herdado é inicial 🔧 e volta à conferência com o Instituto. A HU-16, de administração de contas, tem o valor proposto pela equipe, a confirmar com o Instituto 🔧.

| História validada | Histórias derivadas (10.1) | Valor | Critério | Justificativa do Instituto |
| :--- | :--- | :---: | :--- | :--- |
| HU-01 | HU-01a, HU-01b | 4 | Problema central | "Se vocês forem entregar só uma coisa, é isso"; perder prazos está em "grande parte dos problemas" do Instituto. |
| HU-02 | HU-02a, HU-02b | 4 | Problema central | Perder prazos está em "grande parte dos problemas" do Instituto; aviso com 7 dias não dá tempo de refazer o que falta. |
| HU-11 | HU-11 | 3 | Impacto para os usuários | A presidência quer o painel, mas ele só é confiável com o sistema abastecido de dados. |
| HU-14 | HU-14 | 4 | Obrigação legal | Alterações de prazo e orçamento impostas pelo financiador precisam preservar o plano original. |
| HU-05 | HU-05a, HU-05b | 4 | Problema central | A prestação de contas é "o maior gargalo" do Instituto; a proposta da equipe de tentar o relatório em PDF no MVP foi confirmada. |
| HU-13 | HU-13 | 4 | Problema central | Exportação para conferência e auditoria proposta pela equipe e confirmada pelo Instituto no corte do MVP. |
| HU-03 | HU-03a, HU-03b | 4 | Dependência de outra função | Complemento das parcerias e metas; as modalidades são criadas pelo próprio Instituto. |
| HU-04 | HU-04a, HU-04b | 4 | Problema central | Comprovação "não pode passar despercebido"; entra logo depois do MVP. |
| HU-09 | HU-09a, HU-09b | 2 | Urgência | Registro sem internet "não é um must have": as quedas são pontuais e lista e foto sobem depois. |
| HU-10 | HU-10 | 4 | Obrigação legal | Justificativa obrigatória para correção fora do prazo "deveríamos ter", sem exigir aprovação. |
| HU-12 | HU-12 | 2 | Urgência | Mesmo motivo da HU-09: sincronização sem conexão fica para depois. |
| HU-06 | HU-06 | 2 | Impacto para os usuários | "Sonho do pedagógico", mas não é prioridade no contexto geral do Instituto. |
| HU-07 | HU-07a, HU-07b, HU-07c | 4 | Abrangência de uso | "Seria excelente": facilitaria o controle de inscritos e de metas para todas as equipes. |
| HU-08 | HU-08 | 4 | Abrangência de uso | Mesmo valor das inscrições por link ("seria excelente"); para a equipe, garante acesso a quem não tem celular. |
| HU-15 | HU-15a, HU-15b | 4 🔧 | Obrigação legal | Obrigação legal (LGPD, art. 18); não foi votada em 28/09 e entrou no recorte confirmado em 08/10/2026. |
| — | HU-16 | 4 🔧 | Dependência de outra função | Sem valor atribuído pelo Instituto 🔧; as contas e os perfis são condição do acesso por perfil, que vale para todo o produto (RNF04). |

### 10.2.3 Avaliação técnica

| Código | Requisito funcional | Esforço | Complexidade | Lacuna | Média | Esforço técnico |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| [RF01](8-requisitos.md#rf01) | Cadastrar instrumento convocatório e parceria | 2 | 1 | 1 | 1,3 | **1** |
| [RF02](8-requisitos.md#rf02) | Anexar documento formal homologado de parceria | 2 | 1 | 1 | 1,3 | **1** |
| [RF03](8-requisitos.md#rf03) | Cadastrar projeto operacional | 1 | 1 | 1 | 1,0 | **1** |
| [RF04](8-requisitos.md#rf04) | Desdobrar requisitos contratuais e metas | 2 | 2 | 1 | 1,7 | **2** |
| [RF05](8-requisitos.md#rf05) | Atribuir responsável e setor executor a meta | 1 | 1 | 1 | 1,0 | **1** |
| [RF06](8-requisitos.md#rf06) | Fixar prazo fatal e status de meta | 1 | 1 | 1 | 1,0 | **1** |
| [RF07](8-requisitos.md#rf07) | Exibir linha do tempo e painel de prazos de metas | 2 | 2 | 1 | 1,7 | **2** |
| [RF08](8-requisitos.md#rf08) | Emitir alertas de proximidade e pendências de metas | 2 | 2 | 1 | 1,7 | **2** |
| [RF09](8-requisitos.md#rf09) | Cadastrar atividade por modalidade de objeto | 1 | 1 | 2 | 1,3 | **1** |
| [RF10](8-requisitos.md#rf10) | Parametrizar exigência de comprovação de presença | 2 | 3 | 3 | 2,7 | **3** |
| [RF11](8-requisitos.md#rf11) | Disponibilizar formulário público de inscrição | 2 | 2 | 1 | 1,7 | **2** |
| [RF12](8-requisitos.md#rf12) | Gerar link e QR Code de inscrição | 1 | 1 | 1 | 1,0 | **1** |
| [RF13](8-requisitos.md#rf13) | Registrar inscrição presencial assistida | 2 | 1 | 1 | 1,3 | **1** |
| [RF14](8-requisitos.md#rf14) | Limitar vagas da atividade | 2 | 2 | 1 | 1,7 | **2** |
| [RF15](8-requisitos.md#rf15) | Registrar lista de espera | 2 | 2 | 1 | 1,7 | **2** |
| [RF16](8-requisitos.md#rf16) | Registrar frequência em dispositivo móvel | 3 | 2 | 3 | 2,7 | **3** |
| [RF17](8-requisitos.md#rf17) | Operar registro de presença em modo offline | 3 | 4 | 3 | 3,3 | **3** |
| [RF18](8-requisitos.md#rf18) | Sincronizar presenças com reconciliação idempotente | 2 | 3 | 3 | 2,7 | **3** |
| [RF19](8-requisitos.md#rf19) | Registrar lançamento extemporâneo com justificativa | 1 | 1 | 2 | 1,3 | **1** |
| [RF20](8-requisitos.md#rf20) | Apurar carga horária de participantes e facilitadores | 2 | 2 | 1 | 1,7 | **2** |
| [RF21](8-requisitos.md#rf21) | Consultar histórico de participação | 2 | 1 | 1 | 1,3 | **1** |
| [RF22](8-requisitos.md#rf22) | Avisar cadastro repetido | 2 | 2 | 1 | 1,7 | **2** |
| [RF23](8-requisitos.md#rf23) | Registrar aviso de tratamento de dados na inscrição | 1 | 1 | 1 | 1,0 | **1** |
| [RF24](8-requisitos.md#rf24) | Registrar autorização de contato | 1 | 1 | 1 | 1,0 | **1** |
| [RF25](8-requisitos.md#rf25) | Registrar autorização de uso de imagem | 2 | 2 | 1 | 1,7 | **2** |
| [RF26](8-requisitos.md#rf26) | Corrigir dados a pedido do titular | 2 | 1 | 1 | 1,3 | **1** |
| [RF27](8-requisitos.md#rf27) | Excluir ou anonimizar dados de pessoa | 3 | 3 | 2 | 2,7 | **3** |
| [RF28](8-requisitos.md#rf28) | Calcular progresso físico de metas automaticamente | 3 | 2 | 1 | 2,0 | **2** |
| [RF29](8-requisitos.md#rf29) | Parametrizar apuração de metas por acúmulo contínuo ou marco de entrega | 2 | 1 | 1 | 1,3 | **1** |
| [RF30](8-requisitos.md#rf30) | Emitir alertas de risco de inexecução | 3 | 2 | 1 | 2,0 | **2** |
| [RF31](8-requisitos.md#rf31) | Versionar o plano de trabalho | 3 | 2 | 1 | 2,0 | **2** |
| [RF32](8-requisitos.md#rf32) | Anexar evidências documentais e fotográficas | 2 | 3 | 3 | 2,7 | **3** |
| [RF33](8-requisitos.md#rf33) | Vincular evidência a meta contratual | 2 | 2 | 2 | 2,0 | **2** |
| [RF34](8-requisitos.md#rf34) | Restringir o acesso a fotos de prova de execução | 3 | 3 | 2 | 2,7 | **3** |
| [RF35](8-requisitos.md#rf35) | Exigir justificativa prévia para metas não atingidas | 1 | 1 | 1 | 1,0 | **1** |
| [RF36](8-requisitos.md#rf36) | Emitir Relatório de Execução do Objeto | 3 | 2 | 1 | 2,0 | **2** |
| [RF37](8-requisitos.md#rf37) | Gerar relatório diagramado em PDF | 4 | 3 | 2 | 3,0 | **3** |
| [RF38](8-requisitos.md#rf38) | Exportar dados analíticos e consolidados em planilha aberta | 2 | 1 | 1 | 1,3 | **1** |
| [RF39](8-requisitos.md#rf39) | Registrar trilha de auditoria das operações de prestação de contas | 2 | 1 | 1 | 1,3 | **1** |
| [RF40](8-requisitos.md#rf40) | Administrar contas e perfis de acesso | 1 | 1 | 1 | 1,0 | **1** |
| [RF41](8-requisitos.md#rf41) | Cadastrar modalidades de objeto | 1 | 1 | 1 | 1,0 | **1** |
| [RF42](8-requisitos.md#rf42) | Configurar o formulário de inscrição | 2 | 2 | 1 | 1,7 | **2** |
| [RF43](8-requisitos.md#rf43) | Registrar o resultado alcançado da meta | 1 | 1 | 1 | 1,0 | **1** |
| [RF44](8-requisitos.md#rf44) | Comparar metas repactuadas | 2 | 1 | 1 | 1,3 | **1** |
| [RF45](8-requisitos.md#rf45) | Orientar o enquadramento de fotos | 1 | 1 | 1 | 1,0 | **1** |

??? note "Fundamentação técnica por requisito"
    - **RF01:** CRUD administrativo padrão em Next.js e PostgreSQL (stack consolidada).
    - **RF02:** Upload de arquivo digital e persistência de metadados no banco.
    - **RF03:** Formulário direto de cadastro com relacionamento 1:N no Prisma.
    - **RF04:** Modelagem relacional N:N no Prisma para amarração de metas a cláusulas.
    - **RF05:** Associação direta de campos de chave e governança de setor.
    - **RF06:** Atualização de campos de data limite e máquina de estados de status.
    - **RF07:** Componente visual de linha do tempo com filtros temporais em shadcn/ui.
    - **RF08:** Consultas condicionais de intervalo de datas e verificação de pendências.
    - **RF09:** Formulário administrativo padrão com vínculo relacional 1:N com projetos e N:N com metas contratuais no Prisma.
    - **RF10:** Estrutura de versionamento de configurações de comprovação por instrumento e modalidade (RN-04); requer modelagem de snapshots no Prisma.
    - **RF11:** Formulário público sem conta, com validação e proteção contra envio repetido.
    - **RF12:** Geração de código a partir do link público da atividade.
    - **RF13:** Reuso do formulário de inscrição em modo operado pela equipe.
    - **RF14:** Controle de concorrência na última vaga.
    - **RF15:** Fila ordenada por data de inscrição, com promoção quando abre vaga.
    - **RF16:** Interface mobile-first com gerenciamento de estado da chamada, marcação em lote e modal de inclusão avulsa de participantes; exige atenção à usabilidade em telas pequenas (RNF15).
    - **RF17:** Configuração de PWA com Service Workers e persistência determinística em IndexedDB; maior complexidade técnica da frente — exige pesquisa e estudo prévio de bibliotecas como Workbox/Dexie.js.
    - **RF18:** Fila assíncrona de envio no frontend com endpoints idempotentes no NestJS; requer transações de banco e tratamento de divergências de concorrência no PostgreSQL.
    - **RF19:** Validação de regra temporal no backend com preenchimento obrigatório de justificativa e gravação de evento na trilha de auditoria (RNF02).
    - **RF20:** Agregação sobre presenças confirmadas; depende do registro de presença.
    - **RF21:** Consulta com filtros sobre inscrições e presenças, restrita por perfil.
    - **RF22:** Comparação do e-mail ou do CPF no ato do cadastro, conforme o campo escolhido no formulário, com opção de reaproveitar o registro.
    - **RF23:** Texto de aviso versionado e registro de ciência junto à inscrição.
    - **RF24:** Campo de autorização com data e revogação.
    - **RF25:** Autorização com revogação e efeito sobre fotos de divulgação.
    - **RF26:** Edição com registro na trilha de auditoria.
    - **RF27:** Anonimização que preserva totais já reportados e registros sob guarda legal.
    - **RF28:** Lógica de agregação de presenças validadas e evidências homologadas via serviços no NestJS.
    - **RF29:** Parametrização condicional de fórmula conforme modalidade da meta cadastrada.
    - **RF30:** Comparação algorítmica entre o percentual realizado e a fração temporal decorrida do cronograma.
    - **RF31:** Esquema de versionamento com snapshots históricos de metas no Prisma.
    - **RF32:** Pipeline de upload multipart com validação de formato e tamanho no NestJS; integração com a Geolocation API do navegador condicionada à permissão do usuário.
    - **RF33:** Vínculo relacional N:N no Prisma entre evidência, atividade e metas; controle de ciclo de vida de rascunhos e verificação de bloqueio de encerramento (RN-11).
    - **RF34:** Controle de acesso granular via Guards no NestJS com restrição de escopo de visualização por perfil (RN-12).
    - **RF35:** Validação transacional de bloqueio de encerramento sem justificativa registrada.
    - **RF36:** Agrupamento de indicadores previstos versus realizados e ordenação cronológica do índice de evidências.
    - **RF37:** Diagramação de impressão de relatório formal em PDF com templates e ajustes de quebra de página via Puppeteer.
    - **RF38:** Geração e download de arquivo tabular estruturado (XLSX e CSV) a partir de consultas na base.
    - **RF39:** Registro automático de snapshots de alterações e justificativas em tabela de log permanente.
    - **RF40:** Cadastro de contas com perfis, desativação e regra de manter um administrador, sem integração externa.
    - **RF41:** Cadastro simples, sem regra além da ligação com a atividade.
    - **RF42:** Campos configuráveis por inscrição, com bloqueio de campo sensível e escolha do campo de cadastro repetido.
    - **RF43:** Registro na própria meta, com data de referência; o percentual sai do parâmetro planejado numérico, sem fórmula por meta.
    - **RF44:** Consulta sobre as versões do plano já guardadas pelo RF31, sem cálculo novo.
    - **RF45:** Texto de orientação na tela de captura da foto.

### 10.2.4 Tabela consolidada

| Código | Histórias | Valor | Esforço técnico | Destino |
| :---: | :--- | :---: | :---: | :--- |
| [RF01](8-requisitos.md#rf01) | HU-01a | 4 | 1 | MVP |
| [RF02](8-requisitos.md#rf02) | HU-01a | 4 | 1 | MVP |
| [RF03](8-requisitos.md#rf03) | HU-01a | 4 | 1 | MVP |
| [RF04](8-requisitos.md#rf04) | HU-01b | 4 | 2 | MVP |
| [RF05](8-requisitos.md#rf05) | HU-02a | 4 | 1 | MVP |
| [RF06](8-requisitos.md#rf06) | HU-02a | 4 | 1 | MVP |
| [RF07](8-requisitos.md#rf07) | HU-02b | 4 | 2 | MVP |
| [RF08](8-requisitos.md#rf08) | HU-02b | 4 | 2 | MVP |
| [RF09](8-requisitos.md#rf09) | HU-03a | 4 | 1 | MVP |
| [RF10](8-requisitos.md#rf10) | HU-03b | 4 | 3 | Incremento 2 |
| [RF11](8-requisitos.md#rf11) | HU-07a | 4 | 2 | MVP |
| [RF12](8-requisitos.md#rf12) | HU-07b | 4 | 1 | MVP |
| [RF13](8-requisitos.md#rf13) | HU-08 | 4 | 1 | MVP |
| [RF14](8-requisitos.md#rf14) | HU-07c | 4 | 2 | MVP |
| [RF15](8-requisitos.md#rf15) | HU-07c | 4 | 2 | MVP |
| [RF16](8-requisitos.md#rf16) | HU-09a | 2 | 3 | Incremento 3 |
| [RF17](8-requisitos.md#rf17) | HU-09b | 2 | 3 | Posterior |
| [RF18](8-requisitos.md#rf18) | HU-12 | 2 | 3 | Posterior |
| [RF19](8-requisitos.md#rf19) | HU-10 | 4 | 1 | Incremento 3 |
| [RF20](8-requisitos.md#rf20) | HU-06 | 2 | 2 | Posterior |
| [RF21](8-requisitos.md#rf21) | HU-06 | 2 | 1 | Posterior |
| [RF22](8-requisitos.md#rf22) | HU-08 | 4 | 2 | MVP |
| [RF23](8-requisitos.md#rf23) | HU-07a | 4 | 1 | MVP |
| [RF24](8-requisitos.md#rf24) | HU-07a | 4 | 1 | MVP |
| [RF25](8-requisitos.md#rf25) | HU-07a | 4 | 2 | MVP |
| [RF26](8-requisitos.md#rf26) | HU-15a | 4 🔧 | 1 | MVP |
| [RF27](8-requisitos.md#rf27) | HU-15b | 4 🔧 | 3 | MVP |
| [RF28](8-requisitos.md#rf28) | HU-11 | 3 | 2 | Posterior |
| [RF29](8-requisitos.md#rf29) | HU-11 | 3 | 1 | Posterior |
| [RF30](8-requisitos.md#rf30) | HU-11 | 3 | 2 | Posterior |
| [RF31](8-requisitos.md#rf31) | HU-14 | 4 | 2 | MVP |
| [RF32](8-requisitos.md#rf32) | HU-04a | 4 | 3 | Incremento 2 |
| [RF33](8-requisitos.md#rf33) | HU-04a | 4 | 2 | Incremento 2 |
| [RF34](8-requisitos.md#rf34) | HU-04b | 4 | 3 | Incremento 2 |
| [RF35](8-requisitos.md#rf35) | HU-05a | 4 | 1 | MVP |
| [RF36](8-requisitos.md#rf36) | HU-05a | 4 | 2 | MVP |
| [RF37](8-requisitos.md#rf37) | HU-05b | 4 | 3 | MVP |
| [RF38](8-requisitos.md#rf38) | HU-13 | 4 | 1 | MVP |
| [RF39](8-requisitos.md#rf39) | HU-05a | 4 | 1 | MVP |
| [RF40](8-requisitos.md#rf40) | HU-16 | 4 🔧 | 1 | MVP |
| [RF41](8-requisitos.md#rf41) | HU-03a | 4 | 1 | MVP |
| [RF42](8-requisitos.md#rf42) | HU-07b | 4 | 2 | MVP |
| [RF43](8-requisitos.md#rf43) | HU-05a | 4 | 1 | MVP |
| [RF44](8-requisitos.md#rf44) | HU-14 | 4 | 1 | MVP |
| [RF45](8-requisitos.md#rf45) | HU-04b | 4 | 1 | Incremento 2 |

### 10.2.5 Matriz 4 × 4

Linhas: valor de negócio. Colunas: esforço técnico. Em negrito, os requisitos do MVP.

| Valor \ Esforço | 1 | 2 | 3 | 4 |
| :---: | :--- | :--- | :--- | :--- |
| **4** | **RF01**, **RF02**, **RF03**, **RF05**, **RF06**, **RF09**, **RF12**, **RF13**, RF19, **RF23**, **RF24**, **RF26** 🔧, **RF35**, **RF38**, **RF39**, **RF40** 🔧, **RF41**, **RF43**, **RF44**, RF45 | **RF04**, **RF07**, **RF08**, **RF11**, **RF14**, **RF15**, **RF22**, **RF25**, **RF31**, RF33, **RF36**, **RF42** | RF10, **RF27** 🔧, RF32, RF34, **RF37** | — |
| **3** | RF29 | RF28, RF30 | — | — |
| **2** | RF21 | RF20 | RF16, RF17, RF18 | — |
| **1** | — | — | — | — |

Candidatos ao MVP pela regra da matriz: valor 4 com esforço 1 ou 2, e valor 3 com esforço 1, ponderados pelas dependências, pelo fluxo mínimo completo e pelos riscos. Requisito de valor alto e esforço alto é reduzido, dividido ou adiado, nunca descartado. O símbolo 🔧 marca valor ainda em conferência com o Instituto.


### 10.2.6 MVP e incrementos

O MVP é o primeiro recorte utilizável pelo Instituto: cadastrar o instrumento e o projeto, desdobrar requisitos e metas, dar responsável e prazo a cada meta, ser avisado dos vencimentos, registrar aditivos, receber inscrições por link, QR Code ou presencialmente, atender pedidos dos titulares dos dados e gerar a prestação de contas com justificativas. Na validação, o Instituto definiu parcerias e metas como a entrega prioritária, apontou as inscrições como o que "facilitaria para todas as equipes" e confirmou tentar o relatório e a planilha já no MVP.

O que este recorte permite verificar é o controle de instrumentos, metas, prazos e inscrições, com o relatório montado a partir desses registros. A redução do esforço de prestação de contas depende das evidências e da presença, que chegam nos incrementos 2 e 3, e é conferida com o Instituto a cada entrega 🔧.

Se a capacidade da sprint não comportar o recorte inteiro, descem para a sprint seguinte, nesta ordem, o PDF diagramado (HU-05b), o termo aditivo (HU-14) e o aviso por e-mail da HU-02b (CA-02b.4), única parte de história que desce separada do resto. O relatório com o resultado alcançado e as justificativas (HU-05a) e a planilha (HU-13) são preservados, e as histórias dos direitos do titular (HU-15a, HU-15b) não descem enquanto a inscrição pública puder receber dado real.

| Incremento | Épicos e histórias | Requisitos funcionais |
| :--- | :--- | :--- |
| **MVP** | Requisito e meta: HU-01a, HU-01b, HU-02a, HU-02b, HU-14 · Atividade: HU-03a · Pessoas: HU-07a, HU-07b, HU-07c, HU-08, HU-15a, HU-15b, HU-16 · Relatório: HU-05a, HU-05b, HU-13 | RF01 a RF09, RF11 a RF15, RF22 a RF27, RF31, RF35 a RF44 |
| Incremento 2 | Atividade: HU-03b · Evidência: HU-04a, HU-04b | RF10, RF32 a RF34, RF45 |
| Incremento 3 | Presença em campo: HU-09a, HU-10 | RF16, RF19 |
| Posterior | Presença em campo: HU-09b, HU-12 · Pessoas: HU-06 · Requisito e meta: HU-11 | RF17, RF18, RF20, RF21, RF28 a RF30 |

**Gargalos atendidos pelo MVP.** Os gargalos do processo atual (seção 8.4.3) ficam assim no primeiro recorte:

| Gargalo | No MVP | Nos incrementos |
| :---: | :--- | :--- |
| **G01** | Todos os requisitos (RF01 a RF04) | — |
| **G02** | RF05 a RF08; o controle interno de chamados não tem RF | — |
| **G03** | Cadastro de atividades e inscrições (RF09, RF11 a RF15, RF41) | Comprovações e evidências (RF10, RF32 a RF34, RF45) no incremento 2; presença on-line e lançamento fora do prazo (RF16, RF19) no incremento 3; operação sem conexão e carga horária (RF17, RF18, RF20) depois |
| **G04** | Inscrição e direitos do titular (RF11, RF22 a RF27, RF42) | Ficha da pessoa (RF21) depois |
| **G05** | Versionamento do plano e comparativo das metas repactuadas (RF31, RF44) | Progresso calculado, apuração e alerta de risco (RF28 a RF30) depois; o painel da Presidência não tem RF |
| **G06** | Relatório com resultado alcançado e justificativas, PDF e planilha (RF35 a RF39, RF43) | Índice de evidências no relatório (RF36) e miniaturas no PDF (RF37) no incremento 2 |

**Justificativas do recorte.**

- **Fluxo mínimo completo.** O MVP fecha dois ciclos: do cadastro do instrumento à emissão do relatório, e da criação da atividade à lista de inscritos, com os controles de dados pessoais que a inscrição exige.
- **Inscrições no MVP (HU-07a, HU-07b, HU-07c e HU-08).** Valor 4 e esforço 1 ou 2 em todos os requisitos; o Instituto disse que elas "seriam excelentes" para acompanhar inscritos e metas em todas as equipes.
- **RF09 (cadastrar atividade), da HU-03a.** Entra no MVP por dependência, porque toda inscrição é feita em uma atividade. As comprovações por modalidade (RF10) ficam para o incremento 2, com as evidências; a HU-03a cobre o cadastro e a HU-03b, as comprovações.
- **HU-15a e HU-15b no MVP, valor 4 🔧.** Com as inscrições, o sistema passa a guardar dados pessoais de participantes, e o atendimento aos direitos do titular é obrigação legal desde o primeiro dado. O RF27 (excluir ou anonimizar, esforço 3) entra por essa obrigação.
- **RF41 (cadastrar modalidades), da HU-03a.** Entra com o RF09, porque cada atividade é cadastrada em uma modalidade criada pelo Instituto.
- **Configuração do formulário (RF42), da HU-07b.** Entra com as inscrições porque o campo que identifica cadastro repetido (e-mail ou CPF) é escolhido no formulário, a confirmar com o Instituto 🔧.
- **HU-16 (contas e perfis) no MVP.** O acesso por perfil vale desde a primeira entrega e depende das contas; a história também serve às validações com o Instituto.
- **RF37 (relatório em PDF), valor 4 e esforço 3.** Entra por proposta da equipe confirmada pelo Instituto, em forma reduzida: no MVP o PDF reproduz o relatório do RF36 sem as miniaturas de evidências, que chegam com o incremento 2.
- **RF36 e RF43 (relatório de execução e resultado alcançado).** No MVP o relatório traz metas, indicadores pactuados, o resultado alcançado registrado pelo usuário autorizado (RF43), com o percentual calculado na meta quantitativa, e as justificativas; o índice de comprovações chega com a evidência (incremento 2) e o cálculo automático do alcançado, com o RF28 (HU-11). Sem o registro do resultado, o relatório só reorganizaria dados consolidados fora do sistema.
- **Relatório e planilha com os dados existentes (HU-05a, HU-05b e HU-13).** No MVP, o relatório, o PDF e a planilha saem com metas, resultado alcançado e justificativas; as evidências e as presenças passam a compor esses documentos quando a HU-04a e a HU-09a são entregues, cada uma com o critério que o verifica.
- **Evidências no incremento 2.** O Instituto ordenou as evidências logo depois do MVP; o esforço delas (RF32 e RF34 com esforço 3) não cabe na primeira entrega. A orientação de enquadramento (RF45) vai junto, porque só existe na tela de registro da foto (RF32).
- **HU-10 (lançamento fora do prazo).** Foi apresentada e validada junto com evidências, mas corrige presenças já registradas; por isso acompanha o registro de presença no incremento 3.
- **RF16 (registro on-line de presença), valor 2.** Sobe para o incremento 3 por dependência: a HU-10, de valor 4, corrige presenças registradas por ele. O registro sem conexão (RF17) e a sincronização (RF18) ficam para depois.
- **HU-11 (progresso e risco), valor 3.** Fica para o fim porque o cálculo (RF28) depende de presenças e evidências registradas; antes disso o painel mostraria números enganosos. O RF29, candidato pela matriz, só tem efeito junto com o RF28.

### 10.2.7 Requisitos não funcionais no MVP

| Classe | Requisitos não funcionais | Motivo |
| :--- | :--- | :--- |
| Obrigatórios para o MVP | [RNF03](8-requisitos.md#rnf03), [RNF04](8-requisitos.md#rnf04), [RNF16](8-requisitos.md#rnf16), [RNF17](8-requisitos.md#rnf17), [RNF18](8-requisitos.md#rnf18) | Valem para todo o produto desde a primeira entrega: acesso autenticado por perfil, conforme os perfis levantados com o Instituto (8.5.1), compatibilidade, pilha tecnológica e cópia de segurança; RNF03, RNF04, RNF16 e RNF17 fazem parte da Definition of Done dos itens de código |
| Associados a RFs do MVP (exigíveis na conclusão da história que os lista) | [RNF01](8-requisitos.md#rnf01), [RNF02](8-requisitos.md#rnf02), [RNF05](8-requisitos.md#rnf05), [RNF06](8-requisitos.md#rnf06), [RNF07](8-requisitos.md#rnf07), [RNF08](8-requisitos.md#rnf08), [RNF11](8-requisitos.md#rnf11), [RNF12](8-requisitos.md#rnf12), [RNF13](8-requisitos.md#rnf13), [RNF15](8-requisitos.md#rnf15) | Integridade das metas, auditoria, minimização de dados e prazo de exclusão, guarda e integridade dos relatórios, desempenho do painel de prazos, da inscrição pública e da geração de relatórios, usabilidade da inscrição em celular |
| Evolutivos | [RNF09](8-requisitos.md#rnf09), [RNF10](8-requisitos.md#rnf10), [RNF14](8-requisitos.md#rnf14), [RNF19](8-requisitos.md#rnf19), [RNF20](8-requisitos.md#rnf20) | Entram com os incrementos de evidência, de presença e de operação sem conexão; a cópia integral dos dados (RNF19), com a transferência do sistema |
| Não aplicáveis | — | Nenhum requisito não funcional foi descartado |

### 10.2.8 Validação com o Instituto

Os códigos de história são os da sessão; a correspondência com as histórias derivadas está na 10.2.2.

| Item | Registro |
| :--- | :--- |
| Data e formato | 28/09/2026, 16h, reunião online com gravação autorizada |
| Participantes do Instituto | Clara Novaes, diretora pedagógica; Maria Eduarda |
| Participantes da equipe | Vinicius Vieira, Rodrigo Henrique Donato, Lucas de Paula Leal, Caio Martins; Daniel Batista 🔧 |
| Apresentado | Quinze histórias em quatro jornadas, com os requisitos e as regras de negócio de cada uma, e a escala de valor de 4 a 1 |
| Aprovado para o MVP | Parcerias e metas (HU-01, HU-02, HU-14); inscrições públicas e assistidas (HU-07, HU-08); prestação de contas com relatório e planilha (HU-05, HU-13), se couberem na capacidade |
| Adiado | Evidências para o incremento 2; registro de presença para o incremento 3; registro sem conexão, histórico de participação e painel de risco para depois |
| Ajustes pedidos | Aviso de vencimento automático com 30 dias de antecedência e aviso manual na própria meta, enviado primeiro por e-mail; encerramento de projeto restrito à coordenação da execução, sem bloqueio por evidência antiga que não pode ser recuperada; trava do relatório por falta de justificativa mantida, com notificação à direção sem parar as demais áreas; correção fora do prazo sem aprovação; modalidades de atividade criadas pelo próprio Instituto |
| Confirmado sem ajuste | Meta sem parâmetros fica em rascunho; aditivo gera nova versão e preserva a original; alteração em registro já publicado exige justificativa |
| Pedido novo | Registrar a alteração do período de execução e atualizar os prazos que dependem dele, a especificar |
| Divergências e pendências | A ordem dos incrementos vai à conferência do Instituto: as inscrições foram confirmadas para o MVP no início da sessão e, na ordem final, o campo ficou depois das evidências; a equipe manteve as inscrições no MVP e posicionou por dependência o RF09 e a HU-15 no MVP e a HU-10 e o RF16 no incremento 3; a HU-15 não foi votada e seu valor vai à conferência; a repetição do aviso depois dos 30 dias está a definir; a trava do relatório sobre pagamentos depende da área financeira |
| Alcance da validação | O MVP foi aprovado pelo núcleo pedagógico. O relatório e a planilha (HU-05a, HU-05b e HU-13) aguardam a validação da área administrativo-financeira, que responde por eles ([seção 7.3.1](../visao/7-equipe-e-cliente.md#731-area-competente-por-funcionalidade)) |
