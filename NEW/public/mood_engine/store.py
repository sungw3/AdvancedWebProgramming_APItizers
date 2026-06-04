import pickle
import sqlite3
import sys
import threading

from . import markov

# Keep old pickles saved with the former top-level module path loadable.
sys.modules.setdefault("markov", markov)


class DatabaseManager:
    db_path = "marcov_storage.db"

    def __init__(self, db_path=None):
        self.db_path = db_path or DatabaseManager.db_path
        self._lock = threading.RLock()
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        with self._lock:
            self.cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS user_sessions (
                    user_id TEXT,
                    room_id TEXT,
                    data BLOB,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, room_id)
                )
                """
            )
            self.cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS global_config (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    data BLOB,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            self.conn.commit()

    def _load_pickle(self, blob, fallback_factory, expected_type):
        try:
            obj = pickle.loads(blob)
        except Exception:
            return fallback_factory()

        if not isinstance(obj, expected_type):
            return fallback_factory()
        return obj

    def _ensure_session_shape(self, obj):
        if not hasattr(obj, "history"):
            obj.history = []
        if not isinstance(obj.history, list):
            obj.history = []
        if not hasattr(obj, "llm_counter"):
            obj.llm_counter = 0
        if not isinstance(obj.llm_counter, int):
            obj.llm_counter = 0
        return obj

    def save_session(self, user_id, room_id, custom_obj):
        blob = pickle.dumps(custom_obj)
        with self._lock:
            self.cursor.execute(
                """
                INSERT OR REPLACE INTO user_sessions (user_id, room_id, data, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                """,
                (user_id, room_id, blob),
            )
            self.conn.commit()

    def load_session(self, user_id, room_id):
        with self._lock:
            self.cursor.execute(
                "SELECT data FROM user_sessions WHERE user_id = ? AND room_id = ?",
                (user_id, room_id),
            )
            row = self.cursor.fetchone()

        if not row:
            return markov.UserMarcov()

        obj = self._load_pickle(row[0], markov.UserMarcov, markov.UserMarcov)
        return self._ensure_session_shape(obj)

    def save_global(self, global_obj):
        blob = pickle.dumps(global_obj)
        with self._lock:
            self.cursor.execute(
                """
                INSERT OR REPLACE INTO global_config (id, data, updated_at)
                VALUES (1, ?, CURRENT_TIMESTAMP)
                """,
                (blob,),
            )
            self.conn.commit()

    def load_global(self):
        with self._lock:
            self.cursor.execute("SELECT data FROM global_config WHERE id = 1")
            row = self.cursor.fetchone()

        if not row:
            return markov.GlobalMarcov()
        return self._load_pickle(row[0], markov.GlobalMarcov, markov.GlobalMarcov)

    def close(self):
        with self._lock:
            if self.conn:
                self.conn.close()
                self.conn = None
                self.cursor = None
