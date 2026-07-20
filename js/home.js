function iniciarHome() {
  var area = pegar(".AreaEtapas");
  var linha = pegar(".LinhaEtapas");
  var etapas = pegarTodos(".Etapa");

  if (area && etapas.length) {
    document.body.classList.add("AnimacoesHomeProntas");

    if (
      "IntersectionObserver" in window &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      var observador = new IntersectionObserver(
        function (entradas) {
          for (var i = 0; i < entradas.length; i++)
            if (entradas[i].isIntersecting) entradas[i].target.classList.add("EtapaVisivel");
        },
        { threshold: 0.2 }
      );

      for (var e = 0; e < etapas.length; e++) observador.observe(etapas[e]);
    } else {
      for (var x = 0; x < etapas.length; x++) etapas[x].classList.add("EtapaVisivel");
    }

    function atualizarLinha() {
      if (!linha) return;
      var caixa = area.getBoundingClientRect();
      var progresso =
        (innerHeight * 0.72 - caixa.top) / Math.max(1, caixa.height - innerHeight * 0.34);

      linha.style.setProperty("--ProgressoLinha", Math.max(0, Math.min(1, progresso)));
    }
    addEventListener("scroll", atualizarLinha);
    addEventListener("resize", atualizarLinha);
    atualizarLinha();
  }
  var grade = pegar(".GradeDepoimentos");

  if (grade) criarCarrossel(grade);
  var servicos = pegarTodos(".CartaoServico");

  for (var s = 0; s < servicos.length; s++) {
    servicos[s].onclick = function (evento) {
      if (evento.target.closest("a")) return;
      var acao = this.getAttribute("data-service");

      if (acao === "pedidos") location.href = "pages/pedidos-de-ajuda.html";
      else if (acao === "feed") location.href = "pages/feed.html";
      else location.href = "pages/pets-perdidos.html";
    };
  }
  var curtidas = pegarTodos(".BotaoCurtirHistoria");

  for (var c = 0; c < curtidas.length; c++) configurarCurtida(curtidas[c], c);

  var acao = consumirAcao();

  if (acao.indexOf("curtir-historia:") === 0) {
    var numero = Number(acao.split(":")[1]);

    if (curtidas[numero]) curtidas[numero].click();
  }
}

function criarCarrossel(grade) {
  var cards = pegarTodos(".CartaoDepoimento", grade);

  if (cards.length < 2) return;
  var area = document.createElement("div");

  area.className = "CarrosselDepoimentos";
  grade.parentNode.insertBefore(area, grade);
  area.appendChild(grade);
  grade.classList.add("CarrosselAtivo");
  var controles = document.createElement("div");

  controles.className = "ControlesCarrossel";
  controles.innerHTML =
    '<button type="button" aria-label="Anterior">←</button><span class="IndicadorCarrossel"></span><button type="button" aria-label="Próximo">→</button>';
  area.insertAdjacentElement("afterend", controles);
  var botoes = pegarTodos("button", controles);
  var indicador = pegar("span", controles);
  var posicao = 0;
  var toque = 0;
  var automatico;

  function visiveis() {
    if (innerWidth <= 680) return 1;

    if (innerWidth <= 1000) return 2;

    return 3;
  }

  function atualizar(direcao) {
    var limite = Math.max(0, cards.length - visiveis());

    if (direcao) posicao += direcao;

    if (posicao > limite) posicao = 0;

    if (posicao < 0) posicao = limite;
    var largura = cards[0].getBoundingClientRect().width;
    var espaco = parseFloat(getComputedStyle(grade).gap) || 0;

    grade.style.transform = "translateX(" + -posicao * (largura + espaco) + "px)";
    indicador.textContent =
      posicao + 1 + "–" + Math.min(cards.length, posicao + visiveis()) + " de " + cards.length;
  }

  function iniciar() {
    clearInterval(automatico);

    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      automatico = setInterval(function () {
        atualizar(1);
      }, 4300);
  }
  botoes[0].onclick = function () {
    atualizar(-1);
    iniciar();
  };
  botoes[1].onclick = function () {
    atualizar(1);
    iniciar();
  };
  area.onmouseenter = function () {
    clearInterval(automatico);
  };
  area.onmouseleave = iniciar;
  area.ontouchstart = function (evento) {
    toque = evento.touches[0].clientX;
    clearInterval(automatico);
  };
  area.ontouchend = function (evento) {
    var distancia = evento.changedTouches[0].clientX - toque;

    if (Math.abs(distancia) > 45) atualizar(distancia < 0 ? 1 : -1);
    iniciar();
  };
  addEventListener("resize", function () {
    atualizar();
    iniciar();
  });
  atualizar();
  iniciar();
}

function configurarCurtida(botao, indice) {
  function mostrar() {
    var lista = ler("sosPetCurtidasHistorias", []);
    var curtido = lista.indexOf(indice) !== -1;

    botao.textContent = curtido ? "♥" : "♡";
    botao.classList.toggle("Curtido", curtido);
  }
  botao.onclick = function () {
    if (!exigirLogin("curtir-historia:" + indice)) return;
    var lista = ler("sosPetCurtidasHistorias", []);
    var posicao = lista.indexOf(indice);

    if (posicao === -1) lista.push(indice);
    else lista.splice(posicao, 1);
    salvar("sosPetCurtidasHistorias", lista);
    mostrar();
    toast(posicao === -1 ? "História curtida." : "Curtida removida.");
  };
  mostrar();
}
iniciarHome();
