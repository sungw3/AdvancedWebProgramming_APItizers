from .engine import Engine


_engine_instance = None


def get_engine() -> Engine:
    """Return the process-wide Mood Engine instance."""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = Engine()
    return _engine_instance
