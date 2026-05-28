const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const sharp = require('sharp');
const port = 8080;

// Afișare căi - cerința 3
console.log("__dirname  =", __dirname);
console.log("__filename =", __filename);
console.log("process.cwd() =", process.cwd());

// Setare EJS ca template engine - cerința 4
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views', 'pagini'));

// Variabila globală - cerința 13
// Variabila globală - cerința 13 (etapa 4) + a-cerința 2 (etapa 5)
var obGlobal = {
    obErori: null,
    obGalerie: null,
    obGalerieAnimata: null,
    folderScss: path.join(__dirname, 'resurse', 'css'),
    folderCss: path.join(__dirname, 'resurse', 'css'),
    folderBackup: path.join(__dirname, 'backup')
};
// Helper pentru BONUS F - extrage toate obiectele JSON din string
// Returnează vector de obiecte: { textObiect, pozitie }
// Helper pentru BONUS F - extrage TOATE obiectele JSON din string (inclusiv nested)
// Returnează vector de obiecte: { textObiect, pozitie }
function extrageObiecte(textJSON) {
    const rezultat = [];
    const stackPozitii = [];  // stack de poziții pentru fiecare { deschis
    let inString = false;
    let escapeAnterior = false;

    for (let i = 0; i < textJSON.length; i++) {
        const c = textJSON[i];

        // Gestionăm string-urile - nu numărăm acolade în ele
        if (c === '"' && !escapeAnterior) {
            inString = !inString;
        }
        escapeAnterior = (c === '\\' && !escapeAnterior);

        if (inString) continue;

        if (c === '{') {
            // Salvăm poziția acestui { în stack
            stackPozitii.push(i);
        } else if (c === '}') {
            // Scoatem ultima poziție de start și extragem obiectul
            const inceputObiect = stackPozitii.pop();
            if (inceputObiect !== undefined) {
                rezultat.push({
                    textObiect: textJSON.substring(inceputObiect, i + 1),
                    pozitie: inceputObiect
                });
            }
        }
    }

    return rezultat;
}

