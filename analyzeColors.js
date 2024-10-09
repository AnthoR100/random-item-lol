const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const getColors = require('get-image-colors');

// Couleurs de référence (ajoutez vos couleurs ici)
const referenceColors = {
    "yellow": "#FCDC12",
    "red": "#ff0000",
    "blue": "#0000ff",
    "green": "#00ff00",
    "orange": "#ff8000",
    "pink": "#ff00ff",
    "purple": "#800080", // Mauve
    "brown": "#8B4513"  // Brun
};

// Charger les données du fichier JSON
const itemsFilePath = path.join(__dirname, 'data', 'data.json'); // Assurez-vous que le chemin est correct
let itemsData;

try {
    itemsData = require(itemsFilePath);
} catch (error) {
    console.error("Erreur lors du chargement du fichier JSON:", error);
    process.exit(1);
}

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

// Fonction pour trouver la couleur de référence la plus proche
function findClosestColor(hexColor) {
    let closestColor = null;
    let minDistance = Infinity;

    for (const [name, refColor] of Object.entries(referenceColors)) {
        const distance = colorDistance(hexColor, refColor);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = name; // Renvoie le nom de la couleur de référence
        }
    }

    return closestColor;
}

// Fonction pour analyser les couleurs dominantes dans une image
async function analyzeImageColors(imageUrl) {
    try {
        if (typeof imageUrl !== 'string' || !/^https?:\/\/.+/.test(imageUrl)) {
            throw new Error("URL invalide");
        }

        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer'
        });

        const imageBuffer = Buffer.from(response.data, 'binary');
        const pngBuffer = await sharp(imageBuffer).png().toBuffer();

        const colors = await getColors(pngBuffer, 'image/png');
        const hexColors = colors.map(color => color.hex());

        const colorFrequencies = hexColors.reduce((acc, color) => {
            acc[color] = (acc[color] || 0) + 1;
            return acc;
        }, {});

        // Obtenir les 3 couleurs les plus fréquentes
        const sortedColors = Object.entries(colorFrequencies).sort((a, b) => b[1] - a[1]);
        const topColors = sortedColors.slice(0, 3).map(entry => entry[0]); // Récupérer uniquement les hex codes

        return topColors; // Retourne les 3 couleurs les plus dominantes
    } catch (error) {
        console.error(`Erreur lors de l'analyse des couleurs de l'image (${imageUrl}): ${error.message}`);
        return [];
    }
}

// Fonction principale pour analyser toutes les images et afficher les couleurs dominantes
async function updateItemsWithColors() {
    const allColors = [];

    for (const itemId in itemsData) {
        const item = itemsData[itemId];
        if (item && item.image) {
            console.log(`Analyse des couleurs pour ${item.name} (${itemId})...`);
            const dominantColors = await analyzeImageColors(item.image);

            if (dominantColors.length > 0) {
                // Trouver la couleur de référence la plus proche pour chaque couleur dominante
                const closestColors = dominantColors.map(color => findClosestColor(color));
                console.log(`Couleurs principales pour ${item.name} (${itemId}) :`, closestColors);
                allColors.push(...closestColors);
            } else {
                console.log(`Aucune couleur trouvée pour ${item.name} (${itemId}).`);
            }
        }
    }

    // Compter les occurrences des couleurs
    const colorCounts = allColors.reduce((acc, color) => {
        acc[color] = (acc[color] || 0) + 1;
        return acc;
    }, {});

    // Obtenir les 6 couleurs les plus fréquentes
    const sortedColorCounts = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
    const top6Colors = sortedColorCounts.slice(0, 6).map(entry => entry[0]);

    console.log("Résumé des 6 couleurs les plus utilisées :", top6Colors);
}

// Exécuter l'analyse
updateItemsWithColors().catch(console.error);
