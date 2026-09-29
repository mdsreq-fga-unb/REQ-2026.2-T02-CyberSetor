# Ata — Sprint 1 Review e Retrospective — 22/09/2026

Reunião de encerramento da Sprint 1 da equipe CyberSetor, integrando os ritos de **Sprint Review** (inspeção do incremento produzido e validação das metas) e **Sprint Retrospective** (avaliação do processo, dinâmicas de time e definição de melhorias para a Sprint 2).

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-09-22-RR |
| **Tipo** | Sprint Review e Sprint Retrospective |
| **Data** | 22/09/2026 (terça-feira) |
| **Horário** | 20:52 – ~22:20 · duração ~88 min |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Maria Eduarda Marques, Rodrigo Henrique, Daniel Batista, Lucas De Paula Leal e Caio Martins |
| **Participantes — externos** | Não se aplica (rito interno de equipe) |
| **Condução** | Vinicius Vieira (Scrum Master) e Maria Eduarda Marques (Product Owner) |
| **Registro** | Transcrição automática via IA · consolidação: Vinicius Vieira e Caio Martins |
| **Sprint** | Sprint 1 (encerramento) |
| **Documentos relacionados** | [Ata da Sprint 1 Planning](2026-09-08-sprint-planning.md) · [Plano da Sprint 1](../sprints/sprint-1.md) |

---

## 1. Pauta

1. **Sprint Review:**
   - Inspeção dos artefatos entregues na Sprint 1: dojos técnicos/processo, páginas de requisitos, matriz de rastreabilidade inicial e atualizações pós-visitas presenciais.
   - Análise de metas não alcançadas, desvios de escopo e resolução dos débitos da Unidade 1 apontados pela avaliação docente.
2. **Sprint Retrospective:**
   - O que funcionou bem durante a Sprint 1.
   - O que gerou atrito, gargalos ou retrabalho (conflitos de merge e gestão de branches).
   - Medidas corretivas: segurança de versionamento, rotinas de backup da documentação e disciplina nos ritos.
3. **Encaminhamentos para a Sprint 2:**
   - Transição e preparação para a Sprint 2 Planning agendada para 23/09.

---

## 2. Resumo da Sprint Review

A equipe inspecionou o trabalho realizado ao longo das duas semanas da Sprint 1. As entregas centrais planejadas — realização dos dojos técnicos (NestJS/Prisma) e metodológicos (histórias INVEST), imersão presencial no cliente (visitas de 08/09 e 21/09) e estruturação do catálogo preliminar de requisitos — foram formalmente concluídas.

No entanto, a equipe constatou **desvios de escopo**: durante a elicitação, foi mapeado um número excessivo de requisitos (+30 funcionais e +20 não funcionais) sem critérios de aceitação e DoR consolidados, gerando dispersão de esforço. Além disso, a absorção dos débitos da Unidade 1 exigiu retrabalho emergencial que consumiu tempo que deveria ter sido dedicado à lapidação das histórias de usuário. O incremento foi aprovado com a condição de que a Sprint 2 concentre-se estritamente na priorização MoSCoW e no saneamento do backlog.

---

## 3. Resumo da Sprint Retrospective

### 3.1 O que funcionou bem
* **Imersão no cliente:** As reuniões presenciais na sede do Instituto (08/09 e 21/09) e o alinhamento com a gestão (15/09) permitiram compreender com profundidade a Matriz de Aquisição e as dores da equipe de Franci e Rafael.
* **Coesão e dojos:** As sessões de nivelamento técnico cumpriram o objetivo de integrar os membros menos experientes com a stack do projeto.
* **Apoio da monitoria:** A sessão realizada com a monitora Camila Careli forneceu direcionamento preventivo essencial sobre riscos de escopo.

### 3.2 O que não funcionou bem (pontos de atrito)
* **Gestão de ramificações e conflitos de merge:** A integração simultânea de múltiplos arquivos markdown de requisitos gerou conflitos complexos na branch `main`, causando apreensão quanto à perda de conteúdo.
* **Desvio de escopo:** Mapeamento de funcionalidades muito além da capacidade temporal de um semestre acadêmico (ex.: módulos complexos de gestão de emendas e dashboards multifuncionais).
* **Atraso na consolidação de atas:** O acúmulo de notas e gravações brutas sem síntese tempestiva no repositório sobrecarregou os relatores.

### 3.3 Ações de melhoria decididas
* **Rotina preventiva de backup e branches higienizadas:** Criar branches de apoio e backups locais estruturados antes de operações de merge crítico na documentação.
* **Adoção intransigente do MoSCoW:** Cortar sumariamente qualquer funcionalidade que não faça parte do núcleo essencial (*Must-have*) de comprovação em campo e prestação de contas.
* **Regularização imediata das atas e evidências:** Fechar o passivo de atas da Sprint 1 e documentar formalmente os ritos na página de processos.

---

## 4. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | **Aprovação condicionada do incremento da Sprint 1** | Os objetivos principais foram atingidos, mas o backlog exige saneamento imediato | Encerramento formal da Sprint 1 |
| D2 | **Refinamento e corte de escopo via MoSCoW na Sprint 2** | Eliminar excessos mapeados e garantir a viabilidade técnica do MVP para a Unidade 2 | Foco nos itens *Must-have* da Sprint 2 |
| D3 | **Instituição de rotina de segurança e backup para merges documentais** | Evitar perda acidental de seções de documentação durante resoluções de conflito no Git | Redução de risco operacional no GitHub |
| D4 | **Publicação completa das atas acumuladas e regularização dos registros de ritos** | Cumprir os critérios metodológicos de transparência e rastreabilidade da disciplina | Regularização da página de atas e processos |

---

## 5. Próximas etapas

| # | Ação | Responsável | Prazo |
|---|---|---|---|
| A1 | Consolidar e revisar as atas pendentes da Sprint 1 no repositório | Relatores / Caio Martins e Vinicius Vieira | 23/09/2026 |
| A2 | Preparar a planilha e backlog preliminar para a Sprint 2 Planning | Vinicius Vieira e Maria Eduarda Marques | 23/09/2026 (tarde) |
| A3 | Realizar a cerimônia de Sprint 2 Planning | Equipe CyberSetor | 23/09/2026 (21h) |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 22/09/2026 | Vinicius Vieira | Registro preliminar dos debates da Review e Retrospectiva |
| 0.2 | 29/09/2026 | Caio Martins | Estruturação formal dos ritos de Review e Retrospectiva, detalhamento dos planos de ação e formatação institucional |
| 1.0 | 29/09/2026 | Vinicius Vieira | Validação final e homologação interna pela equipe |
