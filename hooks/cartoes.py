"""
Cartões dos requisitos nas seções 8.2 e 8.3, compostos a cada build do MkDocs.

As tabelas das seções 8.2 e 8.3 continuam sendo a fonte, e é nelas que se edita um requisito.
No build, cada tabela vira uma grade de cartões, um por requisito, com o que está registrado
em outras seções:
  - história, critérios de aceitação, gargalo e cobertura: matriz 8.4.1;
  - requisitos não funcionais ligados ao RF e RFs ligados ao RNF: matriz 8.4.2;
  - valor, esforço e destino (MVP ou fora dele): tabela 10.2.4;
  - classe do RNF no MVP: tabela 10.2.7;
  - situação no quadro: selo já aplicado por hooks/selos.py, quando houver leitura do quadro.

O cartão guarda a âncora do requisito (#rf01, #rnf01), e por isso os links de outras páginas
continuam chegando ao mesmo lugar. Se a fonte mudar de forma, o build falha em vez de publicar
cartões incompletos.
"""
from __future__ import annotations

import html
import re
from dataclasses import dataclass, field
from pathlib import Path

from mkdocs.exceptions import PluginError

import ligacoes

SECAO_RF = "requisitos/8-requisitos.md"
BACKLOG = "requisitos/10-backlog.md"

SEPARA = re.compile(r"(?<!\\)\|")
ANCORA = re.compile(r'^<a id="(rn?f\d+)"></a>\*\*(RN?F\d+)\*\*\s*(.*)$')
LINHA_841 = re.compile(r"^\| \*\*(RF\d+)\*\* \|")
LINHA_842 = re.compile(r"^\| \*\*(RNF\d+)\*\* \|")
LINHA_1024 = re.compile(r"^\| \[(RF\d+)\]\(")
HU = re.compile(r"HU-\d{2}[a-z]?")
CODIGO_RF = re.compile(r"(?<![\w#\[])RF(\d{2})(?![\w\]])")


def celulas(linha: str) -> list[str]:
    return [c.strip() for c in SEPARA.split(linha.strip())[1:-1]]


def faixa(texto: str) -> list[str]:
    """Expande "RF01 a RF06, RF09" em RF01, RF02, ..., RF06, RF09, na ordem."""
    saida: list[str] = []
    for m in re.finditer(r"RF(\d+)(?: a RF(\d+))?", texto):
        ini = int(m.group(1))
        fim = int(m.group(2) or ini)
        for n in range(ini, fim + 1):
            cod = f"RF{n:02d}"
            if cod not in saida:
                saida.append(cod)
    return saida


@dataclass
class Fontes:
    destino: dict[str, dict] = field(default_factory=dict)  # RF -> valor, esforço, destino
    classe_rnf: dict[str, str] = field(default_factory=dict)  # RNF -> classe na 10.2.7
    matriz_rf: dict[str, dict] = field(default_factory=dict)  # RF -> gargalo, histórias, cobertura
    rnf_rfs: dict[str, dict] = field(default_factory=dict)  # RNF -> lista de RFs ou transversal


def ler_backlog(md: str) -> tuple[dict, dict]:
    destino, classe, secao = {}, {}, ""
    for linha in md.splitlines():
        if linha.startswith("### "):
            secao = linha[4:10]
            continue
        if secao == "10.2.4" and LINHA_1024.match(linha):
            c = celulas(linha)
            cod = LINHA_1024.match(linha).group(1)
            destino[cod] = {"valor": c[2], "esforco": c[3], "destino": c[4]}
        elif secao == "10.2.7" and linha.startswith("| ") and "RNF" in linha:
            c = celulas(linha)
            for cod in re.findall(r"\[(RNF\d+)\]", c[1]):
                classe[cod] = c[0]
    return destino, classe


