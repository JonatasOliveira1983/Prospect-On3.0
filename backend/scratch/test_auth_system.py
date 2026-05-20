import requests

BASE_URL = "http://localhost:8002"

def test_login():
    print("=== TESTANDO LOGIN ===")
    
    # Login correto admin 1
    payload = {"email": "joao.ottopinturas@gmail.com", "password": "123"}
    r = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
    print("Login Admin 1 (Esperado 200):", r.status_code)
    if r.status_code == 200:
        admin_data = r.json()
        print("Admin 1 retornado:", admin_data)
        admin_id = admin_data["user"]["id"]
    else:
        print("Erro:", r.text)
        return

    # Login incorreto
    payload = {"email": "joao.ottopinturas@gmail.com", "password": "errada"}
    r = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
    print("Login com senha errada (Esperado 401):", r.status_code)

    # Buscar todos os usuários como admin
    print("\n=== TESTANDO BUSCA DE USUÁRIOS ===")
    headers = {"X-User-Id": str(admin_id)}
    r = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
    print("Busca de usuários (Esperado 200):", r.status_code)
    if r.status_code == 200:
        users = r.json()
        print("Usuários cadastrados:", [u["email"] for u in users])
    else:
        print("Erro:", r.text)
        return

    # Criar um novo vendedor
    print("\n=== TESTANDO CRIAÇÃO DE VENDEDOR ===")
    vendedor_payload = {
        "email": "vendedor.teste@gmail.com",
        "password": "senha123",
        "name": "Vendedor Teste",
        "role": "vendedor",
        "phone": "11988887777",
        "document": "123.456.789-00"
    }
    r = requests.post(f"{BASE_URL}/api/admin/users", json=vendedor_payload, headers=headers)
    print("Criação de vendedor (Esperado 200 ou 400 se já existir):", r.status_code)
    print("Resposta criação:", r.text)

    # Login do vendedor criado
    print("\n=== TESTANDO LOGIN DO VENDEDOR CRIADO ===")
    payload_vendedor = {"email": "vendedor.teste@gmail.com", "password": "senha123"}
    r = requests.post(f"{BASE_URL}/api/auth/login", json=payload_vendedor)
    print("Login Vendedor (Esperado 200):", r.status_code)
    if r.status_code == 200:
        vendedor_data = r.json()
        vendedor_id = vendedor_data["user"]["id"]
        print("Vendedor retornado ID:", vendedor_id)
    else:
        print("Erro:", r.text)
        return

    # Acesso a rotas administrativas pelo vendedor
    print("\n=== TESTANDO SEGURANÇA (BLOQUEIO DO VENDEDOR) ===")
    vendedor_headers = {"X-User-Id": str(vendedor_id)}
    r = requests.get(f"{BASE_URL}/api/admin/users", headers=vendedor_headers)
    print("Vendedor buscando usuários (Esperado 403):", r.status_code)

    # Atualizar perfil do vendedor
    print("\n=== TESTANDO ATUALIZAÇÃO DE PERFIL ===")
    update_payload = {
        "name": "Vendedor Teste Modificado",
        "phone": "11999998888",
        "document": "987.654.321-11",
        "password": "novasenha123"
    }
    r = requests.put(f"{BASE_URL}/api/users/profile", json=update_payload, headers=vendedor_headers)
    print("Atualizar perfil (Esperado 200):", r.status_code)
    if r.status_code == 200:
        print("Perfil atualizado:", r.json())
    else:
        print("Erro:", r.text)

    # Login com a nova senha
    print("\n=== TESTANDO LOGIN COM NOVA SENHA ===")
    payload_nova = {"email": "vendedor.teste@gmail.com", "password": "novasenha123"}
    r = requests.post(f"{BASE_URL}/api/auth/login", json=payload_nova)
    print("Login com nova senha (Esperado 200):", r.status_code)

    # Limpeza: Deletar usuário de teste como admin
    print("\n=== LIMPEZA DE TESTE ===")
    r = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
    if r.status_code == 200:
        users = r.json()
        for u in users:
            if u["email"] == "vendedor.teste@gmail.com":
                del_r = requests.delete(f"{BASE_URL}/api/admin/users/{u['id']}", headers=headers)
                print(f"Deletando usuário {u['email']} (Esperado 200):", del_r.status_code, del_r.text)

if __name__ == "__main__":
    test_login()
