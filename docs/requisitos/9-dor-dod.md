# 9. Definition of Ready e Definition of Done

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 29/09/2026 | 1.0 | Definition of Ready das histórias de usuário, com os critérios INVEST, e Definition of Done dos itens de documentação de requisitos e de código | Vinicius Vieira e Maria Eduarda Marques |
| 05/10/2026 | 1.1 | Critério Testável da DoR limitado às ambiguidades identificadas na revisão | Maria Eduarda Marques |
| 05/10/2026 | 1.2 | Conclusão do item na branch de integração do seu tipo: `docs-homologacao` para documentação, `api-develop` ou `web-develop` para código; demonstração no ambiente de homologação | Vinicius Vieira |
| 20/10/2026 | 1.3 | Requisitos não funcionais de todo o produto (RNF03, RNF16 e RNF17) como condição de conclusão do item de código | Equipe CyberSetor |
| 26/10/2026 | 1.4 | Item de código atende aos requisitos não funcionais listados na história, conferidos pela métrica; controle de acesso por perfil (RNF04) e usabilidade e acessibilidade (RNF15) entre os requisitos de todo o produto; DoR: o que impede a entrada separado do que admite valor provisório com 🔧; fluxo da tela nos critérios de aceitação no lugar do esboço, com os estados comuns a todas as telas na RNF15; valor herdado e regra com comportamento padrão entre os valores provisórios. DoD: história concluída na versão publicada na homologação, com o percurso executado; item concluído distinto do incremento; validação pendente em "Aguardando"; tratamento do retorno do Instituto; registro de conclusão no quadro do projeto; revisor de outra dupla ou integrante independente; item de código e história com listas próprias; verificação por classe de requisito não funcional | Vinicius Vieira |
| 13/11/2026 | 1.5 | Escalas de valor e de esforço da DoR (itens 3 e 4) ligadas às seções 10.2.1, 10.2.2 e 10.2.3 | Maria Eduarda Marques |
| 16/11/2026 | 1.6 | Citações no sistema numérico das referências | Maria Eduarda Marques |
| 16/11/2026 | 1.7 | Verificação de desempenho com o RNF12 e com o registro das condições de cada medição | Vinicius Vieira |
| 16/11/2026 | 1.8 | Fluxo visual da DoR à validação do Instituto e critérios em listas curtas, com o mesmo conteúdo; verificação por classe de requisito não funcional recolhida; valor provisório marcado com o selo | Vinicius Vieira |
| 25/11/2026 | 1.9 | Evidência de aplicação da DoR nas sprints e acompanhamento dos pontos provisórios (🔧) | Rodrigo Henrique |

---

