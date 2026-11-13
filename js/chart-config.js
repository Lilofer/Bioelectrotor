let chartLeyes = null;
let chartProcesos = null;
let chartRadar = null;

function initCharts() {
    const ctxLeyes = document.getElementById('chart-leyes').getContext('2d');
    chartLeyes = new Chart(ctxLeyes, {
        type: 'bar',
        data: {
            labels: ['Cu Soluble (%)', 'Fe (%)', 'Au (g/t x10)'],
            datasets: [{
                label: 'Contenido Metalúrgico',
                data: [0, 0, 0],
                backgroundColor: ['#06b6d4', '#f59e0b', '#10b981'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });

    const ctxProcesos = document.getElementById('chart-procesos').getContext('2d');
    chartProcesos = new Chart(ctxProcesos, {
        type: 'doughnut',
        data: {
            labels: ['Energía (kWh/t)', 'Consumo Agua (m³/t x10)', 'Emisión CO₂ (kg/t)'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#06b6d4', '#3b82f6', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } }
            }
        }
    });

    const ctxRadar = document.getElementById('chart-radar-riesgos').getContext('2d');
    chartRadar = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['Estabilidad Geotécnica', 'Riesgo Químico/pH', 'Conflicto Social', 'Impacto MP10', 'Escasez Hídrica'],
            datasets: [{
                label: 'Índice de Riesgo (1-5)',
                data: [3, 2, 4, 3, 2],
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                borderColor: '#06b6d4',
                pointBackgroundColor: '#06b6d4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: '#334155' },
                    grid: { color: '#334155' },
                    pointLabels: { color: '#94a3b8', font: { size: 10 } },
                    ticks: { display: false, backdropColor: 'transparent' },
                    suggestedMin: 0,
                    suggestedMax: 5
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}