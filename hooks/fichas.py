"""
Compõe a ficha de cada história da seção 10.1 a cada build do MkDocs.

A ficha reúne, sem sair da página, o que está registrado em outras seções. Só três campos
são escritos na própria ficha: Épico, Requisitos funcionais e Depende de. O resto vem da fonte:
  - nome, descrição, CP e OE do requisito: seção 8.2 e cabeçalhos da matriz 8.4.1;
  - RNF e regras de negócio: matrizes 8.4.2 e 8.7;
  - valor: seção 10.2.2; esforço: seção 10.2.3; destino: seção 10.2.4;
  - situação e issue: situacao-historias.json, lido do quadro do projeto;
  - evolução: os registros da página Histórico e evolução que citam a história ou seus requisitos.

Para mudar uma ficha, mude a fonte. Sem leitura do quadro, as fichas saem sem selos e sem issue.
"""
from __future__ import annotations

import html
import posixpath
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from mkdocs.exceptions import PluginError

import historico
import selos

SECAO_RF = "requisitos/8-requisitos.md"
SECAO_HU = "requisitos/10-backlog.md"
HISTORICO = "gestao/historico.md"

HU = r"HU-\d{2}[a-z]?"
SEPARA = re.compile(r"(?<!\\)\|")
TITULO = re.compile(rf'^(\?\?\?\+? note)((?: [\w-]+)*) "({HU}) · ([^"]*)"\s*$')
ANCORA_RF = re.compile(r'^\| <a id="rf(\d+)"></a>\*\*RF\d+\*\*')
ANCORA_RNF = re.compile(r'^\| <a id="rnf(\d+)"></a>\*\*RNF\d+\*\*')
ANCORA_RN = re.compile(r'^\| <a id="rn-(\d+)"></a>\*\*RN-\d+\*\*')
LINHA_RF = re.compile(r"^\| \*\*(RF\d+)\*\* \|")
LINHA_RNF = re.compile(r"^\| \*\*(RNF\d+)\*\* \|")
LINK_RF = re.compile(r"^\| \[(RF\d+)\]\(")
CP_SECAO = re.compile(r"^### (CP\d)\b")
CP_MATRIZ = re.compile(r"^#### (CP\d)\b[^(]*\(([^)]*)\)")
LINK_MD = re.compile(r"\[([^\]]+)\]\([^)]*\)")
CAMPO = re.compile(r"^\*\*(Épico|Requisitos funcionais|Depende de):\*\* (.*)$")
LIMITE_EVENTO = 160


def celulas(linha: str) -> list[str]:
    return [c.strip().replace("\\|", "|") for c in SEPARA.split(linha.strip())[1:-1]]


def para_ficha(texto: str) -> str:
    """Texto da seção 8 levado à ficha: o link interno de lá aponta para a seção 8 a partir daqui."""
    return texto.replace("](#", "](8-requisitos.md#")


def faixa(texto: str) -> set[str]:
    """Expande "RF01 a RF06, RF09" nos códigos que a expressão cobre."""
    saida: set[str] = set()
    for m in re.finditer(r"RF(\d+)(?: a RF(\d+))?", texto):
        fim = int(m.group(2) or m.group(1))
        saida.update(f"RF{n:02d}" for n in range(int(m.group(1)), fim + 1))
    return saida


def trecho(md: str, inicio: str, fim: str | None) -> str:
    """Parte de `md` entre os títulos que começam por `inicio` e `fim`."""
    achado = re.search(rf"^{re.escape(inicio)}", md, re.M)
    if not achado:
        raise PluginError(f"fichas: a seção '{inicio}' não foi encontrada.")
    resto = md[achado.start():]
    if fim:
        final = re.search(rf"^{re.escape(fim)}", resto, re.M)
        if not final:
            raise PluginError(f"fichas: a seção '{fim}' não foi encontrada.")
        resto = resto[: final.start()]
    return resto


@dataclass
class Requisito:
    nome: str
    descricao: str
    cp: str
    donas: list[str]


@dataclass
class Secao8:
    rfs: dict[str, Requisito] = field(default_factory=dict)
    cp_oe: dict[str, str] = field(default_factory=dict)
    verificacao: dict[str, list[tuple[str, str]]] = field(default_factory=dict)  # RF -> (história, critérios)
    rnf: dict[str, str] = field(default_factory=dict)
    rnf_rfs: dict[str, set[str]] = field(default_factory=dict)
    rn: dict[str, str] = field(default_factory=dict)
    rn_rfs: dict[str, set[str]] = field(default_factory=dict)


