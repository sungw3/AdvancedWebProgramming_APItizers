import markov, mlist
from prompt_manager import PromptManager
from store import DatabaseManager
import time
import asyncio

# 서버 user_id, room_id, message -> mood

class Engine:
    LLM_INTERVAL = 5
    CACHE_TTL = 600  # 10 minutes

    def __init__(self):
        self.DBM = DatabaseManager()
        self.PM = PromptManager()
        
        # 초기 글로벌 데이터 로드는 동기로 진행 (생성자 제약)
        self.global_marcov = self.DBM.load_global()
        self.user_marcov = {} # { (user_id, room_id): (marcov_obj, last_access_time) }

    async def _get_session(self, user_id, room_id):
        current_time = time.time()
        key = (user_id, room_id)
        
        # 1. 캐시 확인 및 TTL 갱신
        if key in self.user_marcov:
            obj, _ = self.user_marcov[key]
            self.user_marcov[key] = (obj, current_time)
            return obj
        
        # 2. DB 로드 (비동기 스레드에서 실행)
        obj = await asyncio.to_thread(self.DBM.load_session, user_id, room_id)
        self.user_marcov[key] = (obj, current_time)
        
        # 3. 오래된 캐시 정리
        await self._cleanup_cache(current_time)
        return obj

    async def _cleanup_cache(self, current_time):
        keys_to_del = [k for k, v in self.user_marcov.items() if current_time - v[1] > self.CACHE_TTL]
        for k in keys_to_del:
            # 삭제 전 저장 (비동기 스레드에서 실행)
            obj, _ = self.user_marcov.pop(k)
            await asyncio.to_thread(self.DBM.save_session, k[0], k[1], obj)

    def _is_uncertain(self, u_preds, g_preds) -> bool:
        """마르코프 체인에 충분한 데이터가 있는지 판단합니다."""
        if any(sum(p) > 0 for p in u_preds) or any(sum(p) > 0 for p in g_preds):
            return False
        return True

    def _predict_from_marcov(self, u_preds, g_preds) -> str:
        """유저와 글로벌 마르코프 결과를 결합하여 감정을 예측합니다."""
        combined = [0] * len(mlist.get())
        for p in u_preds + g_preds:
            for i, count in enumerate(p):
                combined[i] += count
        
        max_idx = combined.index(max(combined))
        if combined[max_idx] > 0:
            return mlist.get()[max_idx]
        return None

    async def query(self, user_id, room_id, message: str) -> str:
        session = await self._get_session(user_id, room_id)
        history_list = list(session.history)
        
        # 1. 마르코프 체인 데이터 확인
        u_preds = session.get(history_list)
        g_preds = self.global_marcov.get(history_list)
        
        # 2. LLM 호출 여부 결정
        session.llm_counter += 1
        is_uncertain = self._is_uncertain(u_preds, g_preds)
        should_call_llm = (session.llm_counter >= self.LLM_INTERVAL) or is_uncertain
        
        analyzed_mood = None
        if should_call_llm:
            # LLM 비동기 호출 및 분석
            analyzed_mood = await self.PM.query(history_list, message)
            if analyzed_mood:
                # LLM 결과가 있을 때만 마르코프 업데이트
                self.global_marcov.update(history_list, analyzed_mood)
                session.update(history_list, analyzed_mood)
                session.llm_counter = 0 # 카운터 초기화
        
        # 3. 반환값 결정 (LLM 우선, 없으면 마르코프 예측)
        final_mood = analyzed_mood
        if not final_mood:
            final_mood = self._predict_from_marcov(u_preds, g_preds)
        
        # 4. 이력 업데이트 (메모리만)
        session.history.append(final_mood)
        if len(session.history) > 4:
            session.history.pop(0)
            
        return final_mood

    async def close(self):
        """엔진 종료 시 캐시된 모든 데이터를 DB에 저장하고 연결을 닫습니다."""
        # 1. 모든 유저 세션 저장
        for (user_id, room_id), (obj, _) in self.user_marcov.items():
            await asyncio.to_thread(self.DBM.save_session, user_id, room_id, obj)
        
        # 2. 글로벌 마르코프 저장
        await asyncio.to_thread(self.DBM.save_global, self.global_marcov)
        
        # 3. DB 연결 닫기
        await asyncio.to_thread(self.DBM.close)
