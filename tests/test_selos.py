"""Testes dos selos de situação das seções 8 e 10 (hooks/selos.py).

Rodar na raiz do repositório: python -m pytest tests/test_selos.py
"""
import importlib.util
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location("selos", RAIZ / "hooks" / "selos.py")
selos = importlib.util.module_from_spec(_spec)
sys.modules["selos"] = selos
_spec.loader.exec_module(selos)

DADOS = {
    "leitura": "03/11/2026, 10:54",
    "com_quadro": True,
    "historias": {
        "HU-01a": {"situacao": "em-andamento", "issue": 12},
        "HU-01b": {"situacao": "concluido", "issue": 156},
        "HU-02b": {"situacao": "a-fazer", "issue": 157},
        "HU-12": {"situacao": "retirado", "issue": 65},
    },
}


def test_rf_segue_as_historias():
    f = selos.situacao_do_rf
    assert f(["HU-01b"], DADOS) == "concluido"
    assert f(["HU-01a", "HU-01b"], DADOS) == "em-andamento"
    assert f(["HU-01b", "HU-02b"], DADOS) == "em-andamento"
    assert f(["HU-02b"], DADOS) == "a-fazer"
    assert f(["HU-12"], DADOS) == "retirado"
    assert f(["HU-12", "HU-01b"], DADOS) == "concluido"
    assert f(["HU-99"], DADOS) is None


def test_selo_na_linha_do_rf_e_legenda():
    md = (
        "## 8.2 Lista\n\n| Identificador | Requisito | Descrição | Rastreabilidade |\n| :---: | :--- | :--- | :--- |\n"
        '| <a id="rf04"></a>**RF04** | Desdobrar | Texto | MROSC art. 22 \\| [HU-01b](10-backlog.md#hu-01b) |\n'
        "| **RF04** | Desdobrar | G01 | — | HU-01b (CA-01b.1) | Total |\n"
    )
    saida = selos.selar_requisitos(md, DADOS)
    assert "**RF04** <span class='selo selo--concluido' data-situacao='concluido'>Concluído</span> |" in saida
    assert saida.count("data-situacao='concluido'>Concluído") == 2  # linha da 8.2 e legenda; a matriz não leva selo
    assert "lida em 03/11/2026, 10:54" in saida


def test_selo_no_backlog_tabela_e_titulo():
    md = (
        "## 10.1 Backlog geral\n\n| Épico | História |\n|---|---|\n"
        "| Requisito e meta | **HU-02b** Acompanhar prazos |\n\n"
        '??? note "HU-01a · Cadastrar instrumento"\n    Corpo\n'
        '??? note "Fundamentação técnica por requisito"\n    Corpo\n'
    )
    saida = selos.selar_backlog(md, DADOS)
    assert "**HU-02b** <span class='selo selo--a-fazer' data-situacao='a-fazer'>A fazer</span> Acompanhar" in saida
    assert ('??? note selo-em-andamento "HU-01a · Cadastrar instrumento '
            "<span class='selo selo--em-andamento' data-situacao='em-andamento'>Em andamento</span>\"") in saida
    assert '??? note "Fundamentação técnica por requisito"' in saida


def test_sem_leitura_do_quadro_nao_ha_selos(tmp_path):
    assert selos.ler_situacao(tmp_path) is None
    (tmp_path / selos.SITUACAO).write_text(json.dumps({**DADOS, "com_quadro": False}), encoding="utf-8")
    assert selos.ler_situacao(tmp_path) is None
    (tmp_path / selos.SITUACAO).write_text(json.dumps(DADOS), encoding="utf-8")
    assert selos.ler_situacao(tmp_path)["historias"]["HU-01a"]["situacao"] == "em-andamento"
