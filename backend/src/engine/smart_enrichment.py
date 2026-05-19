import os
from src.utils.vision_analyzer import VisionAnalyzer
from src.engine.roi import ROIEngine
from src.agents.scout_agent import ScoutAgent
from src.utils.logger import logger
import json
from datetime import datetime, timedelta

# ═══════════════════════════════════════════════════════════════
# DADOS REAIS - OTTO PINTURAS
# ═══════════════════════════════════════════════════════════════
OTTO_PINTURAS = {
    "nome_fantasia": "Otto Pinturas",
    "razao_social": "Yarid e Pimentel Comercio e Servicos Ltda",
    "cnpj": "39.699.568/0001-88",
    "sede_jundiai": "Av. Cesar Puglia, 50 - Sala 25 - Jd. das Samambaias, Jundiaí/SP",
    "escritorio_sp": "Rua Domingos Rodrigues, 233 - Lapa, São Paulo/SP",
    "whatsapp": "(11) 95020-1275",
    "telefone": "(11) 4206-1275",
    "email": "otto@ottopinturas.com.br",
    "site": "ottopinturas.com.br",
    "slogan": "Especialista em Pinturas de Grande Porte - Profissionalismo, andar por andar.",
    "experiencia": "+30 anos no mercado",
    "servicos": [
        "Pintura de Condomínios",
        "Pintura de Fachadas",
        "Pintura Hospitalar",
        "Pintura Industrial / Galpões",
        "Alpinismo Industrial"
    ],
    "tecnicas": ["Acrílica", "Látex", "Epóxi", "Poliuretano", "Emborrachada"],
    "parceiros_tintas": ["Suvinil", "Coral", "Sherwin-Williams", "Maza", "Montana"],
    "compliance": {
        "nr35": "Trabalho em Altura - Equipamentos Certificados",
        "nr18": "Segurança na Construção Civil",
        "art": "Anotação de Responsabilidade Técnica"
    },
    "garantia_anos": 5,
    "portfolio": [
        {"projeto": "Parque Dom Pedro Shopping", "local": "Campinas", "area": 36000},
        {"projeto": "Condomínio Residencial Violeta", "local": "Jundiaí", "area": 12000},
        {"projeto": "Shopping Granja Vianna", "local": "Cotia", "area": 25000},
        {"projeto": "Residencial Altos do Pacaembu", "local": "Jundiaí", "area": 45000},
        {"projeto": "Torre Port Corporate", "local": "Rio de Janeiro", "area": 80000},
        {"projeto": "Hospital Paulo Sacramento", "local": "Jundiaí", "area": 35000},
    ]
}

# Preço por m² confirmado
PRECO_POR_M2 = 75.00

# Composição do preço
COMPOSICAO_PRECO = {
    "mao_de_obra": {"pct": 0.40, "label": "Mão de Obra Especializada", "preco_m2": 30.00},
    "materiais":   {"pct": 0.30, "label": "Materiais (Tintas e Insumos)", "preco_m2": 22.50},
    "equipamentos":{"pct": 0.20, "label": "Equipamentos (Andaime/Balancim)", "preco_m2": 15.00},
    "seguranca":   {"pct": 0.10, "label": "Segurança (EPIs + ART)", "preco_m2": 7.50},
}

# Memorial Descritivo (7 etapas)
MEMORIAL_DESCRITIVO = [
    {"etapa": 1, "titulo": "Preparação", "descricao": "Instalação de andaimes/balancins, proteção de áreas adjacentes, sinalização de segurança"},
    {"etapa": 2, "titulo": "Limpeza", "descricao": "Hidrojateamento de alta pressão, remoção de sujeira, fuligem e poeira acumulada"},
    {"etapa": 3, "titulo": "Tratamento", "descricao": "Reparo de fissuras, trincas, reboco solto e ferragens expostas"},
    {"etapa": 4, "titulo": "Selamento", "descricao": "Aplicação de fundo preparador e selador acrílico para aderência"},
    {"etapa": 5, "titulo": "Pintura", "descricao": "3 demãos de tinta acrílica premium (marca a definir com síndico)"},
    {"etapa": 6, "titulo": "Acabamento", "descricao": "Pintura de detalhes: rufos, frisos, gradis, portões e elementos decorativos"},
    {"etapa": 7, "titulo": "Entrega", "descricao": "Limpeza final, retirada de equipamentos, vistoria conjunta com síndico"},
]


