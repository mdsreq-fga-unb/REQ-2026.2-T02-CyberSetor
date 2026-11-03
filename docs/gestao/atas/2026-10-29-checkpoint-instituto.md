# Ata — Checkpoint com o Instituto Cultural e Social No Setor — 29/10/2026

Versão **preliminar**, sujeita à conferência do Instituto antes da publicação definitiva. Esta ata é uma síntese revisada pela relatora; a gravação e a transcrição ficam restritas ao Drive da equipe e não são publicadas.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-10-29 |
| **Tipo** | Reunião com o cliente — checkpoint com demonstração da primeira entrega |
| **Data** | 29/10/2026 (quinta-feira) |
| **Horário** | Início às 16h30 |
| **Formato** | Remoto, Google Meet |
| **Participantes — Instituto** | Maria Clara Novaes (Núcleo Pedagógico) e Maria Eduarda (Duda — Núcleo Pedagógico) |
| **Participantes — CyberSetor** | Vinicius Vieira e Maria Eduarda Marques |
| **Condução** | Vinicius Vieira e Maria Eduarda Marques |
| **Relatoria** | Maria Eduarda Marques |
| **Registro** | Gravação e anotações automáticas, arquivadas no Drive restrito da equipe |
| **Sprint** | Sprint 4 (20/10 – 03/11/2026) |
| **Reuniões anteriores relacionadas** | [Ata de validação do MVP de 08/10/2026](2026-10-08-validacao-mvp-instituto.md) · [Ata da reunião da equipe de 27/10/2026](2026-10-27-reuniao-equipe.md) |

> **Nota de desambiguação:** "Maria Eduarda (Duda)" refere-se à representante do Núcleo Pedagógico do Instituto; "Maria Eduarda Marques" refere-se à integrante da equipe CyberSetor e PO interna.

---

## 1. Resumo

Primeiro checkpoint com o Instituto, com a demonstração do sistema no ambiente de homologação, que já roda em servidor e domínio próprios. A equipe apresentou o painel inicial, os perfis de acesso, o cadastro de instrumentos, projetos e metas e a inscrição pública por link e QR Code. O Instituto validou o rumo do produto e trouxe pedidos para os próximos incrementos: campos personalizados no formulário de inscrição, avisos automáticos por e-mail, identificação de cadastros já existentes e acesso administrativo além da Presidência. Também foi proposto um projeto real para os testes práticos, que depende de confirmação da direção do Instituto.

## 2. Registro por tema

### 2.1 Ambiente, painel e perfis de acesso

* **Ambiente de homologação:** a aplicação roda em servidor e domínio próprios, para que o Instituto acompanhe e teste as entregas. O produto final está previsto para o fim de novembro e o início de dezembro.
* **Painel inicial:** a equipe mostrou o painel da Presidência e da gestão de projetos, com os indicadores resumidos.
* **Perfis de acesso:** foram mostrados os perfis do Núcleo Pedagógico, da administração do sistema e do administrativo-financeiro. Os perfis com menos privilégios não criam setores nem instrumentos.

### 2.2 Instrumentos, projetos e metas

* **Cadastro:** a equipe apresentou o cadastro dos instrumentos que originam os projetos (edital, emenda parlamentar ou parceria), com anexo do documento formal em PDF ou DOCX, e a associação de metas quantitativas e qualitativas.
* **Preenchimento do descritivo:** Maria Clara Novaes perguntou se os descritivos das metas são extraídos automaticamente do plano de trabalho. A equipe esclareceu que, na primeira versão, o preenchimento é manual; rascunhos automáticos podem vir depois, quando o uso padronizar os registros.

### 2.3 Inscrição pública

* **Link e QR Code:** a equipe mostrou a abertura da inscrição de uma atividade, que gera um link e um QR Code para divulgação por WhatsApp, Instagram ou material impresso.
* **Formulário sem conta:** a pessoa se inscreve sem criar conta. Para menores de 18 anos, o formulário pede os dados do responsável legal. As autorizações de comunicados e de uso de imagem são opcionais e separadas. O envio repetido não gera inscrição duplicada.
* **Campos personalizados:** Maria Clara Novaes perguntou se é possível incluir novos dados no formulário. A equipe confirmou a previsão de campos personalizados de múltipla escolha, de texto descritivo e de anexo.
* **Acessibilidade:** Maria Clara Novaes destacou a importância de saber, antes do início das oficinas, das necessidades de acessibilidade, de mobilidade e de neurodivergência dos participantes, para o planejamento das atividades e a prestação de contas.

### 2.4 Avisos automáticos

* **E-mail:** Maria Eduarda (Duda) perguntou se o sistema pode enviar mensagens automáticas sobre as inscrições e o início das aulas. A equipe confirmou o envio de avisos por e-mail, com antecedência configurável (por exemplo, 3 dias, 1 dia e 30 minutos antes), além do e-mail de recuperação de senha.
* **WhatsApp:** a integração pela API oficial do WhatsApp foi discutida, com custo cobrado em dólar por mensagem. O Instituto relatou que o envio manual de mensagens em grande quantidade por números pessoais já causou bloqueios por spam. A equipe se comprometeu a avaliar alternativas nos próximos incrementos.

