# CyberSetor — API

Linha de código da API do sistema de gestão do ciclo de projetos financiados do Instituto Cultural e Social No Setor. Documentação, processo e requisitos estão no [site do projeto](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/).

Esta linha não tem história comum com a `main` (documentação) nem com a linha do front: contém só o código da API, em `api/`, e a própria integração contínua.

| Branch | Conteúdo | Recebe pull request de | Publica |
|---|---|---|---|
| `api-develop` | API em integração | `feat/api/HU-xx-<assunto>`, `test/api/<assunto>`, `refactor/api/<assunto>`, `chore/api/<assunto>`, `api` | Homologação da API |
| `api` | API em produção | `api-develop`, `fix/api-<assunto>` | Produção da API |

Fluxo completo, mensagens de commit e revisão: [Boas práticas no GitHub](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/gestao/boas-praticas-github/). Instruções de ambiente e segredos ficam fora do repositório público, no espaço privado da equipe.
