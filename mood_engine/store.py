import sqlite3
import pickle
import markov

class DatabaseManager:
    db_path = "marcov_storage.db"
    
    def __init__(self):
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.cursor = self.conn.cursor()
        self._create_tables()
    
    def _create_tables(self):
        """내부 테이블 구조 생성 (최초 1회 실행)"""
        # 1. 유저/방 단위 세션 테이블
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                user_id TEXT,
                room_id TEXT,
                data BLOB,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, room_id)
            )
        ''')
        # 2. 단일 글로벌 설정 테이블 (id=1 고정)
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS global_config (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                data BLOB,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        self.conn.commit()
    
    def save_session(self, user_id, room_id, custom_obj):
        """커스텀 클래스 객체를 직렬화하여 저장합니다."""
        blob = pickle.dumps(custom_obj)
        self.cursor.execute('''
            INSERT OR REPLACE INTO user_sessions (user_id, room_id, data, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user_id, room_id, blob))
        self.conn.commit()

    def load_session(self, user_id, room_id):
        """특정 유저와 방에 해당하는 객체를 반환합니다. 없으면 새 객체 생성."""
        self.cursor.execute(
            "SELECT data FROM user_sessions WHERE user_id = ? AND room_id = ?",
            (user_id, room_id)
        )
        row = self.cursor.fetchone()
        return pickle.loads(row[0]) if row else markov.UserMarcov()

    def save_global(self, global_obj):
        """시스템 글로벌 객체를 저장합니다."""
        blob = pickle.dumps(global_obj)
        self.cursor.execute('''
            INSERT OR REPLACE INTO global_config (id, data, updated_at)
            VALUES (1, ?, CURRENT_TIMESTAMP)
        ''', (blob,))
        self.conn.commit()

    def load_global(self):
        """저장된 글로벌 객체를 반환합니다. 없으면 새 객체 생성."""
        self.cursor.execute("SELECT data FROM global_config WHERE id = 1")
        row = self.cursor.fetchone()
        return pickle.loads(row[0]) if row else markov.GlobalMarcov()

    def close(self):
        """데이터베이스 연결을 닫습니다."""
        if self.conn:
            self.conn.close()