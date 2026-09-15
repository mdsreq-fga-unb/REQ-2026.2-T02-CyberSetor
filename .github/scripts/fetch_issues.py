import os
import json
import urllib.request

REPO_FULL = os.environ.get("GITHUB_REPOSITORY", "mdsreq-fga-unb/REQ-2026.2-T02-CyberSetor")
TOKEN = os.environ.get("GITHUB_TOKEN")

FEEDBACK_FILE = "docs/entregas/debitos-u1.md"
SPRINT_FILE = "docs/gestao/sprints/tarefas-sprint-1.md"

if not TOKEN:
    print("GITHUB_TOKEN ausente. Execução ignorada.")
    exit(0)

owner, repo_name = REPO_FULL.split("/")

# Consulta GraphQL para buscar Issues + Labels + Status no GitHub Projects (Projects v2)
graphql_query = """
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    issues(first: 100, orderBy: {field: CREATED_AT, direction: ASC}) {
      nodes {
        number
        title
        state
        url
        author {
          login
        }
        assignees(first: 10) {
          nodes {
            login
          }
        }
        labels(first: 20) {
          nodes {
            name
          }
        }
        projectItems(first: 5) {
          nodes {
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
"""

payload = json.dumps({
    "query": graphql_query,
    "variables": {"owner": owner, "repo": repo_name}
}).encode("utf-8")

