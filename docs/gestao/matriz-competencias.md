# Matriz de competências e stack

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 03/09/2026 | 1.0 | Registro inicial das decisões técnicas e método da matriz de competências | Equipe CyberSetor |
| 28/09/2026 | 1.1 | Explicitação do histórico de consolidação (pendência da Sprint 0 sanada no início da Sprint 1) | Daniel Batista |
| 06/10/2026 | 1.2 | Dojos de nivelamento registrados como realizados, com o conteúdo de cada um | Vinicius Vieira |

A pilha tecnológica citada na seção 2.4 do Documento de Visão não foi escolhida por preferência. Foi decidida a partir de uma matriz de competências preenchida pela equipe entre 02/09 e 03/09/2026 e consolidada integralmente no início da Sprint 1.

## Como a matriz funciona

Cada integrante declarou, para cada tecnologia candidata, o próprio nível de familiaridade em uma escala de 0 a 3: 0 para nunca usou, 1 para já viu ou estudou, 2 para já usou em projeto, 3 para domina e pode ensinar. Marcar 0 é informação, não demérito. A planilha consolida, por tecnologia, quantas pessoas estão no nível 2 ou acima e quem está no nível 3 e pode atuar como mentor.

Com isso, cada decisão de camada seguiu uma de duas regras. Onde havia domínio, a escolha seguiu a experiência acumulada. Onde não havia, prevaleceu o critério de menor custo de aprendizado, com um dojo agendado antes do início do desenvolvimento.

## Decisões por camada

| Camada | Decisão | Situação na equipe | Motivo |
|---|---|---|---|
| Linguagem | TypeScript | Adotar | Linguagem única no cliente e no servidor |
| Back-end | NestJS | Adotar, com dojo | Núcleo do back-end; poucas pessoas com experiência prévia |
| Banco de dados | PostgreSQL | Adotar | Domínio consolidado na equipe |
| Mapeamento objeto-relacional | Prisma | Experimentar, com dojo | Todas as opções partiam de zero; o esquema único e o cliente tipado expõem menos superfície a aprender |
| Front-end | Next.js com React | Adotar | Mais pessoas com experiência do que na alternativa (Vite); ambiente nativo da plataforma de publicação; renderização no servidor beneficia a página pública de inscrição |
| Estilização e componentes | Tailwind CSS com shadcn/ui | Experimentar, com dojo | Tailwind já dominado; a alternativa (Material UI) traria um segundo sistema de estilos |
| Sincronização no cliente | TanStack Query | Experimentar, com dojo | Empate na matriz; desempate técnico pelo suporte a sincronização em conectividade instável |
| Operação sem conexão | Service Worker com Workbox e Dexie | Experimentar, com dojo | Dois mentores em Service Worker na equipe |
| Geração de PDF | Puppeteer, no servidor | Adotar | Mais experiência do que em pdfmake; modelo em HTML editável por qualquer pessoa |
| Testes | Jest e Supertest na API; Playwright na aceitação | Adotar | Mais experiência do que em Vitest e Cypress |
| Diagramas | Figma | Adotar | Domínio na equipe, com mentor |

## O que a matriz revelou

O levantamento mostrou domínio consolidado nas camadas fundamentais, como TypeScript, React, PostgreSQL, controle de versão, contêineres e integração contínua, e apontou lacunas em ferramentas específicas, entre elas o mapeamento objeto-relacional e o armazenamento local para funcionamento sem conexão. Também mostrou que o conhecimento está concentrado em poucas pessoas, o que orienta a programação em pares desde a Sprint 1 e a distribuição de frentes por afinidade técnica.

## Dojos de nivelamento

Dois dojos, gravados no Google Meet, em 10/09/2026, no início da Sprint 1: um de processo, com os critérios INVEST, o formato das histórias de usuário e os critérios de aceitação, aplicado ao refinamento das histórias reais do backlog; e um técnico, com uma fatia vertical completa em NestJS e Prisma e demonstrações de Next.js, Dexie, TanStack Query e shadcn/ui. O aprofundamento das ferramentas com lacuna continua em programação em par durante a construção.

Esta página resume o método e as decisões, sem os níveis individuais de cada integrante.
