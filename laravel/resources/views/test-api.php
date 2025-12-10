<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test API - Ring Sizer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #DAA520;
            border-bottom: 2px solid #DAA520;
            padding-bottom: 10px;
        }
        .endpoint {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #DAA520;
            border-radius: 4px;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
        }
        .method.post { background: #4CAF50; color: white; }
        .method.get { background: #2196F3; color: white; }
        .method.put { background: #FF9800; color: white; }
        .method.delete { background: #f44336; color: white; }
        code {
            background: #e0e0e0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .note {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .test-form {
            margin: 20px 0;
            padding: 15px;
            background: #f0f0f0;
            border-radius: 4px;
        }
        input, button {
            padding: 10px;
            margin: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #DAA520;
            color: white;
            cursor: pointer;
            border: none;
        }
        button:hover {
            background: #B8860B;
        }
        #result {
            margin-top: 20px;
            padding: 15px;
            background: #e8f5e9;
            border-radius: 4px;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Test API - Ring Sizer</h1>
        
        <div class="note">
            <strong>⚠️ Note importante :</strong> Cette page est uniquement pour les tests. 
            Utilisez Postman, curl ou l'application Android pour les vraies requêtes API.
        </div>

        <h2>Endpoints disponibles</h2>

        <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/api/auth/register</strong><br>
            <small>Inscription d'un nouvel utilisateur</small>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/api/auth/login</strong><br>
            <small>Connexion (nécessite email et password)</small>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/measurements</strong><br>
            <small>Liste des mesures (nécessite authentification)</small>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <strong>/api/measurements</strong><br>
            <small>Créer une mesure (nécessite authentification)</small>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/gold-prices</strong><br>
            <small>Cours de l'or (nécessite authentification)</small>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <strong>/api/products</strong><br>
            <small>Liste des produits (nécessite authentification)</small>
        </div>

        <h2>Test rapide - Inscription</h2>
        <div class="test-form">
            <form id="registerForm">
                <input type="text" id="name" placeholder="Nom" required><br>
                <input type="email" id="email" placeholder="Email" required><br>
                <input type="password" id="password" placeholder="Mot de passe" required><br>
                <button type="submit">S'inscrire</button>
            </form>
            <div id="result"></div>
        </div>

        <h2>Documentation</h2>
        <p>Consultez <code>TEST_API.md</code> pour des exemples complets avec curl et Postman.</p>
    </div>

    <script>
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const resultDiv = document.getElementById('result');
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Envoi en cours...';

            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                password_confirmation: document.getElementById('password').value
            };

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                resultDiv.textContent = JSON.stringify(result, null, 2);
                resultDiv.style.background = response.ok ? '#e8f5e9' : '#ffebee';
            } catch (error) {
                resultDiv.textContent = 'Erreur: ' + error.message;
                resultDiv.style.background = '#ffebee';
            }
        });
    </script>
</body>
</html>












