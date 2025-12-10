# 🔧 Correction de l'erreur 500 - Base de données

## Problème identifié
L'erreur 500 est causée par l'impossibilité de se connecter à la base de données MySQL.

## Solutions possibles

### Option 1: Utiliser SQLite (plus simple pour le développement)

1. Modifiez le fichier `.env` dans `laravel/`:
```env
DB_CONNECTION=sqlite
# Commentez ou supprimez les lignes MySQL:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ring_sizer
# DB_USERNAME=root
# DB_PASSWORD=
```

2. Créez le fichier de base de données SQLite:
```powershell
cd laravel
New-Item -ItemType File -Path database\database.sqlite
```

3. Exécutez les migrations:
```powershell
php artisan migrate
```

### Option 2: Démarrer MySQL

1. Vérifiez que MySQL est installé et démarré
2. Vérifiez la configuration dans `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ring_sizer
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

3. Créez la base de données:
```sql
CREATE DATABASE ring_sizer;
```

4. Exécutez les migrations:
```powershell
php artisan migrate
```

