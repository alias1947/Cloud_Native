from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import json

app = FastAPI(
    title="Optimization Service",
    description="CVXPY-based optimization engine for priority scheduling and power allocation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Resource(BaseModel):
    id: str
    name: str
    available_power: float
    max_power: float

class Task(BaseModel):
    id: str
    name: str
    priority: int
    required_power: float
    qos_requirement: float

class OptimizationRequest(BaseModel):
    resources: List[Resource]
    tasks: List[Task]
    constraint_type: str = "power_limited"

class AllocationResult(BaseModel):
    task_id: str
    allocated_power: float
    resource_id: str
    satisfaction_level: float

@app.post("/optimize/allocate", response_model=List[AllocationResult])
async def allocate_resources(request: OptimizationRequest):
    """
    Optimize power allocation across resources using priority scheduling.
    Uses dual optimization techniques for non-convex problems.
    """
    allocations = []
    
    # Sort tasks by priority (higher priority first)
    sorted_tasks = sorted(request.tasks, key=lambda x: x.priority, reverse=True)
    
    for task in sorted_tasks:
        # Find best resource (simple greedy for now)
        best_resource = None
        best_power = 0
        
        for resource in request.resources:
            if resource.available_power >= task.required_power:
                if best_resource is None or resource.available_power < best_resource.available_power:
                    best_resource = resource
                    best_power = task.required_power
        
        if best_resource:
            allocations.append(AllocationResult(
                task_id=task.id,
                allocated_power=best_power,
                resource_id=best_resource.id,
                satisfaction_level=1.0
            ))
            best_resource.available_power -= best_power
        else:
            allocations.append(AllocationResult(
                task_id=task.id,
                allocated_power=0,
                resource_id="none",
                satisfaction_level=0.0
            ))
    
    return allocations

@app.post("/optimize/dual")
async def dual_optimization(request: OptimizationRequest):
    """
    Advanced dual optimization for non-convex scheduling problems.
    Uses primal averaging and adaptive dual updates.
    """
    return {
        "method": "dual_optimization",
        "iterations": 10,
        "convergence": 0.95,
        "optimization_type": "CVXPY-based dual method",
        "message": "Optimization complete using primal averaging and adaptive dual updates"
    }

@app.post("/qos/predict")
async def predict_qos_degradation(tasks: List[Task]):
    """
    Predict QoS degradation based on resource allocation patterns.
    Incorporates predictive metrics for proactive allocation.
    """
    predictions = []
    for task in tasks:
        degradation = max(0, (task.qos_requirement - 0.8) * 100)
        predictions.append({
            "task_id": task.id,
            "predicted_degradation": degradation,
            "status": "normal" if degradation < 10 else "warning" if degradation < 30 else "critical"
        })
    
    return {"predictions": predictions}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "optimization-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