// Helper pentru BONUS F - extrage cheile DIRECTE dintr-un obiect (nu nested)
function extrageChei(textObiect) {
    const chei = [];
    let nivel = 0;
    let inString = false;
    let escapeAnterior = false;
    let stringCurent = '';
    let asteptDouaPuncte = false;

    for (let i = 1; i < textObiect.length - 1; i++) {  // sărim primul { și ultimul }
        const c = textObiect[i];

        if (c === '"' && !escapeAnterior) {
            if (!inString) {
                inString = true;
                stringCurent = '';
            } else {
                inString = false;
                // String-ul s-a închis. Verificăm dacă e cheie (urmează `:`)
                if (nivel === 0) {
                    // Sărim peste spații până găsim ce urmează
                    let j = i + 1;
                    while (j < textObiect.length && /\s/.test(textObiect[j])) j++;
                    if (textObiect[j] === ':') {
                        chei.push(stringCurent);
                    }
                }
            }
            escapeAnterior = false;
            continue;
        }

        escapeAnterior = (c === '\\' && !escapeAnterior);

        if (inString) {
            stringCurent += c;
        } else {
            if (c === '{' || c === '[') nivel++;
            else if (c === '}' || c === ']') nivel--;
        }
    }

    return chei;
}
// Funcția initErori() - cerința 13 + bonusuri
function initErori() {
    const caleJSON = path.join(__dirname, 'erori.json');

    // BONUS A (0.025p) - verificare existență fișier erori.json
    if (!fs.existsSync(caleJSON)) {
        console.error("══════════════════════════════════════════════════");
        console.error("EROARE CRITICĂ: Fișierul 'erori.json' nu există!");
        console.error("──────────────────────────────────────────────────");
        console.error(`Cale așteptată: ${caleJSON}`);
        console.error("");
        console.error("Soluție: Creează fișierul 'erori.json' în rădăcina");
        console.error("proiectului cu structura: cale_baza, eroare_default,");
        console.error("info_erori.");
        console.error("══════════════════════════════════════════════════");
        process.exit(1);
    }

    const continut = fs.readFileSync(caleJSON, 'utf-8');
    // BONUS F (0.2p) - verificare proprietăți duplicate în JSON (pe string!)
    // JSON.parse elimină automat duplicatele - trebuie să verificăm pe string brut.
    const obiecteleDinJSON = extrageObiecte(continut);
    for (let { textObiect, pozitie } of obiecteleDinJSON) {
        const chei = extrageChei(textObiect);
        const contorChei = {};
        for (let cheie of chei) {
            contorChei[cheie] = (contorChei[cheie] || 0) + 1;
        }
        for (let cheie in contorChei) {
            if (contorChei[cheie] > 1) {
                console.error("══════════════════════════════════════════════════");
                console.error(`EROARE: Proprietatea "${cheie}" apare de ${contorChei[cheie]} ori în același obiect!`);
                console.error("──────────────────────────────────────────────────");
                console.error(`Poziție aproximativă în fișier: caracter ${pozitie}`);
                console.error("");
                console.error("Conținutul obiectului problematic:");
                console.error(textObiect.substring(0, 200) + (textObiect.length > 200 ? "..." : ""));
                console.error("");
                console.error("Soluție: Elimină proprietatea duplicată din JSON.");
                console.error("JSON.parse() păstrează doar ULTIMA valoare, deci");
                console.error("celelalte sunt ignorate silențios.");
                console.error("══════════════════════════════════════════════════");
                process.exit(1);
            }
        }
    }
    const obj = JSON.parse(continut);

    // BONUS B (0.025p) - verificare proprietăți obligatorii în JSON
    const proprietatiObligatorii = ['info_erori', 'cale_baza', 'eroare_default'];
    for (let prop of proprietatiObligatorii) {
        if (obj[prop] === undefined) {
            console.error("══════════════════════════════════════════════════");
            console.error(`EROARE: Proprietatea "${prop}" lipsește din erori.json!`);
            console.error("──────────────────────────────────────────────────");
            console.error("Proprietățile obligatorii sunt:");
            console.error("  - info_erori: vector cu erorile predefinite");
            console.error("  - cale_baza: calea folderului cu imaginile de eroare");
            console.error("  - eroare_default: obiect cu titlu/text/imagine default");
            console.error("");
            console.error("Soluție: Adaugă proprietatea lipsă în erori.json");
            console.error("══════════════════════════════════════════════════");
            process.exit(1);
        }
    }
    // BONUS C (0.025p) - verificare proprietăți obligatorii în eroare_default
    const proprietatiEroareDefault = ['titlu', 'text', 'imagine'];
    for (let prop of proprietatiEroareDefault) {
        if (obj.eroare_default[prop] === undefined) {
            console.error("══════════════════════════════════════════════════");
            console.error(`EROARE: Proprietatea "${prop}" lipsește din eroare_default!`);
            console.error("──────────────────────────────────────────────────");
            console.error("Obiectul 'eroare_default' trebuie să aibă proprietățile:");
            console.error("  - titlu: titlul afișat în pagina de eroare");
            console.error("  - text: textul descriptiv al erorii");
            console.error("  - imagine: numele fișierului imagine (relativ la cale_baza)");
            console.error("");
            console.error("Soluție: Adaugă proprietatea lipsă în eroare_default");
            console.error("══════════════════════════════════════════════════");
            process.exit(1);
        }
    }
    // BONUS D (0.025p) - verificare existență folder cale_baza pe disk
    const caleFolderErori = path.join(__dirname, obj.cale_baza);
    if (!fs.existsSync(caleFolderErori)) {
        console.error("══════════════════════════════════════════════════");
        console.error(`EROARE: Folderul "${obj.cale_baza}" nu există pe disk!`);
        console.error("──────────────────────────────────────────────────");
        console.error(`Cale așteptată: ${caleFolderErori}`);
        console.error("");
        console.error("Soluție: Creează folderul sau modifică proprietatea");
        console.error("'cale_baza' din erori.json să indice un folder existent.");
        console.error("══════════════════════════════════════════════════");
        process.exit(1);
    }
    // BONUS G (0.15p) - verificare identificatori duplicați în info_erori
    const contorIdentificatori = {};
    for (let eroare of obj.info_erori) {
        const id = eroare.identificator;
        if (contorIdentificatori[id] === undefined) {
            contorIdentificatori[id] = [eroare];
        } else {
            contorIdentificatori[id].push(eroare);
        }
    }

    // Acum verificăm care identificatori apar de mai multe ori
    for (let id in contorIdentificatori) {
        if (contorIdentificatori[id].length > 1) {
            console.error("══════════════════════════════════════════════════");
            console.error(`EROARE: Identificator duplicat "${id}" în info_erori!`);
            console.error(`Există ${contorIdentificatori[id].length} erori cu același identificator.`);
            console.error("──────────────────────────────────────────────────");

            // Afișăm toate erorile cu acest identificator, fără identificator
            for (let i = 0; i < contorIdentificatori[id].length; i++) {
                console.error(`Eroare #${i + 1}:`);
                const eroareDuplicata = contorIdentificatori[id][i];
                for (let prop in eroareDuplicata) {
                    if (prop !== 'identificator') {
                        console.error(`  ${prop}: ${eroareDuplicata[prop]}`);
                    }
                }
                console.error("");
            }

            console.error("Soluție: Modifică identificatorii din info_erori");
            console.error("astfel încât fiecare să fie unic.");
            console.error("══════════════════════════════════════════════════");
            process.exit(1);
        }
    }
    // BONUS E (0.05p) - verificare existență imagini pe disk + concatenare cale_baza
    for (let eroare of obj.info_erori) {
        const caleImagine = path.join(__dirname, obj.cale_baza, eroare.imagine);
        if (!fs.existsSync(caleImagine)) {
            console.error("══════════════════════════════════════════════════");
            console.error(`EROARE: Imaginea pentru eroarea ${eroare.identificator} nu există!`);
            console.error("──────────────────────────────────────────────────");
            console.error(`Identificator eroare: ${eroare.identificator}`);
            console.error(`Imagine specificată:  ${eroare.imagine}`);
            console.error(`Cale așteptată:       ${caleImagine}`);
            console.error("");
            console.error(`Soluție: Adaugă fișierul "${eroare.imagine}" în`);
            console.error(`folderul "${obj.cale_baza}" sau modifică json-ul.`);
            console.error("══════════════════════════════════════════════════");
            process.exit(1);
        }
        // Doar dacă imaginea există, transformăm calea
        eroare.imagine = path.join(obj.cale_baza, eroare.imagine);
    }

    // Verificare și pentru imaginea de eroare default
    const caleImagineDefault = path.join(__dirname, obj.cale_baza, obj.eroare_default.imagine);
    if (!fs.existsSync(caleImagineDefault)) {
        console.error("══════════════════════════════════════════════════");
        console.error("EROARE: Imaginea pentru eroarea default nu există!");
        console.error("──────────────────────────────────────────────────");
        console.error(`Imagine specificată:  ${obj.eroare_default.imagine}`);
        console.error(`Cale așteptată:       ${caleImagineDefault}`);
        console.error("══════════════════════════════════════════════════");
        process.exit(1);
    }
    obj.eroare_default.imagine = path.join(obj.cale_baza, obj.eroare_default.imagine);

    obGlobal.obErori = obj;
}

