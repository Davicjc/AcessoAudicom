// Sistema de Banco de Dados em Memória
// Para registros de acesso e estatísticas

class AccessDatabase {
    constructor() {
        this.visitors = [];
        this.scans = [];
        this.sessions = [];
        this.statistics = {
            totalVisitors: 0,
            totalScans: 0,
            todayVisitors: 0,
            averageAge: 0,
            stateDistribution: {},
            ageDistribution: {
                '0-17': 0,
                '18-25': 0,
                '26-35': 0,
                '36-50': 0,
                '51-65': 0,
                '65+': 0
            }
        };
        this.init();
    }

    init() {
        console.log('🗄️ Banco de dados em memória iniciado');
        this.loadFromSessionStorage();
    }

    // Salvar no sessionStorage para persistir durante a sessão
    saveToSessionStorage() {
        try {
            const data = {
                visitors: this.visitors,
                scans: this.scans,
                sessions: this.sessions,
                statistics: this.statistics
            };
            sessionStorage.setItem('accessDatabase', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ Erro ao salvar no sessionStorage:', error);
        }
    }

    // Carregar do sessionStorage
    loadFromSessionStorage() {
        try {
            const data = sessionStorage.getItem('accessDatabase');
            if (data) {
                const parsed = JSON.parse(data);
                this.visitors = parsed.visitors || [];
                this.scans = parsed.scans || [];
                this.sessions = parsed.sessions || [];
                this.statistics = parsed.statistics || this.statistics;
                console.log('📊 Dados carregados do sessionStorage:', {
                    visitors: this.visitors.length,
                    scans: this.scans.length
                });
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar do sessionStorage:', error);
        }
    }

    // Adicionar visitantes do QR Code descriptografado
    addVisitorGroup(visitorsData, rawQRCode) {
        const scanId = this.generateId();
        const timestamp = new Date();
        
        // Registrar o scan
        const scanRecord = {
            id: scanId,
            timestamp: timestamp,
            rawData: rawQRCode,
            visitorsCount: visitorsData.length,
            processed: true
        };
        
        this.scans.push(scanRecord);

        // Processar cada visitante
        const addedVisitors = [];
        visitorsData.forEach((visitor, index) => {
            const visitorRecord = {
                id: this.generateId(),
                scanId: scanId,
                timestamp: timestamp,
                nome: visitor.nome,
                email: visitor.email,
                cpf: visitor.cpf,
                estado: visitor.estado,
                dataNascimento: visitor.dataNascimento,
                idade: this.calculateAge(visitor.dataNascimento),
                parentesco: visitor.parentesco,
                motivo: visitor.motivo || 'Não informado',
                passed: false, // Indica se já passou pela catraca
                passedAt: null
            };
            
            this.visitors.push(visitorRecord);
            addedVisitors.push(visitorRecord);
        });

        // Atualizar estatísticas
        this.updateStatistics();
        this.saveToSessionStorage();

        console.log('✅ Grupo de visitantes adicionado:', {
            scanId: scanId,
            visitorsCount: visitorsData.length,
            visitors: addedVisitors.map(v => v.nome)
        });

        return {
            scanId: scanId,
            visitors: addedVisitors,
            scanRecord: scanRecord
        };
    }

    // Marcar visitante como passou pela catraca
    markVisitorPassed(visitorId) {
        const visitor = this.visitors.find(v => v.id === visitorId);
        if (visitor && !visitor.passed) {
            visitor.passed = true;
            visitor.passedAt = new Date();
            this.saveToSessionStorage();
            console.log('🚶 Visitante marcado como passou:', visitor.nome);
            return true;
        }
        return false;
    }

    // Marcar múltiplos visitantes como passaram
    markMultipleVisitorsPassed(visitorIds) {
        let passedCount = 0;
        visitorIds.forEach(id => {
            if (this.markVisitorPassed(id)) {
                passedCount++;
            }
        });
        return passedCount;
    }

    // Calcular idade
    calculateAge(birthDate) {
        if (!birthDate) return 0;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Atualizar estatísticas
    updateStatistics() {
        const today = new Date().toDateString();
        
        // Contar visitantes de hoje
        this.statistics.todayVisitors = this.visitors.filter(v => 
            v.timestamp.toDateString() === today
        ).length;

        // Total de visitantes e scans
        this.statistics.totalVisitors = this.visitors.length;
        this.statistics.totalScans = this.scans.length;

        // Calcular idade média
        const validAges = this.visitors
            .map(v => v.idade)
            .filter(age => age > 0);
        
        this.statistics.averageAge = validAges.length > 0 
            ? Math.round(validAges.reduce((sum, age) => sum + age, 0) / validAges.length)
            : 0;

        // Distribuição por estado
        this.statistics.stateDistribution = {};
        this.visitors.forEach(visitor => {
            if (visitor.estado) {
                this.statistics.stateDistribution[visitor.estado] = 
                    (this.statistics.stateDistribution[visitor.estado] || 0) + 1;
            }
        });

        // Distribuição por faixa etária
        this.statistics.ageDistribution = {
            '0-17': 0,
            '18-25': 0,
            '26-35': 0,
            '36-50': 0,
            '51-65': 0,
            '65+': 0
        };

        this.visitors.forEach(visitor => {
            const age = visitor.idade;
            if (age >= 0 && age <= 17) this.statistics.ageDistribution['0-17']++;
            else if (age >= 18 && age <= 25) this.statistics.ageDistribution['18-25']++;
            else if (age >= 26 && age <= 35) this.statistics.ageDistribution['26-35']++;
            else if (age >= 36 && age <= 50) this.statistics.ageDistribution['36-50']++;
            else if (age >= 51 && age <= 65) this.statistics.ageDistribution['51-65']++;
            else if (age > 65) this.statistics.ageDistribution['65+']++;
        });
    }

    // Obter visitantes pendentes (não passaram ainda)
    getPendingVisitors() {
        return this.visitors.filter(v => !v.passed);
    }

    // Obter último scan
    getLastScan() {
        if (this.scans.length === 0) return null;
        return this.scans[this.scans.length - 1];
    }

    // Obter últimos visitantes de um scan
    getVisitorsFromScan(scanId) {
        return this.visitors.filter(v => v.scanId === scanId);
    }

    // Obter estatísticas atualizadas
    getStatistics() {
        this.updateStatistics();
        return { ...this.statistics };
    }

    // Obter log de acessos recentes
    getRecentAccessLog(limit = 10) {
        return this.visitors
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit)
            .map(visitor => ({
                id: visitor.id,
                nome: visitor.nome,
                idade: visitor.idade,
                estado: visitor.estado,
                timestamp: visitor.timestamp,
                passed: visitor.passed,
                passedAt: visitor.passedAt
            }));
    }

    // Limpar todos os dados
    clearAll() {
        this.visitors = [];
        this.scans = [];
        this.sessions = [];
        this.statistics = {
            totalVisitors: 0,
            totalScans: 0,
            todayVisitors: 0,
            averageAge: 0,
            stateDistribution: {},
            ageDistribution: {
                '0-17': 0,
                '18-25': 0,
                '26-35': 0,
                '36-50': 0,
                '51-65': 0,
                '65+': 0
            }
        };
        
        sessionStorage.removeItem('accessDatabase');
        console.log('🗑️ Banco de dados limpo');
    }

    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Exportar dados para backup
    exportData() {
        return {
            exportDate: new Date(),
            visitors: this.visitors,
            scans: this.scans,
            statistics: this.statistics
        };
    }

    // Status do banco
    getStatus() {
        return {
            visitors: this.visitors.length,
            scans: this.scans.length,
            pendingVisitors: this.getPendingVisitors().length,
            lastScan: this.getLastScan()?.timestamp || null,
            memoryUsage: JSON.stringify(this.exportData()).length
        };
    }
}

// Instanciar banco de dados global
window.accessDB = new AccessDatabase();