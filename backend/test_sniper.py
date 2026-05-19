import asyncio
import os
import sys

# Adicionar o diretório raiz ao sys.path para importações funcionarem
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.agents.manager_agent import ManagerAgent

async def test_persistent_hunter():
    manager = ManagerAgent()
    print("Iniciando Teste Sniper Persistente...")
    # Tenta achar 1 lead em Jundiaí
    count = await manager.run_full_scan(query="Condominios", city="Jundiaí", target_leads=1)
    print(f"Teste finalizado. Leads encontrados: {count}")

if __name__ == "__main__":
    asyncio.run(test_persistent_hunter())
