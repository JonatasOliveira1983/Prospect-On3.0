"""Teste 2: buscar resultados reais com mais tempo de espera."""
import asyncio
import re
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        ctx = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
            locale="pt-BR",
        )
        page = await ctx.new_page()
        
        # PNCP search direct URL
        url = "https://www.gov.br/pncp/pt-br/consultas?search=pintura+predial"
        print(f"Acessando: {url}")
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)
        
        # Tira screenshot
        await page.screenshot(path="pncp_search.png", full_page=False)
        
        # Pega todo o texto visivel
        text = await page.inner_text("body")
        print(f"Texto: {len(text)} chars")
        
        # Procura links nos resultados
        links = await page.query_selector_all("a[href]")
        gov_links = []
        for link in links:
            try:
                href = await link.get_attribute("href") or ""
                txt = (await link.inner_text()).strip()
                if href.startswith("http") and len(txt) > 15:
                    gov_links.append((txt[:100], href[:150]))
            except:
                pass
        
        print(f"\nLinks encontrados: {len(gov_links)}")
        for txt, href in gov_links[:10]:
            print(f"  {txt}")
            print(f"  -> {href}")
        
        # Tenta clicar no primeiro link de resultado
        result_links = await page.query_selector_all("a[href*='contratacao'], a[href*='edital'], a[href*='licitacao'], a[href*='/pncp/']")
        print(f"\nLinks de contratacao: {len(result_links)}")
        
        if result_links:
            first = result_links[0]
            href = await first.get_attribute("href")
            print(f"Clicando: {href}")
            await first.click()
            await page.wait_for_timeout(5000)
            
            detail_text = await page.inner_text("body")
            print(f"\nDetalhes: {len(detail_text)} chars")
            
            phones = re.findall(r'(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}', detail_text)
            emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', detail_text)
            values = re.findall(r'R\$\s*[\d\.,]+', detail_text)
            
            print(f"Telefones: {phones[:5]}")
            print(f"Emails: {emails[:3]}")
            print(f"Valores: {values[:3]}")
            
            # Mostra trecho
            print(f"\nTrecho: {detail_text[:500]}")
        
        await browser.close()

asyncio.run(test())
