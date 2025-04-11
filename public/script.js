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
                        // Rouge doit être très dominant mais avec une tolérance plus faible
                        return r > 180 && r > g * 1.8 && r > b * 1.8 && g < 120 && b < 120;
                    
                    case 'blue':
                        // Amélioration de la détection du bleu
                        return (b > 140 && b > r * 1.3 && b > g * 1.3) || 
                               (b > 100 && b > Math.max(r, g) * 1.2 && r < 120 && g < 120) ||
                               (b > 130 && r < 100 && g < 100); // Pour les bleus plus sombres
                    
                    case 'green':
                        // Vert avec meilleure tolérance
                        return g > 140 && g > r * 1.3 && g > b * 1.3 && r < 130 && b < 130;
                    
                    case 'yellow':
                        // Meilleure détection du jaune avec plus de tolérance
                        return r > 160 && g > 140 && 
                               Math.abs(r - g) < 60 && // Plus de tolérance entre Rouge et Vert
                               b < 120 && // Tolérance plus élevée pour le Bleu
                               (r + g) > b * 3.5; // Ratio moins strict
                    
                    case 'orange':
                        // Orange avec meilleure distinction du rouge
                        return r > 200 && 
                               g >= 100 && g <= 180 && 
                               b < 100 && 
                               r > g * 1.2 && r < g * 2;
                    
                    case 'purple':
                        // Violet avec meilleure détection
                        return r > 130 && b > 130 && 
                               Math.abs(r - b) < 50 && // Plus de tolérance
                               g < Math.min(r, b) * 0.8 && // Un peu plus de tolérance pour le vert
                               g < 120; // Limite absolue pour le vert
                    
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
