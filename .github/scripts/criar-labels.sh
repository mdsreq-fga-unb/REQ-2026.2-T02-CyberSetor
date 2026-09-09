#!/usr/bin/env bash
#
# Cria ou atualiza as labels do repositório CyberSetor.
#
# Uso:
#   ./.github/scripts/criar-labels.sh              # aplica no repositório atual
#   DRY_RUN=1 ./.github/scripts/criar-labels.sh    # apenas mostra o que faria
#
# Requer o GitHub CLI autenticado (gh auth status).
# O script é idempotente: rodar de novo atualiza cor e descrição, não duplica.

set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"

criar() {
  local nome="$1" cor="$2" descricao="$3"
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '  [dry-run] %-28s #%s  %s\n' "$nome" "$cor" "$descricao"
    return
  fi
  gh label create "$nome" --color "$cor" --description "$descricao" --force >/dev/null
  printf '  ok  %-28s #%s\n' "$nome" "$cor"
}

echo "Tipo de trabalho"
criar "tipo: historia"        "1D76DB" "História de usuário do Product Backlog"
criar "tipo: tarefa"          "5319E7" "Tarefa técnica ou de processo, sem valor direto ao usuário"
criar "tipo: documentacao"    "0E8A16" "Documento de Visão, atas, planos de sprint e páginas do site"
criar "tipo: bug"             "D73A4A" "Comportamento incorreto em algo já entregue"
criar "tipo: pesquisa"        "FBCA04" "Investigação, elicitação ou estudo normativo"
criar "tipo: infraestrutura"  "BFD4F2" "CI, deploy, ambiente e configuração do repositório"

echo "Prioridade MoSCoW"
criar "moscow: must"          "B60205" "Indispensável para a meta da sprint"
criar "moscow: should"        "D93F0B" "Relevante, mas não invalida a meta se ficar de fora"
criar "moscow: could"         "FEF2C0" "Desejável; é a contingência descartada primeiro"
criar "moscow: wont"          "CFD3D7" "Reconhecido como válido, fora deste período"

echo "Épico e atividade de Engenharia de Requisitos"
criar "epico: requisito-meta" "C2E0C6" "Cadastro de requisitos, metas e parâmetros de aferição"
criar "epico: atividade"      "C2E0C6" "Atividades, tipo de objeto e registro de presença"
criar "epico: evidencia"      "C2E0C6" "Evidências vinculadas a metas"
criar "epico: relatorio"      "C2E0C6" "Relatório de execução do objeto e prestação de contas"
criar "epico: pessoas"        "C2E0C6" "Base única de pessoas e consentimento"
criar "er: elicitacao"        "D4C5F9" "Elicitação e descoberta"
criar "er: analise"           "D4C5F9" "Análise e consenso"
criar "er: declaracao"        "D4C5F9" "Declaração de requisitos"
criar "er: representacao"     "D4C5F9" "Representação e modelagem"
criar "er: verificacao"       "D4C5F9" "Verificação e validação"

echo "Camada técnica, conforme a stack adotada"
criar "stack: backend"        "006B75" "NestJS, Prisma e PostgreSQL"
criar "stack: frontend"       "1D76DB" "Next.js, Tailwind, shadcn/ui e TanStack Query"
criar "stack: offline"        "0052CC" "Service Worker, Workbox e Dexie"
criar "stack: dados"          "5319E7" "Modelagem de dados e migrations"
criar "stack: testes"         "0E8A16" "Jest, Supertest e Playwright"
criar "stack: devops"         "BFD4F2" "Docker, Coolify, Vercel e Backblaze B2"

echo "Situação e apoio"
criar "sprint: 1"             "FEF2C0" "Selecionado para a Sprint 1"
criar "bloqueado"             "D73A4A" "Impedido por dependência externa ou decisão pendente"
criar "aguarda cliente"       "E99695" "Depende de retorno do Instituto"
criar "dojo"                  "FBCA04" "Sessão de nivelamento técnico ou de processo"
criar "boa primeira tarefa"   "7057FF" "Tarefa adequada a quem está começando na frente"

echo
echo "Concluído."
