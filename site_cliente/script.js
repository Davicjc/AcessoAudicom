// Sistema de Controle de Acesso - Audicom
class AccessControl {
    constructor() {
        this.visitorsQueue = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFieldFormatting();
        this.setupMobileOptimizations();
    }

    bindEvents() {
        // Add user button
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.addUserToQueue();
        });

        // Finalize registration button
        document.getElementById('finalizeRegistrationBtn').addEventListener('click', () => {
            this.finalizeAllRegistrations();
        });

        // Clear all visitors button
        document.getElementById('clearAllVisitorsBtn').addEventListener('click', () => {
            this.clearAllVisitors();
        });

        // Real-time validation
        this.setupFormValidation();
    }

    setupFieldFormatting() {
        // CPF Formatting
        const cpfInput = document.getElementById('cpf');
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Limit to 11 digits
            value = value.substring(0, 11);
            
            // Apply mask
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            e.target.value = value;
            
            // Add formatting indicator
            if (value.length >= 14) {
                e.target.setAttribute('data-formatted', 'true');
            } else {
                e.target.removeAttribute('data-formatted');
            }
            
            // Validate CPF
            this.validateCPF(value);
        });

        // Prevent non-numeric input in CPF
        cpfInput.addEventListener('keypress', (e) => {
            if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // State validation
        const estadoSelect = document.getElementById('estado');
        estadoSelect.addEventListener('change', () => {
            this.validateCPFWithState();
        });

        // Name Formatting
        const nomeInput = document.getElementById('nome');
        nomeInput.addEventListener('input', (e) => {
            let value = e.target.value;
            
            // Remove extra spaces
            value = value.replace(/\s+/g, ' ');
            
            // Capitalize first letter of each word
            value = value.toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
            
            e.target.value = value;
        });

        // Prevent numbers in name
        nomeInput.addEventListener('keypress', (e) => {
            if (/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Email Formatting
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('input', (e) => {
            // Convert to lowercase
            e.target.value = e.target.value.toLowerCase();
        });

        // Remove spaces from email
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
            }
        });

        // Data de Nascimento Formatting and Age Calculation
        const dataNascimentoInput = document.getElementById('dataNascimento');
        const idadeDisplay = document.getElementById('idadeDisplay');
        
        // Set max date to today and min date to 120 years ago
        const today = new Date();
        const maxDate = today.toISOString().split('T')[0];
        const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()).toISOString().split('T')[0];
        
        dataNascimentoInput.max = maxDate;
        dataNascimentoInput.min = minDate;
        
        // Calculate age when date changes
        dataNascimentoInput.addEventListener('change', (e) => {
            const birthDate = new Date(e.target.value);
            const age = this.calculateAge(birthDate);
            
            if (age >= 0 && age <= 120) {
                idadeDisplay.textContent = `Idade: ${age} anos`;
                idadeDisplay.style.color = '#059669';
                e.target.setAttribute('data-formatted', 'true');
            } else {
                idadeDisplay.textContent = 'Data inválida';
                idadeDisplay.style.color = '#dc2626';
                e.target.removeAttribute('data-formatted');
            }
        });

        // Additional field enhancements
        this.setupFieldEnhancements();
        this.setupFieldIndicators();
        this.initializeCounters();
    }

    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    updateCharCounter(counterId, currentLength, maxLength) {
        const counter = document.getElementById(counterId);
        if (counter) {
            counter.textContent = `${currentLength}/${maxLength} caracteres`;
            
            // Change color based on usage
            if (currentLength >= maxLength * 0.9) {
                counter.style.color = '#dc2626'; // Red when near limit
            } else if (currentLength >= maxLength * 0.7) {
                counter.style.color = '#d97706'; // Orange when getting close
            } else {
                counter.style.color = '#64748b'; // Gray when safe
            }
        }
    }

    setupFieldEnhancements() {
        // Add input length counters for better UX
        const nomeInput = document.getElementById('nome');
        const emailInput = document.getElementById('email');

        // Nome character limit and formatting feedback
        nomeInput.addEventListener('input', (e) => {
            if (e.target.value.length > 50) {
                e.target.value = e.target.value.substring(0, 50);
                this.showNotification('Nome limitado a 50 caracteres.', 'warning');
            }
            
            // Add formatting indicator
            if (e.target.value.length > 0) {
                e.target.setAttribute('data-formatted', 'true');
            } else {
                e.target.removeAttribute('data-formatted');
            }
            
            // Update character counter
            this.updateCharCounter('nomeCounter', e.target.value.length, 50);
        });

        // Email character limit and formatting feedback
        emailInput.addEventListener('input', (e) => {
            if (e.target.value.length > 30) {
                e.target.value = e.target.value.substring(0, 30);
                this.showNotification('Email limitado a 30 caracteres.', 'warning');
            }
            
            // Add formatting indicator
            if (e.target.value.includes('@') && e.target.value.includes('.')) {
                e.target.setAttribute('data-formatted', 'true');
            } else {
                e.target.removeAttribute('data-formatted');
            }
            
            // Update character counter
            this.updateCharCounter('emailCounter', e.target.value.length, 30);
        });

        // Trim whitespace on blur
        [nomeInput, emailInput].forEach(input => {
            input.addEventListener('blur', (e) => {
                e.target.value = e.target.value.trim();
            });
        });
    }

    setupFieldIndicators() {
        // Add visual feedback for field formatting
        const fields = {
            'nome': 'Formatação: Primeira letra maiúscula em cada palavra',
            'email': 'Formatação: Convertido automaticamente para minúsculas',
            'cpf': 'Formatação: Máscara automática (000.000.000-00)',
            'dataNascimento': 'Cálculo: Idade calculada automaticamente'
        };

        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const label = field.parentNode.querySelector('label');
            
            // Add tooltip on hover
            field.title = fields[fieldId];
            
            // Add formatting indicator on focus
            field.addEventListener('focus', () => {
                field.style.borderColor = '#3b82f6';
                field.style.backgroundColor = '#eff6ff';
            });
            
            field.addEventListener('blur', () => {
                if (!field.classList.contains('error')) {
                    field.style.borderColor = '#e2e8f0';
                    field.style.backgroundColor = '#ffffff';
                }
            });
        });
    }

    setupFormValidation() {
        const form = document.getElementById('accessForm');
        const inputs = form.querySelectorAll('input[required]');
        const selects = form.querySelectorAll('select[required]');
        
        // Validação para inputs
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });

        // Validação para selects
        selects.forEach(select => {
            select.addEventListener('change', () => {
                this.validateField(select);
            });
            
            select.addEventListener('blur', () => {
                this.validateField(select);
            });
        });
    }

    validateField(field) {
        let isValid = field.checkValidity();
        const errorClass = 'error';
        
        // Validação adicional para selects obrigatórios
        if (field.tagName === 'SELECT' && field.hasAttribute('required')) {
            isValid = field.value !== '';
        }
        
        if (!isValid) {
            field.classList.add(errorClass);
            field.style.borderColor = '#dc2626';
            field.style.backgroundColor = '#fef2f2';
        } else {
            field.classList.remove(errorClass);
            field.style.borderColor = '#e2e8f0';
            field.style.backgroundColor = '#ffffff';
        }
        
        return isValid;
    }

    validateCPF(cpf) {
        const cpfInput = document.getElementById('cpf');
        const cleanCPF = cpf.replace(/\D/g, '');
        
        if (cleanCPF.length === 11) {
            const isValid = this.isValidCPF(cleanCPF);
            if (isValid) {
                cpfInput.style.borderColor = '#059669';
                cpfInput.style.backgroundColor = '#f0fdf4';
            } else {
                cpfInput.style.borderColor = '#dc2626';
                cpfInput.style.backgroundColor = '#fef2f2';
            }
        } else {
            cpfInput.style.borderColor = '#e2e8f0';
            cpfInput.style.backgroundColor = '#ffffff';
        }
        
        // Validate with state if both fields are filled
        this.validateCPFWithState();
    }

    isValidCPF(cpf) {
        if (cpf.length !== 11 || /^(.)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        
        return remainder === parseInt(cpf.charAt(10));
    }

    // Função para obter a região fiscal do CPF
    getCPFRegion(cpf) {
        const ninthDigit = parseInt(cpf.charAt(8));
        const regions = {
            1: ['DF', 'GO', 'MS', 'MT', 'TO'],
            2: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR'],
            3: ['CE', 'MA', 'PI'],
            4: ['AL', 'PB', 'PE', 'RN'],
            5: ['BA', 'SE'],
            6: ['MG'],
            7: ['ES', 'RJ'],
            8: ['SP'],
            9: ['PR', 'SC'],
            0: ['RS']
        };
        return regions[ninthDigit] || [];
    }

    // Validação do CPF com o estado informado
    validateCPFWithState() {
        const cpfInput = document.getElementById('cpf');
        const estadoSelect = document.getElementById('estado');
        const messageElement = document.getElementById('cpfValidationMessage');
        
        const cpf = cpfInput.value.replace(/\D/g, '');
        const selectedState = estadoSelect.value;
        
        if (cpf.length === 11 && selectedState) {
            const isValidCPF = this.isValidCPF(cpf);
            const validStates = this.getCPFRegion(cpf);
            const isStateValid = validStates.includes(selectedState);
            
            if (isValidCPF && isStateValid) {
                messageElement.textContent = '✓ CPF válido para o estado informado';
                messageElement.style.color = '#059669';
                cpfInput.style.borderColor = '#059669';
                estadoSelect.style.borderColor = '#059669';
            } else if (isValidCPF && !isStateValid) {
                messageElement.textContent = '❌ CPF não corresponde ao estado informado';
                messageElement.style.color = '#dc2626';
                cpfInput.style.borderColor = '#dc2626';
                estadoSelect.style.borderColor = '#dc2626';
            } else if (!isValidCPF) {
                messageElement.textContent = '❌ CPF inválido';
                messageElement.style.color = '#dc2626';
                cpfInput.style.borderColor = '#dc2626';
            }
        } else {
            messageElement.textContent = '';
            cpfInput.style.borderColor = '#e2e8f0';
            estadoSelect.style.borderColor = '#e2e8f0';
        }
    }

    addUserToQueue() {
        const form = document.getElementById('accessForm');
        const formData = new FormData(form);
        
        // Validate all required fields (inputs and selects)
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        let isFormValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showNotification('Por favor, corrija os campos destacados.', 'error');
            return;
        }
        
        // Validate CPF and state
        const cpf = formData.get('cpf');
        const estado = formData.get('estado');
        const cleanCPF = cpf.replace(/\D/g, '');
        
        if (!this.isValidCPF(cleanCPF)) {
            this.showNotification('CPF inválido. Por favor, verifique o número digitado.', 'error');
            return;
        }
        
        // Validate CPF with state
        const validStates = this.getCPFRegion(cleanCPF);
        if (!validStates.includes(estado)) {
            this.showNotification('CPF não corresponde ao estado informado. Verifique os dados e tente novamente.', 'error');
            return;
        }
        
        // Check for duplicate CPF in queue
        const existingVisitor = this.visitorsQueue.find(visitor => 
            visitor.cpf.replace(/\D/g, '') === cleanCPF
        );
        
        if (existingVisitor) {
            this.showNotification('Este CPF já foi adicionado à lista.', 'warning');
            return;
        }
        
        // Validate and calculate age from birth date
        const dataNascimentoValue = formData.get('dataNascimento');
        if (!dataNascimentoValue) {
            this.showNotification('Por favor, selecione a data de nascimento.', 'error');
            return;
        }
        
        const dataNascimento = new Date(dataNascimentoValue);
        const idade = this.calculateAge(dataNascimento);
        
        if (idade < 0 || idade > 120) {
            this.showNotification('Data de nascimento inválida. Verifique a data informada.', 'error');
            return;
        }
        
        // Get form data
        const visitData = {
            id: Date.now(),
            nome: formData.get('nome').trim(),
            email: formData.get('email').trim().toLowerCase(),
            cpf: cpf,
            estado: estado,
            dataNascimento: formData.get('dataNascimento'),
            idade: idade,
            parentesco: formData.get('parentesco'),
            motivo: formData.get('motivo') || 'Não informado'
        };
        
        // Add to queue
        this.visitorsQueue.push(visitData);
        
        // Reset form with animation
        form.reset();
        this.resetFormStyles();
        
        // Update visitors list
        this.updateVisitorsList();
        this.showVisitorsSection();
        
        this.showNotification(`${visitData.nome} foi adicionado à lista!`, 'success');
    }

    removeVisitorFromQueue(id) {
        this.visitorsQueue = this.visitorsQueue.filter(visitor => visitor.id !== id);
        this.updateVisitorsList();
        
        if (this.visitorsQueue.length === 0) {
            this.hideVisitorsSection();
        }
        
        this.showNotification('Visitante removido da lista.', 'info');
    }

    updateVisitorsList() {
        const visitorsList = document.getElementById('visitorsList');
        const visitorsCount = document.getElementById('visitorsCount');
        
        // Update count
        const count = this.visitorsQueue.length;
        visitorsCount.textContent = `${count} ${count === 1 ? 'visitante' : 'visitantes'}`;
        
        // Clear current list
        visitorsList.innerHTML = '';
        
        // Add each visitor
        this.visitorsQueue.forEach((visitor, index) => {
            const visitorCard = document.createElement('div');
            visitorCard.className = 'visitor-card';
            visitorCard.innerHTML = `
                <div class="visitor-actions">
                    <button class="remove-visitor-btn" onclick="accessControl.removeVisitorFromQueue(${visitor.id})" title="Remover visitante">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="visitor-info">
                    <div class="visitor-field">
                        <label>Nome</label>
                        <span>${visitor.nome}</span>
                    </div>
                    <div class="visitor-field">
                        <label>Email</label>
                        <span>${visitor.email}</span>
                    </div>
                    <div class="visitor-field">
                        <label>CPF</label>
                        <span>${visitor.cpf}</span>
                    </div>
                    <div class="visitor-field">
                        <label>Estado</label>
                        <span>${visitor.estado}</span>
                    </div>
                    <div class="visitor-field">
                        <label>Data de Nascimento</label>
                        <span>${new Date(visitor.dataNascimento).toLocaleDateString('pt-BR')} (${visitor.idade} anos)</span>
                    </div>
                    <div class="visitor-field">
                        <label>Parentesco</label>
                        <span>${visitor.parentesco}</span>
                    </div>
                    <div class="visitor-field">
                        <label>Motivo</label>
                        <span>${visitor.motivo}</span>
                    </div>
                </div>
            `;
            
            // Add animation
            visitorCard.style.opacity = '0';
            visitorCard.style.transform = 'translateY(20px)';
            visitorsList.appendChild(visitorCard);
            
            // Trigger animation
            setTimeout(() => {
                visitorCard.style.transition = 'all 0.3s ease';
                visitorCard.style.opacity = '1';
                visitorCard.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    showVisitorsSection() {
        const visitorsSection = document.getElementById('visitorsSection');
        visitorsSection.style.display = 'block';
        
        // Scroll to visitors section
        setTimeout(() => {
            visitorsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    }

    hideVisitorsSection() {
        const visitorsSection = document.getElementById('visitorsSection');
        visitorsSection.style.display = 'none';
    }

    finalizeAllRegistrations() {
        if (this.visitorsQueue.length === 0) {
            this.showNotification('Não há visitantes na lista para registrar.', 'warning');
            return;
        }
        
        const count = this.visitorsQueue.length;
        const currentTime = new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Generate formatted output
        const formattedOutput = this.generateFormattedOutput(currentTime);
        console.log('📊 Dados formatados gerados:', formattedOutput.length, 'caracteres');
        
        // Show formatted data in custom modal
        console.log('🎯 Chamando showFormattedDataModal...');
        this.showFormattedDataModal(formattedOutput);
        
        // Clear the queue
        this.visitorsQueue = [];
        this.hideVisitorsSection();
        
        // Show success message
        this.showNotification(`${count} ${count === 1 ? 'visitante registrado' : 'visitantes registrados'} com sucesso às ${currentTime}!`, 'success');
        
        // Scroll back to form
        document.querySelector('.form-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    generateFormattedOutput(currentTime) {
        const familyId = this.generateFamilyId();
        let output = '';
        
        // Generate data for each visitor
        this.visitorsQueue.forEach((visitor, index) => {
            const personNumber = index + 1;
            const userId = this.generateUserId();
            
            output += `P${personNumber}>\n`;
            output += `Nome: ${visitor.nome}\n`;
            output += `Email: ${visitor.email}\n`;
            output += `CPF: ${visitor.cpf}\n`;
            output += `Estado: ${visitor.estado}\n`;
            output += `Data: ${new Date(visitor.dataNascimento).toLocaleDateString('pt-BR')}\n`;
            output += `Parentesco: ${visitor.parentesco}\n`;
            output += `Motivo: ${visitor.motivo}\n`;
            output += `ID_Usuario: ${userId}\n`;
            output += `ID_Familia: ${familyId}\n\n`;
        });
        
        // Add additional info
        output += `Add_Info>\n`;
        output += `Hora_Cadastro: ${currentTime}\n`;
        output += `Usuarios_cadastrados: ${this.visitorsQueue.length}`;
        
        return output;
    }

    generateFamilyId() {
        // Generate a unique family ID (same for all members of this registration)
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `FAM${timestamp.toString().slice(-6)}${random}`;
    }

    generateUserId() {
        // Generate a unique user ID for each individual
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `USR${timestamp.toString().slice(-8)}${random}`;
    }

    // Função para criptografar dados usando DES
    encryptData(data) {
        try {
            // Validar se a chave está disponível
            if (typeof ENCRYPTION_CONFIG === 'undefined') {
                throw new Error('Configuração de criptografia não encontrada');
            }
            
            ENCRYPTION_CONFIG.validateKey();
            const key = ENCRYPTION_CONFIG.getKey();
            
            // Converter a chave para o formato adequado
            const keyHex = CryptoJS.enc.Utf8.parse(key);
            
            // Criptografar usando DES
            const encrypted = CryptoJS.DES.encrypt(data, keyHex, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            
            // Retornar o resultado em Base64
            return encrypted.toString();
            
        } catch (error) {
            console.error('Erro na criptografia:', error);
            throw new Error('Falha na criptografia dos dados');
        }
    }

    // Função para descriptografar dados (para teste/validação)
    decryptData(encryptedData) {
        try {
            ENCRYPTION_CONFIG.validateKey();
            const key = ENCRYPTION_CONFIG.getKey();
            const keyHex = CryptoJS.enc.Utf8.parse(key);
            
            const decrypted = CryptoJS.DES.decrypt(encryptedData, keyHex, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Erro na descriptografia:', error);
            return null;
        }
    }

    showFormattedDataModal(formattedOutput) {
        console.log('🚀 Iniciando showFormattedDataModal...');
        console.log('📝 Dados originais (primeiros 200 chars):', formattedOutput.substring(0, 200) + '...');
        
        // Criptografar os dados antes de exibir
        let encryptedData;
        try {
            console.log('🔐 Iniciando criptografia...');
            encryptedData = this.encryptData(formattedOutput);
            console.log('✅ Dados criptografados com sucesso!');
            console.log('🔒 Dados criptografados (primeiros 100 chars):', encryptedData.substring(0, 100) + '...');
        } catch (error) {
            console.error('❌ Erro na criptografia:', error);
            this.showNotification('Erro ao criptografar os dados: ' + error.message, 'error');
            return;
        }

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'data-modal-overlay';
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'data-modal qr-modal';
        
        modal.innerHTML = `
            <div class="data-modal-header">
                <h3><i class="fas fa-qrcode"></i> QR Code - Cadastro Criptografado</h3>
                <button class="data-modal-close" onclick="this.closest('.data-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="data-modal-body qr-body">
                <div class="qr-info">
                    <p class="qr-description">
                        <i class="fas fa-qrcode"></i>
                        Apresente seu QRCode no local de acesso
                    </p>
                </div>
                
                <div class="qr-container">
                    <div id="qrcode-display" class="qr-display">
                        <!-- QR Code será gerado aqui -->
                    </div>
                </div>
            </div>
            <div class="data-modal-footer">
                <button class="btn-close-modal" onclick="this.closest('.data-modal-overlay').remove()">
                    <i class="fas fa-check"></i> Fechar
                </button>
            </div>
        `;
        

        
        console.log('🎭 Adicionando modal ao DOM...');
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Gerar QR Code após adicionar ao DOM
        setTimeout(() => {
            console.log('⏰ Iniciando geração do QR Code (timeout)...');
            this.generateQRCode(encryptedData, 'qrcode-display');
            overlay.classList.add('show');
            console.log('✨ Modal exibido!');
        }, 10);
    }

    // Função de teste para depuração
    testQRCode() {
        console.log('🧪 TESTE MANUAL DE QR CODE');
        
        // Teste 1: Dados simples
        const testData = "Teste simples";
        console.log('📝 Testando com dados simples:', testData);
        
        // Criar container de teste
        const testContainer = document.createElement('div');
        testContainer.id = 'test-qr-container';
        testContainer.style.cssText = 'position: fixed; top: 50px; left: 50px; z-index: 9999; background: white; padding: 20px; border: 2px solid red;';
        document.body.appendChild(testContainer);
        
        this.generateQRCode(testData, 'test-qr-container');
        
        // Remover após 10 segundos
        setTimeout(() => {
            document.body.removeChild(testContainer);
        }, 10000);
    }

    // Função para gerar QR Code usando biblioteca Nayuki (offline)
    generateQRCode(data, containerId) {
        console.log('🔄 Iniciando geração do QR Code offline...');
        console.log('📊 Dados para QR Code (primeiros 100 chars):', data.substring(0, 100) + '...');
        console.log('🎯 Container ID:', containerId);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Container do QR Code não encontrado:', containerId);
            return;
        }

        console.log('✅ Container encontrado:', container);
        
        // Limpar container
        container.innerHTML = '';
        
        // Verificar se a biblioteca qrcodegen está disponível
        if (typeof qrcodegen === 'undefined') {
            console.error('❌ Biblioteca qrcodegen não está carregada!');
            container.innerHTML = `
                <div class="qr-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Biblioteca QR Code offline não carregada</p>
                    <small>Arquivo qrcodegen-v1.8.0-es6.js não encontrado</small>
                    <br><br>
                    <details>
                        <summary>Mostrar dados criptografados</summary>
                        <pre style="font-size: 10px; word-break: break-all; background: #f5f5f5; padding: 10px; margin: 10px 0;">${data.substring(0, 500)}...</pre>
                    </details>
                </div>
            `;
            return;
        }
        
        console.log('✅ Biblioteca qrcodegen disponível');
        
        try {
            // Verificar tamanho dos dados
            console.log('📏 Tamanho dos dados:', data.length, 'caracteres');
            
            // Gerar QR Code usando a biblioteca Nayuki
            console.log('🎨 Gerando QR Code com biblioteca Nayuki...');
            const qr = qrcodegen.QrCode.encodeText(data, qrcodegen.QrCode.Ecc.LOW);
            console.log('✅ QR Code gerado! Versão:', qr.version, 'Tamanho:', qr.size);
            
            // Criar canvas
            const canvas = document.createElement('canvas');
            const scale = 8; // Escala para tornar o QR Code maior
            const border = 4; // Borda em células
            const size = (qr.size + border * 2) * scale;
            
            canvas.width = size;
            canvas.height = size;
            
            const ctx = canvas.getContext('2d');
            
            // Fundo branco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            
            // Desenhar QR Code
            ctx.fillStyle = '#1f2937';
            for (let y = 0; y < qr.size; y++) {
                for (let x = 0; x < qr.size; x++) {
                    if (qr.getModule(x, y)) {
                        ctx.fillRect(
                            (x + border) * scale,
                            (y + border) * scale,
                            scale,
                            scale
                        );
                    }
                }
            }
            
            // Estilizar canvas
            canvas.style.borderRadius = '12px';
            canvas.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
            canvas.style.maxWidth = '300px';
            canvas.style.maxHeight = '300px';
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            
            // Adicionar ao container
            container.appendChild(canvas);
            container.classList.add('qr-loaded');
            
            console.log('✅ QR Code offline adicionado ao container!');
            
        } catch (error) {
            console.error('❌ Erro ao gerar QR Code offline:', error);
            container.innerHTML = `
                <div class="qr-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao gerar QR Code</p>
                    <small>${error.message}</small>
                    <br><br>
                    <details>
                        <summary>Mostrar dados criptografados</summary>
                        <pre style="font-size: 10px; word-break: break-all; background: #f5f5f5; padding: 10px; margin: 10px 0;">${data.substring(0, 500)}...</pre>
                    </details>
                </div>
            `;
        }
    }

    clearAllVisitors() {
        if (this.visitorsQueue.length === 0) {
            this.showNotification('A lista já está vazia.', 'info');
            return;
        }
        
        this.visitorsQueue = [];
        this.hideVisitorsSection();
        this.showNotification('Lista de visitantes limpa.', 'info');
    }

    resetFormStyles() {
        const inputs = document.querySelectorAll('#accessForm input');
        inputs.forEach(input => {
            input.style.borderColor = '#e2e8f0';
            input.style.backgroundColor = '#ffffff';
            input.classList.remove('error');
        });
    }



    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(400px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            maxWidth: '400px'
        });
        
        // Set background color based on type
        const colors = {
            success: '#059669',
            error: '#dc2626',
            warning: '#d97706',
            info: '#2563eb'
        };
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Additional CSS for notifications
const notificationStyles = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
`;

// Add notification styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize the application
let accessControl;

document.addEventListener('DOMContentLoaded', () => {
    window.accessControl = new AccessControl();
    console.log('Sistema de Controle de Acesso carregado com sucesso!');
    
    // Expor função de teste para depuração
    window.testQR = () => {
        window.accessControl.testQRCode();
    };
    
    console.log('🚀 Sistema carregado! Digite "testQR()" no console para testar QR Code');
});

// Initialize character counters method
AccessControl.prototype.initializeCounters = function() {
    // Initialize character counters
    this.updateCharCounter('nomeCounter', 0, 50);
    this.updateCharCounter('emailCounter', 0, 30);
};

// Mobile Optimizations
AccessControl.prototype.setupMobileOptimizations = function() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth <= 768;
    
    if (isMobile) {
        console.log('📱 Modo mobile detectado - aplicando otimizações');
        
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Optimize viewport for mobile
        this.setupMobileViewport();
        
        // Add touch feedback
        this.setupTouchFeedback();
        
        // Optimize form fields for mobile
        this.optimizeFormForMobile();
        
        // Optimize modal behavior for mobile
        this.optimizeModalForMobile();
        
        // Add swipe gestures for modals
        this.setupSwipeGestures();
    }
};

AccessControl.prototype.setupMobileViewport = function() {
    // Ensure proper viewport scaling
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        });
        
        input.addEventListener('blur', () => {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
        });
    });
};

AccessControl.prototype.setupTouchFeedback = function() {
    // Add haptic feedback for button taps (if available)
    const buttons = document.querySelectorAll('button, .btn-add-user, .btn-secondary, .btn-finalize, .btn-clear');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            // Add visual feedback
            button.style.transform = 'scale(0.98)';
            button.style.opacity = '0.8';
            
            // Add haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
        
        button.addEventListener('touchend', () => {
            // Remove visual feedback
            setTimeout(() => {
                button.style.transform = '';
                button.style.opacity = '';
            }, 150);
        });
    });
};

AccessControl.prototype.optimizeFormForMobile = function() {
    // Auto-scroll to focused input on mobile
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            setTimeout(() => {
                input.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }, 300); // Wait for mobile keyboard to appear
        });
    });
    
    // Improve date input for mobile
    const dateInput = document.getElementById('dataNascimento');
    if (dateInput) {
        dateInput.setAttribute('pattern', '[0-9]{4}-[0-9]{2}-[0-9]{2}');
        dateInput.setAttribute('placeholder', 'DD/MM/AAAA');
    }
};

AccessControl.prototype.optimizeModalForMobile = function() {
    // Override modal display for better mobile experience
    const originalShowModal = this.showModal;
    
    this.showModal = function(title, content, isQRCode = false) {
        const modal = originalShowModal.call(this, title, content, isQRCode);
        
        if (window.innerWidth <= 768) {
            // Full screen modal on mobile
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.margin = '0';
            modal.style.borderRadius = '0';
            modal.style.maxHeight = '100vh';
            
            // Add close button to top for mobile
            const header = modal.querySelector('.data-modal-header, .qr-header');
            if (header) {
                header.style.position = 'sticky';
                header.style.top = '0';
                header.style.zIndex = '1000';
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            }
            
            // Optimize QR display for mobile
            if (isQRCode) {
                const qrDisplay = modal.querySelector('.qr-display');
                if (qrDisplay) {
                    qrDisplay.style.margin = '1rem 0';
                    qrDisplay.style.padding = '1rem';
                }
                
                // Make QR code responsive
                const canvas = qrDisplay?.querySelector('canvas');
                if (canvas) {
                    canvas.style.maxWidth = '90vw';
                    canvas.style.maxHeight = '50vh';
                    canvas.style.width = 'auto';
                    canvas.style.height = 'auto';
                }
            }
        }
        
        return modal;
    };
};

AccessControl.prototype.setupSwipeGestures = function() {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    document.addEventListener('touchstart', (e) => {
        const modal = document.querySelector('.data-modal');
        if (modal && modal.style.display !== 'none') {
            startY = e.touches[0].clientY;
            isDragging = true;
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        const modal = document.querySelector('.data-modal');
        if (modal && deltaY > 0) {
            // Allow swipe down to close modal
            modal.style.transform = `translateY(${Math.min(deltaY * 0.5, 100)}px)`;
            modal.style.opacity = Math.max(1 - deltaY / 300, 0.3);
        }
    });
    
    document.addEventListener('touchend', () => {
        if (!isDragging) return;
        
        const modal = document.querySelector('.data-modal');
        const deltaY = currentY - startY;
        
        if (modal) {
            if (deltaY > 100) {
                // Close modal if swiped down enough
                this.closeModal();
            } else {
                // Reset modal position
                modal.style.transform = '';
                modal.style.opacity = '';
            }
        }
        
        isDragging = false;
    });
};