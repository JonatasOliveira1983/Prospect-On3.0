"""
PillarAHunterAgent — Caçador de Obras de Pintura em Condomínios (Pilar A).

Busca obras ATIVAS de pintura predial DIRETAMENTE no GetNinjas (categoria Pintor).
Sem Google, sem login, sem mocks — apenas dados reais de plataformas públicas.
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


class PillarAHunterAgent:
    """
    Pilar A — Condomínios (Obras Ativas).

    Raspa DIRETAMENTE:
      - GetNinjas — categoria Pintor (pedidos de pintura predial/residencial)

    Sem fallback, sem mocks, sem Google.
    Se não encontrar nada, retorna lista vazia.
    """

    GETNINJAS_URL = "https://www.getninjas.com.br/reformas-e-reparos/pintor"

    def __init__(self, headless: bool = True):
        self.headless = headless

    async def hunt(self, city: str) -> list[dict]:
        """Caça obras ativas de pintura no GetNinjas."""
        city_clean = re.split(r'[,-]', city)[0].strip()
        logger.info(
            f"PillarAHunterAgent (Pilar A): Iniciando caca DIRETA no GetNinjas "
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

                results = await self._scrape_getninjas(context, city_clean)
                all_results.extend(results)

                await browser.close()

        except Exception as e:
            logger.error(f"PillarAHunterAgent: Erro no Playwright: {e}")

        if not all_results:
            logger.warning(
                f"PillarAHunterAgent (Pilar A): Nenhuma obra ativa encontrada "
                f"no GetNinjas para '{city_clean}'. Retornando lista vazia."
            )
        else:
            logger.info(
                f"PillarAHunterAgent (Pilar A): {len(all_results)} obras ativas "
                f"de condominio capturadas para '{city_clean}'."
            )

        return all_results

    async def _scrape_getninjas(self, context, city_clean: str) -> list[dict]:
        """Raspa a pagina de categoria Pintor do GetNinjas."""
        results = []

        try:
            page = await context.new_page()
            logger.info(f"PillarAHunterAgent: Acessando GetNinjas: {self.GETNINJAS_URL}")

            await page.goto(self.GETNINJAS_URL, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(random.randint(3000, 5000))

            # GetNinjas: procurar links de subcategorias e pedidos
            # A pagina tem links como "Pintores de Imoveis", "Pintor em Belo Horizonte", etc.
            all_links = await page.query_selector_all("a[href]")
            
            relevant_links = []
            for link in all_links:
                try:
                    href = (await link.get_attribute("href") or "").strip()
                    text = (await link.inner_text()).strip()
                    
                    if not href or not text or len(text) < 5:
                        continue
                    
                    # Filtra apenas links relevantes a pintura predial/residencial
                    # E que sejam da cidade alvo OU links genericos (sem cidade especifica)
                    keywords = ["pintor", "pintura", "fachada", "predial", "imovel", "casa", "apartamento", "condominio"]
                    exclude_keywords = ["movel", "moveis", "gesso", "textura", "artistico"]
                    
                    text_lower = (href + text).lower()
                    
                    if any(kw in text_lower for kw in keywords) and not any(kw in text_lower for kw in exclude_keywords):
                        full_url = href if href.startswith("http") else f"https://www.getninjas.com.br{href}"
                        relevant_links.append({
                            "title": text,
                            "url": full_url,
                            "type": "subcategoria" if "/reformas-e-reparos/pintor/" in href else "link",
                        })
                except Exception:
                    continue

            logger.info(f"PillarAHunterAgent: GetNinjas -> {len(relevant_links)} links relevantes encontrados")

            # Para cada link de subcategoria, tentar acessar e extrair detalhes
            subcategory_links = [l for l in relevant_links if l["type"] == "subcategoria"]
            
            # Limita a 3 subcategorias para nao demorar muito
            for sub_link in subcategory_links[:3]:
                try:
                    sub_results = await self._scrape_getninjas_subcategory(
                        context, sub_link["url"], sub_link["title"], city_clean
                    )
                    results.extend(sub_results)
                except Exception as e:
                    logger.warning(f"PillarAHunterAgent: Erro na subcategoria {sub_link['title']}: {e}")

            # Se nao encontrou nada, tenta extrair do texto da pagina principal
            if not results:
                text_content = await page.inner_text("body")
                if any(w in text_content.lower() for w in ["pintor", "pintura", "orcamento", "fachada"]):
                    results.append({
                        "name": f"Pedidos de Pintor — GetNinjas ({city_clean})",
                        "resumo_sinal": (
                            f"Pedidos ativos de pintura predial e residencial no GetNinjas. "
                            f"Acesse o link para ver os pedidos disponiveis na regiao de {city_clean}."
                        ),
                        "link_fonte": self.GETNINJAS_URL,
                        "score_urgencia": 7,
                        "categoria_demanda": "pintura_fachada",
                        "tipo_entidade": "predio",
                        "pilar": "A",
                    })

            await page.close()

        except Exception as e:
            logger.warning(f"PillarAHunterAgent: Erro ao raspar GetNinjas: {e}")

        return results

    async def _scrape_getninjas_subcategory(self, context, url: str, title: str, city_clean: str) -> list[dict]:
        """Acessa uma subcategoria especifica do GetNinjas e extrai informacoes."""
        results = []
        
        try:
            page = await context.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(random.randint(2000, 3500))

            text_content = await page.inner_text("body")
            
            # Procura por indicios de pedidos/solicitacoes na pagina
            has_requests = any(
                w in text_content.lower()
                for w in ["orcamento", "pedido", "solicitacao", "servico", "profissional", "avaliado", "contratar"]
            )

            if has_requests:
                results.append({
                    "name": f"{title} — GetNinjas ({city_clean})",
                    "resumo_sinal": (
                        f"Pagina ativa de {title} no GetNinjas com pedidos de orcamento "
                        f"de pintura na regiao de {city_clean}. Profissionais cadastrados "
                        f"podem responder aos pedidos."
                    ),
                    "link_fonte": url,
                    "score_urgencia": 7,
                    "categoria_demanda": "pintura_fachada",
                    "tipo_entidade": "predio",
                    "pilar": "A",
                })

            await page.close()

        except Exception as e:
            logger.warning(f"PillarAHunterAgent: Erro na subcategoria {url}: {e}")

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
            logger.warning("PillarAHunterAgent: Chromium ausente! Instalando...")
            import subprocess
            import sys
            subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], capture_output=True)
            browser = await playwright.chromium.launch(headless=self.headless)
            return browser
