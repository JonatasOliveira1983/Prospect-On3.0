import asyncio
from src.agents.manager_agent import ManagerAgent

async def main():
    manager = ManagerAgent()
    print("Iniciando varredura Sniper para 1 lead...")
    await manager.run_full_scan("Condominios", "Jundiaí")
    print("Varredura concluída.")

if __name__ == "__main__":
    asyncio.run(main())
