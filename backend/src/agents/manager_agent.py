import os
import json
import asyncio
from datetime import datetime
from src.agents.hunter_agent import HunterAgent
from src.agents.surveyor_agent import SurveyorAgent
from src.agents.contact_agent import ContactAgent
from src.agents.closing_agent import ClosingAgent
from src.agents.demand_scraper_agent import DemandScraperAgent
from src.agents.geosampa_agent import GeosampaAgent
from src.agents.analyst_agent import AnalystAgent
from src.agents.browser_scout_agent import BrowserScoutAgent
from src.agents.lead_enrichment_agent import LeadEnrichmentAgent
from src.utils.vision_analyzer import VisionAnalyzer
from src.utils.places_client import PlacesClient
from src.utils.database import Database
from src.utils.webhook_client import WebhookClient
from src.utils.logger import logger

class ManagerAgent:
    """
    ManagerAgent v8.0: Orquestrador multi-fonte.
    Pipeline de descoberta com 3 camadas:
      1. Google Places API (dados estruturados: telefone, website, fotos reais, coordenadas)
      2. Playwright / Google Maps (scraping visual, fallback)
      3. OpenStreetMap (fallback gratuito)
      4. DeepSeek (enriquecimento textual de cada lead)
    """
    def __init__(self):
        self.places = PlacesClient()                  # Primário (dados estruturados)
        self.browser_scout = BrowserScoutAgent(headless=True)  # Secundário (scraping visual, headless para nuvem)
        self.hunter = HunterAgent()                    # Terciário (OSM gratuito)
        self.surveyor = SurveyorAgent()
        self.contact = ContactAgent()
        self.closing = ClosingAgent()
        self.scout = DemandScraperAgent()
        self.geosampa = GeosampaAgent()
        self.analyst = AnalystAgent()
        self.lead_enrichment = LeadEnrichmentAgent()   # Novo: enriquecimento DeepSeek
        self.vision_tools = VisionAnalyzer()
        self.webhook = WebhookClient()
        self.db = Database()
        self.ws_manager = None
        
        self.market_config = {
            "precos_por_m2": {
                "Retiro": 85, "Eloy Chaves": 78, "Anhangabaú": 92, 
                "Centro": 70, "Jardim Samambaia": 95, "Vila Arens": 82
            },
            "default_price": 75
        }

    def set_ws_manager(self, ws_manager):
        self.ws_manager = ws_manager

    def emit_log(self, agent_name: str, action: str, message: str, status: str = "info"):
        logger.info(f"{agent_name}: {message}")
        if self.ws_manager:
            log_data = {
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": agent_name,
                "action": action,
                "message": message,
                "status": status
            }
            try:
                loop = asyncio.get_running_loop()
                asyncio.create_task(self.ws_manager.broadcast(log_data))
            except RuntimeError:
                pass

    async def run_full_scan(self, query="Condominios", city="Jundiaí", target_leads=5):
        """
        Pipeline Multi-Fonte v8.0:
        1. Google Places API → dados estruturados (telefone, website, fotos, coordenadas)
        2. Playwright → fallback visual (se Places falhar)
        3. OSM → fallback gratuito (se ambos falharem)
        4. DeepSeek → enriquecimento textual de cada lead
        """
        from datetime import datetime
        import time
        scan_start = time.time()
        
        self.emit_log("ManagerAgent", "start_scan", f"{'='*60}", "info")
        self.emit_log("ManagerAgent", "start_scan", f"🎯 OPERAÇÃO SNIPER v8.0 INICIADA", "info")
        self.emit_log("ManagerAgent", "start_scan", f"   Alvo: {query} | Cidade: {city} | Meta: {target_leads} lead(s)", "info")
        self.emit_log("ManagerAgent", "start_scan", f"{'='*60}", "info")
        processed_leads = []
        leads_coletados = []

        # =====================
        # CAMADA 1: GOOGLE PLACES API (dados estruturados, confiáveis)
        # =====================
        self.emit_log("ManagerAgent", "search", "[CAMADA 1] Google Places API — dados estruturados...", "working")
        try:
            places_leads = self.places.search_and_enrich(city, query)
            if places_leads:
                self.emit_log("ManagerAgent", "success", f"✅ Places API: {len(places_leads)} leads com dados estruturados!", "success")
                leads_coletados.extend(places_leads)
            else:
                self.emit_log("ManagerAgent", "warning", "⚠️  Places API sem resultados. Ativando Camada 2 (Playwright)...", "warning")
        except Exception as places_err:
            self.emit_log("ManagerAgent", "error", f"❌ Places API falhou: {places_err}. Ativando Camada 2...", "error")

        # =====================
        # CAMADA 2: PLAYWRIGHT / GOOGLE MAPS (scraping visual)
        # =====================
        if not leads_coletados:
            self.emit_log("ManagerAgent", "search", "[CAMADA 2] Playwright → Scraping Google Maps (modo headless)...", "working")
            try:
                playwright_count = 0
                async for lead in self.browser_scout.search_leads(f"{query} em {city}", limit=50):
                    leads_coletados.append(lead)
                    playwright_count += 1
                    self.emit_log("BrowserScoutAgent", "scraping",
                        f"   [{playwright_count}] Lead capturado: {lead.get('name', 'N/D')} "
                        f"| Tel: {lead.get('phone', 'N/D')} | Email: {lead.get('email', 'N/D')}",
                        "info")
                self.emit_log("ManagerAgent", "success", f"✅ Playwright: {playwright_count} leads encontrados no Google Maps!", "success")
            except Exception as maps_err:
                self.emit_log("ManagerAgent", "error", f"❌ Playwright falhou: {maps_err}. Ativando Camada 3 (OSM)...", "error")

        # =====================
        # CAMADA 3: OPENSTREETMAP (fallback gratuito)
        # =====================
        if not leads_coletados:
            self.emit_log("ManagerAgent", "search", "[CAMADA 3] OpenStreetMap (OSM) — fallback gratuito...", "working")
            try:
                osm_leads = self.hunter.search_condos(city)
                vision_analyzer = VisionAnalyzer()
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                img_dir = os.path.join(base_dir, "static", "vistorias")
                os.makedirs(img_dir, exist_ok=True)
                
                for lead in osm_leads:
                    lat = lead['coords']['lat'] if lead.get('coords') else -23.1857
                    lng = lead['coords']['lng'] if lead.get('coords') else -46.8978
                    
                    img_filename = f"facade_{lat}_{lng}.jpg"
                    img_path = os.path.join(img_dir, img_filename)
                    if not os.path.exists(img_path):
                        vision_analyzer._get_mock_image(img_path)
                    
                    adapted_lead = {
                        'name': lead.get('name', 'Condomínio Residencial'),
                        'address': lead.get('address', f"{city}, SP"),
                        'coords': {'lat': lat, 'lng': lng},
                        'phone': 'N/D',
                        'website': 'N/D',
                        'email': 'N/D',
                        'social_url': 'N/D',
                        'source': 'OpenStreetMap (Fallback)',
                        'vision_image_url': f"/static/vistorias/{img_filename}"
                    }
                    leads_coletados.append(adapted_lead)
                    
                self.emit_log("ManagerAgent", "success", f"✅ OSM: {len(osm_leads)} leads de fallback encontrados!", "success")
            except Exception as osm_err:
                self.emit_log("ManagerAgent", "error", f"❌ Fallback OSM falhou: {osm_err}", "error")

        self.emit_log("ManagerAgent", "info",
            f"📊 Total de candidatos coletados: {len(leads_coletados)} | Iniciando enriquecimento dos {min(target_leads, len(leads_coletados))} melhores...",
            "info")
        self.emit_log("ManagerAgent", "info", f"{'-'*60}", "info")

        # =====================
        # PROCESSAMENTO: Enriquecer e validar cada lead
        # =====================
        for idx, lead in enumerate(leads_coletados):
            if len(processed_leads) >= target_leads:
                break

            name = lead.get('name', 'Desconhecido')
            lead_start = time.time()
            self.emit_log("ManagerAgent", "inspecting",
                f"[{len(processed_leads)+1}/{target_leads}] ➤ Processando: {name}",
                "working")

            try:
                # 1. ENRIQUECIMENTO COM DEEPSEEK
                self.emit_log("LeadEnrichmentAgent", "analyzing", f"   🧠 DeepSeek analisando contexto de '{name}'...", "working")
                lead = self.lead_enrichment.enrich_lead(lead)
                self.emit_log("LeadEnrichmentAgent", "analyzing",
                    f"   ✅ DeepSeek: urgência={lead.get('urgencia_pintura','?')}/10 | "
                    f"match_otto={lead.get('match_otto_score','?')} | "
                    f"unidades={lead.get('unidades_estimadas','?')}",
                    "success")
                
                # 2. ANÁLISE COMERCIAL (AnalystAgent)
                self.emit_log("AnalystAgent", "analyzing", f"   📈 Calculando contexto comercial para '{name}'...", "working")
                commercial_data = self.analyst.analyze_business_context(lead)
                lead.update(commercial_data)

                # 3. DADOS DE MERCADO (preço por bairro)
                bairro_lead = lead.get('address', city).split(',')[-2].strip() if ',' in lead.get('address', '') else city
                lead['market'] = {
                    'avg_m2': lead.get('unidades_estimadas', 90),
                    'total_units': lead.get('unidades_estimadas', 80),
                    'avg_m2_price': self.market_config.get(bairro_lead, self.market_config['default_price']),
                    'bairro': bairro_lead
                }

                # 4. GARANTIR COORDENADAS
                if lead.get('coords') and (lead['coords'].get('lat') or lead['coords'].get('lng')):
                    lead['lat'] = lead['coords']['lat']
                    lead['lng'] = lead['coords']['lng']

                # 5. AJUSTAR SCORE SNIPER v8.0 (prioriza dados de contato reais)
                lead['score'] = self._calculate_sniper_score(lead)

                # 6. PERSISTÊNCIA
                self.db.upsert_lead(lead)
                processed_leads.append(lead)

                elapsed = time.time() - lead_start
                self.emit_log("ManagerAgent", "success",
                    f"   ✅ LEAD CONFIRMADO [{len(processed_leads)}/{target_leads}] em {elapsed:.1f}s",
                    "success")
                self.emit_log("ManagerAgent", "success",
                    f"      Nome    : {name}",
                    "success")
                self.emit_log("ManagerAgent", "success",
                    f"      Endereço: {lead.get('address', 'N/D')}",
                    "success")
                self.emit_log("ManagerAgent", "success",
                    f"      Score   : {lead['score']:.1f}/10 | Urgência: {lead.get('urgencia_pintura', 5)}/10",
                    "success")
                self.emit_log("ManagerAgent", "success",
                    f"      Telefone: {lead.get('phone', 'N/D')} | Email: {lead.get('email', 'N/D')}",
                    "success")
                self.emit_log("ManagerAgent", "success",
                    f"      Website : {lead.get('website', 'N/D')}",
                    "success")
                self.emit_log("ManagerAgent", "success",
                    f"      Fonte   : {lead.get('source', 'N/D')}",
                    "success")
                self.emit_log("ManagerAgent", "info", f"   {'-'*50}", "info")

            except Exception as e:
                self.emit_log("ManagerAgent", "error", f"❌ Erro ao processar {name}: {e}", "error")
                continue

        total_elapsed = time.time() - scan_start
        self.emit_log("ManagerAgent", "complete", f"{'='*60}", "success")
        self.emit_log("ManagerAgent", "complete",
            f"🏁 OPERAÇÃO CONCLUÍDA em {total_elapsed:.1f}s",
            "success")
        self.emit_log("ManagerAgent", "complete",
            f"   Leads confirmados: {len(processed_leads)}/{target_leads}",
            "success")
        if processed_leads:
            avg_score = sum(l.get('score', 0) for l in processed_leads) / len(processed_leads)
            leads_com_tel = sum(1 for l in processed_leads if l.get('phone', 'N/D') not in ('N/D', 'N/A', ''))
            leads_com_email = sum(1 for l in processed_leads if l.get('email', 'N/D') not in ('N/D', 'N/A', ''))
            self.emit_log("ManagerAgent", "complete",
                f"   Score médio: {avg_score:.1f}/10 | Com telefone: {leads_com_tel} | Com email: {leads_com_email}",
                "success")
        self.emit_log("ManagerAgent", "complete", f"{'='*60}", "success")
        return len(processed_leads)

    def _calculate_sniper_score(self, lead):
        """
        Cálculo de score v8.0: prioriza DADOS DE CONTATO REAIS.
        Quanto mais dados de contato verificáveis, maior o score.
        """
        score = 3.0  # Base

        # Bônus POR DADOS DE CONTATO REAIS (o mais importante!)
        # Telefone real (não N/D)
        phone = lead.get('phone', 'N/D')
        if phone and phone not in ('N/D', 'N/A', ''):
            score += 2.5
            # Bônus extra se for número brasileiro válido
            if any(c.isdigit() for c in phone) and len(phone) >= 10:
                score += 1.0

        # Website real
        website = lead.get('website', 'N/D')
        if website and website not in ('N/D', 'N/A', '') and 'google' not in website.lower():
            score += 1.5

        # Email real
        email = lead.get('email', 'N/D')
        if email and email not in ('N/D', 'N/A', '') and '@' in email:
            score += 1.5

        # Social media
        social = lead.get('social_url', 'N/D')
        if social and social not in ('N/D', 'N/A', ''):
            score += 0.5

        # Bônus POR AVALIAÇÃO NO GOOGLE
        rating = lead.get('rating', 0)
        if rating > 0:
            score += min(1.0, rating / 5.0)

        # Bônus POR URGÊNCIA DE PINTURA (do DeepSeek)
        urgencia = lead.get('urgencia_pintura', 5)
        if urgencia >= 8:
            score += 2.0
        elif urgencia >= 6:
            score += 1.0

        # Bônus por Match Otto
        match_score = lead.get('match_otto_score', 50)
        score += (match_score / 100) * 1.0

        # Penalidade: sem coordenadas
        if not lead.get('coords') and not lead.get('lat'):
            score -= 0.5

        return min(10.0, max(1.0, round(score, 1)))

    async def run_sniper_scan(self, query="Condominios", city="Jundiaí"):
        """Legado: redireciona para full_scan."""
        return await self.run_full_scan(query, city)

if __name__ == "__main__":
    manager = ManagerAgent()
    asyncio.run(manager.run_full_scan("Condominios", "Jundiaí", target_leads=5))
