// ===== CONFIGURACIÓN =====
// API_URL ya está definida en auth.js

// === MODO DEMO (descomenta para probar sin backend) ===
const DEMO_MODE = false; // Cambiado a false para usar el backend real

let tasks = [];
let charts = {};

// La autenticación ahora es manejada por auth.js

// Sobrescribir DEMO_MODE si se desea, pero la autenticación principal viene de auth.js
// Si auth.js no está, isAuthenticated() fallará, pero como ya lo incluimos en el HTML, estamos seguros.

function isTaskOverdue(task) {
    if (!task.fecha_vencimiento || task.estado === 'completada') return false;
    return new Date(task.fecha_vencimiento) < new Date();
}

// ===== DATOS DE DEMOSTRACIÓN =====
function getDemoTasks() {
    const today = new Date();
    return [
        { id: 1, titulo: 'Diseñar interfaz de usuario', estado: 'completada', prioridad: 'alta', fecha_creacion: new Date(today - 5 * 24 * 60 * 60 * 1000), fecha_completada: new Date(today - 2 * 24 * 60 * 60 * 1000) },
        { id: 2, titulo: 'Implementar autenticación', estado: 'completada', prioridad: 'alta', fecha_creacion: new Date(today - 4 * 24 * 60 * 60 * 1000), fecha_completada: new Date(today - 1 * 24 * 60 * 60 * 1000) },
        { id: 3, titulo: 'Crear API REST', estado: 'pendiente', prioridad: 'media', fecha_creacion: new Date(today - 3 * 24 * 60 * 60 * 1000), fecha_vencimiento: new Date(today + 2 * 24 * 60 * 60 * 1000) },
        { id: 4, titulo: 'Testing unitario', estado: 'pendiente', prioridad: 'media', fecha_creacion: new Date(today - 2 * 24 * 60 * 60 * 1000), fecha_vencimiento: new Date(today - 1 * 24 * 60 * 60 * 1000) }, // Vencida
        { id: 5, titulo: 'Documentación', estado: 'pendiente', prioridad: 'baja', fecha_creacion: new Date(today - 1 * 24 * 60 * 60 * 1000), fecha_vencimiento: new Date(today + 5 * 24 * 60 * 60 * 1000) },
        { id: 6, titulo: 'Deploy a producción', estado: 'pendiente', prioridad: 'alta', fecha_creacion: new Date(), fecha_vencimiento: new Date(today + 7 * 24 * 60 * 60 * 1000) },
        { id: 7, titulo: 'Optimizar rendimiento', estado: 'completada', prioridad: 'media', fecha_creacion: new Date(today - 6 * 24 * 60 * 60 * 1000), fecha_completada: new Date(today - 3 * 24 * 60 * 60 * 1000) },
        { id: 8, titulo: 'Revisar código', estado: 'pendiente', prioridad: 'baja', fecha_creacion: new Date(today - 1 * 24 * 60 * 60 * 1000) }
    ];
}

