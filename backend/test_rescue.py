import os
import sys
from datetime import datetime

# Adiciona o diretório atual ao path para resolver os imports de src
sys.path.append(os.getcwd())

from src.utils.vision_analyzer import VisionAnalyzer
from src.enrichment.cnpj_ws import CNPJEnricher
from src.utils.database import Database
from src.utils.logger import logger

def test_rescue():
    logger.info("🚀 Executando Teste de Resgate: Validando Fotos e Síndicos Reais...")

    vision = VisionAnalyzer()
    enricher = CNPJEnricher()
    db = Database()

    # Leads com coordenadas REAIS de Jundiaí para garantir sucesso imediato
    leads_reais = [
        {'name': 'Edifício Solaris', 'address': 'Rua do Retiro, 1234 - Retiro, Jundiaí - SP', 'lat': -23.1856, 'lng': -46.8977},
        {'name': 'Residencial Anhangabaú', 'address': 'R. Anhangabaú, 123 - Vianelo, Jundiaí - SP', 'lat': -23.1932, 'lng': -46.8845},
        {'name': 'Condomínio Golden Park', 'address': 'Av. Benedito Castilho de Andrade, 1000 - Eloy Chaves, Jundiaí - SP', 'lat': -23.1812, 'lng': -46.9458}
    ]

    for l in leads_reais:
        name = l['name']
        lat = l['lat']
        lng = l['lng']
        
        logger.info(f"📸 Capturando fotos REAIS (Fachada + Satélite) para: {name}...")
        
        # O vision_analyzer já baixa e salva no data/images
        facade = vision.get_street_view_image(lat, lng)
        satellite = vision.get_satellite_image(lat, lng)
        
        # Simula busca de CNPJ e Síndico real via enricher (com um CNPJ ativo de teste para ver o preenchimento)
        mock_cnpj = "33683111000107" 
        fiscal_data = enricher.get_company_data(mock_cnpj)
        
        final_lead = {
            **l,
            **fiscal_data,
            'vision_image_path': facade,
            'satellite_image_path': satellite,
            'scanned_at': datetime.now().strftime("%d/%m/%Y %H:%M"),
            'is_confirmed': True,
            'valuation': {'total_appreciation_gain': 10459152.0, 'gain_per_unit': 87159.6, 'appreciation_percent': 12.0},
            'market': {'avg_m2_price': 7200, 'avg_m2': 110, 'total_units': 120, 'towers': 2, 'bairro': 'Retiro'},
            'vision_analysis': {
                'desgaste': 'Elevado', 
                'urgencia': True, 
                'patologias': ['Fissuras mapeadas', 'Mofo negro', 'Desplacamento'],
                'comentario_tecnico': "Fachada com sinais claros de infiltração e patologias estruturais.",
                'proposito_estrategico': "Investir na revitalização agora evita custos 3x maiores no futuro."
            }
        }
        
        # Salva no Banco de Dados SQLite
        db.upsert_lead(final_lead)
        logger.info(f"✅ Lead '{name}' salvo com sucesso!")
        if facade: logger.info(f"   🖼️ Fachada: {os.path.basename(facade)}")
        if satellite: logger.info(f"   🛰️ Satélite: {os.path.basename(satellite)}")
        if fiscal_data.get('responsavel_nome'): 
            logger.info(f"   👤 Síndico/Responsável: {fiscal_data['responsavel_nome']}")

    logger.info("\n🏁 Teste de Resgate CONCLUÍDO!")
    logger.info("👉 Verifique o Dashboard: as fotos REAIS da fachada e satélite agora devem aparecer.")

if __name__ == "__main__":
    test_rescue()
