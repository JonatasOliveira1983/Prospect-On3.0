from datetime import datetime
import os
from src.utils.logger import logger
from src.utils.database import Database

class UsageMonitor(Database):
    """
    Monitora o consumo das APIs de IA (Gemini) e outras ferramentas.
    """
    def __init__(self, db_path="data/prospecton.db"):
        super().__init__(db_path)

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
                if self.is_postgres:
                    from psycopg2.extras import RealDictCursor
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    cur.execute("SELECT last_used, calls_today, total_calls FROM usage_stats WHERE service = %s", (service,))
                    row = cur.fetchone()
                else:
                    row = conn.execute("SELECT last_used, calls_today, total_calls FROM usage_stats WHERE service = ?", (service,)).fetchone()
                
                if row:
                    last_used, calls_today, total_calls = row if not self.is_postgres else (row['last_used'], row['calls_today'], row['total_calls'])
                    # Se mudou o dia, reseta calls_today
                    if last_used and not last_used.startswith(today_str):
                        calls_today = 1
                    else:
                        calls_today += 1
                    
                    total_calls += 1
                    
                    self._run_query(conn, """
                        UPDATE usage_stats 
                        SET calls_today = ?, total_calls = ?, last_used = ?
                        WHERE service = ?
                    """, (calls_today, total_calls, timestamp, service))
                else:
                    # Primeiro registro do serviço
                    self._run_query(conn, """
                        INSERT INTO usage_stats (service, calls_today, total_calls, last_used)
                        VALUES (?, ?, ?, ?)
                    """, (service, 1, 1, timestamp))
                
                conn.commit()
        except Exception as e:
            logger.error(f"UsageMonitor: Erro ao registrar uso para {service}: {e}")

    def get_all_stats(self):
        """Retorna estatísticas de todos os serviços."""
        try:
            with self._get_connection() as conn:
                if self.is_postgres:
                    from psycopg2.extras import RealDictCursor
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    cur.execute("SELECT * FROM usage_stats")
                    rows = cur.fetchall()
                    return [dict(row) for row in rows]
                else:
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
