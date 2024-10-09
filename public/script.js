document.addEventListener("DOMContentLoaded", function() {
    // Récupérer les éléments HTML
    const colorBox = document.getElementById("color-box");
    const generateColorButton = document.getElementById("generate-color");
    const findItemButton = document.getElementById("find-item");
    const itemImagesContainer = document.getElementById("item-images");

    let generatedColor = null; // Variable pour stocker la couleur générée
    let itemsData = null; // Variable pour stocker les données de tous les items

    // Couleurs primaires et secondaires
    const primaryColors = ['#ff0000', '#00ff00', '#0000ff']; // Rouge, Vert, Bleu
    const secondaryColors = ['#FCDC12', '#ff8000', '#ff00ff']; // Jaune, orange, Magenta
    const combinedColors = primaryColors.concat(secondaryColors); // Combiner les couleurs primaires et secondaires

    // Cacher le deuxième bouton initialement
    findItemButton.style.display = "none";

    // Fonction pour charger les données des items
    function loadItemsData() {
        return fetch("/data/data.json") // Change le chemin pour correspondre à 'data.json'
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                itemsData = data;
                console.log("Données des items chargées:", itemsData);
            })
            .catch(error => {
                console.error("Une erreur s'est produite lors du chargement des données des items:", error);
            });
    }

    // Charger les données des items dès que la page est chargée
    loadItemsData();

    // Fonction pour générer une couleur aléatoire parmi les couleurs primaires et secondaires
    generateColorButton.addEventListener("click", function() {
        const randomIndex = Math.floor(Math.random() * combinedColors.length);
        generatedColor = combinedColors[randomIndex];
        colorBox.style.backgroundColor = generatedColor;
        console.log("Couleur générée:", generatedColor);

        // Afficher le deuxième bouton une fois que la couleur est générée
        findItemButton.style.display = "block";
    });

    // Fonction pour trouver des items avec la couleur générée
    findItemButton.addEventListener("click", function() {
        if (!generatedColor) {
            console.error("Aucune couleur générée. Cliquez d'abord sur le bouton pour générer une couleur.");
            return;
        }

        if (!itemsData) {
            console.error("Les données des items ne sont pas encore chargées. Veuillez patienter.");
            return;
        }

        // Trouver les items correspondants
        const matchingItems = Object.entries(itemsData).filter(([itemId, itemData]) => {
            if (!itemData.color) {
                console.warn(`L'article ${itemId} ne contient pas de propriété 'color'. Cet article sera ignoré.`);
                return false;
            }
            return itemData.color.includes(generatedColor);
        });

        itemImagesContainer.innerHTML = ''; // Effacer les éléments précédents

        if (matchingItems.length > 0) {
            // Mélanger les items correspondants
            const shuffledItems = matchingItems.sort(() => 0.5 - Math.random());

            // Afficher jusqu'à 6 items correspondants
            for (let i = 0; i < Math.min(6, shuffledItems.length); i++) {
                const [selectedItemId, selectedItemData] = shuffledItems[i];

                const itemContainer = document.createElement("div");
                itemContainer.className = "item-container";

                const itemImage = document.createElement("img");
                itemImage.className = "item-image";
                itemImage.src = selectedItemData.image; // Utilise 'image' pour l'URL de l'image
                itemImage.alt = selectedItemData.name;
                itemImage.style.display = "block";

                const itemName = document.createElement("div");
                itemName.className = "item-name";
                itemName.textContent = selectedItemData.name; // Affiche le nom de l'item
                itemName.style.display = "block";

                const itemPrice = document.createElement("div"); // Nouveau div pour le prix
                itemPrice.className = "item-price";
                itemPrice.textContent = `Prix: ${selectedItemData.gold_total} pièces d'or`; // Affiche le prix
                itemPrice.style.display = "block";

                itemContainer.appendChild(itemImage);
                itemContainer.appendChild(itemName);
                itemContainer.appendChild(itemPrice); // Ajoute le prix au conteneur

                itemImagesContainer.appendChild(itemContainer);

                console.log(`Item correspondant trouvé : ${selectedItemData.name}`);
            }
        } else {
            console.log("Aucun item trouvé avec la couleur générée.");
        }
    });
});
