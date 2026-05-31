(function () {
  function toggleContraste() {
    document.body.classList.toggle("alto-contraste");
    localStorage.setItem("contraste", document.body.classList.contains("alto-contraste"));
  }

  function aumentarFonte() {
    const atual = parseFloat(getComputedStyle(document.documentElement).fontSize);
    document.documentElement.style.fontSize = Math.min(atual + 2, 24) + "px";
  }

  function diminuirFonte() {
    const atual = parseFloat(getComputedStyle(document.documentElement).fontSize);
    document.documentElement.style.fontSize = Math.max(atual - 2, 12) + "px";
  }

  function resetarFonte() {
    document.documentElement.style.fontSize = "";
    document.body.classList.remove("alto-contraste");
    localStorage.removeItem("contraste");
  }

  window.toggleContraste = toggleContraste;
  window.aumentarFonte = aumentarFonte;
  window.diminuirFonte = diminuirFonte;
  window.resetarFonte = resetarFonte;

  if (localStorage.getItem("contraste") === "true") {
    document.body.classList.add("alto-contraste");
  }
})();
