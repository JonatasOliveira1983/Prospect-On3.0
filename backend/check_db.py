import sqlite3
import json
import os

db_path = "data/prospecton.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT name, score, vision_analysis_json FROM leads").fetchall()
    print(f"Total leads: {len(rows)}")
    for row in rows:
        analysis = json.loads(row['vision_analysis_json'] or '{}')
        print(f"Name: {row['name']} | Score: {row['score']} | IA Analysis: {analysis.get('desgaste', 'N/D')}")
    conn.close()
else:
    print("Database not found")
