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

## Estrutura

```
src/
  app/                  rotas finas: metadata + view; URLs em português
    (auth)/             leiaute centrado: /entrar (guarda de visitante), /trocar-senha
    (painel)/           guarda de sessão + leiaute do painel
  auth/                 session.ts (sessão), types.ts, guards/, hooks/, views/, profiles.ts
  layouts/dashboard/    menu lateral por perfil, cabeçalho e Sair
  sections/<domínio>/   telas de cada domínio (views/ + componentes)
  components/ui/        componentes do shadcn/ui, adicionados pelo CLI local (pnpm exec shadcn add)
  components/           componentes compartilhados
  lib/                  api.ts (cliente HTTP), local-db.ts, utils.ts
  queries/<domínio>.ts  hooks do TanStack Query
  types/<domínio>.ts    tipos do contrato da API
  routes/paths.ts       todos os caminhos num lugar só
```

Testes ficam ao lado do arquivo testado (`*.test.ts(x)`).

## Sessão

- O token de acesso fica só em memória (`src/auth/session.ts`); o cookie de renovação é da API, `HttpOnly`, e o front nunca o lê.
- Chamada autenticada sempre por `authorizedRequest`: ela envia o `Authorization: Bearer`, renova uma vez depois de um 401 e repete a chamada.
- A renovação é única dentro da aba (promessa compartilhada) e entre abas (`navigator.locks`); duas renovações em paralelo fariam a API revogar a sessão por reuso do cookie.
- `login`, `refresh` e `logout` enviam `credentials: 'include'` e o cabeçalho `X-CSRF`.
- Recarregar a página recupera a sessão pelo cookie, na primeira montagem de uma guarda (`useSession`).
- As guardas (`AuthGuard`, `GuestGuard`) são experiência de uso; quem protege os dados é a API. **Páginas do `(painel)` não buscam dado sensível em Server Component:** o conteúdo do painel vai no payload do servidor mesmo para quem não tem sessão, e o dado vem do cliente por `authorizedRequest`.
- Front e API precisam estar no mesmo site: o cookie é `SameSite=Strict`.

## Convenções

- **API**: chamadas só por `src/lib/api.ts` e, quando autenticadas, por `authorizedRequest`.
- **Dados do servidor** com TanStack Query (`useQuery`/`useMutation`); nada de `fetch` solto em componente.
- **Formulários** com Field do shadcn/ui, React Hook Form e zod, como no guia oficial; mensagens de validação em português e erros ligados ao campo por `aria-describedby`.
- **Tema** com a paleta do Instituto em `src/app/globals.css`; `theme-contrast.test.ts` exige contraste AA nos dois temas e nos estados translúcidos dos botões.
- **Alvos de toque** de 48 px no botão padrão, no campo e no menu (RNF15); as variantes menores (`xs`, `sm`) são só para uso denso em desktop.
- **Banco local** (`src/lib/local-db.ts`, Dexie) existe sem tabelas; a fila sem conexão (RF17, RF18) está fora do MVP.
- **Celular primeiro**: toda tela funciona em 360 px sem rolagem horizontal (RNF15).
- **Idioma**: nomes técnicos em inglês; textos da interface em português.
- **Testes** provam o que a pessoa vê (papéis e textos acessíveis), nunca a forma do código.
- **Commits** no padrão Conventional Commits em português, um propósito por commit; pull request revisado por integrante de outra dupla.
