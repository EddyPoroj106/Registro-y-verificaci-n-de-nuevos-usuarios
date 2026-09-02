const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Crear la tabla si no existe (Sintaxis MySQL)
const inicializarBaseDatos = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      verificado BOOLEAN DEFAULT FALSE,
      token_verificacion VARCHAR(255),
      token_expira DATETIME,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Estructura de MySQL verificada/creada con éxito.');
  } catch (error) {
    console.error('Error al inicializar MySQL:', error);
  }
};

inicializarBaseDatos();

// Exportación usando el formato CommonJS compatible con tu repositorio
module.exports = pool;
