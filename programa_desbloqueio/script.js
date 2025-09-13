// Sistema Principal de Controle de Acesso - Parque Audicom
// Integração de todos os módulos

class AccessControlSystem {
    constructor() {
        this.isInitialized = false;
        this.systemStatus = 'initializing';
        this.pendingVisitors = [];
        this.init();
    }

    async init() {
        console.log('🚀 Iniciando Sistema de Controle de Acesso...');
        
        try {
            // Aguardar carregamento completo da página
            await this.waitForPageLoad();
            
            // Inicializar componentes
            this.initializeComponents();
            
            // Configurar sistema
            this.setupSystem();
            
            // Marcar como inicializado
            this.isInitialized = true;
            this.systemStatus = 'ready';
            
            this.updateSystemStatus('Sistema pronto para uso', 'online');
            console.log('✅ Sistema de Controle de Acesso iniciado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
            this.systemStatus = 'error';
            this.updateSystemStatus('Erro na inicialização do sistema', 'error');
        }
    }

    waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    initializeComponents() {
        console.log('🔧 Inicializando componentes...');
        
        // Inicializar controlador da catraca
        this.initializeTurnstileController();
        
        // Verificar se todos os módulos estão carregados
        this.validateModules();
        
        console.log('✅ Componentes inicializados');
    }

    initializeTurnstileController() {
        // Controlador da Catraca
        class TurnstileController {
            constructor() {
                this.isUnlocked = false;
                this.pendingEntries = 0;
                this.currentVisitors = [];
                this.init();
            }

            init() {
                this.bindEvents();
                this.updateStatus();
                console.log('🚪 Controlador da catraca iniciado');
            }

            bindEvents() {
                document.getElementById('clientPassedBtn').addEventListener('click', () => {
                    this.markClientPassed();
                });

                document.getElementById('resetTurnstileBtn').addEventListener('click', () => {
                    this.resetTurnstile();
                });
            }

            unlockForVisitors(visitors) {
                console.log(`🔓 Liberando catraca para ${visitors.length} visitante${visitors.length > 1 ? 's' : ''}`);
                
                this.isUnlocked = true;
                this.pendingEntries = visitors.length;
                this.currentVisitors = visitors;
                
                this.updateStatus();
                this.playUnlockSound();
                
                // Auto-reset após 5 minutos se ninguém passar
                setTimeout(() => {
                    if (this.pendingEntries > 0) {
                        this.resetTurnstile();
                        console.log('⏰ Auto-reset da catraca por timeout');
                    }
                }, 5 * 60 * 1000);
            }

            markClientPassed() {
                if (this.pendingEntries > 0) {
                    this.pendingEntries--;
                    
                    // Marcar um visitante como passou no banco de dados
                    const remainingVisitors = this.currentVisitors.filter(v => !v.passed);
                    if (remainingVisitors.length > 0) {
                        window.accessDB.markVisitorPassed(remainingVisitors[0].id);
                    }
                    
                    console.log(`🚶 Cliente passou! Restam ${this.pendingEntries} entrada${this.pendingEntries !== 1 ? 's' : ''}`);
                    
                    // Efeitos visuais e sonoros
                    this.playPassSound();
                    this.showPassAnimation();
                    
                    // Se todas as entradas foram usadas, resetar
                    if (this.pendingEntries === 0) {
                        setTimeout(() => {
                            this.resetTurnstile();
                        }, 2000);
                    }
                    
                    this.updateStatus();
                    
                    // Atualizar dashboard
                    if (window.dashboardController) {
                        window.dashboardController.refresh();
                    }
                }
            }

            resetTurnstile() {
                console.log('🔒 Resetando catraca...');
                
                this.isUnlocked = false;
                this.pendingEntries = 0;
                this.currentVisitors = [];
                
                this.updateStatus();
                this.playLockSound();
            }

            updateStatus() {
                const light = document.getElementById('turnstileLight');
                const status = document.getElementById('turnstileStatus');
                const message = document.getElementById('turnstileMessage');
                const pendingDiv = document.getElementById('pendingEntries');
                const passBtn = document.getElementById('clientPassedBtn');
                const entriesCount = document.getElementById('entriesCount');
                
                if (this.isUnlocked && this.pendingEntries > 0) {
                    // Catraca liberada
                    light.className = 'turnstile-light unlocked';
                    status.textContent = 'Catraca Liberada';
                    message.textContent = `${this.pendingEntries} entrada${this.pendingEntries > 1 ? 's' : ''} autorizada${this.pendingEntries > 1 ? 's' : ''}`;
                    pendingDiv.style.display = 'flex';
                    entriesCount.textContent = this.pendingEntries;
                    passBtn.disabled = false;
                } else if (this.pendingEntries === 0 && this.currentVisitors.length > 0) {
                    // Processando
                    light.className = 'turnstile-light pending';
                    status.textContent = 'Processando...';
                    message.textContent = 'Finalizando acesso dos visitantes';
                    pendingDiv.style.display = 'none';
                    passBtn.disabled = true;
                } else {
                    // Bloqueada
                    light.className = 'turnstile-light';
                    status.textContent = 'Catraca Bloqueada';
                    message.textContent = 'Aguardando leitura de QR Code válido';
                    pendingDiv.style.display = 'none';
                    passBtn.disabled = true;
                }
            }

            playUnlockSound() {
                this.playBeep(800, 200);
                setTimeout(() => this.playBeep(1000, 200), 300);
            }

            playPassSound() {
                this.playBeep(600, 150);
            }

            playLockSound() {
                this.playBeep(400, 300);
            }

            showPassAnimation() {
                const btn = document.getElementById('clientPassedBtn');
                btn.style.transform = 'scale(0.95)';
                btn.style.background = 'var(--gradient-success)';
                
                setTimeout(() => {
                    btn.style.transform = '';
                    btn.style.background = '';
                }, 200);
            }

            playBeep(frequency, duration) {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration / 1000);
                } catch (error) {
                    console.warn('⚠️ Não foi possível reproduzir som:', error);
                }
            }

            getStatus() {
                return {
                    isUnlocked: this.isUnlocked,
                    pendingEntries: this.pendingEntries,
                    currentVisitors: this.currentVisitors.length,
                    hasActiveScan: this.currentVisitors.length > 0
                };
            }
        }

