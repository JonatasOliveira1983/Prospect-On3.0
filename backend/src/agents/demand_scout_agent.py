"""
DemandScoutAgent — Orquestrador de Varredura de Demanda (3 Pilares).

Dispara os 3 agentes caçadores em paralelo (asyncio.gather):
  - PillarAHunterAgent (Condomínios — Pilar A)
  - PillarBHunterAgent (Editais Públicos — Pilar B)
  - PillarCHunterAgent (Corporativo — Pilar C)

Consolida os resultados e retorna array unificado com campo `pilar: "A"|"B"|"C"`.

Este agente preserva compatibilidade com o método analyze_active_demand()
para o pipeline de enriquecimento individual de leads.
"""
import os
import json
import re
import asyncio
from datetime import datetime
from html.parser import HTMLParser
from urllib.parse import unquote
from playwright.async_api import async_playwright
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.utils.deepseek_client import DeepSeekClient
from src.agents.pillar_a_agent import PillarAHunterAgent
from src.agents.pillar_b_agent import PillarBHunterAgent
from src.agents.pillar_c_agent import PillarCHunterAgent
from dotenv import load_dotenv

load_dotenv()


class HTMLTextExtractor(HTMLParser):
    """Parser nativo de HTML para extração de texto visível (stdlib only)."""
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
    html_clean = re.sub(
        r'<(script|style|noscript)\b[^>]*>([\s\S]*?)</\1>',
        '', html, flags=re.IGNORECASE
    )
    parser = HTMLTextExtractor()
    parser.feed(html_clean)
    return parser.get_text()


def extract_links_from_html(html: str) -> list:
    if not html:
        return []
    return re.findall(r'href=["\'](https?://[^"\']+)["\']', html)


