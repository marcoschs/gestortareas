const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gestor de Tareas",
      version: "1.0.0",
      description: "API REST para gestión de tareas con autenticación JWT",
      contact: {
        name: "API Support",
        email: "support@gestortareas.com"
      }
    },
    servers: [
      {
        url: "http://localhost:5555",
        description: "Servidor de desarrollo"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Ingrese su token JWT en el formato: Bearer {token}"
        }
      },
      schemas: {
        Usuario: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            nombre_usuario: { type: "string", example: "marcosch" },
            email: { type: "string", example: "marcos@gmail.com" },
            nombres: { type: "string", example: "Marcos Vinicio" },
            apellidos: { type: "string", example: "Chavez Saltos" },
            esta_activo: { type: "boolean", example: true },
            fecha_creacion: { type: "string", format: "date-time" },
            fecha_actualizacion: { type: "string", format: "date-time" }
          }
        },
        Tarea: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            usuario_id: { type: "integer", example: 1 },
            titulo: { type: "string", example: "Completar proyecto" },
            descripcion: { type: "string", example: "Finalizar el backend del gestor de tareas" },
            estado: { type: "string", enum: ["pendiente", "en_progreso", "completada"], example: "en_progreso" },
            prioridad: { type: "string", enum: ["baja", "media", "alta", "urgente"], example: "alta" },
            fecha_vencimiento: { type: "string", format: "date-time", nullable: true },
            fecha_recordatorio: { type: "string", format: "date-time", nullable: true },
            fecha_completada: { type: "string", format: "date-time", nullable: true },
            numero_orden: { type: "integer", example: 0 },
            esta_archivada: { type: "boolean", example: false },
            fecha_creacion: { type: "string", format: "date-time" },
            fecha_actualizacion: { type: "string", format: "date-time" }
          }
        },
        Error: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: false },
            message: { type: "string", example: "Mensaje de error" },
            errors: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  campo: { type: "string" },
                  mensaje: { type: "string" }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: "Token no proporcionado o inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error"
              }
            }
          }
        },
        NotFoundError: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error"
              }
            }
          }
        },
        ValidationError: {
          description: "Error de validación",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error"
              }
            }
          }
        }
      }
    },
  },
  apis: ["./src/routes/v1/*.js"] // Archivos donde buscar anotaciones JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;