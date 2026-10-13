# CyberSetor

> Sistema integrado de gestão operacional, registro de atividades e apuração contínua de metas para o **Instituto Cultural e Social No Setor**.

---

## 📌 Sobre o Projeto

O **CyberSetor** é uma solução de software desenvolvida no contexto da disciplina de **Requisitos de Software** na Universidade de Brasília (UnB - FGA), em parceria de extensão com a organização **Instituto No Setor**.

O sistema unifica a cadeia de dados das atividades socioculturais realizadas no Setor Comercial Sul (SCS) — desde a inscrição pública de participantes e chamada presencial em campo até o acompanhamento em tempo real de metas de editais públicos e geração automatizada de relatórios para prestação de contas.

---

## 🎯 Principais Objetivos

* **Centralização de Dados:** Eliminar a dispersão de registros em múltiplas planilhas e formulários isolados.
* **Registro Digital na Origem:** Viabilizar chamadas e lançamentos ágeis de presença diretamente em dispositivos móveis no território das ações.
* **Visibilidade de Metas:** Calcular automaticamente o atingimento de metas e participantes únicos por período, sinalizando riscos com antecedência.
* **Prestação de Contas Simplificada:** Organizar evidências de execução (fotos, atas e declarações) e automatizar relatórios institucionais consolidados.

---

## 📦 Entregas da Disciplina

### Unidade 1 – Visão de Produto e Projeto
- [x] **Projeto proposto e aprovado:** Proposta aprovada e repositório configurado.
- [x] **Visão de Produto e Projeto:** Seções 1 a 7, 11.1 e 12 integradas e validadas.
- [x] **Site do projeto (GitHub Pages):** Portal de documentação publicado via MkDocs.
- [x] **Vídeo de apresentação:** [Apresentação no YouTube (14m 57s)](https://youtu.be/EMGWe0XiE70).

### Unidade 2 – Elicitação e Modelagem de Requisitos
- [ ] Elicitação, técnicas de análise e consenso.
- [ ] Declaração e representação de requisitos (Histórias de Usuário e BPMN).
- [ ] Priorização, DoR/DoD e definição do MVP.
- [ ] Vídeo de apresentação da Unidade 2.

### Unidade 3 – Construção do MVP e Validação Incremental
- [ ] Desenvolvimento incremental do MVP.
- [ ] Testes de aceitação e integração contínua.
- [ ] Validação com o cliente (Sprint Review).
- [ ] Vídeo de apresentação da Unidade 3.

### Unidade 4 – Consolidação e Entrega Final
- [ ] Homologação final e transição do produto.
- [ ] Avaliação dos impactos da intervenção social.
- [ ] Relatório final e documentação consolidada.
- [ ] Vídeo de encerramento da disciplina.

---

## 🛠️ Tecnologias Principais

* **Front-end:** React, Next.js, Tailwind CSS e shadcn/ui.
* **Back-end:** Node.js, NestJS, TypeScript e PostgreSQL (via Prisma ORM).
* **Offline / PWA:** Service Workers, Workbox e IndexedDB (Dexie).
* **DevOps & Qualidade:** Docker, Docker Compose, GitHub Actions, Jest e Playwright.

---

## 📚 Documentação do Projeto

A documentação detalhada (Documento de Visão de Produto e Projeto, Engenharia de Requisitos e Guias Técnicos) está disponível no GitHub Pages, construída com MkDocs Material:

🔗 **[Acessar Documentação Oficial](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/)**

---

## 🔀 Como contribuir

Este repositório guarda a documentação e o código do produto em linhas separadas:

| Branch | Conteúdo |
|---|---|
| `main` | Documentação publicada no site |
| `docs-homologacao` | Documentação revisada, antes da publicação |
| `api-develop` → `api` | API: integração → produção |
| `web-develop` → `web` | Front: integração → produção |

Todo conteúdo entra por pull request revisado por integrante de outra dupla. Documentação: branch `docs/<assunto>` a partir da `docs-homologacao`. Código: `feat/api/HU-xx-<assunto>` ou `feat/web/HU-xx-<assunto>` a partir da branch de integração do componente. Para conferir o site localmente:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
GITHUB_TOKEN=$(gh auth token) python .github/scripts/fetch_issues.py  # páginas geradas do quadro (tarefas por sprint, débitos); exige gh autenticado com acesso ao projeto
mkdocs serve          # pré-visualização em http://127.0.0.1:8000
mkdocs build --strict # o mesmo teste que roda no CI
```

Branches, mensagens de commit, revisão, pontos de publicação e workflows estão em **[Boas práticas no GitHub](https://mdsreq-fga-unb.github.io/REQ-2026.2-T02-CyberSetor/gestao/boas-praticas-github/)** ([fonte](docs/gestao/boas-praticas-github.md)).

---

## 👥 Equipe

| | Integrante | Matrícula | GitHub | Papel |
|---|---|---|---|---|
| <img src="https://github.com/mariadenis.png?size=96" width="48" alt="Maria Eduarda Denis Duarte Marques"> | Maria Eduarda Denis Duarte Marques | 232014502 | [@mariadenis](https://github.com/mariadenis) | Líder · Product Owner interno · Elicitação e Descoberta |
| <img src="https://github.com/viniciusvieira00.png?size=96" width="48" alt="Vinicius Angelo de Brito Vieira"> | Vinicius Angelo de Brito Vieira | 190118059 | [@viniciusvieira00](https://github.com/viniciusvieira00) | Scrum Master · Organização e Atualização · Análise |
| <img src="https://github.com/Fofodoido.png?size=96" width="48" alt="Rodrigo Henrique Donato de Souza"> | Rodrigo Henrique Donato de Souza | 241012374 | [@Fofodoido](https://github.com/Fofodoido) | Representação (BPMN) · Análise e Consenso |
| <img src="https://github.com/lucaspaulaleal.png?size=96" width="48" alt="Lucas de Paula Leal"> | Lucas de Paula Leal | 232004480 | [@lucaspaulaleal](https://github.com/lucaspaulaleal) | Elicitação e Descoberta · Declaração |
| <img src="https://github.com/daniboycam.png?size=96" width="48" alt="Daniel da Silva Batista"> | Daniel da Silva Batista | 231011201 | [@daniboycam](https://github.com/daniboycam) | Representação (Rich Picture e Stakeholders) · Análise |
| <img src="https://github.com/caioflmjr.png?size=96" width="48" alt="Caio Flávio de Lima Martins Junior"> | Caio Flávio de Lima Martins Junior | 231011168 | [@caioflmjr](https://github.com/caioflmjr) | Declaração · Organização e Rastreabilidade |

---

## 🤝 Parceria

* **Parceiro / Cliente:** Instituto Cultural e Social No Setor (Núcleo Pedagógico e Administrativo)  
* **Metodologia:** ScrumXP (Gestão ágil integrada a práticas de engenharia de software)  
* **Desenvolvimento:** Equipe CyberSetor — Engenharia de Software (UnB - Campus Gama)
