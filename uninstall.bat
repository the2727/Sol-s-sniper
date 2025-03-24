@echo off
:: Check if the script is running as administrator
openfiles >nul 2>nul
if %errorlevel% neq 0 (
    echo This script must be run as Administrator!
    pause
    exit /b
)

:: Uninstall libraries
echo Uninstalling requests...
pip uninstall -y requests

echo Uninstalling pynput...
pip uninstall -y pynput

echo Uninstalling windows-toasts...
pip uninstall -y windows-toasts

echo Uninstalling pywebview...
pip uninstall -y pywebview

echo Uninstalling discord.py-self (selfcord.py)...
py -3 -m pip uninstall -y selfcord.py

echo All libraries uninstalled successfully!
pause
