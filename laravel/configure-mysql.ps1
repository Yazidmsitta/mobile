# Script pour configurer MySQL dans Laravel
Write-Host "=== Configuration de MySQL pour Laravel ===" -ForegroundColor Green
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "Fichier .env non trouve. Creation depuis .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Fichier .env cree." -ForegroundColor Green
    } else {
        Write-Host "Erreur: .env.example non trouve!" -ForegroundColor Red
        exit 1
    }
}

# Lire le contenu du fichier .env
$envContent = Get-Content $envPath -Raw

# Remplacer la configuration de la base de donnees pour MySQL
$envContent = $envContent -replace 'DB_CONNECTION=.*', 'DB_CONNECTION=mysql'
$envContent = $envContent -replace '# DB_HOST=.*|DB_HOST=.*', 'DB_HOST=127.0.0.1'
$envContent = $envContent -replace '# DB_PORT=.*|DB_PORT=.*', 'DB_PORT=3306'
$envContent = $envContent -replace '# DB_DATABASE=.*|DB_DATABASE=.*', 'DB_DATABASE=ring_sizer'
$envContent = $envContent -replace '# DB_USERNAME=.*|DB_USERNAME=.*', 'DB_USERNAME=root'
$envContent = $envContent -replace '# DB_PASSWORD=.*|DB_PASSWORD=.*', 'DB_PASSWORD='

# Ecrire le contenu modifie
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host "Configuration MySQL appliquee dans .env" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  DB_CONNECTION=mysql" -ForegroundColor Yellow
Write-Host "  DB_HOST=127.0.0.1" -ForegroundColor Yellow
Write-Host "  DB_PORT=3306" -ForegroundColor Yellow
Write-Host "  DB_DATABASE=ring_sizer" -ForegroundColor Yellow
Write-Host "  DB_USERNAME=root" -ForegroundColor Yellow
Write-Host "  DB_PASSWORD=" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "1. Assurez-vous que MySQL est demarre dans XAMPP" -ForegroundColor Yellow
Write-Host "2. Creez la base de donnees 'ring_sizer' dans phpMyAdmin" -ForegroundColor Yellow
Write-Host "3. Executez: php artisan migrate" -ForegroundColor Yellow

