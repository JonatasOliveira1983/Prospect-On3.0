import os
import re
from datetime import datetime
from src.utils.logger import logger
from src.utils.database import Database

class CSVProcessor:
    """
    Processador de arquivos .xls (HTML Table) gerados pela extensão Google Maps Business Scraper.
    """
    def __init__(self):
        self.db = Database()
        
    def process_file(self, file_path):
        logger.info(f"CSVProcessor: Processando arquivo {file_path}")
        if not os.path.exists(file_path):
            return 0
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extrair linhas da tabela usando Regex (v3.0 robusto)
            rows = re.findall(r'<tr>(.*?)</tr>', content, re.DOTALL)
            if not rows:
                logger.warning("CSVProcessor: Nenhuma linha encontrada no arquivo.")
                return 0
                
            # A primeira linha é o cabeçalho
            # Nome, Website, Agendamento, Cardápio, Redes Sociais, Telefone, Email, Endereço
            count = 0
            for row_content in rows[1:]:
                cells = re.findall(r'<td.*?>(.*?)</td>', row_content, re.DOTALL)
                if len(cells) >= 8:
                    # Limpar tags HTML dos links se existirem
                    def clean(val):
                        val = re.sub(r'<.*?>', '', val).strip()
                        return val if val != 'Sem info' else 'N/D'

                    lead = {
                        "name": clean(cells[0]),
                        "website": clean(cells[1]),
                        "booking_url": clean(cells[2]),
                        "social_url": clean(cells[4]),
                        "phone": clean(cells[5]),
                        "email": clean(cells[6]),
                        "address": clean(cells[7]),
                        "source": "Extension Turbo Scan",
                        "scanned_at": datetime.now().isoformat()
                    }
                    
                    # Upsert no banco
                    self.db.upsert_lead(lead)
                    count += 1
            
            logger.info(f"CSVProcessor: {count} leads processados e salvos.")
            return count
            
        except Exception as e:
            logger.error(f"CSVProcessor: Erro ao processar arquivo: {e}")
            return 0

if __name__ == "__main__":
    # Teste
    processor = CSVProcessor()
    # print(processor.process_file("path/to/file.xls"))
