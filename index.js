const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const port = 8080;

// Afișare căi - cerința 3
console.log("__dirname  =", __dirname);
console.log("__filename =", __filename);
console.log("process.cwd() =", process.cwd());

// Setare EJS ca template engine - cerința 4
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views', 'pagini'));

// Variabila globală - cerința 13
var obGlobal = {
    obErori: null
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
    res.render('index', { ip: req.ip });
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
app.get('/:pagina', (req, res) => {
    res.render(req.params.pagina, { ip: req.ip }, (eroare, rezultatRandare) => {
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