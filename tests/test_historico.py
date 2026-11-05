"""Testes do gerador da página Histórico e evolução (hooks/historico.py).

Rodar na raiz do repositório: python -m pytest tests/test_historico.py
"""
import importlib.util
import sys
from datetime import date
from pathlib import Path

import pytest
from mkdocs.exceptions import PluginError

RAIZ = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location("historico", RAIZ / "hooks" / "historico.py")
historico = importlib.util.module_from_spec(_spec)
sys.modules["historico"] = historico
_spec.loader.exec_module(historico)

TABELA = """# 8. Requisitos

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 01/09/2026 | 1.0 | Versão inicial | Equipe |
| 30/10/2026 | 2.10 | Apresentação da inscrição (RF46); critérios CA-07c.2 e HU-07d | Ana e Bruno |

Texto.
"""

SPRINTS = [
    historico.Sprint(1, date(2026, 9, 8), date(2026, 9, 22)),
    historico.Sprint(2, date(2026, 9, 22), date(2026, 10, 6)),
]


def test_le_tabela_de_versoes():
    eventos = historico.ler_versoes("requisitos/8.md", TABELA)
    assert [e.versao for e in eventos] == ["1.0", "2.10"]
    assert eventos[1].origem_rotulo == "8. Requisitos"
    assert eventos[1].codigos == ["RF46", "HU-07c", "HU-07d"]


def test_pagina_sem_tabela_nao_gera_evento():
    assert historico.ler_versoes("x.md", "# Título\n\nSem tabela.\n") == []


@pytest.mark.parametrize(
    "linha, trecho",
    [
        ("| 31/02/2026 | 1.1 | Data inexistente | Ana |", "data inexistente"),
        ("| 2026-10-01 | 1.1 | Formato errado | Ana |", "data inválida"),
        ("| 01/10/2026 | 1.1 | Sem autor |", "colunas"),
        ("| 01/08/2026 | 1.1 | Fora de ordem | Ana |", "fora de ordem"),
    ],
)
def test_linha_fora_do_padrao_interrompe_o_build(linha, trecho):
    texto = TABELA.replace("\n\nTexto.", f"\n{linha}\n\nTexto.")
    with pytest.raises(PluginError, match=trecho):
        historico.ler_versoes("requisitos/8.md", texto)


@pytest.mark.parametrize(
    "citacao",
    [
        '> **Sprint Goal (aprovado em 07/10):** *"Ao final da Sprint 3, a base está pronta."*',
        "> **Ao final da Sprint 3, a base está pronta.**",
    ],
)
def test_le_a_meta_da_sprint_nos_dois_formatos_de_plano(citacao):
    plano = f"| **Período da Sprint** | 06/10/2026 a 20/10/2026 |\n\n### 4.2 Meta da Sprint 🔧\n\n{citacao}\n"
    sprint = historico.ler_sprint("gestao/sprints/sprint-3.md", 3, plano)
    assert sprint.meta == "Ao final da Sprint 3, a base está pronta."
    assert historico.meta_curta(sprint.meta) == "A base está pronta."


def test_plano_sem_meta_nao_interrompe_o_build():
    assert historico.ler_meta("# Plano\n\nSem meta declarada.\n") == ""


def test_inicio_de_sprint_fica_no_grupo_da_propria_sprint():
    inicio = historico.Evento(date(2026, 9, 22), "sprint", "Sprint 2", "")
    historico.montar([inicio], SPRINTS, date(2026, 9, 30))
    assert inicio.sprint == "Sprint 2"


def test_dia_de_fronteira_conta_para_a_sprint_que_termina():
    assert historico.sprint_de(date(2026, 9, 22), SPRINTS) == "Sprint 1"
    assert historico.sprint_de(date(2026, 9, 23), SPRINTS) == "Sprint 2"
    assert historico.sprint_de(date(2026, 9, 1), SPRINTS) == "Concepção"
    assert historico.sprint_de(date(2026, 10, 7), SPRINTS) == "Após a Sprint 2"


def test_unidade_pelo_marco():
    assert historico.unidade_de(date(2026, 9, 8)) == "Unidade 1"
    assert historico.unidade_de(date(2026, 9, 9)) == "Unidade 2"
    assert historico.unidade_de(date(2026, 11, 20)) == "Unidade 4"


def test_atas_do_indice():
    texto = """# Atas

## Reuniões da equipe

| Data | Pauta | Principais decisões |
|---|---|---|
| 17/08/2026 | Alinhamento inicial | Domínio social |
| [27/08/2026](2026-08-27-reuniao-equipe.md) | Escopo | Ata automática |

## Interações com o cliente

| Data | Formato | Assunto |
|---|---|---|
| [08/09/2026](2026-09-08-presencial.md) | Presencial | Questões em aberto |

## Política

| Material | Onde fica | Quem acessa | Condição |
|---|---|---|---|
| Gravação | Drive | Equipe | Não se publica |
"""
    eventos = historico.ler_atas(texto)
    assert [(e.tipo, e.origem) for e in eventos] == [
        ("ata-equipe", None),
        ("ata-equipe", "gestao/atas/2026-08-27-reuniao-equipe.md"),
        ("ata-cliente", "gestao/atas/2026-09-08-presencial.md"),
    ]


def test_site_atual_gera_todos_os_registros():
    eventos, sprints = historico.coletar(RAIZ / "docs")
    pagina = historico.montar(eventos, sprints, date(2026, 11, 3))
    assert pagina.count('class="hist-item ') == len(eventos)
    assert len(sprints) >= 4
    assert all(s.meta for s in sprints)
    assert 'class="hist-faixa__meta"' in pagina
    assert "Sprint 4" in pagina
