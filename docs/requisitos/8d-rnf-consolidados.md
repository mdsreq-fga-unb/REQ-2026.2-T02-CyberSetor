# 8d. Requisitos não funcionais consolidados (FURPS+ e Sommerville)

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 21/09/2026 | 0.1 | Rascunho da consolidação dos RNFs das duplas A, B e C (Issue #43) | Maria Eduarda Marques (PO) e Vinicius Vieira (SM) |

Consolida em um único catálogo os 19 requisitos não funcionais propostos nos PRs #48 (`RNF-P01` a `RNF-P05`), #50 (`RNF01` a `RNF07`) e #52 (`RNF-C01` a `RNF-C04` e `RNF-R01` a `RNF-R03`). Elimina sobreposições, resolve conflitos de métrica e mantém, em cada RNF, a dupla classificação (FURPS+ e Sommerville) e um critério numérico verificável.

!!! note "Numeração proposta"
    Os códigos `RNF01` a `RNF18` abaixo são a **proposta de numeração definitiva** e substituem `RNF01` a `RNF07` do PR #50. A tabela da seção 3 mostra de onde veio cada um. Referências a seções do Documento de Visão (por exemplo, "seção 3.5") são por texto, sem link, porque dependem do PR #38.

## 1. Critérios de consolidação

* **Um RNF por propriedade de qualidade.** Requisitos que descreviam a mesma propriedade foram unidos (por exemplo, o funcionamento offline, descrito em três PRs).
* **Descrição sem tecnologia, métrica com método.** A descrição diz *o que* a qualidade exige; a ferramenta de verificação aparece só como método de medição da métrica.
* **Toda métrica é numérica e testável.** Metas de projeto ainda não medidas são identificadas como tais.
* **Restrições legais citam o dispositivo** e permanecem em RNFs próprios, para serem rastreadas até a norma.

## 2. Catálogo consolidado

### Confiabilidade e integridade

<a id="rnf01"></a>
### RNF01 — Integridade transacional dos dados
* **Classificação FURPS+:** Confiabilidade (*Reliability*)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade)
* **Descrição:** O sistema deve garantir que operações compostas sejam concluídas por inteiro ou revertidas por inteiro, sem deixar registros parciais em caso de falha.
* **Métrica Verificável:** 100% de reversão automática em operações compostas que falham e 0 registros órfãos ou inconsistentes após os testes de integração.

<a id="rnf02"></a>
### RNF02 — Auditabilidade das alterações
* **Classificação FURPS+:** Confiabilidade (*Reliability*) / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança e integridade)
* **Descrição:** O sistema deve registrar em trilha de auditoria permanente toda criação, alteração ou exclusão lógica de dados, com autor, data e hora, valores anteriores e posteriores e, quando houver, justificativa. Atende às retificações cadastrais, aos lançamentos extemporâneos e às alterações na prestação de contas.
* **Métrica Verificável:** 100% das operações de escrita com registro de auditoria e 0 comandos de alteração ou exclusão permitidos sobre a trilha, mesmo para o perfil administrador, em teste de rotas.

<a id="rnf08"></a>
### RNF08 — Integridade de relatórios fechados
* **Classificação FURPS+:** Confiabilidade (*Reliability*) / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Integridade)
* **Descrição:** O sistema deve garantir que o relatório finalizado reflita exatamente o estado dos dados no fechamento do ciclo e impedir alteração posterior sem rastro.
* **Métrica Verificável:** 100% de correspondência entre o *hash* SHA-256 do arquivo gerado e o registro gravado, e 0 alterações diretas sobre o período fechado.

<a id="rnf09"></a>
### RNF09 — Resiliência offline e sincronização sem duplicidade
* **Classificação FURPS+:** Confiabilidade (*Reliability*) / Usabilidade (*Usability*)
* **Classificação Sommerville:** Requisito de Produto (Confiabilidade e resiliência)
* **Descrição:** O registro de presença e de evidências em campo deve continuar funcionando sem conexão, reter os dados no aparelho mesmo após fechar o navegador ou reiniciar o dispositivo e, ao restabelecer a rede, sincronizar sem perder nem duplicar registros.
* **Métrica Verificável:** 0% de perda de registros após corte simulado de conexão e recarga da página; 0 presenças duplicadas após 5 submissões idênticas do mesmo lote; testes automatizados de ponta a ponta.

<a id="rnf18"></a>
### RNF18 — Cópia de segurança e recuperação de dados *(proposto; lacuna identificada)*
* **Classificação FURPS+:** Confiabilidade (*Reliability*)
* **Classificação Sommerville:** Requisito Organizacional (Operacional)
* **Descrição:** O sistema deve manter cópias de segurança periódicas do banco de dados, com cópia externa ao servidor de produção, e permitir sua restauração.
* **Métrica Verificável:** perda máxima aceitável de 6 h de dados e restabelecimento em até 8 h (*metas de projeto, ainda não medidas*), com ao menos um ensaio de restauração aprovado antes de declarar a recuperabilidade.

### Segurança e privacidade

