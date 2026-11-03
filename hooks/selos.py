"""
Selos de situação nos requisitos funcionais da seção 8 e nas histórias da seção 10.

A situação não é escrita no documento: vem de situacao-historias.json, gerado pelo
.github/scripts/fetch_issues.py a cada build a partir do quadro do projeto (Status) e do
fechamento da issue (fechada como "não planejada" = retirada do escopo). O RF segue as
histórias que o implementam (coluna Rastreabilidade da seção 8). Sem o arquivo, ou sem
leitura do quadro, as seções saem como estão, sem selos.
"""
from __future__ import annotations

import html
import json
import logging
import re
from pathlib import Path

log = logging.getLogger("mkdocs.hooks.selos")


def _e(texto: str) -> str:
    return html.escape(texto, quote=True)


SITUACAO = "situacao-historias.json"
SECAO_RF = "requisitos/8-requisitos.md"
SECAO_HU = "requisitos/10-backlog.md"
ORDEM = ["a-fazer", "em-andamento", "concluido", "retirado"]
ROTULO = {
    "m": {"a-fazer": "A fazer", "em-andamento": "Em andamento", "concluido": "Concluído", "retirado": "Retirado do escopo"},
    "f": {"a-fazer": "A fazer", "em-andamento": "Em andamento", "concluido": "Concluída", "retirado": "Retirada do escopo"},
}
LINHA_RF = re.compile(r"^(\| <a id=\"rf\d+\"></a>\*\*RF\d+\*\*)(.*)$")
NEGRITO_HU = re.compile(r"\*\*(HU-\d{2}[a-z]?)\*\*")
TITULO_HU = re.compile(r'^(\?\?\?\+? note)( "(HU-\d{2}[a-z]?) · [^"]*)"\s*$')
HU = re.compile(r"HU-\d{2}[a-z]?")


def ler_situacao(raiz: Path) -> dict | None:
    arq = raiz / SITUACAO
    if not arq.exists():
        return None
    dados = json.loads(arq.read_text(encoding="utf-8"))
    if not dados.get("com_quadro") or not dados.get("historias"):
        log.info("selos: %s sem leitura do quadro; seções 8 e 10 sem selos.", SITUACAO)
        return None
    return dados


def situacao_do_rf(historias: list[str], dados: dict) -> str | None:
    """O RF segue as histórias que o implementam: concluído só quando todas concluírem."""
    sits = [dados["historias"][h]["situacao"] for h in historias if h in dados["historias"]]
    sits = [s for s in sits if s != "retirado"] or sits
    if not sits:
        return None
    if all(s == "concluido" for s in sits):
        return "concluido"
    if all(s == "retirado" for s in sits):
        return "retirado"
    if any(s in ("em-andamento", "concluido") for s in sits):
        return "em-andamento"
    return "a-fazer"


def _selo(sit: str, genero: str) -> str:
    return f"<span class='selo selo--{sit}' data-situacao='{sit}'>{ROTULO[genero][sit]}</span>"


def legenda(dados: dict, genero: str, quais: str) -> str:
    chips = " ".join(_selo(s, genero) for s in ORDEM)
    opcoes = "".join(f'<option value="{s}">{ROTULO[genero][s]}</option>' for s in ORDEM)
    return (
        f'<div class="selos-legenda" markdown="0"><p>Situação {quais} no quadro do projeto, lida em '
        f"{_e(dados['leitura'])}: {chips}</p>"
        f'<label>Mostrar <select data-selo-filtro><option value="">Todas as situações</option>{opcoes}</select></label>'
        f'<span class="selos-legenda__status" data-selo-status aria-live="polite"></span></div>\n'
    )


def selar_requisitos(md: str, dados: dict) -> str:
    saida, legenda_feita = [], False
    for linha in md.splitlines():
        if not legenda_feita and linha.startswith("## 8.2"):
            saida += [linha, "", legenda(dados, "m", "dos requisitos funcionais, pelas histórias que os implementam,")]
            legenda_feita = True
            continue
        m = LINHA_RF.match(linha)
        if m:
            sit = situacao_do_rf(HU.findall(re.split(r"(?<!\\)\|", linha)[-2]), dados)
            if sit:
                linha = f"{m.group(1)} {_selo(sit, 'm')}{m.group(2)}"
        saida.append(linha)
    return "\n".join(saida)


def selar_backlog(md: str, dados: dict) -> str:
    def no_negrito(m: re.Match) -> str:
        h = dados["historias"].get(m.group(1))
        return f"{m.group(0)} {_selo(h['situacao'], 'f')}" if h else m.group(0)

    saida, legenda_feita = [], False
    for linha in md.splitlines():
        if not legenda_feita and linha.startswith("## 10.1"):
            saida += [linha, "", legenda(dados, "f", "das histórias")]
            legenda_feita = True
            continue
        t = TITULO_HU.match(linha)
        if t:
            h = dados["historias"].get(t.group(3))
            if h:
                linha = f'{t.group(1)} selo-{h["situacao"]}{t.group(2)} {_selo(h["situacao"], "f")}"'
        elif linha.startswith("|"):
            linha = NEGRITO_HU.sub(no_negrito, linha)
        saida.append(linha)
    return "\n".join(saida)


def on_page_markdown(markdown, page, config, files, **kwargs):
    caminho = page.file.src_uri
    if caminho not in (SECAO_RF, SECAO_HU):
        return markdown
    dados = ler_situacao(Path(config["config_file_path"]).parent)
    if not dados:
        return markdown
    return selar_requisitos(markdown, dados) if caminho == SECAO_RF else selar_backlog(markdown, dados)
