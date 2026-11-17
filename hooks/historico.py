"""
Gera a página "Histórico e evolução" (gestao/historico.md) a cada build do MkDocs.

A página não é escrita à mão: ela reúne o que já está registrado no site.
  - tabelas de versões (| Data | Versão | Descrição | Autor |) de todas as páginas;
  - índice de atas (gestao/atas/index.md), reuniões da equipe e interações com o cliente;
  - planos de sprint (gestao/sprints/sprint-N.md), pelo "Período da Sprint";
  - marcos da disciplina (MARCOS, abaixo).

Para mudar o histórico, mude a origem: acrescente a linha na tabela de versões da
página alterada, a ata no índice ou o plano da sprint. Uma linha fora do padrão
(data inválida, número de colunas diferente, data fora de ordem) interrompe o build
com o arquivo e a linha.
"""
from __future__ import annotations

import html
import logging
import posixpath
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path

from mkdocs.exceptions import PluginError
from mkdocs.structure.files import File

log = logging.getLogger("mkdocs.hooks.historico")

DESTINO = "gestao/historico.md"
INDICE_ATAS = "gestao/atas/index.md"
PLANOS = re.compile(r"^gestao/sprints/sprint-(\d+)\.md$")

# Calendário da disciplina (plano de ensino FGA0313, 2026.2). A fonte publicada é a seção 6.6 do
# cronograma; coletar() confere esta lista contra ela e interrompe o build se divergirem.
MARCOS = [
    (date(2026, 9, 8), "Unidade 1", "u1"),
    (date(2026, 10, 13), "Unidade 2", "u2"),
    (date(2026, 11, 17), "Unidade 3", "u3"),
    (date(2026, 11, 24), "Questionário de avaliação geral", "qag"),
    (date(2026, 12, 1), "Unidade 4", "u4"),
]
FIM_MARCO = {"u4": date(2026, 12, 8)}  # marco com janela: entrega da Unidade 4 de 01 a 08/12
CRONOGRAMA = "visao/6-cronograma.md"
MARCO_66 = re.compile(r"^\|\s*(\d{2})(?:\s*a\s*\d{2})?/(\d{2})\s*\|\s*(Entrega da (Unidade \d)|Questionário de avaliação geral)\s*\|")

CABECALHO_VERSOES = re.compile(r"^\|\s*Data\s*\|\s*Vers", re.IGNORECASE)
DATA = re.compile(r"^\d{2}/\d{2}/\d{4}$")
LINK_MD = re.compile(r"^\[([^\]]+)\]\(([^)]+)\)$")
CODIGO = re.compile(r"\b(RNF\d{2}|RF\d{2}|HU-\d{2}[a-z]?|CA-\d{2}[a-z]?)(?=[\s.,;:)\]]|$)")
PERIODO = re.compile(r"Per[ií]odo da Sprint\*?\*?\s*\|\s*(\d{2}/\d{2}/\d{4}).*?a\s+(\d{2}/\d{2}/\d{4})")
META = re.compile(r"^#+[^\n]*Meta da Sprint[^\n]*\n+>\s*([^\n]+)", re.MULTILINE)
ROTULO_META = re.compile(r"^\*\*Sprint Goal[^*]*\*\*\s*")
INICIO_META = re.compile(r"^Ao final da Sprint \d+, ")

PAGINAS_DE_CODIGO = ("requisitos/8-requisitos.md", "requisitos/10-backlog.md")
ANCORA_CODIGO = re.compile(r'<a id="(rnf\d{2}|rf\d{2}|hu-\d{2}[a-z]?)"></a>')

CURTO = {"versao": "Versões", "ata-equipe": "Equipe", "ata-cliente": "Instituto", "sprint": "Sprints", "marco": "Marcos"}

TIPOS = {
    "versao": "Versão de documento",
    "ata-equipe": "Reunião da equipe",
    "ata-cliente": "Interação com o Instituto",
    "sprint": "Início de sprint",
    "marco": "Marco da disciplina",
}


@dataclass
class Evento:
    quando: date
    tipo: str
    titulo: str
    descricao: str
    origem: str | None = None  # caminho relativo a docs/
    origem_rotulo: str = ""
    autor: str = ""
    versao: str = ""
    codigos: list[str] = field(default_factory=list)


