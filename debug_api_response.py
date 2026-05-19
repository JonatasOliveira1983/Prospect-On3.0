import sys
import os
import json

# Adicionar root ao path para encontrar src
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.src.engine.smart_enrichment import SmartEnrichment

def debug():
    en = SmartEnrichment()
    lead_input = {
        "name": "Condomínio Edifício Praça das Águas",
        "address": "Av. 9 de Julho, 3500 - Anhangabaú, Jundiaí - SP"
    }
    
    print("--- DEBUGGING API RESPONSE v3.0 ---")
    res = en.enrich_lead(lead_input)
    
    # Simular lógica do api.py
    base_url = "http://localhost:8000/api/images"
    for key in ['vision_image_path', 'satellite_image_path', 'location_map_path']:
        path = res.get(key)
        print(f"Key: {key}, Path: {path}")
        if path:
            # Tentar encontrar o arquivo considerando caminhos relativos/absolutos
            search_paths = [
                path,
                os.path.join("backend", path),
                os.path.join(os.getcwd(), path)
            ]
            found = False
            for p in search_paths:
                if os.path.exists(p):
                    print(f"  FOUND AT: {p}")
                    filename = os.path.basename(p)
                    url = f"{base_url}/{filename}"
                    res[key.replace('_path', '_url')] = url
                    if key == 'vision_image_path':
                        if 'vision_analysis' not in res: res['vision_analysis'] = {}
                        res['vision_analysis']['image_url'] = url
                    found = True
                    break
            if not found:
                print(f"  NOT FOUND in search paths")
    
    print("\nRESULT KEYS:", res.keys())
    if 'vision_analysis' in res:
        print("VISION ANALYSIS KEYS:", res['vision_analysis'].keys())
        print("VISION IMAGE URL:", res['vision_analysis'].get('image_url'))
    print("TOP LEVEL VISION IMAGE URL:", res.get('vision_image_url'))

if __name__ == "__main__":
    debug()
