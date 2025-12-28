const express = require("express");
const cors = require("cors");
require("dotenv").config();

module.exports = (models) => {
  const app = express();

  // ✅ CORS compatible con Cordova (origin null/file://) y con navegadores
  const corsOptions = {
    origin: true, // refleja el Origin del cliente (incluye null)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
    credentials: false
  };

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(express.json());

  // Health
  app.get("/api/v1/health", (req, res) => {
    res.json({
      ok: true,
      api: "v1",
      proto: req.protocol,              // debería salir "https" si Apache pasa bien headers
      forwardedProto: req.get("x-forwarded-proto") || null
    });
  });

  // API v1
  const v1 = express.Router();
  v1.use("/books", require("./routes/v1/books.routes")(models));
  app.use("/api/v1", v1);

  app.use((req, res) => res.status(404).json({ message: "Not found" }));
  return app;
};