<a id="rnf03"></a>
### RNF03 — Segurança das comunicações e das sessões
* **Classificação FURPS+:** Funcionalidade / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve proteger as comunicações em trânsito, rejeitar requisições sem credenciais válidas e limitar a duração das sessões, inclusive a inatividade em aparelhos pessoais.
* **Métrica Verificável:** 100% do tráfego por conexão cifrada; 100% de rejeição (HTTP 401) de requisições sem credenciais válidas; sessão expirada em até 8 h e em até 30 min de inatividade.

<a id="rnf04"></a>
### RNF04 — Controle de acesso por perfil
* **Classificação FURPS+:** Funcionalidade / Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve restringir cada operação e cada dado ao perfil autorizado, conforme a matriz de perfis da seção 4.
* **Métrica Verificável:** 100% de bloqueio (HTTP 403) de requisições de escopo insuficiente e 0 acessos a dados nominais pelo perfil administrativo-financeiro, em teste de rotas por perfil.

<a id="rnf05"></a>
### RNF05 — Minimização de dados pessoais
* **Classificação FURPS+:** Restrição de Design (+) / Segurança (*Security*)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O cadastro deve conter apenas identificação, contato e consentimentos, sem campos estruturados de dado pessoal sensível (LGPD, art. 5º, II). Fotografias e texto livre ficam sob controle de acesso por perfil.
* **Métrica Verificável:** 0 campos estruturados de dado sensível no esquema do banco (revisão de esquema).

<a id="rnf06"></a>
### RNF06 — Prazo de atendimento à exclusão de dados
* **Classificação FURPS+:** Funcionalidade / Requisito Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O sistema deve executar a exclusão ou anonimização solicitada pelo titular em prazo curto, com registro na trilha de auditoria (LGPD, art. 18).
* **Métrica Verificável:** 100% das solicitações atendidas em até 72 h, medido na trilha de auditoria.

<a id="rnf10"></a>
### RNF10 — Descarte de dados pessoais no aparelho
* **Classificação FURPS+:** Segurança (*Security*)
* **Classificação Sommerville:** Requisito de Produto (Segurança)
* **Descrição:** O sistema deve descartar os dados pessoais mantidos localmente em aparelhos pessoais (BYOD) após a confirmação de envio. A retenção prevista no RNF09 vale somente até essa confirmação.
* **Métrica Verificável:** 0 registros de participantes no armazenamento local após a confirmação de envio, em teste automatizado de aceitação.

### Conformidade legal (MROSC)

<a id="rnf07"></a>
### RNF07 — Retenção documental decenal
* **Classificação FURPS+:** Suportabilidade (*Supportability*) / Requisito Legal (+)
* **Classificação Sommerville:** Requisito Externo (Legislativo)
* **Descrição:** O sistema deve garantir a integridade e a guarda de relatórios homologados, listas de chamada e evidências pelo prazo legal (Lei 13.019/2014, art. 68).
* **Métrica Verificável:** retenção configurada para no mínimo 10 anos a partir do dia útil seguinte à prestação de contas, com cópia em local distinto do servidor principal e política de ciclo de vida ativa.

### Desempenho e eficiência

<a id="rnf11"></a>
### RNF11 — Desempenho das consultas agregadas
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** As consultas de painel e listagens devem responder sem degradação sob picos de acesso.
* **Métrica Verificável:** tempo de resposta inferior a 800 ms no percentil 95 sob 50 requisições concorrentes por segundo, com uso de CPU do servidor abaixo de 75%, em teste de carga.

<a id="rnf12"></a>
### RNF12 — Desempenho da inscrição pública
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O formulário público de inscrição deve carregar de forma leve em navegador móvel, em conexão 3G/4G.
* **Métrica Verificável:** *First Contentful Paint* inferior a 2,5 s em perfil de rede 4G lento, por auditoria automatizada.

<a id="rnf13"></a>
### RNF13 — Desempenho da geração de relatórios
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O sistema deve gerar o relatório em PDF de forma assíncrona e ágil, mesmo com muitos dados e evidências anexadas.
* **Métrica Verificável:** relatório de até 50 páginas e 100 miniaturas disponível para download em menos de 5 s no percentil 95, em teste de carga.

<a id="rnf14"></a>
### RNF14 — Eficiência no envio de evidências
* **Classificação FURPS+:** Desempenho (*Performance*)
* **Classificação Sommerville:** Requisito de Produto (Eficiência)
* **Descrição:** O sistema deve reduzir o tamanho das imagens antes do envio, para economizar o plano de dados do educador.
* **Métrica Verificável:** redução média mínima de 60% no peso das imagens de alta resolução e envio de cada foto em menos de 4 s em rede 4G padrão.

### Usabilidade, portabilidade e restrições

<a id="rnf15"></a>
### RNF15 — Usabilidade móvel e inclusiva
* **Classificação FURPS+:** Usabilidade (*Usability*)
* **Classificação Sommerville:** Requisito de Produto (Usabilidade)
* **Descrição:** As telas de campo e de inscrição devem ser confortáveis em celulares comuns, legíveis sob luz solar e utilizáveis por pessoa com baixa familiaridade digital.
* **Métrica Verificável:** áreas de toque de no mínimo 48x48 px; nenhuma rolagem horizontal a partir de 360 px de largura; 100% dos critérios WCAG 2.1 nível AA aplicáveis; inscrição concluída em até 5 telas e 3 min por ao menos 4 de 5 pessoas do público do Instituto, no teste de usabilidade.