def ler_matrizes(md: str) -> tuple[dict, dict]:
    matriz_rf, rnf_rfs = {}, {}
    for linha in md.splitlines():
        m = LINHA_841.match(linha)
        if m:
            c = celulas(linha)
            matriz_rf[m.group(1)] = {"gargalo": c[2], "historia": c[4], "cobertura": c[5]}
            continue
        m = LINHA_842.match(linha)
        if m:
            c = celulas(linha)
            transversal = c[3].startswith("*Transversal")
            rnf_rfs[m.group(1)] = {
                "origem": c[2],
                "texto": c[3],
                "transversal": transversal,
                "rfs": [] if transversal else faixa(c[3]),
            }
    return matriz_rf, rnf_rfs


def carregar(md_rf: str, md_backlog: str) -> Fontes:
    destino, classe = ler_backlog(md_backlog)
    matriz_rf, rnf_rfs = ler_matrizes(md_rf)
    for nome, dado in (("10.2.4", destino), ("10.2.7", classe), ("8.4.1", matriz_rf), ("8.4.2", rnf_rfs)):
        if not dado:
            raise PluginError(f"cartoes: a tabela da seção {nome} não foi encontrada; os cartões da seção 8 dependem dela.")
    return Fontes(destino, classe, matriz_rf, rnf_rfs)


def _e(texto: str) -> str:
    return html.escape(texto, quote=True)


def ligar_rfs(texto: str) -> str:
    """Torna clicável cada RFxx solto num texto (os já ligados ficam como estão)."""
    return CODIGO_RF.sub(lambda m: f"[RF{m.group(1)}](#rf{m.group(1)})", texto)


def chip_destino(info: dict | None) -> tuple[str, str]:
    if not info:
        return "sem-destino", '<span class="rq-chip">Sem destino na 10.2.4</span>'
    d = info["destino"]
    chave = "mvp" if d.startswith("MVP") else "fora"
    rotulo = d if chave == "mvp" else f"Fora do MVP · {d}"
    return chave, f'<span class="rq-chip rq-chip--{chave}">{_e(rotulo)}</span>'


def chip_classe(classe: str | None) -> tuple[str, str]:
    if not classe:
        return "sem-destino", '<span class="rq-chip">Sem classe na 10.2.7</span>'
    if classe.startswith("Evolutivos"):
        return "fora", '<span class="rq-chip rq-chip--fora">Fora do MVP · evolutivo</span>'
    if classe.startswith("Não aplicáveis"):
        return "fora", '<span class="rq-chip rq-chip--fora">Não aplicável</span>'
    rotulo = "MVP · todo o produto" if classe.startswith("Obrigatórios") else "MVP · com a história"
    return "mvp", f'<span class="rq-chip rq-chip--mvp">{rotulo}</span>'


def _situacao(resto: str) -> tuple[str, str]:
    m = re.search(r"<span class='selo selo--([\w-]+)'[^>]*>[^<]*</span>", resto)
    return (m.group(1), m.group(0)) if m else ("", "")


def item(rotulo: str, valor: str) -> str:
    return f'<div class="rq-item" markdown="span"><span class="rq-item__rotulo">{rotulo}</span><span class="rq-item__valor">{valor}</span></div>'


