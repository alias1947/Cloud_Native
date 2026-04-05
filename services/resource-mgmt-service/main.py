from enum import Enum
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Resource Management Service",
    description="Load balancing and auto-scaling for Cloud-Native Microservices Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoadBalancingStrategy(str, Enum):
    ROUND_ROBIN = "round_robin"
    LEAST_CONNECTIONS = "least_connections"
    IP_HASH = "ip_hash"
    RANDOM = "random"


class AutoScalingPolicy(BaseModel):
    min_replicas: int
    max_replicas: int
    cpu_threshold: float
    memory_threshold: float


class ResourceInstance(BaseModel):
    id: str
    name: str
    cpu_usage: float
    memory_usage: float
    active_connections: int
    status: str


class LoadBalancingRequest(BaseModel):
    strategy: LoadBalancingStrategy
    instances: List[ResourceInstance]
    request_id: str


class AutoScalingRequest(BaseModel):
    service_name: str
    policy: AutoScalingPolicy
    current_replicas: int


@app.post("/load-balance")
async def balance_load(request: LoadBalancingRequest):
    """
    Balance load across instances using specified strategy.
    Supports round-robin, least connections, IP hash, and random.
    """
    if not request.instances:
        raise HTTPException(status_code=400, detail="No instances available")

    selected_instance = None

    if request.strategy == LoadBalancingStrategy.ROUND_ROBIN:
        hash_val = hash(request.request_id) % len(request.instances)
        selected_instance = request.instances[hash_val]

    elif request.strategy == LoadBalancingStrategy.LEAST_CONNECTIONS:
        selected_instance = min(request.instances, key=lambda x: x.active_connections)

    elif request.strategy == LoadBalancingStrategy.IP_HASH:
        hash_val = hash(request.request_id) % len(request.instances)
        selected_instance = request.instances[hash_val]

    elif request.strategy == LoadBalancingStrategy.RANDOM:
        import random

        selected_instance = random.choice(request.instances)

    return {
        "selected_instance": selected_instance,
        "strategy_used": request.strategy,
        "load_balanced": True,
    }


@app.post("/auto-scale")
async def auto_scale(request: AutoScalingRequest):
    """
    Auto-scale service based on resource utilization and policy.
    Triggers scale-up or scale-down decisions.
    """
    avg_cpu = 65.0  # Simulated value
    avg_memory = 72.0  # Simulated value

    action = "none"
    new_replicas = request.current_replicas

    if avg_cpu > request.policy.cpu_threshold or avg_memory > request.policy.memory_threshold:
        if new_replicas < request.policy.max_replicas:
            new_replicas = min(new_replicas + 1, request.policy.max_replicas)
            action = "scale_up"

    elif avg_cpu < (request.policy.cpu_threshold * 0.5) and avg_memory < (
        request.policy.memory_threshold * 0.5
    ):
        if new_replicas > request.policy.min_replicas:
            new_replicas = max(new_replicas - 1, request.policy.min_replicas)
            action = "scale_down"

    return {
        "service": request.service_name,
        "action": action,
        "current_replicas": request.current_replicas,
        "new_replicas": new_replicas,
        "avg_cpu": avg_cpu,
        "avg_memory": avg_memory,
    }


@app.get("/resources/health")
async def get_resource_health(service: str = None):
    """Get health status of all resources or specific service"""
    resources = [
        ResourceInstance(
            id="res-001",
            name="api-gateway-1",
            cpu_usage=45.0,
            memory_usage=60.0,
            active_connections=120,
            status="healthy",
        ),
        ResourceInstance(
            id="res-002",
            name="api-gateway-2",
            cpu_usage=55.0,
            memory_usage=65.0,
            active_connections=145,
            status="healthy",
        ),
    ]

    return {"resources": resources, "total_healthy": len(resources)}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "resource-mgmt-service"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
