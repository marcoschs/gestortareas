let currentToken = null;

const tokenManager = {
  setToken(token) {
    currentToken = token;
    console.log('Token guardado automáticamente');
  },

  getToken() {
    return currentToken;
  },

  clearToken() {
    currentToken = null;
    console.log('Token eliminado');
  },

  hasToken() {
    return currentToken !== null;
  }
};

module.exports = tokenManager;