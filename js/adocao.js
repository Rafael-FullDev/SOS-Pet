(function () {
  var lista = pegar(".ListaPetsAdocao");

  if (!lista) return;

  var cards = Array.prototype.slice.call(pegarTodos(".CardAdocao", lista));
  var busca = pegar("#BuscaAdocao");
  var formularioBusca = pegar(".BarraPesquisaAdocao");
  var botoesCategoria = pegarTodos("[data-categoria]", pegar(".CategoriasAdocao"));
  var botaoFiltros = pegar(".BotaoAbrirFiltros");
  var painelFiltros = pegar("#FiltrosAdocao");
  var filtroVacinacao = pegar("#FiltroVacinacao");
  var ordenacao = pegar("#OrdenacaoAdocao");
  var limpar = pegar(".LimparFiltrosAdocao");
  var resumo = pegar(".ResumoAdocao");
  var vazio = pegar(".SemResultadosAdocao");
  var paginacao = pegar(".PaginacaoAdocao");
  var categoriaAtual = "todos";
  var paginaAtual = 1;
  var porPagina = 4;

  function textoCard(card) {
    return normalizar(card.textContent + " " + card.getAttribute("data-pet"));
  }

  function filtrados() {
    var termo = normalizar(busca.value);
    var vacinacao = filtroVacinacao.value;
    var resultado = cards.filter(function (card) {
      var categoria = card.getAttribute("data-categoria");
      var vacinado = card.getAttribute("data-vacinado");

      return (
        (categoriaAtual === "todos" || categoria === categoriaAtual) &&
        (vacinacao === "todos" || vacinado === vacinacao) &&
        (!termo || textoCard(card).indexOf(termo) !== -1)
      );
    });

    if (ordenacao.value === "nome") {
      resultado.sort(function (a, b) {
        return a.getAttribute("data-pet").localeCompare(b.getAttribute("data-pet"), "pt-BR");
      });
    } else if (ordenacao.value === "idade") {
      resultado.sort(function (a, b) {
        return Number(a.getAttribute("data-idade")) - Number(b.getAttribute("data-idade"));
      });
    }

    return resultado;
  }

  function desenharPaginacao(total) {
    var paginas = Math.ceil(total / porPagina);
    paginacao.innerHTML = "";
    paginacao.hidden = paginas <= 1;

    for (var numero = 1; numero <= paginas; numero++) {
      var botao = document.createElement("button");

      botao.type = "button";
      botao.textContent = numero;
      botao.className = numero === paginaAtual ? "Ativo" : "";
      botao.setAttribute("aria-label", "Ir para a página " + numero);
      if (numero === paginaAtual) botao.setAttribute("aria-current", "page");
      botao.onclick = (function (pagina) {
        return function () {
          paginaAtual = pagina;
          atualizar();
          pegar("#titulo-lista-adocao").scrollIntoView({ behavior: "smooth", block: "start" });
        };
      })(numero);
      paginacao.appendChild(botao);
    }
  }

  function atualizar() {
    var resultado = filtrados();
    var paginas = Math.max(1, Math.ceil(resultado.length / porPagina));

    if (paginaAtual > paginas) paginaAtual = paginas;
    var inicio = (paginaAtual - 1) * porPagina;
    var visiveis = resultado.slice(inicio, inicio + porPagina);

    cards.forEach(function (card) {
      card.hidden = visiveis.indexOf(card) === -1;
    });

    resumo.textContent =
      resultado.length + (resultado.length === 1 ? " animal encontrado" : " animais encontrados");
    vazio.hidden = resultado.length !== 0;
    desenharPaginacao(resultado.length);
  }

  formularioBusca.addEventListener("submit", function (evento) {
    evento.preventDefault();
    paginaAtual = 1;
    atualizar();
  });

  busca.addEventListener("input", function () {
    paginaAtual = 1;
    atualizar();
  });

  for (var i = 0; i < botoesCategoria.length; i++) {
    botoesCategoria[i].addEventListener("click", function () {
      categoriaAtual = this.getAttribute("data-categoria");
      paginaAtual = 1;

      for (var j = 0; j < botoesCategoria.length; j++) {
        var ativo = botoesCategoria[j] === this;
        botoesCategoria[j].classList.toggle("Ativo", ativo);
        botoesCategoria[j].setAttribute("aria-pressed", String(ativo));
      }
      atualizar();
    });
  }

  botaoFiltros.addEventListener("click", function () {
    var aberto = botaoFiltros.getAttribute("aria-expanded") === "true";

    botaoFiltros.setAttribute("aria-expanded", String(!aberto));
    painelFiltros.hidden = aberto;
  });

  filtroVacinacao.addEventListener("change", function () {
    paginaAtual = 1;
    atualizar();
  });

  ordenacao.addEventListener("change", function () {
    paginaAtual = 1;
    atualizar();
  });

  limpar.addEventListener("click", function () {
    busca.value = "";
    filtroVacinacao.value = "todos";
    ordenacao.value = "padrao";
    categoriaAtual = "todos";
    paginaAtual = 1;

    for (var i = 0; i < botoesCategoria.length; i++) {
      var ativo = botoesCategoria[i].getAttribute("data-categoria") === "todos";
      botoesCategoria[i].classList.toggle("Ativo", ativo);
      botoesCategoria[i].setAttribute("aria-pressed", String(ativo));
    }
    atualizar();
  });

  lista.addEventListener("click", function (evento) {
    var botao = evento.target.closest(".VerPerfilAdocao");

    if (!botao) return;
    var card = botao.closest(".CardAdocao");
    var nome = card.getAttribute("data-pet");
    var imagem = pegar("img", card).getAttribute("src");
    var detalhes = pegar(".InformacoesAdocao p", card).textContent;
    var status = pegar(".StatusAdocao", card).textContent;
    var html =
      '<div class="PerfilPetModal"><img src="' +
      escapar(imagem) +
      '" alt="Foto de ' +
      escapar(nome) +
      '"><p><strong>' +
      escapar(detalhes) +
      "</strong><br>" +
      escapar(status) +
      "</p><p>Este pet procura uma família preparada para oferecer cuidado, segurança e carinho. A equipe responsável fará uma conversa antes de concluir a adoção.</p>" +
      '<button class="BotaoInteresseAdocao" type="button">Tenho interesse em adotar</button></div>';

    dialogo("Conheça " + nome, html, function (janela, fechar) {
      pegar(".BotaoInteresseAdocao", janela).onclick = function () {
        if (!estaLogado()) {
          salvarTexto("sosPetDestinoLogin", location.href);
          salvarTexto("sosPetAcaoPendente", "Interesse na adoção de " + nome);
          location.href = "login.html";
          return;
        }
        registrarAtividade(
          "adocao",
          "adocao",
          Date.now(),
          "Interesse em adotar " + nome,
          "Solicitação enviada pela página de adoção."
        );
        fechar();
        toast("Interesse registrado. Acompanhe pelo seu perfil.");
      };
    });
  });

  atualizar();
})();