@dataclass
class Sprint:
    numero: int
    inicio: date
    fim: date
    meta: str = ""


# ---------------------------------------------------------------- leitura


def _data(texto: str, arquivo: str, linha: int) -> date:
    texto = texto.strip()
    if not DATA.match(texto):
        raise PluginError(f"historico: data inválida '{texto}' em {arquivo}, linha {linha} (use dd/mm/aaaa).")
    try:
        return datetime.strptime(texto, "%d/%m/%Y").date()
    except ValueError as exc:
        raise PluginError(f"historico: data inexistente '{texto}' em {arquivo}, linha {linha}.") from exc


def _celulas(linha: str) -> list[str]:
    return [c.strip() for c in linha.strip().strip("|").split("|")]


def _titulo(texto: str, padrao: str) -> str:
    for linha in texto.splitlines():
        if linha.startswith("# "):
            return linha[2:].strip()
    return padrao


def _codigos(texto: str) -> list[str]:
    vistos: list[str] = []
    for c in CODIGO.findall(texto):
        if c.startswith("CA-"):
            c = "HU-" + c[3:]
        if c not in vistos:
            vistos.append(c)
    return vistos


def ler_versoes(caminho: str, texto: str) -> list[Evento]:
    linhas = texto.splitlines()
    titulo = _titulo(texto, caminho)
    for i, linha in enumerate(linhas):
        if not CABECALHO_VERSOES.match(linha):
            continue
        eventos: list[Evento] = []
        anterior: date | None = None
        for n, bruta in enumerate(linhas[i + 2 :], start=i + 3):
            if not bruta.startswith("|"):
                break
            c = _celulas(bruta)
            if len(c) != 4:
                raise PluginError(
                    f"historico: a tabela de versões de {caminho} tem {len(c)} colunas na linha {n}; esperadas 4 "
                    "(Data, Versão, Descrição, Autor)."
                )
            quando = _data(c[0], caminho, n)
            if anterior and quando < anterior:
                raise PluginError(f"historico: data fora de ordem em {caminho}, linha {n} ({c[0]} depois de uma data posterior).")
            anterior = quando
            eventos.append(
                Evento(quando, "versao", f"{titulo} · versão {c[1]}", c[2], caminho, titulo, c[3], c[1], _codigos(c[2]))
            )
        return eventos
    return []


def ler_atas(texto: str) -> list[Evento]:
    eventos: list[Evento] = []
    secao = None
    for n, linha in enumerate(texto.splitlines(), start=1):
        if linha.startswith("## "):
            nome = linha[3:].lower()
            secao = "ata-equipe" if "equipe" in nome else "ata-cliente" if "cliente" in nome else None
            continue
        if secao is None or not linha.startswith("|") or linha.startswith("|---") or linha.startswith("| Data"):
            continue
        c = _celulas(linha)
        if len(c) != 3:
            continue
        m = LINK_MD.match(c[0])
        data_txt, alvo = (m.group(1), m.group(2)) if m else (c[0], None)
        quando = _data(data_txt, INDICE_ATAS, n)
        origem = f"gestao/atas/{alvo}" if alvo else None
        if secao == "ata-equipe":
            eventos.append(Evento(quando, secao, c[1], c[2], origem, "Ata" if origem else "", codigos=_codigos(c[2])))
        else:
            eventos.append(Evento(quando, secao, f"Instituto No Setor · {c[1]}", c[2], origem, "Ata" if origem else "", codigos=_codigos(c[2])))
    return eventos


def ler_sprint(caminho: str, numero: int, texto: str) -> Sprint | None:
    m = PERIODO.search(texto)
    if not m:
        log.warning("historico: %s sem 'Período da Sprint' reconhecível; sprint fora da régua.", caminho)
        return None
    return Sprint(numero, _data(m.group(1), caminho, 0), _data(m.group(2), caminho, 0), ler_meta(texto))


def ler_meta(texto: str) -> str:
    """Meta da sprint, da citação logo abaixo do título "Meta da Sprint" do plano."""
    m = META.search(texto)
    return ROTULO_META.sub("", m.group(1).strip()).strip(' *"“”') if m else ""


