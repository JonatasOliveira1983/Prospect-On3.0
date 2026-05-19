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

class DemandScoutAgent:
    """
    DemandScoutAgent: O Investigador de Intenção de Obra Ativa da Otto Pinturas.
    Especialista em buscar editais, atas de assembleias e concorrências de pintura
    em condomínios, shoppings e estabelecimentos comerciais.
    """
    def __init__(self, headless=True):
        self.headless = headless
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.monitor = UsageMonitor()
        self.client = DeepSeekClient(api_key=self.api_key) if self.api_key else None

    async def analyze_active_demand(self, lead: dict) -> dict:
        """
        Varre o Bing buscando atas, concorrências e cotações de reforma ou pintura para o lead.
        """
        name = lead.get("name", "")
        address = lead.get("address", "")
        city = "Jundiaí"
        if "," in address:
            parts = address.split(",")
            if len(parts) >= 3:
                city = parts[-2].strip()

        # Query de busca focada em editais de pintura, reformas ou atas de assembleia com cotações
        search_query = f"condominio {name} {city} \"ata\" OR \"assembleia\" OR \"edital\" pintura fachada reforma orçamentos"
        logger.info(f"DemandScoutAgent: Investigando intenção de obra ativa para '{name}'...")
        logger.info(f"DemandScoutAgent: Query de busca: {search_query}")

        async with async_playwright() as p:
            try:
                try:
                    browser = await p.chromium.launch(
                        headless=self.headless,
                        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                    )
                except Exception as launch_err:
                    if "playwright install" in str(launch_err) or "Executable doesn't exist" in str(launch_err):
                        logger.warning("DemandScoutAgent: Navegador Chromium ausente! Instalando...")
                        import subprocess
                        import sys
                        subprocess.run(
                            [sys.executable, "-m", "playwright", "install", "chromium"],
                            capture_output=True,
                            text=True
                        )
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

                # Busca no Bing
                bing_url = f"https://www.bing.com/search?q={search_query.replace(' ', '+')}"
                await page.goto(bing_url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(3000)

                # Captura texto visível
                body_element = await page.query_selector("body")
                raw_text = await body_element.inner_text() if body_element else ""

                # Captura links úteis de atas ou concorrências
                links = await page.query_selector_all("a")
                hrefs = []
                for link in links:
                    try:
                        href = await link.get_attribute("href")
                        if href and href.startswith("http") and "bing.com" not in href:
                            hrefs.append(href)
                    except:
                        pass

                await browser.close()

                # Processa os snippets e links com DeepSeek para extrair a intenção semântica
                return self._parse_demand_content(lead, raw_text, hrefs)

            except Exception as e:
                logger.error(f"DemandScoutAgent: Erro ao executar busca para '{name}': {e}")
                lead["intencao_ativa"] = False
                lead["resumo_sinal"] = "N/D"
                lead["link_fonte"] = "N/D"
                lead["score_urgencia"] = 0
                lead["categoria_demanda"] = "nenhuma"
                return lead

    def _parse_demand_content(self, lead: dict, raw_text: str, hrefs: list) -> dict:
        """
        Envia o texto bruto dos resultados da pesquisa ao DeepSeek para avaliar
        se há menções a orçamentos, cotações ou assembleias ativas para pintura.
        """
        name = lead.get("name", "")
        hrefs_str = "\n".join(hrefs[:10])

        if not self.client:
            logger.warning("DemandScoutAgent: DeepSeek desativado. Mockando sinais de cotação.")
            # Fallback seguro para simulação ou offline
            lead["intencao_ativa"] = False
            lead["resumo_sinal"] = "N/D"
            lead["link_fonte"] = "N/D"
            lead["score_urgencia"] = 0
            lead["categoria_demanda"] = "nenhuma"
            return lead

        prompt = f"""
        Você é o DemandScoutAgent (Investigador de Obras) da Otto Pinturas.
        Sua missão é analisar o TEXTO BRUTO extraído dos resultados de busca do Bing para um condomínio ou empresa,
        e determinar se há qualquer sinal de cotação ativa, assembleia recente discutindo pintura de fachada,
        lavagem predial, impermeabilização ou reforma de pastilhas, ou tomadas de preços / licitações abertas.

        NOME DO LEAD: {name}
        ENDEREÇO: {lead.get("address")}

        TEXTO DA PESQUISA DO BING:
        \"\"\"{raw_text[:8000]}\"\"\"

        LINKS ENCONTRADOS:
        \"\"\"{hrefs_str}\"\"\"

        REGRAS DE ANÁLISE:
        1. Classifique 'intencao_ativa' como true somente se encontrar evidências em texto de discussões recentes sobre pintura, reforma, impermeabilização, assembleia votando orçamentos de obras nos últimos meses (2025/2026), ou diários oficiais de licitação.
        2. Extraia um resumo claro do sinal encontrado em 'resumo_sinal'.
        3. Identifique o link correspondente em 'link_fonte' caso o snippet venha de um site ou PDF público listado nos Links. Se não achar o link exato, use um link geral do resultado que pareça mais próximo ou defina como "N/D".
        4. O 'score_urgencia' deve ir de 1 a 10:
           - 8 a 10: Licitação aberta, cotação de pintura ativa com prazo, pintura de fachada aprovada em assembleia recente.
           - 5 a 7: Discussão de cotação iniciada em assembleia, planejamento de pintura futura em andamento.
           - 1 a 4: Menção genérica a reformas ou fundo de obras.
           - 0: Nenhuma intenção encontrada.
        5. 'categoria_demanda' pode ser: "pintura_fachada", "lavagem_pastilhas", "reforma_geral" ou "nenhuma".

        Responda APENAS em JSON puro (sem bloco de marcação markdown, sem comentários, sem textos extras):
        {{
            "intencao_ativa": true|false,
            "resumo_sinal": "Resumo das evidências encontradas em português do Brasil",
            "link_fonte": "URL mais próxima do achado",
            "score_urgencia": 0 a 10,
            "categoria_demanda": "pintura_fachada|lavagem_pastilhas|reforma_geral|nenhuma"
        }}
        """

        try:
            response = self.client.generate_content(contents=[prompt])
            if not response:
                raise ValueError("Resposta do DeepSeek vazia")

            self.monitor.log_usage("deepseek-chat")
            result = response.text.strip()

            # Limpa markup markdown de JSON se houver
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()

            data = json.loads(result)

            lead["intencao_ativa"] = data.get("intencao_ativa", False)
            lead["resumo_sinal"] = data.get("resumo_sinal", "N/D")
            lead["link_fonte"] = data.get("link_fonte", "N/D")
            lead["score_urgencia"] = data.get("score_urgencia", 0)
            lead["categoria_demanda"] = data.get("categoria_demanda", "nenhuma")

            if lead["intencao_ativa"]:
                logger.info(f"DemandScoutAgent: 🔥 OPORTUNIDADE ATIVA IDENTIFICADA em '{name}'! Score {lead['score_urgencia']}/10. Detalhes: {lead['resumo_sinal']}")
            else:
                logger.info(f"DemandScoutAgent: Nenhuma intenção ativa de pintura identificada em '{name}'.")

            return lead

        except Exception as e:
            logger.error(f"DemandScoutAgent: Falha ao fazer parse semântico de demandas com DeepSeek: {e}")
            lead["intencao_ativa"] = False
            lead["resumo_sinal"] = "N/D"
            lead["link_fonte"] = "N/D"
            lead["score_urgencia"] = 0
            lead["categoria_demanda"] = "nenhuma"
            return lead
