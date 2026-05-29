TRUNCATE TABLE produse RESTART IDENTITY CASCADE;

INSERT INTO produse (nume, descriere, imagine, categorie, nivel, pret, rezolutie, data_adaugare, culoare, etichete, descarcabil, format_print, durata_acces, licenta) VALUES

('Ecuatia de Gradul 2',
 'Poster educational care ilustreaza solutiile ecuatiei de gradul al doilea folosind formula discriminantului. Include reprezentarea grafica a parabolei si interpretarea geometrica a radacinilor reale si complexe.',
 '/resurse/img/galerie/01-ecuatia-gradul-2.png',
 'Algebra', 'Intermediar', 29.99, 300, '2024-09-15', 'Albastru',
 'formula, discriminant, parabola, radacini', TRUE, 'A2 PDF', 365, 'educationala individuala'),

('Cercul Trigonometric',
 'Vizualizare detaliata a cercului trigonometric cu valorile sin, cos si tg pentru unghiurile principale. Unghiurile sunt marcate atat in grade cat si in radiani, cu toate valorile exacte.',
 '/resurse/img/galerie/03-cerc-trigonometric.jpg',
 'Geometrie', 'Intermediar', 34.99, 300, '2024-10-01', 'Albastru',
 'trigonometrie, sin, cos, tg, radiani, grade', TRUE, 'A1 PDF', 365, 'educationala individuala'),

('Numarul Pi',
 'Poster artistic si educational despre numarul pi, cu primele 1000 de zecimale aranjate in spirala. Include istoria descoperirii lui pi si metodele clasice de calcul.',
 '/resurse/img/galerie/06-numarul-pi.jpg',
 'Analiza', 'Incepator', 24.99, 150, '2024-11-10', 'Verde',
 'pi, numar, constanta, spirala, zecimale', FALSE, 'A3 print', 180, 'afisare in clasa'),

('Sirul lui Fibonacci',
 'Poster matematic care prezinta sirul Fibonacci si spirala aurie derivata din acesta. Sunt incluse exemple din natura care ilustreaza aparitia sirului in plante si animale.',
 '/resurse/img/galerie/05-fibonacci.jpg',
 'Algebra', 'Incepator', 19.99, 150, '2024-09-20', 'Verde',
 'fibonacci, spirala, natura, sir, recursivitate', FALSE, 'A3 print', 180, 'afisare in clasa'),

('Numarul de Aur',
 'Reprezentare vizuala a proportiei de aur (phi = 1.618...) in geometrie, arta si natura. Include dreptunghiul de aur, spirala si aplicatii in arhitectura si design.',
 '/resurse/img/galerie/11-numarul-aur.jpg',
 'Geometrie', 'Intermediar', 39.99, 300, '2024-10-15', 'Alb',
 'phi, proportie, spirala, arta, geometrie', TRUE, 'A2 PDF', 365, 'educationala individuala'),

('Combinatorica si Permutari',
 'Poster educational despre principiile fundamentale ale combinatoricii: permutari, combinari si aranjamente. Include formulele principale si exemple concrete de numarare.',
 '/resurse/img/galerie/18-combinatorica.jpg',
 'Combinatorica', 'Avansat', 44.99, 300, '2024-11-01', 'Albastru',
 'permutari, combinari, aranjamente, numarare, combinatorica', FALSE, 'A2 print', 180, 'afisare in clasa'),

('Teoria Probabilitatilor',
 'Vizualizare completa a conceptelor de baza din teoria probabilitatilor: spatiul esantion, evenimente, probabilitate conditionata si teorema lui Bayes ilustrate cu exemple intuitive.',
 '/resurse/img/galerie/09-probabilitate.jpg',
 'Statistica', 'Intermediar', 34.99, 300, '2024-10-20', 'Rosu',
 'probabilitate, bayes, statistici, evenimente, distributie', FALSE, 'A2 print', 180, 'afisare in clasa'),

('Derivate si Integrale',
 'Poster de referinta pentru calculul diferential si integral: reguli de derivare, tehnici de integrare si legatura dintre ele prin teorema fundamentala a calculului.',
 '/resurse/img/galerie/04-derivata.jpg',
 'Analiza', 'Avansat', 49.99, 600, '2024-09-05', 'Negru',
 'derivate, integrale, calcul, diferential, reguli', TRUE, 'A1 PDF', 730, 'institutie educationala'),

