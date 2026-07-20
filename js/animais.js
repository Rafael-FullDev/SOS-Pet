function iniciarAnimais() {
  var cards = pegarTodos(".CartaoAnimal");

  if (!cards.length) return;
  var busca = pegar(".BuscaHero");
  var formulario = pegar(".FormFiltros");
  var resumo = pegar(".ResumoResultados");
  var vazio = pegar(".SemResultados");
  var chip = "todos";
  var categoria = "";
  var statusSalvos = ler("sosPetStatusAnimais", {});

  for (var i = 0; i < cards.length; i++) {
    var nome = pegar("h3", cards[i]).textContent.trim();
    var id =
      cards[i].getAttribute("data-id") ||
      normalizar(nome)
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    cards[i].setAttribute("data-id", id);

    if (statusSalvos[id]) {
      cards[i].setAttribute("data-status", statusSalvos[id]);
      var selo = pegar(".Selo", cards[i]);

      if (selo) selo.textContent = statusTexto(statusSalvos[id]);
    }
  }
  var barra = pegar(".BarraFiltrosAnimais");

  pegar("button", barra).onclick = limpar;

  function aplicar() {
    var termo = normalizar(busca ? busca.value : "");
    var valores = formulario ? new FormData(formulario) : null;
    var total = 0;
    var ativos = [];

    if (termo) ativos.push("Busca: " + busca.value.trim());

    if (chip !== "todos") ativos.push(chip.replace("-", " "));

    if (categoria) ativos.push(categoria.replace("-", " "));

    if (valores) {
      var nomes = ["especie", "condicao", "necessidade", "status"];

      for (var n = 0; n < nomes.length; n++)
        if (valores.get(nomes[n])) ativos.push(String(valores.get(nomes[n])).replace("-", " "));
    }

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var mostrar = !termo || normalizar(card.textContent).indexOf(termo) !== -1;
      var status = card.getAttribute("data-status") || "";

      if (valores) {
        var campos = ["especie", "condicao", "necessidade", "status"];

        for (var c = 0; c < campos.length; c++) {
          var valor = valores.get(campos[c]);

          if (valor) {
            if (campos[c] === "status") mostrar = mostrar && status.indexOf(valor) !== -1;
            else mostrar = mostrar && card.getAttribute("data-" + campos[c]) === valor;
          }
        }
      }

      if (chip === "recuperado") mostrar = mostrar && status.indexOf("recuperado") !== -1;

      if (chip === "urgente") mostrar = mostrar && status.indexOf("urgente") !== -1;

      if (chip === "precisando") mostrar = mostrar && status.indexOf("recuperado") === -1;

      if (categoria)
        mostrar =
          mostrar &&
          (card.getAttribute("data-especie") === categoria ||
            card.getAttribute("data-condicao") === categoria ||
            card.getAttribute("data-necessidade") === categoria);
      card.hidden = !mostrar;

      if (mostrar) total++;
    }

    if (resumo)
      resumo.textContent = total + (total === 1 ? " animal encontrado" : " animais encontrados");

    if (vazio) vazio.hidden = total > 0;
    pegar("p", barra).textContent = ativos.length
      ? "Filtros ativos: " + ativos.join(" · ")
      : "Mostrando todos os animais";
    pegar("button", barra).hidden = !ativos.length;
  }

  function limpar() {
    if (formulario) formulario.reset();

    if (busca) busca.value = "";
    chip = "todos";
    categoria = "";
    var botoes = pegarTodos("[data-chip], [data-categoria]");

    for (var i = 0; i < botoes.length; i++)
      botoes[i].setAttribute(
        "aria-pressed",
        botoes[i].getAttribute("data-chip") === "todos" ? "true" : "false"
      );
    aplicar();
  }

  function ajudar(card) {
    var nome = pegar("h3", card).textContent.trim();
    var id = card.getAttribute("data-id");

    abrirAjuda(
      nome,
      function (ajuda) {
        registrarAtividade("ajuda", "animais", id, nome, ajuda.tipo + ": " + ajuda.mensagem);

        if ((card.getAttribute("data-status") || "").indexOf("urgente") !== -1) {
          card.setAttribute("data-status", "em-atendimento");
          var selo = pegar(".Selo", card);

          if (selo) selo.textContent = "Em atendimento";
          statusSalvos[id] = "em-atendimento";
          salvar("sosPetStatusAnimais", statusSalvos);
        }
      },
      "ajudar-animal:" + id
    );
  }

  function detalhes(card) {
    var nome = pegar("h3", card).textContent.trim();
    var imagem = pegar("img", card).src;
    var texto = pegar("p", card).textContent.trim();
    var selo = pegar(".Selo", card);

    dialogo(
      nome,
      '<img class="ImagemDetalhe" src="' +
        imagem +
        '" alt="' +
        escapar(nome) +
        '"><p><strong>Status:</strong> ' +
        escapar(selo ? selo.textContent : "") +
        "</p><p>" +
        escapar(texto) +
        '</p><button class="BotaoModal QueroAjudarAnimal" type="button">🤝 Quero ajudar</button>',
      function (janela, fechar) {
        pegar(".QueroAjudarAnimal", janela).onclick = function () {
          fechar();
          ajudar(card);
        };
      }
    );
  }

  if (busca) busca.oninput = aplicar;

  if (formulario) {
    formulario.onsubmit = function (evento) {
      evento.preventDefault();
      aplicar();
      toast("Filtros aplicados.");
    };
    formulario.onreset = function () {
      setTimeout(function () {
        chip = "todos";
        categoria = "";
        aplicar();
      }, 10);
    };
  }
  document.onclick = function (evento) {
    var botao = evento.target.closest("[data-chip], [data-categoria]");

    if (botao) {
      var grupo = botao.hasAttribute("data-chip") ? "[data-chip]" : "[data-categoria]";
      var botoes = pegarTodos(grupo);
      var valor = botao.getAttribute(
        botao.hasAttribute("data-chip") ? "data-chip" : "data-categoria"
      );
      var ativo = botao.getAttribute("aria-pressed") === "true";

      for (var i = 0; i < botoes.length; i++) botoes[i].setAttribute("aria-pressed", "false");

      if (grupo === "[data-chip]") {
        chip = valor;
        botao.setAttribute("aria-pressed", "true");
      } else {
        categoria = ativo ? "" : valor;

        if (!ativo) botao.setAttribute("aria-pressed", "true");
      }
      aplicar();

      return;
    }
    var card = evento.target.closest(".CartaoAnimal");

    if (!card) return;

    if (evento.target.closest(".BotaoDetalhesAnimal")) detalhes(card);
    else if (evento.target.closest(".BotaoCompartilharAnimal"))
      compartilhar(pegar("h3", card).textContent, pegar("p", card).textContent);
    else if (!evento.target.closest("button, a")) detalhes(card);
  };
  var botoesTopo = pegarTodos(".BotoesAnimais button");

  if (botoesTopo[0])
    botoesTopo[0].onclick = function () {
      for (var i = 0; i < cards.length; i++)
        if (!cards[i].hidden) {
          cards[i].scrollIntoView({ behavior: "smooth" });
          break;
        }
    };

  if (botoesTopo[1])
    botoesTopo[1].onclick = function () {
      for (var i = 0; i < cards.length; i++)
        if (!cards[i].hidden) {
          ajudar(cards[i]);
          break;
        }
    };
  aplicar();
  var acao = consumirAcao();

  if (acao.indexOf("ajudar-animal:") === 0) {
    var id = acao.split(":")[1];

    for (var a = 0; a < cards.length; a++)
      if (cards[a].getAttribute("data-id") === id) ajudar(cards[a]);
  }
}
iniciarAnimais();
