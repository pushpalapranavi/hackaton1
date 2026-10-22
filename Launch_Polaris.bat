@echo off
title POLARIS-AI // Antarctic Maritime Decision Support Platform
echo ===============================================================================
echo   POLARIS-AI // CRYONAV-AI
echo   AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory & Navigation Decision Platform
echo ===============================================================================
echo.
echo Launching POLARIS-AI in Microsoft Edge / Chrome...
echo.

:: Try launching with Microsoft Edge (standard on all Windows systems)
start msedge "%~dp0index.html" 2>nul
if %errorlevel% neq 0 (
    :: Fallback to Chrome
    start chrome "%~dp0index.html" 2>nul
)
if %errorlevel% neq 0 (
    :: Fallback to default handler
    start "" "%~dp0index.html"
)

echo Website opened in browser window.
echo If it did not open automatically, right-click index.html and select "Open with" -> "Google Chrome" or "Microsoft Edge".
echo.
pause
