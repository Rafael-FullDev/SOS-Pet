var raiz = document.body.getAttribute("data-root") || "";

function pegar(seletor, area) {
  return (area || document).querySelector(seletor);
}

function pegarTodos(seletor, area) {
  return (area || document).querySelectorAll(seletor);
}

function campo(formulario, nome) {
  return formulario.elements.namedItem(nome);
}

function ler(chave, padrao) {
  var valor = localStorage.getItem(chave);

  return valor ? JSON.parse(valor) : padrao;
}

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));

    return true;
  } catch (erro) {
    return false;
  }
}

function lerTexto(chave) {
  return localStorage.getItem(chave) || "";
}

function salvarTexto(chave, valor) {
  localStorage.setItem(chave, valor);
}

function apagar(chave) {
  localStorage.removeItem(chave);
}

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapar(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function urlImagem(caminho) {
  if (!caminho || /^(https?:|data:|blob:)/.test(caminho)) return caminho || "";

  return raiz + caminho.replace(/^\.\//, "");
}

function agora() {
  return new Date().toISOString();
}

function tempo(data) {
  var minutos = Math.floor((Date.now() - new Date(data).getTime()) / 60000);

  if (!isFinite(minutos) || minutos < 1) return "Agora";

  if (minutos < 60) return "Há " + minutos + " min";

  if (minutos < 1440) return "Há " + Math.floor(minutos / 60) + "h";

  if (minutos < 43200)
    return "Há " + Math.floor(minutos / 1440) + (minutos < 2880 ? " dia" : " dias");

  return new Date(data).toLocaleDateString("pt-BR");
}

function iniciarDados() {
  var posts = ler("sosPetPosts", null);

  if (!Array.isArray(posts) || !posts.length) salvar("sosPetPosts", PostsIniciais);
  var pedidos = ler("sosPetPedidos", null);

  if (!Array.isArray(pedidos) || !pedidos.length) salvar("sosPetPedidos", PedidosIniciais);

  if (!Array.isArray(ler("sosPetAtividades", null))) salvar("sosPetAtividades", []);

  if (!Array.isArray(ler("sosPetCurtidasHistorias", null))) salvar("sosPetCurtidasHistorias", []);
}

function obterPosts() {
  return ler("sosPetPosts", PostsIniciais);
}

function obterPedidos() {
  return ler("sosPetPedidos", PedidosIniciais);
}

function obterConta() {
  return ler("sosPetConta", null);
}

function salvarConta(conta) {
  salvar("sosPetConta", conta);
}

function estaLogado() {
  return lerTexto("sosPetLogado") === "true" && obterConta() !== null;
}

function usuarioAtual() {
  return (
    obterConta() || {
      nome: "Visitante",
      email: "",
      telefone: "",
      cidade: "",
      foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmbTQXD_Zmi0hUmpuvXvhjxw8RS-VBzRuXRak6WVYWbEqp2LvDDMRhsgEe&s=10",
    }
  );
}

function ehDono(item) {
  return item && item.autorId === "usuario";
}

function procurarPorId(lista, id) {
  for (var i = 0; i < lista.length; i++) if (lista[i].id === Number(id)) return lista[i];

  return null;
}

function salvarItem(chave, item) {
  var lista = ler(chave, []);
  var novo = true;

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].id === item.id) {
      lista[i] = item;
      novo = false;
    }
  }

  if (novo) lista.unshift(item);

  return salvar(chave, lista);
}

function excluirItem(chave, id) {
  var lista = ler(chave, []);

  for (var i = lista.length - 1; i >= 0; i--) if (lista[i].id === id) lista.splice(i, 1);

  return salvar(chave, lista);
}

function registrarAtividade(tipo, origem, id, titulo, detalhe) {
  var lista = ler("sosPetAtividades", []);

  lista.unshift({
    id: Date.now(),
    tipo: tipo,
    origem: origem,
    origemId: id,
    titulo: titulo,
    detalhe: detalhe,
    data: agora(),
  });
  salvar("sosPetAtividades", lista.slice(0, 100));
}

function exigirLogin(acao) {
  if (estaLogado()) return true;
  salvarTexto("sosPetDestinoLogin", location.href);

  if (acao) salvarTexto("sosPetAcaoPendente", acao);
  location.href = raiz + "pages/login.html";

  return false;
}

