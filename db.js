const { Pool } = require('pg');

// ETAPA6-DB - conexiune PostgreSQL folosita de aplicatie
const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'visumath_db',
    user:     process.env.DB_USER     || 'visumath_user',
    password: process.env.DB_PASS     || 'visumath2026',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('[DB] Eroare neasteptata pe clientul inactiv:', err.message);
});

async function query(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
}

// Returnează valorile ENUM pentru o coloană dată
async function getEnumValues(enumName) {
    // ETAPA6-MENIU - citire valori ENUM pentru submeniul Produse
    const result = await query(
        `SELECT unnest(enum_range(NULL::${enumName}))::text AS val`
    );
    return result.rows.map(r => r.val);
}

module.exports = { query, getEnumValues, pool };
