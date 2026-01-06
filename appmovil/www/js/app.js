// ===== CONFIGURACIÓN =====
// API_URL ya está definida en auth.js

// Estado de la aplicación
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// La autenticación ahora es manejada por auth.js

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alertClass = type === 'error' ? 'alert-danger' : `alert-${type}`;
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show`;
    alert.innerHTML = `
    ${escapeHtml(message)}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function isTaskOverdue(task) {
    if (!task.fecha_vencimiento || task.estado === 'completada') return false;
    return new Date(task.fecha_vencimiento) < new Date();
}

function getDaysUntilDue(task) {
    if (!task.fecha_vencimiento) return null;
    const now = new Date();
    const dueDate = new Date(task.fecha_vencimiento);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== GESTIÓN DEL MODAL =====
function openModal(task = null) {
    editingTaskId = task ? task.id : null;
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));

    if (task) {
        document.getElementById('modalTitle').textContent = 'Editar Tarea';
        document.getElementById('taskTitle').value = task.titulo || '';
        document.getElementById('taskDescription').value = task.descripcion || '';
        document.getElementById('taskStatus').value = task.estado || 'pendiente';
        document.getElementById('taskPriority').value = task.prioridad || 'media';
        document.getElementById('taskDueDate').value = formatDateForInput(task.fecha_vencimiento) || '';
        document.getElementById('taskReminderDate').value = formatDateForInput(task.fecha_recordatorio) || '';
        document.getElementById('saveTaskBtn').textContent = 'Actualizar Tarea';

        // Cargar etiquetas de la tarea
        if (typeof setTaskTags === 'function') {
            setTaskTags(task.tags || []);
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Nueva Tarea';
        document.getElementById('taskForm').reset();
        document.getElementById('saveTaskBtn').textContent = 'Guardar Tarea';

        // Limpiar etiquetas
        if (typeof clearSelectedTaskTags === 'function') {
            clearSelectedTaskTags();
        }
    }

    modal.show();
}

