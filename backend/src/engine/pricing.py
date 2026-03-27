class PricingEngine:
    def __init__(self):
        # Tabela referencial SINAPI/Mercado SP - 2026
        self.costs_m2 = {
            'lavagem': 1.50,
            'selador': 4.50,
            'tinta': 18.00,
            'textura': 22.00,
            'protecao': 3.00,
            'mao_de_obra': 15.00 # Estimado por m2 de fachada
        }
        self.taxes_percent = 0.20
        self.commission_percent = 0.05

    def generate_budget(self, total_m2_fachada):
        """
        Gera orçamento completo baseado na área de fachada.
        """
        # Custos Diretos
        items = {}
        direct_cost = 0
        for item, price in self.costs_m2.items():
            cost = total_m2_fachada * price
            items[item] = round(cost, 2)
            direct_cost += cost

        # Custo Fixo (Balancins/Andaimes/ART)
        fixed_cost = 25000 # Placeholder fixo por obra grande
        total_cost = direct_cost + fixed_cost
        
        # Fator de Segurança (Markup) para impostos e comissões
        # Preço = Custo / (1 - Imposto - Comissão - Margem_Empresa)
        target_margin = 0.20 # 20% lucro empresa
        markup = 1 / (1 - self.taxes_percent - target_margin)
        
        final_price = total_cost * markup
        
        # Cálculos de Split Financeiro
        impostos = final_price * self.taxes_percent
        liquido = final_price - impostos
        comissao_jonatas = liquido * self.commission_percent
        lucro_otto = liquido - total_cost - comissao_jonatas

        return {
            'm2_total': total_m2_fachada,
            'detalhes_custos': items,
            'custo_direto': round(direct_cost, 2),
            'custo_fixo': round(fixed_cost, 2),
            'investimento_total': round(final_price, 2),
            'split': {
                'impostos_20': round(impostos, 2),
                'liquido_receita': round(liquido, 2),
                'comissao_jonatas_5': round(comissao_jonatas, 2),
                'lucro_liquido_otto': round(lucro_otto, 2)
            }
        }

if __name__ == "__main__":
    pricing = PricingEngine()
    # Exemplo: Prédio de 12 andares (4 faces de 10m x 36m) ~= 1440m2
    budget = pricing.generate_budget(1440)
    print(budget)
