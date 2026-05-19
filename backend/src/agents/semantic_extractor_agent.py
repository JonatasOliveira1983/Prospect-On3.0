import os
import json
import re
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.utils.deepseek_client import DeepSeekClient
from dotenv import load_dotenv

load_dotenv()

class SemanticExtractorAgent:
    """
    SemanticExtractorAgent: Especialista em extração e estruturação semântica.
    Usa o poder de raciocínio do DeepSeek para processar o texto bruto (DOM/Telas)
    coletado do Google Maps, ignorando a fragilidade de seletores CSS tradicionais.
    """
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.monitor = UsageMonitor()
        self.client = DeepSeekClient(api_key=self.api_key) if self.api_key else None

    def extract_semantic_data(self, name: str, address: str, raw_text: str) -> dict:
        """
        Lê o texto desestruturado da página de detalhes do Maps e extrai contatos higienizados.
        Garante que o lead atenda ao perfil comercial e qualifica a entrada.
        """
        logger.info(f"SemanticExtractorAgent: Iniciando extração semântica para '{name}'...")
        
        if not self.client:
            logger.warning("SemanticExtractorAgent: Cliente DeepSeek não configurado. Usando fallback local.")
            return self._fallback_extraction(name, address, raw_text)

        prompt = f"""
        Você é um agente especialista em inteligência de dados comerciais e prospecção de condomínios da Otto Pinturas.
        Sua missão é ler o TEXTO BRUTO extraído da tela do Google Maps para o local abaixo e extrair dados semânticos com extrema fidelidade.

        IDENTIFICAÇÃO BÁSICA:
        - Nome Coletado: {name}
        - Endereço Coletado: {address}

        TEXTO BRUTO DE DETALHES (TELA DO MAPS):
        \"\"\"{raw_text}\"\"\"

        INSTRUÇÕES DE EXTRAÇÃO:
        1. QUALIFICAÇÃO DE PERFIL: Avalie se o nome ou texto indicam um estabelecimento lixo/comercial que NÃO seja condomínio (Ex: imobiliárias, corretores, clínicas, hotéis, restaurantes, escritórios de advocacia, escolas, igrejas). Condomínios residenciais ou comerciais com torres prediais são o foco ideal.
        2. EXTRAÇÃO DE CONTATOS: Identifique no texto qualquer número de telefone (portaria, zeladoria, administração), e-mail (@gmail, @condominio, @administradora) ou link social (Instagram, Facebook).
        3. HIGIENIZAÇÃO DE TELEFONE/WHATSAPP: Extraia apenas os dígitos. Se parecer um número de celular brasileiro (geralmente começa com 9), monte o link ou telefone limpo. Remova parênteses, espaços e traços. Se for telefone fixo ou celular, marque apropriadamente.
        4. WEBSITE CORPORATIVO: Extraia o site oficial real. Ignore links do próprio Google, maps, ou sites de reviews secundários.

        Responda APENAS em JSON puro (sem bloco de marcação markdown, sem comentários, sem textos extras):
        {{
            "qualificado": true|false,
            "motivo_desqualificacao": "string se qualificado for false, senão vazio",
            "nome_oficial": "Nome limpo e formal do condomínio",
            "endereco_higienizado": "Endereço completo estruturado",
            "telefones": ["Apenas dígitos com DDD, ex: 1134567890"],
            "whatsapp": "Apenas dígitos de celular com DDD, ex: 11987654321, ou nulo se não houver",
            "email": "E-mail válido encontrado ou nulo se não houver",
            "website": "URL oficial ou nulo se não houver",
            "redes_sociais": {{
                "instagram": "URL ou nulo",
                "facebook": "URL ou nulo"
            }},
            "porte_estimado": "pequeno|medio|grande",
            "tipo_predio": "residencial|comercial|misto|desconhecido"
        }}
        """

        try:
            response = self.client.generate_content(contents=[prompt])
            if not response:
                return self._fallback_extraction(name, address, raw_text)

            self.monitor.log_usage("deepseek-chat")
            result = response.text.strip()
            
            # Extrai JSON caso venha encapsulado em Markdown
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()

            extracted_data = json.loads(result)
            logger.info(f"SemanticExtractorAgent: Sucesso na extração semântica para '{name}'. Qualificado: {extracted_data.get('qualificado')}")
            return extracted_data

        except Exception as e:
            logger.error(f"SemanticExtractorAgent: Falha na extração de '{name}': {e}")
            return self._fallback_extraction(name, address, raw_text)

    def _fallback_extraction(self, name: str, address: str, raw_text: str) -> dict:
        """Heurísticas de fallback local caso a chamada do DeepSeek falhe."""
        logger.info(f"SemanticExtractorAgent: Acionando fallback local para '{name}'")
        
        # Regex básica para telefone
        phones = []
        phone_match = re.findall(r'(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})', raw_text)
        for p in phone_match:
            digits = re.sub(r'\D', '', p)
            if len(digits) >= 8:
                phones.append(digits)
        
        # Regex básica para e-mail
        email = None
        email_match = re.search(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', raw_text)
        if email_match:
            email = email_match.group(0)

        # Regra simples de qualificação
        name_lower = name.lower()
        negative_keywords = ['advocacia', 'escola', 'hotel', 'restaurante', 'imobiliaria', 'corretor', 'clinica']
        qualificado = not any(kw in name_lower for kw in negative_keywords)

        return {
            "qualificado": qualificado,
            "motivo_desqualificacao": "" if qualificado else "Palavra-chave negativa no nome",
            "nome_oficial": name,
            "endereco_higienizado": address,
            "telefones": list(set(phones))[:2],
            "whatsapp": phones[0] if (phones and phones[0].startswith('9') or (len(phones) > 0 and len(phones[0]) == 11)) else None,
            "email": email,
            "website": None,
            "redes_sociais": {
                "instagram": None,
                "facebook": None
            },
            "porte_estimado": "medio",
            "tipo_predio": "residencial" if "residencial" in name_lower or "condominio" in name_lower else "desconhecido"
        }
