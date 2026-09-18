# 3. Intervenção social

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Redação das seções de impacto social para o site | Equipe CyberSetor |
| 17/09/2026 | 1.2 | Riscos éticos e operacionais aprofundados: dispositivos pessoais, uso de imagens, burocratização do cuidado, distorção de metas, governança de retificações e rastreabilidade | Rodrigo Henrique e Lucas Leal |
| 17/09/2026 | 1.3 | Impactos pretendidos restaurados como 3.1 e princípios da intervenção separados em 3.2; riscos reunidos em 3.3, com o da exclusão por familiaridade digital; rastreabilidade sem repetir a mitigação; governança de dados remetida à seção 2.6, ficando aqui a visibilidade por perfil; capacidades descritas em lugar de identificadores que a seção 8 declara; base legal e prazo de guarda alinhados à Lei 13.709/2018 e ao art. 68 da Lei 13.019/2014; mitigações declaradas como previstas | Equipe CyberSetor |

---

## 3.1 Impactos pretendidos

A solução tende a produzir uma intervenção social voltada à qualificação da capacidade de uma organização da sociedade civil de demonstrar o próprio trabalho, à redução do esforço burocrático que hoje recai sobre a equipe e à introdução de práticas digitais em uma organização de atuação predominantemente presencial. Entre os impactos pretendidos, destacam-se:

- liberar tempo da equipe, hoje consumido na consolidação manual de registros, para as atividades finalísticas junto às comunidades atendidas;
- fortalecer a capacidade do Instituto de comprovar resultados perante financiadores, condição para a manutenção e a ampliação dos recursos que sustentam suas ações;
- reduzir o risco de inconsistências em números que embasam prestações de contas públicas;
- tornar visível, ao longo da execução, o andamento das metas pactuadas, permitindo agir antes do encerramento dos prazos;
- preservar a memória institucional das ações realizadas, hoje dispersa entre planilhas, mensagens e arquivos pessoais;
- contribuir para a incorporação de práticas digitais de gestão em uma organização que opera essencialmente de forma presencial.

A intervenção não se limita, porém, a automatizar relatórios: ela altera a forma como o trabalho do Instituto é registrado, comprovado e narrado, e ao fazê-lo interfere na relação da organização com seus financiadores, com seus educadores e com as pessoas que atende. Reconhecer os efeitos não pretendidos faz parte da responsabilidade sobre os requisitos a construir, e é o que a seção 3.3 examina.

---

## 3.2 Princípios da intervenção sociotécnica

A introdução de uma plataforma de software num cenário de assistência social e ocupação democrática não é neutra: **a tecnologia serve como sustentação de direitos, e não como barreira de acesso, instrumento de vigilância ou fonte de constrangimento**. Daí três princípios que orientam as decisões de requisito:

1. **Primazia do cuidado sobre o registro.** O acolhimento, a alimentação, o banho e o suporte emergencial têm prioridade sobre qualquer rotina de cadastro.
2. **Não criminalização e não estigmatização.** O sistema não cataloga histórico penal, condição de dependência química nem dado sensível desnecessário à comprovação do plano de trabalho.
3. **Dignidade e autonomia.** Os participantes e seus responsáveis legais mantêm controle sobre suas informações, com direito ao consentimento, à retificação e à eliminação dos dados (art. 18 da Lei 13.709/2018).

---

## 3.3 Riscos e mitigações

A digitalização dos processos de prestação de contas traz tensões práticas que foram mapeadas e tratadas:

### 3.3.1 Dependência dos telefones pessoais dos educadores
* **Risco:** A equipe de campo e os oficineiros não dispõem de aparelhos celulares corporativos fornecidos pelo Instituto, utilizando seus próprios smartphones pessoais para acessar o sistema, consultar chamadas e carregar fotos. Essa dinâmica pode sobrecarregar planos de internet móvel particulares, consumir armazenamento pessoal e gerar desgaste das baterias durante oficinas abertas.
* **Mitigação:** A aplicação web é projetada para ser leve (*Mobile-First/PWA*), otimizada para consumir o mínimo de tráfego de dados e armazenar dados em cache local no navegador (*IndexedDB*). O educador pode operar a chamada totalmente desconectado e realizar a sincronização posterior em uma rede Wi-Fi (na sede do Instituto ou em casa), reduzindo a dependência de dados móveis particulares.

