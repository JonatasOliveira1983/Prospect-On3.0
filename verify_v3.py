import sys
import os
import json

# Adicionar root ao path
sys.path.append(os.getcwd())

from backend.src.engine.smart_enrichment import SmartEnrichment

def verify():
    # Desativar downloads reais se necessário para teste rápido, mas queremos ver a v3 funcionando
    en = SmartEnrichment()
    
    lead_input = {
        "name": "Condomínio Edifício Praça das Águas",
        "address": "Av. 9 de Julho, 3500 - Anhangabaú, Jundiaí - SP"
    }
    
    print("--- INICIANDO ENRIQUECIMENTO v3.0 ---")
    try:
        res = en.enrich_lead(lead_input)
        
        print(f"STATUS: SUCESSO")
        print(f"VERSAO: {res.get('version')}")
        print(f"PROPOSITO: {res.get('vision_analysis', {}).get('proposito_estrategico')[:100]}...")
        print(f"HEADING (ÂNGULO): {res.get('vision_analysis', {}).get('street_view_heading')}°")
        print(f"VGV CALCULADO: R$ {res.get('proposta_comercial', {}).get('orcamento_total')}")
        
    except Exception as e:
        print(f"ERRO: {e}")

if __name__ == "__main__":
    verify()
