# 8b. Requisitos de Gestão de Atividades, Campo Offline e Evidências

!!! info "Frente de Trabalho da Dupla C (Issue #40)"
    Este documento detalha os Requisitos Funcionais (RFs) e Não Funcionais (RNFs) sob responsabilidade da **Dupla C** (`caioflmjr` e `lucaspaulaleal`), cobrindo as características de produto **CP2** (Gestão de atividades), **CP4** (Registro de participação em campo) e **CP7** (Repositório de evidências e documentação). A numeração utiliza o prefixo provisório `RF-C` e `RNF-C` para facilitar a consolidação posterior na Seção 8 definitiva pela equipe.

---

## 1. Requisitos Funcionais (RFs)

### Gestão de Atividades e Tipos de Objeto (CP2)

<a id="rf-c01"></a>
### RF-C01 — Cadastrar atividade por modalidade de objeto
* **Descrição:** Deve ser possível ao usuário da equipe de projetos ou coordenação pedagógica cadastrar atividades vinculadas a um projeto, classificando a modalidade em: *Oficina Contínua*, *Evento Aberto* ou *Ação de Acolhimento Comunitário*, configurando número de vagas planejadas, carga horária prevista, facilitador responsável, local de realização, datas e parâmetros de recorrência de turmas.
* **Rastreabilidade:** CP2 | OE02 | BPMN G03 | HU-03

<a id="rf-c02"></a>
### RF-C02 — Parametrizar exigência de comprovação de presença
* **Descrição:** O sistema deve parametrizar as regras de comprovação de acordo com a modalidade da atividade: exigindo *chamada nominal* com controle de assiduidade para oficinas formativas contínuas, ou *contagem quantitativa agregada e anônima* de público para ações de acolhimento e eventos de rua no Setor Comercial Sul (SCS), dispensando a obrigatoriedade de CPF nestas últimas.
* **Rastreabilidade:** CP2 | OE02 | Seção 3.3.6 | BPMN G03 | HU-03

### Registro de Participação Móvel e em Campo (CP4)

<a id="rf-c03"></a>
### RF-C03 — Registrar frequência em dispositivo móvel
* **Descrição:** Deve ser possível ao educador ou facilitador de campo realizar a chamada digital diretamente no smartphone (*BYOD*), fornecendo interface otimizada para marcação rápida de presença/ausência individual dos participantes matriculados ou confirmação em lote.
* **Rastreabilidade:** CP4 | OE02 | BPMN G03 | HU-03

<a id="rf-c04"></a>
### RF-C04 — Operar registro de presença em modo offline
* **Descrição:** O sistema deve permitir o registro e a consulta de chamadas de oficinas mesmo na ausência completa de conexão com a internet no SCS, persistindo todos os dados de marcação no armazenamento local seguro do navegador (IndexedDB via Dexie.js) e gerenciando uma fila local de eventos pendentes de sincronização.
* **Rastreabilidade:** CP4 | OE02 | Seção 3.3.3 | BPMN G03 | HU-03

<a id="rf-c05"></a>
### RF-C05 — Sincronizar presenças com reconciliação idempotente
* **Descrição:** O sistema deve sincronizar automaticamente a fila local de presenças com o servidor assim que a conectividade for restabelecida, utilizando identificadores únicos (UUIDv4) gerados no dispositivo cliente e garantindo que submissões repetidas do mesmo lote não gerem registros duplicados de presença no banco de dados relacional (PostgreSQL).
* **Rastreabilidade:** CP4 | OE02 | Seção 3.3.3 | BPMN G03 | HU-03

<a id="rf-c06"></a>
### RF-C06 — Registrar lançamento extemporâneo com justificativa
* **Descrição:** Deve ser possível ao educador ou à coordenação pedagógica lançar ou retificar chamadas após a data de realização da atividade, exigindo obrigatoriamente o preenchimento de justificativa textual fundamentada e registrando autor, data, hora e motivo na trilha de auditoria.
* **Rastreabilidade:** CP4 | OE02 | Seção 3.3.8 | BPMN G03 | HU-03

