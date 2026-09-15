# 7. Interação entre equipe e cliente

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Seções 4, 5, 6 e 7 redigidas para o site | Equipe CyberSetor |
| 15/09/2026 | 1.3 | Reestruturação do processo de validação, papel do PO interno como persona e rotina semanal (Issue #23) | Equipe CyberSetor |

## 7.1 Composição da Equipe

A equipe é formada por seis estudantes. Todos compõem o Time de Desenvolvimento, que estima, seleciona o que cabe na sprint, constrói e testa. Dois papéis do Scrum estão designados: o Product Owner interno e o Scrum Master.

| Integrante | Matrícula | GitHub | Papel | Responsabilidades |
|---|---|---|---|---|
| Maria Eduarda Denis Duarte Marques | 232014502 | [@mariadenis](https://github.com/mariadenis) | Líder da equipe · Product Owner interno | Contato com o Instituto; personifica as representantes entre as reuniões semanais para apoiar decisões operacionais do time; ordena o Product Backlog por valor; Dupla A (seção 1) |
| Vinicius Angelo de Brito Vieira | 190118059 | [@viniciusvieira00](https://github.com/viniciusvieira00) | Scrum Master | Facilita as cerimônias; remove impedimentos; zela pelo processo, pelos prazos e pela infraestrutura do repositório e do site; Dupla B (seção 2) |
| Rodrigo Henrique Donato de Souza | 241012374 | [@Fofodoido](https://github.com/Fofodoido) | Time de Desenvolvimento | Análise competitiva e intervenção social; diagramas e representações visuais; Dupla B (seções 2 e 3) |
| Lucas de Paula Leal | 232004480 | [@lucaspaulaleal](https://github.com/lucaspaulaleal) | Time de Desenvolvimento | Relator das reuniões e guarda das transcrições; estratégia de engenharia de software; Dupla C (seções 4 a 6) |
| Daniel da Silva Batista | 231011201 | [@daniboycam](https://github.com/daniboycam) | Time de Desenvolvimento | Cenário atual, Rich Picture e mapa de stakeholders; Dupla A (seção 1) |
| Caio Flávio de Lima Martins Junior | 231011168 | [@caioflmjr](https://github.com/caioflmjr) | Time de Desenvolvimento | Engenharia de requisitos e cronograma; frente de operação sem conexão e infraestrutura no desenvolvimento; Dupla C (seções 4 a 6) |

O Product Owner interno é a mitigação para duas limitações conhecidas: a dependência da disponibilidade contínua do Product Owner, no Scrum, e a dependência do cliente presente em tempo integral, no XP. O Instituto No Setor não dispõe de equipe de tecnologia e atua com agenda reduzida. O papel do PO interno é atuar como *persona* informada para orientar a equipe no intervalo semanal, sem substituir o cliente: dúvidas e decisões de domínio são levadas às reuniões semanais com as representantes reais.

## 7.2 Comunicação

**Ferramentas**

- **WhatsApp:** comunidade *CyberSetor - Requisitos*, com três grupos: *Avisos*, para comunicados; *CyberSetor - Geral*, para discussão e decisões; e *Dailys*, exclusivo para a daily assíncrona. É também o canal ágil de mensagens com as representantes do Instituto.
- **Google Meet:** reuniões da equipe e videochamadas com o Instituto. Gravações e transcrições automáticas funcionam exclusivamente como insumo bruto de apoio armazenado no Google Drive com acesso restrito; o registro oficial é a ata sintética elaborada pelo relator, revisada contra dados sensíveis (LGPD) e publicada na página de atas.
- **GitHub:** repositório do projeto, Product Backlog e Sprint Backlog no GitHub Projects e Issues, feedback do professor por issues e publicação deste site.
- **Google Docs:** rascunho colaborativo do documento. A entrega é o site; o rascunho não substitui a publicação.

**Reuniões e frequência**

- **Daily assíncrona:** todo dia útil, até as 12h, no grupo *Dailys*, com o que foi feito, o que será feito e os impedimentos. Impedimento declarado é resolvido ou escalado pelo Scrum Master em até 24 horas.
- **Sprint Planning:** na primeira terça-feira de cada sprint, cerca de uma hora, no Google Meet.
- **Refinamento do backlog:** semanal, cerca de trinta minutos, no Google Meet. É onde a Engenharia de Requisitos acontece no dia a dia.
- **Reunião semanal com o cliente:** encontros semanais com as representantes do Instituto para validação contínua de iterações e refinamento.
- **Sprint Review:** na última terça-feira de cada sprint, cerca de uma hora, demonstrando o incremento integrado ao Instituto.
- **Retrospectiva:** ao final de cada unidade da disciplina, cerca de quarenta minutos. O resultado vai para a seção 11.

**Interação com o cliente**

As interlocutoras são Maria Clara e Maria Eduarda, do núcleo pedagógico. O contato corrente é por WhatsApp e e-mail, e as validações ocorrem em reuniões semanais regulares. Encontros presenciais na sede do Instituto são realizados quando a elicitação ou validação exige observação direta em campo, com gravação autorizada para consulta da equipe. A primeira reunião ocorreu em 20/08/2026 por videoconferência; em 02/09/2026 o Instituto validou a proposta de solução; e em 08/09/2026 foi realizada a imersão presencial na sede do Instituto.

## 7.3 Processo de Validação

A validação dos requisitos e da solução é um processo contínuo e centrado no cliente, estruturado em torno das reuniões semanais com as representantes do Instituto No Setor:

1. **Validação com prototipação leve:** nas fases iniciais e a cada novo fluxo concebido, telas e navegações preliminares são apresentadas às representantes para validar a adequação da interface e do fluxo operacional antes do desenvolvimento completo.
2. **Demonstração do MVP funcional mínimo:** com o avanço do desenvolvimento, as iterações e incrementos são demonstrados e exercitados com cenários reais das oficinas e eventos do Instituto, confirmando se o comportamento construído resolve de fato os gargalos de registro e prestação de contas.
3. **Identificação conjunta de ambiguidades, inconsistências e omissões:** a equipe e as interlocutoras analisam ativamente cada funcionalidade demonstrada para identificar lacunas de regras de negócio, comportamentos inesperados ou fluxos ausentes.
4. **Registro em ata e refinamento contínuo:** os apontamentos e acordos estabelecidos nas reuniões de validação são formalmente sintetizados em ata de reunião, alimentando o refinamento imediato do Product Backlog e o planejamento das sprints seguintes.
5. **Papel do Product Owner interno:** o PO interno não valida o trabalho da equipe pelo cliente. Seu papel é personificar as representantes do Instituto no dia a dia dos desenvolvedores, destravando decisões e dúvidas operacionais no intervalo entre as reuniões semanais. Toda decisão de domínio, regra de prestação de contas ou alteração de escopo é submetida e confirmada com as representantes reais nas reuniões semanais.
6. **Treinamento operacional e homologação:** nas etapas finais do semestre, as reuniões semanais serão também aproveitadas para conduzir sessões práticas de treinamento das facilitadoras e da coordenação no uso da ferramenta, garantindo autonomia operacional e validação em uso real antes da transferência definitiva.

*Nota sobre DoR e DoD:* Os critérios de entrada (Definition of Ready) e de saída (Definition of Done) das histórias de usuário pertencem à governança das sprints e à garantia de qualidade interna da equipe, sendo detalhados formalmente na Seção 9 (Unidade 2).
