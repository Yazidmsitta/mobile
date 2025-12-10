<?php
// Test simple pour vérifier que PHP fonctionne
echo "PHP fonctionne correctement!<br>";
echo "Version PHP: " . phpversion() . "<br>";

// Test de chargement de l'autoloader
if (file_exists(__DIR__.'/../vendor/autoload.php')) {
    echo "Autoloader trouvé<br>";
    require __DIR__.'/../vendor/autoload.php';
    echo "Autoloader chargé<br>";
} else {
    echo "ERREUR: Autoloader non trouvé<br>";
}

// Test de chargement de l'application
try {
    $app = require_once __DIR__.'/../bootstrap/app.php';
    echo "Application Laravel chargée avec succès!<br>";
    echo "Type: " . get_class($app) . "<br>";
} catch (Exception $e) {
    echo "ERREUR lors du chargement de l'application: " . $e->getMessage() . "<br>";
    echo "Trace: " . $e->getTraceAsString() . "<br>";
}












