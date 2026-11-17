"""
Linha do tempo das reuniões, composta a cada build do MkDocs em gestao/atas/index.md.

A fonte continua sendo o Markdown do índice: as tabelas "Reuniões da equipe" e "Interações com o
cliente" (lidas também por hooks/historico.py). Na página publicada, as duas tabelas dão lugar a
uma lista única de cartões recolhíveis, da reunião mais recente para a mais antiga. Cada cartão
traz a data, o tipo (Instituto, Equipe ou Cerimônia ScrumXP), a sprint, o título e, quando a ata
publicada tem a seção "Decisões", as decisões dela, com os códigos ligados à definição
(hooks/ligacoes.py). Sem ata publicada, o cartão mostra o texto da tabela.

Ata que o mkdocs.yml exclui do site não recebe link nem tem as decisões lidas.
O filtro por tipo fica em assets/javascripts/f2-reunioes.js; sem JavaScript, tudo aparece.
"""
from __future__ import annotations

import html
import re
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

import historico
import ligacoes

PAGINA = "gestao/atas/index.md"
PASTA = "gestao/atas"
SPRINTS = "gestao/sprints"

TIPOS = {"instituto": "Instituto", "equipe": "Equipe", "cerimonia": "Cerimônia ScrumXP"}
MESES = ("janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto",
         "setembro", "outubro", "novembro", "dezembro")

TITULO_SECAO = re.compile(r"^## (.+)$")
DECISOES = re.compile(r"^##\s+(?:\d+\.\s+)?Decisões\s*$")
ROTULO = re.compile(r"^D?\d+$")
SEPARA = re.compile(r"(?<!\\)\|")
NEGRITO = re.compile(r"\*\*(.+?)\*\*")
# Decisões sobre o uso de IA ficam só na ata: o cartão conta a decisão, mas não a lista.
SO_NA_ATA = re.compile(r"\bIA\b|(?i:intelig[eê]ncia artificial)")


@dataclass
class Reuniao:
    quando: date
    tipo: str
    titulo: str
    texto: str
    formato: str = ""
    ata: str | None = None  # nome do arquivo na pasta das atas
    decisoes: list[str] = field(default_factory=list)
    sprint: str = ""


def _celulas(linha: str) -> list[str]:
    return [c.strip() for c in SEPARA.split(linha.strip())[1:-1]]


def ler_decisoes(texto: str) -> list[str]:
    """Texto da coluna "Decisão" da seção "Decisões" de uma ata (linhas D1, D2… ou 1, 2…)."""
    saida, dentro = [], False
    for linha in texto.splitlines():
        if linha.startswith("## "):
            dentro = bool(DECISOES.match(linha))
            continue
        if dentro and linha.startswith("|"):
            c = _celulas(linha)
            if len(c) >= 2 and ROTULO.match(c[0]) and c[1]:
                saida.append(c[1])
    return saida


def ler_reunioes(indice: str) -> list[Reuniao]:
    """Reuniões das tabelas do índice, pelo mesmo leitor do histórico."""
    reunioes = []
    for e in historico.ler_atas(indice):
        ata = e.origem.rsplit("/", 1)[1] if e.origem else None
        if e.tipo == "ata-cliente":
            formato = e.titulo.split(" · ", 1)[-1]
            titulo, _, resto = e.descricao.partition(": ")
            if not resto:  # sem "assunto: detalhe", o título é a frase até o travessão e o texto vai inteiro
                titulo, resto = e.descricao.split(" — ", 1)[0], e.descricao
            resto = resto[:1].upper() + resto[1:]
            reunioes.append(Reuniao(e.quando, "instituto", titulo, resto, formato, ata))
        else:
            cerimonia = e.titulo.startswith("Sprint ") or "sprint-" in (ata or "")
            reunioes.append(Reuniao(e.quando, "cerimonia" if cerimonia else "equipe", e.titulo, e.descricao, ata=ata))
    reunioes.sort(key=lambda r: r.quando, reverse=True)  # sort estável: no mesmo dia, a ordem do índice
    return reunioes


def ler_sprints(docs: Path) -> list[historico.Sprint]:
    sprints = []
    for arq in sorted((docs / SPRINTS).glob("sprint-*.md")):
        m = re.match(r"sprint-(\d+)\.md$", arq.name)
        if m:
            s = historico.ler_sprint(arq.relative_to(docs).as_posix(), int(m.group(1)), arq.read_text(encoding="utf-8"))
            if s:
                sprints.append(s)
    return sorted(sprints, key=lambda s: s.numero)


