import time
from concurrent import futures

import grpc
from cvxpy_dual import solve_priority_power_dual
from optimization_pb2 import (
    AllocationResponse,
    AllocationResult,
    DualOptimizationResponse,
    QoSPrediction,
    QoSPredictionResponse,
)
from optimization_pb2_grpc import (
    OptimizationServiceServicer,
    add_OptimizationServiceServicer_to_server,
)


class OptimizationServicer(OptimizationServiceServicer):
    def AllocateResources(self, request, context):
        # Convert proto messages to Python objects
        resources = []
        for r in request.resources:
            resources.append(
                {
                    "id": r.id,
                    "name": r.name,
                    "available_power": r.available_power,
                    "max_power": r.max_power,
                }
            )

        tasks = []
        for t in request.tasks:
            tasks.append(
                {
                    "id": t.id,
                    "name": t.name,
                    "priority": t.priority,
                    "required_power": t.required_power,
                    "qos_requirement": t.qos_requirement,
                }
            )

        # Perform allocation logic (same as REST API)
        allocations = []
        sorted_tasks = sorted(tasks, key=lambda x: x["priority"], reverse=True)

        for task in sorted_tasks:
            best_resource = None
            best_power = 0

            for resource in resources:
                if resource["available_power"] >= task["required_power"]:
                    if (
                        best_resource is None
                        or resource["available_power"]
                        < best_resource["available_power"]
                    ):
                        best_resource = resource
                        best_power = task["required_power"]

            if best_resource:
                allocations.append(
                    AllocationResult(
                        task_id=task["id"],
                        allocated_power=best_power,
                        resource_id=best_resource["id"],
                        satisfaction_level=1.0,
                    )
                )
                best_resource["available_power"] -= best_power
            else:
                allocations.append(
                    AllocationResult(
                        task_id=task["id"],
                        allocated_power=0,
                        resource_id="none",
                        satisfaction_level=0.0,
                    )
                )

        return AllocationResponse(allocations=allocations)

    def DualOptimization(self, request, context):
        cap = sum(r.available_power for r in request.resources)
        if cap <= 0:
            cap = sum(r.max_power for r in request.resources)
        try:
            result = solve_priority_power_dual(cap, list(request.tasks))
        except Exception as exc:  # pragma: no cover
            return DualOptimizationResponse(
                method="dual_optimization",
                iterations=0,
                convergence=0.0,
                optimization_type="CVXPY-based dual method",
                message=f"Solver error: {exc}",
            )

        return DualOptimizationResponse(
            method="dual_optimization",
            iterations=result["iterations"],
            convergence=result["convergence"],
            optimization_type="CVXPY-based dual method",
            message="Optimization complete using primal averaging and adaptive dual updates",
        )

    def PredictQoS(self, request, context):
        predictions = []
        for task in request.tasks:
            degradation = max(0, (task.qos_requirement - 0.8) * 100)
            status = "normal"
            if degradation > 30:
                status = "critical"
            elif degradation > 10:
                status = "warning"

            predictions.append(
                QoSPrediction(
                    task_id=task.id, predicted_degradation=degradation, status=status
                )
            )

        return QoSPredictionResponse(predictions=predictions)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_OptimizationServiceServicer_to_server(OptimizationServicer(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    print("gRPC server started on port 50051")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == "__main__":
    serve()
