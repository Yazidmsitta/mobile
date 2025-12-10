# Script de test pour l'API Ring Sizer
# Usage: .\test-api.ps1

$baseUrl = "http://localhost:8000/api"
$ErrorActionPreference = "Stop"

Write-Host "`n=== Test API Ring Sizer ===" -ForegroundColor Cyan
Write-Host "URL de base: $baseUrl`n" -ForegroundColor Gray

# 1. Test d'inscription
Write-Host "1. Test d'inscription..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    password_confirmation = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody
    
    if ($registerResponse -and $registerResponse.token) {
        Write-Host "   [OK] Inscription reussie!" -ForegroundColor Green
        if ($registerResponse.token.Length -gt 20) {
            Write-Host "   Token: $($registerResponse.token.Substring(0, 20))..." -ForegroundColor Gray
        } else {
            Write-Host "   Token: $($registerResponse.token)" -ForegroundColor Gray
        }
        $token = $registerResponse.token
        if ($registerResponse.user -and $registerResponse.user.id) {
            $userId = $registerResponse.user.id
            Write-Host "   User ID: $userId`n" -ForegroundColor Gray
        }
    } else {
        Write-Host "   [OK] Inscription reussie!" -ForegroundColor Green
        Write-Host "   Reponse: $($registerResponse | ConvertTo-Json)" -ForegroundColor Gray
        if ($registerResponse.token) {
            $token = $registerResponse.token
        }
    }
    
} catch {
    Write-Host "   [ERROR] Erreur lors de l'inscription:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# 2. Test de connexion
Write-Host "2. Test de connexion..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "   [OK] Connexion reussie!" -ForegroundColor Green
    if ($loginResponse.token) {
        $token = $loginResponse.token
        if ($token.Length -gt 20) {
            Write-Host "   Token: $($token.Substring(0, 20))...`n" -ForegroundColor Gray
        } else {
            Write-Host "   Token: $token`n" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "   [ERROR] Erreur lors de la connexion:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Creer une mesure
Write-Host "3. Creation d'une mesure..." -ForegroundColor Yellow
$measurementBody = @{
    name = "Bague alliance"
    type = "RING"
    diameter_mm = 16.5
    circumference_mm = 51.84
    size_eu = 12.0
    size_us = 4.5
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $measurement = Invoke-RestMethod -Uri "$baseUrl/measurements" `
        -Method POST `
        -Headers $headers `
        -Body $measurementBody
    
    Write-Host "   [OK] Mesure creee avec succes!" -ForegroundColor Green
    Write-Host "   ID: $($measurement.id)" -ForegroundColor Gray
    Write-Host "   Nom: $($measurement.name)" -ForegroundColor Gray
    Write-Host "   Taille EU: $($measurement.size_eu)`n" -ForegroundColor Gray
    
} catch {
    Write-Host "   [ERROR] Erreur lors de la creation de la mesure:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# 4. Liste des mesures
Write-Host "4. Recuperation de la liste des mesures..." -ForegroundColor Yellow
try {
    $measurements = Invoke-RestMethod -Uri "$baseUrl/measurements" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}
    
    Write-Host "   [OK] Liste recuperee avec succes!" -ForegroundColor Green
    Write-Host "   Nombre de mesures: $($measurements.Count)`n" -ForegroundColor Gray
    
    if ($measurements.Count -gt 0) {
        Write-Host "   Mesures:" -ForegroundColor Cyan
        $measurements | ForEach-Object {
            Write-Host "   - $($_.name) (ID: $($_.id), Type: $($_.type), EU: $($_.size_eu))" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "   [ERROR] Erreur lors de la recuperation:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test cours de l'or
Write-Host "`n5. Test cours de l'or..." -ForegroundColor Yellow
try {
    $goldPrices = Invoke-RestMethod -Uri "$baseUrl/gold-prices?karat=18K&period=month" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}
    
    Write-Host "   [OK] Donnees recuperees!" -ForegroundColor Green
    Write-Host "   Nombre d'entrees: $($goldPrices.Count)" -ForegroundColor Gray
    
} catch {
    Write-Host "   [WARNING] Erreur (normal si pas de donnees):" -ForegroundColor Yellow
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n=== Tests termines ===" -ForegroundColor Cyan
