function iniciarPedidos() {
  var lista = pegar(".cards-pedidos");
  var paginacao = pegar('nav[aria-label="paginação"]');

  if (!lista || !paginacao) return;
  var parametros = new URLSearchParams(location.search);
  var filtro = parametros.get("filtro") || "todos";
  var pedidoInicial = Number(parametros.get("pedido"));
  var pagina = 1;
  var porPagina = 3;

  if (["todos", "perdidos", "adocao", "ajuda"].indexOf(filtro) === -1) filtro = "todos";
  var barra = pegar(".BarraResultadoPedidos");

  pegar("button", barra).onclick = function () {
    filtro = "todos";
    pagina = 1;
    mostrar();
  };

  function ajudaDoUsuario(pedido) {
    var ajudas = pedido.ajudas || [];

    for (var i = 0; i < ajudas.length; i++) if (ajudas[i].autorId === "usuario") return ajudas[i];

    return null;
  }

  function card(pedido) {
    var ajuda = ajudaDoUsuario(pedido);
    var dono = ehDono(pedido);
    var imagem = pedido.imagem
      ? '<img class="imagem-pet" loading="lazy" src="' +
        escapar(urlImagem(pedido.imagem)) +
        '" alt="Imagem do pedido">'
      : '<div class="ImagemPedidoVazia">Pedido publicado pela comunidade</div>';
    var urgente = pedido.urgente ? '<span class="status-urgente">Urgente</span>' : "";
    var menu = dono
      ? '<button class="MenuPedido" data-action="gerenciar" type="button" aria-label="Gerenciar pedido">⋮</button>'
      : "";

    return (
      '<article class="card-pedido" data-id="' +
      pedido.id +
      '" data-category="' +
      pedido.categoria +
      '"><header class="cabecalho-card"><img class="foto-usuario" src="' +
      escapar(urlImagem(pedido.avatar || "assets/images/home/Usuario.png")) +
      '" alt="Foto de ' +
      escapar(pedido.autor) +
      '"><div class="informacoes-usuario"><h2>' +
      escapar(pedido.autor) +
      "</h2><p>" +
      textoCategoria(pedido.categoria, true) +
      " · " +
      tempo(pedido.criadoEm) +
      '</p></div><div class="SelosPedido">' +
      urgente +
      '<span class="StatusPedidoCard">' +
      statusTexto(pedido.status) +
      "</span>" +
      menu +
      '</div></header><h3 data-action="detalhes" tabindex="0">' +
      escapar(pedido.titulo) +
      "</h3><p>" +
      escapar(pedido.descricao) +
      '</p><address class="localizacao">' +
      escapar(pedido.local) +
      '</address><div class="midia-card">' +
      imagem +
      '<div class="acoes-card"><button class="btn-ajudar" data-action="ajudar" type="button"><span>🤝</span> ' +
      (ajuda ? "Ver ajuda enviada" : "Quero ajudar") +
      '</button><button class="btn-compartilhar" data-action="compartilhar" type="button"><span>↗</span> Compartilhar</button><button class="btn-detalhes" data-action="detalhes" type="button">Ver detalhes</button></div></div></article>'
    );
  }

  function filtrados() {
    var pedidos = obterPedidos();
    var resultado = [];

    for (var i = 0; i < pedidos.length; i++)
      if (filtro === "todos" || pedidos[i].categoria === filtro) resultado.push(pedidos[i]);

    return resultado;
  }

  function mostrar() {
    var pedidos = filtrados();
    var totalPaginas = Math.max(1, Math.ceil(pedidos.length / porPagina));

    pagina = Math.max(1, Math.min(pagina, totalPaginas));
    var inicio = (pagina - 1) * porPagina;
    var html = "";

    for (var i = inicio; i < Math.min(inicio + porPagina, pedidos.length); i++)
      html += card(pedidos[i]);
    lista.innerHTML = html;
    pegar(".EstadoVazioPedidos").hidden = pedidos.length > 0;
    paginacao.innerHTML = "";

    if (totalPaginas > 1) {
      paginacao.innerHTML +=
        '<button class="btn-pag" data-page="anterior" type="button"' +
        (pagina === 1 ? " disabled" : "") +
        ">‹</button>";

      for (var p = 1; p <= totalPaginas; p++)
        paginacao.innerHTML +=
          '<button class="btn-pag" data-page="' +
          p +
          '" type="button"' +
          (p === pagina ? ' aria-current="page"' : "") +
          ">" +
          p +
          "</button>";
      paginacao.innerHTML +=
        '<button class="btn-pag" data-page="proximo" type="button"' +
        (pagina === totalPaginas ? " disabled" : "") +
        ">›</button>";
    }
    var botoes = pegarTodos(".filtro");

    for (var b = 0; b < botoes.length; b++) {
      var ativo = botoes[b].getAttribute("data-filter") === filtro;

      botoes[b].classList.toggle("ativo", ativo);
      botoes[b].setAttribute("aria-pressed", ativo);
    }
    pegar("p", barra).textContent =
      pedidos.length +
      (pedidos.length === 1 ? " pedido" : " pedidos") +
      (totalPaginas > 1 ? " · página " + pagina + " de " + totalPaginas : "");
    pegar("button", barra).hidden = filtro === "todos";
  }

  function salvarPedido(pedido) {
    if (!salvarItem("sosPetPedidos", pedido)) return false;
    mostrar();

    return true;
  }

  function abrirFormulario(pedido) {
    if (!exigirLogin("novo-pedido")) return;
    var usuario = usuarioAtual();
    var atual = pedido || {
      categoria: "ajuda",
      titulo: "",
      descricao: "",
      local: "",
      contato: usuario.telefone || "",
      imagem: "",
      urgente: false,
      status: "aberto",
      ajudas: [],
    };
    var html =
      '<form class="FormularioModal FormularioComPrevia" id="FormPedido"><p class="AjudaFormulario">Explique o que você precisa e confira a prévia.</p><label>1. Tipo de ajuda<select name="categoria"><option value="ajuda">Doação, transporte, tratamento ou resgate</option><option value="perdidos">Ajuda relacionada a um pet perdido</option><option value="adocao">Adoção ou lar temporário</option></select></label><label>2. Título<input name="titulo" maxlength="90" value="' +
      escapar(atual.titulo) +
      '" required></label><label>3. Localização<input name="local" maxlength="100" value="' +
      escapar(atual.local) +
      '" required></label><label class="LinhaCheckbox"><input name="urgente" type="checkbox"' +
      (atual.urgente ? " checked" : "") +
      '> Este pedido é urgente</label><label>4. Contato<input name="contato" value="' +
      escapar(atual.contato || usuario.telefone || "") +
      '" required></label><label>5. Descrição<textarea name="descricao" maxlength="500" required>' +
      escapar(atual.descricao) +
      '</textarea></label><label>6. Status<select name="status">' +
      opcoesStatus(["aberto", "recebendo-ajuda", "concluido"], atual.status) +
      "</select></label>" +
      campoImagem(atual.imagem) +
      '<div class="AreaPreviaPedido"></div><p class="ErroFormulario"></p><button class="BotaoModal" type="submit">' +
      (pedido ? "Salvar alterações" : "Confirmar e publicar pedido") +
      "</button></form>";

    dialogo(pedido ? "Editar pedido" : "Criar pedido de ajuda", html, function (janela, fechar) {
      var form = pegar("#FormPedido", janela);

      campo(form, "categoria").value = atual.categoria;
      var imagem = atual.imagem || "";
      var obterImagem = prepararImagem(janela, imagem, function (valor) {
        imagem = valor;
        previa();
      });

      function previa() {
        var titulo = campo(form, "titulo").value.trim() || "Título do pedido";
        var descricao = campo(form, "descricao").value.trim() || "A descrição aparecerá aqui.";
        var local = campo(form, "local").value.trim() || "Localização";

        pegar(".AreaPreviaPedido", form).innerHTML =
          '<p class="TituloPrevia">Prévia do pedido</p><article class="CartaoPrevia"><div class="CabecalhoPrevia"><strong>' +
          escapar(titulo) +
          "</strong>" +
          (campo(form, "urgente").checked ? "<span>Urgente</span>" : "") +
          "</div><small>" +
          textoCategoria(campo(form, "categoria").value, true) +
          " · " +
          statusTexto(campo(form, "status").value) +
          "</small><p>" +
          escapar(descricao) +
          "</p><em>📍 " +
          escapar(local) +
          "</em>" +
          (imagem ? '<img src="' + escapar(urlImagem(imagem)) + '" alt="Prévia">' : "") +
          "</article>";
      }
      form.oninput = previa;
      form.onchange = previa;
      previa();
      form.onsubmit = function (evento) {
        evento.preventDefault();
        var titulo = campo(form, "titulo").value.trim();
        var descricao = campo(form, "descricao").value.trim();
        var local = campo(form, "local").value.trim();
        var contato = campo(form, "contato").value.trim();

        if (titulo.length < 4 || descricao.length < 10 || local.length < 3 || contato.length < 5) {
          pegar(".ErroFormulario", janela).textContent =
            "Revise o título, a localização, o contato e a descrição.";

          return;
        }
        var novo = {
          id: pedido ? atual.id : Date.now(),
          autorId: "usuario",
          autor: usuario.nome,
          avatar: usuario.foto,
          categoria: campo(form, "categoria").value,
          status: campo(form, "status").value,
          titulo: titulo,
          descricao: descricao,
          local: local,
          contato: contato,
          imagem: obterImagem(),
          urgente: campo(form, "urgente").checked,
          criadoEm: atual.criadoEm || agora(),
          ajudas: atual.ajudas || [],
        };

        if (!salvarPedido(novo)) {
          pegar(".ErroFormulario", janela).textContent =
            "A imagem é grande demais para o navegador.";

          return;
        }
        registrarAtividade(
          pedido ? "edicao" : "pedido",
          "pedidos",
          novo.id,
          novo.titulo,
          pedido ? "Pedido atualizado." : "Pedido criado."
        );
        filtro = "todos";
        pagina = 1;
        fechar();
        mostrar();
        toast(pedido ? "Pedido atualizado." : "Pedido criado.");
      };
    });
  }

  function verAjuda(pedido) {
    var ajuda = ajudaDoUsuario(pedido);

    if (!ajuda) {
      abrirAjuda(
        pedido.titulo,
        function (novaAjuda) {
          pedido.ajudas = pedido.ajudas || [];
          pedido.ajudas.push(novaAjuda);

          if (pedido.status === "aberto") pedido.status = "recebendo-ajuda";
          salvarPedido(pedido);
          registrarAtividade(
            "ajuda",
            "pedidos",
            pedido.id,
            pedido.titulo,
            novaAjuda.tipo + ": " + novaAjuda.mensagem
          );
        },
        "ajudar-pedido:" + pedido.id
      );

      return;
    }
    dialogo(
      "Ajuda enviada",
      '<div class="DetalhesPedido"><p><strong>Pedido:</strong> ' +
        escapar(pedido.titulo) +
        "</p><p><strong>Tipo:</strong> " +
        escapar(ajuda.tipo) +
        "</p><p><strong>Contato:</strong> " +
        escapar(ajuda.contato) +
        "</p><p><strong>Mensagem:</strong> " +
        escapar(ajuda.mensagem) +
        "</p><p><strong>Enviada:</strong> " +
        tempo(ajuda.data) +
        "</p></div>"
    );
  }

  function gerenciar(pedido) {
    var html =
      '<p class="AvisoAcao"><strong>' +
      escapar(pedido.titulo) +
      '</strong></p><form class="FormularioModal" id="FormStatusPedido"><label>Status<select name="status">' +
      opcoesStatus(["aberto", "recebendo-ajuda", "concluido"], pedido.status) +
      '</select></label><button class="BotaoModal" type="submit">Atualizar status</button></form><div class="AcoesGerenciar"><button class="BotaoSecundario" data-gerenciar="editar" type="button">Editar pedido</button><button class="BotaoPerigo" data-gerenciar="excluir" type="button">Excluir pedido</button></div>';

    dialogo("Gerenciar pedido", html, function (janela, fechar) {
      pegar("#FormStatusPedido", janela).onsubmit = function (evento) {
        evento.preventDefault();
        var status = campo(evento.currentTarget, "status").value;

        if (
          status === "concluido" &&
          pedido.status !== status &&
          !confirm("Deseja concluir este pedido?")
        )
          return;
        pedido.status = status;
        salvarPedido(pedido);
        registrarAtividade(
          "status",
          "pedidos",
          pedido.id,
          pedido.titulo,
          "Status alterado para " + statusTexto(status) + "."
        );
        fechar();
        toast("Status atualizado.");
      };
      janela.onclick = function (evento) {
        var acao = evento.target.getAttribute("data-gerenciar");

        if (acao === "editar") {
          fechar();
          abrirFormulario(pedido);
        }

        if (acao === "excluir" && confirm("Deseja excluir o pedido “" + pedido.titulo + "”?")) {
          excluirItem("sosPetPedidos", pedido.id);
          registrarAtividade("exclusao", "pedidos", pedido.id, pedido.titulo, "Pedido excluído.");
          fechar();
          mostrar();
          toast("Pedido excluído.");
        }
      };
    });
  }

  function detalhes(pedido) {
    var imagem = pedido.imagem
      ? '<img class="ImagemDetalhe" src="' + escapar(urlImagem(pedido.imagem)) + '" alt="">'
      : "";
    var acoes = ehDono(pedido)
      ? '<button class="BotaoModal" data-detalhe="gerenciar" type="button">Gerenciar pedido</button>'
      : '<button class="BotaoModal" data-detalhe="ajudar" type="button">🤝 ' +
        (ajudaDoUsuario(pedido) ? "Ver ajuda enviada" : "Quero ajudar") +
        "</button>";
    var html =
      imagem +
      '<div class="DetalhesPedido"><p>' +
      escapar(pedido.descricao) +
      "</p><p><strong>Categoria:</strong> " +
      textoCategoria(pedido.categoria, true) +
      "</p><p><strong>Local:</strong> " +
      escapar(pedido.local) +
      "</p><p><strong>Status:</strong> " +
      statusTexto(pedido.status) +
      "</p><p><strong>Ofertas de ajuda:</strong> " +
      (pedido.ajudas || []).length +
      "</p></div>" +
      acoes;

    dialogo(pedido.titulo, html, function (janela, fechar) {
      janela.onclick = function (evento) {
        var acao = evento.target.getAttribute("data-detalhe");

        if (!acao) return;
        fechar();

        if (acao === "gerenciar") gerenciar(pedido);
        else verAjuda(pedido);
      };
    });
  }
  var botoesFiltro = pegarTodos(".filtro");

  for (var i = 0; i < botoesFiltro.length; i++)
    botoesFiltro[i].onclick = function () {
      filtro = this.getAttribute("data-filter");
      pagina = 1;
      mostrar();
    };
  paginacao.onclick = function (evento) {
    var botao = evento.target.closest("[data-page]");

    if (!botao || botao.disabled) return;
    var valor = botao.getAttribute("data-page");

    if (valor === "anterior") pagina--;
    else if (valor === "proximo") pagina++;
    else pagina = Number(valor);
    mostrar();
    lista.scrollIntoView({ behavior: "smooth" });
  };
  lista.onclick = function (evento) {
    var artigo = evento.target.closest(".card-pedido");
    var botao = evento.target.closest("[data-action]");

    if (!artigo || !botao) return;
    var pedido = procurarPorId(obterPedidos(), artigo.getAttribute("data-id"));
    var acao = botao.getAttribute("data-action");

    if (acao === "ajudar") verAjuda(pedido);

    if (acao === "detalhes") detalhes(pedido);

    if (acao === "gerenciar") gerenciar(pedido);

    if (acao === "compartilhar") compartilhar(pedido.titulo, pedido.descricao);
  };
  lista.onkeydown = function (evento) {
    if (
      (evento.key === "Enter" || evento.key === " ") &&
      evento.target.matches('h3[data-action="detalhes"]')
    ) {
      evento.preventDefault();
      detalhes(
        procurarPorId(obterPedidos(), evento.target.closest(".card-pedido").getAttribute("data-id"))
      );
    }
  };
  var novos = pegarTodos('[data-action="novo-pedido"]');

  for (var n = 0; n < novos.length; n++)
    novos[n].onclick = function () {
      abrirFormulario(null);
    };
  pegar(".BotaoFlutuanteMobile").onclick = function () {
    abrirFormulario(null);
  };
  mostrar();

  if (pedidoInicial)
    setTimeout(function () {
      var card = pegar('[data-id="' + pedidoInicial + '"]');
      var pedido = procurarPorId(obterPedidos(), pedidoInicial);

      if (card) card.scrollIntoView({ behavior: "smooth" });
      else if (pedido) detalhes(pedido);
    }, 100);
  var pendente = consumirAcao();

  if (pendente === "novo-pedido") abrirFormulario(null);
  var pedidoPendente = procurarPorId(obterPedidos(), pendente.split(":")[1]);

  if (pedidoPendente && pendente.indexOf("ajudar-pedido:") === 0) verAjuda(pedidoPendente);
}
iniciarPedidos();
