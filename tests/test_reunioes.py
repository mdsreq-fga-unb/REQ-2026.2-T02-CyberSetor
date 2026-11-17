"""Testes da linha do tempo das reuniões (hooks/reunioes.py).

Rodar na raiz do repositório: python -m pytest tests/test_reunioes.py
"""
import importlib.util
import sys
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "hooks"))
_spec = importlib.util.spec_from_file_location("reunioes", RAIZ / "hooks" / "reunioes.py")
reunioes = importlib.util.module_from_spec(_spec)
sys.modules["reunioes"] = reunioes
_spec.loader.exec_module(reunioes)

DOCS = RAIZ / "docs"
INDICE = (DOCS / reunioes.PAGINA).read_text(encoding="utf-8")

EXEMPLO = """# Atas

Intro.

## Reuniões da equipe

| Data | Pauta | Principais decisões |
|---|---|---|
| 17/08/2026 | Alinhamento inicial | Domínio social |
| [08/09/2026](2026-09-08-sprint-planning.md) | Sprint Planning da Sprint 1 | MoSCoW |

## Interações com o cliente

| Data | Formato | Assunto |
|---|---|---|
| 02/09/2026 | Mensagem | O Instituto concordou — ver seção 7.3.2 |
| [08/09/2026](2026-09-08-reuniao-presencial-instituto.md) | Presencial | Aprofundamento: estrutura e dores |
| 29/10/2026 | Videoconferência | Checkpoint: ata em conferência |

## Política de registro, acesso e publicação

Texto da política.
"""

ATA = """# Ata

## 3. Decisões

| # | Decisão | Justificativa | Impacto |
|---|---|---|---|
| D1 | **Adotar o MoSCoW** no RF07 | Motivo | Seção 5 |
| D2 | Ligar a HU-07a | Motivo | Quadro |

## 4. Próximas etapas

| D9 | fora da seção | x | y |
"""


def ligar_nada(t):
    return t


def test_le_decisoes_da_equipe_e_do_cliente():
    assert reunioes.ler_decisoes(ATA) == ["**Adotar o MoSCoW** no RF07", "Ligar a HU-07a"]
    cliente = "## 4. Decisões\n\n| # | Decisão |\n|---|---|\n| 1 | Primeira. |\n| 2 | Segunda. |\n"
    assert reunioes.ler_decisoes(cliente) == ["Primeira.", "Segunda."]


def test_tipos_titulos_e_ordem():
    rs = reunioes.ler_reunioes(EXEMPLO)
    assert [r.quando for r in rs] == sorted([r.quando for r in rs], reverse=True)
    por_data = {(r.quando, r.tipo): r for r in rs}
    assert por_data[(date(2026, 9, 8), "cerimonia")].ata == "2026-09-08-sprint-planning.md"
    presencial = por_data[(date(2026, 9, 8), "instituto")]
    assert (presencial.titulo, presencial.texto, presencial.formato) == ("Aprofundamento", "Estrutura e dores", "Presencial")
    mensagem = por_data[(date(2026, 9, 2), "instituto")]
    assert mensagem.titulo == "O Instituto concordou" and "seção 7.3.2" in mensagem.texto
    assert por_data[(date(2026, 8, 17), "equipe")].ata is None


def test_substitui_so_as_tabelas_fonte():
    md = reunioes.substituir(EXEMPLO, "BLOCO")
    assert "| Data |" not in md and "BLOCO" in md
    assert md.index("BLOCO") < md.index("## Política de registro, acesso e publicação")
    assert md.startswith("# Atas\n\nIntro.")


def test_ata_fora_do_site_fica_sem_link_e_sem_decisoes():
    md = reunioes.montar(EXEMPLO, DOCS, lambda caminho: "presencial" not in caminho, ligar_nada)
    assert "](2026-09-08-reuniao-presencial-instituto.md)" not in md
    assert "[Ler a ata](2026-09-08-sprint-planning.md)" in md
    assert 'data-tipo="instituto"' in md and 'data-tipo="cerimonia"' in md and 'data-tipo="equipe"' in md
    assert md.count("Sem ata publicada neste site.") == 4


def test_indice_publicado_gera_um_cartao_por_linha_com_ancoras_antigas():
    md = reunioes.montar(INDICE, DOCS, lambda caminho: True, ligar_nada)
    assert md.count('<details class="reuniao') == len(reunioes.historico.ler_atas(INDICE))
    assert 'id="interacoes-com-o-cliente"' in md and 'id="reunioes-da-equipe"' in md
    assert "## Política de registro, acesso e publicação" in md


def test_nenhuma_ata_excluida_do_site_recebe_link():
    texto = (RAIZ / "mkdocs.yml").read_text(encoding="utf-8")
    bloco = texto.split("exclude_docs: |", 1)[1].split("\n\n", 1)[0]
    excluidas = [l.strip() for l in bloco.splitlines() if l.strip().startswith("gestao/atas/")]
    assert excluidas, "esperava ao menos uma ata fora do site"
    md = reunioes.montar(INDICE, DOCS, lambda c: c not in excluidas, ligar_nada)
    for caminho in excluidas:
        assert caminho.rsplit("/", 1)[1] not in md


def test_codigos_viram_link_para_a_definicao():
    import ligacoes

    ind = ligacoes.Indice(DOCS)
    t = ind.ligar("Ajuste no RF07 e na HU-07a", reunioes.PAGINA)
    assert "[RF07](../../requisitos/8-requisitos.md#rf07)" in t
    assert "[HU-07a](../../requisitos/10-backlog.md#hu-07a)" in t


def test_decisao_sobre_ia_fica_so_na_ata():
    r = reunioes.Reuniao(date(2026, 8, 27), "equipe", "Escopo", "Resumo", ata="a.md",
                         decisoes=["Adotar ata automática por IA", "Uso estruturado de assistentes de IA",
                                   "Ferramenta de inteligência artificial", "Migrar para o Google Meet"])
    md = "\n".join(reunioes.cartao(r, ligar_nada))
    assert "4 decisões" in md and "[Ler a ata](a.md)" in md
    assert "- Migrar para o Google Meet" in md
    corpo = md.split("</summary>", 1)[1]
    assert "IA" not in corpo and "inteligência artificial" not in corpo and "Resumo" not in corpo


def test_indice_publicado_nao_lista_decisoes_sobre_ia_e_usa_sprint_0():
    md = reunioes.montar(INDICE, DOCS, lambda caminho: True, ligar_nada)
    for bloco in md.split("<details")[1:]:
        corpo = bloco.split("</summary>", 1)[1]
        assert not reunioes.SO_NA_ATA.search(corpo)
    assert "Concepção" not in md and "Sprint 0" in md
    assert "registros:" in md and " reuniões:" not in md