def ler_secao8(md: str) -> Secao8:
    s = Secao8()
    cp = ""
    for linha in trecho(md, "## 8.2", "## 8.3").splitlines():
        m = CP_SECAO.match(linha)
        if m:
            cp = m.group(1)
        m = ANCORA_RF.match(linha)
        if m:
            c = celulas(linha)
            s.rfs[f"RF{m.group(1)}"] = Requisito(c[1], para_ficha(c[2]), cp, re.findall(HU, c[-1]))
    for linha in trecho(md, "## 8.3", "## 8.4").splitlines():
        m = ANCORA_RNF.match(linha)
        if m:
            s.rnf[f"RNF{m.group(1)}"] = celulas(linha)[1]
    for linha in trecho(md, "### 8.4.1", "### 8.4.2").splitlines():
        m = CP_MATRIZ.match(linha)
        if m:
            s.cp_oe[m.group(1)] = m.group(2)
        m = LINHA_RF.match(linha)
        if m:
            s.verificacao[m.group(1)] = [
                (h, ca.strip(" ()")) for h, ca in re.findall(rf"({HU})\s*(\([^)]*\))?", celulas(linha)[4])
            ]
    for linha in trecho(md, "### 8.4.2", "### 8.4.3").splitlines():
        m = LINHA_RNF.match(linha)
        if m:
            coluna = celulas(linha)[3]
            # RNF transversal vale para o produto inteiro e não se repete em cada história.
            s.rnf_rfs[m.group(1)] = set() if "Transversal" in coluna else faixa(coluna)
    for linha in trecho(md, "## 8.7", None).splitlines():
        m = ANCORA_RN.match(linha)
        if m:
            c = celulas(linha)
            s.rn[f"RN-{m.group(1)}"] = para_ficha(c[1])
            s.rn_rfs[f"RN-{m.group(1)}"] = faixa(c[3])
    return s


@dataclass
class Priorizacao:
    valor: dict[str, tuple[str, str]] = field(default_factory=dict)  # história -> (valor, critério)
    origem: dict[str, str] = field(default_factory=dict)  # história derivada -> história validada
    esforco: dict[str, str] = field(default_factory=dict)  # RF -> esforço técnico
    destino: dict[str, str] = field(default_factory=dict)  # RF -> destino


def ler_priorizacao(md: str) -> Priorizacao:
    p = Priorizacao()
    for linha in trecho(md, "### 10.2.2", "### 10.2.3").splitlines():
        if not linha.startswith("|") or ":--" in linha or "História validada" in linha:
            continue
        c = celulas(linha)
        for h in re.findall(HU, c[1]):
            p.valor[h] = (c[2], c[3])
            if re.fullmatch(HU, c[0]):
                p.origem[h] = c[0]
    for linha in trecho(md, "### 10.2.3", "### 10.2.4").splitlines():
        m = LINK_RF.match(linha)
        if m:
            p.esforco[m.group(1)] = celulas(linha)[-1].replace("*", "")
    for linha in trecho(md, "### 10.2.4", "### 10.2.5").splitlines():
        m = LINK_RF.match(linha)
        if m:
            p.destino[m.group(1)] = celulas(linha)[4]
    return p


@dataclass
class Ficha:
    hu: str
    titulo: str  # linha do título, já com o selo
    classes: str
    historia: list[str]
    corpo: list[str]
    epico: str
    rfs: list[str]
    depende: str
    inicio: int
    fim: int


def ler_fichas(linhas: list[str]) -> list[Ficha]:
    fichas: list[Ficha] = []
    i = 0
    while i < len(linhas):
        m = TITULO.match(linhas[i])
        if not m:
            i += 1
            continue
        fim = i + 1
        while fim < len(linhas) and (linhas[fim].startswith("    ") or not linhas[fim].strip()):
            fim += 1
        while not linhas[fim - 1].strip():
            fim -= 1
        campos: dict[str, str] = {}
        historia: list[str] = []
        corpo: list[str] = []
        for bruta in linhas[i + 1 : fim]:
            c = CAMPO.match(bruta[4:])
            if c:
                campos[c.group(1)] = c.group(2).strip()
            elif campos or bruta.strip().startswith("**Critérios"):
                corpo.append(bruta[4:])
            else:
                historia.append(bruta[4:])
        faltam = {"Épico", "Requisitos funcionais", "Depende de"} - set(campos)
        if faltam:
            raise PluginError(f"fichas: a ficha da {m.group(3)} está sem {', '.join(sorted(faltam))}.")
        fichas.append(
            Ficha(
                hu=m.group(3),
                titulo=m.group(4),
                classes=m.group(2),
                historia=_aparar(historia),
                corpo=_aparar(corpo),
                epico=campos["Épico"],
                rfs=re.findall(r"RF\d+", campos["Requisitos funcionais"]),
                depende=campos["Depende de"],
                inicio=i,
                fim=fim,
            )
        )
        i = fim
    return fichas


