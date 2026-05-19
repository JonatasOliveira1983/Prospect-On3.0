import requests
import random
import googlemaps
import os
from dotenv import load_dotenv

load_dotenv()

class MarketScraper:
    def __init__(self):
        self.maps_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if self.maps_key:
            self.gmaps = googlemaps.Client(key=self.maps_key)
        else:
            self.gmaps = None
            
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.98 Safari/537.36"
        ]

    def search_condos_by_city(self, city="Jundiaí", state="SP"):
        """
        Busca condomínios reais usando Google Places API.
        Retorna lista de dicionários formatados para o Radar.
        """
        if not self.gmaps:
            print("Erro: GOOGLE_MAPS_API_KEY não configurada.")
            return []

        query = f"condomínio em {city}, {state}"
        try:
            # Busca textual por condomínios
            places_result = self.gmaps.places(query=query)
            
            leads = []
            for place in places_result.get('results', []):
                lead = {
                    "name": place.get('name'),
                    "address": place.get('formatted_address'),
                    "place_id": place.get('place_id'),
                    "coords": place.get('geometry', {}).get('location'),
                    "types": place.get('types', []),
                    "rating": place.get('rating', 0),
                    "user_ratings_total": place.get('user_ratings_total', 0)
                }
                leads.append(lead)
            
            return leads
        except Exception as e:
            print(f"Erro na busca Google Places: {e}")
            return []

    def get_avg_m2_price(self, neighborhood, city="Jundiaí"):
        """
        Busca o valor médio do m² no bairro.
        Mantido para cálculos de valuation.
        """
        jundiai_data = {
            "Centro": 5500,
            "Jardim Samambaia": 8500,
            "Anhangabaú": 7200,
            "Eloy Chaves": 6800,
            "Vila Arens": 6200,
            "Retiro": 7000,
            "Jardim do Lago": 5800
        }
        
        # Extrair nome simples do bairro se vier completo
        clean_neighborhood = neighborhood.split(',')[0] if ',' in neighborhood else neighborhood
        price = jundiai_data.get(clean_neighborhood, 6500) 
        price += random.randint(-200, 200)
        
        return price

    def get_unit_details(self, condo_name):
        """
        Busca detalhes das unidades. 
        No futuro: Integração com APIs imobiliárias.
        """
        return {
            "avg_m2": random.choice([65, 80, 110, 150]),
            "total_units": random.choice([40, 60, 120, 240]),
            "towers": random.choice([1, 2, 4])
        }

if __name__ == "__main__":
    scraper = MarketScraper()
    print("Buscando condomínios reais em Jundiaí...")
    results = scraper.search_condos_by_city("Jundiaí")
    for r in results[:3]:
        print(f"- {r['name']} em {r['address']} (Coords: {r['coords']})")
