# Atividade 3: ajuste e validação da lista de requisitos

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 29/09/2026 | 1.0 | Decisões por apontamento da verificação em pares e da monitoria e evidência da revisão e da validação da lista de requisitos | Equipe CyberSetor |

A lista de requisitos da [seção 8](../requisitos/8-requisitos.md) foi ajustada a partir de duas revisões externas da versão 2.1: a verificação em pares feita pela equipe SevenSpecs, da mesma turma (46 apontamentos), e o retorno da monitoria (7 pontos). Cada apontamento recebeu uma decisão: Aceito, Parcialmente aceito, Não aceito ou Não aplicável. A versão revisada é a 2.4 da seção 8; o que ainda não entrou nela está indicado como previsto para a versão 2.5.

## Correspondência de códigos

Os apontamentos citam a numeração da versão 2.1. Na versão 2.2, RF01 e RF04 foram divididos e a numeração passou a contínua: RF01 a RF06 da versão avaliada correspondem a RF01 a RF08 (RF01 → RF01 e RF02; RF02 → RF03; RF03 → RF04; RF04 → RF05, RF06 e RF08; RF05 → RF07; RF06 → RF08); do RF07 ao RF37, cada código avançou duas posições (RF07 → RF09 … RF37 → RF39). Os RNFs e as regras de negócio mantêm o código.

Antes da versão 2.0, as propostas de requisitos por característica de produto usaram códigos provisórios, que correspondem aos atuais assim:

??? note "Códigos provisórios dos requisitos funcionais"

    | Código provisório | Código atual | Requisito |
    | :---: | :---: | :--- |
    | RF01 a RF06 (CP1) | RF01 a RF08 | Instrumentos, projetos e metas |
    | RF-C01 | RF09 | Cadastrar atividade por modalidade de objeto |
    | RF-C02 | RF10 | Parametrizar exigência de comprovação de presença |
    | RF-P01 | RF11 | Disponibilizar formulário público de inscrição |
    | RF-P02 | RF12 | Gerar link e QR Code de inscrição |
    | RF-P03 | RF13 | Registrar inscrição presencial assistida |
    | RF-P04 | RF14 | Limitar vagas da atividade |
    | RF-P05 | RF15 | Registrar lista de espera |
    | RF-C03 | RF16 | Registrar frequência em dispositivo móvel |
    | RF-C04 | RF17 | Operar registro de presença em modo offline |
    | RF-C05 | RF18 | Sincronizar presenças com reconciliação idempotente |
    | RF-C06 | RF19 | Registrar lançamento extemporâneo com justificativa |
    | RF-C07 | RF20 | Apurar carga horária de participantes e facilitadores |
    | RF-P06 | RF21 | Consultar histórico de participação |
    | RF-P07 | RF22 | Alertar cadastro duplicado |
    | RF-P08 | RF23 | Registrar aviso de tratamento de dados na inscrição |
    | RF-P09 | RF24 | Registrar autorização de contato |
    | RF-P10 | RF25 | Registrar autorização de uso de imagem |
    | RF-P11 | RF26 | Corrigir dados a pedido do titular |
    | RF-P12 | RF27 | Excluir ou anonimizar dados de pessoa |
    | RF-R01 | RF28 | Calcular progresso físico de metas automaticamente |
    | RF-R02 | RF29 | Parametrizar apuração de metas por acúmulo contínuo ou marco de entrega |
    | RF-R03 | RF30 | Emitir alertas de risco de inexecução |
    | RF-R04 | RF31 | Versionar metas por Termo Aditivo |
    | RF-C08 | RF32 | Anexar evidências documentais e fotográficas |
    | RF-C09 | RF33 | Vincular evidência a meta contratual |
    | RF-C10 | RF34 | Segregar acesso a fotos de beneficiários vulneráveis |
    | RF-R05 | RF35 | Exigir justificativa prévia para metas não atingidas |
    | RF-R06 | RF36 | Emitir Relatório de Execução do Objeto |
    | RF-R07 | RF37 | Gerar relatório diagramado em PDF |
    | RF-R08 | RF38 | Exportar dados analíticos e consolidados em planilha aberta |
    | RF-R09 | RF39 | Registrar trilha de auditoria das operações de prestação de contas |

