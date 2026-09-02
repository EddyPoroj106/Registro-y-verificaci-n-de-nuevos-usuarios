const db = require('./database');

// Todas las funciones que tocan la tabla "usuarios" viven aqui.
// Adaptado para trabajar de forma asíncrona con MySQL (mysql2)

async function crearUsuario({ nombre, email, passwordHash, token, tokenExpira }) {
  const query = `
    INSERT INTO usuarios (nombre, email, password, verificado, token_verificacion, token_expira)
    VALUES (?, ?, ?, 0, ?, ?);
  `;
  const [resultado] = await db.query(query, [nombre, email, passwordHash, token, tokenExpira]);
  return resultado.insertId; // MySQL devuelve el ID generado aquí
}

async function buscarPorEmail(email) {
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  const [rows] = await db.query(query, [email]);
  return rows.length > 0 ? rows[0] : null; // Retorna el usuario o null si no existe
}

async function buscarPorToken(token) {
  const query = 'SELECT * FROM usuarios WHERE token_verificacion = ?';
  const [rows] = await db.query(query, [token]);
  return rows.length > 0 ? rows[0] : null; // Retorna el usuario o null si no existe
}

async function marcarComoVerificado(id) {
  const query = `
    UPDATE usuarios
    SET verificado = 1, token_verificacion = NULL, token_expira = NULL
    WHERE id = ?
  `;
  await db.query(query, [id]);
}

async function listarUsuarios() {
  const query = 'SELECT id, nombre, email, verificado, creado_en FROM usuarios';
  const [rows] = await db.query(query);
  return rows; // Retorna la lista de usuarios
}

module.exports = {
  crearUsuario,
  buscarPorEmail,
  buscarPorToken,
  marcarComoVerificado,
  listarUsuarios,
};
