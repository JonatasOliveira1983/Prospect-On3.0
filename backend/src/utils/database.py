import sqlite3
import json
import os
from datetime import datetime
from src.utils.logger import logger

class Database:
    def _is_valid_postgres_url(self, url: str) -> bool:
        if not url:
            return False
        url_lower = url.lower()
        if not (url_lower.startswith("postgres://") or url_lower.startswith("postgresql://")):
            return False
        if "sua_url" in url_lower or "<" in url_lower or "placeholder" in url_lower:
            return False
        return True

    def __init__(self, db_path="data/prospecton.db"):
        self.db_path = db_path
        self.is_postgres = False
        
        # Se houver DATABASE_URL válida no ambiente, usamos PostgreSQL
        db_url = os.environ.get("DATABASE_URL")
        if not self._is_valid_postgres_url(db_url):
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
        else:
            self.is_postgres = True
            
        self._create_tables()

    def _get_connection(self):
        db_url = os.environ.get("DATABASE_URL")
        if self._is_valid_postgres_url(db_url):
            try:
                import psycopg2
                conn = psycopg2.connect(db_url)
                self.is_postgres = True
                return conn
            except ImportError:
                logger.error("DB: DATABASE_URL detectada, mas 'psycopg2' não está instalado.")
        
        import sqlite3
        self.is_postgres = False
        return sqlite3.connect(self.db_path)

    def _run_query(self, conn, query, params=()):
        if self.is_postgres:
            query = query.replace("?", "%s")
            cur = conn.cursor()
            cur.execute(query, params)
            return cur
        else:
            return conn.execute(query, params)

    def _create_tables(self):
        with self._get_connection() as conn:
            self._run_query(conn, """
                CREATE TABLE IF NOT EXISTS leads (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    address TEXT,
                    lat REAL,
                    lng REAL,
                    score REAL,
                    justification TEXT,
                    category TEXT,
                    responsavel_nome TEXT,
                    responsavel_contato TEXT,
                    vision_image_path TEXT,
                    vision_image_url TEXT,
                    satellite_image_path TEXT,
                    vision_analysis_json TEXT,
                    market_json TEXT,
                    valuation_json TEXT,
                    financial_health_json TEXT,
                    demand_json TEXT, 
                    source TEXT,      
                    urgency_score REAL, 
                    is_confirmed BOOLEAN DEFAULT FALSE,
                    email TEXT,
                    social_url TEXT,
                    booking_url TEXT,
                    scanned_at TEXT,
                    enriched_at TEXT,
                    interaction_notes TEXT,
                    return_date TEXT,
                    email_sent_at TEXT,
                    is_favorite BOOLEAN DEFAULT FALSE,
                    contact_status TEXT DEFAULT 'Aguardando Abordagem',
                    intencao_ativa BOOLEAN DEFAULT FALSE,
                    resumo_sinal TEXT,
                    link_fonte TEXT,
                    score_urgencia INTEGER DEFAULT 0,
                    categoria_demanda TEXT,
                    pilar TEXT DEFAULT 'A'
                )
            """)
            
            # Migração de colunas apenas se for SQLite local
            if not self.is_postgres:
                for col, col_type in [
                    ("interaction_notes", "TEXT"), 
                    ("return_date", "TEXT"), 
                    ("email_sent_at", "TEXT"),
                    ("is_favorite", "BOOLEAN DEFAULT 0"),
                    ("contact_status", "TEXT DEFAULT 'Aguardando Abordagem'"),
                    ("intencao_ativa", "BOOLEAN DEFAULT 0"),
                    ("resumo_sinal", "TEXT"),
                    ("link_fonte", "TEXT"),
                    ("score_urgencia", "INTEGER DEFAULT 0"),
                    ("categoria_demanda", "TEXT"),
                    ("pilar", "TEXT DEFAULT 'A'")
                ]:
                    try:
                        conn.execute(f"ALTER TABLE leads ADD COLUMN {col} {col_type}")
                    except sqlite3.OperationalError:
                        pass

            # Tabela de estatísticas de uso (IA)
            self._run_query(conn, """
                CREATE TABLE IF NOT EXISTS usage_stats (
                    service TEXT PRIMARY KEY,
                    calls_today INTEGER DEFAULT 0,
                    total_calls INTEGER DEFAULT 0,
                    last_used TEXT
                )
            """)
            conn.commit()

    def save_interaction(self, lead_id, notes, return_date, contact_status='Aguardando Abordagem', email_sent_at=None, vision_image_url=None):
        try:
            with self._get_connection() as conn:
                if email_sent_at and vision_image_url:
                    self._run_query(conn, """
                        UPDATE leads 
                        SET interaction_notes = ?, return_date = ?, contact_status = ?, email_sent_at = ?, vision_image_url = ?
                        WHERE id = ?
                    """, (notes, return_date, contact_status, email_sent_at, vision_image_url, lead_id))
                elif email_sent_at:
                    self._run_query(conn, """
                        UPDATE leads 
                        SET interaction_notes = ?, return_date = ?, contact_status = ?, email_sent_at = ?
                        WHERE id = ?
                    """, (notes, return_date, contact_status, email_sent_at, lead_id))
                elif vision_image_url:
                    self._run_query(conn, """
                        UPDATE leads 
                        SET interaction_notes = ?, return_date = ?, contact_status = ?, vision_image_url = ?
                        WHERE id = ?
                    """, (notes, return_date, contact_status, vision_image_url, lead_id))
                else:
                    self._run_query(conn, """
                        UPDATE leads 
                        SET interaction_notes = ?, return_date = ?, contact_status = ?
                        WHERE id = ?
                    """, (notes, return_date, contact_status, lead_id))
                conn.commit()
            logger.info(f"DB: Interação comercial salva para o lead {lead_id} | Status: {contact_status}")
            return True
        except Exception as e:
            logger.error(f"DB: Erro ao salvar interação para o lead {lead_id}: {e}")
            return False

    def toggle_favorite(self, lead_id, is_favorite):
        try:
            with self._get_connection() as conn:
                self._run_query(conn, """
                    UPDATE leads 
                    SET is_favorite = ?
                    WHERE id = ?
                """, (is_favorite, lead_id))
                conn.commit()
            logger.info(f"DB: Favorito alterado para {is_favorite} no lead {lead_id}")
            return True
        except Exception as e:
            logger.error(f"DB: Erro ao alternar favorito para o lead {lead_id}: {e}")
            return False

    def upsert_lead(self, lead_data):
        """Insere ou atualiza um lead no banco de dados (v7.2 Postgres/SQLite)."""
        try:
            lead_id = lead_data.get('id') or lead_data['name'].lower().replace(" ", "_").replace("/", "-")
            
            vision_analysis = json.dumps(lead_data.get('vision_analysis') or {}, ensure_ascii=False)
            market = json.dumps(lead_data.get('market') or {}, ensure_ascii=False)
            valuation = json.dumps(lead_data.get('valuation') or {}, ensure_ascii=False)
            financial = json.dumps(lead_data.get('financial_health') or {}, ensure_ascii=False)
            demand = json.dumps(lead_data.get('demand') or {}, ensure_ascii=False)
            
            coords = lead_data.get('coords') or {}
            lat = coords.get('lat') or lead_data.get('lat') or 0
            lng = coords.get('lng') or lead_data.get('lng') or 0

            vision_path = lead_data.get('vision_image_path')
            satellite_path = lead_data.get('satellite_image_path')
            
            port = "8002"
            if vision_path:
                filename = os.path.basename(vision_path)
                vision_url = f"http://localhost:{port}/api/images/{filename}"
            else:
                vision_url = lead_data.get('vision_image_url')

            with self._get_connection() as conn:
                self._run_query(conn, """
                    INSERT INTO leads (
                        id, name, address, lat, lng, score, justification, category,
                        responsavel_nome, responsavel_contato,
                        vision_image_path, vision_image_url, satellite_image_path,
                        vision_analysis_json, market_json, valuation_json, financial_health_json,
                        demand_json, source, urgency_score,
                        is_confirmed, email, social_url, booking_url, scanned_at,
                        intencao_ativa, resumo_sinal, link_fonte, score_urgencia, categoria_demanda,
                        pilar
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        name=excluded.name, address=excluded.address, lat=excluded.lat, lng=excluded.lng,
                        score=excluded.score, justification=excluded.justification, category=excluded.category,
                        responsavel_nome=excluded.responsavel_nome, responsavel_contato=excluded.responsavel_contato,
                        vision_image_path=excluded.vision_image_path, vision_image_url=excluded.vision_image_url,
                        satellite_image_path=excluded.satellite_image_path,
                        vision_analysis_json=excluded.vision_analysis_json, market_json=excluded.market_json,
                        valuation_json=excluded.valuation_json, financial_health_json=excluded.financial_health_json,
                        demand_json=excluded.demand_json, source=excluded.source, urgency_score=excluded.urgency_score,
                        is_confirmed=excluded.is_confirmed, email=excluded.email, social_url=excluded.social_url, 
                        booking_url=excluded.booking_url, scanned_at=excluded.scanned_at,
                        intencao_ativa=excluded.intencao_ativa, resumo_sinal=excluded.resumo_sinal,
                        link_fonte=excluded.link_fonte, score_urgencia=excluded.score_urgencia,
                        categoria_demanda=excluded.categoria_demanda, pilar=excluded.pilar
                """, (
                    lead_id, lead_data['name'], lead_data['address'], lat, lng,
                    lead_data.get('score', 0), lead_data.get('justification', ''), lead_data.get('category', ''),
                    lead_data.get('responsavel_nome', ''), lead_data.get('responsavel_contato') or lead_data.get('whatsapp') or lead_data.get('phone', 'N/D'),
                    vision_path, vision_url, satellite_path, vision_analysis,
                    market, valuation, financial,
                    demand, lead_data.get('source', 'Radar'), lead_data.get('urgency_score', 0),
                    lead_data.get('is_confirmed', False), lead_data.get('email', 'N/D'), 
                    lead_data.get('social_url', 'N/D'), lead_data.get('booking_url', 'N/D'), lead_data.get('scanned_at'),
                    lead_data.get('intencao_ativa', False) or lead_data.get('intencao_ativa', 0), 
                    lead_data.get('resumo_sinal', 'N/D'), lead_data.get('link_fonte', 'N/D'), 
                    lead_data.get('score_urgencia', 0), lead_data.get('categoria_demanda', 'nenhuma'),
                    lead_data.get('pilar', 'A')
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"DB: Erro fatal no upsert_lead: {e}")

    def get_all_leads(self):
        try:
            with self._get_connection() as conn:
                if self.is_postgres:
                    from psycopg2.extras import RealDictCursor
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    cur.execute("SELECT * FROM leads ORDER BY score DESC, name ASC")
                    rows = [dict(row) for row in cur.fetchall()]
                else:
                    conn.row_factory = sqlite3.Row
                    rows = conn.execute("SELECT * FROM leads ORDER BY score DESC, name ASC").fetchall()
                    rows = [dict(row) for row in rows]
                
                leads = []
                for row in rows:
                    lead = row
                    try:
                        lead['vision_analysis'] = json.loads(lead.pop('vision_analysis_json') or '{}')
                        lead['market'] = json.loads(lead.pop('market_json') or '{}')
                        lead['valuation'] = json.loads(lead.pop('valuation_json') or '{}')
                        lead['financial_health'] = json.loads(lead.pop('financial_health_json') or '{}')
                        lead['demand'] = json.loads(lead.pop('demand_json') or '{}')
                        
                        if not isinstance(lead['vision_analysis'], dict): lead['vision_analysis'] = {}
                        if not isinstance(lead['market'], dict): lead['market'] = {}
                        if not isinstance(lead['valuation'], dict): lead['valuation'] = {}
                        if not isinstance(lead['financial_health'], dict): lead['financial_health'] = {}
                        if not isinstance(lead['demand'], dict): lead['demand'] = {}
                        
                        lead['coords'] = {'lat': lead.pop('lat') or 0, 'lng': lead.pop('lng') or 0}
                    except Exception as je:
                        logger.warning(f"DB: Erro ao parsear JSON do lead {lead.get('name')}: {je}")
                    
                    leads.append(lead)
                return leads
        except Exception as e:
            logger.error(f"DB: Erro ao buscar leads: {e}")
            return []

    def clear_all_leads(self):
        try:
            with self._get_connection() as conn:
                self._run_query(conn, "DELETE FROM leads")
                conn.commit()
            logger.info("DB: Todos os leads foram removidos com sucesso.")
            return True
        except Exception as e:
            logger.error(f"DB: Erro ao limpar leads: {e}")
            return False

    def import_from_json(self, json_path):
        if not os.path.exists(json_path):
            return
        logger.info(f"📦 Migrando dados de {json_path} para o Banco de Dados...")
        with open(json_path, 'r', encoding='utf-8') as f:
            leads = json.load(f)
            for l in leads:
                self.upsert_lead(l)
        logger.info(f"✅ Migração concluída: {len(leads)} leads importados.")

if __name__ == "__main__":
    db = Database()
