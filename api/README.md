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
| `db:check`          | `pnpm db:check`                           | falha se o `schema.prisma` mudou sem migração; o CI roda depois do `db:deploy`                                |

Migrações só acrescentam e são commitadas junto com o schema; `prisma db push` não é usado em homologação nem produção.

- Uma migração por pull request, gerada com `pnpm db:migrate` depois de atualizar a branch com a `api-develop`. Se duas branches mexerem no schema, a segunda refaz a migração em cima da primeira, já integrada.
- Migração aplicada não se edita; corrige-se com outra migração. O CI recusa pull request que altere ou apague arquivo em `prisma/migrations`.
- Mudança que remove ou renomeia coluna em uso entra em duas etapas (acrescentar, migrar o uso, remover depois), porque o rollback da implantação não desfaz o banco.

## Execução local

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env              # valores de desenvolvimento; com a 5432 ocupada, troque a porta
pnpm db:up
pnpm db:deploy                    # ou pnpm db:migrate, ao evoluir o schema
pnpm seed:admin                   # cria o administrador inicial, uma única vez
pnpm dev
```

O `JWT_SECRET` e a senha do seed do exemplo valem só para desenvolvimento local; em homologação e produção, gere o segredo com `openssl rand -base64 48`. Depois de trazer uma mudança no `schema.prisma` sem mudança no lockfile, rode `pnpm db:generate`: nesse caso o `pnpm install` não regera o cliente.

- `GET /v1/health` — verificação de saúde da API e do banco (`503` se o banco não responde).
- `GET /docs` — contrato OpenAPI gerado do código (`/docs-json` para o JSON).

Para os testes de ponta a ponta, crie um `.env.test` apontando para um banco **descartável** (a suíte limpa as tabelas a cada caso) e aplique as migrações nele: `DATABASE_URL=<url de teste> pnpm db:deploy`.

O `.env`, o `.env.test` e o cliente gerado não são versionados. O `.env.example` traz todos os valores de desenvolvimento local, para o projeto subir sem ajuste. O `prisma.config.ts` carrega o `.env` por conta própria (o Prisma 7 não faz isso) e aceita `DATABASE_URL` ausente, para que `pnpm install` e `pnpm db:generate` funcionem num clone limpo e no CI; só os comandos que tocam o banco exigem a variável.

## Variáveis de ambiente

| Variável                         | Padrão               | Uso                                                                                                                                                     |
| -------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                       | `development`        | `production` em homologação e produção (cookie `__Host-` e `Secure`)                                                                                    |
| `PORT`                           | `3001`               | porta da API                                                                                                                                            |
| `CORS_ORIGIN`                    | vazio                | origem exata do front, ex.: `http://localhost:3000`                                                                                                     |
| `DATABASE_URL`                   | —                    | obrigatória                                                                                                                                             |
| `JWT_SECRET`                     | —                    | obrigatória, 32 caracteres ou mais                                                                                                                      |
| `ACCESS_TOKEN_TTL_MINUTES`       | `15`                 | validade do token de acesso                                                                                                                             |
| `SESSION_IDLE_TIMEOUT_MINUTES`   | `30`                 | encerramento por inatividade                                                                                                                            |
| `SESSION_ABSOLUTE_TIMEOUT_HOURS` | `8`                  | duração máxima da sessão                                                                                                                                |
| `TRUST_PROXY`                    | vazio                | atrás de proxy reverso, de quem confiar o `X-Forwarded-For` (formato do Express: número de saltos ou `loopback, linklocal, uniquelocal`); vazio desliga |
| `SEED_ADMIN_NAME/EMAIL/PASSWORD` | —                    | só para `pnpm seed:admin`; senha temporária de 15 a 64 caracteres                                                                                       |
| `POSTGRES_USER/PASSWORD/DB/PORT` | `cybersetor`, `5432` | Compose local; a porta acompanha a da `DATABASE_URL`                                                                                                    |
| `REDIS_PORT`                     | `6379`               | Compose local                                                                                                                                           |

Variável vazia vale como ausente: a opcional cai no padrão e a obrigatória reprova a inicialização.

## Implantação

A homologação roda no Coolify a partir da `api-develop`, com a imagem do `Dockerfile` desta pasta.

- **Imagem:** Node 24 e pnpm do `packageManager`, OpenSSL para o motor de migração do Prisma, usuário sem privilégio e verificação de saúde em `GET /v1/health`. O `ci-api` sobe a imagem com um PostgreSQL vazio e exige que ela fique saudável.
- **Migração:** no start do container, `prisma migrate deploy` roda antes da API subir. Reiniciar não reaplica nada. Vale para uma réplica só.
- **Migração que falha:** fica registrada como falha no banco e o container não sobe; reiniciar não resolve. Confira o estado do banco e rode `prisma migrate resolve` com `--rolled-back` ou `--applied`, conforme o que a migração chegou a fazer.
- **Primeira conta:** `node dist/seed-admin.js` dentro do container, com `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`. A senha temporária obriga a troca no primeiro acesso.
- **Variáveis:** só no painel do Coolify, nunca no repositório.
  - `NODE_ENV=production` liga o cookie `__Host-session` com `Secure`.
  - `CORS_ORIGIN` é a origem exata do front.
  - `TRUST_PROXY=loopback, linklocal, uniquelocal` faz o limite de tentativas contar o IP de quem acessa, e não o do proxy. Só vale com a API acessível apenas pelo proxy: no Coolify, porta só em _Ports Exposes_, sem _Ports Mappings_.
  - `JWT_SECRET` é gerado com `openssl rand -base64 48`.
