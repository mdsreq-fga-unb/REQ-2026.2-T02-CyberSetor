---
title: "[Tarefa Dupla B] Elaborar Requisitos de Gestão de Instrumentos, Projetos e Metas (CP1)"
assignees: viniciusvieira00,Fofodoido
labels: "tipo: tarefa,epico: requisito-meta,er: declaracao,sprint: 1,moscow: must"
---
## Objetivo da Atividade
A **Dupla B** (`viniciusvieira00` e `Fofodoido`) é responsável por analisar o ciclo de captação e contratualização do Instituto No Setor e **especificar formalmente os Requisitos Funcionais (RFs) e Não Funcionais (RNFs)** associados à **Característica de Produto 1 (CP1 — Gestão de projetos e metas)**.

---

## Insumos e Leituras Obrigatórias
Antes de redigir os requisitos, a dupla deve ler e extrair os fluxos e regras dos seguintes documentos:
1. **`docs/visao/2-solucao-proposta.md`**: Seção 2.1 (Objetivo Geral), Seção 2.2 (OE01 e OE04) e Seção 2.3 (CP1).
2. **Branch `integracao/u1-correcoes` — `docs/requisitos/b1-bpmn-processo-atual.md`**:
   - **Gargalo G01:** Destrinchamento manual de editais e perda de prazos contratuais.
   - **Gargalo G02:** Descentralização de demandas por WhatsApp/e-mail sem prazos claros.
   - Macrofases 3.1 (Captação & Proposta) e 3.2 (Plano de Trabalho).
3. **`docs/gestao/sprints/sprint-1.md`**: Seção 3.1 (Modelo da cadeia de trabalho: Instrumento → Projeto → Meta/Requisito → Demanda) e as histórias **HU-01** e **HU-02**.
4. **Marco Legal:** Lei 13.019/2014 (MROSC) no tocante a metas e indicadores pactuados.

---

## Passo a Passo: O que a Dupla Deve Fazer

### 1. Elicitar e Estruturar os Requisitos Funcionais (RFs)
A dupla deve redigir os requisitos funcionais para cobrir os seguintes comportamentos esperados:
- **Cadastro do Instrumento Convocatório e Projeto:** Como a Diretoria de Projetos cadastra a origem da parceria (edital, emenda, convênio), número do processo, vigência, concedente e valor global.
- **Desdobramento de Requisitos e Metas:** Como detalhar cada meta com origem normativa (edital, projeto, instituto), indicador de desempenho, parâmetro de aferição (meta numérica), forma de comprovação e frequência de apuração.
- **Atribuição de Responsabilidades e Setores:** Como delegar donos, setores competentes e prazos fatais para cumprimento das metas.
- **Painel de Prazos e Alertas:** Como o sistema deve exibir as pendências e alertar prazos com vencimento crítico (ex.: a vencer em até 7 dias).

> **Atenção ao Padrão Exigido pelo Professor Marsicano para cada RF:**
> - Código único (ex.: `RF01`, `RF02`...);
> - Nome estritamente no formato **Verbo no Infinitivo + Objeto** (ex.: *RF01 — Cadastrar instrumento convocatório e projeto*);
> - Descrição clara do comportamento esperado (*"Deve ser possível ao usuário..."*);
> - Rastreabilidade explícita com a característica de produto de origem (`CP1`).

### 2. Elicitar os Requisitos Não Funcionais (RNFs) Relacionados
A dupla deve identificar as restrições e propriedades de qualidade dessa frente:
- Restrições de integridade cadastral (impedir salvamento de metas sem indicadores ou formas de comprovação).
- Conformidade com os prazos e parâmetros legais do MROSC.
- Classificar segundo **FURPS+** e **Sommerville**, definindo **critérios verificáveis** (métricas numéricas testáveis).

### 3. Perguntas-Chave que a Dupla Deve Responder
* Quais campos são estritamente obrigatórios no cadastro de um edital ou emenda?
* O que acontece se uma meta não possuir indicador quantitativo definido no edital?
* Quem tem permissão de criar e editar projetos versus quem apenas consulta?

---

## Definição de Pronto (DoD)
- [ ] Mínimo de 4 Requisitos Funcionais especificados rigorosamente no padrão do professor (Código + Verbo no Infinitivo + Objeto + Comportamento + Rastreabilidade com CP1).
- [ ] RNFs específicos da área catalogados com dupla classificação e métricas verificáveis.
- [ ] Rastreabilidade cruzada mapeada com OE01, OE04, BPMN G01/G02 e HU-01/HU-02.
- [ ] Submissão do texto para consolidação na matriz e publicação na seção 8.
