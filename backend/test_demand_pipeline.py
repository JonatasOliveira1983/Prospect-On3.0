import sys
import os
import time

# Adicionar o diretório raiz ao path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.agents.manager_agent import ManagerAgent
from src.utils.database import Database

def test_pipeline():
    print("🚀 Testando Pipeline de Demanda Ativa...")
    manager = ManagerAgent()
    db = Database()
    
    # 1. Limpar banco para o teste (opcional, mas bom para validar novos campos)
    # db._create_tables() 
    
    # 2. Executar Scan
    print("📡 Disparando Scan Total...")
    count = manager.run_full_scan("São Paulo")
    
    print(f"✅ Varredura concluída. {count} leads processados.")
    
    # 3. Verificar no DB
    leads = db.get_all_leads()
    demand_leads = [l for l in leads if l.get('source') == 'CoteiBem']
    
    if demand_leads:
        print(f"🔥 Sucesso! Encontrado {len(demand_leads)} lead(s) de demanda quente.")
        lead = demand_leads[0]
        print(f"🏢 Nome: {lead['name']}")
        print(f"🏗️ Idade: {lead.get('demand', {}).get('idade')} anos")
        print(f"🚨 Urgência: {lead.get('urgency_score')}")
        print(f"💡 Argumento: {lead.get('demand', {}).get('argumento_venda')}")
    else:
        print("❌ Falha: Nenhum lead de demanda encontrado no DB.")

if __name__ == "__main__":
    test_pipeline()
