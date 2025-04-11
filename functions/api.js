const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // Lire le fichier JSON
    const itemsData = await fs.promises.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8');
    const items = JSON.parse(itemsData);
    
    // Transformer les données comme dans server.js
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(formattedItems)
    };
  } catch (error) {
    console.error('Erreur générale:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erreur lors de la lecture des données',
        details: error.message,
        stack: error.stack
      })
    };
  }
}; 