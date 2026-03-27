# Prospect-On 1.0 (Antygravit)

Backend de inteligência comercial para a Otto Pinturas.

## Como Rodar

1.  Crie um ambiente virtual:
    ```bash
    python -m venv venv
    source venv/bin/activate  # No Windows: venv\Scripts\activate
    ```
2.  Instale as dependências:
    ```bash
    pip install -r backend/requirements.txt
    ```
3.  Configure o `.env`:
    - Copie `.env.example` para `.env`
    - Adicione sua `GOOGLE_MAPS_API_KEY`.
4.  Execute o radar:
    ```bash
    python backend/main.py
    ```
