# Processo e ritos (ScrumXP)

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/10/2026 | 1.1 | Registro dos ritos das Sprints 1 e 2 com remissão às atas | Maria Eduarda Marques |
| 06/10/2026 | 1.2 | Daily no próprio dia, até o fim do dia, em vez de até as 12h | Vinicius Vieira |
| 19/10/2026 | 1.3 | Equipe atual de cinco integrantes | Maria Eduarda Marques |
| 21/10/2026 | 1.4 | Registro dos ritos das Sprints 2 a 4 | Maria Eduarda Marques |
| 21/10/2026 | 1.5 | Daily presencial às terças e quintas e escrita nos demais dias úteis; ambientes do produto com os endereços de homologação | Vinicius Vieira |

A equipe CyberSetor adota o **ScrumXP**: o framework Scrum para o gerenciamento do trabalho e as práticas técnicas do eXtreme Programming para a engenharia. Esta página registra como o processo funciona na prática. A fundamentação da escolha está na seção 4 do Documento de Visão.

## Papéis e cerimônias

A composição da equipe, os papéis e o papel do cliente estão na [seção 7.1 do Documento de Visão](../visao/7-equipe-e-cliente.md); a cadência das cerimônias, com frequência, duração e formato, está na [seção 7.2](../visao/7-equipe-e-cliente.md#72-comunicacao). Esta página registra o que é próprio da operação da equipe: como a daily acontece, quais artefatos sustentam o processo, quais práticas de XP estão em uso e como a equipe se comunica.

Sprints de duas semanas, ancoradas nas terças-feiras. A Sprint 0 (18/08 a 08/09) é excepcional, com três semanas, por ser de descoberta e formação da equipe.

## Como a daily acontece

A equipe é formada por cinco estudantes com grades e compromissos distintos, e uma daily síncrona todos os dias não se sustentaria. Às terças e quintas, dias de aula e da reunião da equipe, a daily é presencial. Nos demais dias úteis, ela é escrita, no grupo *Dailys*. O que a cerimônia precisa entregar é **compromisso** e **visibilidade de impedimentos**, dois dos sete valores da Engenharia de Requisitos adotados pela disciplina; a forma escrita, no mesmo lugar, entrega isso nos dias sem encontro. É uma adaptação consciente do rito ao contexto. A adesão por sprint está no [registro das dailies](dailies.md).

### Molde da daily

```
📅 [DD/MM] — Seu Nome
✅ Feito: o que concluí desde a última daily
🔄 Fazendo: o que vou tocar hoje
🚧 Impedimento: o que está me travando, ou "nenhum"
```

**Regras:** nos dias úteis sem encontro presencial, no próprio dia, até o fim do dia, inclusive sem avanço (escreve-se "sem avanço") · impedimento é campo obrigatório · quem depende de outra pessoa a marca · o grupo *Dailys* é exclusivo para dailies; discussão vai para o grupo *Geral* e decisão vira ata · impedimento declarado é resolvido ou escalado pelo Scrum Master em até 24 horas.

## Artefatos

| Artefato | Onde vive | Responsável |
|---|---|---|
| Visão do Produto | Este site | Equipe |
| Product Backlog | GitHub Projects e Issues | Product Owner interno, com a ordenação validada pelo Instituto |
| Sprint Backlog | GitHub Projects | Time |
| Incremento | Branch `main` e ambiente publicado | Time |
| Atas de reunião | [Atas de reunião](atas/index.md) | Relator da reunião |
| Definition of Ready e Definition of Done | [Seção 9 do Documento de Visão](../requisitos/9-dor-dod.md) | Equipe |
| Matriz de competências | [Matriz de competências e stack](matriz-competencias.md) | Scrum Master |

Histórias de usuário seguem o formato do XP: escritas em linguagem não técnica, na perspectiva de quem usa, acompanhadas por uma lista de critérios de aceitação objetivos e verificáveis.

```
Como <perfil do Instituto>, quero <ação> para <resultado esperado>.

Critérios de aceitação:
- [Condição observável ou regra que o sistema deve cumprir]
- [Restrição de negócio, técnica ou de privacidade/LGPD]
```

Cada história é aberta pelo formulário de história do repositório, que pede a história nesse formato, as características de produto e os objetivos específicos em caixas de marcação (seções 2.3 e 2.2), os RFs, RNFs e regras de negócio que a condicionam, os critérios de aceitação em lista e as dependências. No quadro do projeto, características e objetivos ficam em campos de seleção múltipla com os mesmos títulos.

## Ambientes do produto

| Ambiente | Endereço | Origem |
|---|---|---|
| Homologação | [cybersetor-web.netvitae.org](https://cybersetor-web.netvitae.org) · API e documentação em [cybersetor-api.netvitae.org/docs](https://cybersetor-api.netvitae.org/docs) | linhas `web-develop` e `api-develop` |
| Produção | publicada na estabilização ([seção 6.4](../visao/6-cronograma.md#64-estabilizacao-implantacao-e-transferencia)) | linhas `web` e `api` |

O acesso à homologação é por conta criada pela administração do sistema, sem cadastro aberto. Ela guarda dados de teste e, nas validações com o Instituto, dados reais minimizados de um projeto ([seção 6.5](../visao/6-cronograma.md#65-validacao-com-dados-reais)).

## Registro dos ritos

| Sprint | Rito | Data | Registro |
|---|---|---|---|
| Sprint 1 | Sprint Planning | 08/09/2026 | [Ata](atas/2026-09-08-sprint-planning.md) |
| Sprint 1 | Sprint Review e Retrospectiva | 22/09/2026 | [Ata](atas/2026-09-22-sprint-review-retrospectiva.md) |
| Sprint 2 | Sprint Planning | 23/09/2026 | [Ata](atas/2026-09-23-sprint-planning.md) |
| Sprint 2 | Sprint Review e Retrospectiva | 06/10/2026 | [Ata](atas/2026-10-06-sprint-review-retrospectiva.md) |
| Sprint 3 | Sprint Planning | 07/10/2026 | [Ata](atas/2026-10-07-sprint-planning.md) |
| Sprint 3 | Sprint Review e Retrospectiva | 20/10/2026 | [Ata](atas/2026-10-20-sprint-review-retrospectiva-planning.md) |
| Sprint 4 | Sprint Planning | 20/10/2026 | [Ata](atas/2026-10-20-sprint-review-retrospectiva-planning.md) |

As reuniões com o Instituto que alimentam a validação estão no [índice de atas](atas/index.md#interacoes-com-o-cliente).

## Práticas de XP

**Em uso desde a Sprint 1:** histórias de usuário · critérios de aceitação · trabalho em duplas na documentação · integração contínua, que compila o site em modo estrito a cada alteração · cliente presente **adaptado**, com Product Owner interno no intervalo entre validações e validação semanal com o Instituto (Documento de Visão, seção 7.2).

**A partir da primeira sprint de código:** testes de aceitação · pequenas releases · programação em pares · propriedade coletiva do código · design simples · padrões de codificação. Cada uma passa a valer quando houver código a que aplicá-la, e a evidência de adoção é registrada na Sprint Review correspondente.

**Não adotadas, com justificativa:**

| Prática | Justificativa |
|---|---|
| TDD integral | A equipe não tem maturidade para sustentá-lo. Adotam-se testes de aceitação |
| Refatoração contínua agressiva | Exige suíte de testes robusta, que não existirá no prazo |
| Metáfora do sistema | Baixo retorno em projeto pequeno |
| Semana de 40 horas | Não se aplica ao contexto acadêmico |

## Comunicação

Comunidade no WhatsApp *CyberSetor - Requisitos*, com três grupos: *Avisos* (comunicados), *CyberSetor - Geral* (discussão e decisões) e *Dailys* (só dailies). Reuniões no Google Meet, com gravação e transcrição de apoio armazenadas no Drive com acesso restrito, e ata sintética oficial elaborada pelo relator, com revisão de dados sensíveis (LGPD). Entregas publicadas neste site; o Google Docs é rascunho.

## Referências

BECK, K.; ANDRES, C. **Extreme Programming Explained: Embrace Change.** 2. ed. Boston: Addison-Wesley, 2004.

MARSICANO, G. **Requisitos de Software: Comunicação é tudo!** v1.1 draft. Brasília: FCTE/UnB, 2026.

SCHWABER, K.; SUTHERLAND, J. **The Scrum Guide.** 2020. Disponível em: https://scrumguides.org. Acesso em: 2 set. 2026.
