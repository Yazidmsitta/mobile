# Configuration Android pour React Native

## Option 1 : Utiliser Expo Go (RECOMMANDÉ - Plus simple)

Avec Expo Go, vous n'avez **PAS besoin** d'installer Android SDK !

### Étapes :

1. **Installer Expo Go sur votre téléphone :**
   - Android : [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS : [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Démarrer l'application :**
   ```bash
   cd react-native
   npm start
   ```

3. **Scanner le QR code :**
   - Ouvrez Expo Go sur votre téléphone
   - Scannez le QR code affiché dans le terminal
   - L'application se chargera automatiquement

**Avantages :**
- ✅ Pas besoin d'Android SDK
- ✅ Pas besoin d'émulateur
- ✅ Test rapide sur téléphone réel
- ✅ Hot reload automatique

---

## Option 2 : Configurer Android SDK (Pour build natif)

Si vous voulez créer un APK natif, vous devez configurer Android SDK.

### Étapes :

1. **Installer Android Studio :**
   - Téléchargez depuis [developer.android.com](https://developer.android.com/studio)
   - Installez Android Studio
   - Ouvrez Android Studio et installez le SDK via le SDK Manager

2. **Configurer les variables d'environnement :**

   **Windows PowerShell :**
   ```powershell
   # Trouver le chemin du SDK (généralement dans AppData\Local\Android\Sdk)
   $env:ANDROID_HOME = "C:\Users\VOTRE_NOM\AppData\Local\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
   
   # Pour rendre permanent, ajoutez dans les variables d'environnement système
   ```

   **Ou via l'interface Windows :**
   - Panneau de configuration → Système → Paramètres système avancés
   - Variables d'environnement
   - Ajoutez `ANDROID_HOME` = `C:\Users\VOTRE_NOM\AppData\Local\Android\Sdk`
   - Ajoutez à `Path` : `%ANDROID_HOME%\platform-tools` et `%ANDROID_HOME%\tools`

3. **Vérifier l'installation :**
   ```bash
   adb version
   ```

4. **Créer un build Android :**
   ```bash
   cd react-native
   npx expo prebuild
   npx expo run:android
   ```

---

## Recommandation

**Utilisez Expo Go** pour le développement et les tests. C'est beaucoup plus simple et rapide !

Pour la production, vous pouvez utiliser EAS Build (Expo Application Services) qui gère tout automatiquement.