??? note "Códigos provisórios dos requisitos não funcionais"

    | Código provisório | Código atual | Requisito |
    | :--- | :---: | :--- |
    | RNF01 (CP1) | RNF01 | Integridade transacional dos dados |
    | RNF02 (CP1) | RNF02 | Auditabilidade das alterações |
    | RNF03 (CP1) e RNF-P03 | RNF03 | Segurança das comunicações e das sessões |
    | RNF03 (CP1) e RNF-P05 | RNF04 | Controle de acesso por perfil |
    | RNF-P05 | RNF05 | Minimização de dados pessoais |
    | RNF-P02 | RNF06 | Prazo de atendimento à exclusão de dados |
    | RNF-R01 | RNF07 | Retenção documental decenal |
    | RNF-R03 | RNF08 | Integridade de relatórios fechados |
    | RNF05 (CP1), RNF-C01 e RNF-C02 | RNF09 | Resiliência offline e sincronização sem duplicidade |
    | RNF-P03 | RNF10 | Descarte de dados pessoais no aparelho |
    | RNF04 (CP1) | RNF11 | Desempenho das consultas agregadas |
    | RNF-P01 | RNF12 | Desempenho da inscrição pública |
    | RNF-R02 | RNF13 | Desempenho da geração de relatórios |
    | RNF-C04 | RNF14 | Eficiência no envio de evidências |
    | RNF-C03 e RNF-P04 | RNF15 | Usabilidade móvel e inclusiva |
    | RNF06 (CP1) | RNF16 | Compatibilidade entre navegadores e dispositivos |
    | RNF07 (CP1) | RNF17 | Restrição tecnológica e qualidade de código |
    | Seção 2.6 do Documento de Visão | RNF18 | Cópia de segurança e recuperação de dados |

## Resumo

| Origem | Aceito | Parcialmente aceito | Não aceito | Não aplicável | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Verificação em pares (SevenSpecs) | 32 | 14 | 0 | 0 | 46 |
| Monitoria | 5 | 2 | 0 | 0 | 7 |
| **Total** | **37** | **16** | **0** | **0** | **53** |

## Decisões por apontamento

A última coluna indica o ajuste já presente na lista, com a versão em que entrou, ou o ajuste previsto para a versão 2.5.

