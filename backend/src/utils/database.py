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
            # 0. Tabela de Usuários (Controle de Acesso)
            if self.is_postgres:
                self._run_query(conn, """
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        role VARCHAR(50) NOT NULL,
                        phone VARCHAR(50),
                        document VARCHAR(50),
                        created_at VARCHAR(100)
                    )
                """)
            else:
                self._run_query(conn, """
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        name TEXT NOT NULL,
                        role TEXT NOT NULL,
                        phone TEXT,
                        document TEXT,
                        created_at TEXT
                    )
                """)
            
            # Seed de administradores padrão
            now_str = datetime.now().isoformat()
            if self.is_postgres:
                self._run_query(conn, """
                    INSERT INTO users (email, password, name, role, phone, document, created_at)
                    VALUES ('joao.ottopinturas@gmail.com', '123', 'João Otto', 'admin', '11999999999', 'N/D', %s)
                    ON CONFLICT (email) DO NOTHING
                """, (now_str,))
                self._run_query(conn, """
                    INSERT INTO users (email, password, name, role, phone, document, created_at)
                    VALUES ('jonatasprojetos2013@gmail.com', '123', 'Jonatas Oliveira', 'admin', '11999999999', 'N/D', %s)
                    ON CONFLICT (email) DO NOTHING
                """, (now_str,))
            else:
                self._run_query(conn, """
                    INSERT OR IGNORE INTO users (email, password, name, role, phone, document, created_at)
                    VALUES ('joao.ottopinturas@gmail.com', '123', 'João Otto', 'admin', '11999999999', 'N/D', ?)
                """, (now_str,))
                self._run_query(conn, """
                    INSERT OR IGNORE INTO users (email, password, name, role, phone, document, created_at)
                    VALUES ('jonatasprojetos2013@gmail.com', '123', 'Jonatas Oliveira', 'admin', '11999999999', 'N/D', ?)
                """, (now_str,))

            # 1. Tabela principal leads
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
            
            # 2. Tabela blindada leads_quentes (Migração para chave composta com user_id)
            has_user_id = False
            if not self.is_postgres:
                try:
                    cursor = conn.execute("PRAGMA table_info(leads_quentes)")
                    columns = [row[1] for row in cursor.fetchall()]
                    if columns and "user_id" in columns:
                        has_user_id = True
                    elif columns:
                        logger.info("DB: Migrando leads_quentes para suportar chaves compostas e user_id...")
                        conn.execute("ALTER TABLE leads_quentes RENAME TO leads_quentes_old")
                except sqlite3.OperationalError:
                    pass
            else:
                try:
                    cur = conn.cursor()
                    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='leads_quentes' AND column_name='user_id'")
                    if cur.fetchone():
                        has_user_id = True
                    else:
                        cur.execute("ALTER TABLE leads_quentes RENAME TO leads_quentes_old")
                except Exception:
                    pass

            self._run_query(conn, """
                CREATE TABLE IF NOT EXISTS leads_quentes (
                    id TEXT,
                    user_id INTEGER NOT NULL,
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
                    is_favorite BOOLEAN DEFAULT TRUE,
                    contact_status TEXT DEFAULT 'Aguardando Abordagem',
                    intencao_ativa BOOLEAN DEFAULT FALSE,
                    resumo_sinal TEXT,
                    link_fonte TEXT,
                    score_urgencia INTEGER DEFAULT 0,
                    categoria_demanda TEXT,
                    pilar TEXT DEFAULT 'A',
                    PRIMARY KEY (id, user_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)

            # Concluir migração SQLite se necessário
            if not has_user_id and not self.is_postgres:
                try:
                    # Verificar se a tabela temporária velha realmente existe
                    cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='leads_quentes_old'")
                    if cursor.fetchone():
                        # Obter id de joao.ottopinturas@gmail.com
                        uid_row = conn.execute("SELECT id FROM users WHERE email = 'joao.ottopinturas@gmail.com'").fetchone()
                        uid = uid_row[0] if uid_row else 1
                        
                        cols_str = "id, name, address, lat, lng, score, justification, category, responsavel_nome, responsavel_contato, vision_image_path, vision_image_url, satellite_image_path, vision_analysis_json, market_json, valuation_json, financial_health_json, demand_json, source, urgency_score, is_confirmed, email, social_url, booking_url, scanned_at, enriched_at, interaction_notes, return_date, email_sent_at, is_favorite, contact_status, intencao_ativa, resumo_sinal, link_fonte, score_urgencia, categoria_demanda, pilar"
                        
                        self._run_query(conn, f"""
                            INSERT INTO leads_quentes (
                                user_id, {cols_str}
                            )
                            SELECT ?, {cols_str} FROM leads_quentes_old
                        """, (uid,))
                        
                        self._run_query(conn, "DROP TABLE leads_quentes_old")
                        logger.info("DB: Migração de leads_quentes SQLite concluída com sucesso!")
                except Exception as me:
                    logger.error(f"DB: Erro na migração SQLite de leads_quentes: {me}")

            # Migração de colunas na principal apenas se for SQLite local
            if not self.is_postgres:
                cols = [
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
                ]
                for col, col_type in cols:
                    try:
                        conn.execute(f"ALTER TABLE leads ADD COLUMN {col} {col_type}")
                    except sqlite3.OperationalError:
                        pass

            # 3. Tabela de estatísticas de uso (IA)
            self._run_query(conn, """
                CREATE TABLE IF NOT EXISTS usage_stats (
                    service TEXT PRIMARY KEY,
                    calls_today INTEGER DEFAULT 0,
                    total_calls INTEGER DEFAULT 0,
                    last_used TEXT
                )
            """)
            
            # 4. Tabela de Histórico de Buscas
            self._run_query(conn, """
                CREATE TABLE IF NOT EXISTS search_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    user_name TEXT NOT NULL,
                    user_email TEXT NOT NULL,
                    city TEXT NOT NULL,
                    pilares TEXT NOT NULL,
                    total_leads INTEGER NOT NULL,
                    leads_a INTEGER DEFAULT 0,
                    leads_b INTEGER DEFAULT 0,
                    leads_c INTEGER DEFAULT 0,
                    leads_json TEXT,
                    searched_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            conn.commit()

    def save_interaction(self, lead_id, notes, return_date, contact_status='Aguardando Abordagem', email_sent_at=None, vision_image_url=None, user_id=None):
        try:
            with self._get_connection() as conn:
                # 1. Atualizar na tabela leads principal
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

                # 2. Atualizar na tabela leads_quentes (filtrando por user_id se fornecido)
                if user_id is not None:
                    if email_sent_at and vision_image_url:
                        self._run_query(conn, """
                            UPDATE leads_quentes 
                            SET interaction_notes = ?, return_date = ?, contact_status = ?, email_sent_at = ?, vision_image_url = ?
                            WHERE id = ? AND user_id = ?
                        """, (notes, return_date, contact_status, email_sent_at, vision_image_url, lead_id, user_id))
                    elif email_sent_at:
                        self._run_query(conn, """
                            UPDATE leads_quentes 
                            SET interaction_notes = ?, return_date = ?, contact_status = ?, email_sent_at = ?
                            WHERE id = ? AND user_id = ?
                        """, (notes, return_date, contact_status, email_sent_at, lead_id, user_id))
                    elif vision_image_url:
                        self._run_query(conn, """
                            UPDATE leads_quentes 
                            SET interaction_notes = ?, return_date = ?, contact_status = ?, vision_image_url = ?
                            WHERE id = ? AND user_id = ?
                        """, (notes, return_date, contact_status, vision_image_url, lead_id, user_id))
                    else:
                        self._run_query(conn, """
                            UPDATE leads_quentes 
                            SET interaction_notes = ?, return_date = ?, contact_status = ?
                            WHERE id = ? AND user_id = ?
                        """, (notes, return_date, contact_status, lead_id, user_id))
                else:
                    # Caso não passe user_id, atualiza para todos (fallback)
                    if email_sent_at and vision_image_url:
                        self._run_query(conn, """
                            UPDATE leads_quentes 
                            SET interaction_notes = ?, return_date = ?, contact_status = ?, email_sent_at = ?, vision_image_url = ?
                            WHERE id = ?
                        """, (notes, return_date, contact_status, email_sent_at, vision_image_url, lead_id))
                    elif email_sent_at:
                        self._run_query(conn, """
                            UPDATE leads_quentes 
                            SET interaction_notes = ?, return_date = ?, contact_status = ?, email_sent_at = ?
                            WHERE id = ?
                        """, (notes, return_date, contact_status, email_sent_at, lead_id))
                    elif vision_image_url:
                        self._run_query(conn, """
                            UPDATE leads_quentes 
                            SET interaction_notes = ?, return_date = ?, contact_status = ?, vision_image_url = ?
                            WHERE id = ?
                        """, (notes, return_date, contact_status, vision_image_url, lead_id))
                    else:
                        self._run_query(conn, """
                            UPDATE leads_quentes 
                            SET interaction_notes = ?, return_date = ?, contact_status = ?
                            WHERE id = ?
                        """, (notes, return_date, contact_status, lead_id))
                
                conn.commit()
            logger.info(f"DB: Interação comercial salva para o lead {lead_id} | Status: {contact_status} | User: {user_id}")
            return True
        except Exception as e:
            logger.error(f"DB: Erro ao salvar interação para o lead {lead_id}: {e}")
            return False

    def toggle_favorite(self, lead_id, is_favorite, user_id=1):
        try:
            fav_value = 1 if is_favorite else 0
            with self._get_connection() as conn:
                # Se for favoritado, copiar para a tabela blindada com user_id
                if fav_value == 1:
                    # VERIFICAÇÃO DE EXCLUSIVIDADE: se já está favoritado por outro usuário
                    if self.is_postgres:
                        cur = conn.cursor()
                        cur.execute("SELECT user_id FROM leads_quentes WHERE id = %s AND user_id != %s", (lead_id, user_id))
                        other = cur.fetchone()
                    else:
                        other = conn.execute("SELECT user_id FROM leads_quentes WHERE id = ? AND user_id != ?", (lead_id, user_id)).fetchone()
                    
                    if other:
                        other_uid = other[0]
                        if self.is_postgres:
                            cur.execute("SELECT name, email FROM users WHERE id = %s", (other_uid,))
                            u_info = cur.fetchone()
                        else:
                            u_info = conn.execute("SELECT name, email FROM users WHERE id = ?", (other_uid,)).fetchone()
                        
                        name = u_info[0] if u_info else "Outro vendedor"
                        email = u_info[1] if u_info else ""
                        logger.warning(f"DB: Falha ao favoritar lead {lead_id}: Já reservado por {name} ({email})")
                        raise ValueError(f"Este lead já foi reservado/favoritado por {name} ({email}).")

                    if self.is_postgres:
                        from psycopg2.extras import RealDictCursor
                        cur = conn.cursor(cursor_factory=RealDictCursor)
                        cur.execute("SELECT * FROM leads WHERE id = %s", (lead_id,))
                        row = cur.fetchone()
                        row_dict = dict(row) if row else None
                    else:
                        conn.row_factory = sqlite3.Row
                        row = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
                        row_dict = dict(row) if row else None
                        
                    if row_dict:
                        # Tratar campos JSON para o formato python do upsert_lead
                        try:
                            row_dict['vision_analysis'] = json.loads(row_dict.pop('vision_analysis_json') or '{}')
                            row_dict['market'] = json.loads(row_dict.pop('market_json') or '{}')
                            row_dict['valuation'] = json.loads(row_dict.pop('valuation_json') or '{}')
                            row_dict['financial_health'] = json.loads(row_dict.pop('financial_health_json') or '{}')
                            row_dict['demand'] = json.loads(row_dict.pop('demand_json') or '{}')
                            row_dict['coords'] = {'lat': row_dict.get('lat') or 0, 'lng': row_dict.get('lng') or 0}
                            row_dict['is_favorite'] = True
                        except Exception as je:
                            logger.warning(f"DB: Erro ao tratar JSON no toggle_favorite: {je}")
                        
                        # Faz o upsert na tabela blindada leads_quentes passando o user_id
                        self.upsert_lead(row_dict, table="leads_quentes", user_id=user_id)
                else:
                    # Se desfavoritado, deletar fisicamente de leads_quentes para o user_id específico
                    self._run_query(conn, "DELETE FROM leads_quentes WHERE id = ? AND user_id = ?", (lead_id, user_id))
                
                conn.commit()
            logger.info(f"DB: Favorito alterado para {fav_value} no lead {lead_id} para o usuário {user_id}")
            return True
        except Exception as e:
            logger.error(f"DB: Erro ao alternar favorito para o lead {lead_id} (user {user_id}): {e}")
            return False

    def upsert_lead(self, lead_data, table="leads", user_id=None):
        """Insere ou atualiza um lead no banco de dados (v8.0 Postgres/SQLite com isolamento de usuários)."""
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

            fav_status = lead_data.get('is_favorite')
            if fav_status is None:
                fav_status = True if table == "leads_quentes" else False

            with self._get_connection() as conn:
                if table == "leads_quentes":
                    # Tabela blindada precisa de user_id
                    uid = user_id or lead_data.get('user_id')
                    if uid is None:
                        # Obter id de joao.ottopinturas@gmail.com
                        uid_row = conn.execute("SELECT id FROM users WHERE email = 'joao.ottopinturas@gmail.com'").fetchone()
                        uid = uid_row[0] if uid_row else 1

                    self._run_query(conn, f"""
                        INSERT INTO leads_quentes (
                            id, user_id, name, address, lat, lng, score, justification, category,
                            responsavel_nome, responsavel_contato,
                            vision_image_path, vision_image_url, satellite_image_path,
                            vision_analysis_json, market_json, valuation_json, financial_health_json,
                            demand_json, source, urgency_score,
                            is_confirmed, email, social_url, booking_url, scanned_at,
                            intencao_ativa, resumo_sinal, link_fonte, score_urgencia, categoria_demanda,
                            pilar, is_favorite, interaction_notes, return_date, contact_status, email_sent_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id, user_id) DO UPDATE SET
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
                            categoria_demanda=excluded.categoria_demanda, pilar=excluded.pilar, is_favorite=excluded.is_favorite,
                            interaction_notes=excluded.interaction_notes, return_date=excluded.return_date,
                            contact_status=excluded.contact_status, email_sent_at=excluded.email_sent_at
                    """, (
                        lead_id, uid, lead_data['name'], lead_data['address'], lat, lng,
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
                        lead_data.get('pilar', 'A'), 1 if fav_status else 0,
                        lead_data.get('interaction_notes', ''), lead_data.get('return_date', ''),
                        lead_data.get('contact_status', 'Aguardando Abordagem'), lead_data.get('email_sent_at')
                    ))
                else:
                    # Tabela leads geral
                    self._run_query(conn, f"""
                        INSERT INTO leads (
                            id, name, address, lat, lng, score, justification, category,
                            responsavel_nome, responsavel_contato,
                            vision_image_path, vision_image_url, satellite_image_path,
                            vision_analysis_json, market_json, valuation_json, financial_health_json,
                            demand_json, source, urgency_score,
                            is_confirmed, email, social_url, booking_url, scanned_at,
                            intencao_ativa, resumo_sinal, link_fonte, score_urgencia, categoria_demanda,
                            pilar, is_favorite
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                            categoria_demanda=excluded.categoria_demanda, pilar=excluded.pilar, is_favorite=excluded.is_favorite
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
                        lead_data.get('pilar', 'A'), 1 if fav_status else 0
                    ))
                conn.commit()
        except Exception as e:
            logger.error(f"DB: Erro fatal no upsert_lead na tabela {table}: {e}")

    def get_all_leads(self, table="leads", user_id=None):
        try:
            with self._get_connection() as conn:
                if table == "leads" and user_id is not None:
                    # LEFT JOIN com leads_quentes para obter os dados comercializados e favoritos do usuário específico
                    # e outro LEFT JOIN com leads_quentes para obter reservas de terceiros
                    query = """
                        SELECT l.*, 
                               CASE WHEN lq.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite,
                               COALESCE(lq.interaction_notes, l.interaction_notes) as interaction_notes,
                               COALESCE(lq.return_date, l.return_date) as return_date,
                               COALESCE(lq.contact_status, l.contact_status) as contact_status,
                               COALESCE(lq.email_sent_at, l.email_sent_at) as email_sent_at,
                               lq_other.user_id as reserved_by_user_id,
                               u_other.name as reserved_by_name,
                               u_other.email as reserved_by_email
                        FROM leads l
                        LEFT JOIN leads_quentes lq ON l.id = lq.id AND lq.user_id = ?
                        LEFT JOIN leads_quentes lq_other ON l.id = lq_other.id AND lq_other.user_id != ?
                        LEFT JOIN users u_other ON lq_other.user_id = u_other.id
                        ORDER BY l.score DESC, l.name ASC
                    """
                    params = (user_id, user_id)
                elif table == "leads_quentes" and user_id is not None:
                    query = "SELECT *, 1 as is_favorite FROM leads_quentes WHERE user_id = ? ORDER BY score DESC, name ASC"
                    params = (user_id,)
                else:
                    query = f"SELECT * FROM {table} ORDER BY score DESC, name ASC"
                    params = ()

                if self.is_postgres:
                    from psycopg2.extras import RealDictCursor
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    query_postgres = query.replace("?", "%s")
                    cur.execute(query_postgres, params)
                    rows = [dict(row) for row in cur.fetchall()]
                else:
                    conn.row_factory = sqlite3.Row
                    rows = conn.execute(query, params).fetchall()
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
            logger.error(f"DB: Erro ao buscar leads da tabela {table}: {e}")
            return []

    def get_all_leads_quentes(self, user_id=None):
        return self.get_all_leads(table="leads_quentes", user_id=user_id)

    def get_user_by_email(self, email):
        try:
            with self._get_connection() as conn:
                if self.is_postgres:
                    from psycopg2.extras import RealDictCursor
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
                    row = cur.fetchone()
                    return dict(row) if row else None
                else:
                    conn.row_factory = sqlite3.Row
                    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
                    return dict(row) if row else None
        except Exception as e:
            logger.error(f"DB: Erro ao buscar usuário por email {email}: {e}")
            return None

    def get_user_by_id(self, user_id):
        try:
            with self._get_connection() as conn:
                if self.is_postgres:
                    from psycopg2.extras import RealDictCursor
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                    row = cur.fetchone()
                    return dict(row) if row else None
                else:
                    conn.row_factory = sqlite3.Row
                    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
                    return dict(row) if row else None
        except Exception as e:
            logger.error(f"DB: Erro ao buscar usuário por id {user_id}: {e}")
            return None

    def get_all_users(self):
        try:
            with self._get_connection() as conn:
                if self.is_postgres:
                    from psycopg2.extras import RealDictCursor
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    cur.execute("SELECT id, email, password, name, role, phone, document, created_at FROM users ORDER BY name ASC")
                    rows = cur.fetchall()
                    return [dict(row) for row in rows]
                else:
                    conn.row_factory = sqlite3.Row
                    rows = conn.execute("SELECT id, email, password, name, role, phone, document, created_at FROM users ORDER BY name ASC").fetchall()
                    return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"DB: Erro ao listar usuários: {e}")
            return []

    def create_user(self, email, password, name, role, phone=None, document=None):
        try:
            now_str = datetime.now().isoformat()
            with self._get_connection() as conn:
                if self.is_postgres:
                    cur = conn.cursor()
                    cur.execute("""
                        INSERT INTO users (email, password, name, role, phone, document, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (email, password, name, role, phone or '', document or '', now_str))
                    user_id = cur.fetchone()[0]
                else:
                    cursor = conn.execute("""
                        INSERT INTO users (email, password, name, role, phone, document, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (email, password, name, role, phone or '', document or '', now_str))
                    user_id = cursor.lastrowid
                conn.commit()
            logger.info(f"DB: Usuário {email} criado com ID {user_id}")
            return user_id
        except Exception as e:
            logger.error(f"DB: Erro ao criar usuário {email}: {e}")
            return None

    def update_user_profile(self, user_id, name, phone, document, password=None):
        try:
            with self._get_connection() as conn:
                if password:
                    self._run_query(conn, """
                        UPDATE users
                        SET name = ?, phone = ?, document = ?, password = ?
                        WHERE id = ?
                    """, (name, phone or '', document or '', password, user_id))
                else:
                    self._run_query(conn, """
                        UPDATE users
                        SET name = ?, phone = ?, document = ?
                        WHERE id = ?
                    """, (name, phone or '', document or '', user_id))
                conn.commit()
            logger.info(f"DB: Perfil do usuário {user_id} atualizado com sucesso.")
            return True
        except Exception as e:
            logger.error(f"DB: Erro ao atualizar perfil do usuário {user_id}: {e}")
            return False

    def delete_user(self, user_id):
        try:
            with self._get_connection() as conn:
                self._run_query(conn, "DELETE FROM users WHERE id = ?", (user_id,))
                conn.commit()
            logger.info(f"DB: Usuário {user_id} removido do sistema.")
            return True
        except Exception as e:
            logger.error(f"DB: Erro ao remover usuário {user_id}: {e}")
            return False

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

    def save_search_history(self, user_id, user_name, user_email, city, pilares, total_leads, leads_a, leads_b, leads_c, leads_json):
        try:
            now_str = datetime.now().isoformat()
            with self._get_connection() as conn:
                self._run_query(conn, """
                    INSERT INTO search_history (user_id, user_name, user_email, city, pilares, total_leads, leads_a, leads_b, leads_c, leads_json, searched_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (user_id, user_name, user_email, city, pilares, total_leads, leads_a, leads_b, leads_c, json.dumps(leads_json, ensure_ascii=False), now_str))
                conn.commit()
            logger.info(f"DB: Histórico salvo para usuário {user_email} — {city} — {total_leads} leads")
            return True
        except Exception as e:
            logger.error(f"DB: Erro ao salvar histórico: {e}")
            return False

    def get_search_history(self, user_id=None):
        try:
            with self._get_connection() as conn:
                if self.is_postgres:
                    from psycopg2.extras import RealDictCursor
                    cur = conn.cursor(cursor_factory=RealDictCursor)
                    if user_id:
                        cur.execute("SELECT * FROM search_history WHERE user_id = %s ORDER BY searched_at DESC LIMIT 50", (user_id,))
                    else:
                        cur.execute("SELECT * FROM search_history ORDER BY searched_at DESC LIMIT 50")
                    rows = [dict(row) for row in cur.fetchall()]
                else:
                    conn.row_factory = sqlite3.Row
                    if user_id:
                        rows = conn.execute("SELECT * FROM search_history WHERE user_id = ? ORDER BY searched_at DESC LIMIT 50", (user_id,)).fetchall()
                    else:
                        rows = conn.execute("SELECT * FROM search_history ORDER BY searched_at DESC LIMIT 50").fetchall()
                    rows = [dict(row) for row in rows]
                
                for row in rows:
                    try:
                        row['leads_json'] = json.loads(row.get('leads_json') or '{}')
                    except:
                        row['leads_json'] = {}
                return rows
        except Exception as e:
            logger.error(f"DB: Erro ao buscar histórico: {e}")
            return []

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
