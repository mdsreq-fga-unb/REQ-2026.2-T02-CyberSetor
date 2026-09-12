import os
import json
import urllib.request

REPO = os.environ.get("GITHUB_REPOSITORY", "mdsreq-fga-unb/REQ-2026.2-T02-CyberSetor")
TOKEN = os.environ.get("GITHUB_TOKEN")

FEEDBACK_FILE = "docs/entregas/debitos-u1.md"
SPRINT_FILE = "docs/gestao/sprints/tarefas-sprint-1.md"

if not TOKEN:
    print("GITHUB_TOKEN ausente. Execução local/sem token ignorada.")
    exit(0)

url = f"https://api.github.com/repos/{REPO}/issues?state=all&per_page=100"
req = urllib.request.Request(
    url,
    headers={
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github+json"
    }
)

try:
    with urllib.request.urlopen(req) as response:
        issues = json.loads(response.read().decode())
except Exception as e:
    print(f"Erro ao buscar issues da API: {e}")
    exit(1)

# Descarta Pull Requests retornados pela API
issues_reais = [i for i in issues if "pull_request" not in i]

issues_feedback = []
issues_sprint = []

for issue in sorted(issues_reais, key=lambda x: x["number"]):
    titulo = issue["title"].lower()
    autor = issue.get("user", {}).get("login", "").lower()
    labels = [l["name"].lower() for l in issue.get("labels", [])]
    
    # 1. Critério do Professor / Monitoria (Issues #19 a #26)
    is_feedback = (
        autor == "marsicanogeorge"
        or "unidade 1" in titulo
        or "u1" in titulo
        or any(lb in labels for lb in ["improvement", "requirements", "help wanted", "feedback", "monitoria"])
    )
    
    # 2. Critério da Sprint 1 da Equipe (label 'sprint: 1' ou tarefas internas)
    is_sprint_1 = (
        any("sprint: 1" in lb or "sprint-1" in lb for lb in labels)
        or not is_feedback
    )
    
    if is_feedback:
        issues_feedback.append(issue)
    elif is_sprint_1:
        issues_sprint.append(issue)


# --- GERAÇÃO DA ABA DO PROFESSOR (DÉBITOS U1) ---
conteudo_feedback = """# Débitos e Feedbacks da Monitoria (Unidade 1)

> **Regra de Governança:** As issues de feedback permanecem abertas pela equipe durante a atuação e são fechadas exclusivamente pelo professor ou monitores após a validação no site.

| Issue | Título | Responsáveis | Status da Correção | Acesso |
| :--- | :--- | :--- | :---: | :---: |
"""

if not issues_feedback:
    conteudo_feedback += "| - | *Nenhum feedback registrado no momento.* | - | - | - |\n"
else:
    for issue in issues_feedback:
        num = f"#{issue['number']}"
        titulo = issue["title"].replace("|", "-")
        assignees = ", ".join([f"@{a['login']}" for a in issue.get("assignees", [])]) or "Não atribuído"
        labels = [l["name"].lower() for l in issue.get("labels", [])]
        
        if issue["state"] == "closed":
            status = "🟢 Validado e Fechado (Monitoria)"
        elif any(lb in labels for lb in ["pronto-para-revisao", "pronto para revisao", "em revisao"]):
            status = "🔵 Pronto para Revisão"
        elif any(lb in labels for lb in ["em-andamento", "em andamento"]):
            status = "🟡 Em Correção pela Equipe"
        else:
            status = "🔴 Pendente de Atuação"
            
        conteudo_feedback += f"| **{num}** | {titulo} | {assignees} | {status} | [Ver no GitHub]({issue['html_url']}) |\n"

os.makedirs(os.path.dirname(FEEDBACK_FILE), exist_ok=True)
with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
    f.write(conteudo_feedback)


# --- GERAÇÃO DA ABA DA SPRINT 1 (BACKLOG DA EQUIPE) ---
conteudo_sprint = """# Acompanhamento de Tarefas — Sprint 1

> Acompanhamento em tempo real das histórias de usuário, elicitações e artefatos de modelagem.

| Issue | Título | Tipo / Atividade de ER | Responsáveis | Status | Acesso |
| :--- | :--- | :--- | :--- | :---: | :---: |
"""

if not issues_sprint:
    conteudo_sprint += "| - | *Nenhuma tarefa cadastrada para a Sprint 1.* | - | - | - | - |\n"
else:
    for issue in issues_sprint:
        num = f"#{issue['number']}"
        titulo = issue["title"].replace("|", "-")
        assignees = ", ".join([f"@{a['login']}" for a in issue.get("assignees", [])]) or "Não atribuído"
        labels_raw = [l["name"] for l in issue.get("labels", [])]
        labels_lower = [l.lower() for l in labels_raw]
        
        # Extrai tags informativas (ex: 'tipo: pesquisa', 'er: elicitacao')
        tags_er = [l for l in labels_raw if l.startswith("er:") or l.startswith("tipo:")]
        tipo_str = ", ".join([f"`{t}`" for t in tags_er]) if tags_er else "—"
        
        # Determina o status da tarefa da sprint
        if issue["state"] == "closed":
            status = "🟢 Concluído"
        elif "aguarda cliente" in labels_lower:
            status = "⏳ Aguarda Cliente"
        elif any(lb in labels_lower for lb in ["em-andamento", "em andamento", "in-progress"]):
            status = "🟡 Em Andamento"
        else:
            status = "⚪ A Fazer (To Do)"
            
        conteudo_sprint += f"| **{num}** | {titulo} | {tipo_str} | {assignees} | {status} | [Ver no GitHub]({issue['html_url']}) |\n"

os.makedirs(os.path.dirname(SPRINT_FILE), exist_ok=True)
with open(SPRINT_FILE, "w", encoding="utf-8") as f:
    f.write(conteudo_sprint)

print(f"Sucesso: {FEEDBACK_FILE} ({len(issues_feedback)} itens) e {SPRINT_FILE} ({len(issues_sprint)} itens) gerados.")