def cartao_rf(linha: str, fontes: Fontes) -> str:
    c = celulas(linha)
    m = ANCORA.match(c[0])
    if not m:
        raise PluginError(f"cartoes: linha de RF sem âncora: {linha[:80]}")
    ancora, cod = m.group(1), m.group(2)
    sit, selo = _situacao(m.group(3))
    nome, desc, rastro = c[1], c[2], c[3]
    origem, _, hus = rastro.partition("\\|")
    chave, destino = chip_destino(fontes.destino.get(cod))
    info = fontes.destino.get(cod)
    nota = f'<span class="rq-chip">Valor {_e(info["valor"])} · Esforço {_e(info["esforco"])}</span>' if info else ""
    matriz = fontes.matriz_rf.get(cod, {})
    historias = HU.findall(hus) or HU.findall(matriz.get("historia", ""))
    if not historias:
        raise PluginError(f"cartoes: {cod} sem história na seção 8.2 nem na matriz 8.4.1.")
    hist = " · ".join(f"[{h}](10-backlog.md#{h.lower()})" for h in historias)
    cas = re.search(r"\(([^)]*)\)", matriz.get("historia", ""))
    if cas:
        hist += f' <span class="rq-ca">{cas.group(1)}</span>'
    rnfs = [r for r, d in fontes.rnf_rfs.items() if cod in d["rfs"]]
    rnf_txt = ", ".join(f"[{r}](#{r.lower()})" for r in rnfs) or "Só os transversais"
    if rnfs:
        rnf_txt += " e os transversais"
    partes = [
        item("História", hist),
        item("Origem", origem.strip() or "—"),
        item("RNF", rnf_txt),
    ]
    if matriz.get("gargalo") and matriz["gargalo"] != "—":
        partes.append(item("Gargalo", matriz["gargalo"]))
    partes.append(item("Matriz", f"[ver na 8.4.1](#m-{ancora})"))
    return (
        f'<article class="rq-card rq-card--{chave}" id="{ancora}" data-destino="{chave}" data-situacao="{sit}" '
        f'data-historias="{" ".join(historias)}" markdown="1">\n'
        f'<div class="rq-card__topo" markdown="span">[{cod}](#{ancora}){destino}{nota}{selo}</div>\n'
        f'<p class="rq-card__nome" markdown="span">{nome}</p>\n'
        f'<p class="rq-card__desc" markdown="span">{desc}</p>\n'
        f'<div class="rq-card__rastro" markdown="1">\n' + "\n".join(partes) + "\n</div>\n</article>"
    )


def cartao_rnf(linha: str, fontes: Fontes) -> str:
    c = celulas(linha)
    m = ANCORA.match(c[0])
    if not m:
        raise PluginError(f"cartoes: linha de RNF sem âncora: {linha[:80]}")
    ancora, cod = m.group(1), m.group(2)
    nome, classif, desc, metrica = c[1], c[2], c[3], c[4]
    chave, destino = chip_classe(fontes.classe_rnf.get(cod))
    rel = fontes.rnf_rfs.get(cod)
    if not rel:
        raise PluginError(f"cartoes: {cod} não está na matriz 8.4.2.")
    rfs = "Todos os RFs (transversal)" if rel["transversal"] else rel["texto"]
    partes = [item("RFs", rfs), item("Métrica", metrica), item("Origem", rel["origem"]), item("Matriz", f"[ver na 8.4.2](#m-{ancora})")]
    return (
        f'<article class="rq-card rq-card--{chave}" id="{ancora}" data-destino="{chave}" markdown="1">\n'
        f'<div class="rq-card__topo" markdown="span">[{cod}](#{ancora}){destino}<span class="rq-chip">{_e(classif)}</span></div>\n'
        f'<p class="rq-card__nome" markdown="span">{nome}</p>\n'
        f'<p class="rq-card__desc" markdown="span">{desc}</p>\n'
        f'<div class="rq-card__rastro" markdown="1">\n' + "\n".join(partes) + "\n</div>\n</article>"
    )



# ---- Matriz de rastreabilidade (8.4) em trilhas ----

def chip_cobertura(texto: str) -> str:
    t = texto.strip("* ")
    classe = "" if t.startswith("Total") else " rq-chip--fora"
    return f'<span class="rq-chip{classe}">Cobertura {_e(t.lower())}</span>'


def chips_rf(texto: str) -> str:
    """"RF01 a RF06, RF09" vira um chip por requisito, cada um levando ao cartão."""
    if texto.strip("* ").startswith("Transversal"):
        nota = texto.strip("* ")
        return f'<span class="rq-chip rq-chip--mvp">Transversal</span> <span class="rt-nota">{_e(nota[len("Transversal"):].strip(" ()"))}</span>'
    return " ".join(f'<a class="rt-rf" href="#{c.lower()}">{c}</a>' for c in faixa(texto))


