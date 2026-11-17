# 3. Intervenção social

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 01/09/2026 | 1.0 | Versão inicial | Equipe CyberSetor |
| 06/09/2026 | 1.1 | Redação das seções de impacto social para o site | Equipe CyberSetor |
| 17/09/2026 | 1.2 | Riscos éticos e operacionais aprofundados: dispositivos pessoais, uso de imagens, burocratização do cuidado, distorção de metas, governança de retificações e rastreabilidade | Rodrigo Henrique e Lucas Leal |
| 17/09/2026 | 1.3 | Impactos pretendidos restaurados como 3.1 e princípios da intervenção separados em 3.2; riscos reunidos em 3.3, com o da exclusão por familiaridade digital; rastreabilidade sem repetir a mitigação; governança de dados remetida à seção 2.6, ficando aqui a visibilidade por perfil; capacidades descritas em lugar de identificadores que a seção 8 declara; base legal e prazo de guarda alinhados à Lei 13.709/2018 e ao art. 68 da Lei 13.019/2014; mitigações declaradas como previstas | Equipe CyberSetor |
| 05/10/2026 | 1.4 | Revisão editorial: padronização da formatação e espaçamentos, preservando integralmente o conteúdo e a densidade analítica original | Rodrigo Henrique |
| 26/10/2026 | 1.5 | Conectividade no campo com quedas pontuais e lançamento posterior com justificativa até a operação sem conexão (3.3.1 a 3.3.3); rastreabilidade das mitigações com as histórias da seção 10.1; riscos 3.3.1 a 3.3.3 em termos do uso, com o conflito de sincronização descrito pelo resultado; identificação nominal ligada à prestação de contas nominal ao concedente; mitigações dos riscos 3.3.1 a 3.3.4 e visibilidade por perfil (3.5) com remissão às políticas da seção 2.6 e aos requisitos; autorização de uso de imagem separada da prova de execução (3.3.4) | Vinicius Vieira |
| 11/11/2026 | 1.6 | Resumo no início da 3.3; mitigações 3.3.1 a 3.3.3 e 3.3.8 remetidas à política de operação sem conexão da seção 2.6, sem repeti-la; registros qualitativos (3.3.7) marcados como capacidade candidata; histórias da 3.4 marcadas por incremento; matriz por perfil remetida à seção 8.5.1 (3.5) | Maria Eduarda Marques |
| 16/11/2026 | 1.7 | Seção enxugada: princípios em cartões, riscos em blocos curtos e rastreabilidade das mitigações em lista por risco, sem tabela | Vinicius Vieira |

## 3.1 Impactos pretendidos

A solução tende a produzir uma intervenção que ajuda o Instituto a demonstrar o próprio trabalho, reduz a burocracia e introduz práticas digitais numa organização presencial:

- liberar o tempo hoje gasto na consolidação manual para as atividades com as comunidades;
- fortalecer a comprovação de resultados perante financiadores, condição para manter e ampliar os recursos;
- reduzir inconsistências nos números das prestações de contas públicas;
- tornar visível, durante a execução, o andamento das metas, para agir antes do fim dos prazos;
- preservar a memória institucional, hoje dispersa em planilhas, mensagens e arquivos pessoais.

Ao mudar como o trabalho é registrado e comprovado, o sistema muda a relação com financiadores, educadores e pessoas atendidas; os efeitos não pretendidos estão na seção 3.3.

## 3.2 Princípios da intervenção sociotécnica

A tecnologia **sustenta direitos; não é barreira de acesso, vigilância nem constrangimento**. Três princípios orientam os requisitos:

<div class="grid cards f3-compacto" markdown>

- **1. Cuidado antes do registro**

    Acolhimento, alimentação, banho e suporte emergencial vêm antes de qualquer cadastro.

- **2. Não criminalizar nem estigmatizar**

    Sem histórico penal, dependência química ou dado sensível desnecessário à comprovação do plano de trabalho.

- **3. Dignidade e autonomia**

    Participantes e responsáveis controlam suas informações: consentimento, retificação e eliminação (art. 18 da Lei 13.709/2018).

</div>

## 3.3 Riscos e mitigações