function destinoDepoisLogin() {
  var destino = lerTexto("sosPetDestinoLogin");

  apagar("sosPetDestinoLogin");

  return destino || "perfil.html";
}

function consumirAcao() {
  var acao = lerTexto("sosPetAcaoPendente");

  apagar("sosPetAcaoPendente");

  return acao;
}

function statusTexto(status) {
  var nomes = {
    desaparecido: "Desaparecido",
    avistado: "Avistado",
    encontrado: "Encontrado",
    disponivel: "Disponível",
    "em-processo": "Em processo",
    adotado: "Adotado",
    aberto: "Aberto",
    "recebendo-ajuda": "Recebendo ajuda",
    concluido: "Concluído",
    "em-atendimento": "Em atendimento",
    recuperado: "Recuperado",
  };

  return nomes[status] || status || "Aberto";
}

function statusDaCategoria(categoria) {
  if (categoria === "perdidos") return ["desaparecido", "avistado", "encontrado"];

  if (categoria === "adocao") return ["disponivel", "em-processo", "adotado"];

  return ["aberto", "recebendo-ajuda", "concluido"];
}

function textoCategoria(categoria, pedido) {
  if (categoria === "perdidos") return pedido ? "Pet perdido ou resgate" : "Pet perdido";

  if (categoria === "adocao") return pedido ? "Adoção ou lar temporário" : "Adoção";

  return "Pedido de ajuda";
}

function opcoesStatus(lista, selecionado) {
  var html = "";

  for (var i = 0; i < lista.length; i++)
    html +=
      '<option value="' +
      lista[i] +
      '"' +
      (lista[i] === selecionado ? " selected" : "") +
      ">" +
      statusTexto(lista[i]) +
      "</option>";

  return html;
}

function toast(mensagem, erro) {
  var caixa = pegar(".ToastSOS");

  if (!caixa) {
    caixa = document.createElement("div");
    caixa.className = "ToastSOS";
    caixa.setAttribute("role", "status");
    document.body.appendChild(caixa);
  }
  caixa.textContent = mensagem;
  caixa.className = erro ? "ToastSOS Erro Mostrar" : "ToastSOS Mostrar";
  clearTimeout(caixa.tempo);
  caixa.tempo = setTimeout(function () {
    caixa.classList.remove("Mostrar");
  }, 3500);
}

function dialogo(titulo, html, iniciar) {
  var anterior = document.activeElement;
  var janela = document.createElement("dialog");

  janela.className = "DialogoSOS";
  janela.innerHTML =
    '<div class="DialogoCabecalho"><h2>' +
    escapar(titulo) +
    '</h2><button class="FecharDialogo" type="button" aria-label="Fechar">×</button></div><div class="DialogoConteudo">' +
    html +
    "</div>";
  document.body.appendChild(janela);

  function fechar(salvo) {
    if (
      !salvo &&
      janela.alterado &&
      !confirm("Os dados preenchidos ainda não foram salvos. Deseja fechar mesmo assim?")
    )
      return;
    janela.remove();

    if (anterior && anterior.focus) anterior.focus();
  }
  pegar(".FecharDialogo", janela).onclick = function () {
    fechar(false);
  };
  janela.addEventListener("click", function (evento) {
    if (evento.target === janela) fechar(false);
  });
  janela.oncancel = function (evento) {
    evento.preventDefault();
    fechar(false);
  };
  janela.oninput = function () {
    janela.alterado = true;
  };

  if (janela.showModal) janela.showModal();
  else janela.setAttribute("open", "");

  if (iniciar)
    iniciar(janela, function () {
      janela.alterado = false;
      fechar(true);
    });

  return janela;
}

function campoImagem(imagem) {
  var previa = imagem
    ? '<img class="PreviaImagem" src="' + escapar(urlImagem(imagem)) + '" alt="Prévia da imagem">'
    : '<div class="PreviaImagem Vazia">Nenhuma imagem selecionada</div>';

  return (
    '<label class="CampoArquivo">Foto<input accept="image/png,image/jpeg,image/webp" name="arquivo" type="file"><small>JPG, PNG ou WebP de até 1,5 MB.</small></label><div class="AreaPreviaImagem">' +
    previa +
    '<button class="RemoverImagem" type="button">Remover imagem</button></div>'
  );
}

