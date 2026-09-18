#!/usr/bin/env python3
"""
Script para criação das 7 issues de Requisitos da Unidade 2 no GitHub.
Recupera automaticamente o token já autenticado no Git Credential Manager do seu computador.

Uso:
    python .github/scripts/criar-issues-u2.py            # Cria de fato as 7 issues no GitHub
    python .github/scripts/criar-issues-u2.py --dry-run  # Apenas simula sem criar
"""

import os
import sys
import glob
import json
import subprocess
import urllib.request

REPO_DEFAULT = "mdsreq-fga-unb/REQ-2026.2-T02-CyberSetor"
REPO = os.environ.get("GITHUB_REPOSITORY", REPO_DEFAULT)

DIR_ATUAL = os.path.dirname(os.path.abspath(__file__))
ISSUES_DIR = os.path.join(DIR_ATUAL, "..", "issues-requisitos-u2")

def obter_token():
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    try:
        p = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
        out, _ = p.communicate('protocol=https\nhost=github.com\n')
        creds = dict(line.split('=', 1) for line in out.strip().splitlines() if '=' in line)
        return creds.get('password')
    except Exception:
        return None

def extrair_metadados_e_corpo(caminho_arquivo):
    with open(caminho_arquivo, "r", encoding="utf-8") as f:
        conteudo = f.read()

    partes = conteudo.split("---", 2)
    if len(partes) < 3:
        return None, None, None, conteudo

    cabecalho = partes[1]
    corpo = partes[2].strip()

    titulo = None
    assignees = []
    labels = []

    for linha in cabecalho.splitlines():
        linha = linha.strip()
        if linha.startswith("title:"):
            titulo = linha.split("title:", 1)[1].strip().strip('"').strip("'")
        elif linha.startswith("assignees:"):
            val = linha.split("assignees:", 1)[1].strip()
            assignees = [a.strip() for a in val.split(",") if a.strip()]
        elif linha.startswith("labels:"):
            val = linha.split("labels:", 1)[1].strip().strip('"').strip("'")
            labels = [l.strip() for l in val.split(",") if l.strip()]

    return titulo, assignees, labels, corpo

def main():
    arquivos = sorted(glob.glob(os.path.join(ISSUES_DIR, "*.md")))
    if not arquivos:
        print(f"[-] Nenhum arquivo de issue encontrado em {ISSUES_DIR}")
        sys.exit(1)

    is_dry_run = "--dry-run" in sys.argv
    token = None if is_dry_run else obter_token()

    if not is_dry_run and not token:
        print("[-] Não foi possível obter o token do GitHub. Defina $env:GITHUB_TOKEN ou use --dry-run.")
        sys.exit(1)

    print(f"=== Processando {len(arquivos)} issues para o repositório {REPO} ===\n")
    if is_dry_run:
        print("[MODO DRY-RUN / SIMULAÇÃO] Nenhuma issue será enviada ao GitHub.\n")

    sucesso = 0
    for arq in arquivos:
        nome_arq = os.path.basename(arq)
        titulo, assignees, labels, corpo = extrair_metadados_e_corpo(arq)
        if not titulo:
            print(f"[-] Aviso: {nome_arq} ignorado (sem título no cabeçalho YAML).")
            continue

        print(f"-> {nome_arq}")
        print(f"   Título:       {titulo}")
        print(f"   Responsáveis: {', '.join(assignees) if assignees else 'Nenhum'}")
        print(f"   Labels:       {', '.join(labels) if labels else 'Nenhuma'}")

        if is_dry_run:
            print("   Status:       [SIMULADO OK]\n")
            sucesso += 1
        else:
            url = f"https://api.github.com/repos/{REPO}/issues"
            payload = {
                "title": titulo,
                "body": corpo,
                "assignees": assignees,
                "labels": labels
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3+json",
                    "Content-Type": "application/json",
                    "User-Agent": "CyberSetor-Issue-Creator"
                }
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    dados = json.loads(resp.read().decode())
                    print(f"   Status:       [CRIADA COM SUCESSO] #{dados.get('number')} -> {dados.get('html_url')}\n")
                    sucesso += 1
            except Exception as e:
                print(f"   [-] Erro ao criar issue: {e}\n")

    print(f"=== Concluído: {sucesso}/{len(arquivos)} issues processadas. ===")

if __name__ == "__main__":
    main()