def meta_curta(meta: str) -> str:
    """Meta sem a abertura repetida ("Ao final da Sprint N,"), para o cartão."""
    curta = INICIO_META.sub("", meta)
    return curta[:1].upper() + curta[1:]


# ---------------------------------------------------------------- classificação


def sprint_de(quando: date, sprints: list[Sprint]) -> str:
    """Rótulo da sprint de uma data. Dia de fronteira conta para a sprint que termina."""
    if not sprints:
        return "Sem sprint"
    if quando < sprints[0].inicio:
        return "Concepção"
    for s in sprints:
        if s.inicio <= quando <= s.fim:
            return f"Sprint {s.numero}"
    return f"Após a Sprint {sprints[-1].numero}"


def ler_marcos(texto: str) -> list[tuple[date, str]]:
    """Marcos da seção 6.6: (data de início, nome), na ordem da tabela."""
    secao = texto.split("## 6.6", 1)[1] if "## 6.6" in texto else ""
    secao = secao.split("\n## ", 1)[0]
    marcos = []
    for linha in secao.splitlines():
        m = MARCO_66.match(linha)
        if m:
            marcos.append((date(2026, int(m.group(2)), int(m.group(1))), m.group(4) or m.group(3)))
    return marcos


def conferir_marcos(texto: str) -> None:
    lidos = ler_marcos(texto)
    esperados = [(quando, nome) for quando, nome, _ in MARCOS]
    if lidos != esperados:
        raise PluginError(
            "historico: os marcos da seção 6.6 (" + ", ".join(f"{n} {d:%d/%m}" for d, n in lidos)
            + ") diferem da lista do hook (" + ", ".join(f"{n} {d:%d/%m}" for d, n in esperados) + ")."
        )


def unidade_de(quando: date) -> str:
    for limite, nome, _ in MARCOS:
        if nome.startswith("Unidade") and quando <= limite:
            return nome
    return "Unidade 4"


def slug(texto: str) -> str:
    texto = texto.lower()
    trocas = str.maketrans("áàâãäéêëíîïóôõöúûüç", "aaaaaeeeiiioooouuuc")
    texto = texto.translate(trocas)
    return re.sub(r"[^a-z0-9]+", "-", texto).strip("-")


# ---------------------------------------------------------------- saída


def _e(texto: str) -> str:
    return html.escape(texto, quote=True)


def _n(qtd: int, singular: str, plural: str) -> str:
    return f"{qtd} {singular if qtd == 1 else plural}"


def _link(origem: str | None) -> str:
    if not origem:
        return ""
    return posixpath.relpath(origem, posixpath.dirname(DESTINO))


def _codigo(codigo: str, ancoras: dict[str, str]) -> str:
    """Código no rodapé do registro: leva à ficha ou ao requisito, quando ele tem âncora."""
    pagina = ancoras.get(codigo.lower())
    if not pagina:
        return f'<span class="hist-codigo">{_e(codigo)}</span>'
    alvo = posixpath.relpath(pagina, posixpath.dirname(DESTINO))
    return f"[{_e(codigo)}]({alvo}#{codigo.lower()}){{ .hist-codigo }}"


def ler_ancoras(docs_dir: Path) -> dict[str, str]:
    """Âncoras de histórias e requisitos nas páginas que os definem: {"hu-07c": caminho}."""
    ancoras: dict[str, str] = {}
    for pagina in PAGINAS_DE_CODIGO:
        texto = (docs_dir / pagina).read_text(encoding="utf-8")
        ancoras.update({a: pagina for a in ANCORA_CODIGO.findall(texto)})
    return ancoras


def _href(origem: str, ancora: str = "") -> str:
    """Endereço publicado de uma página, relativo a esta, para HTML cru (que o MkDocs não reescreve).

    O site usa endereços de diretório: requisitos/8-requisitos.md vira requisitos/8-requisitos/.
    """
    alvo = origem[: -len(".md")]
    alvo = alvo[: -len("index")] if alvo == "index" or alvo.endswith("/index") else alvo + "/"
    pagina = DESTINO[: -len(".md")]
    rel = posixpath.relpath(alvo.rstrip("/") or ".", pagina)
    return (rel + "/" if rel != "." else "./") + (f"#{ancora}" if ancora else "")


