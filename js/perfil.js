function iniciarPerfil() {
  if (!estaLogado()) {
    salvarTexto("sosPetDestinoLogin", location.href);
    location.replace("login.html");

    return;
  }

  function dadosUsuario() {
    var posts = obterPosts();
    var pedidos = obterPedidos();
    var meusPosts = [];
    var meusPedidos = [];

    for (var i = 0; i < posts.length; i++) if (ehDono(posts[i])) meusPosts.push(posts[i]);

    for (var j = 0; j < pedidos.length; j++) if (ehDono(pedidos[j])) meusPedidos.push(pedidos[j]);

    return { posts: meusPosts, pedidos: meusPedidos, atividades: ler("sosPetAtividades", []) };
  }

  function preencher() {
    var usuario = usuarioAtual();

    pegar('[data-profile="nome"]').textContent = usuario.nome || "Usuário SOS Pet";
    pegar('[data-profile="email"]').textContent = usuario.email || "";
    pegar('[data-profile="telefone"]').textContent =
      "📞 " + (usuario.telefone || "Telefone não informado");
    pegar('[data-profile="cidade"]').textContent =
      "📍 " + (usuario.cidade || "Cidade não informada");
    pegar(".avatar-large").src = urlImagem(usuario.foto);
    var dados = dadosUsuario();
    var ajudas = 0;
    var adocoes = 0;
    var ativos = 0;

    for (var i = 0; i < dados.atividades.length; i++)
      if (dados.atividades[i].tipo === "ajuda" || dados.atividades[i].tipo === "apoio") ajudas++;

    for (var j = 0; j < dados.posts.length; j++)
      if (dados.posts[j].categoria === "adocao" && dados.posts[j].status !== "adotado") adocoes++;

    for (var k = 0; k < dados.pedidos.length; k++)
      if (dados.pedidos[k].status !== "concluido") ativos++;
    var numeros = pegarTodos(".card-estatisticas .numero");

    numeros[0].textContent = ajudas < 10 ? "0" + ajudas : ajudas;
    numeros[1].textContent = adocoes < 10 ? "0" + adocoes : adocoes;
    numeros[2].textContent = ativos < 10 ? "0" + ativos : ativos;
    mostrarPedidos();
    mostrarAdocoes();
  }

  function configurarAtalhos() {
    pegar(".AtalhosPerfil").onclick = function (evento) {
      var botao = evento.target.closest("[data-atalho]");

      if (!botao) return;
      var acao = botao.getAttribute("data-atalho");

      if (acao === "atividades") listarAtividades();
      else {
        salvarTexto(
          "sosPetAcaoPendente",
          acao === "publicacao" ? "nova-publicacao" : "novo-pedido"
        );
        location.href = acao === "publicacao" ? "feed.html" : "pedidos-de-ajuda.html";
      }
    };
    pegar(".AbasPerfil").onclick = function (evento) {
      var botao = evento.target.closest("[data-secao]");

      if (!botao) return;
      var secao = botao.getAttribute("data-secao");

      if (secao === "atividades") listarAtividades();
      else pegar(secao).scrollIntoView({ behavior: "smooth" });
    };
  }

  function listarAtividades(tipo) {
    var atividades = dadosUsuario().atividades;
    var html = '<div class="ListaAtividades">';
    var total = 0;

    for (var i = 0; i < atividades.length; i++) {
      if (
        !tipo ||
        atividades[i].tipo === tipo ||
        (tipo === "ajuda" && atividades[i].tipo === "apoio")
      ) {
        html +=
          "<article><strong>" +
          escapar(atividades[i].titulo) +
          "</strong><p>" +
          escapar(atividades[i].detalhe) +
          "</p><small>" +
          tempo(atividades[i].data) +
          "</small></article>";
        total++;
      }
    }
    html += "</div>";

    if (!total)
      html =
        '<div class="EstadoVazioModal"><strong>Nenhuma atividade registrada.</strong><p>Suas publicações, pedidos e ajudas aparecerão aqui.</p></div>';
    dialogo(tipo === "ajuda" ? "Minhas ajudas" : "Minhas atividades", html);
  }

  function mostrarPedidos() {
    var lista = pegar(".meus-pedidos-de-ajuda .list-container");
    var pedidos = dadosUsuario().pedidos;

    if (!pedidos.length) {
      lista.innerHTML =
        '<div class="EstadoVazioPerfil"><strong>Você ainda não criou pedidos.</strong><p>Use o atalho “Criar pedido”.</p></div>';

      return;
    }
    var html = "";

    for (var i = 0; i < pedidos.length && i < 3; i++) {
      var classe =
        pedidos[i].status === "concluido"
          ? "status-concluido"
          : pedidos[i].status === "recebendo-ajuda"
            ? "status-em-andamento"
            : "status-ativo";

      html +=
        '<div class="horizontal-card" data-pedido-id="' +
        pedidos[i].id +
        '" tabindex="0" role="button"><img class="card-img" src="' +
        escapar(urlImagem(pedidos[i].imagem || "assets/images/perfil/cachorro-ajuda.jpg")) +
        '" alt="' +
        escapar(pedidos[i].titulo) +
        '"><div class="card-main-info"><h3>' +
        escapar(pedidos[i].titulo) +
        '</h3><p class="card-local">' +
        escapar(pedidos[i].local) +
        '</p></div><div class="card-status-container"><span class="' +
        classe +
        '">' +
        statusTexto(pedidos[i].status) +
        '</span><button class="seta-btn" type="button">→</button></div></div>';
    }
    lista.innerHTML = html;
  }

  function mostrarAdocoes() {
    var lista = pegar(".adocoes-section .list-container");
    var posts = dadosUsuario().posts;
    var html = "";
    var total = 0;

    for (var i = 0; i < posts.length && total < 3; i++) {
      if (posts[i].categoria !== "adocao") continue;
      var classe = posts[i].status === "adotado" ? "status-concluido" : "status-em-andamento";

      html +=
        '<div class="horizontal-card" data-post-id="' +
        posts[i].id +
        '" tabindex="0" role="button"><img class="card-img" src="' +
        escapar(urlImagem(posts[i].imagem || "assets/images/perfil/caozinho-bidu.jpg")) +
        '" alt="' +
        escapar(posts[i].titulo) +
        '"><div class="card-main-info"><h3>' +
        escapar(posts[i].titulo) +
        '</h3><p class="card-meta">' +
        escapar(posts[i].local) +
        '</p></div><div class="card-status-container"><span class="' +
        classe +
        '">' +
        statusTexto(posts[i].status) +
        '</span><button class="seta-btn" type="button">→</button></div></div>';
      total++;
    }

    if (!total)
      html =
        '<div class="EstadoVazioPerfil"><strong>Nenhuma adoção publicada.</strong><p>Suas publicações de adoção aparecerão aqui.</p></div>';
    lista.innerHTML = html;
  }

  function editarPerfil() {
    var usuario = usuarioAtual();
    var html =
      '<form class="FormularioModal" id="FormEditarPerfil"><label>Nome<input name="nome" value="' +
      escapar(usuario.nome) +
      '" required></label><label>E-mail<input name="email" type="email" value="' +
      escapar(usuario.email) +
      '" required></label><label>Telefone<input name="telefone" value="' +
      escapar(usuario.telefone || "") +
      '"></label><label>Cidade<input name="cidade" value="' +
      escapar(usuario.cidade || "") +
      '" required></label>' +
      campoImagem(usuario.foto) +
      '<p class="ErroFormulario"></p><button class="BotaoModal" type="submit">Salvar alterações</button></form>';

    dialogo("Editar perfil", html, function (janela, fechar) {
      var form = pegar("#FormEditarPerfil", janela);
      var obterImagem = prepararImagem(janela, usuario.foto);

      form.onsubmit = function (evento) {
        evento.preventDefault();

        if (
          campo(form, "nome").value.trim().length < 3 ||
          !/^\S+@\S+\.\S+$/.test(campo(form, "email").value.trim())
        ) {
          pegar(".ErroFormulario", janela).textContent = "Revise seu nome e e-mail.";

          return;
        }
        usuario.nome = campo(form, "nome").value.trim();
        usuario.email = campo(form, "email").value.trim();
        usuario.telefone = campo(form, "telefone").value.trim();
        usuario.cidade = campo(form, "cidade").value.trim();
        usuario.foto = obterImagem() || usuario.foto;
        salvarConta(usuario);
        registrarAtividade(
          "edicao",
          "perfil",
          "perfil",
          "Perfil atualizado",
          "Informações pessoais atualizadas."
        );
        fechar();
        configurarNavbar();
        preencher();
        toast("Perfil atualizado.");
      };
    });
  }

  function listarPets() {
    var cards = pegarTodos(".pet-card");
    var html = '<div class="ListaPetsModal">';

    for (var i = 0; i < cards.length; i++)
      html +=
        '<article><img src="' +
        pegar("img", cards[i]).src +
        '" alt=""><div><strong>' +
        escapar(pegar("h3", cards[i]).textContent) +
        "</strong><p>" +
        escapar(pegar("p", cards[i]).textContent) +
        "</p></div></article>";
    dialogo("Meus pets", html + "</div>");
  }

  function detalhesItem(item, tipo) {
    var texto = tipo === "pedido" ? item.descricao : item.texto;
    var link = tipo === "pedido" ? "pedidos-de-ajuda.html?pedido=" : "feed.html?post=";
    var imagem = item.imagem
      ? '<img class="ImagemDetalhe" src="' + escapar(urlImagem(item.imagem)) + '" alt="">'
      : "";

    dialogo(
      item.titulo,
      imagem +
        '<div class="DetalhesPedido"><p>' +
        escapar(texto) +
        "</p><p><strong>Local:</strong> " +
        escapar(item.local) +
        "</p><p><strong>Status:</strong> " +
        statusTexto(item.status) +
        '</p></div><a class="BotaoModal LinkComoBotao" href="' +
        link +
        item.id +
        '">Abrir página</a>'
    );
  }

  function doar() {
    dialogo(
      "Fazer uma doação",
      '<form class="FormularioModal" id="FormDoacao"><label>Tipo de ajuda<select name="tipo"><option>Ração</option><option>Medicamentos</option><option>Valor em dinheiro</option><option>Transporte</option></select></label><label>Quantidade ou valor<input name="valor" required></label><label>Mensagem<textarea name="mensagem"></textarea></label><button class="BotaoModal" type="submit">Registrar intenção</button></form>',
      function (janela, fechar) {
        pegar("#FormDoacao", janela).onsubmit = function (evento) {
          evento.preventDefault();
          var form = evento.currentTarget;

          if (!campo(form, "valor").value.trim()) return;
          registrarAtividade(
            "ajuda",
            "doacao",
            Date.now(),
            "Intenção de doação",
            campo(form, "tipo").value + ": " + campo(form, "valor").value.trim()
          );
          fechar();
          preencher();
          toast("Intenção registrada.");
        };
      }
    );
  }
  pegar('[data-action="editar-perfil"]').onclick = editarPerfil;
  var detalhesPets = pegarTodos(".btn-ver-detalhes");

  for (var i = 0; i < detalhesPets.length; i++)
    detalhesPets[i].onclick = function () {
      var card = this.closest(".pet-card");

      dialogo(
        pegar("h3", card).textContent,
        '<img class="ImagemDetalhe" src="' +
          pegar("img", card).src +
          '" alt=""><p>' +
          escapar(pegar("p", card).textContent) +
          "</p>"
      );
    };
  var verTodos = pegarTodos('[data-action="ver-todos"]');

  if (verTodos[0]) verTodos[0].onclick = listarPets;

  if (verTodos[1])
    verTodos[1].onclick = function () {
      var pedidos = dadosUsuario().pedidos;
      var html = '<div class="ListaAtividades">';

      for (var i = 0; i < pedidos.length; i++)
        html +=
          "<article><strong>" +
          escapar(pedidos[i].titulo) +
          "</strong><p>" +
          escapar(pedidos[i].local) +
          " · " +
          statusTexto(pedidos[i].status) +
          "</p><small>" +
          tempo(pedidos[i].criadoEm) +
          "</small></article>";
      dialogo(
        "Meus pedidos de ajuda",
        pedidos.length
          ? html + "</div>"
          : '<div class="EstadoVazioModal"><strong>Nenhum pedido criado.</strong></div>'
      );
    };
  document.onclick = function (evento) {
    var estatistica = evento.target.closest("[data-estatistica]");

    if (estatistica) {
      var indice = Number(estatistica.getAttribute("data-estatistica"));

      if (indice === 0) listarAtividades("ajuda");
      else
        pegar(indice === 1 ? ".adocoes-section" : ".meus-pedidos-de-ajuda").scrollIntoView({
          behavior: "smooth",
        });

      return;
    }
    var pedidoCard = evento.target.closest("[data-pedido-id]");

    if (pedidoCard) {
      detalhesItem(
        procurarPorId(obterPedidos(), pedidoCard.getAttribute("data-pedido-id")),
        "pedido"
      );

      return;
    }
    var postCard = evento.target.closest("[data-post-id]");

    if (postCard) {
      detalhesItem(procurarPorId(obterPosts(), postCard.getAttribute("data-post-id")), "post");

      return;
    }
    var acao = evento.target.closest("[data-action]");

    if (!acao) return;
    var nome = acao.getAttribute("data-action");

    if (nome === "doar") doar();

    if (nome === "encontrar-pet") location.href = "animais-de-rua.html";

    if (nome === "pedidos") location.href = "pedidos-de-ajuda.html";

    if (nome === "lar-temporario") location.href = "pedidos-de-ajuda.html?filtro=adocao";

    if (nome === "duvidas")
      dialogo(
        "Dúvidas mais lidas",
        "<p><strong>Como ajudar?</strong> Abra um animal ou pedido e clique em “Quero ajudar”.</p><p><strong>Como publicar?</strong> Use os atalhos do Perfil.</p><p><strong>Onde acompanho?</strong> Veja “Minhas atividades”.</p>"
      );
  };
  document.addEventListener("keydown", function (evento) {
    if (
      (evento.key === "Enter" || evento.key === " ") &&
      evento.target.hasAttribute("data-estatistica")
    ) {
      evento.preventDefault();
      evento.target.click();
    }
  });
  configurarAtalhos();
  preencher();
}
iniciarPerfil();
