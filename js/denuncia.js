function iniciarDenuncia() {
  var formulario = pegar("#FormularioDenuncia");

  if (!formulario) return;

  var anonima = pegar('input[name="anonima"]');
  var dados = pegar(".DadosDenunciante");
  var arquivos = campo(formulario, "arquivos");
  var previa = pegar(".PreviaDenuncia");

  function atualizarAnonima() {
    dados.hidden = anonima.checked;

    campo(formulario, "nome").required = !anonima.checked;
    campo(formulario, "telefone").required = !anonima.checked;
    campo(formulario, "email").required = !anonima.checked;
  }

  anonima.onchange = atualizarAnonima;

  arquivos.onchange = function () {
    previa.innerHTML = "";

    for (var i = 0; i < Math.min(3, arquivos.files.length); i++) {
      if (arquivos.files[i].type.indexOf("image/") !== 0) continue;

      var imagem = document.createElement("img");

      imagem.alt = "Prévia da evidência " + (i + 1);
      imagem.src = URL.createObjectURL(arquivos.files[i]);
      previa.appendChild(imagem);
    }
  };

  formulario.onsubmit = function (evento) {
    evento.preventDefault();

    var urgencia = pegar('input[name="urgencia"]:checked', formulario);

    if (!urgencia) {
      pegar(".ErroFormulario", formulario).textContent = "Escolha o nível de urgência.";

      return;
    }

    var denuncias = ler("sosPetDenuncias", []);
    var protocolo = "SOS-" + String(Date.now()).slice(-8);

    denuncias.unshift({
      id: Date.now(),
      protocolo: protocolo,
      anonima: anonima.checked,
      nome: anonima.checked ? "" : campo(formulario, "nome").value.trim(),
      telefone: anonima.checked ? "" : campo(formulario, "telefone").value.trim(),
      email: anonima.checked ? "" : campo(formulario, "email").value.trim(),
      animal: campo(formulario, "animal").value,
      maustratos: campo(formulario, "maustratos").value,
      urgencia: urgencia.value,
      descricao: campo(formulario, "descricao").value.trim(),
      endereco: campo(formulario, "endereco").value.trim(),
      cidade: campo(formulario, "cidade").value.trim(),
      estado: campo(formulario, "estado").value.trim().toUpperCase(),
      evidencias: arquivos.files.length,
      data: agora(),
    });
    salvar("sosPetDenuncias", denuncias);

    formulario.reset();
    anonima.checked = true;
    previa.innerHTML = "";
    atualizarAnonima();

    dialogo(
      "Denúncia enviada",
      '<div class="DetalhesPedido"><p>Sua denúncia foi registrada no protótipo.</p><p><strong>Protocolo:</strong> ' +
        protocolo +
        '</p><p>Guarde este número para identificar o registro.</p><a class="BotaoModal" href="animais-de-rua.html">Voltar para Animais de Rua</a></div>'
    );
  };

  atualizarAnonima();
}

iniciarDenuncia();
