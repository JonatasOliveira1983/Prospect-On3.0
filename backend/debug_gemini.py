import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("ERRO: GEMINI_API_KEY nao encontrada no arquivo .env")
        return

    print(f"Iniciando teste Gemini com a chave: {api_key[:10]}...")
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        print("Tentando gerar resposta simples...")
        response = model.generate_content("Diga: Olá Prospect-On")
        
        if response and response.text:
            print(f"OK: Gemini funcionando! Resposta: {response.text}")
        else:
            print("FALHA: Gemini nao retornou texto.")
            
    except Exception as e:
        print(f"FALHA: Erro no Gemini - {e}")

if __name__ == "__main__":
    test_gemini()
