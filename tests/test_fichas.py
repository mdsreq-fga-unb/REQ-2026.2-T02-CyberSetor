"""Testes das fichas de história da seção 10.1 (hooks/fichas.py).

Rodar na raiz do repositório: python -m pytest tests/test_fichas.py
"""
import sys
from datetime import date
from pathlib import Path

import pytest
from mkdocs.exceptions import PluginError

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "hooks"))

import fichas  # noqa: E402
import historico  # noqa: E402

SECAO8 = """# 8. Requisitos

## 8.2 Lista de Requisitos Funcionais (RFs)

### CP1 — Gestão

| Identificador | Requisito | Descrição | Rastreabilidade |
| :---: | :--- | :--- | :--- |
| <a id="rf04"></a>**RF04** | Desdobrar metas | Desdobrar o plano em metas. | MROSC |
| <a id="rf05"></a>**RF05** | Atribuir responsável | Atribuir responsável à meta. | OE01 |

## 8.3 Lista de Requisitos Não Funcionais (RNFs)

| Identificador | Nome | Classe | Descrição |
| :---: | :--- | :--- | :--- |
| <a id="rnf02"></a>**RNF02** | Auditabilidade | Produto | Trilha. |
| <a id="rnf04"></a>**RNF04** | Controle de acesso | Produto | Perfis. |

## 8.4 Matriz

### 8.4.1 Matriz de Rastreabilidade dos Requisitos Funcionais (RFs)

#### CP1 — Gestão de Projetos e Metas (OE01; OE04)
| Requisito | Gargalo BPMN | Norma / Mitigação | História derivada | Cobertura |
| :--- | :---: | :--- | :--- | :---: |
| **RF04** | G01 | — | HU-01b (CA-01b.1) | Total |
| **RF05** | G02 | — | HU-02a (CA-02a.1); HU-01b (CA-01b.2) | Total |

### 8.4.2 Matriz de Rastreabilidade dos Requisitos Não Funcionais (RNFs)

| RNF | Origem (Decisão, Risco Ético ou Norma) | Requisitos Funcionais Relacionados |
| :--- | :--- | :--- |
| **RNF02** | Seção 3 | RF04 a RF05 |
| **RNF04** | Seção 3 | *Transversal (Todos os RFs, exceto o RF04)* |

### 8.4.3 Síntese de Cobertura

Texto.

## 8.7 Regras de Negócio

| ID | Regra | Origem | Requisitos relacionados |
| :---: | :--- | :--- | :---: |
| <a id="rn-01"></a>**RN-01** | Requisito e meta são registros distintos. | Ata | RF04 |
"""

SECAO10 = """# 10. Backlog

## 10.1 Backlog geral

<a id="hu-01"></a>
<a id="hu-01b"></a>
??? note "HU-01b · Desdobrar requisitos"
    Como Diretora, quero desdobrar.

    **Épico:** Requisito e meta

    **Requisitos funcionais:** RF04

    **Depende de:** —

    **Critérios de aceitação**

    - CA-01b.1 Critério um.

<a id="hu-02a"></a>
??? note selo-concluido "HU-02a · Atribuir responsável"
    Como Diretora, quero atribuir.

    **Épico:** Requisito e meta

    **Requisitos funcionais:** RF05

    **Depende de:** HU-01b

    **Critérios de aceitação**

    - CA-02a.1 Critério dois.

## 10.2 Priorização

### 10.2.2 Avaliação de negócio

| História validada | Histórias derivadas (10.1) | Valor | Critério | Justificativa |
| :--- | :--- | :---: | :--- | :--- |
| HU-01 | HU-01b | 4 | Problema central | Porque sim. |
| HU-02 | HU-02a | 4 🔧 | Urgência | Porque sim. |

### 10.2.3 Avaliação técnica

| Código | Esforço | Complexidade | Lacuna | Média | Esforço técnico |
| :---: | :---: | :---: | :---: | :---: | :---: |
| [RF04](8-requisitos.md#rf04) | 2 | 2 | 1 | 1,7 | **2** |
| [RF05](8-requisitos.md#rf05) | 1 | 1 | 1 | 1,0 | **1** |

### 10.2.4 Tabela consolidada

| Código | Valor | Esforço técnico | Destino |
| :---: | :---: | :---: | :--- |
| [RF04](8-requisitos.md#rf04) | 4 | 2 | MVP |
| [RF05](8-requisitos.md#rf05) | 4 🔧 | 1 | Incremento 2 |

### 10.2.5 Matriz 4 × 4
"""

