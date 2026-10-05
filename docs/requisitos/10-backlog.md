# 10. Backlog de produto

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 27/09/2026 | 1.0 | Estruturação inicial da seção e registro da avaliação de esforço técnico dos requisitos de CP1, CP6 e CP8 | Daniel Batista e Rodrigo Henrique |
| 28/09/2026 | 1.1 | Adição da avaliação de esforço técnico dos requisitos de CP2, CP4 e CP7 | Caio Martins e Lucas Leal |
| 29/09/2026 | 2.0 | Backlog geral com as quinze histórias e seus critérios de aceitação; valor de negócio validado com o Instituto; avaliação técnica dos requisitos de CP3, de CP5 e do RF20; tabela consolidada, matriz 4 × 4, MVP, incrementos, requisitos não funcionais do MVP e registro da validação; seção organizada em 10.1 e 10.2, como no template | Vinicius Vieira e Maria Eduarda Marques |
| 05/10/2026 | 2.1 | Inclusão de âncoras HTML unívocas para as histórias de usuário (HU-01 a HU-15) para rastreabilidade direta a partir do catálogo | Rodrigo Henrique |

---

O backlog de produto reúne as histórias de usuário que derivam dos requisitos funcionais da [seção 8](8-requisitos.md) e mostra como foram priorizadas e o que forma o Produto Mínimo Viável (MVP).

## 10.1 Backlog geral

Quinze histórias de usuário, uma capacidade cada, organizadas em épicos. Cada história atende à [Definition of Ready](9-dor-dod.md) antes de entrar em uma sprint; os critérios de aceitação de cada uma estão no quadro recolhível abaixo da tabela.

