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

    // Charger les items depuis le serveur
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
                colors: item.color || [],
                stats: {
                    price: item.gold_total
                }
            }));
            console.log('Items chargés:', items.length);
        })
        .catch(error => {
            console.error('Erreur:', error);
            itemsContainer.innerHTML = '<div class="error-message">Erreur lors du chargement des items</div>';
        });

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
                        // Rouge doit être très dominant
                        return r > 200 && r > g * 2 && r > b * 2 && g < 130 && b < 130;
                    
                    case 'blue':
                        // Bleu doit être très dominant
                        return b > 180 && b > r * 1.8 && b > g * 1.8 && r < 130 && g < 130;
                    
                    case 'green':
                        // Vert doit être très dominant
                        return g > 180 && g > r * 1.8 && g > b * 1.8 && r < 130 && b < 130;
                    
                    case 'yellow':
                        // Rouge et Vert élevés et proches, Bleu très bas
                        return r > 180 && g > 160 && 
                               Math.abs(r - g) < 50 && // Rouge et Vert doivent être proches
                               b < 100 && // Bleu doit être bas
                               (r + g) > b * 4; // Rouge + Vert doivent être beaucoup plus élevés que Bleu
                    
                    case 'orange':
                        // Rouge très élevé, Vert moyen-haut, Bleu très bas
                        return r > 220 && 
                               g > 120 && g < 200 && 
                               b < 80 && 
                               r > g * 1.4;
                    
                    case 'purple':
                        // Rouge et Bleu élevés et proches, Vert bas
                        return r > 150 && b > 150 && 
                               Math.abs(r - b) < 40 && // Rouge et Bleu doivent être proches
                               g < Math.min(r, b) * 0.7; // Vert doit être significativement plus bas
                    
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

    .no-items {
        text-align: center;
        color: var(--lol-light);
        font-size: 1.2rem;
        padding: 2rem;
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style);