DADOS = {
    "leitura": "05/11/2026, 10:00",
    "com_quadro": True,
    "historias": {
        "HU-01b": {"situacao": "concluido", "issue": 156},
        "HU-02a": {"situacao": "em-andamento", "issue": 13},
    },
}
REPO = "https://github.com/org/repo"


def _pagina(dados=DADOS, eventos=(), existe=lambda _: True):
    return fichas.compor_pagina(SECAO10, SECAO8, dados, list(eventos), existe, REPO)


def _ficha(pagina: str, hu: str) -> str:
    inicio = pagina.index(f'"{hu} ·')
    fim = pagina.find("\n<a id=", inicio)
    return pagina[inicio:fim if fim != -1 else None]


def test_le_a_secao_8():
    s = fichas.ler_secao8(SECAO8)
    assert s.rfs["RF04"].nome == "Desdobrar metas"
    assert s.rfs["RF05"].donas == []
    assert s.rfs["RF04"].cp == "CP1"
    assert s.cp_oe == {"CP1": "OE01; OE04"}
    assert s.verificacao["RF05"] == [("HU-02a", "CA-02a.1"), ("HU-01b", "CA-01b.2")]
    assert s.rnf_rfs["RNF02"] == {"RF04", "RF05"}
    assert s.rnf_rfs["RNF04"] == set()  # transversal não se repete em cada história
    assert s.rn_rfs["RN-01"] == {"RF04"}


def test_link_interno_da_secao_8_aponta_para_ela_na_ficha():
    md = SECAO8.replace("Atribuir responsável à meta.", "Conforme a [RN-01](#rn-01).")
    assert fichas.ler_secao8(md).rfs["RF05"].descricao == "Conforme a [RN-01](8-requisitos.md#rn-01)."


def test_titulo_traz_destino_e_preserva_o_selo():
    pagina = _pagina()
    assert ('??? note ficha destino-mvp epico-requisito-e-meta "HU-01b · Desdobrar requisitos '
            "<span class='destino'>MVP</span>\"") in pagina
    assert '??? note selo-concluido ficha destino-incremento-2 epico-requisito-e-meta "HU-02a' in pagina


def test_ficha_reune_o_que_vem_das_outras_secoes():
    f = _ficha(_pagina(), "HU-02a")
    assert "[Incremento 2](#1026-mvp-e-incrementos){ .fx .fx--destino-incremento-2 }" in f
    assert '[Valor 4 · Must have](#1022-avaliacao-de-negocio-com-o-instituto "Urgência"){ .fx } 🔧' in f
    assert "[Esforço 1](#1023-avaliacao-tecnica){ .fx }" in f
    assert ("Característica</span> [CP1](../visao/2-solucao-proposta.md#cp1){ .fx-cod .fx-cod--cp } objetivo "
            "[OE01](../visao/2-solucao-proposta.md#oe01) · secundário [OE04](../visao/2-solucao-proposta.md#oe04)") in f
    assert "[Issue #13 no GitHub](https://github.com/org/repo/issues/13)" in f
    assert '[RF05](8-requisitos.md#rf05 "Atribuir responsável · esforço 1"){ .fx-cod }' in f
    assert "Atribuir responsável à meta." not in f  # a descrição fica na seção 8
    assert "selo--em-andamento" not in f  # a situação vai no título (hooks/selos.py), não por requisito
    assert "[RNF02](8-requisitos.md#rnf02) Auditabilidade" in f
    assert "RN-01" not in f  # a regra é do RF04
    assert "| Vínculo |" not in f  # a ficha não tem mais tabela interna


