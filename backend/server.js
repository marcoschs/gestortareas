const fs = require("fs");
const http = require("http");
const https = require("https");
require("dotenv").config();

const { syncDb, models } = require("./src/models");
const buildApp = require("./app");

const PORT = Number(process.env.PORT || 5555);

async function iniciarServidor() {
  try {
    await syncDb();
    console.log('Base de datos sincronizada correctamente');

    const app = buildApp(models);

    const sslEnabled =
      String(process.env.SSL_ENABLED || "").toLowerCase() === "true";

    if (sslEnabled) {
      // 🔐 HTTPS
      const keyPath = process.env.SSL_KEY_PATH;
      const certPath = process.env.SSL_CERT_PATH;

      if (!keyPath || !certPath) {
        throw new Error(
          "SSL_ENABLED=true pero faltan SSL_KEY_PATH y/o SSL_CERT_PATH"
        );
      }

      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };

      https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('HTTPS ACTIVO');
        console.log(`URL: https://localhost:${PORT}`);
        console.log(`Documentación: https://localhost:${PORT}/api-docs`);
        console.log(`Fecha: ${new Date().toLocaleString('es-ES')}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      });

    } else {
      // 🌐 HTTP
      http.createServer(app).listen(PORT, "0.0.0.0", () => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('HTTPS ACTIVO');
        console.log(`URL: https://localhost:${PORT}`);
        console.log(`Documentación: https://localhost:${PORT}/api-docs`);
        console.log(`Fecha: ${new Date().toLocaleString('es-ES')}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      });
    }

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Manejo de señales del sistema
process.on('SIGINT', () => {
  console.log('\nSIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nSIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Arranque
iniciarServidor();
