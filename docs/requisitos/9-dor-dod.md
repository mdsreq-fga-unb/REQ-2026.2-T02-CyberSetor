# 9. Definition of Ready e Definition of Done

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 29/09/2026 | 1.0 | Definition of Ready das histórias de usuário, com os critérios INVEST, e Definition of Done dos itens de documentação de requisitos e de código | Vinicius Vieira e Maria Eduarda Marques |
| 05/10/2026 | 1.1 | Critério Testável da DoR limitado às ambiguidades identificadas na revisão | Maria Eduarda Marques |
| 05/10/2026 | 1.2 | Conclusão do item na branch de integração do seu tipo: `docs-homologacao` para documentação, `api-develop` ou `web-develop` para código; demonstração no ambiente de homologação | Vinicius Vieira |
| 20/10/2026 | 1.3 | Requisitos não funcionais de todo o produto (RNF03, RNF16 e RNF17) como condição de conclusão do item de código | Equipe CyberSetor |
| 26/10/2026 | 1.4 | Item de código atende aos requisitos não funcionais listados na história, conferidos pela métrica; controle de acesso por perfil (RNF04) e usabilidade e acessibilidade (RNF15) entre os requisitos de todo o produto; DoR: o que impede a entrada separado do que admite valor provisório com 🔧; fluxo da tela nos critérios de aceitação no lugar do esboço, com os estados comuns a todas as telas na RNF15; valor herdado e regra com comportamento padrão entre os valores provisórios. DoD: história concluída na versão publicada na homologação, com o percurso executado; item concluído distinto do incremento; validação pendente em "Aguardando"; tratamento do retorno do Instituto; registro de conclusão no quadro do projeto; revisor de outra dupla ou integrante independente; item de código e história com listas próprias; verificação por classe de requisito não funcional | Vinicius Vieira |

---

Conforme o template da disciplina (Marsicano, 2026), a Definition of Ready (DoR, definição de preparado) é o acordo entre o time e o Product Owner sobre quando uma história de usuário está preparada para entrar em uma sprint: clara, bem declarada e sem impedimento para ser desenvolvida. A Definition of Done (DoD, definição de pronto) é o compromisso do time com a qualidade do que entrega: descreve quando um item está concluído, e o item que não a atende não é apresentado na Sprint Review e volta ao Product Backlog (Marsicano, 2026; Schwaber; Sutherland, 2020). As duas apoiam a verificação e a validação de requisitos descritas na [seção 5](../visao/5-engenharia-requisitos.md): a DoR antes do desenvolvimento, a DoD na conclusão de cada item.

## 9.1 Definition of Ready (DoR)

A DoR vale para as histórias de usuário. A dupla responsável pelo épico confere a história no refinamento, e no Sprint Planning só entram histórias que atendem a todos os itens. A que não atende continua no Product Backlog até ser refinada. Os seis primeiros itens são as perguntas INVEST (Wake, 2003), que a equipe usa para refinar histórias; os três últimos são condições do projeto.

Uma história de usuário está pronta quando:

1. **Independente (I):** não repete o resultado de outra história e pode ser ordenada e entregue sem depender artificialmente de outra; a dependência que existir está registrada na própria história.
2. **Negociável (N):** descreve a necessidade e o comportamento esperado, sem fixar a solução técnica.
3. **Valiosa (V):** tem valor claro para um perfil do Instituto, com o ator explícito na própria história (*Como …, quero … para …*), e valor de negócio validado com o Instituto, na escala MoSCoW pontuada de 4 a 1, com a justificativa registrada na [seção 10](10-backlog.md). A história que entra por obrigação legal ou por dependência técnica, ou que herda o valor de história validada, pode ter valor provisório, nas condições do item 8.
4. **Estimável (E):** a equipe avaliou esforço, complexidade e lacuna de capacidade dos requisitos funcionais da história ([seção 10](10-backlog.md)); incerteza grande leva a dividir a história ou a investigar antes.
5. **Pequena (S):** cabe em uma sprint; a que não cabe é dividida antes de entrar.
6. **Testável (T):** tem critérios de aceitação em lista, cada um verificável e sem ambiguidade identificada na revisão por quem desenvolve.
7. **Vinculada aos requisitos:** a pelo menos um requisito funcional da [seção 8](8-requisitos.md) e aos requisitos não funcionais e às regras de negócio que a condicionam.
8. **Sem decisão externa pendente** que impeça o desenvolvimento. Impedem a entrada: ator ou resultado indefinido; critério de aceitação cujo comportamento central depende de resposta do Instituto; dependência de outra história que não esteja entregue nem planejada antes dela na mesma sprint. Admitem valor provisório marcado com 🔧, com responsável e prazo registrados na história: parâmetro numérico, campo opcional, regra cujo comportamento padrão já está no critério de aceitação e valor de negócio de história que entra por obrigação legal, por dependência técnica ou herdado de história validada.
9. **Com o fluxo da tela descrito nos critérios de aceitação**, quando envolve tela nova ou alterada: campos, ações, o estado vazio e as recusas próprias da história; carregamento, falha de carregamento e alteração simultânea seguem a [RNF15](8-requisitos.md#rnf15). O esboço da tela é material de trabalho da dupla e não entra na história.

## 9.2 Definition of Done (DoD)

A DoD tem uma versão para cada tipo de item. Antes de aprovar o pull request, quem revisa confere o conteúdo contra os itens da DoD; o item fica concluído quando o pull request aprovado é integrado à branch de integração do seu tipo, descrita em [Boas práticas no GitHub](../gestao/boas-praticas-github.md#branches).

### 9.2.1 Itens de documentação de requisitos

Um item de documentação de requisitos está concluído quando:

1. **Está integrado à `docs-homologacao`** por pull request, com a geração do site em modo estrito (`mkdocs build --strict`) sem erro; vai ao site no ponto de publicação seguinte.
2. **Foi revisado por outra dupla:** o pull request tem revisão aprovada, com registro, de integrante de outra dupla.
3. **Está rastreável:** todo requisito funcional declarado ou alterado tem característica de produto, objetivo específico, história de usuário e, quando houver, as regras de negócio que o condicionam; todo requisito não funcional tem origem e requisitos relacionados na matriz de rastreabilidade.
4. **Não traz solução nem planejamento no requisito funcional:** a descrição não cita tecnologia nem informação de planejamento.
5. **Está validado com o Instituto**, quando depende dele; senão, a pendência está registrada na [seção 8.6](8-requisitos.md#86-pontos-em-aberto-e-auditoria-de-lacunas).

### 9.2.2 Itens de código

Um item de código está concluído quando:

1. **Está integrado à `api-develop` ou à `web-develop`** por pull request revisado e aprovado por integrante de outra dupla ou pelo integrante independente.
2. **Atende aos critérios de aceitação** da história de usuário.
3. **Passa nos testes automatizados** na integração contínua.
4. **Atende aos requisitos não funcionais** listados na história, conferidos pela métrica verificável de cada um na [seção 8.3](8-requisitos.md#83-lista-de-requisitos-nao-funcionais-rnfs), e atende aos requisitos não funcionais de todo o produto: segurança das comunicações e das sessões ([RNF03](8-requisitos.md#rnf03)), controle de acesso por perfil ([RNF04](8-requisitos.md#rnf04)), usabilidade e acessibilidade ([RNF15](8-requisitos.md#rnf15)), compatibilidade entre navegadores e dispositivos ([RNF16](8-requisitos.md#rnf16)) e restrição tecnológica e qualidade de código ([RNF17](8-requisitos.md#rnf17)).
5. **Tem a documentação de uso e a da API atualizadas**, quando aplicável.
6. **Incorpora o retorno do Instituto** sobre o item, quando houver. Retorno que contraria critério de aceitação ou regra já validada impede a conclusão até o ajuste; retorno que acrescenta comportamento vira item novo no Product Backlog.

Esses itens são conferidos na revisão de cada pull request, e o item fica concluído quando integrado na linha do seu componente (`api-develop` ou `web-develop`).

Uma história está concluída quando os seus itens de código estão concluídos e ela:

1. **Está publicada na homologação**, na versão identificada pelo commit da `api-develop` e da `web-develop`, com o percurso da história executado nessa versão.
2. **Tem o registro de conclusão no item da história no quadro do projeto:** critérios de aceitação atendidos, testes, versão demonstrada e pendências.

O incremento é a versão das duas linhas publicada junta na homologação, e é nele que a história é dada como concluída e demonstrada na Sprint Review. História concluída com validação do Instituto pendente fica em "Aguardando" no quadro do projeto e com 🔧 no texto até a confirmação.

**Verificação por classe de requisito não funcional**

| Classe | Requisitos | Verificação |
| :--- | :--- | :--- |
| Segurança das sessões | [RNF03](8-requisitos.md#rnf03) | Testes de API de autenticação e de sessão na integração contínua; cifragem, cookie de sessão e limite de tentativas conferidos na homologação |
| Autorização | [RNF04](8-requisitos.md#rnf04) | Testes de API por perfil na integração contínua |
| Minimização de dados | [RNF05](8-requisitos.md#rnf05) | Revisão do esquema do banco, dos formulários e das permissões no pull request |
| Usabilidade | [RNF15](8-requisitos.md#rnf15) | Testes de tela dos estados vazio, de falha de carregamento e de recusa e testes visuais a 360 e 1280 px na integração contínua; WCAG, alvos de toque e contraste 🔧 |
| Integridade e auditoria | [RNF01](8-requisitos.md#rnf01), [RNF02](8-requisitos.md#rnf02) | Teste da trilha de auditoria |
| Desempenho | [RNF11](8-requisitos.md#rnf11), [RNF13](8-requisitos.md#rnf13) | Medição na homologação 🔧 |
| Compatibilidade | [RNF16](8-requisitos.md#rnf16) | Testes visuais em Chromium a 360 e 1280 px na integração contínua; 1920 px, Firefox e WebKit 🔧 |
| Qualidade de código | [RNF17](8-requisitos.md#rnf17) | Formatação, linter sem avisos, tipagem estrita, testes e build de produção na integração contínua |
| Recuperação | [RNF18](8-requisitos.md#rnf18) | Ensaio de restauração registrado |
