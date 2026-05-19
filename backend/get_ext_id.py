import asyncio
import os
from playwright.async_api import async_playwright

async def find_extension_id():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Subir para a raiz do projeto (Prospect-On 3.0)
    # inject_mock.py está em backend/
    # Então subir 1 nível.
    project_root = os.path.dirname(base_dir)
    extension_path = os.path.join(project_root, "google-maps-scraper")
    
    print(f"Buscando extensão em: {extension_path}")

    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            os.path.join(base_dir, "data", "temp_profile"),
            headless=True,
            args=[
                f"--disable-extensions-except={extension_path}",
                f"--load-extension={extension_path}",
            ]
        )
        
        # O ID da extensão pode ser obtido via service worker
        background_pages = context.service_workers
        if background_pages:
            for sw in background_pages:
                url = sw.url
                # chrome-extension://<ID>/background.js
                if "chrome-extension://" in url:
                    ext_id = url.split("/")[2]
                    print(f"EXTENSION_ID={ext_id}")
                    return ext_id
        
        await context.close()
    return None

if __name__ == "__main__":
    asyncio.run(find_extension_id())
