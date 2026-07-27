(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var seletores = [
    "main > section",
    "main > .LimiteConteudo",
    ".CabecalhoSecao",
    ".CartaoDestaque",
    ".CartaoServico",
    ".Cartao",
    ".CartaoAnimal",
    ".CartaoDepoimento",
    ".CartaoEtapa",
    ".CartaoHistoria",
    ".CartaoPrioridade",
    ".CardAdocao",
    ".card-adocao",
    ".card-animais",
    ".card-pedido",
    ".pet-card",
    ".horizontal-card",
    ".post",
    ".profile-card",
    ".BannerDenuncia",
    ".BannerDicasAdocao",
    ".promo-banner",
    ".Formulario",
  ].join(",");

  var elementos = Array.from(document.querySelectorAll(seletores));

  elementos.forEach(function (elemento, indice) {
    elemento.classList.add("RevelarSuave");
    elemento.style.setProperty("--atraso-animacao", Math.min(indice % 6, 5) * 45 + "ms");
  });

  document.body.classList.add("ComAnimacao");

  var observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("Apareceu");
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
  );

  elementos.forEach(function (elemento) {
    observador.observe(elemento);
  });

  function animarNovo(elemento) {
    if (!(elemento instanceof HTMLElement)) return;

    var novos = [];

    if (elemento.matches("dialog, .ToastSOS, .post, .card-pedido, .CartaoPetPerdido, .CardAdocao"))
      novos.push(elemento);

    novos = novos.concat(
      Array.from(
        elemento.querySelectorAll(
          "dialog, .post, .card-pedido, .CartaoPetPerdido, .CardAdocao, .ResultadoBusca"
        )
      )
    );

    novos.forEach(function (novo) {
      novo.classList.add("AnimacaoNova");
      novo.addEventListener(
        "animationend",
        function () {
          novo.classList.remove("AnimacaoNova");
        },
        { once: true }
      );
    });
  }

  new MutationObserver(function (mudancas) {
    mudancas.forEach(function (mudanca) {
      mudanca.addedNodes.forEach(animarNovo);
    });
  }).observe(document.body, { childList: true, subtree: true });
})();
