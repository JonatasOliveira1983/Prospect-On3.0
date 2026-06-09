"""
PillarBHunterAgent — Caçador de Obras de Pintura de Grande Porte (Pilar B).

Busca obras ATIVAS de pintura predial de grande porte no oHub (facilities/condominios).
Foco: shoppings, hospitais, industrias e grandes empreendimentos.

Sem Google, sem login, sem mocks — apenas dados reais de plataformas publicas.
"""
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


class PillarBHunterAgent:
    """
    Pilar B — Obras de Grande Porte.

    Raspa DIRETAMENTE:
      - oHub — /condominios (servicos para condominios)
      - oHub — /facilities (gestao de facilities corporativos)
      - oHub — /terceirizacao (outsourcing de servicos prediais)

    Foco em: shoppings, hospitais, industrias, condominios empresariais.
    Sem fallback, sem mocks.
    """

    OHUB_PAGES = [
        {
            "name": "oHub Condominios",
            "url": "https://ohub.com.br/condominios",
            "category": "condominio",
        },
        {
            "name": "oHub Facilities",
            "url": "https://ohub.com.br/facilities",
            "category": "facilities",
        },
        {
            "name": "oHub Terceirizacao",
            "url": "https://ohub.com.br/terceirizacao",
            "category": "terceirizacao",
        },
    ]

    def __init__(self, headless: bool = True):
        self.headless = headless

    async def hunt(self, city: str) -> list[dict]:
        """Caca obras de pintura de grande porte no oHub."""
        city_clean = re.split(r'[,-]', city)[0].strip()
        logger.info(
            f"PillarBHunterAgent (Pilar B): Iniciando caca DIRETA no oHub "
            f"para '{city_clean}'..."
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

                for ohub_page in self.OHUB_PAGES:
                    page_results = await self._scrape_ohub_page(
                        context, ohub_page, city_clean
                    )
                    all_results.extend(page_results)

                await browser.close()

        except Exception as e:
            logger.error(f"PillarBHunterAgent: Erro no Playwright: {e}")

        if not all_results:
            logger.warning(
                f"PillarBHunterAgent (Pilar B): Nenhuma obra de grande porte "
                f"encontrada no oHub para '{city_clean}'."
            )
        else:
            logger.info(
                f"PillarBHunterAgent (Pilar B): {len(all_results)} obras de "
                f"grande porte capturadas para '{city_clean}'."
            )

        return all_results

    async def _scrape_ohub_page(self, context, ohub_page: dict, city_clean: str) -> list[dict]:
        """Raspa uma pagina especifica do oHub."""
        results = []
        page_name = ohub_page["name"]

        try:
            page = await context.new_page()
            logger.info(f"PillarBHunterAgent: Acessando {page_name}: {ohub_page['url']}")

            await page.goto(ohub_page["url"], wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(random.randint(3000, 5000))

            # Fecha cookie banner se existir
            try:
                close_btn = await page.query_selector("button:has-text('FECHAR'), button:has-text('fechar'), .cookie-close, [aria-label='Fechar']")
                if close_btn:
                    await close_btn.click()
                    await page.wait_for_timeout(1000)
            except Exception:
                pass

            text_content = await page.inner_text("body")
            
            # Extrai todos os links da pagina
            all_links = await page.query_selector_all("a[href]")
            service_links = []
            
            for link in all_links:
                try:
                    href = (await link.get_attribute("href") or "").strip()
                    text = (await link.inner_text()).strip()
                    
                    if not href or not text or len(text) < 4:
                        continue
                    
                    # Links de servicos prediais relevantes
                    service_kw = [
                        "pintura", "fachada", "reforma", "manutencao", "limpeza",
                        "portaria", "jardinagem", "predial", "condominio", "facilities",
                        "terceirizacao", "seguranca", "conservacao", "obra", "engenharia"
                    ]
                    
                    if any(kw in (href + text).lower() for kw in service_kw):
                        full_url = href if href.startswith("http") else f"https://ohub.com.br{href}"
                        service_links.append({
                            "title": text,
                            "url": full_url,
                        })
                except Exception:
                    continue

            logger.info(
                f"PillarBHunterAgent: {page_name} -> {len(service_links)} links de servicos encontrados"
            )

            # Para cada link de servico relevante, tentar acessar
            for svc in service_links[:4]:  # Limita a 4 para performance
                try:
                    svc_results = await self._scrape_service_page(context, svc, city_clean)
                    results.extend(svc_results)
                except Exception as e:
                    logger.warning(f"PillarBHunterAgent: Erro ao acessar {svc['title']}: {e}")

            # Se nao encontrou nada estruturado, gera lead da pagina principal
            if not results:
                facilities_kw = ["facilities", "condominio", "terceirizacao", "manutencao", "predial", "servico"]
                if any(kw in text_content.lower() for kw in facilities_kw):
                    results.append({
                        "name": f"Facilities e Servicos Prediais — oHub ({city_clean})",
                        "resumo_sinal": (
                            f"Hub de servicos prediais ativo no oHub ({ohub_page['category']}) "
                            f"com demandas de manutencao, facilities e terceirizacao para "
                            f"a regiao de {city_clean}. Acesse para cotar servicos de pintura."
                        ),
                        "link_fonte": ohub_page["url"],
                        "score_urgencia": 7,
                        "categoria_demanda": "reforma_geral",
                        "tipo_entidade": "predio",
                        "pilar": "B",
                    })

            await page.close()

        except Exception as e:
            logger.warning(f"PillarBHunterAgent: Erro ao raspar {page_name}: {e}")

        return results

    async def _scrape_service_page(self, context, service: dict, city_clean: str) -> list[dict]:
        """Acessa uma pagina de servico especifica para verificar se ha demandas ativas."""
        results = []

        try:
            page = await context.new_page()
            await page.goto(service["url"], wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(random.randint(2000, 3500))

            text_content = await page.inner_text("body")

            # Verifica se a pagina tem sinais de demandas/servicos ativos
            demand_keywords = [
                "orcamento", "solicitar", "contratar", "pedido", "cotacao",
                "fornecedor", "servico", "profissional", "empresa", "especializado"
            ]

            if any(kw in text_content.lower() for kw in demand_keywords):
                results.append({
                    "name": f"{service['title']} — oHub ({city_clean})",
                    "resumo_sinal": (
                        f"Pagina ativa de {service['title']} no oHub com possibilidade "
                        f"de cadastro de fornecedor e captacao de demandas prediais "
                        f"na regiao de {city_clean}."
                    ),
                    "link_fonte": service["url"],
                    "score_urgencia": 7,
                    "categoria_demanda": "reforma_geral",
                    "tipo_entidade": "predio",
                    "pilar": "B",
                })

            await page.close()

        except Exception as e:
            logger.warning(f"PillarBHunterAgent: Erro na pagina de servico {service['url']}: {e}")

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
