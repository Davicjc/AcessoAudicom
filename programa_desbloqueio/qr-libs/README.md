# 📚 Bibliotecas QR Code - Programa Desbloqueio

Esta pasta contém as bibliotecas necessárias para leitura e geração de QR Codes no sistema de controle de acesso.

## 📁 Arquivos Disponíveis

### `instascan.min.js`
- **Função**: Leitura de QR Codes via câmera webcam
- **Uso**: Scanner de QR Codes em tempo real
- **Compatibilidade**: Navegadores modernos com suporte a WebRTC

### `qrcode.js`
- **Função**: Geração de QR Codes
- **Uso**: Criar códigos QR para visitantes (se necessário)
- **Saída**: Canvas, SVG ou HTML

### `exemplo.html`
- **Função**: Página de demonstração das bibliotecas
- **Conteúdo**: Exemplos práticos de uso das duas bibliotecas
- **Acesso**: Abrir no navegador para testar funcionalidades

## 🚀 Como Usar

### No HTML Principal
```html
<!-- Carregamento das bibliotecas -->
<script src="qr-libs/instascan.min.js"></script>
<script src="qr-libs/qrcode.js"></script>
```

### Instascan (Scanner de QR Code)
```javascript
// Inicializar scanner
let scanner = new Instascan.Scanner({ 
    video: document.getElementById('preview'), 
    mirror: false 
});

// Detectar QR Code
scanner.addListener('scan', function (content) {
    console.log('QR Code detectado:', content);
    // Processar conteúdo do QR Code
});

// Iniciar câmera
Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
        scanner.start(cameras[0]);
    }
});
```

### QRCode.js (Geração de QR Code)
```javascript
// Gerar QR Code
var qr = new QRCode(document.getElementById("qrcode"), {
    text: "Dados do visitante",
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff"
});
```

## 🔧 Configuração no Sistema Principal

O sistema já está configurado para usar essas bibliotecas:

1. **index.html** - Carrega `instascan.min.js` 
2. **qr-reader.js** - Usa Instascan para leitura de QR Codes
3. **Timeout corrigido** - Agora aguarda 5 segundos entre leituras

## ⚡ Melhorias Implementadas

### ✅ Correção do Travamento
- **Problema**: Sistema travava após ler um QR Code
- **Solução**: Implementado countdown de 5 segundos entre leituras
- **Resultado**: Sistema reativa automaticamente após cooldown

### ✅ Feedback Visual
- Status atualizado em tempo real
- Countdown visual (5, 4, 3, 2, 1...)
- Mensagens claras para o usuário

### ✅ Bibliotecas Locais
- Instascan integrado localmente
- QRCode.js disponível para uso futuro
- Sem dependência de CDNs externos para QR

## 🧪 Testando o Sistema

1. **Abrir o programa**: `programa_desbloqueio/index.html`
2. **Ativar câmera**: Clique em "Ativar Câmera" 
3. **Escanear QR Code**: Use um QR Code do site cliente
4. **Observar cooldown**: Sistema mostra "Aguarde Xs..." por 5 segundos
5. **Reativação**: Após 5s, sistema fica pronto para próximo scan

## 📱 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox 
- ✅ Safari (limitações de câmera)
- ❌ Internet Explorer (não suportado)

## 🔍 Debug e Logs

O sistema registra no console:
```
⏱️ Aguardando 5 segundos para próximo scan...
✅ Scanner reativado - pronto para próximo QR Code
🔄 Processando QR Code...
```

## 📋 Notas Importantes

- **Permissão de câmera**: Necessária para funcionamento
- **HTTPS**: Requerido para acesso à câmera em produção
- **Timeout**: Configurável no arquivo `qr-reader.js` (linha do setTimeout)
- **Teste local**: Funciona em `file://` para desenvolvimento

---

**Status**: ✅ Funcional com correção de travamento implementada
**Versão**: 1.1 - Cooldown de 5 segundos integrado
**Última atualização**: 12/09/2025