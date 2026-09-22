"""
Gera as páginas de acompanhamento do site a partir das issues e do quadro do projeto.

Saída (não versionada; ver .gitignore):
  docs/entregas/debitos-u1.md               issues abertas pelo docente (rótulo "origem: professor")
  docs/gestao/sprints/tarefas-sprint-N.md   uma página por sprint, N em SPRINTS

Sprint e Situação vêm exclusivamente do quadro do projeto (campos Sprint e
Status). Rótulos não representam situação. O token padrão das Actions não lê
projetos de organização: os workflows usam o segredo PROJECTS_READ_TOKEN
(token pessoal com escopo read:project). Sem ele, o script avisa e as páginas
saem com "sem registro no quadro".
"""
import json
import os
import re
import urllib.request

REPO_FULL = os.environ.get("GITHUB_REPOSITORY", "mdsreq-fga-unb/REQ-2026.2-T02-CyberSetor")
TOKEN = os.environ.get("GITHUB_TOKEN")
FEEDBACK_FILE = "docs/entregas/debitos-u1.md"
SPRINT_FILE = "docs/gestao/sprints/tarefas-sprint-{n}.md"
SPRINTS = [1, 2]  # páginas geradas; acrescentar aqui e no nav do mkdocs.yml a cada sprint
PROFESSOR = "marsicanogeorge"

if not TOKEN:
    print("GITHUB_TOKEN ausente. Execução ignorada.")
    raise SystemExit(0)

owner, repo_name = REPO_FULL.split("/")

QUERY = """
query($owner: String!, $repo: String!, $after: String) {
  repository(owner: $owner, name: $repo) {
    issues(first: 100, after: $after, orderBy: {field: CREATED_AT, direction: ASC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title state url
        author { login }
        assignees(first: 10) { nodes { login } }
        labels(first: 20) { nodes { name } }
        projectItems(first: 5) {
          nodes {
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field { ... on ProjectV2SingleSelectField { name } }
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


def graphql(variables):
    payload = json.dumps({"query": QUERY, "variables": variables}).encode("utf-8")
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=payload,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json",
                 "User-Agent": "cybersetor-fetch-issues"},
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())


issues = []
after = None
while True:
    try:
        data = graphql({"owner": owner, "repo": repo_name, "after": after})
    except Exception as e:  # noqa: BLE001
        print(f"Erro ao consultar a API do GitHub: {e}")
        raise SystemExit(1)
    conn = data.get("data", {}).get("repository", {}).get("issues", {})
    issues.extend(conn.get("nodes", []))
    if not conn.get("pageInfo", {}).get("hasNextPage"):
        break
    after = conn["pageInfo"]["endCursor"]


def campos_do_quadro(node):
    """Valores dos campos de seleção única do item no quadro: {campo: valor}."""
    valores = {}
    for item in node.get("projectItems", {}).get("nodes", []):
        for fv in item.get("fieldValues", {}).get("nodes", []):
            nome = (fv.get("field") or {}).get("name")
            if nome and fv.get("name"):
                valores[nome.lower()] = fv["name"]
    return valores


def sprint_da_issue(campos):
    valor = campos.get("sprint")  # ex.: "Sprint 2"
    if valor:
        m = re.search(r"(\d+)", valor)
        if m:
            return int(m.group(1))
    return None


def situacao(node, campos, feedback=False):
    """Situação pelo Status do quadro; o estado da issue só decide o fechamento."""
    status = (campos.get("status") or "").lower()
    if node["state"] == "CLOSED" or status == "done":
        return "🟢 Validado e fechado" if feedback else "🟢 Concluído"
    if status == "aguardando":
        return "⏳ Aguardando retorno ou decisão"
    if status == "em revisão":
        return "🔵 Em revisão"
    if status == "in progress":
        return "🟡 Em andamento"
    if status == "todo":
        return "⚪ A fazer"
    if status:
        return f"📋 {campos.get('status')}"
    return "▫️ Sem registro no quadro"


def responsaveis(node):
    nomes = [f"@{a['login']}" for a in node.get("assignees", {}).get("nodes", [])]
    return ", ".join(nomes) if nomes else "Não atribuído"


def e_do_professor(node):
    labels = [l["name"].lower() for l in node.get("labels", {}).get("nodes", [])]
    autor = ((node.get("author") or {}).get("login") or "").lower()
    return "origem: professor" in labels or autor == PROFESSOR


com_quadro = sum(1 for n in issues if campos_do_quadro(n))
if issues and com_quadro == 0:
    print("::warning::Nenhuma issue trouxe campos do quadro. O token não lê o projeto da organização: "
          "configure o segredo PROJECTS_READ_TOKEN (token pessoal com escopo read:project).")

feedback = [n for n in issues if e_do_professor(n)]
por_sprint = {n: [] for n in SPRINTS}
for node in issues:
    if e_do_professor(node):
        continue
    s = sprint_da_issue(campos_do_quadro(node))
    if s in por_sprint:
        por_sprint[s].append(node)

# ---- issues do docente ----
texto = """# Débitos e Feedbacks da Monitoria (Unidade 1)

> As issues abertas pelo docente permanecem abertas durante a atuação da equipe e são fechadas pelo docente ou pela monitoria após a validação no site.

| Issue | Título | Responsáveis | Situação | Acesso |
| :--- | :--- | :--- | :---: | :---: |
"""
if not feedback:
    texto += "| - | *Nenhum feedback registrado.* | - | - | - |\n"
for node in feedback:
    texto += (f"| **#{node['number']}** | {node['title'].replace('|', '-')} | {responsaveis(node)} | "
              f"{situacao(node, campos_do_quadro(node), feedback=True)} | [Ver no GitHub]({node['url']}) |\n")
os.makedirs(os.path.dirname(FEEDBACK_FILE), exist_ok=True)
with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
    f.write(texto)

# ---- uma página por sprint ----
for n in SPRINTS:
    texto = f"""# Acompanhamento de Tarefas — Sprint {n}

> Gerado a partir das issues e do quadro do projeto a cada publicação do site. A fonte é o quadro; esta página é uma leitura.

| Issue | Título | Tipo / Atividade de ER | Responsáveis | Situação | Acesso |
| :--- | :--- | :--- | :--- | :---: | :---: |
"""
    itens = por_sprint[n]
    if not itens:
        texto += f"| - | *Nenhum item alocado à Sprint {n}.* | - | - | - | - |\n"
    for node in itens:
        campos = campos_do_quadro(node)
        tags = [l["name"] for l in node.get("labels", {}).get("nodes", []) if l["name"].startswith(("er:", "tipo:"))]
        tipo = ", ".join(f"`{t}`" for t in tags) if tags else "—"
        texto += (f"| **#{node['number']}** | {node['title'].replace('|', '-')} | {tipo} | {responsaveis(node)} | "
                  f"{situacao(node, campos)} | [Ver no GitHub]({node['url']}) |\n")
    caminho = SPRINT_FILE.format(n=n)
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(texto)

print(f"Issues lidas: {len(issues)}; com campos do quadro: {com_quadro}")
print(f"Gerado: {FEEDBACK_FILE} ({len(feedback)}) e "
      + ", ".join(f"sprint {n} ({len(por_sprint[n])})" for n in SPRINTS))
