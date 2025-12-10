# Ring Sizer - Application React Native

Application mobile React Native avec Expo pour mesurer les bagues et bracelets, suivre le prix de l'or, et accéder à un marketplace de produits en or.

## Fonctionnalités

- ✅ Authentification (Inscription/Connexion)
- ✅ Mesure de bague/bracelet :
  - 📷 Mesure par caméra avec cercle ajustable
  - ✏️ Entrée manuelle (diamètre, circonférence, taille US/EU)
- ✅ Historique des mesures
- ✅ Suivi du prix de l'or avec graphiques
- ✅ Marketplace de produits en or

## Installation

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Expo CLI
- Un téléphone Android/iOS ou un émulateur

### Étapes d'installation

1. **Installer les dépendances :**
   ```bash
   cd react-native
   npm install
   ```

2. **Configurer l'URL de l'API :**
   
   Modifiez le fichier `src/services/api.js` pour changer l'URL de l'API selon votre environnement :
   
   - **Pour l'émulateur Android :** `http://10.0.2.2:8000/api/`
   - **Pour un appareil physique :** `http://VOTRE_IP:8000/api/` (remplacez VOTRE_IP par l'IP locale de votre machine)
   
   Exemple :
   ```javascript
   const API_BASE_URL = __DEV__ 
     ? 'http://10.0.2.2:8000/api/'  // Emulator
     : 'http://192.168.1.100:8000/api/'; // Physical device
   ```

3. **Démarrer le serveur Laravel :**
   ```bash
   cd ../laravel
   php artisan serve --host=0.0.0.0 --port=8000
   ```

4. **Démarrer l'application React Native :**
   ```bash
   cd react-native
   npm start
   ```
   
   Ou directement :
   ```bash
   npm run android  # Pour Android
   npm run ios      # Pour iOS
   ```

## Structure du projet

```
react-native/
├── App.js                    # Point d'entrée principal
├── src/
│   ├── screens/             # Écrans de l'application
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── MeasureScreen.js
│   │   ├── CameraMeasureScreen.js
│   │   ├── ManualMeasureScreen.js
│   │   ├── HistoryScreen.js
│   │   ├── GoldPriceScreen.js
│   │   ├── MarketplaceScreen.js
│   │   └── ProductDetailScreen.js
│   ├── services/            # Services API et stockage
│   │   ├── api.js
│   │   └── storage.js
│   └── utils/               # Utilitaires
│       └── measurementCalculator.js
├── package.json
└── app.json
```

## Utilisation

### Mesure par caméra avec cercle

1. Allez dans l'onglet "Mesure"
2. Sélectionnez "Caméra avec Cercle"
3. Prenez une photo ou choisissez une image
4. Ajustez les cercles :
   - Touchez le cercle de la bague pour le sélectionner
   - Déplacez votre doigt pour ajuster la taille
   - Faites de même pour le cercle de référence (pièce de monnaie)
5. Entrez le diamètre de la pièce de référence (par défaut 24mm pour une pièce de 2€)
6. Appuyez sur "Calculer"
7. Enregistrez la mesure

### Mesure manuelle

1. Allez dans l'onglet "Mesure"
2. Sélectionnez "Entrée Manuelle"
3. Choisissez la méthode d'entrée (Diamètre, Circonférence, Taille US, Taille EU)
4. Entrez la valeur
5. Appuyez sur "Calculer"
6. Enregistrez la mesure

## Dépendances principales

- `expo` - Framework React Native
- `@react-navigation` - Navigation
- `expo-camera` - Accès à la caméra
- `expo-image-picker` - Sélection d'images
- `axios` - Client HTTP
- `@react-native-async-storage/async-storage` - Stockage local
- `victory-native` - Graphiques
- `react-native-svg` - SVG pour les cercles

## Notes importantes

- Assurez-vous que le serveur Laravel est démarré avant de lancer l'application
- Pour tester sur un appareil physique, assurez-vous que l'appareil et votre PC sont sur le même réseau WiFi
- L'URL de l'API doit être accessible depuis l'appareil/émulateur

## Dépannage

### Erreur de connexion à l'API

1. Vérifiez que le serveur Laravel est démarré
2. Vérifiez l'URL dans `src/services/api.js`
3. Pour un appareil physique, vérifiez que l'IP est correcte
4. Vérifiez que le pare-feu n'bloque pas les connexions

### Problème de caméra

- Vérifiez les permissions de l'application
- Sur Android, les permissions sont demandées automatiquement
- Sur iOS, vous devrez peut-être les configurer dans `app.json`


