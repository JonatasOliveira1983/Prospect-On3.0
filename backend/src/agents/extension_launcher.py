import asyncio
import os
from playwright.async_api import async_playwright
from src.utils.logger import logger
from src.utils.csv_processor import CSVProcessor
import time

class ExtensionLauncherAgent:
    """
    Agente responsável por lançar o navegador com a extensão de scraping carregada.
    """
    def __init__(self, headless=False):
        self.headless = headless
        # Caminhos robustos (Subindo 4 níveis para chegar na raiz do projeto)
        # __file__ é backend/src/agents/extension_launcher.py
        # dirname(__file__) -> backend/src/agents
        # dirname(dirname) -> backend/src
        # dirname(dirname(dirname)) -> backend
        # dirname(dirname(dirname(dirname))) -> Prospect-On 3.0 (Raiz)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        
        self.extension_path = os.path.join(base_dir, "google-maps-scraper")
        self.user_data_dir = os.path.join(base_dir, "backend", "data", "browser_profile")
        self.download_dir = os.path.join(base_dir, "backend", "data", "imports")
        self.processor = CSVProcessor()
        
        os.makedirs(self.download_dir, exist_ok=True)
        os.makedirs(self.user_data_dir, exist_ok=True)
        
    async def launch(self, query="Condominios em Jundiai"):
        logger.info(f"ExtensionLauncher: Iniciando navegador com extensão de: {self.extension_path}")
        
        if not os.path.exists(self.extension_path):
            logger.error(f"ExtensionLauncher: Pasta da extensão não encontrada em {self.extension_path}")
            return False

        async with async_playwright() as p:
            # Lançar contexto persistente para carregar a extensão
            context = await p.chromium.launch_persistent_context(
                self.user_data_dir,
                headless=self.headless,
                args=[
                    f"--disable-extensions-except={self.extension_path}",
                    f"--load-extension={self.extension_path}",
                    "--start-maximized",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ],
                no_viewport=True,
                accept_downloads=True,
                downloads_path=self.download_dir
            )
            
            # Monitoramento de Downloads (Ponte de Dados)
            files_before = set(os.listdir(self.download_dir))
            
            page = await context.new_page()
            
            # Tentar capturar o ID da extensão para automação futura
            extension_id = None
            try:
                # O ID da extensão pode ser encontrado nos logs de background ou via chrome.management se permitido
                # Por enquanto, vamos orientar o usuário mas tentar abrir o popup se o ID for previsível ou capturável
                logger.info("ExtensionLauncher: Tentando identificar ID da extensão...")
                # ... lógica de captura de ID ...
            except: pass

            # Navegar para o Google Maps com a busca (v3.1 Robustness)
            search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
            logger.info(f"ExtensionLauncher: Navegando para {search_url} (Aguardando DOM)...")
            
            try:
                await page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
                logger.info(f"ExtensionLauncher: Página carregada com sucesso.")
            except Exception as e:
                logger.warning(f"ExtensionLauncher: Timeout ou erro no goto (prosseguindo mesmo assim): {e}")
            
            # Manter o navegador aberto para o usuário ver a ação
            logger.info("ExtensionLauncher: Navegador Sniper Turbo pronto na tela!")
            logger.info("IMPORTANTE: Clique no ícone da extensão (canto superior direito) e aperte 'INICIAR COLETA'.")
            logger.info("Depois, clique em 'DOWNLOAD XLS' para que os leads apareçam no sistema.")
            
            # Loop de espera infinito para manter o processo vivo enquanto o navegador estiver aberto
            try:
                while True:
                    if page.is_closed():
                        break
                    
                    # Checar por novos arquivos a cada 3 segundos
                    files_now = set(os.listdir(self.download_dir))
                    new_files = files_now - files_before
                    for f in new_files:
                        if f.endswith(".xls") or f.endswith(".csv"):
                            full_path = os.path.join(self.download_dir, f)
                            logger.info(f"ExtensionLauncher: Novo arquivo detectado: {f}. Processando...")
                            self.processor.process_file(full_path)
                    
                    files_before = files_now
                    await asyncio.sleep(3)
            except Exception as e:
                logger.info(f"ExtensionLauncher: Navegador fechado ou erro: {e}")
            finally:
                await context.close()
                
        return True

if __name__ == "__main__":
    launcher = ExtensionLauncherAgent()
    asyncio.run(launcher.launch())
