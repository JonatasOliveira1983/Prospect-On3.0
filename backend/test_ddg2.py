import asyncio, re
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width":1440,"height":900}, locale="pt-BR")
        page = await ctx.new_page()
        
        url = "https://html.duckduckgo.com/html/?q=edital+pintura+predial+SP"
        print(f"Accessing: {url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        await page.wait_for_timeout(3000)
        
        html = await page.content()
        print(f"HTML: {len(html)} chars")
        
        # Test all regex patterns
        p1 = re.findall(r'<a[^>]*class="result__a"[^>]*href="(https?://[^"]+)"', html, re.IGNORECASE)
        p2 = re.findall(r"<a[^>]*class='result__a'[^>]*href='(https?://[^']+)'", html, re.IGNORECASE)
        p3 = re.findall(r'class="result__url"[^>]*>([^<]+)', html, re.IGNORECASE)
        p4 = re.findall(r"class='result__url'[^>]*>([^<]+)", html, re.IGNORECASE)
        
        print(f"result__a (double): {len(p1)}")
        print(f"result__a (single): {len(p2)}")
        print(f"result__url (double): {len(p3)}")
        print(f"result__url (single): {len(p4)}")
        
        if p1:
            print(f"\nresult__a examples: {p1[:3]}")
        if p3:
            print(f"\nresult__url examples: {p3[:5]}")
        
        # Direct link search
        all_links = re.findall(r'<a[^>]+href="(https?://[^\"]+)"', html)
        gov_links = [l for l in all_links if '.gov.br' in l or 'licitacao' in l or 'edital' in l]
        print(f"\nAll links: {len(all_links)}, Gov/lic links: {len(gov_links)}")
        
        if gov_links:
            for l in gov_links[:5]:
                print(f"  {l[:150]}")
        
        await browser.close()

asyncio.run(test())
