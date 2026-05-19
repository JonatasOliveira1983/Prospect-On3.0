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

    def search_condos(self, city="Jundiaí"):
        """
        Busca condomínios usando Bounding Box e User-Agent para máxima estabilidade (v2.7).
        """
        logger.info(f"HunterAgent: Iniciando busca robusta por Bounding Box em {city}...")
        
        # Jundiaí Bbox aproximada
        query = """
        [out:json];
        (
          node["building"="apartments"](-23.3, -47.0, -23.1, -46.8);
          way["building"="apartments"](-23.3, -47.0, -23.1, -46.8);
          relation["building"="apartments"](-23.3, -47.0, -23.1, -46.8);
          node["building"="residential"](-23.3, -47.0, -23.1, -46.8);
          way["building"="residential"](-23.3, -47.0, -23.1, -46.8);
          relation["building"="residential"](-23.3, -47.0, -23.1, -46.8);
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
    results = hunter.search_condos("Jundiaí")
    for r in results[:5]:
        print(f"- {r['name']} ({r['coords']})")
