// Sistema de Dashboard com Gráficos e Estatísticas
class DashboardController {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.init();
    }

    init() {
        console.log('📊 Dashboard Controller iniciado');
        this.setupCharts();
        this.startAutoRefresh();
    }

    setupCharts() {
        // Gráfico de Estados
        this.setupStateChart();
        
        // Gráfico de Faixa Etária
        this.setupAgeChart();
    }

    setupStateChart() {
        const ctx = document.getElementById('stateChart').getContext('2d');
        
        this.charts.stateChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    setupAgeChart() {
        const ctx = document.getElementById('ageChart').getContext('2d');
        
        this.charts.ageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['0-17', '18-25', '26-35', '36-50', '51-65', '65+'],
                datasets: [{
                    label: 'Visitantes por Faixa Etária',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} visitante${context.parsed.y !== 1 ? 's' : ''}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    refresh() {
        console.log('🔄 Atualizando dashboard...');
        
        const stats = window.accessDB.getStatistics();
        
        // Atualizar cards de estatísticas
        this.updateStatCards(stats);
        
        // Atualizar gráficos
        this.updateCharts(stats);
        
        // Atualizar log de acessos
        this.updateAccessLog();
    }

    updateStatCards(stats) {
        // Total de Visitantes
        document.getElementById('totalVisitors').textContent = stats.totalVisitors;
        
        // Total de Scans
        document.getElementById('totalScans').textContent = stats.totalScans;
        
        // Idade Média
        document.getElementById('averageAge').textContent = 
            stats.averageAge > 0 ? `${stats.averageAge} anos` : '--';
        
        // Visitantes de Hoje
        document.getElementById('todayVisitors').textContent = stats.todayVisitors;
    }

    updateCharts(stats) {
        // Atualizar gráfico de estados
        this.updateStateChart(stats.stateDistribution);
        
        // Atualizar gráfico de idades
        this.updateAgeChart(stats.ageDistribution);
    }

    updateStateChart(stateDistribution) {
        const labels = Object.keys(stateDistribution);
        const data = Object.values(stateDistribution);
        
        if (labels.length === 0) {
            // Dados vazios
            this.charts.stateChart.data.labels = ['Nenhum dado'];
            this.charts.stateChart.data.datasets[0].data = [1];
            this.charts.stateChart.data.datasets[0].backgroundColor = ['#e5e7eb'];
        } else {
            this.charts.stateChart.data.labels = labels;
            this.charts.stateChart.data.datasets[0].data = data;
            this.charts.stateChart.data.datasets[0].backgroundColor = [
                '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
            ].slice(0, labels.length);
        }
        
        this.charts.stateChart.update('none');
    }

    updateAgeChart(ageDistribution) {
        const data = [
            ageDistribution['0-17'] || 0,
            ageDistribution['18-25'] || 0,
            ageDistribution['26-35'] || 0,
            ageDistribution['36-50'] || 0,
            ageDistribution['51-65'] || 0,
            ageDistribution['65+'] || 0
        ];
        
        this.charts.ageChart.data.datasets[0].data = data;
        this.charts.ageChart.update('none');
    }

    updateAccessLog() {
        const recentAccess = window.accessDB.getRecentAccessLog(10);
        const logContainer = document.getElementById('accessLog');
        
        if (recentAccess.length === 0) {
            logContainer.innerHTML = '<p class="no-records">Nenhum acesso registrado ainda</p>';
            return;
        }
        
        logContainer.innerHTML = recentAccess.map(access => `
            <div class="log-entry">
                <div class="log-info">
                    <div class="log-name">${access.nome}</div>
                    <div class="log-details">
                        ${access.idade} anos • ${access.estado}
                        ${access.passed ? 
                            `<span style="color: var(--success-green); font-weight: 600;"> • ✓ Passou</span>` : 
                            `<span style="color: var(--warning-orange); font-weight: 600;"> • ⏳ Pendente</span>`
                        }
                    </div>
                </div>
                <div class="log-time">
                    ${this.formatDateTime(access.timestamp)}
                    ${access.passedAt ? `<br><small>Passou: ${this.formatTime(access.passedAt)}</small>` : ''}
                </div>
            </div>
        `).join('');
    }

    formatDateTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    formatTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    startAutoRefresh() {
        // Atualizar a cada 5 segundos
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, 5000);
        
        // Primeira atualização imediata
        this.refresh();
        
        console.log('🔄 Auto-refresh do dashboard iniciado (5s)');
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('⏹️ Auto-refresh do dashboard parado');
        }
    }

    // Método para exportar dados do dashboard
    exportDashboardData() {
        const stats = window.accessDB.getStatistics();
        const recentAccess = window.accessDB.getRecentAccessLog(50);
        
        const exportData = {
            timestamp: new Date(),
            statistics: stats,
            recentAccess: recentAccess,
            charts: {
                stateDistribution: stats.stateDistribution,
                ageDistribution: stats.ageDistribution
            }
        };
        
        // Criar arquivo para download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('📥 Dados do dashboard exportados');
    }

    // Método para gerar relatório em PDF (simulação)
    generateReport() {
        const stats = window.accessDB.getStatistics();
        const recentAccess = window.accessDB.getRecentAccessLog(20);
        
        // Em uma implementação real, você usaria jsPDF ou similar
        alert(`Relatório Gerado!\n\n` +
              `Total de Visitantes: ${stats.totalVisitors}\n` +
              `QR Codes Lidos: ${stats.totalScans}\n` +
              `Idade Média: ${stats.averageAge} anos\n` +
              `Visitantes Hoje: ${stats.todayVisitors}\n\n` +
              `Este é um exemplo. Em produção, um PDF seria gerado.`);
        
        console.log('📄 Relatório gerado (simulação)');
    }

    // Método para limpar todos os dados
    clearAllData() {
        if (confirm('Tem certeza que deseja limpar todos os dados?\n\nEsta ação não pode ser desfeita.')) {
            window.accessDB.clearAll();
            this.refresh();
            alert('Todos os dados foram limpos com sucesso!');
            console.log('🗑️ Todos os dados do dashboard foram limpos');
        }
    }

    getStatus() {
        return {
            chartsInitialized: Object.keys(this.charts).length > 0,
            autoRefreshActive: this.refreshInterval !== null,
            lastUpdate: new Date(),
            dataPoints: {
                visitors: window.accessDB.visitors.length,
                scans: window.accessDB.scans.length
            }
        };
    }
}

// Instanciar controlador do dashboard
window.dashboardController = new DashboardController();