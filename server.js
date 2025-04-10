// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;
const host = 'localhost';

// Middleware to handle CORS
app.use(cors());

// Middleware to serve static files
app.use(express.static('public'));
app.use('/data', express.static('data'));

// Route pour obtenir tous les items avec leurs couleurs
app.get('/items', async (req, res) => {
    try {
        const itemsData = await fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8');
        const items = JSON.parse(itemsData);
        
        // Transformer les données pour inclure les couleurs
        const formattedItems = Object.entries(items).map(([id, item]) => ({
            id,
            name: item.name,
            image: item.image,
            description: item.description,
            colors: item.color || [],
            stats: {
                price: item.gold_total
            }
        }));

        res.json(formattedItems);
    } catch (error) {
        console.error('Erreur lors de la lecture des items:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/test', (req, res) => {
    res.send('Le serveur fonctionne correctement !');
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log('Pour accéder au serveur, utilisez l\'une des adresses suivantes :');
    console.log(`- http://localhost:${PORT}`);
    console.log(`- http://127.0.0.1:${PORT}`);
});