req = urllib.request.Request(
    "https://api.github.com/graphql",
    data=payload,
    headers={
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
        "User-Agent": "Python-GitHub-Action"
    }
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        issues_nodes = result.get("data", {}).get("repository", {}).get("issues", {}).get("nodes", [])
except Exception as e:
    print(f"Erro ao consultar GraphQL da API do GitHub: {e}")
    exit(1)


def extrair_status_project(node):
    """Extrai o valor da coluna 'Status' no GitHub Projects v2."""
    for item in node.get("projectItems", {}).get("nodes", []):
        for fv in item.get("fieldValues", {}).get("nodes", []):
            field_name = fv.get("field", {}).get("name", "")
            if field_name.lower() == "status":
                return fv.get("name")
    return None


issues_feedback = []
issues_sprint = []

for node in issues_nodes:
    titulo = node["title"].lower()
    autor = node.get("author", {}).get("login", "").lower() if node.get("author") else ""
    labels = [l["name"].lower() for l in node.get("labels", {}).get("nodes", [])]
    
    # Classificação entre Feedback da Monitoria vs Sprint da Equipe
    is_feedback = (
        autor == "marsicanogeorge"
        or "unidade 1" in titulo
        or "u1" in titulo
        or any(lb in labels for lb in ["improvement", "requirements", "help wanted", "feedback", "monitoria"])
    )
    
    is_sprint_1 = (
        any("sprint: 1" in lb or "sprint-1" in lb for lb in labels)
        or not is_feedback
    )
    
    if is_feedback:
        issues_feedback.append(node)
    elif is_sprint_1:
        issues_sprint.append(node)


# ==============================================================================
# 1. GERAÇÃO DA ABA DO PROFESSOR (DÉBITOS U1)
# ==============================================================================
conteudo_feedback = """# Débitos e Feedbacks da Monitoria (Unidade 1)

> **Regra de Governança:** As issues de feedback permanecem abertas pela equipe durante a atuação e são fechadas exclusivamente pelo professor ou monitores após a validação no site.

| Issue | Título | Responsáveis | Status da Correção | Acesso |
| :--- | :--- | :--- | :---: | :---: |
"""

if not issues_feedback:
    conteudo_feedback += "| - | *Nenhum feedback registrado no momento.* | - | - | - |\n"
else:
    for node in issues_feedback:
        num = f"#{node['number']}"
        titulo = node["title"].replace("|", "-")
        assignees_list = [f"@{a['login']}" for a in node.get("assignees", {}).get("nodes", [])]
        assignees = ", ".join(assignees_list) if assignees_list else "Não atribuído"
        labels = [l["name"].lower() for l in node.get("labels", {}).get("nodes", [])]
        proj_status = extrair_status_project(node)
        proj_status_lower = proj_status.lower() if proj_status else ""
        
        # 1º: Checa se foi fechada pela monitoria (no estado nativo ou no board)
        if node["state"] == "CLOSED" or proj_status_lower in ["done", "concluído", "concluido", "closed"]:
            status = "🟢 Validado e Fechado (Monitoria)"
        # 2º: Checa status do Project ou Labels de revisão
        elif proj_status_lower in ["pronto para revisão", "pronto para revisao", "review", "em revisão"] or any(lb in labels for lb in ["pronto-para-revisao", "pronto para revisao", "em revisao"]):
            status = "🔵 Pronto para Revisão"
        # 3º: Checa status do Project ou Labels de em andamento
        elif proj_status_lower in ["in progress", "em andamento", "doing", "fazendo"] or any(lb in labels for lb in ["em-andamento", "em andamento"]):
            status = "🟡 Em Correção pela Equipe"
        # 4º: Default
        else:
            status = "🔴 Pendente de Atuação"
            
        conteudo_feedback += f"| **{num}** | {titulo} | {assignees} | {status} | [Ver no GitHub]({node['url']}) |\n"

os.makedirs(os.path.dirname(FEEDBACK_FILE), exist_ok=True)
with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
    f.write(conteudo_feedback)


# ==============================================================================
# 2. GERAÇÃO DA ABA DA SPRINT 1 (BACKLOG DA EQUIPE)
# ==============================================================================
conteudo_sprint = """# Acompanhamento de Tarefas — Sprint 1

> Acompanhamento em tempo real das histórias de usuário, elicitações e artefatos de modelagem.

| Issue | Título | Tipo / Atividade de ER | Responsáveis | Status | Acesso |
| :--- | :--- | :--- | :--- | :---: | :---: |
"""

if not issues_sprint:
    conteudo_sprint += "| - | *Nenhuma tarefa cadastrada para a Sprint 1.* | - | - | - | - |\n"
else:
    for node in issues_sprint:
        num = f"#{node['number']}"
        titulo = node["title"].replace("|", "-")
        assignees_list = [f"@{a['login']}" for a in node.get("assignees", {}).get("nodes", [])]
        assignees = ", ".join(assignees_list) if assignees_list else "Não atribuído"
        
        labels_raw = [l["name"] for l in node.get("labels", {}).get("nodes", [])]
        labels_lower = [l.lower() for l in labels_raw]
        
        tags_er = [l for l in labels_raw if l.startswith("er:") or l.startswith("tipo:")]
        tipo_str = ", ".join([f"`{t}`" for t in tags_er]) if tags_er else "—"
        
        proj_status = extrair_status_project(node)
        proj_status_lower = proj_status.lower() if proj_status else ""
        
        # 1º: Concluído
        if node["state"] == "CLOSED" or proj_status_lower in ["done", "concluído", "concluido", "closed"]:
            status = "🟢 Concluído"
        # 2º: Bloqueio / Espera externa (Project ou label)
        elif proj_status_lower in ["aguarda cliente", "waiting", "bloqueado", "blocked"] or "aguarda cliente" in labels_lower:
            status = "⏳ Aguarda Cliente"
        # 3º: Em Revisão
        elif proj_status_lower in ["pronto para revisão", "pronto para revisao", "review", "em revisão"] or any(lb in labels_lower for lb in ["pronto-para-revisao", "pronto para revisao"]):
            status = "🔵 Pronto para Revisão"
        # 4º: Em Andamento / In Progress
        elif proj_status_lower in ["in progress", "em andamento", "doing", "fazendo"] or any(lb in labels_lower for lb in ["em-andamento", "em andamento", "in-progress"]):
            status = "🟡 Em Andamento"
        # 5º: Outro status customizado no Project Board
        elif proj_status:
            status = f"📋 {proj_status}"
        # 6º: To Do padrão
        else:
            status = "⚪ A Fazer (To Do)"
            
        conteudo_sprint += f"| **{num}** | {titulo} | {tipo_str} | {assignees} | {status} | [Ver no GitHub]({node['url']}) |\n"

os.makedirs(os.path.dirname(SPRINT_FILE), exist_ok=True)
with open(SPRINT_FILE, "w", encoding="utf-8") as f:
    f.write(conteudo_sprint)

print(f"Sucesso: {FEEDBACK_FILE} ({len(issues_feedback)} itens) e {SPRINT_FILE} ({len(issues_sprint)} itens) gerados com status do Projects!")
