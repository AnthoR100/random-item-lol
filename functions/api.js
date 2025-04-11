const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const itemsPath = path.join(__dirname, 'data/items.json');
    const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

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
      body: JSON.stringify({ error: 'Erreur lors de la lecture des données' })
    };
  }
}; 