ALVO_MARCO = {"u1": "entregas/unidade-1.md", "u2": "entregas/unidade-2.md", "u3": "entregas/unidade-3.md"}
MESES = "jan fev mar abr mai jun jul ago set out nov dez".split()


def _marco_alvo(slug_marco: str) -> str:
    if slug_marco in ALVO_MARCO:
        return _href(ALVO_MARCO[slug_marco])
    return _href(CRONOGRAMA, "66-marcos-da-disciplina")


def _gantt(sprints: list[Sprint], eventos: list[Evento], hoje: date) -> list[str]:
    """Linha do tempo em linhas: uma por sprint (barra no período) e uma por marco (ponto no dia),
    em ordem de data, com as viradas de mês e o traço do dia da publicação."""
    inicio = min([e.quando for e in eventos] + [s.inicio for s in sprints])
    fim = max([FIM_MARCO.get(sl, q) for q, _, sl in MARCOS] + [s.fim for s in sprints])
    total = max((fim - inicio).days, 1)

    def pos(d: date) -> float:
        return round(100 * max(min((d - inicio).days, total), 0) / total, 2)

    linhas: list[tuple[date, int, str]] = []
    faixas = [("Concepção", inicio, sprints[0].inicio if sprints else inicio, "")]
    faixas += [(f"Sprint {s.numero}", s.inicio, s.fim, s.meta) for s in sprints]
    for nome, a, b, meta in faixas:
        estado = "corrente" if a <= hoje <= b and nome != "Concepção" else "feita" if b <= hoje else "prevista"
        titulo = f"{nome} · {a:%d/%m} a {b:%d/%m}" + (f" · {meta_curta(meta)}" if meta else "")
        linhas.append((a, 1, (
            f'<a class="f5-gantt__linha f5-gantt__linha--sprint f5-gantt__linha--{estado}" href="#{slug(nome)}" '
            f'data-filtro="sprint" data-valor="{slug(nome)}" title="{_e(titulo)}">'
            f'<span class="f5-gantt__rotulo"><strong>{_e(nome)}</strong><small>{a:%d/%m} a {b:%d/%m}</small></span>'
            f'<span class="f5-gantt__pista"><span class="f5-gantt__barra" '
            f'style="left:{pos(a)}%;width:{max(round(pos(b) - pos(a), 2), 1)}%"></span></span></a>'
        )))
    for quando, nome, sl in MARCOS:
        ate = FIM_MARCO.get(sl)
        estado = "feito" if (ate or quando) < hoje else "hoje" if quando <= hoje <= (ate or quando) else "previsto"
        periodo = f"{quando:%d/%m}" + (f" a {ate:%d/%m}" if ate else "")
        janela = (f'<span class="f5-gantt__janela" style="left:{pos(quando)}%;width:{round(pos(ate) - pos(quando), 2)}%"></span>'
                  if ate else "")
        linhas.append((quando, 0, (
            f'<a class="f5-gantt__linha f5-gantt__linha--marco f5-gantt__linha--{estado}" href="{_e(_marco_alvo(sl))}" '
            f'title="{_e(nome)} · {periodo}/{quando:%Y}">'
            f'<span class="f5-gantt__rotulo"><strong>{_e(nome)}</strong><small>{periodo}</small></span>'
            f'<span class="f5-gantt__pista">{janela}<span class="f5-gantt__ponto" style="left:{pos(quando)}%"></span></span></a>'
        )))

    out = ['<div class="f5-gantt" markdown="0">', '<div class="f5-gantt__escala" aria-hidden="true"></div>']
    out += [h for _, _, h in sorted(linhas, key=lambda l: (l[0], l[1]))]
    mes = date(inicio.year + (inicio.month == 12), inicio.month % 12 + 1, 1)
    while mes <= fim:
        out.append(f'<span class="f5-gantt__mes" style="--pos:{pos(mes)}" aria-hidden="true"><span>{MESES[mes.month - 1]}</span></span>')
        mes = date(mes.year + (mes.month == 12), mes.month % 12 + 1, 1)
    if inicio <= hoje <= fim:
        out.append(f'<span class="f5-gantt__hoje" style="--pos:{pos(hoje)}" title="Dia desta publicação">'
                   f'<span>{hoje:%d/%m}</span></span>')
    out.append('<div class="f5-gantt__pe" aria-hidden="true"></div>')
    out.append("</div>")
    return out


