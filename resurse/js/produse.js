(function () {
  // ETAPA6-PRODUSE - filtrare/sortare/calculare pe pagina produse
  const zonaProduse = document.getElementById("zona-produse");
  if (!zonaProduse) return;

  const articoleInitiale = Array.from(zonaProduse.querySelectorAll(".card-produs"));
  const mesajGol = document.getElementById("mesaj-gol");
  const paginare = document.getElementById("paginare-produse");
  const nume = document.getElementById("filtru-nume");
  const descriere = document.getElementById("filtru-descriere");
  const pretMin = document.getElementById("filtru-pret-min");
  const pretMax = document.getElementById("filtru-pret-max");
  const rezolutie = document.getElementById("filtru-rezolutie");
  const descarcabil = document.getElementById("filtru-descarcabil");
  const culoare = document.getElementById("filtru-culoare");
  const etichete = document.getElementById("filtru-etichete");
  const pretMinVal = document.getElementById("pret-min-val");
  const pretMaxVal = document.getElementById("pret-max-val");
  const eroareNume = document.getElementById("eroare-nume");
  const eroareDescriere = document.getElementById("eroare-descriere");
  const produsePePagina = Number(window.PRODUSE_PE_PAGINA || 6);

  let produseFiltrate = [...articoleInitiale];
  let paginaCurenta = 1;

  function radioNivel() {
    const selectat = document.querySelector('input[name="nivel"]:checked');
    return selectat ? selectat.value : "";
  }

  function valoriMultiple(select) {
    return Array.from(select.selectedOptions).map(opt => opt.value);
  }

  function normalizare(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function expresieWildcard(text) {
    // ETAPA6-FILTRU - nume de forma inceput*sfarsit
    const parti = normalizare(text).split("*").map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return new RegExp("^" + parti.join(".*") + "$", "i");
  }

  function seteazaInvalid(element, eroare, invalid) {
    element.classList.toggle("input-invalid", invalid);
    element.classList.toggle("is-invalid", invalid);
    eroare.hidden = !invalid;
  }

  function valideazaInputuri(afiseazaAlerte) {
    // ETAPA6-VALIDARE - verificari inainte de butoane/filtrare
    let valid = true;
    const textNume = nume.value.trim();
    const textDescriere = descriere.value.trim();
    const regexNume = /^[\p{L}\s*.-]*$/u;

    seteazaInvalid(nume, eroareNume, false);
    seteazaInvalid(descriere, eroareDescriere, false);

    if (!regexNume.test(textNume)) {
      seteazaInvalid(nume, eroareNume, true);
      valid = false;
    }

    if (textDescriere.length === 1) {
      seteazaInvalid(descriere, eroareDescriere, true);
      valid = false;
    }

    if (Number(pretMin.value) > Number(pretMax.value)) {
      if (afiseazaAlerte) alert("Pretul minim nu poate fi mai mare decat pretul maxim.");
      valid = false;
    }

    if (rezolutie.value.trim() && !/^\d+$/.test(rezolutie.value.trim())) {
      if (afiseazaAlerte) alert("Rezolutia trebuie sa fie un numar.");
      valid = false;
    }

    return valid;
  }

  function articolPotrivit(articol) {
    // ETAPA6-FILTRE - toate inputurile aplica filtre pe dataset
    const textNume = nume.value.trim();
    const textDescriere = descriere.value.trim();
    const nivel = radioNivel();
    const eticheteSelectate = valoriMultiple(etichete).map(normalizare);
    const eticheteArticol = articol.dataset.etichete.split(",").map(e => normalizare(e.trim()));

    if (textNume) {
      const numeArticol = normalizare(articol.dataset.nume);
      if (textNume.includes("*")) {
        if (!expresieWildcard(textNume).test(numeArticol)) return false;
      } else if (!numeArticol.includes(normalizare(textNume))) {
        return false;
      }
    }

    if (textDescriere && !normalizare(articol.dataset.descriere).includes(normalizare(textDescriere))) return false;
    if (Number(articol.dataset.pret) < Number(pretMin.value)) return false;
    if (Number(articol.dataset.pret) > Number(pretMax.value)) return false;
    if (rezolutie.value.trim() && Number(articol.dataset.rezolutie) < Number(rezolutie.value.trim())) return false;
    if (nivel && articol.dataset.nivel !== nivel) return false;
    if (descarcabil.checked && articol.dataset.descarcabil !== "true") return false;
    if (culoare.value && articol.dataset.culoare !== culoare.value) return false;
    if (eticheteSelectate.length && !eticheteSelectate.every(e => eticheteArticol.includes(e))) return false;

    return true;
  }

  function randarePaginare(totalPagini) {
    // BONUS5 - genereaza butoanele de paginare
    paginare.innerHTML = "";
    paginare.hidden = totalPagini <= 1;
    if (totalPagini <= 1) return;

    const lista = document.createElement("ul");
    lista.className = "pagination pagination-sm mb-0";

    for (let i = 1; i <= totalPagini; i++) {
      const item = document.createElement("li");
      item.className = "page-item" + (i === paginaCurenta ? " active" : "");

      const buton = document.createElement("button");
      buton.type = "button";
      buton.className = "page-link";
      buton.textContent = i;
      buton.addEventListener("click", () => afiseazaPagina(i));

      item.appendChild(buton);
      lista.appendChild(item);
    }

    paginare.appendChild(lista);
  }

  function afiseazaPagina(pagina) {
    // BONUS5 + BONUS3 - afiseaza pagina curenta sau mesajul fara produse
    const totalPagini = Math.max(1, Math.ceil(produseFiltrate.length / produsePePagina));
    paginaCurenta = Math.min(Math.max(1, pagina), totalPagini);

    const start = (paginaCurenta - 1) * produsePePagina;
    const final = start + produsePePagina;
    const produsePagina = new Set(produseFiltrate.slice(start, final));

    articoleInitiale.forEach(articol => {
      articol.hidden = !produsePagina.has(articol);
    });

    const nuSuntProduse = produseFiltrate.length === 0;
    mesajGol.hidden = !nuSuntProduse;
    zonaProduse.hidden = nuSuntProduse;
    randarePaginare(totalPagini);
  }

  function filtreaza(afiseazaAlerte, paginaNoua) {
    if (!valideazaInputuri(afiseazaAlerte)) return;
    produseFiltrate = Array.from(zonaProduse.querySelectorAll(".card-produs")).filter(articolPotrivit);
    afiseazaPagina(paginaNoua || 1);
  }

  function sorteaza(directie) {
    // ETAPA6-SORTARE - chei: nume, apoi lungime descriere
    if (!valideazaInputuri(true)) return;
    const articole = Array.from(zonaProduse.querySelectorAll(".card-produs"));
    articole.sort((a, b) => {
      const cmpNume = a.dataset.nume.localeCompare(b.dataset.nume, "ro");
      if (cmpNume !== 0) return directie * cmpNume;
      return directie * (Number(a.dataset.descLen) - Number(b.dataset.descLen));
    });
    articole.forEach(a => zonaProduse.appendChild(a));
    filtreaza(false, 1);
  }

  function calculeaza() {
    // ETAPA6-CALCUL - div creat dinamic si sters dupa 2 secunde
    if (!valideazaInputuri(true)) return;
    const preturi = produseFiltrate.map(a => Number(a.dataset.pret));
    const medie = preturi.length ? preturi.reduce((s, p) => s + p, 0) / preturi.length : 0;
    const div = document.createElement("div");
    div.className = "toast-calcul";
    div.textContent = `Media preturilor filtrate: ${medie.toFixed(2)} RON (${preturi.length} produse)`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
  }

  function reseteaza() {
    // ETAPA6-RESET - confirm + revenire la ordinea initiala
    if (!confirm("Vrei cu adevarat sa resetezi filtrele?")) return;
    nume.value = "";
    descriere.value = "";
    pretMin.value = String(window.PRET_MIN || pretMin.min || 0);
    pretMax.value = String(window.PRET_MAX || pretMax.max || 0);
    rezolutie.value = "";
    descarcabil.checked = false;
    culoare.value = "";
    etichete.selectedIndex = -1;
    document.querySelector('input[name="nivel"][value=""]').checked = true;
    actualizeazaRange();
    articoleInitiale.forEach(articol => {
      articol.hidden = false;
      zonaProduse.appendChild(articol);
    });
    seteazaInvalid(nume, eroareNume, false);
    seteazaInvalid(descriere, eroareDescriere, false);
    produseFiltrate = [...articoleInitiale];
    afiseazaPagina(1);
  }

  function actualizeazaRange() {
    pretMinVal.textContent = pretMin.value;
    pretMaxVal.textContent = pretMax.value;
  }

  function filtrareAutomata() {
    filtreaza(false, 1);
  }

  function initModalProdus() {
    // BONUS11 - modal la click pe cardul produsului
    const modal = document.getElementById("modal-produs");
    const continut = document.getElementById("modal-produs-continut");
    const butonInchide = document.getElementById("modal-produs-inchide");
    if (!modal || !continut || !butonInchide) return;

    function pretHtml(articol) {
      if (!articol.dataset.oferta) {
        return `<b>${Number(articol.dataset.pret).toFixed(2)} RON</b>`;
      }

      return `<del class="pret-vechi">${Number(articol.dataset.pret).toFixed(2)} RON</del>
        <b class="pret-redus">${Number(articol.dataset.pretRedus).toFixed(2)} RON</b>
        <span class="badge-eticheta">-${articol.dataset.oferta}%</span>`;
    }

    function deschideModal(articol) {
      const titlu = articol.querySelector("h3")?.textContent.trim() || articol.dataset.nume;
      const descriereText = articol.querySelector(".card-descriere")?.textContent.trim() || "";
      const descarcabilText = articol.dataset.descarcabil === "true" ? "Da" : "Nu";

      continut.innerHTML = `
        <h3 id="modal-produs-titlu">${titlu}</h3>
        <div class="modal-produs-grid">
          <img src="${articol.dataset.imagine}" alt="Poster ${titlu}" class="modal-produs-imagine">
          <div>
            <p>${descriereText}</p>
            <table class="card-tabel">
              <tbody>
                <tr><td class="tabel-cheie">Categorie</td><td>${articol.dataset.categorie}</td></tr>
                <tr><td class="tabel-cheie">Nivel</td><td>${articol.dataset.nivel}</td></tr>
                <tr><td class="tabel-cheie">Pret</td><td>${pretHtml(articol)}</td></tr>
                <tr><td class="tabel-cheie">Rezolutie</td><td>${articol.dataset.rezolutie} DPI</td></tr>
                <tr><td class="tabel-cheie">Culoare</td><td>${articol.dataset.culoare}</td></tr>
                <tr><td class="tabel-cheie">Etichete</td><td>${articol.dataset.etichete}</td></tr>
                <tr><td class="tabel-cheie">Adaugat</td><td>${articol.dataset.data}</td></tr>
                <tr><td class="tabel-cheie">Descarcabil</td><td>${descarcabilText}</td></tr>
              </tbody>
            </table>
          </div>
        </div>`;

      modal.hidden = false;
      document.body.classList.add("modal-deschis");
      butonInchide.focus();
    }

    function inchideModal() {
      modal.hidden = true;
      document.body.classList.remove("modal-deschis");
    }

    articoleInitiale.forEach(articol => {
      articol.addEventListener("click", event => {
        if (event.target.closest("a")) {
          return;
        }
        deschideModal(articol);
      });
    });

    butonInchide.addEventListener("click", inchideModal);
    modal.addEventListener("click", event => {
      if (event.target.matches("[data-inchide-modal]")) {
        inchideModal();
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) {
        inchideModal();
      }
    });
  }

  // BONUS4 - filtrare automata la schimbarea fiecarui input
  pretMin.addEventListener("input", () => {
    actualizeazaRange();
    filtrareAutomata();
  });
  pretMax.addEventListener("input", () => {
    actualizeazaRange();
    filtrareAutomata();
  });
  nume.addEventListener("input", filtrareAutomata);
  descriere.addEventListener("input", filtrareAutomata);
  rezolutie.addEventListener("input", filtrareAutomata);
  culoare.addEventListener("change", filtrareAutomata);
  etichete.addEventListener("change", filtrareAutomata);
  descarcabil.addEventListener("change", filtrareAutomata);
  document.querySelectorAll('input[name="nivel"]').forEach(input => {
    input.addEventListener("change", filtrareAutomata);
  });

  document.getElementById("btn-filtreaza").addEventListener("click", () => filtreaza(true, 1));
  document.getElementById("btn-sort-asc").addEventListener("click", () => sorteaza(1));
  document.getElementById("btn-sort-desc").addEventListener("click", () => sorteaza(-1));
  document.getElementById("btn-calculeaza").addEventListener("click", calculeaza);
  document.getElementById("btn-reseteaza").addEventListener("click", reseteaza);

  actualizeazaRange();
  initModalProdus();
  afiseazaPagina(1);
})();
