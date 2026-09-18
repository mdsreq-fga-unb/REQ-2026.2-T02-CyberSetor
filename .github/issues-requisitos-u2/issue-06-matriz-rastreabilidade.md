---
title: "[Tarefa Dupla A] Construir Matriz de Rastreabilidade Bidirecional dos Requisitos"
assignees: mariadenis,daniboycam
labels: "tipo: tarefa,er: organizacao,sprint: 1,moscow: must"
---
## Objetivo da Atividade
A **Dupla A** (`mariadenis` e `daniboycam`), responsável pelo artefato `D2` no planejamento da Sprint 1, deve **estruturar, preencher e validar a Matriz de Rastreabilidade Bidirecional** de todos os Requisitos Funcionais (RFs) e Não Funcionais (RNFs) gerados pelas duplas, garantindo a ligação contínua desde as dores reais do cliente até os critérios de aceitação.

---

## Insumos e Leituras Obrigatórias
1. **Artefatos de Origem (Problemas do Cliente):**
   - Branch `integracao/u1-correcoes` — `docs/requisitos/b1-bpmn-processo-atual.md`: Gargalos Operacionais **G01 a G06**.
   - `docs/visao/2-solucao-proposta.md`: Objetivos Específicos **OE01 a OE06** e Características de Produto **CP1 a CP8**.
   - `docs/visao/3-intervencao-social.md`: Riscos Éticos e Mitigações Sociais (Seções 3.3 e 3.4).
2. **Artefatos de Engenharia (Declaração):**
   - Todos os Requisitos Funcionais (`RF01` a `RFxx`) gerados pelas Duplas B, C e A.
   - Todos os Requisitos Não Funcionais (`RNF01` a `RNFxx`) consolidados pelo SM e PO.
   - `docs/gestao/sprints/sprint-1.md`: Histórias de Usuário **HU-01 a HU-06** e seus Critérios de Aceitação (CA).

---

## Passo a Passo: O que a Dupla Deve Fazer

### 1. Mapear a Rastreabilidade *Backward-From* (Origem ← Requisito)
A dupla deve montar uma tabela garantindo que **nenhum requisito exista sem justificativa de negócio**:
- Cada RF deve apontar claramente para sua Característica de Produto (`CPx`) de origem.
- Cada RF deve estar ancorado a pelo menos um Objetivo Específico (`OEx`) ou Gargalo BPMN (`Gx`).
- Cada RNF deve estar associado a uma decisão arquitetural (Seção 2.4), a um risco ético mitigado (Seção 3.3) ou a um dispositivo normativo (MROSC / LGPD).

### 2. Mapear a Rastreabilidade *Forward-To* (Requisito → Implementação / Verificação)
A dupla deve mapear como os requisitos declarados se desdobram nas histórias e critérios de aceitação:
- Indicar para cada RF qual História de Usuário (`HU-xx`) o materializa ou se trata de um requisito candidato para novas histórias nas próximas sprints.
- Indicar os Critérios de Aceitação (`CA-xx.y`) observáveis que verificam o cumprimento daquele requisito.

### 3. Verificar Lacunas e Inconsistências (Auditoria de Requisitos)
A dupla deve auditar o conjunto completo respondendo:
- Existe alguma Característica de Produto sem nenhum RF mapeado? (Se houver, apontar a lacuna para a dupla responsável).
- Existe algum RF sem correspondência em nenhuma CP? (Se houver, verificar se é excesso de escopo (*gold plating*)).
- Todos os gargalos críticos do BPMN (G01 a G06) foram mitigados por pelo menos um RF ou RNF?

---

## Estrutura Recomendada para a Matriz Tabular

| Código RF / RNF | Nome do Requisito | CP de Origem | Objetivo Específico (OE) | Gargalo BPMN / Mitigação Ética | História / Critério de Aceitação |
|:---:|---|:---:|:---:|:---:|:---:|
| **RF01** | Cadastrar instrumento convocatório e projeto | CP1 | OE01 | G01 (Destrinchamento manual) | HU-01 (CA-01.1) |
| **...** | ... | ... | ... | ... | ... |
| **RNF03** | Persistência local em modo desconectado | CP4 | OE03 | Seção 3.3.3 (Sincronização sem conexão) | Arquitetura Dexie / HU-03 |

---

## Definição de Pronto (DoD)
- [ ] Matriz bidirecional completa estruturada em Markdown tabular.
- [ ] 100% dos RFs e RNFs vinculados sem itens órfãos (*backward* e *forward*).
- [ ] Relatório de consistência confirmando cobertura dos gargalos G01 a G06 e das características CP1 a CP8.
- [ ] Tabela entregue para publicação na página `docs/requisitos/8-requisitos.md`.
