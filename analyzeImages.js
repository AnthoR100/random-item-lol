const axios = require('axios');
const fs = require('fs').promises;
const sharp = require('sharp');
const getColors = require('get-image-colors');

// Charger les données du fichier JSON
async function loadItems() {
    try {
        const data = await fs.readFile('data/items.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors du chargement des items:', error);
        return {};
    }
}

// Fonction pour analyser les couleurs d'une image
async function analyzeImageColors(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        const colors = await getColors(buffer, 'image/png');
        const hexColors = colors.map(color => color.hex());

        // Calculer les scores pour chaque couleur
        const colorScores = hexColors.map(color => {
            const r = parseInt(color.substring(1, 3), 16);
            const g = parseInt(color.substring(3, 5), 16);
            const b = parseInt(color.substring(5, 7), 16);

            // Rouge : R élevé par rapport à G et B
            if ((r > 110 && r > g * 1.15 && r > b * 1.15) || 
                (r > 80 && r > Math.max(g, b) * 1.25) ||
                (r > 60 && r > g * 1.1 && r > b * 1.1 && g < 80 && b < 80)) {
                return '#ff0000';
            }
            // Violet : R et B élevés et très proches, G significativement plus bas
            else if ((r > 120 && b > 120 && 
                    Math.abs(r - b) < 30 && 
                    g < Math.min(r, b) * 0.5 &&
                    Math.max(r, b) > 150) ||
                    (r > 100 && b > 100 &&
                    Math.abs(r - b) < 25 &&
                    g < Math.min(r, b) * 0.4 &&
                    Math.max(r, b) > 130)) {
                return '#ff00ff';
            }
            // Vert : G très élevé par rapport à R et B
            else if ((g > 60 && g > r * 1.05 && g > b * 1.05) ||
                    (g > 40 && g > Math.max(r, b) * 1.1) ||
                    (g > 30 && g > Math.max(r, b) * 1.05 && r < 70 && b < 70) ||
                    (g > 20 && g > r && g > b && r < 50 && b < 50)) {
                return '#00ff00';
            }
            // Jaune/Doré : R et G élevés et proches, B significativement plus bas
            else if ((r > 200 && g > 180 && b < 130 && 
                    Math.abs(r - g) < 40 && r > b * 1.6) ||
                    (r > 180 && g > 160 && b < 100 && 
                    Math.abs(r - g) < 30 && r > b * 1.5)) {
                return '#FCDC12';
            }
            // Orange : R très élevé, G moyen-haut, B bas
            else if ((r > 220 && g > 140 && g < 180 && b < 80 && r > g * 1.4) ||
                     (r > 200 && g > 120 && b < 60 && r > g * 1.3)) {
                return '#ff8000';
            }
            // Cyan/Turquoise : B et G élevés, R plus bas
            else if ((b > 120 && g > 120 && r < Math.min(b, g) * 0.8) ||
                     (b > 100 && g > 100 && r < Math.min(b, g) * 0.7 && Math.abs(b - g) < 50)) {
                return '#00ffff';
            }
            // Bleu : B élevé, R et G significativement plus bas
            else if ((b > 130 && b > r * 1.3 && b > g * 1.3) ||
                     (b > 100 && b > Math.max(r, g) * 1.5)) {
                return '#0000ff';
            }
            return null;
        }).filter(color => color !== null);

        // Compter les occurrences de chaque couleur
        const colorCounts = {};
        colorScores.forEach(color => {
            colorCounts[color] = (colorCounts[color] || 0) + 1;
        });

        // Calculer les pourcentages et trier
        const totalColors = colorScores.length;
        const colorPercentages = Object.entries(colorCounts).map(([color, count]) => ({
            color,
            percentage: (count / totalColors) * 100
        })).sort((a, b) => b.percentage - a.percentage);

        // Retourner les couleurs qui dépassent le seuil
        const threshold = 15; // Seuil de 15%
        return colorPercentages
            .filter(({percentage}) => percentage >= threshold)
            .map(({color}) => color);

    } catch (error) {
        console.error(`Erreur lors de l'analyse de l'image ${imageUrl}:`, error);
        return [];
    }
}

// Mettre à jour les items avec leurs couleurs
async function updateItemsWithColors(items) {
    for (const [id, item] of Object.entries(items)) {
        console.log(`Analyse des couleurs pour ${item.name}...`);
        const colors = await analyzeImageColors(item.image);
        if (colors.length > 0) {
            console.log(`Couleurs principales pour ${item.name} : ${colors.join(',')}`);
            item.color = colors;
        } else {
            console.log(`Aucune couleur dépassant les seuils de dominance pour ${item.name}`);
        }
    }
    return items;
}

// Sauvegarder les données mises à jour
async function saveItems(items) {
    try {
        await fs.writeFile('data/items.json', JSON.stringify(items, null, 2));
        console.log('Fichier JSON mis à jour avec les couleurs principales.');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des items:', error);
    }
}

// Exécuter le script
async function main() {
    const items = await loadItems();
    const updatedItems = await updateItemsWithColors(items);
    await saveItems(updatedItems);
}

main();

// commande pour lancer: node analyzeImages.js
