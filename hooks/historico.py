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

# Calendário da disciplina (plano de ensino FGA0313, 2026.2).
MARCOS = [
    (date(2026, 9, 8), "Unidade 1", "u1"),
    (date(2026, 10, 13), "Unidade 2", "u2"),
    (date(2026, 11, 17), "Unidade 3", "u3"),
    (date(2026, 11, 24), "Questionário de avaliação geral", "qag"),
    (date(2026, 12, 1), "Unidade 4", "u4"),
]

CABECALHO_VERSOES = re.compile(r"^\|\s*Data\s*\|\s*Vers", re.IGNORECASE)
DATA = re.compile(r"^\d{2}/\d{2}/\d{4}$")
LINK_MD = re.compile(r"^\[([^\]]+)\]\(([^)]+)\)$")
CODIGO = re.compile(r"\b(RNF\d{2}|RF\d{2}|HU-\d{2}[a-z]?|CA-\d{2}[a-z]?)(?=[\s.,;:)\]]|$)")
PERIODO = re.compile(r"Per[ií]odo da Sprint\*?\*?\s*\|\s*(\d{2}/\d{2}/\d{4}).*?a\s+(\d{2}/\d{2}/\d{4})")

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
    return Sprint(numero, _data(m.group(1), caminho, 0), _data(m.group(2), caminho, 0))


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


