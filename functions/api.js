const fs = require('fs');
const path = require('path');

const itemsData = {
    "2065": {
        "name": "Chant de guerre de Shurelya",
        "gold_total": 2200,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/2065.png",
        "colors": ["#FCDC12"]
    },
    "3074": {
        "name": "Hydre vorace",
        "gold_total": 3300,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3074.png",
        "colors": ["#ff0000"]
    },
    "3071": {
        "name": "Couperet noir",
        "gold_total": 3000,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3071.png",
        "colors": ["#ff00ff"]
    },
    "6676": {
        "name": "Créateur de failles",
        "gold_total": 3200,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/6676.png",
        "colors": ["#ff00ff", "#ff8000"]
    },
    "3040": {
        "name": "Étreinte du séraphin",
        "gold_total": 2900,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3040.png",
        "colors": ["#0000ff"]
    },
    "3011": {
        "name": "Bénédiction de Mikael",
        "gold_total": 2300,
        "image": "https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/3011.png",
        "colors": ["#00ff00"]
    }
};

exports.handler = async function(event, context) {
  try {
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