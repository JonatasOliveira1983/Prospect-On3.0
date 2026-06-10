import urllib.request, json, sys

def api(method, path, body=None, user_id=None):
    headers = {"Content-Type": "application/json"}
    if user_id:
        headers["X-User-Id"] = str(user_id)
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request("http://localhost:8002" + path, data=data, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(req, timeout=10)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return None, str(e)

print("=== CHAT TEST ===")
sys.stdout.flush()

# 1. VENDEDOR envia mensagem
status, resp = api("POST", "/api/leads/test_crm_001/messages",
    {"message": "Ola admin, cliente quer pintura externa de 500m2", "user_name": "Carlos Cabral"},
    user_id=890)
print("1. Vendedor envia: %s" % resp)
sys.stdout.flush()

# 2. ADMIN envia mensagem
status, resp = api("POST", "/api/leads/test_crm_001/messages",
    {"message": "Ok Carlos, pode enviar proposta de R$25.000", "user_name": "Joao Otto"},
    user_id=1)
print("2. Admin envia: %s" % resp)
sys.stdout.flush()

# 3. VENDEDOR envia novamente
status, resp = api("POST", "/api/leads/test_crm_001/messages",
    {"message": "Autorizado! Vou enviar a proposta hoje", "user_name": "Carlos Cabral"},
    user_id=890)
print("3. Vendedor responde: %s" % resp)
sys.stdout.flush()

# 4. VENDEDOR le as mensagens (marca como lidas)
status, resp = api("GET", "/api/leads/test_crm_001/messages", user_id=890)
print("4. Vendedor le: %d mensagens" % len(resp.get("messages", [])))
for m in resp.get("messages", []):
    print("   [%s] %s: %s" % ("MINE" if m["user_id"] == 890 else "OTHER", m["user_name"], m["message"]))
sys.stdout.flush()

# 5. Unread para admin (depois de vendedor ler)
status, resp = api("GET", "/api/messages/unread", user_id=1)
print("5. Admin unread: %s" % resp)
sys.stdout.flush()

# 6. Unread para vendedor
status, resp = api("GET", "/api/messages/unread", user_id=890)
print("6. Vendedor unread: %s" % resp)
sys.stdout.flush()

# 7. ADMIN le as mensagens (marca como lidas)
status, resp = api("GET", "/api/leads/test_crm_001/messages", user_id=1)
print("7. Admin le: %d mensagens" % len(resp.get("messages", [])))
sys.stdout.flush()

# 8. Unread para admin depois de ler
status, resp = api("GET", "/api/messages/unread", user_id=1)
print("8. Admin unread apos ler: %s" % resp)
sys.stdout.flush()

# 9. VENDEDOR tenta deletar mensagem do admin (nao deve funcionar)
# Primeiro pega o ID da mensagem do admin
msgs = api("GET", "/api/leads/test_crm_001/messages", user_id=890)[1].get("messages", [])
admin_msg_id = None
for m in msgs:
    if m["user_id"] == 1:
        admin_msg_id = m["id"]
        break
if admin_msg_id:
    status, resp = api("DELETE", "/api/leads/test_crm_001/messages/%d" % admin_msg_id, user_id=890)
    print("9. Vendedor deleta msg admin: %s (deveria falhar)" % resp)
else:
    print("9. Nao encontrou msg do admin")
sys.stdout.flush()

# 10. ADMIN deleta propria mensagem
my_msg_id = None
for m in msgs:
    if m["user_id"] == 890:
        my_msg_id = m["id"]
        break
# Pegar msg do vendedor para admin deletar
msgs2 = api("GET", "/api/leads/test_crm_001/messages", user_id=1)[1].get("messages", [])
for m in msgs2:
    if m["user_id"] == 890:
        my_msg_id = m["id"]
        break
if my_msg_id:
    status, resp = api("DELETE", "/api/leads/test_crm_001/messages/%d" % my_msg_id, user_id=1)
    print("10. Admin deleta msg vendedor: %s (pode funcionar mas so deleta propia)" % resp)
sys.stdout.flush()

# 11. Verificar mensagens finais
status, resp = api("GET", "/api/leads/test_crm_001/messages", user_id=1)
print("11. Mensagens finais: %d" % len(resp.get("messages", [])))
for m in resp.get("messages", []):
    print("    [%s] %s: %s" % ("MINE" if m["user_id"] == 1 else "OTHER", m["user_name"], m["message"]))

print("\n=== CHAT TEST DONE ===")
