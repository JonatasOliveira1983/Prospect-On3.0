import os
import requests
from dotenv import load_dotenv

def test_google_apis():
    load_dotenv()
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    
    if not api_key:
        print("ERRO: GOOGLE_MAPS_API_KEY nao encontrada no arquivo .env")
        return

    print(f"Iniciando teste com a chave: {api_key[:10]}...{api_key[-5:]}")
    
    # 1. Testar Geocoding (Usado para metadados)
    print("\n--- Testando Geocoding API ---")
    geo_url = f"https://maps.googleapis.com/maps/api/geocode/json?address=Jundiaí,SP&key={api_key}"
    try:
        resp = requests.get(geo_url)
        data = resp.json()
        if data.get("status") == "OK":
            print("OK: Geocoding API funcionando")
        else:
            print(f"FALHA: Geocoding API - Status: {data.get('status')}")
            print(f"Mensagem: {data.get('error_message', 'Nenhuma mensagem de erro')}")
    except Exception as e:
        print(f"ERRO DE CONEXAO Geocoding: {e}")

    # 2. Testar Street View Metadata
    print("\n--- Testando Street View Metadata ---")
    meta_url = f"https://maps.googleapis.com/maps/api/streetview/metadata?location=-23.1857,-46.8978&key={api_key}"
    try:
        resp = requests.get(meta_url)
        data = resp.json()
        if data.get("status") == "OK":
            print("OK: Street View Metadata funcionando")
        else:
            print(f"FALHA: Street View Metadata - Status: {data.get('status')}")
            print(f"Mensagem: {data.get('error_message', 'Nenhuma mensagem de erro')}")
    except Exception as e:
        print(f"ERRO DE CONEXAO Street View Meta: {e}")

    # 3. Testar Download de Imagem (Street View)
    print("\n--- Testando Download de Imagem (Street View) ---")
    img_url = f"https://maps.googleapis.com/maps/api/streetview?size=600x400&location=-23.1857,-46.8978&key={api_key}"
    try:
        resp = requests.get(img_url)
        if resp.status_code == 200:
            if len(resp.content) < 10000:
                print("AVISO: Street View Image status 200 mas imagem pequena. Possivelmente API Street View Static nao ativada.")
            else:
                print(f"OK: Street View Image funcionando (Tamanho: {len(resp.content)} bytes)")
        else:
            print(f"FALHA: Street View Image - Codigo HTTP: {resp.status_code}")
            print(f"Erro: {resp.text}")
    except Exception as e:
        print(f"ERRO DE CONEXAO Street View Img: {e}")

    # 4. Testar Download de Imagem Satélite (Maps Static API)
    print("\n--- Testando Download de Imagem Satelite (Maps Static API) ---")
    sat_url = f"https://maps.googleapis.com/maps/api/staticmap?center=-23.1857,-46.8978&zoom=19&size=600x400&maptype=satellite&key={api_key}"
    try:
        resp = requests.get(sat_url)
        if resp.status_code == 200:
            if len(resp.content) < 5000:
                print("AVISO: Satelite Image status 200 mas imagem pequena. Possivelmente Maps Static API nao ativada.")
            else:
                print(f"OK: Satelite Image funcionando (Tamanho: {len(resp.content)} bytes)")
        else:
            print(f"FALHA: Satelite Image - Codigo HTTP: {resp.status_code}")
            print(f"Erro: {resp.text}")
    except Exception as e:
        print(f"ERRO DE CONEXAO Satelite: {e}")

if __name__ == "__main__":
    test_google_apis()
