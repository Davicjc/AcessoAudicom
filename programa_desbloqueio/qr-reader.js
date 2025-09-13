// Sistema de Leitura de QR Code com Câmera
class QRCodeReader {
    constructor() {
        this.isScanning = false;
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.scanner = null;
        this.lastScanTime = 0;
        this.scanDelay = 2000; // 2 segundos entre scans
        this.init();
    }

    init() {
        this.video = document.getElementById('cameraVideo');
        this.canvas = document.getElementById('qrCanvas');
        this.context = this.canvas.getContext('2d');
        
        this.bindEvents();
        console.log('📱 Sistema de QR Code Reader iniciado');
    }

    bindEvents() {
        document.getElementById('startCameraBtn').addEventListener('click', () => {
            this.startCamera();
        });

        document.getElementById('stopCameraBtn').addEventListener('click', () => {
            this.stopCamera();
        });
    }

    async startCamera() {
        try {
            console.log('📹 Iniciando câmera...');
            this.updateCameraStatus('Iniciando câmera...', 'warning');
            
            // Solicitar acesso à câmera
            const constraints = {
                video: {
                    facingMode: 'environment', // Câmera traseira preferida
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            // Aguardar o vídeo carregar
            await new Promise((resolve) => {
                this.video.onloadedmetadata = resolve;
            });

            await this.video.play();
            
            // Configurar canvas com as dimensões do vídeo
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;

            // Iniciar escaneamento
            this.isScanning = true;
            this.startScanning();
            
            // Atualizar interface
            this.updateCameraStatus('Câmera ativa - Posicione o QR Code', 'online');
            document.getElementById('startCameraBtn').style.display = 'none';
            document.getElementById('stopCameraBtn').style.display = 'flex';
            
            console.log('✅ Câmera iniciada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao iniciar câmera:', error);
            this.updateCameraStatus('Erro ao acessar câmera - Verifique permissões', 'error');
            
            if (error.name === 'NotAllowedError') {
                this.showCameraPermissionDialog();
            }
        }
    }

    stopCamera() {
        console.log('🛑 Parando câmera...');
        
        this.isScanning = false;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        // Atualizar interface
        this.updateCameraStatus('Câmera desativada', 'warning');
        document.getElementById('startCameraBtn').style.display = 'flex';
        document.getElementById('stopCameraBtn').style.display = 'none';
        
        console.log('✅ Câmera parada');
    }

    startScanning() {
        if (!this.isScanning) return;

        // Capturar frame do vídeo
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Tentar detectar QR Code
        this.detectQRCode();
        
        // Continuar escaneamento
        requestAnimationFrame(() => this.startScanning());
    }

    detectQRCode() {
        try {
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const qrCode = this.findQRCodeInImageData(imageData);
            
            if (qrCode && this.canScan()) {
                this.handleQRCodeDetected(qrCode);
            }
        } catch (error) {
            console.warn('⚠️ Erro na detecção de QR Code:', error);
        }
    }

    // Implementação básica de detecção de QR Code
    // Em produção seria melhor usar uma biblioteca especializada
    findQRCodeInImageData(imageData) {
        // Esta é uma implementação simplificada
        // Em um sistema real, usaríamos jsQR ou similar
        
        // Por simplicidade, vamos simular a detecção
        // Em um ambiente real, você integraria com jsQR:
        /*
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        return code ? code.data : null;
        */
        
        // Simulação para teste - remove em produção
        return null;
    }

    canScan() {
        const now = Date.now();
        if (now - this.lastScanTime < this.scanDelay) {
            return false;
        }
        return true;
    }

    handleQRCodeDetected(qrData) {
        this.lastScanTime = Date.now();
        
        console.log('🎯 QR Code detectado:', qrData.substring(0, 50) + '...');
        
        // Parar escaneamento temporariamente
        this.isScanning = false;
        
        // Visual feedback
        this.showScanAnimation();
        this.updateCameraStatus('QR Code detectado! Processando...', 'online');
        
        // Processar QR Code
        this.processQRCode(qrData);
    }

    processQRCode(qrData) {
        try {
            console.log('🔄 Processando QR Code...');
            
            // Descriptografar dados usando o sistema de criptografia
            const decryptedData = this.decryptQRCode(qrData);
            
            if (decryptedData) {
                console.log('✅ QR Code descriptografado com sucesso');
                
                // Parsear dados dos visitantes
                const visitorsData = this.parseVisitorsData(decryptedData);
                
                if (visitorsData && visitorsData.length > 0) {
                    // Adicionar ao banco de dados
                    const result = window.accessDB.addVisitorGroup(visitorsData, qrData);
                    
                    // Atualizar interface
                    this.showScanResult(result);
                    
                    // Liberar catraca
                    window.turnstileController.unlockForVisitors(result.visitors);
                    
                    // Atualizar dashboard
                    if (window.dashboardController) {
                        window.dashboardController.refresh();
                    }
                    
                } else {
                    throw new Error('Dados de visitantes inválidos');
                }
            } else {
                throw new Error('Falha na descriptografia');
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar QR Code:', error);
            this.updateCameraStatus('QR Code inválido ou corrompido', 'error');
            
            // Mostrar erro na interface
            this.showScanError(error.message);
        }
        
        // Reativar escaneamento após 5 segundos com countdown visual
        this.startCooldownCountdown(5);
    }

    decryptQRCode(encryptedData) {
        try {
            // Usar o mesmo sistema de criptografia do site cliente
            const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_CONFIG.getKey());
            
            // Descriptografar
            const decrypted = CryptoJS.DES.decrypt(encryptedData, key, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (!decryptedText) {
                throw new Error('Falha na descriptografia - dados vazios');
            }
            
            return decryptedText;
            
        } catch (error) {
            console.error('❌ Erro na descriptografia:', error);
            return null;
        }
    }

    parseVisitorsData(decryptedText) {
        try {
            // O formato esperado é o mesmo do site cliente:
            // P1> Nome: João, E-mail: joao@email.com, CPF: 123.456.789-00, etc.
            
            const visitors = [];
            const lines = decryptedText.split('\n').filter(line => line.trim());
            
            let currentVisitor = null;
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Detectar início de novo visitante
                if (trimmedLine.startsWith('P') && trimmedLine.includes('>')) {
                    if (currentVisitor) {
                        visitors.push(currentVisitor);
                    }
                    currentVisitor = {};
                }
                
                if (currentVisitor) {
                    // Parsear campos
                    if (trimmedLine.includes('Nome:')) {
                        currentVisitor.nome = this.extractValue(trimmedLine, 'Nome:');
                    } else if (trimmedLine.includes('E-mail:')) {
                        currentVisitor.email = this.extractValue(trimmedLine, 'E-mail:');
                    } else if (trimmedLine.includes('CPF:')) {
                        currentVisitor.cpf = this.extractValue(trimmedLine, 'CPF:');
                    } else if (trimmedLine.includes('Estado:')) {
                        currentVisitor.estado = this.extractValue(trimmedLine, 'Estado:');
                    } else if (trimmedLine.includes('Data de Nascimento:')) {
                        currentVisitor.dataNascimento = this.extractValue(trimmedLine, 'Data de Nascimento:');
                    } else if (trimmedLine.includes('Parentesco:')) {
                        currentVisitor.parentesco = this.extractValue(trimmedLine, 'Parentesco:');
                    } else if (trimmedLine.includes('Motivo:')) {
                        currentVisitor.motivo = this.extractValue(trimmedLine, 'Motivo:');
                    }
                }
            }
            
            // Adicionar último visitante
            if (currentVisitor && Object.keys(currentVisitor).length > 0) {
                visitors.push(currentVisitor);
            }
            
            console.log('📊 Visitantes parseados:', visitors.length);
            return visitors;
            
        } catch (error) {
            console.error('❌ Erro ao parsear dados:', error);
            return null;
        }
    }

    extractValue(line, field) {
        const index = line.indexOf(field);
        if (index === -1) return '';
        
        let value = line.substring(index + field.length).trim();
        
        // Remover vírgula no final se houver
        if (value.endsWith(',')) {
            value = value.slice(0, -1);
        }
        
        return value;
    }

    showScanAnimation() {
        // Adicionar animação visual de scan bem-sucedido
        const scannerBox = document.querySelector('.scanner-box');
        if (scannerBox) {
            scannerBox.style.borderColor = '#10b981';
            scannerBox.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
            
            setTimeout(() => {
                scannerBox.style.borderColor = '';
                scannerBox.style.boxShadow = '';
            }, 2000);
        }
    }

    showScanResult(result) {
        // Atualizar seção de última leitura
        const lastScanInfo = document.getElementById('lastScanInfo');
        const visitorsCount = result.visitors.length;
        const firstVisitor = result.visitors[0];
        
        lastScanInfo.innerHTML = `
            <div class="scan-details">
                <div class="scan-item">
                    <strong>Scan ID:</strong>
                    <span>${result.scanId}</span>
                </div>
                <div class="scan-item">
                    <strong>Visitantes:</strong>
                    <span>${visitorsCount} pessoa${visitorsCount > 1 ? 's' : ''}</span>
                </div>
                <div class="scan-item">
                    <strong>Primeiro Visitante:</strong>
                    <span>${firstVisitor.nome}</span>
                </div>
                <div class="scan-item">
                    <strong>Estado:</strong>
                    <span>${firstVisitor.estado}</span>
                </div>
                <div class="scan-item">
                    <strong>Horário:</strong>
                    <span>${new Date().toLocaleTimeString('pt-BR')}</span>
                </div>
            </div>
        `;
    }

    showScanError(errorMessage) {
        const lastScanInfo = document.getElementById('lastScanInfo');
        lastScanInfo.innerHTML = `
            <div class="scan-error">
                <i class="fas fa-exclamation-triangle" style="color: var(--danger-red); font-size: 2rem; margin-bottom: 1rem;"></i>
                <h3 style="color: var(--danger-red); margin-bottom: 0.5rem;">Erro na Leitura</h3>
                <p style="color: var(--gray-600);">${errorMessage}</p>
                <small style="color: var(--gray-500);">Horário: ${new Date().toLocaleTimeString('pt-BR')}</small>
            </div>
        `;
    }

    updateCameraStatus(message, status = 'warning') {
        const statusElement = document.getElementById('cameraStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `camera-status ${status}`;
        }
    }

    showCameraPermissionDialog() {
        // Mostrar dialog de permissão
        alert('Este sistema precisa de acesso à câmera para funcionar.\n\n' +
              'Por favor, permita o acesso à câmera e recarregue a página.\n\n' +
              'Se você negou a permissão, clique no ícone de câmera na barra de endereços do navegador.');
    }

    startCooldownCountdown(seconds) {
        let remainingTime = seconds;
        console.log(`⏱️ Aguardando ${remainingTime} segundos para próximo scan...`);
        
        const updateStatus = () => {
            if (remainingTime > 0) {
                this.updateCameraStatus(`Aguarde ${remainingTime}s para próximo scan...`, 'warning');
                remainingTime--;
                setTimeout(updateStatus, 1000);
            } else {
                // Reativar escaneamento
                if (this.stream && this.video.srcObject) {
                    this.isScanning = true;
                    this.updateCameraStatus('Pronto para próximo QR Code', 'online');
                    console.log('✅ Scanner reativado - pronto para próximo QR Code');
                }
            }
        };
        
        // Iniciar countdown
        updateStatus();
    }

    // Método para teste manual
    simulateQRScan(testData) {
        console.log('🧪 Simulando scan de QR Code...');
        this.handleQRCodeDetected(testData);
    }
}

// Instanciar leitor de QR Code global
window.qrReader = new QRCodeReader();