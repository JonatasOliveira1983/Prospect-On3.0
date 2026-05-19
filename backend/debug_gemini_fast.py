import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

try:
    print("Testando Gemini (Flash)...")
    response = model.generate_content("Oi", generation_config={"max_output_tokens": 5})
    print(f"RESPOSTA: {response.text}")
except Exception as e:
    print(f"ERRO: {e}")
