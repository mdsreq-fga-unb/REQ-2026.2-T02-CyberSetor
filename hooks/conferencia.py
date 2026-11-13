"""
Confere, a cada build do MkDocs, as cópias dos dados de rastreabilidade das seções 8 e 10.

Cada dado tem uma fonte; as tabelas que o repetem continuam escritas porque são seções do
documento e recebem links, mas não podem divergir dela. Uma divergência interrompe o build
com a lista do que corrigir.

  Dado                    Fonte      Cópias conferidas
  nome do RF              8.2        8.4.1, 10.2.3
  RF e história dona      ficha      8.2, 8.4.1, 10.2.4
  esforço técnico         10.2.3     10.2.4, 10.2.5
  valor                   10.2.2     10.2.4, 10.2.5
  destino                 10.2.4     10.2.5, 10.2.6
  gargalo do RF           8.4.1      8.4.3, 10.2.6
  CP do RF                8.2        8.4.1, 8.4.3
  critérios citados       ficha      seção 8
  dependências            ficha      história existente
"""
from __future__ import annotations

import re
from pathlib import Path

from mkdocs.exceptions import PluginError

import fichas
from fichas import HU, LINHA_RF, LINK_RF, celulas, faixa, trecho

CA = r"CA-\d{2}[a-z]?\.\d+"
LINHA_GARGALO = re.compile(r"^\| \*\*(G\d{2})\*\* \|")
LINHA_CP = re.compile(r"^\| \*\*(CP\d)\*\* \|")
LINHA_VALOR = re.compile(r"^\| \*\*(\d)\*\* \|")
LINHA_INCREMENTO = re.compile(r"^\| (\*\*MVP\*\*|Incremento \d|Posterior) \|")


def _limpo(texto: str) -> str:
    return texto.replace("🔧", "").replace("*", "").strip()


def _lista(valores) -> str:
    return ", ".join(sorted(valores)) or "nenhum"


def conferir_nomes(s, md8: str, md10: str) -> list[str]:
    erros = []
    fontes = {"8.4.1": ("### 8.4.1", "### 8.4.2", md8, LINHA_RF), "10.2.3": ("### 10.2.3", "### 10.2.4", md10, LINK_RF)}
    for secao, (ini, fim, md, padrao) in fontes.items():
        for linha in trecho(md, ini, fim).splitlines():
            m = padrao.match(linha)
            if m and m.group(1) in s.rfs and celulas(linha)[1] != s.rfs[m.group(1)].nome:
                erros.append(f"{m.group(1)}: nome na {secao} difere da 8.2.")
    return erros


def conferir_donas(s, lista, consolidada: dict) -> list[str]:
    erros = []
    donas: dict[str, list[str]] = {}
    for f in lista:
        for r in f.rfs:
            donas.setdefault(r, []).append(f.hu)
    for r, q in s.rfs.items():
        ficha = donas.get(r, [])
        if len(ficha) != 1:
            erros.append(f"{r}: precisa estar em uma ficha só; está em {_lista(ficha)}.")
        if sorted(q.donas) != sorted(ficha):
            erros.append(f"{r}: história na 8.2 ({_lista(q.donas)}) difere da ficha ({_lista(ficha)}).")
        if r in consolidada and sorted(consolidada[r]["hus"]) != sorted(ficha):
            erros.append(f"{r}: história na 10.2.4 ({_lista(consolidada[r]['hus'])}) difere da ficha ({_lista(ficha)}).")
        na_matriz = [h for h, _ in s.verificacao.get(r, [])]
        for h in ficha:
            if h not in na_matriz:
                erros.append(f"{r}: a {h} não aparece na 8.4.1.")
    return erros


def ler_consolidada(md10: str) -> dict:
    tabela = {}
    for linha in trecho(md10, "### 10.2.4", "### 10.2.5").splitlines():
        m = LINK_RF.match(linha)
        if m:
            c = celulas(linha)
            tabela[m.group(1)] = {"hus": re.findall(HU, c[1]), "valor": _limpo(c[2]), "esforco": _limpo(c[3]),
                                  "destino": _limpo(c[4])}
    return tabela


def conferir_priorizacao(p, consolidada: dict, md10: str) -> list[str]:
    erros = []
    for r, c in consolidada.items():
        if _limpo(p.esforco.get(r, "")) != c["esforco"]:
            erros.append(f"{r}: esforço na 10.2.4 difere da 10.2.3.")
        for h in c["hus"]:
            if _limpo(p.valor.get(h, ("", ""))[0]) != c["valor"]:
                erros.append(f"{r}: valor na 10.2.4 difere do valor da {h} na 10.2.2.")
    secao = trecho(md10, "### 10.2.5", "### 10.2.6").splitlines()
    colunas = next((celulas(x) for x in secao if x.startswith("| Valor")), [])
    vistos = set()
    for linha in secao:
        m = LINHA_VALOR.match(linha)
        if not m:
            continue
        for i, celula in enumerate(celulas(linha)[1:], start=1):
            negritos = set(re.findall(r"\*\*(RF\d+)\*\*", celula))
            for r in faixa(celula):
                vistos.add(r)
                c = consolidada.get(r)
                if not c:
                    erros.append(f"{r}: está na 10.2.5 e não na 10.2.4.")
                    continue
                if (m.group(1), colunas[i]) != (c["valor"], c["esforco"]):
                    erros.append(f"{r}: posição na 10.2.5 difere de valor e esforço da 10.2.4.")
                if (r in negritos) != (c["destino"] == "MVP"):
                    erros.append(f"{r}: negrito do MVP na 10.2.5 difere do destino na 10.2.4.")
    for r in set(consolidada) - vistos:
        erros.append(f"{r}: está na 10.2.4 e não na 10.2.5.")
    return erros


