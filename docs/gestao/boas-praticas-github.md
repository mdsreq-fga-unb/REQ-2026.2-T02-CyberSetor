# Boas práticas no GitHub

| Data | Versão | Descrição | Autor |
| :---: | :---: | :--- | :--- |
| 06/09/2026 | 1.0 | Branches curtas a partir da `main`, Conventional Commits, pull request revisado e integração contínua | Vinicius Vieira |
| 09/09/2026 | 1.1 | Verificação e publicação do site separadas por workflow | Vinicius Vieira |
| 05/10/2026 | 2.0 | Branches por componente: documentação na `main` com homologação, API e web em linhas próprias; congelamento e marcação das entregas; controles da equipe na ausência de proteção de branch | Vinicius Vieira |
| 07/10/2026 | 2.1 | Título de commit sem acentos; *rebase* para conflitos, sem *squash*; prazo de 24 horas para revisão de pull request | Maria Eduarda Marques |

Acordo de trabalho da equipe para este repositório. O objetivo é que o histórico de commits e de pull requests seja a evidência do processo, e que ninguém dependa de memória para saber como contribuir.

## Onde as coisas vivem

A entrega da disciplina é este site, publicado pelo GitHub Pages a partir da pasta `docs/` da `main`. Link para artefato externo não é aceito como entrega, e imagens ficam versionadas em `docs/assets/`. O código do produto fica neste mesmo repositório, em linhas próprias da API e do front.

## Branches

| Branch | Conteúdo | Recebe pull request de | Publica |
|---|---|---|---|
| `main` (padrão) | Documentação, configuração do repositório e README | `docs-homologacao`, `fix/<assunto>`, `chore/<assunto>` | Site no GitHub Pages |
| `docs-homologacao` | Documentação revisada, ainda não publicada | `docs/<assunto>`, `main` | Nada |
| `api-develop` | API em integração | `feat/api/HU-xx-<assunto>`, `test/api/<assunto>`, `refactor/api/<assunto>`, `chore/api/<assunto>`, `api` | Homologação da API |
| `api` | API em produção | `api-develop`, `fix/api-<assunto>` | Produção da API |
| `web-develop` | Front em integração | `feat/web/HU-xx-<assunto>`, `test/web/<assunto>`, `refactor/web/<assunto>`, `chore/web/<assunto>`, `web` | Prévia do front |
| `web` | Front em produção | `web-develop`, `fix/web-<assunto>` | Produção do front |

As linhas da API e do front não têm história comum com a `main` nem entre si: só contêm o próprio código e a própria configuração de integração contínua. Por isso não existe pull request de código para a documentação, da documentação para o código ou entre API e front. As seis branches da tabela não se apagam; as de trabalho são curtas e apagadas depois do merge. Não há branch por ambiente além das de produção da tabela: endereços e segredos de cada ambiente ficam na configuração da hospedagem.

O repositório não tem proteção de branch, que depende de permissão de administrador da organização. O acordo da equipe cobre essa ausência, com quatro controles ao seu alcance:

- **Nenhum push direto** nas seis branches da tabela; todo conteúdo entra pelo botão de merge do pull request, depois da aprovação.
- **`guarda-de-branches`:** confere, em todo pull request, se a combinação de origem e destino está na tabela. Combinação fora dela fica com a verificação em vermelho e não é integrada.
- **`verificar-push`:** falha quando chega à `main` ou à `docs-homologacao` um commit que não pertence a pull request integrado. A falha é o sinal para abrir um pull request que corrija ou confirme a mudança.
- **Configuração do repositório:** só o método *merge commit* habilitado e branch de trabalho apagada automaticamente depois do merge.

### Documentação

1. Partir da homologação atualizada: `git switch docs-homologacao && git pull && git switch -c docs/<assunto>`.
2. Commitar em fatias, com `mkdocs build --strict` passando antes do push.
3. Abrir o pull request com base `docs-homologacao` e `Refs #N` no corpo.
4. Aguardar a aprovação de um integrante de outra dupla, que confere o site compilado: pelo artefato `site` do `build-check` ou com `mkdocs serve` na própria máquina.
5. Fazer o merge pelo pull request e apagar a branch.

### Código

A branch de trabalho sai da branch de integração do componente (`api-develop` ou `web-develop`) e volta para ela em pull request, com a verificação de código aprovada e a revisão de um integrante de outra dupla. O nome leva o componente (`feat/api/HU-01-cadastro-de-meta`) e a história. O ciclo é de dias, não de semanas: história grande se divide em mais de um pull request. A ida para produção é um pull request de `api-develop` para `api` (ou de `web-develop` para `web`), revisado como os demais.

### Correções

| Onde está o erro | Branch | Pull request para | Em seguida |
|---|---|---|---|
| Site publicado | `fix/<assunto>`, a partir da `main` | `main` | Pull request `main` → `docs-homologacao` |
| API em produção | `fix/api-<assunto>`, a partir de `api` | `api` | Pull request `api` → `api-develop` |
| Front em produção | `fix/web-<assunto>`, a partir de `web` | `web` | Pull request `web` → `web-develop` |

O passo seguinte evita que a correção se perca na próxima publicação. Mudança de configuração do repositório (`chore/<assunto>` na `main`) também é levada à `docs-homologacao` do mesmo jeito.

### Issues

O GitHub só fecha issue por palavra-chave em pull request para a branch padrão. Pull requests para `docs-homologacao` e para as linhas de código usam `Refs #N`; a issue é fechada ao ir para Done no quadro do projeto. O pull request consolidado `docs-homologacao` → `main` pode listar `Closes #N` das issues de documentação que entrega. Issue aberta pelo professor não é fechada pela equipe.

## Pontos de publicação e congelamento

