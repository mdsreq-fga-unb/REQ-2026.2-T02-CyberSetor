/* Histórico de versões recolhido no início de cada página.
   A tabela de versões continua no Markdown, que é a fonte lida por hooks/historico.py;
   aqui ela só passa a ficar dentro de um bloco recolhível, com o resumo da última versão.
   Sem JavaScript, a tabela aparece aberta, como antes. */
(function () {
  "use strict";

  var CABECALHO = /^(data|versão)$/i;

  function cabecalhos(tabela) {
    var linha = tabela.tHead && tabela.tHead.rows[0];
    if (!linha) {
      return [];
    }
    return Array.prototype.map.call(linha.cells, function (c) {
      return c.textContent.trim().toLowerCase();
    });
  }

  function ehTabelaDeVersoes(tabela) {
    var h = cabecalhos(tabela);
    return h.length >= 3 && CABECALHO.test(h[0]) && h.indexOf("versão") !== -1 &&
      (h.indexOf("descrição") !== -1 || h.indexOf("alteração") !== -1);
  }

  function ultima(tabela, h) {
    var corpo = tabela.tBodies[0];
    if (!corpo || !corpo.rows.length) {
      return "";
    }
    var linha = corpo.rows[corpo.rows.length - 1];
    var iData = h.indexOf("data");
    var iVersao = h.indexOf("versão");
    var partes = [];
    if (iVersao !== -1 && linha.cells[iVersao]) {
      partes.push("versão " + linha.cells[iVersao].textContent.trim());
    }
    if (iData !== -1 && linha.cells[iData]) {
      partes.push(linha.cells[iData].textContent.trim());
    }
    return partes.join(", ");
  }

  function recolher() {
    var artigo = document.querySelector(".md-content article");
    if (!artigo || artigo.querySelector("details.cs-versoes")) {
      return;
    }
    // Só a tabela que abre a página: antes dela, no máximo o título e o subtítulo "Histórico de versões".
    var el = artigo.firstElementChild;
    var passos = 0;
    while (el && passos < 6) {
      var tabela = el.tagName === "TABLE" ? el : el.querySelector && el.querySelector("table");
      if (tabela && ehTabelaDeVersoes(tabela)) {
        var h = cabecalhos(tabela);
        var bloco = document.createElement("details");
        bloco.className = "cs-versoes";
        var resumo = document.createElement("summary");
        var n = tabela.tBodies[0] ? tabela.tBodies[0].rows.length : 0;
        var fim = ultima(tabela, h);
        resumo.textContent = "Histórico de versões · " + n + (n === 1 ? " registro" : " registros") +
          (fim ? " · última: " + fim : "");
        bloco.appendChild(resumo);
        el.parentNode.insertBefore(bloco, el);
        bloco.appendChild(el);
        var anterior = bloco.previousElementSibling;
        if (anterior && /^H[23]$/.test(anterior.tagName) && /hist[oó]rico de vers/i.test(anterior.textContent)) {
          anterior.classList.add("cs-versoes__titulo");
        }
        return;
      }
      if (el.tagName === "H2" && !/hist[oó]rico de vers/i.test(el.textContent)) {
        return;
      }
      el = el.nextElementSibling;
      passos += 1;
    }
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(recolher);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", recolher);
  } else {
    recolher();
  }
})();
