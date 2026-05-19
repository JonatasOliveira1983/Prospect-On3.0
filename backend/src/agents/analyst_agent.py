import os
import json
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.utils.deepseek_client import DeepSeekClient
from dotenv import load_dotenv

load_dotenv()

class AnalystAgent:
    """
    Agente especialista em NLP (DeepSeek).
    Analisa contexto comercial e documentos para a Otto Pinturas.
    """
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.monitor = UsageMonitor()
        self.client = DeepSeekClient(api_key=self.api_key) if self.api_key else None

    def analyze_business_context(self, business_data):
        if not self.client:
            return self._mock_commercial_analysis()

        prompt = f"""
        Você é um analista de prospecção especializado em identificar oportunidades para a Otto Pinturas.
        Analise os dados deste lead extraídos do Google Maps:
        {json.dumps(business_data, indent=2)}
        
        Responda APENAS em JSON:
        {{
            "publico_alvo": "string",
            "presenca_digital": "Fraca|Media|Forte",
            "pontos_fortes": ["string"],
            "pontos_fracos": ["string"],
            "match_otto_score": float,
            "argumento_abordagem": "string",
            "servico_recomendado": "string"
        }}
        """
        
        try:
            response = self.client.generate_content(contents=[prompt])
            if not response:
                return self._mock_commercial_analysis()
            
            # Registra uso
            self.monitor.log_usage("deepseek-chat")
            
            result = response.text.strip()
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            return json.loads(result)
        except Exception as e:
            logger.error(f"AnalystAgent: Erro na análise comercial: {e}")
            return self._mock_commercial_analysis()

    def _mock_commercial_analysis(self):
        return {
            "publico_alvo": "Residencial Vertical Alto Padrão",
            "presenca_digital": "Media",
            "pontos_fortes": ["Localização privilegiada"],
            "pontos_fracos": ["Falta de manutenção visível"],
            "match_otto_score": 85.0,
            "argumento_abordagem": "Focar em revitalização patrimonial.",
            "servico_recomendado": "Pintura de Fachada"
        }

    def analyze_document(self, text):
        if not self.client:
            return self._mock_analysis()

        prompt = f"""
        Analise o texto de condomínio e extraia informações sobre obras.
        Responda APENAS em JSON:
        {{
            "obra_detectada": bool,
            "servico": "tipo de servico",
            "valor_estimado": float,
            "data_prevista": "data",
            "urgencia_score": float (0-10),
            "argumento_venda": "argumento persuasivo"
        }}
        Texto: {text[:4000]}
        """
        
        try:
            response = self.client.generate_content(contents=[prompt])
            if not response:
                return self._mock_analysis()
            
            result = response.text.strip()
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            return json.loads(result)
        except Exception as e:
            logger.error(f"AnalystAgent: Erro na análise Gemini: {e}")
            return self._mock_analysis()

    def _mock_analysis(self):
        return {
            "obra_detectada": True,
            "servico": "Manutenção",
            "valor_estimado": 100000.0,
            "urgency_score": 7.0,
            "argumento_venda": "Manutenção necessária."
        }

if __name__ == "__main__":
    agent = AnalystAgent()
