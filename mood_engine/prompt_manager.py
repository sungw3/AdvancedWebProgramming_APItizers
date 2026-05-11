import os
from pathlib import Path
from dotenv import load_dotenv
from openai import AsyncOpenAI  # 비동기 클라이언트 사용
import json
import mlist

class PromptManager:
    
    def __init__(self):
        
        mood_list=mlist.get()
        
        # API key를 .env 파일에서 받아오는 코드
        current_dir = Path(__file__).resolve()
        env_path = current_dir.parent.parent / ".env"
        load_dotenv(dotenv_path=env_path)


        api_key = os.getenv("DEEPSEEK_API_KEY")

        if not api_key:
            raise ValueError("API KEY ERROR: 환경 변수 'DEEPSEEK_API_KEY'가 설정되지 않았습니다.")
        
        # DeepSeek 비동기 클라이언트 설정
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
        self.mood_list = mood_list if mood_list[0] is not None else mood_list[1:]
        self.model_id = "deepseek-v4-pro"
        
        # System Instruction
        self.system_prompt = (
            f"You are a chat context analyst. Classify the user's emotional state into exactly one of the following: {', '.join(self.mood_list)}.\n"
            "Note: Analyze the flow of the provided emotional history and capture any emotional shifts or changes reflected in the current message.\n"
            "Your response must be in valid JSON format: {\"mood\": \"selected_mood\"}"
        )

    async def query(self, mood_history: list, message: str):
        # Prompt Construction
        prompt = f"Emotional history: {mood_history}\nCurrent user message: {message}"
             
        try:
            # DeepSeek 비동기 호출
            response = await self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                response_format={'type': 'json_object'}
            )
            
            # JSON 파싱 및 결과 추출
            result = json.loads(response.choices[0].message.content)
            return result.get("mood", None)
            
        except Exception as e:
            print(f"DeepSeek Async Query Error: {e}")
            return None

if __name__ == '__main__':
    import asyncio
    import time

    async def main():
        pm = PromptManager()
        
        # 지연 시간 측정 시작
        start_time = time.perf_counter()
        
        # 실행 결과 확인 (mlist의 대소문자 기준인 'Happy' 사용)
        result = await pm.query(['Happy', 'Happy', 'Happy'], "The weather is so beautiful today, I feel amazing!")
        
        end_time = time.perf_counter()
        
        print(f"Analysis Result: {result}")
        print(f"Latency: {end_time - start_time:.4f} seconds")

    asyncio.run(main())