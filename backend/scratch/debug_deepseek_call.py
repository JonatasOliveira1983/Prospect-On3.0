import asyncio
import os
import sys
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.deepseek_client import DeepSeekClient
from src.agents.demand_scout_agent import extract_text_from_html, extract_links_from_html

async def main():
    html_path = "scratch/bing_result.html"
    if not os.path.exists(html_path):
        print("Erro: execute save_bing_html.py primeiro.")
        return
        
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
        
    raw_text = extract_text_from_html(html)
    links = extract_links_from_html(html)
    filtered_links = [h for h in links if h.startswith("http") and "bing.com" not in h]
    
    print("Tamanho do texto extraido:", len(raw_text))
    print("Numero de links unicos filtrados:", len(filtered_links))
    
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        print("Erro: DEEPSEEK_API_KEY nao configurada no ambiente.")
        return
        
    client = DeepSeekClient(api_key=api_key)
    
    links_str = "\n".join(filtered_links[:10])
    prompt = f"""
Você é o PillarAHunterAgent (Caçador de Condomínios) da Otto Pinturas.
Sua missão é analisar o TEXTO BRUTO extraído dos resultados de busca do Bing
e identificar condomínios com sinais ATIVOS de demanda por pintura, reforma
ou manutenção de fachada na cidade de São Paulo.

TEXTO DA PESQUISA:
\"\"\"{raw_text[:6000]}\"\"\"

LINKS ENCONTRADOS:
\"\"\"{links_str}\"\"\"

REGRAS DE EXTRAÇÃO:
1. Identifique nomes de condomínios mencionados no texto.
2. Para cada condomínio, verifique se há menção a:
   - Atas de assembleia discutindo pintura/reforma de fachada
   - Fundos de obra aprovados para pintura externa
   - Cotações/orçamentos de pintura em andamento
   - Termos como "pintura", "fachada", "reforma", "lavagem", "impermeabilização"
3. Classifique o score_urgencia (1-10):
   - 8-10: Cotação ativa, assembleia recente com aprovação, obra iminente
   - 5-7: Discussão iniciada, planejamento em andamento
   - 1-4: Menção genérica a manutenção
4. categoria_demanda: "pintura_fachada", "lavagem_pastilhas" ou "reforma_geral"
5. Extraia um resumo em português do Brasil com o sinal encontrado.
6. Associe o link mais relevante como link_fonte.

Retorne APENAS um array JSON (sem marcação markdown, sem texto extra):
[
  {{
    "name": "Nome do Condomínio",
    "resumo_sinal": "Resumo do sinal de pintura encontrado",
    "link_fonte": "URL mais relevante",
    "score_urgencia": 8,
    "categoria_demanda": "pintura_fachada",
    "tipo_entidade": "predio",
    "pilar": "A"
  }}
]

Se não houver NENHUM sinal relevante, retorne um array vazio: []
"""
    
    print("Chamando o DeepSeek...")
    response = client.generate_content(contents=[prompt])
    if not response:
        print("Resposta do DeepSeek vazia.")
        return
        
    result = response.text.strip()
    print("--------------------------------------------------")
    print("RESPOSTA DO DEEPSEEK:")
    print(result)
    print("--------------------------------------------------")

if __name__ == "__main__":
    asyncio.run(main())
