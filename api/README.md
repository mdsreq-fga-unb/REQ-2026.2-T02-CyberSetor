# api

API do sistema de gestão do ciclo de projetos financiados do Instituto Cultural e Social No Setor. NestJS 12 (ESM) com TypeScript estrito; Prisma e PostgreSQL entram na migração inicial (ver a página de requisitos do [site do projeto](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/)).

## Pré-requisitos

| Ferramenta | Versão                      | Como                                                                                                      |
| ---------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Node.js    | a do `.nvmrc`               | `nvm use` (ou `fnm use`)                                                                                  |
| pnpm       | a do campo `packageManager` | `corepack enable` (baixa a versão fixada na primeira execução) ou `npm install -g pnpm@<versão do campo>` |

## Comandos oficiais

Os mesmos comandos rodam na máquina de cada integrante e na integração contínua da linha (`ci-api`).

| Chave       | Comando          | Nota                                                                  |
| ----------- | ---------------- | --------------------------------------------------------------------- |
| `dev`       | `pnpm dev`       | API com recarga automática na porta `PORT`                            |
| `fmt`       | `pnpm fmt`       | formata com Prettier (`fmt:check` só confere)                         |
| `lint`      | `pnpm lint`      | ESLint com regras tipadas                                             |
| `typecheck` | `pnpm typecheck` | `tsc --noEmit`                                                        |
| `test`      | `pnpm test`      | testes unitários (Vitest), `src/**/*.spec.ts`                         |
| `test:e2e`  | `pnpm test:e2e`  | testes de ponta a ponta (Vitest + Supertest), `test/**/*.e2e-spec.ts` |
| `build`     | `pnpm build`     | compila para `dist/`                                                  |
| `verify`    | `pnpm verify`    | tudo acima, na ordem; é o que se roda antes de abrir pull request     |

## Execução local

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env     # preencher com os valores das instruções privadas da equipe
pnpm dev
```

- `GET /v1/health` — verificação de saúde.
- `GET /docs` — contrato OpenAPI gerado do código (`/docs-json` para o JSON).

O `.env` não é versionado. O `.env.example` traz só os nomes; os valores e o passo a passo de banco e serviços ficam no espaço privado da equipe.

## Convenções

- **Rotas** sob o prefixo `/v1`. Identificadores opacos; paginação e erros documentados no contrato.
- **Erro** sempre no envelope `{ code, message, correlationId, details }`. `message` é segura para a interface; `details` nunca carrega stack, segredo ou dado de outra pessoa (`src/common/filters`).
- **Correlação**: toda resposta devolve `x-correlation-id`; o cliente pode enviar o seu para rastrear o mesmo fluxo entre front e API.
- **Validação na borda**: `ValidationPipe` global com `whitelist` e `forbidNonWhitelisted`; DTOs com `class-validator`. Campo desconhecido é `400`.
- **Variáveis de ambiente** declaradas e validadas em `src/config/env.validation.ts`; variável nova entra lá e no `.env.example`.
- **Módulos por capacidade de negócio** (`src/<capacidade>/`), com controller, casos de uso e persistência dentro do módulo; importação entre módulos só por serviço exportado.
- **Módulos ES**: importações relativas levam a extensão `.js` (`./app.module.js`), exigência do NestJS 12, que publica apenas ESM.
- **Testes** provam efeito observável (resposta, status, registro no banco), nunca a forma do código. Sem `.skip`, `.only`, `retry` ou espera arbitrária.
- **Commits** no padrão Conventional Commits em português, um propósito por commit; pull request pequeno, revisado por integrante de outra dupla.