class DemandScoutAgent:
    """
    Orquestrador de varredura de demanda por pintura nos 3 Pilares.

    Dispara os 3 caçadores (Pilar A/B/C) em paralelo via asyncio.gather,
    consolida os resultados e retorna um dicionário organizado por pilar
    com array unificado de leads.
    """

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.monitor = UsageMonitor()
        self.client = DeepSeekClient(api_key=self.api_key) if self.api_key else None

        # Instancia os 3 agentes caçadores
        self.pillar_a = PillarAHunterAgent(headless=headless)
        self.pillar_b = PillarBHunterAgent(headless=headless)
        self.pillar_c = PillarCHunterAgent(headless=headless)

    @staticmethod
    def _validate_link_fonte(url: str) -> str:
        """
        Valida e sanitiza um link_fonte.
        Rejeita URLs do Google Search, links inválidos ou inventados,
        domínios inexistentes gerados por IA e strings não-URL.
        Retorna string vazia se o link for inválido.
        """
        if not url or not isinstance(url, str):
            return ""

        # Rejeita Google Search URLs — não são links de origem real
        if "google.com/search" in url or "google.com/search?q=" in url:
            logger.debug(f"DemandScoutAgent: Removendo link Google Search inválido: {url[:80]}")
            return ""

        # Rejeita URLs que não começam com http/https
        if not url.startswith(("http://", "https://")):
            return ""

        # Lista de domínios conhecidos inválidos (inventados por IA / plataformas offline / bloqueadas)
        INVALID_DOMAINS = [
            "google.com",            # Google search — já filtrado acima, redundância
            "bing.com",              # Bing search
            "example.com",           # Domínio de exemplo
            "seudominio.com.br",     # Placeholder
            ".gov.br/site",          # URL malformada
            ".jus.br/site",          # URL malformada
            "habitissimo.com.br",    # Plataforma offline (DNS não resolve mais)
            "cenu.com.br",           # Plataforma offline (conexão recusada)
            "bec.sp.gov.br",         # Portal BEC-SP offline (timeout)
            "ucondo.com.br",         # Cloudflare bloqueia scraping (403 permanente)
        ]

        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()

            # Rejeita domínios sem ponto (inválidos) ou muito curtos
            if "." not in domain or len(domain) < 5:
                logger.debug(f"DemandScoutAgent: Domínio inválido/muito curto: {domain}")
                return ""

            # Rejeita domínios da lista negra
            for invalid in INVALID_DOMAINS:
                if invalid in domain or invalid in url.lower():
                    logger.debug(f"DemandScoutAgent: Domínio bloqueado: {domain}")
                    return ""

            # Rejeita URLs que são claramente placeholders ou inventadas:
            # - Terminam com .gov.br/site (URL malformada de fallback antigo)
            # - Contêm "seudominio" ou "meusite"
            suspicious_patterns = [
                r'\.gov\.br/site$',
                r'\.jus\.br/site$',
                r'seudominio',
                r'meusite',
                r'\.com\.br/site$',
            ]
            for pattern in suspicious_patterns:
                if re.search(pattern, url, re.IGNORECASE):
                    logger.debug(f"DemandScoutAgent: URL suspeita (placeholder): {url[:80]}")
                    return ""

        except Exception:
            return ""

        return url

    def _normalize_lead(self, raw: dict, pilar: str, idx: int, city_clean: str) -> dict:
        """
        Normaliza um lead bruto do hunter para o formato esperado pelo frontend.
        Converte campos em inglês (name, resumo_sinal, categoria_demanda, etc.)
        para português (nome, resumo, tag, etc.) e adiciona campos auxiliares.
        Valida e sanitiza link_fonte para rejeitar URLs inválidas.
        """
        # Gera um ID estável baseado no nome + pilar + índice
        raw_id = raw.get("name") or raw.get("nome") or f"lead-{idx}"
        import hashlib
        hash_id = hashlib.md5(f"{pilar}:{raw_id}:{idx}".encode()).hexdigest()[:12]

        # Determina status visual com base no score_urgencia
        urg = raw.get("score_urgencia", 5)
        if urg >= 8:
            status_label = "🔥 Urgente"
        elif urg >= 6:
            status_label = "📋 Em Cotação"
        elif urg >= 4:
            status_label = "📝 Planejado"
        else:
            status_label = "👀 Observado"

        # Valida e sanitiza o link_fonte
        raw_link = raw.get("link_fonte") or raw.get("site", "")
        validated_link = self._validate_link_fonte(raw_link)

        return {
            "id": hash_id,
            "nome": raw.get("name") or raw.get("nome", f"Lead {idx}"),
            "tipo": raw.get("tipo_entidade") or raw.get("tipo", "predio"),
            "endereco": raw.get("address") or raw.get("endereco", ""),
            "cidade": raw.get("cidade", city_clean) if raw.get("cidade") else city_clean,
            "uf": raw.get("uf", ""),
            "contato": raw.get("contato", ""),
            "telefone": raw.get("phone") or raw.get("telefone", ""),
            "email": raw.get("email", ""),
            "site": validated_link if validated_link else raw.get("site") or raw.get("link_fonte", ""),
            "status": status_label,
            "resumo": raw.get("resumo_sinal") or raw.get("resumo", ""),
            "data_publicacao": raw.get("data_publicacao", ""),
            "prazo": raw.get("prazo", ""),
            "valor_estimado": raw.get("valor_estimado", ""),
            "tag": raw.get("categoria_demanda") or raw.get("tag", "manutencao"),
            "pilar": raw.get("pilar", pilar),
            "score_urgencia": urg,
            "link_fonte": validated_link,
        }

    async def scan_all_pillars(self, city: str, pilares: str = "A,B,C") -> dict:
        """
        Varredura seletiva e dinâmica nos Pilares comerciais em paralelo.

        Args:
            city: Nome da cidade alvo (ex: "São Paulo" ou "São Paulo - SP")
            pilares: String contendo os pilares ativos separados por vírgula (ex: "A,B,C")

        Returns:
            {
                "pilares": {
                    "A": { "nome": "Condomínios", "leads": [...], ... },
                    "B": { ... },
                    "C": { ... }
                },
                "total_leads": int,
                "cidade": str,
                "timestamp": str
            }
        """
        city_clean = re.split(r'[,-]', city)[0].strip()
        
        # Faz parse da string de pilares ativos (ex: "A,B" -> {"A", "B"})
        active_set = {p.strip().upper() for p in pilares.split(",")} if pilares else {"A", "B", "C"}
        
        logger.info(
            f"DemandScoutAgent (Orquestrador): 🚀 Iniciando varredura dinâmica "
            f"nos pilares [{', '.join(active_set)}] para '{city_clean}'..."
        )

        tasks = []
        task_indices = []

        if "A" in active_set:
            tasks.append(self.pillar_a.hunt(city))
            task_indices.append("A")
        if "B" in active_set:
            tasks.append(self.pillar_b.hunt(city))
            task_indices.append("B")
        if "C" in active_set:
            tasks.append(self.pillar_c.hunt(city))
            task_indices.append("C")

        # Dispara os hunters selecionados em paralelo
        results = await asyncio.gather(*tasks, return_exceptions=True) if tasks else []

        results_a = []
        results_b = []
        results_c = []

        for idx, pilar_key in enumerate(task_indices):
            res = results[idx]
            if isinstance(res, Exception):
                logger.error(f"DemandScoutAgent: Pilar {pilar_key} falhou: {res}")
                continue
            if pilar_key == "A":
                results_a = res
            elif pilar_key == "B":
                results_b = res
            elif pilar_key == "C":
                results_c = res

        # Normaliza cada lead para o formato do frontend
        normalized_a = [self._normalize_lead(r, "A", i, city_clean) for i, r in enumerate(results_a if isinstance(results_a, list) else [])]
        normalized_b = [self._normalize_lead(r, "B", i, city_clean) for i, r in enumerate(results_b if isinstance(results_b, list) else [])]
        normalized_c = [self._normalize_lead(r, "C", i, city_clean) for i, r in enumerate(results_c if isinstance(results_c, list) else [])]

        total_leads = len(normalized_a) + len(normalized_b) + len(normalized_c)

        logger.info(
            f"DemandScoutAgent (Orquestrador): ✅ Varredura concluída para "
            f"'{city_clean}'! A={len(normalized_a)} B={len(normalized_b)} C={len(normalized_c)} "
            f"→ Total={total_leads}"
        )

        # Palavras‑chave por pilar (usadas pelo frontend como chips visuais)
        kw_a = ["ata", "assembleia", "fundo de obra", "cotação", "pintura", "fachada", "lavagem", "reforma"]
        kw_b = ["licitação", "pregão", "concorrência", "tomada de preço", "edital", "diário oficial", "contrato"]
        kw_c = ["facilities", "cotação empresarial", "vaga", "manutenção predial", "limpeza", "segurança", "shopping"]

        return {
            "pilares": {
                "A": {
                    "nome": "Condomínios",
                    "icone": "Building2",
                    "cor": "from-blue-500 to-cyan-500",
                    "corClara": "bg-blue-500/10 border-blue-500/30 text-blue-400",
                    "descricao": "Atas, fundos de obra, cotações e demandas condominiais",
                    "leads": normalized_a,
                    "total_encontrados": len(normalized_a),
                    "palavras_chave": kw_a,
                    "status": "completo" if normalized_a else "vazio",
                },
                "B": {
                    "nome": "Editais Públicos",
                    "icone": "ScrollText",
                    "cor": "from-emerald-500 to-green-500",
                    "corClara": "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                    "descricao": "Licitações, pregões, concorrências e diários oficiais",
                    "leads": normalized_b,
                    "total_encontrados": len(normalized_b),
                    "palavras_chave": kw_b,
                    "status": "completo" if normalized_b else "vazio",
                },
                "C": {
                    "nome": "Corporativo",
                    "icone": "Briefcase",
                    "cor": "from-purple-500 to-pink-500",
                    "corClara": "bg-purple-500/10 border-purple-500/30 text-purple-400",
                    "descricao": "Vagas, facilities, cotações empresariais e demandas corporativas",
                    "leads": normalized_c,
                    "total_encontrados": len(normalized_c),
                    "palavras_chave": kw_c,
                    "status": "completo" if normalized_c else "vazio",
                },
            },
            "total_leads": total_leads,
            "cidade": city_clean,
            "timestamp": datetime.now().isoformat(),
        }

    # ========================================================================
    # MÉTODOS DE COMPATIBILIDADE — Preservados para o pipeline legado
    # ========================================================================

    async def analyze_active_demand(self, lead: dict) -> dict:
        """
        Análise individual de demanda para um lead específico (uso no pipeline legado).

        Varre o Bing buscando atas, concorrências e cotações de reforma ou pintura
        para o lead, usando o mesmo motor de busca dos agentes individuais.
        Mantém compatibilidade com o fluxo de enriquecimento de leads.
        """
        name = lead.get("name", "")
        address = lead.get("address", "")
        city = lead.get("city") or "São Paulo"
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

                try:
                    await page.wait_for_selector("#b_results", timeout=6000)
                except Exception:
                    pass

                await page.wait_for_timeout(1500)
                html_content = await page.content()

                raw_text = extract_text_from_html(html_content)
                links = extract_links_from_html(html_content)
                filtered_links = [h for h in links if h.startswith("http") and "bing.com" not in h]

                # Analisa sinais de demanda no texto
                sinais = await self._analyze_demand_signals(raw_text, filtered_links, name, city)
                await browser.close()

                if sinais:
                    lead["demand_signals"] = sinais
                    lead["has_active_demand"] = True
                    logger.info(f"DemandScoutAgent: ✅ {len(sinais)} sinais de demanda encontrados para '{name}'!")
                else:
                    lead["demand_signals"] = []
                    lead["has_active_demand"] = False
                    logger.info(f"DemandScoutAgent: Nenhum sinal de demanda ativa encontrado para '{name}'")

                return lead

            except Exception as e:
                logger.warning(f"DemandScoutAgent: Erro ao analisar demanda para '{name}': {e}")
                lead["demand_signals"] = []
                lead["has_active_demand"] = False
                return lead

    async def _analyze_demand_signals(
        self, raw_text: str, links: list, name: str, city: str
    ) -> list[dict]:
        """Analisa texto bruto do Bing em busca de sinais de demanda de pintura."""
        if not self.client or not raw_text:
            return []

        links_str = "\n".join(links[:10])
        prompt = f"""
Você é o analista de demanda ativa do DemandScoutAgent da Otto Pinturas.
Analise o texto abaixo extraído de resultados de busca do Bing para o lead
"{name}" na cidade de {city}.

TEXTO DA PESQUISA:
\"\"\"{raw_text[:5000]}\"\"\"

LINKS:
\"\"\"{links_str}\"\"\"

Identifique sinais de que este local tem demanda ativa por pintura ou reforma:
- Atas de assembleia de condomínio discutindo pintura
- Editais ou licitações de manutenção predial
- Cotações ou orçamentos de pintura em andamento
- Vagas de pintor ou manutenção
- Termos como "fundo de obra", "pintura externa", "reforma de fachada"

Retorne APENAS um array JSON (sem markdown):
[
  {{
    "tipo": "ata_assembleia|licitacao|cotacao|vaga_pintor",
    "descricao": "Resumo do sinal encontrado em português",
    "link": "URL da fonte",
    "score": 8,
    "pilar": "A|B|C"
  }}
]

Se não houver sinais, retorne: []
"""
        try:
            response = self.client.generate_content(contents=[prompt])
            if not response:
                return []

            self.monitor.log_usage("deepseek-chat")
            result = response.text.strip()

            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()

            data = json.loads(result)
            return data if isinstance(data, list) else []

        except Exception as e:
            logger.warning(f"DemandScoutAgent: Erro ao analisar sinais: {e}")
            return []

    async def discover_active_demands(self, city: str, publico_alvo: str = None, palavra_chave: str = None, pilares: str = "A,B,C") -> list[dict]:
        """
        Retorna uma lista plana de leads reais identificados na varredura seletiva de pilares.
        Interface de compatibilidade com o ManagerAgent.
        """
        logger.info(f"DemandScoutAgent: Executando discover_active_demands para '{city}' com pilares [{pilares}]...")
        scan_results = await self.scan_all_pillars(city, pilares=pilares)
        
        flat_leads = []
        pilares_data = scan_results.get("pilares", {})
        for pilar_key, pilar_data in pilares_data.items():
            leads = pilar_data.get("leads", [])
            for l in leads:
                flat_leads.append({
                    "name": l.get("nome"),
                    "resumo_sinal": l.get("resumo"),
                    "link_fonte": l.get("link_fonte") or l.get("site"),
                    "score_urgencia": l.get("score_urgencia", 8),
                    "categoria_demanda": l.get("tag"),
                    "tipo_entidade": l.get("tipo"),
                    "pilar": l.get("pilar", pilar_key),
                    "address": l.get("endereco"),
                    "phone": l.get("telefone"),
                    "email": l.get("email"),
                    "lat": l.get("lat"),
                    "lng": l.get("lng")
                })
        return flat_leads

    async def _get_mocked_demands(self, city: str, publico_alvo: str = None, palavra_chave: str = None, pilares: str = "A,B,C") -> list[dict]:
        """Alias de compatibilidade que retorna os mesmos dados reais auditados em vez de mocks fictícios."""
        logger.info("DemandScoutAgent: Redirecionando fallback de mocks para dados reais auditados.")
        return await self.discover_active_demands(city, publico_alvo, palavra_chave, pilares=pilares)

