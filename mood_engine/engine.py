import asyncio
import time

from . import mlist
from .store import DatabaseManager


class Engine:
    LLM_INTERVAL = 5
    CACHE_TTL = 600  # 10 minutes

    def __init__(self, db_manager=None, prompt_manager=None):
        self.DBM = db_manager or DatabaseManager()
        if prompt_manager is None:
            from .prompt_manager import PromptManager
            prompt_manager = PromptManager()
        self.PM = prompt_manager

        self.valid_moods = {mood for mood in mlist.get() if mood is not None}
        self.history_moods = set(mlist.get())
        self.global_marcov = self.DBM.load_global()
        self.user_marcov = {}  # {(user_id, room_id): (marcov_obj, last_access_time)}

    def _normalize_history(self, history):
        if not isinstance(history, list):
            return []
        normalized = [mood if mood in self.history_moods else None for mood in history]
        return normalized[-4:]

    def _is_valid_mood(self, mood):
        return mood in self.valid_moods

    async def _get_session(self, user_id, room_id):
        current_time = time.time()
        key = (user_id, room_id)

        if key in self.user_marcov:
            obj, _ = self.user_marcov[key]
            self.user_marcov[key] = (obj, current_time)
            return obj

        obj = await asyncio.to_thread(self.DBM.load_session, user_id, room_id)
        self.user_marcov[key] = (obj, current_time)

        await self._cleanup_cache(current_time)
        return obj

    async def _cleanup_cache(self, current_time):
        keys_to_del = [
            k for k, v in self.user_marcov.items()
            if current_time - v[1] > self.CACHE_TTL
        ]
        for k in keys_to_del:
            obj, _ = self.user_marcov.pop(k)
            await asyncio.to_thread(self.DBM.save_session, k[0], k[1], obj)

    def _is_uncertain(self, u_preds, g_preds) -> bool:
        """Return True when Markov data has no usable prediction counts."""
        if any(sum(p) > 0 for p in u_preds) or any(sum(p) > 0 for p in g_preds):
            return False
        return True

    def _predict_from_marcov(self, u_preds, g_preds) -> str:
        """Combine user/global Markov counts and return the strongest mood."""
        mood_list = mlist.get()
        combined = [0] * len(mood_list)
        for p in u_preds + g_preds:
            for i, count in enumerate(p):
                if i < len(combined):
                    combined[i] += count

        max_idx = combined.index(max(combined))
        if combined[max_idx] > 0:
            mood = mood_list[max_idx]
            return mood if mood in self.history_moods else None
        return None

    async def query(self, user_id, room_id, message: str) -> str:
        session = await self._get_session(user_id, room_id)
        session.history = self._normalize_history(getattr(session, "history", []))
        history_list = list(session.history)

        u_preds = session.get(history_list)
        g_preds = self.global_marcov.get(history_list)

        session.llm_counter += 1
        is_uncertain = self._is_uncertain(u_preds, g_preds)
        should_call_llm = (session.llm_counter >= self.LLM_INTERVAL) or is_uncertain

        analyzed_mood = None
        if should_call_llm:
            analyzed_mood = await self.PM.query(history_list, message)
            if not self._is_valid_mood(analyzed_mood):
                analyzed_mood = None
            if analyzed_mood is not None:
                self.global_marcov.update(history_list, analyzed_mood)
                session.update(history_list, analyzed_mood)
                session.llm_counter = 0

        final_mood = analyzed_mood
        if not final_mood:
            final_mood = self._predict_from_marcov(u_preds, g_preds)
        if final_mood not in self.history_moods:
            final_mood = None

        session.history.append(final_mood)
        session.history = self._normalize_history(session.history)

        return final_mood

    async def close(self):
        """Persist cached data and close the database connection."""
        for (user_id, room_id), (obj, _) in list(self.user_marcov.items()):
            await asyncio.to_thread(self.DBM.save_session, user_id, room_id, obj)

        await asyncio.to_thread(self.DBM.save_global, self.global_marcov)
        await asyncio.to_thread(self.DBM.close)
