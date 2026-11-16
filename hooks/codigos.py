"""
Índice dos códigos e árvore de rastreabilidade, compostos a cada build do MkDocs.

Índice (assets/codigos.json). Para cada código que tem definição própria na documentação,
grava o tipo, o título, um resumo curto e o endereço da definição; o
assets/javascripts/codigos.js usa o índice para abrir a janela do código sem sair da página.
O texto vem só da definição, nunca de uma cópia:
  OExx  → seção 2.2 (título e texto do objetivo; o elemento do problema, no parágrafo final);
  CPx   → tabela da seção 2.3;
  RFxx  → tabelas da seção 8.2 (a característica vem do título da tabela);
  RNFxx → tabelas da seção 8.3;
  RN-xx → tabela da seção 8.7;
  HU-xx → fichas da seção 10.1 (título e história); destino pela tabela da seção 10.2.6;
  G0x   → tabela de gargalos do anexo B1.

Árvore (seção 8.4, no marcador <!-- arvore-rastreabilidade -->). Problema → objetivo →
característica → história, com os requisitos não funcionais de cada história e os
transversais num trilho único. Fontes: resumo da seção 1.4 (problema), seção 2.2 (objetivos),
títulos da matriz 8.4.1 (objetivos de cada característica), seção 8.2 (característica de cada
requisito funcional), fichas da 10.1 (requisitos de cada história), coluna de requisitos
funcionais da matriz 8.4.2 (requisitos não funcionais) e tabela da 10.2.6 (MVP ou incremento).

Se uma fonte mudar de forma, o build falha com a lista do que não foi lido, em vez de publicar
índice ou árvore incompletos.
"""
from __future__ import annotations

import html
import json
import posixpath
import re
from dataclasses import dataclass, field
from pathlib import Path

from mkdocs.exceptions import PluginError

import fichas
import ligacoes

VISAO1 = "visao/1-cenario-atual.md"
VISAO2 = "visao/2-solucao-proposta.md"
SECAO8 = "requisitos/8-requisitos.md"
BACKLOG = "requisitos/10-backlog.md"
B1 = "requisitos/b1-bpmn-processo-atual.md"
SAIDA = "assets/codigos.json"
MARCADOR = "<!-- arvore-rastreabilidade -->"
LIMITE = 320

ROTULO = {
    "oe": "Objetivo específico",
    "cp": "Característica de produto",
    "rf": "Requisito funcional",
    "rnf": "Requisito não funcional",
    "rn": "Regra de negócio",
    "hu": "História de usuário",
    "g": "Gargalo do processo atual",
}

SEPARA = re.compile(r"(?<!\\)\|")
LINK_MD = re.compile(r"\[([^\]]+)\]\([^)]*\)")
TAG = re.compile(r"<[^>]+>")
OE_LINHA = re.compile(r'^<a id="oe(\d+)"></a>\*\*OE(\d+) - (.+?)\*\* - (.+)$')
CP_LINHA = re.compile(r'^\| <span id="cp(\d)">CP\d</span> \|')
RF_LINHA = re.compile(r'^\| <a id="rf(\d+)"></a>\*\*RF\d+\*\*')
RNF_LINHA = re.compile(r'^\| <a id="rnf(\d+)"></a>\*\*RNF\d+\*\*')
RN_LINHA = re.compile(r'^\| <a id="rn-(\d+)"></a>\*\*RN-\d+\*\*')
G_LINHA = re.compile(r"^\| \*\*(G0\d): (.+?)\*\* \|")
G_SOLTO = re.compile(r"^\|\s*(?:<a [^>]*></a>)?\s*\*\*(G\d+)\b", re.M)
HU_SOLTO = re.compile(r'^\?\?\?.*"(HU-\d{2}[a-z]?) ·', re.M)
CP_SECAO = re.compile(r"^### (CP\d)\b")
CP_MATRIZ = re.compile(r"^#### (CP\d) — .*\(([^)]*)\)\s*$")
HU = re.compile(r"HU-\d{2}[a-z]?")
OE = re.compile(r"OE\d{2}")
PROBLEMA = re.compile(r"^(?:E )?(.+?) é endereçad[ao] pel[oa] \[(OE\d{2})\]")


