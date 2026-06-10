import sqlite3
conn = sqlite3.connect('C:/Users/spcom/Desktop/Prospect-On 3.0/backend/data/prospecton.db')
c = conn.cursor()

print("=== leads with notes, no response ===")
c.execute("SELECT id, crm_notes, crm_response FROM leads WHERE crm_notes IS NOT NULL AND crm_notes != '' AND (crm_response IS NULL OR crm_response = '')")
rows = c.fetchall()
for r in rows:
    print("  %s: notes=%r resp=%r" % (r[0], r[1], r[2]))
print("  Total: %d" % len(rows))

print("\n=== leads_quentes with notes, no response ===")
c.execute("SELECT id, user_id, crm_notes, crm_response FROM leads_quentes WHERE crm_notes IS NOT NULL AND crm_notes != '' AND (crm_response IS NULL OR crm_response = '')")
rows2 = c.fetchall()
for r in rows2:
    print("  %s (user=%d): notes=%r resp=%r" % (r[0], r[1], r[2], r[3]))
print("  Total: %d" % len(rows2))

print("\n=== leads with response (should NOT be pending) ===")
c.execute("SELECT id, crm_notes, crm_response FROM leads WHERE crm_response IS NOT NULL AND crm_response != ''")
rows3 = c.fetchall()
for r in rows3:
    print("  %s: notes=%r resp=%r" % (r[0], r[1], r[2]))
print("  Total: %d" % len(rows3))

conn.close()
