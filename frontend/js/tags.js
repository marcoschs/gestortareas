// ===== GESTIÓN DE ETIQUETAS =====

// Estado de etiquetas
let tags = [];
let selectedTaskTags = []; //

// Etiquetas seleccionadas para la tarea actual

// Colores predefinidos
const defaultTagColors = [
    '#6366f1', // Azul
    '#ec4899', // Rosa
    '#f59e0b', // Naranja
    '#22c55e', // Verde
    '#ef4444', // Rojo
    '#8b5cf6', // Púrpura
    '#06b6d4', // Cyan
    '#eab308'  // Amarillo
];

// ===== INICIALIZACIÓN =====
function initTags() {
    loadTagsFromStorage();
    setupTagEventListeners();
}

// ===== ALMACENAMIENTO LOCAL =====
function saveTagsToStorage() {
    localStorage.setItem('taskTags', JSON.stringify(tags));
}

function loadTagsFromStorage() {
    const storedTags = localStorage.getItem('taskTags');
    if (storedTags) {
        tags = JSON.parse(storedTags);
    } else {
        // Crear etiquetas por defecto
        tags = [
            { id: 1, name: 'Trabajo', color: '#6366f1' },
            { id: 2, name: 'Personal', color: '#ec4899' },
            { id: 3, name: 'Urgente', color: '#ef4444' },
            { id: 4, name: 'Pendiente', color: '#f59e0b' }
        ];
        saveTagsToStorage();
    }
}

// ===== CRUD DE ETIQUETAS =====
function createTag(name, color) {
    const newTag = {
        id: Date.now(),
        name: name.trim(),
        color: color
    };

    tags.push(newTag);
    saveTagsToStorage();
    renderTagsList();
    renderTagFilters();
    return newTag;
}

function deleteTag(tagId) {
    tags = tags.filter(t => t.id !== tagId);
    saveTagsToStorage();
    renderTagsList();
    renderTagFilters();

    // También remover de las tareas
    if (typeof tasks !== 'undefined') {
        tasks.forEach(task => {
            if (task.tags) {
                task.tags = task.tags.filter(t => t !== tagId);
            }
        });
    }
}

function getTagById(tagId) {
    return tags.find(t => t.id === tagId);
}

// ===== RENDERIZADO =====
function renderTagsList() {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;

    if (tags.length === 0) {
        tagsList.innerHTML = `
      <div class="text-center text-muted py-3">
        <p>No hay etiquetas creadas</p>
      </div>
    `;
        return;
    }

    tagsList.innerHTML = tags.map(tag => `
    <div class="tag-item">
      <div class="tag" style="background-color: ${tag.color}; color: white;">
        ${escapeHtml(tag.name)}
      </div>
      <button onclick="deleteTag(${tag.id})">Eliminar</button>
    </div>
  `).join('');
}

function renderTaskTagsContainer() {
    const container = document.getElementById('taskTagsContainer');
    if (!container) return;

    container.innerHTML = tags.map(tag => {
        const isSelected = selectedTaskTags.includes(tag.id);
        return `
      <div class="tag ${isSelected ? 'active' : ''}" 
           style="background-color: ${tag.color}; color: white; opacity: ${isSelected ? '1' : '0.5'};"
           onclick="toggleTaskTag(${tag.id})">
        <span class="tag-checkbox ${isSelected ? 'checked' : ''}"></span>
        ${escapeHtml(tag.name)}
      </div>
    `;
    }).join('');
}

function renderTagFilters() {
    const container = document.getElementById('tagsFilter');
    if (!container) return;

    if (tags.length === 0) {
        container.classList.add('empty');
        return;
    }

    container.classList.remove('empty');

    container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
      <span style="color: var(--text-secondary); font-size: 0.875rem; font-weight: 600;">Filtrar por:</span>
      ${tags.map(tag => `
        <div class="tag-filter-item" 
             data-tag-id="${tag.id}"
             style="background-color: ${tag.color}; color: white;"
             onclick="filterByTag(${tag.id})">
          ${escapeHtml(tag.name)}
        </div>
      `).join('')}
      <button class="btn btn-sm btn-outline-light" onclick="clearTagFilter()">Limpiar filtro</button>
    </div>
  `;
}

function renderTaskTags(taskTags) {
    if (!taskTags || taskTags.length === 0) return '';

    return taskTags.map(tagId => {
        const tag = getTagById(tagId);
        if (!tag) return '';
        return `
      <div class="tag" style="background-color: ${tag.color}; color: white;">
        ${escapeHtml(tag.name)}
      </div>
    `;
    }).join('');
}

// ===== FUNCIONES DE INTERACCIÓN =====
function toggleTaskTag(tagId) {
    const index = selectedTaskTags.indexOf(tagId);
    if (index > -1) {
        selectedTaskTags.splice(index, 1);
    } else {
        selectedTaskTags.push(tagId);
    }
    renderTaskTagsContainer();
}

function setTaskTags(taskTags) {
    selectedTaskTags = taskTags || [];
    renderTaskTagsContainer();
}

function getSelectedTaskTags() {
    return selectedTaskTags;
}

function clearSelectedTaskTags() {
    selectedTaskTags = [];
    renderTaskTagsContainer();
}

// ===== FILTRADO =====
let currentTagFilter = null;

function filterByTag(tagId) {
    // Toggle filter
    if (currentTagFilter === tagId) {
        clearTagFilter();
        return;
    }

    currentTagFilter = tagId;

    // Actualizar UI de filtros
    document.querySelectorAll('.tag-filter-item').forEach(item => {
        if (parseInt(item.dataset.tagId) === tagId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Aplicar filtro
    if (typeof renderTasks === 'function') {
        renderTasks();
    }
}

function clearTagFilter() {
    currentTagFilter = null;
    document.querySelectorAll('.tag-filter-item').forEach(item => {
        item.classList.remove('active');
    });

    if (typeof renderTasks === 'function') {
        renderTasks();
    }
}

function getTagFilter() {
    return currentTagFilter;
}

// ===== EVENT LISTENERS =====
function setupTagEventListeners() {
    // Formulario de creación de etiquetas
    const tagForm = document.getElementById('tagForm');
    if (tagForm) {
        tagForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('tagName').value.trim();
            const color = document.getElementById('tagColor').value;

            if (!name) {
                if (typeof showAlert === 'function') {
                    showAlert('El nombre de la etiqueta es obligatorio', 'error');
                }
                return;
            }

            createTag(name, color);
            tagForm.reset();
            document.getElementById('tagColor').value = defaultTagColors[Math.floor(Math.random() * defaultTagColors.length)];

            if (typeof showAlert === 'function') {
                showAlert('Etiqueta creada exitosamente', 'success');
            }
        });
    }

    // Renderizar etiquetas al abrir modal
    const tagModal = document.getElementById('tagModal');
    if (tagModal) {
        tagModal.addEventListener('show.bs.modal', () => {
            renderTagsList();
        });
    }

    // Renderizar contenedor de etiquetas al abrir modal de tarea
    const taskModal = document.getElementById('taskModal');
    if (taskModal) {
        taskModal.addEventListener('show.bs.modal', () => {
            renderTaskTagsContainer();
        });
    }
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTags);
} else {
    initTags();
}
