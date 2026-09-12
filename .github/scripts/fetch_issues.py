import os
import json
import urllib.request

REPO = os.environ.get("GITHUB_REPOSITORY", "mdsreq-fga-unb/REQ-2026.2-T02-CyberSetor")
TOKEN = os.environ.get("GITHUB_TOKEN")
OUTPUT_FILE = "docs/entregas/debitos-u1.md"

if not TOKEN:
    print("GITHUB_TOKEN ausente. Execução local/sem token ignorada.")
    exit(0)

url = f"https://api.github.com/repos/{REPO}/issues?state=all&per_page=50"
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

# Filtra apenas issues reais (descarta Pull Requests)
issues_reais = [i for i in issues if "pull_request" not in i]

conteudo = """# Gestão de Débitos e Feedbacks da Monitoria (Unidade 1)

> **Regra de Governança:** As issues de feedback permanecem abertas pela equipe durante a correção e são fechadas exclusivamente pelo professor ou monitores após a validação das alterações no site.

| Issue | Título | Responsáveis | Status da Correção | Acesso |
| :--- | :--- | :--- | :---: | :---: |
"""

for issue in sorted(issues_reais, key=lambda x: x["number"]):
    num = f"#{issue['number']}"
    titulo = issue["title"].replace("|", "-")
    assignees = ", ".join([f"@{a['login']}" for a in issue.get("assignees", [])]) or "Não atribuído"
    
    # Rastreamento por estado e labels
    labels = [l["name"].lower() for l in issue.get("labels", [])]
    
    if issue["state"] == "closed":
        status = "🟢 Validado e Fechado (Monitoria)"
    elif any(lb in labels for lb in ["pronto-para-revisao", "pronto para revisao", "em revisao"]):
        status = "🔵 Pronto para Revisão"
    elif any(lb in labels for lb in ["em-andamento", "em andamento"]):
        status = "🟡 Em Correção pela Equipe"
    else:
        status = "🔴 Pendente de Atuação"
        
    html_url = issue["html_url"]
    conteudo += f"| **{num}** | {titulo} | {assignees} | {status} | [Ver no GitHub]({html_url}) |\n"

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(conteudo)

print(f"Sucesso: {OUTPUT_FILE} atualizado com {len(issues_reais)} issues.")
