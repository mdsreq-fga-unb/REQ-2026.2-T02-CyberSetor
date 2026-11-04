#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "uso: scripts/adopt-visual-references.sh <id da execução do ci-web>" >&2
  exit 1
fi

RUN=$1
WEB=$(cd "$(dirname "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

gh run download "$RUN" --name diferencas-visuais --dir "$TMP"

count=0
while IFS= read -r capture; do
  rel=${capture#"$TMP"/}
  test_dir=$(dirname "$rel")
  dest="$WEB/$(dirname "$test_dir")/__screenshots__/$(basename "$test_dir")"
  name=$(basename "$capture" | sed -E 's/-(reference|actual)-chromium-linux\.png$/-chromium.png/')
  mkdir -p "$dest"
  cp "$capture" "$dest/$name"
  echo "${dest#"$WEB"/}/$name"
  count=$((count + 1))
done < <(find "$TMP" \( -name '*-reference-chromium-linux.png' -o -name '*-actual-chromium-linux.png' \) | sort)

if [ "$count" -eq 0 ]; then
  echo "nenhuma captura de referência no artefato da execução $RUN" >&2
  exit 1
fi
echo "$count referências copiadas; confira as imagens antes de commitar."
