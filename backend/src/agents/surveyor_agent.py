import os
import json
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.utils.deepseek_client import DeepSeekClient

class SurveyorAgent:
    """
    Agente Agrimensor: Responsável por medir e quantificar o condomínio.
    Usa DeepSeek para análise textual (imagens são ignoradas — fallback para métricas mock).
    """
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        self.monitor = UsageMonitor()
        self.client = DeepSeekClient(api_key=self.api_key) if self.api_key else None

    def analyze_quantities(self, facade_path, satellite_path=None):
        """
        Analisa dados do condomínio.
        DeepSeek é text-only (não analisa imagens), então sempre usamos fallback mock.
        """
        logger.info("SurveyorAgent: DeepSeek não suporta análise de imagem. Usando fallback.")
        return self._get_fallback_data()

    def _get_fallback_data(self):
        return {
            "e_um_predio": True,
            "total_torres": 1,
            "andares_por_torre": 8,
            "estimativa_area_m2": 4500.0,
            "desgaste": "Medio",
            "patologias": ["Sinais leves de umidade", "Fissuras superficiais"],
            "tipo_edificacao": "Residencial",
            "complexidade_obra": "Media",
            "observacao_metrica": "Vistoria visual automatizada via IA pendente (DeepSeek é text-only — usando estimativa técnica local segura)."
        }
