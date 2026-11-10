"""AMIX Centralized Memory System - short-term, long-term, episodic."""

from typing import Any


class MemoryStore:
    """Manages short-term, long-term, and episodic memory."""

    def __init__(self) -> None:
        self._short: dict[str, Any] = {}
        self._long: dict[str, Any] = {}
        self._episodic: dict[str, Any] = {}

    def set_short(self, key: str, value: Any) -> None:
        """Conversation-scoped memory."""
        self._short[key] = value

    def get_short(self, key: str) -> Any:
        return self._short.get(key)

    def set_long(self, key: str, value: Any) -> None:
        """User preferences memory."""
        self._long[key] = value

    def get_long(self, key: str) -> Any:
        return self._long.get(key)

    def set_episodic(self, key: str, value: Any) -> None:
        """Past workflow outcome memory."""
        self._episodic[key] = value

    def get_episodic(self, key: str) -> Any:
        return self._episodic.get(key)
