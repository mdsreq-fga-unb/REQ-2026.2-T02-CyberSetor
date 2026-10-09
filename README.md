# CyberSetor — Front

Linha de código do front do sistema de gestão do ciclo de projetos financiados do Instituto Cultural e Social No Setor. Documentação, processo e requisitos estão no [site do projeto](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/).

Esta linha não tem história comum com a `main` (documentação) nem com a linha da API: contém só o código do front, em `web/`, e a própria integração contínua.

| Branch | Conteúdo | Recebe pull request de | Publica |
|---|---|---|---|
| `web-develop` | Front em integração | `feat/web/HU-xx-<assunto>`, `test/web/<assunto>`, `refactor/web/<assunto>`, `chore/web/<assunto>`, `web` | Prévia do front |
| `web` | Front em produção | `web-develop`, `fix/web-<assunto>` | Produção do front |

Fluxo completo, mensagens de commit e revisão: [Boas práticas no GitHub](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/gestao/boas-praticas-github/). Instruções de ambiente e segredos ficam fora do repositório público, no espaço privado da equipe.