| Código avaliado | Código atual | Origem | Apontamento resumido | Decisão | Ajuste ou justificativa |
| :---: | :---: | :---: | :--- | :---: | :--- |
| RF03 | RF04 | SevenSpecs | Reúne requisito e meta; só a meta tem dados definidos | Parcialmente aceito | Versão 2.4: RF04 registra, para cada meta, origem, indicador, parâmetro, período e frequência de apuração e forma de comprovação; requisito e meta são registros distintos e relacionados (RN-01). Não houve divisão em dois RFs: mesma história, mesmo valor e mesmo esforço. |
| RF04 | RF05, RF06, RF08 | SevenSpecs | Várias funcionalidades numa descrição | Aceito | Versão 2.2: dividido em responsável e setor (RF05), prazo e situação (RF06) e sinalização de meta sem responsável (RF08). |
| RF05 | RF07 | SevenSpecs | Linha do tempo usa prazo de requisito que não existe | Aceito | Versão 2.4: a linha do tempo mostra a vigência do instrumento, os prazos das metas e os requisitos que cada meta atende. |
| RF06 | RF09 | SevenSpecs | Relação entre atividade, turma, sessão e recorrência indefinida | Parcialmente aceito | O texto citado é do RF07 avaliado. Versão 2.4: RF09 e RF14 sem turma; vagas e inscrições pertencem à atividade, e turma não vira registro próprio. Previsto para a versão 2.5: sessões e recorrência da atividade em regra de negócio. |
| RF08 | RF10 | SevenSpecs | Sem responsável pela configuração nem gatilho das condicionais | Aceito | Versão 2.4: comprovações configuradas para cada modalidade criada pelo Instituto. Previsto para a versão 2.5: quem configura na tabela de perfis por operação (8.5.1) e condicionais da RN-04 no formato "se condição, então comprovação". |
| RF09, RNF03 | RF11, RNF03 | SevenSpecs | Inscrição pública conflita com rejeição de toda requisição sem credencial | Aceito | Previsto para a versão 2.5: autenticação exigida só nas operações protegidas, com o formulário público e a página do link ou QR Code declarados públicos. |
| RF11 | RF13 | SevenSpecs | "Garantindo o acolhimento" não é comportamento | Aceito | Versão 2.4: o RF13 descreve a inscrição, em nome da pessoa, de quem não tem celular ou conexão. |
| RF14 | RF16 | SevenSpecs | "Interface otimizada" sem critério; lote sem regra | Aceito | Versão 2.3: expressão retirada; o lote são os inscritos da atividade (critério da HU-09); usabilidade verificada pelo RNF15. |
| RF15 | RF17 | SevenSpecs | Uso sem conexão pressupõe dados já no aparelho | Aceito | Versão 2.3: a lista da atividade é preparada no aparelho com conexão (RF17 e critério da HU-09). Previsto para a versão 2.5: aviso quando não houver lista preparada. |
| RF16 | RF18 | SevenSpecs | Impõe identificador gerado no dispositivo | Aceito | Previsto para a versão 2.5: mecanismo retirado do título e da descrição; ausência de perda e duplicidade medida no RNF09. |
| RF17 | RF19 | SevenSpecs | "Justificativa fundamentada" sem condição de aceite | Parcialmente aceito | Versão 2.4: justificativa obrigatória, sem "fundamentada". Aprovação por responsável não adotada: o Instituto dispensou aprovação para lançamento fora do prazo (RF19, RN-13). |
| RF17 | RF19 | SevenSpecs | Reúne lançamento, retificação e auditoria | Parcialmente aceito | Versão 2.3: auditoria fora do RF19, coberta pelo RNF02. Lançar e corrigir fora do prazo seguem juntos: mesmo gatilho, mesmas regras e mesmo valor. |
| RF18 | RF20 | SevenSpecs | Regra de cálculo da carga horária implícita | Aceito | Versão 2.4: carga horária calculada a partir das presenças confirmadas, sem o termo "ciclo de oficinas". Previsto para a versão 2.5: fórmula e exceções em regra de negócio, com valores iniciais. |
| RF21 | RF23 | SevenSpecs | Reúne apresentar e registrar o aviso | Aceito | Versão 2.4: RF23 delimitado ao registro da versão do aviso apresentada, com data e hora; a apresentação é condição do registro (critérios das HU-07 e HU-08). |
| RF22 | RF24 | SevenSpecs | Concessão e revogação juntas; sem canal de revogação | Parcialmente aceito | Versão 2.4: revogação a pedido da pessoa, registrada com data e canal. Concessão e revogação ficam no mesmo RF por serem o ciclo de vida do mesmo registro. Previsto para a versão 2.5: identificação da pessoa e momento do efeito em regra de negócio. |
| RF25 | RF27 | SevenSpecs | Não define quando excluir e quando anonimizar | Aceito | Versão 2.4: condição de cada tratamento na RN-07: guarda legal preservada com acesso restrito, total reportado só como agregado, demais dados eliminados. |
| RF26 | RF28 | SevenSpecs | "Em tempo real" sem intervalo | Parcialmente aceito | Previsto para a versão 2.5: recálculo a cada presença confirmada ou evidência vinculada, verificável pelo evento; não se fixa intervalo sem fonte. |
| RF27 | RF29 | SevenSpecs | Título promete metas não lineares | Aceito | Versão 2.4: descrição com os dois tipos de apuração, cumulativa ou por marco. |
| RF28 | RF30 | SevenSpecs | Curva planejada não definida | Aceito | Versão 2.4: referência é a proporção já decorrida do período de apuração. Previsto para a versão 2.5: periodicidade da avaliação. |
| RF28 | RF30 | SevenSpecs | "Abaixo da curva" sem limiar | Aceito | Versão 2.4: limiar de 20 pontos percentuais abaixo da proporção decorrida, marcado como valor inicial. |
| RF30 | RF32 | SevenSpecs | "Quando disponível" para a localização | Aceito | Previsto para a versão 2.5: localização registrada só quando a comprovação da modalidade exigir e o usuário autorizar. |
| RF31 | RF33 | SevenSpecs | Vincular e consultar juntos; descarte implícito | Parcialmente aceito | Versão 2.3: descarte de rascunho explicitado no RF33. Versão 2.4: consulta por meta ligada ao RF33 pelo critério da HU-04, sem RF próprio. |
| RF32 | RF34 | SevenSpecs | Mistura acesso e orientação de captura; "vulneráveis" | Aceito | Previsto para a versão 2.5: RF34 só restringe o acesso às imagens de prova; orientação de enquadramento em critério da captura (RF32); termo retirado. |
| RF34 | RF36 | SevenSpecs | "Índice ordenado" sem critério | Aceito | Versão 2.4: índice das comprovações agrupado por meta e em ordem cronológica. |
| RF35 | RF37 | SevenSpecs | "Via servidor" é implementação | Aceito | Atendido na versão 2.3: mecanismo retirado; mantido o PDF, formato do documento entregue. |
| RF36 | RF38 | SevenSpecs | "Dados brutos" indefinido | Aceito | Atendido na versão 2.3: exportação em visão detalhada ou consolidada. Previsto para a versão 2.5: descrição com atividades, presenças e situação das metas do período. |
| RF36 | RF38 | SevenSpecs | Título consolidado, descrição bruta | Aceito | Atendido na versão 2.3: título e descrição com o mesmo escopo; colunas, período e permissões nos critérios da HU-13. |
| RF37 | RF39 | SevenSpecs | Título e descrição com escopos diferentes | Aceito | Previsto para a versão 2.5: RF39 versiona o relatório retificado, e a trilha de qualquer alteração fica só no RNF02. |
| RNF03 | RNF03 | SevenSpecs | Reúne várias propriedades de segurança | Parcialmente aceito | Previsto para a versão 2.5: proteção das comunicações, autenticação e duração e revogação do acesso como critérios separados, verificáveis um a um. |
| RNF03 | RNF03 | SevenSpecs | Revogação sem prazo nem comportamento sem conexão | Aceito | Previsto para a versão 2.5: revogação vale no primeiro contato do aparelho com o sistema; registros pendentes preservados; duração e inatividade com valor inicial. |
| RNF04 | RNF04 | SevenSpecs | Métrica não cobre todo o escopo | Aceito | Previsto para a versão 2.5: métrica sobre todas as combinações de perfil, operação e escopo de dados da tabela 8.5.1. |
| RNF04 | RNF04 | SevenSpecs | Matriz de perfis sem detalhe | Aceito | Versão 2.4: encerramento do projeto e liberação da trava do relatório na seção 8.5.1. Previsto para a versão 2.5: tabela por operação e perfil. |
| RNF06 | RNF06 | SevenSpecs | Prazo na descrição difere da métrica | Parcialmente aceito | Previsto para a versão 2.5: prazo só na métrica, com valor inicial. Pela convenção de valor inicial da seção 8.1 não havia contradição, mas a leitura era ambígua. |
| RNF08 | RNF08 | SevenSpecs | Integridade do arquivo não prova o conteúdo | Aceito | Previsto para a versão 2.5: conteúdo conferido contra resultado conhecido, integridade do arquivo e correção só por nova versão. |
| RNF09 | RNF09 | SevenSpecs | Repete o comportamento de RF15 e RF16 | Aceito | Previsto para a versão 2.5: RNF09 só com a qualidade: nenhum registro feito sem conexão se perde ou se duplica. |
| RNF10 | RNF10 | SevenSpecs | "Imediatamente" sem intervalo | Parcialmente aceito | Previsto para a versão 2.5: descarte definido pelo estado do dado e pelo evento de confirmação do envio, sem intervalo em segundos sem fonte. |
| RNF10, RNF09, RF15 | RNF10, RNF09, RF17 | SevenSpecs | Descarte pode apagar dado necessário ao trabalho sem conexão | Aceito | Previsto para a versão 2.5: política por estado do dado; lista preparada mantida até a última sessão preparada ou prazo inicial; fim do acesso bloqueia a leitura. |
| RNF11 | RNF11 | SevenSpecs | "Com agilidade" subjetivo | Aceito | Previsto para a versão 2.5: expressão retirada; critério só pelos parâmetros de tempo, carga e uso de processamento. |
| RNF12 | RNF12 | SevenSpecs | "4G lenta" não reprodutível | Aceito | Previsto para a versão 2.5: condição de rede definida (latência, banda e processador) com fonte e limiar do indicador medido. |
| RNF13 | RNF13 | SevenSpecs | "Performática" e "elevado volume" | Parcialmente aceito | Previsto para a versão 2.5: termos retirados; volume, tempo e carga simultânea na métrica. Tamanho do arquivo não entra: decorre do número de miniaturas, já limitado. |
| RNF14 | RNF14 | SevenSpecs | Impõe compressão no cliente web | Aceito | Previsto para a versão 2.5: resultado esperado (tamanho e tempo de envio por foto), sem dizer onde a redução acontece. |
| RNF15 | RNF15 | SevenSpecs | Critérios diferentes e subjetivos reunidos | Parcialmente aceito | Previsto para a versão 2.5: usabilidade e acessibilidade como critérios separados, cada um medido; termos subjetivos retirados. |
| RNF16 | RNF16 | SevenSpecs | "Equivalência" e "navegadores modernos" | Parcialmente aceito | Previsto para a versão 2.5: navegadores, versões e larguras definidos. Aparelhos usados em campo ainda não levantados. |
| RNF17 | RNF17 | SevenSpecs | Reúne restrição tecnológica e critérios de qualidade | Parcialmente aceito | Previsto para a versão 2.5: critérios separados e verificáveis um a um no mesmo RNF. No URPS+, requisito de implementação abrange linguagem e padrões obrigatórios, então é uma só categoria. |
| RNF18 | RNF18 | SevenSpecs | "Periodicamente" nos testes de restauração | Aceito | Previsto para a versão 2.5: ensaio antes da entrada em uso, mensal até dois resultados aprovados e trimestral depois, com valor inicial. |
| RNF18 | RNF18 | SevenSpecs | Cópia cobre o banco, não os arquivos | Aceito | Previsto para a versão 2.5: escopo com arquivos de evidência e relatórios; perda máxima e tempo de recuperação medidos na restauração do conjunto completo. |
| RF01, RF04, RF07 | RF01, RF02, RF05, RF06, RF08, RF09 | Monitoria | RFs longos com regra e implementação | Aceito | Regras de negócio em subseção própria desde a versão 2.1; RF01 e RF04 divididos na versão 2.2; RF09 reescrito na versão 2.3; CP1, CP3 e CP5 em uma frase, com ator genérico, na versão 2.4. |
| Seção 8 | Seção 8 | Monitoria | Tecnologia dentro dos requisitos | Aceito | Mecanismos retirados dos RFs na versão 2.1. Previsto para a versão 2.5: retirar os que restam nos RNFs e nas notas de domínio, com restrição de implementação só no RNF17; ficam formatos de interface (PDF, planilha aberta, e-mail). |
| RF03, RF04 | RF04; RF05, RF06, RF08 | Monitoria | Quebrar RF com várias operações | Parcialmente aceito | RF04 avaliado dividido na versão 2.2. RF03 avaliado não dividido; justificativa no primeiro apontamento desta tabela. |
| Seção 8.4 | Seções 8.4 e 8.6 | Monitoria | Planejamento na rastreabilidade | Aceito | Versão 2.4: rastreabilidade e pontos em aberto sem prioridade, prazo ou situação de execução. |
| RNFs | RNFs | Monitoria | Métricas com origem e forma de medição | Aceito | Valores sem fonte marcados como iniciais e listados na seção 8.6; na versão 2.4, a antecedência do alerta passou a ter origem na validação com o Instituto. Previsto para a versão 2.5: forma de verificação e fonte declaradas em cada RNF. |
| Seção 8 | Seção 8 | Monitoria | Não adicionar requisitos | Aceito | Nenhum RF novo na versão 2.4. A exportação integral dos dados, prevista na seção 2, está registrada como ponto em aberto na seção 8.6. |
| Seções 8.2 e 8.3 | Seções 8.2 e 8.3 | Monitoria | Tabelas únicas por tipo | Parcialmente aceito | Regras de negócio em tabela única (seção 8.7). Conversão de RFs e RNFs em tabela prevista para a versão 2.5, sem mudança de conteúdo. |

