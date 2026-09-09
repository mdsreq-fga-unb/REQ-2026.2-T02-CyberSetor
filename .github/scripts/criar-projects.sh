#!/usr/bin/env bash
#
# Cria e configura o quadro do projeto no GitHub Projects.
#
# Uso:
#   DRY_RUN=1 ./.github/scripts/criar-projects.sh
#   ./.github/scripts/criar-projects.sh
#
# Requer o GitHub CLI autenticado com o escopo project:
#   gh auth refresh -s project,read:project
#
# O quadro é criado na organização mdsreq-fga-unb e vinculado ao repositório.
# Campos e opções seguem o processo declarado no plano da Sprint 1.

set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"
ORG="mdsreq-fga-unb"
REPO="REQ-2026.2-T02-CyberSetor"
TITULO="CyberSetor · Product Backlog"

executar() {
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "  [dry-run] $*"
  else
    "$@"
  fi
}

echo "1. Criando o quadro"
if [[ "$DRY_RUN" == "1" ]]; then
  echo "  [dry-run] gh project create --owner $ORG --title \"$TITULO\""
  PROJETO="<numero-do-projeto>"
else
  PROJETO="$(gh project create --owner "$ORG" --title "$TITULO" --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["number"])')"
  echo "  quadro criado: número $PROJETO"
fi

echo
echo "2. Criando os campos de acompanhamento"

# Situação: o fluxo de trabalho do item, da declaração à validação.
executar gh project field-create "$PROJETO" --owner "$ORG" \
  --name "Situacao" --data-type SINGLE_SELECT \
  --single-select-options "Backlog,Refinamento,Pronto para iniciar,Em andamento,Em revisao por par,Concluido"

# MoSCoW: método único de priorização adotado pela equipe.
executar gh project field-create "$PROJETO" --owner "$ORG" \
  --name "MoSCoW" --data-type SINGLE_SELECT \
  --single-select-options "Must,Should,Could,Wont"

# Épico: agrupa os itens pelo bloco do produto a que pertencem.
executar gh project field-create "$PROJETO" --owner "$ORG" \
  --name "Epico" --data-type SINGLE_SELECT \
  --single-select-options "Requisito e meta,Atividade,Evidencia,Relatorio,Pessoas,Processo e infraestrutura"

# Atividade de Engenharia de Requisitos exercitada pelo item.
executar gh project field-create "$PROJETO" --owner "$ORG" \
  --name "Atividade de ER" --data-type SINGLE_SELECT \
  --single-select-options "Elicitacao e descoberta,Analise e consenso,Declaracao,Representacao,Verificacao e validacao,Organizacao e atualizacao"

# Sprint em que o item está alocado.
executar gh project field-create "$PROJETO" --owner "$ORG" \
  --name "Sprint" --data-type SINGLE_SELECT \
  --single-select-options "Sprint 1,Sprint 2,Sprint 3,Sprint 4,Sprint 5,Sprint 6"

# Rastreabilidade até o Documento de Visão.
executar gh project field-create "$PROJETO" --owner "$ORG" \
  --name "Objetivo especifico" --data-type TEXT
executar gh project field-create "$PROJETO" --owner "$ORG" \
  --name "Caracteristica proposta" --data-type TEXT

echo
echo "3. Vinculando o repositório"
executar gh project link "$PROJETO" --owner "$ORG" --repo "$ORG/$REPO"

echo
echo "Concluído."
cat <<'FIM'

Passos manuais que a interface faz melhor que a linha de comando:

  - Criar as visões do quadro:
      Backlog        tabela, agrupada por MoSCoW, ordenada por Épico
      Sprint atual   quadro kanban, agrupado por Situacao, filtro Sprint = Sprint 1
      Por pessoa     tabela, agrupada por responsável, para a daily
      Rastreabilidade  tabela com Objetivo especifico e Caracteristica proposta visíveis

  - Ligar a automação embutida (Workflows do Projects):
      item novo entra como Situacao = Backlog
      issue fechada passa a Situacao = Concluido
      pull request mesclado passa a Situacao = Concluido

FIM