def col(rotulo: str, valor: str, extra: str = "") -> str:
    # Uma coluna por linha: o md_in_html só reconhece o bloco quando ele começa a linha.
    return f'<div class="rt-col{extra}" markdown="span"><span class="rt-rot">{rotulo}</span><span class="rt-val">{valor}</span></div>\n'


def cabeca(rotulos: list[str], tipo: str) -> str:
    return f'<div class="rt-linha rt-linha--cabeca rt--{tipo}" aria-hidden="true">' + "".join(f"<div>{r}</div>" for r in rotulos) + "</div>"


def trilha_rf(c: list[str], fontes: Fontes) -> str:
    cod = re.sub(r"\*", "", c[0])
    info = fontes.destino.get(cod)
    chave, destino = chip_destino(info)
    return (
        f'<div class="rt-linha rt--rf" id="m-{cod.lower()}" data-destino="{chave}" markdown="1">\n'
        + col("Gargalo", c[2] if c[2] != "—" else '<span class="rt-nota">sem gargalo</span>', " rt-col--g")
        + col("Requisito", f'[{cod}](#{cod.lower()}) {c[1]}', " rt-col--req")
        + col("História", c[4], " rt-col--hu")
        + col("Norma / mitigação", c[3] if c[3] != "—" else '<span class="rt-nota">—</span>')
        + col("Cobertura", chip_cobertura(c[5]) + destino, " rt-col--cob")
        + "\n</div>"
    )


def trilha_rnf(c: list[str], fontes: Fontes) -> str:
    cod = re.sub(r"\*", "", c[0])
    chave, destino = chip_classe(fontes.classe_rnf.get(cod))
    return (
        f'<div class="rt-linha rt--rnf" id="m-{cod.lower()}" data-destino="{chave}" markdown="1">\n'
        + col("Requisito", f'[{cod}](#{cod.lower()}) {c[1]}', " rt-col--req")
        + col("Origem", c[2])
        + col("RFs relacionados", chips_rf(c[3]), " rt-col--rfs")
        + col("No MVP", destino, " rt-col--cob")
        + "\n</div>"
    )


def trilha_gargalo(c: list[str]) -> str:
    g = c[0].strip("* ")
    return (
        f'<div class="rt-linha rt--g" markdown="1">\n'
        + col("Gargalo", f"{g} {c[1]}", " rt-col--req")
        + col("Requisitos", chips_rf(c[2]), " rt-col--rfs")
        + col("Situação", chip_cobertura(c[3]), " rt-col--cob")
        + "\n</div>"
    )


def trilha_cp(c: list[str]) -> str:
    cp = c[0].strip("* ")
    principal, _, sec = c[3].partition(";")
    oes = f'{principal.strip()} <span class="rt-nota">principal</span>'
    if sec.strip():
        oes += f' · {sec.strip()} <span class="rt-nota">secundário</span>'
    return (
        f'<div class="rt-linha rt--cp" markdown="1">\n'
        + col("Característica", f"{cp} {c[1]}", " rt-col--req")
        + col("Requisitos", chips_rf(c[2]), " rt-col--rfs")
        + col("Objetivos", oes)
        + "\n</div>"
    )


MATRIZES = {
    "| Requisito | Nome | Gargalo BPMN |": ("rf", ["Gargalo", "Requisito", "História e critérios", "Norma / mitigação", "Cobertura"]),
    "| RNF | Propriedade de Qualidade |": ("rnf", ["Requisito", "Origem", "RFs relacionados", "No MVP"]),
    "| Gargalo | Descrição do Gargalo": ("g", ["Gargalo", "Requisitos", "Situação"]),
    "| CP | Nome da Característica |": ("cp", ["Característica", "Requisitos", "Objetivos específicos"]),
}
CP_TITULO = re.compile(r"^#### (CP\d) — .*\(([^)]*)\)\s*$")


