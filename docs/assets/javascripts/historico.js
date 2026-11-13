/* Filtros da página "Histórico e evolução" (gestao/historico.md, gerada por hooks/historico.py)
   e dos selos de situação e das fichas das seções 8 e 10.
   Sem dependências. Sem JavaScript, todos os registros continuam visíveis.
   O filtro também vem do endereço: #sprint-4, #unidade-2, #hu-07c, #rf21, #tipo-ata-cliente,
   #documento-8-requisitos-de-software, #autor-vinicius-vieira. */
(function () {
  "use strict";

  var CAMPOS = ["tipo", "sprint", "unidade", "documento", "autor", "codigo"];
  var atual = null; // página montada agora: { barra, lerEndereco }

  function iniciar() {
    var barra = document.getElementById("hist-filtros");
    var linha = document.getElementById("hist-linha");
    if (!barra || !linha) {
      atual = null;
      return;
    }
    if (atual && atual.barra === barra) {
      atual.lerEndereco();
      return;
    }

    var selects = Array.prototype.slice.call(barra.querySelectorAll("select[data-campo]"));
    var busca = barra.querySelector("[data-busca]");
    var limpar = barra.querySelector("[data-limpar]");
    var status = barra.querySelector("[data-status]");
    var itens = Array.prototype.slice.call(linha.querySelectorAll(".hist-item"));
    var grupos = Array.prototype.slice.call(linha.querySelectorAll(".hist-grupo"));
    var faixas = Array.prototype.slice.call(document.querySelectorAll(".hist-faixa[data-filtro]"));
    var chipsTipo = Array.prototype.slice.call(barra.querySelectorAll(".hist-tipo[data-tipo]"));

    function seletor(campo) {
      for (var i = 0; i < selects.length; i += 1) {
        if (selects[i].getAttribute("data-campo") === campo) {
          return selects[i];
        }
      }
      return null;
    }

    function passa(item, termo) {
      for (var i = 0; i < selects.length; i += 1) {
        var valor = selects[i].value;
        if (!valor) {
          continue;
        }
        var tokens = (item.getAttribute("data-" + selects[i].getAttribute("data-campo")) || "").split(" ");
        if (tokens.indexOf(valor) === -1) {
          return false;
        }
      }
      return !termo || (item.textContent || "").toLowerCase().indexOf(termo) !== -1;
    }

    function aplicar() {
      var termo = (busca.value || "").trim().toLowerCase();
      var visiveis = 0;
      itens.forEach(function (item) {
        var ok = passa(item, termo);
        item.hidden = !ok;
        if (ok) {
          visiveis += 1;
        }
      });
      grupos.forEach(function (g) {
        g.hidden = !g.querySelector(".hist-item:not([hidden])");
      });
      var tipo = seletor("tipo").value;
      chipsTipo.forEach(function (c) {
        c.setAttribute("aria-pressed", c.getAttribute("data-tipo") === tipo ? "true" : "false");
      });
      var sprint = seletor("sprint").value;
      faixas.forEach(function (f) {
        f.classList.toggle("hist-faixa--ativa", sprint !== "" && f.getAttribute("data-valor") === sprint);
      });
      var filtrando = termo || selects.some(function (s) { return s.value; });
      limpar.disabled = !filtrando;
      status.textContent = filtrando
        ? visiveis + " de " + itens.length + " registros."
        : itens.length + " registros.";
    }

    function zerar() {
      selects.forEach(function (s) { s.value = ""; });
      busca.value = "";
    }

    function escolher(campo, valor) {
      var s = seletor(campo);
      if (s && s.querySelector('option[value="' + valor + '"]')) {
        zerar();
        s.value = valor;
        aplicar();
        return true;
      }
      return false;
    }

    function lerEndereco() {
      var h = decodeURIComponent((window.location.hash || "").slice(1));
      if (!h) {
        return;
      }
      for (var i = 0; i < CAMPOS.length; i += 1) {
        var prefixo = CAMPOS[i] + "-";
        if (h.indexOf(prefixo) === 0 &&
            (escolher(CAMPOS[i], h.slice(prefixo.length)) || escolher(CAMPOS[i], h))) {
          barra.scrollIntoView();
          return;
        }
      }
      // Atalhos: #sprint-4 e #concepcao são também âncoras dos grupos; #rf21 e #hu-07c, códigos.
      if (escolher("sprint", h) || escolher("codigo", h)) {
        barra.scrollIntoView();
      } else if (/^(rf|rnf|hu-)\d/.test(h)) {
        zerar();
        aplicar();
        status.textContent = "Nenhum registro cita " + h.toUpperCase() + ". " + status.textContent;
        barra.scrollIntoView();
      }
    }

    selects.forEach(function (s) { s.addEventListener("change", aplicar); });
    busca.addEventListener("input", aplicar);
    limpar.addEventListener("click", function () {
      zerar();
      aplicar();
      if (window.location.hash && window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } catch (e) { /* sem history: ignora */ }
      }
    });
    chipsTipo.forEach(function (c) {
      c.addEventListener("click", function () {
        seletor("tipo").value = c.getAttribute("data-tipo");
        aplicar();
      });
    });
    faixas.forEach(function (f) {
      f.addEventListener("click", function (ev) {
        ev.preventDefault();
        var valor = f.getAttribute("data-valor");
        var s = seletor("sprint");
        s.value = s.value === valor ? "" : valor;
        aplicar();
        barra.scrollIntoView({ behavior: "smooth" });
      });
    });
    atual = { barra: barra, lerEndereco: lerEndereco };
    aplicar();
    lerEndereco();
  }

  // Selos das seções 8 e 10 e fichas da seção 10.1: cada filtro esconde as linhas de tabela e
  // as fichas que não correspondem. O filtro de situação lê o selo; destino e épico, a classe
  // que hooks/fichas.py põe na ficha. Itens sem selo não são afetados pelo filtro de situação.
  var filtrosPagina = [];

  function aplicarFiltros(itens, contados, nome, status) {
    itens.forEach(function (el) {
      el.hidden = !filtrosPagina.every(function (sel) {
        if (!sel.value) {
          return true;
        }
        return sel.hasAttribute("data-selo-filtro")
          ? el.getAttribute("data-situacao") === sel.value
          : el.classList.contains(sel.value);
      });
    });
    if (status) {
      var ativo = filtrosPagina.some(function (sel) { return sel.value; });
      var n = contados.filter(function (el) { return !el.hidden; }).length;
      status.textContent = ativo ? n + " de " + contados.length + " " + nome + "." : "";
    }
  }

  function iniciarSelos() {
    filtrosPagina = Array.prototype.slice.call(
      document.querySelectorAll("[data-selo-filtro], [data-ficha-filtro]"));
    // Na seção 8, os cartões de requisitos têm filtro próprio (requisitos.js), que lê este seletor.
    if (!filtrosPagina.length || filtrosPagina[0].getAttribute("data-pronto") ||
        document.querySelector(".rq-card")) {
      return;
    }
    var status = document.querySelector("[data-selo-status]");
    var itens = Array.prototype.slice.call(document.querySelectorAll(".md-content details.ficha"));
    Array.prototype.slice.call(document.querySelectorAll(".md-content .selo")).forEach(function (selo) {
      if (selo.closest(".selos-legenda")) {
        return;
      }
      var alvo = selo.closest("details.ficha") || selo.closest("tr");
      if (!alvo) {
        return;
      }
      if (itens.indexOf(alvo) === -1) {
        itens.push(alvo);
      }
      if (!alvo.hasAttribute("data-situacao")) {
        alvo.setAttribute("data-situacao", selo.getAttribute("data-situacao"));
      }
    });
    var fichas = itens.filter(function (el) { return el.tagName === "DETAILS"; });
    var contados = fichas.length ? fichas : itens;
    var nome = fichas.length ? "histórias" : "requisitos";
    filtrosPagina.forEach(function (sel) {
      sel.setAttribute("data-pronto", "1");
      sel.addEventListener("change", function () {
        aplicarFiltros(itens, contados, nome, status);
      });
    });
  }

  // A âncora de uma história fica antes da ficha: abre a ficha e leva até ela, mesmo que um
  // filtro a esconda. Vale para os links da própria ficha e para os que vêm de outras páginas.
  function abrirFicha() {
    var id = decodeURIComponent(window.location.hash.slice(1));
    if (id.indexOf("hu-") !== 0) {
      return;
    }
    var ancora = document.getElementById(id);
    var bloco = ancora && ancora.closest("p");
    var ficha = bloco && bloco.nextElementSibling;
    if (!ficha || !ficha.matches("details.ficha")) {
      return;
    }
    if (ficha.hidden) {
      filtrosPagina.forEach(function (sel) {
        sel.value = "";
        sel.dispatchEvent(new Event("change"));
      });
    }
    ficha.open = true;
    ficha.scrollIntoView();
  }

  // Um só ouvinte para a troca de âncora; ele também monta a página se o
  // Material tiver trocado o conteúdo sem avisar pelo document$.
  window.addEventListener("hashchange", function () {
    window.setTimeout(function () {
      iniciar();
      abrirFicha();
    }, 0);
  });

  // Com navigation.instant, o Material troca o conteúdo sem recarregar a página:
  // document$ avisa cada troca. Sem ele, vale o carregamento normal.
  function tudo() {
    iniciar();
    iniciarSelos();
    abrirFicha();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(tudo);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tudo);
  } else {
    tudo();
  }
})();
