/* Filtro por tipo na linha do tempo das reuniões (gestao/atas/index.md).
   Os cartões vêm prontos do build (hooks/reunioes.py); aqui só se mostra ou esconde cada tipo.
   Sem JavaScript, todas as reuniões aparecem. O endereço #interacoes-com-o-cliente abre
   a lista já filtrada nas reuniões com o Instituto. */
(function () {
  "use strict";

  var ROTULOS = [
    ["", "Todas"],
    ["instituto", "Instituto"],
    ["equipe", "Equipe"],
    ["cerimonia", "Cerimônias ScrumXP"]
  ];

  function aplicar(lista, barra, tipo) {
    lista.querySelectorAll(".reuniao").forEach(function (c) {
      c.hidden = Boolean(tipo) && c.getAttribute("data-tipo") !== tipo;
    });
    // Rótulo do mês some quando nenhum cartão dele está visível.
    lista.querySelectorAll(".reunioes__mes").forEach(function (mes) {
      var visivel = false;
      for (var el = mes.nextElementSibling; el && !el.classList.contains("reunioes__mes"); el = el.nextElementSibling) {
        if (el.classList.contains("reuniao") && !el.hidden) {
          visivel = true;
          break;
        }
      }
      mes.hidden = !visivel;
    });
    barra.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-tipo") === tipo));
    });
  }

  function iniciar() {
    var lista = document.querySelector(".reunioes");
    if (!lista || lista.previousElementSibling && lista.previousElementSibling.classList.contains("reunioes__filtro")) {
      return;
    }
    var barra = document.createElement("div");
    barra.className = "reunioes__filtro";
    barra.setAttribute("role", "group");
    barra.setAttribute("aria-label", "Filtrar reuniões por tipo");
    ROTULOS.forEach(function (par) {
      var n = par[0] ? lista.querySelectorAll('.reuniao[data-tipo="' + par[0] + '"]').length
                     : lista.querySelectorAll(".reuniao").length;
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-tipo", par[0]);
      b.textContent = par[1] + " (" + n + ")";
      b.addEventListener("click", function () {
        aplicar(lista, barra, par[0]);
      });
      barra.appendChild(b);
    });
    lista.parentNode.insertBefore(barra, lista);
    aplicar(lista, barra, location.hash === "#interacoes-com-o-cliente" ? "instituto" : "");
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(iniciar);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
