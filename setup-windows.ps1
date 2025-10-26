# AndRate Windows Setup Script
# Run this with: .\setup-windows.ps1

Write-Host "🎬 AndRate Windows Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "  Please install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is NOT installed" -ForegroundColor Red
    exit 1
}

# Check Rust
Write-Host "Checking Rust..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version
    Write-Host "✓ Rust is installed: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Rust is NOT installed" -ForegroundColor Red
    Write-Host "  Please install from: https://rustup.rs/" -ForegroundColor Yellow
    Write-Host "  Or run: winget install --id Rustlang.Rustup" -ForegroundColor Yellow
    exit 1
}

# Check Cargo
Write-Host "Checking Cargo..." -ForegroundColor Yellow
try {
    $cargoVersion = cargo --version
    Write-Host "✓ Cargo is installed: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Cargo is NOT installed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All prerequisites are installed! ✓" -ForegroundColor Green
Write-Host ""

# Install root dependencies
Write-Host "Installing Tauri CLI..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Tauri CLI installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Tauri CLI" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ui
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the app in development mode, use:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "To build the app, use:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Cyan
Write-Host ""

