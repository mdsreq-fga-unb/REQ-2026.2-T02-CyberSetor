#!/usr/bin/env bash
#
# Monta a aplicação Next.js que executa os exemplos de web/src/.
#
# O projeto é gerado em web/demo/, que o .gitignore desta branch ignora:
# nada do que este script baixa entra em commit. Para refazer do zero,
# apague web/demo/ e rode de novo.
#
# Exige internet (baixa Next.js, shadcn/ui e dependências) e Node 24.21.0.
#
# Uso:
#   cd web && ./montar-demo.sh

set -euo pipefail

AQUI="$(cd "$(dirname "$0")" && pwd)"
DESTINO="$AQUI/demo"
NODE_ALVO="24.21.0"

erro() { echo "ERRO: $*" >&2; exit 1; }

[ ! -e "$DESTINO" ] || erro "$DESTINO já existe. Apague-o antes de recriar: rm -rf '$DESTINO'"

if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm use "$NODE_ALVO" >/dev/null 2>&1 || erro "Node $NODE_ALVO não instalado. Rode: nvm install $NODE_ALVO"
fi

[ "$(node --version)" = "v$NODE_ALVO" ] || \
  erro "este demo exige Node v$NODE_ALVO, e o ativo é $(node --version)"

echo "1/4 · criando o projeto Next.js"
npx --yes create-next-app@16.3.4 "$DESTINO" \
  --ts --tailwind --eslint --app --empty --use-npm \
  --import-alias '@/*' --disable-git --yes

echo "2/4 · instalando TanStack Query, Dexie e shadcn/ui"
( cd "$DESTINO" && npm install --save-exact \
  @tanstack/react-query@5.102.8 dexie@4.4.6 dexie-react-hooks@4.4.0 )
( cd "$DESTINO" && npx --yes shadcn@4.21.0 init --defaults --no-monorepo )
( cd "$DESTINO" && npx --yes shadcn@4.21.0 add button input --yes )

echo "3/4 · copiando os exemplos de web/src/"
mkdir -p "$DESTINO/app/requisitos-dojo" "$DESTINO/hooks"
cp "$AQUI/src/app/layout.tsx"                  "$DESTINO/app/layout.tsx"
cp "$AQUI/src/app/providers.tsx"               "$DESTINO/app/providers.tsx"
cp "$AQUI/src/app/requisitos-dojo/page.tsx"    "$DESTINO/app/requisitos-dojo/page.tsx"
cp "$AQUI/src/components/outbox-dojo.tsx"      "$DESTINO/components/outbox-dojo.tsx"
cp "$AQUI/src/hooks/use-requisitos-dojo.ts"    "$DESTINO/hooks/use-requisitos-dojo.ts"
cp "$AQUI/src/lib/api.ts"                      "$DESTINO/lib/api.ts"
cp "$AQUI/src/lib/db.ts"                       "$DESTINO/lib/db.ts"
cp "$AQUI/src/.env.local.example"              "$DESTINO/.env.local"

echo "4/4 · conferindo lint e build"
( cd "$DESTINO" && npm run lint && npm run build )

cat <<FIM

Pronto: $DESTINO

Para usar, com a API já rodando em :3001 (veja o README da branch):

  cd "$DESTINO"
  npm run dev

Depois abra http://localhost:3000/requisitos-dojo no navegador.

A pasta demo/ é ignorada pelo Git. Nada daqui entra em commit.
FIM
