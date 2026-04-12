import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json

class PromptManager:
    
    def __init__(self,mood_list:list):
        
        #api key를 .env 파일에서 받아오는 코드
        current_dir = Path(__file__).resolve()
        env_path = current_dir.parent.parent / ".env"
        load_dotenv(dotenv_path=env_path)

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("API KEY ERROR: 환경 변수 'GEMINI_API_KEY'가 설정되지 않았습니다. .env 파일을 확인하세요.")
        
        
        self.client = genai.Client(api_key=api_key)
        self.mood_list = mood_list
        self.model_id = "gemini-1.5-flash"
        
        self.config = types.GenerateContentConfig(
            system_instruction=f"분석가로서 사용자의 현재 감정을 다음 목록 중 하나로만 선택하세요: {', '.join(self.mood_list)}",
            temperature=0.0,  # 가장 확률이 높은 단 하나를 선택하도록 0으로 설정
            # 출력 형식을 JSON으로 고정하고, 필드를 제한함
            response_mime_type="application/json",
            response_schema={
                "type": "object",
                "properties": {
                    "mood": {
                        "type": "string", 
                        "enum": self.mood_list  # 이 리스트 안에서만 대답하도록 강제
                    }
                },
                "required": ["mood"]
            }
        )
        


    def query(self,mood_history:list,message:str):
        # 프롬프트 구성
        prompt = f"이전 감정 이력: {mood_history}\n현재 사용자 메시지: {message}"
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=self.config
            )
            
            # JSON 파싱 및 결과 추출
            result = json.loads(response.text)
            return result.get("mood", None)
            
        except Exception as e:
            print(f"Gemini Query Error: {e}")
            return None