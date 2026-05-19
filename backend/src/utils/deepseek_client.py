"""
Cliente DeepSeek via API REST direta (formato compatível com OpenAI).
Substitui o GeminiClient como motor de IA principal do sistema.

DeepSeek API:
  - Endpoint: https://api.deepseek.com/chat/completions
  - Modelos: deepseek-chat (padrão), deepseek-reasoner
  - Formato: OpenAI-compatible (messages array)
  - Autenticação: Bearer token no header
  - Apenas texto (sem suporte a imagem/visão)
"""
import os
import json
from typing import Optional

from PIL import Image

from src.utils.logger import logger


class DeepSeekResponse:
    """Wrapper para simular response.text do GeminiClient."""
    def __init__(self, text: str):
        self.text = text


class DeepSeekClient:
    """
    Cliente DeepSeek que chama a API REST diretamente no formato OpenAI-compatible.
    Não faz nenhuma importação pesada ou verificação de rede no construtor.
    """

    API_BASE = "https://api.deepseek.com"
    CHAT_ENDPOINT = f"{API_BASE}/chat/completions"

    def __init__(self, api_key: Optional[str] = None, model: str = "deepseek-chat"):
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        self.model = model

    def generate_content(
        self,
        contents: list,
        config: Optional[dict] = None,
        timeout: int = 30,
    ) -> Optional[DeepSeekResponse]:
        """
        Envia requisição para a API DeepSeek (formato OpenAI-compatible).

        Args:
            contents: Lista de strings (texto). Imagens (PIL Images) são ignoradas
                      pois DeepSeek não suporta análise de imagem — o sistema usará
                      fallback mock para essas chamadas.
            config: Parâmetros opcionais (max_tokens, temperature, etc).
            timeout: Timeout em segundos.

        Returns:
            DeepSeekResponse com .text ou None em caso de erro.
        """
        if not self.api_key:
            logger.warning("DeepSeekClient: DEEPSEEK_API_KEY não configurada")
            return None

        # Extrair texto dos contents, ignorando imagens (DeepSeek é text-only)
        text_parts = []
        has_images = False
        for item in contents:
            if isinstance(item, str):
                text_parts.append(item)
            elif isinstance(item, Image.Image):
                has_images = True

        if has_images:
            logger.info("DeepSeekClient: Imagens ignoradas (modelo text-only). Usando apenas prompts de texto.")

        if not text_parts:
            logger.warning("DeepSeekClient: Nenhum conteúdo de texto válido para enviar")
            return None

        # Monta o prompt combinando todos os textos
        combined_prompt = "\n\n".join(text_parts)

        # Constrói a mensagem no formato OpenAI
        messages = [
            {"role": "user", "content": combined_prompt}
        ]

        # Parâmetros da requisição
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
        }

        # Adiciona config se fornecido
        if config:
            # Mapeia parâmetros compatíveis
            if "max_output_tokens" in config:
                payload["max_tokens"] = config["max_output_tokens"]
            if "temperature" in config:
                payload["temperature"] = config["temperature"]
            if "top_p" in config:
                payload["top_p"] = config["top_p"]
            if "stop" in config:
                payload["stop"] = config["stop"]

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            # Import lazy do requests para evitar hangs no Windows
            import requests
            logger.info(f"DeepSeekClient: Chamando {self.model}...")
            resp = requests.post(
                self.CHAT_ENDPOINT,
                json=payload,
                headers=headers,
                timeout=timeout
            )
            resp.raise_for_status()
            data = resp.json()

            # Extrai o texto no formato OpenAI-compatible
            choices = data.get("choices", [])
            if not choices:
                logger.warning("DeepSeekClient: Resposta sem choices")
                return None

            content = choices[0].get("message", {}).get("content", "")
            if not content:
                logger.warning("DeepSeekClient: Resposta vazia")
                return None

            return DeepSeekResponse(text=content.strip())

        except requests.exceptions.Timeout:
            logger.error("DeepSeekClient: Timeout na requisição")
            return None
        except requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response is not None else "?"
            body = e.response.text[:300] if e.response is not None else ""
            logger.error(f"DeepSeekClient: HTTP {status} - {body}")
            return None
        except Exception as e:
            logger.error(f"DeepSeekClient: Erro inesperado: {e}")
            return None