('Geometria Euclidiana',
 'Poster cu axiomele si teoremele fundamentale ale geometriei plane: triunghiuri, cercuri, paralelisme si perpendiculare, cu demonstratii vizuale elegante.',
 '/resurse/img/galerie/02-teorema-pitagora.jpg',
 'Geometrie', 'Incepator', 27.99, 150, '2024-08-15', 'Albastru',
 'euclid, triunghi, cerc, axioame, teoreme', TRUE, 'A3 PDF', 365, 'educationala individuala'),

('Distributia Normala',
 'Vizualizare a distributiei normale (curba Gauss) cu proprietatile sale statistice. Include regula 68-95-99.7, deviatie standard si aplicatii in analiza datelor reale.',
 '/resurse/img/galerie/10-statistica.jpg',
 'Statistica', 'Intermediar', 32.99, 300, '2024-11-05', 'Rosu',
 'gauss, distributie, deviatia, bell curve, probabilitate', FALSE, 'A2 print', 180, 'afisare in clasa'),

('Transformari Geometrice',
 'Poster educativ despre transformarile geometrice in plan: translatii, rotatii, reflectii si homotetii. Fiecare transformare este ilustrata cu exemple grafice pas-cu-pas.',
 '/resurse/img/galerie/16-poligoane.jpg',
 'Geometrie', 'Avansat', 42.99, 300, '2024-10-10', 'Verde',
 'translatie, rotatie, reflectie, homotetie, izometrie', FALSE, 'A2 print', 180, 'afisare in clasa'),

('Siruri si Progresii',
 'Vizualizare grafica a sirurilor aritmetice si geometrice, cu formulele termenului general si sumei primilor n termeni. Include aplicatii practice in finante si fizica.',
 '/resurse/img/galerie/17-progresii.jpg',
 'Algebra', 'Intermediar', 29.99, 300, '2024-08-01', 'Verde',
 'sir, progresie, geometrica, aritmetica, suma', TRUE, 'A3 PDF', 365, 'educationala individuala'),

('Fractali si Haos',
 'Poster cu cei mai celebri fractali matematici: Mandelbrot, Julia, Sierpinski si Koch. Include definitia recursiva si proprietatea de auto-similitudine la diferite scari.',
 '/resurse/img/galerie/20-trigonometrie.jpg',
 'Analiza', 'Expert', 59.99, 600, '2024-07-20', 'Negru',
 'fractali, mandelbrot, haos, recursivitate, auto-similitudine', FALSE, 'A1 print', 90, 'expozitie educationala'),

('Algebra Liniara',
 'Poster de referinta pentru algebra liniara: matrice, vectori, determinanti si sisteme de ecuatii. Include reprezentari geometrice ale spatiilor vectoriale in 2D si 3D.',
 '/resurse/img/galerie/13-matrice.jpg',
 'Algebra', 'Avansat', 47.99, 300, '2024-09-01', 'Negru',
 'matrice, vector, determinant, sistem, spatiu vectorial', TRUE, 'A1 PDF', 730, 'institutie educationala'),

('Teoria Grafurilor',
 'Vizualizare interactiva a teoriei grafurilor: grafuri orientate, neorientate, arbori si retele. Include algoritmii clasici: Dijkstra, BFS, DFS si aplicatii in informatica.',
 '/resurse/img/galerie/08-multimi.jpg',
 'Combinatorica', 'Expert', 52.99, 600, '2024-07-01', 'Albastru',
 'graf, arbore, algoritm, dijkstra, retea', FALSE, 'A1 print', 90, 'expozitie educationala'),

('Functii Complexe',
 'Poster avansat despre functiile de variabila complexa: reprezentarea geometrica, transformari Mobius si seria Laurent. Ilustratii spectaculoase ale campurilor vectoriale complexe.',
 '/resurse/img/galerie/19-complexe.jpg',
 'Analiza', 'Expert', 64.99, 600, '2024-06-15', 'Rosu',
 'complex, imaginar, euler, transformare, serie', TRUE, 'A1 PDF', 730, 'institutie educationala'),

('Ecuatii Diferentiale',
 'Vizualizare a tipurilor principale de ecuatii diferentiale: ordinare, partiale si sisteme. Include campuri de directii, solutii exacte si interpretari fizice din mecanica si termodinamica.',
 '/resurse/img/galerie/12-limite.jpg',
 'Analiza', 'Expert', 57.99, 600, '2024-05-20', 'Verde',
 'diferential, ecuatie, mecanica, sistem, campuri', FALSE, 'A1 print', 90, 'expozitie educationala');
