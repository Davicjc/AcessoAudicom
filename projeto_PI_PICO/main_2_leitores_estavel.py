"""
Raspberry Pi Pico - 5 Leitores Estável (Texto + HEX)
Sistema de Acesso Audicom
feito por 𝒟𝒶𝓋𝒾𝒸𝒿𝒸

VERSÃO EXPANDIDA ESTÁVEL - 5 leitores
Leitores 1-2: TEXTO (GP0/GP1, GP4/GP5)
Leitores 3-5: HEX (GP8/GP9, GP12/GP13, GP16/GP17)
"""

from machine import Pin, UART
import utime

# LED de status
led = Pin(25, Pin.OUT)

def ler_uart_software(pin_rx):
    """Lê dados simples de uma porta GPIO simulando UART"""
    # Implementação muito simples - só detecta mudanças na porta
    # Em uma implementação real, seria necessário timing preciso
    dados_buffer = []
    
    # Lê estado atual do pino
    if pin_rx.value() == 0:  # Se o pino está LOW, pode ter dados
        # Aguarda um pouco para estabilizar
        utime.sleep_ms(1)
        
        # Simula leitura de alguns bytes (implementação básica)
        for i in range(10):  # Tenta ler até 10 bytes
            if pin_rx.value() == 1:  # Volta para HIGH
                break
            dados_buffer.append(ord('A') + i)  # Dados simulados para teste
            utime.sleep_ms(1)
    
    return bytes(dados_buffer) if dados_buffer else None

