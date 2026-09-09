---
title: HU-05 Geracao do relatorio de execucao do objeto
assignees: caioflmjr,lucaspaulaleal
labels: tipo: historia,epico: relatorio,er: declaracao,sprint: 1
---
> Como Diretora de Projetos, quero gerar o relatório de execução do objeto de um projeto para um período determinado, com metas propostas confrontadas aos resultados alcançados e evidências anexadas, para prestar contas sem montagem manual.

**Origem:** CP08, reposicionada pela análise da reunião presencial.

### Critérios de aceitação

| ID | Critério |
|---|---|
| CA-05.1 | Dado um projeto com requisitos e atividades registrados, quando solicito o relatório de um período, então cada meta é apresentada com resultado alcançado, percentual de cumprimento e evidências vinculadas |
| CA-05.2 | Dado uma meta cumprida parcialmente, quando o relatório é gerado, então o sistema exige justificativa formal antes de permitir a finalização |
| CA-05.3 | Dado um relatório finalizado, quando efetuo a exportação, então recebo os formatos PDF e CSV com o mesmo conteúdo |

### Fundamento normativo de CA-05.2

A Lei 13.019/2014, art. 64, parágrafo 1º, estabelece que meta descumprida sem justificativa enseja glosa. A obrigatoriedade da justificativa é requisito de conformidade legal, não preferência de interface.
