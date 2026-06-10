import asyncio, re
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        ctx = await browser.new_context(
            viewport={"width":1440,"height":900},
            locale="pt-BR",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
        )
        page = await ctx.new_page()
        
        # Tenta DDG HTML com headers extras
        await page.set_extra_http_headers({
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
            "Accept-Language": "pt-BR,pt;q=0.9",
        })
        
        url = "https://html.duckduckgo.com/html/?q=edital+pintura+predial+SP"
        print(f"Accessing: {url}")
        await page.goto(url, wait_until="networkidle", timeout=20000)
        await page.wait_for_timeout(3000)
        
        html = await page.content()
        print(f"HTML: {len(html)} chars")
        print(f"HTML preview: {html[:500]}")
        
        # Check all href links
        links = re.findall(r'href="(https?://[^"]+)"', html)
        gov_links = [l for l in links if any(kw in l.lower() for kw in ['.gov.br','licitacao','edital','pregao','compras','prefeitura'])]
        print(f"\nAll href links: {len(links)}")
        print(f"Gov/lic links: {len(gov_links)}")
        for l in gov_links[:5]:
            print(f"  {l[:150]}")
        
        await browser.close()

asyncio.run(test())
