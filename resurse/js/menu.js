document.addEventListener('DOMContentLoaded', function () {
  // Selectam doar li-urile care au submeniu
  const liCuSubmeniu = document.querySelectorAll('nav ul li:has(> ul)');

  liCuSubmeniu.forEach(function (li) {
    const link = li.querySelector(':scope > a');

    link.addEventListener('click', function (e) {
      // Doar pe touchscreen / ecran mic
      if (window.innerWidth > 700) return;

      const eraActiv = li.classList.contains('activ');

      // Inchidem toate submenurile deschise
      liCuSubmeniu.forEach(function (altLi) {
        altLi.classList.remove('activ');
      });

      // Daca nu era deschis, il deschidem (altfel l-am inchis deja)
      if (!eraActiv) {
        e.preventDefault(); // blocam navigarea doar cand deschidem submeniul
        li.classList.add('activ');
      }
      // daca era deschis → nu punem preventDefault → navigheaza normal
    });
  });

  // Click in afara → inchidem tot
  document.addEventListener('click', function (e) {
    if (!e.target.closest('nav')) {
      liCuSubmeniu.forEach(function (li) {
        li.classList.remove('activ');
      });
    }
  });
});