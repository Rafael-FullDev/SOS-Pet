(function () {
  "use strict";

  var movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dispositivoComToque = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var pagina = document.body.dataset.page || "";
  var atualizacoesScroll = [];
  var atualizacoesMedidas = [];
  var quadroPendente = false;
  var medidaPendente = false;

  function todos(seletor, raiz) {
    return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor));
  }

  function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
  }

  function suavizar(valor) {
    valor = limitar(valor, 0, 1);
    return valor * valor * (3 - 2 * valor);
  }

  function registrarScroll(funcao) {
    if (typeof funcao === "function") atualizacoesScroll.push(funcao);
  }

  function registrarMedida(funcao) {
    if (typeof funcao === "function") atualizacoesMedidas.push(funcao);
  }

  function executarScroll() {
    quadroPendente = false;

    for (var i = 0; i < atualizacoesScroll.length; i++) {
      try {
        atualizacoesScroll[i]();
      } catch (erro) {
        console.error("Falha ao atualizar uma animação:", erro);
      }
    }
  }

  function solicitarScroll() {
    if (quadroPendente) return;
    quadroPendente = true;
    requestAnimationFrame(executarScroll);
  }

  function executarMedidas() {
    medidaPendente = false;

    for (var i = 0; i < atualizacoesMedidas.length; i++) {
      try {
        atualizacoesMedidas[i]();
      } catch (erro) {
        console.error("Falha ao recalcular uma animação:", erro);
      }
    }

    solicitarScroll();
  }

  function solicitarMedidas() {
    if (medidaPendente) return;
    medidaPendente = true;
    requestAnimationFrame(executarMedidas);
  }

  function configurarCicloGlobal() {
    addEventListener("scroll", solicitarScroll, { passive: true });
    addEventListener("resize", solicitarMedidas);
    addEventListener("orientationchange", solicitarMedidas);
    addEventListener("load", solicitarMedidas, { once: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(solicitarMedidas).catch(function () {});
    }
  }

  function prepararTransicaoPaginas() {
    var camada = document.createElement("div");
    var navegando = false;
    var temporizadorSeguranca = 0;

    camada.className = "TransicaoPagina";
    camada.setAttribute("aria-hidden", "true");
    camada.innerHTML =
      '<div class="MarcaTransicaoPagina" role="status" aria-live="polite">' +
      '<span class="LogoTransicaoPagina" aria-hidden="true"></span>' +
      '<span class="LinhaTransicaoPagina" aria-hidden="true"></span>' +
      '<span class="TextoLeitorTela">Carregando página</span>' +
      "</div>";
    document.body.appendChild(camada);

    function esconder() {
      navegando = false;
      clearTimeout(temporizadorSeguranca);
      document.body.classList.remove("TransicaoPaginaAtiva");
      camada.setAttribute("aria-hidden", "true");
    }

    function navegar(destino, substituir) {
      if (!destino || navegando) return;

      navegando = true;
      camada.setAttribute("aria-hidden", "false");
      document.body.classList.add("TransicaoPaginaAtiva");

      temporizadorSeguranca = setTimeout(esconder, 1800);

      setTimeout(function () {
        if (substituir) location.replace(destino);
        else location.href = destino;
      }, movimentoReduzido ? 30 : 170);
    }

    window.navegarComLoading = navegar;

    document.addEventListener(
      "click",
      function (evento) {
        var link = evento.target.closest("a[href]");
        var href;
        var destino;

        if (!link || evento.defaultPrevented || evento.button !== 0) return;
        if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
        if (link.hasAttribute("download") || link.target === "_blank") return;

        href = link.getAttribute("href");
        if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return;

        try {
          destino = new URL(link.href, location.href);
        } catch (erro) {
          return;
        }

        if (location.protocol !== "file:" && destino.origin !== location.origin) return;
        if (
          destino.pathname === location.pathname &&
          destino.search === location.search &&
          destino.hash
        )
          return;

        evento.preventDefault();
        navegar(destino.href);
      },
      true
    );

    addEventListener("pageshow", esconder);
    addEventListener("pagehide", function () {
      clearTimeout(temporizadorSeguranca);
    });
  }

  function introducaoJaVista() {
    try {
      return sessionStorage.getItem("sosPetIntroducaoVista") === "1";
    } catch (erro) {
      return false;
    }
  }

  function marcarIntroducaoVista() {
    try {
      sessionStorage.setItem("sosPetIntroducaoVista", "1");
    } catch (erro) {}
  }

  function prepararIntroducao(aoFinalizar) {
    var introducao;
    var terminou = false;

    if (movimentoReduzido || pagina !== "home" || introducaoJaVista()) {
      aoFinalizar();
      return;
    }

    introducao = document.createElement("div");
    introducao.className = "IntroducaoSOS";
    introducao.setAttribute("aria-hidden", "true");
    introducao.innerHTML =
      '<div class="MarcaIntroducao"><span class="LogoIntroducao"></span><span class="DetalheIntroducao"></span></div>';

    document.body.classList.add("IntroducaoAtiva");
    document.body.prepend(introducao);
    marcarIntroducaoVista();

    function finalizar() {
      if (terminou) return;
      terminou = true;
      document.body.classList.remove("IntroducaoAtiva");
      introducao.remove();
      aoFinalizar();
    }

    introducao.addEventListener("animationend", function (evento) {
      if (evento.target === introducao && evento.animationName === "saidaIntroducao") finalizar();
    });

    setTimeout(finalizar, 1200);
  }

  function prepararHero() {
    var seletores = {
      home: ".GradeInicio",
      feed: ".feed-header",
      pedidos: ".titulo-pagina",
      denuncia: ".ConteudoDenuncia > h1, .SubtituloDenuncia",
      perfil: ".profile-header",
      adocao: ".Topo",
      animais: ".HeroAnimais",
      perdidos: ".HeroPerdidos",
      login: ".Container",
      cadastro: ".Container",
    };
    var elemento = document.querySelector(seletores[pagina] || "main > :first-child");

    if (!elemento) return function () {};

    elemento.classList.add("HeroAnimado");

    return function () {
      requestAnimationFrame(function () {
        elemento.classList.add("HeroVisivel");
      });
    };
  }

  function pegarBlocosPrincipais() {
    var blocos = todos("main > section").filter(function (secao) {
      return !secao.classList.contains("Inicio") && secao.offsetHeight >= 110;
    });

    if (!blocos.length) {
      var extras = [
        ".posts",
        ".cards-pedidos",
        ".GradeAdocao",
        ".ListaPets",
        ".profile-content",
        ".FormularioDenuncia",
      ];

      extras.forEach(function (seletor) {
        todos(seletor).forEach(function (elemento) {
          if (!blocos.includes(elemento)) blocos.push(elemento);
        });
      });
    }

    return blocos;
  }

  function prepararRevelacoes() {
    var elementos = pegarBlocosPrincipais();

    elementos.forEach(function (elemento) {
      elemento.classList.add("RevelarRolagem");
    });

    if (movimentoReduzido || !("IntersectionObserver" in window)) {
      elementos.forEach(function (elemento) {
        elemento.classList.add("Apareceu");
      });
      return;
    }

    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("Apareceu");
          observador.unobserve(entrada.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    elementos.forEach(function (elemento) {
      observador.observe(elemento);
    });
  }

  function prepararParallax() {
    var seletor;
    var elemento;
    var ativo = true;

    if (movimentoReduzido || dispositivoComToque || innerWidth <= 900) return;

    seletor = pagina === "home" ? ".IconeComeceRapido" : pagina === "denuncia" ? ".IconeBannerDenuncia" : "";
    elemento = seletor ? document.querySelector(seletor) : null;

    if (!elemento || elemento.classList.contains("CachorroInicio")) return;

    elemento.classList.add("ParallaxSuave");

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entradas) {
          ativo = Boolean(entradas[0] && entradas[0].isIntersecting);
          if (!ativo) elemento.style.setProperty("--parallax-y", "0px");
          solicitarScroll();
        },
        { rootMargin: "120px" }
      ).observe(elemento);
    }

    registrarScroll(function () {
      var caixa;
      var centro;
      var distancia;
      var movimento;

      if (!ativo || innerWidth <= 900) return;

      caixa = elemento.getBoundingClientRect();
      centro = caixa.top + caixa.height / 2;
      distancia = centro - innerHeight / 2;
      movimento = limitar(-distancia * 0.022, -12, 12);
      elemento.style.setProperty("--parallax-y", movimento.toFixed(2) + "px");
    });
  }

  function prepararLinhaDoTempo() {
    var area = document.querySelector(".AreaEtapas");
    var linha = area ? area.querySelector(":scope > .LinhaEtapas") : null;
    var secao = area ? area.closest(".ComoFunciona") : null;
    var marcadores = area ? todos(".MarcadorLinhaTempo", area) : [];
    var preenchimento;
    var medidas = null;

    if (!area || !linha || !secao || marcadores.length < 2) return;

    document.body.classList.remove("AnimacoesHomeProntas");
    todos(".Etapa", area).forEach(function (etapa) {
      etapa.classList.add("EtapaVisivel");
    });

    linha.classList.add("LinhaAnimada");
    preenchimento = linha.querySelector(".PreenchimentoLinhaEtapas");

    if (!preenchimento) {
      preenchimento = document.createElement("span");
      preenchimento.className = "PreenchimentoLinhaEtapas";
      preenchimento.setAttribute("aria-hidden", "true");
      linha.appendChild(preenchimento);
    }

    function estaVisivel() {
      var estilo = getComputedStyle(linha);
      return estilo.display !== "none" && linha.offsetParent !== null;
    }

    function medir() {
      var areaCaixa;
      var primeiroCaixa;
      var ultimoCaixa;
      var secaoCaixa;
      var areaTopoDocumento;
      var primeiroCentroDocumento;
      var ultimoCentroDocumento;
      var secaoFimDocumento;
      var topoLocal;
      var altura;
      var inicioRolagem;
      var fimRolagem;

      medidas = null;
      if (!estaVisivel()) return;

      areaCaixa = area.getBoundingClientRect();
      primeiroCaixa = marcadores[0].getBoundingClientRect();
      ultimoCaixa = marcadores[marcadores.length - 1].getBoundingClientRect();
      secaoCaixa = secao.getBoundingClientRect();

      areaTopoDocumento = areaCaixa.top + scrollY;
      primeiroCentroDocumento = primeiroCaixa.top + scrollY + primeiroCaixa.height / 2;
      ultimoCentroDocumento = ultimoCaixa.top + scrollY + ultimoCaixa.height / 2;
      secaoFimDocumento = secaoCaixa.bottom + scrollY;
      topoLocal = primeiroCentroDocumento - areaTopoDocumento;
      altura = Math.max(1, ultimoCentroDocumento - primeiroCentroDocumento);
      inicioRolagem = primeiroCentroDocumento - innerHeight * 0.82;
      fimRolagem = secaoFimDocumento - innerHeight;

      if (fimRolagem <= inicioRolagem) fimRolagem = inicioRolagem + 1;

      medidas = {
        inicio: inicioRolagem,
        fim: fimRolagem,
        altura: altura,
        posicoes: marcadores.map(function (marcador) {
          var caixa = marcador.getBoundingClientRect();
          return caixa.top + scrollY + caixa.height / 2 - primeiroCentroDocumento;
        }),
      };

      linha.style.top = topoLocal.toFixed(2) + "px";
      linha.style.bottom = "auto";
      linha.style.height = altura.toFixed(2) + "px";
    }

    function atualizar() {
      var progresso;
      var alturaAtual;
      var secaoCaixa;

      if (!medidas || !estaVisivel()) return;

      secaoCaixa = secao.getBoundingClientRect();
      progresso = limitar((scrollY - medidas.inicio) / (medidas.fim - medidas.inicio), 0, 1);

      if (secaoCaixa.bottom <= innerHeight + 1) progresso = 1;

      preenchimento.style.transform = "scaleY(" + progresso.toFixed(4) + ")";
      alturaAtual = medidas.altura * progresso;

      marcadores.forEach(function (marcador, indice) {
        marcador.classList.toggle("MarcadorAtivo", alturaAtual + 5 >= medidas.posicoes[indice]);
      });
    }

    registrarMedida(medir);
    registrarScroll(atualizar);

    if (window.ResizeObserver) {
      new ResizeObserver(solicitarMedidas).observe(area);
    }
  }

  function prepararSecoesOrganicas() {
    var namespaceSvg = "http://www.w3.org/2000/svg";
    var secoes;
    var animacaoAtiva = false;
    var quadroOndas = 0;
    var tempoAnterior = 0;

    if (movimentoReduzido || pagina !== "home") return;

    secoes = [document.querySelector(".ComeceRapido"), document.querySelector(".Comunidade")]
      .filter(Boolean)
      .map(function (elemento, indice) {
        var svg = document.createElementNS(namespaceSvg, "svg");
        var caminho = document.createElementNS(namespaceSvg, "path");
        var cor = getComputedStyle(elemento).backgroundColor || "#fff4c9";
        var estado = {
          elemento: elemento,
          svg: svg,
          caminho: caminho,
          largura: 1,
          altura: 1,
          margem: 48,
          fase: indice * Math.PI * 0.8,
          direcao: indice % 2 === 0 ? 1 : -1,
          morfose: 0,
          visivel: false,
        };

        svg.classList.add("FundoOndaSecao");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("preserveAspectRatio", "none");
        caminho.classList.add("FormaOndaSecao");
        svg.appendChild(caminho);
        elemento.prepend(svg);
        elemento.classList.add("SecaoOrganica");
        elemento.style.setProperty("--fundo-organico", cor);

        return estado;
      });

    if (!secoes.length) return;

    function arredondar(valor) {
      return Math.round(valor * 100) / 100;
    }

    function pontosOnda(largura, base, amplitude, fase, direcao, quantidade) {
      var pontos = [];

      for (var i = 0; i <= quantidade; i++) {
        var proporcao = i / quantidade;
        var x = largura * proporcao;
        var ciclo = proporcao * Math.PI * 2 * 1.18;
        var y =
          base +
          (Math.sin(ciclo + fase) + Math.sin(ciclo * 0.54 - fase * 0.72) * 0.24) *
            amplitude *
            direcao;

        pontos.push([arredondar(x), arredondar(y)]);
      }

      return pontos;
    }

    function curva(partes, pontos, iniciar) {
      partes.push(iniciar ? "M" : "L", pontos[0][0], pontos[0][1]);

      for (var i = 0; i < pontos.length - 1; i++) {
        var anterior = pontos[i - 1] || pontos[i];
        var atual = pontos[i];
        var proximo = pontos[i + 1];
        var seguinte = pontos[i + 2] || proximo;

        partes.push(
          "C",
          arredondar(atual[0] + (proximo[0] - anterior[0]) / 6),
          arredondar(atual[1] + (proximo[1] - anterior[1]) / 6),
          arredondar(proximo[0] - (seguinte[0] - atual[0]) / 6),
          arredondar(proximo[1] - (seguinte[1] - atual[1]) / 6),
          proximo[0],
          proximo[1]
        );
      }
    }

    function medirSecao(estado) {
      estado.largura = Math.max(1, estado.elemento.offsetWidth);
      estado.altura = Math.max(1, estado.elemento.offsetHeight);
      estado.margem = innerWidth <= 760 ? 28 : 50;
      estado.svg.style.top = -estado.margem + "px";
      estado.svg.style.height = estado.altura + estado.margem * 2 + "px";
      estado.svg.setAttribute(
        "viewBox",
        "0 0 " + estado.largura + " " + (estado.altura + estado.margem * 2)
      );
    }

    function desenhar(estado) {
      var mobile = innerWidth <= 760;
      var amplitude = (mobile ? 14 : 32) * estado.morfose;
      var quantidade = mobile ? 9 : 14;
      var topo = pontosOnda(
        estado.largura,
        estado.margem,
        amplitude,
        estado.fase,
        estado.direcao,
        quantidade
      );
      var baixo = pontosOnda(
        estado.largura,
        estado.margem + estado.altura,
        amplitude * 0.72,
        estado.fase + Math.PI * 0.86,
        -estado.direcao,
        quantidade
      ).reverse();
      var partes = [];

      curva(partes, topo, true);
      curva(partes, baixo, false);
      partes.push("Z");
      estado.caminho.setAttribute("d", partes.join(" "));
    }

    function atualizarMorfose() {
      secoes.forEach(function (estado) {
        var caixa = estado.elemento.getBoundingClientRect();
        var progresso = (innerHeight * 0.94 - caixa.top) / Math.max(280, innerHeight * 0.55);
        estado.morfose = suavizar(progresso);

        if (!estado.visivel) desenhar(estado);
      });
    }

    function animar(tempo) {
      var delta = tempoAnterior ? Math.min(34, tempo - tempoAnterior) : 16;
      var algumVisivel = false;

      tempoAnterior = tempo;

      secoes.forEach(function (estado) {
        if (!estado.visivel) return;
        algumVisivel = true;
        estado.fase += delta * 0.00072 * estado.direcao;
        desenhar(estado);
      });

      if (algumVisivel) quadroOndas = requestAnimationFrame(animar);
      else {
        animacaoAtiva = false;
        tempoAnterior = 0;
        quadroOndas = 0;
      }
    }

    function iniciarOndas() {
      if (animacaoAtiva) return;
      if (!secoes.some(function (estado) { return estado.visivel; })) return;
      animacaoAtiva = true;
      quadroOndas = requestAnimationFrame(animar);
    }

    registrarMedida(function () {
      secoes.forEach(function (estado) {
        medirSecao(estado);
        desenhar(estado);
      });
    });
    registrarScroll(atualizarMorfose);

    if ("IntersectionObserver" in window) {
      var observador = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (entrada) {
            var estado = secoes.find(function (item) {
              return item.elemento === entrada.target;
            });

            if (estado) estado.visivel = entrada.isIntersecting;
          });
          iniciarOndas();
        },
        { rootMargin: "140px 0px" }
      );

      secoes.forEach(function (estado) {
        observador.observe(estado.elemento);
      });
    } else {
      secoes.forEach(function (estado) {
        estado.visivel = true;
      });
      iniciarOndas();
    }

    if (window.ResizeObserver) {
      secoes.forEach(function (estado) {
        new ResizeObserver(solicitarMedidas).observe(estado.elemento);
      });
    }

    addEventListener("pagehide", function () {
      if (quadroOndas) cancelAnimationFrame(quadroOndas);
    });
  }

  function prepararTrilhaAmarela() {
    var principal = document.querySelector("main");
    var inicio = document.querySelector(".ComoFunciona");
    var fim = document.querySelector(".Comunidade");
    var caixa;
    var svg;
    var caminho;
    var comprimento = 1;
    var inicioRolagem = 0;
    var fimRolagem = 1;

    if (movimentoReduzido || dispositivoComToque || pagina !== "home") return;
    if (!principal || !inicio || !fim) return;

    principal.classList.add("ComTrilhaAmarela");
    caixa = document.createElement("div");
    caixa.className = "TrilhaAmarelaScroll";
    caixa.setAttribute("aria-hidden", "true");
    caixa.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path class="FaixaAmarela"></path></svg>';
    principal.prepend(caixa);
    svg = caixa.querySelector("svg");
    caminho = caixa.querySelector("path");

    function obterTopoDocumento(elemento) {
      var topo = 0;
      var atual = elemento;

      while (atual) {
        topo += atual.offsetTop || 0;
        atual = atual.offsetParent;
      }

      return topo;
    }

    function aplicarProgresso(progresso) {
      var restante = comprimento * (1 - limitar(progresso, 0, 1));
      caminho.style.strokeDashoffset = (restante < 0.5 ? 0 : restante).toFixed(2);
    }

    function medir() {
      var principalTopo = obterTopoDocumento(principal);
      var inicioDocumento = obterTopoDocumento(inicio);
      var fimDocumento = obterTopoDocumento(fim) + fim.offsetHeight;
      var inicioTopo = inicioDocumento - principalTopo;
      var fimBase = fimDocumento - principalTopo;
      var largura = principal.scrollWidth;
      var altura = Math.max(320, fimBase - inicioTopo);
      var metadeDocumento = inicioDocumento + (fimDocumento - inicioDocumento) * 0.5;
      var y1 = altura * 0.1;
      var y2 = altura * 0.5;
      var y3 = altura * 0.9;
      var d =
        "M " +
        -largura * 0.04 +
        " " +
        y1 +
        " C " +
        largura * 0.24 +
        " " +
        y1 +
        ", " +
        largura * 0.78 +
        " " +
        y2 +
        ", " +
        largura * 1.04 +
        " " +
        y2 +
        " C " +
        largura * 0.76 +
        " " +
        y2 +
        ", " +
        largura * 0.28 +
        " " +
        y3 +
        ", " +
        -largura * 0.04 +
        " " +
        y3;

      caixa.style.top = inicioTopo + "px";
      caixa.style.width = largura + "px";
      caixa.style.height = altura + "px";
      svg.setAttribute("viewBox", "0 0 " + largura + " " + altura);
      caminho.setAttribute("d", d);
      comprimento = caminho.getTotalLength();
      caminho.style.strokeDasharray = comprimento.toFixed(2) + " " + comprimento.toFixed(2);

      // O desenho começa quando a área entra na viewport e já está completo
      // quando o centro da viewport alcança aproximadamente a metade dela.
      inicioRolagem = inicioDocumento - innerHeight * 0.82;
      fimRolagem = metadeDocumento - innerHeight * 0.5;
      if (fimRolagem <= inicioRolagem) fimRolagem = inicioRolagem + 1;

      aplicarProgresso(limitar((scrollY - inicioRolagem) / (fimRolagem - inicioRolagem), 0, 1));
    }

    function atualizar() {
      var progresso = limitar((scrollY - inicioRolagem) / (fimRolagem - inicioRolagem), 0, 1);
      aplicarProgresso(progresso);
    }

    registrarMedida(medir);
    registrarScroll(atualizar);
  }

  function prepararCabecalho() {
    var cabecalho = document.querySelector(".Cabecalho");
    if (!cabecalho) return;

    registrarScroll(function () {
      cabecalho.classList.toggle("NavCompacto", scrollY > 24);
    });
  }

  function prepararCarregamentos() {
    var seletoresIgnorados = ".BarraPesquisaAdocao, .FormFiltros, .FormularioFiltrosPerdidos";

    function ativar(botao, duracao) {
      if (!botao || !botao.isConnected || botao.classList.contains("Carregando")) return;

      botao.classList.add("Carregando");
      botao.setAttribute("aria-busy", "true");
      botao.disabled = true;

      setTimeout(function () {
        if (!botao.isConnected) return;
        botao.classList.remove("Carregando");
        botao.removeAttribute("aria-busy");
        botao.disabled = false;
      }, duracao || 720);
    }

    document.addEventListener("submit", function (evento) {
      var formulario = evento.target;
      var botao;

      if (!(formulario instanceof HTMLFormElement)) return;
      if (formulario.matches(seletoresIgnorados)) return;

      botao = formulario.querySelector('button[type="submit"], input[type="submit"]');
      ativar(botao, formulario.id === "FormularioLogin" || formulario.id === "FormularioCadastro" ? 1100 : 720);
    });

    document.addEventListener("click", function (evento) {
      var botaoSocial = evento.target.closest("[data-provider]");
      if (botaoSocial) ativar(botaoSocial, 1000);
    });
  }

  function prepararMenu() {
    todos(".MenuPrincipal a").forEach(function (link, indice) {
      link.style.setProperty("--indice-menu", indice);
    });
  }

  function observarNovosElementos() {
    if (!("MutationObserver" in window)) return;

    new MutationObserver(function (mudancas) {
      mudancas.forEach(function (mudanca) {
        mudanca.addedNodes.forEach(function (no) {
          var elementos;

          if (!(no instanceof HTMLElement)) return;
          elementos = no.matches("dialog, .ToastSOS") ? [no] : todos("dialog, .ToastSOS", no);

          elementos.forEach(function (elemento) {
            elemento.classList.add("AnimacaoNova");
            elemento.addEventListener(
              "animationend",
              function () {
                elemento.classList.remove("AnimacaoNova");
              },
              { once: true }
            );
          });
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }


  function prepararProgressoPagina() {
    var barra = document.createElement("span");

    barra.className = "ProgressoPagina";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);

    registrarScroll(function () {
      var total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      var progresso = limitar(scrollY / total, 0, 1);

      barra.style.transform = "scaleX(" + progresso.toFixed(4) + ")";
    });
  }

  function prepararHeroImersivo() {
    var seletores = {
      home: ".Inicio",
      adocao: ".HeroAdocao",
      animais: ".Sessao1",
      perdidos: ".HeroPerdidos",
      feed: ".feed-header",
      pedidos: ".titulo-pagina",
      denuncia: ".PaginaDenuncia",
      perfil: ".profile-card",
      login: ".PrincipalLogin",
      cadastro: ".PrincipalCadastre-se",
    };
    var hero = document.querySelector(seletores[pagina] || "");

    if (!hero) return;
    hero.classList.add("HeroImersivo");

    if (movimentoReduzido || dispositivoComToque) return;

    hero.addEventListener("pointermove", function (evento) {
      var caixa = hero.getBoundingClientRect();
      var x = limitar((evento.clientX - caixa.left) / Math.max(1, caixa.width), 0, 1);
      var y = limitar((evento.clientY - caixa.top) / Math.max(1, caixa.height), 0, 1);

      hero.style.setProperty("--hero-x", (x * 100).toFixed(2) + "%");
      hero.style.setProperty("--hero-y", (y * 100).toFixed(2) + "%");
    });

    hero.addEventListener("pointerleave", function () {
      hero.style.removeProperty("--hero-x");
      hero.style.removeProperty("--hero-y");
    });
  }

  function prepararRevelacoesDetalhadas() {
    var seletoresPorPagina = {
      home: [
        ".DestaquesInicio .CartaoDestaque",
        ".GradeServicos .CartaoServico",
        ".ListaEtapas .Etapa",
        ".GradeHistorias .CartaoHistoria",
        ".GradeDepoimentos .CartaoDepoimento",
        ".ChamadaFinal",
      ],
      adocao: [
        ".AreaBuscaAdocao",
        ".LinhaFiltrosAdocao",
        ".CabecalhoListaAdocao",
        ".ListaPetsAdocao .CardAdocao",
        ".BannerDicasAdocao",
      ],
      animais: [
        ".Sessao1 .TextoHero",
        ".Sessao1 .FotoHero",
        ".FormFiltros",
        ".TextoAnimais",
        ".GradeCartoes .CartaoAnimal",
        ".GradePrioridades .CartaoPrioridade",
      ],
      perdidos: [
        ".TextoHeroPerdidos",
        ".ImagemHeroPerdidos",
        ".FormularioFiltrosPerdidos",
        ".GradeFiltrosRapidos > *",
        ".GradePetsPerdidos .CartaoPetPerdido",
        ".CartoesDestaquePerdidos .CartaoPetPerdido",
      ],
      feed: [".filters", ".BarraResultadoFeed", ".posts .post"],
      pedidos: [".filtros", ".BarraResultadoPedidos", ".cards-pedidos .card-pedido", ".novo-pedido"],
      denuncia: [".BannerDenuncia", ".OpcaoAnonima", ".FormularioDenuncia"],
      perfil: [
        ".AtalhosPerfil > *",
        ".AbasPerfil",
        ".card-estatisticas > *",
        ".pets-cards-container .pet-card",
        ".list-container .horizontal-card",
        ".promo-banner",
        ".grid-actions .acao-card",
      ],
      login: [".RedesSociais", ".Formulario"],
      cadastro: [".RedesSociais", ".Formulario"],
    };
    var observador = null;
    var seletoresComuns = [".CabecalhoSecao", ".section-header", ".CabecalhoPerdidos", ".CabecalhoListaAdocao"];
    var seletor = seletoresComuns.concat(seletoresPorPagina[pagina] || []).join(",");

    function revelar(elemento) {
      if (!elemento || elemento.classList.contains("RevelacaoDetalhada")) return;

      elemento.classList.add("RevelacaoDetalhada");
      var grupo = elemento.parentElement;
      if (grupo) {
        var irmaos = Array.prototype.filter.call(grupo.children, function (item) {
          return seletor && item.matches && item.matches(seletor);
        });
        var indice = irmaos.indexOf(elemento);
        elemento.style.setProperty("--atraso-revelacao", Math.min(4, Math.max(0, indice)) * 55 + "ms");
      }

      if (movimentoReduzido || !observador) elemento.classList.add("RevelacaoVisivel");
      else observador.observe(elemento);
    }

    if (!movimentoReduzido && "IntersectionObserver" in window) {
      observador = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("RevelacaoVisivel");
            observador.unobserve(entrada.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
      );
    }

    function prepararNaRaiz(raiz) {
      if (!seletor) return;
      if (raiz instanceof Element && raiz.matches(seletor)) revelar(raiz);
      todos(seletor, raiz instanceof Element ? raiz : document).forEach(revelar);
    }

    prepararNaRaiz(document);

    if ("MutationObserver" in window && seletor) {
      new MutationObserver(function (mudancas) {
        mudancas.forEach(function (mudanca) {
          mudanca.addedNodes.forEach(function (no) {
            if (no instanceof Element) prepararNaRaiz(no);
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  function prepararCartoesInterativos() {
    var seletorCartoes = [
      ".CartaoDestaque",
      ".CartaoServico",
      ".CartaoEtapa",
      ".CartaoHistoria",
      ".CardAdocao",
      ".CartaoAnimal",
      ".CartaoPrioridade",
      ".card-pedido",
      ".post",
      ".pet-card",
      ".horizontal-card",
      ".CartaoPetPerdido",
      ".acao-card",
      ".card-estatisticas > div",
    ].join(",");
    var destinosHome = {
      destaque: ["pages/pets-perdidos.html", "pages/animais-de-rua.html"],
      etapa: ["pages/cadastro.html", "pages/feed.html", "pages/pedidos-de-ajuda.html", "pages/pets-perdidos.html"],
      historia: ["pages/feed.html?filtro=perdidos", "pages/feed.html?filtro=ajuda", "pages/feed.html?filtro=adocao"],
    };

    function alvoNatural(card) {
      return card.querySelector(
        ".VerPerfilAdocao, .BotaoDetalhesAnimal, .btn-detalhes, .btn-ver-detalhes, .seta-btn, [data-action=detalhes]"
      );
    }

    function destinoDoCard(card) {
      var lista;
      var cards;
      var indice;

      if (pagina !== "home") return "";
      if (card.matches(".CartaoDestaque")) lista = destinosHome.destaque;
      else if (card.matches(".CartaoEtapa")) lista = destinosHome.etapa;
      else if (card.matches(".CartaoHistoria")) lista = destinosHome.historia;
      else return "";

      cards = todos(
        card.matches(".CartaoDestaque")
          ? ".CartaoDestaque"
          : card.matches(".CartaoEtapa")
            ? ".CartaoEtapa"
            : ".CartaoHistoria"
      );
      indice = cards.indexOf(card);
      return lista[indice] || "";
    }

    function ativarCard(card) {
      var alvo = alvoNatural(card);
      var destino = destinoDoCard(card);

      if (alvo) {
        alvo.click();
        return;
      }

      if (pagina === "animais" && card.matches(".CartaoPrioridade")) {
        var prioridades = todos(".CartaoPrioridade");
        var indicePrioridade = prioridades.indexOf(card);
        var campoPrioridade = document.querySelector(
          indicePrioridade === 0 ? '[name="condicao"]' : '[name="necessidade"]'
        );

        if (campoPrioridade) {
          campoPrioridade.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(function () { campoPrioridade.focus(); }, movimentoReduzido ? 0 : 420);
        }
        return;
      }

      if (destino && window.navegarComLoading) window.navegarComLoading(destino);
    }

    function tornarInterativo(card) {
      var destino;
      var alvo;
      var titulo;
      var jaClicavel;
      var acaoEspecial;

      if (!card || card.dataset.interacaoPronta === "1") return;
      card.dataset.interacaoPronta = "1";
      card.classList.add("CartaoInterativo");
      if (!card.querySelector(":scope > .BrilhoCardInterativo")) {
        var brilho = document.createElement("span");
        brilho.className = "BrilhoCardInterativo";
        brilho.setAttribute("aria-hidden", "true");
        card.appendChild(brilho);
      }
      destino = destinoDoCard(card);
      alvo = alvoNatural(card);
      jaClicavel = card.matches("button, a, [role=button], [role=link]");
      acaoEspecial = pagina === "animais" && card.matches(".CartaoPrioridade");

      if (!destino && !alvo && !jaClicavel && !acaoEspecial) return;

      card.classList.add("CartaoAcionavel");
      titulo = card.querySelector("h2, h3, h4, strong");

      if (!jaClicavel) {
        card.tabIndex = card.tabIndex >= 0 ? card.tabIndex : 0;
        card.setAttribute("role", destino ? "link" : "button");
        if (!card.hasAttribute("aria-label")) {
          card.setAttribute(
            "aria-label",
            (destino ? "Abrir " : "Ver detalhes de ") + (titulo ? titulo.textContent.trim() : "item")
          );
        }
      }

      card.addEventListener("click", function (evento) {
        if (evento.target.closest("a, button, input, select, textarea, label")) return;
        if (window.getSelection && String(window.getSelection()).trim()) return;
        ativarCard(card);
      });

      card.addEventListener("keydown", function (evento) {
        if (evento.target !== card || (evento.key !== "Enter" && evento.key !== " ")) return;
        evento.preventDefault();
        ativarCard(card);
      });
    }

    function prepararNaRaiz(raiz) {
      if (raiz instanceof Element && raiz.matches(seletorCartoes)) tornarInterativo(raiz);
      todos(seletorCartoes, raiz instanceof Element ? raiz : document).forEach(tornarInterativo);
    }

    prepararNaRaiz(document);

    document.addEventListener("pointermove", function (evento) {
      var card;
      var caixa;

      if (movimentoReduzido || dispositivoComToque) return;
      card = evento.target.closest(seletorCartoes);
      if (!card) return;
      caixa = card.getBoundingClientRect();
      card.style.setProperty("--card-x", (evento.clientX - caixa.left).toFixed(1) + "px");
      card.style.setProperty("--card-y", (evento.clientY - caixa.top).toFixed(1) + "px");
    });

    document.addEventListener("pointerout", function (evento) {
      var card = evento.target.closest(seletorCartoes);
      if (!card || (evento.relatedTarget && card.contains(evento.relatedTarget))) return;
      card.style.removeProperty("--card-x");
      card.style.removeProperty("--card-y");
    });

    document.addEventListener("click", function (evento) {
      var alvo = evento.target.closest("button, a, .CartaoAcionavel");
      var pulso;
      var caixa;

      if (!alvo || movimentoReduzido) return;
      caixa = alvo.getBoundingClientRect();
      alvo.classList.add("ComPulsoInteracao");
      pulso = document.createElement("span");
      pulso.className = "PulsoInteracao";
      pulso.style.left = (evento.clientX ? evento.clientX - caixa.left : caixa.width / 2) + "px";
      pulso.style.top = (evento.clientY ? evento.clientY - caixa.top : caixa.height / 2) + "px";
      alvo.appendChild(pulso);
      pulso.addEventListener("animationend", function () { pulso.remove(); }, { once: true });
    });

    if ("MutationObserver" in window) {
      new MutationObserver(function (mudancas) {
        mudancas.forEach(function (mudanca) {
          mudanca.addedNodes.forEach(function (no) {
            if (no instanceof Element) prepararNaRaiz(no);
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  function prepararContadores() {
    var seletor = ".card-estatisticas .numero, .ResumoAdocao, .ResumoResultados, .ResumoPetsPerdidos";
    var vistos = new WeakSet();

    function animar(elemento) {
      var texto;
      var correspondencia;
      var valorFinal;
      var inicio;
      var duracao = 520;

      if (!elemento || vistos.has(elemento) || movimentoReduzido) return;
      texto = elemento.textContent;
      correspondencia = texto.match(/\d+/);
      if (!correspondencia) return;
      valorFinal = Number(correspondencia[0]);
      if (!Number.isFinite(valorFinal)) return;
      vistos.add(elemento);
      inicio = performance.now();

      function quadro(agora) {
        var progresso = limitar((agora - inicio) / duracao, 0, 1);
        var atual = Math.round(valorFinal * suavizar(progresso));
        elemento.textContent = texto.replace(correspondencia[0], String(atual).padStart(correspondencia[0].length, "0"));
        if (progresso < 1) requestAnimationFrame(quadro);
      }

      requestAnimationFrame(quadro);
    }

    if ("IntersectionObserver" in window && !movimentoReduzido) {
      var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          animar(entrada.target);
          observador.unobserve(entrada.target);
        });
      }, { threshold: 0.5 });
      todos(seletor).forEach(function (elemento) { observador.observe(elemento); });
    }
  }

  function iniciar() {
    var mostrarHero;

    document.body.classList.add("ComAnimacao");
    configurarCicloGlobal();
    prepararTransicaoPaginas();
    prepararProgressoPagina();
    prepararHeroImersivo();
    mostrarHero = prepararHero();
    prepararRevelacoes();
    prepararRevelacoesDetalhadas();
    prepararCartoesInterativos();
    prepararContadores();
    prepararLinhaDoTempo();
    prepararSecoesOrganicas();
    prepararTrilhaAmarela();
    prepararParallax();
    prepararCabecalho();
    prepararCarregamentos();
    prepararMenu();
    observarNovosElementos();
    prepararIntroducao(mostrarHero);
    solicitarMedidas();
  }

  iniciar();
})();
