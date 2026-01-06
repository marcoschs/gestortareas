const crypto = require('crypto');
const bcrypt = require('bcryptjs');

module.exports = (models) => {
  const { Usuario, TokenRecuperacionContrasena } = models;
  const emailService = require('../services/email.service');

  return {

    // Solicitar recuperación de contraseña
    solicitarRecuperacion: async (req, res, next) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({
            success: false,
            message: 'El email es requerido'
          });
        }

        // Buscar usuario
        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
          return res.json({
            success: true,
            message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
          });
        }

        // Verificar que el usuario esté activo
        if (!usuario.esta_activo) {
          return res.json({
            success: true,
            message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
          });
        }

        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');
        
        // Calcular fecha de expiración (10 minutos desde ahora)
        const fechaExpiracion = new Date();
        fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 10);

        // Invalidar tokens anteriores del usuario
        await TokenRecuperacionContrasena.update(
          { usado: true },
          { 
            where: { 
              usuario_id: usuario.id,
              usado: false 
            } 
          }
        );

        // Crear nuevo token
        await TokenRecuperacionContrasena.create({
          usuario_id: usuario.id,
          token,
          fecha_expiracion: fechaExpiracion,
          usado: false
        });

        // Enviar email
        await emailService.enviarRecuperacionContrasena(
          email,
          token,
          usuario.nombre_usuario
        );

        res.json({
          success: true,
          message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
        });
      } catch (error) {
        next(error);
      }
    },

    // Verificar si un token es válido
    verificarToken: async (req, res, next) => {
      try {
        const { token } = req.params;

        const tokenRecuperacion = await TokenRecuperacionContrasena.findOne({
          where: {
            token,
            usado: false
          },
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'email', 'nombre_usuario']
          }]
        });

        if (!tokenRecuperacion) {
          return res.status(400).json({
            success: false,
            message: 'Token inválido o ya utilizado'
          });
        }

        // Verificar si el token expiró
        if (new Date() > new Date(tokenRecuperacion.fecha_expiracion)) {
          return res.status(400).json({
            success: false,
            message: 'El token ha expirado. Solicita uno nuevo'
          });
        }

        res.json({
          success: true,
          message: 'Token válido',
          data: {
            email: tokenRecuperacion.usuario.email
          }
        });
      } catch (error) {
        next(error);
      }
    },

    // Restablecer contraseña
    restablecerContrasena: async (req, res, next) => {
      try {
        const { token, nueva_contrasena } = req.body;

        if (!token || !nueva_contrasena) {
          return res.status(400).json({
            success: false,
            message: 'Token y nueva contraseña son requeridos'
          });
        }

        // Validar longitud de contraseña
        if (nueva_contrasena.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener al menos 6 caracteres'
          });
        }

        // Buscar token
        const tokenRecuperacion = await TokenRecuperacionContrasena.findOne({
          where: {
            token,
            usado: false
          },
          include: [{
            model: Usuario,
            as: 'usuario'
          }]
        });

        if (!tokenRecuperacion) {
          return res.status(400).json({
            success: false,
            message: 'Token inválido o ya utilizado'
          });
        }

        // Verificar expiración
        if (new Date() > new Date(tokenRecuperacion.fecha_expiracion)) {
          return res.status(400).json({
            success: false,
            message: 'El token ha expirado. Solicita uno nuevo'
          });
        }

        // Actualizar contraseña del usuario
        await tokenRecuperacion.usuario.update({
          contrasena: nueva_contrasena
        });

        // Marcar token como usado
        await tokenRecuperacion.update({ usado: true });

        // Enviar email de confirmación
        await emailService.enviarConfirmacionCambioContrasena(
          tokenRecuperacion.usuario.email,
          tokenRecuperacion.usuario.nombre_usuario
        );

        res.json({
          success: true,
          message: 'Contraseña restablecida exitosamente'
        });
      } catch (error) {
        console.error('Error en restablecerContrasena:', error);
        next(error);
      }
    }
  };
};