# Processo e ritos (ScrumXP)

A equipe CyberSetor adota o **ScrumXP**: o framework Scrum para o gerenciamento do trabalho e as práticas técnicas do eXtreme Programming para a engenharia. Esta página registra como o processo funciona na prática. A fundamentação da escolha está na seção 4 do Documento de Visão.

## Papéis e cerimônias

A composição da equipe, os papéis e o papel do cliente estão na [seção 7.1 do Documento de Visão](../visao/7-equipe-e-cliente.md); a cadência das cerimônias, com frequência, duração e formato, está na [seção 7.2](../visao/7-equipe-e-cliente.md#72-comunicacao). Esta página registra o que é próprio da operação da equipe: por que a daily é assíncrona, quais artefatos sustentam o processo, quais práticas de XP estão em uso e como a equipe se comunica.

Sprints de duas semanas, ancoradas nas terças-feiras. A Sprint 0 (18/08 a 08/09) é excepcional, com três semanas, por ser de descoberta e formação da equipe.

## Por que a daily é assíncrona

A equipe é formada por seis estudantes com grades e compromissos distintos. Uma daily síncrona diária não se sustentaria. O que a cerimônia precisa entregar é **compromisso** e **visibilidade de impedimentos**, dois dos sete valores da Engenharia de Requisitos adotados pela disciplina. Uma daily escrita, no mesmo lugar, todo dia, entrega isso de forma mais confiável. É uma adaptação consciente do rito ao contexto.

### Molde da daily

```
📅 [DD/MM] — Seu Nome
✅ Feito: o que concluí desde a última daily
🔄 Fazendo: o que vou tocar hoje
🚧 Impedimento: o que está me travando, ou "nenhum"
```

**Regras:** todo dia útil até as 12h, inclusive sem avanço (escreve-se "sem avanço") · impedimento é campo obrigatório · quem depende de outra pessoa a marca · o grupo *Dailys* é exclusivo para dailies; discussão vai para o grupo *Geral* e decisão vira ata · impedimento declarado é resolvido ou escalado pelo Scrum Master em até 24 horas.

## Artefatos

| Artefato | Onde vive | Responsável |
|---|---|---|
| Visão do Produto | Este site | Equipe |
| Product Backlog | GitHub Projects e Issues | Product Owner interno, com a ordenação validada pelo Instituto |
| Sprint Backlog | GitHub Projects | Time |
| Incremento | Branch `main` e ambiente publicado | Time |
| Atas de reunião | [Atas de reunião](atas/index.md) | Relator da reunião |
| Definition of Ready e Definition of Done | Seção 9 do documento (Unidade 2) | Equipe |
| Matriz de competências | [Matriz de competências e stack](matriz-competencias.md) | Scrum Master |

Histórias de usuário seguem o formato do XP: escritas em linguagem não técnica, na perspectiva de quem usa, acompanhadas por uma lista de critérios de aceitação objetivos e verificáveis.

```
Como <perfil do Instituto>, quero <ação> para <resultado esperado>.

Critérios de aceitação:
- [Condição observável ou regra que o sistema deve cumprir]
- [Restrição de negócio, técnica ou de privacidade/LGPD]
```

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
