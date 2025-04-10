# Analyseur de Couleurs d'Items

[![Netlify Status](https://api.netlify.com/api/v1/badges/b087912e-80ff-4999-8ff6-fdd319a3ec15/deploy-status)](https://app.netlify.com/sites/random-item-lol/deploys)

Ce projet est un outil d'analyse de couleurs pour les items de jeu. Il permet de détecter automatiquement les couleurs dominantes des images d'items.

## Fonctionnalités

- Analyse automatique des couleurs dominantes des images
- Détection précise des teintes principales (rouge, bleu, violet, vert, jaune, orange, cyan)
- Stockage des résultats dans un fichier JSON
- Interface web pour visualiser les résultats

## Prérequis

- Node.js (version 14 ou supérieure)
- NPM (gestionnaire de paquets Node.js)

## Installation

1. Clonez le dépôt :
```bash
git clone [url-du-repo]
```

2. Installez les dépendances :
```bash
npm install
```

## Utilisation

1. Démarrez le serveur :
```bash
node server.js
```

2. Accédez à l'interface via :
- http://localhost:3000
- http://127.0.0.1:3000

3. Pour analyser les images :
```bash
node analyzeImages.js
```

## Structure des fichiers

- `server.js` : Serveur web Express
- `analyzeImages.js` : Script d'analyse des couleurs
- `data/items.json` : Base de données des items et leurs couleurs
- `public/` : Ressources statiques (images, CSS)

## Notes techniques

- L'analyse des couleurs utilise des seuils optimisés pour détecter :
  - Rouge (R > G et R > B)
  - Bleu (B > R et B > G)
  - Violet (R et B élevés, G bas)
  - Vert (G > R et G > B)
  - Jaune (R et G élevés, B bas)
  - Orange (R élevé, G moyen, B bas)
  - Cyan (B et G élevés, R bas)
