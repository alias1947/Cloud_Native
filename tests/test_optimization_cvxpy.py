"""Unit tests for CVXPY dual relaxation (no live services required)."""

import sys
from pathlib import Path

opt_dir = Path(__file__).resolve().parent.parent / "services" / "optimization-service"
sys.path.insert(0, str(opt_dir))

from cvxpy_dual import solve_priority_power_dual  # noqa: E402


class _T:
    def __init__(self, priority: int, required_power: float):
        self.priority = priority
        self.required_power = required_power


def test_solve_priority_power_dual_empty():
    r = solve_priority_power_dual(100.0, [])
    assert r["solver_status"] == "optimal"
    assert r["iterations"] == 0


def test_solve_priority_power_dual_small_instance():
    tasks = [_T(2, 10.0), _T(1, 10.0)]
    r = solve_priority_power_dual(15.0, tasks)
    assert r["solver_status"] in ("optimal", "optimal_inaccurate")
    assert r["objective_value"] > 0
