"""
Receptor Serial COM11 - Sistema Acesso Audicom
Captura dados dos leitores QR conectados na COM11
feito por 𝒟𝒶𝓋𝒾𝒸𝒿𝒸
"""

import serial
import time
import datetime
import sys
import threading
from queue import Queue

class ReceptorCOM11:
    def __init__(self, porta='COM11', baudrate=9600):
        self.porta = porta
        self.baudrate = baudrate
        self.serial_conn = None
        self.running = False
        self.dados_queue = Queue()
        self.total_leituras = 0
        
    def conectar(self):
        """Estabelece conexão com a porta serial"""
        try:
            self.serial_conn = serial.Serial(
                port=self.porta,
                baudrate=self.baudrate,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
                timeout=1,
                xonxoff=False,
                rtscts=False,
                dsrdtr=False
            )
            
            print(f"✅ Conectado na porta {self.porta} - {self.baudrate} baud")
            print(f"📡 Aguardando dados dos leitores QR...")
            print("-" * 60)
            return True
            
        except serial.SerialException as e:
            print(f"❌ Erro ao conectar na porta {self.porta}: {e}")
            return False
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")
            return False
    
    def processar_dados(self, dados_raw):
        """Processa e formata os dados recebidos"""
        try:
            # Tenta decodificar como UTF-8
            try:
                dados_texto = dados_raw.decode('utf-8').strip()
            except:
                dados_texto = dados_raw.decode('latin-1').strip()
            
            if len(dados_texto) > 0:
                timestamp = datetime.datetime.now().strftime("%H:%M:%S")
                self.total_leituras += 1
                
                # Verifica se é formato CRT (do Pico)
                if dados_texto.startswith('CRT-01-Leitor_'):
                    partes = dados_texto.split('-')
                    if len(partes) >= 4:
                        leitor = partes[2]  # Leitor_1, Leitor_2, etc.
                        conteudo = '-'.join(partes[3:])
                        
                        # Identifica o tipo baseado no leitor
                        if leitor in ['Leitor_1', 'Leitor_2']:
                            tipo = "📝 TEXTO"
                        elif leitor in ['Leitor_3', 'Leitor_4', 'Leitor_5']:
                            tipo = "🔢 HEX"
                        else:
                            tipo = "❓ DESCONHECIDO"
                        
                        print(f"[{timestamp}] 🎯 {leitor} ({tipo}): {conteudo}")
                        print(f"   📊 Total: {self.total_leituras} leituras")
                else:
                    # Dados brutos
                    print(f"[{timestamp}] 📨 Dados: {dados_texto}")
                    print(f"   🔢 HEX: {dados_raw.hex().upper()}")
                    print(f"   📊 Total: {self.total_leituras} leituras")
                
                print("-" * 60)
                
        except Exception as e:
            print(f"❌ Erro ao processar dados: {e}")
    
    def ler_serial(self):
        """Thread para leitura contínua da porta serial"""
        buffer_dados = b""
        
        while self.running:
            try:
                if self.serial_conn and self.serial_conn.in_waiting > 0:
                    dados_novos = self.serial_conn.read(self.serial_conn.in_waiting)
                    buffer_dados += dados_novos
                    
                    # Processa linha completa (terminada com \n ou \r)
                    if b'\n' in buffer_dados or b'\r' in buffer_dados:
                        linhas = buffer_dados.split(b'\n')
                        
                        # Processa todas as linhas completas
                        for linha in linhas[:-1]:
                            linha = linha.strip(b'\r')
                            if len(linha) > 0:
                                self.processar_dados(linha)
                        
                        # Mantém dados incompletos no buffer
                        buffer_dados = linhas[-1]
                
                time.sleep(0.01)  # Pequena pausa para não sobrecarregar CPU
                
            except serial.SerialException as e:
                print(f"❌ Erro na leitura serial: {e}")
                break
            except Exception as e:
                print(f"❌ Erro inesperado na leitura: {e}")
                break
    
    def iniciar(self):
        """Inicia o receptor"""
        print("🚀 Sistema Receptor COM11 - Acesso Audicom")
        print("=" * 60)
        print(f"📍 Porta: {self.porta}")
        print(f"⚡ Baudrate: {self.baudrate}")
        print(f"🕐 Iniciado em: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        print("=" * 60)
        
        if not self.conectar():
            return False
        
        self.running = True
        
        # Inicia thread de leitura
        thread_leitura = threading.Thread(target=self.ler_serial, daemon=True)
        thread_leitura.start()
        
        try:
            print("💡 Pressione Ctrl+C para sair...")
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n🛑 Parando receptor...")
            self.parar()
        
        return True
    
    def parar(self):
        """Para o receptor e fecha conexões"""
        self.running = False
        
        if self.serial_conn:
            self.serial_conn.close()
            print("✅ Conexão serial fechada")
        
        print(f"📊 Total de leituras capturadas: {self.total_leituras}")
        print("👋 Receptor finalizado!")

def main():
    """Função principal"""
    receptor = ReceptorCOM11(porta='COM11', baudrate=9600)
    
    try:
        receptor.iniciar()
    except Exception as e:
        print(f"❌ Erro fatal: {e}")
    finally:
        receptor.parar()

if __name__ == "__main__":
    main()