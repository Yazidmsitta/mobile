# Guide de Démarrage Rapide - Ring Sizer API

## 🚀 Démarrage du serveur

```bash
cd laravel
php artisan serve
```

Le serveur sera accessible sur `http://localhost:8000`

## 📋 Tests rapides

### 1. Page de test web
Accédez à : `http://localhost:8000/test-api`

Cette page permet de :
- Voir tous les endpoints disponibles
- Tester l'inscription directement depuis le navigateur
- Comprendre la structure des requêtes

### 2. Test d'inscription (via la page web)
1. Remplissez le formulaire sur `/test-api`
2. Cliquez sur "S'inscrire"
3. Vous recevrez un token d'authentification

### 3. Test avec PowerShell (Windows)

#### Script de test automatique
```powershell
cd laravel
.\test-api.ps1
```

#### Ou manuellement avec Invoke-RestMethod
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
    password_confirmation = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 4. Test avec curl (Linux/Mac/Git Bash)

#### Inscription
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

**Note:** Dans PowerShell Windows, `curl` est un alias pour `Invoke-WebRequest`. 
Utilisez `Invoke-RestMethod` ou le script `test-api.ps1` à la place.

**Réponse attendue :**
```json
{
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "user_type": "CLIENT"
  }
}
```

#### Connexion
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Créer une mesure (avec token)
```bash
curl -X POST http://localhost:8000/api/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -d '{
    "name": "Bague alliance",
    "type": "RING",
    "diameter_mm": 16.5,
    "circumference_mm": 51.84,
    "size_eu": 12.0,
    "size_us": 4.5
  }'
```

## 🔐 Authentification

Toutes les routes (sauf `/api/auth/register` et `/api/auth/login`) nécessitent un token d'authentification.

**Format du header :**
```
Authorization: Bearer {token}
```

## 📱 Configuration Android

Dans `android/app/src/main/java/com/ringsize/app/data/remote/RetrofitClient.kt`, modifiez :

```kotlin
private const val BASE_URL = "http://VOTRE_IP:8000/api/"
```

Pour trouver votre IP locale :
- **Windows** : `ipconfig` (chercher IPv4)
- **Mac/Linux** : `ifconfig` ou `ip addr`

## 🗄️ Base de données

### 1. Créer la base de données
```sql
CREATE DATABASE ring_sizer;
```

### 2. Configurer `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ring_sizer
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

### 3. Exécuter les migrations
```bash
php artisan migrate
```

## ✅ Checklist de vérification

- [ ] Serveur Laravel démarré (`php artisan serve`)
- [ ] Base de données créée et configurée
- [ ] Migrations exécutées
- [ ] Test d'inscription réussi
- [ ] Test de connexion réussi
- [ ] Token reçu et sauvegardé
- [ ] Test de création de mesure réussi
- [ ] Application Android configurée avec la bonne URL

## 🐛 Dépannage

### Erreur "The GET method is not supported"
- Les routes d'authentification n'acceptent que POST
- Utilisez Postman, curl ou la page de test web

### Erreur "Unauthenticated"
- Vérifiez que le token est présent dans le header
- Format : `Authorization: Bearer {token}`
- Vérifiez que le token n'a pas expiré

### Erreur de connexion à la base de données
- Vérifiez les credentials dans `.env`
- Vérifiez que MySQL est démarré
- Vérifiez que la base de données existe

## 📚 Documentation complète

- `TEST_API.md` - Exemples détaillés de tous les endpoints
- `README.md` - Documentation générale du projet
- `SETUP_GUIDE.md` - Guide d'installation complet

