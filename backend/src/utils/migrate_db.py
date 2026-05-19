import sqlite3
import os
import sys

# Adicionar o diretório raiz ao path para importar Database
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.utils.database import Database

def migrate():
    db_path = "data/prospecton.db"
    if not os.path.exists(db_path):
        print("Base de dados não encontrada. Criando nova...")
        db = Database()
        print("✅ Base de dados criada com sucesso.")
        return

    print(f"Migrando base de dados em {db_path}...")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Adicionar novas colunas se não existirem
        new_columns = [
            ("demand_json", "TEXT"),
            ("source", "TEXT"),
            ("urgency_score", "REAL"),
            ("responsavel_nome", "TEXT"),
            ("responsavel_contato", "TEXT"),
            ("satellite_image_path", "TEXT"),
            ("email", "TEXT"),
            ("social_url", "TEXT"),
            ("booking_url", "TEXT"),
            ("scanned_at", "TEXT"),
            ("enriched_at", "TEXT")
        ]
        
        for col_name, col_type in new_columns:
            try:
                cursor.execute(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type}")
                print(f"✅ Coluna '{col_name}' adicionada.")
            except sqlite3.OperationalError:
                print(f"ℹ️ Coluna '{col_name}' já existe.")
        
        conn.commit()
        conn.close()
        print("✅ Migração concluída.")
    except Exception as e:
        print(f"❌ Erro na migração: {e}")

if __name__ == "__main__":
    migrate()
