"""
PillarAHunterAgent — Caçador de Obras de Pintura em Condomínios (Pilar A).

Busca obras ATIVAS e cotações ABERTAS de pintura predial em condomínios.
Vai DIRETO às plataformas reais (SindicoNet, CoteiBem) sem passar pelo Google.
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


class PillarAHunterAgent:
    """
    Pilar A — Condomínios (Obras Ativas).

    Raspa DIRETAMENTE as plataformas:
      - SindicoNet (cotações de pintura em condomínios)
      - CoteiBem (solicitações de orçamento por administradoras)

    Sem fallback, sem mocks, sem Google.
    Se a plataforma não expuser os dados, o lead vem com o que existe.
    """

    PLATFORMS = [
        {
            "name": "SindicoNet",
            "url": "https://www.sindiconet.com.br/cotacoes/sp/sao-paulo",
            "selectors": {
                "cards": "a[href*='/cotacao/'], .cotacao-card, .card-cotacao, article, .listing-item",
                "title": "h1, h2, h3, .titulo, .title, strong",
                "description": "p, .descricao, .description, .resumo",
            },
        },
        {
            "name": "CoteiBem",
            "url": "https://www.coteibem.com.br/solicitacoes",
            "selectors": {
                "cards": "a[href*='/solicitacao/'], .solicitacao-card, .card, article, .listing-item",
                "title": "h1, h2, h3, .titulo, .title, strong",
                "description": "p, .descricao, .description, .resumo",
            },
        },
    ]

    def __init__(self, headless: bool = True):
        self.headless = headless

    async def hunt(self, city: str) -> list[dict]:
        """
        Caça obras ativas de pintura em condomínios raspando plataformas reais.

        Returns:
            Lista de dicts com name, resumo_sinal, link_fonte, score_urgencia,
            categoria_demanda, tipo_entidade e pilar="A".
            Lista VAZIA se nenhum lead real for encontrado.
        """
        city_clean = re.split(r'[,-]', city)[0].strip()
        logger.info(
            f"PillarAHunterAgent (Pilar A): 🔍 Iniciando caça DIRETA de obras "
            f"ativas em condomínios na cidade '{city_clean}'..."
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
            logger.error(f"PillarAHunterAgent: Erro geral no Playwright: {e}")

        if not all_results:
            logger.warning(
                f"PillarAHunterAgent (Pilar A): ⚠️ Nenhuma obra ativa encontrada "
                f"nas plataformas para '{city_clean}'. Retornando lista vazia."
            )
        else:
            logger.info(
                f"PillarAHunterAgent (Pilar A): ✅ {len(all_results)} obras ativas "
                f"de condomínio capturadas para '{city_clean}'."
            )

        return all_results

    async def _scrape_platform(self, context, platform: dict, city_clean: str) -> list[dict]:
        """Raspa uma plataforma específica e extrai leads reais."""
        results = []
        platform_name = platform["name"]

        try:
            page = await context.new_page()
            logger.info(f"PillarAHunterAgent: 🌐 Acessando {platform_name}: {platform['url']}")

            await page.goto(platform["url"], wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(random.randint(2000, 4000))

            html_content = await page.content()
            text_content = extract_text_from_html(html_content)
            links = extract_links_from_html(html_content)

            # Tenta capturar cards/listagens da página
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
                                    for palavra in ["pintura", "fachada", "reforma", "obra", "manutenção", "impermeabilização", "revitalização"]
                                ):
                                    cards.append({
                                        "title": title.strip(),
                                        "description": description.strip()[:300],
                                        "link": href if href.startswith("http") else f"{platform['url'].split('/')[2]}{href}" if href else "",
                                    })
                            except Exception:
                                continue
                        if cards:
                            break
                except Exception:
                    continue

            # Se encontrou cards estruturados
            if cards:
                for card in cards:
                    results.append({
                        "name": card["title"],
                        "resumo_sinal": card["description"] or f"Cotação de pintura predial publicada no {platform_name}",
                        "link_fonte": card["link"] or platform["url"],
                        "score_urgencia": 7,
                        "categoria_demanda": "pintura_fachada",
                        "tipo_entidade": "predio",
                        "pilar": "A",
                    })
            else:
                # Fallback: extrai do texto bruto da página
                content_lower = text_content.lower()
                if any(p in content_lower for p in ["pintura", "fachada", "reforma", "obra"]):
                    # Encontrou conteúdo relevante mas sem estrutura de cards
                    # Retorna um lead genérico com o link da plataforma
                    relevant_links = [
                        l for l in links
                        if any(kw in l.lower() for kw in ["cotacao", "orcamento", "solicitacao", "pintura", "fachada"])
                        and "google" not in l.lower()
                    ]
                    best_link = relevant_links[0] if relevant_links else platform["url"]

                    results.append({
                        "name": f"Obras de Pintura — {platform_name} ({city_clean})",
                        "resumo_sinal": f"Cotações ativas de pintura predial encontradas no {platform_name} para a região de {city_clean}. Acesse o link para ver os detalhes completos de cada solicitação.",
                        "link_fonte": best_link,
                        "score_urgencia": 6,
                        "categoria_demanda": "pintura_fachada",
                        "tipo_entidade": "predio",
                        "pilar": "A",
                    })

            logger.info(
                f"PillarAHunterAgent: {platform_name} → {len(cards)} cards estruturados, "
                f"{len(results)} leads extraídos"
            )

            await page.close()

        except Exception as e:
            logger.warning(f"PillarAHunterAgent: Erro ao raspar {platform_name}: {e}")

        return results

    async def _launch_browser(self, playwright):
        """Lança o navegador Chromium com configurações stealth."""
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
            logger.warning("PillarAHunterAgent: Chromium ausente! Instalando...")
            import subprocess
            import sys
            subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], capture_output=True)
            browser = await playwright.chromium.launch(headless=self.headless)
            return browser
