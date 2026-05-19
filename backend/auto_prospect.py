import asyncio
import os
import sys
from playwright.async_api import async_playwright

async def auto_prospect(query="Condominios em Jundiai", limit=20):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    extension_path = os.path.join(project_root, "google-maps-scraper")
    user_data_dir = os.path.join(backend_dir, "data", "browser_profile_auto")
    download_dir = os.path.join(backend_dir, "data", "imports")
    
    os.makedirs(download_dir, exist_ok=True)

    print(f"Sniper Turbo: Iniciando missao para {query} ({limit} leads)...")

    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir,
            headless=False,
            args=[
                f"--disable-extensions-except={extension_path}",
                f"--load-extension={extension_path}",
                "--start-maximized"
            ],
            no_viewport=True,
            accept_downloads=True,
            downloads_path=download_dir
        )
        
        maps_page = await context.new_page()
        search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        print(f"Buscando: {search_url}")
        await maps_page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
        
        extension_id = None
        for _ in range(10):
            for sw in context.service_workers:
                if "chrome-extension://" in sw.url:
                    extension_id = sw.url.split("/")[2]
                    break
            if extension_id: break
            await asyncio.sleep(1)
        
        if not extension_id:
            print("Erro: ID da extensao nao encontrado.")
            await context.close()
            return

        popup_page = await context.new_page()
        await popup_page.goto(f"chrome-extension://{extension_id}/popup.html")
        
        print("Realizando Hijack V3 (Promise-based)...")
        await popup_page.evaluate("""
            if (!window.originalQuery) {
                window.originalQuery = chrome.tabs.query;
                chrome.tabs.query = async (query) => {
                    if (query.active && query.currentWindow) {
                        const tabs = await window.originalQuery({ url: "*://www.google.com/maps/*" });
                        return tabs.length > 0 ? [tabs[0]] : [];
                    }
                    return window.originalQuery(query);
                };
            }
            if (typeof init === 'function') init();
        """)
        
        await asyncio.sleep(3)
        
        # Garantir que o slider esteja no valor correto
        await popup_page.fill("#limitSlider", str(limit))
        await popup_page.evaluate("document.getElementById('limitSlider').dispatchEvent(new Event('input'))")
        
        # Forçar ativação do botão se o hijack demorar
        await popup_page.evaluate("document.getElementById('startBtn').disabled = false")
        
        print("Clicando em 'Iniciar Coleta'...")
        await popup_page.click("#startBtn")
        
        print("Coletando leads... Verifique o navegador!")
        
        finished = False
        for i in range(400):
            # Tentar ler o progresso para logar no terminal
            try:
                count = await popup_page.inner_text("#progressCount")
                if count != "0 / ?":
                    print(f"Progresso: {count}", end='\r')
            except: pass

            if await popup_page.is_visible("#downloadBtn"):
                print("\nDownload disponivel!")
                finished = True
                break
            await asyncio.sleep(2)
        
        if finished:
            print("Iniciando Download...")
            async with popup_page.expect_download() as download_info:
                await popup_page.click("#downloadBtn")
            download = await download_info.value
            save_path = os.path.join(download_dir, download.suggested_filename)
            await download.save_as(save_path)
            print(f"Sucesso! Leads salvos em: {save_path}")
        else:
            print("\nErro: A coleta excedeu o tempo limite.")
            
        await asyncio.sleep(5)
        await context.close()

if __name__ == "__main__":
    q = sys.argv[1] if len(sys.argv) > 1 else "Condominios em Jundiai"
    asyncio.run(auto_prospect(q))