// ===== CARGAR DATOS =====
async function loadTasks() {
    if (DEMO_MODE) {
        // Usar datos de demostración
        tasks = getDemoTasks();
        calculateAndRenderStats();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tareas`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            tasks = await response.json();
            calculateAndRenderStats();
        } else {
            if (response.status === 401) {
                logout();
            }
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        // En caso de error, usar datos demo
        tasks = getDemoTasks();
        calculateAndRenderStats();
    }
}

// ===== CÁLCULO DE ESTADÍSTICAS =====
function calculateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.estado === 'completada').length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = tasks.filter(t => isTaskOverdue(t)).length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    // Tareas por prioridad
    const highPriority = tasks.filter(t => t.prioridad === 'alta' || t.prioridad === 'urgente').length;
    const mediumPriority = tasks.filter(t => t.prioridad === 'media').length;
    const lowPriority = tasks.filter(t => t.prioridad === 'baja').length;

    // Promedio diario (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTasks = tasks.filter(t => new Date(t.fecha_creacion) >= thirtyDaysAgo);
    const avgPerDay = (recentTasks.length / 30).toFixed(1);

    // Tendencia semanal (últimos 7 días)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const created = tasks.filter(t => {
            const taskDate = new Date(t.fecha_creacion);
            return taskDate >= date && taskDate < nextDate;
        }).length;

        const completed = tasks.filter(t => {
            if (!t.fecha_completada) return false;
            const completeDate = new Date(t.fecha_completada);
            return completeDate >= date && completeDate < nextDate;
        }).length;

        weeklyData.push({
            date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
            created,
            completed
        });
    }

    return {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
        highPriority,
        mediumPriority,
        lowPriority,
        avgPerDay,
        weeklyData
    };
}

// ===== RENDERIZADO =====
function calculateAndRenderStats() {
    const stats = calculateStats();

    // Actualizar métricas generales
    document.getElementById('statTotalTasks').textContent = stats.totalTasks;
    document.getElementById('statCompletionRate').textContent = stats.completionRate + '%';
    document.getElementById('statAvgPerDay').textContent = stats.avgPerDay;
    document.getElementById('statOverdueCount').textContent = stats.overdueTasks;

    // Renderizar gráficos
    renderStatusChart(stats);
    renderPriorityChart(stats);
    renderWeeklyChart(stats);
    renderStatsTable(stats);
}

function renderStatusChart(stats) {
    const ctx = document.getElementById('statusChart');

    if (charts.status) {
        charts.status.destroy();
    }

    charts.status = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completadas', 'Pendientes', 'Vencidas'],
            datasets: [{
                data: [stats.completedTasks, stats.pendingTasks - stats.overdueTasks, stats.overdueTasks],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f8fafc',
                        padding: 15,
                        font: {
                            size: 13
                        }
                    }
                }
            }
        }
    });
}

function renderPriorityChart(stats) {
    const ctx = document.getElementById('priorityChart');

    if (charts.priority) {
        charts.priority.destroy();
    }

    charts.priority = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Alta', 'Media', 'Baja'],
            datasets: [{
                label: 'Tareas',
                data: [stats.highPriority, stats.mediumPriority, stats.lowPriority],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(34, 197, 94, 0.8)'
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(34, 197, 94, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function renderWeeklyChart(stats) {
    const ctx = document.getElementById('weeklyChart');

    if (charts.weekly) {
        charts.weekly.destroy();
    }

    charts.weekly = new Chart(ctx, {
        type: 'line',
        data: {
            labels: stats.weeklyData.map(d => d.date),
            datasets: [
                {
                    label: 'Tareas Creadas',
                    data: stats.weeklyData.map(d => d.created),
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Tareas Completadas',
                    data: stats.weeklyData.map(d => d.completed),
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f8fafc',
                        padding: 15,
                        font: {
                            size: 13
                        }
                    }
                }
            }
        }
    });
}

function renderStatsTable(stats) {
    const tbody = document.getElementById('statsTableBody');

    const tableData = [
        { metric: 'Total de Tareas', value: stats.totalTasks, desc: 'Todas las tareas creadas' },
        { metric: 'Tareas Completadas', value: stats.completedTasks, desc: 'Tareas finalizadas exitosamente' },
        { metric: 'Tareas Pendientes', value: stats.pendingTasks, desc: 'Tareas aún por completar' },
        { metric: 'Tareas Vencidas', value: stats.overdueTasks, desc: 'Tareas que pasaron su fecha límite' },
        { metric: 'Tasa de Cumplimiento', value: stats.completionRate + '%', desc: 'Porcentaje de tareas completadas' },
        { metric: 'Promedio Diario', value: stats.avgPerDay, desc: 'Tareas creadas por día (últimos 30 días)' },
        { metric: 'Prioridad Alta', value: stats.highPriority, desc: 'Tareas de alta prioridad' },
        { metric: 'Prioridad Media', value: stats.mediumPriority, desc: 'Tareas de prioridad media' },
        { metric: 'Prioridad Baja', value: stats.lowPriority, desc: 'Tareas de baja prioridad' }
    ];

    tbody.innerHTML = tableData.map(row => `
    <tr>
      <td><strong>${row.metric}</strong></td>
      <td><span class="badge bg-primary">${row.value}</span></td>
      <td class="text-muted">${row.desc}</td>
    </tr>
  `).join('');
}

// ===== LOGOUT =====
// El listener del botón de logout ahora se maneja centralizadamente en auth.js

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});
