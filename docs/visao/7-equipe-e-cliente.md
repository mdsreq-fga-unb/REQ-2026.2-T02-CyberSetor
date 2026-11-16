# 7. Interação entre equipe e cliente

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Seção redigida para o site | Equipe CyberSetor |
| 14/09/2026 | 1.2 | Distinção entre as duas Maria Eduardas; alcance da avaliação do Product Owner interno; área competente por funcionalidade; cadência de validação e responsabilidades por atividade de Engenharia de Requisitos | Vinicius Vieira |
| 15/09/2026 | 1.3 | Processo de validação reestruturado em torno das conversas com o Instituto; Definition of Ready e Definition of Done remetidas à seção 9; política de gravações e transcrições | Caio Martins |
| 17/09/2026 | 1.4 | Papel do cliente na validação e na ordenação do backlog declarado na 7.1; retrospectiva registrada ao fim de cada sprint; papel do Product Owner interno unificado com a delimitação já publicada; compromisso de treinamento remetido à seção 6.4; cadência de validação registrada como semanal; reunião de 15/09 nas interações realizadas; tabela de áreas competentes sem coluna de andamento | Vinicius Vieira |
| 29/09/2026 | 1.5 | Parágrafo que liga a entrada das histórias na sprint e a conclusão dos itens à seção 9 | Vinicius Vieira e Maria Eduarda Marques |
| 05/10/2026 | 1.6 | Revisão editorial: aplicação de espaçamentos e formatação em tópicos estruturados para maior fluidez de leitura, preservando a íntegra das validações e argumentações | Rodrigo Henrique |
| 06/10/2026 | 1.7 | Daily no próprio dia, até o fim do dia, em vez de até as 12h | Vinicius Vieira |
| 07/10/2026 | 1.8 | Especificação dos papéis de Engenharia de Requisitos de cada integrante na composição da equipe e remoção de menções operacionais genéricas | Daniel Batista e Maria Eduarda Marques |
| 19/10/2026 | 1.9 | Composição da equipe atualizada para cinco integrantes | Maria Eduarda Marques |
| 21/10/2026 | 1.10 | Daily presencial às terças e quintas e escrita nos demais dias úteis | Vinicius Vieira |
| 26/10/2026 | 1.11 | Interações de 21/09, 28/09 e 08/10 com o Instituto; alinhamento técnico de 15/10 e reunião de 22/10, remarcada para 29/10, registrados como encontros que não ocorreram; ausência registrada sem exigência de motivo; atas de 08/09 e 15/09 ligadas na tabela; trabalho em duplas com revisão por outra dupla (7.1); validação da interface pela demonstração em homologação (7.3); termos do Instituto nas notas de domínio da seção 8 | Vinicius Vieira |
| 11/11/2026 | 1.12 | Responsabilidades por atividade de ER (7.1.1) alinhadas à composição da equipe: Caio Martins na declaração e na organização e atualização, pela rastreabilidade | Maria Eduarda Marques |
| 13/11/2026 | 1.13 | Resumo no início da seção; alcance da avaliação do Product Owner interno explicado só na 7.3, com a 7.1 apontando para ela; duplas e revisão remetidas às práticas de XP da página Processo e ritos; regras da daily remetidas à mesma página; exceção da Sprint 5 nas cerimônias; checkpoint de 29/10/2026 nas interações realizadas e validação de 05/11/2026 adiada a pedido do Instituto; "ambiente de homologação com dados de teste" no lugar de "protótipo evolutivo" na 7.3 (ATA-2026-11-12, D1) | Maria Eduarda Marques |
| 16/11/2026 | 1.14 | Citação do livro-texto no sistema numérico das referências | Maria Eduarda Marques |
| 16/11/2026 | 1.15 | Interação de 12/11 com o Instituto | Vinicius Vieira |
| 16/11/2026 | 1.16 | Seção enxugada e mais visual: equipe, responsáveis por atividade de ER, ferramentas e áreas competentes em cartões; interações recolhidas em lista; etapas da validação em fluxo; ritos e duplas remetidos a Como trabalhamos; atas citadas pela data | Vinicius Vieira |

**Em resumo.** Cinco estudantes, todos engenheiros de requisitos, com uma Product Owner interna e um Scrum Master (7.1). A comunicação passa pelo WhatsApp, pelo Google Meet e pelo GitHub, com ata publicada de cada reunião (7.2). Quem valida é o Instituto, por área competente; a avaliação da Product Owner interna é provisória (7.3).


