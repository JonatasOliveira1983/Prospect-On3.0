"""
LeadEnrichmentAgent: Agente de enriquecimento de leads usando DeepSeek.
Analisa dados textuais dos leads para inferir:
  - Tipo de condomínio (luxo, médio, popular)
  - Sinais de necessidade de pintura
  - Porte estimado (torres, unidades, andares)
  - Canais de contato sugeridos
  - Score de urgência personalizado
"""
import os
import json
from src.utils.logger import logger
from src.utils.usage_monitor import UsageMonitor
from src.utils.deepseek_client import DeepSeekClient
from dotenv import load_dotenv

load_dotenv()


class LeadEnrichmentAgent:
    """
    Agente que usa DeepSeek para enriquecer leads com dados contextuais.
    DeepSeek é excelente com texto — analisa nome, endereço, tipo do lugar
    e infere características relevantes para prospecção de pintura predial.
    """

    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.monitor = UsageMonitor()
        self.client = DeepSeekClient(api_key=self.api_key) if self.api_key else None

    def enrich_lead(self, lead: dict) -> dict:
        """
        Enriquece um lead com análise contextual via DeepSeek.
        Retorna o lead original + campos de enriquecimento.
        """
        if not self.client:
            return self._fallback_enrich(lead)

        name = lead.get("name", "")
        address = lead.get("address", "")
        rating = lead.get("rating", 0)
        phone = lead.get("phone", "N/D")
        website = lead.get("website", "N/D")

        prompt = f"""
        Você é um analista especializado em prospecção comercial para pintura predial (Otto Pinturas).
        Analise este lead extraído de uma base de dados comercial e gere insights acionáveis.

        DADOS DO LEAD:
        - Nome: {name}
        - Endereço: {address}
        - Avaliação Google: {rating}/5 estrelas
        - Telefone: {phone}
        - Website: {website}

        INSTRUÇÕES:
        1. Analise o NOME do condomínio. Nomes como "Royal", "Premium", "Park" indicam alto padrão.
           Nomes como "Vila", "Casa", "Jardim" indicam padrão médio.
           Nomes de bairro apenas indicam padrão popular.
        2. Analise a IDADE provável do prédio: nomes modernos/comerciais = mais novos,
           nomes de bairros tradicionais = mais antigos.
        3. Avalie a NECESSIDADE DE PINTURA baseada no nome + avaliações:
           - Nomes com "Vila", "Antigo", "Tradicional" = mais provável precisar
           - Avaliação baixa (<=3) = possível falta de manutenção
           - Nomes de planta/flor = bem cuidado, menos urgente
        4. Estime porte: "Park", "Resort", "Royal" = grande porte (3-5 torres)
           "Residencial", "Vila" = médio (1-2 torres)
           "Edifício" = vertical único

        Responda APENAS em JSON puro (sem markdown, sem comentários):
        {{
            "tipo_condominio": "luxo|medio|popular",
            "porte_estimado": "grande|medio|pequeno",
            "torres_estimadas": numero (1-5),
            "unidades_estimadas": numero (20-500),
            "andares_estimados": numero (3-30),
            "idade_estimada_anos": numero (0-50),
            "sinal_pintura": "alto|medio|baixo",
            "justificativa_pintura": "string com análise completa em português sobre POR QUE este condomínio precisa de pintura",
            "canais_contato_sugeridos": ["string"],
            "urgencia_pintura_score": numero (0-10),
            "observacoes_comerciais": "string com dicas de abordagem"
        }}
        """

        try:
            response = self.client.generate_content(contents=[prompt])
            if not response:
                return self._fallback_enrich(lead)

            self.monitor.log_usage("deepseek-chat")

            result = response.text.strip()
            # Extrai JSON da resposta (pode vir com markdown)
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()

            enrichment = json.loads(result)

            # Valida campos obrigatórios
            lead["enrichment"] = enrichment
            lead["tipo_condominio"] = enrichment.get("tipo_condominio", "medio")
            lead["porte_estimado"] = enrichment.get("porte_estimado", "medio")
            lead["idade_estimada"] = enrichment.get("idade_estimada_anos", 10)
            lead["urgencia_pintura"] = enrichment.get("urgencia_pintura_score", 5)
            lead["torres_estimadas"] = enrichment.get("torres_estimadas", 1)
            lead["unidades_estimadas"] = enrichment.get("unidades_estimadas", 80)
            lead["andares_estimados"] = enrichment.get("andares_estimados", 8)

            logger.info(f"LeadEnrichmentAgent: {name} - Tipo: {enrichment.get('tipo_condominio')} | Urgência: {enrichment.get('urgencia_pintura_score')}/10")
            return lead

        except json.JSONDecodeError:
            logger.warning(f"LeadEnrichmentAgent: Resposta JSON inválida para {name}. Usando fallback.")
            return self._fallback_enrich(lead)
        except Exception as e:
            logger.error(f"LeadEnrichmentAgent: Erro ao enriquecer {name}: {e}")
            return self._fallback_enrich(lead)

    def _fallback_enrich(self, lead: dict) -> dict:
        """Fallback inteligente quando DeepSeek não está disponível."""
        name = lead.get("name", "").lower()

        # Heurísticas locais baseadas no nome
        is_luxury = any(w in name for w in ["royal", "premium", "park", "resort", "tower", "golden", "platinum", "sunrise", "sunset", "boulevard"])
        is_big = any(w in name for w in ["park", "resort", "garden", "green", "lake", "village"])
        is_old = any(w in name for w in ["vila", "antigo", "tradicional", "centro", "velho", "imperial"])

        lead["enrichment"] = {
            "tipo_condominio": "luxo" if is_luxury else "medio",
            "porte_estimado": "grande" if is_big else "medio",
            "torres_estimadas": 3 if is_big else 1,
            "unidades_estimadas": 200 if is_big else 80,
            "andares_estimados": 15 if is_luxury else 8,
            "idade_estimada_anos": 20 if is_old else 10,
            "sinal_pintura": "alto" if is_old else "medio",
            "justificativa_pintura": "Condomínio identificado para prospecção comercial. Recomenda-se vistoria presencial para avaliação detalhada.",
            "canais_contato_sugeridos": ["Síndico (portaria)", "Administradora", "E-mail corporativo"],
            "urgencia_pintura_score": 7 if is_old else 5,
            "observacoes_comerciais": "Lead identificado via busca automatizada. Recomenda-se abordagem comercial padrão Otto Pinturas."
        }

        lead["tipo_condominio"] = lead["enrichment"]["tipo_condominio"]
        lead["porte_estimado"] = lead["enrichment"]["porte_estimado"]
        lead["idade_estimada"] = lead["enrichment"]["idade_estimada_anos"]
        lead["urgencia_pintura"] = lead["enrichment"]["urgencia_pintura_score"]
        lead["torres_estimadas"] = lead["enrichment"]["torres_estimadas"]
        lead["unidades_estimadas"] = lead["enrichment"]["unidades_estimadas"]
        lead["andares_estimados"] = lead["enrichment"]["andares_estimados"]

        return lead
