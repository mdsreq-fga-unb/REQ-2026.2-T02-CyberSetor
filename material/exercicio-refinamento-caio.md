# Exercício de Refinamento de Critérios de Aceitação — Dojo D1 (DOJO-C)

**Participante:** Caio Flávio de Lima Martins Junior  
**Papel:** Time de Desenvolvimento · Engenharia de Requisitos e Frente Offline (Dupla C)  
**Data:** 17 de setembro de 2026  
**Disciplina:** FGA0313 — Requisitos de Software, T02 2026.2 (FCTE/UnB)  
**Documentos de Referência:** `material/04-exercicio-refinamento.pdf` (DOJO-C), `material/01-historias-e-criterios.pdf` (DOJO-A) e `material/06-guia-de-estudo.pdf` (DOJO-L)  

---

## 1. Visão Geral e Critérios de Avaliação

O presente artefato consolida a resolução individual dos **seis casos reais de critérios de aceitação defeituosos** levantados no exercício prático do Dojo D1 / DOJO-C.

A Engenharia de Requisitos em metodologias ágeis exige que critérios de aceitação atuem como contratos verificáveis e observáveis entre negócio e desenvolvimento, delimitando rigorosamente a fronteira entre:
1. **Fatos confirmados** (declarados formalmente pelo Instituto ou pela legislação de regência);
2. **Hipóteses técnicas/operacionais** (que exigem parametrização e flexibilidade);
3. **Decisões em aberto** (governança, diretrizes jurídicas ou termos de fomento específicos que não podem ser decididos unilateralmente pela equipe de desenvolvimento).

Cada correção abaixo cumpre os sete quesitos da **Folha de Correção do Facilitador**:
- [x] Preserva a numeração original permanente (`HU-xx` e `CA-xx.y`);
- [x] Identifica o modo de falha epistêmica correspondente;
- [x] Formula a pergunta reveladora do defeito;
- [x] Redige a proposta no padrão canônico (**Dado / Quando / Então**), com evento único observável e resultado verificável;
- [x] Delimita a matéria pendente e aponta a área/fonte responsável pela decisão;
- [x] Estabelece critério de verificação binária (*passa / falha*).

---

## 2. Resolução dos Seis Casos Defeituosos

---

### EX-01 · CA-02.2: Hipótese arbitrária convertida em regra fixa

* **História de Usuário:** `HU-02` — Atribuição de responsável e prazo a requisito
* **Critério Defeituoso Original:**  
  > *Dado um requisito com prazo a vencer em até 7 dias, quando acesso o painel, então o sistema apresenta alerta correspondente.*
* **Modo de Falha Epistêmica:** `[HIPÓTESE]` — A equipe arbitrou o intervalo fixo de "7 dias" como antecedência geral de alerta sem respaldo no edital ou nos fluxos de trabalho do Instituto No Setor.
* **Pergunta Reveladora:**  
  *Qual registro do cliente, termo de colaboração ou edital pactuado fixou exatamente sete dias como antecedência universal de alerta para qualquer meta ou obrigação?*
* **Versão Corrigida Proposta:**  
  > **Dado** um requisito vinculado a um instrumento que possui uma janela de antecedência de alerta configurada,  
  > **quando** a data corrente ingressa no intervalo dessa janela,  
  > **então** o sistema classifica o requisito com o estado observável de "prazo próximo" e o exibe com sinalização de destaque no painel de gestão.
* **O que ainda precisa ser decidido (Matéria Pendente):**  
  - Quem possui autoridade para configurar a janela de antecedência (gestor do projeto ou parâmetro global institucional).  
  - Definição da regra de fuso horário e virada de dia (horário de Brasília - UTC-3).  
  - Se haverá valor padrão (*fallback*) sugerido e qual sua fonte documental.
* **Responsável / Fonte da Decisão:** Diretoria de Projetos do Instituto No Setor em conjunto com os Coordenadores de Termos de Fomento.
* **Verificação Binária:**  
  * **Passa:** Se o sistema dispara o alerta nas datas corretas quando submetido a duas janelas de antecedência distintas configuradas para instrumentos diferentes (ex.: 3 dias em um edital simplificado e 15 dias em um termo de fomento plurianual).  
  * **Falha:** Se o comportamento do sistema depender do valor fixo de 7 dias hardcoded no código ou ignorar a configuração do instrumento.

---

### EX-02 · CA-03.2 e CA-03.3: Pesquisa exploratória convertida em catálogo fechado

* **História de Usuário:** `HU-03` — Cadastro de atividade por tipo de objeto
* **Critérios Defeituosos Originais:**  
  > *CA-03.2: Dado o tipo "evento", quando a atividade é criada, então o sistema indica como evidências esperadas: público estimado, registro fotográfico com logomarca e clipping.*  
  > *CA-03.3: Dado o tipo "oficina", quando a atividade é criada, então o sistema indica a lista de presença como evidência principal.*