def matriz(cabecalho: str, linhas: list[str], fontes: Fontes) -> str | None:
    for chave, (tipo, rotulos) in MATRIZES.items():
        if cabecalho.startswith(chave):
            break
    else:
        return None
    feitas = []
    for linha in linhas:
        c = celulas(linha)
        feitas.append({"rf": lambda: trilha_rf(c, fontes), "rnf": lambda: trilha_rnf(c, fontes),
                       "g": lambda: trilha_gargalo(c), "cp": lambda: trilha_cp(c)}[tipo]())
    return "\n".join(["", f'<div class="rt-lista rt-lista--{tipo}" markdown="1">', cabeca(rotulos, tipo), *feitas, "</div>", ""])


def cabeca_cp(m: re.Match) -> str:
    principal, _, sec = m.group(2).partition(";")
    txt = f"Característica {m.group(1)} · objetivo principal {principal.strip()}"
    if sec.strip():
        txt += f" · secundários {sec.strip()}"
    return f'<p class="rt-cp" markdown="span">{txt}</p>'


FILTRO = (
    '<div class="rq-filtro" data-rq-filtro>'
    '<span class="rq-filtro__rotulo">Mostrar</span>'
    '<button type="button" data-rq="" aria-pressed="true">Todos</button>'
    '<button type="button" data-rq="mvp" aria-pressed="false">No MVP</button>'
    '<button type="button" data-rq="fora" aria-pressed="false">Fora do MVP</button>'
    '<label class="rq-filtro__busca">Buscar <input type="search" data-rq-busca placeholder="RF12, HU-07a, inscrição"></label>'
    '<span class="rq-filtro__status" data-rq-status aria-live="polite"></span>'
    "</div>\n"
)


def compor(md: str, fontes: Fontes, ligar=None) -> str:
    linhas = md.splitlines()
    saida: list[str] = []
    secao, i, feitos, trilhas = "", 0, 0, 0
    while i < len(linhas):
        linha = linhas[i]
        if linha.startswith("## "):
            secao = linha[3:6]
            saida.append(linha)
            if secao in ("8.2", "8.3"):
                saida += ["", FILTRO if secao == "8.2" else FILTRO.replace("RF12, HU-07a, inscrição", "RNF04, LGPD, desempenho")]
            i += 1
            continue
        if secao == "8.4" and CP_TITULO.match(linha):
            saida += [linha, "", cabeca_cp(CP_TITULO.match(linha))]
            i += 1
            continue
        if secao in ("8.2", "8.3") and linha.startswith("| Identificador |"):
            i += 2  # cabeçalho e separador
            cartoes = []
            while i < len(linhas) and linhas[i].startswith("|"):
                cartoes.append(cartao_rf(linhas[i], fontes) if secao == "8.2" else cartao_rnf(linhas[i], fontes))
                i += 1
            saida += ["", '<div class="rq-grid" markdown="1">', *cartoes, "</div>", ""]
            feitos += len(cartoes)
            continue
        if secao == "8.4" and linha.startswith("| ") and i + 1 < len(linhas) and linhas[i + 1].startswith("| :"):
            j = i + 2
            while j < len(linhas) and linhas[j].startswith("|"):
                j += 1
            bloco = matriz(linha, linhas[i + 2:j], fontes)
            if bloco is not None:
                saida.append(bloco)
                trilhas += j - i - 2
                i = j
                continue
        saida.append(linha)
        i += 1
    if not feitos:
        raise PluginError("cartoes: nenhuma tabela de requisitos encontrada nas seções 8.2 e 8.3.")
    if not trilhas:
        raise PluginError("cartoes: nenhuma tabela da matriz 8.4 reconhecida.")
    if ligar:
        saida = [l if l.startswith("#") else ligar(l) for l in "\n".join(saida).splitlines()]
    return "\n".join(saida)


def on_page_markdown(markdown, page, config, files, **kwargs):
    if page.file.src_uri != SECAO_RF:
        return markdown
    backlog = Path(config["docs_dir"], BACKLOG).read_text(encoding="utf-8")
    ind = ligacoes.indice(config["docs_dir"])
    return compor(markdown, carregar(markdown, backlog), lambda t: ind.ligar(t, SECAO_RF))
