# 8c. Requisitos de Apuração de Metas e Relatórios MROSC

!!! info "Frente de Trabalho da Dupla C & B (Issue #42)"
    Este documento detalha os Requisitos Funcionais (RFs) e Não Funcionais (RNFs) sob responsabilidade da **Dupla C** (`caioflmjr` e `lucaspaulaleal`) em conjunto com **Vinicius Vieira** (`viniciusvieira00`), cobrindo as características de produto **CP6** (Acompanhamento automático de metas) e **CP8** (Relatórios e exportação de dados) e a mitigação de riscos de glosa perante a **Lei 13.019/2014 (Marco Regulatório das Organizações da Sociedade Civil - MROSC)**. A numeração utiliza o prefixo provisório `RF-R` e `RNF-R` para consolidação posterior na Seção 8 definitiva pela equipe.

---

## 1. Requisitos Funcionais (RFs)

### Acompanhamento e Apuração de Metas (CP6)

<a id="rf-r01"></a>
### RF-R01 — Calcular progresso físico de metas em tempo real
* **Descrição:** O sistema deve calcular automaticamente o progresso quantitativo e o percentual de atingimento de cada meta contratual a partir da consolidação contínua das presenças validadas em oficinas, eventos comunitários realizados e evidências documentais homologadas.
* **Rastreabilidade:** CP6 | OE01, OE04 | BPMN G05 | HU-05

<a id="rf-r02"></a>
### RF-R02 — Parametrizar apuração para metas não lineares e marcos
* **Descrição:** Deve ser possível ao analista de projetos parametrizar regras de apuração distintas conforme o indicador da meta: cálculo contínuo acumulativo (soma de horas de oficina ou público atendido) ou apuração binária por marco de entrega (*milestone*, ex.: publicação de diagnóstico ou realização de festival único).
* **Rastreabilidade:** CP6 | OE04 | Seção 2.3 | BPMN G05 | HU-05

<a id="rf-r03"></a>
### RF-R03 — Emitir alertas de risco de inexecução
* **Descrição:** O sistema deve emitir avisos visuais destacados no painel de gestão quando o ritmo de execução de uma meta estiver abaixo do cronograma planejado ou quando a data fatal de entrega estiver a 15 dias ou menos do vencimento, permitindo à equipe de projetos antecipar medidas corretivas ou solicitação de Termo Aditivo.
* **Rastreabilidade:** CP6 | OE04 | BPMN G05 | HU-05

<a id="rf-r04"></a>
### RF-R04 — Versionar metas por Termo Aditivo
* **Descrição:** O sistema deve registrar repactuações de prazos, remanejamentos de recursos ou alterações quantitativas de metas decorrentes de Termos Aditivos, mantendo o histórico da pactuação original e exibindo comparativo (*Previsto Original* vs. *Reprogramado* vs. *Realizado*).
* **Rastreabilidade:** CP6 | OE04 | BPMN G05 | Lei 13.019/2014, art. 55 e 57 | HU-05

### Relatórios, Mitigação de Glosa e Prestação de Contas (CP8)

<a id="rf-r05"></a>
### RF-R05 — Exigir justificativa prévia para metas não atingidas
* **Descrição:** O sistema deve validar a completude do plano de trabalho e bloquear a finalização e fechamento do ciclo de prestação de contas de qualquer meta que apresente cumprimento parcial ou inexecução física sem que haja justificativa técnica fundamentada previamente registrada pelo analista responsável.
* **Rastreabilidade:** CP8 | OE04, OE06 | BPMN G06 | Lei 13.019/2014, art. 64, §1º | HU-05

<a id="rf-r06"></a>
### RF-R06 — Emitir Relatório de Execução do Objeto
* **Descrição:** Deve ser possível ao analista de projetos ou coordenador gerar o Relatório de Execução do Objeto oficial por projeto e período selecionado, consolidando indicadores pactuados vs. atingidos, justificativas técnicas registradas e índice ordenado de comprovações fotográficas e documentais.
* **Rastreabilidade:** CP8 | OE04, OE06 | BPMN G06 | Lei 13.019/2014, art. 63 a 66 | HU-05

<a id="rf-r07"></a>
### RF-R07 — Gerar relatório diagramado em PDF via servidor
* **Descrição:** O sistema deve compilar e renderizar no servidor o Relatório de Execução do Objeto diagramado em formato PDF padronizado, contendo cabeçalho institucional, sumário executivo, tabelas de metas, justificativas e miniaturas das evidências anexadas com seus metadados.
* **Rastreabilidade:** CP8 | OE06 | Seção 2.4 | HU-05

<a id="rf-r08"></a>
### RF-R08 — Exportar dados consolidados em formato tabular aberto
* **Descrição:** Deve ser possível ao usuário exportar os dados analíticos de execução do projeto, frequências de atividades e status de metas em formato aberto e interoperável (CSV), viabilizando conferências internas e auditorias externas independentes.
* **Rastreabilidade:** CP8 | OE06 | Lei 13.019/2014, art. 64 | HU-05

<a id="rf-r09"></a>
### RF-R09 — Registrar trilha de auditoria para retificações na prestação
* **Descrição:** O sistema deve registrar em trilha de auditoria permanente qualquer retificação de dados, inserção de justificativas extemporâneas ou emissão de relatórios oficiais que impactem a prestação de contas, persistindo usuário autenticado, carimbo de data/hora e valores anteriores e posteriores.
* **Rastreabilidade:** CP8 | OE04 | BPMN G06 | HU-05

---

## 2. Requisitos Não Funcionais (RNFs)

