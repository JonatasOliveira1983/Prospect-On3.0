import asyncio
from playwright.async_api import async_playwright
import os
import re
from html.parser import HTMLParser

class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
    def handle_data(self, data):
        self.result.append(data)
    def get_text(self):
        return " ".join(self.result)

def extract_text_from_html(html: str) -> str:
    if not html:
        return ""
    html_clean = re.sub(r'<(script|style|noscript)\b[^>]*>([\s\S]*?)</\1>', '', html, flags=re.IGNORECASE)
    parser = HTMLTextExtractor()
    parser.feed(html_clean)
    text = parser.get_text()
    return re.sub(r'\s+', ' ', text).strip()

async def main():
    query = 'condominio pintura fachada Sao Paulo'
    print(f"Buscando no DuckDuckGo por: {query}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        })
        
        url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
        await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        
        await page.wait_for_timeout(3000)
            
        html = await page.content()
        
        with open("scratch/debug_ddg.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        print("HTML salvo em scratch/debug_ddg.html")
        text = extract_text_from_html(html)
        
        matches = re.findall(r'([^.]{0,100}(?:assembleia|condominio|fachada|pintura)[^.]{0,100})', text, re.IGNORECASE)
        print(f"Total de trechos com palavras-chave encontrados: {len(matches)}")
        for i, match in enumerate(matches[:15]):
            print(f"{i+1}: {match.strip()}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
