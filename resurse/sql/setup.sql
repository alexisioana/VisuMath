-- ETAPA6-DB - setup baza de date PostgreSQL
-- VisuMath - Setup baza de date PostgreSQL
-- Rulati ca superuser (postgres):
-- psql -U postgres -f setup.sql

-- 1. Creare baza de date
CREATE DATABASE visumath_db
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'Romanian_Romania.1250'
    LC_CTYPE = 'Romanian_Romania.1250'
    TEMPLATE = template0;

-- 2. Creare utilizator aplicatie
CREATE USER visumath_user WITH ENCRYPTED PASSWORD 'visumath2026';

-- 3. Drepturi pe baza de date
GRANT CONNECT ON DATABASE visumath_db TO visumath_user;

-- Conectati-va la baza de date inainte de a continua:
\connect visumath_db

-- ETAPA6-DB - categorie mare prin ENUM
-- 4. Tipuri ENUM
CREATE TYPE categorie_matematica AS ENUM (
    'Algebra',
    'Geometrie',
    'Analiza',
    'Statistica',
    'Combinatorica'
);

CREATE TYPE nivel_dificultate AS ENUM (
    'Incepator',
    'Intermediar',
    'Avansat',
    'Expert'
);

CREATE TYPE culoare_dominanta AS ENUM (
    'Albastru',
    'Rosu',
    'Verde',
    'Negru',
    'Alb'
);

-- ETAPA6-DB - tabel produse cu toate proprietatile cerute
-- 5. Creare tabel produse
CREATE TABLE produse (
    id              SERIAL PRIMARY KEY,
    nume            VARCHAR(200)            NOT NULL,
    descriere       TEXT                    NOT NULL,
    imagine         VARCHAR(500)            NOT NULL,
    categorie       categorie_matematica    NOT NULL,
    nivel           nivel_dificultate       NOT NULL,
    pret            DECIMAL(8,2)            NOT NULL,
    rezolutie       INTEGER                 NOT NULL,
    data_adaugare   DATE                    NOT NULL,
    culoare         culoare_dominanta       NOT NULL,
    etichete        VARCHAR(500)            NOT NULL,
    descarcabil     BOOLEAN                 NOT NULL DEFAULT FALSE,
    format_print    VARCHAR(30)             NOT NULL,
    durata_acces    INTEGER                 NOT NULL,
    licenta         VARCHAR(100)            NOT NULL
);

-- 6. Drepturi pe tabel
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE produse TO visumath_user;
GRANT USAGE, SELECT ON SEQUENCE produse_id_seq TO visumath_user;

-- 7. Drepturi pe tipurile ENUM (necesare pentru INSERT)
GRANT USAGE ON TYPE categorie_matematica TO visumath_user;
GRANT USAGE ON TYPE nivel_dificultate TO visumath_user;
GRANT USAGE ON TYPE culoare_dominanta TO visumath_user;
