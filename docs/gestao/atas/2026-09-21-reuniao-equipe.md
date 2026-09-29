# Ata — Reunião de Equipe e Alinhamento Técnico — 21/09/2026

Reunião interna da equipe CyberSetor com a participação da monitoria da disciplina, voltada ao debriefing da visita presencial ao Instituto No Setor, alinhamento dos débitos técnicos no GitHub, decisões de arquitetura e refinamento do escopo do MVP.

## Identificação

| Campo | Registro |
|---|---|
| **Código** | ATA-2026-09-21-EQ |
| **Tipo** | Reunião de equipe — debrief de visita, alinhamento técnico e revisão com monitoria |
| **Data** | 21/09/2026 (segunda-feira) |
| **Horário** | 18:39 – ~19:50 · duração ~70 min |
| **Local / plataforma** | Google Meet |
| **Formato** | Remoto |
| **Participantes — CyberSetor** | Vinicius Vieira, Maria Eduarda Marques, Lucas De Paula Leal, Rodrigo Henrique, Daniel Batista e Caio Martins |
| **Participantes — externos / convidados** | Camila Careli (Monitora da disciplina) |
| **Condução** | Vinicius Vieira (Scrum Master) e Camila Careli (Monitora) |
| **Registro** | Transcrição automática · consolidação: Rodrigo Henrique e Vinicius Vieira |
| **Sprint** | Transição Sprint 1 → Sprint 2 |
| **Documentos relacionados** | [Ata da visita técnica presencial de 21/09/2026](2026-09-21-reuniao-presencial-instituto.md) |

---

## 1. Pauta

1. Debriefing da visita técnica ao Instituto No Setor realizada na tarde do mesmo dia.
2. Alinhamento sobre a dinâmica de avaliação cruzada entre equipes em sala de aula.
3. Resolução de conflitos de merge e revisão das *issues* de requisitos no GitHub.
4. Análise da matriz de rastreabilidade e prevenção de ambiguidades nos requisitos.
5. Decisões de arquitetura tecnológica: banco de dados centralizado e uso de Docker.
6. Gestão de escopo e estratégia de priorização MoSCoW para o MVP da Unidade 2.

---

## 2. Resumo

A equipe realizou o repasse das impressões colhidas na visita presencial com Franci, Rafael e Duda, destacando a complexidade da Matriz de Aquisição e a profunda fragilidade dos arquivos operacionais no Google Drive. 

Com a presença da monitora Camila Careli, o grupo alinhou os preparativos para a avaliação dinâmica entre grupos, validou a integração das ramificações de requisitos realizada por Rodrigo Henrique e deliberou sobre a infraestrutura técnica da aplicação: adoção de banco de dados relacional e conteinerização via Docker/Docker Compose. Por fim, Camila alertou para o risco de listar uma quantidade excessiva de requisitos sem priorização consistente, orientando a equipe a utilizar o MoSCoW e uma matriz de valor versus capacidade técnica para delimitar um MVP viável.

---

## 3. Registro por tema

### 3.1 Debriefing da visita presencial ao Instituto
Lucas De Paula Leal, Maria Eduarda Marques e Vinicius Vieira relataram a rotina observada no SCS junto a Franci e Rafael. Ficou evidente a ausência de controles internos automatizados e a dependência de processos manuais estabelecidos há duas décadas. A busca por informações no Google Drive é caótica, e o trabalho das analistas é sobrecarregado pelo preenchimento redundante de planilhas de compras e cotações.

### 3.2 Alinhamento pedagógico e dinâmica em sala
Camila Careli alinhou a preparação da equipe para a atividade de avaliação cruzada na aula seguinte, onde uma equipe parceira auditará a documentação do CyberSetor. Vinicius Vieira e Rodrigo Henrique esclareceram que a prioridade técnica imediata consistiu na resolução dos débitos da Unidade 1 e na consolidação das *issues* de requisitos abertas no GitHub. O merge na ramificação `main` foi concluído por Rodrigo, permitindo a leitura atualizada no GitHub Pages.

### 3.3 Matriz de rastreabilidade e histórias de usuário
Daniel Batista apresentou a estruturação da matriz de rastreabilidade para conectar necessidades do negócio a requisitos funcionais, não funcionais e histórias de usuário. Camila sugeriu atentar para ambiguidades conceituais. A equipe validou que os requisitos devem conter critérios de aceitação objetivos e rastreabilidade bidirecional.

### 3.4 Decisões de arquitetura: banco de dados e Docker
Camila questionou a maturidade da escolha técnica para os dados. Vinicius Vieira fundamentou a necessidade inegociável de um banco de dados centralizado: o sistema lidará com dados de prestação de contas, histórico de fornecedores, cadastros pedagógicos e comprovações de campo, algo inviável de manter sobre planilhas. Para assegurar padronização de ambiente e simplificar a futura entrega técnica ao Instituto, deliberou-se o uso de Docker Compose em desenvolvimento e imagens Docker prontas para implantação.

### 3.5 Controle de escopo do MVP e priorização MoSCoW
Diante de uma listagem volumosa levantada (mais de 30 requisitos funcionais e 20 não funcionais), Camila recomendou cuidado para não apresentar um escopo inviável ao professor George. Maria Eduarda pontuou que os requisitos mapeiam a visão completa, mas Daniel Batista e Vinicius Vieira frisaram que a matriz de priorização MoSCoW selecionará estritamente os itens essenciais (*Must-have*) para a entrega funcional do semestre.

---

## 4. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | **Adoção de banco de dados relacional centralizado** | Eliminar a manipulação manual de dados em planilhas dispersas e viabilizar a rastreabilidade e integridade das comprovações | Base arquitetural do backend |
| D2 | **Conteinerização com Docker e Docker Compose** | Padronizar o ambiente entre os desenvolvedores e viabilizar deploy facilitado e portabilidade | Infraestrutura de desenvolvimento e entrega |
| D3 | **Priorização rigorosa do MVP via MoSCoW e matriz de valor/esforço** | Evitar sobrecarga e questionamentos da banca quanto à viabilidade temporal do projeto | Delimitação do escopo funcional da U2 |
| D4 | **Vinculação estrita entre histórias de usuário e requisitos na matriz** | Assegurar rastreabilidade bidirecional exigida pela metodologia de Engenharia de Requisitos | Rastreabilidade do backlog |

---

## 5. Próximas etapas

| # | Ação | Responsável | Prazo | Situação |
|---|---|---|---|---|
| A1 | Revisar requisitos publicados no site e apontar ambiguidades | Camila Careli (Monitora) | 22/09/2026 | Em andamento |
| A2 | Consolidar correções de links e layout das páginas de requisitos | Rodrigo Henrique | 22/09/2026 (12h) | Concluído |
| A3 | Estruturar a sessão de Sprint Review e Retrospectiva da Sprint 1 | Vinicius Vieira | 22/09/2026 (noite) | Agendado |
| A4 | Elaborar matriz de valor de negócio x capacidade técnica | Daniel Batista | 25/09/2026 | Planejado |

---

## Histórico de versões

| Versão | Data | Autor | Descrição |
|---|---|---|---|
| 0.1 | 21/09/2026 | Rodrigo Henrique e Vinicius Vieira | Registro preliminar a partir da transcrição da reunião com a monitoria |
| 0.2 | 29/09/2026 | Caio Martins | Estruturação no formato formal de atas do projeto, inclusão das decisões de infraestrutura e contextualização da visita |
| 1.0 | 29/09/2026 | Vinicius Vieira | Revisão final para publicação oficial |
