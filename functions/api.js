const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    // Essayer de lire le fichier local d'abord
    let itemsData;
    try {
      const itemsPath = path.join(__dirname, '../data/items.json');
      itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    } catch (error) {
      // Si le fichier local n'est pas disponible, faire une requête à l'API de LoL
      const response = await fetch('https://ddragon.leagueoflegends.com/cdn/15.7.1/data/fr_FR/item.json');
      const data = await response.json();
      
      // Filtrer les items comme dans recupItem.py
      const items = data.data || {};
      itemsData = {};
      
      for (const [itemId, itemInfo] of Object.entries(items)) {
        const goldTotal = itemInfo.gold?.total || 0;
        const maps = itemInfo.maps || {};
        
        if (goldTotal > 2000 && maps["11"]) {
          itemsData[itemId] = {
            name: itemInfo.name,
            gold_total: goldTotal,
            image: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${itemId}.png`
          };
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(itemsData)
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur lors de la récupération des données' })
    };
  }
}; 