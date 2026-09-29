# Ata — Reunião de alinhamento com o Instituto Cultural e Social No Setor

Versão **preliminar**, sujeita à conferência do Instituto antes da publicação definitiva. Esta ata é uma síntese revisada pelo relator; a gravação e a transcrição ficam restritas ao Drive da equipe e não são publicadas.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-09-15 |
| **Tipo** | Reunião com o cliente — alinhamento de demandas e prioridades do MVP |
| **Data** | 15/09/2026 (terça-feira) |
| **Horário** | Início às 16h02 |
| **Formato** | Remoto, Google Meet |
| **Participantes — Instituto** | Maria Clara Novaes (Núcleo Pedagógico), Fillipe Ramos (Coordenação Administrativo-Financeira) e Franci (Coordenação de Execução) |
| **Participantes — CyberSetor** | Vinicius Vieira, Daniel Batista e Caio Martins |
| **Condução** | Conjunta, pela equipe CyberSetor e representantes do Instituto |
| **Relatoria** | Relatoria conjunta: Daniel Batista e Maria Eduarda Marques; consolidação e revisão: Caio Martins e Vinicius Vieira |
| **Registro** | Gravação e transcrição automática, com consentimento, arquivadas no Drive restrito da equipe |
| **Sprint** | Sprint 1 |
| **Reuniões anteriores relacionadas** | [Ata da reunião presencial de 08/09/2026](2026-09-08-reuniao-presencial-instituto.md) |

---

## 1. Resumo

Reunião de alinhamento com o Instituto para debater as demandas da organização, compreender os fluxos operacionais de compras e pagamentos, tratar da governança e restrições de dados pessoais (LGPD) e avaliar expectativas quanto ao escopo do MVP, com ênfase na viabilidade das demandas de automação de chamados e painéis gerenciais para a Presidência.

## 2. Registro por tema

### 2.1 Fluxo organizacional

* **Estrutura interna:** Fillipe Ramos detalhou a organização institucional: diretoria colegiada de três pessoas, coordenação administrativo-financeira, coordenação de execução, além das coordenações pedagógica, cultural e de projetos específicos.
* **Processos administrativos:** O ciclo operacional envolve tomada de preços, cartas-convite, cadastro de fornecedores, formalização de contratos e envio de relatórios periódicos de atividades via Google Forms por projeto. Os pagamentos ocorrem majoritariamente pela plataforma TransferGov, combinada com Internet Banking e o sistema distrital Parcerias.
* **Matriz de Aquisição:** O acompanhamento de compras e despesas baseia-se em uma planilha em Excel preenchida manualmente pelo administrativo-financeiro com base no plano de trabalho e no plano de aplicação. Foi destacada a fragilidade desse controle manual, que carece de automação e fórmulas integradas, expondo a equipe a riscos de inconsistências e perda de histórico.

### 2.2 Dados pessoais e LGPD

* **Segregação de acessos:** Maria Clara Novaes estabeleceu a necessidade de separação estrita de acessos entre as áreas: o setor administrativo-financeiro deve acessar apenas os dados pertinentes à sua gestão (compras, contratos e notas fiscais), sem acesso a dados nominais de participantes.
* **Atendimento a menores e vulneráveis:** Os cadastros e formulários de inscrição dos estudantes devem ficar vinculados exclusivamente ao núcleo pedagógico, tanto para conformidade com a LGPD quanto pelo fato de as atividades formativas atenderem crianças, adolescentes e públicos em situação de vulnerabilidade.
* **Compromisso técnico:** A equipe de desenvolvimento ratificou que a solução implementará controle de acesso baseado em papéis (RBAC), assegurando que dados nominais não sejam expostos fora do escopo pedagógico.

### 2.3 Demandas e prioridades do MVP (automação e painéis gerenciais)

