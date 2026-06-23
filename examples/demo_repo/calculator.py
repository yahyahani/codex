"""Simple calculator with operation history."""


class Calculator:
    """Stateful calculator that records every operation it performs."""

    def __init__(self):
        self._history: list[str] = []

    def add(self, a: float, b: float) -> float:
        result = a + b
        self._history.append(f"{a} + {b} = {result}")
        return result

    def subtract(self, a: float, b: float) -> float:
        result = a - b
        self._history.append(f"{a} - {b} = {result}")
        return result

    def multiply(self, a: float, b: float) -> float:
        result = a * b
        self._history.append(f"{a} * {b} = {result}")
        return result

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ZeroDivisionError("Cannot divide by zero")
        result = a / b
        self._history.append(f"{a} / {b} = {result}")
        return result

    def history(self) -> list[str]:
        """Return a copy of all past operations."""
        return self._history.copy()

    def clear(self) -> None:
        """Reset operation history."""
        self._history.clear()