**Em resumo.** Dez riscos: aparelhos pessoais, perda ou furto, conflito de sincronização, imagem, contatos, burocratização, meta como fim, dado incompleto, retificação e exclusão digital. As mitigações de conexão e de dados pessoais seguem as políticas da [seção 2.6](2-solucao-proposta.md#26-viabilidade-da-proposta), e a [seção 3.4](#34-rastreabilidade-das-mitigacoes) liga cada uma às histórias.

### 3.3.1 Dependência dos telefones pessoais dos educadores

- **Risco:** sem celular corporativo, educadores usam o próprio aparelho, com gasto de dados, armazenamento e bateria durante as oficinas.
- **Mitigação:** aplicação web pensada para o celular, instalável pelo navegador, sem loja, com pouco tráfego. Com a operação sem conexão, a chamada é feita desconectada e enviada depois por Wi-Fi (sede ou casa). Até lá, e quando a conexão falha, vale a [política sem conexão](2-solucao-proposta.md#politica-sem-conexao).

### 3.3.2 Perda, furto ou comprometimento do aparelho

- **Risco:** no SCS, de grande circulação, um aparelho furtado com dados locais ou sessão aberta expõe dados de participantes.
- **Mitigação:** o CyberSetor prevê o encerramento automático da sessão após um período sem uso; nenhuma base nominal completa fica no navegador. O que fica no aparelho, e quando sai, segue a [política sem conexão](2-solucao-proposta.md#politica-sem-conexao).

### 3.3.3 Conflitos na sincronização sem conexão

- **Risco:** com vários facilitadores ou nas quedas de sinal, a mesma presença é lançada ou alterada por mais de uma pessoa desconectada; ao reconectar, uma sincronização cega sobrescreve ou duplica.
- **Mitigação:** o reenvio não duplica nem perde presenças, e o conflito fica visível ao coordenador ([RF18](../requisitos/8-requisitos.md#rf18), [RNF09](../requisitos/8-requisitos.md#rnf09), [HU-12](../requisitos/10-backlog.md#hu-12)); o resto segue a [política sem conexão](2-solucao-proposta.md#politica-sem-conexao).

### 3.3.4 Fotografia como evidência e proteção da imagem

- **Risco:** editais exigem foto, mas fotografar pessoas em situação de rua, crianças e adolescentes no espaço público pode constranger, estigmatizar e violar o ECA e a LGPD.
- **Mitigação:**
    1. *Enquadramento:* fotos panorâmicas, de costas, em plano aberto ou da produção (painéis, instrumentos, trabalhos manuais), sem close no rosto de pessoas vulneráveis.
    2. *Acesso:* o módulo de evidências restringirá a visualização das fotos aos perfis com competência sobre o projeto; nada vai para galeria aberta.
    3. *Uso de imagem:* foto de prova e foto de divulgação são registros distintos; a divulgação depende de autorização própria, colhida na inscrição, e a recusa não afeta a participação ([RN-12](../requisitos/8-requisitos.md#rn-12); [política de dados pessoais](2-solucao-proposta.md#politica-dados-pessoais)).

### 3.3.5 Reutilização do histórico de contatos

- **Risco:** a base única de telefones e e-mails pode virar envio de mensagens indesejadas, contra o princípio da finalidade (art. 6º da LGPD).
- **Mitigação:** *opt-in* voluntário na inscrição para informes de oficinas e editais, *opt-out* a qualquer tempo e proibição de compartilhar a base com terceiros ou patrocinadores.

### 3.3.6 Pressão por metas e burocratização do acolhimento

- **Risco:** para justificar verba, facilitadores podem exigir documentos (CPF, nome completo, comprovante de residência) antes do apoio imediato, afastando quem desconfia de cadastros ou não tem documentos.
- **Mitigação:** nas ações assistenciais e de acolhimento emergencial, está previsto o **registro quantitativo agregado e anônimo** (por exemplo, "45 banhos realizados no turno matutino"). A identificação nominal com CPF fica nas oficinas de formação contínua que exigem prestação de contas nominal ao concedente.

### 3.3.7 A meta quantitativa como fim em si mesma

- **Risco:** se só o número da meta é acompanhado, o campo pode trocar a profundidade do vínculo formativo por quantidade de atendimentos.
- **Mitigação:** registros qualitativos ao lado dos números (relatos de impacto, ocorrências, evolução pedagógica, justificativas de contexto), como capacidade candidata, sem requisito funcional nesta versão. A meta segue como balizador legal; os relatos defendem o valor da ação perante o concedente.

### 3.3.8 Decisão administrativa sobre dado incompleto

- **Risco:** presença não sincronizada por falha ou falta de conexão pode ser lida como inexecução, com medidas disciplinares injustas ou corte de remuneração.
- **Mitigação:** está prevista a distinção visual entre *atividade pendente de sincronização ou de fechamento* e *atividade não realizada*. O **lançamento extemporâneo justificado** segue a [política sem conexão](2-solucao-proposta.md#politica-sem-conexao); o prazo é próprio deste risco: até o fechamento do ciclo pedagógico, com justificativa antes do congelamento do relatório do objeto.

### 3.3.9 Retificação e contestação de registros

- **Risco:** erros de digitação, homônimos trocados ou comprovantes perdidos distorcem relatórios; registro imutável perpetua o erro, e registro editável sem rastro compromete a auditoria.
- **Mitigação:** trilha de auditoria com autor, data, hora e justificativa de toda alteração de presença ou cadastro. A retificação pelo titular (art. 18 da LGPD) é atendida por solicitação à Coordenação Pedagógica.

### 3.3.10 Exclusão de quem tem menor familiaridade com a tecnologia

- **Risco:** quem tem pouca familiaridade digital fica de fora se a inscrição presencial e o registro assistido deixarem de existir.
- **Mitigação:** o caminho não digital é preservado: a coordenação pode inscrever em nome do participante, e a presença admite lançamento assistido por outro integrante da equipe.

## 3.4 Rastreabilidade das mitigações

Capacidade e histórias de cada risco, com o incremento; os requisitos estão na seção 8.

- **3.3.1 Aparelhos pessoais:** interface para o telefone e registro local para operação sem conexão (posterior).
- **3.3.2 Perda ou furto:** expiração de sessão, revogação do acesso em caso de perda e descarte do registro local após a confirmação do envio (posterior).
- **3.3.3 Sincronização:** HU-09a (incremento 3), HU-09b e HU-12 (posterior), com reenvio sem duplicar e regra declarada para registros simultâneos; HU-04a (incremento 2), com o mesmo tratamento de reenvio para evidências.
- **3.3.4 Fotos de pessoas vulneráveis:** HU-04a e HU-04b (incremento 2), fotos ligadas a atividades e metas, acesso por perfil e orientação de enquadramento; HU-07a, autorização de uso de imagem separada da participação.
- **3.3.5 Contatos:** HU-07a, autorização de contato opcional, com revogação datada.
- **3.3.6 Acolhimento:** HU-03a e HU-03b, modalidades criadas pelo Instituto e comprovações por modalidade, com cômputo anônimo sem CPF.
- **3.3.7 Distorção de metas (Lei de Goodhart):** HU-05a, relatório do objeto com justificativas de contexto e avaliação qualitativa.
- **3.3.8 Dado incompleto:** HU-10, lançamento ou correção fora do prazo com justificativa obrigatória.
- **3.3.9 Erros e direitos do titular:** HU-15a, retificação cadastral a pedido do titular; HU-10, correção de presença com justificativa e trilha de auditoria.

## 3.5 Visibilidade por perfil

Base legal, finalidade e retenção: [política de dados pessoais](2-solucao-proposta.md#politica-dados-pessoais). Aqui, quem enxerga o quê, para que registrar não vire expor; diretriz prevista, a decidir com o Instituto:

- *Núcleo pedagógico e assistentes:* fichas de participantes, para mediar oficinas e cuidados específicos.
- *Administrativo-financeiro:* números consolidados de frequência e metas, sem nomes, telefones ou fotos.
- *Concedentes e auditoria:* relatórios e evidências exigidos pela prestação de contas, pelo tempo da análise, sem a base cadastral.

Matriz completa: [seção 8.5.1](../requisitos/8-requisitos.md#851-perfis-de-acesso-e-permissoes).
