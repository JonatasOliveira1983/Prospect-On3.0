import asyncio
from playwright.async_api import async_playwright
import re

async def check_bing():
    # Vamos testar 2 queries: uma rígida (atual) e uma simplificada
    query_rigida = '"ata de assembleia" "fundo de obra" fachada condomínio São Paulo'
    query_simples = 'condominio "fundo de obras" pintura fachada São Paulo'
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Testando query rígida
        print(f"🔍 Buscando query rígida: {query_rigida}")
        await page.goto(f"https://www.bing.com/search?q={query_rigida.replace(' ', '+')}")
        await page.wait_for_timeout(2000)
        content_rigida = await page.content()
        matches_rigida = re.findall(r'<li class="b_algo">', content_rigida)
        print(f"👉 Resultados encontrados (rigida): {len(matches_rigida)}")
        
        # Testando query simples
        print(f"🔍 Buscando query simples: {query_simples}")
        await page.goto(f"https://www.bing.com/search?q={query_simples.replace(' ', '+')}")
        await page.wait_for_timeout(2000)
        content_simples = await page.content()
        matches_simples = re.findall(r'<li class="b_algo">', content_simples)
        print(f"👉 Resultados encontrados (simples): {len(matches_simples)}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(check_bing())
