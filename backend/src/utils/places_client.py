"""
Cliente Google Places API.
Fonte PRIMÁRIA de dados estruturados sobre condomínios.
Substitui a dependência exclusiva de scraping frágil do DOM do Google Maps.

Endpoints:
  - Text Search: busca lugares por query textual
  - Place Details: dados completos (telefone, website, coordenadas, fotos)
  - Place Photo: imagens reais das fachadas
"""
import os
import json
from typing import Optional, List, Dict
from src.utils.logger import logger
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class PlaceResult:
    """Resultado estruturado de um lugar do Google Places API."""
    def __init__(self, data: dict):
        self.place_id: str = data.get("place_id", "")
        self.name: str = data.get("name", "Condomínio")
        self.address: str = data.get("formatted_address", "N/D")
        self.lat: float = data.get("geometry", {}).get("location", {}).get("lat", 0)
        self.lng: float = data.get("geometry", {}).get("location", {}).get("lng", 0)
        self.rating: float = data.get("rating", 0)
        self.user_ratings_total: int = data.get("user_ratings_total", 0)
        self.phone: str = data.get("formatted_phone_number") or data.get("international_phone_number", "N/D")
        self.website: str = data.get("website", "N/D")
        self.photos: List[dict] = data.get("photos", [])
        self.types: List[str] = data.get("types", [])
        self.price_level: Optional[int] = data.get("price_level")
        self.business_status: str = data.get("business_status", "")

    def to_dict(self) -> dict:
        return {
            "place_id": self.place_id,
            "name": self.name,
            "address": self.address,
            "lat": self.lat,
            "lng": self.lng,
            "rating": self.rating,
            "user_ratings_total": self.user_ratings_total,
            "phone": self.phone,
            "website": self.website,
            "has_photos": len(self.photos) > 0,
            "types": self.types,
            "price_level": self.price_level,
            "business_status": self.business_status,
        }


