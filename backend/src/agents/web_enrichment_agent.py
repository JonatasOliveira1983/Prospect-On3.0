import os
import json
import re
import asyncio
from playwright.async_api import async_playwright
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.utils.deepseek_client import DeepSeekClient
from dotenv import load_dotenv

load_dotenv()

class WebEnrichmentAgent:
    """
    WebEnrichmentAgent: O Detetive Web do Sniper v3.0.
    Atua no enriquecimento de contatos buscando informações diretamente
    no website oficial do condomínio ou realizando pesquisas avançadas
    na web para preencher e-mails, telefones ou redes sociais ausentes.
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

    async def enrich_lead(self, lead: dict) -> dict:
        """
        Analisa o lead e realiza enriquecimento de contatos via web.
        """
        name = lead.get("name", "")
        address = lead.get("address", "")
        website = lead.get("website", "N/D")
        email = lead.get("email", "N/D")
        phone = lead.get("phone", "N/D")
        whatsapp = lead.get("whatsapp", "N/D")
        social_url = lead.get("social_url", "N/D")
        
        # Caso o lead já tenha todos os contatos preenchidos, não há necessidade de enriquecimento web pesado
        if email != "N/D" and phone != "N/D" and whatsapp != "N/D" and social_url != "N/D":
            logger.info(f"WebEnrichmentAgent: '{name}' já possui contatos completos. Pulando.")
            return lead

        logger.info(f"WebEnrichmentAgent: Iniciando enriquecimento web para '{name}'...")
        
        # Se tiver um website real, tentamos raspar diretamente do site
        if website and website != "N/D" and "google.com" not in website.lower() and website.startswith("http"):
            lead = await self._scrape_website(lead, website)
        else:
            # Caso contrário, tentamos pesquisar o site ou contatos na web via Bing/Google
            lead = await self._search_web_for_contacts(lead)
            
        return lead

    async def _scrape_website(self, lead: dict, url: str) -> dict:
        """
        Navega no website do condomínio para extrair contatos usando Playwright e DeepSeek.
        """
        name = lead.get("name", "")
        logger.info(f"WebEnrichmentAgent: Raspando o website oficial '{url}' de '{name}'...")
        
        async with async_playwright() as p:
            try:
                try:
                    browser = await p.chromium.launch(
                        headless=self.headless,
                        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                    )
                except Exception as launch_err:
                    if "playwright install" in str(launch_err) or "Executable doesn't exist" in str(launch_err):
                        logger.warning("WebEnrichmentAgent [_scrape_website]: Executável do navegador ausente na nuvem! Instalando Chromium sob demanda...")
                        import subprocess
                        import sys
                        subprocess.run(
                            [sys.executable, "-m", "playwright", "install", "chromium"],
                            capture_output=True,
                            text=True
                        )
                        logger.info("WebEnrichmentAgent [_scrape_website]: Re-tentando abrir o navegador pós-instalação...")
                        browser = await p.chromium.launch(
                            headless=self.headless,
                            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                        )
                    else:
                        raise launch_err
                
                context = await browser.new_context(
                    viewport={'width': 1280, 'height': 900},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                )
                page = await context.new_page()
                
                # Abre o site com timeout de 30 segundos
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(3000)
                
                # Coleta todo o texto visível da página
                body_element = await page.query_selector("body")
                raw_text = await body_element.inner_text() if body_element else ""
                
                # Coleta links de redes sociais
                links = await page.query_selector_all("a")
                hrefs = []
                for link in links:
                    try:
                        href = await link.get_attribute("href")
                        if href:
                            hrefs.append(href)
                    except: pass
                
                await browser.close()
                
                # Envia o conteúdo do site para extração com DeepSeek
                return self._parse_extracted_content(lead, raw_text, hrefs)
                
            except Exception as e:
                logger.warning(f"WebEnrichmentAgent: Falha ao raspar website '{url}': {e}")
                return lead

    async def _search_web_for_contacts(self, lead: dict) -> dict:
        """
        Faz uma pesquisa no Bing pelos contatos do condomínio para tentar descobrir e-mail ou telefone.
        """
        name = lead.get("name", "")
        address = lead.get("address", "")
        city = lead.get("city") or "São Paulo"
        if "," in address:
            parts = address.split(",")
            if len(parts) >= 3:
                city = parts[-2].strip()
                
        search_query = f"condominio {name} {city} CNPJ contatos telefone email"
        logger.info(f"WebEnrichmentAgent: Fazendo busca no Bing para '{name}'...")
        
        async with async_playwright() as p:
            try:
                try:
                    browser = await p.chromium.launch(
                        headless=self.headless,
                        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                    )
                except Exception as launch_err:
                    if "playwright install" in str(launch_err) or "Executable doesn't exist" in str(launch_err):
                        logger.warning("WebEnrichmentAgent [_search_web_for_contacts]: Executável do navegador ausente na nuvem! Instalando Chromium sob demanda...")
                        import subprocess
                        import sys
                        subprocess.run(
                            [sys.executable, "-m", "playwright", "install", "chromium"],
                            capture_output=True,
                            text=True
                        )
                        logger.info("WebEnrichmentAgent [_search_web_for_contacts]: Re-tentando abrir o navegador pós-instalação...")
                        browser = await p.chromium.launch(
                            headless=self.headless,
                            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                        )
                    else:
                        raise launch_err
                
                context = await browser.new_context(
                    viewport={'width': 1280, 'height': 900},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                )
                page = await context.new_page()
                
                # Usar Bing para evitar recaptchas agressivos do Google
                bing_url = f"https://www.bing.com/search?q={search_query.replace(' ', '+')}"
                await page.goto(bing_url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(3000)
                
                # Coleta o texto visível da primeira página do buscador
                body_element = await page.query_selector("body")
                raw_text = await body_element.inner_text() if body_element else ""
                
                # Coleta links de resultados
                links = await page.query_selector_all("a")
                hrefs = []
                for link in links:
                    try:
                        href = await link.get_attribute("href")
                        if href and href.startswith("http") and "bing.com" not in href:
                            hrefs.append(href)
                    except: pass
                
                await browser.close()
                
                # Envia o conteúdo dos snippets para extração com DeepSeek
                return self._parse_extracted_content(lead, raw_text, hrefs)
                
            except Exception as e:
                logger.warning(f"WebEnrichmentAgent: Falha ao buscar na web para '{name}': {e}")
                return lead

    def _parse_extracted_content(self, lead: dict, raw_text: str, hrefs: list) -> dict:
        """
        Envia o texto bruto raspado de um site ou buscador ao DeepSeek para
        identificar e extrair novos contatos comerciais válidos.
        """
        if not self.client:
            logger.warning("WebEnrichmentAgent: Cliente DeepSeek indisponível para parse semântico. Usando local regex.")
            return self._fallback_parse(lead, raw_text, hrefs)

        name = lead.get("name", "")
        hrefs_str = "\n".join(hrefs[:20]) # Limitado a 20 links relevantes
        
        prompt = f"""
        Você é o WebEnrichmentAgent (Detetive Web) da Otto Pinturas.
        Sua missão é ler o TEXTO BRUTO raspado de um website ou buscador web para encontrar contatos adicionais de um condomínio específico.
        
        DADOS ATUAIS DO CONDOMÍNIO:
        - Nome: {name}
        - Endereço: {lead.get("address")}
        - Telefone Maps: {lead.get("phone")}
        - Email Maps: {lead.get("email")}
        
        TEXTO VISÍVEL COLETADO (BRUTO):
        \"\"\"{raw_text[:8000]}\"\"\"
        
        LINKS ENCONTRADOS:
        \"\"\"{hrefs_str}\"\"\"
        
        INSTRUÇÕES:
        1. Identifique se o texto ou os links possuem novos dados de contato que NÃO existiam nos dados atuais.
        2. Priorize e-mails corporativos da administração do condomínio (ex: sindico@..., contato@..., administracao@...) ou da administradora.
        3. Identifique telefones ou WhatsApp válidos (celular).
        4. Identifique as URLs oficiais das redes sociais do condomínio (Instagram, Facebook).
        5. Identifique o site oficial real do condomínio caso ainda não tenhamos (não use links de portais imobiliários ou sites de reviews).
        
        Responda APENAS em JSON puro (sem bloco de marcação markdown, sem comentários, sem textos extras):
        {{
            "website": "URL oficial ou nulo se não houver",
            "telefones": ["Apenas dígitos com DDD"],
            "whatsapp": "Apenas dígitos de celular com DDD ou nulo",
            "email": "E-mail válido encontrado ou nulo",
            "redes_sociais": {{
                "instagram": "URL ou nulo",
                "facebook": "URL ou nulo"
            }}
        }}
        """
        
        try:
            response = self.client.generate_content(contents=[prompt])
            if not response:
                return self._fallback_parse(lead, raw_text, hrefs)

            self.monitor.log_usage("deepseek-chat")
            result = response.text.strip()
            
            # Limpa markup
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()
                
            data = json.loads(result)
            
            # Enriquecendo o lead de forma incremental
            if data.get("email") and lead.get("email") == "N/D":
                lead["email"] = data["email"]
                logger.info(f"WebEnrichmentAgent: Novo E-mail descoberto para '{name}': {data['email']}")
                
            if data.get("whatsapp") and lead.get("whatsapp") in ("N/D", None):
                lead["whatsapp"] = data["whatsapp"]
                logger.info(f"WebEnrichmentAgent: Novo WhatsApp descoberto para '{name}': {data['whatsapp']}")
                
            if data.get("telefones"):
                # Mescla telefones adicionais
                existing_phone = lead.get("phone", "N/D")
                new_phones = [p for p in data["telefones"] if p != existing_phone]
                if new_phones:
                    if existing_phone == "N/D":
                        lead["phone"] = new_phones[0]
                    lead["telefones_adicionais"] = new_phones
                    logger.info(f"WebEnrichmentAgent: Novos telefones descobertos: {new_phones}")
                    
            if data.get("website") and lead.get("website") == "N/D":
                lead["website"] = data["website"]
                logger.info(f"WebEnrichmentAgent: Novo website descoberto para '{name}': {data['website']}")
                
            # Adiciona redes sociais
            if data.get("redes_sociais"):
                rs = data["redes_sociais"]
                if rs.get("instagram") and lead.get("social_url") == "N/D":
                    lead["social_url"] = rs["instagram"]
                    logger.info(f"WebEnrichmentAgent: Novo Instagram descoberto para '{name}': {rs['instagram']}")
                if rs.get("facebook") and not lead.get("facebook_url"):
                    lead["facebook_url"] = rs["facebook"]
                    logger.info(f"WebEnrichmentAgent: Novo Facebook descoberto para '{name}': {rs['facebook']}")
                    
            return lead
            
        except Exception as e:
            logger.error(f"WebEnrichmentAgent: Falha ao fazer parse de contatos com DeepSeek: {e}")
            return self._fallback_parse(lead, raw_text, hrefs)

    def _fallback_parse(self, lead: dict, raw_text: str, hrefs: list) -> dict:
        """
        Extração rápida de contatos usando Regex puras locais em caso de falha do DeepSeek.
        """
        name = lead.get("name", "")
        
        # Regex de e-mail
        emails = re.findall(self.email_regex, raw_text)
        valid_emails = [e for e in emails if not any(x in e.lower() for x in ["w3.org", "google", "example", "bootstrap"])]
        if valid_emails and lead.get("email") == "N/D":
            lead["email"] = valid_emails[0]
            logger.info(f"WebEnrichmentAgent [Fallback]: E-mail extraído por regex: {valid_emails[0]}")
            
        # Regex de telefone (10 a 11 dígitos com ou sem formatação, ex: (11) 98765-4321 ou 1133334444)
        if lead.get("phone") in ("N/D", None, ""):
            phone_pattern = r'(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})'
            phones = re.findall(phone_pattern, raw_text)
            valid_phones = []
            for p in phones:
                digits = re.sub(r'\D', '', p)
                if len(digits) >= 10 and len(digits) <= 11:
                    valid_phones.append(digits)
            if valid_phones:
                lead["phone"] = valid_phones[0]
                logger.info(f"WebEnrichmentAgent [Fallback]: Telefone extraído por regex: {valid_phones[0]}")

        # Redes Sociais nos hrefs
        for href in hrefs:
            for platform, pattern in self.social_regex.items():
                if re.search(pattern, href, re.IGNORECASE):
                    if platform == "instagram" and lead.get("social_url") == "N/D":
                        lead["social_url"] = href
                        logger.info(f"WebEnrichmentAgent [Fallback]: Instagram extraído: {href}")
                    elif platform == "facebook" and not lead.get("facebook_url"):
                        lead["facebook_url"] = href
                        logger.info(f"WebEnrichmentAgent [Fallback]: Facebook extraído: {href}")
                        
        return lead