initErori();

// Funcția initGalerie() - cerința galerie-statica (etapa 5)
// Încarcă galerie.json, filtrează după luna curentă și generează imagini mici
async function initGalerie() {
    const caleJSON = path.join(__dirname, 'galerie.json');

    // Verificare existență fișier galerie.json
    if (!fs.existsSync(caleJSON)) {
        console.error("══════════════════════════════════════════════════");
        console.error("EROARE: Fișierul 'galerie.json' nu există!");
        console.error(`Cale așteptată: ${caleJSON}`);
        console.error("══════════════════════════════════════════════════");
        obGlobal.obGalerie = { cale_galerie: '', imagini: [] };
        return;
    }

    const continut = fs.readFileSync(caleJSON, 'utf-8');
    const obj = JSON.parse(continut);

    // Determinăm luna curentă în română
    const luniRomana = [
        'ianuarie', 'februarie', 'martie', 'aprilie',
        'mai', 'iunie', 'iulie', 'august',
        'septembrie', 'octombrie', 'noiembrie', 'decembrie'
    ];
    const lunaCurenta = luniRomana[new Date().getMonth()];
    console.log(`[Galerie] Luna curentă: ${lunaCurenta}`);

    // Filtrăm imaginile care conțin luna curentă în vectorul "luni"
    const imaginiPotrivite = obj.imagini.filter(img =>
        img.luni && img.luni.includes(lunaCurenta)
    );

    // Trunchiem la maxim 12 imagini (cerință)
    const imaginiFiltrate = imaginiPotrivite.slice(0, 12);

    console.log(`[Galerie] ${imaginiFiltrate.length} imagini din ${obj.imagini.length} sunt pentru ${lunaCurenta}`);

    // Generăm imagini mici (400px) pentru ecran mediu/mic
    const caleFolderGalerie = path.join(__dirname, obj.cale_galerie);

    for (let img of imaginiFiltrate) {
        const caleOriginala = path.join(caleFolderGalerie, img.cale_fisier);

        // Construim numele fișierului mic: "01-foo.jpg" → "01-foo-mic.jpg"
        const ext = path.extname(img.cale_fisier);
        const numeFaraExt = path.basename(img.cale_fisier, ext);
        const numeMic = `${numeFaraExt}-mic${ext}`;
        const caleMica = path.join(caleFolderGalerie, numeMic);

        // Salvăm calea relativă (pentru folosire în template-uri)
        img.cale_relativa = path.join(obj.cale_galerie, img.cale_fisier).replace(/\\/g, '/');
        img.cale_relativa_mica = path.join(obj.cale_galerie, numeMic).replace(/\\/g, '/');

        // Adăugăm proprietate "alt" dacă lipsește (fallback la titlu)
        if (!img.alt) {
            img.alt = img.titlu;
        }

        // Generăm imaginea mică DOAR dacă nu există deja
        if (!fs.existsSync(caleMica)) {
            try {
                await sharp(caleOriginala)
                    .resize(400, 400, { fit: 'cover' })
                    .toFile(caleMica);
                console.log(`[Galerie] Generat: ${numeMic}`);
            } catch (err) {
                console.error(`[Galerie] Eroare la procesarea ${img.cale_fisier}:`, err.message);
            }
        }
    }

    // Salvăm în obGlobal pentru a fi accesibil în template-uri
    obGlobal.obGalerie = {
        cale_galerie: obj.cale_galerie,
        imagini: imaginiFiltrate,
        luna_curenta: lunaCurenta
    };
}

