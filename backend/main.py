import json
import os
from dotenv import load_dotenv
from src.crawler.google_maps import GoogleMapsCrawler
from src.enrichment.cnpj_ws import CNPJEnricher
from src.scraper.market_data import MarketScraper
from src.engine.roi import ROIEngine
from src.engine.scoring import LeadScorer
from src.utils.report_generator import ReportGenerator
from src.utils.logger import logger

load_dotenv()

def main():
    logger.info("Iniciando Radar de Condomínios Prospect-On 1.0")
    
    # 1. Instanciar módulos
    crawler = GoogleMapsCrawler()
    enricher = CNPJEnricher()
    scraper = MarketScraper()
    roi_engine = ROIEngine()
    scorer = LeadScorer()
    report_gen = ReportGenerator()
    
    # 2. Varredura Inicial (Exemplo Jundiaí)
    target_city = "Jundiaí, SP"
    logger.info(f"Mapeando condomínios em {target_city}...")
    
    raw_leads = crawler.search_condos(target_city, radius=10000)
    logger.info(f"Encontrados {len(raw_leads)} resultados no Google Maps.")
    
    processed_leads = []
    
    # 3. Processamento Completo
    for lead in raw_leads[:5]: # Teste com 5 para performance
        name = lead['name']
        address = lead['address']
        logger.info(f"Processando: {name}")
        
        # A. Mercado (Bairro/Preço)
        neighborhood = address.split(',')[-2].strip() if ',' in address else "Centro"
        market_price = scraper.get_avg_m2_price(neighborhood)
        unit_info = scraper.get_unit_details(name)
        
        # B. Fiscal/Idade
        cnpj = enricher.find_cnpj_by_name(name)
        fiscal_data = {}
        if cnpj:
            fiscal_data = enricher.get_company_data(cnpj)
        
        # C. Scoring & ROI
        score_data = scorer.calculate_score(fiscal_data)
        
        roi_data = roi_engine.calculate_appreciation({
            'avg_m2_price': market_price,
            'avg_unit_m2': unit_info['avg_m2'],
            'total_units': unit_info['total_units']
        })
        
        # Merge FINAL
        final_lead = {
            **lead,
            **fiscal_data,
            **score_data,
            'market': {
                'avg_m2_price': market_price,
                **unit_info
            },
            'valuation': roi_data
        }
        
        processed_leads.append(final_lead)
        logger.info(f"Lead Processado: {name} | Score: {score_data['score']} | ROI: +R$ {roi_data['total_appreciation_gain']:,}")
        
        # 4. Gerar Relatório PDF
        report_path = report_gen.generate_valuation_report(final_lead)
        logger.info(f"Relatório gerado em: {report_path}")

    # 5. Salvar Resultados JSON
    output_file = "leads_jundiai.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(processed_leads, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Processamento concluído. {len(processed_leads)} leads salvos em {output_file}")

if __name__ == "__main__":
    main()
