import asyncio
import os
import sys
from datetime import datetime

# Adiciona o diretório atual ao path para resolver os imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.agents.demand_scout_agent import DemandScoutAgent
from src.utils.database import Database
from src.utils.logger import logger

async def test_real_scan():
    print("🚀 [TESTE REAL PILLARS] Iniciando varredura real nos 3 pilares para 'São Paulo'...")
    # Roda em modo headless=True para execução em segundo plano estável
    agent = DemandScoutAgent(headless=True)
    db = Database()
    
    # Executa a varredura nos 3 pilares
    result = await agent.scan_all_pillars(city="São Paulo")
    
    print("\n==================================================")
    print("📊 RESULTADOS DO SCAN REAL")
    print(f"Cidade analisada: {result.get('cidade')}")
    print(f"Total de Leads encontrados: {result.get('total_leads')}")
    print("==================================================")
    
    pilares = result.get("pilares", {})
    for pilar_id, data in pilares.items():
        print(f"\n🔹 Pilar {pilar_id} - {data.get('nome')}:")
        print(f"   Descrição: {data.get('descricao')}")
        print(f"   Status: {data.get('status')}")
        leads = data.get("leads", [])
        print(f"   Total de Leads Reais Capturados: {len(leads)}")
        
        for idx, lead in enumerate(leads[:5]):
            print(f"\n   [{idx+1}] {lead.get('nome')}")
            print(f"       Urgência: {lead.get('status')} (Score: {lead.get('score_urgencia')})")
            print(f"       Tag: {lead.get('tag')}")
            print(f"       Fonte: {lead.get('link_fonte')}")
            print(f"       Resumo: {lead.get('resumo')}")
            
            # Persiste os leads reais diretamente no banco de dados local SQLite
            lead_data_to_save = {
                "id": lead.get("id"),
                "name": lead.get("nome"),
                "address": lead.get("endereco"),
                "lat": lead.get("lat") or 0,
                "lng": lead.get("lng") or 0,
                "score": float(lead.get("score_urgencia", 8)),
                "justification": lead.get("resumo"),
                "category": lead.get("tag"),
                "responsavel_nome": "Síndico / Responsável Predial",
                "responsavel_contato": lead.get("telefone") or "N/D",
                "phone": lead.get("telefone") or "N/D",
                "email": lead.get("email") or "N/D",
                "website": lead.get("site") or "N/D",
                "source": f"Pilar {pilar_id} ({data.get('nome')})",
                "urgency_score": float(lead.get("score_urgencia", 8)),
                "is_confirmed": True,
                "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "intencao_ativa": True,
                "resumo_sinal": lead.get("resumo"),
                "link_fonte": lead.get("link_fonte"),
                "score_urgencia": lead.get("score_urgencia", 0),
                "categoria_demanda": lead.get("tag"),
                "pilar": pilar_id
            }
            db.upsert_lead(lead_data_to_save)
            print(f"       ✅ Salvo fisicamente no banco de dados local SQLite!")
            
    print("\n==================================================")
    if result.get("total_leads", 0) > 0:
        print("🎉 SUCESSO: Pelo menos 1 lead real foi capturado utilizando os 3 pilares!")
    else:
        print("❌ FALHA: Nenhum lead real foi capturado. Talvez os termos de busca não retornaram nada ou a busca no Bing/DeepSeek falhou.")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(test_real_scan())
