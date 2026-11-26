# Ferramentas e uso de IA

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 25/11/2026 | 1.0 | Declaração das ferramentas adotadas na gestão, engenharia de requisitos, desenvolvimento, testes, infraestrutura e apoio de inteligência artificial | Rodrigo Henrique |
| 26/11/2026 | 1.1 | Alinhamento das bibliotecas e ferramentas declaradas ao código vigente das branches de integração | Rodrigo Henrique |

Esta página declara as ferramentas usadas pela equipe na condução do projeto CyberSetor e as atividades em que cada uma foi aplicada, com atenção específica ao papel e aos limites das ferramentas de inteligência artificial.

Os critérios de seleção seguem a [matriz de competências](como-trabalhamos.md#competencias) da Sprint 0, a adoção de pilha aberta sem custo de licenciamento para o Instituto durante a disciplina ([seção 2.4](../visao/2-solucao-proposta.md#24-tecnologias-a-serem-utilizadas)) e a proteção de dados pessoais ([seção 2.6](../visao/2-solucao-proposta.md#politica-dados-pessoais)).

## Gestão, comunicação e engenharia de requisitos

| Ferramenta | Onde entra | Atividades realizadas |
|---|---|---|
| **GitHub (Repositório, Issues, Pull Requests e Actions)** | Fluxo de código, requisitos e documentação | Versionamento em três linhas independentes (`docs-homologacao`/`main`, `api-develop`/`api`, `web-develop`/`web`), registro de histórias, tarefas e bugs, revisão cruzada por pull request e verificações automatizadas a cada alteração. |
| **GitHub Projects** | Product Backlog e Sprint Backlog | Organização das histórias por sprint, épico, atividade de engenharia de requisitos e situação (`Todo`, `In Progress`, `Em revisão`, `Aguardando`, `Done`), servindo de fonte automática para os selos e páginas de tarefas do site. |
| **WhatsApp** | Comunicação diária da equipe e com o cliente | Coordenação interna nos canais *Avisos*, *Geral* e *Dailys* (registro escrito dos dias sem reunião presencial) e contato operacional com as interlocutoras do Instituto. |
| **Google Meet e Google Drive restrito** | Cerimônias e sessões com o Instituto | Condução das reuniões da equipe, Planning, Review, Retrospectiva, entrevistas e validações com o cliente, mantendo em repositório restrito as gravações e registros brutos autorizados. |
| **Google Docs** | Preparação colaborativa | Elaboração prévia de roteiros de entrevista, pautas e rascunhos de trabalho antes da consolidação no site. |
| **MkDocs Material + Python (`hooks/` e `pytest`)** | Site público do projeto | Geração estática do Documento de Visão e do catálogo no GitHub Pages em modo estrito, com scripts de conferência cruzada (`conferencia.py`), composição de fichas (`fichas.py`), cartões (`cartoes.py`), ligações entre códigos (`ligacoes.py`) e linha do tempo (`historico.py`). |
| **Figma** | Modelagem e apoio visual | Construção do Rich Picture, Mapa de Stakeholders, Diagrama de Ishikawa, diagrama BPMN 2.0 do processo atual ([Anexo B1](../requisitos/b1-bpmn-processo-atual.md)) e material visual apresentado ao Instituto (alocado pela [matriz de competências](como-trabalhamos.md#competencias)). |

## Desenvolvimento, testes e operação

A construção e a validação técnica do produto empregam diretamente os pacotes e serviços em uso nas branches de integração (`api-develop` e `web-develop`), alinhados à [seção 2.4](../visao/2-solucao-proposta.md#24-tecnologias-a-serem-utilizadas):

- **Back-end (`api/`):** **TypeScript**, **NestJS**, **Prisma** e **PostgreSQL** na modelagem de instrumentos, projetos, metas, atividades, inscrições, pessoas, consentimentos, perfis de acesso e relatórios; **Argon2** e **JWT** na autenticação e controle de sessões; **Swagger/OpenAPI** no contrato da API; **pdfmake** e **ExcelJS** na geração de relatórios em PDF e planilhas abertas (XLSX e CSV); **Handlebars** e **Brevo** no envio dos avisos por e-mail; **AWS SDK S3** compatível com **Backblaze B2** para anexos e cópias externas.
- **Front-end (`web/`):** **Next.js**, **React**, **Tailwind CSS**, **shadcn/ui**, **React Hook Form**, **Zod** e **TanStack Query** na interface responsiva para gestão e no formulário público de inscrição via celular com geração de QR Code (`qrcode`); **Dexie** previsto com Service Worker para a fila local sem conexão em incrementos posteriores.
- **Qualidade e entrega:** **Vitest**, **Supertest** e **Testing Library** nos testes unitários, de integração e de contrato da API por perfil; **Playwright** nos testes de interface e regressão visual (`360 px` a `1920 px`), acompanhado de **axe-core** nas medições de acessibilidade do RNF15 em integração na Sprint 6; **ESLint** e **Prettier** verificados por script (`pnpm verify`) e **GitHub Actions**; **pnpm**, **Docker Compose** no ambiente local e **Coolify** na implantação em homologação.

## Ferramentas de inteligência artificial

Conforme deliberado pela equipe nas atas de [27/08](atas/2026-08-27-reuniao-equipe.md), [27/10](atas/2026-10-27-reuniao-equipe.md) e [05/11/2026](atas/2026-11-05-sprint-review-retrospectiva-planning.md), ferramentas de IA foram utilizadas exclusivamente como apoio operacional à produtividade e à verificação, preservando a autoria humana e a validação com o cliente.

| Ferramenta / recurso | Atividades em que foi usada | O que permaneceu humano |
|---|---|---|
| **Transcrição e anotações automáticas (Google Meet)** | Apoio ao registro bruto das reuniões da equipe e das sessões remotas autorizadas com o Instituto, guardadas no Drive restrito da equipe. | Redação da ata sintética oficial, conferência de fidelidade das falas, remoção de dados pessoais/sensíveis e validação dos acordos com o Instituto. |
| **Assistentes e agentes de codificação (Claude / Claude Code, Google Gemini / Antigravity, ChatGPT e GitHub Copilot)** | Geração assistida de estrutura inicial de módulos NestJS e páginas Next.js a partir dos critérios de aceitação já especificados; ampliação de suítes de testes (Vitest, Supertest, Playwright e axe-core em integração na Sprint 6); diagnóstico de erros de tipagem e build; manutenção dos hooks em Python do MkDocs. | Definição arquitetural, modelagem de dados, adequação às regras de negócio e MROSC/LGPD, revisão linha a linha de cada pull request e decisão sobre o que integrar. |
| **Apoio editorial e conferência documental** | Revisão de clareza redacional, padronização estrutural de tabelas Markdown e verificação cruzada de referências entre seções da documentação. | Elicitação, negociação de escopo, priorização MoSCoW/valor × esforço, decisões de projeto e aceite com o Instituto. |

## Limites e salvaguardas no uso de IA

1. **Proteção de dados pessoais e confidencialidade (LGPD):** é vedado enviar dados pessoais reais de participantes, menores de idade ou documentos internos não anonimizados do Instituto para serviços externos de IA; tanto os ensaios quanto os testes em homologação utilizam exclusivamente massa fictícia ([dados de teste](../visao/2-solucao-proposta.md#dados-de-teste)).
2. **Decisões de requisitos e escopo exclusivas da equipe e do cliente:** nenhum requisito funcional, critério de aceitação, regra de negócio ou prioridade de entrega é definido por IA; toda regra decorre de legislação aplicável (Lei 13.019/2014 e LGPD) ou de validação registrada com o Instituto.
3. **Verificação determinística obrigatória:** todo código e alteração documental com apoio de IA deve passar integralmente pelas checagens automatizadas do projeto (`pytest`, `mkdocs build --strict`, formatação, linter, tipagem estrita e testes da API e do front).
4. **Revisão humana independente e responsabilidade técnica:** toda alteração entra exclusivamente via pull request revisado por integrante independente antes do merge, respondendo os autores humanos pela correção e conformidade do artefato entregue.
