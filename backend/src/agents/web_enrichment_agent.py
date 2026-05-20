import os
import json
import re
import asyncio
import random
from html.parser import HTMLParser
from playwright.async_api import async_playwright
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.utils.deepseek_client import DeepSeekClient
from dotenv import load_dotenv

load_dotenv()

# --- User agents reais do Chrome 124+ ---
STEALTH_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
]

STEALTH_VIEWPORTS = [
    {"width": 1366, "height": 768},
    {"width": 1440, "height": 900},
    {"width": 1920, "height": 1080},
    {"width": 1280, "height": 800},
]

# Script de inicialização que desativa flags de automação detectáveis por sites
STEALTH_INIT_SCRIPT = """
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en-US', 'en'] });
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
window.chrome = { runtime: {} };
Object.defineProperty(navigator, 'permissions', {
  get: () => ({ query: () => Promise.resolve({ state: 'granted' }) })
});
"""

class HTMLTextExtractor(HTMLParser):
    """
    Parser nativo de HTML para extração de texto visível.
    Utiliza apenas a biblioteca padrão do Python, sendo 100% imune a erros de execução do JS no navegador.
    """
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
    html_clean = re.sub(r'<(script|style|noscript)\b[^>]*>([\s\S]*?)</\1>', '', html, flags=re.IGNORECASE)
    parser = HTMLTextExtractor()
    parser.feed(html_clean)
    return parser.get_text()

def extract_links_from_html(html: str) -> list:
    if not html:
        return []
    return re.findall(r"""href=["\\'](https?://[^\"\\']+)["\\'']""", html)