// Importăm sass la începutul fișierului (vezi pasul de sus, dar îl pun aici pentru claritate)
const sass = require('sass');

// Funcția compileazaScss() - cerința 2 (etapa 5)
// Compilează un fișier SCSS în CSS, cu backup automat al CSS-ului vechi
function compileazaScss(caleScss, caleCss) {
    // b. Dacă nu se specifică caleCss, folosim numele scss-ului cu extensia .css
 // BONUS 4 (0.025p) - gestionare corectă a fișierelor cu PUNCTE în nume
    // (ex: "stil.frumos.scss" → "stil.frumos.css")
    if (!caleCss) {
        const numeFisier = path.basename(caleScss);
        // Folosim regex cu $ ca să înlocuim DOAR extensia .scss de la final,
        // nu și punctele din mijlocul numelui (ex: stil.frumos.scss)
        let numeCss;
        if (numeFisier.endsWith('.scss')) {
            // Tăiem doar ultimele 5 caractere (".scss") și adăugăm ".css"
            numeCss = numeFisier.slice(0, -5) + '.css';
        } else {
            // Dacă nu se termină în .scss, adăugăm pur și simplu .css
            numeCss = numeFisier + '.css';
        }
        caleCss = path.join(obGlobal.folderCss, numeCss);
    }

    // Dacă căile sunt relative (doar nume de fișier), le facem absolute
    if (!path.isAbsolute(caleScss)) {
        caleScss = path.join(obGlobal.folderScss, caleScss);
    }
    if (!path.isAbsolute(caleCss)) {
        caleCss = path.join(obGlobal.folderCss, caleCss);
    }

    // c. SALVARE ÎN BACKUP - dacă există un .css vechi, îl copiem în backup
    // c. SALVARE ÎN BACKUP cu TIMESTAMP - BONUS 3 (0.05p)
    // Fiecare backup are timestamp unic în nume → păstrăm mai multe versiuni
    if (fs.existsSync(caleCss)) {
        const numeCss = path.basename(caleCss);               // ex: "menu.css"
        const caleBackupFolder = path.join(obGlobal.folderBackup, 'resurse', 'css');

        // Construim numele cu timestamp: "menu.css" → "menu_1681124489791.css"
        const timestamp = Date.now();                          // milisecunde de la 1970
        const ext = path.extname(numeCss);                     // ".css"
        const numeFaraExt = path.basename(numeCss, ext);       // "menu"
        const numeBackup = `${numeFaraExt}_${timestamp}${ext}`; // "menu_1681124489791.css"
        const caleBackup = path.join(caleBackupFolder, numeBackup);

        // Creăm subfolderele dacă nu există (recursiv)
        if (!fs.existsSync(caleBackupFolder)) {
            fs.mkdirSync(caleBackupFolder, { recursive: true });
        }

        try {
            fs.copyFileSync(caleCss, caleBackup);
            console.log(`[SCSS] Backup salvat: ${numeBackup}`);
        } catch (err) {
            console.error(`[SCSS] Eroare la backup ${numeCss}:`, err.message);
        }
    }

    // b. COMPILARE - folosim pachetul sass
    try {
        const rezultat = sass.compile(caleScss, {
    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
});
        fs.writeFileSync(caleCss, rezultat.css);
        console.log(`[SCSS] Compilat: ${path.basename(caleScss)} → ${path.basename(caleCss)}`);
    } catch (err) {
        console.error(`[SCSS] Eroare la compilarea ${path.basename(caleScss)}:`);
        console.error(`       ${err.message}`);
    }
}

