# 🔧 Guide de Dépannage - Erreurs Réseau

## Erreur: "Network Error" ou "ERR_NETWORK"

Cette erreur signifie que l'application React Native ne peut pas se connecter au serveur Laravel.

### ✅ Vérifications à faire:

#### 1. **Serveur Laravel est-il démarré ?**

Dans un terminal PowerShell, exécutez:
```powershell
cd laravel
php artisan serve --host=0.0.0.0 --port=8000
```

Vous devriez voir:
```
Laravel development server started: http://0.0.0.0:8000
```

#### 2. **Vérifier l'adresse IP**

Trouvez votre adresse IP WiFi:
```powershell
ipconfig | findstr /i "IPv4"
```

Cherchez l'adresse IP de "Wireless LAN adapter WiFi" (pas "VirtualBox" ou "VMware").

Exemple: `192.168.1.16`

#### 3. **Configurer l'URL dans l'application**

Ouvrez `react-native/src/services/api.js` et modifiez l'URL:

**Pour un émulateur Android:**
```javascript
const API_BASE_URL = 'http://10.0.2.2:8000/api/';
```

**Pour un appareil physique (Expo Go):**
```javascript
const API_BASE_URL = 'http://192.168.1.16:8000/api/'; // Remplacez par votre IP
```

#### 4. **Vérifier le pare-feu Windows**

Le pare-feu Windows peut bloquer les connexions. Exécutez:
```powershell
.\configure-firewall.ps1
```

Ou manuellement:
```powershell
New-NetFirewallRule -DisplayName "Laravel Development Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

#### 5. **Vérifier que le téléphone et l'ordinateur sont sur le même WiFi**

- Le téléphone et l'ordinateur doivent être sur le **même réseau WiFi**
- Ne pas utiliser un hotspot mobile
- Vérifier que le WiFi n'est pas en mode "invité" ou isolé

#### 6. **Tester la connexion**

Depuis votre téléphone (ou émulateur), ouvrez un navigateur et testez:
- Émulateur: `http://10.0.2.2:8000/api/`
- Téléphone: `http://192.168.1.16:8000/api/` (remplacez par votre IP)

Vous devriez voir une réponse JSON ou une erreur Laravel (pas "impossible d'accéder au site").

### 🔍 Debugging

Si l'erreur persiste, vérifiez les logs dans la console Expo:
- Ouvrez le terminal où `npm start` est exécuté
- Regardez les messages d'erreur détaillés
- Vérifiez l'URL utilisée dans les logs

### 📝 Checklist

- [ ] Serveur Laravel démarré avec `--host=0.0.0.0`
- [ ] Adresse IP correcte dans `api.js`
- [ ] Pare-feu Windows configuré
- [ ] Téléphone et ordinateur sur le même WiFi
- [ ] Test de connexion réussi dans le navigateur

