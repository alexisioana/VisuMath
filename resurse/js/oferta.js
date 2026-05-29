(function () {
  // BONUS12 - temporizator oferta si refresh la expirare
  const anunt = document.getElementById("anunt-oferta");
  if (!anunt) return;

  const timer = document.getElementById("timer-oferta");

  function formatTimp(ms) {
    const totalSecunde = Math.max(0, Math.floor(ms / 1000));
    const ore = Math.floor(totalSecunde / 3600);
    const minute = Math.floor((totalSecunde % 3600) / 60);
    const secunde = totalSecunde % 60;
    return [ore, minute, secunde].map(v => String(v).padStart(2, "0")).join(":");
  }

  async function incarcaOfertaNoua() {
    try {
      const raspuns = await fetch("/oferta-curenta", { cache: "no-store" });
      const data = await raspuns.json();
      if (!data.oferta) {
        anunt.hidden = true;
        return;
      }

      anunt.dataset.finalizare = data.oferta["data-finalizare"];
      anunt.dataset.categorie = data.oferta.categorie;
      anunt.dataset.reducere = data.oferta.reducere;
      anunt.innerHTML = `<strong>Oferta activa:</strong>
        <span>${data.oferta.reducere}% reducere la posterele din categoria <b>${data.oferta.categorie}</b>.</span>
        <span id="timer-oferta" class="timer-oferta">--:--:--</span>`;
      window.location.reload();
    } catch (err) {
      anunt.hidden = true;
    }
  }

  function actualizeazaTimer() {
    const finalizare = new Date(anunt.dataset.finalizare).getTime();
    const ramas = finalizare - Date.now();

    if (ramas <= 0) {
      incarcaOfertaNoua();
      return;
    }

    const timerCurent = document.getElementById("timer-oferta");
    timerCurent.textContent = formatTimp(ramas);
    timerCurent.classList.toggle("timer-oferta-final", ramas <= 10000);
  }

  actualizeazaTimer();
  setInterval(actualizeazaTimer, 1000);
})();
