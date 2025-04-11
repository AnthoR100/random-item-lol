# Analyseur de Couleurs d'Items

[![Netlify Status](https://api.netlify.com/api/v1/badges/b087912e-80ff-4999-8ff6-fdd319a3ec15/deploy-status)](https://app.netlify.com/sites/random-item-lol/deploys)

Ce projet est un outil d'analyse de couleurs pour les items de League of Legends. Il permet de générer aléatoirement une couleur et de trouver des items correspondants.

## Fonctionnalités

### Interface Utilisateur
- Génération aléatoire de couleurs (rouge, bleu, vert, jaune, orange, violet)
- Affichage visuel de la couleur sélectionnée
- Animation lors de la génération de couleur
- Affichage des items sous forme de cartes avec animations
- Modal détaillé pour chaque item avec description et statistiques
- Interface responsive et moderne

### Détection des Couleurs
- Algorithme avancé de détection des couleurs avec plusieurs cas par couleur :
  - **Rouge** : Détection stricte avec dominance rouge (R > 200)
  - **Bleu** : Multiple cas (bleu clair, moyen, sombre, dominant)
  - **Vert** : Support des verts vifs et sombres
  - **Jaune** : Détection basée sur l'équilibre rouge-vert
  - **Orange** : Analyse des ratios rouge-vert-bleu
  - **Violet** : Support de trois types (classique, foncé, clair)

### Performance
- Chargement asynchrone des données
- Optimisation de la mémoire
- Déduplication des items
- Sélection aléatoire des items pour plus de variété
- Gestion efficace des erreurs et des états de chargement

### Statistiques et Analyse
- Affichage du nombre total d'items analysés
- Compteur de correspondances par couleur
- Logs détaillés dans la console pour le débogage

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/AnthoR100/random-item-lol.git
```

2. Ouvrez le fichier `index.html` dans votre navigateur

## Structure des fichiers

- `index.html` : Page principale de l'application
- `public/script.js` : Logique de l'application et algorithmes de détection
- `public/styles.css` : Styles et animations
- `data/items.json` : Base de données des items et leurs couleurs

## Notes techniques

### Algorithme de Détection des Couleurs
L'analyse des couleurs utilise des seuils et ratios optimisés :

- **Rouge** :
  ```javascript
  r > 200 && r > g * 2.2 && r > b * 2.2 && g < 100 && b < 100
  ```
- **Bleu** :
  ```javascript
  (b > 130 && b > r * 1.2 && b > g * 1.2) || 
  (b > 100 && b > Math.max(r, g) * 1.1) ||
  (b > 80 && g < 80 && r < 80)
  ```
- **Violet** :
  ```javascript
  (r > 100 && b > 100 && Math.abs(r - b) < 80 && g < 130) ||
  (r > 80 && b > 80 && g < 80) ||
  (r > 150 && b > 150 && g < 150)
  ```

### Performance
- Utilisation de `requestAnimationFrame` pour les animations
- Optimisation des calculs de couleurs
- Gestion efficace de la mémoire
- Support des formats de couleurs multiples

## Déploiement

L'application est déployée automatiquement sur Netlify à chaque push sur la branche main.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

MIT License - voir le fichier LICENSE pour plus de détails.