def test_dependencias_nos_dois_sentidos_e_segunda_historia():
    pagina = _pagina()
    f02, f01 = _ficha(pagina, "HU-02a"), _ficha(pagina, "HU-01b")
    assert "Depende de</span> [HU-01b](#hu-01b){ .fx-cod } <span class='selo selo--concluido'" in f02
    assert "Libera</span>" not in f02
    assert "Libera</span> [HU-02a](#hu-02a){ .fx-cod }" in f01
    assert "Depende de</span>" not in f01
    assert 'Também verifica</span> [RF05](8-requisitos.md#rf05 "CA-01b.2"){ .fx-cod }' in f01


def test_regra_de_negocio_vem_com_o_texto():
    f = _ficha(_pagina(), "HU-01b")
    assert "[RN-01](8-requisitos.md#rn-01) Requisito e meta são registros distintos." in f


def test_filtros_entram_na_legenda_ou_em_bloco_proprio():
    com_legenda = SECAO10.replace(
        "## 10.1 Backlog geral\n",
        '## 10.1 Backlog geral\n\n<div class="selos-legenda" markdown="0">'
        '<span class="selos-legenda__status" data-selo-status aria-live="polite"></span></div>\n',
    )
    saida = fichas.compor_pagina(com_legenda, SECAO8, DADOS, [], lambda _: True, REPO)
    assert saida.count("data-ficha-filtro") == 2
    assert saida.count('class="selos-legenda"') == 1
    assert 'value="destino-incremento-2">Incremento 2' in saida
    assert 'value="epico-requisito-e-meta">Requisito e meta' in saida

    sem_legenda = _pagina(dados=None)
    assert sem_legenda.count('class="selos-legenda"') == 1
    assert sem_legenda.index("data-ficha-filtro") < sem_legenda.index('<a id="hu-01"')


def test_sem_leitura_do_quadro_a_ficha_sai_sem_selo_e_leva_a_busca_da_issue():
    f = _ficha(_pagina(dados=None), "HU-02a")
    assert "class='selo" not in f
    assert "[Issue no GitHub](https://github.com/org/repo/issues?q=HU-02a)" in f
    assert "[HU-01b](#hu-01b)" in f


def _evento(quando, titulo, descricao, codigos, origem="requisitos/8-requisitos.md"):
    return historico.Evento(quando, "versao", titulo, descricao, origem, codigos=codigos)


def test_evolucao_junta_historia_requisitos_e_origem():
    eventos = [
        _evento(date(2026, 9, 28), "Ata", "HU-02 validada", ["HU-02"]),
        _evento(date(2026, 10, 26), "Seção 8", "Mudou o RF05", ["RF05"]),
        _evento(date(2026, 11, 3), "Seção 10", "Mudou a HU-02a", ["HU-02a"]),
        _evento(date(2026, 11, 4), "Outra", "Mudou a HU-01b", ["HU-01b"]),
    ]
    f = _ficha(_pagina(eventos=eventos), "HU-02a")
    # A ficha só leva à evolução; o detalhe fica na página Histórico e evolução.
    assert "[Evolução da HU-02a: 3 registros, o último em 03/11](../gestao/historico.md#evolucao-hu-02a)" in f
    assert "Mudou o RF05" not in f and "Outra" not in f


def test_evolucao_nao_liga_pagina_fora_do_site_e_encurta_o_texto():
    longo = "[palavra](x.md) " * 40
    eventos = [_evento(date(2026, 10, 29), "Checkpoint", longo, ["HU-02a"], "gestao/atas/fora.md")]
    f = _ficha(_pagina(eventos=eventos, existe=lambda _: False), "HU-02a")
    assert "Evolução da HU-02a: 1 registro, o último em 29/10" in f
    assert "x.md" not in f and "fora.md" not in f and "Checkpoint" not in f


def test_sem_evento_nao_ha_evolucao():
    assert "Evolução" not in _ficha(_pagina(), "HU-02a")


