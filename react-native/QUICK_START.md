# Guide de démarrage rapide - React Native

## Installation

1. **Installer les dépendances :**
   ```bash
   cd react-native
   npm install
   ```

2. **Configurer l'URL de l'API :**
   
   Éditez `src/services/api.js` et changez l'URL selon votre environnement :
   - Émulateur : `http://10.0.2.2:8000/api/`
   - Appareil physique : `http://VOTRE_IP:8000/api/`

3. **Démarrer le serveur Laravel :**
   ```bash
   cd ../laravel
   php artisan serve --host=0.0.0.0 --port=8000
   ```

4. **Démarrer l'application :**
   ```bash
   cd react-native
   npm start
   ```
   
   Puis appuyez sur :
   - `a` pour Android
   - `i` pour iOS
   - Ou scannez le QR code avec Expo Go sur votre téléphone

## Fonctionnalités principales

### 📷 Mesure par caméra
1. Menu "Mesure" → "Caméra avec Cercle"
2. Prenez une photo ou choisissez une image
3. Ajustez les cercles (bague et référence)
4. Entrez le diamètre de la pièce de référence
5. Calculez et enregistrez

### ✏️ Mesure manuelle
1. Menu "Mesure" → "Entrée Manuelle"
2. Choisissez la méthode (Diamètre, Circonférence, etc.)
3. Entrez la valeur
4. Calculez et enregistrez

### 📊 Prix de l'or
- Graphique interactif
- Filtres par période (7, 30, 90 jours, tout)
- Historique détaillé

### 🛒 Marketplace
- Recherche de produits
- Filtres par catégorie/prix
- Détails complets des produits

## Dépannage

**Erreur de connexion :**
- Vérifiez que Laravel est démarré
- Vérifiez l'URL dans `src/services/api.js`
- Pour appareil physique : même réseau WiFi

**Problème de caméra :**
- Autorisez les permissions
- Redémarrez l'app si nécessaire

