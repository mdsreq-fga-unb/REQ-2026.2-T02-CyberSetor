# Dojo da Sprint 1 — material e exercícios

Material do encontro de **10/09/2026**, da equipe CyberSetor, na disciplina
FGA0313 — Requisitos de Software, T02 2026.2.

Esta branch existe para **estudo individual até a Sprint Review de 22/09**. Os
slides foram apresentados; os exercícios ficaram para cada um fazer no seu
tempo. Na Sprint 2 o aprofundamento acontece em pares, durante o
desenvolvimento do produto — não haverá outro dojo.

> **Você está na branch `dojo/11`**, do repositório
> `mdsreq-fga-unb/REQ-2026.2-T02-CyberSetor`. Não existe outro repositório para
> o dojo. O site da disciplina e o Documento de Visão vivem na `main` e não
> têm nada a ver com o que está aqui.

## O que ler, em ordem

| # | Documento | O que tem dentro |
|---|---|---|
| 1 | [`material/01-historias-e-criterios.pdf`](material/01-historias-e-criterios.pdf) | INVEST, formato de história, critérios de aceitação em Given/When/Then, protocolo do quadro, fluxo de Git |
| 2 | [`material/02-fatia-nestjs-prisma.pdf`](material/02-fatia-nestjs-prisma.pdf) | a fatia vertical: NestJS, Prisma e PostgreSQL, do schema à resposta HTTP |
| 3 | [`material/03-frontend-dexie-query-shadcn.pdf`](material/03-frontend-dexie-query-shadcn.pdf) | Next.js, Dexie, TanStack Query e shadcn/ui |
| 4 | [`material/04-exercicio-refinamento.pdf`](material/04-exercicio-refinamento.pdf) | seis critérios de aceitação defeituosos, para corrigir |
| 5 | [`material/05-desafios.pdf`](material/05-desafios.pdf) | seis desafios com verificação binária: passa ou não passa |
| 6 | [`material/06-guia-de-estudo.pdf`](material/06-guia-de-estudo.pdf) | o percurso individual até 22/09, passo a passo |

Se você já citava esses documentos pelas letras: 1 era o A, 2 era o B, 3 era o
K, 4 era o C, 5 era o D e 6 era o L. Os identificadores internos
(`D1-S07`, `D2-S14`, `EX-03`, `DES-05`, `L-08`…) continuam os mesmos e não são
renumerados — é por eles que se pede correção.

## O que tem nesta branch

```text
material/   os seis PDFs acima
api/        ponto de partida do exercício técnico (NestJS + Prisma)
web/        exemplos de interface e o script que monta a aplicação
gabarito/   a fatia pronta — abra só depois de tentar
```

`api/` **não está completo de propósito.** Ele tem o scaffold, as configurações
já validadas e o `schema.prisma`, e não tem o módulo de domínio nem as
migrations. Construir isso é o exercício do documento 2. O `gabarito/` tem a
resposta, e existe para conferência depois da tentativa — não para poupar a
tentativa.

## Antes de começar

| Ferramenta | Versão | Como conferir |
|---|---|---|
| Node | `24.21.0` | `node --version` |
| npm | vem com o Node | `npm --version` |
| Docker | qualquer recente, com o daemon ligado | `docker info` |
| Git | qualquer recente | `git --version` |

Node **precisa** ser 24.21.0. A versão 24.14.1 roda a aplicação, mas não atende
ao mínimo exigido pelos schematics do NestJS 12, e `nest generate` falha no meio
do exercício. Com nvm:

```bash
nvm install 24.21.0
nvm alias default 24.21.0
```

A versão também está fixada em `api/.nvmrc`, então dentro de `api/` basta
`nvm use`.

## Subir a API

Os comandos abaixo partem da raiz desta branch.

**1. Dependências, pelo lockfile:**

```bash
cd api
npm ci
```

Use `npm ci`, não `npm install`. `npm ci` instala exatamente o que o
`package-lock.json` registra; `npm install` pode resolver versões diferentes das
validadas, e aí o seu erro deixa de ser o mesmo erro de todo mundo.

**2. Configuração local:**

```bash
cp .env.example .env
```

São credenciais descartáveis de banco local. O `.env` é ignorado pelo Git e não
deve ser publicado nem colado em canal da equipe.

