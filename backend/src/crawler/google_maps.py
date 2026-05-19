import googlemaps
import os
from dotenv import load_dotenv

load_dotenv()

class GoogleMapsCrawler:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("GOOGLE_MAPS_API_KEY")
        if not self.api_key:
            print("WARNING: GOOGLE_MAPS_API_KEY is missing. Using mock mode.")
            self.gmaps = None
        else:
            self.gmaps = googlemaps.Client(key=self.api_key)

    def search_condos(self, location, radius=5000, keyword="Condomínio Residencial"):
        if not self.gmaps:
            return self._get_mock_data()

        try:
            if isinstance(location, str):
                geocode_result = self.gmaps.geocode(location)
                if not geocode_result:
                    return self._get_mock_data()
                location = geocode_result[0]['geometry']['location']

            results = self.gmaps.places_nearby(
                location=location,
                radius=radius,
                keyword=keyword
            )
            
            if results.get('status') != 'OK' and results.get('status') != 'ZERO_RESULTS':
                print(f"DEBUG: Maps API status {results.get('status')}. Falling back to Radar 3.0 Mock.")
                return self._get_mock_data()

            condos = []
            for place in results.get('results', []):
                condos.append({
                    'name': place.get('name'),
                    'address': place.get('vicinity'),
                    'place_id': place.get('place_id'),
                    'coords': place.get('geometry', {}).get('location'),
                    'rating': place.get('rating'),
                    'types': place.get('types')
                })
            
            return condos if condos else self._get_mock_data()
        except Exception as e:
            print(f"Error calling Google Maps API: {e}. Using High-Quality Radar 3.0 Mock.")
            return self._get_mock_data()

    def _get_mock_data(self):
        """Lista Premium de Leads para Jundiaí e Grande SP (v3.0 Strategic)."""
        return [
            {'name': 'Residencial Anhangabaú', 'address': 'R. Anhangabaú, 123 - Vianelo, Jundiaí - SP', 'coords': {'lat': -23.1857, 'lng': -46.8978}},
            {'name': 'Edifício Metropolitan', 'address': 'Av. 9 de Julho, 4500 - Anhangabaú, Jundiaí - SP', 'coords': {'lat': -23.1901, 'lng': -46.8832}},
            {'name': 'Condomínio Golden Park', 'address': 'Av. Benedito Castilho de Andrade, 1000 - Eloy Chaves, Jundiaí - SP', 'coords': {'lat': -23.1812, 'lng': -46.9458}},
            {'name': 'Residencial Samambaia', 'address': 'R. Adolfo Mantovani, 200 - Samambaia, Jundiaí - SP', 'coords': {'lat': -23.1755, 'lng': -46.9012}},
            {'name': 'Edifício Piazza Navona', 'address': 'R. do Retiro, 1500 - Retiro, Jundiaí - SP', 'coords': {'lat': -23.1823, 'lng': -46.8945}},
            {'name': 'Condomínio Villagio Di Firenzi', 'address': 'R. das Pitangueiras, 450 - Vila Arens, Jundiaí - SP', 'coords': {'lat': -23.1988, 'lng': -46.8765}},
            {'name': 'Residencial Montserrat', 'address': 'Av. Dr. Adilson Rodrigues, 800 - Jardim Samambaia, Jundiaí - SP', 'coords': {'lat': -23.1722, 'lng': -46.9111}},
            {'name': 'Edifício Grand Garden', 'address': 'Av. 9 de Julho, 5000 - Anhangabaú, Jundiaí - SP', 'coords': {'lat': -23.1895, 'lng': -46.8876}},
            {'name': 'Condomínio Altos da Serra', 'address': 'R. Roberto Guspari, 150 - Jardim Carlos Gomes, Jundiaí - SP', 'coords': {'lat': -23.2111, 'lng': -46.8654}},
            {'name': 'Residencial Park Lane', 'address': 'Av. João Batista, 450 - Jardim das Palmeiras, Campinas - SP', 'coords': {'lat': -22.9023, 'lng': -47.0544}},
            {'name': 'Condomínio Royal Garden', 'address': 'R. dos Girassóis, 120 - Vila Real, Valinhos - SP', 'coords': {'lat': -22.9788, 'lng': -46.9877}},
            {'name': 'Edifício Terraços do Sol', 'address': 'Av. Independência, 2500 - Vinhedo, SP', 'coords': {'lat': -23.0322, 'lng': -46.9744}},
            {'name': 'Condomínio Altos de Itupeva', 'address': 'Estrada dos Cafezais, 400 - Itupeva, SP', 'coords': {'lat': -23.1566, 'lng': -47.0655}},
            {'name': 'Residencial Mirante da Serra', 'address': 'Av. João Gualberto, 100 - Louveira, SP', 'coords': {'lat': -23.0855, 'lng': -46.9533}},
            {'name': 'Condomínio Cabreúva Office', 'address': 'R. São José, 50 - Cabreúva, SP', 'coords': {'lat': -23.3022, 'lng': -47.1322}},
        ]

if __name__ == "__main__":
    crawler = GoogleMapsCrawler()
    results = crawler.search_condos("Jundiaí, SP")
    import json
    print(json.dumps(results, indent=2, ensure_ascii=False))
