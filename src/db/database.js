const path = require('path');
const Database = require('better-sqlite3');

// La base de datos se guarda como un archivo local: database.sqlite
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new Database(dbPath);

// Creamos la tabla de usuarios si no existe todavia.
// - verificado: 0 = pendiente de confirmar correo, 1 = cuenta confirmada
// - token_verificacion: codigo unico que se envia por correo para confirmar la cuenta
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    verificado INTEGER NOT NULL DEFAULT 0,
    token_verificacion TEXT,
    token_expira TEXT,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
