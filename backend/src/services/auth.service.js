const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { calcularFechaExpiracion } = require("../utils/helpers");

// Genera un access token JWT
const generarAccessToken = (usuario) => {
  const payload = {
    id: usuario.id,
    nombre_usuario: usuario.nombre_usuario,
    email: usuario.email
  };

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

// Genera un refresh token JWT
const generarRefreshToken = (usuario) => {
  const payload = {
    id: usuario.id,
    tipo: "refresh"
  };

  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn
  });
};

// Genera ambos tokens (access y refresh)
const generarTokens = (usuario) => {
  return {
    accessToken: generarAccessToken(usuario),
    refreshToken: generarRefreshToken(usuario)
  };
};

// Verifica un refresh token
const verificarRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret);
  } catch (error) {
    throw new Error("Refresh token inválido o expirado");
  }
};

//Guarda el refresh token en la base de datos
const guardarRefreshToken = async (RefreshToken, usuarioId, token) => {
  const fechaExpiracion = calcularFechaExpiracion(jwtConfig.refreshExpiresIn);
  
  await RefreshToken.create({
    usuario_id: usuarioId,
    token,
    fecha_expiracion: fechaExpiracion
  });
};

//Elimina refresh tokens expirados de un usuario
const limpiarRefreshTokensExpirados = async (RefreshToken, usuarioId) => {
  await RefreshToken.destroy({
    where: {
      usuario_id: usuarioId,
      fecha_expiracion: {
        [require("sequelize").Op.lt]: new Date()
      }
    }
  });
};

//Revoca un refresh token específico
const revocarRefreshToken = async (RefreshToken, token) => {
  await RefreshToken.destroy({
    where: { token }
  });
};

//Revoca todos los refresh tokens de un usuario
const revocarTodosRefreshTokens = async (RefreshToken, usuarioId) => {
  await RefreshToken.destroy({
    where: { usuario_id: usuarioId }
  });
};

module.exports = {
  generarAccessToken,
  generarRefreshToken,
  generarTokens,
  verificarRefreshToken,
  guardarRefreshToken,
  limpiarRefreshTokensExpirados,
  revocarRefreshToken,
  revocarTodosRefreshTokens
};