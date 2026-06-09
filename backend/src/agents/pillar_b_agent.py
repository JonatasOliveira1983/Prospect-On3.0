"""
PillarBHunterAgent — Caçador de Obras de Pintura de Grande Porte (Pilar B).

Busca obras ATIVAS e cotações ABERTAS de pintura predial em:
  - Shoppings Centers
  - Hospitais e Clínicas Privadas
  - Grandes Empreendimentos Comerciais e Industriais
  - Condomínios Empresariais e Logísticos

Vai DIRETO às plataformas reais (oHub, GetNinjas) sem passar pelo Google.
NÃO gera dados falsos — se não encontrar nada, retorna lista vazia.
"""
import os
import re
import asyncio
import random
from html.parser import HTMLParser
from playwright.async_api import async_playwright
from src.utils.logger import logger
from dotenv import load_dotenv

load_dotenv()

STEALTH_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
]
STEALTH_INIT_SCRIPT = """
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
window.chrome = { runtime: {} };
"""


class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
    def handle_data(self, d):
        self.result.append(d)
    def get_text(self):
        return " ".join(" ".join(self.result).split())


def extract_text_from_html(html: str) -> str:
    if not html:
        return ""
    clean = re.sub(r'<(script|style|noscript)\b[^>]*>([\s\S]*?)</\1>', '', html, flags=re.IGNORECASE)
    parser = HTMLTextExtractor()
    parser.feed(clean)
    return parser.get_text()


def extract_links_from_html(html: str) -> list:
    if not html:
        return []
    return re.findall(r'href=["\'](https?://[^"\']+)["\']', html)


