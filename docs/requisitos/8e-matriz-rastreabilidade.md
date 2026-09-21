# 8e. Matriz de rastreabilidade bidirecional

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 21/09/2026 | 0.1 | Rascunho da matriz de rastreabilidade dos RFs e RNFs das duplas A, B e C, com auditoria de lacunas (Issue #44) | Dupla A (Maria Eduarda Marques e Daniel Batista) |

Liga cada requisito à sua origem (problema do cliente, objetivo específico, característica de produto) e ao seu destino (história de usuário e critério de aceitação da Sprint 1). Inclui a auditoria de cobertura e de divergências entre os PRs #48, #50 e #52.

!!! note "Identificadores provisórios"
    Os RFs usam os códigos provisórios das duplas: `RF01`–`RF06` (Dupla B, PR #50), `RF-C01`–`RF-C10` (Dupla C, PR #52), `RF-R01`–`RF-R09` (Duplas C e B, PR #52) e `RF-P01`–`RF-P12` (Dupla A, PR #48). Os RNFs usam a numeração proposta no arquivo 8d (PR #43) (`RNF01`–`RNF18`). Quando a Dupla B fixar a numeração definitiva, basta trocar a primeira coluna.

## 1. Convenções

* **Gargalos (G01–G06):** definição oficial do B1 (PR #38): G01 destrinchamento manual de editais · G02 demandas descentralizadas · G03 listas em papel e fotos dispersas · G04 contatos em celulares particulares (LGPD) · G05 ausência de visão unificada para a Presidência · G06 risco de glosa na prestação de contas.
* **Objetivos específicos:** coluna "OE (2.3)" traz o principal e, entre parênteses, os secundários, **conforme a tabela 2.3 da solução proposta** para a CP do requisito. Onde o PR de origem usa outro OE, a divergência aparece na seção 5.
* **História e critério:** HU-01 a HU-06 e CA-xx.y do plano da Sprint 1. "sem HU" indica requisito que nenhuma história atual cobre.
* Referências a seções do Documento de Visão são por texto, sem link, porque dependem do PR #38.

## 2. Matriz dos requisitos funcionais

### CP1 — Gestão de projetos e metas (OE01; OE04)

| Requisito | Nome | Gargalo | Norma / mitigação | História e critério | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| RF01 | Cadastrar instrumento convocatório e parceria | G01 | MROSC art. 16 e 42 | HU-01 (pré-condição do CA-01.1) | Parcial |
| RF02 | Cadastrar projeto operacional | G01 | — | HU-01 (pré-condição do CA-01.1) | Parcial |
| RF03 | Desdobrar requisitos contratuais e metas | G01 | MROSC art. 22 e 42 | HU-01 (CA-01.1, CA-01.3) | Total |
| RF04 | Atribuir responsável, setor e prazo a meta | G02 | Decisão 3 da ata de 08/09 | HU-02 (CA-02.1, CA-02.3) | Parcial: falta a situação e o alerta de meta sem responsável |
| RF05 | Exibir linha do tempo e painel de prazos de metas | G01, G02 | — | HU-02 (CA-02.1) | Total |
| RF06 | Emitir alertas de proximidade de vencimento de metas | G02 | — | HU-02 (CA-02.2) | Total |

### CP2 — Gestão de atividades (OE01; OE04, OE06)

| Requisito | Nome | Gargalo | Norma / mitigação | História e critério | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| RF-C01 | Cadastrar atividade por modalidade de objeto | G03 | Seção 3.3.6 | HU-03 (CA-03.1) | Total |
| RF-C02 | Parametrizar exigência de comprovação de presença | G03 | Seção 3.3.6 | HU-03 (CA-03.2, CA-03.3) | Total |

### CP3 — Inscrição de participantes (OE02; OE01)

| Requisito | Nome | Gargalo | Norma / mitigação | História e critério | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| RF-P01 | Disponibilizar formulário público de inscrição | G03, G04 | — | sem HU | Lacuna de história |
| RF-P02 | Gerar QR Code de inscrição | — | — | sem HU | Lacuna de história |
| RF-P03 | Registrar inscrição presencial assistida | — | Seção 3.3.10 | sem HU | Lacuna de história |
| RF-P04 | Limitar vagas da atividade | — | — | sem HU | Lacuna de história |
| RF-P05 | Ordenar lista de espera | — | — | sem HU | Lacuna de história |

### CP4 — Registro de participação em campo (OE03; OE04)

| Requisito | Nome | Gargalo | Norma / mitigação | História e critério | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| RF-C03 | Registrar frequência em dispositivo móvel | G03 | — | sem HU | Lacuna de história |
| RF-C04 | Operar registro de presença em modo offline | G03 | Seção 3.3.3 | sem HU | Lacuna de história |
| RF-C05 | Sincronizar presenças com reconciliação idempotente | G03 | Seção 3.3.3 | sem HU | Lacuna de história |
| RF-C06 | Registrar lançamento extemporâneo com justificativa | G03 | Seção 3.3.8 | sem HU | Lacuna de história |
| RF-C07 | Apurar carga horária de participantes e facilitadores | G03 | — | sem HU | Lacuna de história |

### CP5 — Cadastro e histórico de pessoas (OE01; OE03, OE06)

| Requisito | Nome | Gargalo | Norma / mitigação | História e critério | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| RF-P06 | Consultar histórico de participação | G04 | — | HU-06 (CA-06.1) | Total |
| RF-P07 | Alertar cadastro duplicado | G04 | — | HU-06 (CA-06.2) | Total |
| RF-P08 | Registrar consentimento de guarda de dados | G04 | LGPD art. 7º e 8º | HU-06 (CA-06.3) | Total |
| RF-P09 | Registrar autorização de contato | G04 | Seção 3.3.5; LGPD art. 8º, §5º | HU-06 (restrição de conformidade) | Parcial: sem CA |
| RF-P10 | Registrar autorização de uso de imagem | — | Seção 3.3.4; LGPD art. 7º e 8º | HU-06 (restrição de conformidade) | Parcial: sem CA |
| RF-P11 | Retificar dados cadastrais | — | Seção 3.3.9; LGPD art. 18 | HU-06 (restrição de conformidade) | Parcial: sem CA |
| RF-P12 | Excluir ou anonimizar cadastro | — | Seção 3.3.9; LGPD art. 18 | HU-06 (restrição de conformidade) | Parcial: sem CA |

### CP6 — Acompanhamento automático de metas (OE04; OE01)

| Requisito | Nome | Gargalo | Norma / mitigação | História e critério | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| RF-R01 | Calcular progresso físico de metas em tempo real | G05 | — | HU-01 (CA-01.2); HU-05 (CA-05.1) | Total |
| RF-R02 | Parametrizar apuração para metas não lineares e marcos | G05 | — | sem HU | Lacuna de história |
| RF-R03 | Emitir alertas de risco de inexecução | G05 | — | sem HU | Lacuna de história |
| RF-R04 | Versionar metas por Termo Aditivo | G05 | MROSC art. 55 e 57 | sem HU | Lacuna de história |

### CP7 — Repositório de evidências (OE05; OE06)

| Requisito | Nome | Gargalo | Norma / mitigação | História e critério | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| RF-C08 | Anexar evidências documentais e fotográficas | G03 | — | HU-04 (CA-04.1) | Total |
| RF-C09 | Vincular evidência a meta contratual | G03 | — | HU-04 (CA-04.1, CA-04.3) | Parcial: falta o CA-04.2 (pendências por meta) |
| RF-C10 | Segregar acesso a fotos de beneficiários vulneráveis | G03 | Seção 3.3.4; LGPD; ECA | HU-04 (sem CA) | Parcial: sem CA |

### CP8 — Relatórios e exportação (OE06; OE04, OE05)

| Requisito | Nome | Gargalo | Norma / mitigação | História e critério | Cobertura |
| :--- | :--- | :---: | :--- | :--- | :--- |
| RF-R05 | Exigir justificativa prévia para metas não atingidas | G06 | MROSC art. 64, §1º | HU-05 (CA-05.2) | Total |
| RF-R06 | Emitir Relatório de Execução do Objeto | G06 | MROSC art. 63 a 66 | HU-05 (CA-05.1) | Total |
| RF-R07 | Gerar relatório diagramado em PDF via servidor | G06 | — | HU-05 (CA-05.3) | Total |
| RF-R08 | Exportar dados consolidados em formato tabular aberto | G06 | MROSC art. 64 | HU-05 (CA-05.3) | Total |
| RF-R09 | Registrar trilha de auditoria para retificações na prestação | G06 | — | HU-05 (sem CA) | Parcial: sem CA |

## 3. Matriz dos requisitos não funcionais

| RNF | Nome | Origem (decisão, risco ético ou norma) | Requisitos funcionais relacionados |
| :--- | :--- | :--- | :--- |
| RNF01 | Integridade transacional dos dados | HU-01 (CA-01.3) | RF03, RF-C05 |
| RNF02 | Auditabilidade das alterações | Seção 3.3.9 | RF-C06, RF-P11, RF-R09 |
| RNF03 | Segurança das comunicações e das sessões | Seções 3.3.1 e 3.3.2 (aparelhos pessoais) | Todos |
| RNF04 | Controle de acesso por perfil | Seção 3.5 | RF-C10, RF-P06 a RF-P12 |
| RNF05 | Minimização de dados pessoais | LGPD art. 5º, II; restrição de conformidade da HU-06 | RF-P01, RF-P03, RF-P06 |
| RNF06 | Prazo de atendimento à exclusão de dados | LGPD art. 18 | RF-P12 |
| RNF07 | Retenção documental decenal | MROSC art. 68 | RF-C08, RF-R06 |
| RNF08 | Integridade de relatórios fechados | MROSC art. 63 a 66 | RF-R05, RF-R06, RF-R07 |
| RNF09 | Resiliência offline e sincronização sem duplicidade | Seção 3.3.3 | RF-C03 a RF-C06, RF-C08 |
| RNF10 | Descarte de dados pessoais no aparelho | Seção 3.4 (BYOD) | RF-C04, RF-C08 |
| RNF11 | Desempenho das consultas agregadas | OE04 | RF05, RF06, RF-R01 |
| RNF12 | Desempenho da inscrição pública | OE02 | RF-P01, RF-P02 |
| RNF13 | Desempenho da geração de relatórios | OE06 | RF-R06, RF-R07 |
| RNF14 | Eficiência no envio de evidências | Seção 3.3.1 (custos do educador) | RF-C08 |
| RNF15 | Usabilidade móvel e inclusiva | Seção 3.3.10 | RF-P01, RF-P03, RF-C03 |
| RNF16 | Compatibilidade entre navegadores e dispositivos | Seção 2.4 | Todos |
| RNF17 | Restrição tecnológica e qualidade de código | Seção 2.4 | Todos |
| RNF18 | Cópia de segurança e recuperação de dados | Seção 2.6 | Todos |

## 4. Cobertura

### Gargalos do B1

| Gargalo | Requisitos | Situação |
| :--- | :--- | :--- |
| G01 | RF01, RF02, RF03, RF05 | Coberto |
| G02 | RF04, RF05, RF06 | **Parcial.** Chamados e ordens de serviço não têm requisito nem história (candidato no B1) |
| G03 | RF-C01 a RF-C10 | Coberto |
| G04 | RF-P01, RF-P06 a RF-P09, RF-P11, RF-P12 | Coberto |
| G05 | RF-R01 a RF-R04 (apuração) | **Parcial.** Não há requisito do painel consolidado para a Presidência (candidato no B1, não validado) |
| G06 | RF-R05 a RF-R09 | Coberto |

### Características de produto e objetivos

| CP | Requisitos | OE (2.3) |
| :--- | :--- | :--- |
| CP1 | RF01 a RF06 | OE01; OE04 |
| CP2 | RF-C01, RF-C02 | OE01; OE04, OE06 |
| CP3 | RF-P01 a RF-P05 | OE02; OE01 |
| CP4 | RF-C03 a RF-C07 | OE03; OE04 |
| CP5 | RF-P06 a RF-P12 | OE01; OE03, OE06 |
| CP6 | RF-R01 a RF-R04 | OE04; OE01 |
| CP7 | RF-C08 a RF-C10 | OE05; OE06 |
| CP8 | RF-R05 a RF-R09 | OE06; OE04, OE05 |

As oito características têm ao menos um RF, e os seis objetivos específicos são atendidos. Nenhum RF fica sem CP. Totais: 37 RFs e 18 RNFs.

## 5. Auditoria de divergências e lacunas

### Divergências entre os PRs e as fontes

1. **OEs das características de campo (PR #52).** O PR usa OE02 (agilizar a inscrição) para CP4, e a tabela 2.3 da solução proposta atribui **OE03** (eliminar a transcrição manual de presença). CP7 usa OE04, e a tabela atribui **OE05** (evidências), com OE06 secundário. CP2 usa OE02, e a tabela atribui **OE01**. Corrigir em RF-C01 a RF-C10.
2. **Alertas de prazo.** RF06 (PR #50) alerta com 7 dias, alinhado ao CA-02.2. RF-R03 (PR #52) usa 15 dias. Definir uma regra única, preferindo o CA-02.2 para prazo e reservando RF-R03 ao ritmo abaixo do planejado.
3. **G05 e HU-05.** RF-R01 a RF-R04 ligam G05 a HU-05, mas o B1 registra G05 como candidato sem história. Tratar como cobertura parcial.
4. **HU-03 e CP4.** O PR #52 liga RF-C03 a RF-C07 à HU-03, mas a HU-03 trata só do cadastro de atividade por tipo de objeto. O registro de presença não tem história.
5. **HU-06 e CP3.** O PR #48 liga RF-P01 a RF-P05 à HU-06, que trata de histórico, duplicidade e consentimento. A inscrição não tem história.
6. **Numeração.** O catálogo atual (PR #50) contém RF07 a RF15 escritos pela Dupla B como marcadores das demais frentes: RF07 a RF09 (CP2, CP4 e CP7), RF10 a RF12 (CP3 e CP5) e RF13 a RF15 (CP6 e CP8). Eles serão substituídos por `RF-C`, `RF-P` e `RF-R`.

### Lacunas de requisito

* **Situação do requisito.** A decisão 3 da ata de 08/09 prevê responsável, setor, prazo **e situação** por requisito. RF04 não registra a situação.
* **Meta sem responsável.** O CA-02.3 exige sinalizar a pendência quando não há responsável. Nenhum requisito faz isso; RF06 cobre só o vencimento.
* **Pendências de evidência por meta.** O CA-04.2 exige mostrar o que já foi anexado e o que falta por tipo de objeto. RF-C09 cobre o vínculo, mas não a visão de pendências.
* **Controle de demandas / chamados (G02)** e **painel da Presidência (G05):** candidatos sem requisito, a decidir na priorização.

### Lacunas de história

* **Sem história na Sprint 1:** CP3 (inscrição), CP4 (presença em campo), RF-R02 a RF-R04 e RF-C07. São candidatos a novas histórias no refinamento.
* **Sem critério de aceitação:** RF-P09 a RF-P12, RF-C10, RF-R09. Os critérios devem ser redigidos como **lista de critérios verificáveis**, e não no formato Dado, Quando, Então (diretriz da disciplina, issue #23).

### Sobreposições entre requisitos

* **Trilha de auditoria:** RF-P11, RF-C06 e RF-R09 pedem o mesmo mecanismo. Cobertos por RNF02; os RFs ficam como casos de uso dele.
* **Vagas:** RF-C01 define o número de vagas e RF-P04 bloqueia ao esgotá-las. Complementares; referenciar um ao outro.

## 6. Próximos passos

* Aplicar a numeração definitiva quando a Dupla B consolidar o catálogo.
* Corrigir os OEs do PR #52 (item 1) e decidir a regra de alertas (item 2).
* Levar as lacunas de história e de critério ao refinamento da Sprint 2, e as lacunas G02 e G05 à priorização MoSCoW.
