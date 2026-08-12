function iniciarConta() {
  var acao = lerTexto("sosPetAcaoPendente");

  if (acao) {
    var aviso = document.createElement("p");

    aviso.className = "AvisoLoginPendente";
    aviso.textContent = "Entre para continuar a ação que você iniciou.";
    var topo = pegar(".Topo");

    if (topo) topo.insertAdjacentElement("afterend", aviso);
  }
  var senhas = pegarTodos('input[type="password"]');

  for (var i = 0; i < senhas.length; i++) criarBotaoSenha(senhas[i]);
  var login = pegar("#FormularioLogin");

  if (login) {
    login.onsubmit = function (evento) {
      evento.preventDefault();
      var conta = obterConta();
      var email = pegar("#Email", login).value.trim();
      var senha = pegar("#Password", login).value;

      if (!conta || conta.email !== email || conta.senha !== senha) {
        mensagem(login, "E-mail ou senha incorretos.");

        return;
      }
      mensagem(login, "Login realizado. Entrando...", true);
      entrar(conta);
    };
    var recuperar = pegar('[data-action="recuperar-senha"]');

    if (recuperar) recuperar.onclick = recuperarSenha;
  }
  var cadastro = pegar("#FormularioCadastro");

  if (cadastro) {
    cadastro.onsubmit = function (evento) {
      evento.preventDefault();
      var nome = pegar("#Name", cadastro).value.trim();
      var email = pegar("#Email", cadastro).value.trim();
      var cidade = pegar("#Cidade", cadastro).value.trim();
      var senha = pegar("#Password", cadastro).value;
      var confirmar = pegar("#ConfirmarSenha", cadastro).value;
      var erro = "";

      if (nome.length < 3) erro = "Digite seu nome completo.";
      else if (!/^\S+@\S+\.\S+$/.test(email)) erro = "Digite um e-mail válido.";
      else if (cidade.length < 2) erro = "Digite uma cidade válida.";
      else if (senha.length < 8) erro = "A senha precisa ter pelo menos 8 caracteres.";
      else if (senha !== confirmar) erro = "As senhas não são iguais.";

      if (erro) {
        mensagem(cadastro, erro);

        return;
      }
      entrar({
        nome: nome,
        email: email,
        cidade: cidade,
        telefone: "",
        senha: senha,
        foto: "assets/images/perfil/avatar-mulher.png",
      });
    };
  }
  var redes = pegarTodos("[data-provider]");

  for (var r = 0; r < redes.length; r++) {
    redes[r].onclick = function (evento) {
      evento.preventDefault();
      var nome = this.getAttribute("data-provider");

      entrar({
        nome: "Usuário SOS Pet",
        email: "usuario." + nome + "@email.com",
        cidade: "São Paulo (SP)",
        telefone: "",
        senha: "acesso-social",
        foto: "assets/images/perfil/avatar-mulher.png",
      });
    };
  }
}

function mensagem(formulario, texto, sucesso) {
  var area = pegar(".MensagemFormulario", formulario);

  if (!area) return;
  area.textContent = texto;
  area.classList.toggle("Sucesso", Boolean(sucesso));
}

function entrar(conta) {
  salvarConta(conta);
  salvarTexto("sosPetLogado", "true");
  setTimeout(function () {
    window.navegarComLoading(destinoDepoisLogin());
  }, 200);
}

function criarBotaoSenha(campo) {
  var botao = document.createElement("button");

  botao.type = "button";
  botao.className = "MostrarSenha";
  botao.setAttribute("aria-label", "Mostrar senha");
  campo.parentElement.appendChild(botao);
  botao.onclick = function () {
    var senhaVisivel = campo.type === "password";

    campo.type = senhaVisivel ? "text" : "password";
    botao.classList.toggle("Aberto", senhaVisivel);
    botao.setAttribute("aria-label", senhaVisivel ? "Ocultar senha" : "Mostrar senha");
  };
}

function recuperarSenha(evento) {
  evento.preventDefault();
  dialogo(
    "Recuperar senha",
    '<form class="FormularioModal" id="FormRecuperar"><label>E-mail<input name="email" type="email" required></label><p class="ErroFormulario"></p><button class="BotaoModal" type="submit">Verificar e-mail</button></form>',
    function (janela, fechar) {
      pegar("#FormRecuperar", janela).onsubmit = function (evento) {
        evento.preventDefault();
        var conta = obterConta();
        var email = String(new FormData(evento.currentTarget).get("email")).trim();

        if (!conta || conta.email !== email) {
          pegar(".ErroFormulario", janela).textContent =
            "Nenhuma conta encontrada com esse e-mail.";

          return;
        }
        fechar();
        dialogo(
          "Senha cadastrada",
          "<p><strong>Senha:</strong> " +
            escapar(conta.senha) +
            "</p>"
        );
      };
    }
  );
}
iniciarConta();
