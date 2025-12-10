# Script pour configurer SQLite dans Laravel
Write-Host "=== Configuration de SQLite pour Laravel ===" -ForegroundColor Green
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

# Remplacer la configuration de la base de donnees
$envContent = $envContent -replace 'DB_CONNECTION=.*', 'DB_CONNECTION=sqlite'
$envContent = $envContent -replace 'DB_HOST=.*', '# DB_HOST=127.0.0.1'
$envContent = $envContent -replace 'DB_PORT=.*', '# DB_PORT=3306'
$envContent = $envContent -replace 'DB_DATABASE=.*', '# DB_DATABASE=ring_sizer'
$envContent = $envContent -replace 'DB_USERNAME=.*', '# DB_USERNAME=root'
$envContent = $envContent -replace 'DB_PASSWORD=.*', '# DB_PASSWORD='

# Ecrire le contenu modifie
Set-Content -Path $envPath -Value $envContent -NoNewline

Write-Host "Configuration SQLite appliquee dans .env" -ForegroundColor Green
Write-Host ""

# Creer le fichier database.sqlite s'il n'existe pas
$dbPath = Join-Path $PSScriptRoot "database\database.sqlite"
if (-not (Test-Path $dbPath)) {
    New-Item -ItemType File -Path $dbPath -Force | Out-Null
    Write-Host "Fichier database.sqlite cree." -ForegroundColor Green
} else {
    Write-Host "Fichier database.sqlite existe deja." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "1. Executez: php artisan migrate" -ForegroundColor Yellow
Write-Host "2. Redemarrez le serveur Laravel" -ForegroundColor Yellow

