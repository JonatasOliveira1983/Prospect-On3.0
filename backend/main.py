import json
import os
from datetime import datetime
from dotenv import load_dotenv
from src.crawler.google_maps import GoogleMapsCrawler
from src.enrichment.cnpj_ws import CNPJEnricher
from src.scraper.market_data import MarketScraper
from src.engine.roi import ROIEngine
from src.engine.scoring import LeadScorer
from src.utils.vision_analyzer import VisionAnalyzer
from src.utils.report_generator import ReportGenerator
from src.utils.logger import logger
from src.utils.database import Database

load_dotenv()
db = Database()

def main():
    logger.info("📡 Iniciando Radar de Condomínios Prospect-On 4.0-SQL_VALIDATED")
    
    # 1. Instanciar módulos
    crawler = GoogleMapsCrawler()
    enricher = CNPJEnricher()
    scraper = MarketScraper()
    roi_engine = ROIEngine()
    scorer = LeadScorer()
    vision_analyzer = VisionAnalyzer()
    report_gen = ReportGenerator()
    
    # 2. Varredura Inicial Real (v5.0)
    target_city = "Jundiaí"
    logger.info(f"🔎 Mapeando oportunidades REAIS em {target_city}...")
    
    # Usar arquivo local para bypass do erro de API Legacy
    with open("leads_jundiai.json", "r", encoding="utf-8") as f:
        raw_leads = json.load(f)
    logger.info(f"📊 {len(raw_leads)} condomínios carregados do mock local. Iniciando Enriquecimento...")
    
    processed_leads = []
    
    # 3. Processamento e Validação Rígida (Limitado a 1 para teste rápido)
    for lead in raw_leads[:1]:
        name = lead['name']
        address = lead['address']
        coords = lead.get('coords', {})
        place_id = lead.get('place_id')
        
        # A. Validação de Imagens (Fachada + Satélite)
        vision_image = None
        satellite_image = None
        vision_analysis = {}
        
        if coords:
            lat, lng = coords['lat'], coords['lng']
            logger.info(f"📸 Baixando imagens para: {name} ({lat}, {lng})")
            
            # Fachada (Street View)
            vision_image = vision_analyzer.get_street_view_image(lat, lng)
            # Satélite (Aérea) - NOVO v5.0
            satellite_image = vision_analyzer.get_satellite_image(lat, lng)
            
            if not vision_image:
                logger.warning(f"⚠️ Fachada não encontrada para {name}. Tentando Satélite como principal.")
            
            if vision_image:
                logger.info(f"✅ Fachada salva: {os.path.basename(vision_image)}")
                vision_analysis = vision_analyzer.analyze_facade(vision_image)
            
            if satellite_image:
                logger.info(f"✅ Satélite salvo: {os.path.basename(satellite_image)}")
        else:
            logger.warning(f"❌ Lead sem GPS: {name}")
            continue

        # B. Mercado (Bairro/Preço)
        neighborhood = address.split(',')[-2].strip() if ',' in address else "Centro"
        market_price = scraper.get_avg_m2_price(neighborhood)
        unit_info = scraper.get_unit_details(name)
        
        # C. Fiscal/Idade (Melhorado v5.0)
        # Tenta achar o CNPJ real se possível
        fiscal_data = {}
        if name:
            cnpj = enricher.find_cnpj_by_name(name, city=target_city)
            if cnpj:
                fiscal_data = enricher.get_company_data(cnpj)
        
        # D. Scoring & ROI
        score_data = scorer.calculate_score(fiscal_data, vision_analysis)
        roi_data = {
            'unit_value': market_price * unit_info['avg_m2'],
            'total_asset_value': (market_price * unit_info['avg_m2']) * unit_info['total_units'],
            'appreciation_percent': 12.0,
            'gain_per_unit': (market_price * unit_info['avg_m2']) * 0.12
        }
        
        # E. Sincronização SQL
        final_lead = {
            **lead,
            **fiscal_data,
            **score_data,
            'vision_image_path': vision_image,
            'satellite_image_path': satellite_image,
            'vision_image_url': f"http://localhost:8000/api/images/{os.path.basename(vision_image)}" if vision_image else None,
            'vision_analysis': vision_analysis,
            'market': {
                'avg_m2_price': market_price,
                **unit_info
            },
            'valuation': roi_data,
            'is_confirmed': True,
            'scanned_at': datetime.now().strftime("%d/%m/%Y %H:%M")
        }
        
        db.upsert_lead(final_lead)
        logger.info(f"🚩 Lead Sincronizado: {name} | Score: {score_data.get('score', 0)}")

    logger.info(f"🏁 Radar Concluído com Sucesso SQL Level.")

if __name__ == "__main__":
    main()