* **Painel consolidado para a Presidência:** Franci e Fillipe Ramos relataram o pedido do presidente Rafael por um dashboard unificado que permita acompanhar execuções, cronogramas, saldos e remanejamentos entre projetos. A equipe técnica esclareceu a limitação temporal do semestre e registrou a demanda como candidata, pendente de validação direta com a Presidência e sem prioridade definida no MVP atual.
* **Gestão de chamados descentralizados:** Fillipe Ramos apontou a sobrecarga decorrente de demandas internas que chegam de forma desordenada por e-mail e mensagens, sugerindo uma ferramenta de chamados ou ordens de serviço (registrada como candidata).
* **Armazenamento, VPS e rotina de backup:** Vinicius Vieira explicou a necessidade de centralizar o armazenamento de documentos (PDFs, relatórios e XMLs) por meio de um serviço de armazenamento de objetos (*object storage*), evitando custos operacionais elevados de manipulação manual. Para manter a API e a base de dados online, propôs a utilização de uma rede virtual privada (VPS) com rotinas de backup automatizadas a cada 6 horas para assegurar a integridade dos dados e evitar perdas. Além disso, a aplicação proverá suporte à exportação de relatórios e planilhas consolidadas (PDF, CSV/Excel) para arquivamento no Google Drive institucional do Instituto.
* **Comprovações em campo e funcionamento offline:** Registrada a necessidade de captação de evidências e presenças em campo, inclusive sem sinal de internet. Vinicius Vieira explicou o uso de cache local no navegador com armazenamento de dados com geolocalização e carimbo de tempo, sincronizando automaticamente com o servidor e realizando tratamento de desduplicação quando a conexão for restabelecida.

## 3. Decisões

| # | Decisão |
|---|---|
| 1 | Os dados nominais e formulários de inscrição de participantes ficam restritos exclusivamente ao acesso do núcleo pedagógico, bloqueando-se o acesso pelo setor administrativo-financeiro (LGPD). |
| 2 | O painel para a Presidência e o sistema de ordens de serviço são registrados como demandas candidatas em estudo de viabilidade, mantendo o foco inicial do MVP na coleta de campo e na prestação de contas. |
| 3 | Adoção de arquitetura com VPS e rotinas automatizadas de backup a cada 6 horas, com suporte à exportação de relatórios e dados consolidados em formatos abertos (PDF, CSV/Excel) para arquivamento no Google Drive da instituição. |
| 4 | Realização de visita presencial da equipe ao Instituto para examinar o fluxo prático das analistas em projetos reais (projetos 061 a 065 e 068). |

## 4. Encaminhamentos

| # | Ação | Responsável | Prazo |
|---|---|---|---|
| 1 | Contatar o presidente Rafael para agendar reunião de alinhamento com a equipe técnica | Maria Clara Novaes | 16/09/2026 |
| 2 | Realizar visita presencial ao Instituto para análise prática da Matriz de Aquisição | Daniel Batista e Vinicius Vieira | 16/09/2026 |
| 3 | Redigir e publicar a ata da reunião para conferência das partes | Daniel Batista e Maria Eduarda Marques (Relatoria conjunta) | 20/09/2026 |
| 4 | Mapear os requisitos de LGPD e perfis de acesso na especificação da Unidade 2 | Dupla A (Maria Eduarda e Daniel) | 20/09/2026 |

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 19/09/2026 | Maria Eduarda Marques | Estrutura inicial da ata e resumo da reunião |
| 0.2 | 20/09/2026 | Daniel da Silva Batista e Maria Eduarda Marques | Preenchimento integral dos registros temáticos, participantes, decisões e encaminhamentos a partir das anotações da reunião (relatoria conjunta) |
| 0.3 | 21/09/2026 | Caio Martins | Correção da identificação dos participantes (Franci - Coordenação de Execução) e remoção de menção a terceiros na lista de presença |
| 0.4 | 29/09/2026 | Caio Martins | Ajuste do nome de Maria Clara Novaes, detalhamento da infraestrutura VPS e rotina de backup de 6h, uniformização da grafia de Franci e formalização da relatoria conjunta |
| 1.0 | Pendente | — | Validação formal pelo Instituto, após conferência |
