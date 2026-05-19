from src.utils.database import Database
from datetime import datetime

db = Database()
mock_lead = {
    "name": "TESTE TURBO 01",
    "address": "Rua do Sniper, 123",
    "score": 9.5,
    "source": "Mock Test",
    "scanned_at": datetime.now().isoformat(),
    "email": "contato@teste.com",
    "phone": "11999999999",
    "social_url": "instagram.com/teste"
}
db.upsert_lead(mock_lead)
print("Lead de teste injetado!")