class WebEnrichmentAgent:
    """
    WebEnrichmentAgent: O Detetive Web do Sniper v4.0.
    Opera como extensão de navegador real:
    - Navega no Google Search via Playwright STEALTH (sem Bing, sem API paga)
    - Navega no site oficial do lead quando disponível
    - DeepSeek analisa o texto capturado e extrai contatos
    """
    def __init__(self, headless=True):
        self.headless = headless
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.monitor = UsageMonitor()
        self.client = DeepSeekClient(api_key=self.api_key) if self.api_key else None
        
        self.social_regex = {
            "instagram": r"instagram\.com/[a-zA-Z0-9_\-\.]+",
            "facebook": r"facebook\.com/[a-zA-Z0-9_\-\.]+",
            "linkedin": r"linkedin\.com/(?:company|in)/[a-zA-Z0-9_\-\.]+"
        }
        
        self.email_regex = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'

    async def _launch_stealth_browser(self, p):
        """Lança o Chromium simulando um usuário real — sem flags de automação detectáveis."""
        try:
            browser = await p.chromium.launch(
                headless=self.headless,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars",
                    "--window-size=1440,900",
                ]
            )
        except Exception as launch_err:
            if "playwright install" in str(launch_err) or "Executable doesn't exist" in str(launch_err):
                logger.warning("WebEnrichmentAgent: Executável do navegador ausente. Instalando Chromium sob demanda...")
                import subprocess, sys
                subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], capture_output=True)
                browser = await p.chromium.launch(
                    headless=self.headless,
                    args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"]
                )
            else:
                raise launch_err

        viewport = random.choice(STEALTH_VIEWPORTS)
        user_agent = random.choice(STEALTH_USER_AGENTS)
        context = await browser.new_context(
            viewport=viewport,
            user_agent=user_agent,
            locale="pt-BR",
            timezone_id="America/Sao_Paulo",
        )
        # Injeta o script stealth antes de qualquer página carregar
        await context.add_init_script(STEALTH_INIT_SCRIPT)
        return browser, context

    async def enrich_lead(self, lead: dict) -> dict:
        """
        Analisa o lead e realiza enriquecimento de contatos via web.
        """
        name = lead.get("name", "")
        website = lead.get("website", "N/D")
        email = lead.get("email", "N/D")
        phone = lead.get("phone", "N/D")
        whatsapp = lead.get("whatsapp", "N/D")
        social_url = lead.get("social_url", "N/D")
        
        if email != "N/D" and phone != "N/D" and whatsapp != "N/D" and social_url != "N/D":
            logger.info(f"WebEnrichmentAgent: '{name}' já possui contatos completos. Pulando.")
            return lead

        logger.info(f"WebEnrichmentAgent: Iniciando enriquecimento web para '{name}'...")
        
        # Estratégia 1: Se tiver website real, raspa diretamente
        if website and website != "N/D" and "google.com" not in website.lower() and website.startswith("http"):
            lead = await self._scrape_website(lead, website)
        
        # Estratégia 2: Google Search via Playwright stealth (sem Bing, sem API)
        if lead.get("email", "N/D") == "N/D" or lead.get("phone", "N/D") == "N/D":
            lead = await self._search_google_for_contacts(lead)
            
        return lead

    async def _scrape_website(self, lead: dict, url: str) -> dict:
        """
        Navega no website do lead para extrair contatos — Playwright stealth.
        """
        name = lead.get("name", "")
        logger.info(f"WebEnrichmentAgent: Raspando o website oficial '{url}' de '{name}'...")
        
        async with async_playwright() as p:
            try:
                browser, context = await self._launch_stealth_browser(p)
                page = await context.new_page()
                
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(random.randint(2000, 4000))
                
                html_content = await page.content()
                raw_text = extract_text_from_html(html_content)
                hrefs = extract_links_from_html(html_content)
                
                await browser.close()
                return self._parse_extracted_content(lead, raw_text, hrefs)
                
            except Exception as e:
                logger.warning(f"WebEnrichmentAgent: Falha ao raspar website '{url}': {e}")
                try:
                    await browser.close()
                except: pass
                return lead

    async def _search_google_for_contacts(self, lead: dict) -> dict:
        """
        Navega no Google Search (como extensão real, sem API) para encontrar
        email, telefone, CNPJ e contatos do lead.
        DeepSeek analisa os snippets retornados.
        """
        name = lead.get("name", "")
        address = lead.get("address", "")
        city = lead.get("city") or "São Paulo"
        if "," in address:
            parts = address.split(",")
            if len(parts) >= 3:
                city = parts[-2].strip()

        search_query = f'"{name}" {city} contato email telefone CNPJ sindico administradora'
        encoded_query = search_query.replace(" ", "+").replace('"', '%22')
        google_url = f"https://www.google.com/search?q={encoded_query}&hl=pt-BR&gl=BR"
        
        logger.info(f"WebEnrichmentAgent: Navegando no Google para contatos de '{name}'...")
        
        async with async_playwright() as p:
            try:
                browser, context = await self._launch_stealth_browser(p)
                page = await context.new_page()
                
                # Abre o Google Search como usuário real
                await page.goto(google_url, wait_until="domcontentloaded", timeout=30000)
                
                # Delay humano antes de capturar o conteúdo
                await page.wait_for_timeout(random.randint(2500, 4500))
                
                # Tenta clicar em "Aceitar" nos cookies do Google se aparecer
                try:
                    accept_btn = await page.query_selector("button[id='L2AGLb'], button[jsname='b3VHJd']")
                    if accept_btn:
                        await accept_btn.click()
                        await page.wait_for_timeout(1000)
                except: pass
                
                # Captura os snippets de resultados do Google
                html_content = await page.content()
                raw_text = extract_text_from_html(html_content)
                hrefs = extract_links_from_html(html_content)

                await browser.close()
                
                logger.info(f"WebEnrichmentAgent:    🔥 [Google Search] Texto capturado: {len(raw_text)} chars | Links: {len(hrefs)}")
                return self._parse_extracted_content(lead, raw_text, hrefs)
                
            except Exception as e:
                logger.warning(f"WebEnrichmentAgent: Falha na busca Google para '{name}': {e}")
                try:
                    await browser.close()
                except: pass
                return lead

    def _parse_extracted_content(self, lead: dict, raw_text: str, hrefs: list) -> dict:
        """
        Envia o texto bruto raspado ao DeepSeek para identificar e extrair
        novos contatos comerciais válidos.
        """
        if not self.client:
            logger.warning("WebEnrichmentAgent: Cliente DeepSeek indisponível. Usando regex local.")
            return self._fallback_parse(lead, raw_text, hrefs)

        name = lead.get("name", "")
        hrefs_str = "\n".join(hrefs[:20])
        
        prompt = f"""
Você é o WebEnrichmentAgent (Detetive Web) da Otto Pinturas.
Sua missão é ler o TEXTO BRUTO capturado via Google Search de um condomínio e extrair contatos.

DADOS ATUAIS DO LEAD:
- Nome: {name}
- Endereço: {lead.get("address")}
- Telefone atual: {lead.get("phone")}
- Email atual: {lead.get("email")}

TEXTO CAPTURADO DO GOOGLE (BRUTO):
\"\"\"{raw_text[:8000]}\"\"\"

LINKS ENCONTRADOS:
\"\"\"{hrefs_str}\"\"\"

INSTRUÇÕES:
1. Identifique e-mails corporativos válidos (sindico@, contato@, administracao@, etc).
2. Identifique telefones e WhatsApp com DDD brasileiro.
3. Identifique CNPJ do condomínio (formato XX.XXX.XXX/XXXX-XX).
4. Identifique o site oficial real do condomínio ou da administradora.
5. Identifique redes sociais (Instagram, Facebook).
6. NÃO invente dados — apenas retorne o que estiver no texto.

Responda APENAS JSON puro (sem markdown, sem comentários):
{{
    "website": "URL oficial ou null",
    "telefones": ["apenas dígitos com DDD"],
    "whatsapp": "celular com DDD ou null",
    "email": "e-mail válido ou null",
    "cnpj": "CNPJ encontrado ou null",
    "responsavel_nome": "nome do síndico/administradora se encontrado ou null",
    "redes_sociais": {{
        "instagram": "URL ou null",
        "facebook": "URL ou null"
    }}
}}
"""
        
        try:
            response = self.client.generate_content(contents=[prompt])
            if not response:
                return self._fallback_parse(lead, raw_text, hrefs)

            self.monitor.log_usage("deepseek-chat")
            result = response.text.strip()
            
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()
                
            data = json.loads(result)
            
            # Enriquece o lead com os dados encontrados
            if data.get("email") and lead.get("email") == "N/D":
                lead["email"] = data["email"]
                logger.info(f"WebEnrichmentAgent:    ✅ Email: {data['email']}")
                
            if data.get("whatsapp") and lead.get("whatsapp") in ("N/D", None):
                lead["whatsapp"] = data["whatsapp"]
                logger.info(f"WebEnrichmentAgent:    ✅ WhatsApp: {data['whatsapp']}")
                
            if data.get("telefones"):
                existing_phone = lead.get("phone", "N/D")
                new_phones = [p for p in data["telefones"] if p != existing_phone]
                if new_phones:
                    if existing_phone == "N/D":
                        lead["phone"] = new_phones[0]
                    lead["telefones_adicionais"] = new_phones
                    logger.info(f"WebEnrichmentAgent:    ✅ Telefones: {new_phones}")
                    
            if data.get("website") and lead.get("website") == "N/D":
                lead["website"] = data["website"]
                logger.info(f"WebEnrichmentAgent:    ✅ Website: {data['website']}")

            if data.get("cnpj"):
                lead["cnpj"] = data["cnpj"]
                logger.info(f"WebEnrichmentAgent:    ✅ CNPJ: {data['cnpj']}")

            if data.get("responsavel_nome") and lead.get("responsavel_nome") in ("N/D", None, ""):
                lead["responsavel_nome"] = data["responsavel_nome"]
                logger.info(f"WebEnrichmentAgent:    ✅ Responsável: {data['responsavel_nome']}")
                
            if data.get("redes_sociais"):
                rs = data["redes_sociais"]
                if rs.get("instagram") and lead.get("social_url") == "N/D":
                    lead["social_url"] = rs["instagram"]
                    logger.info(f"WebEnrichmentAgent:    ✅ Instagram: {rs['instagram']}")
                if rs.get("facebook") and not lead.get("facebook_url"):
                    lead["facebook_url"] = rs["facebook"]
                    logger.info(f"WebEnrichmentAgent:    ✅ Facebook: {rs['facebook']}")
                    
            logger.info(f"WebEnrichmentAgent:    🔥 [Contatos Validados] Email: {lead.get('email', 'N/D')} | WhatsApp: {lead.get('whatsapp', 'N/D')} | Tel: {lead.get('phone', 'N/D')}")
            return lead
            
        except Exception as e:
            logger.error(f"WebEnrichmentAgent: Falha no parse DeepSeek: {e}")
            return self._fallback_parse(lead, raw_text, hrefs)

    def _fallback_parse(self, lead: dict, raw_text: str, hrefs: list) -> dict:
        """
        Extração rápida de contatos usando Regex local — fallback quando DeepSeek falha.
        """
        # E-mail
        emails = re.findall(self.email_regex, raw_text)
        valid_emails = [e for e in emails if not any(x in e.lower() for x in ["w3.org", "google", "example", "bootstrap", "schema.org"])]
        if valid_emails and lead.get("email") == "N/D":
            lead["email"] = valid_emails[0]
            logger.info(f"WebEnrichmentAgent [Fallback]: Email via regex: {valid_emails[0]}")
            
        # Telefone
        if lead.get("phone") in ("N/D", None, ""):
            phone_pattern = r'(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})'
            phones = re.findall(phone_pattern, raw_text)
            valid_phones = [re.sub(r'\D', '', p) for p in phones if 10 <= len(re.sub(r'\D', '', p)) <= 11]
            if valid_phones:
                lead["phone"] = valid_phones[0]
                logger.info(f"WebEnrichmentAgent [Fallback]: Telefone via regex: {valid_phones[0]}")

        # Redes sociais
        for href in hrefs:
            for platform, pattern in self.social_regex.items():
                if re.search(pattern, href, re.IGNORECASE):
                    if platform == "instagram" and lead.get("social_url") == "N/D":
                        lead["social_url"] = href
                    elif platform == "facebook" and not lead.get("facebook_url"):
                        lead["facebook_url"] = href
                        
        return lead
