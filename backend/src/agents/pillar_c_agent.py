"""
PillarCHunterAgent — Caçador de Editais de Pintura Predial (Pilar C).

Estratégia híbrida:
  1. requests → DuckDuckGo HTML para descobrir URLs (funciona, Playwright bloqueado pelo DDG)
  2. Playwright → visitar cada URL de edital e extrair detalhes

Dados 100% públicos por lei. Sem mock.
"""
import re
import asyncio
import random
import requests
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
window.chrome = { runtime: {} };
"""

DDG_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "pt-BR,pt;q=0.9",
}

SEARCH_QUERIES = [
    "edital pintura predial licitacao SP 2025 2026",
    "pregao eletronico pintura fachada predio publico SP",
    "contratacao servicos pintura predial orgao publico edital",
    "licitacao manutencao predial pintura fachada SP",
    "concorrencia publica pintura predial edificio SP",
]


class PillarCHunterAgent:
    """Pilar C — Editais Públicos de Pintura Predial."""

    def __init__(self, headless: bool = True):
        self.headless = headless

    async def hunt(self, city: str) -> list[dict]:
        """Caça editais reais com telefone, valor e órgão."""
        city_clean = re.split(r'[,-]', city)[0].strip()
        logger.info(f"PillarCHunterAgent (Pilar C): Caçando editais de pintura para '{city_clean}'...")

        all_results: list[dict] = []
        seen_names = set()

        # Fase 1: Descobrir URLs via DuckDuckGo (requests - funciona, Playwright bloqueado)
        discovered_urls = self._search_ddg(city_clean)
        logger.info(f"PillarCHunterAgent: {len(discovered_urls)} URLs de editais descobertas")

        if not discovered_urls:
            logger.warning("PillarCHunterAgent: Nenhuma URL de edital encontrada.")
            return []

        # Fase 2: Visitar cada URL com Playwright e extrair detalhes
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

                for url in discovered_urls[:8]:
                    if len(all_results) >= 5:
                        break
                    try:
                        detail = await self._extract_bid_details(context, url)
                        if detail and detail.get("name", "")[:80] not in seen_names:
                            seen_names.add(detail.get("name", "")[:80])
                            all_results.append(detail)
                            logger.info(f"PillarCHunterAgent: Edital: {detail.get('name', '')[:80]}")
                    except Exception as e:
                        logger.warning(f"PillarCHunterAgent: Erro ao extrair '{url[:60]}': {e}")

                await browser.close()

        except Exception as e:
            logger.error(f"PillarCHunterAgent: Erro no Playwright: {e}")

        if not all_results:
            logger.warning("PillarCHunterAgent: Nenhum edital encontrado com detalhes.")
        else:
            logger.info(f"PillarCHunterAgent: {len(all_results)} editais capturados.")

        return all_results

    def _search_ddg(self, city: str) -> list[str]:
        """Fase 1: Descobre URLs de editais via DuckDuckGo HTML (requests)."""
        import time
        discovered = set()
        gov_patterns = [
            r'https?://[^\s"\'<>]+\.gov\.br[^\s"\'<>]*',
            r'https?://[^\s"\'<>]+licitac[^\s"\'<>]*',
            r'https?://[^\s"\'<>]+edital[^\s"\'<>]*',
            r'https?://[^\s"\'<>]+pregao[^\s"\'<>]*',
            r'https?://[^\s"\'<>]+compras[^\s"\'<>]*',
            r'https?://[^\s"\'<>]+prefeitura[^\s"\'<>]*',
            r'https?://[^\s"\'<>]+contratac[^\s"\'<>]*',
            r'https?://[^\s"\'<>]+pncp[^\s"\'<>]*',
        ]

        for query in SEARCH_QUERIES:
            if len(discovered) >= 10:
                break

            full_query = f"{query} {city}"
            search_url = f"https://html.duckduckgo.com/html/?q={full_query.replace(' ', '+')}"

            try:
                time.sleep(2)  # Rate limit
                resp = requests.get(search_url, headers=DDG_HEADERS, timeout=15)
                if resp.status_code not in (200, 202):
                    continue

                html = resp.text

                # Estrategia 1: Extrair todos os hrefs de links
                all_hrefs = re.findall(r'href="(https?://[^"]+)"', html)
                all_hrefs += re.findall(r"href='(https?://[^']+)'", html)

                for h in all_hrefs:
                    h = h.strip()
                    if h.startswith("http") and "duckduckgo" not in h and "google" not in h:
                        for pat in gov_patterns:
                            if re.search(pat, h, re.IGNORECASE):
                                discovered.add(h)
                                break

                # Estrategia 2: Extrair links das classes result__url e result__a
                result_links = re.findall(r'class="result__a"[^>]*href="(https?://[^"]+)"', html)
                result_links += re.findall(r"class='result__a'[^>]*href='(https?://[^']+)'", html)
                for link in result_links:
                    link = link.strip()
                    if link.startswith("http") and "duckduckgo" not in link:
                        for pat in gov_patterns:
                            if re.search(pat, link, re.IGNORECASE):
                                discovered.add(link)
                                break

                # Estrategia 3: Extrair display URLs e montar URL completa
                display_urls = re.findall(r'class="result__url"[^>]*>([^<]+)', html)
                display_urls += re.findall(r"class='result__url'[^>]*>([^<]+)", html)
                for d in display_urls:
                    d = d.strip()
                    if "." in d and len(d) > 5:
                        full = f"https://{d}" if not d.startswith("http") else d
                        for pat in gov_patterns:
                            if re.search(pat, full, re.IGNORECASE):
                                discovered.add(full)
                                break

                # Estrategia 4: Fallback - se nada encontrado, busca qualquer URL com gov.br
                if not discovered:
                    any_gov = re.findall(r'https?://[^\s"\'<>]+\.gov\.br[^\s"\'<>]*', html)
                    for g in any_gov:
                        discovered.add(g)

            except Exception as e:
                logger.warning(f"PillarCHunterAgent: Erro DDG '{query[:40]}': {e}")

        return list(discovered)

    async def _extract_bid_details(self, context, url: str) -> dict | None:
        """Visita a pagina do edital e extrai telefone, email, valor, orgao."""
        page = await context.new_page()

        try:
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=25000)
            except Exception:
                await page.close()
                return None

            await page.wait_for_timeout(random.randint(2500, 4500))

            text = await page.inner_text("body")
            text_lower = text.lower()

            # So continua se parece edital de pintura/reforma
            paint_kw = ["pintura", "fachada", "reforma", "predial", "manutencao",
                       "pregao", "licitacao", "edital", "concorrencia"]
            if not any(kw in text_lower for kw in paint_kw):
                await page.close()
                return None

            # ---- EXTRACAO ----

            # Telefones
            phones_raw = re.findall(r'(?:\(?\d{2}\)?\s*)?(?:\d{4,5}[-\s]?\d{4})', text)
            valid_phones = [p.strip() for p in phones_raw if 8 <= len(re.sub(r'\D', '', p)) <= 11][:3]

            # Emails
            emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w{2,}', text)[:2]

            # Orgao
            agency = ""
            agency_pats = [
                r'(?:Orgao|Orgao\s*Solicitante|Contratante|Entidade|UNIDADE\s*COMPRADORA)\s*:\s*([^\n]{5,120})',
                r'(?:SECRETARIA|PREFEITURA|MINISTERIO|UNIVERSIDADE|HOSPITAL|INSTITUTO|FUNDACAO|AUTARQUIA|TRIBUNAL)\s+(?:MUNICIPAL|ESTADUAL|FEDERAL|DE\s+JUSTICA|REGIONAL|DO\s+ESTADO)?\s*(?:DE|DA|DO|DOS|DAS)?\s+([^\n]{3,80})',
            ]
            for pat in agency_pats:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    raw = m.group(0).strip()
                    raw = re.sub(r'^(?:Orgao|Contratante|Entidade)\s*:\s*', '', raw, flags=re.IGNORECASE)
                    agency = raw[:100]
                    break

            # Valor
            value = ""
            val_pats = [
                r'(?:Valor\s*(?:Estimado|Total|Maximo|Global)?|Orcamento|VALOR)\s*:?\s*R\$\s*([\d\.,]+)',
                r'R\$\s*([\d\.,]+)\s*(?:\([^)]*(?:estimado|previsto|orcado|total)[^)]*\))',
                r'R\$\s*([\d\.]+,\d{2})',
            ]
            for pat in val_pats:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    value = f"R$ {m.group(1)}"
                    break

            # Prazo
            deadline = ""
            prazo_pats = [
                r'(?:Prazo\s*(?:de\s*)?(?:Execucao|Entrega|Vigencia|Contrato)?)\s*:?\s*(\d+)\s*(dias|meses|mes)',
                r'(?:ate|data\s*limite)\s*(\d{2}/\d{2}/\d{4})',
            ]
            for pat in prazo_pats:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    deadline = m.group(0)[:50].strip()
                    break

            # Endereco
            address = ""
            addr_pats = [
                r'(?:Endereco|Local\s*de\s*Execucao|Local)\s*:\s*([^\n]{10,150})',
                r'(?:Rua|Avenida|Av\.|Alameda|Praca|Rodovia)\s+([^\n,]{5,100})',
            ]
            for pat in addr_pats:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    address = m.group(0).strip()[:150]
                    break

            # Urgencia
            urgency = 7
            if "urgente" in text_lower or "emergencial" in text_lower:
                urgency = 9
            elif "pregao" in text_lower:
                urgency = 8
            elif "concorrencia" in text_lower:
                urgency = 8
            elif "edital" in text_lower:
                urgency = 7

            # ---- MONTA LEAD ----
            phone = valid_phones[0] if valid_phones else "N/D"
            email = emails[0] if emails else "N/D"

            page_title = await page.title()
            name = page_title[:120] if page_title and len(page_title) > 5 else ""
            if not name and agency:
                name = f"Edital — {agency}"[:120]
            if not name:
                name = "Edital de Pintura Predial — Licitação Pública"[:120]

            desc_parts = []
            if agency:
                desc_parts.append(f"Órgão: {agency}")
            if value:
                desc_parts.append(f"Valor: {value}")
            if deadline:
                desc_parts.append(f"Prazo: {deadline}")
            if address:
                desc_parts.append(f"Local: {address}")
            if phone != "N/D":
                desc_parts.append(f"Tel: {phone}")
            if email != "N/D":
                desc_parts.append(f"Email: {email}")

            description = " | ".join(desc_parts) if desc_parts else text[:400]

            await page.close()

            return {
                "name": name,
                "resumo_sinal": description[:500],
                "link_fonte": url,
                "score_urgencia": urgency,
                "categoria_demanda": "reforma_geral",
                "tipo_entidade": "predio",
                "pilar": "C",
                "valor_estimado": value,
                "prazo": deadline,
                "orgao": agency,
                "contato": phone,
                "phone": phone,
                "email": email,
                "address": address,
            }

        except Exception:
            await page.close()
            return None

    async def _launch_browser(self, playwright):
        try:
            return await playwright.chromium.launch(
                headless=self.headless,
                args=["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-dev-shm-usage"],
            )
        except Exception:
            logger.warning("PillarCHunterAgent: Chromium ausente! Instalando...")
            import subprocess
            import sys
            subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], capture_output=True)
            return await playwright.chromium.launch(headless=self.headless)
