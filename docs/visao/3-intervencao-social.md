# 3. Intervenção social

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Redação das seções de impacto social para o site | Equipe CyberSetor |
| 17/09/2026 | 1.2 | Aprofundamento dos riscos éticos e operacionais: dependência de celulares pessoais, segurança contra furto/perda, conflitos offline, uso de imagens sensíveis, prevenção à burocratização do cuidado, distorção de metas (Lei de Goodhart), governança de retificações e matriz de rastreabilidade a requisitos (Issue #21) | Rodrigo Henrique e Lucas Leal |

---

## 3.1 Contexto e Princípios da Intervenção Social no Território

A atuação do **Instituto Cultural e Social No Setor** está fincada no Setor Comercial Sul (SCS) de Brasília, um território complexo marcado pela coexistência entre dinamismo econômico, ocupação cultural e extremas vulnerabilidades sociais (população em situação de rua, trabalhadores precarizados, catadores de recicláveis e jovens da periferia).

A introdução de uma plataforma de software (CyberSetor) em um cenário de assistência social e ocupação democrática não pode ser neutra: **a tecnologia deve servir como ferramenta de sustentação e garantia de direitos, e nunca como barreira de acesso, instrumento de vigilância ou geradora de constrangimento**.

Para assegurar essa diretriz, a intervenção sociotécnica do CyberSetor subordina-se a três princípios fundamentais:
1. **Primazia do Cuidado sobre o Registro:** O acolhimento humano, o fornecimento de alimentação, o banho e o suporte emergencial têm prioridade absoluta sobre qualquer rotina de cadastro.
2. **Não Criminalização e Não Estigmatização:** O sistema não cataloga histórico penal, condição de dependência química ou dados sensíveis desnecessários à comprovação do plano de trabalho dos projetos.
3. **Respeito à Dignidade e Autonomia (LGPD):** Os participantes e seus responsáveis legais detêm controle sobre suas informações, tendo resguardado o direito ao consentimento, à retificação e ao esquecimento.

---

## 3.2 Análise de Riscos Éticos, Sociais e Operacionais de Campo

A digitalização dos processos de prestação de contas traz tensões práticas que foram mapeadas e tratadas:

### 3.2.1 Dependência de Dispositivos Pessoais dos Educadores (*BYOD*)
* **Risco Identificado:** A equipe de campo e os oficineiros não dispõem de aparelhos celulares corporativos fornecidos pelo Instituto, utilizando seus próprios smartphones pessoais para acessar o sistema, consultar chamadas e carregar fotos. Essa dinâmica pode sobrecarregar planos de internet móvel particulares, consumir armazenamento pessoal e gerar desgaste das baterias durante oficinas abertas.
* **Mitigação Sociotécnica:** A aplicação web é projetada com arquitetura ultraleve (*Mobile-First/PWA*), otimizada para consumir o mínimo de tráfego de dados e armazenar dados em cache local no navegador (*IndexedDB*). O educador pode operar a chamada totalmente desconectado e realizar a sincronização posterior em uma rede Wi-Fi (na sede do Instituto ou em casa), eliminando a obrigatoriedade do uso de dados móveis particulares.

### 3.2.2 Perda, Furto, Roubo ou Comprometimento Físico do Dispositivo
* **Risco Identificado:** O SCS é uma região central de grande circulação urbana, onde furtos e perdas de celulares são riscos reais. Caso um aparelho de um educador seja subtraído com dados locais armazenados ou com a sessão da aplicação aberta, informações pessoais de participantes poderiam ser indevidamente expostas.
* **Mitigação Sociotécnica:** O CyberSetor adota expiração automática de sessão (*session timeout*), armazenamento local protegido e expurgo imediato do cache de dados confidenciais do dispositivo móvel logo após a confirmação da sincronização com a API central. Nenhum banco de dados nominal completo de participantes fica persistido permanentemente no navegador do smartphone.

### 3.2.3 Resolução de Conflitos na Sincronização *Offline*
* **Risco Identificado:** Durante oficinas com múltiplos facilitadores ou em situações de intermitência de sinal no SCS, o mesmo registro de presença ou atividade pode ser lançado ou alterado simultaneamente por mais de uma pessoa em modo desconectado. Ao reconectar, a sincronização cega poderia sobrescrever marcações corretas ou gerar duplicidade de atendimentos.
* **Mitigação Sociotécnica:** Implementação de identificadores imutáveis gerados no cliente (*UUIDv4*) e lógica de sincronização idempotente baseada no modelo *Append-Only* com registro do instante do evento (*timestamp* de captura vs. *timestamp* de envio). O servidor realiza conciliação sem duplicar presenças da mesma pessoa na mesma data/oficina, sinalizando visualmente ao usuário se a pendência foi transmitida com sucesso ou se necessita de conferência.

### 3.2.4 Uso de Fotografias como Evidência de Metas vs. Violação de Privacidade
* **Risco Identificado:** Editais públicos exigem comprovação fotográfica da realização das ações. No entanto, fotografar pessoas em situação de rua, crianças e adolescentes em oficinas no espaço público pode gerar constrangimento, violação da imagem, exposição estigmatizante e infração ao Estatuto da Criança e do Adolescente (ECA) e à LGPD.
* **Mitigação Sociotécnica:** 
  1. *Diretriz Operacional de Enquadramento:* As orientações de campo recomendam registros fotográficos panorâmicos, de costas, em plano aberto ou focando na atividade/produção artística (painéis, instrumentos, trabalhos manuais), evitando retratos faciais em close-up de participantes vulneráveis.
  2. *Controle de Acesso Sistêmico:* O módulo de evidências restringe a visualização das fotos aos gestores do projeto e auditores do concedente. As fotos não são publicadas em galerias abertas na internet.
  3. *Termo de Uso de Imagem Vinculado:* O formulário de matrícula contém consentimento específico e voluntário para registro fotográfico institucional e para fins de prestação de contas governamental.

### 3.2.5 Reutilização do Histórico de Contatos para Comunicação e Convites
* **Risco Identificado:** A centralização de telefones e e-mails de participantes em uma base única facilita a comunicação do Instituto, mas pode descambar para o envio de mensagens indesejadas (*spam*), quebrando o princípio da finalidade (art. 6º da LGPD) e expondo contatos a usos não autorizados.
* **Mitigação Sociotécnica:** Coleta de consentimento com mecanismo de *opt-in* voluntário na inscrição: o participante assinala expressamente se autoriza receber informes sobre futuras oficinas e editais de emprego/cultura. A interface prevê mecanismo de *opt-out* (descadastramento facilitado a qualquer tempo) e veda o compartilhamento da base cadastral com terceiros ou patrocinadores comerciais.

### 3.2.6 Pressão por Metas vs. Burocratização do Acolhimento
* **Risco Identificado:** A necessidade contábil de justificar verbas públicas pode induzir facilitadores a exigir documentos (CPF, nome completo, comprovante de residência) antes de fornecer apoio social imediato (refeições, banho, acolhimento), afastando indivíduos que desconfiam de cadastros governamentais ou que não portam documentação civil.
* **Mitigação Sociotécnica:** Segregação de modalidades de registro: para ações assistenciais e de acolhimento emergencial no território, o sistema suporta **registro quantitativo agregado anônimo** (ex.: "45 banhos realizados no turno matutino"), sem exigência de identificação nominal do beneficiário. A identificação nominal com CPF fica restrita às oficinas de formação contínua que emitem certificados formais e exigem prestação de contas nominal ao concedente.

### 3.2.7 A Lei de Goodhart: Riscos de Metas Quantitativas como Fim em Si Mesmas
* **Risco Identificado:** Quando o cumprimento numérico de metas contratuais torna-se o único indicador monitorado pelo software, equipes de campo podem ser pressionadas a priorizar "quantidade de pessoas atendidas" em detrimento da profundidade do vínculo formativo, acolhendo mais pessoas superficialmente apenas para "fechar o gráfico".
* **Mitigação Sociotécnica:** O CyberSetor complementa a visualização quantitativa com campos estruturados para registros qualitativos (relatos de impacto comunitário, ocorrências de campo, evolução pedagógica e justificativas de contexto). A ferramenta posiciona a meta numérica como balizador legal para evitar glosas, mas provê subsídios textuais para que a coordenação defenda o valor substantivo da ação perante o órgão concedente.

### 3.2.8 Decisões Administrativas Precipitadas Baseadas em Dados Incompletos
* **Risco Identificado:** Se um educador não conseguir sincronizar suas presenças devido a falha técnica ou falta de conexão no dia, a diretoria pode interpretar a ausência de dados no painel como inexecução da atividade, tomando medidas disciplinares injustas ou cortando remunerações de oficineiros.
* **Mitigação Sociotécnica:** O sistema diferencia visualmente *atividade pendente de sincronização/fechamento* de *atividade não realizada*. Permite-se o **lançamento extemporâneo justificado** (registro retroativo até a data de fechamento do ciclo pedagógico), com campo obrigatório para justificativa operacional antes do congelamento do relatório do objeto.

### 3.2.9 Governança, Retificação e Contestação de Registros
* **Risco Identificado:** Erros de digitação em chamadas de campo, trocas de nomes de participantes homônimos ou perda de comprovantes podem distorcer os relatórios. Se os registros forem imutáveis sem controle, erros perpetuam-se; se forem livremente editáveis sem rastro, a auditoria é comprometida.
* **Mitigação Sociotécnica:** Implementação de trilha de auditoria completa (*audit log*) com retenção de autor, data, hora e justificativa formal de qualquer alteração de presença ou dado cadastral. O direito à retificação de dados pelo próprio titular (garantido pelo art. 18 da LGPD) é operacionalizado mediante fluxo de solicitação atendido pela Coordenação Pedagógica.

---

## 3.3 Matriz de Mitigação de Riscos e Rastreabilidade a Requisitos

A tabela a seguir estabelece o vínculo formal entre cada desafio de intervenção social, a estratégia adotada e o requisito de software correspondente no CyberSetor:

| Desafio Ético / Operacional | Estratégia de Mitigação | Requisitos de Software Associados |
| :--- | :--- | :--- |
| **Uso de dispositivos pessoais (*BYOD*)** | Aplicação web leve, consumo mínimo de dados móveis e operação desacoplada de rede (*cache first*). | **RNF-01:** Compatibilidade responsiva mobile-first.<br>**RNF-02:** Armazenamento local no navegador (*IndexedDB*). |
| **Furto, perda ou roubo de smartphones** | Expiração automática de sessão inativa e expurgo de dados sensíveis locais após sincronização com o servidor. | **RNF-03:** Segurança de sessão e encerramento automático.<br>**RF-SEG-01:** Limpeza de cache local após handshake de envio. |
| **Conflitos de sincronização *offline*** | Geração de UUID no cliente, tratamento idempotente no backend e conciliação determinística de presenças sem duplicação. | **HU-03 / HU-04:** Registro de presenças e anexação de evidências com conciliação offline.<br>**RNF-04:** Integridade de dados e idempotência. |
| **Exposição de fotos de pessoas vulneráveis** | Enquadramento panorâmico, restrição de visualização aos gestores e termo de consentimento específico. | **HU-04:** Vinculação de fotos a metas com controle de acesso por perfil.<br>**HU-06:** Termo digital de consentimento de uso de imagem. |
| **Reutilização indevida de dados para contato** | Mecanismo de *opt-in* granular para informes futuros e canal facilitado de revogação/descadastramento. | **HU-06:** Gestão da base única com flag explícita de autorização de contato e histórico de consentimento. |
| **Burocratização do acolhimento humano** | Suporte a registros quantitativos agregados sem identificação nominal para ações emergenciais e de cuidado no SCS. | **HU-03:** Tipificação de objetos com modalidade de cômputo anônimo de atendimentos sem exigência de CPF. |
| **Distorção de metas (Lei de Goodhart)** | Inclusão de campos qualitativos e relatórios narrativos de impacto para além do painel de contagem numérica. | **HU-05:** Estruturação do Relatório do Objeto contendo justificativas contextuais e campos de avaliação qualitativa. |
| **Julgamentos injustos por dados incompletos** | Suporte a lançamentos extemporâneos justificados e distinção clara entre falta de envio técnico e inexecução. | **HU-01 / HU-03:** Regra de negócio de lançamento retroativo com justificativa prévia antes do fechamento do ciclo. |
| **Erros de lançamento e direitos do titular** | Trilha de auditoria em alterações cadastrais e fluxo de retificação de dados sob demanda do titular (LGPD). | **HU-06:** Retificação cadastral auditável e histórico de alterações com responsável e justificativa. |

---

## 3.4 Governança de Dados Pessoais (LGPD)

O tratamento de dados pessoais no CyberSetor estrutura-se nas bases legais do **consentimento formal** (art. 7º, I) e da **execução de contrato/parceria com a administração pública** (art. 7º, V da Lei 13.709/2018):

* **Segregação de Visibilidade por Perfil:**
  * *Núcleo Pedagógico e Assistentes:* Acesso pleno às fichas de participantes para mediação das oficinas e cuidados específicos.
  * *Administrativo-Financeiro:* Acesso estritamente aos números consolidados de frequência e metas alcançadas, bloqueando visualização de nomes, telefones ou fotos de alunos.
  * *Órgãos Concedentes e Auditoria:* Acesso a relatórios agregados e amostragens devidamente anonimizadas, salvaguardando a identidade dos beneficiários atendidos.
* **Ciclo de Vida do Dado:** Os dados nominais permanecem ativos pelo prazo legal estipulado para a prestação de contas do convênio (normalmente 5 anos após a homologação final). Após esse período, os dados pessoais são anonimizados para fins exclusivamente estatísticos e de memória histórica do Instituto.