def _aparar(linhas: list[str]) -> list[str]:
    while linhas and not linhas[0].strip():
        linhas = linhas[1:]
    while linhas and not linhas[-1].strip():
        linhas = linhas[:-1]
    return linhas


def destino_da_ficha(f: Ficha, p: Priorizacao) -> str:
    destinos = {p.destino[r] for r in f.rfs if r in p.destino}
    if len(destinos) != 1:
        raise PluginError(f"fichas: a {f.hu} precisa de um só destino na seção 10.2.4; achados: {sorted(destinos)}.")
    return destinos.pop()


def slug_destino(destino: str) -> str:
    return "destino-" + historico.slug(destino.replace("🔧", ""))


def ref_hu(hu: str, dados: dict | None) -> str:
    h = (dados or {}).get("historias", {}).get(hu)
    selo = f" {selos._selo(h['situacao'], 'f')}" if h else ""
    return f"[{hu}](#{hu.lower()}){selo}"


def indice_eventos(eventos: list) -> dict[str, list]:
    por_codigo: dict[str, list] = {}
    for e in eventos:
        for c in e.codigos:
            por_codigo.setdefault(c, []).append(e)
    return por_codigo


def _evento(e, existe: Callable[[str], bool]) -> str:
    titulo = e.titulo
    if e.origem and existe(e.origem):
        titulo = f"[{e.titulo}]({posixpath.relpath(e.origem, posixpath.dirname(SECAO_HU))})"
    texto = LINK_MD.sub(r"\1", e.descricao or "")
    if len(texto) > LIMITE_EVENTO:
        texto = texto[:LIMITE_EVENTO].rsplit(" ", 1)[0] + "…"
    return f"- {e.quando:%d/%m/%Y} · {titulo}" + (f": {texto}" if texto else "")


def compor(f: Ficha, fichas: list[Ficha], s: Secao8, p: Priorizacao, dados: dict | None,
           por_codigo: dict[str, list], existe: Callable[[str], bool], repo: str) -> list[str]:
    destino = destino_da_ficha(f, p)
    classes = f"{f.classes} ficha {slug_destino(destino)} epico-{historico.slug(f.epico)}"
    chip = f"<span class='destino'>{html.escape(destino)}</span>"
    saida = [f'??? note{classes} "{f.hu} · {f.titulo} {chip}"']
    corpo: list[str] = [*f.historia, ""]

    valor, criterio = p.valor.get(f.hu, ("—", "—"))
    cps = sorted({s.rfs[r].cp for r in f.rfs if r in s.rfs})
    prerequisito = [o.hu for o in fichas if o.hu != f.hu and f.hu in re.findall(HU, o.depende)]
    verifica = [
        f"[{r}](8-requisitos.md#{r.lower()}) ({ca})" if ca else f"[{r}](8-requisitos.md#{r.lower()})"
        for r, lista in s.verificacao.items() if r not in f.rfs
        for h, ca in lista if h == f.hu
    ]
    issue = (dados or {}).get("historias", {}).get(f.hu, {}).get("issue")
    vinculos = [
        ("Épico", f.epico),
        ("Destino", f"[{destino}](#1026-mvp-e-incrementos)"),
        ("Valor", f"[{valor}](#1022-avaliacao-de-negocio-com-o-instituto) · {criterio}"),
        ("Característica", "; ".join(f"[{c}](8-requisitos.md#841-matriz-de-rastreabilidade-dos-requisitos-funcionais-rfs) "
                                     f"({s.cp_oe.get(c, '—')})" for c in cps)),
        ("Depende de", re.sub(HU, lambda m: ref_hu(m.group(0), dados), f.depende)),
        ("É pré-requisito de", " ".join(ref_hu(h, dados) for h in prerequisito) or "—"),
    ]
    if verifica:
        vinculos.append(("Também verifica", ", ".join(verifica)))
    if issue:
        vinculos.append(("Issue", f"[#{issue}]({repo.rstrip('/')}/issues/{issue})"))
    corpo += ["| Vínculo | Item |", "| :--- | :--- |"]
    corpo += [f"| {a} | {b.replace('|', chr(92) + '|')} |" for a, b in vinculos]
    corpo += ["", "**Requisitos funcionais**", ""]
    for r in f.rfs:
        q = s.rfs.get(r)
        if not q:
            raise PluginError(f"fichas: {r}, da ficha da {f.hu}, não está na seção 8.2.")
        selo = ""
        if dados:
            sit = selos.situacao_do_rf(q.donas, dados)
            selo = f" {selos._selo(sit, 'm')}" if sit else ""
        outras = [ref_hu(h, dados) + (f" ({ca})" if ca else "") for h, ca in s.verificacao.get(r, []) if h != f.hu]
        tambem = f"<br>Também verificado em {', '.join(outras)}." if outras else ""
        corpo.append(f"- [{r}](8-requisitos.md#{r.lower()}) **{q.nome}** · esforço {p.esforco.get(r, '—')}{selo}"
                     f"<br>{q.descricao}{tambem}")
    corpo += ["", *f.corpo]

    rnfs = [c for c, v in s.rnf_rfs.items() if v & set(f.rfs)]
    rns = [c for c, v in s.rn_rfs.items() if v & set(f.rfs)]
    if rnfs or rns:
        corpo += ["", f'??? abstract "Requisitos não funcionais e regras de negócio ({len(rnfs) + len(rns)})"', ""]
        for c in rnfs:
            corpo.append(f"    - [{c}](8-requisitos.md#{c.lower()}) {s.rnf.get(c, '')}")
        for c in rns:
            corpo.append(f"    - [{c}](8-requisitos.md#{c.lower()}) {s.rn.get(c, '')}")

    codigos = [f.hu, *f.rfs]
    if f.hu in p.origem:
        codigos.append(p.origem[f.hu])
    vistos, eventos = set(), []
    for c in codigos:
        for e in por_codigo.get(c, []):
            if id(e) not in vistos:
                vistos.add(id(e))
                eventos.append(e)
    eventos.sort(key=lambda e: e.quando, reverse=True)
    if eventos:
        corpo += ["", f'??? abstract "Evolução ({len(eventos)})"', ""]
        corpo += ["    " + _evento(e, existe) for e in eventos]
        alvo = posixpath.relpath(HISTORICO, posixpath.dirname(SECAO_HU))
        filtro = f"#{f.hu.lower()}" if f.hu in por_codigo else ""
        corpo += ["", f"    [Ver no Histórico e evolução]({alvo}{filtro})"]
    return saida + [f"    {c}" if c else "" for c in corpo]