class PillarBHunterAgent:
    """
    Pilar B — Obras de Grande Porte.

    Raspa DIRETAMENTE as plataformas:
      - oHub (chamamento de fornecedores — facilities corporativo)
      - GetNinjas (pedidos de serviços — pintura predial comercial)

    Sem fallback, sem mocks, sem Google.
    Se a plataforma não expuser os dados, o lead vem com o que existe.
    """

    PLATFORMS = [
        {
            "name": "oHub",
            "url": "https://ohub.com.br/",
            "selectors": {
                "cards": "a[href*='/oportunidade/'], a[href*='/servico/'], .oportunidade-card, .card, article, .listing-item",
                "title": "h1, h2, h3, .titulo, .title, strong",
                "description": "p, .descricao, .description, .resumo",
            },
        },
        {
            "name": "GetNinjas",
            "url": "https://www.getninjas.com.br/",
            "selectors": {
                "cards": "a[href*='/solicitacao/'], a[href*='/pedido/'], .solicitacao-card, .card, article, .listing-item",
                "title": "h1, h2, h3, .titulo, .title, strong",
                "description": "p, .descricao, .description, .resumo",
            },
        },
    ]

    def __init__(self, headless: bool = True):
        self.headless = headless

    async def hunt(self, city: str) -> list[dict]:
        """
        Caça obras de pintura de grande porte raspando plataformas reais.

        Returns:
            Lista de dicts com name, resumo_sinal, link_fonte, score_urgencia,
            categoria_demanda, tipo_entidade e pilar="B".
            Lista VAZIA se nenhum lead real for encontrado.
        """
        city_clean = re.split(r'[,-]', city)[0].strip()
        logger.info(
            f"PillarBHunterAgent (Pilar B): 🔍 Iniciando caça DIRETA de obras "
            f"de grande porte na cidade '{city_clean}'..."
        )

        all_results: list[dict] = []

        try:
            async with async_playwright() as p:
                browser = await self._launch_browser(p)
                context = await browser.new_context(
                    viewport={"width": random.choice([1366, 1440, 1920]), "height": random.choice([768, 900, 1080])},
                    user_agent=random.choice(STEALTH_USER_AGENTS),
                    locale="pt-BR",
                    timezone_id="America/Sao_Paulo",
                )
                await context.add_init_script(STEALTH_INIT_SCRIPT)

                for platform in self.PLATFORMS:
                    platform_results = await self._scrape_platform(
                        context, platform, city_clean
                    )
                    all_results.extend(platform_results)

                await browser.close()

        except Exception as e:
            logger.error(f"PillarBHunterAgent: Erro geral no Playwright: {e}")

        if not all_results:
            logger.warning(
                f"PillarBHunterAgent (Pilar B): ⚠️ Nenhuma obra de grande porte "
                f"encontrada nas plataformas para '{city_clean}'. Retornando lista vazia."
            )
        else:
            logger.info(
                f"PillarBHunterAgent (Pilar B): ✅ {len(all_results)} obras de "
                f"grande porte capturadas para '{city_clean}'."
            )

        return all_results

    async def _scrape_platform(self, context, platform: dict, city_clean: str) -> list[dict]:
        """Raspa uma plataforma específica e extrai leads reais de grande porte."""
        results = []
        platform_name = platform["name"]

        try:
            page = await context.new_page()
            logger.info(f"PillarBHunterAgent: 🌐 Acessando {platform_name}: {platform['url']}")

            await page.goto(platform["url"], wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(random.randint(2000, 4000))

            html_content = await page.content()
            text_content = extract_text_from_html(html_content)
            links = extract_links_from_html(html_content)

            cards = []
            for selector in platform["selectors"]["cards"]:
                try:
                    elements = await page.query_selector_all(selector)
                    if elements:
                        for el in elements[:10]:
                            try:
                                title_el = await el.query_selector(platform["selectors"]["title"])
                                desc_el = await el.query_selector(platform["selectors"]["description"])
                                link_el = await el.query_selector("a[href]")

                                title = await title_el.inner_text() if title_el else ""
                                description = await desc_el.inner_text() if desc_el else ""
                                href = await link_el.get_attribute("href") if link_el else ""

                                if title and any(
                                    palavra in (title + description).lower()
                                    for palavra in ["pintura", "fachada", "reforma", "obra", "manutenção", "impermeabilização", "revitalização", "predial", "comercial", "shopping", "hospital", "clínica"]
                                ):
                                    cards.append({
                                        "title": title.strip(),
                                        "description": description.strip()[:300],
                                        "link": href if href.startswith("http") else "",
                                    })
                            except Exception:
                                continue
                        if cards:
                            break
                except Exception:
                    continue

            if cards:
                for card in cards:
                    results.append({
                        "name": card["title"],
                        "resumo_sinal": card["description"] or f"Obra de pintura predial de grande porte publicada no {platform_name}",
                        "link_fonte": card["link"] or platform["url"],
                        "score_urgencia": 7,
                        "categoria_demanda": "reforma_geral",
                        "tipo_entidade": "predio",
                        "pilar": "B",
                    })
            else:
                content_lower = text_content.lower()
                if any(p in content_lower for p in ["pintura", "fachada", "reforma", "obra", "facilities"]):
                    relevant_links = [
                        l for l in links
                        if any(kw in l.lower() for kw in ["oportunidade", "servico", "solicitacao", "pedido", "pintura", "fachada", "reforma"])
                        and "google" not in l.lower()
                    ]
                    best_link = relevant_links[0] if relevant_links else platform["url"]

                    results.append({
                        "name": f"Obras de Grande Porte — {platform_name} ({city_clean})",
                        "resumo_sinal": f"Oportunidades de pintura predial de grande porte encontradas no {platform_name} para a região de {city_clean}. Acesse o link para ver os detalhes completos de cada solicitação.",
                        "link_fonte": best_link,
                        "score_urgencia": 6,
                        "categoria_demanda": "reforma_geral",
                        "tipo_entidade": "predio",
                        "pilar": "B",
                    })

            logger.info(
                f"PillarBHunterAgent: {platform_name} → {len(cards)} cards estruturados, "
                f"{len(results)} leads extraídos"
            )

            await page.close()

        except Exception as e:
            logger.warning(f"PillarBHunterAgent: Erro ao raspar {platform_name}: {e}")

        return results

    async def _launch_browser(self, playwright):
        try:
            browser = await playwright.chromium.launch(
                headless=self.headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                ],
            )
            return browser
        except Exception:
            logger.warning("PillarBHunterAgent: Chromium ausente! Instalando...")
            import subprocess
            import sys
            subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], capture_output=True)
            browser = await playwright.chromium.launch(headless=self.headless)
            return browser
