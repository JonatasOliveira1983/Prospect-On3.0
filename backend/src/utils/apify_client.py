"""
ApifyClient — Integração com Apify para importação de leads.

Usa o Google Maps Scraper da Apify para buscar:
  - Administradoras de condomínios
  - Síndicos profissionais
  - Empresas de facilities/pintura predial

Cada lead importado vem com: nome, telefone, email, endereço, site, coordenadas.
"""
import os
import re
import json
import time
import requests
from src.utils.logger import logger
from dotenv import load_dotenv

load_dotenv()

APIFY_TOKEN = os.getenv("APIFY_API_TOKEN", "")
APIFY_BASE = "https://api.apify.com/v2"

GOOGLE_MAPS_ACTOR = "compass~google-maps-extractor"

SEARCH_CONFIGS = {
    "administradoras": {
        "search": "administradora de condominios",
        "location": "Sao Paulo, SP, Brasil",
        "maxResults": 200,
        "category": "sindico_administradora",
    },
    "sindicos": {
        "search": "sindico profissional condominio",
        "location": "Sao Paulo, SP, Brasil",
        "maxResults": 200,
        "category": "sindico_administradora",
    },
    "pintura_predial": {
        "search": "pintura predial fachada condominio",
        "location": "Sao Paulo, SP, Brasil",
        "maxResults": 200,
        "category": "pintura_predial",
    },
    "facilities": {
        "search": "facilities manutencao predial empresa",
        "location": "Sao Paulo, SP, Brasil",
        "maxResults": 200,
        "category": "grande_porte",
    },
}