class PlacesClient:
    """
    Cliente Google Places API.
    Busca dados estruturados e confiáveis sobre estabelecimentos.
    """

    TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
    PHOTO_URL = "https://maps.googleapis.com/maps/api/place/photo"

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not self.api_key:
            logger.info("PlacesClient: GOOGLE_MAPS_API_KEY não configurada — Google Places desativado. Usando Playwright como fonte primária.")

    def search_condominiums(self, city: str, query: str = "condomínio") -> List[PlaceResult]:
        """
        Busca condomínios em uma cidade usando Text Search da Places API.
        Retorna dados ESTRUTURADOS com nome, endereço e coordenadas.
        """
        if not self.api_key:
            logger.error("PlacesClient: Sem API key para buscar condomínios")
            return []

        full_query = f"{query} em {city}"
        logger.info(f"PlacesClient: Buscando '{full_query}' via Places API...")

        params = {
            "query": full_query,
            "key": self.api_key,
            "type": "real_estate_agency",  # Google Places type for real estate
            "language": "pt-BR",
            "region": "br",
        }

        try:
            import requests
            resp = requests.get(self.TEXT_SEARCH_URL, params=params, timeout=15)
            data = resp.json()

            if data.get("status") != "OK":
                logger.warning(f"PlacesClient: Places API retornou status {data.get('status')}: {data.get('error_message', '')}")
                # Se falhar, tenta sem o filtro de tipo
                if "type" in params:
                    del params["type"]
                    resp = requests.get(self.TEXT_SEARCH_URL, params=params, timeout=15)
                    data = resp.json()

                    if data.get("status") != "OK":
                        logger.error(f"PlacesClient: Status {data.get('status')} mesmo sem filtro")
                        return []

            results = data.get("results", [])

            # Filtro inteligente: só prédios/condomínios residenciais
            places = []
            negative_keywords = [
                "imobiliária", "imobiliaria", "imóveis", "imoveis", "corretor",
                "construtora", "incorporadora", "administradora", "advocacia",
                "clínica", "hospital", "escola", "colégio", "igreja", "templo",
                "restaurante", "bar", "padaria", "shopping", "supermercado",
                "oficina", "mecânica", "auto", "seguro", "banco", "farmácia",
                "academia", "hotel", "pousada", "escritório",
            ]

            for place_data in results:
                name = place_data.get("name", "").lower()
                types = place_data.get("types", [])

                # Pula se nome parece não ser condomínio
                if any(kw in name for kw in negative_keywords):
                    continue

                place = PlaceResult(place_data)

                # Só inclui se for um lugar razoável (tem nome, endereço, coordenadas)
                if place.name != "Condomínio" and place.lat and place.lng:
                    places.append(place)

            logger.info(f"PlacesClient: {len(places)} condomínios encontrados em {city}")
            return places

        except Exception as e:
            logger.error(f"PlacesClient: Erro na busca: {e}")
            return []

    def get_place_details(self, place_id: str) -> Optional[PlaceResult]:
        """
        Busca dados DETALHADOS de um lugar pelo place_id.
        Inclui telefone, website, fotos, avaliações.
        """
        if not self.api_key:
            return None

        params = {
            "place_id": place_id,
            "key": self.api_key,
            "fields": "name,formatted_address,international_phone_number,formatted_phone_number,website,rating,user_ratings_total,geometry,photos,types,price_level,business_status",
            "language": "pt-BR",
        }

        try:
            import requests
            resp = requests.get(self.DETAILS_URL, params=params, timeout=10)
            data = resp.json()

            if data.get("status") != "OK":
                logger.warning(f"PlacesClient: Details API status {data.get('status')} para {place_id}")
                return None

            result = data.get("result", {})
            return PlaceResult(result)

        except Exception as e:
            logger.error(f"PlacesClient: Erro ao buscar detalhes de {place_id}: {e}")
            return None

    def get_place_photo(self, photo_reference: str, max_width: int = 800) -> Optional[bytes]:
        """
        Baixa a foto de um lugar (fachada real!) pela photo_reference.
        Retorna os bytes da imagem ou None em caso de erro.
        """
        if not self.api_key:
            return None

        params = {
            "maxwidth": max_width,
            "photoreference": photo_reference,
            "key": self.api_key,
        }

        try:
            import requests
            resp = requests.get(self.PHOTO_URL, params=params, timeout=15)
            if resp.status_code == 200 and "image" in resp.headers.get("Content-Type", ""):
                return resp.content
            else:
                logger.warning(f"PlacesClient: Photo API retornou status {resp.status_code}")
                return None
        except Exception as e:
            logger.error(f"PlacesClient: Erro ao baixar foto: {e}")
            return None

    def save_place_photo(self, photo_reference: str, output_path: str, max_width: int = 800) -> Optional[str]:
        """
        Baixa e salva a foto de um lugar no disco.
        Retorna o caminho do arquivo salvo ou None.
        """
        image_bytes = self.get_place_photo(photo_reference, max_width)
        if not image_bytes:
            return None

        try:
            import requests
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(image_bytes)
            logger.info(f"PlacesClient: Foto salva em {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"PlacesClient: Erro ao salvar foto: {e}")
            return None

    def search_and_enrich(self, city: str, query: str = "condomínio") -> List[dict]:
        """
        Pipeline completo: busca condomínios e enriquece cada um com dados detalhados.
        Retorna lista de dicts prontos para o banco de dados.
        """
        places = self.search_condominiums(city, query)
        enriched_leads = []

        for place in places:
            # Já temos dados básicos do search, mas vamos enriquecer
            details = self.get_place_details(place.place_id) if place.place_id else place
            place_data = (details or place).to_dict()

            lead = {
                "name": place_data["name"],
                "address": place_data["address"],
                "coords": {"lat": place_data["lat"], "lng": place_data["lng"]},
                "phone": place_data["phone"] if place_data["phone"] and place_data["phone"] != "N/D" else "N/D",
                "website": place_data["website"] if place_data["website"] and place_data["website"] != "N/D" else "N/D",
                "rating": place_data["rating"],
                "user_ratings_total": place_data["user_ratings_total"],
                "source": "Google Places API",
                "place_id": place_data["place_id"],
                "has_photos": place_data["has_photos"],
                "photo_reference": place.photos[0]["photo_reference"] if place.photos else None,
                "scanned_at": datetime.now().isoformat(),
            }

            # Tenta baixar a foto de fachada real
            if lead["photo_reference"]:
                safe_name = place_data["name"].lower().replace(" ", "_")[:30]
                img_dir = os.path.join(
                    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                    "static", "vistorias"
                )
                img_filename = f"places_{safe_name}.jpg"
                img_path = os.path.join(img_dir, img_filename)

                saved = self.save_place_photo(lead["photo_reference"], img_path)
                if saved:
                    lead["vision_image_url"] = f"/static/vistorias/{img_filename}"
                    logger.info(f"PlacesClient: Foto real de fachada para {lead['name']}")

            enriched_leads.append(lead)

        return enriched_leads
