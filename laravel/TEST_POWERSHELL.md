# Tester l'API avec PowerShell

## Méthode 1 : Utiliser Invoke-RestMethod (Recommandé)

### Inscription
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    password_confirmation = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Connexion
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Sauvegarder le token
$token = $response.token
Write-Host "Token: $token"
```

### Créer une mesure (avec token)
```powershell
$body = @{
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

Invoke-RestMethod -Uri "http://localhost:8000/api/measurements" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Liste des mesures
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/measurements" `
    -Method GET `
    -Headers $headers
```

## Méthode 2 : Utiliser curl.exe (si disponible)

Si vous avez curl.exe installé (Windows 10+), vous pouvez utiliser :

```powershell
curl.exe -X POST http://localhost:8000/api/auth/register `
    -H "Content-Type: application/json" `
    -d '{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}'
```

## Méthode 3 : Script PowerShell complet

Créez un fichier `test-api.ps1` :

```powershell
# Test API Ring Sizer
$baseUrl = "http://localhost:8000/api"

# 1. Inscription
Write-Host "=== Test d'inscription ===" -ForegroundColor Green
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
    
    Write-Host "Inscription réussie!" -ForegroundColor Green
    Write-Host "Token: $($registerResponse.token)" -ForegroundColor Yellow
    $token = $registerResponse.token
    $userId = $registerResponse.user.id
    
    # 2. Créer une mesure
    Write-Host "`n=== Création d'une mesure ===" -ForegroundColor Green
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
    
    $measurement = Invoke-RestMethod -Uri "$baseUrl/measurements" `
        -Method POST `
        -Headers $headers `
        -Body $measurementBody
    
    Write-Host "Mesure créée avec succès!" -ForegroundColor Green
    Write-Host "ID: $($measurement.id)" -ForegroundColor Yellow
    
    # 3. Liste des mesures
    Write-Host "`n=== Liste des mesures ===" -ForegroundColor Green
    $measurements = Invoke-RestMethod -Uri "$baseUrl/measurements" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $token"}
    
    Write-Host "Nombre de mesures: $($measurements.Count)" -ForegroundColor Yellow
    $measurements | Format-Table id, name, type, size_eu, size_us
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response -ForegroundColor Red
}
```

Exécutez avec :
```powershell
.\test-api.ps1
```












