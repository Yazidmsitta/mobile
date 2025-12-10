# Script pour creer la base de donnees MySQL
Write-Host "=== Creation de la base de donnees MySQL ===" -ForegroundColor Green
Write-Host ""

# Chemin vers mysql.exe (XAMPP)
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"

if (-not (Test-Path $mysqlPath)) {
    Write-Host "MySQL non trouve dans C:\xampp\mysql\bin\" -ForegroundColor Yellow
    Write-Host "Veuillez creer la base de donnees manuellement:" -ForegroundColor Yellow
    Write-Host "1. Ouvrez phpMyAdmin (http://localhost/phpmyadmin)" -ForegroundColor Cyan
    Write-Host "2. Cliquez sur 'Nouvelle base de donnees'" -ForegroundColor Cyan
    Write-Host "3. Nom: ring_sizer" -ForegroundColor Cyan
    Write-Host "4. Interclassement: utf8mb4_unicode_ci" -ForegroundColor Cyan
    Write-Host "5. Cliquez sur 'Creer'" -ForegroundColor Cyan
    exit 0
}

Write-Host "Creation de la base de donnees 'ring_sizer'..." -ForegroundColor Cyan

# Commande SQL pour creer la base de donnees
$sqlCommand = "CREATE DATABASE IF NOT EXISTS ring_sizer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

try {
    & $mysqlPath -u root -e $sqlCommand
    Write-Host "Base de donnees 'ring_sizer' creee avec succes!" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de la creation de la base de donnees" -ForegroundColor Red
    Write-Host "Veuillez creer la base de donnees manuellement dans phpMyAdmin" -ForegroundColor Yellow
    Write-Host "Nom: ring_sizer" -ForegroundColor Yellow
    Write-Host "Interclassement: utf8mb4_unicode_ci" -ForegroundColor Yellow
}

