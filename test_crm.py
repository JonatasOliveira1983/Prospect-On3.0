import urllib.request, json, sys

def api(method, path, body=None, user_id=None):
    headers = {"Content-Type": "application/json"}
    if user_id:
        headers["X-User-Id"] = str(user_id)
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request("http://localhost:8002" + path, data=data, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(req, timeout=30)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return None, str(e)

print("=== CRM TEST ===")
sys.stdout.flush()

# Limpar
api("PUT", "/api/leads/test_crm_001/crm-notes", {"crm_notes": "", "crm_response": ""}, user_id=1)

# 1. Pending BEFORE
status, resp = api("GET", "/api/admin/pending-responses", user_id=1)
print("1. Pending BEFORE: %s" % resp)
sys.stdout.flush()

# 2. VENDEDOR salva nota
status, resp = api("PUT", "/api/leads/test_crm_001/crm-notes", {"crm_notes": "Carlos: pintura 500m2", "crm_response": ""}, user_id=890)
print("2. Vendedor salva: %s" % resp)
sys.stdout.flush()

# 3. Pending apos vendedor (deve ser +1)
status, resp = api("GET", "/api/admin/pending-responses", user_id=1)
print("3. Pending apos vendedor: %s" % resp)
sys.stdout.flush()

# 4. ADMIN responde
status, resp = api("PUT", "/api/leads/test_crm_001/crm-notes", {"crm_notes": "Carlos: pintura 500m2", "crm_response": "Joao: agendar visita"}, user_id=1)
print("4. Admin responde: %s" % resp)
sys.stdout.flush()

# 5. Pending apos admin (deve diminuir)
status, resp = api("GET", "/api/admin/pending-responses", user_id=1)
print("5. Pending apos admin: %s" % resp)
sys.stdout.flush()

# 6. Verificar DB direto
import sqlite3
conn = sqlite3.connect("C:/Users/spcom/Desktop/Prospect-On 3.0/backend/data/prospecton.db")
c = conn.cursor()
c.execute("SELECT id, crm_notes, crm_response FROM leads WHERE id = 'test_crm_001'")
row = c.fetchone()
print("6. DB leads: %s" % str(row))
c.execute("SELECT id, user_id, crm_notes, crm_response FROM leads_quentes WHERE id = 'test_crm_001'")
rows = c.fetchall()
print("7. DB lq: %s" % str(rows))
conn.close()

print("=== DONE ===")