Conforme o template da disciplina ([3](../referencias.md#ref-3)), a Definition of Ready (DoR, definição de preparado) é o acordo entre o time e o Product Owner sobre quando uma história está preparada para entrar em uma sprint: clara, bem declarada e sem impedimento. A Definition of Done (DoD, definição de pronto) é o compromisso do time com a qualidade do que entrega: diz quando um item está concluído; o que não a atende não vai à Sprint Review e volta ao Product Backlog ([1](../referencias.md#ref-1); [18](../referencias.md#ref-18)). As duas apoiam a verificação e a validação da [seção 5](../visao/5-engenharia-requisitos.md).

<ol class="fluxo-dd" markdown="0">
<li><strong>Backlog</strong>História refinada pela dupla do épico</li>
<li class="fluxo-dd__portao"><strong><a href="#91-definition-of-ready-dor">DoR</a></strong>Nove itens conferidos no refinamento</li>
<li><strong>Sprint</strong>O Sprint Planning só aceita história pronta</li>
<li class="fluxo-dd__portao"><strong><a href="#92-definition-of-done-dod">DoD</a></strong>Conferida na revisão de cada pull request</li>
<li><strong>Homologação</strong>Incremento publicado, percurso executado e demonstrado na Review</li>
<li><strong>Validação do Instituto</strong>Retorno incorporado; validação pendente fica em "Aguardando"</li>
</ol>

## 9.1 Definition of Ready (DoR)

A dupla responsável pelo épico confere a história no refinamento; a que não atende a todos os itens continua no Product Backlog. Os seis primeiros itens são as perguntas INVEST ([15](../referencias.md#ref-15)); os três últimos, condições do projeto.

Uma história de usuário está pronta quando:

1. **Independente (I):** não repete o resultado de outra história e pode ser ordenada e entregue sem depender artificialmente de outra; a dependência que existir está registrada na própria história.
2. **Negociável (N):** descreve a necessidade e o comportamento esperado, sem fixar a solução técnica.
3. **Valiosa (V):** tem o ator explícito (*Como …, quero … para …*) e valor de negócio validado com o Instituto, na escala MoSCoW de 4 a 1 ([seção 10.2.1](10-backlog.md#1021-criterios-e-escalas)), com a justificativa na [seção 10.2.2](10-backlog.md#1022-avaliacao-de-negocio-com-o-instituto). História que entra por obrigação legal ou dependência técnica, ou que herda o valor de história validada, pode ter valor provisório (item 8).
4. **Estimável (E):** esforço, complexidade e lacuna de capacidade avaliados nas escalas da [seção 10.2.1](10-backlog.md#1021-criterios-e-escalas), com o registro na [seção 10.2.3](10-backlog.md#1023-avaliacao-tecnica); incerteza grande leva a dividir a história ou a investigar antes.
5. **Pequena (S):** cabe em uma sprint; a que não cabe é dividida antes de entrar.
6. **Testável (T):** critérios de aceitação em lista, cada um verificável e sem ambiguidade identificada na revisão por quem desenvolve.
7. **Vinculada aos requisitos:** a pelo menos um requisito funcional da [seção 8](8-requisitos.md) e aos requisitos não funcionais e regras de negócio que a condicionam.
8. **Sem decisão externa pendente** que impeça o desenvolvimento.
    - Impedem a entrada: ator ou resultado indefinido; critério de aceitação cujo comportamento central depende de resposta do Instituto; dependência de história que não esteja entregue nem planejada antes dela na mesma sprint.
    - Admitem valor provisório marcado com o selo 🔧, com responsável e prazo registrados na história: parâmetro numérico, campo opcional, regra cujo comportamento padrão já está no critério de aceitação e valor de negócio de história que entra por obrigação legal, por dependência técnica ou herdado de história validada.
9. **Com o fluxo da tela nos critérios de aceitação**, quando há tela nova ou alterada: campos, ações, estado vazio e recusas próprias da história; carregamento, falha de carregamento e alteração simultânea seguem a [RNF15](8-requisitos.md#rnf15). O esboço da tela é material de trabalho da dupla e não entra na história.

??? note "Aplicação da DoR nas sprints e acompanhamento dos pontos provisórios (🔧)"
    No refinamento de cada sprint (Sprints 3 a 6), a dupla responsável confere os nove itens acima antes de mover a história para o Sprint Backlog. Histórias que possuíam apenas parâmetros secundários ou valores herdados marcados com 🔧 ingressaram com base no item 8, porque o comportamento central e as regras de recusa já estavam fixados nos critérios de aceitação, viabilizando implementação e testes automatizados determinísticos.

    Pedidos cujo comportamento central ou impacto em proteção de dados ainda dependiam de definição institucional (como perguntas personalizadas com possíveis dados pessoais sensíveis, envio por terceiros sem conta ou módulos financeiros) foram barrados pela DoR e mantidos na [seção 8.6](8-requisitos.md#86-pontos-em-aberto-e-auditoria-de-lacunas). Para cada ponto provisório relevante aceito em desenvolvimento, o responsável pela confirmação, o momento previsto de validação e o impacto em código e testes constam na tabela de governança dos comportamentos provisórios da [seção 8.6](8-requisitos.md#86-pontos-em-aberto-e-auditoria-de-lacunas).

## 9.2 Definition of Done (DoD)

Há uma DoD para cada tipo de item. Quem revisa confere o pull request contra ela antes de aprovar; o item fica concluído quando o pull request aprovado é integrado à branch do seu tipo ([Boas práticas no GitHub](../gestao/como-trabalhamos.md#fluxo-no-github)).

### 9.2.1 Itens de documentação de requisitos

Concluído quando:

1. **Integrado à `docs-homologacao`** por pull request, com `mkdocs build --strict` sem erro; vai ao site no ponto de publicação seguinte.
2. **Revisado por outra dupla:** revisão aprovada, com registro, de integrante de outra dupla.
3. **Rastreável:** todo requisito funcional declarado ou alterado tem característica de produto, objetivo específico, história de usuário e, quando houver, as regras de negócio que o condicionam; todo requisito não funcional tem origem e requisitos relacionados na matriz de rastreabilidade.
4. **Sem solução nem planejamento no requisito funcional:** a descrição não cita tecnologia nem informação de planejamento.
5. **Validado com o Instituto**, quando depende dele; senão, a pendência está na [seção 8.6](8-requisitos.md#86-pontos-em-aberto-e-auditoria-de-lacunas).

### 9.2.2 Itens de código

Um item de código está concluído quando:

1. **Integrado à `api-develop` ou à `web-develop`** por pull request revisado e aprovado por integrante de outra dupla ou pelo integrante independente.
2. **Atende aos critérios de aceitação** da história.
3. **Passa nos testes automatizados** na integração contínua.
4. **Atende aos requisitos não funcionais** listados na história, pela métrica de cada um na [seção 8.3](8-requisitos.md#83-lista-de-requisitos-nao-funcionais-rnfs), e aos de todo o produto: [RNF03](8-requisitos.md#rnf03) (segurança das comunicações e das sessões), [RNF04](8-requisitos.md#rnf04) (controle de acesso por perfil), [RNF15](8-requisitos.md#rnf15) (usabilidade e acessibilidade), [RNF16](8-requisitos.md#rnf16) (compatibilidade entre navegadores e dispositivos) e [RNF17](8-requisitos.md#rnf17) (restrição tecnológica e qualidade de código).
5. **Documentação de uso e da API atualizadas**, quando aplicável.
6. **Retorno do Instituto incorporado**, quando houver. O que contraria critério de aceitação ou regra já validada impede a conclusão até o ajuste; o que acrescenta comportamento vira item novo no Product Backlog.

Uma história está concluída quando os seus itens de código estão concluídos e ela:

1. **Está publicada na homologação**, na versão identificada pelo commit da `api-develop` e da `web-develop`, com o percurso da história executado nessa versão.
2. **Tem o registro de conclusão no quadro do projeto:** critérios de aceitação atendidos, testes, versão demonstrada e pendências.

O incremento é a versão das duas linhas publicada junta na homologação; nele a história é dada como concluída e demonstrada na Sprint Review. História concluída com validação do Instituto pendente fica em "Aguardando" no quadro e com 🔧 no texto até a confirmação.

??? note "Verificação por classe de requisito não funcional"
    | Classe | Requisitos | Verificação |
    | :--- | :--- | :--- |
    | Segurança das sessões | [RNF03](8-requisitos.md#rnf03) | Testes de API de autenticação e de sessão na integração contínua; cifragem, cookie de sessão e limite de tentativas conferidos na homologação |
    | Autorização | [RNF04](8-requisitos.md#rnf04) | Testes de API por perfil na integração contínua |
    | Minimização de dados | [RNF05](8-requisitos.md#rnf05) | Revisão do esquema do banco, dos formulários e das permissões no pull request |
    | Usabilidade | [RNF15](8-requisitos.md#rnf15) | Testes de tela dos estados vazio, de falha de carregamento e de recusa e testes visuais a 360 e 1280 px na integração contínua; WCAG, alvos de toque e contraste 🔧 |
    | Integridade e auditoria | [RNF01](8-requisitos.md#rnf01), [RNF02](8-requisitos.md#rnf02) | Teste da trilha de auditoria |
    | Desempenho | [RNF11](8-requisitos.md#rnf11), [RNF12](8-requisitos.md#rnf12), [RNF13](8-requisitos.md#rnf13) | Medição na homologação, nas condições da métrica de cada requisito, com a versão medida e as condições do ensaio registradas |
    | Compatibilidade | [RNF16](8-requisitos.md#rnf16) | Testes visuais em Chromium a 360 e 1280 px na integração contínua; 1920 px, Firefox e WebKit 🔧 |
    | Qualidade de código | [RNF17](8-requisitos.md#rnf17) | Formatação, linter sem avisos, tipagem estrita, testes e build de produção na integração contínua |
    | Recuperação | [RNF18](8-requisitos.md#rnf18) | Ensaio de restauração registrado |
