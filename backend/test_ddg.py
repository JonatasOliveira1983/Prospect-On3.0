"""Teste: DuckDuckGo via requests com headers de navegador real."""
import requests
import re

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "pt-BR,pt;q=0.9",
}

queries = [
    "edital pintura predial licitação 2025 2026 site:gov.br",
    "pregão eletrônico pintura fachada prédio público SP",
    "contratação serviços pintura predial órgão público edital",
    "licitação manutenção predial pintura SP 2026",
]

for q in queries:
    print(f"\n>>> {q}")
    try:
        url = f"https://html.duckduckgo.com/html/?q={q.replace(' ', '+')}"
        resp = requests.get(url, headers=headers, timeout=15)
        print(f"Status: {resp.status_code} | Length: {len(resp.text)}")
        
        if resp.status_code == 200:
            # Extrai links
            from html.parser import HTMLParser
            
            class LinkParser(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.links = []
                    self.current_link = ""
                    self.current_text = ""
                    self.in_link = False
                def handle_starttag(self, tag, attrs):
                    if tag == 'a':
                        for attr, val in attrs:
                            if attr == 'href' and val.startswith('http'):
                                self.current_link = val
                                self.in_link = True
                def handle_data(self, data):
                    if self.in_link:
                        self.current_text += data
                def handle_endtag(self, tag):
                    if tag == 'a' and self.in_link:
                        if len(self.current_text.strip()) > 10:
                            self.links.append((self.current_text.strip()[:120], self.current_link[:200]))
                        self.current_link = ""
                        self.current_text = ""
                        self.in_link = False
            
            parser = LinkParser()
            parser.feed(resp.text)
            
            print(f"  Links encontrados: {len(parser.links)}")
            for text, link in parser.links[:5]:
                print(f"  - {text}")
                print(f"    {link}")
    except Exception as e:
        print(f"  ERRO: {e}")
