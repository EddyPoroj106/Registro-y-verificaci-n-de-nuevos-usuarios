const nodemailer = require('nodemailer');

// Este servicio crea el "transporter" (el conector que realmente envia el correo)
// usando las credenciales que pusiste en el archivo .env
//
// Si NO configuraste el .env todavia, el correo no se enviara de verdad,
// pero el enlace de verificacion se imprimira en la consola para que puedas
// probar el flujo igual (util mientras terminas de configurar tu cuenta de correo).

function crearTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // No hay configuracion de correo todavia
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true solo si usas el puerto 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function enviarCorreoVerificacion({ destinatario, nombre, enlaceVerificacion }) {
  const transporter = crearTransporter();

  const asunto = 'Verifica tu cuenta';
  const html = `
    <h2>Hola ${nombre}!</h2>
    <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
    <p><a href="${enlaceVerificacion}">${enlaceVerificacion}</a></p>
    <p>Este enlace expira en 1 hora.</p>
  `;

  if (!transporter) {
    console.log('\n=== SMTP no configurado: mostrando enlace en consola en su lugar ===');
    console.log(`Para: ${destinatario}`);
    console.log(`Enlace de verificacion: ${enlaceVerificacion}`);
    console.log('======================================================================\n');
    return { simulado: true };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: destinatario,
    subject: asunto,
    html,
  });

  return { simulado: false, messageId: info.messageId };
}

module.exports = { enviarCorreoVerificacion };
