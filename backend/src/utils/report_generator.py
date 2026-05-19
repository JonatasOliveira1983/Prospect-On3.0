import os
from datetime import datetime

class PDFProposta:
    """
    PDFProposta com import lazy do fpdf (evita travamento na inicialização).
    O fpdf2 demora ~5s para importar, então só carregamos quando necessário.
    """
    def __init__(self, *args, **kwargs):
        from fpdf import FPDF
        self._pdf = FPDF(*args, **kwargs)
        
    def __getattr__(self, name):
        return getattr(self._pdf, name)
    
    def header(self):
        pass

    def footer(self):
        self._pdf.set_y(-15)
        self._pdf.set_font('Arial', 'I', 8)
        self._pdf.set_text_color(128)
        self._pdf.cell(0, 10, f'Página {self._pdf.page_no()} de {{nb}}', 0, 0, 'C')

class ReportGenerator:
    def __init__(self, output_dir="reports"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def normalize_text(self, text):
        """Corrige caracteres não suportados pelo FPDF/Latin-1."""
        if not text: return ""
        if not isinstance(text, str): text = str(text)
        
        replacements = {
            '\u2014': '-', # em-dash
            '\u2013': '-', # en-dash
            '\u201c': '"', # aspa esquerda
            '\u201d': '"', # aspa direita
            '\u2018': "'",
            '\u2019': "'",
            '\u2022': '*', # bullet
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
            
        # Fallback para qualquer outro caractere não-latin-1
        return text.encode('latin-1', 'replace').decode('latin-1')

    def generate_valuation_report(self, lead_data):
        """
        Gera a PROPOSTA COMERCIAL + LAUDO (Versão 2.4 Robust) em PDF com blindagem de dados.
        """
        # --- BLINDAGEM DE DADOS (v5.5) ---
        # Garante que sub-objetos nunca sejam None para evitar 'NoneType' object has no attribute 'get'
        lead_data['market'] = lead_data.get('market') or {}
        lead_data['vision_analysis'] = lead_data.get('vision_analysis') or {}
        lead_data['valuation'] = lead_data.get('valuation') or {}
        lead_data['financial_health'] = lead_data.get('financial_health') or {}
        lead_data['proposta_comercial'] = lead_data.get('proposta_comercial') or {}
        lead_data['empresa'] = lead_data.get('empresa') or {}
        
        # Garante campos básicos
        lead_data['name'] = lead_data.get('name') or "Condomínio Sem Nome"
        lead_data['address'] = lead_data.get('address') or "Endereço não informado"
        # ---------------------------------

        pdf = PDFProposta()
        pdf.alias_nb_pages()
        
        # 1. CAPA 3.0 (PREMIUM)
        self._add_capa_v2(pdf, lead_data)
        
        # 2. A EMPRESA (OTTO PINTURAS)
        self._add_secao_empresa(pdf, lead_data)
        
        # 3. O CONDOMÍNIO + INTELIGÊNCIA GEOGRÁFICA
        self._add_secao_condominio_v2(pdf, lead_data)
        
        # 4. O PROPÓSITO E VALOR (PITCH DE VENDAS)
        self._add_secao_proposito_v3(pdf, lead_data)
        
        # 5. DIAGNÓSTICO TÉCNICO VIZUAL (IA VISION)
        self._add_secao_diagnostico_v2(pdf, lead_data)
        
        # 6. MEMORIAL DESCRITIVO E CONFORMIDADE
        self._add_secao_memorial_v2(pdf, lead_data)
        
        # 7. CRONOGRAMA E MOBILIZAÇÃO
        self._add_secao_cronograma(pdf, lead_data)
        
        # 8. ORÇAMENTO DETALHADO 2.0
        self._add_secao_orcamento(pdf, lead_data)
        
        # 9. GARANTIA E ASSINATURAS
        self._add_secao_assinaturas(pdf, lead_data)

        # Nome de arquivo seguro
        safe_name = self.normalize_text(lead_data['name']).replace(' ', '_').replace('/', '-')
        filename = f"Proposta_Otto_2.0_{safe_name}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        pdf.output(filepath)
        return filepath

    def _add_capa(self, pdf, data):
        pdf.add_page()
        # Fundo escuro na lateral esquerda (estilo premium)
        pdf.set_fill_color(15, 23, 42)
        pdf.rect(0, 0, 70, 297, 'F')
        
        # Logos e identificação
        pdf.set_xy(10, 30)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(50, 10, "OTTO PINTURAS", ln=True)
        pdf.ln(150)
        pdf.set_font("Arial", "", 10)
        pdf.cell(50, 10, "PROSPECT-ON", ln=True)
        
        # Título Central
        pdf.set_xy(80, 80)
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Arial", "B", 24)
        pdf.multi_cell(120, 12, "PROPOSTA COMERCIAL\nREVITALIZAÇÃO PREDIAL")
        
        pdf.set_xy(80, 120)
        pdf.set_font("Arial", "B", 18)
        pdf.set_text_color(22, 211, 238) # Cyan
        pdf.multi_cell(120, 10, self.normalize_text(data['name']))
        
        pdf.set_xy(80, 140)
        pdf.set_font("Arial", "", 12)
        pdf.set_text_color(100, 116, 139)
        pdf.multi_cell(120, 7, self.normalize_text(data['address']))
        
        # Data
        pdf.set_xy(80, 250)
        pdf.set_font("Arial", "B", 10)
        pdf.cell(100, 10, f"EMITIDO EM: {datetime.now().strftime('%d/%m/%Y')}")

    def _add_secao_empresa(self, pdf, data):
        empresa = data.get('empresa', {})
        pdf.add_page()
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "1. A EMPRESA", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, empresa.get('razao_social', 'Otto Pinturas'), ln=True)
        pdf.set_font("Arial", "", 11)
        pdf.multi_cell(0, 7, f"CNPJ: {empresa.get('cnpj', '')}\nSede: {empresa.get('sede_jundiai', '')}\nEscritório SP: {empresa.get('escritorio_sp', '')}")
        pdf.ln(5)
        
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 10, "DIFERENCIAIS:", ln=True)
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 6, "- +30 anos de experiência no mercado de alto padrão\n- Especialista em alpinismo industrial e pinturas de grande porte\n- Equipe própria certificada NR-35 e NR-18\n- Parceria direta com as melhores marcas: Suvinil, Coral, Sherwin-Williams.")
        
        # Portfólio resumo
        pdf.ln(10)
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 10, "PRINCIPAIS OBRAS:", ln=True)
        pdf.set_fill_color(248, 250, 252)
        pdf.set_font("Arial", "B", 9)
        pdf.cell(120, 8, " Projeto", 1, 0, 'L', True)
        pdf.cell(40, 8, " Local", 1, 0, 'C', True)
        pdf.cell(30, 8, " Área (m2)", 1, 1, 'C', True)
        
        pdf.set_font("Arial", "", 8)
        for obra in empresa.get('portfolio', [])[:4]:
            pdf.cell(120, 7, f" {obra['projeto']}", 1)
            pdf.cell(40, 7, obra['local'], 1, 0, 'C')
            pdf.cell(30, 7, f"{obra['area']:,}", 1, 1, 'C')

    def _add_secao_condominio(self, pdf, data):
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "2. O CONDOMÍNIO", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        # Imagens
        # Satellite (Top)
        sat_path = data.get('satellite_image_path')
        if sat_path and os.path.exists(sat_path):
            pdf.image(sat_path, x=10, w=190, h=80)
            pdf.ln(85)
            
        # Dados Info
        pdf.set_fill_color(248, 250, 252)
        pdf.rect(10, pdf.get_y(), 190, 45, 'F')
        pdf.set_font("Arial", "B", 10)
        pdf.set_xy(15, pdf.get_y()+5)
        pdf.cell(60, 8, f"Torres: {data.get('num_torres') or 'N/A'}")
        pdf.cell(60, 8, f"Apartamentos: {data.get('num_apartamentos') or 'N/A'}")
        pdf.cell(60, 8, f"Idade: {data.get('idade_anos') or 'N/A'} anos", ln=True)
        
        pdf.set_x(15)
        pdf.cell(60, 8, f"Área Est.: {data.get('area_total_estimated') or 'N/A'} m2")
        pdf.cell(120, 8, f"CNPJ: {data.get('cnpj') or 'A pesquisar'}", ln=True)
        
        pdf.set_x(15)
        market = data.get('market') or {}
        pdf.cell(0, 8, f"Bairro: {market.get('bairro') or 'N/A'}")
        pdf.ln(8)
        
        # Responsável NOVO v5.0
        pdf.set_x(15)
        pdf.set_font("Arial", "B", 10)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 8, f"SÍNDICO/RESPONSÁVEL: {self.normalize_text(data.get('responsavel_nome') or 'A confirmar')}", ln=True)
        pdf.set_x(15)
        pdf.set_font("Arial", "", 9)
        pdf.cell(0, 8, f"CONTATO: {self.normalize_text(data.get('responsavel_contato') or 'Pesquisar em campo')}", ln=True)
        pdf.ln(5)

    def _add_secao_diagnostico(self, pdf, data):
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "3. DIAGNÓSTICO TÉCNICO (IA Vision)", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        # Foto Fachada
        fac_path = data.get('vision_image_path')
        if fac_path and os.path.exists(fac_path):
            pdf.image(fac_path, x=35, w=140)
            pdf.ln(5)
            
        vision = data.get('vision_analysis', {})
        pdf.set_fill_color(255, 241, 242) if vision.get('urgencia') else pdf.set_fill_color(240, 253, 244)
        pdf.rect(10, pdf.get_y(), 190, 40, 'F')
        
        pdf.set_xy(15, pdf.get_y()+5)
        pdf.set_font("Arial", "B", 11)
        color_rgb = (225, 29, 72) if vision.get('urgencia') else (22, 163, 74)
        pdf.set_text_color(*color_rgb)
        status = "ESTADO CRÍTICO - INTERVENÇÃO RECOMENDADA" if vision.get('urgencia') else "ESTADO DE CONSERVAÇÃO MÉDIO"
        pdf.cell(0, 8, f"STATUS: {status}", ln=True)
        
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Arial", "B", 9)
        pdf.cell(0, 7, f"Patologias: {self.normalize_text(', '.join(vision.get('patologias', [])))}", ln=True)
        pdf.set_font("Arial", "I", 9)
        pdf.multi_cell(180, 5, self.normalize_text(vision.get('comentario_tecnico', '')))

    def _add_secao_memorial(self, pdf, data):
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "4. MEMORIAL DESCRITIVO", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        proposta = data.get('proposta_comercial', {})
        memorial = proposta.get('memorial_descritivo', [])
        
        pdf.set_font("Arial", "", 10)
        for item in memorial:
            pdf.set_font("Arial", "B", 11)
            pdf.cell(0, 8, f"{item['etapa']}. {item['titulo']}", ln=True)
            pdf.set_font("Arial", "", 10)
            pdf.multi_cell(0, 6, item['descricao'])
            pdf.ln(2)

    def _add_secao_cronograma(self, pdf, data):
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "5. CRONOGRAMA DE EXECUÇÃO", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        proposta = data.get('proposta_comercial') or {}
        cron = proposta.get('cronograma') or {}
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, f"Prazo Estimado: {cron.get('prazo_dias') or 0} dias úteis", ln=True)
        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 8, f"Inicio previsto: {cron.get('data_inicio_prevista') or ''} | Término previsto: {cron.get('data_fim_prevista') or ''}", ln=True)
        pdf.ln(5)
        
        # Tabela Fases
        pdf.set_fill_color(248, 250, 252)
        pdf.set_font("Arial", "B", 9)
        pdf.cell(100, 8, " Fase", 1, 0, 'L', True)
        pdf.cell(50, 8, " Duração (dias)", 1, 0, 'C', True)
        pdf.cell(40, 8, " Progresso", 1, 1, 'C', True)
        
        pdf.set_font("Arial", "", 9)
        for marco in (cron.get('marcos') or []):
            pdf.cell(100, 7, f" {marco.get('fase') or ''}", 1)
            pdf.cell(50, 7, f"{marco.get('dias') or 0}", 1, 0, 'C')
            pdf.cell(40, 7, f"{marco.get('percentual') or 0}%", 1, 1, 'C')

    def _add_secao_orcamento(self, pdf, data):
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "6. ORÇAMENTO DETALHADO", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        prop = data.get('proposta_comercial', {})
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 8, f"Área Total Estimada: {prop.get('area_total_m2', 0):,} m2", ln=True)
        pdf.cell(0, 8, f"Valor por m2: R$ {prop.get('preco_m2', 0):.2f}", ln=True)
        pdf.ln(5)
        
        # Tabela itens
        pdf.set_fill_color(15, 23, 42)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(110, 10, " Descrição do Item", 1, 0, 'L', True)
        pdf.cell(40, 10, " Percentual", 1, 0, 'C', True)
        pdf.cell(40, 10, " Valor (R$)", 1, 1, 'C', True)
        
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", "", 10)
        for item in prop.get('itens_orcamento', []):
            pdf.cell(110, 8, f" {item['item']}", 1)
            pdf.cell(40, 8, item['percentual'], 1, 0, 'C')
            pdf.cell(40, 8, f"R$ {item['valor']:,.2f}", 1, 1, 'R')
            
        pdf.set_font("Arial", "B", 12)
        pdf.set_fill_color(241, 245, 249)
        pdf.cell(150, 12, " TOTAL DA PROPOSTA", 1, 0, 'L', True)
        pdf.cell(40, 12, f"R$ {prop.get('orcamento_total', 0):,.2f}", 1, 1, 'R', True)
        
        # Detalhes de Gestão (Opcional - Pode ficar apenas em versão interna se preferir)
        pdf.ln(5)
        pdf.set_font("Arial", "B", 10)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 8, "GESTÃO E TRIBUTAÇÃO (Simulação Interna):", ln=True)
        pdf.set_font("Arial", "", 9)
        pdf.cell(0, 7, f"- Impostos/Taxas Retidos (20%): R$ {prop.get('valor_impostos', 0):,.2f}", ln=True)
        pdf.cell(0, 7, f"- Base de Cálculo da Comissão: R$ {prop.get('valor_liquido', 0):,.2f}", ln=True)
        pdf.set_font("Arial", "B", 9)
        pdf.set_text_color(16, 185, 129) # Green
        pdf.cell(0, 7, f"- Sua Comissão (5% sobre Líquido): R$ {prop.get('valor_comissao', 0):,.2f}", ln=True)
        pdf.set_text_color(0, 0, 0)
        
        # Condições
        pdf.ln(10)
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 10, "CONDIÇÕES DE PAGAMENTO:", ln=True)
        pdf.set_font("Arial", "", 10)
        cond = prop.get('condicoes_pagamento', {})
        pdf.multi_cell(0, 7, f"- {cond.get('descricao', '')}\n- Prazo de validade da proposta: {prop.get('validade_dias')} dias.")

    def _add_capa_v2(self, pdf, data):
        pdf.add_page()
        cyan = (22, 211, 238)
        slate_dark = (15, 23, 42)
        
        # Foto da Fachada como Background ou Destaque
        fac_path = data.get('vision_image_path')
        if fac_path and os.path.exists(fac_path):
            pdf.image(fac_path, x=0, y=0, w=210, h=160) # Top half
            pdf.set_fill_color(*slate_dark)
            pdf.rect(0, 150, 210, 150, 'F') # Bottom Half Solid
        else:
            pdf.set_fill_color(*slate_dark)
            pdf.rect(0, 0, 210, 297, 'F')
        
        # Faixa Cyan Central
        pdf.set_fill_color(*cyan)
        pdf.rect(0, 148, 210, 2, 'F')
        
        # Identidade Visual
        pdf.set_xy(20, 160)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Arial", "B", 10)
        pdf.cell(0, 10, "PROPOSTA DE REVITALIZAÇÃO PREDIAL | OTTO PINTURAS", ln=True)
        
        # Título da Proposta
        pdf.set_xy(20, 165)
        pdf.set_font("Arial", "B", 32)
        pdf.set_text_color(255, 255, 255)
        pdf.multi_cell(0, 12, "LAUDO TÉCNICO &\nPROPOSTA COMERCIAL")
        
        pdf.ln(5)
        pdf.set_x(20)
        pdf.set_text_color(*cyan)
        pdf.set_font("Arial", "B", 22)
        pdf.multi_cell(0, 10, self.normalize_text(data['name']).upper())
        
        pdf.ln(3)
        pdf.set_x(20)
        pdf.set_text_color(180, 180, 180)
        pdf.set_font("Arial", "", 12)
        pdf.multi_cell(140, 7, self.normalize_text(data['address']))
        
        # Data e Status
        pdf.set_xy(20, 260)
        pdf.set_font("Arial", "B", 10)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 10, f"EMITIDO EM: {datetime.now().strftime('%d/%m/%Y')}", ln=True)
        pdf.set_font("Arial", "", 9)
        pdf.cell(0, 5, "SISTEMA PROSPECT-ON 6.0 | INTELIGÊNCIA DE MERCADO", ln=True)

    def _add_secao_condominio_v2(self, pdf, data):
        pdf.add_page()
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "2. ANÁLISE DO ATIVO IMOBILIÁRIO", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        # Imagem Satélite
        sat_path = data.get('satellite_image_path')
        if sat_path and os.path.exists(sat_path):
            pdf.image(sat_path, x=10, w=190, h=85)
            pdf.ln(90)
        
        # Saúde Financeira NOVO 2.0
        health = data.get('financial_health', {})
        pdf.set_fill_color(240, 249, 255) # Light Blue
        pdf.rect(10, pdf.get_y(), 190, 50, 'F')
        
        pdf.set_xy(15, pdf.get_y()+5)
        pdf.set_font("Arial", "B", 12)
        pdf.set_text_color(14, 116, 144) # Cyan 700
        pdf.cell(0, 10, "SCORE DE SAÚDE FINANCEIRA (ESTIMATIVA)", ln=True)
        
        pdf.set_font("Arial", "", 10)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(90, 8, f"Inadimplência Est.: {health.get('indice_inadimplencia_est', 'N/A')}")
        pdf.cell(90, 8, f"Prob. Aprovação: {health.get('probabilidade_aprovacao', 'N/A')}", ln=True)
        
        pdf.set_x(15)
        pdf.cell(0, 8, f"Score de Crédito: {health.get('score_credito_condominio', 'N/A')}/1000")
        pdf.ln(8)
        pdf.set_x(15)
        pdf.set_font("Arial", "I", 9)
        pdf.multi_cell(180, 5, health.get('comentario', ''))

    def _add_secao_proposito_v3(self, pdf, data):
        pdf.add_page()
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Arial", "B", 18)
        pdf.cell(0, 15, "3. O PROPÓSITO: POR QUE AGIR AGORA?", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        # Narrative Box
        pdf.set_fill_color(15, 23, 42) # Slate Dark
        pdf.rect(10, pdf.get_y(), 190, 130, 'F')
        
        pdf.set_xy(20, pdf.get_y()+10)
        pdf.set_text_color(34, 211, 238) # Cyan
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "DIAGNÓSTICO ESTRATÉGICO DA IA", ln=True)
        
        vision = data.get('vision_analysis', {})
        pdf.set_font("Arial", "", 12)
        pdf.set_text_color(240, 240, 240)
        pitch = vision.get('proposito_estrategico', "A revitalização da fachada é o investimento com maior retorno direto para o condomínio.")
        pdf.multi_cell(170, 8, self.normalize_text(pitch))
        
        # Três pilares de valor
        pdf.ln(20)
        y_pillars = 160
        pdf.set_xy(10, y_pillars)
        
        # Pillar 1
        pdf.set_fill_color(248, 250, 252)
        pdf.rect(10, y_pillars, 60, 60, 'F')
        pdf.set_xy(15, y_pillars+5)
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Arial", "B", 11)
        pdf.cell(50, 8, "PROTEÇÃO", ln=True, align='C')
        pdf.set_font("Arial", "", 9)
        pdf.multi_cell(50, 5, "Estanqueidade e proteção estrutural contra infiltrações e corrosão.", align='C')
        
        # Pillar 2
        pdf.set_xy(75, y_pillars)
        pdf.set_fill_color(248, 250, 252)
        pdf.rect(75, y_pillars, 60, 60, 'F')
        pdf.set_xy(80, y_pillars+5)
        pdf.set_font("Arial", "B", 11)
        pdf.cell(50, 8, "VALORIZAÇÃO", ln=True, align='C')
        pdf.set_font("Arial", "", 9)
        pdf.multi_cell(50, 5, f"Ganho patrimonial imediato estimado em R$ {data.get('valuation', {}).get('gain_per_unit', 0):,.0f} por unidade.", align='C')
        
        # Pillar 3
        pdf.set_xy(140, y_pillars)
        pdf.set_fill_color(248, 250, 252)
        pdf.rect(140, y_pillars, 60, 60, 'F')
        pdf.set_xy(145, y_pillars+5)
        pdf.set_font("Arial", "B", 11)
        pdf.cell(50, 8, "COMPLIANCE", ln=True, align='C')
        pdf.set_font("Arial", "", 9)
        pdf.multi_cell(50, 5, "Atendimento integral às normas ABNT e seguradoras.", align='C')

    def _add_secao_diagnostico_v2(self, pdf, data):
        pdf.add_page()
        pdf.set_font("Arial", "B", 18)
        pdf.cell(0, 15, "4. ANÁLISE TÉCNICA DA FACHADA", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        # Foto Fachada (Centralizada e Grande)
        fac_path = data.get('vision_image_path')
        if fac_path and os.path.exists(fac_path):
            pdf.image(fac_path, x=10, w=190, h=100)
            pdf.ln(105)
            
        vision = data.get('vision_analysis', {})
        pdf.set_fill_color(15, 23, 42)
        pdf.rect(10, pdf.get_y(), 190, 60, 'F')
        
        pdf.set_xy(15, pdf.get_y()+5)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Arial", "B", 12)
        status = "CRÍTICO" if vision.get('urgencia') else "CONSERVADO"
        pdf.cell(0, 8, f"DIAGNÓSTICO IA: {status}", ln=True)
        
        pdf.set_font("Arial", "", 10)
        pdf.set_x(15)
        pdf.multi_cell(180, 6, f"Patologias Encontradas: " + ", ".join(vision.get('patologias', [])))
        pdf.ln(5)
        pdf.set_x(15)
        pdf.set_font("Arial", "I", 10)
        pdf.set_text_color(200, 200, 200)
        pdf.multi_cell(180, 5, self.normalize_text(vision.get('comentario_tecnico', '')))

    def _add_secao_memorial_v2(self, pdf, data):
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "4. CONFORMIDADE E MEMORIAL", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        # Conformidade Técnica NOVO 2.0
        prop = data.get('proposta_comercial', {})
        comp_tech = prop.get('compliance_technical', {})
        
        pdf.set_fill_color(240, 253, 244) # Light Green
        pdf.rect(10, pdf.get_y(), 190, 30, 'F')
        
        pdf.set_xy(15, pdf.get_y()+5)
        pdf.set_font("Arial", "B", 11)
        pdf.set_text_color(22, 101, 52) # Emerald 800
        pdf.cell(0, 8, "CERTIFICAÇÕES E SEGUROS INCLUSOS:", ln=True)
        
        pdf.set_font("Arial", "", 9)
        pdf.set_x(15)
        pdf.cell(60, 6, f"NR-18: {comp_tech.get('nr18_check', 'PENDENTE')}")
        pdf.cell(60, 6, f"NR-35: {comp_tech.get('nr35_check', 'PENDENTE')}")
        pdf.cell(60, 6, f"Seguro: {comp_tech.get('seguro_obra', 'N/A')}", ln=True)
        
        pdf.ln(10)
        pdf.set_text_color(0, 0, 0)
        self._add_secao_memorial(pdf, data) # Reutiliza o memorial original

    def _add_secao_assinaturas(self, pdf, data):
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 15, "7. GARANTIA E ASSINATURAS", ln=True)
        pdf.line(10, 25, 200, 25)
        pdf.ln(5)
        
        prop = data.get('proposta_comercial', {})
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 10, "GARANTIA:", ln=True)
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 6, prop.get('garantia', {}).get('descricao', ''))
        
        pdf.ln(10)
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 10, "RESPONSABILIDADE TÉCNICA:", ln=True)
        pdf.set_font("Arial", "", 10)
        comp = prop.get('compliance', {})
        pdf.multi_cell(0, 6, f"- {comp.get('nr35', '')}\n- {comp.get('nr18', '')}\n- {comp.get('art', '')}")
        
        # Campos de assinatura
        pdf.ln(50)
        pdf.line(20, pdf.get_y(), 90, pdf.get_y())
        pdf.line(120, pdf.get_y(), 190, pdf.get_y())
        
        pdf.set_y(pdf.get_y() + 2)
        pdf.set_x(20)
        pdf.set_font("Arial", "B", 9)
        pdf.cell(70, 5, "OTTO PINTURAS", align="C")
        pdf.set_x(120)
        pdf.cell(70, 5, "CONDOMÍNIO / SÍNDICO", align="C")
        
        pdf.set_y(pdf.get_y() + 5)
        pdf.set_x(20)
        pdf.set_font("Arial", "", 8)
        pdf.cell(70, 5, "Representante Legal", align="C")
        pdf.set_x(120)
        pdf.cell(70, 5, "Responsável", align="C")


if __name__ == "__main__":
    # Teste rápido simulando dados do enriquecimento 2.0
    from src.engine.smart_enrichment import OTTO_PINTURAS, PRECO_POR_M2, MEMORIAL_DESCRITIVO, SmartEnrichment
    
    gen = ReportGenerator()
    enricher = SmartEnrichment()
    
    test_data = {
        'name': 'Edifício Alfa e Centauro',
        'address': 'Av. Jundiaí, 123 - Samambaia, Jundiaí/SP',
        'coords': {'lat': -23.1857, 'lng': -46.8978},
        'vision_analysis': {
            'urgencia': True, 
            'patologias': ['Fissuras', 'Fuligem'],
            'comentario_tecnico': 'Fachada em estado crítico de conservação.'
        },
        'area_total_estimada': 12000,
        'empresa': OTTO_PINTURAS
    }
    
    # Simula o que o enriquecedor faria
    test_data['proposta_comercial'] = enricher._gerar_proposta_comercial(test_data, test_data['area_total_estimada'])
    
    path = gen.generate_valuation_report(test_data)
    print(f"Relatório completo gerado em: {path}")
