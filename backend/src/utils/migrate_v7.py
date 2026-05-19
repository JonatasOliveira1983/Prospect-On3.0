import sqlite3
import os

db_path = "data/prospecton.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_columns = [
        ("email", "TEXT"),
        ("social_url", "TEXT"),
        ("booking_url", "TEXT")
    ]
    
    for col_name, col_type in new_columns:
        try:
            cursor.execute(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type}")
            print(f"Column {col_name} added.")
        except sqlite3.OperationalError:
            print(f"Column {col_name} already exists.")
            
    conn.commit()
    conn.close()
    print("Migration finished!")
else:
    print("Database not found.")