        // Instanciar controlador da catraca
        window.turnstileController = new TurnstileController();
    }

    validateModules() {
        const requiredModules = [
            { name: 'accessDB', object: window.accessDB },
            { name: 'qrReader', object: window.qrReader },
            { name: 'dashboardController', object: window.dashboardController },
            { name: 'turnstileController', object: window.turnstileController },
            { name: 'ENCRYPTION_CONFIG', object: window.ENCRYPTION_CONFIG },
            { name: 'CryptoJS', object: window.CryptoJS },
            { name: 'Chart', object: window.Chart }
        ];

        const missingModules = requiredModules.filter(module => !module.object);
        
        if (missingModules.length > 0) {
            console.error('❌ Módulos não carregados:', missingModules.map(m => m.name));
            throw new Error(`Módulos obrigatórios não carregados: ${missingModules.map(m => m.name).join(', ')}`);
        }

        console.log('✅ Todos os módulos obrigatórios carregados');
    }

    setupSystem() {
        console.log('⚙️ Configurando sistema...');
        
        // Configurar teclas de atalho
        this.setupKeyboardShortcuts();
        
        // Configurar eventos do sistema
        this.setupSystemEvents();
        
        // Configurar auto-save
        this.setupAutoSave();
        
        console.log('✅ Sistema configurado');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl + P = Cliente passou
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                if (window.turnstileController.pendingEntries > 0) {
                    window.turnstileController.markClientPassed();
                }
            }
            
            // Ctrl + R = Reset catraca
            if (event.ctrlKey && event.key === 'r') {
                event.preventDefault();
                window.turnstileController.resetTurnstile();
            }
            
            // Ctrl + S = Iniciar/Parar câmera
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                const startBtn = document.getElementById('startCameraBtn');
                const stopBtn = document.getElementById('stopCameraBtn');
                
                if (startBtn.style.display !== 'none') {
                    window.qrReader.startCamera();
                } else {
                    window.qrReader.stopCamera();
                }
            }
            
            // F5 = Atualizar dashboard
            if (event.key === 'F5') {
                event.preventDefault();
                window.dashboardController.refresh();
            }
        });

        console.log('⌨️ Atalhos de teclado configurados');
    }

    setupSystemEvents() {
        // Evento antes de fechar a página
        window.addEventListener('beforeunload', () => {
            this.saveSystemState();
        });

        // Evento de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Página oculta - pausando operações não essenciais');
            } else {
                console.log('📱 Página visível - retomando operações');
                window.dashboardController.refresh();
            }
        });

        console.log('📡 Eventos do sistema configurados');
    }

    setupAutoSave() {
        // Auto-save a cada 30 segundos
        setInterval(() => {
            this.saveSystemState();
        }, 30000);

        console.log('💾 Auto-save configurado (30s)');
    }

    saveSystemState() {
        try {
            const systemState = {
                timestamp: new Date(),
                turnstileStatus: window.turnstileController.getStatus(),
                databaseStatus: window.accessDB.getStatus(),
                dashboardStatus: window.dashboardController.getStatus()
            };

            sessionStorage.setItem('systemState', JSON.stringify(systemState));
            console.log('💾 Estado do sistema salvo');
        } catch (error) {
            console.warn('⚠️ Erro ao salvar estado do sistema:', error);
        }
    }

    updateSystemStatus(message, status = 'warning') {
        const statusText = document.getElementById('statusText');
        const statusLight = document.getElementById('statusLight');
        
        if (statusText) {
            statusText.textContent = message;
        }
        
        if (statusLight) {
            statusLight.className = `status-light ${status}`;
        }
        
        console.log(`📊 Status: ${message} (${status})`);
    }

    // Métodos de teste e debug
    runSystemDiagnostics() {
        console.log('🔍 Executando diagnóstico do sistema...');
        
        const diagnostics = {
            system: {
                initialized: this.isInitialized,
                status: this.systemStatus
            },
            database: window.accessDB.getStatus(),
            turnstile: window.turnstileController.getStatus(),
            dashboard: window.dashboardController.getStatus(),
            qrReader: {
                isScanning: window.qrReader.isScanning,
                hasStream: !!window.qrReader.stream
            }
        };
        
        console.table(diagnostics);
        return diagnostics;
    }

    simulateQRScan(testData = null) {
        if (!testData) {
            // Dados de teste padrão
            testData = this.generateTestQRData();
        }
        
        console.log('🧪 Simulando scan de QR Code para teste...');
        window.qrReader.simulateQRScan(testData);
    }

    generateTestQRData() {
        // Gerar dados de teste criptografados
        const testVisitors = [
            {
                nome: 'João Silva',
                email: 'joao@email.com',
                cpf: '123.456.789-00',
                estado: 'SP',
                dataNascimento: '1990-05-15',
                parentesco: 'Pai',
                motivo: 'Lazer/Recreação'
            },
            {
                nome: 'Maria Silva',
                email: 'maria@email.com',
                cpf: '987.654.321-00',
                estado: 'SP',
                dataNascimento: '1985-08-20',
                parentesco: 'Mãe',
                motivo: 'Lazer/Recreação'
            }
        ];

        // Formatar dados como no site cliente
        let formattedData = '';
        testVisitors.forEach((visitor, index) => {
            formattedData += `P${index + 1}> Nome: ${visitor.nome}, `;
            formattedData += `E-mail: ${visitor.email}, `;
            formattedData += `CPF: ${visitor.cpf}, `;
            formattedData += `Estado: ${visitor.estado}, `;
            formattedData += `Data de Nascimento: ${visitor.dataNascimento}, `;
            formattedData += `Parentesco: ${visitor.parentesco}, `;
            formattedData += `Motivo: ${visitor.motivo}\n`;
        });

        // Criptografar dados
        const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_CONFIG.getKey());
        const encrypted = CryptoJS.DES.encrypt(formattedData, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });

        return encrypted.toString();
    }

    getSystemInfo() {
        return {
            version: '1.0.0',
            initialized: this.isInitialized,
            status: this.systemStatus,
            uptime: performance.now(),
            modules: {
                database: !!window.accessDB,
                qrReader: !!window.qrReader,
                dashboard: !!window.dashboardController,
                turnstile: !!window.turnstileController
            }
        };
    }
}

// Aguardar carregamento completo e inicializar sistema
document.addEventListener('DOMContentLoaded', () => {
    window.accessControlSystem = new AccessControlSystem();
    
    // Expor funções de teste no console
    window.runDiagnostics = () => window.accessControlSystem.runSystemDiagnostics();
    window.testQR = () => window.accessControlSystem.simulateQRScan();
    window.systemInfo = () => window.accessControlSystem.getSystemInfo();
    
    console.log('🎮 Sistema carregado! Comandos disponíveis:');
    console.log('- runDiagnostics() - Executar diagnóstico');
    console.log('- testQR() - Simular scan de QR Code');
    console.log('- systemInfo() - Informações do sistema');
});