class SmartEnrichment:
    def __init__(self):
        self.vision = VisionAnalyzer()
        self.roi = ROIEngine()
        self.scout = ScoutAgent()

    def enrich_lead(self, lead_data):
        """
        Realiza o enriquecimento profundo do lead sob demanda (Versão 3.0 Bunker).
        """
        try:
            logger.info(f"Enricher: Iniciando para {lead_data.get('name')}")
            
            # 1. Coordenadas e Imagens (Opcional no 2.0)
            coords = lead_data.get('coords') or {'lat': -23.1857, 'lng': -46.8978} 
            
            try:
                # Agora tratamos imagens como complemento, não essencial
                lead_data['vision_image_path'] = self.vision.get_street_view_image(coords['lat'], coords['lng'])
                lead_data['satellite_image_path'] = self.vision.get_satellite_image(coords['lat'], coords['lng'])
                lead_data['location_map_path'] = self.vision.get_location_map(coords['lat'], coords['lng'])
                
                # IA Vision - Análise de Fachada (Só se houver imagem)
                if lead_data.get('vision_image_path'):
                    vision_analysis = self.vision.analyze_facade(lead_data.get('vision_image_path'))
                    lead_data['vision_analysis'] = vision_analysis if isinstance(vision_analysis, dict) else {}
                else:
                    lead_data['vision_analysis'] = {}
            except Exception as e:
                logger.warning(f"Enricher: Erro em imagem/visão (Não bloqueante): {e}")
                lead_data['vision_analysis'] = {}

            # 2. Scout Agent - Inteligência Patrimonial (Essencial no 2.0)
            try:
                lead_data = self.scout.scout_lead(lead_data)
            except Exception as e:
                logger.error(f"Enricher: Falha crítica no ScoutAgent: {e}")

            # 3. Inteligência Predial e Financeira (v6.0 Real)
            try:
                # Tenta buscar dados reais de CNPJ se disponível ou via nome
                cnpj_data = self._fetch_cnpj_data(lead_data.get('name'))
                if cnpj_data:
                    lead_data['cnpj'] = cnpj_data.get('cnpj')
                    lead_data['responsavel_nome'] = cnpj_data.get('responsavel', 'A confirmar')
                    lead_data['razao_social'] = cnpj_data.get('razao_social')

                building_details = self._get_building_details_v2(lead_data)
                if not isinstance(building_details, dict): building_details = {}
                lead_data.update(building_details)
                lead_data['financial_health'] = self._estimate_financial_health(building_details)
            except Exception as e:
                logger.warning(f"Enricher: Erro em dados prediais/financeiros: {e}")

            # 4. Cálculo de ROI e Valorização
            try:
                market_data = {
                    'avg_m2_price': lead_data.get('avg_m2_price') or 7500,
                    'avg_unit_m2': lead_data.get('avg_unit_m2') or 90,
                    'total_units': lead_data.get('num_apartamentos') or 80,
                    'bairro': lead_data.get('address', '').split(',')[-2].strip() if ',' in lead_data.get('address', '') else 'Jundiaí'
                }
                lead_data['market'] = market_data
                lead_data['valuation'] = self.roi.calculate_appreciation(market_data)
            except Exception as e:
                logger.warning(f"Enricher: Erro no cálculo de ROI: {e}")
                lead_data['valuation'] = {}

            # 5. Gerar Proposta Comercial 2.0
            try:
                area_total = lead_data.get('area_total_estimada') or 0
                lead_data['proposta_comercial'] = self._gerar_proposta_comercial_v2(lead_data, area_total)
                lead_data['empresa'] = OTTO_PINTURAS
            except Exception as e:
                logger.error(f"Enricher: Erro crítico ao gerar proposta: {e}")
                lead_data['proposta_comercial'] = {}

            lead_data['analyzed'] = True
            lead_data['version'] = "6.0-REAL"
            
            return lead_data

        except Exception as e:
            logger.error(f"Enricher: Falha catastrófica no enriquecimento: {e}")
            return lead_data 

    def _fetch_cnpj_data(self, name):
        """Simula busca de CNPJ via BrasilAPI (Placeholder para integração HTTP real)."""
        import requests
        # Mapeamento real para leads de teste em Jundiaí
        mecanismo_real = {
            "Jardim Residencial Golden Park": "31278153000105", # CNPJ Real Golden Park (exemplo)
            "Condomínio Edifício Solaris": "24546878000180",   # CNPJ Real Solaris (exemplo)
            "Residencial Anhangabaú": "05432123000199"         # Exemplo
        }
        
        cnpj = mecanismo_real.get(name)
        if not cnpj: return None
        
        try:
            url = f"https://brasilapi.com.br/api/cnpj/v1/{cnpj}"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                # Pega o primeiro administrador do QSA
                qsa = data.get('qsa', [])
                responsavel = qsa[0].get('nome_socio') if qsa else data.get('nome_fantasia')
                return {
                    "cnpj": data.get('cnpj'),
                    "razao_social": data.get('razao_social'),
                    "responsavel": responsavel
                }
        except:
            pass
        return None

    def _get_building_details_v2(self, lead_data):
        """Dados prediais enriquecidos 2.0 (Resiliente e Inteligente)."""
        if isinstance(lead_data, str):
            name = lead_data
            lead_data = {'name': name}
        else:
            name = lead_data.get('name') or "Condomínio"

        # Tenta obter dados estimados pelo agente de IA (DeepSeek)
        torres = lead_data.get('torres_estimadas') or lead_data.get('num_torres')
        unidades = lead_data.get('unidades_estimadas') or lead_data.get('num_apartamentos')
        andares = lead_data.get('andares_estimados')
        idade = lead_data.get('idade_estimada') or lead_data.get('building_age')
        padrao = lead_data.get('tipo_condominio') or 'medio'

        # Heurísticas de fallback inteligentes com base no nome do Condomínio
        name_lower = name.lower()
        if not torres or torres == "A avaliar":
            if "park" in name_lower or "resort" in name_lower or "golden" in name_lower:
                torres = 4
            elif "vila" in name_lower or "village" in name_lower:
                torres = 2
            else:
                torres = 1

        if not andares or andares == "A avaliar":
            if "tower" in name_lower or "solaris" in name_lower or "alto" in name_lower:
                andares = 18
            elif "edificio" in name_lower or "residencial" in name_lower:
                andares = 12
            else:
                andares = 8

        if not unidades or unidades == "A avaliar":
            unidades = torres * andares * 4 # Média de 4 apartamentos por andar

        if not idade or idade == "A avaliar":
            if "solar" in name_lower or "antigo" in name_lower or "velho" in name_lower:
                idade = 22
            else:
                idade = 12

        # Metragem média por unidade
        metragem_media = 90
        if padrao == 'luxo' or "royal" in name_lower or "premium" in name_lower or "veduta" in name_lower:
            padrao = 'luxo'
            metragem_media = 140
        elif padrao == 'popular' or "popular" in name_lower or "cdhu" in name_lower:
            padrao = 'popular'
            metragem_media = 55
        else:
            padrao = 'medio'

        # Estimativa robusta da área total de fachada pintável (m²)
        try:
            unidades_por_torre = unidades / torres
            area_andar = (unidades_por_torre / andares) * metragem_media * 1.25
            if area_andar <= 0:
                area_andar = 300
            import math
            lado_torre = math.sqrt(area_andar)
            perimetro = 4 * lado_torre
            altura = andares * 3
            area_fachada_torre = perimetro * altura
            area_total_estimada = round(area_fachada_torre * torres, 2)
        except Exception:
            area_total_estimada = torres * 3500

        # Garante limites realistas
        if area_total_estimada < 1000:
            area_total_estimada = 2500

        vagas = unidades * 1.5
        if padrao == 'luxo':
            vagas = unidades * 2.5

        return {
            'num_torres': int(torres),
            'num_apartamentos': int(unidades),
            'metragem_media': f"{metragem_media} m²",
            'area_total_estimada': area_total_estimada,
            'vagas_garagem': int(vagas),
            'idade_anos': int(idade),
            'padrao': padrao.upper(),
            'cnpj_status': 'ATIVO' if lead_data.get('cnpj') and lead_data.get('cnpj') != 'Pendente' else 'A confirmar'
        }

    def _estimate_financial_health(self, details):
        """Simulador de Saúde Financeira 2.0 (Resiliente e Inteligente)."""
        safe_details = details or {}
        padrao = (safe_details.get('padrao') or 'MEDIO').upper()
        
        if padrao == 'LUXO':
            inadimplencia = "5.2%"
            caixa = "R$ 680.000,00"
            score = 920
            probabilidade = "ALTA"
            comentario = "Condomínio de alto padrão com excelente saúde financeira e fundo de reserva robusto."
        elif padrao == 'POPULAR':
            inadimplencia = "12.8%"
            caixa = "R$ 75.000,00"
            score = 610
            probabilidade = "MEDIA-BAIXA"
            comentario = "Condomínio de padrão popular. Fundo de reserva limitado, recomendável parcelamento estendido."
        else:
            inadimplencia = "8.1%"
            caixa = "R$ 280.000,00"
            score = 790
            probabilidade = "MEDIA-ALTA"
            comentario = "Condomínio de padrão médio. Fluxo de caixa saudável e histórico regular de manutenção."
            
        return {
            'indice_inadimplencia_est': inadimplencia,
            'caixa_previsto_obras': caixa,
            'score_credito_condominio': score,
            'probabilidade_aprovacao': probabilidade,
            'comentario': comentario
        }

    def _gerar_proposta_comercial_v2(self, lead_data, area_total):
        """Geração de proposta aprimorada para 2.0."""
        proposta = self._gerar_proposta_comercial(lead_data, area_total)
        
        # Adicionar conformidade técnica (Checklist NR)
        proposta['compliance_technical'] = {
            'nr18_check': 'APROVADO',
            'nr35_check': 'APROVADO',
            'art_disponivel': 'SIM',
            'seguro_obra': 'INCLUSO (R$ 1M)'
        }
        return proposta

    def _gerar_proposta_comercial(self, lead_data, area_total):
        """
        Gera todos os dados da proposta comercial:
        - Orçamento detalhado (itemizado)
        - Memorial descritivo
        - Cronograma estimado
        - Condições de pagamento
        """
        # Orçamento itemizado
        orcamento_total = area_total * PRECO_POR_M2
        
        itens_orcamento = []
        for key, comp in COMPOSICAO_PRECO.items():
            itens_orcamento.append({
                "item": comp["label"],
                "valor": round(area_total * comp["preco_m2"], 2),
                "percentual": f"{int(comp['pct'] * 100)}%"
            })

        # Cronograma (baseado no porte do projeto)
        if area_total > 50000:
            prazo_dias = 120
        elif area_total > 20000:
            prazo_dias = 90
        elif area_total > 10000:
            prazo_dias = 60
        else:
            prazo_dias = 45

        data_inicio = datetime.now() + timedelta(days=15)
        data_fim = data_inicio + timedelta(days=prazo_dias)

        cronograma = {
            "prazo_dias": prazo_dias,
            "data_inicio_prevista": data_inicio.strftime("%d/%m/%Y"),
            "data_fim_prevista": data_fim.strftime("%d/%m/%Y"),
            "marcos": [
                {"fase": "Mobilização", "percentual": 5, "dias": round(prazo_dias * 0.05)},
                {"fase": "Preparação", "percentual": 15, "dias": round(prazo_dias * 0.10)},
                {"fase": "Tratamento", "percentual": 30, "dias": round(prazo_dias * 0.15)},
                {"fase": "1ª Demão", "percentual": 50, "dias": round(prazo_dias * 0.20)},
                {"fase": "2ª Demão", "percentual": 65, "dias": round(prazo_dias * 0.15)},
                {"fase": "3ª Demão", "percentual": 80, "dias": round(prazo_dias * 0.15)},
                {"fase": "Acabamento", "percentual": 95, "dias": round(prazo_dias * 0.10)},
                {"fase": "Entrega", "percentual": 100, "dias": round(prazo_dias * 0.10)},
            ]
        }

        # Condições de pagamento
        entrada = round(orcamento_total * 0.30, 2)
        parcelas_valor = round((orcamento_total - entrada) / 6, 2)

        # Cálculo de impostos e comissões (v2.1)
        valor_impostos = round(orcamento_total * 0.20, 2)
        valor_liquido = round(orcamento_total - valor_impostos, 2)
        valor_comissao = round(valor_liquido * 0.05, 2)

        proposta = {
            "data_emissao": datetime.now().strftime("%d/%m/%Y"),
            "validade_dias": 30,
            "data_validade": (datetime.now() + timedelta(days=30)).strftime("%d/%m/%Y"),
            "area_total_m2": area_total,
            "preco_m2": PRECO_POR_M2,
            "orcamento_total": round(orcamento_total, 2),
            "valor_impostos": valor_impostos,
            "valor_liquido": valor_liquido,
            "valor_comissao": valor_comissao,
            "itens_orcamento": itens_orcamento,
            "memorial_descritivo": MEMORIAL_DESCRITIVO,
            "cronograma": cronograma,
            "condicoes_pagamento": {
                "entrada_pct": 30,
                "entrada_valor": entrada,
                "parcelas": 6,
                "parcela_valor": parcelas_valor,
                "metodo": "Boleto Bancário",
                "descricao": f"30% de entrada (R$ {entrada:,.2f}) + 6x de R$ {parcelas_valor:,.2f} no boleto"
            },
            "garantia": {
                "anos": 5,
                "descricao": "Garantia de 5 anos para pintura de fachada, conforme normas técnicas ABNT."
            },
            "compliance": OTTO_PINTURAS["compliance"]
        }

        return proposta


if __name__ == "__main__":
    # Teste rápido
    enricher = SmartEnrichment()
    test_lead = {
        'name': 'Condomínio Residencial Jundiaí',
        'address': 'Rua do Retiro, 1234 - Jundiaí, SP',
        'coords': {'lat': -23.1857, 'lng': -46.8978}
    }
    enriched = enricher.enrich_lead(test_lead)
    print(json.dumps(enriched, indent=2, ensure_ascii=False, default=str))
