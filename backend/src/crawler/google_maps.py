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
        """
        Busca condomínios em um determinado raio de uma localização.
        location: string (ex: "Jundiaí, SP") ou dict (lat/lng)
        """
        if not self.gmaps:
            return self._get_mock_data()

        try:
            # Primeiro geocodificar a localização se for string
            if isinstance(location, str):
                geocode_result = self.gmaps.geocode(location)
                if not geocode_result:
                    return []
                location = geocode_result[0]['geometry']['location']

            # Busca por lugares próximos
            results = self.gmaps.places_nearby(
                location=location,
                radius=radius,
                keyword=keyword
            )

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
            
            return condos
        except Exception as e:
            print(f"Error calling Google Maps API: {e}")
            return []

    def _get_mock_data(self):
        """Dados fake para teste inicial."""
        return [
            {
                'name': 'Condomínio Edifício Solaris',
                'address': 'Rua do Retiro, 1234 - Jundiaí, SP',
                'place_id': 'mock_1',
                'coords': {'lat': -23.1857, 'lng': -46.8978},
                'types': ['establishment', 'point_of_interest']
            },
            {
                'name': 'Condomínio Residencial Jundiaí I',
                'address': 'Av. Jundiaí, 500 - Jundiaí, SP',
                'place_id': 'mock_2',
                'coords': {'lat': -23.1901, 'lng': -46.8832},
                'types': ['establishment', 'point_of_interest']
            }
        ]

if __name__ == "__main__":
    crawler = GoogleMapsCrawler()
    results = crawler.search_condos("Jundiaí, SP")
    import json
    print(json.dumps(results, indent=2, ensure_ascii=False))