function prepararImagem(janela, imagem, mudou) {
  var arquivo = pegar('input[name="arquivo"]', janela);
  var area = pegar(".AreaPreviaImagem", janela);
  var valor = imagem || "";

  arquivo.onchange = function () {
    var foto = arquivo.files[0];

    if (!foto) return;

    if (foto.type.indexOf("image/") !== 0 || foto.size > 1572864) {
      arquivo.value = "";
      toast("Escolha uma imagem de até 1,5 MB.", true);

      return;
    }
    var leitor = new FileReader();

    leitor.onload = function () {
      valor = leitor.result;
      area.innerHTML =
        '<img class="PreviaImagem" src="' +
        valor +
        '" alt="Prévia da imagem"><button class="RemoverImagem" type="button">Remover imagem</button>';

      if (mudou) mudou(valor);
    };
    leitor.readAsDataURL(foto);
  };
  area.onclick = function (evento) {
    if (!evento.target.closest(".RemoverImagem")) return;
    valor = "";
    arquivo.value = "";
    area.innerHTML =
      '<div class="PreviaImagem Vazia">Nenhuma imagem selecionada</div><button class="RemoverImagem" type="button">Remover imagem</button>';

    if (mudou) mudou("");
  };

  return function () {
    return valor;
  };
}

function compartilhar(titulo, texto) {
  var conteudo = titulo + "\n" + texto + "\n" + location.href;

  function manual() {
    dialogo(
      "Compartilhar",
      '<label>Copie o texto<textarea class="TextoCompartilhar" readonly>' +
        escapar(conteudo) +
        "</textarea></label>"
    );
  }

  if (navigator.share) {
    navigator.share({ title: titulo, text: texto, url: location.href }).catch(manual);

    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(conteudo)
      .then(function () {
        toast("Informações copiadas.");
      })
      .catch(manual);

    return;
  }
  manual();
}

function abrirAjuda(titulo, salvarAjuda, acao) {
  if (!exigirLogin(acao)) return;
  var usuario = usuarioAtual();
  var html =
    '<p class="AvisoAcao">Seus dados serão enviados para a pessoa responsável pelo caso.</p><form class="FormularioModal" id="FormAjuda"><label>Como você pode ajudar?<select name="tipo" required><option value="">Selecione</option><option>Doação</option><option>Transporte</option><option>Lar temporário</option><option>Resgate</option><option>Divulgação</option></select></label><label>Contato<input name="contato" value="' +
    escapar(usuario.telefone || "") +
    '" required></label><label>Mensagem<textarea name="mensagem" required></textarea></label><p class="ErroFormulario"></p><button class="BotaoModal" type="submit">Enviar oferta</button></form>';

  dialogo("Ajudar — " + titulo, html, function (janela, fechar) {
    pegar("#FormAjuda", janela).onsubmit = function (evento) {
      evento.preventDefault();
      var dados = new FormData(evento.currentTarget);
      var ajuda = {
        id: Date.now(),
        autorId: "usuario",
        autor: usuario.nome,
        tipo: dados.get("tipo"),
        contato: String(dados.get("contato")).trim(),
        mensagem: String(dados.get("mensagem")).trim(),
        data: agora(),
      };

      if (!ajuda.tipo || ajuda.contato.length < 5 || ajuda.mensagem.length < 5) {
        pegar(".ErroFormulario", janela).textContent = "Preencha todos os campos.";

        return;
      }
      salvarAjuda(ajuda);
      fechar();
      toast("Ajuda registrada. Acompanhe no Perfil.");
    };
  });
}

function configurarNavbar() {
  var logado = estaLogado();
  var visitantes = pegarTodos('[data-auth="visitante"]');
  var usuarios = pegarTodos('[data-auth="usuario"]');

  for (var i = 0; i < visitantes.length; i++) visitantes[i].hidden = logado;

  for (var j = 0; j < usuarios.length; j++) usuarios[j].hidden = !logado;
  var acoes = pegar(".AcoesCabecalho");
  var sairAntigo = pegar(".BotaoSairNavbar");

  if (sairAntigo) sairAntigo.remove();

  if (logado) {
    var usuario = usuarioAtual();
    var foto = pegar(".Usuario");

    if (foto) foto.style.backgroundImage = 'url("' + urlImagem(usuario.foto) + '")';

    if (acoes) {
      var sair = document.createElement("button");

      sair.type = "button";
      sair.className = "BotaoSairNavbar";
      sair.textContent = "Sair";
      sair.onclick = function () {
        if (confirm("Deseja sair da sua conta?")) {
          apagar("sosPetLogado");
          location.href = raiz + "index.html";
        }
      };
      acoes.appendChild(sair);
    }
  }
  document.body.classList.add("AutenticacaoPronta");
}