// d. COMPILARE INIȚIALĂ - la pornirea serverului
// Citim toate fișierele .scss din folderul de SCSS și le compilăm
function compileazaToate() {
    if (!fs.existsSync(obGlobal.folderScss)) {
        console.log("[SCSS] Folderul SCSS nu există. Sar peste compilare.");
        return;
    }

    const fisiere = fs.readdirSync(obGlobal.folderScss);
    const fisiereScss = fisiere.filter(f => f.endsWith('.scss'));

    if (fisiereScss.length === 0) {
        console.log("[SCSS] Niciun fișier .scss găsit în folderul de SCSS.");
        return;
    }

    console.log(`[SCSS] Compilare inițială: ${fisiereScss.length} fișiere`);
    for (let fisier of fisiereScss) {
        compileazaScss(fisier);
    }
}

compileazaToate();

// e. WATCHER - urmărim modificările din folderul SCSS
fs.watch(obGlobal.folderScss, (eveniment, numeFisier) => {
    if (numeFisier && numeFisier.endsWith('.scss')) {
        console.log(`[SCSS Watcher] Detectat ${eveniment} pe ${numeFisier}`);
        // Mic delay ca să ne asigurăm că fișierul e complet salvat
        setTimeout(() => {
            compileazaScss(numeFisier);
        }, 100);
    }
});

console.log(`[SCSS Watcher] Urmărim modificările din: ${obGlobal.folderScss}`);

