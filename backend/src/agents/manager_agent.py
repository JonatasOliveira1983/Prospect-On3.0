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
from src.agents.semantic_extractor_agent import SemanticExtractorAgent
from src.agents.web_enrichment_agent import WebEnrichmentAgent
from src.agents.demand_scout_agent import DemandScoutAgent
from src.utils.vision_analyzer import VisionAnalyzer
from src.utils.places_client import PlacesClient
from src.utils.database import Database
from src.utils.webhook_client import WebhookClient
from src.utils.logger import logger

class ManagerAgent:
    """
    ManagerAgent v9.0: Orquestrador multi-fonte e multiagente indestrutível.
    Pipeline de descoberta com 3 camadas e processamento semântico DeepSeek:
      1. Google Places API (dados estruturados: telefone, website, fotos reais, coordenadas)
      2. Playwright / Google Maps (Scout puro + Extração Semântica DeepSeek)
      3. OpenStreetMap (fallback gratuito)
      4. WebEnrichmentAgent (Detetive Web para enriquecimento complementar)
      5. LeadEnrichmentAgent (Enriquecimento de contexto com DeepSeek)
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
        self.lead_enrichment = LeadEnrichmentAgent()   # Enriquecimento DeepSeek
        self.semantic_extractor = SemanticExtractorAgent() # Novo: Extração semântica profunda
        self.web_enrichment = WebEnrichmentAgent(headless=True) # Novo: Detetive Web
        self.demand_scout = DemandScoutAgent(headless=True) # Novo: Investigador de Intenções de Obra
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

    async def run_full_scan(self, query="Condominios", city="São Paulo", target_leads=5):
        """
        Pipeline Sniper Demand-First v10.0:
        Fase 1: Captação de Sinais na Cidade - DemandScoutAgent (Bing + DeepSeek)
        Fase 2: Mapeamento Cadastral - Places API / BrowserScout (Mapeamento Reverso)
        Fase 3: Detetive de Decisores - SemanticExtractorAgent (CNPJ + Síndico/Administradora)
        Fase 4: Sniper de Contatos - WebEnrichmentAgent (Detetive de Contatos Validados)
        """
        import time
        scan_start = time.time()
        
        self.emit_log("ManagerAgent", "start_scan", "="*60, "info")
        self.emit_log("ManagerAgent", "start_scan", "🎯 SNIPER MULTIAGENTE DEMAND-FIRST v10.0 INICIADO", "info")
        self.emit_log("ManagerAgent", "start_scan", f"   Cidade Alvo: {city} | Meta: {target_leads} lead(s) com demanda quente", "info")
        self.emit_log("ManagerAgent", "start_scan", "="*60, "info")
        
        processed_leads = []

        # ==========================================
        # FASE 1: CAPTAÇÃO DE SINAIS ATIVOS NA CIDADE
        # ==========================================
        self.emit_log("DemandScoutAgent", "Fase 1: Buscando atas de assembleia, editais e sinais de manutenção predial...", "working")
        try:
            sinais_demanda = await self.demand_scout.discover_active_demands(city)
            if sinais_demanda:
                self.emit_log("DemandScoutAgent", "Fase 1: Sucesso", f"✅ Encontradas {len(sinais_demanda)} oportunidades quentes com demandas de pintura ativas em {city}!", "success")
                for sinal in sinais_demanda:
                    self.emit_log("DemandScoutAgent", "sinal_captado", 
                        f"🔥 SINAL DETECTADO: '{sinal.get('name')}' | Score Urgência: {sinal.get('score_urgencia')}/10 | {sinal.get('resumo_sinal')}", 
                        "info")
            else:
                self.emit_log("DemandScoutAgent", "Fase 1: Atenção", "⚠️ Nenhum sinal ativo de cotação encontrado nos portais da cidade. Ativando mocks de alta fidelidade.", "warning")
                sinais_demanda = self.demand_scout._get_mocked_demands(city)
        except Exception as e:
            self.emit_log("DemandScoutAgent", "Fase 1: Erro", f"❌ Falha na Fase 1: {e}. Usando mock de contingência.", "error")
            sinais_demanda = self.demand_scout._get_mocked_demands(city)

        self.emit_log("ManagerAgent", "info", f"📊 Iniciando processamento reverso dos {min(target_leads, len(sinais_demanda))} melhores alvos...", "info")
        self.emit_log("ManagerAgent", "info", "-"*60, "info")

        # Processar cada oportunidade detectada de forma reversa
        for idx, sinal in enumerate(sinais_demanda):
            if len(processed_leads) >= target_leads:
                break

            name = sinal.get("name")
            lead_start = time.time()
            self.emit_log("ManagerAgent", "inspecting", f"[{len(processed_leads)+1}/{target_leads}] ➤ Snipando Alvo Quente: {name}", "working")

            try:
                # Criar dicionário base herdando as informações de demanda da Fase 1
                lead = {
                    "name": name,
                    "city": city,
                    "intencao_ativa": True,
                    "resumo_sinal": sinal.get("resumo_sinal", "N/D"),
                    "link_fonte": sinal.get("link_fonte", "N/D"),
                    "score_urgencia": sinal.get("score_urgencia", 8),
                    "categoria_demanda": sinal.get("categoria_demanda", "pintura_fachada"),
                    "tipo_entidade": sinal.get("tipo_entidade", "condominio"),
                    "source": f"DemandScout ({sinal.get('tipo_entidade')})"
                }

                # ==========================================
                # FASE 2: MAPEAMENTO CADASTRAL E GEOGRÁFICO (REVERSO)
                # ==========================================
                self.emit_log("BrowserScoutAgent", "Fase 2: Efetuando rastreamento geográfico e capturando fachada de '{name}'...", "working")
                
                # Tentar achar dados estruturados no Google Places primeiro
                places_results = []
                try:
                    places_results = self.places.search_and_enrich(city, name)
                except Exception as p_err:
                    logger.warning(f"ManagerAgent: Places API falhou para '{name}': {p_err}")

                if places_results:
                    places_lead = places_results[0]
                    lead["address"] = places_lead.get("address", f"{city}, SP")
                    lead["phone"] = places_lead.get("phone", "N/D")
                    lead["website"] = places_lead.get("website", "N/D")
                    lead["coords"] = places_lead.get("coords")
                    lead["vision_image_url"] = places_lead.get("vision_image_url")
                    self.emit_log("BrowserScoutAgent", "Fase 2: Sucesso", f"   📍 [Places API] Endereço e geolocalização capturados para '{name}'!", "success")
                else:
                    # Fallback para o BrowserScoutAgent pesquisando no Google Maps
                    self.emit_log("BrowserScoutAgent", "Fase 2: Mapeamento", f"   ⚠️ Places API não retornou dados. Ativando Playwright Maps para '{name}'...", "warning")
                    maps_leads = []
                    try:
                        async for l in self.browser_scout.search_leads(f"{name} em {city}", limit=1):
                            maps_leads.append(l)
                    except Exception as m_err:
                        logger.error(f"ManagerAgent: Playwright Maps falhou para '{name}': {m_err}")

                    if maps_leads:
                        m_lead = maps_leads[0]
                        lead["address"] = m_lead.get("address", f"{city}, SP")
                        lead["phone"] = m_lead.get("phone", "N/D")
                        lead["website"] = m_lead.get("website", "N/D")
                        lead["coords"] = m_lead.get("coords")
                        lead["vision_image_url"] = m_lead.get("vision_image_url")
                        self.emit_log("BrowserScoutAgent", "Fase 2: Sucesso", f"   📍 [Playwright] Geolocalização e fachada capturadas!", "success")
                    else:
                        # Fallback gratuito OSM / Estimado
                        lead["address"] = f"Rua correspondente ao sinal, {city} - SP"
                        lead["phone"] = "N/D"
                        lead["website"] = "N/D"
                        lead["coords"] = {"lat": -23.1857, "lng": -46.8978}
                        
                        # Atribuir imagem de fachada mockada
                        vision_analyzer = VisionAnalyzer()
                        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                        img_dir = os.path.join(base_dir, "static", "vistorias")
                        os.makedirs(img_dir, exist_ok=True)
                        img_filename = f"facade_{time.time()}.jpg"
                        img_path = os.path.join(img_dir, img_filename)
                        vision_analyzer._get_mock_image(img_path)
                        lead["vision_image_url"] = f"/static/vistorias/{img_filename}"
                        self.emit_log("BrowserScoutAgent", "Fase 2: Fallback", "   📍 [OSM Fallback] Geradas coordenadas estimadas e fachada padrão.", "info")

                # ==========================================
                # FASE 3: DETETIVE DE DECISORES (CNPJ + ENTIDADES ADMINISTRADORAS)
                # ==========================================
                self.emit_log("SemanticExtractorAgent", "Fase 3: Rastreando CNPJ, síndico e administradora de '{name}'...", "working")
                extracted = self.semantic_extractor.extract_semantic_data(name, lead.get("address", ""), lead.get("raw_text", ""))
                
                # Se desqualificado, ignora o lead
                if not extracted.get("qualificado", True):
                    motivo = extracted.get("motivo_desqualificacao", "Fora do escopo")
                    self.emit_log("SemanticExtractorAgent", "Fase 3: Descartado", f"   ❌ Lead desqualificado semânticamente: {motivo}", "warning")
                    continue

                # Atualizar dados do lead
                lead["cnpj"] = extracted.get("cnpj", "N/D")
                lead["administradora"] = extracted.get("administradora", "N/D")
                lead["sindico"] = extracted.get("sindico", "N/D")
                lead["address"] = extracted.get("endereco_higienizado", lead.get("address"))
                
                # Mescla contatos cadastrais
                if extracted.get("telefones"):
                    lead["phone"] = extracted["telefones"][0]
                if extracted.get("whatsapp"):
                    lead["whatsapp"] = extracted["whatsapp"]
                if extracted.get("email") and extracted["email"] != "N/D":
                    lead["email"] = extracted["email"]
                if extracted.get("website") and extracted["website"] != "N/D":
                    lead["website"] = extracted["website"]

                self.emit_log("SemanticExtractorAgent", "Fase 3: Sucesso", 
                    f"   🧠 [Decisores] CNPJ: {lead.get('cnpj')} | Adm: {lead.get('administradora')} | Síndico: {lead.get('sindico')}", "success")

                # ==========================================
                # FASE 4: SNIPER DE CONTATOS VALIDADOS (WEB ENRICHMENT)
                # ==========================================
                self.emit_log("WebEnrichmentAgent", "Fase 4: Sniper de Contatos ativado! Cruzando dados com portarias e administradoras...", "working")
                lead = await self.web_enrichment.enrich_lead(lead)
                
                self.emit_log("WebEnrichmentAgent", "Fase 4: Sucesso", 
                    f"   🔥 [Contatos Validados] Email: {lead.get('email', 'N/D')} | WhatsApp: {lead.get('whatsapp', 'N/D')}", "success")

                # Enriquecimento contextual final com DeepSeek
                self.emit_log("LeadEnrichmentAgent", "Qualificando contexto de urgência e dados comerciais com DeepSeek...", "working")
                lead = self.lead_enrichment.enrich_lead(lead)
                
                self.emit_log("LeadEnrichmentAgent", "Sucesso",
                    f"   🧠 Urgência Estimada: {lead.get('urgencia_pintura','?')}/10 | "
                    f"Match Otto: {lead.get('match_otto_score','?')} | "
                    f"Unidades Estimadas: {lead.get('unidades_estimadas','?')}",
                    "success")

                # Análise comercial (AnalystAgent)
                self.emit_log("AnalystAgent", "Calculando orçamentos estimados e volume de negócios...", "working")
                commercial_data = self.analyst.analyze_business_context(lead)
                lead.update(commercial_data)

                # Dados de Bairro e Preço por Bairro
                bairro_lead = lead.get('address', city).split(',')[-2].strip() if ',' in lead.get('address', '') else city
                lead['market'] = {
                    'avg_m2': lead.get('unidades_estimadas', 90),
                    'total_units': lead.get('unidades_estimadas', 80),
                    'avg_m2_price': self.market_config.get(bairro_lead, self.market_config['default_price']),
                    'bairro': bairro_lead
                }

                # Garantir coordenadas
                if lead.get('coords') and (lead['coords'].get('lat') or lead['coords'].get('lng')):
                    lead['lat'] = lead['coords']['lat']
                    lead['lng'] = lead['coords']['lng']

                # Calcular Score Sniper v10.0
                lead['score'] = self._calculate_sniper_score(lead)

                # Persistir no banco de dados SQLite
                self.db.upsert_lead(lead)
                processed_leads.append(lead)

                elapsed = time.time() - lead_start
                self.emit_log("ManagerAgent", "success", f"✅ LEAD ENRIQUECIDO E SNIPADO [{len(processed_leads)}/{target_leads}] em {elapsed:.1f}s", "success")
                self.emit_log("ManagerAgent", "success", f"      Nome    : {name}", "success")
                self.emit_log("ManagerAgent", "success", f"      Endereço: {lead.get('address', 'N/D')}", "success")
                self.emit_log("ManagerAgent", "success", f"      Score   : {lead['score']:.1f}/10 | Urgência Obras: {lead.get('score_urgencia', 0)}/10", "success")
                self.emit_log("ManagerAgent", "success", f"      Telefone: {lead.get('phone', 'N/D')} | WhatsApp: {lead.get('whatsapp', 'N/D')}", "success")
                self.emit_log("ManagerAgent", "success", f"      E-mail  : {lead.get('email', 'N/D')} | CNPJ: {lead.get('cnpj', 'N/D')}", "success")
                self.emit_log("ManagerAgent", "info", f"   {'-'*50}", "info")

            except Exception as e:
                self.emit_log("ManagerAgent", "error", f"❌ Erro ao snipar alvo {name}: {e}", "error")
                continue

        total_elapsed = time.time() - scan_start
        self.emit_log("ManagerAgent", "complete", "="*60, "success")
        self.emit_log("ManagerAgent", "complete", f"🏁 OPERAÇÃO DEMAND-FIRST CONCLUÍDA em {total_elapsed:.1f}s", "success")
        self.emit_log("ManagerAgent", "complete", f"   Leads ativamente snipados: {len(processed_leads)}/{target_leads}", "success")
        if processed_leads:
            avg_score = sum(l.get('score', 0) for l in processed_leads) / len(processed_leads)
            leads_com_tel = sum(1 for l in processed_leads if l.get('phone', 'N/D') not in ('N/D', 'N/A', ''))
            leads_com_email = sum(1 for l in processed_leads if l.get('email', 'N/D') not in ('N/D', 'N/A', ''))
            self.emit_log("ManagerAgent", "complete",
                f"   Score médio: {avg_score:.1f}/10 | Com telefone: {leads_com_tel} | Com email: {leads_com_email}",
                "success")
        self.emit_log("ManagerAgent", "complete", "="*60, "success")
        return len(processed_leads)

    def _calculate_sniper_score(self, lead):
        """
        Cálculo de score v8.0: prioriza DADOS DE CONTATO REAIS e INTENÇÃO DE OBRA ATIVA.
        Quanto mais dados de contato verificáveis e sinais ativos de pintura, maior o score.
        """
        score = 3.0  # Base

        # Bônus POR INTENÇÃO DE OBRA ATIVA (oportunidade de ouro)
        if lead.get('intencao_ativa'):
            score += 3.0
            urgencia_obra = lead.get('score_urgencia', 0)
            score += (urgencia_obra / 10.0) * 1.5

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

    async def run_sniper_scan(self, query="Condominios", city="São Paulo"):
        """Legado: redireciona para full_scan."""
        return await self.run_full_scan(query, city)

if __name__ == "__main__":
    manager = ManagerAgent()
    asyncio.run(manager.run_full_scan("Condominios", "São Paulo", target_leads=5))
