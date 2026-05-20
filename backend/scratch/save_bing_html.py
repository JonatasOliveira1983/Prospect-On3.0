import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    query = "condominio pintura fachada Sao Paulo"
    print(f"Buscando no Bing por: {query}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # User agent de navegador real
        await page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        })
        
        url = f"https://www.bing.com/search?q={query.replace(' ', '+')}"
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        
        try:
            await page.wait_for_selector("#b_results", timeout=6000)
            print("Sucesso: seletor #b_results encontrado!")
        except Exception as e:
            print(f"Erro/Aviso: seletor #b_results nao encontrado: {e}")
            
        html = await page.content()
        
        # Criar a pasta scratch se nao existir
        os.makedirs("scratch", exist_ok=True)
        
        with open("scratch/bing_result.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        print("HTML salvo em scratch/bing_result.html. Tamanho:", len(html), "bytes")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