// ===== CRUD DE TAREAS =====
async function loadTasks() {
    try {
        // Filtrar tareas que no estén archivadas
        const response = await fetch(`${API_URL}/tareas?esta_archivada=false`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            // El backend devuelve { success, message, data: { tareas: [...] } }
            tasks = result.data?.tareas || result.data || result || [];
            renderTasks();
            updateStats();

            if (typeof checkTasksForNotifications === 'function') {
                checkTasksForNotifications();
            }
        } else {
            if (response.status === 401) {
                logout();
            } else {
                showAlert('Error al cargar las tareas', 'error');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor', 'error');
    }
}

async function createTask(titulo, descripcion, estado, prioridad, fecha_vencimiento, fecha_recordatorio, tags) {
    try {
        const response = await fetch(`${API_URL}/tareas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                titulo,
                descripcion,
                estado: estado || 'pendiente',
                prioridad: prioridad || 'media',
                fecha_vencimiento: fecha_vencimiento || null,
                fecha_recordatorio: fecha_recordatorio || null,
                tags: tags || []
            })
        });

        if (response.ok) {
            const result = await response.json();
            const newTask = result.data || result;
            tasks.push(newTask);
            renderTasks();
            updateStats();
            showAlert('¡Tarea creada exitosamente!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();

            if (typeof checkTasksForNotifications === 'function') {
                checkTasksForNotifications();
            }
        } else {
            const data = await response.json();
            showAlert(data.message || 'Error al crear la tarea', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor', 'error');
    }
}

async function updateTask(id, titulo, descripcion, estado, prioridad, fecha_vencimiento, fecha_recordatorio, tags) {
    try {
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                titulo,
                descripcion,
                estado: estado || 'pendiente',
                prioridad: prioridad || 'media',
                fecha_vencimiento: fecha_vencimiento || null,
                fecha_recordatorio: fecha_recordatorio || null,
                tags: tags || []
            })
        });

        if (response.ok) {
            const result = await response.json();
            const updatedTask = result.data || result;
            const index = tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                tasks[index] = updatedTask;
            }
            renderTasks();
            updateStats();
            showAlert('Tarea actualizada exitosamente', 'success');
            bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
        } else {
            const data = await response.json();
            showAlert(data.message || 'Error al actualizar la tarea', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor', 'error');
    }
}

async function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Alternar entre pendiente y completada
    const nuevoEstado = task.estado === 'completada' ? 'pendiente' : 'completada';

    try {
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                titulo: task.titulo,
                descripcion: task.descripcion,
                estado: nuevoEstado,
                prioridad: task.prioridad,
                fecha_vencimiento: task.fecha_vencimiento,
                fecha_recordatorio: task.fecha_recordatorio,
                tags: task.tags,
                fecha_completada: nuevoEstado === 'completada' ? new Date().toISOString() : null
            })
        });

        if (response.ok) {
            const result = await response.json();
            const updatedTask = result.data || result;
            const index = tasks.findIndex(t => t.id === id);
            if (index !== -1) {
                tasks[index] = updatedTask;
            }
            renderTasks();
            updateStats();
            showAlert(
                nuevoEstado === 'completada' ? '¡Tarea completada!' : 'Tarea marcada como pendiente',
                'success'
            );

            if (typeof checkTasksForNotifications === 'function') {
                checkTasksForNotifications();
            }
        } else {
            showAlert('Error al actualizar el estado', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor', 'error');
    }
}

// Variable para almacenar el ID de la tarea a eliminar
let taskToDeleteId = null;

async function deleteTask(id) {
    // Guardar el ID de la tarea a eliminar
    taskToDeleteId = id;

    // Mostrar el modal de confirmación
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    deleteModal.show();
}

// Función para confirmar la eliminación (archivado)
async function confirmDelete() {
    if (!taskToDeleteId) return;

    const id = taskToDeleteId;
    const task = tasks.find(t => t.id === id);
    taskToDeleteId = null;

    // Cerrar el modal
    const deleteModalEl = document.getElementById('deleteConfirmModal');
    const deleteModal = bootstrap.Modal.getInstance(deleteModalEl);
    if (deleteModal) {
        deleteModal.hide();
    }

    try {
        // Archivar la tarea en lugar de eliminarla permanentemente
        const response = await fetch(`${API_URL}/tareas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                titulo: task?.titulo,
                esta_archivada: true
            })
        });

        if (response.ok) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
            updateStats();
            showAlert('Tarea archivada exitosamente', 'success');
        } else {
            showAlert('Error al archivar la tarea', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor', 'error');
    }
}

// Configurar el listener del botón de confirmación de eliminación
document.addEventListener('DOMContentLoaded', () => {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
});

// ===== RENDERIZADO =====
// Función auxiliar para obtener el orden de prioridad
function getPriorityOrder(prioridad) {
    const order = { 'urgente': 0, 'alta': 1, 'media': 2, 'baja': 3 };
    return order[prioridad] ?? 4;
}

