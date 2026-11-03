/* Filtros da página "Histórico e evolução" (gestao/historico.md, gerada por hooks/historico.py)
   e dos selos de situação das seções 8 e 10.
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

  // Selos de situação nas seções 8 e 10: o filtro esconde as linhas de tabela e as
  // histórias cujo selo não corresponde. Itens sem selo não são afetados.
  function iniciarSelos() {
    var filtro = document.querySelector("[data-selo-filtro]");
    if (!filtro || filtro.getAttribute("data-pronto")) {
      return;
    }
    filtro.setAttribute("data-pronto", "1");
    var status = document.querySelector("[data-selo-status]");
    var itens = [];
    Array.prototype.slice.call(document.querySelectorAll(".md-content .selo")).forEach(function (selo) {
      if (selo.closest(".selos-legenda")) {
        return;
      }
      var alvo = selo.closest("details") || selo.closest("tr");
      if (alvo && itens.indexOf(alvo) === -1) {
        itens.push(alvo);
        alvo.setAttribute("data-situacao", selo.getAttribute("data-situacao"));
      }
    });
    // Na seção 10 cada história aparece na tabela e no quadro recolhível: conta pelo quadro.
    var contados = itens.filter(function (el) { return el.tagName === "DETAILS"; });
    var nome = contados.length ? "histórias" : "requisitos";
    if (!contados.length) {
      contados = itens;
    }
    filtro.addEventListener("change", function () {
      var v = filtro.value;
      itens.forEach(function (el) {
        el.hidden = !!v && el.getAttribute("data-situacao") !== v;
      });
      var n = contados.filter(function (el) { return !el.hidden; }).length;
      status.textContent = v ? n + " de " + contados.length + " " + nome + "." : "";
    });
  }

  // Um só ouvinte para a troca de âncora; ele também monta a página se o
  // Material tiver trocado o conteúdo sem avisar pelo document$.
  window.addEventListener("hashchange", function () {
    window.setTimeout(iniciar, 0);
  });

  // Com navigation.instant, o Material troca o conteúdo sem recarregar a página:
  // document$ avisa cada troca. Sem ele, vale o carregamento normal.
  function tudo() {
    iniciar();
    iniciarSelos();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(tudo);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tudo);
  } else {
    tudo();
  }
})();
