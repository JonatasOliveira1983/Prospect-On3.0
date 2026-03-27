class ROIEngine:
    def __init__(self, appreciation_factor=0.12):
        self.appreciation_factor = appreciation_factor

    def calculate_appreciation(self, lead_data):
        """
        Calcula o ganho patrimonial estimado.
        lead_data deve conter: 'avg_m2_price', 'avg_unit_m2', 'total_units'
        """
        m2_price = lead_data.get('avg_m2_price', 6500)
        unit_m2 = lead_data.get('avg_unit_m2', 80)
        total_units = lead_data.get('total_units', 100)
        
        # Valor de uma unidade
        unit_value = m2_price * unit_m2
        
        # Valor total do condomínio (Ativo)
        total_asset_value = unit_value * total_units
        
        # Ganho Patrimonial com revitalização Otto
        potential_gain = total_asset_value * self.appreciation_factor
        gain_per_unit = potential_gain / total_units
        
        return {
            'unit_value': round(unit_value, 2),
            'total_asset_value': round(total_asset_value, 2),
            'appreciation_percent': self.appreciation_factor * 100,
            'total_appreciation_gain': round(potential_gain, 2),
            'gain_per_unit': round(gain_per_unit, 2)
        }

if __name__ == "__main__":
    engine = ROIEngine()
    test_data = {
        'avg_m2_price': 8500,
        'avg_unit_m2': 120,
        'total_units': 80
    }
    result = engine.calculate_appreciation(test_data)
    print(result)
