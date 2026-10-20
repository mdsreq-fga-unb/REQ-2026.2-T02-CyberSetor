# api

API do sistema de gestão do ciclo de projetos financiados do Instituto Cultural e Social No Setor. NestJS 12 (ESM) com TypeScript estrito; Prisma 7 sobre PostgreSQL. Os requisitos estão no [site do projeto](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/).

## Pré-requisitos

| Ferramenta | Versão                      | Como                                                                                                      |
| ---------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Node.js    | a do `.nvmrc`               | `nvm use` (ou `fnm use`)                                                                                  |
| pnpm       | a do campo `packageManager` | `corepack enable` (baixa a versão fixada na primeira execução) ou `npm install -g pnpm@<versão do campo>` |
| Docker     | qualquer recente            | só para o PostgreSQL e o Redis locais (`compose.yaml`)                                                    |

## Comandos oficiais

Os mesmos comandos rodam na máquina de cada integrante e na integração contínua da linha (`ci-api`).

| Chave       | Comando          | Nota                                                                                                          |
| ----------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `dev`       | `pnpm dev`       | API com recarga automática na porta `PORT`                                                                    |
| `fmt`       | `pnpm fmt`       | formata com Prettier (`fmt:check` só confere)                                                                 |
| `lint`      | `pnpm lint`      | ESLint com regras tipadas                                                                                     |
| `typecheck` | `pnpm typecheck` | `tsc --noEmit`                                                                                                |
| `test`      | `pnpm test`      | testes unitários (Vitest), `src/**/*.spec.ts`                                                                 |
| `test:e2e`  | `pnpm test:e2e`  | ponta a ponta contra PostgreSQL real (Vitest + Supertest), `test/**/*.e2e-spec.ts`; lê `.env.test` se existir |
| `build`     | `pnpm build`     | gera o cliente Prisma e compila para `dist/`                                                                  |
| `verify`    | `pnpm verify`    | tudo acima, na ordem; é o que se roda antes de abrir pull request                                             |

### Banco de dados

| Chave               | Comando                                   | Quando                                                                                                        |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `db:up` / `db:down` | `pnpm db:up`                              | sobe ou derruba PostgreSQL e Redis locais pelo `compose.yaml`                                                 |
| `db:generate`       | `pnpm db:generate`                        | regenera o cliente em `src/generated/prisma` (gitignored); roda sozinho no `pnpm install`                     |
| `db:migrate`        | `pnpm db:migrate --name <mudanca>`        | gera **e aplica** a migração a partir do schema; é o único jeito de criar migração; depois `pnpm db:generate` |
| `db:migrate:create` | `pnpm db:migrate:create --name <mudanca>` | gera o SQL sem aplicar, para revisar antes; depois `pnpm db:migrate` aplica                                   |
| `db:deploy`         | `pnpm db:deploy`                          | aplica as migrações pendentes sem gerar nada; é o que o CI e a homologação executam                           |
| `db:status`         | `pnpm db:status`                          | compara `prisma/migrations` com a tabela `_prisma_migrations` do banco                                        |
| `db:reset`          | `pnpm db:reset`                           | apaga o banco local e reaplica todas as migrações; só em desenvolvimento, pede confirmação                    |

Migrações só acrescentam e são commitadas junto com o schema; `prisma db push` não é usado em homologação nem produção.

## Execução local

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env              # valores nas instruções privadas da equipe
pnpm db:up
pnpm db:deploy                    # ou pnpm db:migrate, ao evoluir o schema
pnpm dev
```

- `GET /v1/health` — verificação de saúde da API e do banco (`503` se o banco não responde).
- `GET /docs` — contrato OpenAPI gerado do código (`/docs-json` para o JSON).

Para os testes de ponta a ponta, crie um `.env.test` apontando para um banco **descartável** (a suíte limpa as tabelas a cada caso) e aplique as migrações nele: `DATABASE_URL=<url de teste> pnpm db:deploy`.

O `.env`, o `.env.test` e o cliente gerado não são versionados. O `.env.example` traz só os nomes. O `prisma.config.ts` carrega o `.env` por conta própria (o Prisma 7 não faz isso) e aceita `DATABASE_URL` ausente, para que `pnpm install` e `pnpm db:generate` funcionem num clone limpo e no CI; só os comandos que tocam o banco exigem a variável.

## Convenções

- **Rotas** sob o prefixo `/v1`. Identificadores opacos (UUID); paginação e erros documentados no contrato.
- **Erro** sempre no envelope `{ code, message, correlationId, details }`. `message` é segura para a interface; `details` nunca carrega stack, segredo ou dado de outra pessoa (`src/common/filters`).
- **Correlação**: toda resposta devolve `x-correlation-id`; o cliente pode enviar o seu para rastrear o mesmo fluxo entre front e API.
- **Validação na borda**: `ValidationPipe` global com `whitelist` e `forbidNonWhitelisted`; DTOs com `class-validator`. Campo desconhecido é `400`.
- **Variáveis de ambiente** declaradas e validadas em `src/config/env.validation.ts`; variável nova entra lá e no `.env.example`.
- **Dados**: modelos em português no singular; tabelas e colunas em `snake_case` por `@map`; `criado_em`/`atualizado_em`; `versao` com bloqueio otimista nas entidades de cadastro; toda relação com `onDelete: Restrict`; `instrumento_id` de projeto e requisito é imutável depois de criado.
- **Módulos por capacidade de negócio** (`src/<capacidade>/`), com controller, casos de uso e persistência dentro do módulo; importação entre módulos só por serviço exportado. `PrismaService` é global.
- **Módulos ES**: importações relativas levam a extensão `.js` (`./app.module.js`), exigência do NestJS 12, que publica apenas ESM.
- **Testes** provam efeito observável (resposta, status, registro no banco), nunca a forma do código. Sem `.skip`, `.only`, `retry` ou espera arbitrária.
- **Commits** no padrão Conventional Commits em português, um propósito por commit; pull request pequeno, revisado por integrante de outra dupla.