| Épico | História | Requisitos funcionais |
| :--- | :--- | :--- |
| Requisito e meta | **HU-01** Cadastrar requisitos e metas com parâmetros de aferição | [RF01](8-requisitos.md#rf01), [RF02](8-requisitos.md#rf02), [RF03](8-requisitos.md#rf03), [RF04](8-requisitos.md#rf04) |
| Requisito e meta | **HU-02** Atribuir responsável e prazo a meta e acompanhar vencimentos | [RF05](8-requisitos.md#rf05), [RF06](8-requisitos.md#rf06), [RF07](8-requisitos.md#rf07), [RF08](8-requisitos.md#rf08) |
| Requisito e meta | **HU-11** Acompanhar progresso e risco de meta | [RF28](8-requisitos.md#rf28), [RF29](8-requisitos.md#rf29), [RF30](8-requisitos.md#rf30) |
| Requisito e meta | **HU-14** Registrar termo aditivo como nova versão do plano | [RF31](8-requisitos.md#rf31) |
| Relatório | **HU-05** Gerar relatório de execução do objeto | [RF35](8-requisitos.md#rf35), [RF36](8-requisitos.md#rf36), [RF37](8-requisitos.md#rf37), [RF39](8-requisitos.md#rf39) |
| Relatório | **HU-13** Exportar dados do projeto em planilha aberta | [RF38](8-requisitos.md#rf38) |
| Atividade | **HU-03** Cadastrar atividade por modalidade de objeto | [RF09](8-requisitos.md#rf09), [RF10](8-requisitos.md#rf10) |
| Evidência | **HU-04** Vincular evidência a atividade e meta | [RF32](8-requisitos.md#rf32), [RF33](8-requisitos.md#rf33), [RF34](8-requisitos.md#rf34) |
| Presença em campo | **HU-09** Registrar presença em campo sem conexão | [RF16](8-requisitos.md#rf16), [RF17](8-requisitos.md#rf17) |
| Presença em campo | **HU-10** Lançar ou corrigir presença fora do prazo com justificativa | [RF19](8-requisitos.md#rf19) |
| Presença em campo | **HU-12** Sincronizar presenças sem duplicidade | [RF18](8-requisitos.md#rf18) |
| Pessoas | **HU-06** Consultar histórico de participação de pessoa | [RF20](8-requisitos.md#rf20), [RF21](8-requisitos.md#rf21), [RF22](8-requisitos.md#rf22), [RF24](8-requisitos.md#rf24) |
| Pessoas | **HU-07** Inscrever-se em atividade por link ou QR Code | [RF11](8-requisitos.md#rf11), [RF12](8-requisitos.md#rf12), [RF14](8-requisitos.md#rf14), [RF15](8-requisitos.md#rf15), [RF23](8-requisitos.md#rf23), [RF24](8-requisitos.md#rf24), [RF25](8-requisitos.md#rf25) |
| Pessoas | **HU-08** Inscrever presencialmente pessoa sem celular | [RF13](8-requisitos.md#rf13), [RF14](8-requisitos.md#rf14), [RF15](8-requisitos.md#rf15), [RF22](8-requisitos.md#rf22), [RF23](8-requisitos.md#rf23) |
| Pessoas | **HU-15** Atender pedido do titular para corrigir, excluir ou anonimizar dados | [RF26](8-requisitos.md#rf26), [RF27](8-requisitos.md#rf27) |

<a id="hu-01"></a>
??? note "HU-01 · Cadastrar requisitos e metas com parâmetros de aferição"
    Como Diretora de Projetos, quero cadastrar os requisitos do instrumento e as metas do plano de trabalho de um projeto, com os parâmetros de aferição de cada meta, para saber exatamente o que precisa ser comprovado, como e quando.

    **Critérios de aceitação**

    - CA-01.1 Em um projeto vinculado a um instrumento (edital, emenda ou parceria), a Diretora de Projetos cadastra requisitos do instrumento e metas como registros distintos e relaciona cada meta a um ou mais requisitos.
    - CA-01.2 Cada meta registra origem, indicador, modalidade de aferição, parâmetro planejado, período e frequência de apuração e forma de comprovação.
    - CA-01.3 Meta sem indicador, forma de verificação ou prazo fica como rascunho, é identificada como tal na lista de metas e não entra na apuração.

    **Requisitos não funcionais e regras de negócio:** RNF01, RNF02; RN-01, RN-02

<a id="hu-02"></a>
??? note "HU-02 · Atribuir responsável e prazo a meta e acompanhar vencimentos"
    Como responsável de área do Instituto, quero atribuir responsável, setor e prazo a cada meta e acompanhar os vencimentos no painel do projeto, para saber com quem está cada demanda e agir antes de o prazo expirar.

    **Critérios de aceitação**

    - CA-02.1 Ao atribuir responsável, setor e prazo a uma meta, esses dados aparecem no painel e na linha do tempo do projeto.
    - CA-02.2 Meta cujo prazo esteja dentro da antecedência de alerta configurada para o instrumento, ou já vencida sem comprovação, aparece destacada no painel.
    - CA-02.3 Meta sem responsável atribuído é sinalizada no painel do projeto.
    - CA-02.4 A situação de cada meta (pendente, em andamento ou concluída) é exibida junto ao responsável e ao prazo.

    **Requisitos não funcionais e regras de negócio:** RNF11; RN-03

<a id="hu-11"></a>
??? note "HU-11 · Acompanhar progresso e risco de meta"
    Como coordenadora de projeto, quero acompanhar o progresso de cada meta e ser avisada quando o ritmo estiver abaixo do planejado, para agir antes do fim do prazo em vez de descobrir na prestação de contas.

    **Critérios de aceitação**

    - CA-11.1 A meta exibe valor apurado, alvo, unidade, período e data do último cálculo.
    - CA-11.2 A partir do valor exibido, a coordenadora abre os registros de presença e evidência que o compõem.
    - CA-11.3 Meta por marco (entrega única) aparece como cumprida ou não cumprida, sem percentual contínuo.
    - CA-11.4 Quando o ritmo de execução fica abaixo do critério de risco definido para a meta, a meta aparece sinalizada no painel, sem alteração do alvo.

    **Requisitos não funcionais e regras de negócio:** RNF11; RN-08

<a id="hu-14"></a>
??? note "HU-14 · Registrar termo aditivo como nova versão do plano"
    Como Diretora de Projetos, quero registrar um termo aditivo ou apostila como nova versão do plano de trabalho, para acompanhar as metas repactuadas sem perder o que foi pactuado originalmente.

    **Critérios de aceitação**

    - CA-14.1 O registro de termo aditivo ou apostila cria nova versão do plano de trabalho, com data e documento de origem.
    - CA-14.2 A versão original das metas e os resultados já apurados são preservados.
    - CA-14.3 Cada meta repactuada exibe o comparativo entre previsto original, reprogramado e realizado.

    **Requisitos não funcionais e regras de negócio:** RNF02; RN-09

<a id="hu-05"></a>
??? note "HU-05 · Gerar relatório de execução do objeto"
    Como Diretora de Projetos, quero gerar o relatório de execução do objeto de um projeto para um período, com metas previstas confrontadas aos resultados e às evidências vinculadas, para prestar contas sem montagem manual.

    **Critérios de aceitação**

    - CA-05.1 Ao solicitar o relatório de um período, cada meta aparece com resultado alcançado, percentual de cumprimento e índice das evidências vinculadas.
    - CA-05.2 Meta cumprida parcialmente ou não cumprida exige justificativa registrada antes que o relatório possa ser finalizado (Lei 13.019/2014, art. 64, §1º).
    - CA-05.3 O relatório finalizado é gerado em PDF diagramado, com as metas, as justificativas e as miniaturas das evidências com seus dados de registro.
    - CA-05.4 Retificação feita após a finalização gera nova versão do relatório e registro na trilha de auditoria, preservando a versão anterior.
    - CA-05.5 A geração do relatório final é bloqueada enquanto houver rascunho de evidência pendente no período, com a indicação do que falta.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF07, RNF08, RNF13; RN-08, RN-11

<a id="hu-13"></a>
??? note "HU-13 · Exportar dados do projeto em planilha aberta"
    Como Diretora de Projetos, quero exportar os dados de execução do projeto em planilha aberta, para permitir conferências internas e auditorias externas independentes e não depender do sistema para preservar a informação.

    **Critérios de aceitação**

    - CA-13.1 A exportação traz, em planilha aberta, as atividades, as presenças e a situação das metas do projeto no período escolhido.
    - CA-13.2 O arquivo inclui a legenda dos campos e a data de corte dos dados.
    - CA-13.3 Só entram os dados necessários à finalidade da exportação; dados nominais não saem para perfil sem permissão.
    - CA-13.4 Cada exportação fica registrada na trilha de auditoria, com autor e data.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF05

<a id="hu-03"></a>
??? note "HU-03 · Cadastrar atividade por modalidade de objeto"
    Como coordenador pedagógico, quero cadastrar uma atividade vinculada a um projeto e a uma modalidade de objeto, para que o sistema indique quais comprovações serão exigidas dessa atividade.

    **Critérios de aceitação**

    - CA-03.1 Ao cadastrar uma atividade em um projeto, o coordenador seleciona a meta ou as metas contratuais a que a atividade contribui e a modalidade de objeto em lista predefinida (oficina contínua, evento aberto, ação de acolhimento).
    - CA-03.2 Ao criar a atividade, o sistema exibe as comprovações obrigatórias, opcionais e condicionais configuradas para o instrumento e a modalidade.
    - CA-03.3 Para oficina contínua, a comprovação principal exibida é a lista de presença nominal; para ação de acolhimento, a contagem agregada de público, sem exigência de CPF.
    - CA-03.4 A atividade guarda a versão da configuração de comprovações vigente no cadastro; mudança posterior na configuração não altera atividades já criadas.

    **Requisitos não funcionais e regras de negócio:** RN-04

<a id="hu-04"></a>
??? note "HU-04 · Vincular evidência a atividade e meta"
    Como educador, quero anexar uma evidência a uma atividade e vinculá-la a uma ou mais metas, para que a comprovação já nasça organizada por meta.

    **Critérios de aceitação**

    - CA-04.1 Ao anexar uma evidência a uma atividade realizada, o educador informa data, local e a meta ou as metas relacionadas; autor, data e hora de envio são registrados automaticamente.
    - CA-04.2 Ao abrir uma meta, o usuário vê as comprovações já recebidas e as pendentes, conforme a modalidade da atividade.
    - CA-04.3 Arquivo salvo sem meta vinculada fica como rascunho, com aviso de que não compõe o índice de comprovações nem o relatório.
    - CA-04.4 A atividade não pode ser encerrada enquanto houver rascunho pendente de vinculação ou descarte.
    - CA-04.5 Imagem registrada como prova de execução fica visível apenas aos perfis de coordenação e prestação de contas.

    **Requisitos não funcionais e regras de negócio:** RNF07, RNF09, RNF14; RN-10, RN-11, RN-12

<a id="hu-09"></a>
??? note "HU-09 · Registrar presença em campo sem conexão"
    Como educador em campo, quero registrar a presença dos participantes no meu celular mesmo sem internet, para que o registro nasça digital no local da atividade e não volte para o papel.

    **Critérios de aceitação**

    - CA-09.1 Antes de ir a campo, o educador prepara a lista da atividade no celular, que guarda apenas os dados mínimos para a chamada.
    - CA-09.2 O educador marca presença individual ou em lote dos inscritos da atividade.
    - CA-09.3 Sem conexão, cada marcação fica salva no aparelho antes da confirmação na tela, que indica "salvo neste dispositivo", não "sincronizado".
    - CA-09.4 As marcações salvas continuam disponíveis após fechar o navegador ou reiniciar o aparelho.
    - CA-09.5 O educador pode incluir participante não inscrito na hora da atividade com dados mínimos de identificação, registrando sua presença na chamada.

    **Requisitos não funcionais e regras de negócio:** RNF09, RNF15

<a id="hu-10"></a>
??? note "HU-10 · Lançar ou corrigir presença fora do prazo com justificativa"
    Como coordenador autorizado, quero lançar ou corrigir uma presença depois da data da atividade, informando a justificativa, para manter o registro correto sem apagar o que foi registrado antes.

    **Critérios de aceitação**

    - CA-10.1 Lançamento ou correção de presença após a data da atividade exige justificativa escrita.
    - CA-10.2 Cada lançamento ou correção preserva o valor anterior, o valor novo, o autor, a data e a hora na trilha de auditoria.
    - CA-10.3 Usuário sem permissão para a atividade não consegue lançar nem corrigir presenças dela.
    - CA-10.4 Correção em dado que compõe relatório já finalizado não altera esse relatório; a retificação segue a HU-05 (CA-05.4).

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF04

<a id="hu-12"></a>
??? note "HU-12 · Sincronizar presenças sem duplicidade"
    Como educador, quero que as presenças registradas sem conexão sejam enviadas assim que o celular voltar a ter internet, sem duplicar nem perder registros, para confiar no resultado da chamada.

    **Critérios de aceitação**

    - CA-12.1 Ao voltar a conexão, as presenças pendentes são enviadas automaticamente e a tela passa a indicar "sincronizado".
    - CA-12.2 Reenvio do mesmo lote, por falha ou repetição, não gera presença duplicada.
    - CA-12.3 Se a sessão tiver expirado, as presenças pendentes são preservadas no aparelho e o sistema pede novo acesso antes de enviar.
    - CA-12.4 Registro que diverge do que já está no servidor fica visível como conflito, para tratamento pelo coordenador, sem ser descartado.
    - CA-12.5 Após a confirmação do envio, os dados nominais dos participantes deixam de ficar no aparelho, e outro usuário no mesmo aparelho não acessa a lista anterior.

    **Requisitos não funcionais e regras de negócio:** RNF01, RNF03, RNF09, RNF10

<a id="hu-06"></a>
??? note "HU-06 · Consultar histórico de participação de pessoa"
    Como integrante do núcleo pedagógico, quero consultar o histórico de participação e a carga horária acumulada de uma pessoa em diferentes projetos, para convidá-la a atividades compatíveis com seu perfil, respeitando a autorização de contato que ela registrou.

    **Critérios de aceitação**

    - CA-06.1 Ao abrir a ficha de uma pessoa, o núcleo pedagógico vê as atividades e os projetos de que ela participou, com datas.
    - CA-06.2 Ao cadastrar uma pessoa com nome e telefone iguais aos de outra já cadastrada, o sistema alerta a possível duplicidade e oferece reaproveitar o registro existente.
    - CA-06.4 Convite para nova atividade só é oferecido a quem tem autorização de contato registrada e não revogada.
    - CA-06.5 O perfil administrativo-financeiro não acessa a ficha nominal das pessoas.
    - CA-06.6 A ficha mostra a carga horária acumulada da pessoa, como participante ou facilitadora, a partir das presenças confirmadas.

    **Requisitos não funcionais e regras de negócio:** RNF04, RNF05

<a id="hu-07"></a>
??? note "HU-07 · Inscrever-se em atividade por link ou QR Code"
    Como pessoa interessada em uma atividade do Instituto, quero me inscrever por um link ou QR Code no celular, sem criar conta, para garantir minha vaga sem depender de a equipe transcrever meus dados.

    **Critérios de aceitação**

    - CA-07.1 O formulário público da atividade abre pelo link ou pelo QR Code em navegador de celular, sem cadastro de conta ou senha.
    - CA-07.2 Ao enviar os campos mínimos válidos, a pessoa recebe confirmação da inscrição na tela.
    - CA-07.3 Com as vagas esgotadas, a inscrição entra na lista de espera e a pessoa é informada da posição.
    - CA-07.4 O formulário apresenta o aviso de tratamento de dados e registra, com data e hora, a versão apresentada; para menor de idade, pede a identificação do responsável legal.
    - CA-07.5 Envio repetido pela mesma pessoa para a mesma atividade não gera inscrição duplicada.
    - CA-07.6 Autorização para receber comunicados e autorização de uso de imagem são opções separadas e opcionais; recusar qualquer uma não impede a inscrição.

    **Requisitos não funcionais e regras de negócio:** RNF05, RNF12, RNF15; RN-05, RN-06

<a id="hu-08"></a>
??? note "HU-08 · Inscrever presencialmente pessoa sem celular"
    Como coordenador ou educador, quero inscrever presencialmente uma pessoa que não tem celular ou conexão, para que ela participe nas mesmas condições de quem se inscreve pelo link.

    **Critérios de aceitação**

    - CA-08.1 O coordenador inscreve a pessoa na atividade em seu nome, a partir do próprio aparelho, sem que ela precise de celular.
    - CA-08.2 A inscrição assistida respeita o limite de vagas e a lista de espera da atividade.
    - CA-08.3 Antes de concluir, o coordenador vê o alerta de possível duplicidade e pode reaproveitar o cadastro existente.
    - CA-08.4 O aviso de tratamento de dados apresentado à pessoa fica registrado com data, hora e autor da inscrição assistida.

    **Requisitos não funcionais e regras de negócio:** RNF05, RNF15; RN-05, RN-06

<a id="hu-15"></a>
??? note "HU-15 · Atender pedido do titular para corrigir, excluir ou anonimizar dados"
    Como integrante do núcleo pedagógico, quero atender o pedido de uma pessoa para corrigir, excluir ou anonimizar seus dados, para cumprir os direitos do titular sem comprometer a prestação de contas.

    **Critérios de aceitação**

    - CA-15.1 A correção de dado a pedido do titular registra autor, data, hora e justificativa.
    - CA-15.2 A exclusão ou anonimização é feita a pedido do titular ou ao término da finalidade.
    - CA-15.3 Totais já reportados a financiadores e registros sob guarda legal são preservados, com o fundamento registrado por classe de dado.
    - CA-15.4 O pedido é atendido dentro do prazo definido pelo Instituto, medido na trilha de auditoria.

    **Requisitos não funcionais e regras de negócio:** RNF02, RNF06; RN-07

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

| História | Valor | Critério | Justificativa do Instituto |
| :--- | :---: | :--- | :--- |
| HU-01 | 4 | Problema central | "Se vocês forem entregar só uma coisa, é isso"; perder prazos está em "grande parte dos problemas" do Instituto. |
| HU-02 | 4 | Problema central | Perder prazos está em "grande parte dos problemas" do Instituto; aviso com 7 dias não dá tempo de refazer o que falta. |
| HU-11 | 3 | Impacto para os usuários | A presidência quer o painel, mas ele só é confiável com o sistema abastecido de dados. |
| HU-14 | 4 | Obrigação legal | Alterações de prazo e orçamento impostas pelo financiador precisam preservar o plano original. |
| HU-05 | 4 | Problema central | A prestação de contas é "o maior gargalo" do Instituto; a proposta da equipe de tentar o relatório em PDF no MVP foi confirmada. |
| HU-13 | 4 | Problema central | Exportação para conferência e auditoria proposta pela equipe e confirmada pelo Instituto no corte do MVP. |
| HU-03 | 4 | Dependência de outra função | Complemento das parcerias e metas; as modalidades são criadas pelo próprio Instituto. |
| HU-04 | 4 | Problema central | Comprovação "não pode passar despercebido"; entra logo depois do MVP. |
| HU-09 | 2 | Urgência | Registro sem internet "não é um must have": as quedas são pontuais e lista e foto sobem depois. |
| HU-10 | 4 | Obrigação legal | Justificativa obrigatória para correção fora do prazo "deveríamos ter", sem exigir aprovação. |
| HU-12 | 2 | Urgência | Mesmo motivo da HU-09: sincronização sem conexão fica para depois. |
| HU-06 | 2 | Impacto para os usuários | "Sonho do pedagógico", mas não é prioridade no contexto geral do Instituto. |
| HU-07 | 4 | Abrangência de uso | "Seria excelente": facilitaria o controle de inscritos e de metas para todas as equipes. |
| HU-08 | 4 | Abrangência de uso | Mesmo valor das inscrições por link ("seria excelente"); para a equipe, garante acesso a quem não tem celular. |
| HU-15 | 4 🔧 | Obrigação legal | Obrigação legal (LGPD, art. 18); não foi votada na sessão e vai à conferência do Instituto. |

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
| [RF22](8-requisitos.md#rf22) | Alertar cadastro duplicado | 2 | 2 | 1 | 1,7 | **2** |
| [RF23](8-requisitos.md#rf23) | Registrar aviso de tratamento de dados na inscrição | 1 | 1 | 1 | 1,0 | **1** |
| [RF24](8-requisitos.md#rf24) | Registrar autorização de contato | 1 | 1 | 1 | 1,0 | **1** |
| [RF25](8-requisitos.md#rf25) | Registrar autorização de uso de imagem | 2 | 2 | 1 | 1,7 | **2** |
| [RF26](8-requisitos.md#rf26) | Corrigir dados a pedido do titular | 2 | 1 | 1 | 1,3 | **1** |
| [RF27](8-requisitos.md#rf27) | Excluir ou anonimizar dados de pessoa | 3 | 3 | 2 | 2,7 | **3** |
| [RF28](8-requisitos.md#rf28) | Calcular progresso físico de metas automaticamente | 3 | 2 | 1 | 2,0 | **2** |
| [RF29](8-requisitos.md#rf29) | Parametrizar apuração de metas por acúmulo contínuo ou marco de entrega | 2 | 1 | 1 | 1,3 | **1** |
| [RF30](8-requisitos.md#rf30) | Emitir alertas de risco de inexecução | 3 | 2 | 1 | 2,0 | **2** |
| [RF31](8-requisitos.md#rf31) | Versionar metas por Termo Aditivo | 3 | 2 | 1 | 2,0 | **2** |
| [RF32](8-requisitos.md#rf32) | Anexar evidências documentais e fotográficas | 2 | 3 | 3 | 2,7 | **3** |
| [RF33](8-requisitos.md#rf33) | Vincular evidência a meta contratual | 2 | 2 | 2 | 2,0 | **2** |
| [RF34](8-requisitos.md#rf34) | Segregar acesso a fotos de beneficiários vulneráveis | 3 | 3 | 2 | 2,7 | **3** |
| [RF35](8-requisitos.md#rf35) | Exigir justificativa prévia para metas não atingidas | 1 | 1 | 1 | 1,0 | **1** |
| [RF36](8-requisitos.md#rf36) | Emitir Relatório de Execução do Objeto | 3 | 2 | 1 | 2,0 | **2** |
| [RF37](8-requisitos.md#rf37) | Gerar relatório diagramado em PDF | 4 | 3 | 2 | 3,0 | **3** |
| [RF38](8-requisitos.md#rf38) | Exportar dados analíticos e consolidados em planilha aberta | 2 | 1 | 1 | 1,3 | **1** |
| [RF39](8-requisitos.md#rf39) | Registrar trilha de auditoria das operações de prestação de contas | 2 | 1 | 1 | 1,3 | **1** |

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
    - **RF22:** Comparação de nome e telefone no ato do cadastro, com opção de reaproveitar o registro.
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
    - **RF34:** Controle de acesso granular via Guards no NestJS com restrição de escopo de visualização por perfil (RN-12) e exibição de diretrizes de enquadramento na interface de captura.
    - **RF35:** Validação transacional de bloqueio de encerramento sem justificativa registrada.
    - **RF36:** Agrupamento de indicadores previstos versus realizados e ordenação cronológica do índice de evidências.
    - **RF37:** Diagramação de impressão de relatório formal em PDF com templates e ajustes de quebra de página via Puppeteer.
    - **RF38:** Geração e download de arquivo tabular estruturado (CSV) a partir de consultas na base.
    - **RF39:** Registro automático de snapshots de alterações e justificativas em tabela de log permanente.

### 10.2.4 Tabela consolidada

| Código | Histórias | Valor | Esforço técnico | Destino |
| :---: | :--- | :---: | :---: | :--- |
| [RF01](8-requisitos.md#rf01) | HU-01 | 4 | 1 | MVP |
| [RF02](8-requisitos.md#rf02) | HU-01 | 4 | 1 | MVP |
| [RF03](8-requisitos.md#rf03) | HU-01 | 4 | 1 | MVP |
| [RF04](8-requisitos.md#rf04) | HU-01 | 4 | 2 | MVP |
| [RF05](8-requisitos.md#rf05) | HU-02 | 4 | 1 | MVP |
| [RF06](8-requisitos.md#rf06) | HU-02 | 4 | 1 | MVP |
| [RF07](8-requisitos.md#rf07) | HU-02 | 4 | 2 | MVP |
| [RF08](8-requisitos.md#rf08) | HU-02 | 4 | 2 | MVP |
| [RF09](8-requisitos.md#rf09) | HU-03 | 4 | 1 | MVP |
| [RF10](8-requisitos.md#rf10) | HU-03 | 4 | 3 | Incremento 2 |
| [RF11](8-requisitos.md#rf11) | HU-07 | 4 | 2 | MVP |
| [RF12](8-requisitos.md#rf12) | HU-07 | 4 | 1 | MVP |
| [RF13](8-requisitos.md#rf13) | HU-08 | 4 | 1 | MVP |
| [RF14](8-requisitos.md#rf14) | HU-07, HU-08 | 4 | 2 | MVP |
| [RF15](8-requisitos.md#rf15) | HU-07, HU-08 | 4 | 2 | MVP |
| [RF16](8-requisitos.md#rf16) | HU-09 | 2 | 3 | Incremento 3 |
| [RF17](8-requisitos.md#rf17) | HU-09 | 2 | 3 | Posterior |
| [RF18](8-requisitos.md#rf18) | HU-12 | 2 | 3 | Posterior |
| [RF19](8-requisitos.md#rf19) | HU-10 | 4 | 1 | Incremento 3 |
| [RF20](8-requisitos.md#rf20) | HU-06 | 2 | 2 | Posterior |
| [RF21](8-requisitos.md#rf21) | HU-06 | 2 | 1 | Posterior |
| [RF22](8-requisitos.md#rf22) | HU-06, HU-08 | 4 | 2 | MVP |
| [RF23](8-requisitos.md#rf23) | HU-07, HU-08 | 4 | 1 | MVP |
| [RF24](8-requisitos.md#rf24) | HU-06, HU-07 | 4 | 1 | MVP |
| [RF25](8-requisitos.md#rf25) | HU-07 | 4 | 2 | MVP |
| [RF26](8-requisitos.md#rf26) | HU-15 | 4 🔧 | 1 | MVP |
| [RF27](8-requisitos.md#rf27) | HU-15 | 4 🔧 | 3 | MVP |
| [RF28](8-requisitos.md#rf28) | HU-11 | 3 | 2 | Posterior |
| [RF29](8-requisitos.md#rf29) | HU-11 | 3 | 1 | Posterior |
| [RF30](8-requisitos.md#rf30) | HU-11 | 3 | 2 | Posterior |
| [RF31](8-requisitos.md#rf31) | HU-14 | 4 | 2 | MVP |
| [RF32](8-requisitos.md#rf32) | HU-04 | 4 | 3 | Incremento 2 |
| [RF33](8-requisitos.md#rf33) | HU-04 | 4 | 2 | Incremento 2 |
| [RF34](8-requisitos.md#rf34) | HU-04 | 4 | 3 | Incremento 2 |
| [RF35](8-requisitos.md#rf35) | HU-05 | 4 | 1 | MVP |
| [RF36](8-requisitos.md#rf36) | HU-05 | 4 | 2 | MVP |
| [RF37](8-requisitos.md#rf37) | HU-05 | 4 | 3 | MVP |
| [RF38](8-requisitos.md#rf38) | HU-13 | 4 | 1 | MVP |
| [RF39](8-requisitos.md#rf39) | HU-05 | 4 | 1 | MVP |

### 10.2.5 Matriz 4 × 4

Linhas: valor de negócio. Colunas: esforço técnico. Em negrito, os requisitos do MVP.

| Valor \ Esforço | 1 | 2 | 3 | 4 |
| :---: | :--- | :--- | :--- | :--- |
| **4** | **RF01**, **RF02**, **RF03**, **RF05**, **RF06**, **RF09**, **RF12**, **RF13**, RF19, **RF23**, **RF24**, **RF26** 🔧, **RF35**, **RF38**, **RF39** | **RF04**, **RF07**, **RF08**, **RF11**, **RF14**, **RF15**, **RF22**, **RF25**, **RF31**, RF33, **RF36** | RF10, **RF27** 🔧, RF32, RF34, **RF37** | — |
| **3** | RF29 | RF28, RF30 | — | — |
| **2** | RF21 | RF20 | RF16, RF17, RF18 | — |
| **1** | — | — | — | — |

Candidatos ao MVP pela regra da matriz: valor 4 com esforço 1 ou 2, e valor 3 com esforço 1, ponderados pelas dependências, pelo fluxo mínimo completo e pelos riscos. Requisito de valor alto e esforço alto é reduzido, dividido ou adiado, nunca descartado. O símbolo 🔧 marca valor ainda em conferência com o Instituto.


### 10.2.6 MVP e incrementos

O MVP é o primeiro recorte utilizável pelo Instituto: cadastrar o instrumento e o projeto, desdobrar requisitos e metas, dar responsável e prazo a cada meta, ser avisado dos vencimentos, registrar aditivos, receber inscrições por link, QR Code ou presencialmente, atender pedidos dos titulares dos dados e gerar a prestação de contas com justificativas. Na validação, o Instituto definiu parcerias e metas como a entrega prioritária, apontou as inscrições como o que "facilitaria para todas as equipes" e confirmou tentar o relatório e a planilha já no MVP.

| Incremento | Épicos e histórias | Requisitos funcionais |
| :--- | :--- | :--- |
| **MVP** | Requisito e meta: HU-01, HU-02, HU-14 · Relatório: HU-05, HU-13 · Pessoas: HU-07, HU-08, HU-15 · Atividade: cadastro da atividade (parte da HU-03) | RF01 a RF09, RF11 a RF15, RF22 a RF27, RF31, RF35 a RF39 |
| Incremento 2 | Atividade: comprovações por modalidade (restante da HU-03) · Evidência: HU-04 | RF10, RF32 a RF34 |
| Incremento 3 | Presença em campo: HU-10 e o registro on-line da HU-09 | RF16, RF19 |
| Posterior | Presença em campo: registro sem conexão e sincronização (HU-09, HU-12) · Pessoas: HU-06 · Requisito e meta: HU-11 | RF17, RF18, RF20, RF21, RF28 a RF30 |

**Justificativas do recorte.**

- **Fluxo mínimo completo.** O MVP fecha dois ciclos: do cadastro do instrumento à emissão do relatório, e da criação da atividade à lista de inscritos, com os controles de dados pessoais que a inscrição exige.
- **Inscrições no MVP (HU-07, HU-08).** Valor 4 e esforço 1 ou 2 em todos os requisitos; o Instituto disse que elas "seriam excelentes" para acompanhar inscritos e metas em todas as equipes.
- **RF09 (cadastrar atividade), da HU-03.** Entra no MVP por dependência, porque toda inscrição é feita em uma atividade. As comprovações por modalidade (RF10) ficam para o incremento 2, com as evidências; a HU-03 é dividida no refinamento.
- **HU-15 no MVP, valor 4 🔧.** Com as inscrições, o sistema passa a guardar dados pessoais de participantes, e o atendimento aos direitos do titular é obrigação legal desde o primeiro dado. O RF27 (excluir ou anonimizar, esforço 3) entra por essa obrigação.
- **RF37 (relatório em PDF), valor 4 e esforço 3.** Entra por proposta da equipe confirmada pelo Instituto, em forma reduzida: no MVP o PDF reproduz o relatório do RF36 sem as miniaturas de evidências, que chegam com o incremento 2.
- **RF36 (relatório de execução).** No MVP o relatório traz metas, indicadores pactuados, situação registrada e justificativas; o índice de comprovações chega com a evidência (incremento 2) e o atingido calculado, com o RF28 (HU-11).
- **HU-05 e HU-13 em recorte parcial.** Os critérios que dependem de evidência ou de presença (índice e miniaturas de evidências, bloqueio por rascunho de evidência, exportação de presenças) são atendidos nos incrementos seguintes; as duas histórias são divididas no refinamento antes da construção, como a HU-09 (registro on-line e registro sem conexão).
- **Evidências no incremento 2.** O Instituto ordenou as evidências logo depois do MVP; o esforço delas (RF32 e RF34 com esforço 3) não cabe na primeira entrega.
- **HU-10 (lançamento fora do prazo).** Foi apresentada e validada junto com evidências, mas corrige presenças já registradas; por isso acompanha o registro de presença no incremento 3.
- **RF16 (registro on-line de presença), valor 2.** Sobe para o incremento 3 por dependência: a HU-10, de valor 4, corrige presenças registradas por ele. O registro sem conexão (RF17) e a sincronização (RF18) ficam para depois.
- **HU-11 (progresso e risco), valor 3.** Fica para o fim porque o cálculo (RF28) depende de presenças e evidências registradas; antes disso o painel mostraria números enganosos. O RF29, candidato pela matriz, só tem efeito junto com o RF28.

### 10.2.7 Requisitos não funcionais no MVP

| Classe | Requisitos não funcionais | Motivo |
| :--- | :--- | :--- |
| Obrigatórios para o MVP | [RNF03](8-requisitos.md#rnf03), [RNF04](8-requisitos.md#rnf04), [RNF16](8-requisitos.md#rnf16), [RNF17](8-requisitos.md#rnf17), [RNF18](8-requisitos.md#rnf18) | Valem para todo o produto desde a primeira entrega: acesso autenticado por perfil, conforme os perfis levantados com o Instituto (8.5.1), compatibilidade, pilha tecnológica e cópia de segurança |
| Associados a RFs do MVP | [RNF01](8-requisitos.md#rnf01), [RNF02](8-requisitos.md#rnf02), [RNF05](8-requisitos.md#rnf05), [RNF06](8-requisitos.md#rnf06), [RNF07](8-requisitos.md#rnf07), [RNF08](8-requisitos.md#rnf08), [RNF11](8-requisitos.md#rnf11), [RNF12](8-requisitos.md#rnf12), [RNF13](8-requisitos.md#rnf13), [RNF15](8-requisitos.md#rnf15) | Integridade das metas, auditoria, minimização de dados e prazo de exclusão, guarda e integridade dos relatórios, desempenho do painel de prazos, da inscrição pública e da geração de relatórios, usabilidade da inscrição em celular |
| Evolutivos | [RNF09](8-requisitos.md#rnf09), [RNF10](8-requisitos.md#rnf10), [RNF14](8-requisitos.md#rnf14) | Entram com os incrementos de evidência e de operação sem conexão |
| Não aplicáveis | — | Nenhum requisito não funcional foi descartado |

### 10.2.8 Validação com o Instituto

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
| Divergências e pendências | A ordem dos incrementos vai à conferência do Instituto: as inscrições foram confirmadas para o MVP às 01:03 e, na ordem final, o campo ficou depois das evidências; a equipe manteve as inscrições no MVP e posicionou por dependência o RF09 e a HU-15 no MVP e a HU-10 e o RF16 no incremento 3; a HU-15 não foi votada e seu valor vai à conferência; a repetição do aviso depois dos 30 dias está a definir; a trava do relatório sobre pagamentos depende da área financeira |
