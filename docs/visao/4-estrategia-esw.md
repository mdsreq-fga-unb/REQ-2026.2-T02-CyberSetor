# 4. Estratégias de engenharia de software

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Seção redigida para o site | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Refatoração e melhoria na apresentação e estrutura da seção 4 | Equipe CyberSetor |
| 07/09/2026 | 1.3 | Adequação da classificação do Ciclo de Vida | Equipe CyberSetor |
| 17/09/2026 | 1.4 | Cadência de validação com o Instituto alinhada à seção 7.2 | Equipe CyberSetor |
| 05/10/2026 | 1.5 | Revisão editorial: formatação direta, preservando toda a fundamentação teórica, citações e quadros comparativos | Rodrigo Henrique |
| 13/10/2026 | 1.6 | Revisão conceitual: neutralidade no quadro comparativo, OpenUP iterativo, Scrum como framework, ScrumXP como processo adaptado e alinhamento de cadências | Caio Martins |
| 19/10/2026 | 1.7 | Equipe atual de cinco integrantes | Maria Eduarda Marques |
| 26/10/2026 | 1.8 | Programação em pares por duplas de épico, com o detalhe na página de processo; MVP centrado em parcerias, metas e prestação de contas, com a presença nos incrementos; refatoração dentro da história, coberta pelos testes; documentação de requisitos do ScrumXP com o fluxo da tela e o protótipo evolutivo na homologação; justificativa sem superlativos; quadro comparativo pelo que cada processo exige da equipe; síntese e alternativas descartadas pelos fatores do contexto | Vinicius Vieira |
| 05/11/2026 | 1.9 | Atendimento aos apontamentos da monitoria (#22): remoção da linha de aplicação no contexto do quadro comparativo | Rodrigo Henrique |
| 11/11/2026 | 1.10 | Resumo no início da 4.1; validações com o Instituto remetidas à cadência da seção 7.2; incremento disponibilizado no ambiente de homologação | Maria Eduarda Marques |
| 13/11/2026 | 1.11 | "Ambiente de homologação com dados de teste" no lugar de "protótipo evolutivo" no quadro comparativo (ATA-2026-11-12, D1) | Maria Eduarda Marques |
| 16/11/2026 | 1.12 | Citações no sistema numérico das referências | Maria Eduarda Marques |
| 16/11/2026 | 1.13 | Camadas em diagrama, razões e etapas do ScrumXP em cartões e fluxo, quadro comparativo enxuto, alternativas descartadas em lista; ritos, cadência e fluxo de trabalho remetidos a "Como trabalhamos" | Vinicius Vieira |
| 26/11/2026 | 1.14 | Evidências objetivas de aplicação das práticas de ScrumXP nos incrementos produzidos e tratamento de incrementos parciais | Rodrigo Henrique |

As decisões seguem as três camadas metodológicas do referencial da disciplina: **abordagem**, **ciclo de vida** e **processo**. Os ritos, a cadência e o fluxo de trabalho do dia a dia estão em [Como trabalhamos](../gestao/como-trabalhamos.md#ciclo).

## 4.1 Estratégia Priorizada

**Em resumo.** Abordagem e ciclo de vida ágeis, com processo ScrumXP (Scrum para cadência e papéis; XP para integração contínua, testes e refatoração), em sprints de duas semanas alinhadas às quatro entregas.

<div class="f3-camadas" markdown>

- **Abordagem: Ágil.** Indivíduos e interações, software em funcionamento e colaboração com o cliente acima de processos, documentação abrangente e contratos ([16](../referencias.md#ref-16)), sem abrir mão de processo sustentável e de documentação viva e suficiente.
- **Ciclo de vida: Ágil.** Timeboxes fixos de duas semanas; cada um repete elicitação, análise, projeto, codificação e testes e termina num incremento utilizável e testado ([1](../referencias.md#ref-1)). É um *superset* do iterativo e do incremental.
- **Processo: ScrumXP.** Processo adaptado pela equipe: o *framework* Scrum ([18](../referencias.md#ref-18)) dá papéis, eventos e artefatos, e o XP ([17](../referencias.md#ref-17); [1](../referencias.md#ref-1)) dá as práticas de código que o Scrum, intencionalmente incompleto, não prescreve.

</div>

<div class="grid cards f3-compacto" markdown>

-   **Por que a abordagem ágil**

    ---

    - Requisitos que emergem do convívio em campo ajustam escopo e detalhe; na preditiva, passariam pela revisão do plano.
    - Funcionalidade essencial cedo, para validação contínua com a coordenação pedagógica.
    - Foco no usuário: o MVP trata das parcerias, das metas e da prestação de contas; chamada e presença em oficinas e mutirões vêm nos incrementos ([seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos)); a interface considera o letramento digital de quem atua na ponta.
    - Esforço de especificação proporcional a uma equipe de cinco, com documentação viva e rastreável, frente à preditiva ou à híbrida.

-   **Por que o ciclo de vida ágil**

    ---

    - Datas e recursos fixos nos quatro marcos da disciplina; o escopo é a variável de ajuste, com software homologado a cada release.
    - Validação com educadores e gestores do Instituto por incremento executável, na cadência da [seção 7.2](7-equipe-e-cliente.md#72-comunicacao).
    - Riscos de integração, usabilidade e regras de negócio aparecem cedo, e a arquitetura se ajusta a cada sprint, sem retrabalho tardio.

</div>

### Processo: ScrumXP no projeto

<div class="f3-fluxo" markdown>

1. **Concepção e planejamento da release.** Entrevistas e análise das planilhas e relatórios do Instituto; Rich Picture e mapa de stakeholders; Product Backlog inicial priorizado por valor.
2. **Desenvolvimento em sprints de duas semanas.** Planning com seleção e estimativa; histórias em duplas por épico, em par quando a dupla trabalha junta e com revisão por outra dupla quando o trabalho é individual; integração contínua e refatoração dentro da história, coberta pelos testes.
3. **Revisão e validação com o cliente.** Incremento demonstrado ao Instituto na Sprint Review, contra os critérios de aceitação; sem o Instituto presente, a avaliação fica provisória até a validação semanal seguinte; backlog refinado com o retorno.
4. **Melhoria contínua e transição.** Retrospectiva com plano de ação; documentação viva e lições aprendidas atualizadas; tag de versão e incremento no ambiente de homologação.

</div>

**Práticas selecionadas.** Do Scrum: Product Backlog único no GitHub Projects, ordenado pelo impacto na rotina do Instituto; sprints de duas semanas; Planning, Review com o cliente e Retrospectiva ([sprints](../gestao/como-trabalhamos.md#sprints)). Do XP: programação em pares por duplas de épico ([como é aplicada](../gestao/como-trabalhamos.md#ciclo)); integração contínua com compilação, estilo e testes a cada pull request ([fluxo no GitHub](../gestao/como-trabalhamos.md#fluxo-no-github)); testes de aceitação a partir dos critérios das histórias; propriedade coletiva do código e refatoração dentro da história.

### Evidências de aplicação das práticas de ScrumXP

A adoção efetiva das práticas escolhidas é verificável nos artefatos e no histórico de integração de cada linha do repositório:

| Prática de ScrumXP | Como foi executada nos incrementos | Evidência verificável |
| :--- | :--- | :--- |
| **Integração contínua e pequenas releases** | Três linhas independentes (`docs-homologacao`, `api-develop` e `web-develop`) com verificação automática em todo pull request e publicação progressiva em homologação com tags de marco (`u1`, `u2`, `u3`). | Pipelines em execução contínua: compilação estrita e 123 testes de hooks na documentação; formatação, linter, tipagem estrita, verificação de modelos de e-mail, testes e build na API; linter, tipagem, testes unitários e regressão visual a `360` e `1280 px` no front, sustentando dezenas de pull requests integrados em API e front. |
| **Testes de aceitação e verificação de RNFs** | Critérios de aceitação convertidos em testes unitários, de integração por perfil e visuais, somados a medições em homologação. | Suítes de API e front vinculadas às histórias do MVP; medições de desempenho (`RNF12` em `1,78 s` e `RNF13` em `2,13 s`) em `14/11/2026` e verificações de integridade (`RNF08`), acessibilidade (`RNF15`) e compatibilidade entre navegadores (`RNF16`) conduzidas na Sprint 6. |
| **Duplas, revisão por pares e propriedade coletiva** | Atribuição por épico em duplas, revisão obrigatória por integrante independente antes de integrar e proibição de envio direto às branches principais. | Bloqueio automático de commits fora de pull request integrado (`guarda-de-branches` e `verificar-push`) e registro formal de revisão nas Sprints 3 a 6 (duas aprovações em `05/11`–`22/11`; uma aprovação independente na Sprint 6 com pedido explícito em pontos cruciais). |
| **Tratamento de incrementos parciais e replanejamento** | Balanço explícito do que foi integrado, do que ficou pendente e da redistribuição ao fim de cada sprint. | Registro de 73 de 84 critérios implementados na Review 4, fechamento parcial da Sprint 5 e replanejamento formal da Sprint 6 em `22/11/2026` consolidados na [seção 6.1.1](6-cronograma.md#611-resultados-efetivos-por-sprint-replanejamento-e-viabilidade). |

## 4.2 Quadro Comparativo: OpenUP x ScrumXP

O **OpenUP** é um processo ágil baseado em arquitetura, derivado do Unified Process; o **ScrumXP** combina gestão ágil e engenharia técnica.

| Critério | OpenUP | ScrumXP |
|---|---|---|
| **Foco principal** | Estabilidade arquitetural progressiva, controle sistemático de riscos e governança por casos de uso. | Ritmo sustentável, valor em ciclos curtos e feedback contínuo sobre histórias de usuário. |
| **Fases** | Iniciação, Elaboração, Construção e Transição, com iterações curtas que cobrem todas as disciplinas. | Sprints de duas semanas guiadas pelo Product Backlog e pelos eventos do Scrum. |
| **Arquitetura** | Executável, validada nas iterações da Elaboração para mitigar os principais riscos técnicos. | Mínima e evolutiva a cada sprint, apoiada por refatoração dentro da história e testes automatizados. |
| **Requisitos** | Casos de uso e especificações suplementares detalhados conforme o ciclo avança. | Backlog de histórias repriorizado a cada sprint com o retorno do cliente. |
| **Práticas técnicas** | Orientações de análise e projeto orientados a objetos e casos de uso, sem rotina diária de codificação em pares. | Práticas contínuas no dia a dia: trabalho em duplas, integração contínua e testes de aceitação. |
| **Documentação de requisitos** | Formal por fase: casos de uso, modelo de dados e arquitetura executável. | Viva e rastreável: histórias, critérios de aceitação com o fluxo da tela e o sistema na homologação com dados de teste. |
| **Colaboração com o cliente** | Contínua, com marcos formais de avaliação ao fim de cada fase. | Contínua, ao fim de cada sprint, pela demonstração do software em funcionamento. |
| **O que exige da equipe** | Modelagem de casos de uso e disciplinas do processo unificado. | Eventos do Scrum e práticas do XP (duplas, integração contínua e testes). |

> **Síntese.** Os dois são iterativos e incrementais e poderiam conduzir o projeto. O ScrumXP foi escolhido por três fatores do contexto: sprints de duas semanas acompanham as quatro entregas; os requisitos são histórias com critérios de aceitação, e não casos de uso; e as práticas do XP ajudam a nivelar uma equipe de cinco estudantes com conhecimento técnico desigual. O OpenUP validaria a arquitetura mais cedo; no ScrumXP, esse risco é tratado pela base técnica construída antes das histórias e pelos testes automatizados.

## 4.3 Justificativa

**Scrum e XP se completam.** O Scrum dá governança e comunicação com stakeholders, mas não trata da engenharia; o XP dá a disciplina técnica, mas não uma estrutura de papéis que clientes externos reconheçam. O ScrumXP junta a cadência de gestão de um às práticas de código do outro.

**Coerência com os valores da ER.** Os sete valores adotados na disciplina (**Comunicação, Feedback, Simplicidade, Coragem, Respeito, Compromisso e Confiança**) adaptam os do XP e do Scrum, acrescidos da Confiança ([1](../referencias.md#ref-1), §5.4.1). O ScrumXP mantém o processo nessa mesma base.

**Pilares da decisão:**

1. **Escopo flexível, prazo fixo:** quatro entregas obrigatórias no semestre; com sprints de duas semanas, o escopo é a variável de ajuste e cada marco recebe incrementos validados.
2. **Nivelamento técnico:** a equipe tem conhecimento desigual da pilha ([competências](../gestao/como-trabalhamos.md#competencias)); pares, integração contínua e propriedade coletiva fazem da construção um nivelamento contínuo com garantia de qualidade.
3. **Requisitos emergentes:** as regras de prestação de contas, oficinas e presença se refinam no contato com os educadores, e o ciclo ágil as adapta sem renegociação documental.
4. **Núcleo de maior impacto:** o Instituto precisa antes de tudo registrar parcerias e metas e prestar contas ao concedente; o MVP prioriza esse núcleo, a presença vem nos incrementos ([seção 10.2.6](../requisitos/10-backlog.md#1026-mvp-e-incrementos)), e o backlog por valor garante o núcleo homologado antes do acessório.

!!! note "Risco do processo: cliente presente"
    O XP pede o cliente presente (*On-site Customer*), mas as representantes do Instituto têm agenda concorrida e a equipe dele é reduzida. **Mitigação:** um integrante atua como **Product Owner interno**, canaliza dúvidas, organiza pautas enxutas e mantém a comunicação assíncrona entre as validações semanais e as Sprint Reviews, resguardando o tempo do Instituto.

### Alternativas descartadas

- **Cascata e Modelo V:** pressupõem requisitos estáveis desde o início e verificação formal tardia; não acompanham a descoberta contínua nem as entregas parciais do semestre.
- **Processo Unificado completo (RUP):** papéis e artefatos dimensionados para projetos e equipes maiores que cinco estudantes num semestre.
- **OpenUP:** iterativo e adequado a equipes pequenas, mas organiza requisitos em casos de uso e iterações em fases com marcos próprios; o projeto usa histórias e precisa de iterações alinhadas às quatro entregas.
- **Espiral (Boehm):** voltada a grandes projetos com riscos críticos (aeroespacial, defesa), com análise formal de riscos e alto custo gerencial.
- **Feature Driven Development (FDD):** pressupõe equipe sênior em modelagem orientada a objetos e domínio mapeado desde a largada.
- **Kanban isolado:** fluxo contínuo para suporte e manutenção, sem ritos temporais para sincronizar as quatro entregas.
- **Frameworks de escala (SAFe, LeSS):** coordenam dezenas de equipes; complexidade administrativa desnecessária para uma só.
