# Ring Sizer - Application Mobile Complète

Application mobile complète pour mesurer les bagues et bracelets, suivre le prix de l'or, et accéder à un marketplace de produits en or. Le projet comprend un backend Laravel (API REST) et une application mobile React Native avec Expo.

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Dépannage](#dépannage)
- [Contribution](#contribution)

## 🎯 Aperçu

**Ring Sizer** est une application mobile complète qui permet aux utilisateurs de :

- 📏 Mesurer précisément la taille de bagues et bracelets via caméra ou entrée manuelle
- 📊 Suivre l'historique des prix de l'or avec graphiques interactifs
- 🛒 Parcourir et acheter des produits en or sur un marketplace
- 👤 Gérer leur profil et leurs paramètres
- 🏪 Pour les vendeurs : gérer leurs produits et leur boutique

## ✨ Fonctionnalités

### Pour les Clients

- ✅ **Authentification sécurisée** (Inscription/Connexion)
- ✅ **Mesure de bague/bracelet** :
  - 📷 Mesure par caméra avec cercles ajustables (bague + référence)
  - ✏️ Entrée manuelle (diamètre, circonférence, taille US/EU)
  - 💾 Sauvegarde automatique des mesures
- ✅ **Historique des mesures** avec recherche et filtres
- ✅ **Suivi du prix de l'or** :
  - Graphiques interactifs (7, 30, 90 jours, tout)
  - Historique détaillé
- ✅ **Marketplace** :
  - Recherche de produits
  - Filtres par catégorie, prix, carat
  - Détails complets des produits avec images
- ✅ **Paramètres utilisateur** personnalisables

### Pour les Vendeurs

- ✅ Gestion complète des produits (CRUD)
- ✅ Upload d'images multiples
- ✅ Gestion de la disponibilité des produits
- ✅ Association des mesures aux produits

## 🏗️ Architecture

Le projet est divisé en deux parties principales :

```
Mobile/
├── laravel/          # Backend API (Laravel 10)
└── react-native/     # Application mobile (React Native + Expo)
```

### Backend (Laravel)

- **Framework** : Laravel 10
- **Authentification** : Laravel Sanctum (API tokens)
- **Base de données** : MySQL/SQLite
- **API** : RESTful API avec JSON

### Frontend (React Native)

- **Framework** : React Native avec Expo (~54.0.0)
- **Navigation** : React Navigation (Stack + Bottom Tabs)
- **HTTP Client** : Axios
- **Stockage local** : AsyncStorage
- **Graphiques** : Victory Native
- **Caméra** : Expo Camera & Image Picker

## 📦 Prérequis

### Pour le Backend

- PHP >= 8.1
- Composer
- MySQL >= 5.7 ou SQLite
- Extensions PHP : `fileinfo`, `gd`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`

### Pour le Frontend

- Node.js >= 16
- npm ou yarn
- Expo CLI (installé globalement ou via npx)
- Un téléphone Android/iOS ou un émulateur
- Expo Go app (pour tester sur appareil physique)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd Mobile
```

### 2. Installation du Backend

```bash
cd laravel

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ring_sizer
# DB_USERNAME=root
# DB_PASSWORD=votre_mot_de_passe

# Créer la base de données
php artisan migrate

# (Optionnel) Charger des données de test
php artisan db:seed
```

### 3. Installation du Frontend

```bash
cd ../react-native

# Installer les dépendances
npm install
```

### 4. Configuration de l'API

Éditez `react-native/src/services/api.js` et configurez l'URL de l'API :

```javascript
// Pour émulateur Android
const API_BASE_URL = 'http://10.0.2.2:8000/api/';

// Pour appareil physique (remplacez par votre IP locale)
const API_BASE_URL = 'http://192.168.1.100:8000/api/';
```

**Trouver votre IP locale :**
- **Windows** : `ipconfig` (chercher IPv4)
- **Mac/Linux** : `ifconfig` ou `ip addr`

## ⚙️ Configuration

### Backend Configuration

1. **Base de données** : Configurez `laravel/.env` avec vos credentials
2. **CORS** : Configuré pour accepter les requêtes depuis l'app mobile
3. **Storage** : Assurez-vous que `storage/app/public` est accessible

### Frontend Configuration

1. **API URL** : Modifiez `src/services/api.js`
2. **Permissions** : Les permissions caméra/storage sont configurées dans `app.json`

## 🎮 Utilisation

### Démarrer le Backend

```bash
cd laravel
php artisan serve --host=0.0.0.0 --port=8000
```

Le serveur sera accessible sur `http://localhost:8000`

### Démarrer le Frontend

```bash
cd react-native
npm start
```

Puis :
- Appuyez sur `a` pour Android
- Appuyez sur `i` pour iOS
- Scannez le QR code avec Expo Go sur votre téléphone

### Utilisation de l'Application

#### Mesure par Caméra

1. Allez dans l'onglet **"Mesure"**
2. Sélectionnez **"Caméra avec Cercle"**
3. Prenez une photo ou choisissez une image
4. Ajustez les cercles :
   - Touchez le cercle de la bague pour le sélectionner
   - Déplacez votre doigt pour ajuster la taille
   - Faites de même pour le cercle de référence (pièce de monnaie)
5. Entrez le diamètre de la pièce de référence (par défaut 24mm pour une pièce de 2€)
6. Appuyez sur **"Calculer"**
7. Enregistrez la mesure

#### Mesure Manuelle

1. Allez dans l'onglet **"Mesure"**
2. Sélectionnez **"Entrée Manuelle"**
3. Choisissez la méthode d'entrée (Diamètre, Circonférence, Taille US, Taille EU)
4. Entrez la valeur
5. Appuyez sur **"Calculer"**
6. Enregistrez la mesure

#### Marketplace

1. Allez dans l'onglet **"Boutique"**
2. Parcourez les produits disponibles
3. Utilisez les filtres pour affiner votre recherche
4. Cliquez sur un produit pour voir les détails complets

## 📁 Structure du projet

```
Mobile/
├── laravel/                          # Backend Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/              # Contrôleurs API
│   │   └── Models/                   # Modèles Eloquent
│   ├── database/
│   │   ├── migrations/               # Migrations
│   │   └── seeders/                  # Seeders
│   ├── routes/
│   │   └── api.php                   # Routes API
│   ├── storage/                      # Stockage des fichiers
│   └── composer.json
│
└── react-native/                     # Application mobile
    ├── src/
    │   ├── screens/                  # Écrans de l'application
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── MeasureScreen.js
    │   │   ├── CameraMeasureScreen.js
    │   │   ├── ManualMeasureScreen.js
    │   │   ├── HistoryScreen.js
    │   │   ├── GoldPriceScreen.js
    │   │   ├── MarketplaceScreen.js
    │   │   ├── ProductDetailScreen.js
    │   │   ├── VendorProductsScreen.js
    │   │   └── SettingsScreen.js
    │   ├── services/                 # Services API et stockage
    │   │   ├── api.js
    │   │   └── storage.js
    │   └── utils/                    # Utilitaires
    │       └── measurementCalculator.js
    ├── App.js                        # Point d'entrée
    ├── app.json                      # Configuration Expo
    └── package.json
```

## 📚 API Documentation

### Endpoints Principaux

#### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion (protégé)
- `POST /api/auth/forgot-password` - Mot de passe oublié

#### Mesures

- `GET /api/measurements` - Liste des mesures (protégé)
- `POST /api/measurements` - Créer une mesure (protégé)
- `GET /api/measurements/{id}` - Détails d'une mesure (protégé)
- `PUT /api/measurements/{id}` - Mettre à jour (protégé)
- `DELETE /api/measurements/{id}` - Supprimer (protégé)

#### Prix de l'Or

- `GET /api/gold-prices` - Historique des prix (protégé)

#### Produits

- `GET /api/products` - Liste des produits (protégé)
- `GET /api/products/{id}` - Détails d'un produit (protégé)

#### Gestion Vendeur

- `GET /api/vendor/products` - Produits du vendeur (protégé)
- `POST /api/vendor/products` - Créer un produit (protégé)
- `PUT /api/vendor/products/{id}` - Mettre à jour (protégé)
- `DELETE /api/vendor/products/{id}` - Supprimer (protégé)

#### Images

- `POST /api/images/upload` - Upload d'image (protégé)

#### Paramètres

- `GET /api/settings` - Paramètres utilisateur (protégé)
- `PUT /api/settings` - Mettre à jour (protégé)

### Authentification

Toutes les routes protégées nécessitent un token d'authentification dans le header :

```
Authorization: Bearer {token}
```

Pour plus de détails, consultez :
- `laravel/QUICK_START.md` - Guide de démarrage rapide
- `laravel/TEST_API.md` - Exemples de tests API
- `laravel/GOLD_PRICE_API.md` - Documentation API prix de l'or

## 🐛 Dépannage

### Erreur de connexion à l'API

- ✅ Vérifiez que le serveur Laravel est démarré (`php artisan serve`)
- ✅ Vérifiez l'URL dans `react-native/src/services/api.js`
- ✅ Pour appareil physique : assurez-vous que l'appareil et votre PC sont sur le même réseau WiFi
- ✅ Vérifiez que le port 8000 n'est pas bloqué par le firewall

### Problème de caméra

- ✅ Autorisez les permissions caméra dans les paramètres de l'appareil
- ✅ Redémarrez l'application si nécessaire
- ✅ Vérifiez que `expo-camera` est bien installé

### Erreur "Unauthenticated"

- ✅ Vérifiez que le token est présent dans le header
- ✅ Format : `Authorization: Bearer {token}`
- ✅ Vérifiez que le token n'a pas expiré (déconnectez-vous et reconnectez-vous)

### Erreur de base de données

- ✅ Vérifiez les credentials dans `laravel/.env`
- ✅ Vérifiez que MySQL est démarré
- ✅ Vérifiez que la base de données existe
- ✅ Exécutez `php artisan migrate` pour créer les tables

### Problème avec les images

- ✅ Vérifiez que `storage/app/public` est accessible
- ✅ Exécutez `php artisan storage:link` pour créer le lien symbolique
- ✅ Vérifiez les permissions du dossier storage

## 🔧 Scripts Utiles

### Backend (Laravel)

```bash
# Démarrer le serveur
php artisan serve --host=0.0.0.0 --port=8000

# Exécuter les migrations
php artisan migrate

# Créer un lien symbolique pour le storage
php artisan storage:link

# Nettoyer le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Frontend (React Native)

```bash
# Démarrer l'application
npm start

# Démarrer sur Android
npm run android

# Démarrer sur iOS
npm run ios

# Démarrer sur Web
npm run web
```

## 📝 Notes Importantes

- Le backend doit être démarré avant de lancer l'application mobile
- Pour tester sur un appareil physique, l'appareil et votre PC doivent être sur le même réseau WiFi
- L'URL de l'API doit être accessible depuis l'appareil/émulateur
- Les tokens d'authentification sont stockés localement via AsyncStorage

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Équipe de développement Ring Sizer

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository.

---

**Développé avec ❤️ en utilisant Laravel et React Native**

