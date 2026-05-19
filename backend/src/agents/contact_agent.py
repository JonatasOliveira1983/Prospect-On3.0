import requests
import os
import json
from src.utils.logger import logger
from datetime import datetime

class ContactAgent:
    """
    Agente de Contato: Responsável por descobrir CNPJ, Administradora e Síndico.
    """
    def __init__(self):
        self.br_api_url = "https://brasilapi.com.br/api/cnpj/v1"

    def enrich_contact_data(self, lead_name, city="São Paulo"):
        """
        Tenta encontrar o CNPJ e os contatos reais do condomínio.
        """
        logger.info(f"ContactAgent: Buscando dados reais para {lead_name}...")
        
        # 1. Tentar encontrar o CNPJ (Aqui integraríamos uma busca por nome)
        # Por enquanto, simulamos a busca. No futuro, podemos usar APIs como CNPJ.ws ou Leadster
        cnpj = self._search_cnpj_by_name(lead_name, city)
        
        if not cnpj:
            return self._get_fallback_contacts()

        # 2. Consultar dados profundos via BrasilAPI
        try:
            resp = requests.get(f"{self.br_api_url}/{cnpj}", timeout=15)
            if resp.status_code != 200:
                return self._get_fallback_contacts()
            
            data = resp.json()
            
            # Extrair contatos e responsáveis
            qsa = data.get('qsa', [])
            sindico = qsa[0].get('nome_socio') if qsa else "Não identificado no QSA"
            
            # Administradora: Muitas vezes aparece no nome fantasia ou email
            email = data.get('email', '')
            administradora = "Direta"
            if "@" in email:
                domain = email.split("@")[1].lower()
                if domain not in ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br']:
                    administradora = domain.split(".")[0].capitalize()

            # Calcular idade real
            opening_date_str = data.get('data_inicio_atividade')
            age = 0
            if opening_date_str:
                opening_date = datetime.strptime(opening_date_str, '%Y-%m-%d')
                age = (datetime.now() - opening_date).days // 365

            return {
                "cnpj": cnpj,
                "razao_social": data.get('razao_social'),
                "sindico_nome": sindico,
                "administradora": administradora,
                "contato_oficial": f"{data.get('ddd_telefone_1', '')} | {email}",
                "situacao": data.get('descricao_situacao_cadastral'),
                "idade_condominio": age,
                "endereco_fiscal": f"{data.get('logradouro')}, {data.get('numero')} - {data.get('bairro')}"
            }

        except Exception as e:
            logger.error(f"ContactAgent: Erro ao enriquecer contatos: {e}")
            return self._get_fallback_contacts()

    def _search_cnpj_by_name(self, name, city):
        """
        Lógica para encontrar CNPJ pelo nome. 
        Implementação futura: Usar scraper no Google ou API de busca.
        """
        # Mock para demonstração - em um sistema real aqui teria o scraper de busca de CNPJ
        # que desenvolvemos para a Prospect-On
        mock_data = {
            "Condomínio Edifício Praça das Águas": "41662445000103",
            "Condomínio Residencial Anhangabaú": "39699568000188"
        }
        return mock_data.get(name)

    def _get_fallback_contacts(self):
        return {
            "cnpj": "Pendente",
            "razao_social": "Não encontrada",
            "sindico_nome": "A verificar (Portaria)",
            "administradora": "A pesquisar",
            "contato_oficial": "Sem contato disponível",
            "situacao": "DESCONHECIDA",
            "idade_condominio": 10
        }

if __name__ == "__main__":
    agent = ContactAgent()
    print(agent.enrich_contact_data("Condomínio Edifício Praça das Águas"))