def _texto_puro(md: str) -> str:
    return html.escape(NEGRITO.sub(r"\1", md).replace("*", ""))


def _data(d: date) -> str:
    return f'<time datetime="{d.isoformat()}">{d:%d/%m/%Y}</time>'


def cartao(r: Reuniao, ligar) -> list[str]:
    n = len(r.decisoes)
    meta = [m for m in (r.formato, r.sprint, f"{n} decis{'ões' if n > 1 else 'ão'}" if n else "") if m]
    out = [
        f'<details class="reuniao reuniao--{r.tipo}" data-tipo="{r.tipo}" markdown>',
        '<summary class="reuniao__cabeca">'
        f'<span class="reuniao__data">{_data(r.quando)}</span>'
        f'<span class="reuniao__tipo">{TIPOS[r.tipo]}</span>'
        f'<span class="reuniao__titulo">{_texto_puro(r.titulo)}</span>'
        + (f'<span class="reuniao__meta">{" · ".join(html.escape(m) for m in meta)}</span>' if meta else "")
        + "</summary>",
        "",
    ]
    listadas = [d for d in r.decisoes if not SO_NA_ATA.search(d)]
    if listadas:
        out += [f"- {ligar(d)}" for d in listadas]
    elif r.texto and not r.decisoes:
        out.append(ligar(r.texto))
    out.append("")
    if r.ata:
        out.append(f"[Ler a ata]({r.ata}){{ .reuniao__ata }}")
    else:
        out.append('<span class="reuniao__sem-ata">Sem ata publicada neste site.</span>')
    out += ["", "</details>", ""]
    return out


def compor(reunioes: list[Reuniao], ligar) -> str:
    n = {t: sum(r.tipo == t for r in reunioes) for t in TIPOS}
    resumo = (f"{n['instituto']} interações com o Instituto, {n['equipe']} reuniões da equipe "
              f"e {n['cerimonia']} cerimônias ScrumXP")
    out = [
        "## Linha do tempo",
        "",
        '<a id="reunioes-da-equipe"></a><a id="interacoes-com-o-cliente"></a>',
        "",
        f'<p class="reunioes__resumo">{len(reunioes)} registros: {resumo}.</p>',
        "",
        '<div class="reunioes" markdown>',
        "",
    ]
    mes = None
    for r in reunioes:
        if (r.quando.year, r.quando.month) != mes:
            mes = (r.quando.year, r.quando.month)
            out += [f'<p class="reunioes__mes">{MESES[r.quando.month - 1].capitalize()} de {r.quando.year}</p>', ""]
        out += cartao(r, ligar)
    out += ["</div>", ""]
    return "\n".join(out)


def substituir(markdown: str, bloco: str) -> str:
    """Troca as seções-fonte (equipe e cliente) pelo bloco, no lugar da primeira delas."""
    linhas = markdown.splitlines()
    inicio = fim = None
    for i, linha in enumerate(linhas):
        m = TITULO_SECAO.match(linha)
        if not m:
            continue
        nome = m.group(1).lower()
        fonte = "equipe" in nome or "cliente" in nome
        if fonte and inicio is None:
            inicio = i
        elif not fonte and inicio is not None:
            fim = i
            break
    if inicio is None:
        return markdown
    fim = len(linhas) if fim is None else fim
    return "\n".join(linhas[:inicio] + [bloco] + linhas[fim:])


def montar(markdown: str, docs: Path, publicada, ligar) -> str:
    reunioes = ler_reunioes(markdown)
    sprints = ler_sprints(docs)
    for r in reunioes:
        r.sprint = historico.sprint_de(r.quando, sprints) if sprints else ""
        if r.sprint == "Concepção":  # o período antes da Sprint 1 é a Sprint 0 na página de sprints
            r.sprint = "Sprint 0"
        if r.ata and not publicada(f"{PASTA}/{r.ata}"):
            r.ata = None
        if r.ata:
            r.decisoes = ler_decisoes((docs / PASTA / r.ata).read_text(encoding="utf-8"))
    return substituir(markdown, compor(reunioes, ligar))


def on_page_markdown(markdown, page, config, files, **kwargs):
    if page.file.src_uri != PAGINA:
        return markdown
    docs = Path(config["docs_dir"])
    ind = ligacoes.indice(config["docs_dir"])

    def publicada(caminho: str) -> bool:
        f = files.get_file_from_path(caminho)
        return f is not None and f.inclusion.is_included()

    return montar(markdown, docs, publicada, lambda t: ind.ligar(t, PAGINA))
