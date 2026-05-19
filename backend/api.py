from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import json
from concurrent.futures import ThreadPoolExecutor
from src.engine.smart_enrichment import SmartEnrichment
from src.utils.report_generator import ReportGenerator
from src.utils.database import Database
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.agents.manager_agent import ManagerAgent
from src.agents.health_agent import HealthAgent
from src.agents.extension_launcher import ExtensionLauncherAgent
import threading
import asyncio
from datetime import datetime
from typing import List

app = FastAPI(title="Prospect-On API Server")
db = Database()
usage_monitor = UsageMonitor()
manager = ManagerAgent()
health_monitor = HealthAgent()
extension_launcher = ExtensionLauncherAgent()
executor = ThreadPoolExecutor(max_workers=4)

# Gerenciador de conexões WebSocket para Logs Ativos
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager_ws = ConnectionManager()
manager.set_ws_manager(manager_ws) # Injetar o gerenciador no ManagerAgent

# Configurar CORS para o Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, use a URL do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos (Imagens, Vistorias, Reports)
static_dir = os.path.join(os.path.dirname(__file__), "static")
vistorias_dir = os.path.join(static_dir, "vistorias")
os.makedirs(vistorias_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Legado: Servir imagens de dados
images_dir = os.path.join(os.path.dirname(__file__), "data", "images")
os.makedirs(images_dir, exist_ok=True)
app.mount("/api/images", StaticFiles(directory=images_dir), name="images")

# Modelos de Dados
class LeadData(BaseModel):
    name: str
    address: str
    phone: str = None
    email: str = None
    website: str = None
    coords: dict = None

class InteractionData(BaseModel):
    notes: str
    return_date: str = None
    contact_status: str = 'Aguardando Abordagem'
    email_sent_at: str = None
    vision_image_url: str = None

class FavoriteData(BaseModel):
    is_favorite: bool

# Instanciar Motores
enricher = SmartEnrichment()
report_gen = ReportGenerator()

@app.get("/")
async def root():
    return {"status": "Prospect-On API is running"}

@app.post("/api/analyze-lead")
async def analyze_lead(lead: LeadData):
    try:
        # Converter Pydantic para Dict
        lead_dict = lead.model_dump()
        logger.info(f"API: Recebido analyze-lead para {lead_dict.get('name')}")
        
        # 1. Enriquecer (Street View + Satellite + Vision + ROI + Proposta)
        enriched_lead = enricher.enrich_lead(lead_dict)
        if not enriched_lead or not isinstance(enriched_lead, dict):
            logger.error("API: enrich_lead retornou um valor inválido (None ou não-dict)")
            enriched_lead = lead_dict # Fallback para os dados originais se falhar

        logger.info(f"API: Enriquecimento concluído para {enriched_lead.get('name')}")
        
        # 2. Gerar Relatório PDF
        try:
            report_path = report_gen.generate_valuation_report(enriched_lead)
            logger.info(f"API: Relatório gerado em {report_path}")
        except Exception as e:
            logger.error(f"API: Falha ao gerar relatório: {e}")
            report_path = "reports/erro_geracao.pdf"
        
        # 3. Sincronizar com Banco de Dados (v4.0 SQL Level)
        try:
            db.upsert_lead(enriched_lead)
            logger.info("API: Lead sincronizado no DB")
        except Exception as e:
            logger.error(f"API: Falha ao sincronizar DB: {e}")
        
        # 4. Converter caminhos de imagem para URLs acessíveis (Sincronizado v7.1)
        port = "8002"
        base_url = f"http://localhost:{port}"
        
        # Processar imagens estáticas novas (/static/vistorias)
        if enriched_lead.get('vision_image_url') and enriched_lead['vision_image_url'].startswith('/static'):
            enriched_lead['vision_image_url'] = f"{base_url}{enriched_lead['vision_image_url']}"
        
        # Processar imagens legadas (/api/images)
        for key in ['vision_image_path', 'satellite_image_path', 'location_map_path', 'facade_image_path']:
            path = enriched_lead.get(key)
            if path:
                filename = os.path.basename(path)
                url = f"{base_url}/api/images/{filename}"
                enriched_lead[key.replace('_path', '_url')] = url
                
                # Sincronização v3.0
                if key in ['vision_image_path', 'facade_image_path']:
                    enriched_lead['vision_image_url'] = url

        return {
            "success": True,
            "lead": enriched_lead,
            "report_url": f"{base_url}/api/reports/{os.path.basename(report_path)}"
        }
    except Exception as e:
        logger.error(f"API: Erro crítico no motor 3.0: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Erro no Motor 3.0: {str(e)}")

@app.get("/api/leads")
async def get_leads():
    try:
        leads = db.get_all_leads()
        port = "8002"
        base_url = f"http://localhost:{port}"
        
        # Converter URLs relativas para absolutas para o frontend
        for lead in leads:
            if lead.get('vision_image_url') and lead['vision_image_url'].startswith('/static'):
                lead['vision_image_url'] = f"{base_url}{lead['vision_image_url']}"
        
        return leads
    except Exception as e:
        logger.error(f"Erro ao buscar leads no DB: {e}")
        return []

@app.get("/api/leads/by-slug/{slug}")
async def get_lead_by_slug(slug: str):
    """Busca um lead pelo slug (nome sanitizado)."""
    try:
        leads = db.get_all_leads()
        # Helper simples para encontrar por slug
        def to_slug(text):
            import unicodedata
            import re
            text = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode('utf-8')
            return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

        for lead in leads:
            if to_slug(lead.get('name', '')) == slug:
                return lead
        
        raise HTTPException(status_code=404, detail="Condomínio não encontrado")
    except Exception as e:
        logger.error(f"Erro ao buscar lead por slug {slug}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/leads/{lead_id}/interaction")
async def save_lead_interaction(lead_id: str, data: InteractionData):
    """Salva a interação com o lead (anotações, retorno, status, data de email e URL de fachada)."""
    try:
        logger.info(f"API: Salvando interação comercial para lead_id={lead_id} | Status: {data.contact_status}")
        success = db.save_interaction(lead_id, data.notes, data.return_date, data.contact_status, data.email_sent_at, data.vision_image_url)
        if success:
            return {"success": True, "message": "Interação comercial salva com sucesso."}
        else:
            raise HTTPException(status_code=500, detail="Erro ao salvar interação no banco de dados.")
    except Exception as e:
        logger.error(f"API: Erro ao salvar interação: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/leads/{lead_id}/favorite")
async def toggle_lead_favorite(lead_id: str, data: FavoriteData):
    """Marca ou desmarca um lead como favorito (Leads Quentes)."""
    try:
        logger.info(f"API: Alternando favorito para lead_id={lead_id} para {data.is_favorite}")
        success = db.toggle_favorite(lead_id, data.is_favorite)
        if success:
            return {"success": True, "message": "Estado do favorito atualizado."}
        else:
            raise HTTPException(status_code=500, detail="Erro ao alternar favorito no banco de dados.")
    except Exception as e:
        logger.error(f"API: Erro ao alternar favorito: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/leads/clear")
async def clear_leads():
    """Limpa todos os leads do banco de dados."""
    try:
        success = db.clear_all_leads()
        if success:
            return {"success": True, "message": "Banco de dados limpo."}
        else:
            raise HTTPException(status_code=500, detail="Erro ao limpar banco de dados.")
    except Exception as e:
        logger.error(f"API: Erro ao limpar leads: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scan/start")
async def start_scan(query: str = "Condominios", city: str = "Jundiaí", target: int = 1):
    """Dispara a varredura completa Sniper (Discovery + Enrichment) em background."""
    try:
        logger.info(f"API: Disparando varredura Sniper para {query} em {city} (Objetivo: {target})...")
        
        async def trigger():
            await manager.run_full_scan(query, city, target_leads=target)
            
        asyncio.create_task(trigger())
        return {"success": True, "message": f"Varredura Sniper iniciada para {query} em {city}. Objetivo: {target} lead(s)."}
    except Exception as e:
        logger.error(f"Erro ao iniciar varredura: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sniper/start")
async def start_sniper_scan(query: str = "Condominios", city: str = "Jundiaí"):
    """Dispara a varredura Sniper (Google Maps Browser). Agora unificado com o scan principal."""
    return await start_scan(query, city)

@app.post("/api/scan/extension")
async def start_extension_scan(query: str = "Condominios", city: str = "Jundiaí"):
    """Lança o navegador com a extensão Sniper carregada para busca ultra-rápida."""
    try:
        full_query = f"{query} em {city}"
        logger.info(f"API: Lançando navegador com extensão para: {full_query}")
        
        # Rodar o launcher em uma thread separada para não bloquear a API
        def run_launcher():
            asyncio.run(extension_launcher.launch(full_query))
            
        threading.Thread(target=run_launcher, daemon=True).start()
        
        return {"success": True, "message": "Navegador Sniper aberto com a extensão carregada."}
    except Exception as e:
        logger.error(f"Erro ao lançar extensão: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/system/health")
async def get_health():
    """Retorna o status de saúde de todas as APIs e serviços."""
    try:
        report = health_monitor.get_system_health()
        report["timestamp"] = datetime.now().isoformat()
        return report
    except Exception as e:
        logger.error(f"Erro no monitor de saúde: {e}")
        return {"status": "Error", "message": str(e)}

@app.get("/api/usage")
async def get_usage():
    """Retorna estatísticas de consumo de IA."""
    try:
        return usage_monitor.get_all_stats()
    except Exception as e:
        logger.error(f"Erro ao buscar uso: {e}")
        return []

@app.get("/api/reports/{filename}")
async def get_report(filename: str):
    file_path = os.path.join("reports", filename)
    if os.path.exists(file_path):
        return FileResponse(
            file_path, 
            media_type="application/pdf", 
            filename=filename,
            headers={"Access-Control-Allow-Origin": "*", "Cross-Origin-Resource-Policy": "cross-origin"}
        )
    raise HTTPException(status_code=404, detail="Relatório não encontrado")

@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """Serviço de imagens com Bypass de ORB/CORS (v6.1 Clean)."""
    file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "images", filename))
    if os.path.exists(file_path):
        return FileResponse(
            file_path, 
            media_type="image/jpeg", 
            headers={"Access-Control-Allow-Origin": "*", "Cross-Origin-Resource-Policy": "cross-origin"}
        )
    raise HTTPException(status_code=404, detail="Imagem não encontrada")

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await manager_ws.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Manter conexão aberta
    except WebSocketDisconnect:
        manager_ws.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
