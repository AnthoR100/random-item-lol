const fs = require('fs'); 
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const getColors = require('get-image-colors');

// Charger les données du fichier JSON
const itemsFilePath = path.join(__dirname, 'data', 'data.json');
let itemsData;
try {
    itemsData = require(itemsFilePath);
} catch (error) {
    console.error("Erreur lors du chargement du fichier JSON:", error);
    process.exit(1);
}

// Couleurs primaires et secondaires
const primaryColors = ['#ff0000', '#00ff00', '#0000ff']; // Rouge, Vert, Bleu
const secondaryColors = ['#FCDC12', '#ff8000', '#ff00ff']; // Jaune, orange, Magenta
const combinedColors = primaryColors.concat(secondaryColors); // Combiner les couleurs primaires et secondaires

// Fonction pour calculer la distance entre deux couleurs RGB
function colorDistance(color1, color2) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
}

// Fonction pour trouver la couleur la plus proche parmi les couleurs spécifiées
function findClosestColor(color, colorArray) {
    return colorArray.reduce((closest, current) => {
        const currentDistance = colorDistance(color, current);
        return currentDistance < closest.distance ? { color: current, distance: currentDistance } : closest;
    }, { color: null, distance: Infinity }).color;
}

// Fonction pour télécharger l'image et analyser les couleurs
async function analyzeImageColors(imageUrl) {
    try {
        // Vérifier si l'URL est valide
        if (typeof imageUrl !== 'string' || !/^https?:\/\/.+/.test(imageUrl)) {
            throw new Error("URL invalide");
        }

        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer'
        });

        const imageBuffer = Buffer.from(response.data, 'binary');
        
        // Convertir l'image en PNG
        const pngBuffer = await sharp(imageBuffer).png().toBuffer();

        // Obtenir les couleurs principales de l'image
        const colors = await getColors(pngBuffer, 'image/png');
        const hexColors = colors.map(color => color.hex());

        // Compter la fréquence de chaque couleur
        const colorFrequencies = hexColors.reduce((acc, color) => {
            const closestColor = findClosestColor(color, combinedColors);
            if (closestColor) {
                acc[closestColor] = (acc[closestColor] || 0) + 1;
            }
            return acc;
        }, {});

        // Calculer le pourcentage de chaque couleur
        const totalPixels = hexColors.length;
        const colorPercentages = Object.entries(colorFrequencies).map(([color, count]) => ({
            color,
            percentage: (count / totalPixels) * 100
        }));

        // Filtrer les couleurs qui dépassent 35%
        const dominantColors = colorPercentages.filter(entry => entry.percentage >= 35);

        return dominantColors.map(entry => entry.color);
    } catch (error) {
        console.error(`Erreur lors de l'analyse des couleurs de l'image (${imageUrl}): ${error.message}`);
        return [];
    }
}

// Fonction principale pour analyser toutes les images et mettre à jour le fichier JSON
async function updateItemsWithColors() {
    for (const itemId in itemsData) {
        const item = itemsData[itemId];
        if (item && item.name && item.gold_total && item.gold_total > 2000) {
            const imageUrl = `https://ddragon.leagueoflegends.com/cdn/14.20.1/img/item/${itemId}.png`;
            console.log(`Analyse des couleurs pour ${item.name}...`);

            const dominantColors = await analyzeImageColors(imageUrl);
            if (dominantColors.length > 0) {
                // Mettre à jour l'item avec l'image et les couleurs dominantes
                itemsData[itemId] = {
                    ...item,
                    image: imageUrl,
                    color: dominantColors
                };
                console.log(`Couleurs principales pour ${item.name} : ${dominantColors}`);
            } else {
                console.log(`Aucune couleur dépassant 35% pour ${item.name}`);
            }
        }
    }

    // Écrire les données mises à jour dans le fichier JSON
    fs.writeFileSync(itemsFilePath, JSON.stringify(itemsData, null, 2));
    console.log('Fichier JSON mis à jour avec les couleurs principales.');
}

// Exécuter la mise à jour
updateItemsWithColors().catch(console.error);

// commande pour lancer: node analyzeImages.js