## 7.1 Composição da Equipe

Cinco estudantes de Engenharia de Software, todos engenheiros de requisitos e desenvolvedores, com os papéis ágeis do ScrumXP.

!!! note "Duas pessoas chamadas Maria Eduarda"
    **Maria Eduarda Marques** é a integrante da equipe e Product Owner interno. **Maria Eduarda, do núcleo pedagógico**, é uma das representantes do Instituto, e vem sempre com essa identificação institucional; seu sobrenome não é registrado porque a equipe não o tem confirmado.

<div class="grid cards f3-compacto" markdown>

-   **Maria Eduarda Denis Duarte Marques**<br>232014502 · [@mariadenis](https://github.com/mariadenis)

    *Líder · Product Owner interno · Elicitação e Descoberta*<br>Interlocução com o Instituto; ordenação do Product Backlog pelo valor validado com o cliente; declaração e validação.

-   **Vinicius Angelo de Brito Vieira**<br>190118059 · [@viniciusvieira00](https://github.com/viniciusvieira00)

    *Scrum Master · Organização e Atualização · Análise e Consenso*<br>Ritos e impedimentos; backlog e rastreabilidade; revisão por pares; análise documental e consenso de regras de negócio.

-   **Rodrigo Henrique Donato de Souza**<br>241012374 · [@Fofodoido](https://github.com/Fofodoido)

    *Representação · Análise e Consenso*<br>BPMN; consenso e intervenção social; consistência de regras e documentos do Instituto; declaração e verificação.

-   **Daniel da Silva Batista**<br>231011201 · [@daniboycam](https://github.com/daniboycam)

    *Representação · Análise de Negócio*<br>Rich Picture e Mapa de Stakeholders; cenário atual e fluxos operacionais; declaração e verificação.

-   **Caio Flávio de Lima Martins Junior**<br>231011168 · [@caioflmjr](https://github.com/caioflmjr)

    *Declaração · Organização e Rastreabilidade*<br>Histórias, critérios de aceitação, DoR e DoD; rastreabilidade e cronograma de requisitos; requisitos não funcionais e verificação.

</div>

O trabalho técnico se distribui pelas [competências](../gestao/como-trabalhamos.md#competencias), em duplas por épico, com revisão por outra dupla ([Fluxo no GitHub](../gestao/como-trabalhamos.md#fluxo-no-github)).

### 7.1.1 Responsabilidades por atividade de Engenharia de Requisitos

**Todos os cinco atuam como engenheiros de requisitos**, nas seis atividades do livro-texto ([1](../referencias.md#ref-1), §5.3), que são iterativas e se retroalimentam. Os cartões dizem **quem conduz e responde pela evidência**, como orquestração e não exclusividade: as atas e questões vão ao refinamento semanal, e cada dupla revisa o material de outra.

<div class="grid cards f3-compacto" markdown>

-   **Elicitação e descoberta**

    Maria Eduarda Marques (interlocução e agendamento).<br>*Evidência:* atas com o cliente; roteiros de entrevista; notas de observação direta.

-   **Análise e consenso**

    Vinicius Vieira e Rodrigo Henrique (documentos do cliente). Achados discutidos no refinamento semanal, onde a equipe fecha o entendimento.<br>*Evidência:* análise da planilha-template; termos do Instituto nas notas de domínio da seção 8; lacunas registradas.

-   **Declaração**

    Caio Martins (estrutura das histórias e dos critérios de aceitação) e cada dupla, no bloco atribuído. Todas as duplas redigem histórias e critérios de aceitação.<br>*Evidência:* histórias e critérios de aceitação no GitHub Projects.

-   **Representação**

    Rodrigo Henrique (BPMN) e Daniel Batista (Rich Picture e mapa de stakeholders), com revisão da equipe.<br>*Evidência:* diagramas publicados neste site.

-   **Verificação e validação**

    Vinicius Vieira organiza a revisão cruzada; a validação cabe ao Instituto, por área competente (seção 7.3).<br>*Evidência:* revisão por par; ata da sessão de validação.

-   **Organização e atualização**

    Vinicius Vieira (Scrum Master) e Caio Martins (rastreabilidade); cada integrante atualiza seus itens no quadro.<br>*Evidência:* quadro; matriz de rastreabilidade; planos de sprint.

</div>

**O papel do cliente.** O Instituto **valida as entregas**, **indica o valor dos itens e participa da ordenação do Product Backlog** e é a fonte primária dos requisitos. O Product Owner interno **propõe** a ordenação a partir desse valor, e a proposta vale até o Instituto confirmá-la. Ele mitiga a dependência do Product Owner disponível (Scrum) e do cliente presente (XP), papel que um Instituto sem equipe de tecnologia e com agenda reduzida não cumpriria no sentido literal; o alcance da sua avaliação está na [seção 7.3](#73-processo-de-validacao).

## 7.2 Comunicação

<div class="grid cards f3-compacto" markdown>

-   **WhatsApp**

    Comunidade *CyberSetor - Requisitos*: *Avisos*, *CyberSetor - Geral* (discussão e decisões) e *Dailys* (daily escrita). Também o canal com as representantes do Instituto.

-   **Google Meet**

    Reuniões da equipe e com o Instituto, com gravação e ata automática, que são apoio interno restrito. O registro oficial é a ata sintética, revisada para dados sensíveis (LGPD) e publicada ([política](../gestao/atas/index.md#politica-de-registro-acesso-e-publicacao)).

-   **GitHub**

    Repositório, Product Backlog e Sprint Backlog (Projects e Issues), feedback do professor por issues e este site.

-   **Google Docs**

    Rascunho colaborativo; a entrega é o site.

</div>

**Reuniões e frequência.** O que cada rito produz está em [Como trabalhamos](../gestao/como-trabalhamos.md#ciclo) e as regras da daily em [Dailies](../gestao/como-trabalhamos.md#dailies).

- **Daily:** presencial às terças e quintas; escrita nos demais dias úteis, no próprio dia.
- **Planning** (primeira terça da sprint) e **Review** (última terça), cerca de uma hora cada, no Meet; na Sprint 5, na quinta ([seção 6.1](6-cronograma.md#61-calendario-vigente)). Review sem o Instituto é provisória até a validação semanal seguinte.
- **Refinamento:** semanal, cerca de trinta minutos; é onde a Engenharia de Requisitos acontece no dia a dia.
- **Retrospectiva:** logo após a Review, cerca de quarenta minutos; as ações de cada unidade vão para a seção 11.

**Interação com o cliente.** Interlocutoras: **Maria Clara e Maria Eduarda, do núcleo pedagógico do Instituto**, por WhatsApp e e-mail. A validação corrente é em **conversas curtas e semanais**, de cerca de trinta minutos, pela agenda de uma organização com equipe reduzida; encontros na sede quando a elicitação exige observação direta.

??? note "Interações realizadas com o Instituto (nove, de 20/08 a 12/11/2026)"
    - **20/08** · vídeo · Primeira reunião: contexto e dores.
    - **02/09** · mensagem · Concordância **preliminar** com a proposta de solução (seção 7.3.2).
    - **[08/09](../gestao/atas/2026-09-08-reuniao-presencial-instituto.md)** · na sede · Elicitação aprofundada, com observação direta e análise de documentos.
    - **[15/09](../gestao/atas/2026-09-15-reuniao-alinhamento-instituto.md)** · vídeo · Área de projetos, coordenação administrativo-financeira e núcleo pedagógico: rotina administrativa, matriz de aquisição, acesso por área, painel e comprovação em campo.
    - **[21/09](../gestao/atas/2026-09-21-reuniao-presencial-instituto.md)** · na sede · Coordenação de execução, presidência e núcleo pedagógico: compras, contratações e prestação de contas, Matriz de Aquisição e planilhas dos projetos em andamento.
    - **[28/09](../gestao/atas/2026-09-28-validacao-mvp-instituto.md)** · vídeo · Histórias e priorização do MVP com o núcleo pedagógico (diretora pedagógica e Maria Eduarda): parcerias e metas como base, inscrições no MVP, evidências no incremento 2 (seção 10.2.8).
    - **[08/10](../gestao/atas/2026-10-08-validacao-mvp-instituto.md)** · vídeo · Recorte do MVP com Maria Eduarda, do núcleo pedagógico: parcerias e metas, aditivos e auditoria, inscrições, direitos do titular e prestação de contas; evidências no incremento 2.
    - **29/10** · vídeo · Checkpoint na homologação, com o núcleo pedagógico: cadastro repetido como aviso na lista de inscritos, acesso administrativo da coordenação de execução e da direção de projetos, pedidos novos (seção 10.2.8). Ata preliminar, fora do site até a conferência do Instituto.
    - **12/11** · vídeo · Validação em uso na homologação, com a direção pedagógica, o Núcleo Pedagógico e a coordenação administrativo-financeira: projeto piloto liberado; pedidos sobre metas por equipe, comprovação na meta e confirmação da vaga (seção 10.2.8). Ata preliminar, fora do site até a conferência do Instituto.

Só entram encontros realizados. Não ocorreram o alinhamento técnico sobre o banco, previsto em 08/10 para 15/10, e a reunião de 22/10, remarcada para 29/10; a validação de 05/11 foi adiada a pedido do Instituto ([ata de 05/11](../gestao/atas/2026-11-05-sprint-review-retrospectiva-planning.md), decisão D10). A cadência é **semanal**: a ausência se registra, e a cadência não se reescreve.

## 7.3 Processo de Validação

Contínua e centrada nas conversas com as representantes do Instituto:

<div class="f3-fluxo" markdown>

1. **Interface em homologação**<br>Cada fluxo construído é demonstrado com dados de teste; os esboços orientam a dupla, mas não substituem a demonstração.
2. **MVP exercitado**<br>Incrementos testados com cenários reais das oficinas e eventos, contra os gargalos de registro e prestação de contas.
3. **Lacunas em conjunto**<br>Ambiguidades, inconsistências e omissões: regras, comportamentos inesperados, fluxos ausentes.
4. **Ata e refinamento**<br>Os acordos vão para a ata e alimentam o backlog e as sprints seguintes.

</div>

**Quando o Instituto não participar.** O Product Owner interno destrava dúvidas operacionais entre as conversas, para o trabalho não parar. Sua avaliação é **provisória**: **não confirma regra de domínio nem substitui a validação do cliente**. Decisão de domínio, regra de prestação de contas ou mudança de escopo se confirma com as representantes; até lá, o item fica *pendente de validação externa*. Na contingência assíncrona (material enviado com prazo de resposta), é o **registro escrito da resposta** que converte a avaliação em validação. Entrada na sprint e conclusão seguem a DoR e a DoD da [seção 9](../requisitos/9-dor-dod.md).

### 7.3.1 Área competente por funcionalidade

O núcleo pedagógico **não é a única fonte de validação**. Cada conjunto de funcionalidades é validado por quem o utiliza ou responde por ele:

<div class="grid cards f3-compacto" markdown>

-   **Diretoria de Projetos e Captação de Recursos**

    Requisito, meta, indicador e parâmetro de aferição.

-   **Área Administrativo-Financeira**

    Relatório de execução do objeto e prestação de contas.

-   **Educadores que conduzem as atividades**

    Inscrição, registro de presença e uso em campo.

-   **Núcleo pedagógico**

    Plano de trabalho, atividades e acompanhamento pedagógico.

-   **Direção, com apoio das áreas acima**

    Base de pessoas, consentimento e tratamento de dados.

-   **Direção**

    Continuidade após o encerramento da disciplina.

</div>

A cobertura de cada área, encontro a encontro, está nas interações da seção 7.2. A consulta à área administrativo-financeira e à Diretoria de Projetos vem dos encaminhamentos da reunião presencial de 08/09/2026.

### 7.3.2 O que a validação de 02/09/2026 cobre — e o que não cobre

**Cobre:** depois de ler a **proposta de solução**, as representantes do núcleo pedagógico concordaram com o problema identificado. Isso confirma o problema da seção 1.4 e os objetivos da seção 2 **como ponto de partida**.

**Não cobre:** a manifestação foi por mensagem, **antes** da elicitação presencial de 08/09/2026, e é **preliminar**. Não valida o que se descobriu depois: o produto centrado no ciclo do projeto financiado, a estrutura organizacional real do Instituto e o modelo de requisito/meta com indicador e parâmetro de aferição ([ata de 08/09](../gestao/atas/2026-09-08-reuniao-presencial-instituto.md)). Aprovação anterior não se estende a fatos posteriores.
