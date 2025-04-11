const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // Essayer plusieurs chemins possibles
    const possiblePaths = [
      path.join(__dirname, 'data', 'items.json'),
      path.join(__dirname, '..', 'data', 'items.json'),
      path.join(process.cwd(), 'data', 'items.json')
    ];

    console.log('Chemins possibles:', possiblePaths);
    
    let itemsData = null;
    let errorMessages = [];

    for (const itemsPath of possiblePaths) {
      try {
        console.log('Tentative de lecture du fichier:', itemsPath);
        if (fs.existsSync(itemsPath)) {
          console.log('Le fichier existe à:', itemsPath);
          const fileContent = fs.readFileSync(itemsPath, 'utf8');
          itemsData = JSON.parse(fileContent);
          console.log('Fichier lu avec succès');
          break;
        } else {
          console.log('Le fichier n\'existe pas à:', itemsPath);
          errorMessages.push(`Fichier non trouvé: ${itemsPath}`);
        }
      } catch (error) {
        console.error('Erreur lors de la lecture à', itemsPath, ':', error);
        errorMessages.push(`Erreur: ${error.message} à ${itemsPath}`);
      }
    }

    if (!itemsData) {
      console.error('Aucun fichier trouvé. Erreurs:', errorMessages);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Erreur lors de la lecture des données',
          details: errorMessages,
          currentDir: __dirname,
          workingDir: process.cwd()
        })
      };
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