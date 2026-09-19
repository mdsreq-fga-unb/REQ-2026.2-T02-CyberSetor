# 8. Requisitos de software

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 19/09/2026 | 1.0 | Especificação inicial dos requisitos da CP1 (Issue #39) | Rodrigo Henrique e Vinicius Vieira |

Esta seção descreve os requisitos de software para a solução CyberSetor, divididos entre requisitos funcionais e requisitos não funcionais, acompanhados de suas regras de qualidade, conformidade com o marco regulatório (MROSC) e matriz de rastreabilidade.

---

## 8.1 Lista de Requisitos Funcionais

<!-- 
Padrão exigido:
* Código único (ex.: RF01)
* Nome: Verbo no Infinitivo + Objeto Direto
* Descrição clara do comportamento esperado
* Rastreabilidade formal (CP1, OEs, BPMN G01/G02, Histórias de Usuário)
-->

### RF01 — [Verbo no Infinitivo + Objeto]
* **Descrição:** [O sistema deve permitir que...]
* **Rastreabilidade:** [CP1, OE01, etc.]

### RF02 — [Verbo no Infinitivo + Objeto]
* **Descrição:** [O sistema deve permitir que...]
* **Rastreabilidade:** [CP1, etc.]

---

## 8.2 Lista de Requisitos Não Funcionais

<!-- 
Padrão exigido:
* Classificação FURPS+ / URPS+
* Classificação de Sommerville
* Descrição da restrição técnica ou regulatória
* Métrica verificável / critério de aceitação numérico e testável
-->

### RNF01 — [Nome do Requisito Não Funcional]
* **Classificação FURPS+:** [ex.: Confiabilidade / Reliability]
* **Classificação Sommerville:** [ex.: Requisito de Produto]
* **Descrição:** [A aplicação deve garantir...]
* **Métrica Verificável:** [Critério quantitativo/testável]

---

## 8.3 Matriz-Síntese de Rastreabilidade

| Contribuição Principal | Contribuição Secundária | CP | Valor de Negócio (VN) | RFs Relacionados | RNFs Relacionados |
| :---: | :---: | :---: | :---: | :---: | :---: |
| [OE01] | [OE04] | CP1 — Gestão de projetos e metas | [VN1 — ...] | [RF01, RF02, ...] | [RNF01, ...] |

---

## Notas de Domínio e Respostas Operacionais (CP1)

<!-- Espaço para registrar formalmente as 3 perguntas-chave da Issue #39 -->

### 1. Campos Obrigatórios de Cadastro de Instrumentos
* [Listar os campos indispensáveis...]

### 2. Tratamento de Metas Qualitativas (sem parâmetro numérico)
* [Descrever como o sistema trata metas qualitativas/descritivas...]

### 3. Matriz de Perfis e Permissões de Acesso (RBAC)
* [Definir quem edita/cria versus quem apenas consulta...]