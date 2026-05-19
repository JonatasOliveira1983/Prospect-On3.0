import requests
import json
from src.utils.logger import logger
from datetime import datetime

class ScoutAgent:
    """
    Agente Scout: Responsável por identificar a saúde patrimonial do condomínio via dados públicos.
    Focado em encontrar o CNPJ e calcular a idade do imóvel para o ROI de valorização.
    """
    def __init__(self):
        self.brasil_api_url = "https://brasilapi.com.br/api/cnpj/v1/"
        
    def scout_lead(self, lead_data):
        """
        Enriquece o lead com dados de CNPJ, idade e potencial de valorização.
        """
        name = lead_data.get('name')
        logger.info(f"ScoutAgent: Iniciando prospecção de dados para {name}")
        
        # 1. Tentar encontrar o CNPJ (Heurística de busca ou simulação para protótipo)
        # Em um cenário real, usaríamos uma API de busca por nome (ex: CNPJS.rocks ou Google Search API)
        cnpj = self._search_cnpj_by_name(name)
        
        if not cnpj:
            logger.warning(f"ScoutAgent: CNPJ não encontrado para {name}. Usando estimativa baseada em região.")
            return self._apply_fallback_data(lead_data)
            
        # 2. Consultar BrasilAPI para dados oficiais
        try:
            resp = requests.get(f"{self.brasil_api_url}{cnpj}", timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                foundation_date = data.get('data_inicio_atividade') # Formato YYYY-MM-DD
                
                lead_data['cnpj'] = cnpj
                lead_data['razao_social'] = data.get('razao_social')
                lead_data['foundation_date'] = foundation_date
                
                # Calcular idade
                if foundation_date:
                    year = int(foundation_date.split('-')[0])
                    current_year = datetime.now().year
                    lead_data['building_age'] = current_year - year
                else:
                    lead_data['building_age'] = 15 # Default
                    
                lead_data['cnpj_data'] = data
                logger.info(f"ScoutAgent: Dados oficiais obtidos para {name}. Idade: {lead_data['building_age']} anos.")
            else:
                logger.error(f"ScoutAgent: Erro na BrasilAPI para {cnpj}: {resp.status_code}")
                return self._apply_fallback_data(lead_data)
                
        except Exception as e:
            logger.error(f"ScoutAgent: Falha ao consultar BrasilAPI: {e}")
            return self._apply_fallback_data(lead_data)
            
        # 3. Cálculo de Potencial de Valorização (ROI Morador)
        lead_data = self._calculate_patrimonial_impact(lead_data)
        
        return lead_data

    def _search_cnpj_by_name(self, name):
        """
        Mapeamento de simulação para o protótipo de Jundiaí. 
        Em produção, integraria com uma API de busca por Razão Social.
        """
        mapping = {
            "Condomínio Edifício Solaris": "24546878000180",
            "Jardim Residencial Golden Park": "31278153000105",
            "Residencial Anhangabaú": "05432123000199",
            "Condomínio Veduta": "12345678000199"
        }
        # Tenta match parcial
        for key, val in mapping.items():
            if key.lower() in name.lower() or name.lower() in key.lower():
                return val
        return None

    def _apply_fallback_data(self, lead_data):
        """Aplica dados estimados quando a consulta falha."""
        lead_data['building_age'] = 12
        lead_data['cnpj'] = "Pendente"
        lead_data['foundation_date'] = "2012-01-01"
        return self._calculate_patrimonial_impact(lead_data)

    def _calculate_patrimonial_impact(self, lead_data):
        """
        Calcula o quanto o morador está ganhando ou perdendo.
        Lógica: Prédios > 10 anos perdem ~1.5% de valor de mercado ao ano por falta de renovação estética.
        """
        age = lead_data.get('building_age', 10)
        avg_price = lead_data.get('market', {}).get('avg_m2_price', 7500)
        
        # Gap de valorização (quanto o imóvel valoriza após pintura)
        # Estimativa de mercado: 10% a 20%
        appreciation_rate = 0.12 # 12% fixo para o protótipo
        
        if age > 15: appreciation_rate = 0.18
        elif age > 20: appreciation_rate = 0.25
        
        lead_data['patrimonial_intel'] = {
            'appreciation_potential_pct': appreciation_rate * 100,
            'status': 'CRÍTICO' if age > 15 else 'ALERTA',
            'estimated_loss_per_year_pct': 1.5,
            'message': f"Imóvel com {age} anos. Potencial de valorização imediata de {appreciation_rate*100}% pós-revitalização."
        }
        return lead_data
