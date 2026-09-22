# Scripts de apoio ao repositório

| Script | O que faz | Quando roda |
|---|---|---|
| `criar-labels.sh` | Cria ou atualiza o catálogo de rótulos (`tipo:`, `epico:`, `er:`, `stack:`, `origem:`, `sprint:`, apoio). Idempotente. | Manualmente, quando o catálogo muda. `DRY_RUN=1` só mostra. |
| `fetch_issues.py` | Gera as páginas de acompanhamento do site a partir das issues e do quadro: `docs/entregas/debitos-u1.md` (issues do docente) e `docs/gestao/sprints/tarefas-sprint-N.md` (uma por sprint). | Nos workflows `build-check` e `deploy-docs`; nunca versionar a saída. |

Rótulos e campos do quadro têm papéis distintos: o rótulo classifica a issue ao nascer (`tipo:`, `epico:`, `er:`, `stack:`); o quadro acompanha (Status, Sprint, MoSCoW com justificativa, esforço técnico, MVP). Toda issue e todo PR entram no quadro pelo workflow nativo de auto-add.

Os formulários de abertura de issue estão em `../ISSUE_TEMPLATE/` e já aplicam o rótulo `tipo:`. Os rascunhos de issues usados para criar as tarefas da Sprint 1 e da Unidade 2 e os scripts de criação única (issues e quadro) foram removidos em 22/09/2026, porque a fonte passou a ser a própria issue no GitHub; o histórico do git os preserva.
