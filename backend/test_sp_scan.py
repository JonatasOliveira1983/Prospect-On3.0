import asyncio
import os
import sys

# Adiciona o diretório atual ao path para resolver os imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.agents.manager_agent import ManagerAgent

async def main():
    manager = ManagerAgent()
    print("🎯 [TESTE SP] Iniciando varredura Sniper para São Paulo - SP...")
    # Executa a varredura cirúrgica focada em São Paulo com meta de 1 lead qualificado com obra
    leads_encontrados = await manager.run_full_scan(query="Condominios", city="São Paulo", target_leads=1)
    print(f"🎯 [TESTE SP] Varredura concluída. Total de leads ativos salvos em São Paulo: {leads_encontrados}")

if __name__ == "__main__":
    asyncio.run(main())
