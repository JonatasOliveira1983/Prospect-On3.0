"""Teste: Imprensa Oficial SP - portal HTML tradicional."""
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
        
        # Imprensa Oficial - busca por edital de pintura
        url = "https://www.imprensaoficial.com.br/pesquisa?q=pintura+predial+edital+licitacao&tb=DOE"
        print(f"Acessando: {url}")
        
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        except:
            pass
        await page.wait_for_timeout(5000)
        
        text = await page.inner_text("body")
        print(f"Texto: {len(text)} chars")
        print(f"Preview: {text[:500]}")
        
        # Links
        links = await page.query_selector_all("a[href]")
        relevant = []
        for link in links:
            try:
                href = await link.get_attribute("href") or ""
                txt = (await link.inner_text()).strip()
                if len(txt) > 20 and "pintura" in txt.lower() or "edital" in txt.lower() or "licita" in txt.lower():
                    relevant.append((txt[:120], href[:150]))
            except:
                pass
        
        print(f"\nLinks relevantes: {len(relevant)}")
        for txt, href in relevant[:5]:
            print(f"  {txt}")
            print(f"  -> {href}")
        
        # Telefones e emails na pagina
        phones = re.findall(r'(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}', text)
        emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        print(f"\nTelefones: {phones[:5]}")
        print(f"Emails: {emails[:3]}")
        
        await browser.close()

asyncio.run(test())
