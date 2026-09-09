# Boas práticas no GitHub

Acordo de trabalho da equipe para este repositório. O objetivo é que o histórico de commits e de pull requests seja a evidência do processo, e que ninguém dependa de memória para saber como contribuir.

## Onde as coisas vivem

A entrega da disciplina é este site, publicado pelo GitHub Pages a partir da pasta `docs/`. O Google Docs é rascunho. Link para artefato externo não é aceito como entrega, e imagens ficam versionadas em `docs/assets/`.

## Branches

A `main` é a branch publicada: todo commit nela vai ao ar no site. O trabalho acontece em branches curtas, nomeadas pelo tipo de mudança:

| Prefixo | Uso | Exemplo |
|---|---|---|
| `docs/` | Conteúdo | `docs/secao-2-solucao-proposta` |
| `chore/` | Configuração e workflow | `chore/setup-mkdocs` |
| `fix/` | Correção pontual | `fix/link-atas` |

Não há branch `develop`. O ciclo é curto e o repositório é de documentação.

### A branch `docs-homologacao`

Há uma exceção com finalidade própria. As entregas da disciplina são avaliadas na data em que foram feitas, e alterar uma seção já entregue pode ser lido como entrega fora do prazo. Ao mesmo tempo, o projeto continua produzindo conteúdo entre uma unidade e outra.

A branch `docs-homologacao` existe para esse intervalo. Ela acumula alterações que já estão prontas, revisadas e com build passando, mas que ainda não podem ir ao ar por critério de avaliação. Quando a autorização vem, ela é integrada à `main` de uma vez.

O que caracteriza a branch:

- recebe pull requests como qualquer outra, com a mesma verificação de build;
- **nunca dispara publicação**: o workflow de deploy roda apenas na `main`;
- é integrada à `main` por decisão explícita, não por rotina.

O que não vai para ela: correção de erro que já está publicado. Erro publicado se corrige na `main`, porque deixá-lo no ar é pior do que a alteração.

## Mensagens de commit

Padrão Conventional Commits 1.0.0: `tipo(escopo): descrição`, com tipo obrigatório, escopo opcional e descrição no imperativo, em minúsculas, com até 72 caracteres.

```
docs(visao): migra seção 2 solução proposta
chore(ci): adiciona workflow de deploy do MkDocs
fix(nav): corrige caminho da página de atas
```

Tipos usados: `docs`, `chore`, `ci`, `fix`. Escopos: `visao`, `requisitos`, `gestao`, `entregas`, `assets`, `ci`, `nav`.

Um commit por fatia com propósito único: uma seção do documento por commit, nunca "atualiza docs". Todo commit passa no build sozinho.

## Pull requests

Toda mudança de conteúdo entra por pull request, revisado por alguém de outra dupla. O corpo segue o modelo do repositório: o que mudou, qual seção do template é afetada, confirmação de que o build passou e quem revisa.

## Integração contínua

Dois workflows do GitHub Actions, cada um com um alvo declarado:

| Workflow | Quando roda | O que faz |
|---|---|---|
| `build-check` | Pull request para `main` ou `docs-homologacao`, e push nas branches `docs/`, `chore/`, `fix/` e `docs-homologacao` | Executa `mkdocs build --strict` e reprova se houver link quebrado ou referência inválida no menu. Registra no log qual branch está sendo verificada e para onde vai |
| `deploy-docs` | Push na `main` | Verifica o build e publica o site na branch `gh-pages` |

A separação é intencional: o `build-check` roda também em push nas branches de trabalho, para que o erro apareça antes da abertura do pull request; e o `deploy-docs` fica restrito à `main`, de modo que nada em homologação chegue ao ar por engano.

## Antes de abrir o PR

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve          # pré-visualização em http://127.0.0.1:8000
mkdocs build --strict # o mesmo teste que roda no CI
```

## Contribuição individual

Cada integrante commita, com a própria conta, as seções que migrou ou escreveu. A disciplina avalia contribuição individual, e o histórico do repositório é a evidência.

## Referências

CONVENTIONAL COMMITS. **Conventional Commits 1.0.0.** Disponível em: https://www.conventionalcommits.org/en/v1.0.0/. Acesso em: 5 set. 2026.

SQUIDFUNK. **Material for MkDocs: Publishing your site.** Disponível em: https://squidfunk.github.io/mkdocs-material/publishing-your-site/. Acesso em: 5 set. 2026.
