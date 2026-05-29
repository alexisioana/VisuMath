(function () {
  // LIGHT-DARK + BONUS2 - tema salvata in localStorage
  const cheieTema = "visumath-tema";
  const temeBootstrapDark = new Set(["dark", "ocean", "contrast"]);

  function temaBootstrap(tema) {
    return temeBootstrapDark.has(tema) ? "dark" : "light";
  }

  function aplicaTema(tema) {
    document.documentElement.setAttribute("data-bs-theme", temaBootstrap(tema));
    document.body.dataset.theme = tema;

    const selectTema = document.getElementById("tema-select");
    if (selectTema) {
      selectTema.value = tema;
    }
  }

  const temaSalvata = localStorage.getItem(cheieTema) || "light";
  document.documentElement.setAttribute("data-bs-theme", temaBootstrap(temaSalvata));

  document.addEventListener("DOMContentLoaded", () => {
    const selectTema = document.getElementById("tema-select");
    aplicaTema(temaSalvata);

    if (!selectTema) return;
    selectTema.addEventListener("change", () => {
      localStorage.setItem(cheieTema, selectTema.value);
      aplicaTema(selectTema.value);
    });
  });
})();
