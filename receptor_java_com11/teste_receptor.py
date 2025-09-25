"""
Teste do Receptor COM11
Simula dados para testar o processamento
"""

from receptor_com11 import ReceptorCOM11
import time

def teste_processamento():
    print("🧪 TESTE do processamento de dados")
    print("=" * 50)
    
    receptor = ReceptorCOM11()
    
    # Simula dados do Pico com todos os 5 leitores
    dados_teste = [
        b"CRT-01-Leitor_1-https://davicjc.github.io\r\n",
        b"CRT-01-Leitor_2-Acesso liberado 123\r\n", 
        b"CRT-01-Leitor_3-68747470733A2F2F646176696367632E6769746875622E696F\r\n",
        b"CRT-01-Leitor_4-41424344454647484950\r\n",
        b"CRT-01-Leitor_5-313233343536373839\r\n",
        b"Dados brutos sem formato\r\n"
    ]
    
    for dados in dados_teste:
        linha_limpa = dados.strip(b'\r\n')
        receptor.processar_dados(linha_limpa)
        time.sleep(0.5)
    
    print("\n✅ Teste concluído!")

if __name__ == "__main__":
    teste_processamento()