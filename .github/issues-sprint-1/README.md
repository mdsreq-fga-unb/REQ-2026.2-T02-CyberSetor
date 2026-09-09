# Rascunhos de issues da Sprint 1

Cada arquivo `.md` desta pasta é o rascunho de uma issue da Sprint 1. O
conteúdo vem do plano da Sprint 1, publicado em `docs/gestao/sprints/sprint-1.md`,
e os identificadores são os mesmos: preservá-los é o que sustenta a matriz de
rastreabilidade do problema até o requisito.

## Formato

Cada arquivo tem um cabeçalho YAML com título, responsável e labels, seguido do
corpo da issue em Markdown. O script `criar-issues.sh` lê esses arquivos e cria
as issues no GitHub.

## Como aplicar

```bash
# conferir o que seria criado, sem tocar no GitHub
DRY_RUN=1 ./.github/scripts/criar-issues.sh

# criar de fato
./.github/scripts/criar-issues.sh
```

Rode antes o `criar-labels.sh`: uma issue com label inexistente falha na criação.

## Depois de criadas

As issues entram no GitHub Projects do repositório. A classificação MoSCoW de
cada uma é confirmada no refinamento de 15/09 e registrada tanto na label quanto
no campo correspondente do quadro.
