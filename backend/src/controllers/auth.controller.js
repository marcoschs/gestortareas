const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const tokenManager = require("../middlewares/tokenManager");

module.exports = (models) => {
  const { Usuario, RefreshToken } = models;

  return {

    // Registrar nuevo usuario
    registro: async (req, res, next) => {
      try {
        const { nombre_usuario, email, contrasena, nombres, apellidos } = req.body;

        // Validar campos requeridos
        if (!nombre_usuario || !email || !contrasena || !nombres || !apellidos) {
          return res.status(400).json({
            success: false,
            message: "Nombre de usuario, email, contraseña, nombres y apellidos son requeridos"
          });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: "Formato de email inválido"
          });
        }

        // Validar longitud de contraseña
        if (contrasena.length < 6) {
          return res.status(400).json({
            success: false,
            message: "La contraseña debe tener al menos 6 caracteres"
          });
        }

        // Verificar si el usuario ya existe
        const usuarioExiste = await Usuario.findOne({
          where: { email: email.toLowerCase().trim() }
        });

        if (usuarioExiste) {
          return res.status(400).json({
            success: false,
            message: "El email ya está registrado"
          });
        }

        const nombreUsuarioExiste = await Usuario.findOne({
          where: { nombre_usuario }
        });

        if (nombreUsuarioExiste) {
          return res.status(400).json({
            success: false,
            message: "El nombre de usuario ya está en uso"
          });
        }

        // Crear usuario (el hook beforeCreate hasheará la contraseña)
        const nuevoUsuario = await Usuario.create({
          nombre_usuario,
          email: email.toLowerCase().trim(),
          contrasena: contrasena, // Envia sin hashear, el hook la hashea
          nombres: nombres || null,
          apellidos: apellidos || null,
          esta_activo: true,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        });

        // Generar tokens
        const accessToken = jwt.sign(
          { id: nuevoUsuario.id, email: nuevoUsuario.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || "30m" }
        );

        const refreshToken = jwt.sign(
          { id: nuevoUsuario.id },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
        );

        // Guardar refresh token en BD
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

        await RefreshToken.create({
          usuario_id: nuevoUsuario.id,
          token: refreshToken,
          fecha_expiracion: fechaExpiracion,
          fecha_creacion: new Date()
        });

        // Guardar token automáticamente
        tokenManager.setToken(accessToken);

        res.status(201).json({
          success: true,
          message: "Usuario registrado exitosamente",
          data: {
            usuario: {
              id: nuevoUsuario.id,
              nombre_usuario: nuevoUsuario.nombre_usuario,
              email: nuevoUsuario.email,
              nombres: nuevoUsuario.nombres,
              apellidos: nuevoUsuario.apellidos
            },
            accessToken,
            refreshToken,
            autoSaved: true
          }
        });
      } catch (error) {
        console.error("Error en registro:", error);
        next(error);
      }
    },

    // Login
    login: async (req, res, next) => {
      try {
        const { email, contrasena } = req.body;

        // Validar campos requeridos
        if (!email || !contrasena) {
          return res.status(400).json({
            success: false,
            message: "Email y contraseña son requeridos"
          });
        }

        // Buscar usuario (normalizar email)
        const usuario = await Usuario.findOne({
          where: { 
            email: email.toLowerCase().trim(),
            esta_activo: true 
          }
        });

        if (!usuario) {
          return res.status(401).json({
            success: false,
            message: "Credenciales inválidas"
          });
        }

        // Verificar que la contraseña en BD esté hasheada
        if (!usuario.contrasena || !usuario.contrasena.startsWith('$2')) {
          return res.status(500).json({
            success: false,
            message: "Error en la configuración de la cuenta. Contacte al administrador"
          });
        }

        // Verificar contraseña
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!contrasenaValida) {
          return res.status(401).json({
            success: false,
            message: "Credenciales inválidas"
          });
        }

        // Limpiar tokens expirados del usuario
        await RefreshToken.destroy({
          where: {
            usuario_id: usuario.id,
            fecha_expiracion: {
              [Op.lt]: new Date()
            }
          }
        });

        // Generar tokens
        const accessToken = jwt.sign(
          { id: usuario.id, email: usuario.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || "30m" }
        );

        const refreshToken = jwt.sign(
          { id: usuario.id },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
        );

        // Guardar refresh token en BD
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

        await RefreshToken.create({
          usuario_id: usuario.id,
          token: refreshToken,
          fecha_expiracion: fechaExpiracion,
          fecha_creacion: new Date()
        });

        // Actualizar última fecha de acceso
        await usuario.update({
          fecha_actualizacion: new Date()
        });

        // Guardar token automáticamente
        tokenManager.setToken(accessToken);

        res.json({
          success: true,
          message: "Login exitoso",
          data: {
            usuario: {
              id: usuario.id,
              nombre_usuario: usuario.nombre_usuario,
              email: usuario.email,
              nombres: usuario.nombres,
              apellidos: usuario.apellidos
            },
            accessToken,
            refreshToken,
            autoSaved: true
          }
        });
      } catch (error) {
        next(error);
      }
    },

    // Refrescar access token
    refrescarToken: async (req, res, next) => {
      try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
          return res.status(400).json({
            success: false,
            message: "Refresh token es requerido"
          });
        }

        // Verificar refresh token en BD
        const tokenData = await RefreshToken.findOne({
          where: { token: refreshToken }
        });

        if (!tokenData) {
          return res.status(401).json({
            success: false,
            message: "Refresh token inválido"
          });
        }

        // Verificar si expiró
        if (new Date() > new Date(tokenData.fecha_expiracion)) {
          await tokenData.destroy();
          return res.status(401).json({
            success: false,
            message: "Refresh token expirado"
          });
        }

        // Verificar JWT
        let decoded;
        try {
          decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
          await tokenData.destroy();
          return res.status(401).json({
            success: false,
            message: "Refresh token inválido"
          });
        }

        // Verificar que el usuario aún existe y está activo
        const usuario = await Usuario.findOne({
          where: { 
            id: decoded.id,
            esta_activo: true 
          }
        });

        if (!usuario) {
          await tokenData.destroy();
          return res.status(401).json({
            success: false,
            message: "Usuario no encontrado o inactivo"
          });
        }

        // Generar nuevo access token
        const accessToken = jwt.sign(
          { id: decoded.id, email: usuario.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || "30m" }
        );

        // Guardar token automáticamente
        tokenManager.setToken(accessToken);

        res.json({
          success: true,
          message: "Token refrescado exitosamente",
          data: {
            accessToken,
            autoSaved: true
          }
        });
      } catch (error) {
        console.error("Error al refrescar token:", error);
        next(error);
      }
    },

    // Logout (revoca el refresh token)
    logout: async (req, res, next) => {
      try {
        const { refreshToken } = req.body;

        if (refreshToken) {
          await RefreshToken.destroy({
            where: { token: refreshToken }
          });
        }

        // Limpiar token guardado
        tokenManager.clearToken();

        res.json({
          success: true,
          message: "Logout exitoso"
        });
      } catch (error) {
        console.error("Error en logout:", error);
        next(error);
      }
    },

    // Logout de todas las sesiones
    logoutTodo: async (req, res, next) => {
      try {
        const usuario_id = req.usuario.id;

        await RefreshToken.destroy({
          where: { usuario_id }
        });

        // Limpiar token guardado
        tokenManager.clearToken();

        res.json({
          success: true,
          message: "Todas las sesiones cerradas exitosamente"
        });
      } catch (error) {
        console.error("Error en logout todo:", error);
        next(error);
      }
    },

    // Obtener perfil del usuario autenticado
    obtenerPerfil: async (req, res, next) => {
      try {
        const usuario = await Usuario.findByPk(req.usuario.id, {
          attributes: { exclude: ["contrasena"] }
        });

        if (!usuario) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado"
          });
        }

        res.json({
          success: true,
          data: usuario
        });
      } catch (error) {
        console.error("Error al obtener perfil:", error);
        next(error);
      }
    },

    // Actualizar perfil del usuario autenticado
    actualizarPerfil: async (req, res, next) => {
      try {
        const { nombres, apellidos, nombre_usuario, email } = req.body;
        const usuario_id = req.usuario.id;

        const usuario = await Usuario.findByPk(usuario_id);

        if (!usuario) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado"
          });
        }

        // Si se quiere cambiar el nombre de usuario, verificar que no exista
        if (nombre_usuario && nombre_usuario !== usuario.nombre_usuario) {
          const nombreExiste = await Usuario.findOne({
            where: { nombre_usuario }
          });

          if (nombreExiste) {
            return res.status(400).json({
              success: false,
              message: "El nombre de usuario ya está en uso"
            });
          }
        }
        if (email && email.toLowerCase() !== usuario.email) {
              const emailExiste = await Usuario.findOne({
                where: { email: email.toLowerCase().trim() }
              });

            if (emailExiste) {
              return res.status(400).json({
                 success: false,
                message: "El email ya está registrado"
              });
            }
        }

        // Actualizar datos
        await usuario.update({
          nombres: nombres !== undefined ? nombres : usuario.nombres,
          apellidos: apellidos !== undefined ? apellidos : usuario.apellidos,
          nombre_usuario: nombre_usuario || usuario.nombre_usuario,
          email: email ? email.toLowerCase().trim() : usuario.email,
          fecha_actualizacion: new Date()
        });

        // Obtener usuario actualizado sin la contraseña
        const usuarioActualizado = await Usuario.findByPk(usuario_id, {
          attributes: { exclude: ["contrasena"] }
        });

        res.json({
          success: true,
          message: "Perfil actualizado exitosamente",
          data: usuarioActualizado
        });
      } catch (error) {
        next(error);
      }
    },

    // Cambiar contraseña
    cambiarContrasena: async (req, res, next) => {
      try {
        const { contrasenaActual, contrasenaNueva } = req.body;
        const usuario_id = req.usuario.id;

        if (!contrasenaActual || !contrasenaNueva) {
          return res.status(400).json({
            success: false,
            message: "Contraseña actual y nueva son requeridas"
          });
        }

        if (contrasenaNueva.length < 6) {
          return res.status(400).json({
            success: false,
            message: "La nueva contraseña debe tener al menos 6 caracteres"
          });
        }

        const usuario = await Usuario.findByPk(usuario_id);

        if (!usuario) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado"
          });
        }

        // Verificar contraseña actual
        const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);

        if (!contrasenaValida) {
          return res.status(401).json({
            success: false,
            message: "Contraseña actual incorrecta"
          });
        }

        // Actualizar contraseña (el hook beforeUpdate la hasheará)
        await usuario.update({
          contrasena: contrasenaNueva, // Envia sin hashear, el hook la hashea
          fecha_actualizacion: new Date()
        });

        // Cerrar todas las sesiones anteriores
        await RefreshToken.destroy({
          where: { usuario_id }
        });

        res.json({
          success: true,
          message: "Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente"
        });
      } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        next(error);
      }
    },

    // TEMPORAL: Resetear contraseña de usuario (QUITAR EN PRODUCCIÓN)
    resetearContrasena: async (req, res, next) => {
      try {
        const { email, nuevaContrasena } = req.body;

        if (!email || !nuevaContrasena) {
          return res.status(400).json({
            success: false,
            message: "Email y nueva contraseña son requeridos"
          });
        }

        const usuario = await Usuario.findOne({
          where: { email: email.toLowerCase().trim() }
        });

        if (!usuario) {
          return res.status(404).json({
            success: false,
            message: "Usuario no encontrado"
          });
        }

        // El modelo hashea automáticamente con beforeUpdate hook
        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(nuevaContrasena, salt);

        // Actualizar (el hook beforeUpdate la hasheará)
        await usuario.update({
          contrasena: nuevaContrasena, // Envia sin hashear, el hook la hashea
          fecha_actualizacion: new Date()
        });

        // Eliminar todas las sesiones
        await RefreshToken.destroy({
          where: { usuario_id: usuario.id }
        });

        res.json({
          success: true,
          message: "Contraseña reseteada exitosamente"
        });
      } catch (error) {
        console.error("Error al resetear contraseña:", error);
        next(error);
      }
    }
  };
};