def montar(eventos: list[Evento], sprints: list[Sprint], hoje: date) -> str:
    eventos = sorted(eventos, key=lambda e: (e.quando, e.tipo != "marco"), reverse=True)
    for e in eventos:
        e.sprint = sprint_de(e.quando, sprints)  # type: ignore[attr-defined]
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

    out: list[str] = []
    w = out.append
    w("---\nhide:\n  - toc\n---\n")
    w("# Histórico e evolução\n")
    w(
        "Linha do tempo do projeto: versões de cada documento do site, reuniões da equipe, interações com o "
        "Instituto No Setor, sprints e marcos da disciplina. Cada registro leva ao documento de origem, onde está "
        "o conteúdo vigente; o histórico do Documento de Visão como um todo está no "
        "[Sumário e versões](../visao/index.md#historico-de-versoes).\n"
    )

    # 1. Resumo: onde o projeto está hoje
    atual = next((s for s in sprints if s.inicio <= hoje <= s.fim), None)
    proximo = next((m for m in MARCOS if m[0] >= hoje), None)
    n_cliente = sum(1 for e in atas if e.tipo == "ata-cliente")
    blocos = [
        ("Sprint atual", f"Sprint {atual.numero}" if atual else "Fora de sprint",
         f"{atual.inicio:%d/%m} a {atual.fim:%d/%m}" if atual else ""),
        ("Próximo marco", proximo[1] if proximo else "Encerrado",
         (f"{proximo[0]:%d/%m} · em {(proximo[0] - hoje).days} dias" if proximo and proximo[0] > hoje
          else "hoje" if proximo else "")),
        ("Documentos", str(len(documentos)), f"{_n(len(versoes), 'versão', 'versões')} registradas"),
        ("Reuniões", str(len(atas)), f"{n_cliente} com o Instituto"),
    ]
    w('<div class="grid cards hist-resumo" markdown="0"><ul>')
    for rotulo, valor, detalhe in blocos:
        w(f'<li><span class="hist-resumo__rotulo">{_e(rotulo)}</span>'
          f'<strong class="hist-resumo__valor">{_e(valor)}</strong>'
          f'<span class="hist-resumo__detalhe">{_e(detalhe)}</span></li>')
    w("</ul></div>\n")

    # 2. Andamento por sprint e marcos
    w("## Andamento por sprint\n")
    w("Cada cartão filtra a linha do tempo pela sprint.\n")
    regua = [f for f in faixas if not f.startswith("Após")]
    maior = max((sum(1 for e in reais if e.sprint == f) for f in regua), default=1) or 1  # type: ignore[attr-defined]
    w('<div class="hist-andamento" markdown="0">')
    for f in regua:
        doF = [e for e in reais if e.sprint == f]  # type: ignore[attr-defined]
        nv = sum(1 for e in doF if e.tipo == "versao")
        na = sum(1 for e in doF if e.tipo.startswith("ata"))
        nd = len({e.origem_rotulo for e in doF if e.tipo == "versao"})
        s = next((s for s in sprints if f == f"Sprint {s.numero}"), None)
        periodo = f"{s.inicio:%d/%m} a {s.fim:%d/%m}" if s else f"até {sprints[0].inicio:%d/%m}" if sprints else ""
        corrente = s is not None and s.inicio <= hoje <= s.fim
        pct = round(100 * len(doF) / maior)
        w(
            f'<a class="hist-faixa{" hist-faixa--corrente" if corrente else ""}" href="#{slug(f)}" '
            f'data-filtro="sprint" data-valor="{slug(f)}">'
            f'<span class="hist-faixa__nome">{_e(f)}{" · atual" if corrente else ""}</span>'
            f'<span class="hist-faixa__periodo">{_e(periodo)}</span>'
            f'<span class="hist-faixa__barra"><span style="width:{pct}%"></span></span>'
            f'<span class="hist-faixa__numeros">{_n(nv, "versão", "versões")} · {_n(na, "reunião", "reuniões")} · '
            f'{_n(nd, "documento alterado", "documentos alterados")}</span></a>'
        )
    w("</div>\n")
    w('<ol class="hist-marcos" markdown="0">')
    for quando, nome, _ in MARCOS:
        estado = "feito" if quando < hoje else "hoje" if quando == hoje else "previsto"
        rotulo = {"feito": "realizado", "hoje": "hoje", "previsto": "previsto"}[estado]
        w(f'<li class="hist-marcos__item hist-marcos__item--{estado}"><strong>{_e(nome)}</strong>'
          f'<span>{quando:%d/%m/%Y} · {rotulo}</span></li>')
    w("</ol>\n")

    # 3. Linha do tempo com filtros
    def opcoes(valores: list[str], rotulo=lambda v: v) -> str:
        return '<option value="">Todos</option>' + "".join(
            f'<option value="{_e(slug(v))}">{_e(rotulo(v))}</option>' for v in valores
        )

    tipos = '<option value="">Todos</option>' + "".join(
        f'<option value="{k}">{_e(v)}</option>' for k, v in TIPOS.items()
    )
    w("## Linha do tempo\n")
    por_tipo = {k: sum(1 for e in eventos if e.tipo == k) for k in TIPOS}
    w('<div class="hist-filtros" id="hist-filtros" markdown="0">')
    w('<label class="hist-filtros__busca"><span class="hist-filtros__rotulo">Buscar na linha do tempo</span>'
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
        w(f'<section class="hist-grupo" id="{slug(f)}" markdown="1">\n')
        w(f'<h3 class="hist-grupo__titulo">{_e("Próximos marcos" if f.startswith("Após") else f)}</h3>\n')
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
                rodape.append(" ".join(f'<span class="hist-codigo">{_e(c)}</span>' for c in e.codigos))
            if rodape:
                w(f'<p class="hist-item__rodape">{" · ".join(rodape)}</p>\n')
            w("</article>\n")
        w("</section>\n")
    w("</div>\n")

    # 4. Evolução por documento (referência)
    w("## Evolução por documento\n")
    w("| Documento | Versão vigente | Versões | Primeira | Última |")
    w("|---|---|---:|---|---|")
    por_doc: dict[str, list[Evento]] = {}
    for e in versoes:
        por_doc.setdefault(e.origem or "", []).append(e)
    for origem, lista in sorted(por_doc.items(), key=lambda kv: max(e.quando for e in kv[1]), reverse=True):
        lista.sort(key=lambda e: e.quando)
        w(
            f"| [{lista[0].origem_rotulo}]({_link(origem)}) | {lista[-1].versao} | {len(lista)} | "
            f"{lista[0].quando:%d/%m/%Y} | {lista[-1].quando:%d/%m/%Y} |"
        )
    w("")

    w(
        f"<small>Registros: {len(versoes)} versões de {len(documentos)} documentos, {len(atas)} reuniões, "
        f"{sum(1 for e in reais if e.tipo == 'sprint')} sprints e {len(MARCOS)} marcos.</small>\n"
    )
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
        m = PLANOS.match(rel)
        if m:
            s = ler_sprint(rel, int(m.group(1)), texto)
            if s:
                sprints.append(s)
                eventos.append(Evento(s.inicio, "sprint", f"Sprint {s.numero}",
                                      f"Período de {s.inicio:%d/%m/%Y} a {s.fim:%d/%m/%Y}.", rel, "Plano"))
    sprints.sort(key=lambda s: s.numero)
    for quando, nome, _ in MARCOS:
        eventos.append(Evento(quando, "marco", nome, ""))
    return eventos, sprints


def on_files(files, config, **kwargs):
    eventos, sprints = coletar(Path(config["docs_dir"]))
    conteudo = montar(eventos, sprints, date.today())
    files.append(File.generated(config, DESTINO, content=conteudo))
    log.info("historico: %s gerada com %d registros.", DESTINO, len(eventos))
    return files