def celulas(linha: str) -> list[str]:
    return [c.strip().replace("\\|", "|") for c in SEPARA.split(linha.strip())[1:-1]]


def texto_puro(md: str) -> str:
    """Texto de Markdown sem links, ênfase nem HTML, numa linha só."""
    t = LINK_MD.sub(r"\1", md)
    t = TAG.sub("", t)
    t = t.replace("**", "").replace("`", "").replace("\\|", "|")
    t = re.sub(r"(?<![\w*])\*([^*]+)\*(?![\w*])", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()


def resumir(texto: str, limite: int = LIMITE) -> str:
    if len(texto) <= limite:
        return texto
    corte = texto[:limite].rsplit(" ", 1)[0].rstrip(",;:—-– ")
    return corte + "…"


def trecho(md: str, inicio: str, fim: str | None, fonte: str) -> str:
    try:
        return fichas.trecho(md, inicio, fim)
    except PluginError as erro:
        raise PluginError(f"codigos: {fonte}: {erro}") from None


def tabelas(md: str) -> list[tuple[list[str], list[str]]]:
    """Tabelas de um trecho: (cabeçalho, linhas), na ordem."""
    saida, linhas = [], md.splitlines()
    i = 0
    while i < len(linhas):
        if linhas[i].startswith("|") and i + 1 < len(linhas) and re.match(r"^\|\s*:?-", linhas[i + 1]):
            j = i + 2
            while j < len(linhas) and linhas[j].startswith("|"):
                j += 1
            saida.append((celulas(linhas[i]), linhas[i + 2 : j]))
            i = j
            continue
        i += 1
    return saida


def coluna(cabecalho: list[str], nome: str, onde: str) -> int:
    for i, c in enumerate(cabecalho):
        if nome.lower() in c.lower():
            return i
    raise PluginError(f"codigos: a coluna '{nome}' não foi encontrada na tabela da {onde}; cabeçalho lido: {cabecalho}.")


@dataclass
class Codigo:
    codigo: str
    tipo: str
    titulo: str
    resumo: str
    fonte: str
    ancora: str
    detalhes: list[tuple[str, str]] = field(default_factory=list)
    destino: str = ""

    def json(self, url: str) -> dict:
        d = {"tipo": self.tipo, "rotulo": ROTULO[self.tipo], "titulo": self.titulo, "resumo": self.resumo, "url": url}
        if self.detalhes:
            d["detalhes"] = [list(x) for x in self.detalhes]
        if self.destino:
            d["destino"] = self.destino
            d["mvp"] = self.destino.startswith("MVP")
        return d


@dataclass
class Fontes:
    codigos: dict[str, Codigo] = field(default_factory=dict)
    problema: str = ""
    problema_oe: dict[str, str] = field(default_factory=dict)
    cp_oe: dict[str, tuple[str, list[str]]] = field(default_factory=dict)  # CP -> (principal, secundários)
    rf_cp: dict[str, str] = field(default_factory=dict)
    hu_rfs: dict[str, list[str]] = field(default_factory=dict)
    rnf_rfs: dict[str, set[str]] = field(default_factory=dict)
    transversais: list[str] = field(default_factory=list)

    def do_tipo(self, tipo: str) -> list[Codigo]:
        return [c for c in self.codigos.values() if c.tipo == tipo]


def _conferir(tipo: str, lidos, soltos, onde: str) -> None:
    lidos, soltos = set(lidos), set(soltos)
    if not lidos:
        raise PluginError(f"codigos: nenhum {ROTULO[tipo].lower()} lido na {onde}.")
    faltam = soltos - lidos
    if faltam:
        raise PluginError(
            f"codigos: {', '.join(sorted(faltam))} aparece(m) na {onde}, mas fora do formato esperado; "
            "o índice dos códigos não é publicado incompleto."
        )


def _numero(cod: str) -> tuple:
    m = re.match(r"([A-Z-]+?)-?(\d+)([a-z]?)$", cod)
    return (m.group(1), int(m.group(2)), m.group(3)) if m else (cod, 0, "")


# ---- Leitura das definições ----

def ler_visao2(md: str, f: Fontes) -> None:
    t = trecho(md, "## 2.2", "## 2.3", "seção 2.2")
    for linha in t.splitlines():
        m = OE_LINHA.match(linha)
        if m:
            cod = f"OE{m.group(2)}"
            f.codigos[cod] = Codigo(cod, "oe", texto_puro(m.group(3)), resumir(texto_puro(m.group(4))), VISAO2, f"oe{m.group(1)}")
        if "endereçad" in linha:
            for frase in re.split(r"(?<=\.)\s+", linha):
                p = PROBLEMA.match(frase)
                if p:
                    texto = texto_puro(p.group(1))
                    f.problema_oe[p.group(2)] = texto[:1].upper() + texto[1:]
    _conferir("oe", [c.codigo for c in f.do_tipo("oe")], [f"OE{n}" for n in re.findall(r'id="oe(\d+)"', t)], "seção 2.2")
    sem = sorted(c.codigo for c in f.do_tipo("oe") if c.codigo not in f.problema_oe)
    if sem:
        raise PluginError(f"codigos: a seção 2.2 não diz a que elemento do problema responde(m) {', '.join(sem)}.")
    for c in f.do_tipo("oe"):
        c.detalhes.append(("Responde a", f.problema_oe[c.codigo]))

    t = trecho(md, "## 2.3", "## 2.4", "seção 2.3")
    for cab, linhas in tabelas(t):
        if not cab or cab[0] != "CP":
            continue
        i_nome, i_desc = coluna(cab, "Característica", "seção 2.3"), coluna(cab, "Descrição", "seção 2.3")
        i_pri, i_sec = coluna(cab, "atendido", "seção 2.3"), coluna(cab, "secundário", "seção 2.3")
        for linha in linhas:
            m = CP_LINHA.match(linha)
            if not m:
                continue
            c = celulas(linha)
            cod = f"CP{m.group(1)}"
            pri, sec = OE.findall(c[i_pri]), OE.findall(c[i_sec])
            oes = "; ".join(x for x in [", ".join(pri) + " (principal)" if pri else "", ", ".join(sec) + " (secundário)" if sec else ""] if x)
            f.codigos[cod] = Codigo(cod, "cp", texto_puro(c[i_nome]), resumir(texto_puro(c[i_desc])), VISAO2, f"cp{m.group(1)}",
                                    [("Objetivos", oes)] if oes else [])
    _conferir("cp", [c.codigo for c in f.do_tipo("cp")], [f"CP{n}" for n in re.findall(r'id="cp(\d)"', t)], "seção 2.3")


def ler_secao8(md: str, f: Fontes) -> None:
    t = trecho(md, "## 8.2", "## 8.3", "seção 8.2")
    cp = ""
    for linha in t.splitlines():
        m = CP_SECAO.match(linha)
        if m:
            cp = m.group(1)
        m = RF_LINHA.match(linha)
        if m:
            c = celulas(linha)
            cod = f"RF{m.group(1)}"
            if not cp:
                raise PluginError(f"codigos: {cod} está fora de uma característica (### CPn) na seção 8.2.")
            f.rf_cp[cod] = cp
            f.codigos[cod] = Codigo(cod, "rf", texto_puro(c[1]), resumir(texto_puro(c[2])), SECAO8, f"rf{m.group(1)}")
    _conferir("rf", [c.codigo for c in f.do_tipo("rf")], [f"RF{n}" for n in re.findall(r'id="rf(\d+)"', t)], "seção 8.2")

    t = trecho(md, "## 8.3", "## 8.4", "seção 8.3")
    for cab, linhas in tabelas(t):
        if not cab or cab[0] != "Identificador":
            continue
        i_nome, i_desc = coluna(cab, "Requisito", "seção 8.3"), coluna(cab, "Descrição", "seção 8.3")
        i_class = coluna(cab, "Classificação", "seção 8.3")
        for linha in linhas:
            m = RNF_LINHA.match(linha)
            if m:
                c = celulas(linha)
                cod = f"RNF{m.group(1)}"
                f.codigos[cod] = Codigo(cod, "rnf", texto_puro(c[i_nome]), resumir(texto_puro(c[i_desc])), SECAO8,
                                        f"rnf{m.group(1)}", [("Classificação", texto_puro(c[i_class]))])
    _conferir("rnf", [c.codigo for c in f.do_tipo("rnf")], [f"RNF{n}" for n in re.findall(r'id="rnf(\d+)"', t)], "seção 8.3")

    t = trecho(md, "## 8.7", None, "seção 8.7")
    for cab, linhas in tabelas(t):
        i_regra, i_req = coluna(cab, "Regra", "seção 8.7"), coluna(cab, "Requisitos", "seção 8.7")
        for linha in linhas:
            m = RN_LINHA.match(linha)
            if m:
                c = celulas(linha)
                cod = f"RN-{m.group(1)}"
                f.codigos[cod] = Codigo(cod, "rn", "", resumir(texto_puro(c[i_regra])), SECAO8, f"rn-{m.group(1)}",
                                        [("Requisitos", texto_puro(c[i_req]))])
    _conferir("rn", [c.codigo for c in f.do_tipo("rn")], [f"RN-{n}" for n in re.findall(r'id="rn-(\d+)"', t)], "seção 8.7")

    t = trecho(md, "### 8.4.1", "### 8.4.2", "matriz 8.4.1")
    for linha in t.splitlines():
        m = CP_MATRIZ.match(linha)
        if m:
            pri, _, sec = m.group(2).partition(";")
            if not OE.fullmatch(pri.strip()):
                raise PluginError(f"codigos: o título da {m.group(1)} na matriz 8.4.1 não começa pelo objetivo principal: '{m.group(2)}'.")
            f.cp_oe[m.group(1)] = (pri.strip(), OE.findall(sec))
    soltos = set(re.findall(r"^#### (CP\d)\b", t, re.M))
    if not f.cp_oe or soltos - set(f.cp_oe):
        raise PluginError("codigos: os títulos '#### CPn — Nome (OE principal; secundários)' da matriz 8.4.1 não foram lidos: "
                          f"{', '.join(sorted(soltos - set(f.cp_oe))) or 'nenhum título'}.")

    t = trecho(md, "### 8.4.2", "### 8.4.3", "matriz 8.4.2")
    for cab, linhas in tabelas(t):
        if not cab or cab[0] != "RNF":
            continue
        i_rfs = coluna(cab, "Requisitos Funcionais", "matriz 8.4.2")
        for linha in linhas:
            c = celulas(linha)
            m = re.fullmatch(r"\*\*(RNF\d+)\*\*", c[0])
            if not m:
                continue
            if "Transversal" in c[i_rfs]:
                f.transversais.append(m.group(1))
                f.rnf_rfs[m.group(1)] = set()
            else:
                f.rnf_rfs[m.group(1)] = set(fichas.faixa(c[i_rfs]))
    _conferir("rnf", f.rnf_rfs, re.findall(r"^\| \*\*(RNF\d+)\*\*", t, re.M), "matriz 8.4.2")


def ler_backlog(md: str, f: Fontes) -> None:
    lista = fichas.ler_fichas(md.splitlines())
    for ficha in lista:
        historia = texto_puro(" ".join(ficha.historia))
        f.hu_rfs[ficha.hu] = ficha.rfs
        f.codigos[ficha.hu] = Codigo(ficha.hu, "hu", texto_puro(ficha.titulo), resumir(historia), BACKLOG, ficha.hu.lower())
    _conferir("hu", f.hu_rfs, HU_SOLTO.findall(md), "seção 10.1")

    destino: dict[str, str] = {}
    for cab, linhas in tabelas(trecho(md, "### 10.2.6", "### 10.2.7", "seção 10.2.6")):
        if not cab or cab[0] != "Incremento":
            continue
        i_hu = coluna(cab, "histórias", "seção 10.2.6")
        for linha in linhas:
            c = celulas(linha)
            for h in HU.findall(c[i_hu]):
                if h in destino:
                    raise PluginError(f"codigos: a {h} aparece em mais de um incremento na seção 10.2.6.")
                destino[h] = texto_puro(c[0]).replace("🔧", "").strip()
    sem = sorted(set(f.hu_rfs) - set(destino), key=_numero)
    if sem:
        raise PluginError(f"codigos: {', '.join(sem)} sem incremento na tabela da seção 10.2.6.")
    for h, rfs in f.hu_rfs.items():
        c = f.codigos[h]
        c.destino = destino[h]
        c.detalhes = [("Destino", destino[h]), ("Requisitos funcionais", ", ".join(rfs))]
    for h, rfs in f.hu_rfs.items():
        for r in rfs:
            if r in f.codigos:
                cp = f.rf_cp.get(r, "")
                nome = f.codigos[cp].titulo if cp in f.codigos else ""
                f.codigos[r].detalhes = [("Característica", f"{cp} · {nome}" if nome else cp or "—"), ("História", h)]


def ler_b1(md: str, f: Fontes) -> None:
    t = trecho(md, "## 4.", None, "anexo B1")
    for cab, linhas in tabelas(t):
        i_imp = coluna(cab, "Impacto", "anexo B1")
        for linha in linhas:
            m = G_LINHA.match(linha)
            if m:
                c = celulas(linha)
                f.codigos[m.group(1)] = Codigo(m.group(1), "g", texto_puro(m.group(2)), resumir(texto_puro(c[i_imp])), B1, m.group(1).lower())
    _conferir("g", [c.codigo for c in f.do_tipo("g")], G_SOLTO.findall(t), "seção 4 do anexo B1")


def ler_problema(md: str) -> str:
    for linha in trecho(md, "## 1.4", None, "seção 1.4").splitlines():
        if linha.startswith("**Em resumo.**"):
            return texto_puro(linha[len("**Em resumo.**"):])
    raise PluginError("codigos: a seção 1.4 não tem o parágrafo '**Em resumo.**', que dá o texto do problema na árvore da 8.4.")


def ler_fontes(docs: Path) -> Fontes:
    def ler(rel: str) -> str:
        return (docs / rel).read_text(encoding="utf-8")

    f = Fontes()
    ler_visao2(ler(VISAO2), f)
    ler_secao8(ler(SECAO8), f)
    ler_backlog(ler(BACKLOG), f)
    ler_b1(ler(B1), f)
    f.problema = ler_problema(ler(VISAO1))

    # Cada código do índice precisa ser o destino que hooks/ligacoes.py dá ao código.
    ind = ligacoes.Indice(docs)
    errados = [c.codigo for c in f.codigos.values() if ind.destino(c.codigo) != (c.fonte, c.ancora)]
    if errados:
        raise PluginError(f"codigos: sem âncora na definição: {', '.join(sorted(errados, key=_numero))}.")
    sem_rf = sorted({r for rfs in f.hu_rfs.values() for r in rfs} - set(f.rf_cp))
    if sem_rf:
        raise PluginError(f"codigos: {', '.join(sem_rf)}, citado(s) nas fichas, não está(ão) na seção 8.2.")
    for cp, (pri, sec) in f.cp_oe.items():
        if cp not in f.codigos:
            raise PluginError(f"codigos: a {cp} da matriz 8.4.1 não está na seção 2.3.")
        fora = [o for o in [pri, *sec] if o not in f.codigos]
        if fora:
            raise PluginError(f"codigos: {', '.join(fora)}, da {cp} na matriz 8.4.1, não está(ão) na seção 2.2.")
    if not f.transversais:
        raise PluginError("codigos: nenhum requisito não funcional transversal na matriz 8.4.2.")
    return f


# ---- Endereços ----

def url_da_pagina(src: str, files=None) -> str:
    arq = files.get_file_from_path(src) if files is not None else None
    if arq is not None:
        return arq.url
    return src[: -len(".md")] + "/"


def urls(f: Fontes, files=None) -> dict[str, str]:
    paginas = {c.fonte for c in f.codigos.values()}
    base = {p: url_da_pagina(p, files) for p in paginas}
    return {cod: f"{base[c.fonte]}#{c.ancora}" for cod, c in f.codigos.items()}


def href(destino: str, pagina: str) -> str:
    """Endereço relativo, a partir da página `pagina`, de `destino` (ambos a partir da raiz do site)."""
    caminho, _, frag = destino.partition("#")
    if caminho == pagina:
        return f"#{frag}"
    pasta = pagina[:-1] if pagina.endswith("/") else posixpath.dirname(pagina)
    rel = posixpath.relpath(caminho.rstrip("/") or ".", pasta or ".")
    if caminho.endswith("/") or not caminho:
        rel += "/"
    return rel + (f"#{frag}" if frag else "")


def indice_json(f: Fontes, enderecos: dict[str, str]) -> str:
    ordem = sorted(f.codigos, key=lambda c: (list(ROTULO).index(f.codigos[c].tipo), _numero(c)))
    dados = {"codigos": {c: f.codigos[c].json(enderecos[c]) for c in ordem}}
    return json.dumps(dados, ensure_ascii=False, separators=(",", ":"))


# ---- Árvore da seção 8.4 ----

def _e(texto: str) -> str:
    return html.escape(texto, quote=True)


def arvore(f: Fontes, enderecos: dict[str, str], pagina: str, problema_href: str) -> str:
    def h(cod: str) -> str:
        return _e(href(enderecos[cod], pagina))

    def chip(cod: str) -> str:
        return f'<a class="arv-chip" href="{h(cod)}">{cod}</a>'

    rnf_por_hu = {
        hu: sorted((r for r, v in f.rnf_rfs.items() if v & set(rfs)), key=_numero)
        for hu, rfs in f.hu_rfs.items()
    }
    p: list[str] = ['<div class="arv" data-arvore>']
    p.append(
        f'<a class="arv-no arv-no--problema" href="{_e(problema_href)}"><span class="arv-rot">Problema</span>'
        f'<span class="arv-txt">{_e(f.problema)}</span></a>'
    )
    p.append('<ol class="arv-oes" aria-label="Objetivos específicos">')
    for oe in sorted((c for c in f.do_tipo("oe")), key=lambda c: _numero(c.codigo)):
        p.append(
            f'<li data-oe="{oe.codigo}"><a class="arv-no arv-no--oe" href="{h(oe.codigo)}"><span class="arv-cod">{oe.codigo}</span>'
            f'<span class="arv-nome">{_e(oe.titulo)}</span><span class="arv-txt">{_e(f.problema_oe[oe.codigo])}</span></a></li>'
        )
    p.append("</ol>")

    cps = sorted(f.cp_oe, key=_numero)
    hus_do_cp = {cp: [hu for hu, rfs in f.hu_rfs.items() if any(f.rf_cp[r] == cp for r in rfs)] for cp in cps}
    vazios = [cp for cp in cps if not hus_do_cp[cp]]
    if vazios:
        raise PluginError(f"codigos: nenhuma história nas fichas da 10.1 com requisitos da {', '.join(vazios)}.")

    p.append('<div class="arv-abas" data-arv-abas aria-label="Características de produto">')
    for cp in cps:
        hus = hus_do_cp[cp]
        mvp = sum(1 for x in hus if f.codigos[x].destino.startswith("MVP"))
        p.append(
            f'<button type="button" class="arv-aba" id="arv-aba-{cp.lower()}" data-arv-cp="{cp}">'
            f'<span class="arv-cod">{cp}</span><span class="arv-nome">{_e(f.codigos[cp].titulo)}</span>'
            f'<span class="arv-conta">{mvp} de {len(hus)} no MVP</span></button>'
        )
    p.append("</div>")

    for cp in cps:
        pri, sec = f.cp_oe[cp]
        oes = f'objetivo principal {chip(pri)}'
        if sec:
            oes += " · secundário" + ("s" if len(sec) > 1 else "") + " " + " ".join(chip(o) for o in sec)
        p.append(
            f'<div class="arv-cp" id="arv-{cp.lower()}" data-arv-painel="{cp}" data-oe-principal="{pri}" data-oe-secundarios="{" ".join(sec)}">'
        )
        p.append(
            f'<div class="arv-cp__topo"><a class="arv-no arv-no--cp" href="{h(cp)}"><span class="arv-cod">{cp}</span>'
            f'<span class="arv-nome">{_e(f.codigos[cp].titulo)}</span></a><span class="arv-oe-lig">{oes}</span></div>'
        )
        p.append(f'<ul class="arv-hus" aria-label="Histórias da {cp}">')
        for hu in hus_do_cp[cp]:
            c = f.codigos[hu]
            fora = not c.destino.startswith("MVP")
            rfs = [r for r in f.hu_rfs[hu] if f.rf_cp[r] == cp]
            rnfs = " ".join(chip(r) for r in rnf_por_hu[hu]) or '<span class="arv-nada">só os transversais</span>'
            p.append(
                f'<li class="arv-hu{" arv-hu--fora" if fora else ""}" data-destino="{"fora" if fora else "mvp"}">'
                f'<a class="arv-no arv-no--hu" href="{h(hu)}"><span class="arv-cod">{hu}</span>'
                f'<span class="arv-nome">{_e(c.titulo)}</span></a>'
                f'<span class="arv-destino">{_e(c.destino)}</span>'
                f'<span class="arv-req"><span class="arv-rot">RF</span>{" ".join(chip(r) for r in rfs)}</span>'
                f'<span class="arv-req"><span class="arv-rot">RNF</span>'
                f"{rnfs}</span></li>"
            )
        p.append("</ul></div>")

    p.append(
        '<div class="arv-trilho"><span class="arv-rot">Valem para todas as histórias</span>'
        + " ".join(chip(r) for r in sorted(f.transversais, key=_numero))
        + "</div>"
    )
    p.append(
        '<p class="arv-legenda"><span><span class="arv-amostra"></span>História no MVP</span>'
        '<span><span class="arv-amostra arv-amostra--fora"></span>Borda tracejada: história fora do MVP (incremento ou posterior)</span>'
        "<span>Sob cada objetivo: o elemento do problema a que ele responde (seção 2.2)</span>"
        "<span>RF: requisitos funcionais da história nesta característica</span>"
        "<span>RNF: requisitos não funcionais ligados a esses requisitos pela matriz 8.4.2</span>"
        "<span>Objetivo destacado: principal (borda contínua) ou secundário (borda tracejada) da característica escolhida</span></p>"
    )
    p.append("</div>")
    return "\n".join(p)


# ---- Hooks do MkDocs ----

_estado: dict = {}


def fontes(docs_dir: str) -> Fontes:
    if "fontes" not in _estado:
        _estado["fontes"] = ler_fontes(Path(docs_dir))
    return _estado["fontes"]


def on_pre_build(config, **kwargs):
    _estado.clear()  # o mkdocs serve relê as fontes a cada mudança


def on_files(files, config, **kwargs):
    _estado["files"] = files
    return files


def on_page_markdown(markdown, page, config, files, **kwargs):
    if page.file.src_uri != SECAO8 or MARCADOR not in markdown:
        return markdown
    f = fontes(config["docs_dir"])
    enderecos = urls(f, files)
    secao = ligacoes.indice(config["docs_dir"]).secoes.get("1.4")
    if not secao:
        raise PluginError("codigos: a seção 1.4, onde o problema é descrito, não foi encontrada.")
    problema = f"{url_da_pagina(secao[0], files)}#{secao[1]}"
    pagina = url_da_pagina(SECAO8, files)
    return markdown.replace(MARCADOR, arvore(f, enderecos, pagina, href(problema, pagina)), 1)


def on_post_build(config, **kwargs):
    f = fontes(config["docs_dir"])
    destino = Path(config["site_dir"]) / SAIDA
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(indice_json(f, urls(f, _estado.get("files"))), encoding="utf-8")
