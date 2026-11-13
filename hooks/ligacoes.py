"""
Ligações entre os códigos da documentação, a cada build do MkDocs.

Transforma em link, no texto que recebe, cada código que tem um lugar próprio na documentação:
  HU-xx e CA-xx.n  → história e critério de aceitação na seção 10;
  RFxx, RNFxx, RN-xx → requisito ou regra na seção 8;
  OExx e CPx      → objetivo específico (2.2) e característica de produto (2.3);
  Gxx             → gargalo do modelo BPMN (anexo B1);
  "seção 3.3.9"   → o título dessa seção, procurado nos documentos de visão e de requisitos.

Também dá âncora aos critérios de aceitação da seção 10 (#ca-01a-1) e aos gargalos do anexo B1
(#g01), que antes não tinham, sem mudar o texto dessas páginas.

Texto que já é link fica como está. Um código sem destino conhecido também fica como texto,
para nunca gerar link quebrado.
"""
from __future__ import annotations

import posixpath
import re
from pathlib import Path

from markdown.extensions.toc import slugify

DOCS_NUMERADOS = ("visao", "requisitos")
SECAO8 = "requisitos/8-requisitos.md"
BACKLOG = "requisitos/10-backlog.md"
VISAO2 = "visao/2-solucao-proposta.md"
B1 = "requisitos/b1-bpmn-processo-atual.md"

TITULO = re.compile(r"^#{1,4} (\d+(?:\.\d+)*)\.? +(.+?)\s*$")
LINK_MD = re.compile(r"<a\b[^>]*>.*?</a>|\[[^\]]*\]\([^)]*\)|<[^>]+>")
CA_ITEM = re.compile(r"^(\s*- )(CA-(\d{2}[a-z]?)\.(\d+))\b")
G_LINHA = re.compile(r"^\| \*\*(G0\d):")

CODIGO = re.compile(
    r"(?<![\w#/-])("
    r"HU-\d{2}[a-z]?"
    r"|CA-\d{2}[a-z]?\.\d+"
    r"|RNF\d{2}|RF\d{2}|RN-\d{2}"
    r"|OE\d{2}|CP\d|G0\d"
    r")(?![\w-])"
)
SECAO_TXT = re.compile(r"([Ss]eç(?:ão|ões)\s+)((?:\d+(?:\.\d+)+)(?:(?:,\s*|\s+e\s+)\d+(?:\.\d+)+)*)")
NUMERO = re.compile(r"\d+(?:\.\d+)+")


def ancora_ca(codigo: str) -> str:
    """CA-01a.1 → ca-01a-1."""
    return codigo.lower().replace(".", "-")


class Indice:
    """Onde mora cada código e cada seção numerada, lido dos arquivos em docs/."""

    def __init__(self, docs: Path):
        self.secoes: dict[str, tuple[str, str]] = {}
        self.ancoras: dict[str, set[str]] = {}
        for pasta in DOCS_NUMERADOS:
            for arq in sorted((docs / pasta).glob("*.md")):
                rel = arq.relative_to(docs).as_posix()
                texto = arq.read_text(encoding="utf-8")
                ids = set(re.findall(r'id="([\w-]+)"', texto))
                for linha in texto.splitlines():
                    m = TITULO.match(linha)
                    if m and m.group(1) not in self.secoes:
                        slug = slugify(f"{m.group(1)} {m.group(2)}", "-")
                        self.secoes[m.group(1)] = (rel, slug)
                    m = CA_ITEM.match(linha)
                    if m:
                        ids.add(ancora_ca(m.group(2)))
                    m = G_LINHA.match(linha)
                    if m:
                        ids.add(m.group(1).lower())
                self.ancoras[rel] = ids

    def destino(self, codigo: str) -> tuple[str, str] | None:
        c = codigo.upper() if not codigo.startswith("CA-") else codigo
        if c.startswith("HU-"):
            alvo = (BACKLOG, c.lower())
        elif c.startswith("CA-"):
            alvo = (BACKLOG, ancora_ca(c))
        elif c.startswith(("RF", "RNF", "RN-")):
            alvo = (SECAO8, c.lower())
        elif c.startswith(("OE", "CP")):
            alvo = (VISAO2, c.lower())
        elif c.startswith("G0"):
            alvo = (B1, c.lower())
        else:
            return None
        return alvo if alvo[1] in self.ancoras.get(alvo[0], set()) else None

    def href(self, alvo: tuple[str, str], pagina: str) -> str:
        arq, frag = alvo
        if arq == pagina:
            return f"#{frag}"
        rel = posixpath.relpath(arq, posixpath.dirname(pagina))
        return f"{rel}#{frag}"

    def ligar(self, texto: str, pagina: str) -> str:
        """Liga códigos e seções num trecho de Markdown, sem mexer no que já é link ou HTML."""
        partes, pos = [], 0
        for m in LINK_MD.finditer(texto):
            partes.append(self._ligar_solto(texto[pos:m.start()], pagina))
            partes.append(m.group(0))
            pos = m.end()
        partes.append(self._ligar_solto(texto[pos:], pagina))
        return "".join(partes)

    def _ligar_solto(self, texto: str, pagina: str) -> str:
        def sec(m: re.Match) -> str:
            def num(n: re.Match) -> str:
                alvo = self.secoes.get(n.group(0))
                return f"[{n.group(0)}]({self.href(alvo, pagina)})" if alvo else n.group(0)

            return m.group(1) + NUMERO.sub(num, m.group(2))

        texto = SECAO_TXT.sub(sec, texto)
        saida, pos = [], 0
        for m in LINK_MD.finditer(texto):  # não religar as seções que acabaram de virar link
            saida.append(self._codigos(texto[pos:m.start()], pagina))
            saida.append(m.group(0))
            pos = m.end()
        saida.append(self._codigos(texto[pos:], pagina))
        return "".join(saida)

    def _codigos(self, texto: str, pagina: str) -> str:
        def cod(m: re.Match) -> str:
            alvo = self.destino(m.group(1))
            return f"[{m.group(1)}]({self.href(alvo, pagina)})" if alvo else m.group(1)

        return CODIGO.sub(cod, texto)


_cache: dict[str, Indice] = {}


def indice(docs_dir: str) -> Indice:
    if docs_dir not in _cache:
        _cache[docs_dir] = Indice(Path(docs_dir))
    return _cache[docs_dir]


def ancorar(md: str, pagina: str) -> str:
    """Âncoras dos critérios de aceitação (seção 10) e dos gargalos (anexo B1)."""
    saida = []
    for linha in md.splitlines():
        if pagina == BACKLOG:
            linha = CA_ITEM.sub(lambda m: f'{m.group(1)}<a id="{ancora_ca(m.group(2))}"></a>{m.group(2)}', linha)
        elif pagina == B1:
            linha = G_LINHA.sub(lambda m: f'| <a id="{m.group(1).lower()}"></a>**{m.group(1)}:', linha)
        saida.append(linha)
    return "\n".join(saida)


def on_pre_build(config, **kwargs):
    _cache.clear()  # o mkdocs serve reconstrói o índice a cada mudança


def on_page_markdown(markdown, page, config, files, **kwargs):
    if page.file.src_uri in (BACKLOG, B1):
        return ancorar(markdown, page.file.src_uri)
    return markdown
