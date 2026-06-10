"""Teste: buscar editais reais de pintura nos portais oficiais."""
import asyncio
import re
from playwright.async_api import async_playwright

SEARCHES = [
    ("PNCP Search", "https://www.gov.br/pncp/pt-br/consultas"),
    ("ComprasNet", "https://www.gov.br/compras/pt-br"),
    ("Portal Compras SP", "https://www.bec.sp.gov.br/"),
]

async def test_search(name, url):
    print(f"\n{'='*60}")
    print(f">>> {name}: {url}")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
            ctx = await browser.new_context(
                viewport={"width": 1440, "height": 900},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
                locale="pt-BR",
            )
            page = await ctx.new_page()
            
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(3000)
            
            text = await page.inner_text("body")
            
            # Procura input de busca
            search_inputs = await page.query_selector_all("input[type='search'], input[type='text'], input[name*='q'], input[name*='search'], input[placeholder*='buscar'], input[placeholder*='pesquisar'], input[placeholder*='Search']")
            
            found_search = False
            for inp in search_inputs[:3]:
                try:
                    placeholder = await inp.get_attribute("placeholder") or ""
                    name = await inp.get_attribute("name") or ""
                    print(f"  Input encontrado: name='{name}' placeholder='{placeholder[:50]}'")
                    
                    await inp.fill("pintura predial")
                    await page.wait_for_timeout(1000)
                    
                    # Tenta submit
                    await inp.press("Enter")
                    await page.wait_for_timeout(5000)
                    
                    result_text = await page.inner_text("body")
                    print(f"  Resultados: {len(result_text)} chars")
                    
                    # Procura por telefones/contatos
                    phones = re.findall(r'(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}', result_text)
                    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', result_text)
                    print(f"  Telefones: {len(phones)}, Emails: {len(emails)}")
                    if phones:
                        print(f"    Ex: {phones[:3]}")
                    
                    found_search = True
                    break
                except Exception as e:
                    print(f"  Erro no input: {e}")
            
            if not found_search:
                print(f"  Nenhum input de busca encontrado")
                # Mostra trecho do texto para debug
                words = text.split()[:50]
                print(f"  Preview: {' '.join(words)[:200]}")
            
            await browser.close()
    except Exception as e:
        print(f"  ERRO: {e}")

async def main():
    for name, url in SEARCHES:
        await test_search(name, url)
        await asyncio.sleep(2)

asyncio.run(main())
