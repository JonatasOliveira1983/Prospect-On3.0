import asyncio
import re
from playwright.async_api import async_playwright
from src.utils.logger import logger
import json
import os
from datetime import datetime

class BrowserScoutAgent:
    """
    Agente Sniper de Navegador v3.0: Extrai leads diretamente do Google Maps.
    Seletores atualizados para o DOM atual do Google Maps (2026).
    Agora extrai coordenadas da URL e usa seletores mais resilientes.
    """
    
    SOCIAL_DOMAINS = [
        'instagram.com', 'instagr.am', 'facebook.com', 'fb.com', 'fb.me',
        'wa.me', 'whatsapp.com', 'twitter.com', 'x.com', 't.co', 'tiktok.com',
        'linkedin.com', 'youtube.com', 'youtu.be', 'threads.net'
    ]
    
    BOOKING_DOMAINS = [
        'linktr.ee', 'linktree.com', 'bit.ly', 'bitly.com', 'bio.link', 
        'beacons.ai', 'lnk.bio', 'calendly.com', 'booksy.com', 'trinks.com'
    ]

    EMAIL_REGEX = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'

    def __init__(self, headless=False):
        self.headless = headless
        self.base_url = "https://www.google.com/maps"

    def _classify_url(self, url: str) -> str:
        if not url or url == "N/D": return "website"
        url_lower = url.lower()
        if any(domain in url_lower for domain in self.SOCIAL_DOMAINS):
            return "social"
        if any(domain in url_lower for domain in self.BOOKING_DOMAINS):
            return "booking"
        return "website"

    def _extract_email(self, text: str) -> str:
        if not text: return "N/D"
        emails = re.findall(self.EMAIL_REGEX, text)
        for email in emails:
            if not any(domain in email.lower() for domain in ['@google', '@gstatic', '@w3', '@schema']):
                return email
        return "N/D"

    def _extract_coordinates_from_url(self, url: str) -> dict:
        """
        Extrai coordenadas da URL do Google Maps.
        Formato: /maps/place/.../@lat,lng,... ou /maps/search/.../@lat,lng,...
        """
        if not url:
            return None
        # Procura pelo padrão @lat,lng na URL
        coord_match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
        if coord_match:
            return {
                'lat': float(coord_match.group(1)),
                'lng': float(coord_match.group(2))
            }
        return None

    async def search_leads(self, query, limit=20):
        logger.info(f"BrowserScoutAgent: Iniciando busca Sniper v3.0 por '{query}'...")
        
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        vistorias_dir = os.path.join(base_dir, "static", "vistorias")
        os.makedirs(vistorias_dir, exist_ok=True)

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.headless,
                args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
            )
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 900},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            try:
                search_url = f"{self.base_url}/search/{query.replace(' ', '+')}"
                logger.info(f"BrowserScoutAgent: Navegando para {search_url}")
                
                await page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
                await page.wait_for_timeout(5000)
                
                # Rolar para carregar a lista
                logger.info("BrowserScoutAgent: Carregando resultados via scroll...")
                for i in range(5):
                    try:
                        await page.mouse.wheel(0, 3000)
                    except: pass
                    await page.wait_for_timeout(1000)

                # Seletores resilientes para Google Maps (v3.0 - atualizados)
                results_selectors = [
                    "a.hfpxzc",                          # Seletor clássico de cards
                    "a[href*='maps/place']",              # Link para place
                    "div[role='feed'] a[href*='place']",  # Container de feed
                    "div[aria-label*='Resultados'] a",     # Label acessível
                    "a[jsaction*='placeCard']",            # JS action
                ]
                
                found_selector = None
                for sel in results_selectors:
                    try:
                        await page.wait_for_selector(sel, timeout=3000)
                        found_selector = sel
                        logger.info(f"BrowserScoutAgent: Seletor funcionou: {sel}")
                        break
                    except:
                        continue
                
                if not found_selector:
                    logger.warning("BrowserScoutAgent: Nenhum seletor de resultados encontrado. Usando fallback genérico.")
                    found_selector = results_selectors[0]

                cards = await page.query_selector_all(found_selector)
                logger.info(f"BrowserScoutAgent: Encontrados {len(cards)} cards potenciais.")
                
                yielded_count = 0
                for i in range(len(cards)):
                    if yielded_count >= limit: break

                    try:
                        current_cards = await page.query_selector_all(found_selector)
                        if i >= len(current_cards): break
                        card = current_cards[i]
                        
                        name = await card.get_attribute("aria-label") or "N/D"
                        
                        # FILTRO SNIPER ELITE
                        name_lower = name.lower()
                        negative_keywords = [
                            'imobiliária', 'imobiliaria', 'imóveis', 'imoveis', 'corretor', 
                            'negócios', 'consultoria', 'administradora', 'vendas', 'advocacia',
                            'clínica', 'hospital', 'escola', 'colégio', 'igreja', 'templo',
                            'restaurante', 'bar', 'padaria', 'shopping', 'supermercado'
                        ]
                        
                        if any(kw in name_lower for kw in negative_keywords):
                            logger.info(f"BrowserScoutAgent: DESCARTADO (Filtro Negativo): {name}")
                            continue

                        logger.info(f"BrowserScoutAgent: ALVO IDENTIFICADO [{i+1}/{len(current_cards)}]: {name}")
                        
                        # Clicar e esperar o painel lateral
                        try:
                            await card.scroll_into_view_if_needed()
                            await card.click()
                        except:
                            await page.evaluate("(el) => el.click()", card)
                        
                        await page.wait_for_timeout(3000)
                        
                        # EXTRAIR COORDENADAS DA URL ATUAL
                        current_url = page.url
                        coords = self._extract_coordinates_from_url(current_url)
                        
                        details = {
                            "address": "N/D", "phone": "N/D", "website": "N/D", 
                            "social_url": "N/D", "booking_url": "N/D", "email": "N/D",
                            "vision_image_url": None, "lat": None, "lng": None
                        }
                        
                        if coords:
                            details['lat'] = coords['lat']
                            details['lng'] = coords['lng']
                            logger.info(f"BrowserScoutAgent: Coordenadas extraídas: {coords['lat']}, {coords['lng']}")
                        
                        # EXTRAÇÃO DE DADOS DE CONTATO - Seletores v3.0 atualizados
                        try:
                            # Endereço
                            addr_els = [
                                "button[data-item-id='address']",
                                "div[data-item-id='address']",
                                "[class*='address']",
                            ]
                            for sel in addr_els:
                                el = await page.query_selector(sel)
                                if el:
                                    details['address'] = (await el.inner_text()).strip()
                                    break
                            
                            # TELEFONE - Seletores atualizados para o DOM 2026
                            phone_selectors = [
                                "button[data-item-id*='phone:tel:']",
                                "button[data-item-id*='phone']",
                                "a[data-tooltip*='telefone']",
                                "a[data-tooltip*='Telefone']",
                                "a[href^='tel:']",
                                "button[aria-label*='telefone']",
                                "button[aria-label*='Telefone']",
                                "div[class*='phone'] button",
                            ]
                            phone = None
                            for sel in phone_selectors:
                                el = await page.query_selector(sel)
                                if el:
                                    href = await el.get_attribute("href") or await el.get_attribute("data-item-id") or ""
                                    if "tel:" in href:
                                        phone = href.replace("tel:", "").replace("phone:tel:", "")
                                    else:
                                        phone = (await el.inner_text()).strip()
                                    if phone:
                                        details['phone'] = phone
                                        logger.info(f"BrowserScoutAgent: Telefone encontrado: {phone}")
                                        break
                            
                            # WEBSITE - Seletores atualizados
                            website_selectors = [
                                "a[data-item-id='authority']",
                                "a[data-item-id*='authority']",
                                "a[href*='http']:not([href*='maps'])",
                                "a[data-tooltip*='site']",
                                "a[aria-label*='site']",
                            ]
                            for sel in website_selectors:
                                el = await page.query_selector(sel)
                                if el:
                                    url = await el.get_attribute("href")
                                    if url and url.startswith("http") and "google.com" not in url:
                                        category = self._classify_url(url)
                                        if category == "social": details['social_url'] = url
                                        elif category == "booking": details['booking_url'] = url
                                        else: details['website'] = url
                                        logger.info(f"BrowserScoutAgent: Website/Social encontrado: {url[:50]}")
                                        break

                            # EMAIL - Extração do texto visível
                            info_elements = await page.query_selector_all(".Io6YTe, .fontBodyMedium, div[class*='text'], span[class*='text']")
                            all_text = ""
                            for el in info_elements:
                                try:
                                    all_text += f" {await el.inner_text()}"
                                except: pass
                            
                            details['email'] = self._extract_email(all_text)
                            if details['email'] and details['email'] != "N/D":
                                logger.info(f"BrowserScoutAgent: Email encontrado: {details['email']}")
                                
                        except Exception as e:
                            logger.warning(f"BrowserScoutAgent: Erro na extração de dados para {name}: {e}")

                        # CAPTURA DE FACHADA via screenshot do painel lateral
                        try:
                            safe_name = re.sub(r'[^a-z0-9]', '', name.lower())[:30]
                            timestamp = int(asyncio.get_event_loop().time())
                            filename = f"facade_{safe_name}_{timestamp}.png"
                            filepath = os.path.join(vistorias_dir, filename)

                            # Screenshot da área do painel lateral à direita
                            side_panel = await page.query_selector("div[role='main']")
                            if side_panel:
                                box = await side_panel.bounding_box()
                                if box:
                                    # Captura a parte superior do painel (foto + info)
                                    await page.screenshot(
                                        path=filepath,
                                        clip={"x": box["x"], "y": box["y"], "width": box["width"], "height": min(box["height"], 600)}
                                    )
                                    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
                                        details['vision_image_url'] = f"/static/vistorias/{filename}"
                                        logger.info(f"BrowserScoutAgent: Fachada capturada para {name}")
                        except Exception as e_img:
                            logger.warning(f"BrowserScoutAgent: Falha na captura de fachada para {name}: {e_img}")

                        lead = {
                            "name": name,
                            "address": details['address'],
                            "phone": details['phone'],
                            "website": details['website'],
                            "social_url": details['social_url'],
                            "booking_url": details['booking_url'],
                            "email": details['email'],
                            "vision_image_url": details['vision_image_url'],
                            "coords": {"lat": details['lat'], "lng": details['lng']} if details['lat'] else None,
                            "source": "Google Maps (Sniper v3.0)",
                            "scanned_at": datetime.now().isoformat()
                        }
                        
                        yielded_count += 1
                        yield lead 
                        
                    except Exception as e:
                        logger.warning(f"BrowserScoutAgent: Erro no card {i}: {e}")
                        continue
                
            except Exception as e:
                logger.error(f"BrowserScoutAgent: Erro crítico Sniper: {e}")
            finally:
                await browser.close()

if __name__ == "__main__":
    agent = BrowserScoutAgent(headless=False)
    async def test():
        async for l in agent.search_leads("Condominios em Jundiai", limit=2):
            print(f"Lead: {l['name']} | Coords: {l['coords']} | Phone: {l['phone']} | Email: {l['email']}")
    asyncio.run(test())
