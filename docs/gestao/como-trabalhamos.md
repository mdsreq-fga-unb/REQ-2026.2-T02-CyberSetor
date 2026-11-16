# Como trabalhamos

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 16/11/2026 | 1.0 | Página única do processo da equipe, com ciclo, sprints, fluxo no GitHub, dailies e competências, que reúne as páginas de processo, boas práticas no GitHub, dailies, sprints e matriz de competências | Vinicius Vieira |

A equipe adota o **ScrumXP**: Scrum para gerenciar o trabalho e práticas do eXtreme Programming para a engenharia. A fundamentação da escolha está na [seção 4](../visao/4-estrategia-esw.md); papéis, frequência e duração dos ritos, na [seção 7](../visao/7-equipe-e-cliente.md#72-comunicacao).

<div class="f1-atalhos" markdown>
[Ciclo](#ciclo) [Sprints](#sprints) [Fluxo no GitHub](#fluxo-no-github) [Dailies](#dailies) [Competências](#competencias)
</div>

## Ciclo

Sprints de **duas semanas**, ancoradas nas terças-feiras. Exceções: a Sprint 0, de descoberta, com três semanas, e a Sprint 5, de quinta a quinta, porque a Sprint 4 terminou dois dias depois do previsto ([seção 6.1](../visao/6-cronograma.md#61-calendario-vigente)).

<div class="f1-ciclo" markdown>

1. **Sprint Planning**<br>Produz a meta da sprint e o Sprint Backlog.<br>Registro: [plano da sprint](#sprints) e ata.
2. **Daily**<br>Produz compromisso e impedimentos visíveis.<br>Registro: grupo *Dailys* e [adesão](#dailies).
3. **Sprint Review**<br>Demonstra o incremento e leva o retorno ao backlog.<br>Registro: ata e resultado no plano.
4. **Retrospectiva**<br>Produz as ações de melhoria, que compõem a seção 11.<br>Registro: na ata da Review.

</div>

Entre os ritos: refinamento semanal do backlog e as reuniões de validação com o Instituto ([atas com o cliente](atas/index.md#interacoes-com-o-cliente)).

### Práticas de XP

- **Desde a Sprint 1:** histórias de usuário, critérios de aceitação, duplas donas das histórias, integração contínua com o site compilado em modo estrito e cliente presente **adaptado** (Product Owner interno entre as validações e validação semanal com o Instituto).
- **Desde a primeira sprint de código:** testes de aceitação, pequenas releases, programação em pares, propriedade coletiva do código, design simples e padrões de codificação. A evidência de adoção é apresentada na Sprint Review.
- **Pares, como se aplicam:** duplas por épico. Sessão síncrona fica registrada na coautoria do commit (`Co-authored-by`) e na daily. Quem trabalha sozinho tem o pull request revisado por integrante de outra dupla, controle que substitui o par.
- **Documentação sem sessões em par** desde 10/11/2026, por falta de tempo para as chamadas ([ATA-2026-11-10](atas/2026-11-10-reuniao-equipe.md), D2): a dupla segue dona da história e o pull request passa pelas [duas aprovações](#fluxo-no-github).

??? note "Práticas não adotadas, com justificativa"

    - **TDD integral:** a equipe não tem maturidade para sustentá-lo; adotam-se testes de aceitação.
    - **Refatoração contínua agressiva:** exige uma suíte de testes ampla, que não existirá no prazo.
    - **Metáfora do sistema:** baixo retorno em projeto pequeno.
    - **Semana de 40 horas:** não se aplica ao contexto acadêmico.

### Artefatos e ambientes

<div class="grid cards" markdown>

- **Product Backlog**<br>GitHub Projects e Issues · Product Owner interno, com a ordenação validada pelo Instituto
- **Sprint Backlog**<br>GitHub Projects · time
- **Incremento**<br>Versão integrada da API e do front na homologação, identificada pelo commit da `api-develop` e da `web-develop` · time
- **Registros**<br>Visão do Produto: este site · equipe<br>[Atas de reunião](atas/index.md) · relator<br>DoR e DoD: [seção 9](../requisitos/9-dor-dod.md) · equipe<br>[Matriz de competências](#competencias) · Scrum Master

</div>

<span id="ambientes-do-produto"></span>**Ambientes do produto.** Homologação em [cybersetor-web.netvitae.org](https://cybersetor-web.netvitae.org), com a API e a documentação em [cybersetor-api.netvitae.org/docs](https://cybersetor-api.netvitae.org/docs), a partir da `web-develop` e da `api-develop`. Produção a partir da `web` e da `api`, publicada na estabilização ([seção 6.4](../visao/6-cronograma.md#64-estabilizacao-implantacao-e-transferencia)). A homologação tem acesso só por conta criada pela administração, sem cadastro aberto, e guarda só dados de teste, inclusive nas validações com o Instituto ([dados de teste, seção 2.6](../visao/2-solucao-proposta.md#dados-de-teste)).

??? note "Formato da história de usuário"

    Histórias seguem o formato do XP: linguagem não técnica, na perspectiva de quem usa, com critérios de aceitação objetivos e verificáveis.

    ```
    Como <perfil do Instituto>, quero <ação> para <resultado esperado>.

    Critérios de aceitação:
    - [Condição observável ou regra que o sistema deve cumprir]
    - [Restrição de negócio, técnica ou de privacidade/LGPD]
    ```

    O formulário de história do repositório pede a história nesse formato, as características de produto e os objetivos específicos em caixas de marcação (seções 2.3 e 2.2), os RFs, RNFs e regras de negócio que a condicionam, os critérios em lista e as dependências. No quadro, características e objetivos ficam em campos de seleção múltipla com os mesmos títulos.

## Sprints

Cada sprint numa aba, com os atalhos para o plano, as tarefas e as atas. O objetivo de cada sprint está na [seção 6.1](../visao/6-cronograma.md#61-calendario-vigente); a linha do tempo de tudo o que mudou, em [Histórico e evolução](historico.md).

=== "Sprint 5"

    **05/11 a 19/11/2026** · em andamento · Unidade 3 em 17/11

    [Meta da Sprint](sprints/sprint-5.md#42-meta-da-sprint) · [Sprint Backlog](sprints/sprint-5.md#62-sprint-backlog) · [Critérios de aceitação](sprints/sprint-5.md#10-criterios-de-aceitacao-da-sprint) · [Tarefas](sprints/tarefas-sprint-5.md) · [Planning 5](atas/2026-11-05-sprint-review-retrospectiva-planning.md) · [Equipe, 10/11](atas/2026-11-10-reuniao-equipe.md) · [Monitoria, 12/11](atas/2026-11-12-reuniao-monitoria.md)

=== "Sprint 4"

    **20/10 a 05/11/2026** · encerrada · meta parcialmente atingida (73 de 84 critérios do MVP)

    [Meta da Sprint](sprints/sprint-4.md#42-meta-da-sprint) · [Sprint Backlog](sprints/sprint-4.md#62-sprint-backlog) · [Resultado](sprints/sprint-4.md#12-resultado-da-sprint) · [Tarefas](sprints/tarefas-sprint-4.md) · [Planning 4](atas/2026-10-20-sprint-review-retrospectiva-planning.md) · [Review 4](atas/2026-11-05-sprint-review-retrospectiva-planning.md) · [Equipe, 27/10](atas/2026-10-27-reuniao-equipe.md)

=== "Sprint 3"

    **06/10 a 20/10/2026** · encerrada · meta parcialmente atingida

    [Meta da Sprint](sprints/sprint-3.md#42-meta-da-sprint) · [Sprint Backlog](sprints/sprint-3.md#62-sprint-backlog) · [Resultado](sprints/sprint-3.md#12-resultado-da-sprint) · [Tarefas](sprints/tarefas-sprint-3.md) · [Planning 3](atas/2026-10-07-sprint-planning.md) · [Review 3](atas/2026-10-20-sprint-review-retrospectiva-planning.md) · [Validação do MVP, 08/10](atas/2026-10-08-validacao-mvp-instituto.md)

=== "Sprint 2"

    **22/09 a 06/10/2026** · encerrada · meta parcialmente atingida

    [Meta da Sprint](sprints/sprint-2.md#42-meta-da-sprint) · [Sprint Backlog](sprints/sprint-2.md#62-sprint-backlog) · [Critérios de aceitação](sprints/sprint-2.md#10-criterios-de-aceitacao-da-sprint) · [Tarefas](sprints/tarefas-sprint-2.md) · [Planning 2](atas/2026-09-23-sprint-planning.md) · [Review 2](atas/2026-10-06-sprint-review-retrospectiva.md) · [Validação do MVP, 28/09](atas/2026-09-28-validacao-mvp-instituto.md)

=== "Sprint 1"

    **08/09 a 22/09/2026** · encerrada · meta parcialmente atingida

    [Meta da Sprint](sprints/sprint-1.md#43-meta-da-sprint) · [Critérios de aceitação](sprints/sprint-1.md#11-criterios-de-aceitacao-da-sprint) · [Tarefas](sprints/tarefas-sprint-1.md) · [Planning 1](atas/2026-09-08-sprint-planning.md) · [Review 1](atas/2026-09-22-sprint-review-retrospectiva.md) · [Alinhamento, 15/09](atas/2026-09-15-reuniao-alinhamento-instituto.md) · [Presencial, 21/09](atas/2026-09-21-reuniao-presencial-instituto.md)

=== "Sprint 0"

    **18/08 a 08/09/2026** · encerrada · descoberta, sem plano de sprint

    [Entrega da Unidade 1](../entregas/unidade-1.md) · [Presencial, 08/09](atas/2026-09-08-reuniao-presencial-instituto.md) · [Equipe, 27/08](atas/2026-08-27-reuniao-equipe.md) · [Equipe, 01/09](atas/2026-09-01-reuniao-equipe.md)

## Fluxo no GitHub

O histórico de commits e de pull requests é a evidência do processo. A documentação, a API e o front têm linhas próprias, sem história comum entre si.

<div class="f1-linhas" markdown>

<div class="f1-linha" markdown>
**Documentação**

- `docs/<assunto>`
- `docs-homologacao`<br><small>revisada, não publicada</small>
- `main`<br><small>tag da entrega</small>
- Site no GitHub Pages
</div>

<div class="f1-linha" markdown>
**API**

- `feat/api/HU-xx-<assunto>`
- `api-develop`<br><small>homologação</small>
- `api`<br><small>produção</small>
</div>

<div class="f1-linha" markdown>
**Front**

- `feat/web/HU-xx-<assunto>`
- `web-develop`<br><small>homologação</small>
- `web`<br><small>produção</small>
</div>

<div class="f1-linha f1-linha--pr" markdown>
**Caminho de um pull request**

- Branch curta da linha de integração
- Pull request com `Refs #N`
- Verificações em verde
- Duas aprovações
- Merge pelo autor
</div>

</div>

**Regras essenciais**

1. Toda mudança entra por pull request; nenhum push direto nas seis branches fixas.
2. **Duas aprovações**, ao menos uma de integrante de outra dupla ou do integrante independente.
3. Com a segunda aprovação e sem conflito, **o próprio autor faz o merge**, por *merge commit*; sem *squash*; conflito se resolve com *rebase*.
4. Referência de até cerca de **1.000 linhas** por pull request, sem contar as de teste, e de 24 horas para a revisão; nenhuma das duas é regra estrita.
5. **Sem código na linha da documentação:** o `guarda-de-branches` confere origem e destino de todo pull request.
6. Commits em Conventional Commits, com o título sem acentos.

??? note "Branches de trabalho, correções e issues"

    - **Documentação:** `git switch docs-homologacao && git pull && git switch -c docs/<assunto>`; commits em fatias com `mkdocs build --strict` passando; pull request para `docs-homologacao` com `Refs #N`; quem revisa confere o site compilado, pelo artefato `site` do `build-check` ou com `mkdocs serve`; o autor integra e apaga a branch.
    - **Código:** a branch sai da `api-develop` ou da `web-develop` e volta a ela; o nome leva o componente e a história (`feat/api/HU-01-cadastro-de-meta`). Também entram `test/`, `refactor/` e `chore/` do componente. O ciclo é de dias: história grande se divide em mais de um pull request. A ida para produção é um pull request de `api-develop` para `api` (ou de `web-develop` para `web`), revisado como os demais.
    - **Onde as coisas vivem:** a entrega é este site, publicado pelo GitHub Pages a partir de `docs/` na `main`; link para artefato externo não vale como entrega, e as imagens ficam em `docs/assets/`. O código do produto fica no mesmo repositório, nas linhas próprias.
    - **`main`** recebe de `docs-homologacao`, `fix/<assunto>` e `chore/<assunto>`; **`docs-homologacao`** recebe de `docs/<assunto>` e da `main`; **`api-develop`** e **`web-develop`** recebem também da linha de produção do componente.
    - **Correções:** site publicado em `fix/<assunto>` a partir da `main`, com pull request para a `main` e depois `main` → `docs-homologacao`; API em `fix/api-<assunto>` a partir de `api`, depois `api` → `api-develop`; front em `fix/web-<assunto>` a partir de `web`, depois `web` → `web-develop`. Mudança de configuração (`chore/<assunto>` na `main`) volta à `docs-homologacao` do mesmo jeito.
    - **Issues:** o GitHub só fecha issue por palavra-chave em pull request para a branch padrão. Os demais usam `Refs #N`, e a issue fecha ao ir para Done no quadro. O pull request `docs-homologacao` → `main` pode listar `Closes #N`. Issue aberta pelo professor não é fechada pela equipe.
    - **Sem proteção de branch**, que depende de permissão de administrador da organização, valem quatro controles: nenhum push direto; o `guarda-de-branches`; o `verificar-push`, que falha quando chega à `main` ou à `docs-homologacao` commit fora de pull request integrado; e só *merge commit* habilitado, com branch de trabalho apagada depois do merge. As seis branches fixas não se apagam; endereços e segredos de cada ambiente ficam na hospedagem.
    - Edição pela interface web direto na `main` é push sem revisão e não é usada; merge local seguido de push não deixa o registro da revisão. Se a revisão atrasar e travar outro trabalho, o autor avisa no grupo da equipe e a revisão pode ser repassada.

??? note "Corpo do pull request, guarda das branches e fichas"

    - **Corpo do pull request:** segue o modelo do repositório: o que mudou, qual seção do template é afetada, confirmação de que o build passou e quem revisa.
    - **`guarda-de-branches`:** combinação de origem e destino fora das permitidas (diagrama acima e "Branches de trabalho, correções e issues") fica com a verificação em vermelho e não é integrada.
    - **Fichas da 10.1:** na ficha se escrevem só a história, o épico, os requisitos, as dependências e os critérios; o resto vem das seções de origem no build.

??? note "Pontos de publicação e congelamento"

    Pelo Plano de Ensino (§9.1), alteração no site depois do início da aula de apresentações torna a entrega atrasada, com desconto de 20% por dia. Por isso a documentação vai ao ar em pontos planejados:

    1. Antes do prazo, `DEPLOY_FREEZE` passa a `true`: o `deploy-docs` só publica por execução manual.
    2. Um pull request consolidado leva a `docs-homologacao` à `main`.
    3. O commit da `main` recebe a tag `uN-AAAA-MM-DD` (por exemplo, `u2-2026-10-13`).
    4. O `deploy-docs` é executado à mão com essa tag e marca o commit da `gh-pages` com `uN-AAAA-MM-DD-pages`, porque parte das páginas é gerada na publicação a partir do quadro.
    5. Conferido o site, o `deploy-docs` fica desativado até o fim da avaliação.
    6. Encerrada a avaliação, o workflow volta e `DEPLOY_FREEZE` volta a `false`.

    Nas Unidades 3 e 4, as pontas de `api` e `web` recebem a mesma tag, e o site indica o endereço do produto (§9.2).

??? note "Commits, integração contínua e páginas geradas"

    **Commits.** `tipo(escopo): descrição`, no imperativo, em minúsculas, até 72 caracteres. Tipos: `docs`, `feat`, `fix`, `test`, `refactor`, `chore`, `ci`. Escopos da documentação: `visao`, `requisitos`, `gestao`, `entregas`, `assets`, `ci`, `nav`; do código, o módulo alterado. Um commit por fatia com propósito único, que passa no build sozinho. Cada integrante commita com a própria conta; coautoria no fim da mensagem, depois de uma linha em branco:

    ```
    feat: registra presença em atividade

    Co-authored-by: Nome Sobrenome <email-da-conta@exemplo.com>
    ```

    **Workflows da documentação**, sem filtro de caminhos no gatilho de pull request:

    - `build-check`: em pull request para `main` ou `docs-homologacao` e em push nas branches `docs/`, `chore/` e `fix/` e na `docs-homologacao`. Gera as páginas do quadro, roda `mkdocs build --strict` e guarda o artefato `site`. Não publica.
    - `guarda-de-branches`: em todo pull request, confere origem e destino e se o pull request para a `main` ou a `docs-homologacao` não traz código.
    - `verificar-push`: em push na `main` e na `docs-homologacao`, falha com commit fora de pull request integrado.
    - `deploy-docs`: em push na `main` que altere `docs/`, `mkdocs.yml`, `requirements.txt`, `.github/scripts/` ou o próprio workflow, em eventos de issue, a cada seis horas e à mão. Repete o build estrito e publica na `gh-pages`, porque situação e sprint vêm do quadro, cuja mudança não gera evento no repositório.

    As linhas da API e do front têm a própria integração contínua e o próprio deploy.

    **Antes de abrir o pull request:**

    ```bash
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    GITHUB_TOKEN=$(gh auth token) python .github/scripts/fetch_issues.py  # páginas geradas do quadro; exige gh autenticado com acesso ao projeto
    mkdocs serve          # pré-visualização em http://127.0.0.1:8000
    mkdocs build --strict # o mesmo teste que roda no CI
    ```

    **Páginas compostas no build.** [Histórico e evolução](historico.md) sai do `hooks/historico.py`, a partir das tabelas de versões (data `dd/mm/aaaa`, em ordem, quatro colunas), do índice de atas e dos planos de sprint; linha fora do padrão interrompe o build. Os selos de situação das seções 8 e 10 vêm do campo Status do quadro, gravado pelo `fetch_issues.py` e aplicado pelo `hooks/selos.py`; história retirada do escopo é issue fechada como "não planejada". As fichas da 10.1 são completadas pelo `hooks/fichas.py`, e o `hooks/conferencia.py` interrompe o build quando uma tabela das seções 8 e 10 diverge da fonte.

## Dailies

Presencial às terças e quintas, na aula ou na reunião da equipe; escrita nos demais dias úteis, no grupo *Dailys*, que é interno e não se publica, porque os relatos citam impedimentos pessoais e pessoas do Instituto. Uma daily síncrona diária não se sustentaria com cinco agendas distintas; a forma escrita entrega o que o rito precisa: **compromisso** e **visibilidade de impedimentos**.

```
[DD/MM] — Seu Nome
Feito: o que concluí desde a última daily
Fazendo: o que vou tocar hoje
Impedimento: o que está me travando, ou "nenhum"
```

- No próprio dia, até o fim do dia, mesmo sem avanço ("sem avanço").
- Impedimento é obrigatório e é o que trava o trabalho, como revisão ou merge pendente de outro integrante; quem depende de alguém o marca. Prova e outro compromisso acadêmico não são impedimento e são avisados no grupo *Geral* ([ATA-2026-11-10](atas/2026-11-10-reuniao-equipe.md), D3).
- O grupo *Dailys* é só para dailies; discussão vai para o *Geral*, e decisão vira ata.
- Impedimento declarado é resolvido ou escalado pelo Scrum Master em até 24 horas.

**Adesão por sprint**, com a meta de 80% dos dias úteis da [lição da Unidade 1](../licoes-aprendidas/unidade-1.md):

<div class="f1-barras" markdown>
<p class="f1-barra"><span class="f1-barra__nome">Sprint 1</span><span class="f1-barra__trilho"><span style="width:58%"></span><i class="f1-barra__meta"></i></span><span class="f1-barra__valor">58%</span></p>
<p class="f1-barra"><span class="f1-barra__nome">Sprint 2</span><span class="f1-barra__trilho"><span style="width:46%"></span><i class="f1-barra__meta"></i></span><span class="f1-barra__valor">46%</span></p>
<p class="f1-barra"><span class="f1-barra__nome">Sprint 3</span><span class="f1-barra__trilho"><span style="width:84%"></span><i class="f1-barra__meta"></i></span><span class="f1-barra__valor">84%</span></p>
<p class="f1-barra"><span class="f1-barra__nome">Sprint 4</span><span class="f1-barra__trilho"><span style="width:73%"></span><i class="f1-barra__meta"></i></span><span class="f1-barra__valor">73%</span></p>
</div>

<small>A linha vertical marca a meta de 80%. Na Sprint 4, os 73% são o número apresentado na Review ([ata de 05/11](atas/2026-11-05-sprint-review-retrospectiva-planning.md)); a contagem de dias e de relatos e o critério de apuração ficam para a Retrospectiva 5.</small>

??? note "Como a adesão é contada"

    Adesão é o número de participações dividido pelos dias úteis multiplicados pelo número de integrantes da sprint: seis nas Sprints 1 e 2, cinco a partir da Sprint 3. Nos dias presenciais conta a presença; nos escritos, o relato enviado no próprio dia, pela data declarada nele, a partir da exportação do canal. Feriados não contam como dia útil. Relato enviado em dia posterior conta como registro do rito, mas não como adesão.

    | Sprint | Período contado | Dias úteis | Dias presenciais | Relatos no próprio dia | Adesão |
    |---|---|---:|---:|---:|---:|
    | Sprint 1 | 08/09 a 22/09/2026 | 11 | — | 38 | 58% |
    | Sprint 2 | 23/09 a 05/10/2026 | 9 | — | 25 | 46% |
    | Sprint 3 | 07/10 a 20/10/2026 | 9 | 4 | 18 | 84% |
    | Sprint 4 | 20/10 a 05/11/2026 | — | — | — | 73% (Review) |

    Na Sprint 3, os quatro dias presenciais tiveram os cinco integrantes, e os cinco dias escritos tiveram 18 relatos no próprio dia em 25 possíveis. As Sprints 1 e 2 foram medidas só pelos relatos escritos.

## Competências

A pilha da [seção 2.4](../visao/2-solucao-proposta.md) saiu de uma matriz de competências preenchida pela equipe entre 02/09 e 03/09/2026 e consolidada no início da Sprint 1. Cada integrante declarou o nível em cada tecnologia candidata, de **0** a **3**: 0 nunca usou, 1 já viu ou estudou, 2 já usou em projeto, 3 domina e pode ensinar; marcar 0 é informação, não demérito. A consolidação conta, por tecnologia, quantas pessoas estão no nível 2 ou acima e quem está no nível 3 e pode ser mentor. Onde havia domínio, a escolha seguiu a experiência; onde não havia, o menor custo de aprendizado, com dojo antes do desenvolvimento. Os níveis individuais não são publicados.

<div class="f1-legenda">
<span class="f1-chip f1-chip--adotar">Adotar</span>
<span class="f1-chip f1-chip--experimentar">Experimentar, com dojo</span>
<span class="f1-chip f1-chip--uso">Já exercitada no código</span>
</div>

<div class="grid cards f1-pilha" markdown>

- **Linguagem · TypeScript**<br><span class="f1-chip f1-chip--adotar">Adotar</span><br>Linguagem única no cliente e no servidor.
- **Back-end · NestJS**<br><span class="f1-chip f1-chip--adotar">Adotar, com dojo</span> <span class="f1-chip f1-chip--uso">no código</span><br>Núcleo do back-end; poucas pessoas com experiência prévia.
- **Banco · PostgreSQL**<br><span class="f1-chip f1-chip--adotar">Adotar</span><br>Domínio consolidado na equipe.
- **Mapeamento objeto-relacional · Prisma**<br><span class="f1-chip f1-chip--experimentar">Experimentar, com dojo</span> <span class="f1-chip f1-chip--uso">no código</span><br>Todas as opções partiam de zero; esquema único e cliente tipado expõem menos a aprender.
- **Front-end · Next.js com React**<br><span class="f1-chip f1-chip--adotar">Adotar</span> <span class="f1-chip f1-chip--uso">no código</span><br>Mais pessoas com experiência do que em Vite; ambiente nativo da plataforma de publicação; renderização no servidor ajuda a página pública de inscrição.
- **Estilo e componentes · Tailwind CSS com shadcn/ui**<br><span class="f1-chip f1-chip--experimentar">Experimentar, com dojo</span><br>Tailwind já dominado; Material UI traria um segundo sistema de estilos.
- **Sincronização · TanStack Query**<br><span class="f1-chip f1-chip--experimentar">Experimentar, com dojo</span> <span class="f1-chip f1-chip--uso">no código</span><br>Empate na matriz, desempatado pelo suporte a conectividade instável.
- **Sem conexão · Service Worker com Workbox e Dexie**<br><span class="f1-chip f1-chip--experimentar">Experimentar, com dojo</span><br>Dois mentores em Service Worker. Dexie entra com o registro sem conexão (HU-09b), depois da presença on-line (HU-09a).
- **PDF · Puppeteer, no servidor**<br><span class="f1-chip f1-chip--adotar">Adotar</span><br>Mais experiência do que em pdfmake; modelo em HTML editável por qualquer pessoa.
- **Testes · Vitest, com Supertest e Playwright**<br><span class="f1-chip f1-chip--adotar">Adotar</span> <span class="f1-chip f1-chip--uso">no código</span><br>A matriz indicou Jest; o Vitest o substituiu pela depreciação do Jest na versão atual do Next.js (ata de 20/10/2026). Supertest na API, Playwright nos testes visuais.
- **Diagramas · Figma**<br><span class="f1-chip f1-chip--adotar">Adotar</span><br>Domínio na equipe, com mentor.

</div>

**O que a matriz revelou.** Domínio consolidado em TypeScript, React, PostgreSQL, controle de versão, contêineres e integração contínua; lacunas no mapeamento objeto-relacional e no armazenamento local sem conexão; e conhecimento concentrado em poucas pessoas, o que orienta o trabalho em duplas desde a Sprint 1 e a distribuição de frentes por afinidade técnica. Até 26/10/2026, 23 dos 29 pull requests de código integrados vieram de um mesmo integrante. O aprofundamento segue pela dupla dona de cada história, a partir dos padrões já integrados (módulo `instruments` na API e telas de lista no front), com revisão por outra dupla.

<span id="dojos-de-nivelamento"></span>**Dojos de nivelamento.** Dois, gravados no Google Meet em 10/09/2026: o D1, de processo (critérios INVEST, formato das histórias e critérios de aceitação, aplicados às histórias reais do backlog), e o D2, técnico (fatia vertical em NestJS e Prisma e demonstrações de Next.js, Dexie, TanStack Query e shadcn/ui). Os dois estão concluídos, com a entrega de cada integrante encerrada em 19/10/2026.

??? note "Referências"

    BECK, K.; ANDRES, C. **Extreme Programming Explained: Embrace Change.** 2. ed. Boston: Addison-Wesley, 2004.

    CONVENTIONAL COMMITS. **Conventional Commits 1.0.0.** Disponível em: https://www.conventionalcommits.org/en/v1.0.0/. Acesso em: 5 set. 2026.

    DORA. **Capabilities: trunk-based development.** Disponível em: https://dora.dev/capabilities/trunk-based-development/. Acesso em: 25 set. 2026.

    DRIESSEN, V. **A successful Git branching model.** Nota de reflexão de 5 mar. 2020. Disponível em: https://nvie.com/posts/a-successful-git-branching-model/. Acesso em: 25 set. 2026.

    FOWLER, M. **Patterns for Managing Source Code Branches.** 28 maio 2020. Disponível em: https://martinfowler.com/articles/branching-patterns.html. Acesso em: 25 set. 2026.

    GIT. **git-switch: --orphan.** Disponível em: https://git-scm.com/docs/git-switch. Acesso em: 5 out. 2026.

    GITHUB. **About merge methods on GitHub.** Disponível em: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github. Acesso em: 25 set. 2026.

    GITHUB. **Creating a commit with multiple authors.** Disponível em: https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors. Acesso em: 25 set. 2026.

    GITHUB. **Linking a pull request to an issue.** Disponível em: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue. Acesso em: 5 out. 2026.

    GITHUB. **Events that trigger workflows.** Disponível em: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows. Acesso em: 25 set. 2026.

    GITHUB. **GitHub flow.** Disponível em: https://docs.github.com/en/get-started/using-github/github-flow. Acesso em: 25 set. 2026.

    GITHUB. **Workflow syntax for GitHub Actions.** Disponível em: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax. Acesso em: 25 set. 2026.

    HAMMANT, P. **Trunk Based Development.** Disponível em: https://trunkbaseddevelopment.com/. Acesso em: 25 set. 2026.

    MARSICANO, G. **Requisitos de Software: Comunicação é tudo!** v1.1 draft. Brasília: FCTE/UnB, 2026.

    SCHWABER, K.; SUTHERLAND, J. **The Scrum Guide.** 2020. Disponível em: https://scrumguides.org. Acesso em: 2 set. 2026.

    SQUIDFUNK. **Material for MkDocs: Publishing your site.** Disponível em: https://squidfunk.github.io/mkdocs-material/publishing-your-site/. Acesso em: 5 set. 2026.

    UNIVERSIDADE DE BRASÍLIA. Faculdade de Ciências e Tecnologias em Engenharia. **Plano de Ensino: FGA0313 Requisitos de Software, Turma 02, 2026.2.** Brasília: FCTE/UnB, 2026.