## Conferência do conjunto

Além dos apontamentos recebidos, a lista inteira foi conferida para consistência. Entrou na versão 2.4:

- RFs de CP1, CP3 e CP5 e RF19, RF20, RF29 a RF31, RF35 e RF36 em uma frase, com ator genérico e sem mecanismo.
- Regras RN-03, RN-07 e RN-11 revistas e RN-13 incluída.
- Matriz de rastreabilidade dos RFs pelas histórias HU-01 a HU-15 e seus critérios; a história de cada RF fica só na matriz.
- Pontos em aberto sem situação de execução, com a trava financeira do relatório, a exportação integral e a alteração do período de execução.
- Tabela de códigos provisórios retirada da seção 8; a correspondência está nesta página.

Previsto para a versão 2.5:

- RNFs classificados pelo URPS+, com critério verificável e fonte em cada um.
- Notas de domínio sem tecnologia e sem repetição de RF.
- Regras de negócio para sessões da atividade, presença única por sessão, carga horária, pedidos do titular dos dados e risco de meta.
- Redação dos RFs de CP2, CP4, CP6, CP7 e CP8 ainda não revistos.

## Evidência da revisão e da validação

**Revisão.** A versão 2.1 da lista foi verificada pela equipe SevenSpecs, da mesma turma, que registrou 46 apontamentos em planilha com código, tipo, problema, explicação e ajuste sugerido, e pela monitoria, que apontou 7 pontos. As decisões estão na tabela acima. Cada versão revisada passa por leitura de integrante de outra dupla antes da publicação, como pede a [Definition of Done](../requisitos/9-dor-dod.md).

**Validação.** A lista foi validada com o Instituto No Setor em sessão de 28/09/2026, conduzida por história de usuário. Os ajustes pedidos entraram na versão 2.4: alerta de vencimento automático 30 dias antes do prazo, com avisos adicionais registrados na própria meta, enviado por e-mail (RF08, RN-03); modalidades de atividade criadas pelo próprio Instituto (RF09, RF10); lançamento de presença fora do prazo sem aprovação (RF19); encerramento do projeto sem bloqueio por comprovação antiga que não pode mais ser obtida, feito só pela coordenação da equipe de execução (RN-11); trava do relatório por meta sem justificativa, com notificação à direção e sem bloquear os demais registros do projeto (RF35); justificativa obrigatória para alterar registro já concluído (RN-13). A aplicação da trava a pendências da área administrativo-financeira e a alteração do período de execução ficaram como pontos em aberto (seção 8.6). O registro da sessão, com participantes, decisões e pendências, está na [seção 10](../requisitos/10-backlog.md).
