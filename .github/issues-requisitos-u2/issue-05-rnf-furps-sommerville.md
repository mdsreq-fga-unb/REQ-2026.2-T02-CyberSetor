---
title: "[Tarefa SM & PO] Consolidar e Parametrizar Requisitos Não Funcionais (FURPS+ e Sommerville)"
assignees: viniciusvieira00,mariadenis
labels: "tipo: tarefa,er: declaracao,sprint: 1,moscow: must"
---
## Objetivo da Atividade
O **Scrum Master** (`viniciusvieira00`) e a **Product Owner** (`mariadenis`) são responsáveis por recolher, padronizar, revisar e **consolidar o catálogo global de Requisitos Não Funcionais (RNFs)** do projeto CyberSetor, garantindo a conformidade metodológica com os modelos **FURPS+** e **Sommerville**, e assegurando que 100% dos requisitos possuam **critérios verificáveis objetivos**.

---

## Insumos e Leituras Obrigatórias
1. **Referencial Metodológico da Disciplina:**
   - MARSICANO, G. *Requisitos de Software: Comunicação é tudo!* 2026. Capítulos sobre Requisitos Não Funcionais, FURPS+ e Taxonomia de Sommerville.
2. **`docs/visao/2-solucao-proposta.md`**:
   - Seção 2.4: Arquitetura e Stack Técnica (TypeScript, Next.js, NestJS, PostgreSQL, Prisma, Tailwind/shadcn, TanStack Query, Dexie/Workbox, Backblaze B2, Docker, Coolify, Vercel).
   - Seção 2.6: Viabilidade técnica, arranjo de custo zero na fase acadêmica e política de cópias de segurança (backup).
3. **Branch `integracao/u1-correcoes` — `docs/visao/3-intervencao-social.md`**:
   - Mitigações éticas e de segurança: expiração de sessão em celulares pessoais (*BYOD*), sincronização sem duplicidade, consentimento LGPD e confidencialidade de imagens.
4. **`docs/visao/4-estrategia-esw.md`**:
   - Práticas técnicas de qualidade (XP), pirâmide de testes (Jest, Supertest, Playwright) e integração contínua (GitHub Actions).

---

## Passo a Passo: O que a Dupla de Liderança Deve Fazer

### 1. Recolher e Consolidar os RNFs das Duplas de Trabalho
Integrar os requisitos não funcionais elicitados nas issues de trabalho das Duplas A, B e C, organizando-os em um catálogo unificado cobrindo:
- **Desempenho (Performance):** Tempo de resposta das requisições na API e tempo de carregamento da página pública de inscrição em redes móveis (3G/4G).
- **Confiabilidade (Reliability):** Tolerância a falhas na sincronização offline, idempotência de presenças, rotina de backup diário e recuperação de desastres (RPO e RTO).
- **Usabilidade (Usability):** Responsividade móvel (*Mobile-First* a partir de 360px) e acessibilidade cognitiva para facilitadores com baixa familiaridade digital (SUS score).
- **Segurança (Security):** Controle de acesso baseado em papéis (RBAC), revogação de tokens JWT em caso de extravio de aparelhos e trilha de auditoria imutável.
- **Suportabilidade (Supportability):** Portabilidade em contêineres Docker, cobertura mínima de testes automatizados e deploy contínuo.
- **Restrições Organizacionais e Externas:** Licenciamento em código aberto, custo zero para o Instituto na fase piloto, conformidade com a LGPD e o MROSC (Lei 13.019/2014).

### 2. Aplicar a Dupla Classificação Exigida pelo Docente
Para cada RNF consolidado, a dupla deve atribuir formalmente:
- **Classificação FURPS+:**
  - `F` (Funcionalidade / Segurança), `U` (Usabilidade), `R` (Confiabilidade), `P` (Desempenho), `S` (Suportabilidade) ou `+` (Restrições de Design, Implementação, Interface ou Físicas).
- **Classificação de Sommerville:**
  - `Requisito de Produto` (Usabilidade, Eficiência, Confiabilidade, Portabilidade, Segurança);
  - `Requisito Organizacional` (Entrega, Implementação, Padrões, Processos);
  - `Requisito Externo` (Interoperabilidade, Legislação, Éticos).

### 3. Eliminar Afirmações Vagas e Fixar Critérios Verificáveis
> **Regra de Ouro do Prof. Marsicano:** Requisito não funcional genérico como *"o sistema deve ser rápido"* ou *"a interface deve ser amigável"* será glosado. A dupla deve substituir adjetivos por **métricas quantitativas mensuráveis e testáveis**.
>
> **Exemplos de Metrificação:**
> - Em vez de *"deve ser rápido"*, usar: *"95% das requisições devem retornar em menos de 2,0 segundos sob tráfego de até 30 usuários simultâneos"*.
> - Em vez de *"deve ser seguro"*, usar: *"100% das rotas protegidas devem rejeitar acesso com HTTP 403 Forbidden para perfis não autorizados"*.
> - Em vez de *"backup diário"*, usar: *"Rotina automatizada de backup com RPO ≤ 24h e RTO ≤ 2h, comprovada por teste de restauração em banco descartável"*.

---

## Definição de Pronto (DoD)
- [ ] Catálogo com no mínimo 12 a 14 Requisitos Não Funcionais devidamente numerados (`RNF01`, `RNF02`...).
- [ ] 100% dos RNFs contendo: Código, Nome, Descrição da Propriedade/Restrição, Classificação FURPS+, Classificação Sommerville e Critério Verificável Objetivo.
- [ ] Rastreabilidade estabelecida com as decisões de arquitetura da Seção 2.4 e mitigações da Seção 3.3.
- [ ] Tabela consolidada entregue para inclusão na página `docs/requisitos/8-requisitos.md`.
