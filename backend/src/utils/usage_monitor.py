import sqlite3
from datetime import datetime
import os
from src.utils.logger import logger

class UsageMonitor:
    """
    Monitora o consumo das APIs de IA (Gemini) e outras ferramentas.
    """
    def __init__(self, db_path="data/prospecton.db"):
        self.db_path = db_path
        self._ensure_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _ensure_db(self):
        # Garante que a tabela existe (fallback caso não tenha sido criada no database.py)
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS usage_stats (
                    service TEXT PRIMARY KEY,
                    calls_today INTEGER DEFAULT 0,
                    total_calls INTEGER DEFAULT 0,
                    last_used TEXT
                )
            """)
            conn.commit()

    def log_usage(self, service: str):
        """
        Registra uma chamada de API para um serviço.
        Reseta o contador diário se for um novo dia.
        """
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")
        timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

        try:
            with self._get_connection() as conn:
                # Busca o estado atual
                row = conn.execute("SELECT last_used, calls_today, total_calls FROM usage_stats WHERE service = ?", (service,)).fetchone()
                
                if row:
                    last_used, calls_today, total_calls = row
                    # Se mudou o dia, reseta calls_today
                    if last_used and not last_used.startswith(today_str):
                        calls_today = 1
                    else:
                        calls_today += 1
                    
                    total_calls += 1
                    
                    conn.execute("""
                        UPDATE usage_stats 
                        SET calls_today = ?, total_calls = ?, last_used = ?
                        WHERE service = ?
                    """, (calls_today, total_calls, timestamp, service))
                else:
                    # Primeiro registro do serviço
                    conn.execute("""
                        INSERT INTO usage_stats (service, calls_today, total_calls, last_used)
                        VALUES (?, ?, ?, ?)
                    """, (service, 1, 1, timestamp))
                
                conn.commit()
                # logger.info(f"UsageMonitor: Chamada registrada para {service}")
        except Exception as e:
            logger.error(f"UsageMonitor: Erro ao registrar uso para {service}: {e}")

    def get_all_stats(self):
        """Retorna estatísticas de todos os serviços."""
        try:
            with self._get_connection() as conn:
                conn.row_factory = sqlite3.Row
                rows = conn.execute("SELECT * FROM usage_stats").fetchall()
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"UsageMonitor: Erro ao buscar estatísticas: {e}")
            return []

if __name__ == "__main__":
    monitor = UsageMonitor()
    monitor.log_usage("deepseek-chat")
    print(monitor.get_all_stats())
