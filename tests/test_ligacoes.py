"""Testes das ligações entre códigos da documentação (hooks/ligacoes.py).

Rodar na raiz do repositório: python -m pytest tests/test_ligacoes.py
"""
import importlib.util
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "hooks"))
_spec = importlib.util.spec_from_file_location("ligacoes", RAIZ / "hooks" / "ligacoes.py")
ligacoes = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ligacoes)

IND = ligacoes.Indice(RAIZ / "docs")
P8 = "requisitos/8-requisitos.md"


def test_codigos_viram_links_para_a_fonte():
    t = IND.ligar("HU-01a (CA-01a.1); OE04; CP3; G02; RF07 e RNF02; RN-01", P8)
    assert "[HU-01a](10-backlog.md#hu-01a)" in t
    assert "[CA-01a.1](10-backlog.md#ca-01a-1)" in t
    assert "[OE04](../visao/2-solucao-proposta.md#oe04)" in t
    assert "[CP3](../visao/2-solucao-proposta.md#cp3)" in t
    assert "[G02](b1-bpmn-processo-atual.md#g02)" in t
    assert "[RF07](#rf07)" in t and "[RNF02](#rnf02)" in t and "[RN-01](#rn-01)" in t


def test_secoes_numeradas_levam_ao_titulo():
    t = IND.ligar("Seções 3.3.1 e 3.3.2; seção 8.5.1", P8)
    assert "[3.3.1](../visao/3-intervencao-social.md#331-" in t
    assert "[3.3.2](../visao/3-intervencao-social.md#332-" in t
    assert "[8.5.1](#851-perfis-de-acesso-e-permissoes-cp1-e-transversal)" in t


def test_nao_mexe_em_link_html_nem_em_codigo_desconhecido():
    original = '[RF01](#rf01) <span id="rf02">x</span> HU-99 RF99'
    assert IND.ligar(original, P8) == original


def test_idempotente():
    uma = IND.ligar("RF01 a RF06, HU-07c (CA-07c.1)", P8)
    assert IND.ligar(uma, P8) == uma


def test_ancoras_de_criterio_e_gargalo():
    assert ligacoes.ancorar("    - CA-01a.1 Texto", ligacoes.BACKLOG) == '    - <a id="ca-01a-1"></a>CA-01a.1 Texto'
    assert ligacoes.ancorar("| **G01: Editais** | x |", ligacoes.B1) == '| <a id="g01"></a>**G01: Editais** | x |'


def test_nao_liga_dentro_de_link_html():
    original = '<a class="rt-rf" href="#rf04">RF04</a>'
    assert IND.ligar(original, P8) == original