**3. Banco:**

```bash
docker compose up -d
docker compose ps
docker compose exec db pg_isready -U cybersetor -d cybersetor_dojo
```

Espere o serviço `db` aparecer como `healthy` antes de seguir. Migration
aplicada em banco que ainda está subindo falha com erro de conexão, e o erro
não diz que a causa foi pressa.

> **Se a porta 5432 já estiver ocupada** — muito comum em quem tem outro
> projeto com Postgres — o `docker compose up` falha com
> `Bind for 127.0.0.1:5432 failed: port is already allocated`. Não pare o outro
> banco: mude o seu. No `.env`, ponha `DB_PORT=5433` e troque a porta em
> `DATABASE_URL` para `5433` também. As duas precisam combinar.

**4. Daqui em diante é o exercício.** O documento 2 conduz: schema, primeira
migration, provider do Prisma, DTO, controller, service, módulo e pipe global.

## O que você deve conseguir provar no fim

| Verificação | Resultado esperado |
|---|---|
| `docker compose ps` | serviço `db` como `healthy` |
| `npx prisma generate` | termina sem erro |
| `npm run build` | compila sem erro |
| `POST /requisitos-dojo` com corpo inválido | HTTP `400`, com mensagens que dizem qual campo falhou |
| `POST /requisitos-dojo` com corpo válido | HTTP `201`, com o registro persistido |
| `GET /requisitos-dojo` | HTTP `200`, devolvendo o que foi criado |
| `npm run test:e2e` | três testes passando |

A API sobe em `http://localhost:3001` (`PORT` no `.env`).

No ponto de partida, `npm run test:e2e` roda **um** teste, o do scaffold. Os
três acima só existem depois que você monta a fatia.

**Aviso esperado, não é erro:** o Jest roda com
`--experimental-vm-modules` porque os pacotes do NestJS 12 são ESM e o scaffold
é CJS. O Node imprime um aviso de recurso experimental a cada execução. Ele
aparece mesmo quando tudo passa.

## Montar a interface

Depois que a API estiver de pé:

```bash
cd web
./montar-demo.sh
```

O script gera a aplicação Next.js em `web/demo/`, instala TanStack Query, Dexie
e shadcn/ui nas versões validadas, copia os exemplos de `web/src/` e roda lint e
build. Precisa de **internet** e de Node 24.21.0.

Depois:

```bash
cd demo
npm run dev
```

E abra `http://localhost:3000/requisitos-dojo`.

`web/demo/` é ignorado pelo Git — nada do que o script baixa entra em commit.
Para refazer do zero, apague a pasta e rode de novo.

Os arquivos de `web/src/` são os mesmos trechos que aparecem nos documentos 3 e
6, em versão compilável.

## Trabalhando e entregando

Branch individual sai de `dojo/11` e volta para `dojo/11`:

```bash
git switch dojo/11
git switch -c dojo/11-seu-assunto
```

**Nunca abra PR desta branch, nem de uma filha dela, para a `main`.** A `main` é
o site avaliado da disciplina e não tem relação com este material.

Commit no padrão Conventional Commits, título de até 72 caracteres:

```bash
git commit -m "feat(dojo): implementa o service do requisito"
```

Publicação de branch e abertura de PR são **manuais**, feitas por pessoa. Não
existe automação que publique por você nesta branch.

## Quando travar

Trave por 15 minutos e depois peça ajuda no canal da equipe, neste formato:

```text
Contexto:  o que eu estava fazendo
Comando:   o que eu rodei, exatamente
Resultado: a saída que apareceu, colada
Esperado:  o que eu achava que ia acontecer
```

Os quatro campos importam. "Deu erro no Prisma" não é diagnosticável; a saída
colada quase sempre é.

## Parar sem perder nada

```bash
cd api
docker compose down
```

`down` sozinho **preserva** os dados: ele remove os contêineres e mantém o
volume. `docker compose down -v` apaga o volume e o banco junto — só use se
quiser mesmo recomeçar do zero.

---

Material da equipe CyberSetor. Não é página do site da disciplina nem documento
de entrega. Correções e ajustes: cite o identificador do trecho
(`D2-S14`, `EX-03`, `DES-05`) e fale com o Scrum Master.
