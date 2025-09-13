# Sistema de Controle de Acesso - Parque Audicom
## Programa de Desbloqueio

### 🎯 **Funcionalidades Principais**

1. **📱 Scanner QR Code com Câmera**
   - Leitura automática de QR Codes
   - Interface visual com indicadores de scan
   - Suporte a múltiplas câmeras

2. **🔓 Sistema de Catraca Inteligente**
   - Indicador luminoso (Verde = Liberada, Vermelho = Bloqueada, Amarelo = Processando)
   - Liberação automática baseada no número de visitantes
   - Botão "Cliente Passou" para controlar passagem

3. **🔐 Descriptografia DES**
   - Descriptografia automática dos QR Codes do site cliente
   - Mesma chave de criptografia (AUDICOM)
   - Validação de integridade dos dados

4. **💾 Banco de Dados em Memória**
   - Armazenamento temporário (perdido ao recarregar)
   - Registro completo de visitantes e scans
   - Estatísticas em tempo real

5. **📊 Dashboard com Gráficos**
   - Estatísticas de idade média
   - Distribuição por estados
   - Gráficos de faixa etária
   - Log de acessos recentes

### 🚀 **Como Usar**

1. **Iniciar o Sistema:**
   - Abra o arquivo `index.html` no navegador
   - Permita acesso à câmera quando solicitado

2. **Escanear QR Code:**
   - Clique em "Iniciar Câmera"
   - Posicione o QR Code na área destacada
   - O sistema automaticamente descriptografa e processa

3. **Controlar a Catraca:**
   - Após scan válido, a catraca libera automaticamente
   - Use "Cliente Passou" para cada pessoa que passar
   - A catraca bloqueia automaticamente quando todos passarem

4. **Monitorar Dashboard:**
   - Visualize estatísticas em tempo real
   - Acompanhe distribuição por idade e estado
   - Consulte log de acessos recentes

### ⌨️ **Atalhos de Teclado**

- **Ctrl + P**: Cliente passou pela catraca
- **Ctrl + R**: Resetar catraca
- **Ctrl + S**: Iniciar/Parar câmera
- **F5**: Atualizar dashboard

### 🔧 **Comandos de Debug (Console)**

```javascript
// Executar diagnóstico completo
runDiagnostics()

// Simular scan de QR Code para teste
testQR()

// Informações do sistema
systemInfo()
```

### 📋 **Fluxo de Funcionamento**

1. **QR Code Escaneado** → 2. **Descriptografia DES** → 3. **Dados Parseados** → 4. **Visitantes Registrados** → 5. **Catraca Liberada** → 6. **Controle de Passagem** → 7. **Estatísticas Atualizadas**

### 🎨 **Interface Visual**

- **Status Light**: Indica status do sistema (Verde/Amarelo/Vermelho)
- **Turnstile Light**: Indica status da catraca
- **Scanner Overlay**: Área de foco para QR Code
- **Charts**: Gráficos interativos com Chart.js

### 🔒 **Segurança**

- Mesma chave DES do site cliente (AUDICOM)
- Dados criptografados em trânsito
- Validação de integridade dos QR Codes
- Armazenamento temporário (não persistente)

### 📱 **Compatibilidade**

- Chrome/Edge (recomendado para câmera)
- Firefox (suporte limitado à câmera)
- Safari (iOS/macOS com limitações)
- Requer HTTPS para acesso à câmera em produção

### 🎯 **Exemplo de Uso**

1. Visitante gera QR Code no site cliente (3 pessoas)
2. Apresenta QR Code no terminal de controle
3. Sistema lê, descriptografa e registra 3 visitantes
4. Catraca libera para 3 entradas
5. Operador clica "Cliente Passou" 3 vezes
6. Catraca bloqueia automaticamente
7. Dashboard atualiza estatísticas

### 🛠️ **Arquivos do Sistema**

- `index.html` - Interface principal
- `styles.css` - Estilos e design responsivo
- `script.js` - Controlador principal do sistema
- `database.js` - Banco de dados em memória
- `qr-reader.js` - Sistema de leitura de QR Code
- `dashboard.js` - Dashboard e gráficos
- `chave.js` - Configuração de criptografia

### ⚠️ **Observações Importantes**

- Os dados são perdidos ao recarregar a página
- Requer permissão de câmera do navegador
- Funciona offline após carregamento inicial
- Otimizado para uso em desktop/tablet