<a id="rf-c07"></a>
### RF-C07 — Apurar carga horária de participantes e facilitadores
* **Descrição:** O sistema deve calcular e acumular automaticamente o total de horas de participação efetiva de cada beneficiário e o total de horas de atividades ministradas por facilitador ou educador em cada oficina ou ciclo do projeto.
* **Rastreabilidade:** CP4 | OE01, OE02 | BPMN G03 | HU-03

### Repositório de Evidências e Documentação (CP7)

<a id="rf-c08"></a>
### RF-C08 — Anexar evidências documentais e fotográficas
* **Descrição:** Deve ser possível ao usuário realizar o upload de arquivos comprobatórios de realização de atividades (imagens JPEG/PNG/WebP, listas de papel digitalizadas em PDF e atas de realização), extraindo e registrando automaticamente metadados técnicos de data, hora e georreferenciamento (quando disponível).
* **Rastreabilidade:** CP7 | OE04 | BPMN G03 | HU-04

<a id="rf-c09"></a>
### RF-C09 — Vincular evidência a meta contratual
* **Descrição:** O sistema deve exigir que cada documento ou imagem anexada seja expressamente vinculado a uma atividade executada e a uma ou mais metas do plano de trabalho correspondente, integrando o índice de comprovação do projeto.
* **Rastreabilidade:** CP7 | OE04 | BPMN G03 | HU-04

<a id="rf-c10"></a>
### RF-C10 — Segregar acesso a fotos de beneficiários vulneráveis
* **Descrição:** O sistema deve aplicar controle de acesso estrito aos arquivos fotográficos que contenham registros de participantes em vulnerabilidade social, restringindo a visualização aos perfis de coordenação e prestação de contas e orientando o enquadramento panorâmico sem closes faciais no momento da captura.
* **Rastreabilidade:** CP7 | OE02 | Seção 3.3.4 | LGPD (Lei 13.709/2018) | ECA (Lei 8.069/1990) | HU-04

---

## 2. Requisitos Não Funcionais (RNFs)

<a id="rnf-c01"></a>
### RNF-C01 — Resiliência e persistência offline no dispositivo cliente
* **Classificação FURPS+:** Confiabilidade (*Reliability*)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade e Resiliência)
* **Descrição:** A aplicação web progressiva (PWA) deve reter de forma íntegra todas as presenças marcadas em modo offline no IndexedDB (Dexie.js), garantindo a persistência mesmo em cenários de reinicialização do dispositivo ou fechamento do navegador.
* **Métrica Verificável:** 0% de perda de registros de frequência após corte simulado de conexão e recarregamento da página em testes automatizados ponta a ponta (Playwright).

<a id="rnf-c02"></a>
### RNF-C02 — Idempotência na reconciliação de lotes
* **Classificação FURPS+:** Confiabilidade (*Reliability*)
* **Classificação Sommerville:** Requisito de Produto (Integridade de Dados)
* **Descrição:** O endpoint de sincronização no backend deve processar lotes de presença utilizando política de *Append-Only* com chave de concorrência baseada na tupla `(participante_id, atividade_sessao_id, data)`, impedindo duplicações em retransmissões de rede.
* **Métrica Verificável:** 0 presenças duplicadas registradas no PostgreSQL após submissão de 5 requisições HTTP idênticas contendo o mesmo payload de sincronização.

<a id="rnf-c03"></a>
### RNF-C03 — Usabilidade e ergonomia móvel em campo
* **Classificação FURPS+:** Usabilidade (*Usability*)
* **Classificação Sommerville:** Requisito de Produto (Usabilidade)
* **Descrição:** A interface de chamada digital deve ser ergonômica para uso em smartphones populares (*BYOD*), com elementos visuais de toque confortáveis e layout totalmente responsivo para uso sob luz solar direta.
* **Métrica Verificável:** Dimensão mínima de áreas de toque (*touch targets*) de 48x48px e renderização fluida sem barra de rolagem horizontal em telas a partir de 360px de largura, atendendo 100% dos critérios WCAG 2.1 nível AA.

