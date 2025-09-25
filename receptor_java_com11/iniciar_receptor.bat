@echo off
echo ========================================
echo  Receptor COM11 - Sistema Acesso Audicom
echo ========================================
echo.

echo Instalando dependencias...
pip install -r requirements.txt

echo.
echo Iniciando receptor na porta COM11...
echo.

python receptor_com11.py

pause