* **Modo de Falha Epistêmica:** `[DOCUMENTADO]` — Requisitos identificados na pesquisa normativa prévia foram tratados como listas universais e estáticas de comprovação, ignorando as particularidades de cada termo de fomento e a evolução dos tipos de atividades.
* **Pergunta Reveladora:**  
  *Essas listas de evidências foram extraídas de um plano de trabalho específico ou foram inferidas pela equipe a partir da pesquisa documental geral?*
* **Versões Corrigidas Propostas:**  
  > **CA-03.2:** **Dado** um tipo de objeto com checklist vigente configurado para o projeto,  
  > **quando** uma atividade desse tipo é cadastrada,  
  > **então** o sistema exibe os itens comprobatórios obrigatórios, opcionais e condicionais previstos naquele checklist.  
  >  
  > **CA-03.3:** **Dado** que o checklist de um tipo de atividade foi atualizado pela coordenação,  
  > **quando** uma atividade registrada antes da alteração é consultada,  
  > **então** o sistema preserva integralmente a versão do checklist que estava associada à atividade na data de sua criação (preservação do histórico e imutabilidade probatória).
* **O que ainda precisa ser decidido (Matéria Pendente):**  
  - Procedimento de parametrização e versionamento dos checklists por termo de colaboração/fomento.  
  - Catálogo inicial de tipos de atividade aceitos institucionalmente.  
  - Regra de transição para atividades em andamento quando ocorre aditivo contratual.
* **Responsável / Fonte da Decisão:** Equipe de Articulação e Gestão de Projetos do Instituto No Setor.
* **Verificação Binária:**  
  * **Passa:** Se o sistema renderiza dinamicamente checklists distintos configurados para um mesmo tipo de objeto e preserva a versão original do checklist de atividades finalizadas mesmo após a publicação de uma nova versão.  
  * **Falha:** Se tipos "evento" ou "oficina" possuírem campos rígidos fixados no código-fonte ou se a edição de um checklist alterar retroativamente comprovações prévias.

---

### EX-03 · CA-04.3: Contradição entre a promessa da história e o critério

* **História de Usuário:** `HU-04` — Vinculação de evidência a meta
* **Critério Defeituoso Original:**  
  > *Dado uma evidência sem meta vinculada, quando tento salvar, então o sistema alerta que ela não será considerada em nenhuma prestação de contas.*
* **Modo de Falha Epistêmica:** `[CONTRADIÇÃO]` — A história tem por escopo vincular evidências a metas, mas o critério autoriza o salvamento de evidências desvinculadas, permitindo a persistência de registros órfãos sem tratamento de ciclo de vida.
* **Pergunta Reveladora:**  
  *A história promete vincular evidência a meta; o critério permite salvar sem meta. A equipe decidiu que a ausência de meta bloqueia a persistência ou que o sistema suporta rascunho de campo para classificação posterior?*
* **Versões Corrigidas Condicionadas à Política:**  
  *Se a política for o Bloqueio Estrito:*  
  > **[Opção A] Dado** uma evidência sem ao menos uma meta selecionada,  
  > **quando** o usuário solicita o salvamento,  
  > **então** o sistema rejeita a operação, impede a persistência e exibe mensagem informando a obrigatoriedade da vinculação a uma meta.  
  
  *Se a política for o Rascunho Controlado (Offline-First / Coleta em Campo):*  
  > **[Opção B] Dado** uma evidência coletada em campo vinculada a um projeto mas sem meta atribuída,  
  > **quando** o usuário salva o registro,  
  > **então** o sistema grava o artefato com a situação observável de "não classificada", impede sua inclusão em relatórios oficiais de prestação de contas e registra a pendência no painel do projeto.
* **O que ainda precisa ser decidido (Matéria Pendente):**  
  - Definição entre Opção A (bloqueio imediato) e Opção B (rascunho de campo para sincronização offline resiliente).  
  - Regra de desempate e rateio de indicadores quando um mesmo documento (ex.: nota fiscal ou lista mista) respaldar duas metas simultâneas.
* **Responsável / Fonte da Decisão:** Product Owner interno em alinhamento com a Coordenação Administrativo-Financeira do Instituto.
* **Verificação Binária:**  
  * **Passa:** Se o sistema implementa univocamente uma das políticas (bloqueio imediato ou estado de pendência observável) e nunca permite que evidências sem meta computem métricas na prestação de contas.  
  * **Falha:** Se o sistema salvar a evidência silenciosamente sem registrar estado de pendência ou se salvar e rejeitar coexistirem sem critério determinístico sob o mesmo contexto.

---