<a id="rnf16"></a>
### RNF16 — Compatibilidade entre navegadores e dispositivos
* **Classificação FURPS+:** Suportabilidade (*Supportability*)
* **Classificação Sommerville:** Requisito de Produto (Portabilidade)
* **Descrição:** O frontend deve manter paridade funcional e visual em telas compactas e em desktops, nos navegadores modernos.
* **Métrica Verificável:** 0 falhas funcionais ou quebras de layout entre 360 px e 1920 px em Chromium >= 120, Firefox >= 120 e WebKit/Safari >= 17, em testes de regressão visual.

<a id="rnf17"></a>
### RNF17 — Restrição tecnológica e qualidade de código
* **Classificação FURPS+:** Restrição de Implementação (+)
* **Classificação Sommerville:** Requisito Organizacional (Implementação)
* **Descrição:** A solução deve seguir a pilha homologada na seção 2.4 do Documento de Visão e respeitar análise estática e compilação rigorosa.
* **Métrica Verificável:** 0 erros de tipagem em modo estrito, 0 avisos nas regras de análise estática e 100% de sucesso no *build* de produção na integração contínua.

## 3. De-para: origem dos requisitos consolidados

| Consolidado | Origem | Tratamento |
| :--- | :--- | :--- |
| RNF01 | #50 RNF01 | Mantido; tecnologia retirada da descrição |
| RNF02 | #50 RNF02 | Ampliado para cobrir RF-P11, RF-C06 e RF-R09 |
| RNF03 | #50 RNF03 (parte) + #48 RNF-P03 (parte) | Une sessão de 8 h e inatividade de 30 min |
| RNF04 | #50 RNF03 (parte) + #48 RNF-P05 (parte) | Perfis e HTTP 403, com a matriz da seção 4 |
| RNF05 | #48 RNF-P05 (parte) | Separado do controle de acesso |
| RNF06 | #48 RNF-P02 | Mantido |
| RNF07 | #52 RNF-R01 | Mantido |
| RNF08 | #52 RNF-R03 | Mantido |
| RNF09 | #50 RNF05 + #52 RNF-C01 + RNF-C02 | Três RNFs unidos |
| RNF10 | #48 RNF-P03 (parte) | Separado da sessão |
| RNF11 | #50 RNF04 | Mantido |
| RNF12 | #48 RNF-P01 | Mantido |
| RNF13 | #52 RNF-R02 | Mantido |
| RNF14 | #52 RNF-C04 | Mantido |
| RNF15 | #52 RNF-C03 + #48 RNF-P04 | Unidos |
| RNF16 | #50 RNF06 | Mantido |
| RNF17 | #50 RNF07 | Mantido |
| RNF18 | Seção 2.6 e ata de 15/09 | **Novo**: lacuna sem RNF |

Os 19 RNFs de origem viram 18: 17 consolidados a partir deles e 1 proposto. As fusões estão em RNF03, RNF04, RNF09 e RNF15.

## 4. Matriz de perfis (proposta, a validar com o Instituto)

Responde à pergunta "quem cria e edita versus quem consulta" da #39 e às regras de visibilidade da seção 3.5 do Documento de Visão.

| Perfil | Instrumentos, projetos e metas | Dados nominais de participantes | Presença e evidências | Relatórios |
| :--- | :--- | :--- | :--- | :--- |
| Presidência e gestão de projetos | Cria e edita | Sem acesso à base cadastral completa | Consulta | Gera e emite |
| Núcleo pedagógico e educadores | Consulta os itens de suas atividades | Acessa fichas para mediar as oficinas | Registra e consulta | Consulta |
| Administrativo-financeiro | Consulta | **Bloqueado** (só números consolidados) | Consulta consolidados | Consulta |
| Órgão concedente e auditoria | Sem acesso direto | Sem acesso à base cadastral | Evidências exigidas pela prestação de contas | Acesso pelo tempo da análise |

## 5. Decisões e pontos em aberto

* **Sessão:** a proposta mantém as duas regras (RNF03: 8 h de duração e 30 min de inatividade). Confirmar se 30 min é adequado ao trabalho de campo.
* **Versão do TLS:** o PR #50 fixava TLS 1.3. Aqui a versão sai da descrição e fica como item de verificação; confirmar com a Dupla B.
* **Conformidade do modelo de dados com o MROSC:** o catálogo anterior (#47) tinha esse RNF, com métrica baseada no art. 35 da Lei 13.019/2014, e o #50 o retirou. Não foi reintroduzido porque falta conferir se o art. 35 lista campos de cadastro ou requisitos de celebração. Decidir na consolidação.
* **RNF18** vem da seção 2.6 (integração da U1) e da ata de 15/09. Validar com a Dupla B se entra no catálogo.
* **Matriz de perfis (seção 4):** depende de validação com o Instituto, em especial o acesso da Presidência a dados nominais.