### 3.3.2 Perda, furto ou comprometimento do aparelho
* **Risco:** O SCS é uma região central de grande circulação urbana, onde furtos e perdas de celulares são riscos reais. Caso um aparelho de um educador seja subtraído com dados locais armazenados ou com a sessão da aplicação aberta, informações pessoais de participantes poderiam ser indevidamente expostas.
* **Mitigação:** O CyberSetor prevê expiração automática de sessão (*session timeout*), armazenamento local protegido e expurgo do cache de dados confidenciais do dispositivo móvel logo após a confirmação da sincronização com a API central. Nenhum banco de dados nominal completo de participantes fica persistido permanentemente no navegador do smartphone.

### 3.3.3 Conflitos na sincronização sem conexão
* **Risco:** Durante oficinas com múltiplos facilitadores ou em situações de intermitência de sinal no SCS, o mesmo registro de presença ou atividade pode ser lançado ou alterado simultaneamente por mais de uma pessoa em modo desconectado. Ao reconectar, a sincronização cega poderia sobrescrever marcações corretas ou gerar duplicidade de atendimentos.
* **Mitigação:** Identificadores imutáveis gerados no cliente e sincronização idempotente baseada no modelo *Append-Only* com registro do instante do evento (*timestamp* de captura vs. *timestamp* de envio). O servidor realiza conciliação sem duplicar presenças da mesma pessoa na mesma data/oficina, sinalizando visualmente ao usuário se a pendência foi transmitida com sucesso ou se necessita de conferência.

### 3.3.4 Fotografia como evidência e proteção da imagem
* **Risco:** Editais públicos exigem comprovação fotográfica da realização das ações. No entanto, fotografar pessoas em situação de rua, crianças e adolescentes em oficinas no espaço público pode gerar constrangimento, violação da imagem, exposição estigmatizante e infração ao Estatuto da Criança e do Adolescente (ECA) e à LGPD.
* **Mitigação:**
  1. *Diretriz Operacional de Enquadramento:* As orientações de campo recomendam registros fotográficos panorâmicos, de costas, em plano aberto ou focando na atividade/produção artística (painéis, instrumentos, trabalhos manuais), evitando retratos faciais em close-up de participantes vulneráveis.
  2. *Controle de Acesso Sistêmico:* O módulo de evidências restringirá a visualização das fotos aos perfis com competência sobre o projeto, e as fotos não são publicadas em galerias abertas na internet.
  3. *Termo de Uso de Imagem Vinculado:* O formulário de matrícula contém consentimento específico e voluntário para registro fotográfico institucional e para fins de prestação de contas governamental.

### 3.3.5 Reutilização do histórico de contatos
* **Risco:** A centralização de telefones e e-mails de participantes em uma base única facilita a comunicação do Instituto, mas pode descambar para o envio de mensagens indesejadas (*spam*), quebrando o princípio da finalidade (art. 6º da LGPD) e expondo contatos a usos não autorizados.
* **Mitigação:** Coleta de consentimento com mecanismo de *opt-in* voluntário na inscrição: o participante assinala expressamente se autoriza receber informes sobre futuras oficinas e editais de emprego/cultura. A interface prevê mecanismo de *opt-out* (descadastramento facilitado a qualquer tempo) e veda o compartilhamento da base cadastral com terceiros ou patrocinadores comerciais.

### 3.3.6 Pressão por metas e burocratização do acolhimento
* **Risco:** A necessidade contábil de justificar verbas públicas pode induzir facilitadores a exigir documentos (CPF, nome completo, comprovante de residência) antes de fornecer apoio social imediato (refeições, banho, acolhimento), afastando indivíduos que desconfiam de cadastros governamentais ou que não portam documentação civil.
* **Mitigação:** Segregação de modalidades de registro: para ações assistenciais e de acolhimento emergencial no território, está previsto o **registro quantitativo agregado anônimo** (ex.: "45 banhos realizados no turno matutino"), sem exigência de identificação nominal do beneficiário. A identificação nominal com CPF fica restrita às oficinas de formação contínua que emitem certificados formais e exigem prestação de contas nominal ao concedente.

### 3.3.7 A meta quantitativa como fim em si mesma
* **Risco:** Quando o cumprimento numérico de metas contratuais torna-se o único indicador monitorado pelo software, equipes de campo podem ser pressionadas a priorizar "quantidade de pessoas atendidas" em detrimento da profundidade do vínculo formativo, acolhendo mais pessoas superficialmente apenas para "fechar o gráfico".
* **Mitigação:** O CyberSetor prevê complementar a visualização quantitativa com campos estruturados para registros qualitativos (relatos de impacto comunitário, ocorrências de campo, evolução pedagógica e justificativas de contexto). A ferramenta posiciona a meta numérica como balizador legal para evitar glosas, mas provê subsídios textuais para que a coordenação defenda o valor substantivo da ação perante o órgão concedente.

