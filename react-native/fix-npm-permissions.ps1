# Script pour resoudre les erreurs de permissions npm sur Windows
Write-Host "=== Nettoyage et reinstallation des dependances ===" -ForegroundColor Green
Write-Host ""

# Aller dans le repertoire react-native
Set-Location $PSScriptRoot

# Arreter tous les processus Node.js
Write-Host "Arret des processus Node.js..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Supprimer node_modules
Write-Host "Suppression de node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    try {
        Remove-Item -Recurse -Force "node_modules" -ErrorAction Stop
        Write-Host "[OK] node_modules supprime" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Impossible de supprimer completement node_modules. Essayez de fermer tous les editeurs et reessayez." -ForegroundColor Yellow
        Write-Host "Erreur: $_" -ForegroundColor Red
    }
} else {
    Write-Host "node_modules n'existe pas" -ForegroundColor Yellow
}

# Supprimer package-lock.json
Write-Host "Suppression de package-lock.json..." -ForegroundColor Cyan
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "[OK] package-lock.json supprime" -ForegroundColor Green
}

# Nettoyer le cache npm
Write-Host "Nettoyage du cache npm..." -ForegroundColor Cyan
npm cache clean --force
Write-Host "[OK] Cache npm nettoye" -ForegroundColor Green

Write-Host ""
Write-Host "Installation des dependances..." -ForegroundColor Cyan
Write-Host ""

# Installer les dependances
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Installation reussie!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Erreur lors de l'installation" -ForegroundColor Red
    Write-Host ""
    Write-Host "Si le probleme persiste, essayez:" -ForegroundColor Yellow
    Write-Host "1. Fermer tous les editeurs de code (VS Code, etc.)" -ForegroundColor Yellow
    Write-Host "2. Executer PowerShell en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host "3. Desactiver temporairement l'antivirus" -ForegroundColor Yellow
    Write-Host "4. Reessayer: npm install" -ForegroundColor Yellow
}