### 2.5 Cadastros de participantes recorrentes

* **Manutenção dos cadastros:** Maria Eduarda Marques perguntou se os cadastros de participantes que deixaram de frequentar devem ser mantidos ou excluídos. Maria Clara Novaes defendeu mantê-los, para formar um banco de participantes e permitir a inscrição da mesma pessoa em vários projetos.
* **Cadastro já existente:** a equipe propôs identificar, na nova inscrição, o cadastro que já existe, com um indicador de verificação na lista de inscritos.

### 2.6 Níveis de acesso

* **Acesso administrativo:** o Instituto pediu que os privilégios máximos, hoje concentrados na Presidência, sejam estendidos à coordenação de execução e à direção de projetos, em razão da agenda da Presidência.
* **Setor conjunto:** a equipe propôs estruturar a Presidência e a gestão de projetos como um setor conjunto.

### 2.7 Projeto piloto

* Maria Clara Novaes propôs usar como projeto modelo dos testes práticos um novo projeto de escola carnavalesca, realizado em parceria com um grupo carnavalesco e com prestação de contas feita por terceiros. A equipe apoiou a proposta, porque os testes com fluxos reais revelam necessidades operacionais e restrições de acesso. A escolha depende de confirmação da Presidência e da direção.

### 2.8 Retorno do Instituto

* As representantes do Instituto avaliaram positivamente o trabalho da equipe, destacando a organização e a profissionalização digital que a ferramenta deve trazer à gestão do Instituto.

## 3. Decisões

| # | Decisão | Impacto |
|---|---|---|
| D1 | **Cadastros de participantes mantidos**, para formar um banco de participantes e permitir a inscrição em vários projetos | Exclusão e anonimização ficam restritas ao pedido do titular (HU-15b) |
| D2 | **Cadastro já existente identificado na nova inscrição**, com indicador de verificação na lista de inscritos | Responde à pendência de repetição de e-mail ou CPF (HU-07a, HU-08; seção 8.6, item 8) |
| D3 | **Avisos automáticos por e-mail** sobre inscrição e início das atividades, com antecedência configurável, e recuperação de senha por e-mail; WhatsApp fica para avaliação posterior | Product Backlog |
| D4 | **Campos personalizados no formulário de inscrição** (múltipla escolha, texto e anexo), a partir do modelo de formulário que o Instituto vai enviar | Product Backlog; pendência dos formulários usados pelo Instituto (HU-07a) |
| D5 | **Acesso administrativo estendido** à coordenação de execução e à direção de projetos, com a Presidência e a gestão de projetos estruturadas como setor conjunto | Perfis e setores (HU-02a, HU-16) |
| D6 | **Próxima reunião em 05/11/2026**, com as melhorias nas inscrições e o envio de e-mails | Validação com o Instituto |

## 4. Encaminhamentos

| # | Ação | Responsável | Prazo |
|---|---|---|---|
| 1 | Confirmar com a Presidência e a direção o uso do projeto da escola carnavalesca como projeto modelo dos testes | Maria Clara Novaes | Antes de 05/11/2026 |
| 2 | Enviar o modelo de formulário com o descritivo de curso, para a análise dos campos | Maria Clara Novaes | Antes de 05/11/2026 |
| 3 | Testar o sistema na homologação com as contas fornecidas pela equipe | Instituto | Até 05/11/2026 |
| 4 | Publicar na homologação as melhorias de inscrição e avisar o Instituto a cada entrega | Vinicius Vieira e Maria Eduarda Marques | Contínuo |
| 5 | Construir os avisos por e-mail de inscrição e de início das atividades e a recuperação de senha (D3) | Vinicius Vieira e Maria Eduarda Marques | Sprint 5 |
| 6 | Identificar o cadastro já existente na nova inscrição (D2) | Vinicius Vieira e Maria Eduarda Marques | Sprint 5 |
| 7 | Ajustar os níveis de acesso e o setor conjunto (D5) | Vinicius Vieira e Maria Eduarda Marques | Sprint 5 |
| 8 | Confirmar no grupo do Instituto a reunião de 05/11 | Maria Eduarda Marques | 30/10/2026 |
| 9 | Enviar a presente ata ao Instituto para conferência | Maria Eduarda Marques | 04/11/2026 |

## 5. Pendências e pontos em aberto

| # | Pendência | Depende de | Encaminhamento |
|---|---|---|---|
| P1 | Projeto modelo dos testes práticos | Presidência e direção do Instituto | Encaminhamento 1 |
| P2 | Campos do formulário de inscrição usados hoje pelo Instituto | Modelo de formulário do Instituto | Encaminhamento 2 |
| P3 | Coleta de dados de acessibilidade, mobilidade e neurodivergência: são dados pessoais sensíveis (LGPD, art. 11), que exigem finalidade definida e consentimento específico antes de entrar no formulário | Equipe e Instituto | Analisar com o campo personalizado (D4) |
| P4 | Canal e custo dos avisos por WhatsApp | Equipe | Avaliação depois do e-mail (D3) |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 03/11/2026 | Maria Eduarda Marques | Elaboração inicial a partir das anotações automáticas da reunião, com revisão de dados sensíveis; aguarda a conferência do Instituto |
