# Processo e ritos (ScrumXP)

A equipe CyberSetor adota o **ScrumXP**: o framework Scrum para o gerenciamento do trabalho e as práticas técnicas do eXtreme Programming para a engenharia. Esta página registra como o processo funciona na prática. A fundamentação da escolha está na seção 4 do Documento de Visão.

## Papéis

| Papel | Quem | Responsabilidade |
|---|---|---|
| **Product Owner (interno)** | Maria Eduarda | Consolida o entendimento do Instituto entre as validações; ordena o Product Backlog por valor; é a voz do cliente no dia a dia |
| **Scrum Master** | Vinicius | Facilita as cerimônias; remove impedimentos; zela pelo processo e pelos prazos |
| **Time de Desenvolvimento** | Todos os seis integrantes | Estima, seleciona o que cabe na sprint, constrói e testa |
| **Cliente** | Instituto No Setor | Valida as entregas; fonte primária dos requisitos |

O Product Owner interno é a mitigação declarada para duas limitações conhecidas: a dependência da disponibilidade do Product Owner, no Scrum, e a dependência do cliente presente, no XP. O Instituto é uma organização sem equipe de tecnologia e com agenda reduzida, e não funcionaria como cliente presente no sentido literal.

## Cadência e cerimônias

Sprints de duas semanas, ancoradas nas terças-feiras. A Sprint 0 (18/08 a 08/09) é excepcional, com três semanas, por ser de descoberta e formação da equipe.

| Cerimônia | Quando | Duração | Formato | Resultado |
|---|---|---|---|---|
| **Sprint Planning** | Primeira terça da sprint | ~1h | Google Meet | Meta da sprint e Sprint Backlog |
| **Daily** | Todo dia útil, até as 12h | ~5 min | Assíncrona, no grupo *Dailys* do WhatsApp | Impedimentos visíveis no mesmo dia |
| **Refinamento do Backlog** | Semanal | ~30 min | Google Meet | Itens detalhados, estimados e priorizados |
| **Sprint Review** | Última terça da sprint | ~1h | Google Meet, com o Instituto quando houver agenda | Incremento demonstrado e feedback incorporado ao backlog |
| **Retrospectiva** | Ao fim de cada unidade | ~40 min | Google Meet | Ações de melhoria e texto da seção 11 |

### Por que a daily é assíncrona

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
| Product Backlog | GitHub Projects e Issues | Product Owner |
| Sprint Backlog | GitHub Projects | Time |
| Incremento | Branch `main` e ambiente publicado | Time |
| Atas de reunião | [Atas de reunião](atas/index.md) | Relator da reunião |
| Definition of Ready e Definition of Done | Seção 9 do documento (Unidade 2) | Equipe |
| Matriz de competências | [Matriz de competências e stack](matriz-competencias.md) | Scrum Master |

Histórias de usuário seguem o formato do XP: escritas em linguagem não técnica, na perspectiva de quem usa, com critérios de aceitação que as tornam testáveis.

```
Como <perfil do Instituto>, quero <ação> para <resultado esperado>.

Critérios de aceitação:
- Dado <contexto>, quando <ação>, então <resultado observável>
```

## Práticas de XP

**Adotadas:** histórias de usuário · critérios de aceitação · testes de aceitação · pequenas releases · integração contínua · programação em pares · propriedade coletiva do código · design simples · padrões de codificação · cliente presente **adaptado**, com Product Owner interno e validações periódicas.

**Não adotadas, com justificativa:**

| Prática | Justificativa |
|---|---|
| TDD integral | A equipe não tem maturidade para sustentá-lo. Adotam-se testes de aceitação |
| Refatoração contínua agressiva | Exige suíte de testes robusta, que não existirá no prazo |
| Metáfora do sistema | Baixo retorno em projeto pequeno |
| Semana de 40 horas | Não se aplica ao contexto acadêmico |

## Comunicação

Comunidade no WhatsApp *CyberSetor - Requisitos*, com três grupos: *Avisos* (comunicados), *CyberSetor - Geral* (discussão e decisões) e *Dailys* (só dailies). Reuniões no Google Meet, com gravação e ata automática. Entregas publicadas neste site; o Google Docs é rascunho.

## Referências

BECK, K.; ANDRES, C. **Extreme Programming Explained: Embrace Change.** 2. ed. Boston: Addison-Wesley, 2004.

MARSICANO, G. **Requisitos de Software: Comunicação é tudo!** v1.1 draft. Brasília: FCTE/UnB, 2026.

SCHWABER, K.; SUTHERLAND, J. **The Scrum Guide.** 2020. Disponível em: https://scrumguides.org. Acesso em: 2 set. 2026.
