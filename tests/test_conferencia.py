"""Testes da conferência das seções 8 e 10 (hooks/conferencia.py).

Cada caso planta uma divergência no texto real das seções e confere que ela é apontada.
Rodar na raiz do repositório: python -m pytest tests/test_conferencia.py
"""
import sys
from pathlib import Path

import pytest
from mkdocs.exceptions import PluginError

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "hooks"))

import conferencia  # noqa: E402

MD8 = (RAIZ / "docs/requisitos/8-requisitos.md").read_text(encoding="utf-8")
MD10 = (RAIZ / "docs/requisitos/10-backlog.md").read_text(encoding="utf-8")


def _trocar(texto: str, de: str, para: str) -> str:
    assert de in texto, de
    return texto.replace(de, para, 1)


def test_documento_atual_nao_diverge():
    assert conferencia.conferir(MD8, MD10) == []


@pytest.mark.parametrize(
    "de, para, esperado",
    [
        ("| Requisito | Gargalo BPMN |", "| Requisito | Nome | Gargalo BPMN |",
         "8.4.1: colunas diferentes das esperadas"),
        ("| RNF | Origem (", "| RNF | Propriedade de Qualidade | Origem (", "8.4.2: colunas diferentes das esperadas"),
        ("| **RF05** | G02 |", "| **RF99** | G02 |", "RF05: está na 8.2 e não na 8.4.1."),
        ("| **RF05** | G02 |", "| **RF99** | G02 |", "RF99: está na 8.4.1 e não na 8.2."),
        ("| **RNF20** | Seção 3.3.10 | RF16 |\n", "", "RNF20: está na 8.3 e não na 8.4.2."),
        ("| HU-01a (CA-01a.1) |", "| HU-01b (CA-01b.1) |", "RF01: a HU-01a não aparece na 8.4.1."),
        ("| **RF07** | G02 |", "| **RF07** | G01, G02 |",
         "G01: requisitos na 8.4.3 diferem da 8.4.1."),
        ("| **CP3** | Inscrição de participantes | RF11 a RF15, RF42, RF46 |",
         "| **CP3** | Inscrição de participantes | RF11 a RF15, RF42 |",
         "CP3: requisitos na 8.4.3 diferem da 8.2."),
        ("HU-01a (CA-01a.1)", "HU-01a (CA-01a.99)", "CA-01a.99: citado na seção 8 e sem ficha que o defina."),
    ],
)
def test_divergencia_na_secao_8(de, para, esperado):
    erros = conferencia.conferir(_trocar(MD8, de, para), MD10)
    assert any(esperado in e for e in erros), erros


@pytest.mark.parametrize(
    "de, para, esperado",
    [
        ("| Código | Esforço | Complexidade |", "| Código | Requisito funcional | Esforço | Complexidade |",
         "10.2.3: colunas diferentes das esperadas"),
        ("| [RF01](8-requisitos.md#rf01) | 2 | 1 | 1 | 1,3 | **1** |\n", "", "RF01: está na 8.2 e não na 10.2.3."),
        ("| [RF02](8-requisitos.md#rf02) | 2 | 1 | 1 | 1,3 | **1** |\n",
         "| [RF02](8-requisitos.md#rf02) | 2 | 1 | 1 | 1,3 | **1** |\n| [RF02](8-requisitos.md#rf02) | 2 | 1 | 1 | 1,3 | **1** |\n",
         "RF02: aparece mais de uma vez na 10.2.3."),
        ("**Requisitos funcionais:** RF01, RF02, RF03", "**Requisitos funcionais:** RF02, RF03",
         "RF01: precisa estar em uma ficha só; está em nenhum."),
        ("| Código | Valor | Esforço técnico | Destino |", "| Código | Histórias | Valor | Esforço técnico | Destino |",
         "10.2.4: colunas diferentes das esperadas"),
        ("| [RF01](8-requisitos.md#rf01) | 4 | 1 | MVP |", "| [RF01](8-requisitos.md#rf01) | 4 | 2 | MVP |",
         "RF01: esforço na 10.2.4 difere da 10.2.3."),
        ("| [RF01](8-requisitos.md#rf01) | 4 | 1 | MVP |", "| [RF01](8-requisitos.md#rf01) | 3 | 1 | MVP |",
         "RF01: valor na 10.2.4 difere do valor da HU-01a na 10.2.2."),
        ("| [RF01](8-requisitos.md#rf01) | 4 | 1 | MVP |",
         "| [RF01](8-requisitos.md#rf01) | 4 | 1 | Incremento 2 |",
         "MVP: requisitos na 10.2.6 diferem da 10.2.4 (RF01)."),
        ("| **4** | **RF01**, ", "| **4** | RF01, ", "RF01: negrito do MVP na 10.2.5 difere do destino na 10.2.4."),
        ("| **4** | **RF01**, ", "| **4** | ", "RF01: está na 10.2.4 e não na 10.2.5."),
        ("| **3** | RF29 |", "| **3** | RF29, RF99 |", "RF99: está na 10.2.5 e não na 10.2.4."),
        ("| **3** | RF29 | RF28, RF30 |", "| **3** | RF28 | RF29, RF30 |",
         "RF29: posição na 10.2.5 difere de valor e esforço da 10.2.4."),
        ("Requisito e meta: HU-01a, HU-01b,", "Requisito e meta: HU-01a,", "MVP: histórias na 10.2.6 diferem da 10.2.4 (HU-01b)."),
        ("**Depende de:** HU-01a\n", "**Depende de:** HU-77\n", ": depende da HU-77, que não tem ficha."),
        ("| **G01** | Todos os requisitos (RF01 a RF04) |", "| **G01** | Todos os requisitos (RF01 a RF03) |",
         "G01: requisitos na 10.2.6 diferem da 8.4.1."),
    ],
)
def test_divergencia_na_secao_10(de, para, esperado):
    erros = conferencia.conferir(MD8, _trocar(MD10, de, para))
    assert any(esperado in e for e in erros), erros


def test_dona_vem_da_ficha():
    # RF01 passa da ficha da HU-01a (valor 4) para a da HU-11 (valor 3, posterior): a 10.2.4 deixa de bater.
    md10 = _trocar(MD10, "**Requisitos funcionais:** RF01, RF02, RF03", "**Requisitos funcionais:** RF02, RF03")
    md10 = _trocar(md10, "**Requisitos funcionais:** RF28, RF29, RF30", "**Requisitos funcionais:** RF01, RF28, RF29, RF30")
    erros = conferencia.conferir(MD8, md10)
    assert "RF01: valor na 10.2.4 difere do valor da HU-11 na 10.2.2." in erros
    assert "RF01: a HU-11 não aparece na 8.4.1." in erros


def test_build_para_e_lista_o_que_corrigir(tmp_path):
    docs = tmp_path / "requisitos"
    docs.mkdir()
    (docs / "8-requisitos.md").write_text(_trocar(MD8, "| HU-01a (CA-01a.1) |", "| HU-01b (CA-01b.1) |"), encoding="utf-8")
    (docs / "10-backlog.md").write_text(MD10, encoding="utf-8")
    with pytest.raises(PluginError, match="RF01: a HU-01a não aparece na 8.4.1"):
        conferencia.on_pre_build({"docs_dir": str(tmp_path)})
