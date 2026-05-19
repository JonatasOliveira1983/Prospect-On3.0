import requests
import json
from src.utils.logger import logger

class HunterAgent:
    """
    Agente Caçador: Responsável por descobrir novos condomínios usando APIs gratuitas (OpenStreetMap).
    """
    def __init__(self):
        self.overpass_urls = [
            "https://overpass-api.de/api/interpreter",
            "https://lz4.overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"
        ]

    def search_condos(self, city="São Paulo"):
        """
        Busca condomínios usando Bounding Box e User-Agent para máxima estabilidade (v2.7).
        """
        logger.info(f"HunterAgent: Iniciando busca robusta por Bounding Box em {city}...")
        
        # São Paulo Bbox default de fallback
        bbox = "(-23.6005, -46.6833, -23.5005, -46.5833)"
        
        # Tentar obter bounding box via Nominatim API do OSM
        import requests
        headers_geo = {'User-Agent': 'ProspectOn/1.0 (contact: spcom)'}
        success_geo = False
        
        # Normalização inteligente do termo de busca geográfica (ex: "Sâo Paulo Zona Sul")
        import re
        clean_city = city.replace("â", "ã").replace("Â", "Ã") # Corrige digitação comum "Sâo"
        match_sp = re.search(r"s[ãa]o paulo\s+(zona\s+\w+)", clean_city, re.IGNORECASE)
        if match_sp:
            zona = match_sp.group(1)
            clean_city = f"{zona}, São Paulo"
            
        logger.info(f"HunterAgent: Termo de busca geográfica normalizado: '{clean_city}'")

        # 1. Tenta geocodificar o termo de busca e criar um Bbox de raio ao redor do centroid
        try:
            url_geo = "https://nominatim.openstreetmap.org/search"
            resp = requests.get(url_geo, params={'q': f"{clean_city}, Brazil", 'format': 'json', 'limit': 1}, headers=headers_geo, timeout=8)
            if resp.status_code == 200 and resp.json():
                geo_data = resp.json()
                lat_str = geo_data[0].get('lat')
                lon_str = geo_data[0].get('lon')
                if lat_str and lon_str:
                    lat = float(lat_str)
                    lon = float(lon_str)
                    # Define um raio de 0.035 graus (~4 km) ao redor do centroid
                    radius = 0.035
                    bbox = f"({lat - radius}, {lon - radius}, {lat + radius}, {lon + radius})"
                    success_geo = True
                    logger.info(f"HunterAgent: Bbox baseado em centroid para '{clean_city}' obtido com sucesso: {bbox}")
        except Exception as e:
            logger.warning(f"HunterAgent: Falha ao geocodificar centroid para '{clean_city}': {e}")
            
        # 2. Se falhar, tenta limpar sub-regiões completamente e geocodificar a cidade principal
        if not success_geo:
            try:
                base_city = clean_city
                for suffix in ["zona sul", "zona norte", "zona leste", "zona oeste", "centro"]:
                    if suffix in base_city.lower():
                        base_city = base_city.lower().replace(suffix, "").strip()
                
                logger.info(f"HunterAgent: Tentando geocodificar cidade base limpa: '{base_city}'")
                url_geo = "https://nominatim.openstreetmap.org/search"
                resp = requests.get(url_geo, params={'q': f"{base_city}, Brazil", 'format': 'json', 'limit': 1}, headers=headers_geo, timeout=8)
                if resp.status_code == 200 and resp.json():
                    geo_data = resp.json()
                    lat_str = geo_data[0].get('lat')
                    lon_str = geo_data[0].get('lon')
                    if lat_str and lon_str:
                        lat = float(lat_str)
                        lon = float(lon_str)
                        # Para cidade principal, podemos expandir um pouco o raio (ex: 0.05 graus ~5.5 km)
                        radius = 0.05
                        bbox = f"({lat - radius}, {lon - radius}, {lat + radius}, {lon + radius})"
                        success_geo = True
                        logger.info(f"HunterAgent: Bbox baseado em centroid para cidade base '{base_city}' obtido: {bbox}")
            except Exception as e:
                logger.warning(f"HunterAgent: Erro ao buscar cidade base: {e}")
                
        if not success_geo:
            logger.warning(f"HunterAgent: Usando Bbox de fallback (São Paulo): {bbox}")
            
        query = f"""
        [out:json];
        (
          node["building"="apartments"]{bbox};
          way["building"="apartments"]{bbox};
          relation["building"="apartments"]{bbox};
          node["building"="residential"]{bbox};
          way["building"="residential"]{bbox};
          relation["building"="residential"]{bbox};
        );
        out center 50;
        """
        
        headers = {
            'User-Agent': 'ProspectOn/1.0 (contact: spcom)',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        try:
            response = None
            for url in self.overpass_urls:
                logger.info(f"HunterAgent: Tentando buscar condomínios em {url}...")
                try:
                    response = requests.post(url, data={'data': query}, headers=headers, timeout=15)
                    if response.status_code == 200:
                        logger.info(f"✅ HunterAgent: Conexão bem-sucedida com {url}")
                        break
                    else:
                        logger.warning(f"⚠️ HunterAgent: Status {response.status_code} em {url}. Tentando próximo...")
                except Exception as conn_err:
                    logger.warning(f"⚠️ HunterAgent: Erro de conexão com {url}: {conn_err}. Tentando próximo...")
            
            if not response or response.status_code != 200:
                logger.error(f"❌ HunterAgent: Falha crítica em todos os servidores Overpass OSM.")
                return []
            
            data = response.json()
            elements = data.get('elements', [])
            
            leads = []
            for el in elements:
                name = el.get('tags', {}).get('name')
                # Se não tiver nome, tentamos gerar um baseado no endereço ou tipo
                if not name:
                    addr_street = el.get('tags', {}).get('addr:street', 'Rua Desconhecida')
                    addr_num = el.get('tags', {}).get('addr:housenumber', 'S/N')
                    name = f"Condomínio {addr_street}, {addr_num}"
                
                # Extrair coordenadas (Overpass retorna 'center' para ways/relations)
                coords = None
                if el.get('type') == 'node':
                    coords = {'lat': el.get('lat'), 'lng': el.get('lon')}
                else:
                    coords = {'lat': el.get('center', {}).get('lat'), 'lng': el.get('center', {}).get('lon')}
                
                    tags = el.get('tags', {})
                    levels = tags.get('building:levels')
                    
                    leads.append({
                        'name': name,
                        'address': f"{tags.get('addr:street', '')}, {tags.get('addr:housenumber', '')} - {city}",
                        'coords': coords,
                        'source': 'OpenStreetMap',
                        'building_levels': levels,
                        'tags_json': json.dumps(tags)
                    })
            
            logger.info(f"✅ HunterAgent: {len(leads)} leads encontrados gratuitamente!")
            return leads
            
        except Exception as e:
            logger.error(f"❌ HunterAgent: Falha crítica na busca: {e}")
            return []

if __name__ == "__main__":
    # Teste rápido
    hunter = HunterAgent()
    results = hunter.search_condos("São Paulo")
    for r in results[:5]:
        print(f"- {r['name']} ({r['coords']})")