def _indicadores(itens: list[tuple[str, str, str]]) -> str:
    """Resumo em números curtos: (rótulo, valor, detalhe)."""
    return '<ul class="f5-indicadores" markdown="0">' + "".join(
        f"<li><span>{_e(r)}</span><strong>{_e(v)}</strong><small>{_e(d)}</small></li>" for r, v, d in itens
    ) + "</ul>\n"


def _evolucao_requisitos(versoes: list[Evento], ancoras: dict[str, str]) -> list[str]:
    """Cada requisito ou história citado numa versão de documento, com as mudanças em ordem de data."""
    por_codigo: dict[str, list[Evento]] = {}
    for e in versoes:
        for c in e.codigos:
            por_codigo.setdefault(c, []).append(e)
    grupos = [("rf", "RF", "Requisitos funcionais"), ("rnf", "RNF", "Requisitos não funcionais"), ("hu", "HU", "Histórias de usuário")]
    por_grupo = {g: sorted((c for c in por_codigo if _grupo_codigo(c) == g), key=lambda c: (len(re.sub(r"[a-z]$", "", c)), c))
                 for g, _, _ in grupos}
    total = sum(len(v) for v in por_grupo.values())
    if not total:
        return []
    # Barra de busca e tipo: só aparece com JavaScript (historico.js tira o hidden); sem ele, tudo fica visível.
    out = ['<div class="f5-req-filtros" id="f5-req-filtros" hidden markdown="0">',
           '<label class="f5-req-filtros__busca"><span>Buscar código</span>'
           '<input type="search" data-req-busca placeholder="RF21, RNF12, HU-07a" autocomplete="off"></label>',
           '<div class="f5-req-filtros__tipos" role="group" aria-label="Tipo de código">'
           f'<button type="button" data-req-tipo="" aria-pressed="true">Todos <span>{total}</span></button>'
           + "".join(f'<button type="button" data-req-tipo="{g}" aria-pressed="false" title="{_e(t)}">{r} <span>{len(por_grupo[g])}</span></button>'
                     for g, r, t in grupos if por_grupo[g])
           + "</div>",
           f'<p class="f5-req-filtros__status" data-req-status aria-live="polite">{_n(total, "código com mudança registrada", "códigos com mudanças registradas")}.</p>',
           "</div>"]
    for g, _, titulo in grupos:
        codigos = por_grupo[g]
        if not codigos:
            continue
        out.append(f'<section class="f5-req-grupo" data-req-grupo="{g}" markdown="0">')
        out.append(f'<p class="f5-req-grupo__titulo"><strong>{_e(titulo)}</strong> <span>{_n(len(codigos), "com mudança registrada", "com mudanças registradas")}</span></p>')
        out.append('<div class="hist-req">')
        for c in codigos:
            lista = sorted(por_codigo[c], key=lambda e: e.quando)
            out.append(f'<details class="hist-req__item" id="evolucao-{slug(c)}" data-req-codigo="{re.sub(r"[^a-z0-9]", "", c.lower())}">'
                       f'<summary><strong>{_e(c)}</strong>'
                       f'<span>{_n(len(lista), "mudança", "mudanças")} · {lista[-1].quando:%d/%m}</span></summary><ol>')
            for e in lista:
                rotulo = f"{e.origem_rotulo} · versão {e.versao}" if e.tipo == "versao" else f"{TIPOS[e.tipo]}: {e.titulo}"
                alvo = f'<a href="{_e(_href(e.origem))}">{_e(rotulo)}</a>' if e.origem else _e(rotulo)
                out.append(f'<li><time datetime="{e.quando.isoformat()}">{e.quando:%d/%m/%Y}</time> {alvo}: {_e(e.descricao)}</li>')
            out.append("</ol>")
            pagina = ancoras.get(c.lower())
            if pagina:
                out.append(f'<p><a href="{_e(_href(pagina, c.lower()))}">Definição vigente de {_e(c)}</a></p>')
            out.append("</details>")
        out.append("</div></section>")
    return out


