# Gabarito — abra depois de tentar

Aqui está a fatia completa: o que `api/` se torna quando o exercício do
`02-fatia-nestjs-prisma.pdf` termina. São os arquivos que **faltam** ou que
**mudam** em relação ao ponto de partida.

Se você abrir isto antes de tentar, o exercício acaba. Ler a resposta certa dá
a sensação de ter entendido, sem o entendimento. Tente primeiro, trave, tente
de novo, e só então compare.

## Quando usar

- Você travou por mais de 15 minutos no mesmo erro e já registrou comando,
  saída e hipótese.
- Você terminou e quer conferir se chegou ao mesmo lugar por outro caminho.
- Você quer ler a fatia inteira antes de mexer em qualquer coisa — legítimo,
  mas então o exercício vira leitura, e vale dizer isso na hora de relatar.

## O que tem aqui

| Caminho | O que é |
|---|---|
| `api/prisma/schema.prisma` | schema com `frequenciaApuracao`, o estado final |
| `api/prisma/migrations/…init_requisito_dojo/` | primeira migration |
| `api/prisma/migrations/…adiciona_frequencia_apuracao/` | segunda migration |
| `api/src/prisma.service.ts` | o Prisma como provider injetável |
| `api/src/requisitos-dojo/` | DTO, controller, service e módulo |
| `api/src/app.module.ts` · `api/src/main.ts` | versões finais, com o módulo ligado e o pipe global |
| `api/test/requisitos-dojo.e2e-spec.ts` | os três testes ponta a ponta |

## O que o exercício também remove

Ao montar a fatia, estes arquivos do scaffold saem de `api/` — eles existem só
para o projeto novo responder alguma coisa antes de ter domínio:

```text
src/app.controller.ts
src/app.controller.spec.ts
src/app.service.ts
test/app.e2e-spec.ts
```

Se eles ainda estiverem lá no fim, o `app.module.ts` provavelmente continua
declarando o controller e o service do scaffold.
