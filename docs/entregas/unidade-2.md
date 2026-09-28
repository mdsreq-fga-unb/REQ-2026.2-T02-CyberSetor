# Síntese de Entregas — Unidade 2

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 19/09/2026 | 1.0 | Registro da entrega do Catálogo de Requisitos e Rastreabilidade (Marco da Sprint 1) | Dupla B (Rodrigo Henrique e Vinicius Vieira) |
| 21/09/2026 | 1.1 | Status ajustado à situação real das issues #39 a #45 e à consolidação da numeração única | Maria Eduarda Marques |
| 21/09/2026 | 1.2 | Consolidação final da Seção 8 com a Matriz Bidirecional (Issue #44) e publicação unificada (Issue #45) | Rodrigo Henrique e Vinicius Vieira |
| 21/09/2026 | 1.3 | Status e checklist alinhados à versão 2.1 da Seção 8: âncoras restauradas, valores iniciais marcados, validação e priorização registradas como etapas pendentes com seus prazos | Equipe CyberSetor |

---

## 1. Visão Geral da Entrega

A entrega da Unidade 2 consolida a especificação formal de requisitos de software da plataforma CyberSetor para o Instituto No Setor, compreendendo o levantamento das Características de Produto (CP1 a CP8), os Requisitos Funcionais, os Requisitos Não Funcionais (FURPS+ e Sommerville) e a Matriz de Rastreabilidade Bidirecional.

* **Marcos:** lista de requisitos em 22/09/2026 (fechamento da Sprint 1); MVP com ajustes e validações em 29/09/2026; a Unidade 2 vence em 13/10/2026.
* **Status:** 🟢 **Lista de requisitos publicada.** Catálogo oficial unificado (RF01 a RF37 e RNF01 a RNF18) e Matriz de Rastreabilidade Bidirecional integrados na Seção 8. A priorização e o recorte do MVP são a etapa seguinte; nenhum requisito está validado pelo Instituto nem aprovado pelo docente (seção 8.1).
* **Documento Oficial de Requisitos:** [Seção 8 — Requisitos de Software](../requisitos/8-requisitos.md)

---

## 2. Checklist de Conformidade Metodológica

- [x] **Identificadores Únicos:** Todos os requisitos funcionais (`RF01` a `RF37`) e não funcionais (`RNF01` a `RNF18`) possuem códigos em sequência única e âncoras para rastreamento direto.
- [x] **Padrão Gramatical dos RFs:** Nome de cada requisito funcional no padrão `Verbo no Infinitivo + Objeto Direto`, com uma única ação verificável.
- [x] **Dupla Classificação dos RNFs:** Requisitos não funcionais classificados simultaneamente segundo as taxonomias **FURPS+** e **Ian Sommerville**.
- [x] **Métricas Auditáveis nos RNFs:** Cada requisito não funcional acompanhado de critério objetivo e quantitativo para testes automatizados.
- [x] **Conformidade Legal:** Requisitos parametrizados com o Marco Regulatório das Organizações da Sociedade Civil (Lei 13.019/2014) e com a LGPD (Lei 13.709/2018).
- [x] **Rastreabilidade Bidirecional:** Matriz completa relacionando gargalos do BPMN (`G01` a `G06`), Objetivos Específicos (`OE01` a `OE06`), Características de Produto (`CP1` a `CP8`), RFs, RNFs e Histórias de Usuário (`HU-01` a `HU-06`), integrada na Seção 8.4.
- [ ] **Critérios de Aceitação Detalhados:** Detalhamento dos critérios pendentes (RF22–RF25, RF32, RF37) em lista verificável, planejado para o refinamento da Sprint 2.
- [ ] **Validação Presencial com o Instituto:** Homologação presencial das hipóteses de menores de idade, dados na inscrição e matriz de perfis, e confirmação dos valores iniciais marcados 🔧 (seção 8.6 dos requisitos).
- [ ] **Priorização e MVP:** Classificação MoSCoW de cada requisito e hipótese de MVP pela matriz valor de negócio × capacidade técnica, com entrega prevista para 29/09/2026 (seções 5 e 6 do Documento de Visão).
- [ ] **Regras de Negócio e Restrições:** As regras que os requisitos referenciam estão na [seção 8.8](../requisitos/8-requisitos.md#88-regras-de-negocio) (RN-01 a RN-12); as demais regras e as restrições de escopo são consolidadas na Sprint 2.

---

## 3. Rastreamento das Atividades e Issues da Unidade 2

| Issue | Atividade / Escopo | Responsáveis | Entrega / Artefato | Situação |
| :--- | :--- | :--- | :--- | :--- |
| **#39** | Elaborar requisitos de instrumentos, projetos e metas (CP1) | Dupla B (`@viniciusvieira00`, `@Fofodoido`) | [RF01 a RF06](../requisitos/8-requisitos.md#rf01) | Integrado ao catálogo oficial |
| **#40** | Elaborar requisitos de atividades, campo offline e evidências (CP2/CP4/CP7) | Dupla C (`@caioflmjr`, `@lucaspaulaleal`) | [RF07, RF08, RF14 a RF18 e RF30 a RF32](../requisitos/8-requisitos.md#rf07) | Integrado ao catálogo oficial |
| **#41** | Elaborar requisitos de inscrição, base de pessoas e LGPD (CP3/CP5) | Dupla A (`@mariadenis`, `@daniboycam`) | [RF09 a RF13 e RF19 a RF25](../requisitos/8-requisitos.md#rf09) | Integrado ao catálogo oficial |
| **#42** | Elaborar requisitos de apuração de metas e relatórios MROSC (CP6/CP8) | Duplas B e C | [RF26 a RF29 e RF33 a RF37](../requisitos/8-requisitos.md#rf26) | Integrado ao catálogo oficial |
| **#43** | Consolidar e parametrizar RNFs (FURPS+ e Sommerville) | SM e PO | [RNF01 a RNF18](../requisitos/8-requisitos.md#rnf01) | Integrado ao catálogo oficial |
| **#44** | Construir matriz de rastreabilidade bidirecional | Dupla A (`@mariadenis`, `@daniboycam`) | [Matriz de Rastreabilidade](../requisitos/8-requisitos.md#84-matriz-de-rastreabilidade-bidirecional) | Integrada à Seção 8.4 |
| **#45** | Publicar catálogo de requisitos e rastreabilidade no GitPages | Dupla B (`@viniciusvieira00`, `@Fofodoido`) | Página oficial consolidada | Publicada; em revisão pela monitoria |
