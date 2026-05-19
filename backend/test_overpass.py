import requests
import json

def test_overpass():
    url = "https://overpass.kumi.systems/api/interpreter"
    query = """
    [out:json];
    (
      node["building"="apartments"](-23.23, -46.95, -23.15, -46.85);
      way["building"="apartments"](-23.23, -46.95, -23.15, -46.85);
    );
    out center 10;
    """
    
    headers = {
        'User-Agent': 'ProspectOn/1.0 (contact: spcom)',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    print(f"Executando query com User-Agent...")
    try:
        resp = requests.post(url, data={'data': query}, headers=headers, timeout=30)
        print(f"Status Code: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            elements = data.get('elements', [])
            print(f"Encontrados {len(elements)} elementos.")
            for el in elements:
                name = el.get('tags', {}).get('name', 'Sem nome')
                print(f"- {name}")
        else:
            print(f"Erro: {resp.text}")
    except Exception as e:
        print(f"Erro na conexão: {e}")

if __name__ == "__main__":
    test_overpass()
