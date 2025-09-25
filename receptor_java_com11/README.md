# 📡 Receptor COM11 - Sistema Acesso Audicom

Receptor Python para capturar dados dos leitores QR conectados na porta **COM11**.

## 🚀 Como usar:

### Método 1 - Script automático:
```bash
# Execute o arquivo .bat (Windows)
iniciar_receptor.bat
```

### Método 2 - Manual:
```bash
# 1. Instale as dependências
pip install pyserial

# 2. Execute o receptor
python receptor_com11.py
```

## 📋 Funcionalidades:

✅ **Conexão automática** na COM11 (9600 baud)  
✅ **Detecção inteligente** de formato CRT do Pico  
✅ **Timestamp** em todas as leituras  
✅ **Contador** de leituras totais  
✅ **Thread segura** para leitura contínua  
✅ **Tratamento de erros** robusto  
✅ **Saída formatada** com emojis  

## 📊 Exemplo de saída:

```
🚀 Sistema Receptor COM11 - Acesso Audicom
============================================================
📍 Porta: COM11
⚡ Baudrate: 9600
🕐 Iniciado em: 24/09/2025 15:30:45
============================================================
✅ Conectado na porta COM11 - 9600 baud
📡 Aguardando dados dos leitores QR...
------------------------------------------------------------

[15:30:52] 🎯 Leitor_1: https://davicjc.github.io
   📊 Total: 1 leituras
------------------------------------------------------------

[15:30:58] 🎯 Leitor_3: 68747470733A2F2F646176696367632E6769746875622E696F
   📊 Total: 2 leituras
------------------------------------------------------------
```

## 🔧 Configuração:

- **Porta:** COM11 (modificável no código)
- **Baudrate:** 9600 (padrão do Pico)
- **Formato esperado:** `CRT-01-Leitor_X-{dados}`

## ⚠️ Requisitos:

- Python 3.6+
- pyserial
- Raspberry Pi Pico conectado na COM11

---
*feito por 𝒟𝒶𝓋𝒾𝒸𝒿𝒸*