import re
import codecs

replacements = [
    (r'\{"emoji": "[^"]+", "name": "Tulsi \+ Ginger Tea"', '{"emoji": "🌿", "name": "Tulsi + Ginger Tea"'),
    (r'\{"emoji": "[^"]+", "name": "Lemon Honey Water"', '{"emoji": "🍋", "name": "Lemon Honey Water"'),
    (r'\{"emoji": "[^"]+", "name": "Cold Compress"', '{"emoji": "🧊", "name": "Cold Compress"'),
    (r'\{"emoji": "[^"]+", "name": "Rice Water \(Kanji\)"', '{"emoji": "🌾", "name": "Rice Water (Kanji)"'),
    (r'\{"emoji": "[^"]+", "name": "Steam Inhalation"', '{"emoji": "♨️", "name": "Steam Inhalation"'),
    (r'\{"emoji": "[^"]+", "name": "Garlic Milk"', '{"emoji": "🧄", "name": "Garlic Milk"'),
    (r'\{"emoji": "[^"]+", "name": "Honey \+ Pepper"', '{"emoji": "🍯", "name": "Honey + Pepper"'),
    (r'\{"emoji": "[^"]+", "name": "Tulsi Kadha"', '{"emoji": "🌿", "name": "Tulsi Kadha"'),
    (r'\{"emoji": "[^"]+", "name": "Honey \+ Ginger Juice"', '{"emoji": "🍯", "name": "Honey + Ginger Juice"'),
    (r'\{"emoji": "[^"]+", "name": "Onion \+ Honey Syrup"', '{"emoji": "🧅", "name": "Onion + Honey Syrup"'),
    (r'\{"emoji": "[^"]+", "name": "Turmeric Milk \(Haldi Doodh\)"', '{"emoji": "🥛", "name": "Turmeric Milk (Haldi Doodh)"'),
    (r'\{"emoji": "[^"]+", "name": "Salt Water Gargle"', '{"emoji": "🍋", "name": "Salt Water Gargle"'),
    (r'\{"emoji": "[^"]+", "name": "Banana & Curd"', '{"emoji": "🍌", "name": "Banana & Curd"'),
    (r'\{"emoji": "[^"]+", "name": "Clove Tea"', '{"emoji": "☕", "name": "Clove Tea"'),
    (r'\{"emoji": "[^"]+", "name": "ORS Fluids"', '{"emoji": "🧃", "name": "ORS Fluids"'),
    (r'\{"emoji": "[^"]+", "name": "Triphala Water"', '{"emoji": "🌿", "name": "Triphala Water"'),
    (r'\{"emoji": "[^"]+", "name": "Neem Leaves"', '{"emoji": "🌿", "name": "Neem Leaves"'),
    (r'\{"emoji": "[^"]+", "name": "Lemon \+ Salt"', '{"emoji": "🍋", "name": "Lemon + Salt"'),
    (r'\{"emoji": "[^"]+", "name": "Ginger \+ Raisins Tea"', '{"emoji": "☕", "name": "Ginger + Raisins Tea"'),
    (r'\{"emoji": "[^"]+", "name": "Garlic Paste"', '{"emoji": "🧄", "name": "Garlic Paste"'),
    (r'\{"emoji": "[^"]+", "name": "Bitter Gourd Juice \(Karela\)"', '{"emoji": "🌿", "name": "Bitter Gourd Juice (Karela)"'),
    (r'\{"emoji": "[^"]+", "name": "Fenugreek Seeds \(Methi\)"', '{"emoji": "🌾", "name": "Fenugreek Seeds (Methi)"'),
    (r'\{"emoji": "[^"]+", "name": "Jamun Seed Powder"', '{"emoji": "🌿", "name": "Jamun Seed Powder"'),
    (r'\{"emoji": "[^"]+", "name": "Cinnamon Tea"', '{"emoji": "☕", "name": "Cinnamon Tea"'),
    (r'\{"emoji": "[^"]+", "name": "Garlic \(Raw\)"', '{"emoji": "🧄", "name": "Garlic (Raw)"'),
    (r'\{"emoji": "[^"]+", "name": "Banana \(Potassium\)"', '{"emoji": "🍌", "name": "Banana (Potassium)"'),
    (r'\{"emoji": "[^"]+", "name": "Hibiscus Tea \(Gudhal\)"', '{"emoji": "🌺", "name": "Hibiscus Tea (Gudhal)"'),
    (r'\{"emoji": "[^"]+", "name": "Celery Seed Water"', '{"emoji": "🌿", "name": "Celery Seed Water"'),
    (r'\{"emoji": "[^"]+", "name": "Arjuna Bark Tea"', '{"emoji": "☕", "name": "Arjuna Bark Tea"'),
    (r'\{"emoji": "[^"]+", "name": "Garlic \+ Honey"', '{"emoji": "🧄", "name": "Garlic + Honey"'),
    (r'\{"emoji": "[^"]+", "name": "Flax Seeds \(Alsi\)"', '{"emoji": "🌾", "name": "Flax Seeds (Alsi)"'),
    (r'\{"emoji": "[^"]+", "name": "Ashwagandha"', '{"emoji": "🌿", "name": "Ashwagandha"'),
    (r'\{"emoji": "[^"]+", "name": "Spinach \+ Lemon Juice"', '{"emoji": "🌿", "name": "Spinach + Lemon Juice"'),
    (r'\{"emoji": "[^"]+", "name": "Jaggery \+ Sesame Seeds"', '{"emoji": "🟫", "name": "Jaggery + Sesame Seeds"'),
    (r'\{"emoji": "[^"]+", "name": "Pomegranate Juice"', '{"emoji": "🍎", "name": "Pomegranate Juice"'),
    (r'\{"emoji": "[^"]+", "name": "Amla \(Indian Gooseberry\)"', '{"emoji": "🌿", "name": "Amla (Indian Gooseberry)"'),
    (r'\{"emoji": "[^"]+", "name": "Honey \+ Coffee"', '{"emoji": "☕", "name": "Honey + Coffee"'),
    (r'\{"emoji": "[^"]+", "name": "Turmeric \+ Milk"', '{"emoji": "🥛", "name": "Turmeric + Milk"'),
    (r'\{"emoji": "[^"]+", "name": "Garlic Boiled in Milk"', '{"emoji": "🧄", "name": "Garlic Boiled in Milk"'),
    (r'\{"emoji": "[^"]+", "name": "Ginger \+ Fenugreek Kadha"', '{"emoji": "🌿", "name": "Ginger + Fenugreek Kadha"'),
    (r'\{"emoji": "[^"]+", "name": "Cranberry Juice"', '{"emoji": "🍒", "name": "Cranberry Juice"'),
    (r'\{"emoji": "[^"]+", "name": "Drink More Water"', '{"emoji": "💧", "name": "Drink More Water"'),
    (r'\{"emoji": "[^"]+", "name": "Coriander Seeds Water"', '{"emoji": "🌿", "name": "Coriander Seeds Water"'),
    (r'\{"emoji": "[^"]+", "name": "Uva Ursi Tea"', '{"emoji": "☕", "name": "Uva Ursi Tea"'),
    (r'\{"emoji": "[^"]+", "name": "Banana \+ Coconut Water"', '{"emoji": "🍌", "name": "Banana + Coconut Water"'),
    (r'\{"emoji": "[^"]+", "name": "Drumstick Leaves \(Moringa\)"', '{"emoji": "🌿", "name": "Drumstick Leaves (Moringa)"'),
    (r'\{"emoji": "[^"]+", "name": "IMPORTANT"', '{"emoji": "⚠️", "name": "IMPORTANT"'),
    (r'\{"emoji": "[^"]+", "name": "Papaya Leaf Juice"', '{"emoji": "🌿", "name": "Papaya Leaf Juice"'),
    (r'\{"emoji": "[^"]+", "name": "Giloy \(Guduchi\) Juice"', '{"emoji": "🌿", "name": "Giloy (Guduchi) Juice"'),
    (r'\{"emoji": "[^"]+", "name": "Coconut Water"', '{"emoji": "🥥", "name": "Coconut Water"'),
    (r'\{"emoji": "[^"]+", "name": "Neem Leaf Extract"', '{"emoji": "🌿", "name": "Neem Leaf Extract"'),
    (r'\{"emoji": "[^"]+", "name": "BRAT Diet"', '{"emoji": "🍌", "name": "BRAT Diet"'),
    (r'\{"emoji": "[^"]+", "name": "Homemade ORS"', '{"emoji": "🌾", "name": "Homemade ORS"'),
    (r'\{"emoji": "[^"]+", "name": "Ginger Tea"', '{"emoji": "☕", "name": "Ginger Tea"'),
    (r'\{"emoji": "[^"]+", "name": "Fenugreek Seeds"', '{"emoji": "🌿", "name": "Fenugreek Seeds"'),
    (r'\{"emoji": "[^"]+", "name": "Cold Milk"', '{"emoji": "🥛", "name": "Cold Milk"'),
    (r'\{"emoji": "[^"]+", "name": "Banana"', '{"emoji": "🍌", "name": "Banana"'),
    (r'\{"emoji": "[^"]+", "name": "Fennel Seeds \(Saunf\)"', '{"emoji": "🌼", "name": "Fennel Seeds (Saunf)"'),
    (r'\{"emoji": "[^"]+", "name": "Peppermint Oil"', '{"emoji": "🌿", "name": "Peppermint Oil"'),
    (r'\{"emoji": "[^"]+", "name": "Cold/Hot Compress"', '{"emoji": "🧊", "name": "Cold/Hot Compress"'),
    (r'\{"emoji": "[^"]+", "name": "Hydration"', '{"emoji": "💧", "name": "Hydration"'),
    (r'\{"emoji": "[^"]+", "name": "Sesame Oil Massage"', '{"emoji": "🧴", "name": "Sesame Oil Massage"'),
    (r'\{"emoji": "[^"]+", "name": "Coconut Oil"', '{"emoji": "🥥", "name": "Coconut Oil"'),
    (r'\{"emoji": "[^"]+", "name": "Neem Leaves Paste"', '{"emoji": "🌿", "name": "Neem Leaves Paste"'),
    (r'\{"emoji": "[^"]+", "name": "Tea Tree Oil"', '{"emoji": "🍵", "name": "Tea Tree Oil"'),
    (r'\{"emoji": "[^"]+", "name": "Local Honey"', '{"emoji": "🍯", "name": "Local Honey"'),
    (r'\{"emoji": "[^"]+", "name": "Nettle Leaf Tea"', '{"emoji": "🌿", "name": "Nettle Leaf Tea"'),
    (r'\{"emoji": "[^"]+", "name": "Saline Nasal Rinse"', '{"emoji": "🧴", "name": "Saline Nasal Rinse"'),
    (r'\{"emoji": "[^"]+", "name": "Turmeric \+ Ghee"', '{"emoji": "🌼", "name": "Turmeric + Ghee"'),
    (r'\{"emoji": "[^"]+", "name": "Turmeric \+ Ginger Tea"', '{"emoji": "☕", "name": "Turmeric + Ginger Tea"'),
    (r'\{"emoji": "[^"]+", "name": "Mustard Oil Massage"', '{"emoji": "🧴", "name": "Mustard Oil Massage"'),
    (r'\{"emoji": "[^"]+", "name": "Epsom Salt Soak"', '{"emoji": "🌿", "name": "Epsom Salt Soak"'),
    (r'\{"emoji": "[^"]+", "name": "Ashwagandha Milk"', '{"emoji": "🥛", "name": "Ashwagandha Milk"'),
    (r'\{"emoji": "[^"]+", "name": "Sunlight \(Best Source\)"', '{"emoji": "☀️", "name": "Sunlight (Best Source)"'),
    (r'\{"emoji": "[^"]+", "name": "Fatty Fish \/ Eggs"', '{"emoji": "🐟", "name": "Fatty Fish / Eggs"'),
    (r'\{"emoji": "[^"]+", "name": "Fortified Milk \+ Ghee"', '{"emoji": "🥛", "name": "Fortified Milk + Ghee"'),
    (r'\{"emoji": "[^"]+", "name": "Mushrooms \(UV Exposed\)"', '{"emoji": "🍄", "name": "Mushrooms (UV Exposed)"'),
    (r'\{"emoji": "[^"]+", "name": "RICE Method"', '{"emoji": "🦴", "name": "RICE Method"'),
    (r'\{"emoji": "[^"]+", "name": "Milk \+ Turmeric \(Haldi Doodh\)"', '{"emoji": "🥛", "name": "Milk + Turmeric (Haldi Doodh)"'),
    (r'\{"emoji": "[^"]+", "name": "Comfrey Paste"', '{"emoji": "🌿", "name": "Comfrey Paste"'),
    (r'\{"emoji": "[^"]+", "name": "Sunlight \+ Calcium Diet"', '{"emoji": "☀️", "name": "Sunlight + Calcium Diet"'),
    (r'\{"emoji": "[^"]+", "name": "Clean with Saline"', '{"emoji": "🧼", "name": "Clean with Saline"'),
    (r'\{"emoji": "[^"]+", "name": "Honey Dressing"', '{"emoji": "🍯", "name": "Honey Dressing"'),
    (r'\{"emoji": "[^"]+", "name": "Neem \+ Turmeric Paste"', '{"emoji": "🌿", "name": "Neem + Turmeric Paste"'),
]

