# 🏪 Interface Vendeur - Gestion des Produits

## Vue d'ensemble

L'interface vendeur permet aux utilisateurs avec le type `VENDEUR` de gérer leurs produits en or (créer, modifier, supprimer).

## Fonctionnalités

### ✅ Création de produits
- Nom du produit
- Description
- Prix (en EUR)
- Carat (9K, 14K, 18K, 22K, 24K)
- Catégorie (Bague, Bracelet, Collier, Autre)
- Image principale
- Statut de disponibilité

### ✅ Modification de produits
- Modifier tous les champs d'un produit existant

### ✅ Suppression de produits
- Supprimer un produit avec confirmation

### ✅ Liste des produits
- Affichage en grille (2 colonnes)
- Badges pour catégorie, carat et disponibilité
- Actions rapides (Modifier/Supprimer)

## Accès à l'interface

1. **Se connecter en tant que vendeur** :
   - L'utilisateur doit avoir `user_type = 'VENDEUR'` dans la base de données
   - Utiliser le script `create-vendor-user.ps1` pour créer un vendeur de test

2. **Accéder à l'interface** :
   - Aller dans l'onglet "Boutique" (Marketplace)
   - Cliquer sur le bouton "Gérer mes produits" (visible uniquement pour les vendeurs)
   - Ou naviguer directement vers l'écran `VendorProducts`

## API Endpoints

### Liste des produits du vendeur
```
GET /api/vendor/products
Authorization: Bearer {token}
```

### Créer un produit
```
POST /api/vendor/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Bague en or 18K",
  "description": "Belle bague en or 18 carats",
  "price": 250.00,
  "karat": "18K",
  "category": "RING",
  "main_image_url": "https://example.com/image.jpg",
  "is_available": true
}
```

### Modifier un produit
```
PUT /api/vendor/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Bague en or 18K - Modifiée",
  "price": 275.00,
  ...
}
```

### Supprimer un produit
```
DELETE /api/vendor/products/{id}
Authorization: Bearer {token}
```

## Créer un utilisateur vendeur

### Option 1: Script PowerShell
```powershell
cd laravel
powershell -ExecutionPolicy Bypass -File create-vendor-user.ps1
```

### Option 2: Manuellement dans la base de données
```sql
-- Créer l'utilisateur
INSERT INTO users (name, email, password, user_type, created_at, updated_at)
VALUES ('Vendeur Test', 'vendor@test.com', '$2y$10$...', 'VENDEUR', NOW(), NOW());

-- Créer le profil vendeur
INSERT INTO vendors (user_id, shop_name, description, is_verified, created_at, updated_at)
VALUES (LAST_INSERT_ID(), 'Vendeur Test Shop', 'Boutique de produits en or', 0, NOW(), NOW());
```

### Option 3: Via l'API (modifier le type d'utilisateur)
Modifier directement dans la base de données :
```sql
UPDATE users SET user_type = 'VENDEUR' WHERE email = 'votre@email.com';
```

## Interface React Native

L'écran `VendorProductsScreen` offre :
- **Bouton FAB** (floating action button) pour ajouter un produit
- **Modal** pour créer/modifier un produit
- **Sélection d'image** depuis la galerie
- **Validation** des champs obligatoires
- **Gestion d'erreurs** avec messages clairs

## Notes importantes

1. **Profil vendeur automatique** : Si un utilisateur a `user_type = 'VENDEUR'` mais n'a pas de profil vendeur, il sera créé automatiquement lors de la première utilisation.

2. **Permissions** : Seuls les utilisateurs avec `user_type = 'VENDEUR'` peuvent accéder aux endpoints `/api/vendor/*`.

3. **Images** : Pour l'instant, l'URL de l'image doit être fournie manuellement. Dans une version future, vous pouvez implémenter l'upload d'images vers un serveur.

4. **Bouton visible** : Le bouton "Gérer mes produits" n'apparaît que si l'utilisateur connecté a `user_type = 'VENDEUR'`.

