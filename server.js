// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to handle CORS
app.use(cors());

// Middleware to serve static files
app.use(express.static('public'));
app.use('/data', express.static('data'));

// Route pour obtenir tous les items avec leurs couleurs
app.get('/api/items', async (req, res) => {
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

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
}

module.exports = app;
