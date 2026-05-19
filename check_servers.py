import socket

def check_port(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        try:
            s.connect((host, port))
            return True
        except (socket.timeout, ConnectionRefusedError):
            return False

if __name__ == "__main__":
    print("--- STATUS DOS SERVIDORES LOCAIS ---")
    
    backend_ok = check_port("127.0.0.1", 8002)
    print(f"Backend (Porta 8002 - FastAPI) : {'ATIVO' if backend_ok else 'INATIVO'}")
    
    frontend_ok = check_port("127.0.0.1", 3000)
    print(f"Frontend (Porta 3000 - Next.js) : {'ATIVO' if frontend_ok else 'INATIVO'}")
