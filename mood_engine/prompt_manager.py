import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI  # google.genai 대신 openai 사용
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
        
        # DeepSeek 클라이언트 설정
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
        self.mood_list = mood_list if mood_list[0] is not None else mood_list[1:]
        self.model_id = "deepseek-v4-pro"
        
        #deepseek-chat
        #deepseek-v4-pro
        
        # 시스템 지침 설정 (OpenAI 방식은 config 대신 메시지 처음에 넣음)
        self.system_prompt = (
            f"당신은 채팅 맥락 분석가입니다. 사용자의 감정 상태를 {', '.join(self.mood_list)} 중 하나로 분류하세요.\n"
            "주의: 이전 감정 이력의 흐름을 고려하여 현재 메시지에서 느껴지는 변화를 포착하세요.\n"
            "응답은 반드시 JSON 형식이어야 합니다: {\"mood\": \"감정\"}"
        )

    def query(self, mood_history: list, message: str):
        # 프롬프트 구성
        prompt = f"이전 감정 이력: {mood_history}\n현재 사용자 메시지: {message}"
             
        try:
            # DeepSeek 호출
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                # JSON 모드 활성화 (DeepSeek에서 지원)
                response_format={'type': 'json_object'}
            )
            
            # JSON 파싱 및 결과 추출
            result = json.loads(response.choices[0].message.content)
            return result.get("mood", None)
            
        except Exception as e:
            print(f"DeepSeek Query Error: {e}")
            return None

if __name__ == '__main__':

    pm = PromptManager()
    
    # 실행 결과 확인
    print(pm.query(['happy', 'happy', 'happy'], ""))