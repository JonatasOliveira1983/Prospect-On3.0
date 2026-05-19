class LeadScorer:
    def __init__(self):
        pass

    def calculate_score(self, lead_data, vision_data=None):
        """
        Calcula o 'Score de Oportunidade Otto' (0 a 10).
        lead_data: dict fiscal.
        vision_data: dict da análise do Gemini.
        """
        base_score = 0
        idade = lead_data.get('idade_anos', 0)
        situacao = lead_data.get('situacao_cadastral', '').upper()

        # 1. Gatilho de Idade (Pintura)
        if idade >= 10:
            base_score = 10 
        elif idade >= 5:
            base_score = 7
        elif idade > 0:
            base_score = 3
        else:
            base_score = 0 

        # 2. Bônus de Visão (IA)
        if vision_data:
            if vision_data.get('urgencia'):
                base_score = min(10, base_score + 2) # Aumentar prioridade se IA vê problemas
            if vision_data.get('desgaste') == 'Crítico':
                base_score = 10

        # Multiplicador de Situação Cadastral
        multiplier = 1.0
        if situacao and "ATIVA" not in situacao:
            multiplier = 0.0

        final_score = base_score * multiplier
        
        # Metadata da decisão
        justification = []
        if idade >= 10: justification.append(f"Prédio com {idade} anos (Histórico).")
        if vision_data and vision_data.get('urgencia'):
            justification.append(f"IA detectou urgência visual: {vision_data['desgaste']}.")
            if vision_data.get('patologias'):
                justification.append(f"Patologias: {', '.join(vision_data['patologias'])}.")

        return {
            'score': round(final_score, 1),
            'justification': " | ".join(justification) if justification else "Sem dados suficientes.",
            'category': self._get_category(final_score)
        }

    def _get_category(self, score):
        if score >= 9: return "ALERTA VERMELHO (URGENTE)"
        if score >= 6: return "ALERTA AMARELO (PREVENTIVO)"
        if score >= 1: return "ALERTA VERDE (MANUTENÇÃO)"
        return "SEM PRIORIDADE"

if __name__ == "__main__":
    scorer = LeadScorer()
    # Teste 1: Prédio velho e ativo
    print(scorer.calculate_score({'idade_anos': 12, 'situacao_cadastral': 'ATIVA'}))
    # Teste 2: Prédio novo
    print(scorer.calculate_score({'idade_anos': 3, 'situacao_cadastral': 'ATIVA'}))
    # Teste 3: Inativo
    print(scorer.calculate_score({'idade_anos': 15, 'situacao_cadastral': 'BAIXADA'}))
