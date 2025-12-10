# Test des Endpoints API

## Endpoints disponibles

### Authentification (Publique)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion (nécessite authentification)
- `POST /api/auth/forgot-password` - Réinitialisation du mot de passe

### Mesures (Nécessite authentification)
- `GET /api/measurements` - Liste des mesures
- `POST /api/measurements` - Créer une mesure
- `GET /api/measurements/{id}` - Détails d'une mesure
- `PUT /api/measurements/{id}` - Modifier une mesure
- `DELETE /api/measurements/{id}` - Supprimer une mesure

### Cours de l'Or (Nécessite authentification)
- `GET /api/gold-prices?karat=18K&period=month` - Prix de l'or

### Produits (Nécessite authentification)
- `GET /api/products` - Liste des produits
- `GET /api/products/{id}` - Détails d'un produit

### Paramètres (Nécessite authentification)
- `GET /api/settings` - Récupérer les paramètres
- `PUT /api/settings` - Mettre à jour les paramètres

## Tests avec curl

### 1. Inscription
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### 2. Connexion
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Créer une mesure (avec token)
```bash
curl -X POST http://localhost:8000/api/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "Bague alliance",
    "type": "RING",
    "diameter_mm": 16.5,
    "circumference_mm": 51.84,
    "size_eu": 12.0,
    "size_us": 4.5
  }'
```

### 4. Liste des mesures
```bash
curl -X GET http://localhost:8000/api/measurements \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 5. Cours de l'or
```bash
curl -X GET "http://localhost:8000/api/gold-prices?karat=18K&period=month" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

## Tests avec Postman

1. Créer une nouvelle collection "Ring Sizer API"
2. Configurer une variable d'environnement `base_url` = `http://localhost:8000`
3. Pour les routes protégées, ajouter un header :
   - Key: `Authorization`
   - Value: `Bearer {token}` (remplacer {token} par le token reçu lors de la connexion)

## Note importante

Toutes les routes API (sauf `/api/auth/register` et `/api/auth/login`) nécessitent un token d'authentification obtenu via la connexion.

