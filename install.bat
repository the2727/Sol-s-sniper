@echo off
:: Check if the script is running as administrator
openfiles >nul 2>nul
if %errorlevel% neq 0 (
    echo This script must be run as Administrator!
    pause
    exit /b
)

:: Upgrade pip to the latest version
echo Upgrading pip...
python -m pip install --upgrade pip

:: Install required libraries
echo Installing requests...
pip install requests

echo Installing pynput...
pip install pynput

echo Installing windows-toasts...
pip install windows-toasts

echo Installing pywebview...
pip install pywebview

:: Install discord.py-self from GitHub
echo Installing discord.py-self...
py -3 -m pip install git+https://github.com/dolfies/discord.py-self@renamed#egg=selfcord.py[voice]

echo All libraries installed successfully!
pause
