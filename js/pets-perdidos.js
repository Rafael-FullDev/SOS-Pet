function iniciarPetsPerdidos() {
  var iniciais = [
    {
      id: 301,
      nome: "Milo",
      especie: "gato",
      raca: "Sem raça definida",
      porte: "pequeno",
      cidade: "São Paulo",
      local: "Vila Mariana",
      periodo: "48h",
      status: "avistado",
      imagem: "assets/images/pets-perdidos/milo.jpg",
      urgente: true,
      recente: true,
      verificado: true,
      noturno: true,
      descricao: "Gato alaranjado, dócil e com uma pequena mancha branca no peito.",
      contato: "Entre em contato pelo chat do SOS Pet.",
    },
    {
      id: 302,
      nome: "Rex",
      especie: "cao",
      raca: "Chow-chow",
      porte: "medio",
      cidade: "Rio de Janeiro",
      local: "Copacabana",
      periodo: "7d",
      status: "desaparecido",
      imagem: "assets/images/pets-perdidos/rex.jpg",
      urgente: false,
      recente: true,
      verificado: true,
      noturno: false,
      descricao: "Cachorro marrom de pelagem cheia. Usa coleira azul e atende pelo nome Rex.",
      contato: "Entre em contato pelo chat do SOS Pet.",
    },
    {
      id: 303,
      nome: "Snow",
      especie: "gato",
      raca: "Angorá",
      porte: "pequeno",
      cidade: "Recife",
      local: "Boa Viagem",
      periodo: "7d",
      status: "desaparecido",
      imagem: "assets/images/pets-perdidos/snow.jpg",
      urgente: false,
      recente: false,
      verificado: false,
      noturno: false,
      descricao: "Gato branco de olhos claros, assustado com barulhos e sem coleira.",
      contato: "Entre em contato pelo chat do SOS Pet.",
    },
    {
      id: 304,
      nome: "Zara",
      especie: "cao",
      raca: "Shih-tzu",
      porte: "pequeno",
      cidade: "São Paulo",
      local: "Santo Amaro",
      periodo: "48h",
      status: "avistado",
      imagem: "assets/images/pets-perdidos/zara.jpg",
      urgente: true,
      recente: true,
      verificado: false,
      noturno: true,
      descricao: "Cachorrinha pequena de pelagem escura. Foi vista perto de uma praça.",
      contato: "Entre em contato pelo chat do SOS Pet.",
    },
    {
      id: 305,
      nome: "Ash",
      especie: "gato",
      raca: "Siamês",
      porte: "medio",
      cidade: "Salvador",
      local: "Barra",
      periodo: "30d",
      status: "desaparecido",
      imagem: "assets/images/pets-perdidos/ash.jpg",
      urgente: false,
      recente: false,
      verificado: true,
      noturno: false,
      descricao: "Gato de porte médio, muito curioso e acostumado a pessoas.",
      contato: "Entre em contato pelo chat do SOS Pet.",
    },
    {
      id: 306,
      nome: "Poppy",
      especie: "cao",
      raca: "Sem raça definida",
      porte: "medio",
      cidade: "Belo Horizonte",
      local: "Santa Tereza",
      periodo: "7d",
      status: "encontrado",
      imagem: "assets/images/pets-perdidos/poppy.jpg",
      urgente: false,
      recente: false,
      verificado: true,
      noturno: false,
      descricao:
        "Cachorrinha preta e branca. O caso foi encerrado após o reencontro com a família.",
      contato: "Caso encerrado.",
    },
    {
      id: 307,
      nome: "Loi",
      especie: "outro",
      raca: "Coelho",
      porte: "pequeno",
      cidade: "São Paulo",
      local: "Vila Mariana",
      periodo: "48h",
      status: "avistado",
      imagem: "assets/images/pets-perdidos/loi.jpg",
      urgente: false,
      recente: true,
      verificado: true,
      noturno: false,
      destaque: true,
      descricao: "Coelho pequeno de pelagem clara visto próximo a uma área gramada.",
      contato: "Entre em contato pelo chat do SOS Pet.",
    },
    {
      id: 308,
      nome: "Chico",
      especie: "gato",
      raca: "Sem raça definida",
      porte: "pequeno",
      cidade: "Rio de Janeiro",
      local: "Centro",
      periodo: "48h",
      status: "encontrado",
      imagem: "assets/images/pets-perdidos/chico.jpg",
      urgente: false,
      recente: true,
      verificado: true,
      noturno: false,
      destaque: true,
      descricao: "Filhote alaranjado localizado e mantido em segurança até encontrar a família.",
      contato: "Entre em contato pelo chat do SOS Pet.",
    },
  ];
  var lista = ler("sosPetPetsPerdidos", []);

  var personalizados = [];

  for (var p = 0; p < lista.length; p++) {
    var id = Number(lista[p].id);

    if (id < 301 || id > 308) personalizados.push(lista[p]);
  }

  lista = iniciais.concat(personalizados);
  salvar("sosPetPetsPerdidos", lista);

  var formulario = pegar(".FormularioFiltrosPerdidos");
  var busca = pegar(".BuscaPerdidos");
  var grade = pegar(".GradePetsPerdidos");
  var destaques = pegar(".CartoesDestaquePerdidos");
  var resumo = pegar(".ResumoPetsPerdidos");
  var vazio = pegar(".SemPetsPerdidos");
  var filtrosAtivos = pegar(".FiltrosAtivosPerdidos");
  var rapidos = [];
  var resultado = [];

  function classeStatus(status) {
    if (status === "avistado") return "Avistado";

    if (status === "encontrado") return "Encontrado";

    return "";
  }

  function card(pet, destaque) {
    return (
      '<button class="CartaoPetPerdido" data-id="' +
      pet.id +
      '" type="button"><span class="SeloPetPerdido ' +
      classeStatus(pet.status) +
      '">' +
      escapar(statusTexto(pet.status)) +
      '</span><img loading="lazy" src="' +
      escapar(urlImagem(pet.imagem)) +
      '" alt="' +
      escapar(pet.nome) +
      '"><span class="ConteudoCartaoPerdido"><strong>' +
      escapar(pet.nome) +
      "</strong><small>Cidade: " +
      escapar(pet.cidade) +
      " • Último local: " +
      escapar(pet.local) +
      (destaque ? "" : "<br>Ver detalhes") +
      "</small></span></button>"
    );
  }

  function mostrarFiltros() {
    var nomes = [];
    var campos = ["status", "especie", "raca", "porte", "cidade", "periodo"];

    for (var i = 0; i < campos.length; i++) {
      var controle = campo(formulario, campos[i]);

      if (controle.value)
        nomes.push(
          controle.options ? controle.options[controle.selectedIndex].text : controle.value
        );
    }

    for (var j = 0; j < rapidos.length; j++) nomes.push(rapidos[j]);

    filtrosAtivos.innerHTML = "";

    for (var x = 0; x < nomes.length; x++)
      filtrosAtivos.innerHTML += "<span>" + escapar(nomes[x]) + "</span>";
  }

  function combinar(pet) {
    if (pet.destaque) return false;

    var termo = normalizar(busca.value);
    var status = campo(formulario, "status").value;
    var especie = campo(formulario, "especie").value;
    var raca = normalizar(campo(formulario, "raca").value);
    var porte = campo(formulario, "porte").value;
    var cidade = normalizar(campo(formulario, "cidade").value);
    var periodo = campo(formulario, "periodo").value;
    var texto = normalizar(pet.nome + " " + pet.raca + " " + pet.cidade + " " + pet.local);

    if (termo && texto.indexOf(termo) === -1) return false;

    if (status && pet.status !== status) return false;

    if (especie && pet.especie !== especie) return false;

    if (raca && normalizar(pet.raca).indexOf(raca) === -1) return false;

    if (porte && pet.porte !== porte) return false;

    if (cidade && normalizar(pet.cidade).indexOf(cidade) === -1) return false;

    if (periodo && pet.periodo !== periodo) return false;

    if (rapidos.indexOf("perto") !== -1 && normalizar(pet.cidade) !== "sao paulo") return false;

    if (rapidos.indexOf("recentes") !== -1 && !pet.recente) return false;

    if (rapidos.indexOf("foto") !== -1 && !pet.imagem) return false;

    if (rapidos.indexOf("urgente") !== -1 && !pet.urgente) return false;

    if (rapidos.indexOf("caes") !== -1 && pet.especie !== "cao") return false;

    if (rapidos.indexOf("gatos") !== -1 && pet.especie !== "gato") return false;

    if (rapidos.indexOf("verificado") !== -1 && !pet.verificado) return false;

    if (rapidos.indexOf("noturno") !== -1 && !pet.noturno) return false;

    return true;
  }

  function mostrar() {
    lista = ler("sosPetPetsPerdidos", iniciais);
    resultado = [];

    for (var i = 0; i < lista.length; i++) if (combinar(lista[i])) resultado.push(lista[i]);

    var html = "";

    for (var j = 0; j < resultado.length; j++) html += card(resultado[j], false);

    grade.innerHTML = html;
    resumo.textContent =
      resultado.length +
      (resultado.length === 1 ? " pet compatível encontrado" : " pets compatíveis encontrados");
    vazio.hidden = resultado.length > 0;
    destaques.innerHTML = "";

    for (var x = 0; x < lista.length; x++) {
      if (lista[x].destaque) destaques.innerHTML += card(lista[x], true);
    }

    mostrarFiltros();
  }

  function localizar(id) {
    for (var i = 0; i < lista.length; i++) if (Number(lista[i].id) === Number(id)) return lista[i];

    return null;
  }

  function abrirPista(pet) {
    if (!exigirLogin("pista-pet:" + pet.id)) return;

    var html =
      '<form class="FormularioModal" id="FormPista"><p class="AjudaFormulario">Informe onde e quando você viu o pet. A família receberá os dados de contato cadastrados no seu perfil.</p><label>Local do avistamento<input name="local" required></label><label>Quando<select name="quando"><option value="agora">Agora há pouco</option><option value="hoje">Hoje</option><option value="ontem">Ontem</option><option value="outro">Outro momento</option></select></label><label>Detalhes<textarea name="detalhes" required></textarea></label><p class="ErroFormulario"></p><button class="BotaoModal" type="submit">Enviar pista</button></form>';

    dialogo("Tenho uma pista sobre " + pet.nome, html, function (janela, fechar) {
      pegar("#FormPista", janela).onsubmit = function (evento) {
        evento.preventDefault();
        var form = evento.currentTarget;
        var pistas = ler("sosPetPistas", []);

        pistas.unshift({
          id: Date.now(),
          petId: pet.id,
          pet: pet.nome,
          local: campo(form, "local").value.trim(),
          quando: campo(form, "quando").value,
          detalhes: campo(form, "detalhes").value.trim(),
          usuario: usuarioAtual().nome,
          data: agora(),
        });
        salvar("sosPetPistas", pistas);
        fechar();
        toast("Pista enviada para a família.");
      };
    });
  }

  function abrirDetalhes(pet) {
    var html =
      '<div class="DetalhePetModal"><img src="' +
      escapar(urlImagem(pet.imagem)) +
      '" alt="' +
      escapar(pet.nome) +
      '"><div class="DadosPetModal"><p><strong>Status:</strong> ' +
      statusTexto(pet.status) +
      "</p><p><strong>Espécie:</strong> " +
      (pet.especie === "cao" ? "Cão" : pet.especie === "gato" ? "Gato" : "Outro") +
      "</p><p><strong>Raça:</strong> " +
      escapar(pet.raca) +
      "</p><p><strong>Porte:</strong> " +
      escapar(pet.porte) +
      "</p><p><strong>Cidade:</strong> " +
      escapar(pet.cidade) +
      "</p><p><strong>Último local:</strong> " +
      escapar(pet.local) +
      "</p></div><p>" +
      escapar(pet.descricao) +
      "</p><p><strong>Contato:</strong> " +
      escapar(pet.contato) +
      '</p><div class="AcoesPetModal"><button class="BotaoSecundario CompartilharPet" type="button">Compartilhar</button>' +
      (pet.status === "encontrado"
        ? ""
        : '<button class="BotaoModal EnviarPista" type="button">Tenho uma pista</button>') +
      "</div></div>";

    dialogo(pet.nome, html, function (janela, fechar) {
      pegar(".CompartilharPet", janela).onclick = function () {
        compartilhar("Pet perdido: " + pet.nome, pet.descricao + " Último local: " + pet.local);
      };

      var pista = pegar(".EnviarPista", janela);

      if (pista)
        pista.onclick = function () {
          fechar();
          abrirPista(pet);
        };
    });
  }

  function reportarPet() {
    if (!exigirLogin("reportar-pet")) return;

    var html =
      '<form class="FormularioModal" id="FormPetPerdido"><p class="AjudaFormulario">Preencha os dados principais. O novo aviso será exibido nesta página.</p><label>Nome do pet<input maxlength="60" name="nome" required></label><label>Espécie<select name="especie"><option value="cao">Cão</option><option value="gato">Gato</option><option value="outro">Outro</option></select></label><label>Raça<input maxlength="60" name="raca" required></label><label>Porte<select name="porte"><option value="pequeno">Pequeno</option><option value="medio">Médio</option><option value="grande">Grande</option></select></label><label>Cidade<input maxlength="70" name="cidade" required></label><label>Último local<input maxlength="100" name="local" required></label><label>Descrição<textarea maxlength="450" name="descricao" required></textarea></label>' +
      campoImagem("") +
      '<label class="LinhaCheckbox"><input name="urgente" type="checkbox"> Marcar como urgente</label><p class="ErroFormulario"></p><button class="BotaoModal" type="submit">Publicar aviso</button></form>';

    dialogo("Reportar pet perdido", html, function (janela, fechar) {
      var obterImagem = prepararImagem(janela, "");

      pegar("#FormPetPerdido", janela).onsubmit = function (evento) {
        evento.preventDefault();
        var form = evento.currentTarget;
        var imagem = obterImagem();

        if (!imagem) {
          pegar(".ErroFormulario", janela).textContent = "Adicione uma foto do pet.";

          return;
        }

        var novo = {
          id: Date.now(),
          nome: campo(form, "nome").value.trim(),
          especie: campo(form, "especie").value,
          raca: campo(form, "raca").value.trim(),
          porte: campo(form, "porte").value,
          cidade: campo(form, "cidade").value.trim(),
          local: campo(form, "local").value.trim(),
          periodo: "48h",
          status: "desaparecido",
          imagem: imagem,
          urgente: campo(form, "urgente").checked,
          recente: true,
          verificado: false,
          noturno: false,
          descricao: campo(form, "descricao").value.trim(),
          contato: "Entre em contato pelo chat do SOS Pet.",
        };

        lista.unshift(novo);

        if (!salvar("sosPetPetsPerdidos", lista)) {
          pegar(".ErroFormulario", janela).textContent =
            "A imagem é grande demais para o navegador.";

          return;
        }

        registrarAtividade(
          "publicacao",
          "perdidos",
          novo.id,
          novo.nome,
          "Aviso de pet perdido criado."
        );
        fechar();
        mostrar();
        toast("Aviso publicado.");
        pegar("#ListaPetsPerdidos").scrollIntoView({ behavior: "smooth" });
      };
    });
  }

  formulario.onsubmit = function (evento) {
    evento.preventDefault();
    mostrar();
    pegar("#ListaPetsPerdidos").scrollIntoView({ behavior: "smooth" });
  };

  formulario.onreset = function () {
    setTimeout(function () {
      busca.value = "";
      rapidos = [];
      var botoes = pegarTodos("[data-rapido]");

      for (var i = 0; i < botoes.length; i++) botoes[i].setAttribute("aria-pressed", "false");

      mostrar();
    });
  };

  pegar(".EncontrarPet").onclick = function () {
    mostrar();
    pegar("#CentralFiltros").scrollIntoView({ behavior: "smooth" });
  };

  pegar(".ReportarPet").onclick = reportarPet;

  pegar(".GradeFiltrosRapidos").onclick = function (evento) {
    var botao = evento.target.closest("[data-rapido]");

    if (!botao) return;

    var valor = botao.getAttribute("data-rapido");
    var posicao = rapidos.indexOf(valor);

    if (posicao === -1) rapidos.push(valor);
    else rapidos.splice(posicao, 1);

    botao.setAttribute("aria-pressed", posicao === -1 ? "true" : "false");
    mostrar();
  };

  document.addEventListener("click", function (evento) {
    var cardSelecionado = evento.target.closest(".CartaoPetPerdido");

    if (!cardSelecionado) return;

    var pet = localizar(cardSelecionado.getAttribute("data-id"));

    if (pet) abrirDetalhes(pet);
  });

  busca.onkeydown = function (evento) {
    if (evento.key === "Enter") {
      evento.preventDefault();
      mostrar();
      pegar("#ListaPetsPerdidos").scrollIntoView({ behavior: "smooth" });
    }
  };

  mostrar();

  var acao = consumirAcao();

  if (acao === "reportar-pet") reportarPet();

  if (acao.indexOf("pista-pet:") === 0) {
    var pet = localizar(acao.split(":")[1]);

    if (pet) abrirPista(pet);
  }
}

iniciarPetsPerdidos();