class ApifyClient:
    """Cliente para interagir com a API da Apify."""

    def __init__(self, token: str = None):
        self.token = token or APIFY_TOKEN
        if not self.token:
            logger.warning("ApifyClient: APIFY_API_TOKEN não configurado no .env")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def run_google_maps_search(
        self,
        search: str,
        location: str = "Sao Paulo, SP, Brasil",
        max_results: int = 200,
        language: str = "pt-BR",
    ) -> list[dict]:
        """
        Executa o ator Google Maps Scraper e retorna os resultados.

        Args:
            search: Termo de busca (ex: "administradora de condominios")
            location: Localização (ex: "Sao Paulo, SP, Brasil")
            max_results: Máximo de resultados (padrão 200)

        Returns:
            Lista de dicts com os leads encontrados
        """
        if not self.token:
            logger.error("ApifyClient: Token não configurado")
            return []

        logger.info(f"ApifyClient: Buscando '{search}' em '{location}'...")

        # Input do ator
        actor_input = {
            "searchStringsArray": [search],
            "locationQuery": location,
            "maxCrawledPlacesPerSearch": max_results,
            "language": language,
            "maxImages": 0,
            "maxReviews": 0,
            "includeOpeningHours": "no",
            "includePopularTimes": "no",
            "includeQuestionsAndAnswers": "no",
            "includePeopleAlsoSearch": "no",
            "scrapeReviewerName": False,
            "scrapeReviewerId": False,
            "scrapeReviewerUrl": False,
            "scrapeResponseFromOwnerText": False,
            "scrapeDescription": True,
            "scrapeCategory": True,
            "scrapeAdditionalInfo": True,
            "scrapeServiceOptions": True,
            "debug": False,
        }

        try:
            # Inicia o ator
            run_url = f"{APIFY_BASE}/acts/{GOOGLE_MAPS_ACTOR}/runs"
            resp = requests.post(
                run_url,
                headers=self.headers,
                json=actor_input,
                timeout=30,
            )

            if resp.status_code != 201:
                logger.error(f"ApifyClient: Erro ao iniciar ator: {resp.status_code} {resp.text[:200]}")
                return []

            run_data = resp.json()
            run_id = run_data["data"]["id"]
            logger.info(f"ApifyClient: Ator iniciado, run_id={run_id}")

            # Aguarda a conclusão (polling)
            dataset_id = self._wait_for_completion(run_id)

            if not dataset_id:
                logger.error("ApifyClient: Ator não completou ou não gerou dataset")
                return []

            # Baixa os resultados
            results = self._fetch_dataset(dataset_id)
            logger.info(f"ApifyClient: {len(results)} resultados baixados para '{search}'")

            return results

        except Exception as e:
            logger.error(f"ApifyClient: Erro ao executar ator: {e}")
            return []

    def _wait_for_completion(self, run_id: str, timeout: int = 600) -> str | None:
        """Aguarda o ator terminar e retorna o dataset_id."""
        status_url = f"{APIFY_BASE}/acts/{GOOGLE_MAPS_ACTOR}/runs/{run_id}"
        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                resp = requests.get(status_url, headers=self.headers, timeout=15)
                if resp.status_code != 200:
                    time.sleep(10)
                    continue

                data = resp.json()
                status = data.get("data", {}).get("status", "")
                
                logger.info(f"ApifyClient: Status={status}")

                if status in ("SUCCEEDED", "succeeded"):
                    default_dataset_id = data.get("data", {}).get("defaultDatasetId", "")
                    return default_dataset_id

                if status in ("FAILED", "TIMED-OUT", "ABORTED", "failed", "timed-out", "aborted"):
                    logger.error(f"ApifyClient: Ator finalizou com status {status}")
                    return None

                time.sleep(15)

            except Exception as e:
                logger.warning(f"ApifyClient: Erro no polling: {e}")
                time.sleep(15)

        logger.error(f"ApifyClient: Timeout aguardando conclusao do ator")
        return None

    def _fetch_dataset(self, dataset_id: str) -> list[dict]:
        """Baixa todos os itens do dataset."""
        items_url = f"{APIFY_BASE}/datasets/{dataset_id}/items?format=json&clean=true"
        all_items = []

        try:
            resp = requests.get(items_url, headers=self.headers, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list):
                    all_items = data
                elif isinstance(data, dict) and "items" in data:
                    all_items = data["items"]
                else:
                    all_items = [data] if data else []
        except Exception as e:
            logger.error(f"ApifyClient: Erro ao baixar dataset: {e}")

        return all_items

    def normalize_lead(self, raw: dict, category: str = "") -> dict:
        """
        Normaliza um lead bruto da Apify para o formato interno.

        Campos de entrada (Apify Google Maps Scraper):
          - title, subTitle, description
          - phone, phoneUnformatted, phones[]
          - email, emails[]
          - website, location {lat, lng}
          - address, street, city, postalCode, state
          - categoryName, additionalInfo {}, serviceOptions {}
        """
        name = raw.get("title", "")
        if not name:
            return None

        # Telefone
        phone = raw.get("phoneUnformatted") or raw.get("phone", "")
        if not phone:
            phones = raw.get("phones", [])
            if phones:
                phone = phones[0].get("phoneUnformatted") or phones[0].get("phone", "")

        # Email
        email = raw.get("email", "")
        if not email:
            emails = raw.get("emails", [])
            if emails:
                email = emails[0]

        # Endereço
        address = raw.get("address", "")
        if not address:
            street = raw.get("street", "")
            city = raw.get("city", "")
            state = raw.get("state", "")
            postal = raw.get("postalCode", "")
            address = f"{street}, {city} - {state}, {postal}".strip(", -")

        # Website
        website = raw.get("website", "") or raw.get("companyUrl", "")

        # Coordenadas
        coords = None
        loc = raw.get("location", {})
        if loc and loc.get("lat") and loc.get("lng"):
            coords = {"lat": loc["lat"], "lng": loc["lng"]}

        # Categoria / descrição
        description = raw.get("description", "") or raw.get("subTitle", "")
        apify_category = raw.get("categoryName", "")

        # Score baseado na qualidade dos dados
        score = 5.0
        if phone and email:
            score = 9.0
        elif phone or email:
            score = 7.0
        if website:
            score += 0.5
        if address:
            score += 0.5

        return {
            "name": name.strip(),
            "address": address.strip() if address else "São Paulo, SP",
            "phone": phone or "N/D",
            "email": email or "N/D",
            "website": website or "N/D",
            "coords": coords,
            "score": min(score, 10.0),
            "category": category or "lead_apify",
            "source": f"Apify Google Maps — {apify_category or category}",
            "justification": description.strip() if description else f"Lead importado via Apify — {category}",
            "urgency_score": 7.0,
            "contact_status": "Aguardando Abordagem",
            "pilar": "M",  # M = Manual / Importado
        }


def import_leads_for_city(token: str, city: str = "Sao Paulo, SP, Brasil", max_per_category: int = 200) -> list[dict]:
    """
    Função de conveniência: importa leads de todas as categorias para uma cidade.

    Returns:
        Lista de leads normalizados prontos para salvar no banco.
    """
    client = ApifyClient(token=token)
    all_leads = []

    for config_key, config in SEARCH_CONFIGS.items():
        logger.info(f"ApifyClient: Importando categoria '{config_key}'...")

        raw_results = client.run_google_maps_search(
            search=config["search"],
            location=city,
            max_results=config["maxResults"],
        )

        for raw in raw_results:
            normalized = client.normalize_lead(raw, category=config["category"])
            if normalized:
                all_leads.append(normalized)

        logger.info(f"ApifyClient: {len(raw_results)} brutos -> {sum(1 for l in all_leads if l['category'] == config['category'])} normalizados para '{config_key}'")

        # Pequena pausa entre buscas para não sobrecarregar
        time.sleep(2)

    # Deduplica por nome
    seen = set()
    unique = []
    for lead in all_leads:
        key = lead["name"].lower().strip()
        if key and key not in seen:
            seen.add(key)
            unique.append(lead)

    logger.info(f"ApifyClient: {len(unique)} leads únicos após deduplicação")
    return unique