<a id="rnf-c04"></a>
### RNF-C04 — Otimização e compressão no upload de evidências
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O cliente web deve realizar compressão prévia e conversão de fotos para formatos modernos (WebP/JPEG otimizado) antes de iniciar a transmissão ao storage em nuvem (S3/Backblaze B2), economizando franquia de dados móveis do educador.
* **Métrica Verificável:** Redução média mínima de 60% no peso de imagens de alta resolução antes do upload, com tempo total de envio inferior a 4 segundos por foto em perfil de rede 4G padrão.

---

## 3. Perguntas-Chave da Frente de Campo

### Como o sistema identifica se duas marcações de presença offline referem-se à mesma pessoa e oficina?
* Cada evento de presença é assinado no cliente com um **UUIDv4 imutável** e amarrado à chave composta lógica `(participante_id, oficina_sessao_id, data_evento)`. No momento do envio, o backend executa reconciliação determinística com cláusula `ON CONFLICT DO NOTHING`, garantindo unicidade mesmo que o educador pressione o botão de sincronização múltiplas vezes.

### Quais evidências documentais são obrigatórias para um "evento" versus uma "oficina"?
* **Oficina continuada:** Exige diário de classe digital com lista nominal de presenças validadas e registro de conteúdo programático / horas ministradas.
* **Evento público ou Ação de rua:** Exige fotos panorâmicas georreferenciadas do espaço com timestamp, estimativa quantitativa agregada de público e relatório sucinto de realização emitido pelo facilitador.

### O que acontece se o educador esquecer de fazer a chamada no dia da oficina?
* O sistema não bloqueia o registro posterior, mas o trata formalmente como **lançamento extemporâneo** (RF-C06). É exigida justificativa obrigatória por escrito, e a marcação recebe sinalização visual de pendência auditável, ficando sujeita à conferência e homologação da Coordenação Pedagógica.

---

## 4. Matriz de Rastreabilidade da Dupla C (Frente de Campo)

| Requisito | Característica (CP) | Objetivo Específico | Problema BPMN | Mitigação / Norma | História (HU) |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **RF-C01** | CP2 | OE02 | G03 | Seção 3.3.6 | HU-03 |
| **RF-C02** | CP2 | OE02 | G03 | Seção 3.3.6 (Acolhimento) | HU-03 |
| **RF-C03** | CP4 | OE02 | G03 | Macrofase 3.3 (Campo) | HU-03 |
| **RF-C04** | CP4 | OE02 | G03 | Seção 3.3.3 (Offline) | HU-03 |
| **RF-C05** | CP4 | OE02 | G03 | Seção 3.3.3 (Append-Only) | HU-03 |
| **RF-C06** | CP4 | OE02 | G03 | Seção 3.3.8 (Extemporâneo) | HU-03 |
| **RF-C07** | CP4 | OE01, OE02 | G03 | Macrofase 3.3 | HU-03 |
| **RF-C08** | CP7 | OE04 | G03 | Macrofase 3.3 / S3 | HU-04 |
| **RF-C09** | CP7 | OE04 | G03 | HU-04 (Vínculo a meta) | HU-04 |
| **RF-C10** | CP7 | OE02 | G03 | Seção 3.3.4; LGPD; ECA | HU-04 |
| **RNF-C01** | CP4 | OE02 | G03 | Resiliência IndexedDB | HU-03 |
| **RNF-C02** | CP4 | OE02 | G03 | Idempotência PostgreSQL | HU-03 |
| **RNF-C03** | CP4 | OE02 | G03 | Ergonomia BYOD | HU-03 |
| **RNF-C04** | CP7 | OE04 | G03 | Compressão WebP/S3 | HU-04 |

---

## 5. Pontos Abertos para Consolidação com a Dupla B

* **Numeração global:** Alinhar com a Dupla B a conversão dos códigos `RF-C01`–`RF-C10` para a sequência global no catálogo unificado da Seção 8.
* **Indexação de evidências:** Confirmar os tipos MIME e limites máximos de tamanho de arquivo aceitos no storage S3/Backblaze B2 (proposta: até 15 MB por arquivo).