Pelo Plano de Ensino (§9.1), a entrega deve estar no GitHub Pages até o início da aula de apresentações, e alteração no site depois desse horário torna a entrega atrasada, com desconto de 20% por dia. Por isso a documentação vai ao ar em pontos de publicação planejados:

1. Antes de cada prazo, a variável de repositório `DEPLOY_FREEZE` passa a `true`. Congelado, o `deploy-docs` só publica por execução manual; push na `main`, eventos de issue e a agenda são ignorados, com aviso no log.
2. Um pull request consolidado leva a `docs-homologacao` para a `main`, revisado como qualquer outro e integrado por *merge commit*.
3. O commit da `main` recebe a tag da entrega no formato `uN-AAAA-MM-DD` (por exemplo, `u2-2026-10-13`).
4. O `deploy-docs` é executado à mão com essa tag no campo `versao`. Ele publica exatamente a versão marcada e marca o commit publicado na `gh-pages` com a tag `uN-AAAA-MM-DD-pages`, porque parte das páginas é gerada no momento da publicação a partir do quadro.
5. Depois de conferir o site no ar, o `deploy-docs` é desativado até o fim da avaliação; nenhuma publicação acontece nesse período.
6. Encerrada a avaliação, o workflow é reativado e `DEPLOY_FREEZE` volta a `false`.

Nas entregas com produto (Unidades 3 e 4), as pontas de `api` e `web` recebem a mesma tag da entrega, e o site indica o endereço do produto, como pede o §9.2.

## Mensagens de commit

Padrão Conventional Commits 1.0.0: `tipo(escopo): descrição`, com tipo obrigatório, escopo opcional e descrição no imperativo, em minúsculas, com até 72 caracteres e sem acentos no título.

```
docs(visao): migra secao 2 solucao proposta
chore(ci): adiciona workflow de deploy do MkDocs
fix(nav): corrige caminho da pagina de atas
```

Tipos usados: `docs`, `feat`, `fix`, `test`, `refactor`, `chore`, `ci`. Escopos da documentação: `visao`, `requisitos`, `gestao`, `entregas`, `assets`, `ci`, `nav`; do código, o módulo alterado (por exemplo, `feat(metas): …`).

Um commit por fatia com propósito único: uma seção do documento por commit, nunca "atualiza docs". Todo commit passa no build sozinho.

Coautoria vai no fim da mensagem, separada do título por uma linha em branco:

```
feat: registra presença em atividade

Co-authored-by: Nome Sobrenome <email-da-conta@exemplo.com>
```

## Pull requests

Toda mudança entra por pull request; edição feita pela interface web direto na `main` é push sem revisão e não é usada. O corpo segue o modelo do repositório: o que mudou, qual seção do template é afetada, confirmação de que o build passou e quem revisa.

A revisão é registrada no próprio pull request: um integrante de outra dupla aprova antes do merge, e o autor não faz merge sem essa aprovação. O merge é feito pelo botão do pull request, com o método *merge commit*, que preserva os commits de cada pessoa e as linhas de coautoria. Merge local seguido de push não deixa o registro da revisão. *Squash* não é usado. Conflito com a branch de destino se resolve com *rebase* da branch de trabalho sobre ela, antes do merge.

Quem é pedido como revisor tem até 24 horas para revisar. Passado o prazo, o autor avisa no grupo da equipe, e a revisão pode ser repassada a outro integrante de outra dupla.

## Integração contínua

Workflows da linha da documentação, cada um com um alvo declarado:

| Workflow | Quando roda | O que faz |
|---|---|---|
| `build-check` | Pull request para `main` ou `docs-homologacao`; push em `docs/`, `chore/`, `fix/` e `docs-homologacao` | Gera as páginas de acompanhamento a partir das issues e do quadro, confere se foram geradas, executa `mkdocs build --strict` e guarda o site compilado como artefato `site` para a revisão. Não publica |
| `guarda-de-branches` | Todo pull request | Confere a combinação de origem e destino com a tabela de branches e se o pull request para a `main` ou a `docs-homologacao` não traz código |
| `verificar-push` | Push na `main` e na `docs-homologacao` | Falha quando o commit recebido não pertence a pull request integrado |
| `deploy-docs` | Push na `main` que altere `docs/`, `mkdocs.yml`, `requirements.txt`, `.github/scripts/` ou o próprio workflow; eventos de issue; a cada seis horas; execução manual com a versão a publicar | Gera as páginas de acompanhamento, repete o build estrito e publica o site na branch `gh-pages`. Com `DEPLOY_FREEZE` igual a `true`, só a execução manual publica |

Nenhum deles tem filtro de caminhos no gatilho de pull request, para poderem ser exigidos no merge. Situação e sprint das páginas de acompanhamento vêm do quadro do projeto, cuja mudança não gera evento no repositório; por isso o `deploy-docs` também roda em eventos de issue e na agenda. As linhas da API e do front têm a própria integração contínua e o próprio deploy, sem efeito sobre o site.

## Antes de abrir o PR

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve          # pré-visualização em http://127.0.0.1:8000
mkdocs build --strict # o mesmo teste que roda no CI
```

## Contribuição individual

Cada integrante commita com a própria conta, com `user.email` ligado a ela, as seções que escreveu e o código que implementou. Assim o histórico mostra quem fez o quê dentro da equipe.

## Referências

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

SQUIDFUNK. **Material for MkDocs: Publishing your site.** Disponível em: https://squidfunk.github.io/mkdocs-material/publishing-your-site/. Acesso em: 5 set. 2026.

UNIVERSIDADE DE BRASÍLIA. Faculdade de Ciências e Tecnologias em Engenharia. **Plano de Ensino: FGA0313 Requisitos de Software, Turma 02, 2026.2.** Brasília: FCTE/UnB, 2026.
