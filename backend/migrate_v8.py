"""
migrate_v8.py — Cria as tabelas de varredura de demanda (3 Pilares).

Tabelas novas:
  - demand_scans: metadados de cada varredura (cidade, timestamp, total).
  - demand_leads:  leads normalizados dos 3 Pilares (A/B/C).

Compatível com SQLite e PostgreSQL (via DATABASE_URL).
Execução idempotente (CREATE TABLE IF NOT EXISTS).
"""

import os
import sys

# Adiciona o diretório pai ao path para importar do src/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.utils.database import Database


def migrate():
    db = Database()

    with db._get_connection() as conn:
        # ── Tabela: demand_scans ──────────────────────────────────
        db._run_query(conn, """
            CREATE TABLE IF NOT EXISTS demand_scans (
                id TEXT PRIMARY KEY,
                cidade TEXT NOT NULL,
                total_leads INTEGER DEFAULT 0,
                a_count INTEGER DEFAULT 0,
                b_count INTEGER DEFAULT 0,
                c_count INTEGER DEFAULT 0,
                scanned_at TEXT NOT NULL
            )
        """)

        # ── Tabela: demand_leads ──────────────────────────────────
        db._run_query(conn, """
            CREATE TABLE IF NOT EXISTS demand_leads (
                id TEXT PRIMARY KEY,
                scan_id TEXT NOT NULL,
                pilar TEXT NOT NULL CHECK(pilar IN ('A', 'B', 'C')),
                nome TEXT NOT NULL,
                tipo TEXT DEFAULT 'predio',
                endereco TEXT,
                cidade TEXT,
                uf TEXT,
                contato TEXT,
                telefone TEXT,
                email TEXT,
                site TEXT,
                status TEXT,
                resumo TEXT,
                data_publicacao TEXT,
                prazo TEXT,
                valor_estimado TEXT,
                tag TEXT DEFAULT 'manutencao',
                score_urgencia INTEGER DEFAULT 5,
                link_fonte TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (scan_id) REFERENCES demand_scans(id) ON DELETE CASCADE
            )
        """)

        # Índices para consultas rápidas
        if db.is_postgres:
            db._run_query(conn, """
                CREATE INDEX IF NOT EXISTS idx_demand_leads_scan
                    ON demand_leads (scan_id)
            """)
            db._run_query(conn, """
                CREATE INDEX IF NOT EXISTS idx_demand_leads_pilar
                    ON demand_leads (pilar)
            """)
            db._run_query(conn, """
                CREATE INDEX IF NOT EXISTS idx_demand_leads_cidade
                    ON demand_leads (cidade)
            """)
            db._run_query(conn, """
                CREATE INDEX IF NOT EXISTS idx_demand_scans_cidade
                    ON demand_scans (cidade)
            """)
        else:
            db._run_query(conn, """
                CREATE INDEX IF NOT EXISTS idx_demand_leads_scan
                    ON demand_leads (scan_id)
            """)
            db._run_query(conn, """
                CREATE INDEX IF NOT EXISTS idx_demand_leads_pilar
                    ON demand_leads (pilar)
            """)
            db._run_query(conn, """
                CREATE INDEX IF NOT EXISTS idx_demand_leads_cidade
                    ON demand_leads (cidade)
            """)
            db._run_query(conn, """
                CREATE INDEX IF NOT EXISTS idx_demand_scans_cidade
                    ON demand_scans (cidade)
            """)

        conn.commit()

    print("✅ migrate_v8.py: Tabelas demand_scans e demand_leads criadas/verificadas com sucesso.")
    print("   → demand_scans: histórico de varreduras por cidade")
    print("   → demand_leads:  leads normalizados dos Pilares A, B e C")


if __name__ == "__main__":
    migrate()