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
      
      // Définir les couleurs par défaut pour certains items
      const itemColors = {
        // Items rouges
        '3074': ['#ff0000'], // Hydre vorace
        '3153': ['#ff0000'], // Lame du roi déchu
        '6692': ['#ff0000'], // Malfaisance
        '6673': ['#ff0000'], // Soif-de-sang
        '3142': ['#ff0000'], // Lame spectre de Youmuu
        '3071': ['#ff0000'], // Cotte épineuse
        
        // Items violets
        '4644': ['#ff00ff'], // Couperet noir
        '3156': ['#ff00ff'], // Gueule de Malmortius
        '6676': ['#ff00ff', '#ff8000'], // Créateur de failles
        
        // Items bleus
        '3040': ['#0000ff'], // Étreinte du séraphin
        '3042': ['#0000ff'], // Muramana
        '6653': ['#0000ff'], // Bâton de l'archange
        '3004': ['#0000ff'], // Manamune
        
        // Items verts
        '3011': ['#00ff00'], // Bénédiction de Mikael
        '3222': ['#00ff00'], // Convergence de Zeke
        
        // Items jaunes/dorés
        '3504': ['#FCDC12'], // Encensoir ardent
        '3190': ['#FCDC12'], // Médaillon de l'Iron Solari
        '6617': ['#FCDC12'], // Chant de guerre de Shurelya
      };
      
      for (const [itemId, itemInfo] of Object.entries(items)) {
        const goldTotal = itemInfo.gold?.total || 0;
        const maps = itemInfo.maps || {};
        
        if (goldTotal > 2000 && maps["11"]) {
          itemsData[itemId] = {
            name: itemInfo.name,
            gold_total: goldTotal,
            image: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/${itemId}.png`,
            colors: itemColors[itemId] || []
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