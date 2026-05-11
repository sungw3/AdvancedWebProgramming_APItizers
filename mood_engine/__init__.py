from .engine import Engine

# 패키지 수준에서 싱글톤 인스턴스 관리
_engine_instance = None

def get_engine() -> Engine:
    """
    Mood Engine의 싱글톤 인스턴스를 반환합니다.
    최초 호출 시에만 인스턴스를 생성합니다.
    """
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = Engine()
    return _engine_instance

# 직접 변수로 접근할 수 있도록 노출 (선택 사항)
# engine = get_engine() 
