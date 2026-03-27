class LeadScorer:
    def __init__(self):
        pass

    def calculate_score(self, lead_data):
        """
        Calcula o 'Score de Oportunidade Otto' (0 a 10).
        lead_data: dict contendo 'idade_anos' e 'situacao_cadastral'.
        """
        base_score = 0
        idade = lead_data.get('idade_anos', 0)
        situacao = lead_data.get('situacao_cadastral', '').upper()

        # Gatilho de Idade (Pintura)
        if idade >= 10:
            base_score = 10  # Urgente
        elif idade >= 5:
            base_score = 7   # Preventiva
        elif idade > 0:
            base_score = 3   # Nova construção
        else:
            base_score = 0   # Sem dados

        # Multiplicador de Situação Cadastral
        multiplier = 1.0
        if "ATIVA" not in situacao:
            multiplier = 0.0  # Empresa baixada ou irregular não é lead

        final_score = base_score * multiplier
        
        # Metadata da decisão
        justification = ""
        if final_score == 10:
            justification = "Prédio com 10+ anos. A pintura de proteção atingiu o limite de vida útil."
        elif final_score == 7:
            justification = "Prédio com 5-10 anos. Momento ideal para revitalização e evitar custos estruturais."
        elif final_score == 0 and multiplier == 0:
            justification = "Empresa Inativa ou Irregular no CNPJ."
        else:
            justification = "Prédio novo (menos de 5 anos)."

        return {
            'score': round(final_score, 1),
            'justification': justification,
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
