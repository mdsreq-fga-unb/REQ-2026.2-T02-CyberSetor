# 4. Estratégias de engenharia de software

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 05/09/2026 | 1.1 | Revisão com foco único nas seções 1.4, 1.5, 1.7, 2.1 e 2.2 | Equipe CyberSetor |
| 06/09/2026 | 1.2 | Seções 4, 5, 6 e 7 redigidas para o site | Equipe CyberSetor |

A partir do cenário descrito na seção 1 e da solução proposta na seção 2, a equipe tomou as decisões de estratégia de engenharia de software registradas a seguir, nas três camadas que o referencial da disciplina distingue: abordagem, ciclo de vida e processo.

## 4.1 Estratégia Priorizada

| Camada | Decisão |
|---|---|
| **Abordagem de desenvolvimento** | Ágil |
| **Ciclo de vida** | Incremental e Iterativo |
| **Processo de engenharia de software** | ScrumXP |

O ScrumXP combina o Scrum, framework de gerenciamento que define papéis, cerimônias e artefatos, com o eXtreme Programming (XP), que fornece as práticas técnicas de engenharia. Conforme o referencial da disciplina, um framework como o Scrum pode ser combinado com práticas técnicas de um processo como o XP para formar uma abordagem completa ao desenvolvimento (MARSICANO, 2026). O Scrum responde por quando e por quem o trabalho é feito; o XP responde por como ele é construído.

## 4.2 Quadro Comparativo

O quadro a seguir compara o OpenUP e o ScrumXP em características relevantes para o caso do Instituto No Setor, no mesmo conjunto de critérios usado no exemplo de referência da disciplina.

| Característica | OpenUP | ScrumXP |
|---|---|---|
| Abordagem geral | Iterativo, incremental e baseado em arquitetura sólida | Iterativo e incremental, com foco em entregas rápidas e feedback contínuo |
| Foco em arquitetura | Forte ênfase em uma arquitetura sólida e flexível definida desde o início | Menor foco inicial; a arquitetura evolui conforme a necessidade |
| Estrutura de processos | Fases claras (Iniciação, Elaboração, Construção, Transição); mais estruturado, ainda que iterativo | Sprints curtas e flexíveis, com entregas incrementais e adaptação contínua |
| Flexibilidade de requisitos | Flexível, mas exige que a arquitetura principal esteja definida nas fases iniciais | Alta flexibilidade para mudanças a cada sprint, com base no feedback do cliente |
| Colaboração com o cliente | Envolvimento contínuo, concentrado nas fases de entrega e validação | Envolvimento constante, com feedback ao final de cada sprint |
| Complexidade do processo | Mais formal, com documentação e fases estruturadas; exige mais disciplina e definição prévia | Mais leve, com menos documentação formal e mais foco na entrega funcional |
| Qualidade técnica | Assegurada pela arquitetura definida no início e pela validação incremental | Assegurada por práticas como testes automatizados, programação em pares e integração contínua |
| Práticas de desenvolvimento | Foco em arquitetura e controle de progresso; poucas práticas técnicas prescritas | Práticas técnicas robustas embutidas no processo |
| Documentação | Formal por fase, com ênfase em requisitos e arquitetura | Apenas o essencial, com foco em comunicação e feedback rápido |
| Controle de qualidade | Validações incrementais e revisões de arquitetura a cada fase | Embutido nas práticas do XP, com o software validado continuamente |
| Escalabilidade | Projetos maiores e mais complexos, com equipes médias a grandes | Mais indicado para equipes pequenas e médias, pela abordagem colaborativa |
| Suporte a equipes | Equipes maiores, com papéis mais definidos e mais controle sobre fases | Equipes menores e colaborativas, com papéis mais flexíveis |
| Adaptação ao projeto CyberSetor | Exigiria arquitetura e documentação definidas antes de a equipe conhecer o domínio, e o referencial da disciplina o aponta como menos adequado a equipes inexperientes | Equipe de seis estudantes, requisitos que emergem da conversa com o Instituto, quatro entregas em datas fixas e validação por sprint. É o cenário que o processo foi feito para atender |

## 4.3 Justificativa

A escolha do ScrumXP tem, antes de tudo, um argumento de coerência metodológica. O referencial da disciplina registra que os sete valores da Engenharia de Requisitos que ela adota (comunicação, feedback, simplicidade, coragem, respeito, compromisso e confiança) são derivados e adaptados principalmente do eXtreme Programming e do Scrum, acrescidos da confiança (MARSICANO, 2026, §5.4.1). Seis dos sete valores vêm exatamente do par escolhido. Adotar o ScrumXP alinha a prática da equipe ao arcabouço de valores da própria disciplina, e nenhuma outra combinação tem esse alinhamento.

Com base nas características do projeto e nos desafios do Instituto No Setor, o ScrumXP é o processo mais adequado pelos seguintes motivos:

1. **Flexibilidade e entregas rápidas.** A equipe é reduzida, o prazo é de um semestre com quatro entregas em datas fixas e o escopo é a variável de ajuste. Sprints de duas semanas permitem entregas incrementais com feedback do Instituto a cada ciclo, e a disciplina já impõe quatro ciclos com revisão e retrospectiva, o que torna o projeto iterativo e incremental por construção.

2. **Práticas de qualidade técnica.** A equipe levantou o próprio conhecimento por uma matriz de competências e identificou lacunas em parte da pilha tecnológica. Integração contínua, programação em pares, propriedade coletiva do código e testes de aceitação compensam a inexperiência e funcionam como nivelamento técnico durante a construção.

3. **Adaptação ao nível de conhecimento da equipe.** O ScrumXP é mais colaborativo e iterativo do que o OpenUP, que exigiria arquitetura e documentação definidas nas fases iniciais, quando a equipe ainda está conhecendo o domínio do terceiro setor. O referencial da disciplina aponta o OpenUP como menos estruturado para equipes inexperientes.

4. **Foco na entrega de valor.** O Instituto precisa ver o núcleo da solução funcionando cedo: registro de atividade, participação, meta e relatório. Ciclos curtos com Product Backlog priorizado por valor garantem que esse núcleo seja construído e validado antes de qualquer módulo acessório.

Um risco conhecido do XP é a dependência do cliente presente, e o Instituto atua com equipe reduzida e agenda limitada. A mitigação está registrada na seção 7: um Product Owner interno consolida o entendimento entre as validações, e as práticas de XP são adotadas de forma seletiva.

As demais alternativas foram descartadas com base no referencial da disciplina:

| Alternativa | Motivo do descarte |
|---|---|
| Abordagem dirigida por plano e ciclo de vida preditivo | Pressupõem requisitos estáveis e conhecidos desde o início e entrega ao final; o projeto parte de requisitos que emergem da conversa com o Instituto e exige quatro entregas parciais |
| Cascata e Modelo V | Adequados a sistemas regulamentados ou de missão crítica; o sobrecusto de verificação formal não se justifica |
| Espiral | Exige expertise em avaliação de riscos e é custoso de gerenciar; indicado a projetos grandes |
| Processo Unificado completo | Documentação potencialmente excessiva e curva de aprendizado acentuada para um escopo enxuto |
| FDD | Pressupõe equipe experiente em orientação a objetos e modelo de domínio estável |
| Kanban isolado | Menos estruturado para planejamento e voltado a fluxo contínuo de suporte e manutenção |
| SAFe e LeSS | Frameworks de escala para múltiplas equipes |