// BONUS 5 (0.05p) - validare date JSON galerie
// Verifică existența folderului cale_galerie + a fiecărei imagini pe disk
function validateazaGalerie() {
    const caleJSON = path.join(__dirname, 'galerie.json');

    if (!fs.existsSync(caleJSON)) {
        console.error("[ValidareGalerie] galerie.json nu există, sar peste validare.");
        return;
    }

    const continut = fs.readFileSync(caleJSON, 'utf-8');
    const obj = JSON.parse(continut);

    // a. (0.025p) - verificare existență folder cale_galerie pe disk
    const caleFolderGalerie = path.join(__dirname, obj.cale_galerie);
    if (!fs.existsSync(caleFolderGalerie)) {
        console.error("══════════════════════════════════════════════════");
        console.error(`EROARE GALERIE: Folderul "${obj.cale_galerie}" nu există!`);
        console.error("──────────────────────────────────────────────────");
        console.error(`Cale așteptată: ${caleFolderGalerie}`);
        console.error("");
        console.error("Soluție: Creează folderul galeriei sau modifică");
        console.error("proprietatea 'cale_galerie' din galerie.json.");
        console.error("══════════════════════════════════════════════════");
        return;
    }

    // b. (0.025p) - verificare existență fiecare imagine pe disk
    let imaginiLipsa = [];
    for (let img of obj.imagini) {
        const caleImagine = path.join(caleFolderGalerie, img.cale_fisier);
        if (!fs.existsSync(caleImagine)) {
            imaginiLipsa.push({
                fisier: img.cale_fisier,
                titlu: img.titlu,
                cale: caleImagine
            });
        }
    }

    if (imaginiLipsa.length > 0) {
        console.error("══════════════════════════════════════════════════");
        console.error(`EROARE GALERIE: ${imaginiLipsa.length} imagine/imagini lipsesc de pe disk!`);
        console.error("──────────────────────────────────────────────────");
        for (let img of imaginiLipsa) {
            console.error(`  ✗ "${img.titlu}" → fișier: ${img.fisier}`);
            console.error(`    Cale așteptată: ${img.cale}`);
        }
        console.error("");
        console.error("Soluție: Adaugă fișierele lipsă în folderul galeriei");
        console.error("sau elimină-le din lista 'imagini' din galerie.json.");
        console.error("══════════════════════════════════════════════════");
    } else {
        console.log(`[ValidareGalerie] OK - toate cele ${obj.imagini.length} imagini există pe disk.`);
    }
}
// Funcția initGalerieAnimata() - bonus 1 etapa 5 (galerie-animata)
// Selectează aleator n imagini distincte din galerie cu nume scurt < 12 caractere
function initGalerieAnimata() {
    // Citim din nou JSON-ul (sau folosim datele deja încărcate de initGalerie)
    const caleJSON = path.join(__dirname, 'galerie.json');

    if (!fs.existsSync(caleJSON)) {
        console.error("[GalerieAnimata] galerie.json nu există");
        obGlobal.obGalerieAnimata = { n: 0, imagini: [] };
        return;
    }

    const continut = fs.readFileSync(caleJSON, 'utf-8');
    const obj = JSON.parse(continut);

    // FILTRARE: doar imagini cu titlu < 12 caractere
    const imaginiCuTitluScurt = obj.imagini.filter(img =>
        img.titlu && img.titlu.length < 12
    );

    console.log(`[GalerieAnimata] ${imaginiCuTitluScurt.length} imagini au titlu < 12 caractere`);

    if (imaginiCuTitluScurt.length < 4) {
        console.error("[GalerieAnimata] Nu există suficiente imagini cu nume scurt (minim 4 necesare)");
        obGlobal.obGalerieAnimata = { n: 0, imagini: [] };
        return;
    }

    // ALEGE n: 4, 9, sau 16
    // Limităm la valoarea maximă posibilă (dacă avem doar 6 imagini, nu putem face 16)
    const variante = [4, 9, 16].filter(v => v <= imaginiCuTitluScurt.length);
    const n = variante[Math.floor(Math.random() * variante.length)];

    console.log(`[GalerieAnimata] Aleator: n = ${n} imagini`);

    // ALEGEM n imagini DISTINCTE (shuffle + slice)
    const imaginiShuffled = [...imaginiCuTitluScurt].sort(() => Math.random() - 0.5);
    const imaginiAlese = imaginiShuffled.slice(0, n);

    // Construim căile relative
    for (let img of imaginiAlese) {
        img.cale_relativa = path.join(obj.cale_galerie, img.cale_fisier).replace(/\\/g, '/');
        if (!img.alt) img.alt = img.titlu;
    }

    obGlobal.obGalerieAnimata = {
        n: n,
        imagini: imaginiAlese
    };

    // Generăm SCSS-ul dinamic cu n
    genereazaScssGalerieAnimata(n);
}

