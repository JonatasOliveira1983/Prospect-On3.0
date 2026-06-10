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
        "category": "sindico_administradora",
    },
    "sindicos": {
        "search": "sindico profissional condominio",
        "category": "sindico_administradora",
    },
    "pintura_predial": {
        "search": "pintura predial fachada condominio",
        "category": "pintura_predial",
    },
    "facilities": {
        "search": "facilities manutencao predial empresa",
        "category": "grande_porte",
    },
}

REGIONS = [
    {"name": "Sao Paulo — Zona Sul", "location": "Zona Sul, Sao Paulo, SP, Brasil"},
    {"name": "Sao Paulo — Zona Norte", "location": "Zona Norte, Sao Paulo, SP, Brasil"},
    {"name": "Sao Paulo — Zona Leste", "location": "Zona Leste, Sao Paulo, SP, Brasil"},
    {"name": "Sao Paulo — Zona Oeste", "location": "Zona Oeste, Sao Paulo, SP, Brasil"},
    {"name": "Sao Paulo — Centro", "location": "Centro, Sao Paulo, SP, Brasil"},
    {"name": "Guarulhos — SP", "location": "Guarulhos, SP, Brasil"},
    {"name": "Campinas — SP", "location": "Campinas, SP, Brasil"},
    {"name": "Sao Bernardo do Campo — SP", "location": "Sao Bernardo do Campo, SP, Brasil"},
    {"name": "Santo Andre — SP", "location": "Santo Andre, SP, Brasil"},
    {"name": "Osasco — SP", "location": "Osasco, SP, Brasil"},
    {"name": "Barueri — SP", "location": "Barueri, SP, Brasil"},
]


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
            "proxyConfiguration": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["BUYPROXIES94952"],
            },
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

    def normalize_lead(self, raw: dict, category: str = "", region: str = "") -> dict:
        """
        Normaliza um lead bruto da Apify para o formato interno.
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

        # Score baseado nos dados disponíveis
        score = 5.0
        if phone and email:
            score = 9.0
        elif phone or email:
            score = 7.0
        if website:
            score += 0.5
        if address:
            score += 0.5

        import datetime
        now = datetime.datetime.now().isoformat()

        return {
            "name": name.strip(),
            "address": address.strip() if address else (region or "Sao Paulo, SP"),
            "phone": phone or "N/D",
            "email": email or "N/D",
            "website": website or "N/D",
            "coords": coords,
            "score": min(score, 10.0),
            "category": category or "lead_apify",
            "source": f"Apify — {region or 'SP'}",
            "justification": f"Lead importado via Apify Google Maps — {category} — {region}",
            "urgency_score": 7.0,
            "contact_status": "Aguardando Abordagem",
            "pilar": "M",
            "created_at": now,
            "updated_at": now,
        }


def get_import_stats() -> dict:
    """Retorna estatísticas sobre a importação: regiões, categorias e total estimado."""
    total_regions = len(REGIONS)
    total_categories = len(SEARCH_CONFIGS)
    total_estimated = total_regions * total_categories * 200
    return {
        "regions": total_regions,
        "categories": total_categories,
        "estimated_leads": total_estimated,
        "regions_list": [r["name"] for r in REGIONS],
        "categories_list": list(SEARCH_CONFIGS.keys()),
    }


def import_all_regions(
    token: str,
    db=None,
    max_per_category: int = 200,
    progress_callback=None,
) -> dict:
    """
    Importa leads de todas as regiões e categorias.

    Returns:
        {"imported": int, "skipped": int, "total": int}
    """
    client = ApifyClient(token=token)
    all_leads = []
    total_imported = 0
    total_skipped = 0
    seen_names = set()

    for region in REGIONS:
        region_name = region["name"]
        logger.info(f"ApifyClient: Importando região {region_name}...")

        for cat_key, config in SEARCH_CONFIGS.items():
            logger.info(f"ApifyClient:   Categoria '{cat_key}' em '{region_name}'")

            raw_results = client.run_google_maps_search(
                search=config["search"],
                location=region["location"],
                max_results=max_per_category,
            )

            for raw in raw_results:
                normalized = client.normalize_lead(
                    raw,
                    category=config["category"],
                    region=region_name,
                )
                if not normalized:
                    total_skipped += 1
                    continue

                # Deduplica por nome
                key = normalized["name"].lower().strip()
                if key and key not in seen_names:
                    seen_names.add(key)
                    all_leads.append(normalized)

                    if db:
                        try:
                            db.upsert_lead(normalized)
                            total_imported += 1
                        except Exception as e:
                            logger.warning(f"ApifyClient: Erro ao salvar: {e}")
                            total_skipped += 1
                    else:
                        total_imported += 1

            time.sleep(2)

    logger.info(
        f"ApifyClient: Importação concluída — {total_imported} leads, "
        f"{total_skipped} ignorados, {len(all_leads)} únicos"
    )

    return {
        "imported": total_imported,
        "skipped": total_skipped,
        "total": total_imported + total_skipped,
    }
