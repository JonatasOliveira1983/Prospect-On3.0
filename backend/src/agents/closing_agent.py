import os
from src.utils.report_generator import ReportGenerator
from src.utils.logger import logger

class ClosingAgent:
    """
    Agente de Fechamento: Consolida os dados e gera a proposta final.
    """
    def __init__(self):
        self.report_gen = ReportGenerator()

    def generate_final_proposal(self, lead_data):
        """
        Recebe os dados consolidados de todos os agentes e gera o PDF.
        """
        logger.info(f"ClosingAgent: Gerando proposta final para {lead_data.get('name')}...")
        
        # 1. Cálculos de VGV e Metragem baseados no SurveyorAgent
        survey_data = lead_data.get('surveyor_analysis', {})
        market_data = lead_data.get('market', {})
        total_m2 = survey_data.get('estimativa_area_m2', 5000)
        
        # Preço por m2 dinâmico por bairro (v2.5)
        preco_m2 = market_data.get('avg_m2_price', 75.00)
        orcamento_total = total_m2 * preco_m2
        
        # 2. Enriquecer lead_data com cálculos financeiros para o PDF
        lead_data['proposta_comercial'] = {
            'area_total_m2': total_m2,
            'preco_m2': preco_m2,
            'orcamento_total': orcamento_total,
            'num_torres': survey_data.get('total_torres'),
            'num_andares': survey_data.get('andares_por_torre'),
            'prazo_estimado': self._calculate_deadline(total_m2),
            'itens_orcamento': self._generate_budget_items(orcamento_total)
        }
        
        # 3. Chamar o gerador de PDF
        try:
            report_path = self.report_gen.generate_valuation_report(lead_data)
            logger.info(f"ClosingAgent: Proposta gerada com sucesso: {report_path}")
            return report_path
        except Exception as e:
            logger.error(f"ClosingAgent: Erro ao gerar PDF: {e}")
            return None

    def _calculate_deadline(self, area):
        if area > 20000: return 120
        if area > 10000: return 90
        return 60

    def _generate_budget_items(self, total):
        return [
            {"item": "Mão de Obra Especializada", "percentual": "40%", "valor": total * 0.4},
            {"item": "Materiais (Tintas/Texturas)", "percentual": "30%", "valor": total * 0.3},
            {"item": "Equipamentos e Segurança (NR-35)", "percentual": "20%", "valor": total * 0.2},
            {"item": "Logística e Descarte", "percentual": "10%", "valor": total * 0.1}
        ]