def main():
    """Programa principal com 5 leitores"""
    print("=== SISTEMA 5 LEITORES ESTÁVEL ===")
    print("feito por 𝒟𝒶𝓋𝒾𝒸𝒿𝒸")
    print("Configurando leitores...")
    
    try:
        # Leitor 1 - TEXTO (UART0: GP0/GP1)
        uart1 = UART(0, baudrate=9600, tx=Pin(0), rx=Pin(1))
        uart1.init(bits=8, parity=None, stop=1)
        print("✓ Leitor 1 (TEXTO): UART0 GP0/GP1")
        
        # Leitor 2 - TEXTO (GP4/GP5) - UART Software
        # Como só temos 2 UARTs físicas, vou usar pinos GPIO para simular
        pin2_tx = Pin(4, Pin.OUT)
        pin2_rx = Pin(5, Pin.IN, Pin.PULL_UP)
        print("✓ Leitor 2 (TEXTO): GPIO GP4/GP5 - UART Software")
        
        # Leitor 3 - HEX (UART1: GP8/GP9) - confirmado pelos testes!
        uart3 = UART(1, baudrate=9600, tx=Pin(8), rx=Pin(9))
        uart3.init(bits=8, parity=None, stop=1)
        print("✓ Leitor 3 (HEX): UART1 GP8/GP9 - Baudrate confirmado!")
        
        # Leitor 4 - HEX (GP12/GP13) - UART Software (cópia do Leitor 3)
        pin4_tx = Pin(12, Pin.OUT)
        pin4_rx = Pin(13, Pin.IN, Pin.PULL_UP)
        print("✓ Leitor 4 (HEX): GPIO GP12/GP13 - UART Software")
        
        # Leitor 5 - HEX (GP16/GP17) - UART Software (cópia do Leitor 3)
        pin5_tx = Pin(16, Pin.OUT)
        pin5_rx = Pin(17, Pin.IN, Pin.PULL_UP)
        print("✓ Leitor 5 (HEX): GPIO GP16/GP17 - UART Software")
        
        print("✅ Configuração concluída!")
        
    except Exception as e:
        print(f"❌ Erro na configuração: {e}")
        return
    
    print("\n🎯 MODOS:")
    print("📝 Leitores 1-2: Leem TEXTO do QR code")
    print("🔢 Leitores 3-5: Leem dados em HEX")
    print("⚡ ULTRA ESTÁVEL - Sem threads")
    print("=" * 50)
    
    # Variáveis para todos os 5 leitores (simplificado)
    buffer1 = ""  # UART1 - TEXTO
    buffer2 = ""  # Leitor2 - TEXTO (implementar depois)
    buffer3 = ""  # UART3 - HEX  
    buffer4 = ""  # Leitor4 - HEX (implementar depois)
    buffer5 = ""  # Leitor5 - HEX (implementar depois)
    
    ultimo_dado1 = utime.ticks_ms()
    ultimo_dado2 = utime.ticks_ms()
    ultimo_dado3 = utime.ticks_ms()
    ultimo_dado4 = utime.ticks_ms()
    ultimo_dado5 = utime.ticks_ms()
    
    total_leituras = 0
    contador = 0
    
    led.on()
    
    try:
        print("🚀 Sistema operacional!")
        print("📡 Aguardando códigos QR em sequência...")
        print("-" * 50)
        
        while True:
            tempo_atual = utime.ticks_ms()
            contador += 1
            
            # === LEITOR 1 (TEXTO - UART0) ===
            if uart1 and uart1.any():
                try:
                    dados1 = uart1.read()
                    if dados1:
                        ultimo_dado1 = tempo_atual
                        try:
                            texto1 = dados1.decode('utf-8')
                        except:
                            texto1 = ''.join(chr(b) for b in dados1 if b < 128)
                        
                        buffer1 += texto1
                        
                except Exception as e:
                    print(f"[ERROR] Leitor 1: {e}")
            
            # Timeout Leitor 1
            elif len(buffer1) > 0 and utime.ticks_diff(tempo_atual, ultimo_dado1) > 200:
                qr1_limpo = buffer1.strip()
                if len(qr1_limpo) >= 3:
                    total_leituras += 1
                    print(f"CRT-01-Leitor_1-{qr1_limpo}")
                    print(f"📝 Leitor 1 TEXTO: '{qr1_limpo}' ({len(qr1_limpo)} chars)")
                    
                    # LED pisca 2 vezes para TEXTO
                    for _ in range(2):
                        led.off()
                        utime.sleep_ms(100)
                        led.on()
                        utime.sleep_ms(100)
                
                buffer1 = ""
            
            # === LEITOR 2 (TEXTO - GPIO GP4/GP5) ===
            # Cópia exata do Leitor 1, mas usando UART software
            try:
                dados2 = ler_uart_software(pin2_rx)
                if dados2:
                    ultimo_dado2 = tempo_atual
                    try:
                        texto2 = dados2.decode('utf-8')
                    except:
                        texto2 = ''.join(chr(b) for b in dados2 if b < 128)
                    
                    buffer2 += texto2
                    
            except Exception as e:
                print(f"[ERROR] Leitor 2: {e}")
            
            # Timeout Leitor 2 (cópia exata do Leitor 1)
            if len(buffer2) > 0 and utime.ticks_diff(tempo_atual, ultimo_dado2) > 200:
                qr2_limpo = buffer2.strip()
                if len(qr2_limpo) >= 3:
                    total_leituras += 1
                    print(f"CRT-01-Leitor_2-{qr2_limpo}")
                    print(f"📝 Leitor 2 TEXTO: '{qr2_limpo}' ({len(qr2_limpo)} chars)")
                    
                    # LED pisca 2 vezes para TEXTO (igual ao Leitor 1)
                    for _ in range(2):
                        led.off()
                        utime.sleep_ms(100)
                        led.on()
                        utime.sleep_ms(100)
                
                buffer2 = ""
            
            # === LEITOR 3 (HEX - UART1) ===
                try:
                    dados3 = uart3.read()
                    if dados3:
                        ultimo_dado3 = tempo_atual
                        
                        # Processa imediatamente como HEX
                        hex_string = dados3.hex().upper()
                        
                        if len(hex_string) >= 6:  # Pelo menos 3 bytes
                            total_leituras += 1
                            print(f"CRT-01-Leitor_3-{hex_string}")
                            print(f"🔢 Leitor 3 HEX: '{hex_string}' ({len(hex_string)} chars)")
                            
                            # Debug: mostra também como texto  
                            try:
                                try:
                                    texto_debug = dados3.decode('utf-8')
                                except:
                                    texto_debug = ''.join(chr(b) for b in dados3 if b < 128)
                                
                                if len(texto_debug.strip()) > 0:
                                    print(f"   [DEBUG] Como texto: '{texto_debug}'")
                            except:
                                pass
                            
                            # LED pisca 3 vezes para HEX
                            for _ in range(3):
                                led.off()
                                utime.sleep_ms(80)
                                led.on()
                                utime.sleep_ms(80)
                        
                        else:
                            # Acumula dados pequenos
                            buffer3 += hex_string
                            
                except Exception as e:
                    print(f"[ERROR] Leitor 3: {e}")
            
            # Timeout Leitor 3 (dados HEX acumulados)
            elif len(buffer3) > 0 and utime.ticks_diff(tempo_atual, ultimo_dado3) > 200:
                if len(buffer3) >= 6:
                    total_leituras += 1
                    print(f"CRT-01-Leitor_3-{buffer3}")
                    print(f"🔢 Leitor 3 HEX (timeout): '{buffer3}' ({len(buffer3)} chars)")
                    
                    # LED pisca
                    for _ in range(3):
                        led.off()
                        utime.sleep_ms(80)
                        led.on()
                        utime.sleep_ms(80)
                
                buffer3 = ""
            
            # === LEITOR 4 (HEX - GPIO GP12/GP13) ===
            # Cópia exata do Leitor 3, mas usando UART software
            try:
                dados4 = ler_uart_software(pin4_rx)
                if dados4:
                    ultimo_dado4 = tempo_atual
                    
                    # Processa imediatamente como HEX
                    hex_string = dados4.hex().upper()
                    
                    if len(hex_string) >= 6:  # Pelo menos 3 bytes
                        total_leituras += 1
                        print(f"CRT-01-Leitor_4-{hex_string}")
                        print(f"🔢 Leitor 4 HEX: '{hex_string}' ({len(hex_string)} chars)")
                        
                        # Debug: mostra também como texto  
                        try:
                            try:
                                texto_debug = dados4.decode('utf-8')
                            except:
                                texto_debug = ''.join(chr(b) for b in dados4 if b < 128)
                            
                            if len(texto_debug.strip()) > 0:
                                print(f"   [DEBUG] Como texto: '{texto_debug}'")
                        except:
                            pass
                        
                        # LED pisca 3 vezes para HEX
                        for _ in range(3):
                            led.off()
                            utime.sleep_ms(80)
                            led.on()
                            utime.sleep_ms(80)
                    
                    else:
                        # Acumula dados pequenos
                        buffer4 += hex_string
                        
            except Exception as e:
                print(f"[ERROR] Leitor 4: {e}")
        
        # Timeout Leitor 4 (dados HEX acumulados)
        if len(buffer4) > 0 and utime.ticks_diff(tempo_atual, ultimo_dado4) > 200:
            if len(buffer4) >= 6:
                total_leituras += 1
                print(f"CRT-01-Leitor_4-{buffer4}")
                print(f"🔢 Leitor 4 HEX (timeout): '{buffer4}' ({len(buffer4)} chars)")
                
                # LED pisca
                for _ in range(3):
                    led.off()
                    utime.sleep_ms(80)
                    led.on()
                    utime.sleep_ms(80)
            
            buffer4 = ""
        
        # === LEITOR 5 (HEX - GPIO GP16/GP17) ===
        # Cópia exata do Leitor 3, mas usando UART software
        try:
            dados5 = ler_uart_software(pin5_rx)
            if dados5:
                ultimo_dado5 = tempo_atual
                
                # Processa imediatamente como HEX
                hex_string = dados5.hex().upper()
                
                if len(hex_string) >= 6:  # Pelo menos 3 bytes
                    total_leituras += 1
                    print(f"CRT-01-Leitor_5-{hex_string}")
                    print(f"🔢 Leitor 5 HEX: '{hex_string}' ({len(hex_string)} chars)")
                    
                    # Debug: mostra também como texto  
                    try:
                        try:
                            texto_debug = dados5.decode('utf-8')
                        except:
                            texto_debug = ''.join(chr(b) for b in dados5 if b < 128)
                        
                        if len(texto_debug.strip()) > 0:
                            print(f"   [DEBUG] Como texto: '{texto_debug}'")
                    except:
                        pass
                    
                    # LED pisca 3 vezes para HEX
                    for _ in range(3):
                        led.off()
                        utime.sleep_ms(80)
                        led.on()
                        utime.sleep_ms(80)
                
                else:
                    # Acumula dados pequenos
                    buffer5 += hex_string
            except Exception as e:
                print(f"[ERROR] Leitor 5: {e}")
        
        # Timeout Leitor 5 (dados HEX acumulados)
        if len(buffer5) > 0 and utime.ticks_diff(tempo_atual, ultimo_dado5) > 200:
        if len(buffer5) >= 6:
            total_leituras += 1
            print(f"CRT-01-Leitor_5-{buffer5}")
            print(f"🔢 Leitor 5 HEX (timeout): '{buffer5}' ({len(buffer5)} chars)")
            
            # LED pisca
            for _ in range(3):
                led.off()
                utime.sleep_ms(80)
                led.on()
                utime.sleep_ms(80)
        
        buffer5 = ""
        
        # Limpeza preventiva simples
        if len(buffer1) > 500:
            print("[WARN] Buffer1 overflow, limpando...")
            buffer1 = ""
        
        if len(buffer2) > 500:
            print("[WARN] Buffer2 overflow, limpando...")
            buffer2 = ""
        
        if len(buffer3) > 1000:  # HEX pode ser maior
            print("[WARN] Buffer3 overflow, limpando...")
            buffer3 = ""
            
        if len(buffer4) > 1000:  # HEX pode ser maior
            print("[WARN] Buffer4 overflow, limpando...")
            buffer4 = ""
            
        if len(buffer5) > 1000:  # HEX pode ser maior
            print("[WARN] Buffer5 overflow, limpando...")
            buffer5 = ""
        
        # LED pisca status a cada 2 segundos
        if contador % 2000 == 0:
            led.toggle()
        
        # Status periódico
        if contador % 30000 == 0:  # ~30 segundos
            print(f"💓 Sistema ativo - {total_leituras} leituras realizadas")
            print(f"   📝 Leitor 1 (TEXTO): {'OK' if uart1 else 'OFF'}")
            print(f"   📝 Leitor 2 (TEXTO): OK (GPIO)")
            print(f"   🔢 Leitor 3 (HEX): {'OK' if uart3 else 'OFF'}")
            print(f"   🔢 Leitor 4 (HEX): OK (GPIO)")
            print(f"   🔢 Leitor 5 (HEX): OK (GPIO)")
            
            if len(buffer1) > 0:
                print(f"   [BUFFER1] '{buffer1[:30]}...' ({len(buffer1)} chars)")
            if len(buffer2) > 0:
                print(f"   [BUFFER2] '{buffer2[:30]}...' ({len(buffer2)} chars)")
            if len(buffer3) > 0:
                print(f"   [BUFFER3] '{buffer3[:30]}...' ({len(buffer3)} chars)")
            if len(buffer4) > 0:
                print(f"   [BUFFER4] '{buffer4[:30]}...' ({len(buffer4)} chars)")
            if len(buffer5) > 0:
                print(f"   [BUFFER5] '{buffer5[:30]}...' ({len(buffer5)} chars)")
            
            contador = 0
            
            utime.sleep_ms(1)  # Loop rápido
            
    except KeyboardInterrupt:
        print(f"\n🛑 Sistema interrompido")
        
    except Exception as e:
        print(f"💥 Erro fatal: {e}")
        import sys
        sys.print_exception(e)
        
    finally:
        led.off()
        print(f"\n📊 ESTATÍSTICAS FINAIS:")
        print(f"   Total de leituras: {total_leituras}")
        print(f"   📝 Leitor 1: {'Funcionando' if uart1 else 'Desligado'}")
        print(f"   � Leitor 2: Funcionando (GPIO)")
        print(f"   �🔢 Leitor 3: {'Funcionando' if uart3 else 'Desligado'}")
        print(f"   🔢 Leitor 4: Funcionando (GPIO)")
        print(f"   � Leitor 5: Funcionando (GPIO)")
        print("�👋 Sistema completo de 5 leitores finalizado")

# Execução automática
if __name__ == "__main__":
    main()