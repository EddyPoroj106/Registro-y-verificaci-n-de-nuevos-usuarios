const db = require('./database');

// Todas las funciones que tocan la tabla "usuarios" viven aqui.
// Esto es lo que en el diagrama de clases seria la clase "UsuarioRepository" o "UsuarioDAO".

function crearUsuario({ nombre, email, passwordHash, token, tokenExpira }) {
  const stmt = db.prepare(`
    INSERT INTO usuarios (nombre, email, password, verificado, token_verificacion, token_expira)
    VALUES (?, ?, ?, 0, ?, ?)
  `);
  const info = stmt.run(nombre, email, passwordHash, token, tokenExpira);
  return info.lastInsertRowid;
}

function buscarPorEmail(email) {
  return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
}

function buscarPorToken(token) {
  return db.prepare('SELECT * FROM usuarios WHERE token_verificacion = ?').get(token);
}

function marcarComoVerificado(id) {
  db.prepare(`
    UPDATE usuarios
    SET verificado = 1, token_verificacion = NULL, token_expira = NULL
    WHERE id = ?
  `).run(id);
}

function listarUsuarios() {
  return db.prepare('SELECT id, nombre, email, verificado, creado_en FROM usuarios').all();
}

module.exports = {
  crearUsuario,
  buscarPorEmail,
  buscarPorToken,
  marcarComoVerificado,
  listarUsuarios,
};
