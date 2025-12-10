# Script pour creer un utilisateur vendeur de test
Write-Host "=== Creation d'un utilisateur vendeur de test ===" -ForegroundColor Green
Write-Host ""

$email = Read-Host "Email (ou appuyez sur Entree pour utiliser vendor@test.com)"
if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "vendor@test.com"
}

$name = Read-Host "Nom (ou appuyez sur Entree pour utiliser Vendeur Test)"
if ([string]::IsNullOrWhiteSpace($name)) {
    $name = "Vendeur Test"
}

$password = Read-Host "Mot de passe (ou appuyez sur Entree pour utiliser password123)"
if ([string]::IsNullOrWhiteSpace($password)) {
    $password = "password123"
}

Write-Host ""
Write-Host "Creation de l'utilisateur vendeur..." -ForegroundColor Cyan

$phpCommand = @"
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Hash;

`$user = User::firstOrCreate(
    ['email' => '$email'],
    [
        'name' => '$name',
        'password' => Hash::make('$password'),
        'user_type' => 'VENDEUR',
    ]
);

if (`$user->wasRecentlyCreated) {
    echo \"Utilisateur cree avec succes!\n\";
} else {
    `$user->update(['user_type' => 'VENDEUR']);
    echo \"Utilisateur mis a jour en vendeur!\n\";
}

`$vendor = Vendor::firstOrCreate(
    ['user_id' => `$user->id],
    [
        'shop_name' => `$user->name . ' Shop',
        'description' => 'Boutique de produits en or',
        'is_verified' => false,
    ]
);

if (`$vendor->wasRecentlyCreated) {
    echo \"Profil vendeur cree avec succes!\n\";
} else {
    echo \"Profil vendeur existe deja!\n\";
}

echo \"\nInformations de connexion:\n\";
echo \"Email: $email\n\";
echo \"Mot de passe: $password\n\";
echo \"Type: VENDEUR\n\";
"@

cd D:\EMSI4eme\Mobile\laravel
php artisan tinker --execute=$phpCommand

Write-Host ""
Write-Host "Utilisateur vendeur cree avec succes!" -ForegroundColor Green