def test_ficha_sem_campo_interrompe_o_build():
    with pytest.raises(PluginError, match="HU-01b está sem Épico"):
        fichas.compor_pagina(SECAO10.replace("    **Épico:** Requisito e meta\n\n    **Requisitos funcionais:** RF04",
                                             "    **Requisitos funcionais:** RF04"),
                             SECAO8, None, [], lambda _: True, REPO)


def test_rf_fora_da_secao_8_interrompe_o_build():
    with pytest.raises(PluginError, match="RF99"):
        fichas.compor_pagina(SECAO10.replace("**Requisitos funcionais:** RF05", "**Requisitos funcionais:** RF05, RF99"),
                             SECAO8, None, [], lambda _: True, REPO)


def test_historia_com_dois_destinos_interrompe_o_build():
    with pytest.raises(PluginError, match="HU-01b precisa de um só destino"):
        fichas.compor_pagina(SECAO10.replace("**Requisitos funcionais:** RF04", "**Requisitos funcionais:** RF04, RF05"),
                             SECAO8, None, [], lambda _: True, REPO)


def test_esforco_da_historia_e_a_faixa_dos_requisitos():
    md = SECAO10.replace("**Requisitos funcionais:** RF04", "**Requisitos funcionais:** RF04").replace(
        "| [RF05](8-requisitos.md#rf05) | 1 | 1 | 1 | 1,0 | **1** |", "| [RF05](8-requisitos.md#rf05) | 1 | 1 | 1 | 1,0 | **1** 🔧 |")
    f = _ficha(fichas.compor_pagina(md, SECAO8, None, [], lambda _: True, REPO), "HU-02a")
    assert "[Esforço 1](#1023-avaliacao-tecnica){ .fx } 🔧" in f


def test_visoes_da_priorizacao_saem_das_tabelas_fonte():
    md = SECAO10.replace("### 10.2.3", "<!-- priorizacao-moscow -->\n\n### 10.2.3").replace(
        "### 10.2.5 Matriz 4 × 4", "### 10.2.5 Matriz 4 × 4\n\n<!-- priorizacao-matriz -->\n\n<!-- priorizacao-mvp -->")
    saida = fichas.compor_pagina(md, SECAO8, None, [], lambda _: True, REPO)
    assert "<!-- priorizacao" not in saida
    moscow = saida.split('class="pz-moscow"', 1)[1].split('class="pz-legenda"', 1)[0]
    assert "valor 4 · 2" in moscow and "valor 3 · 0" in moscow
    assert "[HU-02a](#hu-02a" in moscow and ".pz--incremento-2 .pz-prov" in moscow
    matriz = saida.split('class="pz-matriz"', 1)[1].split("</div>\n</div>", 1)[0]
    assert "[RF04](8-requisitos.md#rf04" in matriz and ".pz--mvp" in matriz
    assert "<strong>1</strong> de 2 histórias no MVP" in saida
    assert "<strong>1</strong> de 2 requisitos funcionais no MVP" in saida
    assert "[CP1](../visao/2-solucao-proposta.md#cp1) Gestão" in saida
    assert "na característica do seu primeiro requisito funcional" in saida


def test_le_as_colunas_certas_do_documento():
    md8 = (RAIZ / "docs/requisitos/8-requisitos.md").read_text(encoding="utf-8")
    md10 = (RAIZ / "docs/requisitos/10-backlog.md").read_text(encoding="utf-8")
    s = fichas.ler_secao8(md8)
    assert s.verificacao["RF22"] == [("HU-07a", "CA-07a.8"), ("HU-08", "CA-08.3")]
    assert s.rnf_rfs["RNF06"] == {"RF27"} and s.rnf_rfs["RNF15"] == set()
    assert s.rnf["RNF06"] == "Prazo de atendimento à exclusão de dados"
    p = fichas.ler_priorizacao(md10)
    assert p.esforco["RF10"] == "3" and p.esforco["RF46"] == "1 🔧"
    assert p.destino["RF16"] == "Incremento 3"
