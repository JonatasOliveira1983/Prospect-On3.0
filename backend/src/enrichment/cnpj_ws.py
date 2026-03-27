import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class CNPJEnricher:
    def __init__(self):
        self.base_url = os.getenv("BR_API_BASE_URL", "https://brasilapi.com.br/api/cnpj/v1")

    def get_company_data(self, cnpj):
        """
        Consulta dados do CNPJ via BrasilAPI.
        """
        clean_cnpj = ''.join(filter(str.isdigit, str(cnpj)))
        url = f"{self.base_url}/{clean_cnpj}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                return self._process_data(data)
            else:
                return {"error": f"API Error: {response.status_code}"}
        except Exception as e:
            return {"error": str(e)}

    def _process_data(self, data):
        """Extrai apenas o que interessa: Idade e Status."""
        opening_date_str = data.get('data_inicio_atividade')
        age_years = 0
        if opening_date_str:
            try:
                opening_date = datetime.strptime(opening_date_str, '%Y-%m-%d')
                age_years = (datetime.now() - opening_date).days // 365
            except ValueError:
                pass

        return {
            'cnpj': data.get('cnpj'),
            'nome_fantasia': data.get('nome_fantasia') or data.get('razao_social'),
            'data_abertura': opening_date_str,
            'idade_anos': age_years,
            'situacao_cadastral': data.get('descricao_situacao_cadastral'),
            'logradouro': data.get('logradouro'),
            'numero': data.get('numero'),
            'bairro': data.get('bairro'),
            'cidade': data.get('municipio'),
            'uf': data.get('uf')
        }

    def find_cnpj_by_name(self, name, city="JUNDIAI"):
        """
        AVISO: APIs de consulta gratuita geralmente não permitem busca por nome.
        Aqui emulamos a lógica para integrar futuramente com APIs pagas (Leadster/CNPJ.ws).
        No momento, usaremos mocks para validar a lógica de 'Radar'.
        """
        # Exemplo Mock: Na vida real, faríamos uma busca no Google ou API específica.
        mock_map = {
            'Condomínio Edifício Solaris': '12345678000100',
            'Condomínio Residencial Jundiaí I': '87654321000199'
        }
        return mock_map.get(name)

if __name__ == "__main__":
    enricher = CNPJEnricher()
    # Teste com um CNPJ real de condomínio (exemplo aleatório de Jundiaí se disponível)
    # Aqui usaremos um de teste: 33683111000107 (exemplo de empresa ativa)
    data = enricher.get_company_data("33.683.111.0001-07")
    print(data)