// Generează un fișier SCSS dinamic cu variabilele pentru galeria animată
function genereazaScssGalerieAnimata(n) {
    const rand = Math.sqrt(n);  // 2 pentru n=4, 3 pentru n=9, 4 pentru n=16
    
    // Calculăm pozițiile pentru fiecare imagine (translate pe X și Y)
    // Pentru a vedea imaginea i mare, gridul trebuie tradus cu poziția ei în grid
    // (la dimensiunea containerului, fiecare imagine ocupă 100% din container)
    
    // Generăm keyframes pentru fiecare imagine
    // Animația: zoom-out (vede tot gridul) → zoom-in (vede o imagine mare) → repeat
    // Durata totală: n × 2 secunde (1s pe zoom-out + 1s pe imagine mare)
    
  let keyframes = '';
    const dur_per_img = 100 / n;  // procentaj din animație pentru fiecare imagine
    
    // ORDINE DE PARCURGERE - boustrophedon (zigzag pe rânduri, direcție alternată)
    // Rândurile pare: stânga → dreapta. Rândurile impare: dreapta → stânga.
    const ordine = [];
    for (let r = 0; r < rand; r++) {
        if (r % 2 === 0) {
            // rând par: stânga → dreapta
            for (let c = 0; c < rand; c++) {
                ordine.push({ row: r, col: c });
            }
        } else {
            // rând impar: dreapta → stânga (direcție alternată)
            for (let c = rand - 1; c >= 0; c--) {
                ordine.push({ row: r, col: c });
            }
        }
    }
    
    for (let i = 0; i < n; i++) {
        const col = ordine[i].col;
        const row = ordine[i].row;
        
        // Procentajul în animație când se vede imaginea i mărită
        const proc_inceput = i * dur_per_img;
        const proc_zoom_in = proc_inceput + dur_per_img * 0.3;   // 30% transition
        const proc_stay = proc_inceput + dur_per_img * 0.7;       // stă 40% pe imagine
        const proc_zoom_out = proc_inceput + dur_per_img;         // 30% transition out
        
      // Pentru ca celula (row, col) să umple containerul:
        // translatăm gridul cu -col/-row celule (în procente din dimensiunea gridului)
        // apoi scalăm. Cu transform-origin: top left și ordinea translate→scale,
        // procentele de translate sunt relative la dimensiunea elementului (grid).
        // O celulă = 100/rand % din grid. Pentru a aduce celula (row,col) la origine:
        const tx = -(col * 100 / rand);  // % din lățimea gridului
        const ty = -(row * 100 / rand);  // % din înălțimea gridului
        
        // ORDINEA CORECTĂ: translate ÎNAINTE de scale
        // Astfel translate-ul folosește coordonatele originale (nescalate)
        keyframes += `  ${proc_zoom_in.toFixed(2)}% { transform: scale(${rand}) translate(${tx.toFixed(4)}%, ${ty.toFixed(4)}%); }\n`;
        keyframes += `  ${proc_stay.toFixed(2)}% { transform: scale(${rand}) translate(${tx.toFixed(4)}%, ${ty.toFixed(4)}%); }\n`;
        keyframes += `  ${proc_zoom_out.toFixed(2)}% { transform: scale(1) translate(0%, 0%); }\n`;
    }
    
    const continut = `// Fișier SCSS generat automat de Node.js
// Pentru galeria animată — bonus 1 etapa 5
// Numărul de imagini: ${n} (dinamică)

$nr-imagini-galerie: ${n};
$rand-coloana-galerie: ${rand};
$dimensiune-galerie: 500px;
$durata-totala: ${n * 2}s;

// Border-image pentru galerie
$border-imagine: url("/resurse/img/border-galerie.png");
$border-slice: 33%;
$border-width: 30px;

.galerie-animata {
  position: relative;
  width: $dimensiune-galerie;
  height: $dimensiune-galerie;
  margin: 30px auto;
  overflow: hidden;          // CRITIC: ascunde gridul când e mărit
  border: $border-width solid transparent;
  border-image-source: $border-imagine;
  border-image-slice: 33%;
  border-image-width: $border-width;
  border-image-repeat: round;
  background: #fff;
}

// Grid-ul intern - $rand × $rand
.galerie-animata-grid {
  display: grid;
  grid-template-columns: repeat($rand-coloana-galerie, 1fr);
  grid-template-rows: repeat($rand-coloana-galerie, 1fr);
  width: 100%;
  height: 100%;
  transform-origin: top left;        // CRITIC: scale și translate se fac din colțul stânga-sus
  animation: zoom-galerie $durata-totala infinite ease-in-out;
}

.galerie-animata-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

// Hover pe galerie → animația se oprește pe poziția curentă
.galerie-animata:hover .galerie-animata-grid {
  animation-play-state: paused;
}

// Keyframes generate dinamic pentru ${n} imagini
@keyframes zoom-galerie {
  0% { transform: scale(1) translate(0, 0); }
${keyframes}  100% { transform: scale(1) translate(0, 0); }
}

// Ascunsă pe ecran mediu și mic
@media screen and (max-width: 1024px) {
  .galerie-animata-wrapper {
    display: none;
  }
}
`;

    const caleScss = path.join(obGlobal.folderScss, 'galerie-animata.scss');
    fs.writeFileSync(caleScss, continut);
    console.log(`[GalerieAnimata] Generat fișier SCSS dinamic: galerie-animata.scss (n=${n})`);

    compileazaScss('galerie-animata.scss');
}

