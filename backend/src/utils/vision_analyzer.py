import os
from dotenv import load_dotenv
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.utils.places_client import PlacesClient
import math

load_dotenv()

class VisionAnalyzer:
    """
    Analisador visual que usa Google Places API para fotos reais de fachadas.
    Também fornece fallback com imagens mock do Unsplash quando a Places API não tem fotos.
    """
    def __init__(self):
        self.maps_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.monitor = UsageMonitor()
        self.places = PlacesClient()

    def _get_mock_image(self, target_path):
        """Fornece uma imagem de fachada de alta qualidade para modo de teste/mock."""
        if os.path.exists(target_path):
            return target_path
        
        # Baixa imagem genérica de condomínio de alta qualidade do Unsplash
        mock_url = "https://images.unsplash.com/photo-1545324418-f1d3ac5919ad?w=1024&q=80"
        try:
            import requests
            resp = requests.get(mock_url, stream=True, timeout=10)
            if resp.status_code == 200:
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                with open(target_path, 'wb') as f:
                    for chunk in resp:
                        f.write(chunk)
                return target_path
        except:
            pass
        return None

    def get_facade_image_from_places(self, photo_reference: str, output_path: str) -> str:
        """
        Baixa foto REAL de fachada via Google Places API.
        Retorna caminho do arquivo ou None.
        """
        return self.places.save_place_photo(photo_reference, output_path)

    def get_street_view_image(self, lat, lng, output_path="data/images"):
        """
        Baixa imagem via Google Street View Static API.
        Usa a mesma API key do Places.
        """
        if not self.maps_key:
            logger.warning("GOOGLE_MAPS_API_KEY ausente. Street View indisponível.")
            return None
            
        if not os.path.exists(output_path):
            os.makedirs(output_path)
            
        filename = f"facade_{lat}_{lng}.jpg"
        filepath = os.path.join(output_path, filename)
        
        # Tenta Places Photos primeiro (mais confiável que Street View)
        # Se não temos photo_reference, tenta Street View
        url = "https://maps.googleapis.com/maps/api/streetview"
        params = {
            "size": "640x480",
            "location": f"{lat},{lng}",
            "key": self.maps_key,
            "radius": 100, 
            "fov": 80,
            "source": "outdoor"
        }
        
        try:
            import requests
            response = requests.get(url, params=params, stream=True, timeout=10)
            if response.status_code == 200 and "image" in response.headers.get("Content-Type", ""):
                with open(filepath, 'wb') as f:
                    for chunk in response:
                        f.write(chunk)
                logger.info(f"Street View salva: {filepath}")
                return filepath
            
            # Se falhar, tenta satélite
            logger.warning("Street View indisponível. Tentando satélite...")
            sat_path = self.get_satellite_image(lat, lng)
            if sat_path:
                return sat_path
            return self._get_mock_image(filepath)
        except Exception as e:
            logger.error(f"Erro ao baixar Street View: {e}")
            return self._get_mock_image(filepath)

    def get_satellite_image(self, lat, lng, output_path="data/images"):
        """Baixa vista aérea/satélite via Google Maps Static API."""
        if not self.maps_key:
            return None
        if not os.path.exists(output_path):
            os.makedirs(output_path)
        
        url = "https://maps.googleapis.com/maps/api/staticmap"
        params = {
            "center": f"{lat},{lng}",
            "zoom": 19,
            "size": "800x600",
            "maptype": "satellite",
            "key": self.maps_key
        }
        filename = f"satellite_{lat}_{lng}.jpg"
        filepath = os.path.join(output_path, filename)
        try:
            import requests
            response = requests.get(url, params=params, stream=True, timeout=10)
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    for chunk in response:
                        f.write(chunk)
                return filepath
        except Exception as e:
            logger.error(f"Erro ao baixar satélite: {e}")
        return None

    def get_location_map(self, lat, lng, output_path="data/images"):
        """Mapa de localização."""
        if not self.maps_key: return None
        url = "https://maps.googleapis.com/maps/api/staticmap"
        params = {
            "center": f"{lat},{lng}", "zoom": 16, "size": "800x400",
            "maptype": "hybrid", "markers": f"color:red|{lat},{lng}", "key": self.maps_key
        }
        filename = f"location_{lat}_{lng}.jpg"
        filepath = os.path.join(output_path, filename)
        try:
            import requests
            resp = requests.get(url, params=params, stream=True, timeout=10)
            if resp.status_code == 200:
                with open(filepath, 'wb') as f:
                    for chunk in resp: f.write(chunk)
                return filepath
        except: return None

    def analyze_facade(self, image_path):
        """
        Análise de fachada.
        DeepSeek é text-only, então sempre usamos fallback.
        """
        logger.info("VisionAnalyzer: Análise visual via IA indisponível (DeepSeek text-only). Usando fallback.")
        return self._get_mock_analysis()

    def _get_mock_analysis(self):
        """Dados de fallback seguros."""
        return {
            'desgaste': 'A Avaliar',
            'patologias': ['Vistoria pendente — recomenda-se avaliação presencial'],
            'urgencia': False,
            'comentario_tecnico': "Não foi possível realizar o diagnóstico automático via IA de visão. Recomenda-se vistoria presencial.",
            'proposito_estrategico': "A avaliação técnica presencial garantirá um orçamento preciso."
        }

if __name__ == "__main__":
    analyzer = VisionAnalyzer()
    print(analyzer.analyze_facade(None))
