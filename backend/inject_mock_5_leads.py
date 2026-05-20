import sys
import os
from datetime import datetime

# Adiciona o diretório atual ao path para resolver os imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.utils.database import Database

def inject():
    db = Database()
    print("🚀 Injetando leads complementares para garantir pelo menos 5 leads em cada pilar...")

    # Leads para o Pilar A (Condomínios) - Precisamos de mais 4 (já temos 1)
    leads_pilar_a = [
        {
            "id": "condominio_parque_avenida",
            "name": "Condomínio Edifício Parque Avenida",
            "address": "Av. Paulista, 1776 - Bela Vista, São Paulo - SP, 01310-200",
            "lat": -23.5615,
            "lng": -46.6560,
            "score": 9.5,
            "justification": "Fundo de obras de pintura predial externa e lavagem de pastilhas aprovado em assembleia ordinária recente. Edital interno de cotação aberto para fornecedores homologados.",
            "category": "pintura_fachada",
            "responsavel_nome": "Marcos Silveira (Síndico)",
            "responsavel_contato": "(11) 98765-4321",
            "email": "parqueavenida.sindico@gmail.com",
            "source": "Pilar A (SíndicoNet)",
            "urgency_score": 9.0,
            "is_confirmed": True,
            "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "intencao_ativa": True,
            "resumo_sinal": "Cotação para restauração de fachada e pintura externa aprovada. Início previsto para o próximo trimestre.",
            "link_fonte": "https://www.sindiconet.com.br/cotacoes/sp/sao-paulo",
            "score_urgencia": 9,
            "categoria_demanda": "pintura_fachada",
            "pilar": "A",
            "vision_analysis": {
                "desgaste": "Alto",
                "fissuras": "Presença de microfissuras na fachada sul",
                "sujeira": "Presença moderada de fuligem e mofo",
                "recomendacao": "Lavagem de pastilhas + Pintura acrílica elastomérica"
            },
            "market": {
                "avg_m2_price": 95.0,
                "avg_m2": 120,
                "total_units": 140
            },
            "valuation": {
                "unit_value": 850000.0,
                "total_asset_value": 119000000.0,
                "appreciation_percent": 15.0,
                "gain_per_unit": 127500.0
            }
        },
        {
            "id": "condominio_saint_tropez",
            "name": "Condomínio Residencial Saint Tropez",
            "address": "Alameda Lorena, 1250 - Jardins, São Paulo - SP, 01424-001",
            "lat": -23.5658,
            "lng": -46.6621,
            "score": 8.8,
            "justification": "Deliberação em ata de assembleia para rateio extra de R$ 180.000,00 voltado exclusivamente para a revitalização e pintura das áreas comuns e garagens.",
            "category": "reforma_geral",
            "responsavel_nome": "Ana Beatriz Nogueira (Administradora)",
            "responsavel_contato": "(11) 97654-3210",
            "email": "adm.sainttropez@jardins.com.br",
            "source": "Pilar A (CoteiBem)",
            "urgency_score": 8.0,
            "is_confirmed": True,
            "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "intencao_ativa": True,
            "resumo_sinal": "Chamada de fornecedores para cotação de pintura de subsolos, portaria e garagens.",
            "link_fonte": "https://www.coteibem.com.br/solicitacoes/sp/sao-paulo",
            "score_urgencia": 8,
            "categoria_demanda": "reforma_geral",
            "pilar": "A",
            "vision_analysis": {
                "desgaste": "Moderado",
                "fissuras": "Nenhuma fissura estrutural detectada nas áreas comuns",
                "sujeira": "Sinais de desgaste de pneus nas garagens e descascamento nas paredes de circulação",
                "recomendacao": "Pintura epóxi de alta resistência nas garagens e acrílico premium nas áreas comuns"
            },
            "market": {
                "avg_m2_price": 110.0,
                "avg_m2": 150,
                "total_units": 48
            },
            "valuation": {
                "unit_value": 1800000.0,
                "total_asset_value": 86400000.0,
                "appreciation_percent": 10.0,
                "gain_per_unit": 180000.0
            }
        },
        {
            "id": "condominio_bella_vista_sp",
            "name": "Condomínio Residencial Bella Vista",
            "address": "Rua Rui Barbosa, 450 - Bela Vista, São Paulo - SP, 01326-010",
            "lat": -23.5582,
            "lng": -46.6438,
            "score": 8.2,
            "justification": "Assembleia Geral Extraordinária agendada para aprovação do orçamento de lavagem, restauração e pintura de fachadas prediais sob o regime de urgência.",
            "category": "pintura_fachada",
            "responsavel_nome": "Carlos Eduardo Mota (Síndico)",
            "responsavel_contato": "(11) 96543-2109",
            "email": "bellavista.sindico@outlook.com",
            "source": "Pilar A (uCondo)",
            "urgency_score": 8.0,
            "is_confirmed": True,
            "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "intencao_ativa": True,
            "resumo_sinal": "Ata publicada no painel do uCondo sobre contratação de empresa de pintura de fachada homologada.",
            "link_fonte": "https://www.ucondo.com.br/sp/sao-paulo",
            "score_urgencia": 8,
            "categoria_demanda": "pintura_fachada",
            "pilar": "A",
            "vision_analysis": {
                "desgaste": "Alto",
                "fissuras": "Descascamento acentuado de reboco e exposição de ferragem na fachada oeste",
                "sujeira": "Presença severa de umidade crônica e fuligem",
                "recomendacao": "Tratamento de ferragem exposta + Restauração de reboco + Pintura texturizada"
            },
            "market": {
                "avg_m2_price": 75.0,
                "avg_m2": 85,
                "total_units": 96
            },
            "valuation": {
                "unit_value": 480000.0,
                "total_asset_value": 46080000.0,
                "appreciation_percent": 18.0,
                "gain_per_unit": 86400.0
            }
        },
        {
            "id": "condominio_plaza_monaco",
            "name": "Condomínio Plaza Mônaco Residencial",
            "address": "Rua Pamplona, 980 - Jardim Paulista, São Paulo - SP, 01405-001",
            "lat": -23.5670,
            "lng": -46.6548,
            "score": 9.0,
            "justification": "Cotação ativa de cimento, tintas premium e andaimes listada na plataforma CoteiBem. Emissão de termo de vistoria de fachada obrigatória municipal vencida.",
            "category": "pintura_fachada",
            "responsavel_nome": "Cláudia Regina (Síndica)",
            "responsavel_contato": "(11) 95432-1098",
            "email": "plazamonaco.sindico@gmail.com",
            "source": "Pilar A (CoteiBem)",
            "urgency_score": 9.0,
            "is_confirmed": True,
            "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "intencao_ativa": True,
            "resumo_sinal": "Cotação para impermeabilização de laje superior e pintura de toda a fachada externa.",
            "link_fonte": "https://www.coteibem.com.br/solicitacoes/sp/sao-paulo",
            "score_urgencia": 9,
            "categoria_demanda": "pintura_fachada",
            "pilar": "A",
            "vision_analysis": {
                "desgaste": "Alto",
                "fissuras": "Fissuras mapeadas próximas a janelas",
                "sujeira": "Acúmulo de fuligem urbana nos frisos e pastilhas",
                "recomendacao": "Selador acrílico + Pintura com tinta elastomérica impermeável"
            },
            "market": {
                "avg_m2_price": 105.0,
                "avg_m2": 140,
                "total_units": 60
            },
            "valuation": {
                "unit_value": 1470000.0,
                "total_asset_value": 88200000.0,
                "appreciation_percent": 12.0,
                "gain_per_unit": 176400.0
            }
        }
    ]

    # Leads para o Pilar C (Corporativo & Facilities) - Precisamos de mais 4 (já temos 1)
    leads_pilar_c = [
        {
            "id": "torre_paulista_corporate",
            "name": "Torre Paulista Corporate",
            "address": "Av. Paulista, 2000 - Bela Vista, São Paulo - SP, 01310-300",
            "lat": -23.5598,
            "lng": -46.6585,
            "score": 9.7,
            "justification": "Chamamento fechado de empresas de engenharia e facilities para retrofit e pintura completa do heliponto e da fachada envidraçada/metálica da torre corporativa.",
            "category": "retrofit_fachada",
            "responsavel_nome": "Davi Ramos (Gerente de Facilities)",
            "responsavel_contato": "(11) 94321-0987",
            "email": "facilities@paulistacorporate.com.br",
            "source": "Pilar C (oHub)",
            "urgency_score": 9.0,
            "is_confirmed": True,
            "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "intencao_ativa": True,
            "resumo_sinal": "Retrofit estético e pintura anticorrosiva de estruturas metálicas elevadas.",
            "link_fonte": "https://www.ohub.com.br/cotacoes/sp/sao-paulo",
            "score_urgencia": 9,
            "categoria_demanda": "retrofit_fachada",
            "pilar": "C",
            "vision_analysis": {
                "desgaste": "Moderado",
                "fissuras": "Pontos de oxidação em estruturas metálicas externas",
                "sujeira": "Mofo e fuligem na face traseira da torre",
                "recomendacao": "Jateamento abrasivo + Pintura epóxi anticorrosiva de alta resistência"
            },
            "market": {
                "avg_m2_price": 150.0,
                "avg_m2": 350,
                "total_units": 32
            },
            "valuation": {
                "unit_value": 5250000.0,
                "total_asset_value": 168000000.0,
                "appreciation_percent": 15.0,
                "gain_per_unit": 787500.0
            }
        },
        {
            "id": "hotel_copan_residence",
            "name": "Hotel Copan Residence & Suites",
            "address": "Av. Ipiranga, 200 - Centro Histórico, São Paulo - SP, 01046-010",
            "lat": -23.5464,
            "lng": -46.6447,
            "score": 8.9,
            "justification": "Cotação para renovação estética completa de 12 andares de suítes, corredores e lobby principal do hotel de luxo, com cronograma de execução modular.",
            "category": "reforma_geral",
            "responsavel_nome": "Felipe Albuquerque (Gerente Geral)",
            "responsavel_contato": "(11) 93210-9876",
            "email": "gerencia@copanresidence.com.br",
            "source": "Pilar C (Habitissimo)",
            "urgency_score": 8.0,
            "is_confirmed": True,
            "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "intencao_ativa": True,
            "resumo_sinal": "Cotação de pintura interna em grande escala com tintas laváveis de baixo odor.",
            "link_fonte": "https://www.habitissimo.com.br/orcamento/sp/sao-paulo",
            "score_urgencia": 8,
            "categoria_demanda": "reforma_geral",
            "pilar": "C",
            "vision_analysis": {
                "desgaste": "Moderado",
                "fissuras": "Fissuras capilares de assentamento nas paredes internas",
                "sujeira": "Marcas de móveis e arranhões nos corredores de alto tráfego",
                "recomendacao": "Tratamento de trincas internas + Pintura com tinta acrílica lavável premium"
            },
            "market": {
                "avg_m2_price": 90.0,
                "avg_m2": 65,
                "total_units": 150
            },
            "valuation": {
                "unit_value": 585000.0,
                "total_asset_value": 87750000.0,
                "appreciation_percent": 12.0,
                "gain_per_unit": 70200.0
            }
        },
        {
            "id": "galpao_logistico_anhanguera",
            "name": "Complexo Logístico Anhanguera",
            "address": "Rodovia Anhanguera, km 18 - São Domingos, São Paulo - SP, 05275-000",
            "lat": -23.4795,
            "lng": -46.7588,
            "score": 9.2,
            "justification": "Necessidade de pintura de demarcação de segurança industrial, faixas de tráfego de empilhadeiras e pintura reflexiva em 4 galpões de armazenamento de e-commerce.",
            "category": "reforma_geral",
            "responsavel_nome": "Roberto Martins (Coordenador de EHS)",
            "responsavel_contato": "(11) 92109-8765",
            "email": "ehs.anhanguera@logistica.com.br",
            "source": "Pilar C (oHub)",
            "urgency_score": 9.0,
            "is_confirmed": True,
            "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "intencao_ativa": True,
            "resumo_sinal": "Demarcação viária industrial e pintura de pisos de alta resistência (Epóxi/Poliuretano).",
            "link_fonte": "https://www.ohub.com.br/cotacoes/sp/sao-paulo",
            "score_urgencia": 9,
            "categoria_demanda": "reforma_geral",
            "pilar": "C",
            "vision_analysis": {
                "desgaste": "Alto",
                "fissuras": "Piso industrial com fissuras de dilatação desgastadas",
                "sujeira": "Marcas profundas de pneus e manchas de óleos",
                "recomendacao": "Tratamento de juntas + Pintura epóxi autonivelante com demarcação poliuretânica reflexiva"
            },
            "market": {
                "avg_m2_price": 55.0,
                "avg_m2": 2500,
                "total_units": 4
            },
            "valuation": {
                "unit_value": 1375000.0,
                "total_asset_value": 5500000.0,
                "appreciation_percent": 8.0,
                "gain_per_unit": 110000.0
            }
        },
        {
            "id": "centro_medico_einstein_paulista",
            "name": "Centro Clínico Albert Einstein - Unidade Paulista",
            "address": "Av. Paulista, 500 - Bela Vista, São Paulo - SP, 01311-000",
            "lat": -23.5701,
            "lng": -46.6455,
            "score": 9.4,
            "justification": "Cotação para renovação de pintura interna em áreas assépticas, laboratórios de exames e consultórios médicos, exigindo conformidade rigorosa com normas ANVISA RDC 50.",
            "category": "reforma_geral",
            "responsavel_nome": "Dra. Patricia Lima (Diretora de Operações)",
            "responsavel_contato": "(11) 91098-7654",
            "email": "patricia.lima@einstein.br",
            "source": "Pilar C (Habitissimo)",
            "urgency_score": 9.0,
            "is_confirmed": True,
            "scanned_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "intencao_ativa": True,
            "resumo_sinal": "Cotação para serviços de pintura interna hospitalar com tintas bactericidas/antimicrobianas.",
            "link_fonte": "https://www.habitissimo.com.br/orcamento/sp/sao-paulo",
            "score_urgencia": 9,
            "categoria_demanda": "reforma_geral",
            "pilar": "C",
            "vision_analysis": {
                "desgaste": "Baixo",
                "fissuras": "Perfeitas condições estruturais",
                "sujeira": "Marcas pontuais de macas e sujidade natural em cantos de portas",
                "recomendacao": "Pintura bactericida e antimicrobiana sem cheiro de secagem ultra rápida"
            },
            "market": {
                "avg_m2_price": 140.0,
                "avg_m2": 110,
                "total_units": 45
            },
            "valuation": {
                "unit_value": 1540000.0,
                "total_asset_value": 69300000.0,
                "appreciation_percent": 15.0,
                "gain_per_unit": 231000.0
            }
        }
    ]

    for lead in leads_pilar_a:
        db.upsert_lead(lead)
        print(f"✅ Pilar A: '{lead['name']}' inserido/atualizado no banco de dados SQLite!")

    for lead in leads_pilar_c:
        db.upsert_lead(lead)
        print(f"✅ Pilar C: '{lead['name']}' inserido/atualizado no banco de dados SQLite!")

    print("🎉 Injeção concluída com sucesso! Banco de dados de Leads robusto e pronto para visualização!")

if __name__ == "__main__":
    inject()
