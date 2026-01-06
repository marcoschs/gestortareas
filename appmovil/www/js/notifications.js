// ===== SISTEMA DE NOTIFICACIONES =====

// Estado de notificaciones
let notifications = [];
let notificationCheckInterval = null;

// ===== INICIALIZACIÓN =====
function initNotifications() {
    loadNotificationsFromStorage();
    setupNotificationEventListeners();
    startNotificationCheck();
    updateNotificationBadge();
}

// ===== ALMACENAMIENTO LOCAL =====
function saveNotificationsToStorage() {
    localStorage.setItem('taskNotifications', JSON.stringify(notifications));
}

function loadNotificationsFromStorage() {
    const stored = localStorage.setItem('taskNotifications');
    if (stored) {
        notifications = JSON.parse(stored);
    }
}

// ===== CREACIÓN DE NOTIFICACIONES =====
function createNotification(type, taskId, taskTitle, message, daysDelayed = null) {
    const notification = {
        id: Date.now(),
        type: type, // 'overdue', 'delayed', 'completed', 'info'
        taskId: taskId,
        taskTitle: taskTitle,
        message: message,
        daysDelayed: daysDelayed,
        timestamp: new Date().toISOString(),
        read: false
    };

    // Evitar duplicados
    const exists = notifications.some(n =>
        n.taskId === taskId && n.type === type && !n.read
    );

    if (!exists) {
        notifications.unshift(notification);
        saveNotificationsToStorage();
        updateNotificationBadge();
        renderNotifications();
    }

    return notification;
}

function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveNotificationsToStorage();
        updateNotificationBadge();
        renderNotifications();
    }
}

function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    saveNotificationsToStorage();
    updateNotificationBadge();
    renderNotifications();
}

function dismissNotification(notificationId) {
    notifications = notifications.filter(n => n.id !== notificationId);
    saveNotificationsToStorage();
    updateNotificationBadge();
    renderNotifications();
}

function clearAllNotifications() {
    if (confirm('¿Estás seguro de que deseas eliminar todas las notificaciones?')) {
        notifications = [];
        saveNotificationsToStorage();
        updateNotificationBadge();
        renderNotifications();
    }
}

// ===== VERIFICACIÓN DE TAREAS =====
function checkTasksForNotifications() {
    if (typeof tasks === 'undefined' || !tasks) return;

    const now = new Date();

    tasks.forEach(task => {
        if (task.completada) {
            // Notificación de tarea completada (solo si fue completada recientemente)
            const completedDate = task.fechaCompletada ? new Date(task.fechaCompletada) : null;
            if (completedDate) {
                const hoursSinceCompletion = (now - completedDate) / (1000 * 60 * 60);
                if (hoursSinceCompletion < 1) { // Menos de 1 hora
                    createNotification(
                        'completed',
                        task.id,
                        task.titulo,
                        '¡Felicidades! Has completado esta tarea.'
                    );
                }
            }
        } else if (task.fechaVencimiento) {
            const dueDate = new Date(task.fechaVencimiento);
            const timeDiff = dueDate - now;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

            // Tarea caducada
            if (timeDiff < 0) {
                const daysOverdue = Math.abs(daysDiff);
                createNotification(
                    'overdue',
                    task.id,
                    task.titulo,
                    `Esta tarea está vencida desde hace ${daysOverdue} día${daysOverdue !== 1 ? 's' : ''}.`,
                    daysOverdue
                );
            }
            // Tarea próxima a vencer (1 día)
            else if (daysDiff === 0 || daysDiff === 1) {
                createNotification(
                    'delayed',
                    task.id,
                    task.titulo,
                    `Esta tarea vence ${daysDiff === 0 ? 'hoy' : 'mañana'}.`,
                    0
                );
            }
        }
    });
}

function startNotificationCheck() {
    // Verificar cada 5 minutos
    notificationCheckInterval = setInterval(checkTasksForNotifications, 5 * 60 * 1000);
    // Verificar inmediatamente
    checkTasksForNotifications();
}

function stopNotificationCheck() {
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
    }
}

// ===== RENDERIZADO =====
function renderNotifications() {
    const container = document.getElementById('notificationBody');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = `
      <div class="notification-empty">
        <div class="notification-empty-icon">🔔</div>
        <p>No tienes notificaciones</p>
      </div>
    `;
        return;
    }

    container.innerHTML = notifications.map(notification => {
        const icon = getNotificationIcon(notification.type);
        const time = getRelativeTime(notification.timestamp);

        return `
      <div class="notification-item ${notification.type} ${notification.read ? '' : 'unread'}" 
           onclick="viewNotification(${notification.id})">
        <div class="notification-icon">${icon}</div>
        <div class="notification-title">${getNotificationTitle(notification.type)}</div>
        <div class="notification-task-title">${escapeHtml(notification.taskTitle)}</div>
        <div class="notification-message">${escapeHtml(notification.message)}</div>
        <div class="notification-time">⏱️ ${time}</div>
        <div class="notification-actions">
          <button class="notification-btn notification-btn-view" onclick="event.stopPropagation(); goToTask(${notification.taskId})">
            Ver tarea
          </button>
          <button class="notification-btn notification-btn-dismiss" onclick="event.stopPropagation(); dismissNotification(${notification.id})">
            Descartar
          </button>
        </div>
      </div>
    `;
    }).join('');
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// ===== FUNCIONES AUXILIARES =====
function getNotificationIcon(type) {
    switch (type) {
        case 'overdue': return '🚨';
        case 'delayed': return '⏰';
        case 'completed': return '🎉';
        case 'info': return 'ℹ️';
        default: return '🔔';
    }
}

function getNotificationTitle(type) {
    switch (type) {
        case 'overdue': return 'Tarea Vencida';
        case 'delayed': return 'Tarea Próxima a Vencer';
        case 'completed': return 'Tarea Completada';
        case 'info': return 'Información';
        default: return 'Notificación';
    }
}

function getRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return then.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== INTERACCIONES =====
function viewNotification(notificationId) {
    markAsRead(notificationId);
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && notification.taskId) {
        goToTask(notification.taskId);
    }
}

function goToTask(taskId) {
    closeNotificationPanel();
    // Scroll a la tarea o abrir modal de edición
    if (typeof editTask === 'function') {
        setTimeout(() => editTask(taskId), 300);
    }
}

// ===== PANEL DE NOTIFICACIONES =====
function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    const overlay = document.querySelector('.notification-overlay') || createOverlay();

    if (panel.classList.contains('active')) {
        closeNotificationPanel();
    } else {
        panel.classList.add('active');
        overlay.classList.add('active');
        renderNotifications();
    }
}

function closeNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    const overlay = document.querySelector('.notification-overlay');
    panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    overlay.addEventListener('click', closeNotificationPanel);
    document.body.appendChild(overlay);
    return overlay;
}

// ===== EVENT LISTENERS =====
function setupNotificationEventListeners() {
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationPanel();
        });
    }

    const closeBtn = document.getElementById('closeNotificationPanel');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNotificationPanel);
    }
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}
