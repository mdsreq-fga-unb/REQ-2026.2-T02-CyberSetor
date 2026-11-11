/* Filtro dos cartões de requisitos (seções 8.2 e 8.3), montados por hooks/cartoes.py.
   Cada barra filtra os cartões da sua seção: destino (MVP ou fora dele), busca por texto
   e, quando o quadro foi lido, a situação escolhida no seletor dos selos. */
(function () {
  "use strict";

  function secao(barra) {
    // Cartões entre a barra e o próximo título de nível 2.
    var cartoes = [], el = barra.nextElementSibling;
    while (el && el.tagName !== "H2") {
      if (el.classList.contains("rq-grid")) {
        cartoes = cartoes.concat(Array.prototype.slice.call(el.querySelectorAll(".rq-card")));
      }
      el = el.nextElementSibling;
    }
    return cartoes;
  }

  function iniciar() {
    var barras = document.querySelectorAll("[data-rq-filtro]");
    if (!barras.length) {
      return;
    }
    var selo = document.querySelector("[data-selo-filtro]");
    var atualizadores = [];

    Array.prototype.forEach.call(barras, function (barra) {
      if (barra.getAttribute("data-pronto")) {
        return;
      }
      barra.setAttribute("data-pronto", "1");
      var cartoes = secao(barra);
      var botoes = barra.querySelectorAll("[data-rq]");
      var busca = barra.querySelector("[data-rq-busca]");
      var status = barra.querySelector("[data-rq-status]");
      var destino = "";
      var textos = cartoes.map(function (c) { return c.textContent.toLowerCase(); });

      function aplicar() {
        var termo = (busca.value || "").trim().toLowerCase();
        var sit = selo && cartoes.some(function (c) { return c.hasAttribute("data-situacao"); }) ? selo.value : "";
        var visiveis = 0;
        cartoes.forEach(function (c, i) {
          var ok = (!destino || c.getAttribute("data-destino") === destino) &&
            (!termo || textos[i].indexOf(termo) !== -1) &&
            (!sit || c.getAttribute("data-situacao") === sit);
          c.hidden = !ok;
          if (ok) { visiveis++; }
        });
        // Esconde o título da característica quando nenhum cartão dela sobra.
        Array.prototype.forEach.call(document.querySelectorAll(".rq-grid"), function (g) {
          var t = g.previousElementSibling;
          if (t && t.tagName === "H3") {
            t.hidden = !g.querySelector(".rq-card:not([hidden])");
          }
        });
        status.textContent = (destino || termo || sit) ? visiveis + " de " + cartoes.length + " requisitos." : cartoes.length + " requisitos.";
      }

      Array.prototype.forEach.call(botoes, function (b) {
        b.addEventListener("click", function () {
          destino = b.getAttribute("data-rq");
          Array.prototype.forEach.call(botoes, function (x) {
            x.setAttribute("aria-pressed", x === b ? "true" : "false");
          });
          aplicar();
        });
      });
      busca.addEventListener("input", aplicar);
      atualizadores.push(aplicar);
      aplicar();
    });

    if (selo && !selo.getAttribute("data-rq-pronto")) {
      selo.setAttribute("data-rq-pronto", "1");
      selo.addEventListener("change", function () {
        atualizadores.forEach(function (f) { f(); });
      });
    }
  }

  // Link para um critério de aceitação dentro de uma história recolhida: abre a história.
  function abrirAlvo() {
    var id = decodeURIComponent(location.hash.slice(1));
    var alvo = id && document.getElementById(id);
    if (!alvo) {
      return;
    }
    var d = alvo.closest("details");
    var abriu = false;
    while (d) {
      if (!d.open) { d.open = true; abriu = true; }
      d = d.parentElement && d.parentElement.closest("details");
    }
    if (abriu) {
      alvo.scrollIntoView();
    }
  }
  window.addEventListener("hashchange", abrirAlvo);

  function tudo() {
    iniciar();
    abrirAlvo();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(tudo);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tudo);
  } else {
    tudo();
  }
})();
