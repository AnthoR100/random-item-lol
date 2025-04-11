// Importer les données directement
const items = {
  "2065": {
    "name": "Chant de guerre de Shurelya",
    "image": "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/item/2065.png",
    "description": "...",
    "color": ["#ff0000"],
    "gold_total": 2300
  }
  // ... autres items ...
};

exports.handler = async function(event, context) {
  try {
    const items = {
      "2065": {
        "name": "Chant de guerre de Shurelya",
        "gold_total": 2200,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/2065.png",
        "color": ["#FCDC12"]
      },
      "3074": {
        "name": "Hydre vorace",
        "gold_total": 3300,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3074.png",
        "color": ["#ff0000"]
      },
      "3071": {
        "name": "Couperet noir",
        "gold_total": 3000,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3071.png",
        "color": ["#ff00ff"]
      },
      "6676": {
        "name": "Créateur de failles",
        "gold_total": 3200,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/6676.png",
        "color": ["#ff00ff", "#ff8000"]
      },
      "3040": {
        "name": "Étreinte du séraphin",
        "gold_total": 2900,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3040.png",
        "color": ["#0000ff"]
      },
      "3011": {
        "name": "Bénédiction de Mikael",
        "gold_total": 2300,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3011.png",
        "color": ["#00ff00"]
      }
    };

    // Transformer les données
    const formattedItems = Object.entries(items).map(([id, item]) => ({
      id,
      name: item.name,
      image: item.image,
      description: item.description || "",
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