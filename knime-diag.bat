@echo off
echo [DIAGNOSTIC KNIME CLI]
echo 1. Checking Node.js version...
node -v
echo 2. Checking if local dist exists...
if exist "dist\index.js" (echo OK) else (echo ERROR: Run npm run build)
echo 3. Checking if PowerShell is restricted...
powershell -Command "echo TEST" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PowerShell is RESTRICTED or BLOCKED by Antivirus.
    echo [ACTION] You MUST use 'knime-safe.bat' or 'cmd /c node dist/index.js'.
) else (
    echo PowerShell is available, but use CMD for safety with this project.
)
echo 4. Testing CLI execution...
node dist/index.js --version
echo [DIAGNOSTIC COMPLETE]
