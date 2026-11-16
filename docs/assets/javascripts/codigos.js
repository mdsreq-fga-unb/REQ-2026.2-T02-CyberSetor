/* Janela dos códigos da documentação (HU, RF, RNF, RN, OE, CP e gargalos) e abas da árvore
   de rastreabilidade da seção 8.4.
   O índice vem de assets/codigos.json, gravado a cada build por hooks/codigos.py a partir das
   definições. Um clique simples (ou toque) num link que leva à definição de um código abre a
   janela com o código, o título, o resumo e o botão "Abrir definição"; Ctrl ou Cmd-clique e o
   clique do meio abrem o link como sempre. Enquanto a janela está aberta, o endereço recebe
   #codigo-RF11, e abrir a página com esse endereço abre a janela.
   Sem JavaScript, sem o índice ou sem suporte a <dialog>, o link leva à definição. */
(function () {
  "use strict";

  var PREFIXO = "#codigo-";
  var script = document.currentScript || document.querySelector('script[src*="codigos.js"]');
  if (!script || !window.fetch || !window.URL) {
    return;
  }
  var raiz = new URL("../../", script.src);
  var arquivo = new URL("../codigos.json", script.src);
  var indice = null; // { porCodigo: {}, porEndereco: {} }
  var carregando = null;
  var janela = null;
  var partes = {};
  var aberto = null; // código em exibição
  var origem = null; // elemento que abriu a janela
  var anterior = ""; // endereço antes da janela

  function suporta() {
    return typeof HTMLDialogElement === "function" &&
      typeof document.createElement("dialog").showModal === "function";
  }

  function decodificar(texto) {
    try {
      return decodeURIComponent(texto);
    } catch (erro) {
      return texto;
    }
  }

  function chave(url) {
    var caminho = url.pathname.replace(/index\.html$/, "");
    return caminho + decodificar(url.hash).toLowerCase();
  }

  function carregar() {
    if (!carregando) {
      carregando = fetch(arquivo.href)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (dados) {
          var porCodigo = {}, porEndereco = {};
          Object.keys(dados.codigos || {}).forEach(function (cod) {
            var e = dados.codigos[cod];
            e.codigo = cod;
            e.href = new URL(e.url, raiz).href;
            porCodigo[cod.toLowerCase()] = e;
            porEndereco[chave(new URL(e.href))] = cod;
          });
          indice = { porCodigo: porCodigo, porEndereco: porEndereco };
          return indice;
        })
        .catch(function () { return null; });
    }
    return carregando;
  }

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) { n.className = classe; }
    if (texto) { n.textContent = texto; }
    return n;
  }

  function montarJanela() {
    if (janela && document.body.contains(janela)) {
      return janela;
    }
    janela = el("dialog", "cod-janela");
    janela.setAttribute("role", "dialog");
    janela.setAttribute("aria-modal", "true");
    janela.setAttribute("aria-labelledby", "cod-janela-titulo");
    janela.setAttribute("aria-describedby", "cod-janela-resumo");
    var corpo = el("div", "cod-janela__corpo");
    partes.tipo = el("p", "cod-janela__tipo");
    partes.titulo = el("h2", "cod-janela__titulo");
    partes.titulo.id = "cod-janela-titulo";
    partes.titulo.tabIndex = -1;
    partes.resumo = el("p", "cod-janela__resumo");
    partes.resumo.id = "cod-janela-resumo";
    partes.detalhes = el("dl", "cod-janela__detalhes");
    var acoes = el("div", "cod-janela__acoes");
    partes.abrir = el("a", "cod-janela__botao cod-janela__botao--principal", "Abrir definição");
    var fechar = el("button", "cod-janela__botao", "Fechar");
    fechar.type = "button";
    var x = el("button", "cod-janela__x", "×");
    x.type = "button";
    x.setAttribute("aria-label", "Fechar");
    acoes.appendChild(partes.abrir);
    acoes.appendChild(fechar);
    corpo.appendChild(x);
    corpo.appendChild(partes.tipo);
    corpo.appendChild(partes.titulo);
    corpo.appendChild(partes.resumo);
    corpo.appendChild(partes.detalhes);
    corpo.appendChild(acoes);
    janela.appendChild(corpo);
    document.body.appendChild(janela);

    fechar.addEventListener("click", function () { fecharJanela(); });
    x.addEventListener("click", function () { fecharJanela(); });
    // "Abrir definição": a janela fecha e o link segue o caminho normal (inclusive Ctrl-clique).
    partes.abrir.addEventListener("click", function (ev) {
      if (ev.button === 0 && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
        fecharJanela();
      }
    });
    // Clique fora da caixa: o alvo é o próprio <dialog>, porque o corpo ocupa toda a caixa.
    janela.addEventListener("click", function (ev) {
      if (ev.target === janela) { fecharJanela(); }
    });
    // Esc fecha pelo próprio <dialog>; aqui só se arruma o endereço e o foco.
    janela.addEventListener("close", limpar);
    // As teclas de atalho do tema (busca, página seguinte) não agem por trás da janela.
    janela.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape" && ev.key !== "Tab") { ev.stopPropagation(); }
    });
    return janela;
  }

  function abrir(cod, de, peloEndereco) {
    var e = indice && indice.porCodigo[cod.toLowerCase()];
    if (!e || !suporta()) {
      return false;
    }
    montarJanela();
    partes.tipo.textContent = e.rotulo + (e.destino ? " · " + (e.mvp ? "MVP" : "Fora do MVP: " + e.destino) : "");
    partes.titulo.textContent = "";
    partes.titulo.appendChild(el("span", "cod-janela__cod", e.codigo));
    if (e.titulo) {
      partes.titulo.appendChild(document.createTextNode(" " + e.titulo));
    }
    partes.resumo.textContent = e.resumo || "";
    partes.detalhes.textContent = "";
    (e.detalhes || []).forEach(function (d) {
      partes.detalhes.appendChild(el("dt", "", d[0]));
      partes.detalhes.appendChild(el("dd", "", d[1]));
    });
    partes.detalhes.hidden = !(e.detalhes && e.detalhes.length);
    partes.abrir.href = e.href;
    janela.classList.toggle("cod-janela--fora", e.mvp === false);
    if (!janela.open) {
      origem = de || document.activeElement;
      anterior = location.pathname + location.search + (peloEndereco ? "" : location.hash);
      janela.showModal();
    }
    aberto = e.codigo;
    if (decodificar(location.hash).toLowerCase() !== (PREFIXO + e.codigo).toLowerCase()) {
      history.replaceState(history.state, "", PREFIXO + e.codigo);
    }
    partes.titulo.focus();
    return true;
  }

  function limpar() {
    if (aberto === null) {
      return;
    }
    if (decodificar(location.hash).toLowerCase() === (PREFIXO + aberto).toLowerCase()) {
      history.replaceState(history.state, "", anterior);
    }
    aberto = null;
    if (origem && document.body.contains(origem) && typeof origem.focus === "function") {
      origem.focus({ preventScroll: true });
    }
    origem = null;
  }

  function fecharJanela() {
    limpar();
    if (janela && janela.open) {
      janela.close();
    }
  }

  // O link está dentro da própria definição do código (o cartão do RF, a linha da regra,
  // o parágrafo do objetivo ou a ficha da história)?
  function propria(a, url) {
    if (chave(new URL(url.pathname, location.href)) !== chave(new URL(location.pathname, location.href))) {
      return false;
    }
    var alvo = document.getElementById(decodificar(url.hash.slice(1)));
    if (!alvo) {
      return false;
    }
    if (alvo.contains(a)) {
      return true;
    }
    var linha = alvo.closest("tr");
    if (linha && linha.contains(a)) {
      return true;
    }
    var bloco = alvo.closest("p");
    if (bloco && bloco.contains(a)) {
      return true;
    }
    var ficha = bloco && bloco.nextElementSibling;
    return !!(ficha && ficha.tagName === "DETAILS" && ficha.contains(a));
  }

  // Captura antes da navegação instantânea do tema, que também ouve os cliques em links.
  document.addEventListener("click", function (ev) {
    if (!indice || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) {
      return;
    }
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a || a.target || a.hasAttribute("download") || !a.closest(".md-content") || (janela && janela.contains(a))) {
      return;
    }
    var url;
    try {
      url = new URL(a.href, location.href);
    } catch (erro) {
      return;
    }
    if (url.origin !== location.origin || !url.hash) {
      return;
    }
    var cod = indice.porEndereco[chave(url)];
    if (!cod || propria(a, url)) {
      return;
    }
    if (abrir(cod, a, false)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }, true);

  function lerEndereco() {
    var hash = decodificar(location.hash);
    if (hash.toLowerCase().indexOf(PREFIXO) !== 0) {
      return;
    }
    var cod = hash.slice(PREFIXO.length);
    carregar().then(function () {
      if (!aberto || aberto.toLowerCase() !== cod.toLowerCase()) {
        abrir(cod, null, true);
      }
    });
  }
  window.addEventListener("hashchange", lerEndereco);

  // ---- Árvore de rastreabilidade (seção 8.4): uma característica por vez ----
  function iniciarArvores() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-arvore]"), function (arv) {
      if (arv.getAttribute("data-pronta")) {
        return;
      }
      var lista = arv.querySelector("[data-arv-abas]");
      var abas = Array.prototype.slice.call(arv.querySelectorAll("[data-arv-cp]"));
      var paineis = Array.prototype.slice.call(arv.querySelectorAll("[data-arv-painel]"));
      var oes = Array.prototype.slice.call(arv.querySelectorAll("[data-oe]"));
      if (!lista || !abas.length || abas.length !== paineis.length) {
        return;
      }
      arv.setAttribute("data-pronta", "1");
      lista.setAttribute("role", "tablist");
      abas.forEach(function (aba, i) {
        aba.setAttribute("role", "tab");
        aba.setAttribute("aria-controls", paineis[i].id);
        paineis[i].setAttribute("role", "tabpanel");
        paineis[i].setAttribute("aria-labelledby", aba.id);
      });

      function escolher(i, focar) {
        abas.forEach(function (aba, j) {
          aba.setAttribute("aria-selected", i === j ? "true" : "false");
          aba.tabIndex = i === j ? 0 : -1;
          paineis[j].hidden = i !== j;
        });
        var pri = paineis[i].getAttribute("data-oe-principal");
        var sec = (paineis[i].getAttribute("data-oe-secundarios") || "").split(" ");
        oes.forEach(function (li) {
          var oe = li.getAttribute("data-oe");
          li.classList.toggle("arv-oe--principal", oe === pri);
          li.classList.toggle("arv-oe--secundario", sec.indexOf(oe) !== -1);
        });
        if (focar) { abas[i].focus(); }
      }

      abas.forEach(function (aba, i) {
        aba.addEventListener("click", function () { escolher(i, false); });
      });
      lista.addEventListener("keydown", function (ev) {
        var i = abas.indexOf(document.activeElement);
        if (i === -1) { return; }
        var n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: abas.length - 1 }[ev.key];
        if (n === undefined) { return; }
        ev.preventDefault();
        escolher((n + abas.length) % abas.length, true);
      });
      arv.classList.add("arv--js");
      escolher(0, false);
    });
  }

  function tudo() {
    iniciarArvores();
    carregar();
    lerEndereco();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(tudo);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tudo);
  } else {
    tudo();
  }
})();
