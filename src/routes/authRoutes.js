const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const usuarioModel = require('../db/usuarioModel');
const { enviarCorreoVerificacion } = require('../services/emailService');

const router = express.Router();

// POST /api/registro
// Recibe { nombre, email, password } y crea el usuario en la base de datos.
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos: nombre, email y password son obligatorios' });
    }

    const yaExiste = usuarioModel.buscarPorEmail(email);
    if (yaExiste) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }

    // 1. Encriptamos la contraseña (nunca se guarda en texto plano)
    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Generamos un token unico y aleatorio para verificar el correo
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpira = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // expira en 1 hora

    // 3. Guardamos el usuario como "no verificado"
    const id = usuarioModel.crearUsuario({ nombre, email, passwordHash, token, tokenExpira });

    // 4. Enviamos el correo con el enlace de verificacion
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const enlaceVerificacion = `${baseUrl}/api/verificar/${token}`;

    await enviarCorreoVerificacion({ destinatario: email, nombre, enlaceVerificacion });

    return res.status(201).json({
      mensaje: 'Usuario registrado. Revisa tu correo para verificar tu cuenta.',
      usuarioId: id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno al registrar el usuario' });
  }
});

// GET /api/verificar/:token
// El usuario llega aqui haciendo clic en el enlace que le llego por correo.
router.get('/verificar/:token', (req, res) => {
  const { token } = req.params;

  const usuario = usuarioModel.buscarPorToken(token);

  if (!usuario) {
    return res.status(400).send('<h2>Enlace invalido o ya utilizado.</h2>');
  }

  const yaExpiro = new Date(usuario.token_expira) < new Date();
  if (yaExpiro) {
    return res.status(400).send('<h2>El enlace de verificacion expiro. Registrate de nuevo.</h2>');
  }

  usuarioModel.marcarComoVerificado(usuario.id);

  return res.send('<h2>Cuenta verificada correctamente. Ya puedes iniciar sesion.</h2>');
});

// GET /api/usuarios  (solo para revisar en el navegador que todo funciona)
router.get('/usuarios', (req, res) => {
  res.json(usuarioModel.listarUsuarios());
});

module.exports = router;