- **Domínio:** o front e a API ficam em subdomínios do mesmo domínio, porque o cookie de renovação é `SameSite=Strict`.

Para conferir a imagem localmente:

```bash
docker build -t cybersetor-api .
docker run --rm -p 3101:3001 -e NODE_ENV=production -e DATABASE_URL=<url> -e JWT_SECRET=<segredo> cybersetor-api
```

## Autenticação e autorização

- **Login** em `POST /v1/auth/login` devolve o token de acesso, enviado em `Authorization: Bearer`, e grava o refresh num cookie `HttpOnly; SameSite=Strict`. O front guarda o token só em memória.
- **Renovação e saída** em `POST /v1/auth/refresh` e `POST /v1/auth/logout`, com o cabeçalho `X-CSRF: 1` e `credentials: 'include'` no front. Front e API usam o mesmo nome de host (`localhost` nos dois, nunca `127.0.0.1` de um lado só).
- **Toda rota exige login.** `@Public()` libera a rota; `@Profiles(Perfil.X, ...)` restringe aos perfis listados e registra o acesso negado na trilha. O perfil é lido do banco a cada requisição.
- **Senha temporária**: enquanto `deveTrocarSenha` estiver ativo, só `GET /v1/auth/session` e `POST /v1/auth/password` respondem; o resto devolve `403 PASSWORD_CHANGE_REQUIRED`.
- **Contas** em `/v1/accounts`, só para `ADMINISTRACAO_SISTEMA`: criar, listar, mudar perfil, desativar, reativar e redefinir senha temporária. Nenhuma operação deixa o sistema sem administrador ativo (`409 LAST_ADMIN`).
- **Instrumentos** em `/v1/instruments`: `PRESIDENCIA_GESTAO` cadastra e edita; `NUCLEO_PEDAGOGICO` e `ADMINISTRATIVO_FINANCEIRO` consultam. Valor em reais como texto: na entrada, até 12 dígitos e duas casas com ponto (`"150000.5"`); na resposta, sempre com duas casas (`"150000.50"`). Datas como `AAAA-MM-DD`. A edição envia a `versao` lida e só os campos que mudam; campo nulo é `400`, versão antiga é `409 VERSION_CONFLICT` e edição sem mudança não sobe a versão.
- **Atividades** em `/v1/projects/:projectId/activities` e `/v1/activities/:id`: `PRESIDENCIA_GESTAO` e `NUCLEO_PEDAGOGICO` cadastram e editam; `ADMINISTRATIVO_FINANCEIRO` consulta. Cada atividade vincula-se a uma modalidade ativa (`INVALID_MODALITY` se inativa na criação ou ao trocar), a um responsável ativo (`INVALID_RESPONSIBLE`), a uma data dentro da execução do projeto (`OUTSIDE_PROJECT_PERIOD`) e a uma ou mais metas do mesmo projeto (`META_OUTSIDE_PROJECT`). Instrumento inativo bloqueia criação e edição (`409 INSTRUMENT_INACTIVE`).
- **Proteções do login** em `src/auth/login-protection.ts`: 20 tentativas por minuto por IP e bloqueio de 15 minutos após 10 falhas consecutivas.

## Convenções

- **Rotas** sob o prefixo `/v1`. Identificadores opacos (UUID); paginação e erros documentados no contrato.
- **Erro** sempre no envelope `{ code, message, correlationId, details }`. `message` é segura para a interface; `details` nunca carrega stack, segredo ou dado de outra pessoa (`src/common/filters`).
- **Correlação**: toda resposta devolve `x-correlation-id`; o cliente pode enviar o seu para rastrear o mesmo fluxo entre front e API.
- **Validação na borda**: `ValidationPipe` global com `whitelist` e `forbidNonWhitelisted`; DTOs com `class-validator`. Campo desconhecido é `400`.
- **Variáveis de ambiente** declaradas e validadas em `src/config/env.validation.ts`; variável nova entra lá e no `.env.example`.
- **Idioma**: nomes técnicos (pastas, classes, métodos, variáveis de ambiente, códigos de erro e de ação da trilha) em inglês; domínio do Prisma e mensagens ao usuário em português.
- **Dados**: modelos em português no singular; tabelas e colunas em `snake_case` por `@map`; `criado_em`/`atualizado_em`; `versao` com bloqueio otimista nas entidades de cadastro; toda relação com `onDelete: Restrict`; `instrumento_id` de projeto e requisito é imutável depois de criado.
- **Módulos por capacidade de negócio** (`src/<capacidade>/`), com controller, casos de uso e persistência dentro do módulo; importação entre módulos só por serviço exportado. `PrismaService` é global.
- **Módulos ES**: importações relativas levam a extensão `.js` (`./app.module.js`), exigência do NestJS 12, que publica apenas ESM.
- **Testes** provam efeito observável (resposta, status, registro no banco), nunca a forma do código. Sem `.skip`, `.only`, `retry` ou espera arbitrária.
- **Commits** no padrão Conventional Commits em português, um propósito por commit; pull request pequeno, revisado por integrante de outra dupla.
