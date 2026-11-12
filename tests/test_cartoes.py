"""Testes dos cartões de requisitos da seção 8 (hooks/cartoes.py).

Rodar na raiz do repositório: python -m pytest tests/test_cartoes.py
"""
import importlib.util
import re
import sys
from pathlib import Path

import pytest
from mkdocs.exceptions import PluginError

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "hooks"))
_spec = importlib.util.spec_from_file_location("cartoes", RAIZ / "hooks" / "cartoes.py")
cartoes = importlib.util.module_from_spec(_spec)
sys.modules["cartoes"] = cartoes
_spec.loader.exec_module(cartoes)

SECAO8 = (RAIZ / "docs" / "requisitos" / "8-requisitos.md").read_text(encoding="utf-8")
BACKLOG = (RAIZ / "docs" / "requisitos" / "10-backlog.md").read_text(encoding="utf-8")


def test_faixa_expande_intervalos():
    assert cartoes.faixa("RF01 a RF03, RF09") == ["RF01", "RF02", "RF03", "RF09"]
    assert cartoes.faixa("RF04, RF18") == ["RF04", "RF18"]


def test_um_cartao_por_requisito_com_a_ancora_original():
    saida = cartoes.compor(SECAO8, cartoes.carregar(SECAO8, BACKLOG))
    rfs = set(re.findall(r'<a id="(rf\d+)"></a>\*\*RF', SECAO8))
    rnfs = set(re.findall(r'<a id="(rnf\d+)"></a>\*\*RNF', SECAO8))
    assert rfs and rnfs
    for ancora in rfs | rnfs:
        assert saida.count(f'id="{ancora}"') == 1, ancora
    assert "| Identificador |" not in saida.split("## 8.4")[0]


def test_destino_vem_da_10_2_4_e_classe_da_10_2_7():
    f = cartoes.carregar(SECAO8, BACKLOG)
    saida = cartoes.compor(SECAO8, f)

    def destino(ancora):
        return re.search(rf'<article [^>]*id="{ancora}" data-destino="(\w+)"', saida).group(1)

    for cod, info in f.destino.items():
        assert destino(cod.lower()) == ("mvp" if info["destino"].startswith("MVP") else "fora"), cod
    for r, c in f.classe_rnf.items():
        assert destino(r.lower()) == ("fora" if c.startswith("Evolutivos") else "mvp"), r


def test_historia_ligada_ao_backlog_e_rnf_inverso():
    linha = (
        '| <a id="rf16"></a>**RF16** | Registrar frequência | Permitir registrar. | OE03 \\| [HU-09a](10-backlog.md#hu-09a) |'
    )
    f = cartoes.Fontes(
        destino={"RF16": {"valor": "2", "esforco": "3", "destino": "Incremento 3"}},
        classe_rnf={},
        matriz_rf={"RF16": {"gargalo": "G03", "historia": "HU-09a (CA-09a.1)", "cobertura": "Total"}},
        rnf_rfs={"RNF09": {"origem": "", "texto": "RF16 a RF19", "transversal": False, "rfs": ["RF16", "RF17"]}},
    )
    html = cartoes.cartao_rf(linha, f)
    assert 'data-destino="fora"' in html and "Fora do MVP · Incremento 3" in html
    assert "[HU-09a](10-backlog.md#hu-09a)" in html and "CA-09a.1" in html
    assert "[RNF09](#rnf09)" in html


def test_selo_aplicado_antes_vai_para_o_cartao():
    linha = (
        "| <a id=\"rf01\"></a>**RF01** <span class='selo selo--concluido' data-situacao='concluido'>Concluído</span> "
        "| Cadastrar | Desc. | MROSC \\| [HU-01a](10-backlog.md#hu-01a) |"
    )
    f = cartoes.Fontes(destino={"RF01": {"valor": "4", "esforco": "1", "destino": "MVP"}})
    html = cartoes.cartao_rf(linha, f)
    assert 'data-situacao="concluido"' in html and "selo--concluido" in html


def test_falha_sem_a_tabela_de_destino():
    with pytest.raises(PluginError):
        cartoes.carregar(SECAO8, "# 10. Backlog\n")


def test_matriz_vira_trilhas_com_volta_ao_cartao():
    saida = cartoes.compor(SECAO8, cartoes.carregar(SECAO8, BACKLOG))
    matriz = saida.split("## 8.4", 1)[1].split("## 8.5", 1)[0]
    for tipo in ("rf", "rnf", "g", "cp"):
        assert f"rt-lista--{tipo}" in matriz, tipo
    assert 'id="m-rf01"' in matriz and 'id="m-rnf19"' in matriz
    assert "[ver na 8.4.1](#m-rf01)" in saida
    assert "| **RF01** |" not in matriz
