# 10. Backlog de Produto e Priorização

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :---: | :---: | :--- | :--- |
| 28/09/2026 | 1.0 | Estruturação inicial da seção e registro da avaliação de esforço técnico dos requisitos de CP2, CP4 e CP7 (Atividade 4) | Caio Martins e Lucas Leal |

---

## 10.1 Metodologia de Priorização e Esforço Técnico

A priorização de requisitos do projeto CyberSetor orienta-se pela metodologia de matriz bidimensional de valor versus esforço, conforme as diretrizes da Engenharia de Requisitos e o plano de ensino da disciplina. O processo articula dois eixos fundamentais:

- **Eixo Vertical — Valor de Negócio (1 a 4):** Atribuído diretamente pelo cliente (Instituto No Setor) em sessão de validação orientada pelas histórias de usuário, ponderando criticidade para o problema central, abrangência de atendimento, urgência e obrigações legais/institucionais.
- **Eixo Horizontal — Esforço Técnico (1 a 4):** Avaliado pela equipe técnica a partir da consolidação de três dimensões complementares:
  1. **Esforço estimado em horas:** $1$ (até 2h), $2$ (2 a 6h), $3$ (6 a 12h) e $4$ (mais de 12h).
  2. **Complexidade algorítmica e de regras de negócio:** $1$ (baixa / solução padrão), $2$ (média / múltiplas regras), $3$ (alta / incerteza de regras) e $4$ (muito alta / risco arquitetural).
  3. **Lacuna de capacidade da equipe:** $1$ (tecnologia e stack dominadas), $2$ (conhecimento básico nivelado), $3$ (requer pesquisa/estudo adicional) e $4$ (tecnologia não dominada).

O **Esforço Técnico Final** de cada requisito funcional é obtido pela média aritmética das três dimensões, arredondada para o inteiro mais próximo (frações $\ge 0{,}5$ arredondam para cima):

$$\text{Esforço Técnico} = \text{round}\left(\frac{\text{Esforço (Horas)} + \text{Complexidade} + \text{Lacuna de capacidade}}{3}\right)$$

A fundamentação da lacuna de capacidade baseia-se na **Matriz de Competências e Stack** do projeto, considerando os dojos de nivelamento técnico (Prisma ORM, NestJS e componentes visuais) realizados pela equipe.

---

## 10.2 Avaliação de Esforço Técnico dos Requisitos (CP2, CP4 e CP7)

A tabela a seguir consolida a apuração das notas técnicas para os requisitos funcionais das Características de Produto sob responsabilidade dos épicos de *Atividade*, *Presença em Campo* e *Evidência*:

| Código | Requisito Funcional | Esforço (Horas) | Complexidade | Lacuna de Capacidade | Média | Esforço Técnico Final | Fundamentação Técnica (Pós-Dojos) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **RF07** | Cadastrar atividade por modalidade de objeto | 1 | 1 | 2 | 1,33 | **1** | Formulário administrativo padrão com vínculo relacional 1:N com projetos e N:N com metas contratuais no Prisma. |
| **RF08** | Parametrizar exigência de comprovação de presença | 2 | 3 | 3 | 2,67 | **3** | Estrutura de versionamento de configurações de comprovação por instrumento e modalidade (RN-04); requer modelagem de snapshots no Prisma. |
| **RF14** | Registrar frequência em dispositivo móvel | 3 | 2 | 3 | 2,67 | **3** | Interface mobile-first com gerenciamento de estado da chamada, marcação em lote e modal de inclusão avulsa de participantes; exige atenção à usabilidade em telas pequenas (RNF15). |
| **RF15** | Operar registro de presença em modo offline | 3 | 4 | 3 | 3,33 | **3** | Configuração de PWA com Service Workers e persistência determinística em IndexedDB; maior complexidade técnica da frente — exige pesquisa e estudo prévio de bibliotecas como Workbox/Dexie.js. |
| **RF16** | Sincronizar presenças com reconciliação idempotente | 2 | 3 | 3 | 2,67 | **3** | Fila assíncrona de envio no frontend com endpoints idempotentes no NestJS; requer transações de banco e tratamento de divergências de concorrência no PostgreSQL. |
| **RF17** | Registrar lançamento extemporâneo com justificativa | 1 | 1 | 2 | 1,33 | **1** | Validação de regra temporal no backend com preenchimento obrigatório de justificativa e gravação de evento na trilha de auditoria (RNF02). |
| **RF30** | Anexar evidências documentais e fotográficas | 2 | 3 | 3 | 2,67 | **3** | Pipeline de upload multipart com validação de formato e tamanho no NestJS; integração com a Geolocation API do navegador condicionada à permissão do usuário. |
| **RF31** | Vincular evidência a meta contratual | 2 | 2 | 2 | 2,00 | **2** | Vínculo relacional N:N no Prisma entre evidência, atividade e metas; controle de ciclo de vida de rascunhos e verificação de bloqueio de encerramento (RN-11). |
| **RF32** | Segregar acesso a fotos de beneficiários vulneráveis | 3 | 3 | 2 | 2,67 | **3** | Controle de acesso granular via Guards no NestJS com restrição de escopo de visualização por perfil (RN-12) e exibição de diretrizes de enquadramento na interface de captura. |

---

!!! note "Próximas Etapas da Priorização e MVP"
    As notas de **Valor de Negócio (1 a 4)** serão colhidas junto ao Instituto No Setor na sessão de validação de 28/09/2026. A partir do cruzamento entre Valor de Negócio e o Esforço Técnico consolidado nesta seção, será construída a **Matriz 4 × 4** definitiva e a delimitação do **MVP** (Mínimo Produto Viável) do sistema CyberSetor.