### 3.3.8 Decisão administrativa sobre dado incompleto
* **Risco:** Se um educador não conseguir sincronizar suas presenças devido a falha técnica ou falta de conexão no dia, a diretoria pode interpretar a ausência de dados no painel como inexecução da atividade, tomando medidas disciplinares injustas ou cortando remunerações de oficineiros.
* **Mitigação:** Está prevista a distinção visual entre *atividade pendente de sincronização ou de fechamento* e *atividade não realizada*, com o **lançamento extemporâneo justificado** (registro retroativo até a data de fechamento do ciclo pedagógico), com campo obrigatório para justificativa operacional antes do congelamento do relatório do objeto.

### 3.3.9 Retificação e contestação de registros
* **Risco:** Erros de digitação em chamadas de campo, trocas de nomes de participantes homônimos ou perda de comprovantes podem distorcer os relatórios. Se os registros forem imutáveis sem controle, erros perpetuam-se; se forem livremente editáveis sem rastro, a auditoria é comprometida.
* **Mitigação:** Trilha de auditoria com retenção de autor, data, hora e justificativa formal de qualquer alteração de presença ou dado cadastral. O direito à retificação de dados pelo próprio titular (garantido pelo art. 18 da LGPD) é operacionalizado mediante fluxo de solicitação atendido pela Coordenação Pedagógica.

---

### 3.3.10 Exclusão de quem tem menor familiaridade com a tecnologia

* **Risco:** participantes e educadores com pouca familiaridade digital ficam de fora se a inscrição presencial e o registro assistido deixarem de existir como alternativa.
* **Mitigação:** o caminho não digital é preservado. A inscrição pode ser feita pela coordenação em nome do participante, e o registro de presença admite lançamento assistido por outro integrante da equipe.

---

## 3.4 Rastreabilidade das mitigações

Cada desafio tratado acima corresponde a uma capacidade do produto. Os identificadores definitivos de requisito funcional e não funcional são atribuídos na seção 8; as histórias já declaradas aparecem pelo identificador que possuem.

| Desafio ético ou operacional | Capacidade prevista no produto |
| :--- | :--- |
| **Uso de dispositivos pessoais (*BYOD*)** | Interface responsiva, priorizando o uso em telefone, e registro local no navegador para operação sem conexão. |
| **Furto, perda ou roubo de smartphones** | Expiração de sessão no aparelho, revogação de acesso em caso de perda e descarte do registro local após a confirmação do envio. |
| **Conflitos de sincronização *offline*** | **HU-03 e HU-04:** registro de presenças e anexação de evidências, com reenvio que não duplica lançamento e política declarada para registros simultâneos conflitantes. |
| **Exposição de fotos de pessoas vulneráveis** | **HU-04:** Vinculação de fotos a metas com controle de acesso por perfil.<br>**HU-06:** Termo digital de consentimento de uso de imagem. |
| **Reutilização indevida de dados para contato** | **HU-06:** Gestão da base única com flag explícita de autorização de contato e histórico de consentimento. |
| **Burocratização do acolhimento humano** | **HU-03:** Tipificação de objetos com modalidade de cômputo anônimo de atendimentos sem exigência de CPF. |
| **Distorção de metas (Lei de Goodhart)** | **HU-05:** Estruturação do Relatório do Objeto contendo justificativas contextuais e campos de avaliação qualitativa. |
| **Julgamentos injustos por dados incompletos** | **HU-01 / HU-03:** Regra de negócio de lançamento retroativo com justificativa prévia antes do fechamento do ciclo. |
| **Erros de lançamento e direitos do titular** | **HU-06:** Retificação cadastral auditável e histórico de alterações com responsável e justificativa. |

---

## 3.5 Visibilidade por perfil

Os compromissos gerais de tratamento de dados pessoais, com base legal, finalidade e prazo de retenção, estão na seção 2.6. O que a intervenção social acrescenta é a separação de quem enxerga o quê, que é a condição para que o registro não se torne exposição.

A matriz de acesso definitiva é decidida com as áreas competentes do Instituto. A diretriz prevista é esta:

* *Núcleo pedagógico e assistentes:* acesso às fichas de participantes para mediação das oficinas e cuidados específicos.
* *Administrativo-financeiro:* acesso aos números consolidados de frequência e metas alcançadas, bloqueando visualização de nomes, telefones ou fotos de alunos.
* *Órgãos concedentes e auditoria:* acesso aos relatórios e às evidências que a prestação de contas exige, pelo tempo da análise, sem acesso à base cadastral completa.

O prazo de guarda e a base legal de cada finalidade seguem o que a seção 2.6 estabelece.
