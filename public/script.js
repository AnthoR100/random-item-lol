document.addEventListener('DOMContentLoaded', () => {
    const colorBox = document.getElementById('colorBox');
    const generateButton = document.querySelector('.generate-button');
    const findButton = document.querySelector('.find-button');
    const itemsContainer = document.getElementById('itemsContainer');
    const modal = document.getElementById('itemModal');
    const closeModal = document.querySelector('.close');
    
    let items = [];
    let currentColor = null;

    // Couleurs disponibles
    const colors = {
        red: '#ff0000',
        blue: '#0000ff',
        green: '#00ff00',
        yellow: '#FCDC12',
        orange: '#ff8000',
        purple: '#ff00ff'
    };

    // URL de l'API
    const API_URL = '/data/items.json';
    let isLoading = false;

    // Fonction pour charger les items
    function loadItems() {
        if (isLoading) return;
        isLoading = true;
        itemsContainer.innerHTML = '<div class="loading-message">Chargement des items...</div>';

        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }
                return response.json();
            })
            .then(data => {
                // Transformer les données en tableau
                items = Object.entries(data).map(([id, item]) => ({
                    id,
                    name: item.name,
                    image: item.image,
                    description: item.description || '',
                    colors: item.colors || item.color || [], // Support pour les deux formats
                    stats: {
                        price: item.gold_total
                    }
                }));
                console.log('Items chargés:', items.length);
                itemsContainer.innerHTML = ''; // Nettoyer le message de chargement
            })
            .catch(error => {
                console.error('Erreur:', error);
                itemsContainer.innerHTML = '<div class="error-message">Erreur lors du chargement des items. Veuillez rafraîchir la page.</div>';
            })
            .finally(() => {
                isLoading = false;
            });
    }

    // Charger les items au démarrage
    loadItems();

    // Générer une couleur aléatoire
    generateButton.addEventListener('click', () => {
        const colorKeys = Object.keys(colors);
        const randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        currentColor = randomColor;
        colorBox.style.backgroundColor = colors[randomColor];
        findButton.style.display = 'block';

        // Animation de la boîte de couleur
        colorBox.style.transform = 'scale(1.05)';
        setTimeout(() => {
            colorBox.style.transform = 'scale(1)';
        }, 200);

        console.log('Couleur générée:', randomColor);
    });

    // Trouver des items correspondant à la couleur
    findButton.addEventListener('click', () => {
        if (!currentColor) return;

        console.log('Recherche d\'items pour la couleur:', currentColor);
        console.log('Nombre total d\'items:', items.length);

        const matchingItems = filterItemsByColor(items, currentColor);
        console.log('Items correspondants trouvés:', matchingItems.length);
        
        // Supprimer les doublons basés sur le nom de l'item
        const uniqueItems = Array.from(new Map(matchingItems.map(item => [item.name, item])).values());
        
        // Mélanger et prendre 6 items au hasard
        const shuffledItems = uniqueItems.sort(() => 0.5 - Math.random());
        const selectedItems = shuffledItems.slice(0, 6);
        
        displayItems(selectedItems);

        // Animation des items
        const cards = document.querySelectorAll('.item-card');
        cards.forEach((card, index) => {
            card.style.animation = `fadeIn 0.3s ease forwards ${index * 0.1}s`;
        });
    });

    // Fermer le modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Fonction pour afficher les items
    function displayItems(itemsToDisplay) {
        itemsContainer.innerHTML = '';
        
        if (itemsToDisplay.length === 0) {
            itemsContainer.innerHTML = '<div class="no-items">Aucun item trouvé pour cette couleur</div>';
            return;
        }
        
        itemsToDisplay.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <div class="item-price">${item.stats.price} pièces d'or</div>
            `;

            card.addEventListener('click', () => showItemDetails(item));
            itemsContainer.appendChild(card);
        });
    }

    // Fonction pour filtrer les items par couleur
    function filterItemsByColor(items, color) {
        const colorHex = colors[color];
        console.log('Couleur recherchée:', color, 'Hex:', colorHex);
        return items.filter(item => {
            console.log('Item vérifié:', item.name, 'Couleurs:', item.colors);
            if (!item.colors || item.colors.length === 0) return false;
            
            return item.colors.some(itemColor => {
                const hex = itemColor.toLowerCase();
                // Convertir la couleur hex en RGB
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);

                switch(color) {
                    case 'red':
                        // Rouge doit être TRÈS dominant avec des conditions plus strictes
                        return r > 200 && r > g * 2.2 && r > b * 2.2 && 
                               g < 100 && b < 100 && 
                               Math.max(g, b) < r * 0.4; // Ajout d'une condition supplémentaire
                    
                    case 'blue':
                        // Amélioration de la détection du bleu avec plus de cas
                        return (b > 130 && b > r * 1.2 && b > g * 1.2) || // Cas général
                               (b > 100 && b > Math.max(r, g) * 1.1 && r < 130 && g < 130) || // Bleus moyens
                               (b > 80 && g < 80 && r < 80) || // Bleus sombres
                               (b > 130 && (r + g) < b * 2); // Bleus dominants
                    
                    case 'green':
                        // Vert avec détection améliorée
                        return (g > 130 && g > r * 1.2 && g > b * 1.2) || // Cas général
                               (g > 100 && g > Math.max(r, b) * 1.1 && r < 130 && b < 130) || // Verts moyens
                               (g > 80 && r < 80 && b < 80); // Verts sombres
                    
                    case 'yellow':
                        // Meilleure détection du jaune
                        return r > 160 && g > 140 && 
                               Math.abs(r - g) < 70 && // Plus de tolérance entre Rouge et Vert
                               b < 130 && // Tolérance plus élevée pour le Bleu
                               (r + g) > b * 3; // Ratio moins strict
                    
                    case 'orange':
                        // Orange avec conditions plus souples
                        return r > 160 && // Rouge moins dominant
                               g >= 80 && g <= 180 && // Plus de tolérance pour le vert
                               b < 120 && // Plus de tolérance pour le bleu
                               r > g * 1.1 && // Ratio rouge/vert plus souple
                               g > b * 1.2; // Le vert doit être plus élevé que le bleu
                    
                    case 'purple':
                        // Violet avec conditions plus souples
                        return (
                            // Cas 1 : Violet classique
                            (r > 100 && b > 100 && // Seuils plus bas
                            Math.abs(r - b) < 80 && // Plus de tolérance entre rouge et bleu
                            g < Math.min(r, b) * 0.95 && // Beaucoup plus de tolérance pour le vert
                            g < 130) || // Limite plus haute pour le vert
                            // Cas 2 : Violet foncé
                            (r > 80 && b > 80 && 
                            Math.abs(r - b) < 50 && 
                            g < 80) ||
                            // Cas 3 : Violet clair
                            (r > 150 && b > 150 && 
                            Math.abs(r - b) < 100 && 
                            g < 150)
                        );
                    
                    default:
                        return hex === colorHex;
                }
            });
        });
    }

    // Fonction pour afficher les détails d'un item
    function showItemDetails(item) {
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const itemStats = document.querySelector('.item-stats');

        modalImage.src = item.image;
        modalTitle.textContent = item.name;
        modalDescription.textContent = item.description || 'Description non disponible';
        
        itemStats.innerHTML = `
            <div class="stat">
                <span class="stat-label">Prix:</span>
                <span class="stat-value">${item.stats.price} pièces d'or</span>
            </div>
            <div class="stat">
                <span class="stat-label">Couleurs:</span>
                <span class="stat-value">${item.colors ? item.colors.join(', ') : 'Non spécifié'}</span>
            </div>
        `;

        modal.style.display = 'block';
    }
});

// Styles pour l'animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .item-card {
        opacity: 0;
    }

    .color-box {
        transition: transform 0.2s ease;
    }

    .loading-message, .error-message {
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        grid-column: 1 / -1;
    }

    .loading-message {
        color: var(--lol-light);
    }

    .error-message {
        color: #ff4444;
        background-color: rgba(255, 68, 68, 0.1);
        border-radius: 8px;
    }

    .no-items {
        text-align: center;
        color: var(--lol-light);
        font-size: 1.2rem;
        padding: 2rem;
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style);