// Apel inițial
initGalerieAnimata();
validateazaGalerie();

// Apelăm funcția — async, dar nu așteptăm (serverul pornește cu imaginile mari, cele mici se generează în background)
initGalerie().then(() => {
    console.log(`[Galerie] Inițializare completă: ${obGlobal.obGalerie.imagini.length} imagini`);
});
// Cerința 20 - creare automată foldere la pornirea serverului
const vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];

for (let nume_folder of vect_foldere) {
    const caleFolder = path.join(__dirname, nume_folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
        console.log(`Folderul "${nume_folder}" a fost creat.`);
    } else {
        console.log(`Folderul "${nume_folder}" există deja.`);
    }
}

// Funcția afisareEroare() - cerința 14
function afisareEroare(res, req, identificator, titlu, text, imagine) {
    let eroareGasita = null;
    if (identificator !== undefined && identificator !== null) {
        eroareGasita = obGlobal.obErori.info_erori.find(
            err => err.identificator === identificator
        );
    }

    let eroareFinala;

    if (eroareGasita) {
        eroareFinala = {
            titlu: titlu || eroareGasita.titlu,
            text: text || eroareGasita.text,
            imagine: "/" + (imagine || eroareGasita.imagine).replace(/\\/g, "/"),
            ip: req ? req.ip : 'necunoscut'
        };

        if (eroareGasita.status) {
            res.status(eroareGasita.identificator);
        }
    } else {
        const def = obGlobal.obErori.eroare_default;
        eroareFinala = {
            titlu: titlu || def.titlu,
            text: text || def.text,
            imagine: "/" + (imagine || def.imagine).replace(/\\/g, "/"),
            ip: req ? req.ip : 'necunoscut'
        };
    }

    res.render('eroare', eroareFinala);
}

// Cerința 17 - eroare 403 pentru cereri către foldere din /resurse/
// IMPORTANT: trebuie ÎNAINTE de app.use('/resurse', express.static(...))
// Folosim middleware general care prinde TOATE cererile către /resurse/...
app.use('/resurse', (req, res, next) => {
    const caleCeruta = req.path;  // ex: "/", "/css/", "/css/style.css"

    // Luăm ultima parte din cale (după ultimul /)
    const ultimaParte = caleCeruta.split('/').filter(p => p !== '').pop();

    if (!ultimaParte || !ultimaParte.includes('.')) {
        // Nu există ultima parte (deci e doar /resurse sau /resurse/)
        // sau ultima parte nu are punct (deci e folder, nu fișier)
        // → 403 Forbidden
        afisareEroare(res, req, 403);
    } else {
        // E fișier → lăsăm express.static să se ocupe
        next();
    }
});

// Folder static cu resurse - cerința 6
app.use('/resurse', express.static(path.join(__dirname, 'resurse')));

// Ruta pentru pagina index - cerința 8
app.get(['/', '/index', '/home'], (req, res) => {
    // Regenerează galeria animată la fiecare cerere (număr aleator nou)
    initGalerieAnimata();
    
    res.render('index', { 
        ip: req.ip,
        obGalerie: obGlobal.obGalerie,
        obGalerieAnimata: obGlobal.obGalerieAnimata
    });
});

// Cerința 19 - favicon servit cu sendFile
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'resurse', 'ico', 'favicon.ico'));
});

// Cerința 18 - eroare 400 pentru orice fișier .ejs
// IMPORTANT: trebuie ÎNAINTE de app.get('/:pagina', ...)
app.get(/\.ejs$/, (req, res) => {
    afisareEroare(res, req, 400);
});

// Ruta generică pentru orice altă pagină - cerința 9 + 10
// Ruta generică pentru orice altă pagină - cerința 9 + 10
app.get('/:pagina', (req, res) => {
    res.render(req.params.pagina, { 
        ip: req.ip,
        obGalerie: obGlobal.obGalerie
    }, (eroare, rezultatRandare) => {
        if (eroare) {
            if (eroare.message.startsWith("Failed to lookup view")) {
                afisareEroare(res, req, 404);
            } else {
                afisareEroare(res, req);
            }
        } else {
            res.send(rezultatRandare);
        }
    });
});

app.listen(port, () => {
    console.log(`Serverul ascultă pe portul ${port}`);
});