// Función para renderizar una sola tarjeta de tarea
function renderTaskCard(task) {
    const isOverdue = isTaskOverdue(task);
    const daysUntil = getDaysUntilDue(task);
    const taskTags = typeof renderTaskTags === 'function' ? renderTaskTags(task.tags) : '';

    let dueDateHtml = '';
    if (task.fecha_vencimiento && task.estado !== 'completada') {
        const dueDateClass = isOverdue ? 'overdue' : (daysUntil !== null && daysUntil <= 1 ? 'soon' : '');
        dueDateHtml = `
        <span class="task-due-date ${dueDateClass}">
          📅 ${formatDate(task.fecha_vencimiento)}
          ${isOverdue ? ` (Vencida hace ${Math.abs(daysUntil)} días)` : ''}
        </span>
      `;
    }

    return `
      <div class="col-md-6 col-lg-4">
        <div class="task-card ${task.estado === 'completada' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
          <div class="task-header">
            <div class="task-checkbox ${task.estado === 'completada' ? 'checked' : ''}" 
                 onclick="toggleTaskStatus(${task.id})">
            </div>
            <div class="task-content">
              <h3 class="task-title">${escapeHtml(task.titulo)}</h3>
            </div>
          </div>
          
          ${task.descripcion ? `<p class="task-description">${escapeHtml(task.descripcion)}</p>` : ''}
          
          <div class="task-meta">
            ${dueDateHtml}
            ${task.prioridad ? `<span class="task-priority ${task.prioridad}">${task.prioridad}</span>` : ''}
          </div>
          
          ${taskTags ? `<div class="task-tags">${taskTags}</div>` : ''}
          
          <div class="task-actions">
            <button class="task-btn task-btn-edit" onclick="editTask(${task.id})">
              ✏️ Editar
            </button>
            <button class="task-btn task-btn-delete" onclick="deleteTask(${task.id})">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
}

// Función para renderizar una sección de tareas
function renderTaskSection(title, icon, tasks, colorClass, collapsed = false) {
    if (tasks.length === 0) return '';

    const sectionId = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');

    return `
        <div class="task-section mb-4">
            <div class="task-section-header ${colorClass}" 
                 onclick="toggleSection('${sectionId}')" 
                 style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; 
                        padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 0.75rem;
                        background: rgba(255,255,255,0.05); border-left: 4px solid;">
                <span style="font-weight: 600; font-size: 1.1rem;">
                    ${icon} ${title} <span class="badge bg-secondary ms-2">${tasks.length}</span>
                </span>
                <span class="section-toggle" id="toggle-${sectionId}">${collapsed ? '▶' : '▼'}</span>
            </div>
            <div class="task-section-content row g-3" id="section-${sectionId}" style="${collapsed ? 'display: none;' : ''}">
                ${tasks.map(task => renderTaskCard(task)).join('')}
            </div>
        </div>
    `;
}

function renderTasks() {
    const tasksGrid = document.getElementById('tasksGrid');
    const emptyState = document.getElementById('emptyState');

    // Aplicar filtros
    let filteredTasks = tasks;

    // Filtro por estado (mantener compatibilidad con botones de filtro)
    if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(t => t.estado === 'completada');
    } else if (currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(t => t.estado !== 'completada');
    } else if (currentFilter === 'overdue') {
        filteredTasks = filteredTasks.filter(t => isTaskOverdue(t));
    }

    // Filtro por etiqueta
    const tagFilter = typeof getTagFilter === 'function' ? getTagFilter() : null;
    if (tagFilter) {
        filteredTasks = filteredTasks.filter(t => t.tags && t.tags.includes(tagFilter));
    }

    if (filteredTasks.length === 0) {
        tasksGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    tasksGrid.style.display = 'block';
    emptyState.style.display = 'none';

    // Clasificar tareas en grupos
    const urgentTasks = []; // Urgente y Alta prioridad (no completadas, no vencidas)
    const pendingTasks = []; // Media y Baja prioridad (no completadas, no vencidas)
    const overdueTasks = []; // Vencidas (no completadas)
    const completedTasks = []; // Completadas

    filteredTasks.forEach(task => {
        if (task.estado === 'completada') {
            completedTasks.push(task);
        } else if (isTaskOverdue(task)) {
            overdueTasks.push(task);
        } else if (task.prioridad === 'urgente' || task.prioridad === 'alta') {
            urgentTasks.push(task);
        } else {
            pendingTasks.push(task);
        }
    });

    // Ordenar cada grupo por prioridad
    const sortByPriority = (a, b) => getPriorityOrder(a.prioridad) - getPriorityOrder(b.prioridad);
    urgentTasks.sort(sortByPriority);
    pendingTasks.sort(sortByPriority);
    overdueTasks.sort(sortByPriority);
    completedTasks.sort(sortByPriority);

    // Renderizar todas las secciones
    let html = '';

    // Prioridad Alta/Urgente (rojo/naranja)
    html += renderTaskSection('Prioridad Alta', '🔥', urgentTasks, 'section-urgent');

    // Pendientes normales (azul)
    html += renderTaskSection('Pendientes', '⏳', pendingTasks, 'section-pending');

    // Vencidas (rojo oscuro)
    html += renderTaskSection('Vencidas', '⚠️', overdueTasks, 'section-overdue');

    // Completadas (verde, colapsadas por defecto)
    html += renderTaskSection('Completadas', '✅', completedTasks, 'section-completed', true);

    tasksGrid.innerHTML = html;
}

// Función para colapsar/expandir secciones
function toggleSection(sectionId) {
    const content = document.getElementById('section-' + sectionId);
    const toggle = document.getElementById('toggle-' + sectionId);

    if (content.style.display === 'none') {
        content.style.display = 'flex';
        content.style.flexWrap = 'wrap';
        toggle.textContent = '▼';
    } else {
        content.style.display = 'none';
        toggle.textContent = '▶';
    }
}

// Exponer toggle globalmente
window.toggleSection = toggleSection;

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        openModal(task);
    }
}

function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.estado === 'completada').length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(t => isTaskOverdue(t)).length;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('overdueTasks').textContent = overdueTasks;
}

// ===== FILTROS =====
const filterButtons = document.querySelectorAll('.btn-filter');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTasks();
    });
});

// Función para filtrar desde las tarjetas de estadísticas
function filterByStatCard(filter) {
    currentFilter = filter;
    // Actualizar botones de filtro
    filterButtons.forEach(b => {
        b.classList.remove('active');
        if (b.dataset.filter === filter) {
            b.classList.add('active');
        }
    });
    renderTasks();

    // Scroll suave hacia la sección de tareas
    const tasksGrid = document.getElementById('tasksGrid');
    if (tasksGrid) {
        tasksGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Exponer función globalmente
window.filterByStatCard = filterByStatCard;

// ===== FORMULARIO DE TAREA =====
const taskForm = document.getElementById('taskForm');
if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = document.getElementById('taskTitle').value.trim();
        const descripcion = document.getElementById('taskDescription').value.trim();
        const estado = document.getElementById('taskStatus').value;
        const prioridad = document.getElementById('taskPriority').value;
        const fecha_vencimiento = document.getElementById('taskDueDate').value;
        const fecha_recordatorio = document.getElementById('taskReminderDate').value;
        const tags = typeof getSelectedTaskTags === 'function' ? getSelectedTaskTags() : [];
        const saveBtn = document.getElementById('saveTaskBtn');

        if (!titulo) {
            showAlert('El título es obligatorio', 'error');
            return;
        }

        saveBtn.disabled = true;
        const originalText = saveBtn.textContent;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

        if (editingTaskId) {
            await updateTask(editingTaskId, titulo, descripcion, estado, prioridad, fecha_vencimiento, fecha_recordatorio, tags);
        } else {
            await createTask(titulo, descripcion, estado, prioridad, fecha_vencimiento, fecha_recordatorio, tags);
        }

        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    });
}

// ===== FAB =====
const addTaskBtn = document.getElementById('addTaskBtn');
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => openModal());
}

// ===== LOGOUT =====
// ===== LOGOUT =====
// El listener del botón de logout ahora se maneja centralizadamente en auth.js

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();

    // Renderizar filtros de etiquetas si está disponible
    if (typeof renderTagFilters === 'function') {
        renderTagFilters();
    }
});

// ===== EXPONER FUNCIONES GLOBALMENTE =====
// Necesario para que los onclick en el HTML funcionen
window.editTask = editTask;
window.deleteTask = deleteTask;
window.toggleTaskStatus = toggleTaskStatus;
window.openModal = openModal;
