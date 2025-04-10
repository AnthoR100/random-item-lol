import json
import os
import requests

# URL du fichier JSON contenant les données des items
url = "https://ddragon.leagueoflegends.com/cdn/15.7.1/data/fr_FR/item.json"
response = requests.get(url, timeout=30)

# Vérifier si la requête a réussi
if response.status_code == 200:
    # Charger les données JSON
    data = response.json()

    # Extraire les items
    items = data.get('data', {})
    
    # Dictionnaire pour stocker les items qui respectent les conditions
    filtered_items = {}

    for item_id, item_info in items.items():
        name = item_info.get('name')
        gold_total = item_info.get('gold', {}).get('total', 0)
        maps = item_info.get('maps', {})

        # Ajouter l'item uniquement si le coût total en or est supérieur à 2000 ET que la map 11 est disponible
        if gold_total > 2000 and maps.get("11", False):
            # Générer l'URL de l'image de l'item
            image_url = f"https://ddragon.leagueoflegends.com/cdn/15.7.1/img/item/{item_id}.png"
            
            # Ajouter l'item au dictionnaire avec le nom, le coût total en or et l'image
            filtered_items[item_id] = {
                'name': name,
                'gold_total': gold_total,
                'image': image_url
            }

    # Créer le dossier data s'il n'existe pas
    os.makedirs('data', exist_ok=True)

    # Enregistrer les données filtrées dans un fichier JSON
    with open('data/items.json', 'w', encoding='utf-8') as json_file:
        json.dump(filtered_items, json_file, ensure_ascii=False, indent=4)

    print(f"{len(filtered_items)} items ont été enregistrés dans 'data/items.json'.")
else:
    print(f"Erreur lors de la récupération des données. Statut de la requête: {response.status_code}")