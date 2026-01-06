// ===== CONFIGURACIÓN =====
const API_URL = 'http://localhost:5555/api/v1';

// ===== UTILIDADES =====
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `<span>${message}</span>`;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

function removeToken() {
    localStorage.removeItem('authToken');
}

function isAuthenticated() {
    return !!getToken();
}

// ===== LOGOUT =====
function logout() {
    removeToken();
    window.location.href = './login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

// ===== PROTECCIÓN DE RUTAS =====
function checkAuth() {
    let currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageWithoutExtension = currentPage.replace('.html', '');
    const publicPages = ['login', 'registro', 'recuperar', 'login.html', 'registro.html', 'recuperar.html'];
    const isPublicPage = publicPages.includes(currentPage) || publicPages.includes(pageWithoutExtension);

    if (!isAuthenticated() && !isPublicPage) {
        window.location.href = './login.html';
        return false;
    }

    return true;
}

if (!checkAuth()) {
    throw new Error('Acceso denegado');
}

// ===== LOGIN =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        if (!email || !password) {
            showAlert('Por favor completa todos los campos', 'error');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="loader"></span> Iniciando sesión...';

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contrasena: password })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data && data.data.accessToken) {
                    saveToken(data.data.accessToken);
                }
                showAlert('¡Bienvenido!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showAlert('Usuario o contraseña incorrecta', 'error');
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'Iniciar Sesión';
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión con el servidor', 'error');
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Iniciar Sesión';
        }
    });
}

// ===== REGISTRO =====
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre_usuario = document.getElementById('nombre_usuario').value;
        const nombres = document.getElementById('nombres').value;
        const apellidos = document.getElementById('apellidos').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const registerBtn = document.getElementById('registerBtn');

        if (!nombre_usuario || !nombres || !apellidos || !email || !password || !confirmPassword) {
            showAlert('Por favor completa todos los campos', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Las contraseñas no coinciden', 'error');
            return;
        }

        if (password.length < 8) {
            showAlert('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showAlert('La contraseña debe contener al menos una mayúscula, una minúscula y un número', 'error');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(nombre_usuario)) {
            showAlert('El nombre de usuario solo puede contener letras, números y guiones bajos', 'error');
            return;
        }

        if (nombre_usuario.length < 3) {
            showAlert('El nombre de usuario debe tener al menos 3 caracteres', 'error');
            return;
        }

        registerBtn.disabled = true;
        registerBtn.innerHTML = '<span class="loader"></span> Creando cuenta...';

        try {
            const response = await fetch(`${API_URL}/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_usuario,
                    nombres,
                    apellidos,
                    email,
                    contrasena: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data && data.data.accessToken) {
                    saveToken(data.data.accessToken);
                }
                showAlert('¡Cuenta creada exitosamente!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showAlert(data.message || 'Error al crear la cuenta', 'error');
                registerBtn.disabled = false;
                registerBtn.innerHTML = 'Crear Cuenta';
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión con el servidor', 'error');
            registerBtn.disabled = false;
            registerBtn.innerHTML = 'Crear Cuenta';
        }
    });
}

// ===== PERFIL =====
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    async function loadProfile() {
        try {
            const response = await fetch(`${API_URL}/usuarios/mi-perfil`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.ok) {
                const data = await response.json();
                const userData = data.data || data;

                document.getElementById('nombre_usuario').value = userData.nombre_usuario || '';
                document.getElementById('nombres').value = userData.nombres || '';
                document.getElementById('apellidos').value = userData.apellidos || '';
                document.getElementById('email').value = userData.email || '';

                const avatarInput = document.getElementById('url_avatar');
                const avatarPreview = document.getElementById('avatarPreview');
                if (avatarInput && userData.url_avatar) {
                    avatarInput.value = userData.url_avatar;
                }
                if (avatarPreview && userData.url_avatar) {
                    avatarPreview.src = userData.url_avatar;
                }
            } else {
                if (response.status === 401) {
                    logout();
                }
                showAlert('Error al cargar el perfil', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión con el servidor', 'error');
        }
    }

    loadProfile();

    const avatarInput = document.getElementById('url_avatar');
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('input', function () {
            avatarPreview.src = this.value || 'https://via.placeholder.com/150';
        });

        avatarPreview.addEventListener('error', function () {
            this.src = 'https://via.placeholder.com/150';
        });
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombres = document.getElementById('nombres').value;
        const apellidos = document.getElementById('apellidos').value;
        const email = document.getElementById('email').value;
        const url_avatar = document.getElementById('url_avatar')?.value || '';
        const updateBtn = document.getElementById('updateBtn');

        if (!nombres || !apellidos || !email) {
            showAlert('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        updateBtn.disabled = true;
        updateBtn.innerHTML = '<span class="loader"></span> Actualizando...';

        try {
            const response = await fetch(`${API_URL}/usuarios/mi-perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ nombres, apellidos, email, url_avatar })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Perfil actualizado exitosamente', 'success');
            } else {
                showAlert(data.message || 'Error al actualizar el perfil', 'error');
            }

            updateBtn.disabled = false;
            updateBtn.innerHTML = 'Actualizar Perfil';
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión con el servidor', 'error');
            updateBtn.disabled = false;
            updateBtn.innerHTML = 'Actualizar Perfil';
        }
    });
}

// ===== CAMBIAR CONTRASEÑA =====
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const changePasswordBtn = document.getElementById('changePasswordBtn');

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showAlert('Por favor completa todos los campos', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showAlert('Las contraseñas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showAlert('La nueva contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            showAlert('La contraseña debe contener al menos una mayúscula, una minúscula y un número', 'error');
            return;
        }

        changePasswordBtn.disabled = true;
        changePasswordBtn.innerHTML = '<span class="loader"></span> Cambiando...';

        try {
            const response = await fetch(`${API_URL}/usuarios/cambiar-contrasena`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    contrasenaActual: currentPassword,
                    contrasenaNueva: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Contraseña cambiada exitosamente', 'success');
                passwordForm.reset();
            } else {
                showAlert(data.message || 'Error al cambiar la contraseña', 'error');
            }

            changePasswordBtn.disabled = false;
            changePasswordBtn.innerHTML = 'Cambiar Contraseña';
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión con el servidor', 'error');
            changePasswordBtn.disabled = false;
            changePasswordBtn.innerHTML = 'Cambiar Contraseña';
        }
    });
}

// ===== LOGOUT CON CONFIRMACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                logout();
            }
        });
    }
});