def _grupo_codigo(codigo: str) -> str:
    return "rnf" if codigo.startswith("RNF") else "rf" if codigo.startswith("RF") else "hu"


def montar(eventos: list[Evento], sprints: list[Sprint], hoje: date, ancoras: dict[str, str] | None = None) -> str:
    ancoras = ancoras or {}
    eventos = sorted(eventos, key=lambda e: (e.quando, e.tipo != "marco"), reverse=True)
    for e in eventos:
        # O início de sprint pertence à sprint que começa, ainda que o dia seja de fronteira.
        e.sprint = e.titulo if e.tipo == "sprint" else sprint_de(e.quando, sprints)  # type: ignore[attr-defined]
        e.unidade = unidade_de(e.quando)  # type: ignore[attr-defined]

    faixas = ["Concepção"] + [f"Sprint {s.numero}" for s in sprints]
    if any(e.sprint.startswith("Após") for e in eventos):  # type: ignore[attr-defined]
        faixas.append(f"Após a Sprint {sprints[-1].numero}")

    reais = [e for e in eventos if e.tipo != "marco"]
    versoes = [e for e in reais if e.tipo == "versao"]
    atas = [e for e in reais if e.tipo.startswith("ata")]
    documentos = sorted({e.origem_rotulo for e in versoes})
    autores = sorted({a.strip() for e in versoes for a in re.split(r",| e ", e.autor) if a.strip()})
    codigos = sorted({c for e in reais for c in e.codigos}, key=lambda c: (c[:2], c))
    atual = next((s for s in sprints if s.inicio <= hoje <= s.fim), None)
    proximo = next((m for m in MARCOS if m[0] >= hoje), None)
    n_cliente = sum(1 for e in atas if e.tipo == "ata-cliente")

    out: list[str] = []
    w = out.append
    w("---\nhide:\n  - toc\n---\n")
    w("# Histórico e evolução\n")
    w("Como o projeto e os requisitos evoluíram. Cada item leva ao documento de origem, onde está o conteúdo vigente.\n")
    resumo = []
    if atual:
        resumo.append(("Sprint atual", f"Sprint {atual.numero}", f"{atual.inicio:%d/%m} a {atual.fim:%d/%m}"))
    if proximo:
        resumo.append(("Próximo marco", proximo[1],
                       ("hoje, " if proximo[0] == hoje else "") + f"{proximo[0]:%d/%m}"))
    resumo.append(("Versões", str(len(versoes)), f"em {_n(len(documentos), 'documento', 'documentos')}"))
    resumo.append(("Reuniões", str(len(atas)), f"{n_cliente} com o Instituto"))
    w(_indicadores(resumo))

    # 1. Linha do tempo: uma linha por sprint e por marco
    w("## Linha do tempo\n")
    out.extend(_gantt(sprints, eventos, hoje))
    w("")
    w('<span class="f5-leg f5-leg--sprint"></span> Sprint: filtra o registro ([detalhe em Sprints](como-trabalhamos.md#sprints)). '
      '<span class="f5-leg f5-leg--marco"></span> Marco: leva à entrega da unidade '
      '([datas na seção 6.6](../visao/6-cronograma.md#66-marcos-da-disciplina)). '
      f'<span class="f5-leg f5-leg--hoje"></span> Dia desta publicação, {hoje:%d/%m/%Y}.\n'
      '{: .f5-gantt__legenda }\n')
    w('<div class="hist-abas" role="tablist" aria-label="Partes do histórico" markdown="0">'
      '<button type="button" role="tab" data-aba="evolucao" aria-selected="true">Evolução dos requisitos</button>'
      '<button type="button" role="tab" data-aba="registro" aria-selected="false">Registro completo</button></div>\n')

    # 2. Evolução dos requisitos
    w('<div class="hist-aba" data-aba="evolucao" role="tabpanel" markdown="1">\n')
    w("## Evolução dos requisitos\n")
    w("Cada requisito e cada história que mudou, com as mudanças em ordem de data e a origem: é a organização e "
      "atualização dos requisitos ([seção 5](../visao/5-engenharia-requisitos.md)) em uma vista.\n")
    out.extend(_evolucao_requisitos([e for e in reais if e.tipo != "sprint"], ancoras))
    w("")
    w("</div>\n")
    w('<div class="hist-aba" data-aba="registro" role="tabpanel" markdown="1">\n')

    # 3. Registro completo com filtros
    def opcoes(valores: list[str], rotulo=lambda v: v) -> str:
        return '<option value="">Todos</option>' + "".join(
            f'<option value="{_e(slug(v))}">{_e(rotulo(v))}</option>' for v in valores
        )

    tipos = '<option value="">Todos</option>' + "".join(
        f'<option value="{k}">{_e(v)}</option>' for k, v in TIPOS.items()
    )
    w("## Registro completo\n")
    w("Versões, reuniões, sprints e marcos, por sprint; só a sprint em andamento vem aberta.\n")
    por_tipo = {k: sum(1 for e in eventos if e.tipo == k) for k in TIPOS}
    w('<div class="hist-filtros" id="hist-filtros" markdown="0">')
    w('<label class="hist-filtros__busca"><span class="hist-filtros__rotulo">Buscar no registro</span>'
      '<input type="search" data-busca placeholder="Palavra, código (RF21, HU-07a), versão ou data"></label>')
    w('<div class="hist-filtros__tipos" role="group" aria-label="Tipo de registro">'
      f'<button type="button" class="hist-tipo" data-tipo="" aria-pressed="true">Todos <span>{len(eventos)}</span></button>'
      + "".join(f'<button type="button" class="hist-tipo hist-tipo--{k}" data-tipo="{k}" aria-pressed="false" title="{_e(TIPOS[k])}">'
                f'{_e(CURTO[k])} <span>{por_tipo[k]}</span></button>' for k in TIPOS)
      + "</div>")
    w(f'<select data-campo="tipo" hidden aria-hidden="true">{tipos}</select>')
    w('<div class="hist-filtros__grade">')
    w(f'<label>Sprint<select data-campo="sprint">{opcoes(faixas)}</select></label>')
    w(f'<label>Unidade<select data-campo="unidade">{opcoes(["Unidade 1", "Unidade 2", "Unidade 3", "Unidade 4"])}</select></label>')
    w(f'<label>Documento<select data-campo="documento">{opcoes(documentos)}</select></label>')
    w(f'<label>Requisito ou história<select data-campo="codigo">{opcoes(codigos)}</select></label>')
    w(f'<label>Autor<select data-campo="autor">{opcoes(autores)}</select></label>')
    w('</div>')
    w('<div class="hist-filtros__rodape">')
    w(f'<p class="hist-filtros__status" data-status aria-live="polite">{len(eventos)} registros.</p>')
    w('<button type="button" data-limpar>Limpar filtros</button>')
    w("</div></div>\n")

    w('<div class="hist-linha" id="hist-linha" markdown="1">')
    for f in reversed(faixas):
        doF = [e for e in eventos if e.sprint == f]  # type: ignore[attr-defined]
        if not doF:
            continue
        aberto = f.startswith("Após") or (atual is not None and f == f"Sprint {atual.numero}")
        nome = "Próximos marcos" if f.startswith("Após") else f
        w(f'<details class="hist-grupo" id="{slug(f)}"{" open" if aberto else ""} markdown="1">\n')
        w(f'<summary class="hist-grupo__titulo">{_e(nome)} <span>{_n(len(doF), "registro", "registros")}</span></summary>\n')
        for e in doF:
            autores_e = " ".join(slug(a) for a in re.split(r",| e ", e.autor) if a.strip())
            attrs = {
                "tipo": e.tipo,
                "sprint": slug(e.sprint),  # type: ignore[attr-defined]
                "unidade": slug(e.unidade),  # type: ignore[attr-defined]
                "documento": slug(e.origem_rotulo) if e.tipo == "versao" else "",
                "autor": autores_e,
                "codigo": " ".join(slug(c) for c in e.codigos),
            }
            dados = " ".join(f'data-{k}="{_e(v)}"' for k, v in attrs.items())
            w(f'<article class="hist-item hist-item--{e.tipo}" {dados} markdown="1">\n')
            meta = [f'<time datetime="{e.quando.isoformat()}">{e.quando:%d/%m/%Y}</time>',
                    f'<span class="hist-chip hist-chip--{e.tipo}">{_e(TIPOS[e.tipo])}</span>']
            if e.tipo == "marco" and e.quando > hoje:
                meta.append('<span class="hist-chip">Previsto</span>')
            w(f'<p class="hist-item__meta">{" ".join(meta)}</p>\n')
            titulo = f"[{e.titulo}]({_link(e.origem)})" if e.origem else e.titulo
            w(f"**{titulo}**\n")
            if e.descricao:
                w(f"{e.descricao}\n")
            rodape = []
            if e.autor:
                rodape.append(_e(e.autor))
            if e.codigos:
                rodape.append(" ".join(_codigo(c, ancoras) for c in e.codigos))
            if rodape:
                w(f'<p class="hist-item__rodape" markdown="span">{" · ".join(rodape)}</p>\n')
            w("</article>\n")
        w("</details>\n")
    w("</div>\n")

    # 4. Evolução por documento (referência, recolhida)
    w('<details class="hist-documentos" markdown="1">\n<summary>Evolução por documento</summary>\n')
    w("Versão vigente, número de versões e período de cada documento, do mais recente ao mais antigo.\n")
    por_doc: dict[str, list[Evento]] = {}
    for e in versoes:
        por_doc.setdefault(e.origem or "", []).append(e)
    for origem, lista in sorted(por_doc.items(), key=lambda kv: max(e.quando for e in kv[1]), reverse=True):
        lista.sort(key=lambda e: e.quando)
        periodo = (f"em {lista[0].quando:%d/%m/%Y}" if lista[0].quando == lista[-1].quando
                   else f"de {lista[0].quando:%d/%m/%Y} a {lista[-1].quando:%d/%m/%Y}")
        w(f"- [{lista[0].origem_rotulo}]({_link(origem)}): versão **{lista[-1].versao}**, "
          f"{_n(len(lista), 'versão', 'versões')} {periodo}")
    w("\n</details>\n")

    w(
        f"<small>Registros: {len(versoes)} versões de {len(documentos)} documentos, {len(atas)} reuniões, "
        f"{sum(1 for e in reais if e.tipo == 'sprint')} sprints e {len(MARCOS)} marcos.</small>\n"
    )
    w("</div>\n")
    return "\n".join(out)


