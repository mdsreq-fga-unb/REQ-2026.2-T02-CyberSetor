# 8. Requisitos de Software

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 19/09/2026 | 1.0 | Primeira versão do catálogo de requisitos | Rodrigo Henrique e Vinicius Vieira |
| 19/09/2026 | 1.1 | Requisitos de CP3 e CP5 e perguntas-chave | Maria Eduarda Marques e Daniel Batista |
| 20/09/2026 | 1.2 | Requisitos de CP2, CP4 e CP7 e registro sem conexão | Caio Flávio e Lucas Leal |
| 20/09/2026 | 1.3 | Requisitos de CP6 e CP8 e regras de prestação de contas | Caio Flávio, Lucas Leal e Vinicius Vieira |
| 20/09/2026 | 1.4 | Refinamento da CP1, notas de domínio e matriz dos gargalos | Rodrigo Henrique e Vinicius Vieira |
| 21/09/2026 | 1.5 | RNFs consolidados sob FURPS+ e Sommerville | Maria Eduarda Marques e Vinicius Vieira |
| 21/09/2026 | 1.6 | Matriz de rastreabilidade bidirecional e auditoria de lacunas | Maria Eduarda Marques e Daniel Batista |
| 21/09/2026 | 2.0 | Catálogo unificado (RF01 a RF37, RNF01 a RNF18), notas de domínio e matriz de rastreabilidade | Equipe CyberSetor |
| 21/09/2026 | 2.1 | Âncoras restauradas; tecnologia retirada dos requisitos; regras de negócio em subseção própria; rastreabilidade sem dados de sprint; valores iniciais marcados com 🔧 | Equipe CyberSetor |
| 27/09/2026 | 2.2 | RF01 e RF04 divididos; numeração contínua RF01 a RF39; redação de CP1, CP6 e CP8; matriz de rastreabilidade e regras de negócio sincronizadas | Daniel Batista e Rodrigo Henrique |
| 28/09/2026 | 2.3 | Redação de CP2, CP4 e CP7; vínculo da atividade às metas (RF09); participante não inscrito na chamada (RF16); preparação da lista para uso sem conexão (RF17); descarte de rascunho (RF33) | Caio Martins e Lucas Leal |
| 29/09/2026 | 2.4 | Aviso de vencimento com 30 dias e por e-mail (RF08, RN-03); modalidades criadas pelo Instituto (RF09, RF10); correção fora do prazo sem aprovação (RF19); trava do relatório com notificação à direção (RF35); encerramento do projeto (RN-11); justificativa para alterar registro concluído (RN-13); CP3, CP5 e RF20 reescritos; ator genérico em CP1, RF29 a RF31 e RF36; RN-07 revista; matriz pelas histórias HU-01 a HU-15; tabela de códigos provisórios retirada | Vinicius Vieira e Maria Eduarda Marques |
| 05/10/2026 | 2.5 | Seções 8.2 e 8.3 em tabelas por característica de produto e por categoria de RNF, com âncoras preservadas e ligação direta às histórias da seção 10 | Rodrigo Henrique |
| 05/10/2026 | 2.6 | Padronização verbal descrita como redução de ambiguidades, sem garantir sua ausência | Maria Eduarda Marques |
| 19/10/2026 | 2.7 | Matriz dos requisitos não funcionais: RF09 ligado a RNF02, RNF04 e RNF15 | Maria Eduarda Marques |
| 20/10/2026 | 2.8 | RF09 com o vínculo da atividade às metas; RF16 com a presença dos inscritos; RF31 e RN-09 com a mudança do período de execução; RF22 por e-mail ou CPF, conforme o formulário; documento formal em PDF ou DOCX (RF02) e planilha em XLSX ou CSV (RF38); administração de contas (RF40), cadastro de modalidades (RF41) e configuração do formulário de inscrição (RF42); matriz dos requisitos funcionais pela história dona e pelos novos critérios; matrizes dos requisitos não funcionais e das regras de negócio completadas; perfil de administração do sistema; dados mínimos da inscrição; métrica da RNF03 com sessão e bloqueio por tentativas; pontos em aberto revistos contra as validações com o Instituto | Equipe CyberSetor |
| 26/10/2026 | 2.9 | Resultado alcançado da meta (RF43, RN-14), com percentual calculado na meta quantitativa e classificação do alcance; parâmetro planejado numérico na meta quantitativa (RF04, RN-02); relatório com o resultado alcançado e aviso à direção ou à coordenação responsável (RF35, RF36); meta de marco e comparativo dos aditivos na seção 8.5.3 alinhados ao RN-14 e ao RF44; dados da atividade (RF09); comparativo das metas repactuadas (RF44) separado do versionamento (RF31); orientação de enquadramento (RF45) separada da restrição de acesso às fotos (RF34); carga horária (RN-15); métricas de cifragem e revogação de sessão com a exceção do formulário público (RNF03), de escopo por perfil (RNF04), de texto livre e anexos (RNF05), de conferência dos números do relatório (RNF08), de ambiente e massa de referência (RNF11, RNF13) e de restauração conjunta de banco e arquivos (RNF18); acessibilidade (RNF15) separada da eficiência da chamada (RNF20); portabilidade dos dados (RNF19); controle de acesso por perfil para todo o produto; regras de negócio citadas nos dois sentidos e gargalos de inscrição e de direitos do titular na matriz; RN-13 ligada ao RF06; encontros da atividade e formulários de inscrição entre os pontos em aberto | Vinicius Vieira |

---

## 8.1 Introdução Metodológica

A especificação de requisitos do sistema CyberSetor orienta-se pela abordagem ágil ScrumXP combinada aos preceitos da Engenharia de Requisitos contemporânea. A declaração e a taxonomia seguem as diretrizes metodológicas da disciplina (Marsicano, 2026), com requisitos funcionais orientados à ação e requisitos não funcionais fundamentados no modelo **FURPS+** e na taxonomia de **Ian Sommerville**.

A governança do catálogo adota:
- **Identificadores unívocos:** Códigos prefixados (`RFxx` e `RNFxx`; `RN-xx` para regras de negócio) em sequência única e contínua, acompanhados de âncoras explícitas para permitir rastreamento direto a partir de issues, histórias de usuário e matrizes. Os RFs estão agrupados por característica de produto; a numeração é contínua e não indica a característica.
- **Padronização verbal:** Todo requisito funcional é expresso no formato **Verbo no Infinitivo + Objeto Direto**, definindo uma única ação verificável, o que reduz ambiguidades de escopo; as que restarem são tratadas na revisão.
- **Critérios verificáveis:** Todo requisito não funcional estabelece uma métrica quantitativa numérica, passível de verificação objetiva por testes automatizados, auditoria de código ou inspeção determinística.
- **Valores iniciais:** O símbolo 🔧 marca parâmetro adotado como valor inicial, sem fonte normativa ou medição que o fixe; permanece válido para verificação até ser confirmado com o Instituto ou recalibrado no piloto.

---

## 8.2 Lista de Requisitos Funcionais (RFs)

