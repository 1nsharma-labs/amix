"""AMIX roadmap - five-phase plan toward Super Intelligence."""

from dataclasses import dataclass
from enum import Enum


class PhaseStatus(str, Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    COMPLETED = "completed"


@dataclass
class Phase:
    name: str
    duration: str
    goal: str
    status: PhaseStatus = PhaseStatus.PLANNED


PHASES: list[Phase] = [
    Phase("Phase 1", "0-3 months", "India-first AI platform"),
    Phase("Phase 2", "3-12 months", "AMIX models + Indian RAG"),
    Phase("Phase 3", "1-3 years", "Train own models"),
    Phase("Phase 4", "3-5 years", "Advanced reasoning research"),
    Phase("Phase 5", "5+ years", "Super Intelligence research"),
]


class Roadmap:
    def __init__(self) -> None:
        self.phases = list(PHASES)
        self._index = -1

    def status(self) -> dict:
        return {
            "phase_count": len(self.phases),
            "phases": [
                {
                    "name": p.name,
                    "duration": p.duration,
                    "goal": p.goal,
                    "status": p.status.value,
                }
                for p in self.phases
            ],
        }

    def advance(self) -> Phase:
        """Move the roadmap forward one phase at a time."""
        self._index = min(self._index + 1, len(self.phases) - 1)
        phase = self.phases[self._index]
        phase.status = PhaseStatus.ACTIVE
        return phase