### EX-04 · CA-05.3: Ausência de observabilidade ("mesmo conteúdo")

* **História de Usuário:** `HU-05` — Geração do relatório de execução do objeto
* **Critério Defeituoso Original:**  
  > *Dado um relatório finalizado, quando efetuo a exportação, então recebo os formatos PDF e CSV com o mesmo conteúdo.*
* **Modo de Falha Epistêmica:** `[NÃO OBSERVÁVEL]` — A cláusula "mesmo conteúdo" é subjetiva e não testável por máquina: um PDF (layout diagramado com narrativa e imagens) e um CSV (linhas textuais tabulares planas) possuem representações estruturais incompatíveis.
* **Pergunta Reveladora:**  
  *Como comparar programmaticamente um arquivo diagramado voltado para leitura humana e uma planilha tabular voltada para processamento automático, assegurando correspondência exata dos dados declarados?*
* **Versão Corrigida Proposta:**  
  > **Dado** um snapshot de relatório consolidado, versionado e aprovado no sistema,  
  > **quando** o usuário solicita a exportação nos formatos PDF e CSV,  
  > **então** ambos os arquivos gerados contêm o mesmo identificador único de snapshot, a mesma data e hora de geração e valores idênticos para todos os campos canônicos compartilhados (identificador do projeto, código do instrumento, nome das metas, valores previstos, valores executados, percentuais de atingimento e relação de identificadores das evidências comprobatórias vinculadas).
* **Campos Canônicos Mínimos de Confronto:**  
  1. Cabeçalho institucional: projeto, número do termo, órgão financiador, vigência;  
  2. Quadro de metas: ID da meta, descrição resumida, indicador, valor pactuado, valor executado, status e justificativa (quando aplicável);  
  3. Rastreabilidade de evidências: lista de IDs das evidências atreladas a cada meta;  
  4. Metadados de integridade: SHA-256 do snapshot, timestamp de fechamento e identificador do emissor.
* **O que ainda precisa ser decidido (Matéria Pendente):**  
  - Ordem oficial das colunas do CSV para compatibilidade com o formato exigido pelo órgão concedente (ex.: SEDET-DF / MROSC).  
  - Se anexos fotográficos constam embutidos no PDF ou como hiperlinks com hash no CSV.
* **Responsável / Fonte da Decisão:** Setor Financeiro do Instituto No Setor e analistas de prestação de contas dos editais.
* **Verificação Binária:**  
  * **Passa:** Se um teste automatizado extrai a matriz de dados estruturada do PDF e a compara campo a campo com o arquivo CSV gerado, confirmando equivalência exata dos valores dos campos canônicos sob o mesmo ID de snapshot.  
  * **Falha:** Se a conformidade depender de inspeção visual subjetiva ("parece ter o mesmo conteúdo").

---

### EX-05 · CA-05.2: Validação tardia no fluxo de prestação de contas

* **História de Usuário:** `HU-05` — Geração do relatório de execução do objeto
* **Critério Defeituoso Original:**  
  > *Dado uma meta cumprida parcialmente, quando o relatório é gerado, então o sistema exige justificativa formal antes de permitir a finalização.*
* **Modo de Falha Epistêmica:** `[FLUXO TARDIO]` — A verificação de justificativa ocorre no momento da geração do relatório final, impedindo a consolidação e pegando o gestor de surpresa no final do prazo perante o financiador, em vez de exigir a justificativa no momento da apuração do déficit.
* **Pergunta Reveladora:**  
  *A justificativa formal por descumprimento de meta nasce na apuração periódica da própria meta ou deve ser exigida de surpresa semanas/meses depois, no momento da exportação do relatório de prestação de contas?*
* **Versão Corrigida Proposta:**  
  > **Dado** uma meta ou período de apuração cujo resultado mensurado seja classificado como "parcial" ou "não cumprido",  
  > **quando** o responsável conclui a apuração daquela meta,  
  > **então** o sistema exige o preenchimento do campo de justificativa formal fundamentada antes de homologar a apuração; e, ao gerar o relatório consolidado posteriormente, o sistema transporta essa justificativa pré-existente para a seção correspondente do documento.
* **O que ainda precisa ser decidido (Matéria Pendente):**  
  - Regra de alçada: quem pode validar e retificar a justificativa de meta não cumprida (coordenador técnico ou diretoria).  
  - Tratamento de hipóteses de força maior reguladas pela Lei 13.019/2014 (risco de glosa - art. 64, §1º).
* **Responsável / Fonte da Decisão:** Coordenador Geral de Projetos e Assessoria Jurídica/Contábil do Instituto.
* **Verificação Binária:**  
  * **Passa:** Se o encerramento da apuração periódica de uma meta com déficit for bloqueado enquanto não houver justificativa formal registrada, e a geração posterior do relatório ocorrer sem travar exigindo dados novos em tempo de exportação.  
  * **Falha:** Se o usuário conseguir encerrar a apuração da meta sem justificativa e o impedimento for postergado para a tela de geração do relatório.

