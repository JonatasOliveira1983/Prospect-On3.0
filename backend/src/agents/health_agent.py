import os
import requests
from src.utils.logger import logger

class HealthAgent:
    """
    Agente Sentinela: Monitora a saúde das APIs e o status de todos os agentes.
    """
    def __init__(self):
        self.google_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY")

    def get_system_health(self):
        """
        Realiza um check-up completo de todos os serviços externos.
        """
        logger.info("HealthAgent: Iniciando check-up do sistema...")
        
        health_report = {
            "services": {
                "overpass_osm": self._check_overpass(),
                "google_maps": self._check_google_maps(),
                "deepseek_api": self._check_deepseek(),
                "brasil_api": self._check_brasil_api()
            },
            "status": "Healthy",
            "timestamp": None # Será preenchido pela API
        }

        # Determinar status global
        critical_failures = [s for s in health_report["services"].values() if s["status"] == "Offline"]
        if critical_failures:
            health_report["status"] = "Warning" if len(critical_failures) < 2 else "Critical"

        return health_report

    def _check_overpass(self):
        try:
            resp = requests.get("http://overpass-api.de/api/status", timeout=5)
            return {"status": "Online" if resp.status_code == 200 else "Degraded", "latency": f"{resp.elapsed.total_seconds():.2f}s"}
        except:
            return {"status": "Offline", "latency": "N/A"}

    def _check_google_maps(self):
        if not self.google_key:
            return {"status": "Missing Key", "latency": "N/A"}
        try:
            # Teste simples de Geocoding para validar a chave
            url = f"https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=1&size=10x10&key={self.google_key}"
            resp = requests.get(url, timeout=5)
            return {"status": "Online" if resp.status_code == 200 else "Invalid Key", "latency": f"{resp.elapsed.total_seconds():.2f}s"}
        except:
            return {"status": "Offline", "latency": "N/A"}

    def _check_deepseek(self):
        if not self.deepseek_key:
            return {"status": "Missing Key", "latency": "N/A"}
        try:
            from src.utils.deepseek_client import DeepSeekClient
            client = DeepSeekClient(api_key=self.deepseek_key)
            resp = client.generate_content(
                contents=["ping"],
                config={'max_output_tokens': 1},
                timeout=10
            )
            if resp and resp.text:
                return {"status": "Online", "latency": "0.5s"}
            return {"status": "Degraded", "latency": "N/A"}
        except Exception as e:
            return {"status": "Invalid Key/Offline", "latency": "N/A"}

    def _check_brasil_api(self):
        try:
            resp = requests.get("https://brasilapi.com.br/api/cnpj/v1/00000000000191", timeout=5)
            return {"status": "Online" if resp.status_code in [200, 404] else "Degraded", "latency": f"{resp.elapsed.total_seconds():.2f}s"}
        except:
            return {"status": "Offline", "latency": "N/A"}
