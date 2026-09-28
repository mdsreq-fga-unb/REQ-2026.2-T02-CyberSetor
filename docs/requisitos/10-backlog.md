# 10. Backlog de Produto e Priorização

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 27/09/2026 | 1.0 | Estruturação inicial da seção e registro da avaliação de esforço técnico dos requisitos de CP1, CP6 e CP8 (Atividade 4) | Daniel Batista e Rodrigo Henrique |

---

## 10.1 Metodologia de Priorização e Esforço Técnico

A priorização de requisitos do projeto CyberSetor orienta-se pela metodologia de matriz bidimensional de valor versus esforço, conforme as diretrizes da Engenharia de Requisitos e o plano de ensino da disciplina. O processo articula dois eixos fundamentais:

- **Eixo Vertical — Valor de Negócio (1 a 4):** Atribuído diretamente pelo cliente (Instituto No Setor) em sessão de validação orientada pelas histórias de usuário, ponderando criticidade para o problema central, abrangência de atendimento, urgência e obrigações legais/institucionais.
- **Eixo Horizontal — Esforço Técnico (1 a 4):** Avaliado pela equipe técnica a partir da consolidação de três dimensões complementares:
  1. **Esforço estimado em horas:** $1$ (até 2h), $2$ (2 a 6h), $3$ (6 a 12h) e $4$ (mais de 12h).
  2. **Complexidade algorítmica e de regras de negócio:** $1$ (baixa / solução padrão), $2$ (média / múltiplas regras), $3$ (alta / incerteza de regras) e $4$ (muito alta / risco arquitetural).
  3. **Lacuna de capacidade da equipe:** $1$ (tecnologia e stack dominadas), $2$ (conhecimento básico nivelado), $3$ (requer pesquisa/estudo adicional) e $4$ (tecnologia não dominada).

O **Esforço Técnico Final** de cada requisito funcional é obtido pela média aritmética das três dimensões, arredondada para o inteiro mais próximo (frações $\ge 0{,}5$ arredondam para cima):

$$\text{Esforço Técnico} = \text{round}\left(\frac{\text{Esforço (Horas)} + \text{Complexidade} + \text{Lacuna de capacidade}}{3}\right)$$

A fundamentação da lacuna de capacidade baseia-se na **Matriz de Competências e Stack** do projeto, considerando os dojos de nivelamento técnico (Prisma ORM, NestJS e componentes visuais) realizados pela equipe.

---

## 10.2 Avaliação de Esforço Técnico dos Requisitos (CP1, CP6 e CP8)

A tabela a seguir consolida a apuração das notas técnicas para os requisitos funcionais das Características de Produto sob responsabilidade dos épicos de *Requisito e Meta* e *Relatório*:

| Código | Requisito Funcional | Esforço (Horas) | Complexidade | Lacuna de Capacidade | Média | Esforço Técnico Final | Fundamentação Técnica (Pós-Dojos) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **RF01** | Cadastrar instrumento convocatório e parceria | 2 | 1 | 1 | 1,33 | **1** | CRUD administrativo padrão em Next.js e PostgreSQL (stack consolidada). |
| **RF02** | Anexar documento formal homologado de parceria | 2 | 1 | 1 | 1,33 | **1** | Upload de arquivo digital e persistência de metadados no banco. |
| **RF03** | Cadastrar projeto operacional | 1 | 1 | 1 | 1,00 | **1** | Formulário direto de cadastro com relacionamento 1:N no Prisma. |
| **RF04** | Desdobrar requisitos contratuais e metas | 2 | 2 | 1 | 1,67 | **2** | Modelagem relacional N:N no Prisma para amarração de metas a cláusulas. |
| **RF05** | Atribuir responsável e setor executor a meta | 1 | 1 | 1 | 1,00 | **1** | Associação direta de campos de chave e governança de setor. |
| **RF06** | Fixar prazo fatal e status de meta | 1 | 1 | 1 | 1,00 | **1** | Atualização de campos de data limite e máquina de estados de status. |
| **RF07** | Exibir linha do tempo e painel de prazos de metas | 2 | 2 | 1 | 1,67 | **2** | Componente visual de linha do tempo com filtros temporais em shadcn/ui. |
| **RF08** | Emitir alertas de proximidade e pendências de metas | 2 | 2 | 1 | 1,67 | **2** | Consultas condicionais de intervalo de datas e verificação de pendências. |
| **RF28** | Calcular progresso físico de metas automaticamente | 3 | 2 | 1 | 2,00 | **2** | Lógica de agregação de presenças validadas e evidências homologadas via serviços no NestJS. |
| **RF29** | Parametrizar apuração de metas por acúmulo contínuo ou marco de entrega | 2 | 1 | 1 | 1,33 | **1** | Parametrização condicional de fórmula conforme modalidade da meta cadastrada. |
| **RF30** | Emitir alertas de risco de inexecução | 3 | 2 | 1 | 2,00 | **2** | Comparação algorítmica entre o percentual realizado e a fração temporal decorrida do cronograma. |
| **RF31** | Versionar metas por Termo Aditivo | 3 | 2 | 1 | 2,00 | **2** | Esquema de versionamento com snapshots históricos de metas no Prisma. |
| **RF35** | Exigir justificativa prévia para metas não atingidas | 1 | 1 | 1 | 1,00 | **1** | Validação transacional de bloqueio de encerramento sem justificativa registrada. |
| **RF36** | Emitir Relatório de Execução do Objeto | 3 | 2 | 1 | 2,00 | **2** | Agrupamento de indicadores previstos versus realizados e ordenação cronológica do índice de evidências. |
| **RF37** | Gerar relatório diagramado em PDF | 4 | 3 | 2 | 3,00 | **3** | Diagramação de impressão de relatório formal em PDF com templates e ajustes de quebra de página via Puppeteer. |
| **RF38** | Exportar dados analíticos e consolidados em planilha aberta | 2 | 1 | 1 | 1,33 | **1** | Geração e download de arquivo tabular estruturado (CSV) a partir de consultas na base. |
| **RF39** | Registrar trilha de auditoria das operações de prestação de contas | 2 | 1 | 1 | 1,33 | **1** | Registro automático de snapshots de alterações e justificativas em tabela de log permanente. |

---

!!! note "Próximas Etapas da Priorização e MVP"
    As notas de **Valor de Negócio (1 a 4)** serão colhidas junto ao Instituto No Setor na sessão de validação de 28/09/2026. A partir do cruzamento entre Valor de Negócio e o Esforço Técnico consolidado nesta seção, será construída a **Matriz 4 × 4** definitiva e a delimitação do **MVP** (Mínimo Produto Viável) do sistema CyberSetor.