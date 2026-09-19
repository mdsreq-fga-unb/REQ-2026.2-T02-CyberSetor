---
title: "[Tarefa Dupla A] Elaborar Requisitos de Inscrição, Base de Pessoas e LGPD (CP3, CP5)"
assignees: mariadenis,daniboycam
labels: "tipo: tarefa,epico: pessoas,er: declaracao,sprint: 1,moscow: must"
---
## Objetivo da Atividade
A **Dupla A** (`mariadenis` e `daniboycam`) é responsável por analisar os fluxos de relacionamento com os participantes e a governança de dados pessoais do Instituto No Setor, **especificando formalmente os Requisitos Funcionais (RFs) e Não Funcionais (RNFs)** associados a:
- **CP3:** Inscrição de participantes;
- **CP5:** Cadastro e histórico de pessoas;
- Diretrizes de privacidade e conformidade com a LGPD (Lei 13.709/2018).

---

## Insumos e Leituras Obrigatórias
Antes de redigir os requisitos, a dupla deve ler e extrair os fluxos e regras dos seguintes documentos:
1. **`docs/visao/2-solucao-proposta.md`**:
   - Seção 2.2: OE02 (Agilizar inscrição) e OE01 (Eliminar dispersão).
   - Seção 2.3: CP3 (Inscrição pública via link/QR e lista de espera) e CP5 (Base única, histórico e consentimento).
   - Seção 2.6 (compromissos sobre tratamento de dados pessoais no diff de `integracao/u1-correcoes`).
2. **Branch `integracao/u1-correcoes` — `docs/visao/3-intervencao-social.md`**:
   - **Seção 3.3.4:** Segregação entre comprovante de execução e material de divulgação (consentimento de imagem voluntário e revogável).
   - **Seção 3.3.5:** Reutilização do histórico de contatos (proibição de spam, opt-in/opt-out para futuros editais, vedação de repasse a terceiros).
   - **Seção 3.3.9:** Retificação e contestação de registros pelo titular (art. 18 da LGPD).
   - **Seção 3.3.10:** Inclusão digital: manutenção obrigatória da inscrição assistida presencial para participantes sem conectividade.
3. **Branch `integracao/u1-correcoes` — `docs/requisitos/b1-bpmn-processo-atual.md`**:
   - **Gargalo G04:** Contatos retidos em celulares particulares de educadores e vulnerabilidade à LGPD.
4. **`docs/gestao/sprints/sprint-1.md`**: História **HU-06** (consulta ao histórico de participação de pessoa).

---

## Passo a Passo: O que a Dupla Deve Fazer

### 1. Elicitar e Estruturar os Requisitos Funcionais (RFs)
A dupla deve redigir os requisitos funcionais para cobrir os seguintes comportamentos esperados:
- **Página Pública de Inscrição (CP3):** Como o interessado acessa formulário público leve e responsivo divulgado por link e QR code em cartazes sem necessidade de criar conta/senha antecipadamente.
- **Inscrição Presencial Assistida (CP3):** Como o educador ou recepcionista do Instituto cadastra a inscrição em nome do participante que não possui celular ou internet.
- **Controle de Vagas e Lista de Espera (CP3):** Como o sistema bloqueia novas matrículas automáticas ao atingir o teto de vagas e cria fila de espera ordenada por momento de inscrição.
- **Base Única e Histórico Longitudinal (CP5):** Como consultar a ficha unificada de uma pessoa, visualizando todas as oficinas cursadas e eventos frequentados em diferentes projetos ao longo dos anos.
- **Detecção de Homônimos e Duplicidades (CP5):** Como o sistema alerta preventivamente no ato do cadastro coincidências de nome e telefone.
- **Governança de Consentimento e Imagem (CP5):** Como registrar consentimento explícito e datado para guarda cadastral (LGPD) e autorização separada para captura e uso de fotografias institucionais.
- **Direitos do Titular (LGPD) (CP5):** Como atender demandas de retificação de dados incorretos e exclusão/anonimização de cadastros.

> **Atenção ao Padrão Exigido pelo Professor Marsicano para cada RF:**
> - Código único (ex.: `RF08`, `RF09`...);
> - Nome estritamente no formato **Verbo no Infinitivo + Objeto** (ex.: *RF08 — Disponibilizar página pública de inscrição*);
> - Descrição clara do comportamento esperado (*"Deve ser possível ao usuário..."*);
> - Rastreabilidade explícita com as CPs de origem (`CP3`, `CP5`).

### 2. Elicitar os Requisitos Não Funcionais (RNFs) Relacionados
A dupla deve identificar e detalhar os requisitos não funcionais de privacidade, desempenho e segurança:
- **Desempenho da Inscrição Pública:** Tempo de carregamento leve em 3G/4G no navegador móvel (FCP < 2,5s).
- **Segurança e Privacidade (LGPD):** Não coletar dados sensíveis não estruturados; expiração de dados locais no aparelho após envio (*BYOD*); atendimento a exclusão em até 72h.
- **Usabilidade Inclusiva:** Interface clara para pessoas com baixa literacia digital.
- Classificar em **FURPS+** e **Sommerville** e fixar **métricas verificáveis**.

### 3. Perguntas-Chave que a Dupla Deve Responder
* Quais são os dados pessoais mínimos estritamente necessários para inscrever uma pessoa em uma oficina?
* Como tratar o consentimento de menores de idade atendidos no Setor Comercial Sul?
* A recusa do uso de imagem impede a participação da pessoa na atividade? (Não, deve ser segregado).

---

## Definição de Pronto (DoD)
- [ ] Requisitos Funcionais cobrindo CP3 e CP5 especificados rigorosamente no padrão do professor (Código + Verbo no Infinitivo + Objeto + Comportamento + Rastreabilidade).
- [ ] RNFs de privacidade, conformidade LGPD e tempo de carregamento catalogados com métricas verificáveis.
- [ ] Rastreabilidade mapeada com OE01, OE02, BPMN G04, HU-06 e Seções 3.3.4, 3.3.5, 3.3.9 e 3.3.10.
- [ ] Submissão do texto para consolidação na matriz e publicação na seção 8.
