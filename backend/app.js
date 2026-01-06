const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/swagger/swagger.config");
const { errorHandler } = require("./src/middlewares/error.middleware");
const { models } = require("./src/models");

function buildApp() {
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
  app.use(express.urlencoded({ extended: true }));

  // Ruta de salud
  app.get("/health", (req, res) => {
    res.json({
      ok: true,
      api: "v1",
      proto: req.protocol,              // debería salir "https" si Apache pasa bien headers
      forwardedProto: req.get("x-forwarded-proto") || null
    });
  });

  // Documentación Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Rutas API v1 - Pasando models a cada router
  app.use('/api/v1/auth', require('./src/routes/v1/auth.routes')(models));
  app.use('/api/v1/usuarios', require('./src/routes/v1/usuarios.routes')(models));
  app.use('/api/v1/tareas', require('./src/routes/v1/tareas.routes')(models));
  app.use('/api/v1/recuperacion', require('./src/routes/v1/auth.recuperacion.routes')(models));

  // Ruta 404
  app.use((req, res) => {
    res.status(404).json({ 
      success: false,
      message: 'Ruta no encontrada',
      path: req.path,
      method: req.method
    });
  });

  // Middleware de manejo de errores (debe ir al final)
  app.use(errorHandler);

  return app;
}

module.exports = buildApp;