### CP1 — Gestão de Projetos e Metas
| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf01"></a>**RF01** | Cadastrar instrumento convocatório e parceria | Permitir ao usuário autorizado cadastrar os instrumentos de parceria com o poder público, com tipo, órgão concedente, número do processo, valor global e vigência. | MROSC art. 16 e 42 \| [HU-01a](10-backlog.md#hu-01a) |
| <a id="rf02"></a>**RF02** | Anexar documento formal homologado de parceria | Permitir ao usuário autorizado anexar ao instrumento, em PDF ou DOCX, o documento formal que o celebra. | MROSC art. 16 e 42 \| [HU-01a](10-backlog.md#hu-01a) |
| <a id="rf03"></a>**RF03** | Cadastrar projeto operacional | Permitir ao usuário autorizado cadastrar os projetos de um instrumento ativo, com código, título, coordenador e cronograma. | OE01 \| [HU-01a](10-backlog.md#hu-01a) |
| <a id="rf04"></a>**RF04** | Desdobrar requisitos contratuais e metas | Permitir ao usuário autorizado desdobrar o plano de trabalho em metas vinculadas aos requisitos do instrumento, registrando origem, indicador, parâmetro planejado (número com unidade, na meta quantitativa), periodicidade e comprovação. | MROSC art. 22 e 42; [RN-01](#rn-01), [RN-02](#rn-02) \| [HU-01b](10-backlog.md#hu-01b) |
| <a id="rf05"></a>**RF05** | Atribuir responsável e setor executor a meta | Permitir ao usuário autorizado atribuir a cada meta um responsável e o setor executor. | Decisão 3 da ata de 08/09 \| [HU-02a](10-backlog.md#hu-02a) |
| <a id="rf06"></a>**RF06** | Fixar prazo fatal e status de meta | Permitir ao usuário autorizado definir o prazo da meta e registrar sua situação: pendente, em andamento ou concluída. | OE04; [RN-13](#rn-13) \| [HU-02a](10-backlog.md#hu-02a) |
| <a id="rf07"></a>**RF07** | Exibir linha do tempo e painel de prazos de metas | Permitir ao usuário autorizado consultar a linha do tempo do projeto, com a vigência do instrumento, os prazos das metas e os requisitos atendidos. | OE01, OE04; [RN-01](#rn-01) \| [HU-02b](10-backlog.md#hu-02b) |
| <a id="rf08"></a>**RF08** | Emitir alertas de proximidade e pendências de metas | Alertar os usuários autorizados, no painel do projeto e por e-mail, sobre metas com prazo próximo, vencidas sem comprovação ou sem responsável. | [RN-03](#rn-03) \| [HU-02b](10-backlog.md#hu-02b) |
| <a id="rf40"></a>**RF40** | Administrar contas e perfis de acesso | Permitir à administração do sistema criar contas da equipe com um perfil de acesso, mudar o perfil, desativar a conta e redefinir a senha, sem deixar o sistema sem administrador. | Seção 8.5.1; [RNF04](#rnf04) \| [HU-16](10-backlog.md#hu-16) |

### CP2 — Gestão de Atividades
| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf09"></a>**RF09** | Cadastrar atividade por modalidade de objeto | Permitir ao usuário autorizado cadastrar atividade de um projeto, com título, local, data de realização e responsável, vinculada a uma das modalidades cadastradas pelo Instituto e às metas a que contribui. | Seção 3.3.6; [RN-04](#rn-04) \| [HU-03a](10-backlog.md#hu-03a) |
| <a id="rf10"></a>**RF10** | Parametrizar exigência de comprovação de presença | Permitir ao usuário autorizado configurar, por instrumento e modalidade, quais comprovações são obrigatórias, opcionais ou condicionais. | Seção 3.3.6; [RN-04](#rn-04) \| [HU-03b](10-backlog.md#hu-03b) |
| <a id="rf41"></a>**RF41** | Cadastrar modalidades de objeto | Permitir ao usuário autorizado cadastrar as modalidades de objeto usadas pelo Instituto. | Seção 3.3.6; validação com o Instituto em 28/09/2026 \| [HU-03a](10-backlog.md#hu-03a) |

### CP3 — Inscrição de Participantes
| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf11"></a>**RF11** | Disponibilizar formulário público de inscrição | Permitir ao interessado se inscrever em uma atividade por formulário público no celular, sem criar conta nem senha. | [RN-05](#rn-05), [RN-06](#rn-06) \| [HU-07a](10-backlog.md#hu-07a) |
| <a id="rf12"></a>**RF12** | Gerar link e QR Code de inscrição | Permitir ao usuário autorizado gerar, para cada atividade, o link e o QR Code do formulário público de inscrição. | OE02 \| [HU-07b](10-backlog.md#hu-07b) |
| <a id="rf13"></a>**RF13** | Registrar inscrição presencial assistida | Permitir ao usuário autorizado inscrever presencialmente quem não dispõe de celular ou conectividade. | Seção 3.3.10; [RN-05](#rn-05), [RN-06](#rn-06) \| [HU-08](10-backlog.md#hu-08) |
| <a id="rf14"></a>**RF14** | Limitar vagas da atividade | Encerrar as inscrições confirmadas de uma atividade quando o número de vagas estipulado for atingido. | OE01, OE02 \| [HU-07c](10-backlog.md#hu-07c) |
| <a id="rf15"></a>**RF15** | Registrar lista de espera | Registrar as inscrições excedentes em lista de espera ordenada por ordem cronológica de chegada. | OE01, OE02 \| [HU-07c](10-backlog.md#hu-07c) |
| <a id="rf42"></a>**RF42** | Configurar o formulário de inscrição | Permitir ao usuário autorizado definir, ao abrir a inscrição de uma atividade, os campos do formulário além dos mínimos e o campo que identifica cadastro repetido 🔧. | OE02; validação com o Instituto em 08/10/2026 \| [HU-07b](10-backlog.md#hu-07b) |

### CP4 — Registro de Participação em Campo
| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf16"></a>**RF16** | Registrar frequência em dispositivo móvel | Permitir ao usuário autorizado registrar a presença dos inscritos de uma atividade e incluir participante não inscrito, com dados mínimos de identificação para posterior regularização cadastral. | OE03, OE04 \| [HU-09a](10-backlog.md#hu-09a) |
| <a id="rf17"></a>**RF17** | Operar registro de presença em modo offline | Permitir o registro de presenças em modo offline, armazenando os dados localmente e indicando na tela a confirmação de salvamento local até a sincronização. | Seção 3.3.3 \| [HU-09b](10-backlog.md#hu-09b) |
| <a id="rf18"></a>**RF18** | Sincronizar presenças com reconciliação idempotente | Enviar automaticamente os registros de presença salvos localmente assim que a conexão retornar, reconciliando dados sem duplicações. | Seção 3.3.3 \| [HU-12](10-backlog.md#hu-12) |
| <a id="rf19"></a>**RF19** | Registrar lançamento extemporâneo com justificativa | Permitir ao usuário autorizado lançar ou retificar frequência após a data de realização, com justificativa obrigatória e sem depender de aprovação prévia. | Seção 3.3.8; [RN-13](#rn-13) \| [HU-10](10-backlog.md#hu-10) |
| <a id="rf20"></a>**RF20** | Apurar carga horária de participantes e facilitadores | Calcular a carga horária acumulada de cada participante e facilitador a partir das presenças confirmadas. | OE03, OE04; [RN-15](#rn-15) \| [HU-06](10-backlog.md#hu-06) |

### CP5 — Cadastro e Histórico de Pessoas
| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf21"></a>**RF21** | Consultar histórico de participação | Permitir ao usuário autorizado consultar a ficha consolidada de uma pessoa, contendo atividades e projetos dos quais participou. | OE01 \| [HU-06](10-backlog.md#hu-06) |
| <a id="rf22"></a>**RF22** | Avisar cadastro repetido | Avisar o usuário autorizado quando o e-mail ou o CPF informado, conforme o campo escolhido no formulário de inscrição 🔧, coincidir com cadastro prévio, facultando o reaproveitamento do registro existente. | OE01; validação com o Instituto em 08/10/2026 \| [HU-08](10-backlog.md#hu-08) |
| <a id="rf23"></a>**RF23** | Registrar aviso de tratamento de dados na inscrição | Registrar em cada inscrição a versão do aviso de tratamento de dados exibida ao titular, com carimbo de data e hora. | LGPD art. 7º, 8º, 9º e 14; [RN-05](#rn-05), [RN-06](#rn-06) \| [HU-07a](10-backlog.md#hu-07a) |
| <a id="rf24"></a>**RF24** | Registrar autorização de contato | Registrar autorização opcional para recebimento de informativos e permitir sua revogação com data e canal. | Seção 3.3.5; LGPD art. 8º, §5º; [RN-05](#rn-05) \| [HU-07a](10-backlog.md#hu-07a) |
| <a id="rf25"></a>**RF25** | Registrar autorização de uso de imagem | Registrar separadamente a anuência ou recusa ao uso institucional de imagem e sua eventual revogação, sem condicionar a participação. | Seção 3.3.4; LGPD art. 7º e 8º; [RN-05](#rn-05), [RN-12](#rn-12) \| [HU-07a](10-backlog.md#hu-07a) |
| <a id="rf26"></a>**RF26** | Corrigir dados a pedido do titular | Permitir ao usuário autorizado retificar os dados cadastrais mediante solicitação do titular, com justificativa registrada. | Seção 3.3.9; LGPD art. 18, III \| [HU-15a](10-backlog.md#hu-15a) |
| <a id="rf27"></a>**RF27** | Excluir ou anonimizar dados de pessoa | Permitir ao usuário autorizado excluir ou anonimizar os dados a pedido do titular ou ao término da finalidade, observando os prazos legais de guarda. | LGPD art. 16 e 18; [RN-07](#rn-07) \| [HU-15b](10-backlog.md#hu-15b) |

### CP6 — Acompanhamento Automático de Metas
| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf28"></a>**RF28** | Calcular progresso físico de metas automaticamente | Calcular o progresso e percentual atingido de cada meta contratual imediatamente após o registro de presenças confirmadas ou comprovações. | [RN-02](#rn-02), [RN-08](#rn-08), [RN-14](#rn-14) \| [HU-11](10-backlog.md#hu-11) |
| <a id="rf29"></a>**RF29** | Parametrizar apuração de metas por acúmulo contínuo ou marco de entrega | Permitir ao usuário autorizado parametrizar o modelo de apuração da meta: progressão contínua cumulativa ou por entrega de marco. | Seção 2.3; [RN-08](#rn-08) \| [HU-11](10-backlog.md#hu-11) |
| <a id="rf30"></a>**RF30** | Emitir alertas de risco de inexecução | Alertar no painel quando a execução de uma meta estiver 20 pontos percentuais ou mais abaixo do tempo transcorrido do período 🔧. | OE04 \| [HU-11](10-backlog.md#hu-11) |
| <a id="rf31"></a>**RF31** | Versionar o plano de trabalho | Permitir ao usuário autorizado registrar termo aditivo, apostila ou mudança do período de execução como nova versão do plano de trabalho, preservando a versão anterior e os resultados já apurados. | MROSC art. 55 e 57; [RN-09](#rn-09), [RN-13](#rn-13) \| [HU-14](10-backlog.md#hu-14) |
| <a id="rf43"></a>**RF43** | Registrar o resultado alcançado da meta | Permitir ao usuário autorizado registrar, para cada meta e data de referência, a descrição do resultado alcançado, a classificação do alcance (cumprida, parcialmente cumprida ou não cumprida) e, na meta quantitativa, o valor alcançado, com o percentual de cumprimento e a classificação calculados sobre o parâmetro planejado. | MROSC art. 66; [RN-14](#rn-14) \| [HU-05a](10-backlog.md#hu-05a) |
| <a id="rf44"></a>**RF44** | Comparar metas repactuadas | Permitir ao usuário autorizado consultar, para cada meta repactuada, o previsto original, o reprogramado e o realizado. | MROSC art. 57; [RN-09](#rn-09) \| [HU-14](10-backlog.md#hu-14) |

### CP7 — Repositório de Evidências e Documentação
| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf32"></a>**RF32** | Anexar evidências documentais e fotográficas | Permitir ao usuário autorizado registrar arquivos comprobatórios registrando data, hora, autor e, quando autorizado pelo aparelho, coordenadas geográficas. | [RN-10](#rn-10) \| [HU-04a](10-backlog.md#hu-04a) |
| <a id="rf33"></a>**RF33** | Vincular evidência a meta contratual | Permitir ao usuário autorizado vincular a comprovação a uma atividade e metas contratuais, possibilitando descartar rascunhos para concluir a atividade. | [RN-04](#rn-04), [RN-10](#rn-10), [RN-11](#rn-11), [RN-13](#rn-13) \| [HU-04a](10-backlog.md#hu-04a) |
| <a id="rf34"></a>**RF34** | Restringir o acesso a fotos de prova de execução | Restringir a visualização das imagens registradas como prova de execução aos perfis de coordenação e prestação de contas. | Seção 3.3.4; LGPD art. 7º, I, e 14; [RN-12](#rn-12) \| [HU-04b](10-backlog.md#hu-04b) |
| <a id="rf45"></a>**RF45** | Orientar o enquadramento de fotos | Exibir ao usuário autorizado, ao registrar foto comprobatória, a orientação de enquadramento que evita identificar participantes. | Seção 3.3.4; LGPD art. 14 \| [HU-04b](10-backlog.md#hu-04b) |

### CP8 — Relatórios e Exportação de Dados
| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf35"></a>**RF35** | Exigir justificativa prévia para metas não atingidas | Impedir a finalização do relatório enquanto houver meta parcialmente cumprida ou não cumprida sem justificativa, notificando a direção ou a coordenação responsável sem travar os registros. | MROSC art. 64; [RN-11](#rn-11) \| [HU-05a](10-backlog.md#hu-05a) |
| <a id="rf36"></a>**RF36** | Emitir Relatório de Execução do Objeto | Permitir ao usuário autorizado gerar o relatório periódico de execução com as metas pactuadas, o resultado alcançado de cada uma (RF43), as justificativas e o índice cronológico de evidências. | MROSC art. 63 a 66; [RN-11](#rn-11), [RN-14](#rn-14) \| [HU-05a](10-backlog.md#hu-05a) |
| <a id="rf37"></a>**RF37** | Gerar relatório diagramado em PDF | Compilar e baixar o Relatório de Execução do Objeto em PDF padronizado com cabeçalho institucional, sumário, tabelas e evidências. | Seção 2.4 \| [HU-05b](10-backlog.md#hu-05b) |
| <a id="rf38"></a>**RF38** | Exportar dados analíticos e consolidados em planilha aberta | Permitir ao usuário autorizado exportar os dados do projeto em formato tabular aberto (XLSX e CSV), selecionando entre visão analítica ou consolidada de metas. | MROSC art. 64 \| [HU-13](10-backlog.md#hu-13) |
| <a id="rf39"></a>**RF39** | Registrar trilha de auditoria das operações de prestação de contas | Gravar em trilha imutável retificações, justificativas ou emissões de relatórios oficiais com data/hora e autor. | OE04; [RN-13](#rn-13) \| [HU-05a](10-backlog.md#hu-05a) |

---

## 8.3 Lista de Requisitos Não Funcionais (RNFs)

### Confiabilidade e Integridade
| Identificador | Requisito | Classificação (FURPS+ / Sommerville) | Descrição | Métrica Verificável |
| :---: | :--- | :--- | :--- | :--- |
| <a id="rnf01"></a>**RNF01** | Integridade transacional dos dados | Confiabilidade / Requisito de Produto | Garantir conclusão ou reversão integral de operações compostas, sem persistir estados intermediários órfãos. | 100% de reversão automática em falhas; 0 registros órfãos ou inconsistentes em testes de integração. |
| <a id="rnf02"></a>**RNF02** | Auditabilidade das alterações | Confiabilidade e Segurança / Requisito de Produto | Registrar em trilha imutável criações, alterações e exclusões lógicas com autor, data/hora e valores anteriores/posteriores. | 100% das operações de criação, alteração e exclusão lógica registradas em trilha imutável com autor, data/hora e valores anteriores/posteriores, mesmo para o perfil administrador. |
| <a id="rnf08"></a>**RNF08** | Integridade de relatórios fechados | Confiabilidade e Segurança / Requisito de Produto | Assegurar que relatórios homologados congelem os dados do ciclo, impedindo alterações retroativas sem rastro, e que os números do relatório correspondam aos registros. | 100% de correspondência entre verificação de integridade do arquivo gerado e registro na base; 0 alterações diretas no ciclo fechado; 100% de igualdade entre o relatório gerado e uma massa com resultados conhecidos (por meta: pactuado, alcançado, percentual e justificativa); relatório de versão fechada reemitido idêntico depois de novos registros no período. |
| <a id="rnf09"></a>**RNF09** | Resiliência offline e sincronização sem duplicidade | Confiabilidade e Usabilidade / Requisito de Produto | Manter funcionamento de chamadas e evidências sem rede móvel, persistindo dados locais e sincronizando sem duplicidades. | 0% de perda após corte de sinal e recarga; 0 duplicidades após 5 retransmissões do mesmo lote em testes ponta a ponta. |
| <a id="rnf18"></a>**RNF18** | Cópia de segurança e recuperação de dados | Confiabilidade / Requisito Organizacional | Manter rotinas automáticas de backup externo e fluxo testado de restauração operacional do banco e dos arquivos. | RPO máximo de 6 h e RTO de até 8 h 🔧; ensaio de restauração a cada 3 meses 🔧 e antes de cada implantação em produção, em ambiente isolado, restaurando juntos banco e arquivos (documentos formais, evidências e relatórios emitidos), com registro de data, ponto restaurado, duração, contagem de registros e abertura de uma amostra dos arquivos. |

### Segurança e Privacidade
| Identificador | Requisito | Classificação (FURPS+ / Sommerville) | Descrição | Métrica Verificável |
| :---: | :--- | :--- | :--- | :--- |
| <a id="rnf03"></a>**RNF03** | Segurança das comunicações e das sessões | Segurança / Requisito de Produto | Proteger conexões em trânsito com cifragem, rejeitar requisições sem autenticação, exceto as operações públicas do formulário de inscrição (RF11), encerrar sessões por inatividade, por duração máxima e por revogação, e bloquear tentativas repetidas de senha. | 100% das requisições servidas só por conexão cifrada, sem aceitar TLS anterior à versão 1.2; 100% de rejeição de requisições sem credencial válida fora das operações públicas do RF11; sessão encerrada após 30 min de inatividade e 8 h de duração 🔧 e invalidada no servidor ao sair, ao redefinir a senha ou ao desativar a conta, com recusa da requisição seguinte 🔧; acesso bloqueado por 15 min após 10 senhas erradas seguidas 🔧. |
| <a id="rnf04"></a>**RNF04** | Controle de acesso por perfil | Segurança / Requisito de Produto | Restringir operações e o escopo dos dados conforme as permissões da matriz de perfis da seção 8.5.1. | 100% de bloqueio, em testes de API por perfil, das operações não permitidas na matriz da seção 8.5.1 e dos registros fora do escopo do perfil; 0 consultas a nomes pelo perfil financeiro. |
| <a id="rnf05"></a>**RNF05** | Minimização de dados pessoais | Restrição de Design (+) / Requisito Externo | Limitar cadastro a dados necessários (contato e consentimentos), sem campos de dados pessoais sensíveis (LGPD art. 5º, II), e restringir texto livre e anexos que possam revelá-los à finalidade para a qual foram registrados. | 0 campos estruturados de dados sensíveis no esquema do banco e nos formulários configuráveis (CA-07b.2); 100% dos campos de texto livre e dos anexos com finalidade declarada e acesso restrito aos perfis dessa finalidade (seção 8.5.1, RN-12), conferidos em revisão de esquema e de permissões. |
| <a id="rnf06"></a>**RNF06** | Prazo de atendimento à exclusão de dados | Requisito Legal (+) / Requisito Externo | Processar pedidos de exclusão ou anonimização de dados pessoais dentro do prazo regulamentar com registro em trilha (a LGPD não fixa prazo no art. 19; o valor de 72 h é parâmetro inicial pactuado com a monitoria). | 100% dos pedidos atendidos em até 72 horas 🔧, comprovado por carimbos de data/hora na trilha de auditoria. |
| <a id="rnf10"></a>**RNF10** | Descarte de dados pessoais no aparelho | Segurança / Requisito de Produto | Limpar dados nominais do armazenamento local de aparelhos móveis imediatamente após a sincronização com o servidor. | 0 registros locais remanescentes no navegador do dispositivo após confirmação de entrega bem-sucedida. |

### Conformidade Legal (MROSC)
| Identificador | Requisito | Classificação (FURPS+ / Sommerville) | Descrição | Métrica Verificável |
| :---: | :--- | :--- | :--- | :--- |
| <a id="rnf07"></a>**RNF07** | Retenção documental decenal | Suportabilidade / Requisito Externo | Garantir guarda segura de relatórios, listas de chamada e evidências pelo prazo legal de prestação de contas (Lei 13.019/2014 art. 68). | Retenção programada para no mínimo 10 anos pós-prestação de contas, com redundância de armazenamento ativo. |

### Desempenho e Eficiência
| Identificador | Requisito | Classificação (FURPS+ / Sommerville) | Descrição | Métrica Verificável |
| :---: | :--- | :--- | :--- | :--- |
| <a id="rnf11"></a>**RNF11** | Desempenho das consultas agregadas | Desempenho / Requisito de Produto | Manter tempos de resposta ágeis nos painéis e listagens sob concorrência de acessos simultâneos. | Tempo de resposta inferior a 800 ms no percentil 95 (p95) sob carga de 50 requisições/s e CPU abaixo de 75% 🔧, medido no ambiente de homologação com a massa de referência da seção 8.5.3. |
| <a id="rnf12"></a>**RNF12** | Desempenho da inscrição pública | Desempenho / Requisito de Produto | Carregar rapidamente as páginas de inscrição do público em condições de conectividade móvel limitada. | First Contentful Paint (FCP) inferior a 2,5 s em rede 4G simulada restrita em auditoria contínua de desempenho. |
| <a id="rnf13"></a>**RNF13** | Desempenho da geração de relatórios | Desempenho / Requisito de Produto | Processar a renderização do PDF oficial de forma assíncrona, assegurando estabilidade sob alto volume de anexos. | Relatório de até 50 páginas e 100 miniaturas pronto para download em menos de 5 s no percentil 95 (p95), com até 2 gerações simultâneas 🔧, medido no ambiente de homologação com a massa de referência da seção 8.5.3. |
| <a id="rnf14"></a>**RNF14** | Eficiência no envio de evidências | Desempenho / Requisito de Produto | Comprimir fotos localmente no cliente antes da transmissão para preservar o plano de dados móveis do educador. | Redução média mínima de 60% no peso de fotos e tempo de upload inferior a 4 s por imagem em 4G 🔧. |

### Usabilidade, Portabilidade e Restrições
| Identificador | Requisito | Classificação (FURPS+ / Sommerville) | Descrição | Métrica Verificável |
| :---: | :--- | :--- | :--- | :--- |
| <a id="rnf15"></a>**RNF15** | Usabilidade móvel e acessibilidade | Usabilidade / Requisito de Produto | Disponibilizar interface ergonômica ao toque, legível em uso externo e acessível a usuários com menor letramento digital. | Alvos de toque de no mínimo 48x48 px; sem rolagem horizontal a partir de 360 px; 100% dos critérios aplicáveis da WCAG 2.1 nível AA; contraste mínimo de 7:1 nas telas de uso em campo (WCAG 2.1, critério 1.4.6) 🔧. |
| <a id="rnf16"></a>**RNF16** | Compatibilidade entre navegadores e dispositivos | Suportabilidade / Requisito de Produto | Garantir equivalência operacional e visual em desktops e dispositivos móveis nos principais navegadores web. | 0 quebras de layout ou erros de script entre 360 px e 1920 px nas duas versões estáveis mais recentes de Chromium, Firefox e WebKit 🔧, em testes de regressão visual. |
| <a id="rnf17"></a>**RNF17** | Restrição tecnológica e qualidade de código | Restrição de Implementação / Requisito Organizacional | Seguir as diretrizes da arquitetura homologada com tipagem estrita e validação estática no pipeline de CI. | 0 erros de tipagem no TypeScript estrito (`strict: true`), 0 avisos no linter e 100% de sucesso no build de produção. |
| <a id="rnf19"></a>**RNF19** | Portabilidade dos dados | Suportabilidade / Requisito Organizacional | Entregar ao Instituto, sob pedido e na transferência do sistema, cópia integral dos dados e dos arquivos em formatos abertos, sem depender da equipe de desenvolvimento nem de lançamento manual. | Cópia integral entregue em até 2 dias úteis 🔧 depois do pedido, com 100% das tabelas em CSV acompanhadas da descrição dos campos e 100% dos arquivos (documentos formais, evidências e relatórios emitidos) com o identificador do registro a que pertencem; conferida por contagem de registros contra o banco e abertura de uma amostra dos arquivos. |
| <a id="rnf20"></a>**RNF20** | Eficiência do registro de presença | Usabilidade / Requisito de Produto | Permitir ao educador concluir a chamada de uma turma sem atrasar o início da atividade. | Chamada de turma de 30 inscritos 🔧, com a inclusão de um não inscrito, concluída em até 3 min 🔧 por 4 de 5 educadores 🔧, em teste com passos definidos: abrir a atividade, marcar os presentes, incluir o não inscrito e salvar. |

---

## 8.4 Matriz de Rastreabilidade Bidirecional

A rastreabilidade estabelece o vínculo bidirecional entre os problemas diagnosticados no fluxo atual (BPMN G01 a G06), os Objetivos Específicos (OEs), as Características de Produto (CP1 a CP8), os requisitos especificados e as histórias de usuário da seção 10, com os critérios de aceitação que verificam cada requisito. A história dona de cada requisito funcional aparece também na lista da seção 8.2.

### 8.4.1 Matriz de Rastreabilidade dos Requisitos Funcionais (RFs)

#### CP1 — Gestão de Projetos e Metas (OE01; OE04)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF01** | Cadastrar instrumento convocatório e parceria | G01 | MROSC art. 16 e 42 | HU-01a (CA-01a.1) | Total |
| **RF02** | Anexar documento formal homologado de parceria | G01 | MROSC art. 16 e 42 | HU-01a (CA-01a.2) | Total |
| **RF03** | Cadastrar projeto operacional | G01 | — | HU-01a (CA-01a.3) | Total |
| **RF04** | Desdobrar requisitos contratuais e metas | G01 | MROSC art. 22 e 42; RN-01, RN-02 | HU-01b (CA-01b.1 a CA-01b.4) | Total |
| **RF05** | Atribuir responsável e setor executor a meta | G02 | Decisão 3 da ata de 08/09 | HU-02a (CA-02a.1) | Total |
| **RF06** | Fixar prazo fatal e status de meta | G02 | RN-13 | HU-02a (CA-02a.1 a CA-02a.3) | Total |
| **RF07** | Exibir linha do tempo e painel de prazos de metas | G01, G02 | RN-01 | HU-02b (CA-02b.1) | Total |
| **RF08** | Emitir alertas de proximidade e pendências de metas | G02 | RN-03 | HU-02b (CA-02b.2 a CA-02b.4) | Total |
| **RF40** | Administrar contas e perfis de acesso | — | Seção 8.5.1 | HU-16 (CA-16.1 a CA-16.5) | Total |

#### CP2 — Gestão de Atividades (OE01; OE04, OE06)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF09** | Cadastrar atividade por modalidade de objeto | G03 | Seção 3.3.6; RN-04 | HU-03a (CA-03a.2, CA-03a.3) | Total |
| **RF10** | Parametrizar exigência de comprovação de presença | G03 | Seção 3.3.6; RN-04 | HU-03b (CA-03b.1 a CA-03b.4) | Total |
| **RF41** | Cadastrar modalidades de objeto | G03 | Seção 3.3.6 | HU-03a (CA-03a.1) | Total |

#### CP3 — Inscrição de Participantes (OE02; OE01)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF11** | Disponibilizar formulário público de inscrição | G03, G04 | RN-05, RN-06 | HU-07a (CA-07a.1, CA-07a.2, CA-07a.4) | Total |
| **RF12** | Gerar link e QR Code de inscrição | G03 | — | HU-07b (CA-07b.3) | Total |
| **RF13** | Registrar inscrição presencial assistida | G03 | Seção 3.3.10; RN-05, RN-06 | HU-08 (CA-08.1) | Total |
| **RF14** | Limitar vagas da atividade | G03 | — | HU-07c (CA-07c.1); HU-07b (CA-07b.1) | Total |
| **RF15** | Registrar lista de espera | G03 | — | HU-07c (CA-07c.1, CA-07c.2) | Total |
| **RF42** | Configurar o formulário de inscrição | G04 | Seção 8.5.4; RNF05 | HU-07b (CA-07b.1, CA-07b.2) | Total |

#### CP4 — Registro de Participação em Campo (OE03; OE04)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF16** | Registrar frequência em dispositivo móvel | G03 | — | HU-09a (CA-09a.1, CA-09a.2) | Total |
| **RF17** | Operar registro de presença em modo offline | G03 | Seção 3.3.3 | HU-09b (CA-09b.1 a CA-09b.3) | Total |
| **RF18** | Sincronizar presenças com reconciliação idempotente | G03 | Seção 3.3.3 | HU-12 (CA-12.1 a CA-12.5) | Total |
| **RF19** | Registrar lançamento extemporâneo com justificativa | G03 | Seção 3.3.8; RN-13 | HU-10 (CA-10.1 a CA-10.5) | Total |
| **RF20** | Apurar carga horária de participantes e facilitadores | G03 | RN-15 | HU-06 (CA-06.6) | Total |

#### CP5 — Cadastro e Histórico de Pessoas (OE01; OE03, OE06)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF21** | Consultar histórico de participação | G04 | — | HU-06 (CA-06.1, CA-06.5) | Total |
| **RF22** | Avisar cadastro repetido | G04 | — | HU-08 (CA-08.3) | Total |
| **RF23** | Registrar aviso de tratamento de dados na inscrição | G04 | LGPD art. 7º, 8º, 9º e 14; Seção 2.6; RN-05, RN-06 | HU-07a (CA-07a.3) | Total |
| **RF24** | Registrar autorização de contato | G04 | Seção 3.3.5; LGPD art. 8º, §5º; RN-05 | HU-07a (CA-07a.5, CA-07a.6); HU-06 (CA-06.4) | Total |
| **RF25** | Registrar autorização de uso de imagem | G04 | Seção 3.3.4; LGPD art. 7º e 8º, §5º; RN-05, RN-12 | HU-07a (CA-07a.5, CA-07a.6) | Total |
| **RF26** | Corrigir dados a pedido do titular | G04 | Seção 3.3.9; LGPD art. 18, III | HU-15a (CA-15a.1) | Total |
| **RF27** | Excluir ou anonimizar dados de pessoa | G04 | Seção 3.3.9; LGPD art. 16, I, e 18, IV e VI; RN-07 | HU-15b (CA-15b.1 a CA-15b.3) | Total |

#### CP6 — Acompanhamento Automático de Metas (OE04; OE01)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF28** | Calcular progresso físico de metas automaticamente | G05 | RN-02, RN-08, RN-14 | HU-11 (CA-11.1, CA-11.2, CA-11.6) | Total |
| **RF29** | Parametrizar apuração de metas por acúmulo contínuo ou marco de entrega | G05 | Seção 2.3; RN-08 | HU-11 (CA-11.3, CA-11.5) | Total |
| **RF30** | Emitir alertas de risco de inexecução | G05 | — | HU-11 (CA-11.4) | Parcial |
| **RF31** | Versionar o plano de trabalho | G05 | MROSC art. 55 e 57; RN-09, RN-13 | HU-14 (CA-14.1, CA-14.2, CA-14.4, CA-14.5) | Total |
| **RF43** | Registrar o resultado alcançado da meta | G06 | MROSC art. 66; RN-14 | HU-05a (CA-05a.1, CA-05a.6) | Total |
| **RF44** | Comparar metas repactuadas | G05 | MROSC art. 57; RN-09 | HU-14 (CA-14.3) | Total |

#### CP7 — Repositório de Evidências e Documentação (OE05; OE06)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF32** | Anexar evidências documentais e fotográficas | G03 | RN-10 | HU-04a (CA-04a.1, CA-04a.2) | Total |
| **RF33** | Vincular evidência a meta contratual | G03 | RN-04, RN-10, RN-11, RN-13 | HU-04a (CA-04a.1, CA-04a.3 a CA-04a.5) | Total |
| **RF34** | Restringir o acesso a fotos de prova de execução | G03 | Seção 3.3.4; LGPD art. 7º, I, e 14; RN-12 | HU-04b (CA-04b.1) | Total |
| **RF45** | Orientar o enquadramento de fotos | G03 | Seção 3.3.4; LGPD art. 14 | HU-04b (CA-04b.2) | Total |

#### CP8 — Relatórios e Exportação de Dados (OE06; OE04, OE05)
| Requisito | Nome | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **RF35** | Exigir justificativa prévia para metas não atingidas | G06 | MROSC art. 64, §1º; RN-11 | HU-05a (CA-05a.2) | Total |
| **RF36** | Emitir Relatório de Execução do Objeto | G06 | MROSC art. 63 a 66; RN-11, RN-14 | HU-05a (CA-05a.1, CA-05a.4); HU-04a (CA-04a.6) | Total |
| **RF37** | Gerar relatório diagramado em PDF | G06 | Seção 2.4 | HU-05b (CA-05b.1); HU-04a (CA-04a.6) | Total |
| **RF38** | Exportar dados analíticos e consolidados em planilha aberta | G06 | MROSC art. 64 | HU-13 (CA-13.1 a CA-13.5); HU-09a (CA-09a.3) | Total |
| **RF39** | Registrar trilha de auditoria das operações de prestação de contas | G06 | RN-13 | HU-05a (CA-05a.3, CA-05a.5) | Total |

---

### 8.4.2 Matriz de Rastreabilidade dos Requisitos Não Funcionais (RNFs)

| RNF | Propriedade de Qualidade | Origem (Decisão, Risco Ético ou Norma) | Requisitos Funcionais Relacionados |
| :--- | :--- | :--- | :--- |
| **RNF01** | Integridade transacional dos dados | HU-01b (CA-01b.3) | RF04, RF18 |
| **RNF02** | Auditabilidade das alterações | Seção 3.3.9 | RF01 a RF06, RF09 a RF11, RF13, RF19, RF26, RF27, RF31 a RF33, RF38 a RF43 |
| **RNF03** | Segurança das comunicações e das sessões | Seções 3.3.1 e 3.3.2; NIST SP 800-52 Rev. 2 | *Transversal (Todos os RFs)* |
| **RNF04** | Controle de acesso por perfil | Seção 3.5 (visibilidade por perfil); matriz da seção 8.5.1 | *Transversal (Todos os RFs, exceto as operações públicas do formulário de inscrição do RF11)* |
| **RNF05** | Minimização de dados pessoais | LGPD art. 5º, II; Restrição HU-06 | RF11, RF13, RF19, RF21, RF32 a RF34, RF38, RF42 |
| **RNF06** | Prazo de atendimento à exclusão de dados | LGPD art. 18 | RF27 |
| **RNF07** | Retenção documental decenal | MROSC art. 68 | RF32, RF36 |
| **RNF08** | Integridade de relatórios fechados | MROSC art. 63 a 66 | RF31, RF35, RF36, RF37, RF43 |
| **RNF09** | Resiliência offline e sincronização sem duplicidade | Seção 3.3.3 | RF16 a RF19, RF32 |
| **RNF10** | Descarte de dados pessoais no aparelho | Seções 3.3.1 e 3.3.2 | RF17, RF18, RF32 |
| **RNF11** | Desempenho das consultas agregadas | OE04 | RF07, RF08, RF28 |
| **RNF12** | Desempenho da inscrição pública | OE02 | RF11, RF12 |
| **RNF13** | Desempenho da geração de relatórios | OE06 | RF36, RF37 |
| **RNF14** | Eficiência no envio de evidências | Seção 3.3.1 | RF32 |
| **RNF15** | Usabilidade móvel e acessibilidade | Seção 3.3.10 | RF09, RF11, RF13, RF16 |
| **RNF16** | Compatibilidade entre navegadores e dispositivos | Seção 2.4 | *Transversal (Todos os RFs)* |
| **RNF17** | Restrição tecnológica e qualidade de código | Seção 2.4 | *Transversal (Todos os RFs)* |
| **RNF18** | Cópia de segurança e recuperação de dados | Seção 2.6 | *Transversal (Todos os RFs)* |
| **RNF19** | Portabilidade dos dados | Alinhamento de 15/09/2026 e levantamento presencial de 21/09/2026; Seção 2.5 | *Transversal (Todos os RFs)* |
| **RNF20** | Eficiência do registro de presença | Seção 3.3.10 | RF16 |

---

### 8.4.3 Síntese de Cobertura

#### Cobertura dos Gargalos do Modelo BPMN (B1)
| Gargalo | Descrição do Gargalo do Processo Atual | Requisitos Cobertos | Situação |
| :---: | :--- | :--- | :---: |
| **G01** | Destrinchamento manual de editais e instrumentos | RF01, RF02, RF03, RF04 | **Total** |
| **G02** | Demandas e prazos descentralizados sem responsável | RF05, RF06, RF07, RF08 | **Parcial** |
| **G03** | Listas em papel, chamadas manuais e fotos dispersas | RF09 a RF20, RF32 a RF34, RF41, RF45 | **Total** |
| **G04** | Dados pessoais desprotegidos em celulares (LGPD) | RF11, RF21 a RF27, RF42 | **Total** |
| **G05** | Ausência de visão unificada para a Presidência | RF28 a RF31, RF44 | **Parcial** |
| **G06** | Risco de glosa e insegurança na prestação de contas | RF35 a RF39, RF43 | **Total** |

G02: o controle interno de chamados não tem RF. G05: o painel da Presidência não tem RF.

A cobertura no MVP e nos incrementos está na [seção 10.2.6](10-backlog.md#1026-mvp-e-incrementos).

#### Cobertura das Características de Produto (CPs) e Objetivos Específicos (OEs)
| CP | Nome da Característica | Requisitos | Objetivos Específicos |
| :---: | :--- | :---: | :--- |
| **CP1** | Gestão de projetos e metas | RF01 a RF08, RF40 | OE01; OE04 |
| **CP2** | Gestão de atividades | RF09, RF10, RF41 | OE01; OE04, OE06 |
| **CP3** | Inscrição de participantes | RF11 a RF15, RF42 | OE02; OE01 |
| **CP4** | Registro de participação em campo | RF16 a RF20 | OE03; OE04 |
| **CP5** | Cadastro e histórico de pessoas | RF21 a RF27 | OE01; OE03, OE06 |
| **CP6** | Acompanhamento automático de metas | RF28 a RF31, RF43, RF44 | OE04; OE01 |
| **CP7** | Repositório de evidências e documentação | RF32 a RF34, RF45 | OE05; OE06 |
| **CP8** | Relatórios e exportação de dados | RF35 a RF39 | OE06; OE04, OE05 |

---

## 8.5 Notas de Domínio e Perguntas-Chave Operacionais

### 8.5.1 Perfis de Acesso e Permissões (CP1 e Transversal)
Responde à divisão operacional de responsabilidades entre quem cria, edita ou apenas audita (base de atendimento ao RNF04):

| Perfil de Usuário | Instrumentos, Projetos e Metas | Dados Nominais de Participantes | Presença e Evidências | Relatórios Oficiais |
| :--- | :--- | :--- | :--- | :--- |
| **Presidência e Gestão de Projetos** | Cria, edita e reprograma | Sem acesso à base cadastral completa | Consulta consolidados | Gera e emite |
| **Núcleo Pedagógico e Educadores** | Consulta itens de suas atividades | Acessa fichas para mediação pedagógica | Registra e retifica | Consulta |
| **Administrativo-Financeiro** | Consulta | Bloqueado (apenas totais numéricos) | Consulta consolidados | Consulta |
| **Órgão Concedente e Auditoria** | Sem acesso direto | Sem acesso à base de pessoas | Evidências vinculadas à prestação | Acesso restrito ao período de análise |
| **Administração do sistema** 🔧 | Sem acesso; administra contas e perfis (RF40) | Sem acesso | Sem acesso | Sem acesso |

- **Encerramento do projeto:** só a coordenação da equipe de execução encerra o projeto, depois de ver as comprovações pendentes (RN-11).
- **Trava do relatório:** a liberação do relatório retido por meta sem justificativa é pedida à direção ou à coordenação responsável, que é notificada (RF35).
- **Campos obrigatórios do instrumento:** Tipo de instrumento, órgão concedente, número do processo administrativo, valor global (R$), datas de celebração e de vigência, com anexo obrigatório do documento formal homologado em PDF ou DOCX (RF02).
- **Tratamento de metas descritivas:** Caso a meta seja qualitativa ou atrelada a marcos (*milestones*), o parâmetro quantitativo é facultativo e a forma documental de comprovação passa a ser o critério de verificação mandatório (RF04).

### 8.5.2 Campo, Presença e Evidências (CP2, CP4 e CP7)
- **Reconciliação e Unicidade Offline:** Cada marcação de presença gerada no cliente recebe identificador imutável e vincula-se à chave composta lógica `(participante_id, oficina_sessao_id, data_evento)`. O backend processa o lote com semântica de *Append-Only*, evitando duplicidades mesmo sob retransmissões repetidas de sincronização.
- **Exigência Comprobatória por Modalidade:**
  * *Oficina continuada formativa:* Exige diário de classe digital com chamadas nominais auditáveis e carga horária apurada.
  * *Evento aberto ou Ação de acolhimento no SCS:* Exige fotografias panorâmicas georreferenciadas, contagem estimativa agregada de público e relatório simplificado do facilitador, dispensando exigência de CPF para preservar a inclusão 🔧.
- **Lançamentos Extemporâneos:** O sistema não bloqueia o envio tardio caso o educador fique impossibilitado de lançar no dia, mas submete o registro como extemporâneo (RF19), exigindo justificativa textual e retendo carimbo de data/hora para auditoria da coordenação pedagógica.

### 8.5.3 Apuração de Metas e Relatórios MROSC (CP6 e CP8)
- **Cálculo de Metas Não Lineares:**
  * *Metas quantitativas cumulativas:* Percentual aferido pela razão contínua entre volume realizado (soma de presenças ou horas) e o volume pactuado.
  * *Metas de marco único (milestones):* cumprida ou não cumprida, sem percentual contínuo (CA-11.3); a evidência formal comprova a entrega.
- **Massa de referência 🔧:** volume de um ano de execução do maior projeto ativo do Instituto (instrumentos, metas, inscrições, presenças e evidências), a levantar com o Instituto; é a base das medições de desempenho (RNF11, RNF13) e da conferência dos números do relatório (RNF08).
- **Origem do valor alcançado:** no primeiro recorte, o valor alcançado é registrado com data de referência (RF43); quando a apuração automática entra (RF28), ela passa a preencher o valor das metas cuja fonte são presenças e evidências registradas no sistema (RN-08, RN-14).
- **Tratamento de Termos Aditivos:** O sistema não sobrescreve os dados pactuados originalmente. Ao aprovar um Termo Aditivo, cria-se uma versão incremental do plano de trabalho, e cada meta repactuada pode ser consultada com o previsto original, o reprogramado e o realizado (RF44).

### 8.5.4 Inscrição, Pessoas e LGPD (CP3 e CP5)
- **Dados Mínimos Coletados:** Nome, telefone, data de nascimento (ou faixa etária) e consentimentos. E-mail e CPF entram quando o formulário de inscrição os pede (RF42), por exigência do instrumento ou para identificar cadastro repetido (RF22) 🔧. Nenhum dado sensível estruturado (RNF05).
- **Consentimento de Menores de Idade:** Para participantes com menos de 18 anos, o formulário identifica o responsável legal (RN-06), que concede em nome do menor os consentimentos de contato e de uso de imagem (RN-05; LGPD, art. 14).
- **Independência da Autorização de Imagem:** A autorização para registro e divulgação de fotografias institucionais é colhida de forma separada e opcional (RF25). A eventual recusa pelo titular jamais condiciona ou impede sua inscrição ou participação na atividade.

---

## 8.6 Pontos em Aberto e Auditoria de Lacunas

1. **Gargalos G02 e G05:** o controle interno de ordens de serviço (G02), levantado como demanda candidata no alinhamento de 15/09/2026, e o painel consolidado da Presidência (G05), que depende dos cadastros e registros operacionais segundo o levantamento presencial de 21/09/2026, não têm requisito funcional nesta versão.
2. **Matriz de Aquisição:** confirmada no levantamento presencial de 21/09/2026 como elemento a modelar no lugar da digitação manual, não tem requisito funcional; o controle financeiro e orçamentário está fora desta versão (seção 2), e a fronteira entre os dois está a definir com a área administrativo-financeira.
3. **Meta e etapa:** não está definido se a meta é cobrada pelo objetivo inteiro ou por etapa do plano de trabalho, o que afeta o RF04 e o cadastro das metas.
4. **Encontros e recorrência da atividade 🔧:** não está definido se a oficina contínua é uma atividade com vários encontros ou uma atividade por encontro, nem se os encontros se repetem por semana; a resposta afeta o cadastro da atividade (RF09), a chamada (RF16) e a duração considerada na carga horária (RF20, RN-15).
5. **Alteração do período de execução:** os prazos das metas fora da nova vigência são sinalizados para revisão, sem mudança automática (CA-14.5) 🔧; a data da prestação de contas final depois da prorrogação está a definir.
6. **Repetição do aviso de vencimento (RN-03):** a repetição do aviso depois do alerta de 30 dias, enquanto a meta não é concluída, está a definir.
7. **Trava do relatório por pendência administrativo-financeira (RF35):** aplicação da exigência de justificativa a pendências da área administrativo-financeira, a confirmar com essa área; a solução não inclui controle financeiro.
8. **Cadastro repetido e confirmação da inscrição:** o registro da validação de 08/10/2026 traz o cadastro repetido como aviso em um trecho e como bloqueio em outro; este documento adota o aviso com reaproveitamento, pelo campo escolhido no formulário (RF22, RF42) 🔧. No formulário público, o tratamento do cadastro repetido sem expor o cadastro de outra pessoa e o uso do CPF só para identificar repetição estão a definir 🔧. O mesmo registro traz o e-mail de confirmação na inscrição presencial, que não tem requisito funcional. Ele também fala em inscrição vinculada aos formulários que o Instituto já utiliza; este documento adota formulário próprio configurável (RF42), que reproduz os campos desses formulários 🔧.
9. **Inscrição de menores:** os campos do responsável legal e as faixas etárias usadas pelo Instituto estão a definir (RN-06, seção 8.5.4).
10. **Cadastro do instrumento 🔧:** número de processo repetível e código do projeto único no instrumento (CA-01a.1, CA-01a.3); registro do código do instrumento na plataforma do financiador; obrigatoriedade do anexo do documento formal (seção 8.5.1).
11. **Perfis e contas 🔧:** perfil da coordenação da equipe de execução, que encerra o projeto (RN-11), e do coordenador contratado pelo projeto; perfil de administração do sistema (seção 8.5.1); regras de conta (CA-16.1 a CA-16.3), inclusive o e-mail institucional compartilhado por várias pessoas frente a uma conta por pessoa (RF40); visibilidade das fotos de prova de execução por perfil (CA-04b.1); valor de negócio da HU-15 e da HU-16.
12. **Valores a confirmar com o Instituto 🔧:** limiar de risco de meta e se ele é fixo ou definido por meta (RF30, CA-11.4); comprovações iniciais de cada modalidade, inclusive a dispensa de CPF na ação de acolhimento (RN-04, seção 8.5.2); prazo de atendimento aos pedidos do titular (RNF06); classes de alcance da meta e uso do valor alcançado no relatório (RN-14); prazo de entrega da cópia integral dos dados (RNF19).
13. **Parâmetros técnicos a verificar 🔧:** duração e inatividade da sessão e bloqueio por tentativas (RNF03), observando no piloto se o encerramento por inatividade atrapalha oficinas longas; latências, carga e gerações simultâneas (RNF11, RNF13, RNF14); contraste nas telas de campo (RNF15); versões de navegador (RNF16); RTO e frequência do ensaio de restauração (RNF18), sendo o RPO de 6 h o informado no alinhamento de 15/09/2026; tamanho da turma e tempo da chamada (RNF20).

---

## 8.7 Regras de Negócio

Regras que condicionam o comportamento descrito nos requisitos funcionais. Cada regra tem origem declarada; o símbolo 🔧 marca valor inicial pendente de confirmação (seção 8.1).

| ID | Regra | Origem | Requisitos relacionados |
| :---: | :--- | :--- | :---: |
| <a id="rn-01"></a>**RN-01** | Requisito do instrumento e meta do plano de trabalho são registros distintos, relacionados entre si: uma meta pode atender a mais de um requisito e um requisito pode exigir mais de uma meta. | Seção 2.3 (CP1); Lei 13.019/2014, art. 22 | RF04, RF07 |
| <a id="rn-02"></a>**RN-02** | Meta sem indicador, forma de verificação, prazo ou, na meta quantitativa, parâmetro planejado numérico com unidade permanece como rascunho e não entra na apuração nem no relatório. | Lei 13.019/2014, art. 22, II e III | RF04, RF28 |
| <a id="rn-03"></a>**RN-03** | O alerta de vencimento de meta é emitido automaticamente 30 dias antes do prazo, e o usuário autorizado pode registrar na própria meta avisos adicionais; os alertas são enviados por e-mail. | Validação com o Instituto em 28/09/2026 | RF08 |
| <a id="rn-04"></a>**RN-04** | As comprovações exigidas de uma atividade são configuradas por instrumento e modalidade, e a atividade guarda a versão vigente no momento do cadastro. Configuração inicial 🔧: chamada nominal com assiduidade para oficinas formativas contínuas; contagem agregada e anônima, sem CPF, para ações de acolhimento e eventos de rua. | Seção 3.3.6; Seção 2.6 | RF09, RF10, RF33 |
| <a id="rn-05"></a>**RN-05** | A inscrição não é condicionada a consentimento para os dados exigidos pela execução da parceria e pela prestação de contas; o consentimento é registrado apenas para contato e uso de imagem. | LGPD, art. 7º, I e II; Seção 2.6 | RF11, RF13, RF23 a RF25 |
| <a id="rn-06"></a>**RN-06** | Para pessoa menor de idade, o registro de inscrição identifica o responsável legal. | LGPD, art. 14 | RF11, RF13, RF23 |
| <a id="rn-07"></a>**RN-07** | Ao término da finalidade ou a pedido do titular, registro sob guarda legal é preservado com acesso restrito até o fim do prazo de guarda; dado que compõe total já reportado a financiador permanece só como agregado; os demais dados pessoais são eliminados. | LGPD, art. 16, I; Lei 13.019/2014, art. 68 | RF27, RNF07 |
| <a id="rn-08"></a>**RN-08** | O progresso de uma meta é apurado exclusivamente pela regra de apuração e pelas fontes definidas na própria meta, e o sistema exibe os registros que compõem o valor apurado. | Seção 2.3 (CP6) | RF28, RF29 |
| <a id="rn-09"></a>**RN-09** | Repactuação por termo aditivo ou apostila, ou mudança do período de execução por ofício, gera nova versão do plano de trabalho, preservando a pactuação original e seus resultados. | Lei 13.019/2014, art. 55 e 57; validação com o Instituto em 28/09 e 08/10/2026 | RF31, RF44 |
| <a id="rn-10"></a>**RN-10** | Arquivo anexado é rascunho até ser vinculado a uma atividade e a pelo menos uma meta; rascunho não compõe o índice de comprovações. | Seção 2.3 (relatório com índice de evidências por meta) | RF32, RF33 |
| <a id="rn-11"></a>**RN-11** | O encerramento de uma atividade e a geração do relatório final exigem que não haja rascunho pendente de vinculação ou descarte. Comprovação que não pode mais ser produzida não impede o encerramento do projeto: a meta sem comprovação continua visível como pendente, e só a coordenação da equipe de execução encerra o projeto. | Seção 2.3; Lei 13.019/2014, arts. 63 a 66; validação com o Instituto em 28/09/2026 | RF33, RF35, RF36 |
| <a id="rn-12"></a>**RN-12** | Imagem de prova de execução e material de divulgação são registros distintos: a prova fica restrita aos perfis de coordenação e prestação de contas, não é publicada automaticamente e só é reutilizada para divulgação com autorização registrada. | Seção 3.3.4; LGPD, art. 7º, I, e art. 14 | RF25, RF34 |
| <a id="rn-13"></a>**RN-13** | Alteração de registro já concluído (meta ou plano de trabalho, presença de atividade realizada, evidência vinculada ou relatório finalizado) exige justificativa registrada, visível às demais áreas, e não depende de aprovação. | Validação com o Instituto em 28/09/2026 | RF06, RF19, RF31, RF33, RF39 |
| <a id="rn-14"></a>**RN-14** | O percentual de cumprimento da meta quantitativa é calculado, nunca informado: valor alcançado dividido pelo parâmetro planejado, na mesma unidade, sem teto de 100%; a classificação parte do percentual: cumprida a partir de 100%, não cumprida em 0% e parcialmente cumprida entre os dois 🔧. Meta qualitativa e meta de marco não têm percentual: o alcance é a classificação, informada com a descrição do resultado, e a meta de marco é só cumprida ou não cumprida 🔧. Enquanto a meta não tem apuração automática (RF28, RF29), o valor alcançado é registrado pelo usuário autorizado, com a data de referência; com a apuração automática, vale o valor apurado (RN-08). | MROSC art. 66, que pede o comparativo entre metas e resultados; regulamentos da União (Decreto 8.726/2016, art. 55) e do DF (Decreto 37.843/2016, art. 60 e 61) | RF28, RF36, RF43 |
| <a id="rn-15"></a>**RN-15** | A carga horária de uma pessoa é a soma da duração dos encontros com presença confirmada; presença parcial não conta; encontros no mesmo horário contam uma vez; a atuação como facilitador é somada separadamente da participação. Valores iniciais 🔧, que dependem da definição dos encontros da atividade (seção 8.6). | OE03, OE04 | RF20 |
