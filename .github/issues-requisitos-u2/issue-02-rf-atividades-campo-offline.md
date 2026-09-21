---
title: "[Tarefa Dupla C] Elaborar Requisitos de Atividades, Campo Offline e Evidências (CP2, CP4, CP7)"
assignees: caioflmjr,lucaspaulaleal
labels: "tipo: tarefa,epico: atividade,er: declaracao,sprint: 1,stack: offline,moscow: must"
---
## Objetivo da Atividade
A **Dupla C** (`caioflmjr` e `lucaspaulaleal`) é responsável por analisar a realidade de campo e a dinâmica operacional das oficinas e ações do Instituto No Setor, **especificando formalmente os Requisitos Funcionais (RFs) e Não Funcionais (RNFs)** associados a:
- **CP2:** Gestão de atividades;
- **CP4:** Registro de participação em campo;
- **CP7:** Repositório de evidências e documentação.

---

## Insumos e Leituras Obrigatórias
Antes de redigir os requisitos, a dupla deve ler e extrair os fluxos e regras dos seguintes documentos:
1. **`docs/visao/2-solucao-proposta.md`**:
   - Seção 2.3: CP2 (atividades por tipo de objeto), CP4 (registro móvel e sem conexão), CP7 (repositório de evidências).
   - Seção 2.4: Tecnologias da frente (Next.js responsivo, Service Worker + Dexie.js para IndexedDB offline, Backblaze B2/S3).
2. **Branch `integracao/u1-correcoes` — `docs/visao/3-intervencao-social.md`**:
   - Seção 3.3.3: Conflitos na sincronização sem conexão (modelo Append-Only, timestamp de captura vs envio, identificadores imutáveis, fila no aparelho).
   - Seção 3.3.4: Fotografia como evidência e proteção de imagem de pessoas vulneráveis (fotos panorâmicas, sem close facial, segregação de acesso).
   - Seção 3.3.6: Burocratização do acolhimento humano (registro quantitativo agregado/anônimo em ações de rua sem CPF obrigatório).
   - Seção 3.3.8: Lançamento extemporâneo justificado e conferência de pendências.
3. **Branch `integracao/u1-correcoes` — `docs/requisitos/b1-bpmn-processo-atual.md`**:
   - Gargalo G03: Coleta em listas físicas de papel e fotos dispersas em aparelhos particulares dos educadores (BYOD).
   - Macrofase 3.3 (Trilha A — Coordenação Pedagógica / Campo).
4. **`docs/gestao/sprints/sprint-1.md`**: Histórias HU-03 (atividade por tipo de objeto) e HU-04 (vinculação de evidência a meta).

---

## Passo a Passo: O que a Dupla Deve Fazer

### 1. Elicitar e Estruturar os Requisitos Funcionais (RFs)
A dupla deve redigir os requisitos funcionais para cobrir os seguintes comportamentos esperados:
- **Gestão de Atividades e Tipos de Objeto (CP2):** Como cadastrar atividades diferenciando o tipo de objeto (oficina contínua, evento público, ação de rua) para condicionar as comprovações esperadas; definição de vagas, horários, locais e repetição periódica de turmas.
- **Registro de Presença Móvel e em Campo (CP4):** Como o educador realiza a chamada no smartphone (*BYOD*) no local da oficina; opções de marcação rápida e em lote.
- **Funcionamento em Modo Offline (CP4):** Como a interface retém presenças localmente no navegador (IndexedDB) em caso de ausência de rede no SCS e como efetua a sincronização idempotente sem duplicidade de presenças.
- **Acolhimento Humanizado e Lançamento Justificado (CP4):** Como registrar acolhimentos imediatos de forma anônima e agregada; como registrar presença retroativa com justificativa obrigatória.
- **Apuração de Carga Horária (CP4):** Cálculo automático de horas de facilitadores e participantes.
- **Anexação e Vinculação de Evidências (CP7):** Como fazer upload de fotos da ação, atas, listas assinadas digitalizadas e vinculá-las às metas contratuais correspondentes.
- **Proteção de Imagem de Vulneráveis (CP7):** Como restringir a visualização de fotos de beneficiários em vulnerabilidade social aos perfis de prestação de contas.

> **Atenção ao Padrão Exigido pelo Professor para cada RF:**
> - Código único (ex.: `RF05`, `RF06`...);
> - Nome estritamente no formato **Verbo no Infinitivo + Objeto** (ex.: *RF05 — Cadastrar atividade por tipo de objeto*);
> - Descrição clara do comportamento esperado (*"Deve ser possível ao usuário..."*);
> - Rastreabilidade explícita com as CPs de origem (`CP2`, `CP4`, `CP7`).

### 2. Elicitar os Requisitos Não Funcionais (RNFs) Relacionados
A dupla deve detalhar as propriedades não funcionais críticas desta frente:
- **Operação Offline e Recuperabilidade:** Retenção 100% confiável no cliente (Dexie) e envio assíncrono pós-reconexão.
- **Idempotência:** Garantia de que reenvio de lote não duplica presença no PostgreSQL.
- **Usabilidade Móvel:** Interface adaptada para smartphones populares a partir de 360px de largura e touch targets de 48x48px (WCAG 2.1 AA).
- **Desempenho no Upload:** Compressão e envio seguro para S3 (Backblaze B2).
- Classificar em **FURPS+** e **Sommerville** e fixar **métricas verificáveis** numéricas.

### 3. Perguntas-Chave que a Dupla Deve Responder
* Como o sistema identifica se duas marcações de presença offline referem-se à mesma pessoa e oficina?
* Quais evidências documentais são obrigatórias para um "evento" versus uma "oficina"?
* O que acontece se o educador esquecer de fazer a chamada no dia da oficina?

---

## Definição de Pronto (DoD)
- [ ] Requisitos Funcionais cobrindo CP2, CP4 e CP7 especificados rigorosamente no padrão do professor (Código + Verbo no Infinitivo + Objeto + Comportamento + Rastreabilidade).
- [ ] RNFs de modo offline, idempotência e usabilidade móvel catalogados com métricas verificáveis.
- [ ] Rastreabilidade mapeada com OE01, OE03, OE05, BPMN G03 e Seções 3.3.3, 3.3.4, 3.3.6 e 3.3.8.
- [ ] Submissão do texto para consolidação na matriz e publicação na seção 8.