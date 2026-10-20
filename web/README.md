# web

Front do sistema de gestão do ciclo de projetos financiados do Instituto Cultural e Social No Setor. Next.js 16 (App Router) com TypeScript, Tailwind CSS 4, shadcn/ui e TanStack Query. Os requisitos estão no [site do projeto](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/).

## Pré-requisitos

| Ferramenta | Versão                      | Como                                                                                                      |
| ---------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Node.js    | a do `.nvmrc`               | `nvm use` (ou `fnm use`)                                                                                  |
| pnpm       | a do campo `packageManager` | `corepack enable` (baixa a versão fixada na primeira execução) ou `npm install -g pnpm@<versão do campo>` |
| API        | linha `api-develop`         | rodando em `http://localhost:3001`, com `CORS_ORIGIN=http://localhost:3000` no `.env` da API              |

## Comandos oficiais

Os mesmos comandos rodam na máquina de cada integrante e na integração contínua da linha (`ci-web`).

| Chave       | Comando          | Nota                                                                 |
| ----------- | ---------------- | -------------------------------------------------------------------- |
| `dev`       | `pnpm dev`       | front com recarga automática em `http://localhost:3000`              |
| `fmt`       | `pnpm fmt`       | formata com Prettier (`fmt:check` só confere)                        |
| `lint`      | `pnpm lint`      | ESLint com as regras do Next.js                                      |
| `typecheck` | `pnpm typecheck` | gera os tipos de rota (`next typegen`) e roda `tsc --noEmit`         |
| `test`      | `pnpm test`      | testes de componente (Vitest + Testing Library), `src/**/*.test.tsx` |
| `build`     | `pnpm build`     | build de produção                                                    |
| `verify`    | `pnpm verify`    | tudo acima, na ordem; é o que se roda antes de abrir pull request    |

## Execução local

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

A página inicial mostra se a API e o banco respondem. Use o mesmo nome de host no front e na API (`localhost` nos dois): `127.0.0.1` de um lado e `localhost` do outro são sites distintos, e o cookie de sessão deixa de ser enviado.

| Variável              | Padrão                     | Uso                                                       |
| --------------------- | -------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/v1` | endereço da API; vai para o navegador, nunca leva segredo |

## Convenções

- **Estrutura**: páginas em `src/app/`, componentes em `src/components/` (os do shadcn/ui em `src/components/ui/`, adicionados com `pnpm dlx shadcn@<versão> add <componente>`), utilitários em `src/lib/`.
- **API**: chamadas só por `src/lib/api.ts`. O token de acesso vai em `Authorization: Bearer` e fica só em memória; renovação e saída usam o cookie da API (`withSessionCookie`, que envia `credentials: 'include'` e o cabeçalho `X-CSRF`).
- **Dados do servidor** com TanStack Query (`useQuery`/`useMutation`); nada de `fetch` solto em componente.
- **Banco local** (`src/lib/local-db.ts`, Dexie) existe sem tabelas; a fila sem conexão (RF17, RF18) está fora do MVP.
- **Celular primeiro**: toda tela funciona em 360 px sem rolagem horizontal (RNF15).
- **Idioma**: nomes técnicos em inglês; textos da interface em português.
- **Testes** provam o que a pessoa vê (papéis e textos acessíveis), nunca a forma do código.
- **Commits** no padrão Conventional Commits em português, um propósito por commit; pull request revisado por integrante de outra dupla.
