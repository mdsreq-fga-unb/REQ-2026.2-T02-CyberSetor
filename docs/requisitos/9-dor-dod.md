# 9. Definition of Ready e Definition of Done

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 29/09/2026 | 1.0 | Definition of Ready das histórias de usuário, com os critérios INVEST, e Definition of Done dos itens de documentação de requisitos e de código | Vinicius Vieira e Maria Eduarda Marques |
| 05/10/2026 | 1.1 | Critério Testável da DoR limitado às ambiguidades identificadas na revisão | Maria Eduarda Marques |
| 05/10/2026 | 1.2 | Conclusão do item na branch de integração do seu tipo: `docs-homologacao` para documentação, `api-develop` ou `web-develop` para código; demonstração no ambiente de homologação | Vinicius Vieira |

---

Conforme o template da disciplina (Marsicano, 2026), a Definition of Ready (DoR, definição de preparado) é o acordo entre o time e o Product Owner sobre quando uma história de usuário está preparada para entrar em uma sprint: clara, bem declarada e sem impedimento para ser desenvolvida. A Definition of Done (DoD, definição de pronto) é o compromisso do time com a qualidade do que entrega: descreve quando um item está concluído, e o item que não a atende não é apresentado na Sprint Review e volta ao Product Backlog (Marsicano, 2026; Schwaber; Sutherland, 2020). As duas apoiam a verificação e a validação de requisitos descritas na [seção 5](../visao/5-engenharia-requisitos.md): a DoR antes do desenvolvimento, a DoD na conclusão de cada item.

## 9.1 Definition of Ready (DoR)

A DoR vale para as histórias de usuário. A dupla responsável pelo épico confere a história no refinamento, e no Sprint Planning só entram histórias que atendem a todos os itens. A que não atende continua no Product Backlog até ser refinada. Os seis primeiros itens são as perguntas INVEST (Wake, 2003), que a equipe usa para refinar histórias; os três últimos são condições do projeto.

Uma história de usuário está pronta quando:

1. **Independente (I):** não repete o resultado de outra história e pode ser ordenada e entregue sem depender artificialmente de outra; a dependência que existir está registrada na própria história.
2. **Negociável (N):** descreve a necessidade e o comportamento esperado, sem fixar a solução técnica.
3. **Valiosa (V):** tem valor claro para um perfil do Instituto, com o ator explícito na própria história (*Como …, quero … para …*), e valor de negócio validado com o Instituto, na escala MoSCoW pontuada de 4 a 1, com a justificativa registrada na [seção 10](10-backlog.md).
4. **Estimável (E):** a equipe avaliou esforço, complexidade e lacuna de capacidade dos requisitos funcionais da história ([seção 10](10-backlog.md)); incerteza grande leva a dividir a história ou a investigar antes.
5. **Pequena (S):** cabe em uma sprint; a que não cabe é dividida antes de entrar.
6. **Testável (T):** tem critérios de aceitação em lista, cada um verificável e sem ambiguidade identificada na revisão por quem desenvolve.
7. **Vinculada aos requisitos:** a pelo menos um requisito funcional da [seção 8](8-requisitos.md) e aos requisitos não funcionais e às regras de negócio que a condicionam.
8. **Sem decisão externa pendente** que impeça o desenvolvimento: valor inicial marcado com 🔧 tem responsável e prazo registrados na história.
9. **Com a interface esboçada e ligada à história**, quando envolve tela nova ou alterada.

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

1. **Está integrado à `api-develop` ou à `web-develop`** por pull request revisado e aprovado por integrante de outra dupla.
2. **Atende aos critérios de aceitação** da história de usuário.
3. **Passa nos testes automatizados** na integração contínua.
4. **Não degrada os requisitos não funcionais** associados à história, conferidos pela forma de verificação de cada um na [seção 8.3](8-requisitos.md#83-lista-de-requisitos-nao-funcionais-rnfs), inclusive os padrões de codificação da restrição tecnológica ([RNF17](8-requisitos.md#rnf17)).
5. **Tem a documentação de uso e a da API atualizadas**, quando aplicável.
6. **Incorpora o retorno do Instituto** sobre o item, quando houver, ou o registra no Product Backlog.
7. **Pode ser demonstrado na Sprint Review**, em funcionamento no ambiente de homologação.
