import requests
from bs4 import BeautifulSoup

# Récupérer le contenu de la page
url = "https://lolshop.gg/"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Trouver la section des légendaires
legendary_section = soup.find('h2', text='legendaries').find_next('div')

# Extraire les articles de cette section
items = legendary_section.find_all('div', class_='Grid_gridItem__781Hl')
item_data = {}
for item in items:
    name = item.get('data-item-name')
    img = item.find('img')
    img_src = img['src'] if img else 'Image non disponible'
    item_data[name] = img_src

# Afficher les données extraites
for name, img_src in item_data.items():
    print(f'"{name}": "{img_src}",')