# We also need to fix common non-word corrupted characters.
char_replacements = [
    (r'Ã¢â€ â,¬', '─'),
    (r'- ', '-'),
    (r'-', '-'),
    (r'â€', '"'),
    (r'â€', '"'),
    (r'-', '-'),
    (r'-', '-'),
    (r'â€˜', "'"),
    (r'â€™', "'"),
    (r'â\x82\x80\x9d', '-'),
    (r'Ã¢Å¡Â\xa0Ã¯Â¸Â\x8f', '⚠️'),
]

def fix_file(filename):
    with codecs.open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Regex search and replace for json emoji properties
    for pattern, substitution in replacements:
        content = re.sub(pattern, substitution, content)

    # Some additional emoji and char fixes if re.sub left any generic ones
    for pattern, substitution in char_replacements:
         # Try regex if valid, else string replace
         try:
            content = re.sub(pattern, substitution, content)
         except:
             content = content.replace(pattern, substitution)
    
    # Fix broken em-dashes that are scattered
    content = re.sub(r'[^a-zA-Z0-9\s"\'.,!?:;(){}\[\]\\/#_=%<>\-+*&^$@|~`]', lambda m: '-' if m.group() in '-' else m.group(), content)
    
    # Last sweep to force everything to valid ascii where possible or keep target emojis
    
    # Let's save output to app_utf8_clean.py
    with codecs.open('app_utf8_clean.py', 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('app_utf8.py')
print("Successfully processed app_utf8.py!")
