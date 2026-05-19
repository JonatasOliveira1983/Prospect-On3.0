import sqlite3
import json
import os

db_path = "data/prospecton.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM usage_stats").fetchall()
    print("Usage Stats:")
    for row in rows:
        print(dict(row))
    conn.close()
else:
    print("Database not found")
