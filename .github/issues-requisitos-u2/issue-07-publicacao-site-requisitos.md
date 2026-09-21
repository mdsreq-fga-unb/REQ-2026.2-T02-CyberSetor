---
title: "[Tarefa Dupla B] Publicar Catálogo de Requisitos e Rastreabilidade no Site (8-requisitos.md)"
assignees: viniciusvieira00,Fofodoido
labels: "tipo: tarefa,tipo: documentacao,tipo: infraestrutura,sprint: 1,moscow: must"
---
## Objetivo da Atividade
A **Dupla B** (`viniciusvieira00` e `Fofodoido`), responsável pela infraestrutura e publicação técnica, deve **redigir, formatar, validar e publicar a página oficial de Requisitos de Software (`docs/requisitos/8-requisitos.md`)** e atualizar a página de síntese de entregas (`docs/entregas/unidade-2.md`), garantindo a compilação perfeita e sem erros no MkDocs.

---

## Insumos e Leituras Obrigatórias
1. **Pacote de Requisitos Produzido pelas Duplas:**
   - RFs da Dupla B (Instrumentos, Projetos e Metas — CP1);
   - RFs da Dupla C (Atividades, Campo, Offline e Evidências — CP2, CP4, CP7);
   - RFs da Dupla A (Inscrição, Pessoas e LGPD — CP3, CP5);
   - RFs da Dupla C & B (Metas, Relatórios e MROSC — CP6, CP8);
   - RNFs consolidados pelo SM e PO (FURPS+ e Sommerville);
   - Matriz de Rastreabilidade Bidirecional montada pela Dupla A.
2. **Arquivos do Repositório a Atualizar:**
   - `docs/requisitos/8-requisitos.md` (atualmente com placeholder provisório);
   - `docs/entregas/unidade-2.md`;
   - `mkdocs.yml` (verificar integridade do sumário e âncoras).

---

## Passo a Passo: O que a Dupla Deve Fazer

### 1. Estruturar a Página `docs/requisitos/8-requisitos.md`
A página deve ser redigida contendo a seguinte estrutura padronizada:
- **Cabeçalho e Metadados:** Tabela de versionamento do documento (versão, data, autores e descrição da emissão).
- **Introdução Metodológica:** Breve contextualização sobre o método de elicitação adotado no ScrumXP, a taxonomia de Marsicano (2026), FURPS+ e Sommerville.
- **Seção de Requisitos Funcionais (RFs):**
  - Tabela consolidada com Código (`RF01`, `RF02`...), Nome (*Verbo + Objeto*), Descrição do Comportamento Esperado e Rastreabilidade com a Característica de Produto de origem (`CPx`).
  - Âncoras HTML para permitir links diretos a cada requisito (ex.: `<a id="rf01"></a>`).
- **Seção de Requisitos Não Funcionais (RNFs):**
  - Tabela consolidada com Código (`RNF01`, `RNF02`...), Nome, Descrição da Propriedade/Restrição, Classificação FURPS+, Classificação Sommerville e Critério Verificável Objetivo (métricas quantitativas).
- **Seção de Matriz de Rastreabilidade:**
  - Tabela de rastreabilidade bidirecional integrando Problemas BPMN (G01-G06), OEs, CPs, RFs, RNFs e Histórias de Usuário (HU-01 a HU-06).

### 2. Atualizar a Página de Entregas (`docs/entregas/unidade-2.md`)
- Incluir o resumo da entrega da lista de requisitos (marco de 22/09/2026 da Sprint 1).
- Adicionar checklist de conformidade com os critérios exigidos pelo professor.
- Inserir links para a seção 8 e para o histórico de issues do repositório.

### 3. Validação Técnica Local (Build Estrito)
Executar os seguintes testes locais antes de abrir o Pull Request:
```powershell
# Compilação estrita do MkDocs (não permite links quebrados ou avisos de sintaxe):
python -m mkdocs build --strict
```
- Testar visualmente a renderização no navegador em modo claro e escuro.
- Confirmar que todas as âncoras e links cruzados funcionam perfeitamente.

---

## Definição de Pronto (DoD)
- [ ] Conteúdo do placeholder de `docs/requisitos/8-requisitos.md` substituído pelo catálogo completo de RFs, RNFs e matriz.
- [ ] Página `docs/entregas/unidade-2.md` atualizada com os links e status da entrega.
- [ ] Comando `python -m mkdocs build --strict` executado com sucesso (zero erros).
- [ ] Pull Request aberto e revisado pela equipe.
