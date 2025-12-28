const fs = require("fs");
const http = require("http");
const https = require("https");
require("dotenv").config();

const { syncDb, models } = require("./models");
const buildApp = require("./app");

async function main() {
  await syncDb();
  const app = buildApp(models);

  const port = Number(process.env.PORT || 5555);
  const sslEnabled = String(process.env.SSL_ENABLED || "").toLowerCase() === "true";

  if (sslEnabled) {
    const keyPath = process.env.SSL_KEY_PATH;
    const certPath = process.env.SSL_CERT_PATH;

    if (!keyPath || !certPath) {
      throw new Error("SSL_ENABLED=true pero faltan SSL_KEY_PATH y/o SSL_CERT_PATH");
    }

    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    https.createServer(options, app).listen(port, "0.0.0.0", () => {
      console.log(`HTTPS API running on https://0.0.0.0:${port}`);
    });
  } else {
    http.createServer(app).listen(port, "0.0.0.0", () => {
      console.log(`HTTP API running on http://0.0.0.0:${port}`);
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
