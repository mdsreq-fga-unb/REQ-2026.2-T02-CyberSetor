"""Testes do índice dos códigos e da árvore de rastreabilidade (hooks/codigos.py).

Rodar na raiz do repositório: python -m pytest tests/test_codigos.py
"""
import importlib.util
import json
import re
import shutil
import sys
from pathlib import Path

import pytest
from mkdocs.exceptions import PluginError

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "hooks"))
_spec = importlib.util.spec_from_file_location("codigos", RAIZ / "hooks" / "codigos.py")
codigos = importlib.util.module_from_spec(_spec)
sys.modules["codigos"] = codigos
_spec.loader.exec_module(codigos)

DOCS = RAIZ / "docs"
SECAO8 = (DOCS / "requisitos" / "8-requisitos.md").read_text(encoding="utf-8")
F = codigos.ler_fontes(DOCS)
URLS = codigos.urls(F)
INDICE = json.loads(codigos.indice_json(F, URLS))["codigos"]
PAGINA = "requisitos/8-requisitos/"
ARVORE = codigos.arvore(F, URLS, PAGINA, "../../visao/1-cenario-atual/#14-x")


def _copia(tmp_path: Path) -> Path:
    destino = tmp_path / "docs"
    for rel in (codigos.VISAO1, codigos.VISAO2, codigos.SECAO8, codigos.BACKLOG, codigos.B1):
        (destino / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(DOCS / rel, destino / rel)
    return destino


def _trocar(docs: Path, rel: str, antes: str, depois: str) -> None:
    arq = docs / rel
    texto = arq.read_text(encoding="utf-8")
    assert antes in texto
    arq.write_text(texto.replace(antes, depois, 1), encoding="utf-8")


def test_indice_tem_um_codigo_por_ancora_de_definicao():
    def ancoras(rel, padrao):
        return set(re.findall(padrao, (DOCS / rel).read_text(encoding="utf-8")))

    esperado = (
        {f"RF{n}" for n in ancoras(codigos.SECAO8, r'id="rf(\d+)"')}
        | {f"RNF{n}" for n in ancoras(codigos.SECAO8, r'id="rnf(\d+)"')}
        | {f"RN-{n}" for n in ancoras(codigos.SECAO8, r'id="rn-(\d+)"')}
        | {f"OE{n}" for n in ancoras(codigos.VISAO2, r'id="oe(\d+)"')}
        | {f"CP{n}" for n in ancoras(codigos.VISAO2, r'id="cp(\d)"')}
        | ancoras(codigos.BACKLOG, r'"(HU-\d{2}[a-z]?) ·')
        | ancoras(codigos.B1, r"\*\*(G0\d):")
    )
    assert set(INDICE) == esperado
    assert {e["tipo"] for e in INDICE.values()} == set(codigos.ROTULO)


def test_texto_vem_da_definicao_e_url_leva_a_ela():
    rf = INDICE["RF11"]
    assert rf["titulo"] == "Disponibilizar formulário público de inscrição"
    assert rf["resumo"].startswith("Permitir ao interessado se inscrever")
    assert "](" not in rf["resumo"] and "(RF46)" in rf["resumo"]
    assert rf["url"] == "requisitos/8-requisitos/#rf11"
    assert ["História", "HU-07a"] in rf["detalhes"]
    assert INDICE["RNF05"]["titulo"] == "Minimização de dados pessoais"
    assert INDICE["OE02"]["url"] == "visao/2-solucao-proposta/#oe02"
    assert INDICE["OE02"]["detalhes"] == [["Responde a", "O retrabalho de digitação dos dados de participantes"]]
    assert INDICE["CP3"]["titulo"] == "Inscrição de participantes"
    assert INDICE["G03"]["url"] == "requisitos/b1-bpmn-processo-atual/#g03"
    assert INDICE["RN-05"]["titulo"] == "" and INDICE["RN-05"]["resumo"].startswith("A inscrição não é condicionada")
    for e in INDICE.values():
        assert e["resumo"] and len(e["resumo"]) <= codigos.LIMITE + 1
        assert "**" not in e["resumo"] and "<" not in e["resumo"]


def test_historia_traz_o_destino_da_10_2_6():
    assert INDICE["HU-07a"]["destino"] == "MVP" and INDICE["HU-07a"]["mvp"] is True
    assert INDICE["HU-07d"]["destino"] == "MVP"
    assert INDICE["HU-09a"]["destino"] == "Incremento 3" and INDICE["HU-09a"]["mvp"] is False
    assert INDICE["HU-11"]["destino"] == "Posterior"
    assert INDICE["HU-07a"]["resumo"].startswith("Como pessoa interessada")


def test_resumo_longo_e_cortado_em_palavra():
    texto = "palavra " * 80
    curto = codigos.resumir(texto.strip(), 50)
    assert curto.endswith("…") and len(curto) <= 51 and "palavr…" not in curto


def test_href_relativo_entre_paginas():
    assert codigos.href("visao/2-solucao-proposta/#oe01", PAGINA) == "../../visao/2-solucao-proposta/#oe01"
    assert codigos.href("requisitos/10-backlog/#hu-01a", PAGINA) == "../10-backlog/#hu-01a"
    assert codigos.href("requisitos/8-requisitos/#rf01", PAGINA) == "#rf01"


def test_arvore_liga_problema_objetivos_caracteristicas_e_historias():
    assert ARVORE.startswith('<div class="arv" data-arvore>') and "\n\n" not in ARVORE
    assert ARVORE.count('data-oe="OE') == 6
    assert ARVORE.count('data-arv-cp="CP') == 8 and ARVORE.count('data-arv-painel="CP') == 8
    cp3 = ARVORE.split('data-arv-painel="CP3"')[1].split('data-arv-painel="CP4"')[0]
    assert 'data-oe-principal="OE02"' in ARVORE.split('id="arv-cp3"')[1][:200]
    for hu in ("HU-07a", "HU-07b", "HU-07c", "HU-07d", "HU-08"):
        assert f'href="../10-backlog/#{hu.lower()}"' in cp3
    # HU-07a: RF11 (CP3) leva ao RNF05 e ao RNF12 pela matriz 8.4.2; transversais ficam fora da folha.
    folha = cp3.split("#hu-07a")[1].split("</li>")[0]
    assert 'href="#rnf05"' in folha and 'href="#rnf12"' in folha and 'href="#rnf03"' not in folha
    assert 'href="#rf11"' in folha and 'href="#rf23"' not in folha  # RF23 é da CP5


def test_fora_do_mvp_tem_borda_tracejada_e_trilho_dos_transversais():
    cp4 = ARVORE.split('data-arv-painel="CP4"')[1].split('data-arv-painel="CP5"')[0]
    folha = re.search(r'<li class="([^"]*)" data-destino="(\w+)"><a class="arv-no arv-no--hu" href="../10-backlog/#hu-09a"', cp4)
    assert folha and "arv-hu--fora" in folha.group(1) and folha.group(2) == "fora"
    trilho = ARVORE.split('class="arv-trilho"')[1].split("</div>")[0]
    assert "Valem para todas as histórias" in trilho
    assert set(re.findall(r">(RNF\d+)<", trilho)) == {"RNF03", "RNF04", "RNF15", "RNF16", "RNF17", "RNF18", "RNF19"}
    assert "Borda tracejada" in ARVORE


def test_marcador_logo_abaixo_do_titulo_da_8_4():
    trecho = SECAO8.split("## 8.4 Matriz de Rastreabilidade Bidirecional\n", 1)[1].split("**Em resumo.**")[0]
    assert codigos.MARCADOR in trecho


def test_matriz_8_4_2_sem_coluna_de_nome_continua_legivel(tmp_path):
    """A coluna dos requisitos funcionais é achada pelo cabeçalho, não pela posição."""
    docs = _copia(tmp_path)
    arq = docs / codigos.SECAO8
    linhas = []
    dentro = False
    for linha in arq.read_text(encoding="utf-8").splitlines():
        dentro = (dentro or linha.startswith("### 8.4.2")) and not linha.startswith("### 8.4.3")
        if dentro and linha.startswith("|"):
            c = linha.split("|")
            linha = "|".join(c[:2] + c[3:])
        linhas.append(linha)
    arq.write_text("\n".join(linhas), encoding="utf-8")
    f = codigos.ler_fontes(docs)
    assert f.rnf_rfs == F.rnf_rfs and f.transversais == F.transversais


@pytest.mark.parametrize("rel, antes, depois, motivo", [
    (codigos.SECAO8, '| <a id="rf11"></a>**RF11** |', '| <a id="rf11"></a>RF11 |', "RF11"),
    (codigos.SECAO8, '| <a id="rnf05"></a>**RNF05** |', '| RNF05 <a id="rnf05"></a> |', "RNF05"),
    (codigos.SECAO8, '| <a id="rn-05"></a>**RN-05** |', '| <a id="rn-05"></a>RN-05 |', "RN-05"),
    (codigos.VISAO2, '<a id="oe03"></a>**OE03 - ', '<a id="oe03"></a>**OE03: ', "OE03"),
    (codigos.BACKLOG, '??? note "HU-08 ·', '??? info "HU-08 ·', "HU-08"),
    (codigos.B1, "| **G04: ", "| **G04 ", "G04"),
    (codigos.BACKLOG, "HU-09a, HU-10 |", "HU-10 |", "HU-09a"),
    (codigos.SECAO8, "| RNF | Origem (Decisão, Risco Ético ou Norma) | Requisitos Funcionais Relacionados |",
     "| RNF | Origem (Decisão, Risco Ético ou Norma) | Ligações |", "Requisitos Funcionais"),
    (codigos.SECAO8, "#### CP3 — Inscrição de Participantes (OE02; OE01)", "#### CP3 — Inscrição de Participantes", "CP3"),
])
def test_fonte_fora_do_formato_interrompe_o_build(tmp_path, rel, antes, depois, motivo):
    docs = _copia(tmp_path)
    _trocar(docs, rel, antes, depois)
    with pytest.raises(PluginError, match=motivo):
        codigos.ler_fontes(docs)
