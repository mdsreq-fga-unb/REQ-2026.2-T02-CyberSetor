# 7. Interação entre equipe e cliente

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Seções 4, 5, 6 e 7 redigidas para o site | Equipe CyberSetor |

## 7.1 Composição da Equipe

A equipe é formada por seis estudantes. Todos compõem o Time de Desenvolvimento, que estima, seleciona o que cabe na sprint, constrói e testa. Dois papéis do Scrum estão designados: o Product Owner interno e o Scrum Master.

| Integrante | Matrícula | GitHub | Papel | Responsabilidades |
|---|---|---|---|---|
| Maria Eduarda Denis Duarte Marques | 232014502 | [@mariadenis](https://github.com/mariadenis) | Líder da equipe · Product Owner interno | Contato com o Instituto; consolida o entendimento do cliente entre as validações; ordena o Product Backlog por valor; Dupla A (seção 1) |
| Vinicius Angelo de Brito Vieira | 190118059 | [@viniciusvieira00](https://github.com/viniciusvieira00) | Scrum Master | Facilita as cerimônias; remove impedimentos; zela pelo processo, pelos prazos e pela infraestrutura do repositório e do site; Dupla B (seção 2) |
| Rodrigo Henrique Donato de Souza | 241012374 | [@Fofodoido](https://github.com/Fofodoido) | Time de Desenvolvimento | Análise competitiva e intervenção social; diagramas e representações visuais; Dupla B (seções 2 e 3) |
| Lucas de Paula Leal | 232004480 | [@lucaspaulaleal](https://github.com/lucaspaulaleal) | Time de Desenvolvimento | Relator das reuniões e guarda das transcrições; estratégia de engenharia de software; Dupla C (seções 4 a 6) |
| Daniel da Silva Batista | 231011201 | [@daniboycam](https://github.com/daniboycam) | Time de Desenvolvimento | Cenário atual, Rich Picture e mapa de stakeholders; Dupla A (seção 1) |
| Caio Flávio de Lima Martins Junior | 231011168 | [@caioflmjr](https://github.com/caioflmjr) | Time de Desenvolvimento | Engenharia de requisitos e cronograma; frente de operação sem conexão e infraestrutura no desenvolvimento; Dupla C (seções 4 a 6) |

O Product Owner interno é a mitigação para duas limitações conhecidas: a dependência da disponibilidade do Product Owner, no Scrum, e a dependência do cliente presente, no XP. O Instituto No Setor não dispõe de equipe de tecnologia e atua com agenda reduzida, e por isso não funcionaria como cliente presente no sentido literal. As responsabilidades técnicas no desenvolvimento serão distribuídas a partir da matriz de competências, com programação em pares desde a Sprint 1.

## 7.2 Comunicação

**Ferramentas**

- **WhatsApp:** comunidade *CyberSetor - Requisitos*, com três grupos: *Avisos*, para comunicados; *CyberSetor - Geral*, para discussão e decisões; e *Dailys*, exclusivo para a daily assíncrona. É também o canal de mensagens com as representantes do Instituto.
- **Google Meet:** todas as reuniões da equipe e as videochamadas com o Instituto, com gravação e ata gerada automaticamente, revisada pelo relator e publicada na página de atas.
- **GitHub:** repositório do projeto, Product Backlog e Sprint Backlog no GitHub Projects e Issues, feedback do professor por issues e publicação deste site.
- **Google Docs:** rascunho colaborativo do documento. A entrega é o site; o rascunho não substitui a publicação.

**Reuniões e frequência**

- **Daily assíncrona:** todo dia útil, até as 12h, no grupo *Dailys*, com o que foi feito, o que será feito e os impedimentos. Impedimento declarado é resolvido ou escalado pelo Scrum Master em até 24 horas.
- **Sprint Planning:** na primeira terça-feira de cada sprint, cerca de uma hora, no Google Meet.
- **Refinamento do backlog:** semanal, cerca de trinta minutos, no Google Meet. É onde a Engenharia de Requisitos acontece no dia a dia.
- **Sprint Review:** na última terça-feira de cada sprint, cerca de uma hora, com o Instituto quando houver agenda.
- **Retrospectiva:** ao final de cada unidade da disciplina, cerca de quarenta minutos. O resultado vai para a seção 11.

**Interação com o cliente**

As interlocutoras são Maria Clara e Maria Eduarda, do núcleo pedagógico. O contato corrente é por WhatsApp e e-mail. As validações acontecem em conversas curtas e quinzenais, de cerca de trinta minutos, em vez de reuniões longas e esporádicas, por respeito à agenda de uma organização com equipe reduzida. Encontros presenciais na sede do Instituto são realizados quando a elicitação exige observação direta, com gravação autorizada para quem não puder comparecer. A primeira reunião ocorreu em 20/08/2026 por videoconferência; em 02/09/2026 o Instituto validou a proposta de solução por mensagem; a reunião presencial está prevista para a semana de 07/09/2026.

## 7.3 Processo de Validação

A validação da solução acontece em três etapas, a cada sprint:

1. **Antes de desenvolver, Definition of Ready.** Uma história só entra na sprint quando tem valor claro para um perfil do Instituto, critérios de aceitação escritos no formato Dado, Quando, Então, estimativa da equipe e nenhuma decisão externa pendente. Quando a história envolve interface, um mockup de baixa fidelidade é validado com o Instituto antes da codificação.

2. **Ao concluir, Definition of Done.** Uma história é considerada concluída quando o código está na branch principal com revisão por par, os testes de aceitação derivados dos critérios passam na integração contínua, não há erro de padronização de código e a documentação foi atualizada quando aplicável.

3. **Com o cliente, Sprint Review.** Ao final de cada sprint o incremento é demonstrado às representantes do Instituto, que o exercitam com cenários reais de uma atividade. O feedback é registrado em ata e incorporado ao Product Backlog antes do planejamento da sprint seguinte. Nas sprints em que o Instituto não tiver agenda, a validação é feita pelo Product Owner interno e confirmada com o Instituto na conversa quinzenal seguinte.

A primeira validação já aconteceu antes do desenvolvimento. Em 02/09/2026, após ler a proposta de solução, as representantes do Instituto responderam que a equipe havia acertado na dor da organização, o que confirmou o problema descrito na seção 1.4 e os objetivos da seção 2 como ponto de partida do backlog.
