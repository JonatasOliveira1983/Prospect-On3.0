import os
from src.scraper.market_data import MarketScraper
from src.utils.vision_analyzer import VisionAnalyzer
from src.enrichment.cnpj_ws import CNPJEnricher
from src.utils.database import Database
from src.utils.logger import logger
from datetime import datetime

def test_3_real_leads():
    logger.info("🚀 Iniciando Teste de Captura Real de 3 Condomínios em Jundiaí...")
    
    scraper = MarketScraper()
    vision = VisionAnalyzer()
    enricher = CNPJEnricher()
    db = Database()
    
    # 1. Busca Real via Places API
    leads = scraper.search_condos_by_city("Jundiaí")
    if not leads:
        logger.error("❌ Nenhum condomínio encontrado. Verifique a GOOGLE_MAPS_API_KEY.")
        return

    # 2. Processar apenas 3 leads
    for lead in leads[:3]:
        name = lead['name']
        lat, lng = lead['coords']['lat'], lead['coords']['lng']
        
        logger.info(f"🔎 Processando: {name} (Lat: {lat}, Lng: {lng})")
        
        # Download Imagens
        facade = vision.get_street_view_image(lat, lng)
        satellite = vision.get_satellite_image(lat, lng)
        
        # Enriquecimento CNPJ (se encontrar)
        cnpj = enricher.find_cnpj_by_name(name)
        fiscal_data = {}
        if cnpj:
            fiscal_data = enricher.get_company_data(cnpj)
            
        # Salvar no Banco
        final_lead = {
            **lead,
            **fiscal_data,
            'vision_image_path': facade,
            'satellite_image_path': satellite,
            'scanned_at': datetime.now().strftime("%d/%m/%Y %H:%M"),
            'is_confirmed': True,
            'valuation': {'total_appreciation_gain': 0, 'gain_per_unit': 0}, # Mock simples
            'market': {'avg_m2_price': 7000, 'avg_m2': 100, 'total_units': 50}, # Mock simples
            'vision_analysis': {'desgaste': 'Analisando...', 'urgencia': False}
        }
        
        db.upsert_lead(final_lead)
        logger.info(f"✅ Lead '{name}' salvo com sucesso.")
        if facade: logger.info(f"   🖼️ Fachada: {facade}")
        if satellite: logger.info(f"   🛰️ Satélite: {satellite}")
        if fiscal_data.get('responsavel_nome'): logger.info(f"   👤 Responsável: {fiscal_data['responsavel_nome']}")

    logger.info("🏁 Teste concluído.")

if __name__ == "__main__":
    test_3_real_leads()