def _opcoes(valores: list[tuple[str, str]]) -> str:
    return "".join(f'<option value="{html.escape(v)}">{html.escape(r)}</option>' for v, r in valores)


def filtros(fichas: list[Ficha], p: Priorizacao) -> str:
    destinos, epicos = {}, {}
    for f in fichas:
        d = destino_da_ficha(f, p).replace("🔧", "").strip()
        destinos[slug_destino(d)] = d
        epicos[f"epico-{historico.slug(f.epico)}"] = f.epico
    return (
        f'<label>Destino <select data-ficha-filtro><option value="">Todos</option>{_opcoes(list(destinos.items()))}'
        f'</select></label><label>Épico <select data-ficha-filtro><option value="">Todos</option>'
        f"{_opcoes(list(epicos.items()))}</select></label>"
    )


def compor_pagina(md: str, secao8: str, dados: dict | None, eventos: list,
                  existe: Callable[[str], bool], repo: str) -> str:
    s = ler_secao8(secao8)
    p = ler_priorizacao(md)
    linhas = md.splitlines()
    fichas = ler_fichas(linhas)
    if not fichas:
        raise PluginError("fichas: nenhuma ficha de história encontrada na seção 10.1.")
    por_codigo = indice_eventos(eventos)
    saida: list[str] = []
    pos = 0
    for f in fichas:
        saida += linhas[pos : f.inicio]
        saida += compor(f, fichas, s, p, dados, por_codigo, existe, repo)
        pos = f.fim
    saida += linhas[pos:]
    texto = "\n".join(saida)

    barra = filtros(fichas, p)
    status = '<span class="selos-legenda__status" data-selo-status'
    if status in texto:
        return texto.replace(status, barra + status, 1)
    bloco = f'<div class="selos-legenda" markdown="0">{barra}{status} aria-live="polite"></span></div>\n\n'
    return re.sub(r'^(<a id="hu-)', lambda m: bloco + m.group(1), texto, count=1, flags=re.M)


def on_page_markdown(markdown, page, config, files, **kwargs):
    if page.file.src_uri != SECAO_HU:
        return markdown
    docs = Path(config["docs_dir"])
    raiz = Path(config["config_file_path"]).parent

    def existe(caminho: str) -> bool:
        f = files.get_file_from_path(caminho)
        return bool(f and f.inclusion.is_included())

    secao8 = (docs / SECAO_RF).read_text(encoding="utf-8")
    eventos, _ = historico.coletar(docs)
    return compor_pagina(markdown, secao8, selos.ler_situacao(raiz), eventos, existe, config["repo_url"])
