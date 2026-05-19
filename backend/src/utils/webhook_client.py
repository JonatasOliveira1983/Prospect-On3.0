import requests
import os
from src.utils.logger import logger
from dotenv import load_dotenv

load_dotenv()

class WebhookClient:
    """
    Responsável por enviar alertas de alta conversão para o time comercial via Evolution API (WhatsApp).
    """
    def __init__(self):
        self.api_url = os.getenv("EVOLUTION_API_URL")
        self.instance = os.getenv("EVOLUTION_INSTANCE")
        self.api_key = os.getenv("EVOLUTION_API_KEY")
        self.target_number = os.getenv("WHATSAPP_NUMBER")

    def send_hot_lead_alert(self, lead):
        """
        Envia um alerta formatado para o WhatsApp via Evolution API.
        """
        if not self.api_url or not self.api_key:
            logger.warning("WebhookClient: Configurações da Evolution API ausentes.")
            return False

        demand = lead.get('demand', {})
        
        # Formatar mensagem baseada no prompt do usuário
        message = (
            f"🔥 *NOVO LEAD DE DEMANDA ATIVA*\n\n"
            f"🏢 *Local:* {lead['name']}\n"
            f"📍 *Endereço:* {lead['address']}\n"
            f"🏗️ *Idade do Prédio:* {demand.get('idade', 'N/A')} anos\n"
            f"🚨 *Urgência:* {lead.get('urgency_score', 0)}/10\n"
            f"💡 *Argumento:* {demand.get('argumento_venda', 'Pintura necessária por ciclo de tempo.')}\n\n"
            f"🔗 *Link:* {lead.get('maps_url', 'Ver no Dashboard')}"
        )

        try:
            url = f"{self.api_url}/message/sendText/{self.instance}"
            headers = {
                "Content-Type": "application/json",
                "apikey": self.api_key
            }
            payload = {
                "number": self.target_number,
                "options": {
                    "delay": 1200,
                    "presence": "composing",
                    "linkPreview": True
                },
                "textMessage": {
                    "text": message
                }
            }
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            if response.status_code in [200, 201]:
                logger.info(f"WebhookClient: Alerta WhatsApp enviado para {lead['name']}")
                return True
            else:
                logger.error(f"WebhookClient: Erro Evolution API (Status {response.status_code}): {response.text}")
                return False
        except Exception as e:
            logger.error(f"WebhookClient: Erro ao disparar Evolution API: {e}")
            return False

if __name__ == "__main__":
    client = WebhookClient()
    # client.send_hot_lead_alert({"name": "Teste", "address": "Rua X", "urgency_score": 9})
