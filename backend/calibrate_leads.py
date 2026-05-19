import sys
import os
sys.path.append(os.getcwd())
from src.utils.database import Database
import sqlite3

def calibrate():
    db = Database()
    print("🧹 Limpando leads antigos...")
    with db._get_connection() as conn:
        conn.execute("DELETE FROM leads")
        conn.commit()

    leads_reais = [
        {
            "id": "residencial_golden_park",
            "name": "Jardim Residencial Golden Park",
            "address": "Rua Jenny Simões Rouco, Eloy Chaves, Jundiaí - SP",
            "coords": {"lat": -23.186580, "lng": -46.993184}, # Calçada/Portão
            "score": 9.2,
            "category": "Alto Padrão",
            "justification": "Condomínio de casas de alto luxo. Localizado em área de grande valorização.",
            "is_confirmed": True
        },
        {
            "id": "edificio_solaris",
            "name": "Condomínio Edifício Solaris",
            "address": "Rua Hilda de Oliveira Cruz, 100, Anhangabaú, Jundiaí - SP",
            "coords": {"lat": -23.186250, "lng": -46.892042}, # Rua (vista frontal)
            "score": 8.8,
            "category": "Vertical Premium",
            "justification": "Edifício vertical de alto padrão. Fachada com sinais de necessidade de limpeza técnica.",
            "is_confirmed": True
        },
        {
            "id": "residencial_anhangabau",
            "name": "Residencial Anhangabaú",
            "address": "Rua Eduardo Tomanik, 900, Chácara Urbana, Jundiaí - SP",
            "coords": {"lat": -23.184200, "lng": -46.883500}, # Rua 
            "score": 8.5,
            "category": "Vertical Médio",
            "justification": "Condomínio tradicional. Localização estratégica em Jundiaí.",
            "is_confirmed": True
        }
    ]

    print("🧹 Faxina de imagens antigas (Outdoor Cleanup)...")
    images_path = "data/images"
    if os.path.exists(images_path):
        for f in os.listdir(images_path):
            if f.endswith(".jpg"):
                os.remove(os.path.join(images_path, f))
    
    print("🚀 Inserindo leads reais calibrados v6.3...")
    for lead in leads_reais:
        db.upsert_lead(lead)
        print(f"✅ Lead {lead['name']} calibrado com sucesso.")

if __name__ == "__main__":
    calibrate()
