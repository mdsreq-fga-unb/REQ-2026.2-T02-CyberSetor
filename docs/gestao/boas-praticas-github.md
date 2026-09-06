# Boas práticas no GitHub

Acordo de trabalho da equipe para este repositório. O objetivo é que o histórico de commits e de pull requests seja a evidência do processo, e que ninguém dependa de memória para saber como contribuir.

## Onde as coisas vivem

A entrega da disciplina é este site, publicado pelo GitHub Pages a partir da pasta `docs/`. O Google Docs é rascunho. Link para artefato externo não é aceito como entrega, e imagens ficam versionadas em `docs/assets/`.

## Branches

A `main` recebe o deploy. O trabalho acontece em branches curtas, nomeadas pelo tipo de mudança:

| Prefixo | Uso | Exemplo |
|---|---|---|
| `docs/` | Conteúdo | `docs/secao-2-solucao-proposta` |
| `chore/` | Configuração e workflow | `chore/setup-mkdocs` |
| `fix/` | Correção pontual | `fix/link-atas` |

Não há branch `develop`. O ciclo é curto e o repositório é de documentação.

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

Dois workflows do GitHub Actions:

- **build-check**, em todo pull request: executa `mkdocs build --strict` e reprova o PR se houver link quebrado, imagem ausente ou página fora do menu.
- **deploy-docs**, em todo push na `main`: constrói o site e publica na branch `gh-pages`.

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