function configurarMenu() {
  var botao = pegar(".BotaoMenuMobile");
  var menu = pegar(".MenuPrincipal");

  if (!botao || !menu) return;
  var fundo = document.createElement("button");

  fundo.type = "button";
  fundo.className = "FundoMenuMobile";
  fundo.setAttribute("aria-label", "Fechar menu");
  document.body.appendChild(fundo);

  function fechar() {
    menu.classList.remove("MenuAberto");
    fundo.classList.remove("Mostrar");
    document.body.classList.remove("MenuMobileAberto");
    botao.setAttribute("aria-expanded", "false");
  }
  botao.onclick = function () {
    if (menu.classList.contains("MenuAberto")) fechar();
    else {
      menu.classList.add("MenuAberto");
      fundo.classList.add("Mostrar");
      document.body.classList.add("MenuMobileAberto");
      botao.setAttribute("aria-expanded", "true");
    }
  };
  fundo.onclick = fechar;
  menu.onclick = function (evento) {
    if (evento.target.closest("a")) fechar();
  };
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") fechar();
  });
  addEventListener("resize", function () {
    if (innerWidth > 1180) fechar();
  });
}

function configurarBusca() {
  var busca = pegar(".BuscaGlobal");

  if (!busca) return;
  var icone = pegar("span", busca.parentElement);

  function pesquisar() {
    var termo = normalizar(busca.value);

    if (termo.length < 2) {
      toast("Digite pelo menos 2 caracteres.", true);

      return;
    }
    var itens = [
      ["Início", "Página inicial", raiz + "index.html"],
      ["Animais Perdidos", "Pets desaparecidos", raiz + "pages/pets-perdidos.html"],
      ["Animais de Rua", "Animais que precisam de ajuda", raiz + "pages/animais-de-rua.html"],
      ["Denúncia", "Denunciar maus-tratos ou abandono", raiz + "pages/denuncia.html"],
      ["Adoção", "Adoção e lar temporário", raiz + "index.html#Adocao"],
      ["Pedidos de Ajuda", "Pedidos da comunidade", raiz + "pages/pedidos-de-ajuda.html"],
      ["Feed", "Publicações da comunidade", raiz + "pages/feed.html"],
    ];
    var posts = obterPosts();
    var pedidos = obterPedidos();

    for (var i = 0; i < posts.length; i++)
      itens.push([
        posts[i].titulo,
        posts[i].texto + " " + posts[i].local,
        raiz + "pages/feed.html?post=" + posts[i].id,
      ]);

    for (var j = 0; j < pedidos.length; j++)
      itens.push([
        pedidos[j].titulo,
        pedidos[j].descricao + " " + pedidos[j].local,
        raiz + "pages/pedidos-de-ajuda.html?pedido=" + pedidos[j].id,
      ]);
    var html = '<div class="ListaResultadosBusca">';
    var total = 0;

    for (var k = 0; k < itens.length && total < 12; k++) {
      if (normalizar(itens[k][0] + " " + itens[k][1]).indexOf(termo) !== -1) {
        html +=
          '<a class="ResultadoBusca" href="' +
          itens[k][2] +
          '"><strong>' +
          escapar(itens[k][0]) +
          "</strong><span>" +
          escapar(itens[k][1]) +
          "</span></a>";
        total++;
      }
    }

    if (!total) html = "<p>Nenhum resultado encontrado.</p>";
    else html += "</div>";
    dialogo("Resultados da busca", html);
  }
  busca.onkeydown = function (evento) {
    if (evento.key === "Enter") {
      evento.preventDefault();
      pesquisar();
    }
  };

  if (icone) {
    icone.setAttribute("role", "button");
    icone.setAttribute("tabindex", "0");
    icone.onclick = pesquisar;
    icone.onkeydown = function (evento) {
      if (evento.key === "Enter" || evento.key === " ") pesquisar();
    };
  }
}
iniciarDados();
configurarMenu();
configurarBusca();
configurarNavbar();