def conferir_destinos(consolidada: dict, md10: str) -> list[str]:
    erros = []
    for linha in trecho(md10, "### 10.2.6", "### 10.2.7").splitlines():
        m = LINHA_INCREMENTO.match(linha)
        if not m:
            continue
        nome = _limpo(m.group(1))
        c = celulas(linha)
        rfs = {r for r, v in consolidada.items() if v["destino"] == nome}
        hus = {h for r in rfs for h in consolidada[r]["hus"]}
        if faixa(c[2]) != rfs:
            erros.append(f"{nome}: requisitos na 10.2.6 diferem da 10.2.4 ({_lista(faixa(c[2]) ^ rfs)}).")
        achados = set(re.findall(HU, c[1]))
        if achados != hus:
            erros.append(f"{nome}: histórias na 10.2.6 diferem da 10.2.4 ({_lista(achados ^ hus)}).")
    return erros


def conferir_gargalos(md8: str, md10: str) -> list[str]:
    por_gargalo: dict[str, set[str]] = {}
    for linha in trecho(md8, "### 8.4.1", "### 8.4.2").splitlines():
        m = LINHA_RF.match(linha)
        if m:
            for g in re.findall(r"G\d{2}", celulas(linha)[2]):
                por_gargalo.setdefault(g, set()).add(m.group(1))
    erros = []
    for linha in trecho(md8, "### 8.4.3", "## 8.5").splitlines():
        m = LINHA_GARGALO.match(linha)
        if m and faixa(celulas(linha)[2]) != por_gargalo.get(m.group(1), set()):
            erros.append(f"{m.group(1)}: requisitos na 8.4.3 diferem da 8.4.1.")
    for linha in trecho(md10, "### 10.2.6", "### 10.2.7").splitlines():
        m = LINHA_GARGALO.match(linha)
        if m:
            c = celulas(linha)
            if faixa(c[1]) | faixa(c[2]) != por_gargalo.get(m.group(1), set()):
                erros.append(f"{m.group(1)}: requisitos na 10.2.6 diferem da 8.4.1.")
    return erros


def conferir_caracteristicas(s, md8: str) -> list[str]:
    erros = []
    cp = ""
    for linha in trecho(md8, "### 8.4.1", "### 8.4.2").splitlines():
        m = fichas.CP_MATRIZ.match(linha)
        if m:
            cp = m.group(1)
        m = LINHA_RF.match(linha)
        if m and m.group(1) in s.rfs and s.rfs[m.group(1)].cp != cp:
            erros.append(f"{m.group(1)}: CP na 8.4.1 difere da 8.2.")
    for linha in trecho(md8, "### 8.4.3", "## 8.5").splitlines():
        m = LINHA_CP.match(linha)
        if m:
            rfs = {r for r, q in s.rfs.items() if q.cp == m.group(1)}
            if faixa(celulas(linha)[2]) != rfs:
                erros.append(f"{m.group(1)}: requisitos na 8.4.3 diferem da 8.2.")
    return erros


def conferir_citacoes(lista, md8: str, md10: str) -> list[str]:
    historias = {f.hu for f in lista}
    erros = []
    for f in lista:
        for h in re.findall(HU, f.depende):
            if h not in historias:
                erros.append(f"{f.hu}: depende da {h}, que não tem ficha.")
    criterios = set(re.findall(rf"^    - ({CA}) ", md10, re.M))
    for c in sorted(set(re.findall(CA, md8)) - criterios):
        erros.append(f"{c}: citado na seção 8 e sem ficha que o defina.")
    return erros


def conferir(md8: str, md10: str) -> list[str]:
    s = fichas.ler_secao8(md8)
    p = fichas.ler_priorizacao(md10)
    lista = fichas.ler_fichas(md10.splitlines())
    consolidada = ler_consolidada(md10)
    return [
        *conferir_nomes(s, md8, md10),
        *conferir_donas(s, lista, consolidada),
        *conferir_priorizacao(p, consolidada, md10),
        *conferir_destinos(consolidada, md10),
        *conferir_gargalos(md8, md10),
        *conferir_caracteristicas(s, md8),
        *conferir_citacoes(lista, md8, md10),
    ]


def on_pre_build(config, **kwargs):
    docs = Path(config["docs_dir"])
    erros = conferir((docs / fichas.SECAO_RF).read_text(encoding="utf-8"),
                     (docs / fichas.SECAO_HU).read_text(encoding="utf-8"))
    if erros:
        raise PluginError("conferencia: as seções 8 e 10 divergem:\n  - " + "\n  - ".join(erros))
