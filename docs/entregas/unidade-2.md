# Síntese de Entregas — Unidade 2

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 19/09/2026 | 1.0 | Registro da entrega do Catálogo de Requisitos e Rastreabilidade (Marco da Sprint 1) | Dupla B (Rodrigo Henrique e Vinicius Vieira) |
| 21/09/2026 | 1.1 | Status ajustado à situação real das issues #39 a #45 e à consolidação da numeração única | Maria Eduarda Marques |

---

## 1. Visão Geral da Entrega

A entrega da Unidade 2 consolida a especificação formal de requisitos de software da plataforma CyberSetor para o Instituto No Setor, compreendendo o levantamento das Características de Produto (CP1 a CP8), os Requisitos Funcionais, os Requisitos Não Funcionais (FURPS+ e Sommerville) e a Matriz de Rastreabilidade Bidirecional.

* **Marco de Entrega:** 22/09/2026 (Sprint 1). A Unidade 2 vence em 13/10/2026.
* **Status:** 🟡 Em consolidação. O catálogo (RF01 a RF37 e RNF01 a RNF18) está redigido; a matriz de rastreabilidade bidirecional (#44) ainda está em elaboração.
* **Documento Oficial de Requisitos:** [Seção 8 — Requisitos de Software](../requisitos/8-requisitos.md)

---

## 2. Checklist de Conformidade Metodológica

- [x] **Identificadores Únicos:** Todos os requisitos funcionais (`RF01` a `RF37`) e não funcionais (`RNF01` a `RNF18`) possuem códigos em sequência única e âncoras HTML para rastreamento direto.
- [x] **Padrão Gramatical dos RFs:** Nome de cada requisito funcional no padrão `Verbo no Infinitivo + Objeto Direto`, com uma única ação verificável.
- [x] **Dupla Classificação dos RNFs:** Requisitos não funcionais classificados simultaneamente segundo as taxonomias **FURPS+** e **Ian Sommerville**.
- [x] **Métricas Auditáveis nos RNFs:** Cada requisito não funcional acompanhado de critério objetivo e quantitativo para testes automatizados.
- [x] **Conformidade Legal:** Requisitos parametrizados com o Marco Regulatório das Organizações da Sociedade Civil (Lei 13.019/2014) e com a LGPD (Lei 13.709/2018).
- [ ] **Rastreabilidade Bidirecional:** Matriz completa relacionando gargalos do BPMN (`G01` a `G06`), Objetivos Específicos (`OE01` a `OE06`), Características de Produto (`CP1` a `CP8`), RFs, RNFs e Histórias de Usuário (`HU-01` a `HU-06`). Pendente da Issue #44.
- [ ] **Critérios de Aceitação:** Redigidos como lista de critérios verificáveis. Pendente.
- [ ] **Validação com o Instituto:** Hipóteses sobre menores de idade, dados coletados na inscrição e perfis de acesso (seção 8.6 dos requisitos). Pendente.

---

## 3. Rastreamento das Atividades e Issues da Unidade 2

| Issue | Atividade / Escopo | Responsáveis | Entrega / Artefato | Situação |
| :--- | :--- | :--- | :--- | :--- |
| **#39** | Elaborar requisitos de instrumentos, projetos e metas (CP1) | Dupla B (`@viniciusvieira00`, `@Fofodoido`) | [RF01 a RF06](../requisitos/8-requisitos.md#rf01) | Integrado ao catálogo (PR #50) |
| **#40** | Elaborar requisitos de atividades, campo offline e evidências (CP2/CP4/CP7) | Dupla C (`@caioflmjr`, `@lucaspaulaleal`) | [RF07, RF08, RF14 a RF18 e RF30 a RF32](../requisitos/8-requisitos.md#rf07) | Integrado ao catálogo (PR #52) |
| **#41** | Elaborar requisitos de inscrição, base de pessoas e LGPD (CP3/CP5) | Dupla A (`@mariadenis`, `@daniboycam`) | [RF09 a RF13 e RF19 a RF25](../requisitos/8-requisitos.md#rf09) | Integrado ao catálogo (PR #48) |
| **#42** | Elaborar requisitos de apuração de metas e relatórios MROSC (CP6/CP8) | Duplas B e C | [RF26 a RF29 e RF33 a RF37](../requisitos/8-requisitos.md#rf26) | Integrado ao catálogo (PR #52) |
| **#43** | Consolidar e parametrizar RNFs (FURPS+ e Sommerville) | SM e PO | [RNF01 a RNF18](../requisitos/8-requisitos.md#rnf01) | Integrado ao catálogo (PR #53) |
| **#44** | Construir matriz de rastreabilidade bidirecional | Dupla A (`@mariadenis`, `@daniboycam`) | [Matriz de Rastreabilidade](../requisitos/8-requisitos.md#84-matriz-de-rastreabilidade-bidirecional) | Em elaboração (PR #54, rascunho) |
| **#45** | Publicar catálogo de requisitos e rastreabilidade no GitPages | Dupla B (`@viniciusvieira00`, `@Fofodoido`) | Página oficial publicada e validada | Em consolidação (PR #47) |
