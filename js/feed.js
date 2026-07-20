function iniciarFeed() {
  var lista = pegar(".posts");

  if (!lista) return;
  var filtro = new URLSearchParams(location.search).get("filtro") || "todos";
  var postInicial = Number(new URLSearchParams(location.search).get("post"));
  var filtros = ["todos", "perdidos", "adocao", "ajuda"];

  if (filtros.indexOf(filtro) === -1) filtro = "todos";
  var barra = pegar(".BarraResultadoFeed");

  pegar("button", barra).onclick = function () {
    filtro = "todos";
    mostrar();
  };

  function card(post) {
    var dono = ehDono(post);
    var comentarios = post.comentarios ? post.comentarios.length : 0;
    var imagem = post.imagem
      ? '<div class="post-image" data-action="detalhes"><img loading="lazy" src="' +
        escapar(urlImagem(post.imagem)) +
        '" alt="Imagem da publicação"></div>'
      : "";
    var urgente = post.urgente ? '<span class="badge badge-urgent">! Urgente</span>' : "";
    var menu = dono
      ? '<button class="MenuPublicacao" data-action="gerenciar" type="button" aria-label="Gerenciar publicação">⋮</button>'
      : "";
    var curtida = post.curtido ? "♥" : "♡";
    var textoCurtida = post.curtido ? "Curtido" : "Curtir";
    var textoApoio = post.apoiado ? "Apoiado" : "Apoiar";

    return (
      '<article class="post" data-id="' +
      post.id +
      '" data-category="' +
      post.categoria +
      '">' +
      '<header class="post-header"><img class="avatar" src="' +
      escapar(urlImagem(post.avatar || "assets/images/home/Usuario.png")) +
      '" alt="' +
      escapar(post.autor) +
      '"><div class="post-user"><h3 class="user-name">' +
      escapar(post.autor) +
      '</h3><p class="post-meta">' +
      textoCategoria(post.categoria, false) +
      " · " +
      tempo(post.criadoEm) +
      '</p></div><div class="SelosPublicacao">' +
      urgente +
      '<span class="StatusPublicacao">' +
      statusTexto(post.status) +
      "</span>" +
      menu +
      "</div></header>" +
      '<h2 class="post-title" data-action="detalhes" tabindex="0">' +
      escapar(post.titulo) +
      '</h2><p class="post-text">' +
      escapar(post.texto) +
      '</p><p class="post-location"><span class="pin">📍</span> ' +
      escapar(post.local) +
      "</p>" +
      imagem +
      '<footer class="post-actions"><div class="actions-left"><button class="action" data-action="curtir" type="button" aria-pressed="' +
      Boolean(post.curtido) +
      '"><span>' +
      curtida +
      "</span><span>" +
      textoCurtida +
      "</span><strong>" +
      Number(post.curtidas || 0) +
      '</strong></button><button class="action" data-action="comentar" type="button"><span>💬</span><span>Comentários</span><strong>' +
      comentarios +
      '</strong></button><button class="action" data-action="apoiar" type="button" aria-pressed="' +
      Boolean(post.apoiado) +
      '"><span>🤝</span><span>' +
      textoApoio +
      "</span><strong>" +
      Number(post.apoios || 0) +
      '</strong></button></div><button class="action share" data-action="compartilhar" type="button"><span>↗</span><span>Compartilhar</span></button></footer></article>'
    );
  }

  function mostrar() {
    var posts = obterPosts();
    var html = "";
    var total = 0;

    for (var i = 0; i < posts.length; i++) {
      if (filtro === "todos" || posts[i].categoria === filtro) {
        html += card(posts[i]);
        total++;
      }
    }
    lista.innerHTML = html;
    pegar(".EstadoVazioFeed").hidden = total > 0;
    var botoes = pegarTodos(".filter-tab");

    for (var b = 0; b < botoes.length; b++) {
      var ativo = botoes[b].getAttribute("data-filter") === filtro;

      botoes[b].classList.toggle("is-active", ativo);
      botoes[b].setAttribute("aria-pressed", ativo);
    }
    pegar("p", barra).textContent = total + (total === 1 ? " publicação" : " publicações");
    pegar("button", barra).hidden = filtro === "todos";
  }

  function salvarPost(post) {
    if (!salvarItem("sosPetPosts", post)) return false;
    mostrar();

    return true;
  }

  function abrirFormulario(post) {
    if (!exigirLogin("nova-publicacao")) return;
    var usuario = usuarioAtual();
    var atual = post || {
      categoria: "perdidos",
      status: "desaparecido",
      titulo: "",
      texto: "",
      local: "",
      imagem: "",
      urgente: false,
      comentarios: [],
    };
    var html =
      '<form class="FormularioModal FormularioComPrevia" id="FormPublicacao"><p class="AjudaFormulario">Preencha os campos e confira a prévia.</p><label>1. O que aconteceu?<select name="categoria"><option value="perdidos">Um pet desapareceu</option><option value="adocao">Um animal está para adoção</option><option value="ajuda">Preciso de ajuda</option></select></label><label>2. Status<select name="status"></select></label><label>3. Título<input name="titulo" maxlength="80" value="' +
      escapar(atual.titulo) +
      '" required></label><label>4. Descrição<textarea name="texto" maxlength="500" required>' +
      escapar(atual.texto) +
      '</textarea></label><label>5. Localização<input name="local" maxlength="100" value="' +
      escapar(atual.local) +
      '" required></label>' +
      campoImagem(atual.imagem) +
      '<label class="LinhaCheckbox"><input name="urgente" type="checkbox"' +
      (atual.urgente ? " checked" : "") +
      '> Marcar como urgente</label><div class="AreaPreviaPublicacao"></div><p class="ErroFormulario"></p><button class="BotaoModal" type="submit">' +
      (post ? "Salvar alterações" : "Confirmar e publicar") +
      "</button></form>";

    dialogo(post ? "Editar publicação" : "Nova publicação", html, function (janela, fechar) {
      var form = pegar("#FormPublicacao", janela);

      campo(form, "categoria").value = atual.categoria;
      campo(form, "status").innerHTML = opcoesStatus(
        statusDaCategoria(atual.categoria),
        atual.status
      );
      var imagem = atual.imagem || "";
      var obterImagem = prepararImagem(janela, imagem, function (valor) {
        imagem = valor;
        previa();
      });

      function previa() {
        var titulo = campo(form, "titulo").value.trim() || "Título da publicação";
        var texto = campo(form, "texto").value.trim() || "A descrição aparecerá aqui.";
        var local = campo(form, "local").value.trim() || "Localização";

        pegar(".AreaPreviaPublicacao", form).innerHTML =
          '<p class="TituloPrevia">Prévia da publicação</p><article class="CartaoPrevia"><div class="CabecalhoPrevia"><strong>' +
          escapar(titulo) +
          "</strong>" +
          (campo(form, "urgente").checked ? "<span>Urgente</span>" : "") +
          "</div><small>" +
          textoCategoria(campo(form, "categoria").value, false) +
          " · " +
          statusTexto(campo(form, "status").value) +
          "</small><p>" +
          escapar(texto) +
          "</p><em>📍 " +
          escapar(local) +
          "</em>" +
          (imagem ? '<img src="' + escapar(urlImagem(imagem)) + '" alt="Prévia">' : "") +
          "</article>";
      }
      campo(form, "categoria").onchange = function () {
        campo(form, "status").innerHTML = opcoesStatus(
          statusDaCategoria(campo(form, "categoria").value),
          ""
        );
        previa();
      };
      form.oninput = previa;
      form.onchange = previa;
      previa();
      form.onsubmit = function (evento) {
        evento.preventDefault();
        var titulo = campo(form, "titulo").value.trim();
        var texto = campo(form, "texto").value.trim();
        var local = campo(form, "local").value.trim();

        if (titulo.length < 4 || texto.length < 10 || local.length < 3) {
          pegar(".ErroFormulario", janela).textContent =
            "Revise o título, a descrição e a localização.";

          return;
        }
        var novo = {
          id: post ? atual.id : Date.now(),
          autorId: "usuario",
          autor: usuario.nome,
          avatar: usuario.foto,
          categoria: campo(form, "categoria").value,
          status: campo(form, "status").value,
          titulo: titulo,
          texto: texto,
          local: local,
          imagem: obterImagem(),
          urgente: campo(form, "urgente").checked,
          curtidas: atual.curtidas || 0,
          apoios: atual.apoios || 0,
          curtido: Boolean(atual.curtido),
          apoiado: Boolean(atual.apoiado),
          criadoEm: atual.criadoEm || agora(),
          comentarios: atual.comentarios || [],
        };

        if (!salvarPost(novo)) {
          pegar(".ErroFormulario", janela).textContent =
            "A imagem é grande demais para o navegador.";

          return;
        }
        registrarAtividade(
          post ? "edicao" : "publicacao",
          "feed",
          novo.id,
          novo.titulo,
          post ? "Publicação atualizada." : "Publicação criada."
        );
        filtro = "todos";
        fechar();
        mostrar();
        toast(post ? "Publicação atualizada." : "Publicação criada.");
      };
    });
  }

  function abrirDetalhes(post) {
    var imagem = post.imagem
      ? '<img class="ImagemDetalhe" src="' + escapar(urlImagem(post.imagem)) + '" alt="">'
      : "";
    var botao = ehDono(post)
      ? '<button class="BotaoModal" data-modal="gerenciar" type="button">Gerenciar publicação</button>'
      : '<button class="BotaoModal" data-modal="apoiar" type="button">🤝 Apoiar</button>';
    var html =
      imagem +
      '<div class="DetalhesPedido"><p>' +
      escapar(post.texto) +
      "</p><p><strong>Categoria:</strong> " +
      textoCategoria(post.categoria, false) +
      "</p><p><strong>Local:</strong> " +
      escapar(post.local) +
      "</p><p><strong>Status:</strong> " +
      statusTexto(post.status) +
      '</p></div><div class="AcoesDetalhePublicacao"><button class="BotaoSecundario" data-modal="comentar" type="button">💬 Ver comentários</button><button class="BotaoSecundario" data-modal="compartilhar" type="button">↗ Compartilhar</button>' +
      botao +
      "</div>";

    dialogo(post.titulo, html, function (janela, fechar) {
      janela.onclick = function (evento) {
        var acao = evento.target.getAttribute("data-modal");

        if (!acao) return;

        if (acao !== "compartilhar") fechar();

        if (acao === "comentar") abrirComentarios(post);

        if (acao === "compartilhar") compartilhar(post.titulo, post.texto);

        if (acao === "gerenciar") gerenciar(post);

        if (acao === "apoiar") alternar(post, "apoiado");
      };
    });
  }

  function gerenciar(post) {
    var html =
      '<p class="AvisoAcao"><strong>' +
      escapar(post.titulo) +
      '</strong></p><form class="FormularioModal" id="FormStatus"><label>Status<select name="status">' +
      opcoesStatus(statusDaCategoria(post.categoria), post.status) +
      '</select></label><button class="BotaoModal" type="submit">Atualizar status</button></form><div class="AcoesGerenciar"><button class="BotaoSecundario" data-gerenciar="editar" type="button">Editar publicação</button><button class="BotaoPerigo" data-gerenciar="excluir" type="button">Excluir publicação</button></div>';

    dialogo("Gerenciar publicação", html, function (janela, fechar) {
      pegar("#FormStatus", janela).onsubmit = function (evento) {
        evento.preventDefault();
        var novo = campo(evento.currentTarget, "status").value;

        if (
          ["encontrado", "adotado", "concluido"].indexOf(novo) !== -1 &&
          novo !== post.status &&
          !confirm("Deseja atualizar o status para " + statusTexto(novo) + "?")
        )
          return;
        post.status = novo;
        salvarPost(post);
        registrarAtividade(
          "status",
          "feed",
          post.id,
          post.titulo,
          "Status alterado para " + statusTexto(novo) + "."
        );
        fechar();
        toast("Status atualizado.");
      };
      janela.onclick = function (evento) {
        var acao = evento.target.getAttribute("data-gerenciar");

        if (acao === "editar") {
          fechar();
          abrirFormulario(post);
        }

        if (acao === "excluir" && confirm("Deseja excluir a publicação “" + post.titulo + "”?")) {
          excluirItem("sosPetPosts", post.id);
          registrarAtividade("exclusao", "feed", post.id, post.titulo, "Publicação excluída.");
          fechar();
          mostrar();
          toast("Publicação excluída.");
        }
      };
    });
  }

  function abrirComentarios(post) {
    function conteudo() {
      var html = '<div class="ListaComentarios">';
      var comentarios = post.comentarios || [];

      if (!comentarios.length)
        html +=
          '<p class="SemComentarios"><strong>Nenhum comentário ainda.</strong><span>Seja a primeira pessoa a comentar.</span></p>';

      for (var i = 0; i < comentarios.length; i++)
        html +=
          '<article class="Comentario" data-comentario="' +
          comentarios[i].id +
          '"><div><strong>' +
          escapar(comentarios[i].autor) +
          "</strong><small>" +
          tempo(comentarios[i].data) +
          "</small></div><p>" +
          escapar(comentarios[i].texto) +
          "</p>" +
          (comentarios[i].autorId === "usuario"
            ? '<button class="ExcluirComentario" type="button">Excluir meu comentário</button>'
            : "") +
          "</article>";
      html += "</div>";

      if (estaLogado())
        html +=
          '<form class="FormularioModal" id="FormComentario"><label>Novo comentário<textarea name="texto" required></textarea></label><p class="ErroFormulario"></p><button class="BotaoModal" type="submit">Publicar comentário</button></form>';
      else
        html +=
          '<button class="BotaoModal EntrarComentar" type="button">Entrar para comentar</button>';

      return html;
    }
    var janela = dialogo("Comentários — " + post.titulo, conteudo(), function (janela, fechar) {
      var area = pegar(".DialogoConteudo", janela);

      area.onclick = function (evento) {
        if (evento.target.closest(".EntrarComentar")) {
          fechar();
          exigirLogin("comentarios:" + post.id);
        }
        var excluir = evento.target.closest(".ExcluirComentario");

        if (excluir && confirm("Deseja excluir este comentário?")) {
          var id = Number(excluir.closest("[data-comentario]").getAttribute("data-comentario"));

          for (var i = post.comentarios.length - 1; i >= 0; i--)
            if (post.comentarios[i].id === id) post.comentarios.splice(i, 1);
          salvarPost(post);
          area.innerHTML = conteudo();
        }
      };
      area.onsubmit = function (evento) {
        if (evento.target.id !== "FormComentario") return;
        evento.preventDefault();
        var texto = campo(evento.target, "texto").value.trim();

        if (texto.length < 2) return;
        post.comentarios = post.comentarios || [];
        post.comentarios.push({
          id: Date.now(),
          autorId: "usuario",
          autor: usuarioAtual().nome,
          texto: texto,
          data: agora(),
        });
        salvarPost(post);
        registrarAtividade("comentario", "feed", post.id, post.titulo, texto);
        janela.alterado = false;
        area.innerHTML = conteudo();
        toast("Comentário publicado.");
      };
    });
  }

  function alternar(post, campo) {
    var acao = campo === "curtido" ? "curtir:" : "apoiar:";

    if (!exigirLogin(acao + post.id)) return;
    post[campo] = !post[campo];
    var numero = campo === "curtido" ? "curtidas" : "apoios";

    post[numero] = Math.max(0, Number(post[numero] || 0) + (post[campo] ? 1 : -1));
    salvarPost(post);

    if (campo === "apoiado")
      registrarAtividade(
        "apoio",
        "feed",
        post.id,
        post.titulo,
        post[campo] ? "Você apoiou esta publicação." : "Apoio removido."
      );
    toast(
      post[campo]
        ? campo === "curtido"
          ? "Publicação curtida."
          : "Apoio registrado."
        : campo === "curtido"
          ? "Curtida removida."
          : "Apoio removido."
    );
  }
  var botoesFiltro = pegarTodos(".filter-tab");

  for (var i = 0; i < botoesFiltro.length; i++)
    botoesFiltro[i].onclick = function () {
      filtro = this.getAttribute("data-filter");
      mostrar();
    };
  lista.onclick = function (evento) {
    var artigo = evento.target.closest(".post");
    var botao = evento.target.closest("[data-action]");

    if (!artigo || !botao) return;
    var post = procurarPorId(obterPosts(), artigo.getAttribute("data-id"));
    var acao = botao.getAttribute("data-action");

    if (acao === "detalhes") abrirDetalhes(post);

    if (acao === "gerenciar") gerenciar(post);

    if (acao === "comentar") abrirComentarios(post);

    if (acao === "curtir") alternar(post, "curtido");

    if (acao === "apoiar") alternar(post, "apoiado");

    if (acao === "compartilhar") compartilhar(post.titulo, post.texto);
  };
  lista.onkeydown = function (evento) {
    if ((evento.key === "Enter" || evento.key === " ") && evento.target.matches(".post-title")) {
      evento.preventDefault();
      abrirDetalhes(
        procurarPorId(obterPosts(), evento.target.closest(".post").getAttribute("data-id"))
      );
    }
  };
  pegar('[data-action="nova-publicacao"]').onclick = function () {
    abrirFormulario(null);
  };
  pegar(".BotaoFlutuanteMobile").onclick = function () {
    abrirFormulario(null);
  };
  mostrar();

  if (postInicial)
    setTimeout(function () {
      var item = pegar('[data-id="' + postInicial + '"]');

      if (item) item.scrollIntoView({ behavior: "smooth" });
    }, 100);
  var pendente = consumirAcao();

  if (pendente === "nova-publicacao") abrirFormulario(null);
  var itemPendente = procurarPorId(obterPosts(), pendente.split(":")[1]);

  if (itemPendente && pendente.indexOf("comentarios:") === 0) abrirComentarios(itemPendente);

  if (itemPendente && pendente.indexOf("curtir:") === 0) alternar(itemPendente, "curtido");

  if (itemPendente && pendente.indexOf("apoiar:") === 0) alternar(itemPendente, "apoiado");
}
iniciarFeed();
