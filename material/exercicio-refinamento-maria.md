# Exercício de Refinamento — Dojo D1 (DOJO-C)
**Participante:** Maria Eduarda Denis Duarte Marques  
**Papel:** Líder da Equipe · Product Owner interno (Dupla A)  
**Data:** 15 de setembro de 2026  
**Disciplina:** FGA0313 — Requisitos de Software, T02 2026.2 (FCTE/UnB)  
**Referência:** `material/04-exercicio-refinamento.pdf` e `material/06-guia-de-estudo.pdf`  

---

## 1. Visão Geral e Propósito

Este documento registra a resolução individual dos **seis critérios de aceitação defeituosos** levantados no exercício prático do Dojo D1 (Issue #10). A finalidade é transformar critérios de aceitação ambíguos, subjetivos ou precoces em comportamentos observáveis e testáveis segundo o formato canônico adotado pela equipe CyberSetor (**Dado / Quando / Então**), sem converter hipóteses não validadas ou decisões em aberto em regras de negócio rígidas.

Cada correção atende aos itens da **Folha de Correção do Facilitador**:
- [x] Preserva o identificador do critério (CA-xx.y) e da história (HU-xx);
- [x] Nomeia a classe epistêmica / modo de falha;
- [x] Formata com um único evento observável em "Quando";
- [x] Especifica um resultado verificável em "Então";
- [x] Não decide unilateralmente matérias em aberto;
- [x] Define teste binário (passa / falha);
- [x] Identifica a área ou responsável pela decisão pendente.

---

## 2. Resolução dos Seis Casos Defeituosos

### EX-01 · CA-02.2: Hipótese apresentada como regra universal

* **História Relacionada:** HU-02 — Atribuição de responsável e prazo a requisito
* **Versão Defeituosa Original:**  
  > *Dado um requisito com prazo a vencer em até 7 dias, quando acesso o painel, então o sistema apresenta alerta correspondente.*
* **Modo de Falha Epistêmica:** `[HIPÓTESE]` — A equipe arbitrou o número "7 dias" como antecedência geral de alerta sem respaldo em registro do cliente ou edital.
* **Pergunta Reveladora:** *Qual instrumento contratual, edital ou diretoria do Instituto definiu que 7 dias é a antecedência necessária e suficiente para mitigar o risco de descumprimento de um prazo?*
* **Versão Corrigida Proposta:**  
  > **Dado** um requisito vinculado a um projeto que possui uma janela de antecedência de alerta configurada,  
  > **quando** a data corrente ingressa no intervalo dessa janela,  
  > **então** o sistema classifica o requisito com a situação de "prazo próximo" e o exibe com destaque visual no painel de gestão.
* **Decisão em Aberto:** Quem define a antecedência de alerta (Diretoria de Projetos por edital ou parâmetro padrão institucional) e tratamento de fuso horário.
* **Verificação Binária:**  
  * **Passa:** Se duas janelas distintas de antecedência (ex.: 5 dias e 15 dias) acionarem o alerta estritamente nas respectivas datas calculadas.  
  * **Falha:** Se o alerta disparar exclusivamente em 7 dias com valor fixado no código-fonte.

---

### EX-02 · CA-03.2 e CA-03.3: Pesquisa convertida em catálogo fixo

* **História Relacionada:** HU-03 — Cadastro de atividade por tipo de objeto
* **Versões Defeituosas Originais:**  
  > *CA-03.2: Dado o tipo "evento", quando a atividade é criada, então o sistema indica como evidências esperadas: público estimado, registro fotográfico com logomarca e clipping.*  
  > *CA-03.3: Dado o tipo "oficina", quando a atividade é criada, então o sistema indica a lista de presença como evidência principal.*
* **Modo de Falha Epistêmica:** `[DOCUMENTADO]` — Achados normativos de editais foram codificados como enumerações rígidas, tratando exigências específicas de projetos como regras universais do software.
* **Pergunta Reveladora:** *As evidências exigidas são universais e imutáveis, ou variam conforme o objeto pactuado no termo de fomento e o perfil da atividade?*
* **Versões Corrigidas Propostas:**  
  > **CA-03.2:** **Dado** um tipo de atividade com checklist de comprovação vigente associado ao projeto,  
  > **quando** uma atividade desse tipo é cadastrada,  
  > **então** o sistema vincula à atividade os itens de comprovação obrigatórios e opcionais previstos naquele checklist.  
  >  
  > **CA-03.3:** **Dado** que o checklist de um tipo de atividade foi alterado pela gestão,  
  > **quando** uma atividade registrada antes da alteração é consultada,  
  > **então** o sistema preserva os itens do checklist que estavam vigentes na data de criação da atividade (imutabilidade histórica).
* **Decisão em Aberto:** Governança sobre quem administra os tipos e templates de checklist; regras formais de vigência e versionamento.
* **Verificação Binária:**  
  * **Passa:** Se o sistema permite configurar dinamicamente listas de comprovação e preserva os itens de atividades já finalizadas após uma reedição do checklist.  
  * **Falha:** Se "evento" e "oficina" possuírem campos engessados ou se alterar um checklist corromper retrospectivamente dados anteriores.

---

### EX-03 · CA-04.3: Contradição entre escopo da história e critério

* **História Relacionada:** HU-04 — Vinculação de evidência a meta
* **Versão Defeituosa Original:**  
  > *Dado uma evidência sem meta vinculada, quando tento salvar, então o sistema alerta que ela não será considerada em nenhuma prestação de contas.*
* **Modo de Falha Epistêmica:** `[CONTRADIÇÃO]` — A história promete vincular evidência a meta, mas o critério permite salvar itens órfãos sem associação, gerando inconsistência no domínio.
* **Pergunta Reveladora:** *O sistema deve bloquear arquivos sem meta para garantir integridade contábil, ou deve permitir salvamento em campo como rascunho pendente de classificação?*
* **Versão Corrigida Proposta (Política de Rascunho Controlado):**  
  > **Dado** um arquivo de comprovação inserido em campo sem meta vinculada,  
  > **quando** o usuário salva o registro,  
  > **então** o sistema armazena a evidência com o estado "não classificada", impede seu cômputo em relatórios oficiais de metas e exibe a pendência no painel do projeto.
* **Decisão em Aberto:** Deliberar se o vínculo a um projeto/atividade é obrigatório no salvamento e definir regra para evitar contagem duplicada quando uma evidência respaldar mais de uma meta.
* **Verificação Binária:**  
  * **Passa:** Se uma evidência "não classificada" nunca inflar os indicadores de cumprimento de meta nem for incluída na prestação de contas.  
  * **Falha:** Se o critério permitir salvar sem definir com clareza o estado observável de pendência e a restrição de uso.

---

### EX-04 · CA-05.3: Resultado subjetivo não observável em teste

* **História Relacionada:** HU-05 — Geração do relatório de execução do objeto
* **Versão Defeituosa Original:**  
  > *Dado um relatório finalizado, quando efetuo a exportação, então recebo os formatos PDF e CSV com o mesmo conteúdo.*
* **Modo de Falha Epistêmica:** `[NÃO OBSERVÁVEL]` — A expressão "mesmo conteúdo" não define teste objetivo, já que um PDF diagramado (visual) e um CSV tabular (máquina) têm estruturas intrinsecamente distintas.
* **Pergunta Reveladora:** *Quais campos canônicos e valores de domínio precisam ser estritamente congruentes entre os dois artefatos exportados?*
* **Versão Corrigida Proposta:**  
  > **Dado** um snapshot de relatório finalizado e versionado no sistema,  
  > **quando** o usuário requisita a exportação em PDF e em CSV,  
  > **então** ambos os arquivos exportados apresentam o mesmo identificador de snapshot, data de fechamento e valores idênticos para os campos canônicos compartilhados (código do projeto, identificador da meta, valores previsto e executado, percentual de atingimento e relação de IDs das evidências comprobatórias vinculadas).
* **Decisão em Aberto:** Definição com a Área Administrativo-Financeira da ordem das colunas do CSV e dos leiautes visuais exigidos por cada órgão financiador.
* **Verificação Binária:**  
  * **Passa:** Se uma asserção automatizada compara os dados do CSV contra o payload canônico do snapshot do PDF e atesta correspondência integral dos valores.  
  * **Falha:** Se a verificação depender de conferência humana visual superficial ("parece igual").

---

### EX-05 · CA-05.2: Validação temporal tardia no fluxo

* **História Relacionada:** HU-05 — Geração do relatório de execução do objeto
* **Versão Defeituosa Original:**  
  > *Dado uma meta cumprida parcialmente, quando o relatório é gerado, então o sistema exige justificativa formal antes de permitir a finalização.*
* **Modo de Falha Epistêmica:** `[FLUXO TARDIO]` — A regra exige a justificativa somente na etapa de emissão do relatório final, travando a prestação de contas de quem precisa apenas consolidar dados já concluídos.
* **Pergunta Reveladora:** *A justificativa de uma meta parcial nasce no fechamento do período de aferição operacional ou deve ser exigida de surpresa na emissão do relatório?*
* **Versão Corrigida Proposta:**  
  > **Dado** a conclusão do período de apuração de uma meta com situação "parcial" ou "não cumprida",  
  > **quando** o gestor conclui a apuração periódica da meta,  
  > **então** o sistema exige o registro da justificativa formal antes de homologar o encerramento da apuração; e, ao gerar o relatório posterior, o sistema transporta essa justificativa previamente persistida para o snapshot.
* **Decisão em Aberto:** Definir se a ausência de justificativa bloqueia o fechamento da meta ou se emite alerta configurável por perfil de instrumento contratual.
* **Verificação Binária:**  
  * **Passa:** Se o encerramento de uma meta deficitária sem justificativa for impedido no momento da apuração periódica.  
  * **Falha:** Se o usuário conseguir encerrar a apuração da meta sem justificativa e o erro só for exigido na exportação final.

---

### EX-06 · CA-06.3: Decisão jurídica pendente assumida como regra universal

* **História Relacionada:** HU-06 — Consulta ao histórico de participação de pessoa
* **Versão Defeituosa Original:**  
  > *Dado o cadastro de uma pessoa, quando ela é criada, então o consentimento de uso de dados é registrado com data.*
* **Modo de Falha Epistêmica:** `[DECISÃO JURÍDICA ABERTA]` — Assumiu o "consentimento" (art. 7º, I da LGPD) como única base legal aplicável a todas as pessoas e cadastros, desconsiderando execução de contrato, cumprimento de obrigação legal e tratamento de dados de menores.
* **Pergunta Reveladora:** *Qual é a finalidade específica do tratamento e quem definiu que consentimento individual é a base jurídica universal para todas as atividades do Instituto?*
* **Versão Corrigida Proposta:**  
  > **Dado** um registro de participante com finalidade de tratamento e hipótese legal definidas,  
  > **quando** o cadastro é salvo no sistema,  
  > **então** o sistema armazena a finalidade, a base legal aplicável (ex.: execução de termo de fomento, obrigação legal ou consentimento) e a data; e, exclusivamente quando a base legal atribuída for "Consentimento", registra o comprovante do aceite formal e o estado de vigência do termo.
* **Decisão em Aberto:** Mapeamento de bases legais com a diretoria do Instituto No Setor; política de tratamento de dados de crianças/adolescentes e direito de imagem.
* **Verificação Binária:**  
  * **Passa:** Se um cadastro com base legal "Cumprimento de Obrigação Legal / Execução de Fomento" for salvo com sucesso sem exigir um termo de consentimento individual assinado.  
  * **Falha:** Se o formulário travar exigindo consentimento obrigatório para qualquer cadastro indiferentemente da base legal.