# ---------------------------------------------------------------- hook


def coletar(docs_dir: Path) -> tuple[list[Evento], list[Sprint]]:
    eventos: list[Evento] = []
    sprints: list[Sprint] = []
    for arq in sorted(docs_dir.rglob("*.md")):
        rel = arq.relative_to(docs_dir).as_posix()
        if rel == DESTINO:
            continue
        texto = arq.read_text(encoding="utf-8")
        eventos.extend(ler_versoes(rel, texto))
        if rel == INDICE_ATAS:
            eventos.extend(ler_atas(texto))
        if rel == CRONOGRAMA:
            conferir_marcos(texto)
        m = PLANOS.match(rel)
        if m:
            s = ler_sprint(rel, int(m.group(1)), texto)
            if s:
                sprints.append(s)
                descricao = f"Período de {s.inicio:%d/%m/%Y} a {s.fim:%d/%m/%Y}."
                if s.meta:
                    descricao += f" Meta: {s.meta}"
                eventos.append(Evento(s.inicio, "sprint", f"Sprint {s.numero}", descricao, rel, "Plano"))
    sprints.sort(key=lambda s: s.numero)
    for quando, nome, _ in MARCOS:
        eventos.append(Evento(quando, "marco", nome, ""))
    return eventos, sprints


def on_files(files, config, **kwargs):
    eventos, sprints = coletar(Path(config["docs_dir"]))
    conteudo = montar(eventos, sprints, date.today(), ler_ancoras(Path(config["docs_dir"])))
    files.append(File.generated(config, DESTINO, content=conteudo))
    log.info("historico: %s gerada com %d registros.", DESTINO, len(eventos))
    return files
