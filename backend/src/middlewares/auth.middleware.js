const jwt = require("jsonwebtoken");
const tokenManager = require("./tokenManager");

const verificarToken = (req, res, next) => {
  try {
    // Intentar obtener token del header Authorization
    let token = req.headers.authorization;

    // Si no hay token en el header, usar el token guardado automáticamente
    if (!token && tokenManager.hasToken()) {
      token = `Bearer ${tokenManager.getToken()}`;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No se proporcionó token de autenticación"
      });
    }

    // Extraer token del formato "Bearer <token>"
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar usuario al request
    req.usuario = decoded;
    
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado"
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Error al verificar token"
    });
  }
};

module.exports = { verificarToken };