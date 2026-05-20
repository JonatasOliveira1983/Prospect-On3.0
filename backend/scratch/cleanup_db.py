import sqlite3
import json
import os

db_path = "data/prospecton.db"
if not os.path.exists(db_path):
    print("Banco de dados não encontrado em", db_path)
    exit(1)

print("Iniciando limpeza do banco de dados:", db_path)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

cursor = conn.cursor()
rows = cursor.execute("SELECT * FROM leads").fetchall()
print(f"Total de leads para analisar: {len(rows)}")

replacements = {
    "Condomnio": "Condomínio",
    "Edifcio": "Edifício",
    "So": "São",
    "Universitria": "Universitária",
    "Csar": "César",
    "Histrico": "Histórico",
    "revitalizao": "revitalização",
    "oramento": "orçamento",
    "cotao": "cotação",
    "Sndico": "Síndico",
    "Responsvel": "Responsável",
    "So Paulo": "São Paulo",
    "So": "São",
    "So Paulo": "São Paulo",
    "Jundia": "Jundiaí"
}

def clean_text(text):
    if not text:
        return text
    
    # Primeiro tenta corrigir dupla codificação comum
    try:
        # Se for string corrompida por leitura CP1252 de UTF-8
        # Exemplo: "Ã£" -> "ã"
        temp_bytes = text.encode('cp1252', errors='ignore')
        decoded = temp_bytes.decode('utf-8')
        if len(decoded) < len(text) and any(c in decoded for c in 'áéíóúçãõêâ'):
            text = decoded
    except Exception:
        pass

    # Aplica o dicionário de substituições explícitas para limpar \ufffd ()
    for target, replacement in replacements.items():
        text = text.replace(target, replacement)
    
    # Correções extras de caracteres soltos corrompidos
    text = text.replace("", "í") # fallback mais comum para Copan e Edifício
    text = text.replace("Condomínio Edifício Copan", "Condomínio Edifício Copan")
    
    return text

def clean_json_string(json_str):
    if not json_str:
        return json_str
    try:
        data = json.loads(json_str)
        cleaned_data = clean_dict_or_list(data)
        return json.dumps(cleaned_data, ensure_ascii=False)
    except Exception:
        return clean_text(json_str)

def clean_dict_or_list(obj):
    if isinstance(obj, dict):
        return {k: clean_dict_or_list(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_dict_or_list(x) for x in obj]
    elif isinstance(obj, str):
        return clean_text(obj)
    return obj

updated_count = 0
for row in rows:
    lead_id = row['id']
    
    # Campos diretos de texto
    name = clean_text(row['name'])
    address = clean_text(row['address'])
    justification = clean_text(row['justification'])
    responsavel_nome = clean_text(row['responsavel_nome'])
    resumo_sinal = clean_text(row['resumo_sinal'])
    source = clean_text(row['source'])
    category = clean_text(row['category'])
    categoria_demanda = clean_text(row['categoria_demanda'])
    
    # JSONs
    vision_analysis_json = clean_json_string(row['vision_analysis_json'])
    market_json = clean_json_string(row['market_json'])
    valuation_json = clean_json_string(row['valuation_json'])
    financial_health_json = clean_json_string(row['financial_health_json'])
    demand_json = clean_json_string(row['demand_json'])
    
    cursor.execute("""
        UPDATE leads SET
            name = ?,
            address = ?,
            justification = ?,
            responsavel_nome = ?,
            resumo_sinal = ?,
            source = ?,
            category = ?,
            categoria_demanda = ?,
            vision_analysis_json = ?,
            market_json = ?,
            valuation_json = ?,
            financial_health_json = ?,
            demand_json = ?
        WHERE id = ?
    """, (
        name, address, justification, responsavel_nome, resumo_sinal,
        source, category, categoria_demanda,
        vision_analysis_json, market_json, valuation_json, financial_health_json, demand_json,
        lead_id
    ))
    updated_count += 1

conn.commit()
conn.close()

print(f"✅ Limpeza concluída com sucesso! {updated_count} leads limpos e salvos em UTF-8 no SQLite.")
