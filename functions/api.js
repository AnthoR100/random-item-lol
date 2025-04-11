const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // Lire le fichier JSON
    const itemsPath = path.join(__dirname, 'data', 'items.json');
    const rawData = await fs.promises.readFile(itemsPath, 'utf8');
    const items = JSON.parse(rawData);

    // Transformer les données
    const formattedItems = Object.entries(items).map(([id, item]) => ({
      id,
      name: item.name,
      image: item.image,
      colors: item.color || [],
      stats: {
        price: item.gold_total
      }
    }));
    
    console.log('Données transformées avec succès');
    console.log('Nombre d\'items formatés:', formattedItems.length);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(formattedItems)
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Erreur lors du traitement des données',
        details: error.message
      })
    };
  }
}; 