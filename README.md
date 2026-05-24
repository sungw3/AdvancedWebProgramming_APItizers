# mood_engine

`mood_engine`은 서버 코드에서 블랙박스처럼 호출하기 위한 Python 감정 분석 모듈입니다.

서버는 내부의 LLM 호출 방식, Markov 저장 구조, 캐시 정책을 알 필요 없이 `user_id`, `room_id`, `message`만 전달하면 됩니다. 모듈은 현재 대화 흐름을 바탕으로 하나의 mood 값을 반환합니다.

## 목적

채팅 서비스에서 사용자의 감정 상태를 판단하고, 프론트엔드가 그 결과를 UI 색상, 배경, 애니메이션, 분위기 변화 등에 사용할 수 있도록 하는 것이 목적입니다.

서버파트가 바라보는 인터페이스는 다음 하나로 충분합니다.

```python
mood = await engine.query(user_id, room_id, message)
```

## 반환 감정

현재 반환 가능한 mood 값은 다음과 같습니다.

```python
"Happy"
"Sad"
"Angry"
None
```

`None`은 감정을 판단할 수 없거나 초기 데이터가 부족한 경우를 의미합니다.

## 설치

프로젝트 루트에서 의존성을 설치합니다.

```powershell
pip install -r requirements.txt
```

가상환경을 사용하는 경우:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 환경변수 설정

이 프로젝트는 실제 API 키를 `.env` 파일에서 읽습니다.

`.env`는 비밀값을 포함하므로 git에 커밋하지 않습니다. 대신 저장소에는 `.env.example`만 포함합니다.

서버파트는 프로젝트 루트에서 다음 명령으로 `.env`를 만듭니다.

```powershell
Copy-Item .env.example .env
```

그리고 `.env`에 실제 키를 입력합니다.

```env
DEEPSEEK_API_KEY=발급받은_실제_API_키
```

현재 `.env.example` 형식은 다음과 같습니다.

```env
DEEPSEEK_API_KEY=

# Optional: currently not used by mood_engine.
# GEMINI_API_KEY=
```

현재 코드에서 실제로 사용하는 값은 `DEEPSEEK_API_KEY`입니다. `GEMINI_API_KEY`는 현재 모듈에서 사용하지 않습니다.

## 서버 연동 예시

```python
from mood_engine import get_engine


engine = get_engine()


async def handle_message(user_id: str, room_id: str, message: str):
    mood = await engine.query(user_id, room_id, message)
    return {
        "message": message,
        "mood": mood,
    }
```

서버 종료 시에는 캐시된 감정 데이터를 저장하기 위해 `close()`를 호출하는 것이 좋습니다.

```python
await engine.close()
```

## 블랙박스 사용 규칙

서버파트에서는 다음 파일이나 내부 객체에 직접 접근하지 않는 것을 권장합니다.

- `markov.py`
- `store.py`
- `prompt_manager.py`
- `marcov_storage.db`

서버파트는 `get_engine()`으로 엔진을 얻고, `query()`만 호출하면 됩니다.

권장 사용:

```python
from mood_engine import get_engine

engine = get_engine()
mood = await engine.query(user_id, room_id, message)
```

비권장 사용:

```python
from mood_engine.store import DatabaseManager
from mood_engine.markov import UserMarcov
```

## 저장 데이터

모듈은 내부적으로 `marcov_storage.db` 파일을 사용해 감정 흐름 데이터를 저장합니다.

이 파일은 실행 중 자동으로 생성될 수 있으며, git에 커밋하지 않습니다. 서버 환경에서는 실행 디렉터리에 쓰기 권한이 있어야 합니다.

## 동작 방식 요약

내부 동작은 서버파트가 몰라도 되지만, 큰 흐름은 다음과 같습니다.

1. 초기 또는 예측이 불확실한 경우 LLM으로 감정을 분석합니다.
2. 분석 결과를 사용자별, 전체 사용자 기준 Markov 데이터에 누적합니다.
3. 데이터가 충분하면 Markov 예측을 사용해 API 호출을 줄입니다.
4. 최종 mood를 반환합니다.

## 로컬 확인

패키지 import 확인:

```powershell
python -c "import mood_engine; print(mood_engine.Engine.__name__)"
```

오프라인 테스트 파일을 전달받은 경우:

```powershell
python -m unittest discover -s tests -v
```

오프라인 테스트는 실제 DeepSeek API와 운영 DB를 사용하지 않고 fake LLM과 임시 DB로 동작을 확인합니다.

## 주의사항

- `.env`는 git에 올리지 않습니다.
- `.env.example`에는 실제 API 키를 넣지 않습니다.
- 서버 코드는 `query()`의 반환값이 `None`일 수 있음을 처리해야 합니다.
- 서버 종료 시 `await engine.close()`를 호출하면 캐시된 데이터 유실을 줄일 수 있습니다.
