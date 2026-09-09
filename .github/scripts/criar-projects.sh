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
# Campos e abas seguem o processo declarado no plano da Sprint 1.
#
# O fluxo de trabalho usa o campo Status, nativo do GitHub Projects, e não um
# campo próprio: é o Status que as automações embutidas do Projects movimentam.
# As opções dele são renomeadas pela interface, na engrenagem do campo.

set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"
ORG="mdsreq-fga-unb"
REPO="REQ-2026.2-T02-CyberSetor"
TITULO="CyberSetor - Board"

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
  PROJETO="<numero>"
  PID="<id>"
else
  PROJETO="$(gh project create --owner "$ORG" --title "$TITULO" --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["number"])')"
  PID="$(gh project view "$PROJETO" --owner "$ORG" --format json --jq '.id')"
  echo "  quadro criado: número $PROJETO"
fi

echo
echo "2. Criando os campos de acompanhamento"

# MoSCoW: método único de priorização adotado pela equipe. Fica vazio até que a
# equipe classifique em refinamento; preencher de antemão ancora a discussão.
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
echo "4. Criando as abas"

# A API aceita nome, layout e campos visíveis. Agrupamento e filtro não são
# expostos por ela e ficam para a interface, conforme o aviso no fim do script.
criar_aba() {
  local nome="$1" layout="$2" campos="$3"
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "  [dry-run] aba \"$nome\" ($layout)"
    return
  fi
  local ids
  ids="$(gh project field-list "$PROJETO" --owner "$ORG" --format json \
    --jq --arg nomes "$campos" '[.fields[] | select(.name as $n | ($nomes | split(",")) | index($n)) | .id] | @json')"
  gh api graphql -f query="
    mutation {
      createProjectV2View(input: {
        projectId: \"$PID\", name: \"$nome\", layout: $layout,
        configuration: { visibleFieldIds: $ids }
      }) { projectV2View { name number } }
    }" --jq '.data.createProjectV2View.projectV2View | "  aba \(.number): \(.name)"'
}

criar_aba "Backlog"         TABLE_LAYOUT "Title,Assignees,Epico,MoSCoW,Atividade de ER,Sprint,Status"
criar_aba "Sprint 1"        BOARD_LAYOUT "Title,Assignees,MoSCoW,Epico,Labels"
criar_aba "Por pessoa"      TABLE_LAYOUT "Title,Assignees,Status,Sprint,Epico"
criar_aba "Rastreabilidade" TABLE_LAYOUT "Title,Epico,Objetivo especifico,Caracteristica proposta,MoSCoW"

echo
echo "Concluído."
cat <<'FIM'

O que resta fazer pela interface, porque a API não expõe:

  - Agrupamento e filtro de cada aba:
      Backlog          agrupar por MoSCoW, ordenar por Epico
      Sprint 1         agrupar por Status, filtrar Sprint = Sprint 1
      Por pessoa       agrupar por Assignees
      Rastreabilidade  sem agrupamento

  - Renomear as opções do campo Status para o fluxo da equipe:
      Backlog, Refinamento, Em andamento, Em revisao por par, Concluido

  - Ligar as automações em Workflows:
      item novo entra como Status = Backlog
      issue fechada passa a Status = Concluido
      pull request mesclado passa a Status = Concluido

FIM
