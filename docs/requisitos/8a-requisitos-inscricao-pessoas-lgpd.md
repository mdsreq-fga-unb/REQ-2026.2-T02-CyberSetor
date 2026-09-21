# 8a. Requisitos de inscrição, base de pessoas e LGPD (CP3 e CP5)

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 19/09/2026 | 0.1 | Rascunho dos requisitos de CP3 e CP5 para consolidação na seção 8 (Issue #41) | Dupla A (Maria Eduarda Marques e Daniel Batista) |

Requisitos funcionais e não funcionais de **inscrição de participantes (CP3)** e de **cadastro e histórico de pessoas (CP5)**, incluindo os compromissos da LGPD (Lei 13.709/2018). É insumo da consolidação da seção 8 e não substitui o catálogo oficial.

**Padrão de redação.** Cada requisito funcional tem um código, um nome no formato **Verbo no Infinitivo + Objeto**, uma descrição do comportamento esperado e a rastreabilidade. Cada requisito descreve **uma única ação verificável**. Cada requisito não funcional é classificado em FURPS+ e em Sommerville e tem métrica numérica.

!!! note "Identificadores provisórios"
    Os códigos `RF-P01` a `RF-P11` e `RNF-P01` a `RNF-P05` são provisórios. Os definitivos (`RFxx`, `RNFxx`) são atribuídos na consolidação da seção 8, para evitar colisão com os requisitos das demais duplas. As referências a seções do Documento de Visão (por exemplo, "seção 3.3.10") são feitas por texto, sem link, porque parte delas ainda está em integração à `main`.

---

## 1. Requisitos funcionais

### Inscrição de participantes (CP3)

<a id="rf-p01"></a>
### RF-P01 — Disponibilizar formulário público de inscrição
* **Descrição:** O sistema deve permitir que o interessado se inscreva em oficina ou evento por formulário público acessível em navegador móvel, sem criar conta nem senha.
* **Rastreabilidade:** CP3 | OE02 | G03, G04 | HU-06

<a id="rf-p02"></a>
### RF-P02 — Gerar QR Code de inscrição
* **Descrição:** O sistema deve permitir que o usuário gere, para cada atividade, um link e um QR Code que abrem o formulário público de inscrição, para divulgação em cartazes e redes.
* **Rastreabilidade:** CP3 | OE02 | HU-06

<a id="rf-p03"></a>
### RF-P03 — Registrar inscrição presencial assistida
* **Descrição:** O sistema deve permitir que o educador ou o recepcionista inscreva uma pessoa em seu nome, sem que ela precise de celular ou de internet.
* **Rastreabilidade:** CP3 | OE02 | Seção 3.3.10 | HU-06

<a id="rf-p04"></a>
### RF-P04 — Limitar vagas da atividade
* **Descrição:** O sistema deve bloquear novas inscrições confirmadas quando o número de vagas definido para a atividade for atingido.
* **Rastreabilidade:** CP3 | OE01, OE02 | HU-06

<a id="rf-p05"></a>
### RF-P05 — Ordenar lista de espera
* **Descrição:** O sistema deve registrar as inscrições feitas após o esgotamento das vagas em uma fila de espera ordenada pelo momento da inscrição.
* **Rastreabilidade:** CP3 | OE01, OE02 | HU-06

### Base de pessoas e histórico (CP5)

<a id="rf-p06"></a>
### RF-P06 — Consultar histórico de participação
* **Descrição:** O sistema deve permitir que o núcleo pedagógico consulte a ficha única de uma pessoa, com as oficinas e os eventos de que participou em diferentes projetos ao longo do tempo.
* **Rastreabilidade:** CP5 | OE01 | G04 | HU-06

<a id="rf-p07"></a>
### RF-P07 — Alertar cadastro duplicado
* **Descrição:** O sistema deve alertar o usuário, no ato do cadastro, quando nome e telefone coincidirem com os de uma pessoa já cadastrada, permitindo reaproveitar o registro existente.
* **Rastreabilidade:** CP5 | OE01 | G04 | HU-06 (CA-06.2)

### Privacidade e LGPD (CP5)

<a id="rf-p08"></a>
### RF-P08 — Registrar consentimento de guarda de dados
* **Descrição:** O sistema deve registrar, com data e hora, o consentimento da pessoa (ou de seu responsável legal, se menor) para a guarda de seus dados cadastrais, como condição para concluir a inscrição.
* **Rastreabilidade:** CP5 | OE01 | G04 | LGPD art. 7º e 8º | HU-06 (CA-06.3)

<a id="rf-p09"></a>
### RF-P09 — Registrar autorização de contato
* **Descrição:** O sistema deve registrar, de forma opcional e separada do consentimento cadastral, a autorização da pessoa para receber informes sobre futuras atividades, permitindo revogá-la (*opt-out*) a qualquer momento.
* **Rastreabilidade:** CP5 | OE01 | G04 | Seção 3.3.5 | LGPD art. 8º, §5º | HU-06

<a id="rf-p10"></a>
### RF-P10 — Registrar autorização de uso de imagem
* **Descrição:** O sistema deve registrar, de forma separada do consentimento cadastral, a autorização ou a recusa da pessoa para fotografias institucionais, sem que a recusa impeça a inscrição ou a participação.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.4 | LGPD art. 7º e 8º | HU-06

<a id="rf-p11"></a>
### RF-P11 — Retificar dados cadastrais
* **Descrição:** O sistema deve permitir que a Coordenação Pedagógica corrija dados de uma pessoa a pedido do titular, registrando autor, data, hora e justificativa de cada alteração.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.9 | LGPD art. 18, III | HU-06

<a id="rf-p12"></a>
### RF-P12 — Excluir ou anonimizar cadastro
* **Descrição:** O sistema deve permitir que a Coordenação Pedagógica exclua ou anonimize o cadastro de uma pessoa a pedido do titular, preservando os totais agregados já reportados a financiadores.
* **Rastreabilidade:** CP5 | OE01 | Seção 3.3.9 | LGPD art. 18, IV e VI | HU-06

---

## 2. Requisitos não funcionais

<a id="rnf-p01"></a>
### RNF-P01 — Desempenho da inscrição pública
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O formulário público de inscrição deve carregar de forma leve em navegador móvel, em conexão 3G/4G.
* **Métrica Verificável:** *First Contentful Paint* inferior a 2,5 s em perfil de rede 4G lento, medido por auditoria automatizada (Lighthouse) no pipeline.

<a id="rnf-p02"></a>
### RNF-P02 — Prazo de atendimento à exclusão
* **Classificação FURPS+:** Funcionalidade / Requisito Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O sistema deve executar a exclusão ou anonimização solicitada pelo titular em prazo curto, com registro em trilha de auditoria.
* **Métrica Verificável:** 100% das solicitações atendidas em até 72 h, medido pelo intervalo entre solicitação e execução na trilha de auditoria.

<a id="rnf-p03"></a>
### RNF-P03 — Descarte de dados locais no aparelho
* **Classificação FURPS+:** Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve descartar os dados pessoais mantidos localmente em aparelhos pessoais dos educadores (BYOD) após a confirmação de envio e encerrar a sessão por inatividade.
* **Métrica Verificável:** 0 registros de participantes remanescentes no armazenamento local após a confirmação de envio; sessão expirada em até 30 min de inatividade, em teste automatizado de aceitação.

<a id="rnf-p04"></a>
### RNF-P04 — Usabilidade inclusiva da inscrição
* **Classificação FURPS+:** Usabilidade (*Usability*)
* **Classificação Sommerville:** Requisito de Produto (Usabilidade)
* **Descrição:** O formulário de inscrição deve poder ser concluído por pessoa com baixa familiaridade digital, em linguagem simples e com poucas etapas.
* **Métrica Verificável:** Inscrição concluída em até 5 telas e 3 min por pelo menos 4 de 5 pessoas do público do Instituto, no teste de usabilidade.

<a id="rnf-p05"></a>
### RNF-P05 — Minimização de dados pessoais
* **Classificação FURPS+:** Restrição de Design (+) / Segurança (*Security*)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O cadastro deve conter apenas identificação, contato e consentimentos, sem campos estruturados de dado pessoal sensível (LGPD art. 5º, II), e restringir o acesso aos dados nominais por perfil.
* **Métrica Verificável:** 0 campos estruturados de dado sensível no esquema do banco (revisão de esquema); 100% de bloqueio (HTTP 403) de acesso a dados nominais pelo perfil administrativo-financeiro em teste de rotas.

---

## 3. Perguntas-chave

### Quais são os dados mínimos para inscrever uma pessoa em uma oficina?
* Nome, telefone, data de nascimento (ou faixa etária) e os consentimentos. CPF apenas se o instrumento do projeto exigir. Nenhum dado sensível estruturado (RNF-P05).
* **A confirmar com o Instituto:** quais dados são coletados hoje na inscrição (ponto 6 da ata de 08/09).

### Como tratar o consentimento de menores de idade?
* **Hipótese da equipe, ainda não validada:** para menor de 18 anos, o formulário registra o responsável legal e o consentimento é dado por ele (LGPD art. 14). Base legal e prazo de retenção a definir com o Instituto.
* **A confirmar com o Instituto:** se as atividades atendem crianças e adolescentes (ponto 6 da ata de 08/09).

### A recusa do uso de imagem impede a participação?
* Não. A autorização de imagem é um consentimento separado (RF-P10) e a recusa não condiciona a inscrição nem a participação.

---

## 4. Rastreabilidade

| Requisito | CP | OE | Gargalo BPMN | Mitigação / norma | HU |
| :--- | :---: | :---: | :---: | :--- | :---: |
| RF-P01 | CP3 | OE02 | G03, G04 | — | HU-06 |
| RF-P02 | CP3 | OE02 | — | — | HU-06 |
| RF-P03 | CP3 | OE02 | — | Seção 3.3.10 | HU-06 |
| RF-P04 | CP3 | OE01, OE02 | — | — | HU-06 |
| RF-P05 | CP3 | OE01, OE02 | — | — | HU-06 |
| RF-P06 | CP5 | OE01 | G04 | — | HU-06 |
| RF-P07 | CP5 | OE01 | G04 | — | HU-06 |
| RF-P08 | CP5 | OE01 | G04 | LGPD art. 7º e 8º | HU-06 |
| RF-P09 | CP5 | OE01 | G04 | Seção 3.3.5; LGPD art. 8º, §5º | HU-06 |
| RF-P10 | CP5 | OE01 | — | Seção 3.3.4; LGPD art. 7º e 8º | HU-06 |
| RF-P11 | CP5 | OE01 | — | Seção 3.3.9; LGPD art. 18 | HU-06 |
| RF-P12 | CP5 | OE01 | — | Seção 3.3.9; LGPD art. 18 | HU-06 |
| RNF-P01 | CP3 | OE02 | — | Conexão móvel | HU-06 |
| RNF-P02 | CP5 | OE01 | G04 | LGPD art. 18 | HU-06 |
| RNF-P03 | CP5 | OE01 | — | Seção 3.4 (BYOD e furto de aparelho) | HU-06 |
| RNF-P04 | CP3 | OE02 | — | Seção 3.3.10 | HU-06 |
| RNF-P05 | CP5 | OE01 | G04 | Seção 3.5; LGPD art. 5º, II | HU-06 |

## 5. Pontos abertos para a consolidação

* Numeração definitiva, a combinar com a Dupla B. No catálogo atualizado (PR #50), RF10 a RF12 (formulário público, histórico e consentimento) sobrepõem RF-P01, RF-P06 e RF-P08; os demais requisitos deste documento são novos.
* Critérios de aceitação em **lista de critérios verificáveis e objetivos**, e não no formato Dado, Quando, Então (diretriz da disciplina, registrada na issue #23). Partem dos critérios já existentes da HU-06 (CA-06.1 a CA-06.3) e serão detalhados após a validação das hipóteses com o Instituto.
* A inscrição (CP3) não tem história própria na Sprint 1: a HU-06 trata do histórico, da duplicidade e do consentimento. RF-P01 a RF-P05 ficam como candidatos a nova história, o que a matriz de rastreabilidade (#44) deve registrar.
