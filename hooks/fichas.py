"""
Compõe a ficha de cada história da seção 10.1 a cada build do MkDocs.

A ficha reúne, sem sair da página, o que está registrado em outras seções. Só três campos
são escritos na própria ficha: Épico, Requisitos funcionais e Depende de. O resto vem da fonte:
  - nome, descrição, CP e OE do requisito: seção 8.2 e cabeçalhos da matriz 8.4.1;
  - RNF e regras de negócio: matrizes 8.4.2 e 8.7;
  - valor: seção 10.2.2; esforço: seção 10.2.3; destino: seção 10.2.4;
  - situação e issue: situacao-historias.json, lido do quadro do projeto;
  - evolução: os registros da página Histórico e evolução que citam a história ou seus requisitos.

A ficha é enxuta: história, selos curtos (destino, valor com MoSCoW, faixa de esforço, épico), os
requisitos como códigos (o texto fica na seção 8 e abre na janela dos códigos), critérios de aceitação,
RNF e RN recolhidos e um link discreto para a issue (busca pelo código quando não há leitura do quadro).

Nos marcadores <!-- priorizacao-moscow -->, <!-- priorizacao-matriz --> e <!-- priorizacao-mvp -->, a
seção 10.2 recebe as visões compostas das mesmas tabelas (10.2.2, 10.2.3 e 10.2.4), que continuam no
Markdown, recolhidas, porque são a fonte lida por este hook, por cartoes.py e por conferencia.py.

Para mudar uma ficha ou uma visão, mude a fonte. Sem leitura do quadro, as fichas saem sem selos.
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
    cp_nome: dict[str, str] = field(default_factory=dict)
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
            s.cp_nome[cp] = linha.split("—", 1)[-1].strip() if "—" in linha else cp
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
            # Requisito | Gargalo | Norma / mitigação | História derivada | Cobertura (o nome fica na 8.2).
            s.verificacao[m.group(1)] = [
                (h, ca.strip(" ()")) for h, ca in re.findall(rf"({HU})\s*(\([^)]*\))?", celulas(linha)[3])
            ]
    for linha in trecho(md, "### 8.4.2", "### 8.4.3").splitlines():
        m = LINHA_RNF.match(linha)
        if m:
            coluna = celulas(linha)[2]  # RNF | Origem | RFs relacionados (o nome fica na 8.3)
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
    valor_rf: dict[str, str] = field(default_factory=dict)  # RF -> valor na 10.2.4


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
            p.destino[m.group(1)] = celulas(linha)[3]  # Código | Valor | Esforço técnico | Destino
            p.valor_rf[m.group(1)] = celulas(linha)[1]
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


MOSCOW = {"4": "Must have", "3": "Should have", "2": "Could have", "1": "Won't have now"}
BUSCA_ISSUE = "{repo}/issues?q={codigo}"


def _numeros(texto: str) -> list[int]:
    return [int(n) for n in re.findall(r"\d", texto.replace("🔧", ""))]


def _prov(texto: str) -> str:
    return " 🔧" if "🔧" in texto else ""


def _chip_hu(hu: str, dados: dict | None) -> str:
    return ref_hu(hu, dados).replace(f"(#{hu.lower()})", f"(#{hu.lower()}){{ .fx-cod }}", 1)


def _condicao(depende: str, hu: str) -> str:
    """Condição escrita depois de uma história no campo Depende de: 'HU-04a para as miniaturas' → 'para as miniaturas'."""
    for trecho in re.split(r"[;,]", depende):
        if re.search(rf"\b{re.escape(hu)}\b", trecho):
            return re.sub(rf"\b{re.escape(hu)}\b", "", trecho).strip(" .")
    return ""


def _linha(rotulo: str, valor: str) -> str:
    return f'<span class="fx-rot">{rotulo}</span> {valor}'


def _oe(oe: str) -> str:
    return f"[{oe}](../visao/2-solucao-proposta.md#{oe.lower()})"


def _cp_com_oe(cp: str, s: Secao8) -> str:
    """CP com os objetivos da matriz 8.4.1: o principal e, se houver, os secundários."""
    principal, _, secundarios = s.cp_oe.get(cp, "").partition(";")
    oes = [o for o in re.findall(r"OE\d{2}", principal)]
    texto = f"[{cp}](../visao/2-solucao-proposta.md#{cp.lower()}){{ .fx-cod .fx-cod--cp }}"
    if oes:
        texto += " objetivo " + ", ".join(_oe(o) for o in oes)
    sec = re.findall(r"OE\d{2}", secundarios)
    if sec:
        texto += " · secundário" + ("s" if len(sec) > 1 else "") + " " + ", ".join(_oe(o) for o in sec)
    return texto


def compor(f: Ficha, fichas: list[Ficha], s: Secao8, p: Priorizacao, dados: dict | None,
           por_codigo: dict[str, list], existe: Callable[[str], bool], repo: str) -> list[str]:
    """Ficha enxuta: história, selos curtos, requisitos como chips, critérios, RNF e RN recolhidos e
    um link discreto para a issue. O texto do requisito fica na seção 8 e abre na janela dos códigos."""
    destino = destino_da_ficha(f, p)
    classes = f"{f.classes} ficha {slug_destino(destino)} epico-{historico.slug(f.epico)}"
    chip = f"<span class='destino'>{html.escape(destino)}</span>"
    saida = [f'??? note{classes} "{f.hu} · {f.titulo} {chip}"']
    corpo: list[str] = [*f.historia, ""]

    valor, criterio = p.valor.get(f.hu, ("—", "—"))
    nota = (_numeros(valor) or [0])[0]
    moscow = MOSCOW.get(str(nota), "")
    esforcos = [p.esforco.get(r, "") for r in f.rfs]
    numeros = sorted({n for e in esforcos for n in _numeros(e)})
    esforco = "—" if not numeros else (f"{numeros[0]}" if len(numeros) == 1 else f"{numeros[0]} a {numeros[-1]}")
    selos_ = [
        f"[{destino}](#1026-mvp-e-incrementos){{ .fx .fx--{slug_destino(destino)} }}",
        f"[Valor {nota or '—'}{' · ' + moscow if moscow else ''}](#1022-avaliacao-de-negocio-com-o-instituto"
        f' "{criterio}"){{ .fx }}{_prov(valor)}',
        f"[Esforço {esforco}](#1023-avaliacao-tecnica){{ .fx }}{_prov(''.join(esforcos))}",
        f'<span class="fx fx--epico">{html.escape(f.epico)}</span>',
    ]
    corpo += [" ".join(selos_), "{: .ficha-selos }", ""]

    linhas: list[str] = []
    rfs = []
    for r in f.rfs:
        q = s.rfs.get(r)
        if not q:
            raise PluginError(f"fichas: {r}, da ficha da {f.hu}, não está na seção 8.2.")
        titulo = f"{q.nome} · esforço {p.esforco.get(r, '—').replace('🔧', '').strip()}".replace('"', "'")
        rfs.append(f'[{r}](8-requisitos.md#{r.lower()} "{titulo}"){{ .fx-cod }}')
    cps = sorted({s.rfs[r].cp for r in f.rfs if r in s.rfs})
    linhas.append(_linha("Requisitos", " ".join(rfs)))
    linhas.append(_linha("Característica", "; ".join(_cp_com_oe(c, s) for c in cps)))
    if re.findall(HU, f.depende):
        # O texto da fonte fica: a condição ("para o índice de evidências") diz que a dependência é parcial.
        texto = html.escape(f.depende, quote=False)
        linhas.append(_linha("Depende de", re.sub(HU, lambda m: _chip_hu(m.group(0), dados), texto)))
    liberadas = [(o.hu, _condicao(o.depende, f.hu)) for o in fichas if o.hu != f.hu and f.hu in re.findall(HU, o.depende)]
    if liberadas:
        linhas.append(_linha("Libera", ", ".join(
            _chip_hu(h, dados) + (f" ({html.escape(c, quote=False)})" if c else "") for h, c in liberadas)))
    verifica = [
        f'[{r}](8-requisitos.md#{r.lower()} "{ca}"){{ .fx-cod }}' if ca else f"[{r}](8-requisitos.md#{r.lower()}){{ .fx-cod }}"
        for r, lista in s.verificacao.items() if r not in f.rfs
        for h, ca in lista if h == f.hu
    ]
    if verifica:
        linhas.append(_linha("Também verifica", " ".join(verifica)))
    corpo += [*(x + "<br>" for x in linhas[:-1]), linhas[-1], "{: .ficha-req }", "", *f.corpo]

    rnfs = [c for c, v in s.rnf_rfs.items() if v & set(f.rfs)]
    rns = [c for c, v in s.rn_rfs.items() if v & set(f.rfs)]
    if rnfs or rns:
        corpo += ["", f'??? abstract "Requisitos não funcionais e regras de negócio ({len(rnfs) + len(rns)})"', ""]
        for c in rnfs:
            corpo.append(f"    - [{c}](8-requisitos.md#{c.lower()}) {s.rnf.get(c, '')}")
        for c in rns:
            corpo.append(f"    - [{c}](8-requisitos.md#{c.lower()}) {s.rn.get(c, '')}")

    rodape = []
    info_hu = (dados or {}).get("historias", {}).get(f.hu, {})
    issue = info_hu.get("issue")
    if issue:
        rodape.append(f"[Issue #{issue} no GitHub]({repo.rstrip('/')}/issues/{issue})")
    else:
        rodape.append(f"[Issue no GitHub]({BUSCA_ISSUE.format(repo=repo.rstrip('/'), codigo=f.hu)})")
    sprint_hu = info_hu.get("sprint")
    if sprint_hu and existe(f"gestao/sprints/tarefas-sprint-{sprint_hu}.md"):
        alvo_s = posixpath.relpath(f"gestao/sprints/tarefas-sprint-{sprint_hu}.md", posixpath.dirname(SECAO_HU))
        rodape.append(f"[Andamento na Sprint {sprint_hu}]({alvo_s}#{f.hu.lower()})")
    elif existe("gestao/como-trabalhamos.md"):
        alvo_g = posixpath.relpath("gestao/como-trabalhamos.md", posixpath.dirname(SECAO_HU))
        rodape.append(f"[Andamento na gestão]({alvo_g}#sprints)")
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
        # A evolução detalhada fica só na página Histórico e evolução; a ficha leva até ela.
        alvo = posixpath.relpath(HISTORICO, posixpath.dirname(SECAO_HU))
        ancora = f"#evolucao-{f.hu.lower()}" if f.hu in por_codigo else ""
        rodape.append(f"[Evolução da {f.hu}: {len(eventos)} {'registro' if len(eventos) == 1 else 'registros'}, "
                      f"o último em {eventos[0].quando:%d/%m}]({alvo}{ancora})")
    corpo += ["", " · ".join(rodape), "{: .ficha-rodape }"]
    return saida + [f"    {c}" if c else "" for c in corpo]


# ---- Visões da seção 10.2, compostas das mesmas tabelas-fonte (que seguem no Markdown, recolhidas) ----

MARCA_MOSCOW = "<!-- priorizacao-moscow -->"
MARCA_MATRIZ = "<!-- priorizacao-matriz -->"
MARCA_MVP = "<!-- priorizacao-mvp -->"
DESTINOS = ["MVP", "Incremento 2", "Incremento 3", "Posterior"]
PROVISORIO = "valor provisório, a confirmar com o Instituto (Definition of Ready, item 8)"


def _classe_destino(destino: str) -> str:
    return "pz--" + slug_destino(destino).removeprefix("destino-")


def _chip(rotulo: str, alvo: str, destino: str, titulo: str, provisorio: bool, extra: str = "") -> str:
    classes = f".pz-chip .{_classe_destino(destino)}" + (" .pz-prov" if provisorio else "") + extra
    titulo = f"{titulo.replace('🔧', '').strip()} · {destino.replace('🔧', '').strip()}" + (f" · {PROVISORIO}" if provisorio else "")
    return f'[{rotulo}]({alvo} "{titulo.replace(chr(34), chr(39))}"){{ {classes} }}'


def _legenda() -> str:
    itens = "".join(f'<span><span class="pz-amostra {_classe_destino(d)}"></span>{d}</span>' for d in DESTINOS)
    return (f'<p class="pz-legenda">{itens}<span><span class="pz-amostra pz-prov"></span>'
            f"Borda tracejada: {PROVISORIO}</span></p>")


def visao_moscow(fichas_: list[Ficha], p: Priorizacao) -> str:
    colunas: dict[str, list[str]] = {n: [] for n in MOSCOW}
    for f in fichas_:
        valor = p.valor.get(f.hu, ("", ""))[0]
        nota = str((_numeros(valor) or [0])[0])
        if nota in colunas:
            destino = destino_da_ficha(f, p)
            colunas[nota].append(_chip(f.hu, f"#{f.hu.lower()}", destino, f.titulo, "🔧" in valor))
    p_ = ['<div class="pz-moscow" markdown="1">']
    for nota, nome in MOSCOW.items():
        p_.append(f'<div class="pz-col pz-col--{nota}" markdown="1">')
        p_.append(f'<p class="pz-col__topo"><strong>{nome}</strong> <span>valor {nota} · {len(colunas[nota])}</span></p>')
        p_.append(f'<p class="pz-col__chips" markdown="span">{" ".join(colunas[nota]) or "—"}</p>')
        p_.append("</div>")
    p_.append("</div>")
    return "\n".join(["", *p_, "", _legenda(), ""])


def visao_matriz(s: Secao8, p: Priorizacao) -> str:
    celula: dict[tuple[int, int], list[str]] = {}
    for r, valor in p.valor_rf.items():
        v = (_numeros(valor) or [0])[0]
        e = (_numeros(p.esforco.get(r, "")) or [0])[0]
        nome = s.rfs[r].nome if r in s.rfs else r
        celula.setdefault((v, e), []).append(_chip(r, f"8-requisitos.md#{r.lower()}", p.destino.get(r, ""), nome,
                                                   "🔧" in valor))
    p_ = ['<div class="pz-matriz" markdown="1">', '<div class="pz-eixo">Valor / esforço</div>']
    p_ += [f'<div class="pz-eixo">{e}</div>' for e in range(1, 5)]
    for v in range(4, 0, -1):
        p_.append(f'<div class="pz-eixo">{v} · {MOSCOW[str(v)].split()[0]}</div>')
        for e in range(1, 5):
            alvo = " pz-cel--alvo" if (v == 4 and e <= 2) or (v == 3 and e == 1) else ""
            chips = " ".join(celula.get((v, e), [])) or '<span class="pz-vazio">—</span>'
            p_.append(f'<div class="pz-cel{alvo}" markdown="span">{chips}</div>')
    p_.append("</div>")
    return "\n".join(["", *p_, "", _legenda(), ""])


def visao_mvp(fichas_: list[Ficha], s: Secao8, p: Priorizacao) -> str:
    por_cp: dict[str, list[str]] = {}
    no_mvp = 0
    for f in fichas_:
        destino = destino_da_ficha(f, p)
        no_mvp += destino.startswith("MVP")
        cp = next((s.rfs[r].cp for r in f.rfs if r in s.rfs), "")
        por_cp.setdefault(cp, []).append(_chip(f.hu, f"#{f.hu.lower()}", destino, f.titulo, "🔧" in destino,
                                               " .pz-q"))
    rfs_mvp = sum(1 for d in p.destino.values() if d.startswith("MVP"))
    p_ = [f'<p class="pz-numeros"><span><strong>{no_mvp}</strong> de {len(fichas_)} histórias no MVP</span>'
          f'<span><strong>{rfs_mvp}</strong> de {len(p.destino)} requisitos funcionais no MVP</span></p>',
          "", '<div class="pz-mosaico" markdown="1">']
    for cp in sorted(por_cp):
        nome = s.cp_nome.get(cp, cp)
        p_.append(f'<div class="pz-linha" markdown="1">')
        p_.append(f'<p class="pz-linha__cp" markdown="span">[{cp}](../visao/2-solucao-proposta.md#{cp.lower()}) {nome}</p>')
        p_.append(f'<p class="pz-linha__q" markdown="span">{" ".join(por_cp[cp])}</p>')
        p_.append("</div>")
    p_.append("</div>")
    nota = ('<p class="pz-legenda">Cada história aparece uma vez, na característica do seu primeiro requisito '
            "funcional; as demais características dela estão na ficha da 10.1.</p>")
    return "\n".join(["", *p_, "", _legenda(), nota, ""])


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

    for marca, visao in ((MARCA_MOSCOW, lambda: visao_moscow(fichas, p)), (MARCA_MATRIZ, lambda: visao_matriz(s, p)),
                         (MARCA_MVP, lambda: visao_mvp(fichas, s, p))):
        if marca in texto:
            texto = texto.replace(marca, visao(), 1)

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