<a id="rnf-r01"></a>
### RNF-R01 — Conformidade com prazo de retenção documental decenal (MROSC)
* **Classificação FURPS+:** Suportabilidade (*Supportability*) / Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo / Regulatório)
* **Descrição:** O sistema e sua infraestrutura de armazenamento em nuvem (S3/Backblaze B2 e PostgreSQL) devem assegurar a integridade e guarda ininterrupta de todos os relatórios homologados, listas de chamada e evidências comprobatórias pelo prazo legal obrigatório.
* **Métrica Verificável:** Retenção configurada para o prazo mínimo de 10 anos contados do primeiro dia útil seguinte ao da prestação de contas, atendendo 100% ao Art. 68 da Lei 13.019/2014, com redundância geográfica e política de ciclo de vida ativa (*lifecycle policy*).

<a id="rnf-r02"></a>
### RNF-R02 — Desempenho na renderização de relatórios PDF no servidor
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O serviço backend de renderização headless (Puppeteer) deve processar e disponibilizar o arquivo PDF diagramado de forma assíncrona e ágil, mesmo para projetos com elevado volume de dados e miniaturas de evidências anexadas.
* **Métrica Verificável:** Tempo de geração e disponibilização do download do PDF completo (relatório com até 50 páginas e até 100 miniaturas de fotos) inferior a 5 segundos no percentil 95 (p95) em testes de carga.

<a id="rnf-r03"></a>
### RNF-R03 — Imutabilidade e integridade de relatórios fechados
* **Classificação FURPS+:** Confiabilidade (*Reliability*) / Segurança (+)
* **Classificação Sommerville:** Requisito de Produto (Integridade e Segurança)
* **Descrição:** O sistema deve gerar um identificador criptográfico único (checksum SHA-256) no momento da finalização do ciclo de prestação de contas, garantindo que o relatório emitido reflita exatamente o estado dos dados no fechamento e prevenindo alterações posteriores não rastreadas.
* **Métrica Verificável:** 100% de correspondência entre o hash SHA-256 do arquivo PDF gerado e o registro gravado na base de dados, com 0 comandos de alteração direta permitidos sobre o snapshot do período fechado.

---

## 3. Perguntas-Chave da Frente de Prestação de Contas

### Como o sistema calcula metas que não são lineares?
* O cálculo respeita o **tipo de aferição do indicador** (definido no desdobramento de metas):
  - *Metas quantitativas cumulativas:* Percentual obtido pela razão direta entre o volume apurado (soma de presenças ou horas ministradas) e o volume pactuado no plano de trabalho.
  - *Metas qualitativas ou de marco único (milestones):* Percentual binário (0% enquanto pendente de evidência formal e 100% após a anexação e validação documental da entrega pelo analista).

### Como o relatório formal lida com metas que foram remanejadas por Termo Aditivo?
* O sistema não sobrescreve os dados pactuados na celebração da parceria. Ao cadastrar um Termo Aditivo, cria-se uma versão incremental do plano de trabalho. Na emissão do Relatório de Execução do Objeto, o documento apresenta uma tabela comparativa com colunas dedicadas: *Meta Pactuada Original*, *Alteração Formal (TA nº)*, *Meta Vigente Reprogramada* e *Percentual Efetivamente Cumprido*, demonstrando transparência perante a fiscalização do órgão público.

### Quem pode emitir o relatório final oficial versus quem pode gerar acompanhamentos?
* Na dinâmica operacional do Instituto, **os analistas de projetos e a coordenação técnica possuem autonomia para gerar, revisar e emitir relatórios de acompanhamento e o Relatório de Execução do Objeto** a qualquer momento. O sistema atua como garantidor de conformidade: não bloqueia a emissão por hierarquia funcional, mas **bloqueia o fechamento da prestação se houver metas incompletas sem justificativa formal prévia**, prevenindo riscos de glosa para a instituição.

---

## 4. Matriz de Rastreabilidade da Dupla C & B (Frente de Prestação MROSC)

| Requisito | Característica (CP) | Objetivo Específico | Problema BPMN | Mitigação / Norma | História (HU) |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **RF-R01** | CP6 | OE01, OE04 | G05 | Macrofase 3.4 | HU-05 |
| **RF-R02** | CP6 | OE04 | G05 | Seção 2.3 | HU-05 |
| **RF-R03** | CP6 | OE04 | G05 | Seção 2.3 (Alertas) | HU-05 |
| **RF-R04** | CP6 | OE04 | G05 | Lei 13.019/14, art. 55 | HU-05 |
| **RF-R05** | CP8 | OE04, OE06 | G06 | Lei 13.019/14, art. 64, §1º | HU-05 |
| **RF-R06** | CP8 | OE04, OE06 | G06 | Lei 13.019/14, art. 63–66 | HU-05 |
| **RF-R07** | CP8 | OE06 | G06 | Seção 2.4 (Puppeteer) | HU-05 |
| **RF-R08** | CP8 | OE06 | G06 | Transparência MROSC | HU-05 |
| **RF-R09** | CP8 | OE04 | G06 | Trilha de Auditoria | HU-05 |
| **RNF-R01** | CP8 | OE06 | G06 | Lei 13.019/14, art. 68 (10 anos) | HU-05 |
| **RNF-R02** | CP8 | OE06 | G06 | Desempenho Puppeteer | HU-05 |
| **RNF-R03** | CP8 | OE04, OE06 | G06 | Imutabilidade SHA-256 | HU-05 |

---

## 5. Pontos Abertos para Consolidação com a Dupla B

* **Numeração global:** Alinhar com a Dupla B a conversão dos códigos `RF-R01`–`RF-R09` para a numeração definitiva da Seção 8 (`RF13`, `RF14`...).
* **Template visual do PDF:** Definir junto ao design do Instituto se o cabeçalho dos relatórios MROSC precisará de campos dinâmicos para logotipos de órgãos concedentes e apoiadores institucionais.
