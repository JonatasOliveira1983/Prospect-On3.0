print("Testing api.py imports...")
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
from src.agents.manager_agent import ManagerAgent
from src.agents.health_agent import HealthAgent
print("Imports successful!")
