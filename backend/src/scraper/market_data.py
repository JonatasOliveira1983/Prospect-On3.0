import requests
import random

class MarketScraper:
    def __init__(self):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.98 Safari/537.36"
        ]

    def get_avg_m2_price(self, neighborhood, city="Jundiaí"):
        """
        Busca o valor médio do m² no bairro.
        Mock inicial: Simula retorno de portais como ZapImóveis.
        """
        # No futuro, aqui teremos a lógica de request + BeautifulSoup
        # Por enquanto, usamos uma tabela de referência para Jundiaí
        jundiai_data = {
            "Centro": 5500,
            "Jardim Samambaia": 8500,
            "Anhangabaú": 7200,
            "Eloy Chaves": 6800,
            "Vila Arens": 6200,
            "Retiro": 7000,
            "Jardim do Lago": 5800
        }
        
        price = jundiai_data.get(neighborhood, 6500) # Default se não achar
        # Adiciona uma pequena variação aleatória para simular dados reais
        price += random.randint(-200, 200)
        
        return price

    def get_unit_details(self, condo_name):
        """
        Busca detalhes das unidades (m², quartos).
        Simulado.
        """
        return {
            "avg_m2": random.choice([65, 80, 110, 150]),
            "total_units": random.choice([40, 60, 120, 240]),
            "towers": random.choice([1, 2, 4])
        }

if __name__ == "__main__":
    scraper = MarketScraper()
    print(f"Preço m² no Retiro: R$ {scraper.get_avg_m2_price('Retiro')}")
