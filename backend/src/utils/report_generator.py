from fpdf import FPDF
import os

class ReportGenerator:
    def __init__(self, output_dir="reports"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def generate_valuation_report(self, lead_data):
        """
        Gera o Relatório de Valorização Patrimonial em PDF.
        """
        pdf = FPDF()
        pdf.add_page()
        
        # Capa
        pdf.set_font("Arial", "B", 24)
        pdf.cell(0, 40, "Relatório de Integridade e Valorização", ln=True, align="C")
        
        pdf.set_font("Arial", "B", 18)
        pdf.cell(0, 10, f"Condomínio {lead_data['name']}", ln=True, align="C")
        pdf.ln(20)
        
        # Seção 1: Diagnóstico
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "1. Diagnóstico de Risco e Timing", ln=True)
        pdf.set_font("Arial", "", 12)
        idade = lead_data.get('idade_anos', 'Desconhecida')
        pdf.multi_cell(0, 10, f"Com base no CNPJ {lead_data.get('cnpj', 'N/A')}, identificamos que o edifício completou {idade} anos. "
                             "Edifícios nesta faixa atingiram o limite de vida útil da película impermeabilizante da fachada.")
        pdf.ln(10)
        
        # Seção 2: Valorização (O Gancho Financeiro)
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "2. Índice de Valorização Patrimonial", ln=True)
        pdf.set_font("Arial", "", 12)
        val = lead_data['valuation']
        mkt = lead_data['market']
        
        pdf.cell(0, 10, f"Valor Médio do m2 no bairro: R$ {mkt['avg_m2_price']:,}", ln=True)
        pdf.cell(0, 10, f"Valor de Revenda Atual da Unidade: R$ {val['unit_value']:,.2f}", ln=True)
        pdf.ln(5)
        pdf.set_text_color(0, 128, 0) # Verde
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, f"GANHO PATRIMONIAL ESTIMADO (Pós-Obra Otto): +R$ {val['gain_per_unit']:,.2f} POR MORADOR", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(10)
        
        # Seção 3: Conclusão
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "3. Custo de Omissão", ln=True)
        pdf.set_font("Arial", "", 12)
        pdf.multi_cell(0, 10, "Ignorar a manutenção hoje pode elevar o custo de recuperação estrutural em até 40% nos próximos 24 meses devido à carbonatação da armadura.")
        
        # Rodapé
        pdf.set_y(-30)
        pdf.set_font("Arial", "I", 10)
        pdf.cell(0, 10, "Gerado por Prospect-On 1.0 | Inteligência de Dados para Condomínios", align="C")
        
        filename = f"Relatorio_{lead_data['name'].replace(' ', '_')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        return filepath

if __name__ == "__main__":
    # Mock para teste
    sample_lead = {
        'name': 'Edifício Solaris',
        'cnpj': '12.345.678/0001-00',
        'idade_anos': 12,
        'market': {'avg_m2_price': 8500},
        'valuation': {
            'unit_value': 1020000,
            'gain_per_unit': 122400
        }
    }
    gen = ReportGenerator()
    path = gen.generate_valuation_report(sample_lead)
    print(f"Relatório gerado em: {path}")
