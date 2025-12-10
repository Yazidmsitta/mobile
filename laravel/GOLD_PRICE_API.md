# 📊 API des Prix de l'Or

## Vue d'ensemble

L'API des prix de l'or permet de récupérer les prix historiques de l'or (18K et 24K) en EUR.

## Endpoint

```
GET /api/gold-prices
```

**Authentification requise** : Oui (Bearer Token)

## Paramètres de requête

- `karat` (optionnel) : Filtrer par carat (`18K` ou `24K`)
- `period` (optionnel) : Période de données (`day`, `week`, `month`, `year`) - Par défaut: `month`
- `start_date` (optionnel) : Date de début (format: `YYYY-MM-DD`)
- `end_date` (optionnel) : Date de fin (format: `YYYY-MM-DD`)

## Exemples de requêtes

### Récupérer les prix du dernier mois
```bash
GET /api/gold-prices
```

### Récupérer uniquement les prix 24K
```bash
GET /api/gold-prices?karat=24K
```

### Récupérer les prix de la dernière semaine
```bash
GET /api/gold-prices?period=week
```

### Récupérer les prix sur une période personnalisée
```bash
GET /api/gold-prices?start_date=2025-11-01&end_date=2025-12-10
```

## Réponse

```json
{
  "data": [
    {
      "id": 1,
      "karat": "24K",
      "price_per_gram": "62.82",
      "currency": "EUR",
      "date_recorded": "2025-12-10",
      "created_at": "2025-12-10T20:52:41.000000Z",
      "updated_at": "2025-12-10T20:52:41.000000Z"
    },
    ...
  ],
  "latest": {
    "24K": {
      "price_per_gram": "62.82",
      "currency": "EUR",
      "date": "2025-12-10"
    },
    "18K": {
      "price_per_gram": "47.12",
      "currency": "EUR",
      "date": "2025-12-10"
    }
  }
}
```

## Remplir la base de données

### Option 1: Utiliser la commande Artisan

```bash
php artisan gold:fetch --days=90
```

Cette commande génère des prix réalistes pour les 90 derniers jours (ou le nombre de jours spécifié).

### Option 2: Utiliser le Seeder

```bash
php artisan db:seed --class=GoldPriceHistorySeeder
```

### Option 3: Mettre à jour quotidiennement

Ajoutez cette ligne dans `app/Console/Kernel.php` pour mettre à jour automatiquement :

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('gold:fetch --days=1')->daily();
}
```

## Notes

- Les prix sont stockés en EUR par gramme
- Les prix 18K sont calculés à 75% du prix 24K
- Les données sont générées avec une variation de ±5% pour simuler les fluctuations du marché
- En production, remplacez la génération de données par un appel à une vraie API (ex: metals-api.com, goldapi.io)

