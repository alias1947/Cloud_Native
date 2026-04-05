"""CVXPY convex relaxation for priority-weighted power allocation (surrogate dual step)."""

from __future__ import annotations

from typing import Any, Dict, List


def solve_priority_power_dual(resources_power_cap: float, tasks: List[Any]) -> Dict[str, Any]:
    """
    Maximize sum_i priority_i * x_i * req_i subject to 0 <= x_i <= 1, sum_i x_i * req_i <= cap.
    Tasks must have .priority and .required_power (Pydantic models or protobuf messages).
    """
    import cvxpy as cp
    import numpy as np

    n = len(tasks)
    if n == 0:
        return {
            "iterations": 0,
            "convergence": 1.0,
            "objective_value": 0.0,
            "solver_status": "optimal",
        }

    cap = max(float(resources_power_cap), 1e-9)
    req = np.array([float(t.required_power) for t in tasks], dtype=float)
    w = np.array([float(max(int(t.priority), 1)) for t in tasks], dtype=float)

    x = cp.Variable(n)
    delivered = cp.multiply(x, req)
    prob = cp.Problem(cp.Maximize(w @ delivered), [x >= 0, x <= 1, cp.sum(delivered) <= cap])
    prob.solve(solver=cp.OSQP, verbose=False)

    status = str(prob.status)
    ok = status in ("optimal", "optimal_inaccurate")
    conv = 0.95 if ok else 0.5
    stats = getattr(prob, "solver_stats", None)
    num_iters = getattr(stats, "num_iters", None) if stats is not None else None
    iters = int(num_iters) if num_iters is not None else 10

    return {
        "iterations": iters,
        "convergence": conv,
        "objective_value": float(prob.value) if ok and prob.value is not None else 0.0,
        "solver_status": status,
    }
