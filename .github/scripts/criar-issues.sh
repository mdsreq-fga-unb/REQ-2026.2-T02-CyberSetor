#!/usr/bin/env bash
#
# Cria no GitHub as issues rascunhadas em .github/issues-sprint-1/.
#
# Uso:
#   DRY_RUN=1 ./.github/scripts/criar-issues.sh   # mostra o que faria
#   ./.github/scripts/criar-issues.sh             # cria de fato
#
# Requer o GitHub CLI autenticado e as labels já criadas
# (rode antes o criar-labels.sh: label inexistente faz a criação falhar).
#
# O script não é idempotente: rodar duas vezes cria issues duplicadas.
# Confira com `gh issue list` antes de repetir.

set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../issues-sprint-1" && pwd)"

ler_campo() {
  # extrai um campo do cabeçalho YAML, que vai da primeira até a segunda linha '---'
  sed -n '2,/^---$/p' "$1" | sed -n "s/^$2: //p" | head -1
}

corpo_da_issue() {
  # tudo depois da segunda linha '---'
  awk 'BEGIN{c=0} /^---$/{c++; next} c>=2' "$1"
}

total=0
for arquivo in "$DIR"/*.md; do
  [[ "$(basename "$arquivo")" == "README.md" ]] && continue

  titulo="$(ler_campo "$arquivo" title)"
  assignees="$(ler_campo "$arquivo" assignees)"
  labels="$(ler_campo "$arquivo" labels)"

  if [[ -z "$titulo" ]]; then
    echo "  aviso: $(basename "$arquivo") sem título, ignorado" >&2
    continue
  fi

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "  [dry-run] $titulo"
    echo "            responsáveis: ${assignees:-nenhum}"
    echo "            labels:       ${labels:-nenhuma}"
  else
    corpo_da_issue "$arquivo" | gh issue create \
      --title "$titulo" \
      --body-file - \
      ${assignees:+--assignee "$assignees"} \
      ${labels:+--label "$labels"}
  fi
  total=$((total + 1))
done

echo
echo "$total issues processadas."