---

### EX-06 · CA-06.3: Decisão jurídica pendente universalizada indevidamente

* **História de Usuário:** `HU-06` — Consulta ao histórico de participação de pessoa
* **Critério Defeituoso Original:**  
  > *Dado o cadastro de uma pessoa, quando ela é criada, então o consentimento de uso de dados é registrado com data.*
* **Modo de Falha Epistêmica:** `[DECISÃO JURÍDICA ABERTA]` — O critério assumiu o "consentimento" (art. 7º, I da LGPD) como hipótese legal única e compulsória para qualquer cadastro, ignorando que o Instituto trata dados primariamente para execução de termo de fomento/contrato (art. 7º, V) e cumprimento de obrigação legal de prestação de contas (art. 7º, II), além do regime protetivo específico para crianças e adolescentes (art. 14).
* **Pergunta Reveladora:**  
  *Qual é a finalidade do tratamento e quem definiu que o consentimento individual é a base legal aplicável universalmente a todas as atividades e perfis de participantes do Instituto?*
* **Versão Corrigida Proposta:**  
  > **Dado** um registro de participante com finalidade de tratamento e hipótese legal definidas para o projeto,  
  > **quando** o cadastro é submetido,  
  > **então** o sistema armazena a finalidade institucional, a base legal aplicável (ex.: execução de parceria pública, obrigação legal ou consentimento) e a data do registro; e, exclusivamente quando a base legal selecionada for "Consentimento", exige e armazena o registro do aceite formal, o texto do termo aceito e os controles para revogação.
* **O que ainda precisa ser decidido (Matéria Pendente):**  
  - Mapeamento definitivo do Inventário de Dados Pessoais (ROPA) do Instituto No Setor.  
  - Protocolo para dados de menores de idade em oficinas infantis (consentimento específico de ao menos um dos pais/responsáveis legais).  
  - Política de cessão e direito de uso de imagem em eventos públicos (independente da LGPD).  
  - Prazos de guarda para atendimento aos órgãos de controle (TCU, TCDF) antes do expurgo.
* **Responsável / Fonte da Decisão:** Encarregado pelo Tratamento de Dados Pessoais (DPO) e Diretoria Executiva do Instituto No Setor.
* **Verificação Binária:**  
  * **Passa:** Se o sistema permite salvar o cadastro de um beneficiário fundamentado em "Cumprimento de Obrigação Legal / Execução de Termo de Fomento" sem exigir a marcação forçada de termo de consentimento individual, restringindo a exigência de termo apenas a finalidades que dependem estritamente do consentimento (ex.: marketing ou comunicações secundárias).  
  * **Falha:** Se qualquer cadastro de pessoa for barrado caso não haja aceite de consentimento, tratando todas as bases legais da LGPD como inexistentes.

---

## 3. Síntese Comparativa dos Casos

| Caso | História | Modo de Falha | Causa Raiz | Correção Aplicada | Verificação Binária |
|---|---|---|---|---|---|
| **EX-01** | HU-02 | `[HIPÓTESE]` | Número 7 arbitrado sem base documental. | Parametrização da janela de alerta por instrumento. | Alertas corretos para 2 janelas distintas (passa/falha). |
| **EX-02** | HU-03 | `[DOCUMENTADO]` | Pesquisa de editais engessada em modelo estático. | Checklists dinâmicos versionados com imutabilidade histórica. | Checklist preservado após edição de template (passa/falha). |
| **EX-03** | HU-04 | `[CONTRADIÇÃO]` | Promessa de vincular vs permissão de salvar órfão. | Política unívoca (bloqueio ou rascunho com estado de pendência). | Evidência órfã jamais entra na prestação de contas (passa/falha). |
| **EX-04** | HU-05 | `[NÃO OBSERVÁVEL]` | "Mesmo conteúdo" entre PDF diagramado e CSV tabular. | Identificador de snapshot e reconciliação dos campos canônicos. | Comparação automatizada dos campos compartilhados (passa/falha). |
| **EX-05** | HU-05 | `[FLUXO TARDIO]` | Justificativa exigida na exportação do relatório. | Exigência da justificativa no encerramento da apuração da meta. | Apuração deficitária sem justificativa é bloqueada na origem (passa/falha). |
| **EX-06** | HU-06 | `[DECISÃO JURÍDICA ABERTA]` | Consentimento tratado como única base legal da LGPD. | Registro da finalidade e base legal, exigindo termo só se for consentimento. | Cadastro por obrigação legal não exige termo de consentimento (passa/falha). |
